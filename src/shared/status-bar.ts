import * as vscode from 'vscode';
import state from '../state/state';
import { getConfigurationByKey } from './configuration';
import { CONFIG, NO_WORKING_ISSUE } from './constants';

export class StatusBarManager {
  private workingProjectItem: vscode.StatusBarItem;
  private workingIssueItem: vscode.StatusBarItem;

  constructor() {
    this.workingIssueItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    this.workingProjectItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 200);
  }

  public async updateWorkingProjectItem(project: string): Promise<void> {
    if (!state.jira) {
      return;
    }
    if (!project) {
      project = (await getConfigurationByKey(CONFIG.WORKING_PROJECT)) || '';
    }
    this.workingProjectItem.tooltip = 'Set working project';
    this.workingProjectItem.command = 'jira-plugin.setWorkingProjectCommand';
    this.workingProjectItem.text = `$(clippy) ` + (!!project ? `Project: ${project}` : `Project: NONE`);
    this.workingProjectItem.show();
    this.updateWorkingIssueItem();
  }

  public async updateWorkingIssueItem(): Promise<void> {
    this.workingIssueItem.text = `$(watch) ` + (state.workingIssue.key !== NO_WORKING_ISSUE.key ? `Working Issue: - ${state.workingIssue.key || ''}` : NO_WORKING_ISSUE.text);
    this.workingIssueItem.tooltip = 'Set working issue';
    this.workingIssueItem.command = 'jira-plugin.setWorkingIssueCommand';
    this.workingIssueItem.show();
  }

  public dispose(): void {
    this.workingIssueItem.dispose();
    this.workingProjectItem.dispose();
  }
}
