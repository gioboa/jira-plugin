import { bind } from 'decko';
import { Command } from '../command';
import { CONFIG, setConfigurationByKey } from '../configuration';
import { StatusBarManager } from '../status-bar';
import { selectProject } from '../utils';

export class ChangeCurrentProjectCommand implements Command {
  public id = 'jira-plugin.changeCurrentProject';

  constructor(private statusBar: StatusBarManager) {}

  @bind
  public async run(): Promise<void> {
    const currentProject = await selectProject();
    setConfigurationByKey(CONFIG.CURRENT_PROJECT, currentProject);
    this.statusBar.updateStatusBar(currentProject);
  }
}
