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
let apiClient: APIClient | undefined;

// Auto-capture tracking
let lineChangeCounter = 0;
const AUTO_CAPTURE_THRESHOLD = 125; // Trigger at 125 lines changed
let isAutoCapturing = false;

// Git event tracking
let gitExtension: any = undefined;
let gitAPI: any = undefined;

// Bulk capture polling
let bulkCaptureCheckTimer: NodeJS.Timeout | undefined;

// Heartbeat for session tracking
let heartbeatTimer: NodeJS.Timeout | undefined;

export async function activate(context: vscode.ExtensionContext) {
  try {
    console.log('VisionX Eval: Starting activation...');

    const authManager = new AuthManager(context);
    apiClient = new APIClient(authManager);
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
          startBulkCapturePolling();
          startHeartbeat();
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
        
        // Always force snapshot - user requested it
        const result = await snapshotEngine?.createAndUploadSnapshot(false, true);
        
        if (result?.success) {
          // Reset line change counter after successful manual capture
          lineChangeCounter = 0;
          
          statusBarManager?.updateStatus('authenticated');
          vscode.window.showInformationMessage(
            `Snapshot uploaded successfully! Size: ${result.compressedSize}`
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

        if (!apiClient) {
          vscode.window.showErrorMessage('API client not initialized');
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
      stopBulkCapturePolling();
      stopHeartbeat();
      await authManager.logout();
      statusBarManager?.updateStatus('disconnected');
      webviewProvider?.refresh();
      snapshotsViewProvider?.refresh();
      vscode.window.showInformationMessage('Disconnected from VisionX');
    });

      // Start auto-evaluation if authenticated
    if (isAuthenticated) {
      startAutoEvaluation();
      startBulkCapturePolling();
      startHeartbeat();
    }

    // Setup auto-capture based on line changes
    setupAutoCapture(context);
    
    // Setup git event listeners
    setupGitEventListeners(context);
  
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

function startBulkCapturePolling() {
  // Clear existing timer
  if (bulkCaptureCheckTimer) {
    clearInterval(bulkCaptureCheckTimer);
  }

  // Poll every 30 seconds to check if admin triggered bulk capture
  bulkCaptureCheckTimer = setInterval(async () => {
    try {
      if (!apiClient) {
        return;
      }

      const result = await apiClient.checkCaptureTrigger();

      if (result.shouldCapture && !isAutoCapturing) {
        console.log('VisionX: Bulk capture triggered by admin');
        
        isAutoCapturing = true;
        
        try {
          const action = await vscode.window.showInformationMessage(
            '📢 Admin requested snapshot capture for all teams!',
            'Capture Now',
            'Skip'
          );

          if (action === 'Skip') {
            isAutoCapturing = false;
            return;
          }

          statusBarManager?.updateStatus('evaluating');
          await vscode.commands.executeCommand('visionx.evaluateNow');
          
          vscode.window.showInformationMessage('Bulk capture completed successfully!');
        } catch (error) {
          console.error('VisionX: Bulk capture failed:', error);
          vscode.window.showErrorMessage(`Bulk capture failed: ${error}`);
        } finally {
          isAutoCapturing = false;
          statusBarManager?.updateStatus('authenticated');
        }
      }
    } catch (error) {
      // Silently fail - don't spam errors
      console.log('VisionX: Bulk capture check failed:', error);
    }
  }, 30000); // Check every 30 seconds
}

function stopBulkCapturePolling() {
  if (bulkCaptureCheckTimer) {
    clearInterval(bulkCaptureCheckTimer);
    bulkCaptureCheckTimer = undefined;
  }
}

function startHeartbeat() {
  // Clear existing timer
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
  }

  // Send initial heartbeat immediately
  if (apiClient) {
    apiClient.sendHeartbeat().catch((err: Error) => {
      console.log('VisionX: Initial heartbeat failed:', err);
    });
  }

  // Send heartbeat every 60 seconds to maintain session
  heartbeatTimer = setInterval(async () => {
    try {
      if (apiClient) {
        await apiClient.sendHeartbeat();
        console.log('VisionX: Heartbeat sent');
      }
    } catch (error) {
      console.log('VisionX: Heartbeat failed:', error);
    }
  }, 60000); // Every 60 seconds
}

function stopHeartbeat() {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = undefined;
  }
}

function setupAutoCapture(context: vscode.ExtensionContext) {
  // Track content changes across all text documents
  const changeListener = vscode.workspace.onDidChangeTextDocument(async (event) => {
    // Ignore changes in non-project files
    if (!event.document.uri.fsPath.includes(vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || '')) {
      return;
    }

    // Ignore certain file types
    const fileName = event.document.fileName;
    if (fileName.includes('node_modules') || 
        fileName.includes('.git') || 
        fileName.includes('dist') ||
        fileName.includes('build') ||
        fileName.endsWith('.log')) {
      return;
    }

    // Count line changes
    let linesChanged = 0;
    for (const change of event.contentChanges) {
      const addedLines = change.text.split('\n').length - 1;
      const removedLines = change.range.end.line - change.range.start.line;
      linesChanged += Math.abs(addedLines - removedLines) + Math.min(addedLines, removedLines);
    }

    lineChangeCounter += linesChanged;

    // Get threshold from configuration
    const config = vscode.workspace.getConfiguration('visionx');
    const threshold = config.get<number>('autoCaptureThreshold', AUTO_CAPTURE_THRESHOLD);

    // Trigger auto-capture when threshold is reached
    if (lineChangeCounter >= threshold && !isAutoCapturing) {
      isAutoCapturing = true;
      
      // Show notification
      const action = await vscode.window.showInformationMessage(
        `${lineChangeCounter} lines changed. Auto-capturing snapshot...`,
        'Capture Now',
        'Skip'
      );

      if (action === 'Skip') {
        lineChangeCounter = 0;
        isAutoCapturing = false;
        return;
      }

      try {
        if (statusBarManager) {
          statusBarManager.updateStatus('evaluating');
        }

        await vscode.commands.executeCommand('visionx.evaluateNow');
        
        // Reset counter after successful capture
        lineChangeCounter = 0;
        
        vscode.window.showInformationMessage('Auto-capture completed successfully!');
      } catch (error) {
        console.error('Auto-capture failed:', error);
        vscode.window.showErrorMessage(`Auto-capture failed: ${error}`);
        if (statusBarManager) {
          statusBarManager.updateStatus('error');
        }
      } finally {
        isAutoCapturing = false;
        if (statusBarManager) {
          statusBarManager.updateStatus('authenticated');
        }
      }
    }
  });

  context.subscriptions.push(changeListener);
}

async function setupGitEventListeners(context: vscode.ExtensionContext) {
  try {
    // Get VS Code's built-in Git extension
    gitExtension = vscode.extensions.getExtension('vscode.git');
    
    if (!gitExtension) {
      console.log('VisionX: Git extension not found');
      return;
    }

    if (!gitExtension.isActive) {
      await gitExtension.activate();
    }

    gitAPI = gitExtension.exports.getAPI(1);
    
    if (!gitAPI) {
      console.log('VisionX: Git API not available');
      return;
    }

    console.log('VisionX: Git extension connected successfully');

    // Get the repository for the current workspace
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
      return;
    }

    // Watch for repository changes
    gitAPI.onDidOpenRepository((repo: any) => {
      console.log('VisionX: Repository opened, setting up listeners');
      setupRepositoryListeners(repo);
    });

    // Setup listeners for existing repositories
    if (gitAPI.repositories && gitAPI.repositories.length > 0) {
      gitAPI.repositories.forEach((repo: any) => {
        setupRepositoryListeners(repo);
      });
    }
  } catch (error) {
    console.error('VisionX: Failed to setup git listeners:', error);
  }
}

function setupRepositoryListeners(repo: any) {
  try {
    // Listen to state changes (commits, pushes, etc.)
    const disposable = repo.state.onDidChange(async () => {
      const config = vscode.workspace.getConfiguration('visionx');
      const autoCaptureOnGit = config.get<boolean>('autoCaptureOnGit', true);
      
      if (!autoCaptureOnGit || isAutoCapturing) {
        return;
      }

      // Check if a commit just happened by comparing HEAD
      const headCommit = repo.state.HEAD?.commit;
      
      if (headCommit && headCommit !== (repo as any).lastKnownCommit) {
        (repo as any).lastKnownCommit = headCommit;
        
        console.log('VisionX: Git commit detected, triggering auto-capture');
        
        isAutoCapturing = true;
        
        try {
          // Show notification (no buttons - auto-capture)
          vscode.window.showInformationMessage(
            'Git commit detected. Auto-capturing snapshot...'
          );

          statusBarManager?.updateStatus('evaluating');
          await vscode.commands.executeCommand('visionx.evaluateNow');
          
          vscode.window.showInformationMessage('Post-commit snapshot captured successfully!');
        } catch (error) {
          console.error('VisionX: Auto-capture after commit failed:', error);
          vscode.window.showErrorMessage(`Auto-capture failed: ${error}`);
          statusBarManager?.updateStatus('error');
        } finally {
          isAutoCapturing = false;
          statusBarManager?.updateStatus('authenticated');
        }
      }
    });

    // Store disposable (optional: could add to context.subscriptions)
    console.log('VisionX: Repository listeners configured');
  } catch (error) {
    console.error('VisionX: Failed to setup repository listeners:', error);
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
  stopBulkCapturePolling();
  stopHeartbeat();
  statusBarManager?.dispose();
}
