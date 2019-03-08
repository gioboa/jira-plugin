import * as vscode from 'vscode';
import { IssueItem } from '../explorer/item/issue-item';
import { logger, selectValues, store } from '../services';

export default async function changeIssueAssigneeCommand(issueItem: IssueItem): Promise<void> {
  try {
    if (issueItem && issueItem.issue && store.canExecuteJiraAPI()) {
      let issue = issueItem.issue;
      // verify if it's the current working issue
      if (!store.isWorkingIssue(issue.key)) {
        let assignee = await selectValues.selectAssignee(false, false, true, undefined);
        if (!!assignee) {
          // call Jira API
          const res = await store.state.jira.setAssignIssue({ issueKey: issue.key, assignee: <string>assignee });
          await vscode.commands.executeCommand('jira-plugin.refresh');
        }
      }
    } else {
      if (store.canExecuteJiraAPI()) {
        logger.printErrorMessageInOutputAndShowAlert('Use this command from Jira Plugin EXPLORER');
      }
    }
  } catch (err) {
    logger.printErrorMessageInOutputAndShowAlert(err);
  }
}
