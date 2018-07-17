import { bind } from 'decko';
import * as vscode from 'vscode';
import { IWorkingIssue } from '../http/api.model';
import NoWorkingIssuePick from '../picks/no-working-issue-pick';
import { NO, NO_WORKING_ISSUE, YES, YES_WITH_COMMENT } from '../shared/constants';
import { selectChangeWorkingIssue, selectWorkingIssues } from '../shared/select-utilities';
import { secondsToHHMMSS } from '../shared/utilities';
import state, { changeStateWorkingIssue } from '../state/state';
import { Command } from './shared/command';

export class SetWorkingIssueCommand implements Command {
  public id = 'jira-plugin.setWorkingIssueCommand';

  private async menageResponse(response: string): Promise<void> {
    if (response === NO) {
      return;
    }
    let comment;
    if (response === YES_WITH_COMMENT) {
      comment = await vscode.window.showInputBox({
        ignoreFocusOut: true,
        placeHolder: 'Add worklog comment...'
      });
    }
    await vscode.commands.executeCommand('jira-plugin.issueAddWorklogCommand', state.workingIssue.issue.key, state.workingIssue.timePerSecond, comment || '');
  }

  @bind
  public async run(storedWorkingIssue: IWorkingIssue): Promise<void> {
    if (!!storedWorkingIssue) {
      const workingIssues = await selectWorkingIssues();
      const issue = workingIssues.find(issue => issue.key === storedWorkingIssue.issue.key);
      if (!!issue) {
        state.workingIssue = storedWorkingIssue;
        vscode.window.showInformationMessage(`REOPEN PENDING WORKING ISSUE: ${state.workingIssue.issue.key} | timeSpent: ${secondsToHHMMSS(state.workingIssue.timePerSecond)}`);
        changeStateWorkingIssue(state.workingIssue.issue, state.workingIssue.timePerSecond);
      } else {
        changeStateWorkingIssue(new NoWorkingIssuePick().pickValue, 0);
      }
    } else {
      const workingIssue = state.workingIssue || new NoWorkingIssuePick().pickValue;
      const newIssue = await selectChangeWorkingIssue();
      if (!!newIssue && newIssue.key !== workingIssue.issue.key) {
        if (workingIssue.issue.key !== NO_WORKING_ISSUE.key) {
          let action = await vscode.window.showInformationMessage(
            `NEW WORKING ISSUE: Add worklog for the previous working issue ${workingIssue.issue.key} | timeSpent: ${secondsToHHMMSS(workingIssue.timePerSecond)} ?`,
            YES_WITH_COMMENT,
            YES,
            NO
          );
          await this.menageResponse(action || NO);
        }
        changeStateWorkingIssue(newIssue, 0);
      }
    }
  }
}
