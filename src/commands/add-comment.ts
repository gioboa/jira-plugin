import { bind } from 'decko';
import * as vscode from 'vscode';

import { Issue, Transition } from '../api';
import { Command } from '../command';
import { getConfiguration } from '../configuration';
import { checkEnabled } from '../extension';
import state, { ActiveIssue, getActiveIssue } from '../state';

export class AddCommentCommand implements Command {

  public id = 'jira-plugin.addComment';

  private get baseUrl(): string {
    return getConfiguration().baseUrl;
  }

  @bind
  public async run(text?: string): Promise<void> {
    if (!checkEnabled()) {
      return;
    }
    const activeIssue = getActiveIssue();
    if (activeIssue) {
      if (!text) {
        text = await vscode.window.showInputBox({
          ignoreFocusOut: true,
          placeHolder: 'Comment text...'
        });
      }
      if (text) {
        const response = await state.jira.addComment(activeIssue.key, {body: text});
        const action = await vscode.window.showInformationMessage('Created comment', 'Open in browser');
        if (action === 'Open in browser') {
          const url = `${this.baseUrl}/browse/${activeIssue.key}`
            + `?focusedCommentId=${response.id}`
            + `&page=com.atlassian.jira.plugin.system.issuetabpanels%3Acomment-tabpanel`
            + `#comment-${response.id}`;
          await vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(url));
        }
      }
    } else {
      vscode.window.showInformationMessage(
        'No active issue. Please activate an issue before adding comments.');
    }
  }

}
