import { bind } from 'decko';
import { IssueItem } from '../explorer/item/issue-item';
import { SEARCH_MODE } from '../shared/constants';
import { selectAssignee, selectIssue } from '../shared/select-utilities';
import state, { canExecuteJiraAPI } from '../state/state';
import { Command } from './shared/command';

export class ChangeIssueAssigneeCommand implements Command {
  public id = 'jira-plugin.changeIssueAssigneeCommand';

  @bind
  public async run(issueItem: IssueItem): Promise<void> {
    if (issueItem && issueItem.issue && canExecuteJiraAPI()) {
      let issue = issueItem.issue;
      let assignee = await selectAssignee(false, false);
      if (!!assignee) {
        const res = await state.jira.assignIssue(issue.key, {
          name: assignee
        });
        selectIssue(SEARCH_MODE.REFRESH);
      }
    } else {
      if (canExecuteJiraAPI()) {
        throw new Error('Use this command from JIRA: EXPLORER');
      }
    }
  }
}
