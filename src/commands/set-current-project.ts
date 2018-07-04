import { bind } from 'decko';
import { setConfigurationByKey } from '../shared/configuration';
import { CONFIG } from '../shared/constants';
import { StatusBarManager } from '../shared/status-bar';
import { selectProject } from '../shared/utilities';
import { Command } from './command';

export class SetCurrentProjectCommand implements Command {
  public id = 'jira-plugin.setCurrentProjectCommand';

  constructor(private statusBar: StatusBarManager) {}

  @bind
  public async run(): Promise<void> {
    const currentProject = await selectProject();
    setConfigurationByKey(CONFIG.CURRENT_PROJECT, currentProject);
    this.statusBar.updateStatusBar(currentProject);
  }
}
