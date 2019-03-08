import * as vscode from 'vscode';
import { IssueItem } from '../explorer/item/issue-item';
import { configuration, logger, selectValues, store } from '../services';
import { CONFIG } from '../shared/constants';

export default async function issueAddCommentCommand(issueItem: IssueItem): Promise<void> {
  try {
    if (issueItem && issueItem.issue && store.canExecuteJiraAPI()) {
      let issue = issueItem.issue;
      let text = await vscode.window.showInputBox({
        ignoreFocusOut: true,
        placeHolder: 'Comment text...'
      });
      if (!!text) {
        // ask for assignee if there is one or more [@] in the comment
        const num = (text.match(new RegExp('[@]', 'g')) || []).length;
        for (let i = 0; i < num; i++) {
          const assignee = await selectValues.selectAssignee(false, false, true, undefined);
          if (!!assignee) {
            text = text.replace('[@]', `[~${assignee}]`);
          } else {
            logger.printErrorMessageInOutputAndShowAlert('Abort command, wrong parameter.');
            return;
          }
        }
        // call Jira API
        const response = await store.state.jira.addNewComment({ issueKey: issue.key, comment: { body: text } });
        await vscode.commands.executeCommand('jira-plugin.refresh');
        // modal
        const action = await vscode.window.showInformationMessage('Comment created', 'Open in browser');
        if (action === 'Open in browser') {
          const baseUrl = configuration.get(CONFIG.BASE_URL);
          const url =
            `${baseUrl}/browse/${issue.key}` +
            `?focusedCommentId=${response.id}` +
            `&page=com.atlassian.jira.plugin.system.issuetabpanels%3Acomment-tabpanel` +
            `#comment-${response.id}`;
          await vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(url));
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
