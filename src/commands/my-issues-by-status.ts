import { bind } from 'decko';
import * as vscode from 'vscode';
import { Command } from '../command';
import { CONFIG, getConfigurationByKey } from '../configuration';
import { SEARCH_MODE, selectIssue } from '../utils';

export class MyIssuesByStatusCommand implements Command {
  public id = 'jira-plugin.myIssuesByStatusCommand';

  @bind
  public async run(): Promise<void> {
    const issue = await selectIssue(SEARCH_MODE.STATUS);
    if (issue) {
      const url = `${getConfigurationByKey(CONFIG.BASE_URL)}/browse/${issue}`;
      await vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(url));
    }
  }
}
