import { bind } from 'decko';
import * as vscode from 'vscode';
import NoWorkingIssuePick from '../picks/no-working-issue-pick';
import { NO, NO_WORKING_ISSUE, YES } from '../shared/constants';
import { selectChangeWorkingIssue } from '../shared/select-utilities';
import state, { changeWorkingIssue } from '../state/state';
import { Command } from './shared/command';

export class SetWorkingIssueCommand implements Command {
  public id = 'jira-plugin.setWorkingIssueCommand';

  @bind
  public async run(): Promise<void> {
    const newIssue = await selectChangeWorkingIssue();
    const activeIssue = state.workingIssue || new NoWorkingIssuePick().pickValue;
    if (!!newIssue && activeIssue.key !== newIssue.key) {
      let action;
      if (newIssue.key !== NO_WORKING_ISSUE.key) {
        action = await vscode.window.showInformationMessage(`NEW WORKING ISSUE: ${newIssue.key} - ${newIssue.fields.summary}?`, YES, NO);
      } else {
        action = await vscode.window.showInformationMessage(`REMOVE WORKING ISSUE: ${activeIssue.key} - ${activeIssue.fields.summary}?`, YES, NO);
      }
      if (action === YES) {
        changeWorkingIssue(newIssue);
      }
    }
  }
}
