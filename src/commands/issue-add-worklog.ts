import { NO_WORKING_ISSUE } from '../shared/constants';
import state, { canExecuteJiraAPI, printErrorMessageInOutputAndShowAlert } from '../state/state';
import { Command } from './shared/command';

export class IssueAddWorklogCommand implements Command {
  public id = 'jira-plugin.issueAddWorklogCommand';

  public async run(issueKey: string, timeSpentSeconds: number, comment: string): Promise<void> {
    try {
      if (issueKey !== NO_WORKING_ISSUE.key) {
        if (canExecuteJiraAPI()) {
          // call Jira API
          const response = await state.jira.addWorkLog({ issueKey: issueKey, worklog: { timeSpentSeconds: Math.ceil(timeSpentSeconds / 60) * 60, comment } });
        }
      }
    } catch (err) {
      printErrorMessageInOutputAndShowAlert(err);
    }
  }

  dispose(): void {}
}
