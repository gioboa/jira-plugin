import { bind } from 'decko';
import { Command } from '../command';
import { CONFIG, setConfigurationByKey } from '../configuration';
import { selectProject } from '../utils';

export class ChangeCurrentProjectCommand implements Command {
  public id = 'jira-plugin.changeCurrentProject';

  constructor() {}

  @bind
  public async run(): Promise<void> {
    setConfigurationByKey(CONFIG.CURRENT_PROJECT, await selectProject());
  }
}
