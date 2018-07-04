import { bind } from 'decko';
import * as vscode from 'vscode';
import { SEARCH_MODE, selectIssue } from '../shared/utilities';
import { Command } from './command';
import { getConfigurationByKey } from '../shared/configuration';
import { CONFIG } from '../shared/constants';

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
