import { bind } from 'decko';
import * as vscode from 'vscode';
import { setConfigurationByKey } from '../shared/configuration';
import { CONFIG } from '../shared/constants';
import { selectProject } from '../shared/select-utilities';
import state from '../state/state';
import { Command } from './shared/command';

export class SetWorkingProjectCommand implements Command {
  public id = 'jira-plugin.setWorkingProjectCommand';

  @bind
  public async run(): Promise<void> {
    const project = await selectProject();
    setConfigurationByKey(CONFIG.WORKING_PROJECT, project);
    state.statusBar.updateWorkingProjectItem(project);
    await vscode.commands.executeCommand('jira-plugin.allIssuesCommand');
  }
}
