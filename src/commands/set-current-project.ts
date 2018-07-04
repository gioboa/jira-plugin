import { bind } from 'decko';
import { setConfigurationByKey } from '../shared/configuration';
import { CONFIG } from '../shared/constants';
import { selectProject } from '../shared/utilities';
import state from '../state/state';
import { Command } from './command';

export class SetCurrentProjectCommand implements Command {
  public id = 'jira-plugin.setCurrentProjectCommand';

  @bind
  public async run(): Promise<void> {
    const currentProject = await selectProject();
    setConfigurationByKey(CONFIG.CURRENT_PROJECT, currentProject);
    state.statusBar.updateStatusBar(currentProject);
  }
}
