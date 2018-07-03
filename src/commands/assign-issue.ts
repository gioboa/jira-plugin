import { bind } from 'decko';
import { Command } from '../command';
import state from '../state';
import { selectAssignee, selectIssue } from '../utils';

export class ChangeIssueAssigneeCommand implements Command {
  public id = 'jira-plugin.changeIssueAssignee';

  @bind
  public async run(): Promise<void> {
    const issueKey = await selectIssue();
    if (issueKey) {
      const assignee = await selectAssignee();
      const res = await state.jira.assignIssue(issueKey, {
        name: assignee
      });
    }
  }
}
