import * as vscode from 'vscode';
import { getConfigurationByKey } from '../shared/configuration';
import { CONFIG } from '../shared/constants';

export default async function openIssueCommand(issueId: string): Promise<void> {
  // open the issue in the browser
  const url = `${getConfigurationByKey(CONFIG.BASE_URL)}/browse/${issueId}`;
  vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(url));
}
