import { bind } from 'decko';
import * as vscode from 'vscode';
import { Command } from '../command';
import { CONFIG, getConfigurationByKey } from '../configuration';
import { selectIssue, SEARCH_MODE } from '../utils';

export class IssueByIdCommand implements Command {
  public id = 'jira-plugin.issueByIdCommand';

  @bind
  public async run(): Promise<void> {
    const issue = await selectIssue(SEARCH_MODE.ID);
    if (issue) {
      const url = `${getConfigurationByKey(CONFIG.BASE_URL)}/browse/${issue}`;
      await vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(url));
    }
  }
}
