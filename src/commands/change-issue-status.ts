import { bind } from 'decko';
import * as vscode from 'vscode';
import { IssueItem } from '../explorer/item/issue-item';
import { selectTransition } from '../shared/select-utilities';
import state, { canExecuteJiraAPI, isWorkingIssue } from '../state/state';
import { Command } from './shared/command';

export class ChangeIssueStatusCommand implements Command {
  public id = 'jira-plugin.changeIssueStatusCommand';

  @bind
  public async run(issueItem: IssueItem): Promise<void> {
    if (issueItem && issueItem.issue && canExecuteJiraAPI()) {
      let issue = issueItem.issue;
      // verify if it's the current working issue
      if (!isWorkingIssue(issue.key)) {
        const newTransitionId = await selectTransition(issue.key);
        if (newTransitionId) {
          // call Jira API
          const result = await state.jira.setTransition({
            issueKey: issue.key,
            transition: {
              transition: {
                id: newTransitionId
              }
            }
          });
          await vscode.commands.executeCommand('jira-plugin.refresh');
        }
      }
    } else {
      if (canExecuteJiraAPI()) {
        throw new Error('Use this command from JIRA: EXPLORER');
      }
    }
  }
}
