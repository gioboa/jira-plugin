import * as vscode from 'vscode';

import state, { ActiveIssue, getActiveIssue } from './state';

export class StatusBarManager {

  private item: vscode.StatusBarItem;

  private interval: NodeJS.Timer;

  constructor() {
    this.item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    this.item.text = '$(issue-opened)';
    state.subscriber.push(() => {
      this.updateStatus();
    });
    this.interval = setInterval(() => {
      this.updateStatus();
    }, 1000 * 60 * 5);
  }

  private async updateStatus(): Promise<void> {
    if (!state.jira) {
      return;
    }
    this.item.show();
    const activeIssue = getActiveIssue();
    if (activeIssue) {
      const issue = await state.jira.getIssue(activeIssue.key);
      this.item.text = `$(issue-opened) ${activeIssue.key} ${issue.fields.status.name}`;
      this.item.tooltip = 'Click to transition issue...';
      this.item.command = 'vscode-jira.transitionIssues';
    } else {
      this.item.text = '$(issue-opened)';
      this.item.tooltip = 'Click to activate issue...';
      this.item.command = 'vscode-jira.activateIssues';
    }
  }

  public dispose(): void {
    this.item.dispose();
    clearInterval(this.interval);
  }
}
