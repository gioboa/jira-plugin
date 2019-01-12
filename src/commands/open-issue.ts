import * as vscode from 'vscode';
import { getConfigurationByKey } from '../shared/configuration';
import { CONFIG } from '../shared/constants';
const url = require('url');

export default async function openIssueCommand(issueId: string): Promise<void> {
  // open the issue in the browser
  const openUrl = url.resolve(getConfigurationByKey(CONFIG.BASE_URL), `/browse/${issueId}`);
  vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(openUrl));
}
