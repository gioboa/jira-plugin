import * as vscode from 'vscode';
import NoWorkingIssuePick from '../picks/no-working-issue-pick';
import { configuration, selectValues, statusBar, store, utilities } from '../services';
import { IIssue, IWorkingIssue } from '../services/http.model';
import { ACTIONS, CONFIG, NO_WORKING_ISSUE, TRACKING_TIME_MODE } from '../shared/constants';

export default async function setWorkingIssue(storedWorkingIssue: IWorkingIssue, preloadedIssue: IIssue): Promise<void> {
  // run it's called from status bar there is a working issue in the storage
  if (!!storedWorkingIssue) {
    const workingIssues = await selectValues.selectWorkingIssues();
    // the stored working issue is in the current working issues?
    const issue = workingIssues.find((issue: IIssue) => issue.key === storedWorkingIssue.issue.key);
    if (!!issue) {
      // YES - restart tracking time for the stored working issue
      store.state.workingIssue = storedWorkingIssue;
      vscode.window.showInformationMessage(
        `PENDING WORKING ISSUE: ${store.state.workingIssue.issue.key} | timeSpent: ${utilities.secondsToHHMMSS(
          store.state.workingIssue.trackingTime
        )}`
      );
      // set stored working issue
      store.changeStateWorkingIssue(store.state.workingIssue.issue, store.state.workingIssue.trackingTime);
    } else {
      // NO - set no working issue
      store.changeStateWorkingIssue(new NoWorkingIssuePick().pickValue, 0);
    }
  } else {
    // normal workflow, user must select a working issue
    const workingIssue = store.state.workingIssue || new NoWorkingIssuePick().pickValue;
    const newIssue = preloadedIssue || (await selectValues.selectChangeWorkingIssue());
    if (!!newIssue && newIssue.key !== workingIssue.issue.key) {
      if (
        workingIssue.issue.key !== NO_WORKING_ISSUE.key &&
        configuration.get(CONFIG.TRACKING_TIME_MODE) !== TRACKING_TIME_MODE.NEVER &&
        utilities.floorSecondsToMinutes(workingIssue.trackingTime) >= configuration.get(CONFIG.WORKLOG_MINIMUM_TRACKING_TIME)
      ) {
        // old working issue has trackingTime and it's equal or bigger then WORKLOG_MINIMUM_TRACKING_TIME setting
        statusBar.clearWorkingIssueInterval();
        // modal for create Worklog
        let action = await vscode.window.showInformationMessage(
          `Add worklog for the previous working issue ${workingIssue.issue.key} | timeSpent: ${utilities.secondsToHHMMSS(
            workingIssue.trackingTime
          )} ?`,
          ACTIONS.YES_WITH_COMMENT_AND_SEC_SPENT,
          ACTIONS.YES_WITH_COMMENT,
          ACTIONS.YES,
          ACTIONS.NO
        );
        // menage response
        let comment =
          action === ACTIONS.YES_WITH_COMMENT || action === ACTIONS.YES_WITH_COMMENT_AND_SEC_SPENT
            ? await vscode.window.showInputBox({
                ignoreFocusOut: true,
                placeHolder: 'Add worklog comment...',
              })
            : '';
        let secSpent =
          action === ACTIONS.YES_WITH_COMMENT_AND_SEC_SPENT
            ? await vscode.window.showInputBox({
                ignoreFocusOut: true,
                placeHolder: 'Overwrite seconds spent...',
                value: `${store.state.workingIssue.trackingTime}`,
              })
            : '';
        if (action === ACTIONS.YES || action === ACTIONS.YES_WITH_COMMENT || action === ACTIONS.YES_WITH_COMMENT_AND_SEC_SPENT) {
          await vscode.commands.executeCommand(
            'jira-plugin.issueAddWorklog',
            store.state.workingIssue.issue.key,
            !!secSpent ? parseInt(secSpent, 10) : store.state.workingIssue.trackingTime,
            comment || ''
          );
        }
      }
      // set the new working issue
      store.changeStateWorkingIssue(newIssue, 0);
    }
  }
}
