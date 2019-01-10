import * as vscode from 'vscode';
import { IssueItem } from '../explorer/item/issue-item';
import { getConfigurationByKey } from '../shared/configuration';
import { CONFIG } from '../shared/constants';
import { printErrorMessageInOutputAndShowAlert } from '../shared/log-utilities';
import { selectAssignee } from '../shared/select-utilities';
import state, { canExecuteJiraAPI } from '../state/state';

export default async function issueAddCommentCommand(issueItem: IssueItem): Promise<void> {
  try {
    if (issueItem && issueItem.issue && canExecuteJiraAPI()) {
      let issue = issueItem.issue;
      let text = await vscode.window.showInputBox({
        ignoreFocusOut: true,
        placeHolder: 'Comment text...'
      });
      if (!!text) {
        // ask for assignee if there is one or more [@] in the comment
        const num = (text.match(new RegExp('[@]', 'g')) || []).length;
        for (let i = 0; i < num; i++) {
          const assignee = await selectAssignee(false, false, true, undefined);
          if (!!assignee) {
            text = text.replace('[@]', `[~${assignee}]`);
          } else {
            printErrorMessageInOutputAndShowAlert('Abort command, wrong parameter.');
            return;
          }
        }
        // call Jira API
        const response = await state.jira.addNewComment({ issueKey: issue.key, comment: { body: text } });
        await vscode.commands.executeCommand('jira-plugin.refresh');
        // modal
        const action = await vscode.window.showInformationMessage('Comment created', 'Open in browser');
        if (action === 'Open in browser') {
          const baseUrl = getConfigurationByKey(CONFIG.BASE_URL) || '';
          const url =
            `${baseUrl}/browse/${issue.key}` +
            `?focusedCommentId=${response.id}` +
            `&page=com.atlassian.jira.plugin.system.issuetabpanels%3Acomment-tabpanel` +
            `#comment-${response.id}`;
          await vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(url));
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
