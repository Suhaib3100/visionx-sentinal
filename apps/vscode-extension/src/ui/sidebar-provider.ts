// VisionX Eval Sidebar View Provider
import * as vscode from 'vscode';
import { AuthManager } from '../auth/auth-manager';
import { APIClient } from '../api/api-client';

export class ProjectViewProvider implements vscode.TreeDataProvider<TreeItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<TreeItem | undefined | null | void> = new vscode.EventEmitter<TreeItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<TreeItem | undefined | null | void> = this._onDidChangeTreeData.event;

  constructor(
    private authManager: AuthManager,
    private apiClient: APIClient
  ) {}

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: TreeItem): vscode.TreeItem {
    return element;
  }

  async getChildren(element?: TreeItem): Promise<TreeItem[]> {
    const isAuthenticated = await this.authManager.isAuthenticated();

    if (!isAuthenticated) {
      return [
        new TreeItem('Not Connected', '$(debug-disconnect)', vscode.TreeItemCollapsibleState.None, {
          command: 'visionx.authenticate',
          title: 'Authenticate',
          arguments: []
        })
      ];
    }

    if (!element) {
      // Root level
      return [
        new TreeItem('Status', '$(pass) Connected', vscode.TreeItemCollapsibleState.None),
        new TreeItem('Actions', '', vscode.TreeItemCollapsibleState.Expanded),
      ];
    }

    if (element.label === 'Actions') {
      return [
        new TreeItem('Evaluate Now', '$(rocket)', vscode.TreeItemCollapsibleState.None, {
          command: 'visionx.evaluateNow',
          title: 'Evaluate',
          arguments: []
        }),
        new TreeItem('View Stats', '$(graph)', vscode.TreeItemCollapsibleState.None, {
          command: 'visionx.viewStats',
          title: 'Stats',
          arguments: []
        }),
        new TreeItem('Final Submission', '$(check)', vscode.TreeItemCollapsibleState.None, {
          command: 'visionx.finalSubmission',
          title: 'Submit',
          arguments: []
        }),
        new TreeItem('Disconnect', '$(sign-out)', vscode.TreeItemCollapsibleState.None, {
          command: 'visionx.disconnect',
          title: 'Disconnect',
          arguments: []
        })
      ];
    }

    return [];
  }
}

export class SnapshotsViewProvider implements vscode.TreeDataProvider<TreeItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<TreeItem | undefined | null | void> = new vscode.EventEmitter<TreeItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<TreeItem | undefined | null | void> = this._onDidChangeTreeData.event;

  constructor(
    private authManager: AuthManager,
    private apiClient: APIClient
  ) {}

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: TreeItem): vscode.TreeItem {
    return element;
  }

  async getChildren(element?: TreeItem): Promise<TreeItem[]> {
    const isAuthenticated = await this.authManager.isAuthenticated();

    if (!isAuthenticated) {
      return [
        new TreeItem('Not authenticated', '$(warning)', vscode.TreeItemCollapsibleState.None)
      ];
    }

    if (!element) {
      // Try to fetch recent snapshots
      try {
        const projectId = await this.authManager.getProjectId();
        if (projectId) {
          // In a real implementation, fetch snapshots from API
          return [
            new TreeItem('Latest Snapshot', '$(file-code) 2 hours ago', vscode.TreeItemCollapsibleState.None),
            new TreeItem('No snapshots yet', '$(info)', vscode.TreeItemCollapsibleState.None)
          ];
        }
      } catch (error) {
        // Ignore errors
      }

      return [
        new TreeItem('No snapshots', '$(info)', vscode.TreeItemCollapsibleState.None)
      ];
    }

    return [];
  }
}

class TreeItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly description: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly command?: vscode.Command
  ) {
    super(label, collapsibleState);
    this.description = description;
    this.command = command;
  }
}
