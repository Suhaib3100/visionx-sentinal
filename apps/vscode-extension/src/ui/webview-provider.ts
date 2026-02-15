import * as vscode from 'vscode';
import { AuthManager } from '../auth/auth-manager';
import { APIClient } from '../api/api-client';

export class VisionXWebviewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'visionx-dashboard';
  private _view?: vscode.WebviewView;

  constructor(
    private readonly _extensionUri: vscode.Uri,
    private readonly authManager: AuthManager,
    private readonly apiClient: APIClient
  ) {}

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri]
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    // Handle messages from the webview
    webviewView.webview.onDidReceiveMessage(async (data) => {
      switch (data.type) {
        case 'authenticate':
          await this.handleAuthentication(data.token);
          break;
        case 'logout':
          await this.handleLogout();
          break;
        case 'evaluateNow':
          vscode.commands.executeCommand('visionx.evaluateNow');
          break;
        case 'getStatus':
          await this.updateStatus();
          break;
      }
    });

    // Update status on load
    this.updateStatus();
  }

  private async handleAuthentication(token: string) {
    try {
      const isValid = await this.authManager.authenticate(token);
      if (isValid) {
        vscode.window.showInformationMessage('✅ Authentication successful!');
        await this.updateStatus();
      } else {
        vscode.window.showErrorMessage('❌ Invalid token. Please try again.');
        this._view?.webview.postMessage({ type: 'authFailed' });
      }
    } catch (error) {
      vscode.window.showErrorMessage(`Authentication failed: ${error}`);
      this._view?.webview.postMessage({ type: 'authFailed' });
    }
  }

  private async handleLogout() {
    await this.authManager.logout();
    vscode.window.showInformationMessage('Logged out successfully');
    await this.updateStatus();
  }

  private async updateStatus() {
    const isAuthenticated = await this.authManager.isAuthenticated();
    const authState = this.authManager.getAuthState();

    this._view?.webview.postMessage({
      type: 'updateStatus',
      authenticated: isAuthenticated,
      teamName: authState?.teamId ? `Team-${authState.teamId.split('-').pop()}` : 'Not set',
      teamId: authState?.teamId || 'Not set',
      projectId: authState?.projectId || 'Not set'
    });
  }

  public refresh() {
    this.updateStatus();
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>VisionX Eval</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: var(--vscode-font-family);
          font-size: var(--vscode-font-size);
          color: var(--vscode-foreground);
          background-color: var(--vscode-sideBar-background);
          padding: 16px;
        }

        .container {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .header {
          display: flex;
          align-items: center;
          gap: 10px;
          padding-bottom: 12px;
          border-bottom: 1px solid var(--vscode-panel-border);
        }

        .logo {
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          color: white;
        }

        .title {
          font-size: 16px;
          font-weight: 600;
          color: var(--vscode-foreground);
        }

        .section {
          background: var(--vscode-editor-background);
          border: 1px solid var(--vscode-panel-border);
          border-radius: 6px;
          padding: 12px;
        }

        .section-title {
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 12px;
          color: var(--vscode-foreground);
          text-transform: uppercase;
          opacity: 0.8;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 500;
          margin-bottom: 12px;
        }

        .status-badge.connected {
          background: rgba(55, 178, 77, 0.15);
          color: #37b24d;
        }

        .status-badge.disconnected {
          background: rgba(250, 82, 82, 0.15);
          color: #fa5252;
        }

        .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: currentColor;
        }

        .info-grid {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .info-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .info-label {
          font-size: 11px;
          opacity: 0.6;
          text-transform: uppercase;
        }

        .info-value {
          font-size: 13px;
          font-family: var(--vscode-editor-font-family);
          color: var(--vscode-textLink-foreground);
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        label {
          font-size: 12px;
          font-weight: 500;
          opacity: 0.8;
        }

        input {
          background: var(--vscode-input-background);
          color: var(--vscode-input-foreground);
          border: 1px solid var(--vscode-input-border);
          border-radius: 4px;
          padding: 8px 10px;
          font-size: 13px;
          font-family: var(--vscode-font-family);
          outline: none;
        }

        input:focus {
          border-color: var(--vscode-focusBorder);
        }

        button {
          background: var(--vscode-button-background);
          color: var(--vscode-button-foreground);
          border: none;
          border-radius: 4px;
          padding: 10px 16px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s;
        }

        button:hover {
          background: var(--vscode-button-hoverBackground);
        }

        button:active {
          transform: translateY(1px);
        }

        button.secondary {
          background: var(--vscode-button-secondaryBackground);
          color: var(--vscode-button-secondaryForeground);
        }

        button.secondary:hover {
          background: var(--vscode-button-secondaryHoverBackground);
        }

        .actions {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .hidden {
          display: none;
        }

        .help-text {
          font-size: 11px;
          opacity: 0.6;
          margin-top: 8px;
          line-height: 1.4;
        }

        a {
          color: var(--vscode-textLink-foreground);
          text-decoration: none;
        }

        a:hover {
          text-decoration: underline;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">VX</div>
          <div class="title">VisionX Eval</div>
        </div>

        <!-- Authentication Section -->
        <div id="authSection" class="section">
          <div class="section-title">Authentication</div>
          <div class="input-group">
            <label for="tokenInput">Access Token</label>
            <input type="password" id="tokenInput" placeholder="Enter your team token..." />
            <button id="authenticateBtn">Connect</button>
          </div>
          <div class="help-text">
            Generate a token using: <code>POST /api/v1/auth/generate-custom-token</code> with <code>{ "teamName": "bytecrew" }</code>
          </div>
        </div>

        <!-- Team Info Section (hidden until authenticated) -->
        <div id="teamSection" class="section hidden">
          <div class="section-title">Team Status</div>
          <div class="status-badge connected hidden" id="connectedBadge">
            <span class="status-dot"></span>
            Connected
          </div>
          <div class="status-badge disconnected hidden" id="disconnectedBadge">
            <span class="status-dot"></span>
            Not Connected
          </div>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Team Name</div>
              <div class="info-value" id="teamName">-</div>
            </div>
            <div class="info-item">
              <div class="info-label">Team ID</div>
              <div class="info-value" id="teamId">-</div>
            </div>
            <div class="info-item">
              <div class="info-label">Project ID</div>
              <div class="info-value" id="projectId">-</div>
            </div>
          </div>
        </div>

        <!-- Actions Section (hidden until authenticated) -->
        <div id="actionsSection" class="section hidden">
          <div class="section-title">Actions</div>
          <div class="actions">
            <button id="evaluateBtn">📸 Capture & Evaluate</button>
            <button id="refreshBtn" class="secondary">🔄 Refresh Status</button>
            <button id="logoutBtn" class="secondary">🚪 Logout</button>
          </div>
        </div>
      </div>

      <script>
        const vscode = acquireVsCodeApi();

        const authSection = document.getElementById('authSection');
        const teamSection = document.getElementById('teamSection');
        const actionsSection = document.getElementById('actionsSection');
        const tokenInput = document.getElementById('tokenInput');
        const authenticateBtn = document.getElementById('authenticateBtn');
        const evaluateBtn = document.getElementById('evaluateBtn');
        const refreshBtn = document.getElementById('refreshBtn');
        const logoutBtn = document.getElementById('logoutBtn');
        const connectedBadge = document.getElementById('connectedBadge');
        const disconnectedBadge = document.getElementById('disconnectedBadge');

        authenticateBtn.addEventListener('click', () => {
          const token = tokenInput.value.trim();
          if (token) {
            vscode.postMessage({ type: 'authenticate', token });
          }
        });

        evaluateBtn.addEventListener('click', () => {
          vscode.postMessage({ type: 'evaluateNow' });
        });

        refreshBtn.addEventListener('click', () => {
          vscode.postMessage({ type: 'getStatus' });
        });

        logoutBtn.addEventListener('click', () => {
          vscode.postMessage({ type: 'logout' });
        });

        // Handle messages from the extension
        window.addEventListener('message', event => {
          const message = event.data;
          switch (message.type) {
            case 'updateStatus':
              updateUI(message);
              break;
            case 'authFailed':
              tokenInput.value = '';
              tokenInput.focus();
              break;
          }
        });

        function updateUI(data) {
          if (data.authenticated) {
            authSection.classList.add('hidden');
            teamSection.classList.remove('hidden');
            actionsSection.classList.remove('hidden');
            connectedBadge.classList.remove('hidden');
            disconnectedBadge.classList.add('hidden');

            document.getElementById('teamName').textContent = data.teamName;
            document.getElementById('teamId').textContent = data.teamId;
            document.getElementById('projectId').textContent = data.projectId;
          } else {
            authSection.classList.remove('hidden');
            teamSection.classList.add('hidden');
            actionsSection.classList.add('hidden');
          }
        }

        // Request initial status
        vscode.postMessage({ type: 'getStatus' });
      </script>
    </body>
    </html>`;
  }
}
