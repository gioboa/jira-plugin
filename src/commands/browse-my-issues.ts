import { bind } from 'decko';
import * as vscode from 'vscode';
import { Command } from '../command';
import { CONFIG, getConfigurationByKey } from '../configuration';
import { selectIssue } from '../utils';

export class BrowseMyIssuesCommand implements Command {
  public id = 'jira-plugin.browseMyIssues';

  @bind
  public async run(): Promise<void> {
    const issue = await selectIssue();
    if (issue) {
      const url = `${getConfigurationByKey(CONFIG.BASE_URL)}/browse/${issue}`;
      await vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(url));
    }
  }
}
