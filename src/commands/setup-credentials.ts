import { bind } from 'decko';
import * as vscode from 'vscode';
import { Command } from '../command';
import { CONFIG, getConfigurationByKey, setConfigurationByKey, setGlobalStateConfiguration } from '../configuration';

export class SetupCredentialsCommand implements Command {
  public id = 'jira-plugin.setupCredentials';
  private context: vscode.ExtensionContext;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
  }

  @bind
  public async run(): Promise<void> {
    const baseUrl = getConfigurationByKey(CONFIG.BASE_URL);
    if (baseUrl) {
      const res = await vscode.window.showQuickPick(['Yes', 'No'], { placeHolder: 'Config already exist. Reset config?' });
      if (res === 'No') {
        return;
      }
    }
    setConfigurationByKey(CONFIG.BASE_URL, await vscode.window.showInputBox({ ignoreFocusOut: true, password: false, placeHolder: 'Your JIRA url' }));
    setConfigurationByKey(CONFIG.USERNAME, await vscode.window.showInputBox({ ignoreFocusOut: true, password: false, placeHolder: 'Your JIRA username' }));
    setGlobalStateConfiguration(this.context, await vscode.window.showInputBox({ ignoreFocusOut: true, password: true, placeHolder: 'Your JIRA password' }));
  }
}
