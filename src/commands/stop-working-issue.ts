import * as vscode from 'vscode';
import NoWorkingIssuePick from '../picks/no-working-issue-pick';
import { configuration, statusBar, store, utilities } from '../services';
import { IIssue, IWorkingIssue } from '../services/http.model';
import { CONFIG, NO_WORKING_ISSUE, TRACKING_TIME_MODE } from '../shared/constants';

export default async function stopWorkingIssue(storedWorkingIssue: IWorkingIssue, preloadedIssue: IIssue): Promise<void> {
  const workingIssue = store.state.workingIssue || new NoWorkingIssuePick().pickValue;
  if (!!workingIssue.issue.key && workingIssue.issue.key !== NO_WORKING_ISSUE.key) {
    if (
      workingIssue.issue.key !== NO_WORKING_ISSUE.key &&
      configuration.get(CONFIG.TRACKING_TIME_MODE) !== TRACKING_TIME_MODE.NEVER &&
      utilities.floorSecondsToMinutes(workingIssue.trackingTime) >= configuration.get(CONFIG.WORKLOG_MINIMUM_TRACKING_TIME)
    ) {
      // old working issue has trackingTime and it's equal or bigger then WORKLOG_MINIMUM_TRACKING_TIME setting
      statusBar.clearWorkingIssueInterval();
      // modal for create Worklog
      // To re-implement being asked if you want to store a comment, remove the following let, uncomment until the if (!!comment) and replace it with the if (action...)
      let comment = await vscode.window.showInputBox({
        ignoreFocusOut: true,
        placeHolder: 'Add worklog comment...',
      });
      // let action = await vscode.window.showInformationMessage(
      //   `Add worklog for the previous working issue ${workingIssue.issue.key} | timeSpent: ${utilities.secondsToHHMMSS(
      //     workingIssue.trackingTime
      //   )} ?`,
      //   ACTIONS.YES_WITH_COMMENT,
      //   ACTIONS.YES,
      //   ACTIONS.NO
      // );
      // menage response
      // let comment =
      //   action === ACTIONS.YES_WITH_COMMENT
      //     ? await vscode.window.showInputBox({
      //         ignoreFocusOut: true,
      //         placeHolder: 'Add worklog comment...'
      //       })
      //     : '';
      if (!!comment) {
        // if (action === ACTIONS.YES || action === ACTIONS.YES_WITH_COMMENT) {
        await vscode.commands.executeCommand(
          'jira-plugin.issueAddWorklog',
          store.state.workingIssue.issue.key,
          store.state.workingIssue.trackingTime,
          comment || ''
        );
      }
    }
    // set the new working issue
    // store.changeStateWorkingIssue(newIssue, 0);
    store.changeStateWorkingIssue(new NoWorkingIssuePick().pickValue, 0);
  } else {
    vscode.window.showInformationMessage('You are not currently working on a ticket');
  }
}
