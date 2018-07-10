import { bind } from 'decko';
import * as vscode from 'vscode';
import { getConfigurationByKey } from '../shared/configuration';
import { CONFIG, SEARCH_MODE } from '../shared/constants';
import { selectAssignee, selectIssue } from '../shared/select-utilities';
import state from '../state/state';
import { Command } from './shared/command';

export class IssueAddCommentCommand implements Command {
  public id = 'jira-plugin.issueAddCommentCommand';

  @bind
  public async run(): Promise<void> {
    const issue = await selectIssue(SEARCH_MODE.ID);
    if (issue) {
      let text = await vscode.window.showInputBox({
        ignoreFocusOut: true,
        placeHolder: 'Comment text...'
      });
      if (!!text) {
        const num = (text.match(new RegExp('[@]', 'g')) || []).length;
        for (let i = 0; i < num; i++) {
          const assignee = await selectAssignee(false, false);
          if (!!assignee) {
            text = text.replace('[@]', `[~${assignee}]`);
          } else {
            throw new Error('Abort command, wrong parameter.');
          }
        }
        const response = await state.jira.addNewComment(issue, { body: text });
        const action = await vscode.window.showInformationMessage('Created comment', 'Open in browser');
        if (action === 'Open in browser') {
          const baseUrl = getConfigurationByKey(CONFIG.BASE_URL) || '';
          const url = `${baseUrl}/browse/${issue}` + `?focusedCommentId=${response.id}` + `&page=com.atlassian.jira.plugin.system.issuetabpanels%3Acomment-tabpanel` + `#comment-${response.id}`;
          await vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(url));
        }
      }
    }
  }
}
