import { NO_WORKING_ISSUE } from '../shared/constants';
import { printErrorMessageInOutputAndShowAlert } from '../shared/log-utilities';
import state, { canExecuteJiraAPI } from '../state/state';

export default async function issueAddWorklogCommand(issueKey: string, timeSpentSeconds: number, comment: string): Promise<void> {
  try {
    if (issueKey !== NO_WORKING_ISSUE.key) {
      if (canExecuteJiraAPI()) {
        // call Jira API
        const response = await state.jira.addWorkLog({
          issueKey: issueKey,
          worklog: { timeSpentSeconds: Math.ceil(timeSpentSeconds / 60) * 60, comment }
        });
      }
    }
  } catch (err) {
    printErrorMessageInOutputAndShowAlert(err);
  }
}
