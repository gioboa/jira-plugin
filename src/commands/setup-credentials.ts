import { bind } from 'decko';
import * as vscode from 'vscode';
import { getConfigurationByKey, setConfigurationByKey, setGlobalStateConfiguration } from '../shared/configuration';
import { CONFIG } from '../shared/constants';
import { executeConnectionToJira } from '../shared/utils';
import { Command } from './command';

export class SetupCredentialsCommand implements Command {
  public id = 'jira-plugin.setupCredentialsCommand';

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
    setGlobalStateConfiguration(await vscode.window.showInputBox({ ignoreFocusOut: true, password: true, placeHolder: 'Your JIRA password' }));
    executeConnectionToJira();
  }
}
