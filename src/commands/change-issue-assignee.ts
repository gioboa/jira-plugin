import { bind } from 'decko';
import * as vscode from 'vscode';
import { Command } from './command';
import state from '../state/state';
import { SEARCH_MODE, selectAssignee, selectIssue, UNASSIGNED } from '../shared/utilities';

export class ChangeIssueAssigneeCommand implements Command {
  public id = 'jira-plugin.changeIssueAssigneeCommand';

  @bind
  public async run(): Promise<void> {
    const issueKey = await selectIssue(SEARCH_MODE.ID);
    if (issueKey) {
      const assignee = await selectAssignee();
      if (assignee !== UNASSIGNED) {
        const res = await state.jira.assignIssue(issueKey, {
          name: assignee
        });
      } else {
        vscode.window.showInformationMessage(`It's no possible to assign the issue to the user Unassigned`);
      }
    }
  }
}
