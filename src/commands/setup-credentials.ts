import { bind } from 'decko';
import * as vscode from 'vscode';

import { Command } from '../command';
import { connectToJira, CREDENTIALS_SEPARATOR } from '../extension';
import state from '../state';

export class SetupCredentialsCommand implements Command {

  public id = 'jira-plugin.setupCredentials';

  private context: vscode.ExtensionContext;

  private baseUrl: string | undefined;

  constructor(context: vscode.ExtensionContext, baseUrl: string | undefined) {
    this.context = context;
    this.baseUrl = baseUrl;
  }

  @bind
  public async run(): Promise<void> {
    if (!this.baseUrl) {
      vscode.window.showInformationMessage('No JIRA client configured. Setup baseUrl first');
      return;
    }
    const username = await vscode.window.showInputBox({
      ignoreFocusOut: true,
      placeHolder: 'Your JIRA username'
    });
    if (!username) {
      return;
    }
    const password = await vscode.window.showInputBox({
      ignoreFocusOut: true,
      password: true,
      placeHolder: 'Your JIRA password'
    });
    if (!password) {
      return;
    }
    await this.context.globalState.update(`vscode-jira:${this.baseUrl}`,
      `${username}${CREDENTIALS_SEPARATOR}${password}`);
    state.jira = (await connectToJira())!;
    state.update();
  }

}
