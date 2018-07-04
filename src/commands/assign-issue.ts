import { bind } from 'decko';
import { Command } from '../command';
import state from '../state';
import { selectAssignee, selectIssue, SEARCH_MODE } from '../utils';

export class ChangeIssueAssigneeCommand implements Command {
  public id = 'jira-plugin.changeIssueAssigneeCommand';

  @bind
  public async run(): Promise<void> {
    const issueKey = await selectIssue(SEARCH_MODE.ID);
    if (issueKey) {
      const assignee = await selectAssignee();
      const res = await state.jira.assignIssue(issueKey, {
        name: assignee
      });
    }
  }
}
