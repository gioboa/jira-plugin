import * as vscode from 'vscode';
import { getConfigurationByKey } from '../shared/configuration';
import { CONFIG } from '../shared/constants';
import { Command } from './shared/command';

export class OpenGitHubRepoCommand implements Command {
  public id = 'jira-plugin.openGitHubRepoCommand';

  public async run(issueId: string): Promise<void> {
    const url = `https://github.com/gioboa/jira-plugin`;
    vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(url));
  }
}
