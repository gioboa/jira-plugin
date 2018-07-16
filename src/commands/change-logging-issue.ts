import { bind } from 'decko';
import * as vscode from 'vscode';
import NoIssueLoggingPick from '../picks/no-log-issue-pick';
import { NO, NO_ISSUE_LOGGING, YES } from '../shared/constants';
import { selectChangeIssueLogging } from '../shared/select-utilities';
import state, { changeIssueLogging } from '../state/state';
import { Command } from './shared/command';

export class ChangeIssueLoggingCommand implements Command {
  public id = 'jira-plugin.changeIssueLoggingCommand';

  @bind
  public async run(): Promise<void> {
    const newIssue = await selectChangeIssueLogging();
    const activeIssue = state.issueLogging || new NoIssueLoggingPick().pickValue;
    if (!!newIssue && activeIssue.key !== newIssue.key) {
      let action;
      if (newIssue.key !== NO_ISSUE_LOGGING.key) {
        action = await vscode.window.showInformationMessage(`START LOG: ${newIssue.key} - ${newIssue.fields.summary}?`, YES, NO);
      } else {
        action = await vscode.window.showInformationMessage(`STOP LOG: ${activeIssue.key} - ${activeIssue.fields.summary}?`, YES, NO);
      }
      if (action === YES) {
        changeIssueLogging(newIssue);
      }
    }
  }
}
