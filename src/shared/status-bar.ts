import * as vscode from 'vscode';
import state from '../state/state';
import { getConfigurationByKey } from './configuration';
import { CONFIG, NO_ISSUE_LOGGING } from './constants';

export class StatusBarManager {
  private workingProjectItem: vscode.StatusBarItem;
  private issueLoggingItem: vscode.StatusBarItem;

  constructor() {
    this.issueLoggingItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
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
    this.updateIssueLoggingItem();
  }

  public async updateIssueLoggingItem(): Promise<void> {
    this.issueLoggingItem.text = `$(watch) ` + (state.issueLogging.key !== NO_ISSUE_LOGGING.key ? `Logging Issue: - ${state.issueLogging.key || ''}` : NO_ISSUE_LOGGING.text);
    this.issueLoggingItem.tooltip = 'Change log issue';
    this.issueLoggingItem.command = 'jira-plugin.changeIssueLoggingCommand';
    this.issueLoggingItem.show();
  }

  public dispose(): void {
    this.issueLoggingItem.dispose();
    this.workingProjectItem.dispose();
  }
}
