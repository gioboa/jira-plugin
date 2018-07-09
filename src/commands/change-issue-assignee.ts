import { bind } from 'decko';
import { SEARCH_MODE, UNASSIGNED } from '../shared/constants';
import { selectAssignee, selectIssue } from '../shared/utilities';
import state from '../state/state';
import { Command } from './shared/command';

export class ChangeIssueAssigneeCommand implements Command {
  public id = 'jira-plugin.changeIssueAssigneeCommand';

  @bind
  public async run(): Promise<void> {
    const issueKey = await selectIssue(SEARCH_MODE.ID);
    if (issueKey) {
      const assignee = await selectAssignee(false);
      if (assignee !== UNASSIGNED) {
        const res = await state.jira.assignIssue(issueKey, {
          name: assignee
        });
      } else {
        throw new Error(`It's no possible to assign the issue to the user Unassigned`);
      }
    }
  }
}
