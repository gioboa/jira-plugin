import * as vscode from 'vscode';
import { IIssue, IWorkingIssue } from '../http/api.model';
import NoWorkingIssuePick from '../picks/no-working-issue-pick';
import { configuration, selectValues, statusBar, utilities } from '../services';
import { CONFIG, NO, NO_WORKING_ISSUE, YES, YES_WITH_COMMENT } from '../shared/constants';
import state, { changeStateWorkingIssue } from '../store/state';

export default async function setWorkingIssueCommand(storedWorkingIssue: IWorkingIssue, preloadedIssue: IIssue): Promise<void> {
  // run it's called from status bar there is a working issue in the storage
  if (!!storedWorkingIssue) {
    const workingIssues = await selectValues.selectWorkingIssues();
    // the stored working issue is in the current working issues?
    const issue = workingIssues.find((issue: IIssue) => issue.key === storedWorkingIssue.issue.key);
    if (!!issue) {
      // YES - restart tracking time for the stored working issue
      state.workingIssue = storedWorkingIssue;
      vscode.window.showInformationMessage(
        `PENDING WORKING ISSUE: ${state.workingIssue.issue.key} | timeSpent: ${utilities.secondsToHHMMSS(state.workingIssue.trackingTime)}`
      );
      // set stored working issue
      changeStateWorkingIssue(state.workingIssue.issue, state.workingIssue.trackingTime);
    } else {
      // NO - set no working issue
      changeStateWorkingIssue(new NoWorkingIssuePick().pickValue, 0);
    }
  } else {
    // normal workflow, user must select a working issue
    const workingIssue = state.workingIssue || new NoWorkingIssuePick().pickValue;
    const newIssue = preloadedIssue || (await selectValues.selectChangeWorkingIssue());
    if (!!newIssue && newIssue.key !== workingIssue.issue.key) {
      if (
        workingIssue.issue.key !== NO_WORKING_ISSUE.key &&
        utilities.floorSecondsToMinutes(workingIssue.trackingTime) >= configuration.get(CONFIG.WORKLOG_MINIMUM_TRACKING_TIME)
      ) {
        // old working issue has trackingTime and it's equal or bigger then WORKLOG_MINIMUM_TRACKING_TIME setting
        statusBar.clearWorkingIssueInterval();
        // modal for create Worklog
        let action = await vscode.window.showInformationMessage(
          `Add worklog for the previous working issue ${workingIssue.issue.key} | timeSpent: ${utilities.secondsToHHMMSS(
            workingIssue.trackingTime
          )} ?`,
          YES_WITH_COMMENT,
          YES,
          NO
        );
        // menage response
        let comment =
          action === YES_WITH_COMMENT
            ? await vscode.window.showInputBox({
                ignoreFocusOut: true,
                placeHolder: 'Add worklog comment...'
              })
            : '';
        if (action === YES || action === YES_WITH_COMMENT) {
          await vscode.commands.executeCommand(
            'jira-plugin.issueAddWorklogCommand',
            state.workingIssue.issue.key,
            state.workingIssue.trackingTime,
            comment || ''
          );
        }
      }
      // set the new working issue
      changeStateWorkingIssue(newIssue, 0);
    }
  }
}
