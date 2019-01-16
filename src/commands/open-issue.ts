import * as vscode from 'vscode';
import { CONFIG } from '../shared/constants';
import services from '../services';

export default async function openIssueCommand(issueId: string): Promise<void> {
  // open the issue in the browser
  const url = `${services.configuration.getConfigurationByKey(CONFIG.BASE_URL)}/browse/${issueId}`;
  vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(url));
}
