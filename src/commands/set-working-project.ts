import { bind } from 'decko';
import { setConfigurationByKey } from '../shared/configuration';
import { CONFIG } from '../shared/constants';
import state from '../state/state';
import { Command } from './shared/command';
import { selectProject } from '../shared/utilities';

export class SetWorkingProjectCommand implements Command {
  public id = 'jira-plugin.setWorkingProjectCommand';

  @bind
  public async run(): Promise<void> {
    const project = await selectProject();
    setConfigurationByKey(CONFIG.WORKING_PROJECT, project);
    state.statusBar.updateStatusBar(project);
  }
}
