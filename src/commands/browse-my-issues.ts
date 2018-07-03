import { bind } from 'decko';
import * as vscode from 'vscode';

import { Issue } from '../api';
import { Command } from '../command';
import { getConfiguration } from '../configuration';

export class BrowseMyIssuesCommand implements Command {

  public id = 'jira-plugin.browseMyIssues';

  private get baseUrl(): string | undefined {
    return getConfiguration().baseUrl;
  }


  @bind
  public async run(): Promise<void> {
    const issue = await vscode.commands.executeCommand<Issue | undefined>('jira-plugin.listMyIssues');
    if (issue) {
      const url = `${this.baseUrl}/browse/${issue.key}`;
      await vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(url));
    }
  }

}
