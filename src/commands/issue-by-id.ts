import { bind } from 'decko';
import * as vscode from 'vscode';
import { getConfigurationByKey } from '../shared/configuration';
import { CONFIG, SEARCH_MODE } from '../shared/constants';
import {  selectIssue } from '../shared/utilities';
import { Command } from './shared/command';

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
