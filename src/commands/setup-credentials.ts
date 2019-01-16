import * as vscode from 'vscode';
import { CONFIG } from '../shared/constants';
import { connectToJira } from '../store/state';
import services from '../services';

export default async function setupCredentials(): Promise<void> {
  const baseUrl = services.configuration.getConfigurationByKey(CONFIG.BASE_URL);

  if (baseUrl) {
    // ask for reset prev configuration
    const res = await vscode.window.showQuickPick(['Yes', 'No'], { placeHolder: 'Config already exist. Reset config?' });
    if (res === 'No') {
      return;
    }
  }

  // store settings
  services.configuration.setConfigurationByKey(
    CONFIG.BASE_URL,
    await vscode.window.showInputBox({
      ignoreFocusOut: true,
      password: false,
      placeHolder: 'Your Jira url'
    })
  );

  services.configuration.setConfigurationByKey(
    CONFIG.USERNAME,
    await vscode.window.showInputBox({
      ignoreFocusOut: true,
      password: false,
      placeHolder: 'Your Jira username or full email for OAuth'
    })
  );

  services.configuration.setGlobalStateConfiguration(
    await vscode.window.showInputBox({
      ignoreFocusOut: true,
      password: true,
      placeHolder: 'Your Jira password or token for OAuth'
    })
  );

  await connectToJira();
}
