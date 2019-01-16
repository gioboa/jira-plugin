import * as vscode from 'vscode';
import { IssueItem } from '../explorer/item/issue-item';
import state, { canExecuteJiraAPI, isWorkingIssue } from '../store/state';
import { selectValues, logger } from '../services';

export default async function changeIssueAssigneeCommand(issueItem: IssueItem): Promise<void> {
  try {
    if (issueItem && issueItem.issue && canExecuteJiraAPI()) {
      let issue = issueItem.issue;
      // verify if it's the current working issue
      if (!isWorkingIssue(issue.key)) {
        let assignee = await selectValues.selectAssignee(false, false, true, undefined);
        if (!!assignee) {
          // call Jira API
          const res = await state.jira.setAssignIssue({ issueKey: issue.key, assignee: <string>assignee });
          await vscode.commands.executeCommand('jira-plugin.refresh');
        }
      }
    } else {
      if (canExecuteJiraAPI()) {
        logger.printErrorMessageInOutputAndShowAlert('Use this command from Jira Plugin EXPLORER');
      }
    }
  } catch (err) {
    logger.printErrorMessageInOutputAndShowAlert(err);
  }
}
