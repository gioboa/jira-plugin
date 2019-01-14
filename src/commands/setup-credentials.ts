import * as vscode from 'vscode';
import { getConfigurationByKey, setConfigurationByKey, setGlobalStateConfiguration } from '../shared/configuration';
import { CONFIG } from '../shared/constants';
import { connectToJira } from '../state/state';

export default async function setupCredentials(): Promise<void> {
  const baseUrl = getConfigurationByKey(CONFIG.BASE_URL);

  if (baseUrl) {
    // ask for reset prev configuration
    const res = await vscode.window.showQuickPick(['Yes', 'No'], { placeHolder: 'Config already exist. Reset config?' });
    if (res === 'No') {
      return;
    }
  }

  // store settings
  let newBaseUrl = await vscode.window.showInputBox({
    ignoreFocusOut: true,
    password: false,
    placeHolder: 'Your Jira url'
  });
  // remove / at the end
  if (!!newBaseUrl && newBaseUrl.substring(newBaseUrl.length - 1) === '/') {
    newBaseUrl = newBaseUrl.substring(0, newBaseUrl.length - 1);
  }
  setConfigurationByKey(CONFIG.BASE_URL, newBaseUrl);

  setConfigurationByKey(
    CONFIG.USERNAME,
    await vscode.window.showInputBox({
      ignoreFocusOut: true,
      password: false,
      placeHolder: 'Your Jira username or full email for OAuth'
    })
  );

  setGlobalStateConfiguration(
    await vscode.window.showInputBox({
      ignoreFocusOut: true,
      password: true,
      placeHolder: 'Your Jira password or token for OAuth'
    })
  );

  await connectToJira();
}
