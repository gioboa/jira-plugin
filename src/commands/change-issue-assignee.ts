import * as vscode from 'vscode';
import { IssueItem } from '../explorer/item/issue-item';
import { selectAssignee } from '../shared/select-utilities';
import state, { canExecuteJiraAPI, isWorkingIssue} from '../state/state';
import { Command } from './shared/command';
import { printErrorMessageInOutputAndShowAlert } from '../shared/log-utilities';

export class ChangeIssueAssigneeCommand implements Command {
  public id = 'jira-plugin.changeIssueAssigneeCommand';

  public async run(issueItem: IssueItem): Promise<void> {
    try {
      if (issueItem && issueItem.issue && canExecuteJiraAPI()) {
        let issue = issueItem.issue;
        // verify if it's the current working issue
        if (!isWorkingIssue(issue.key)) {
          let assignee = await selectAssignee(false, false, true, undefined);
          if (!!assignee) {
            // call Jira API
            const res = await state.jira.setAssignIssue({ issueKey: issue.key, assignee: <string>assignee });
            await vscode.commands.executeCommand('jira-plugin.refresh');
          }
        }
      } else {
        if (canExecuteJiraAPI()) {
          printErrorMessageInOutputAndShowAlert('Use this command from Jira Plugin EXPLORER');
        }
      }
    } catch (err) {
      printErrorMessageInOutputAndShowAlert(err);
    }
  }
}
