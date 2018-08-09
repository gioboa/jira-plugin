import * as vscode from 'vscode';
import { getConfigurationByKey } from '../shared/configuration';
import { CONFIG } from '../shared/constants';
import { Command } from './shared/command';

export class OpenIssueCommand implements Command {
  public id = 'jira-plugin.openIssueCommand';

  public async run(issueId: string): Promise<void> {
    // open the issue in the browser
    const url = `${getConfigurationByKey(CONFIG.BASE_URL)}/browse/${issueId}`;
    vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(url));
  }
}
