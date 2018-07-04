import { bind } from 'decko';
import { Command } from '../command';
import { CONFIG, setConfigurationByKey } from '../configuration';
import { StatusBarManager } from '../status-bar';
import { selectProject, selectStatus } from '../utils';
import state from '../state';

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
