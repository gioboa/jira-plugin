import * as vscode from 'vscode';
import { IssueItem } from '../explorer/item/issue-item';
import state, { canExecuteJiraAPI, isWorkingIssue } from '../store/state';
import services from '../services';

export default async function changeIssueStatusCommand(issueItem: IssueItem): Promise<void> {
  try {
    if (issueItem && issueItem.issue && canExecuteJiraAPI()) {
      let issue = issueItem.issue;
      // verify if it's the current working issue
      if (!isWorkingIssue(issue.key)) {
        const newTransitionId = await services.selectValues.selectTransition(issue.key);
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
        services.logger.printErrorMessageInOutputAndShowAlert('Use this command from Jira Plugin EXPLORER');
      }
    }
  } catch (err) {
    services.logger.printErrorMessageInOutputAndShowAlert(err);
  }
}
