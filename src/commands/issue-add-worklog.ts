import { logger, store } from '../services';
import { NO_WORKING_ISSUE } from '../shared/constants';

export default async function issueAddWorklogCommand(issueKey: string, timeSpentSeconds: number, comment: string): Promise<void> {
  try {
    if (issueKey !== NO_WORKING_ISSUE.key) {
      if (store.canExecuteJiraAPI()) {
        // call Jira API
        const response = await store.state.jira.addWorkLog({
          issueKey: issueKey,
          worklog: { timeSpentSeconds: Math.ceil(timeSpentSeconds / 60) * 60, comment }
        });
      }
    }
  } catch (err) {
    logger.printErrorMessageInOutputAndShowAlert(err);
  }
}
