// Status Bar Manager - Shows VisionX status in VS Code status bar
import * as vscode from 'vscode';

export type StatusType = 'disconnected' | 'authenticated' | 'evaluating' | 'submitted' | 'error';

export class StatusBarManager {
  private statusBar: vscode.StatusBarItem;

  constructor() {
    this.statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    this.statusBar.command = 'visionx.viewStats';
    this.statusBar.show();
    this.updateStatus('disconnected');
  }

  updateStatus(status: StatusType): void {
    switch (status) {
      case 'disconnected':
        this.statusBar.text = '$(circle-slash) VisionX: Not Connected';
        this.statusBar.tooltip = 'Click to authenticate';
        this.statusBar.command = 'visionx.authenticate';
        this.statusBar.backgroundColor = undefined;
        break;

      case 'authenticated':
        this.statusBar.text = '$(check) VisionX: Connected';
        this.statusBar.tooltip = 'Click to view stats';
        this.statusBar.command = 'visionx.viewStats';
        this.statusBar.backgroundColor = undefined;
        break;

      case 'evaluating':
        this.statusBar.text = '$(sync~spin) VisionX: Evaluating...';
        this.statusBar.tooltip = 'Creating snapshot';
        this.statusBar.backgroundColor = undefined;
        break;

      case 'submitted':
        this.statusBar.text = '$(pass) VisionX: Final Submitted';
        this.statusBar.tooltip = 'Final submission complete';
        this.statusBar.backgroundColor = new vscode.ThemeColor('statusBarItem.prominentBackground');
        break;

      case 'error':
        this.statusBar.text = '$(error) VisionX: Error';
        this.statusBar.tooltip = 'Click to retry';
        this.statusBar.command = 'visionx.evaluateNow';
        this.statusBar.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
        break;
    }
  }

  dispose(): void {
    this.statusBar.dispose();
  }
}
