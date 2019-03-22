import * as vscode from 'vscode';
import { configuration } from '../services';
import { CONFIG } from '../shared/constants';

export default async function openIssue(issueId: string): Promise<void> {
  // open the issue in the browser
  const url = `${configuration.get(CONFIG.BASE_URL)}/browse/${issueId}`;
  vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(url));
}
