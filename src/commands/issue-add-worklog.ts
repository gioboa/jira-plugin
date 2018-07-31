import { bind } from 'decko';
import { NO_WORKING_ISSUE } from '../shared/constants';
import state, { canExecuteJiraAPI } from '../state/state';
import { Command } from './shared/command';

export class IssueAddWorklogCommand implements Command {
  public id = 'jira-plugin.issueAddWorklogCommand';

  @bind
  public async run(issueKey: string, timeSpentSeconds: number, comment: string): Promise<void> {
    if (issueKey !== NO_WORKING_ISSUE.key) {
      if (canExecuteJiraAPI()) {
        // call Jira API
        const response = await state.jira.addWorkLog(issueKey, { timeSpentSeconds: Math.ceil(timeSpentSeconds / 60) * 60, comment });
      }
    }
  }

  dispose(): void {}
}
