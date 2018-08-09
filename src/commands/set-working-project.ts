import * as vscode from 'vscode';
import { setConfigurationByKey } from '../shared/configuration';
import { CONFIG, LOADING } from '../shared/constants';
import { selectProject } from '../shared/select-utilities';
import state, { changeStateIssues } from '../state/state';
import { Command } from './shared/command';

export class SetWorkingProjectCommand implements Command {
  public id = 'jira-plugin.setWorkingProjectCommand';

  public async run(): Promise<void> {
    const project = await selectProject();
    setConfigurationByKey(CONFIG.WORKING_PROJECT, project);
    // update project item in the status bar
    state.statusBar.updateWorkingProjectItem(project);
    // loading in Jira explorer
    changeStateIssues(LOADING.text, '', []);
    // launch search for the new project
    setTimeout(() => vscode.commands.executeCommand('jira-plugin.allIssuesCommand'), 1000);
  }
}
