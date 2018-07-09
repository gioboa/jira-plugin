import { bind } from 'decko';
import { UNASSIGNED } from '../shared/constants';
import { selectIssueAndAssignee } from '../shared/select-utilities';
import state from '../state/state';
import { Command } from './shared/command';

export class ChangeIssueAssigneeCommand implements Command {
  public id = 'jira-plugin.changeIssueAssigneeCommand';

  @bind
  public async run(): Promise<void> {
    const { issueKey, assignee } = await selectIssueAndAssignee();
    if (!!issueKey && !!assignee) {
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
