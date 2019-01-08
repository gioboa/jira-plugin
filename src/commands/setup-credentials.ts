import * as vscode from 'vscode';
import { getConfigurationByKey, setConfigurationByKey, setGlobalStateConfiguration } from '../shared/configuration';
import { CONFIG } from '../shared/constants';
import { connectToJira } from '../state/state';
import { Command } from './shared/command';

export class SetupCredentialsCommand implements Command {
  public id = 'jira-plugin.setupCredentialsCommand';

  public async run(): Promise<void> {
    const baseUrl = getConfigurationByKey(CONFIG.BASE_URL);
    if (baseUrl) {
      // ask for reset prev configuration
      const res = await vscode.window.showQuickPick(['Yes', 'No'], { placeHolder: 'Config already exist. Reset config?' });
      if (res === 'No') {
        return;
      }
    }
    // store settings
    setConfigurationByKey(
      CONFIG.BASE_URL,
      await vscode.window.showInputBox({ ignoreFocusOut: true, password: false, placeHolder: 'Your Jira url' })
    );
    setConfigurationByKey(
      CONFIG.USERNAME,
      await vscode.window.showInputBox({ ignoreFocusOut: true, password: false, placeHolder: 'Your Jira username' })
    );
    setGlobalStateConfiguration(
      await vscode.window.showInputBox({ ignoreFocusOut: true, password: true, placeHolder: 'Your Jira password' })
    );
    await connectToJira();
  }
}
