// VisionX Eval Extension Entry Point
import * as vscode from 'vscode';
import { AuthManager } from './auth/auth-manager';
import { SnapshotEngine } from './snapshot/snapshot-engine';
import { WorkspaceScanner } from './workspace/workspace-scanner';
import { APIClient } from './api/api-client';
import { StatusBarManager } from './ui/statusbar-manager';
import { SnapshotsViewProvider } from './ui/sidebar-provider';
import { VisionXWebviewProvider } from './ui/webview-provider';

let snapshotEngine: SnapshotEngine | undefined;
let statusBarManager: StatusBarManager | undefined;
let autoEvaluateTimer: NodeJS.Timeout | undefined;
let webviewProvider: VisionXWebviewProvider | undefined;
let snapshotsViewProvider: SnapshotsViewProvider | undefined;

export async function activate(context: vscode.ExtensionContext) {
  try {
    console.log('VisionX Eval: Starting activation...');

    const authManager = new AuthManager(context);
    const apiClient = new APIClient(authManager);
    const workspaceScanner = new WorkspaceScanner();
    
    console.log('VisionX Eval: Managers created');
    
    statusBarManager = new StatusBarManager();
    snapshotEngine = new SnapshotEngine(authManager, apiClient, workspaceScanner);

    console.log('VisionX Eval: StatusBar and SnapshotEngine initialized');

    // Register sidebar views FIRST
    try {
      // Register webview provider for dashboard
      webviewProvider = new VisionXWebviewProvider(
        context.extensionUri,
        authManager,
        apiClient
      );
      context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(
          VisionXWebviewProvider.viewType,
          webviewProvider
        )
      );

      // Register snapshots tree view
      snapshotsViewProvider = new SnapshotsViewProvider(authManager, apiClient);
      vscode.window.registerTreeDataProvider('visionx.snapshotsView', snapshotsViewProvider);

      console.log('VisionX: View providers registered successfully');
    } catch (viewError) {
      console.error('VisionX: Failed to register view providers:', viewError);
    }

    // Check if already authenticated
    const isAuthenticated = await authManager.isAuthenticated();
    statusBarManager.updateStatus(isAuthenticated ? 'authenticated' : 'disconnected');

    console.log('VisionX Eval: Auth status checked:', isAuthenticated);
    
    // Register refresh command BEFORE other commands
    vscode.commands.registerCommand('visionx.refreshView', () => {
      console.log('VisionX: Refresh command called');
      webviewProvider?.refresh();
      snapshotsViewProvider?.refresh();
    });
    
    // Register authenticate command
    vscode.commands.registerCommand('visionx.authenticate', async () => {
      try {
        const token = await vscode.window.showInputBox({
          prompt: 'Enter your team authentication token',
          password: true,
          placeHolder: 'Token from VisionX dashboard',
        });

        if (!token) {
          return;
        }

        const success = await authManager.authenticate(token);
        if (success) {
          statusBarManager?.updateStatus('authenticated');
          webviewProvider?.refresh();
          snapshotsViewProvider?.refresh();
          
          // Check if this is first-time authentication
          const isFirstTime = await authManager.isFirstTimeAuthentication();
          
          if (isFirstTime) {
            vscode.window.showInformationMessage('🎉 Successfully authenticated! Creating initial snapshot...');
            
            // Clear the first-time flag
            await authManager.clearFirstTimeFlag();
            
            // Perform initial capture automatically
            await vscode.commands.executeCommand('visionx.evaluateNow');
          } else {
            vscode.window.showInformationMessage('Successfully authenticated with VisionX!');
          }
          
          // Start auto-evaluation if enabled
          startAutoEvaluation();
        } else {
          vscode.window.showErrorMessage('Authentication failed. Please check your token.');
        }
      } catch (error) {
        vscode.window.showErrorMessage(`Authentication error: ${error}`);
      }
    });

    vscode.commands.registerCommand('visionx.evaluateNow', async () => {
      try {
        if (!await authManager.isAuthenticated()) {
          vscode.window.showWarningMessage('Please authenticate first using "VisionX: Authenticate Team"');
          return;
        }

        statusBarManager?.updateStatus('evaluating');
        vscode.window.showInformationMessage('Creating snapshot...');
        
        const result = await snapshotEngine?.createAndUploadSnapshot();
        
        if (result?.success) {
          statusBarManager?.updateStatus('authenticated');
          vscode.window.showInformationMessage(
            result.skipped 
              ? 'No changes detected since last snapshot' 
              : `Snapshot uploaded successfully! Size: ${result.compressedSize}`
          );
        } else {
          statusBarManager?.updateStatus('error');
          vscode.window.showErrorMessage(result?.message || 'Failed to create snapshot');
        }
      } catch (error) {
        statusBarManager?.updateStatus('error');
        vscode.window.showErrorMessage(`Evaluation error: ${error}`);
      }
    });

    vscode.commands.registerCommand('visionx.finalSubmission', async () => {
      try {
        if (!await authManager.isAuthenticated()) {
          vscode.window.showWarningMessage('Please authenticate first');
          return;
        }

        const confirm = await vscode.window.showWarningMessage(
          'This is your final submission. No further snapshots will be allowed. Continue?',
          { modal: true },
          'Yes, Submit Final'
        );

        if (confirm !== 'Yes, Submit Final') {
          return;
        }

        statusBarManager?.updateStatus('evaluating');
        const result = await snapshotEngine?.createAndUploadSnapshot(true);
        
        if (result?.success) {
          statusBarManager?.updateStatus('submitted');
          vscode.window.showInformationMessage('Final submission complete! Thank you.');
          
          // Stop auto-evaluation
          stopAutoEvaluation();
          
          // Lock further submissions
          await authManager.lockSubmissions();
        } else {
          vscode.window.showErrorMessage('Final submission failed: ' + result?.message);
        }
      } catch (error) {
        vscode.window.showErrorMessage(`Submission error: ${error}`);
      }
    });

    vscode.commands.registerCommand('visionx.viewStats', async () => {
      try {
        if (!await authManager.isAuthenticated()) {
          vscode.window.showWarningMessage('Please authenticate first');
          return;
        }

        const stats = await apiClient.getProjectStats();
        const panel = vscode.window.createWebviewPanel(
          'visionxStats',
          'VisionX Project Stats',
          vscode.ViewColumn.One,
          {}
        );

        panel.webview.html = generateStatsHTML(stats);
      } catch (error) {
        vscode.window.showErrorMessage(`Failed to load stats: ${error}`);
      }
    });

    vscode.commands.registerCommand('visionx.disconnect', async () => {
      stopAutoEvaluation();
      await authManager.logout();
      statusBarManager?.updateStatus('disconnected');
      webviewProvider?.refresh();
      snapshotsViewProvider?.refresh();
      vscode.window.showInformationMessage('Disconnected from VisionX');
    });

      // Start auto-evaluation if authenticated
    if (isAuthenticated) {
      startAutoEvaluation();
    }
  
    console.log('VisionX Eval extension activation complete');
  } catch (error) {
    console.error('VisionX Eval extension failed to activate:', error);
    vscode.window.showErrorMessage(`VisionX Eval failed to activate: ${error}`);
  }
}

function startAutoEvaluation() {
  const config = vscode.workspace.getConfiguration('visionx');
  const autoEvaluate = config.get<boolean>('autoEvaluate', true);
  
  if (!autoEvaluate) {
    return;
  }

  // Clear existing timer
  stopAutoEvaluation();

  // Set up 45-minute interval
  autoEvaluateTimer = setInterval(async () => {
    try {
      await vscode.commands.executeCommand('visionx.evaluateNow');
    } catch (error) {
      console.error('Auto-evaluation failed:', error);
    }
  }, 45 * 60 * 1000); // 45 minutes
}

function stopAutoEvaluation() {
  if (autoEvaluateTimer) {
    clearInterval(autoEvaluateTimer);
    autoEvaluateTimer = undefined;
  }
}

function generateStatsHTML(stats: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          padding: 20px;
          color: var(--vscode-foreground);
        }
        .stat-card {
          background: var(--vscode-editor-background);
          border: 1px solid var(--vscode-panel-border);
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 12px;
        }
        .stat-title { 
          font-size: 14px;
          color: var(--vscode-descriptionForeground);
          margin-bottom: 8px;
        }
        .stat-value { 
          font-size: 32px;
          font-weight: bold;
        }
        .rank-badge {
          display: inline-block;
          padding: 4px 12px;
          background: var(--vscode-button-background);
          color: var(--vscode-button-foreground);
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
        }
      </style>
    </head>
    <body>
      <h1>Project Statistics</h1>
      <div class="stat-card">
        <div class="stat-title">Current Rank</div>
        <div class="stat-value">
          <span class="rank-badge">#${stats.rank || 'N/A'}</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-title">Current Score</div>
        <div class="stat-value">${stats.score?.toFixed(1) || 'N/A'}</div>
      </div>
      <div class="stat-card">
        <div class="stat-title">Total Snapshots</div>
        <div class="stat-value">${stats.snapshotCount || 0}</div>
      </div>
      <div class="stat-card">
        <div class="stat-title">Last Evaluated</div>
        <div class="stat-value" style="font-size: 16px;">${stats.lastEvaluated ? new Date(stats.lastEvaluated).toLocaleString() : 'Never'}</div>
      </div>
    </body>
    </html>
  `;
}

export function deactivate() {
  stopAutoEvaluation();
  statusBarManager?.dispose();
}
