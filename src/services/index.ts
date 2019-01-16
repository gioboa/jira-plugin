import { JiraExplorer } from '../explorer/jira-explorer';
import { ConfigurationService } from './configuration.service';
import { GitIntegrationService } from './git-integration.service';
import { LoggerService } from './logger.service';
import SelectValuesService from './select-values.service';
import { StatusBarService } from './status-bar.service';
import { UtilitiesService } from './utilities.service';

export interface IServices {
  configuration: ConfigurationService;
  jiraExplorer: JiraExplorer;
  logger: LoggerService;
  utilities: UtilitiesService;
  selectValues: SelectValuesService;
  statusBarManager: StatusBarService;
  gitIntegration: GitIntegrationService;
}

const services: IServices = {
  configuration: new ConfigurationService(),
  jiraExplorer: new JiraExplorer(),
  logger: new LoggerService(),
  utilities: new UtilitiesService(),
  selectValues: new SelectValuesService(),
  gitIntegration: undefined as any,
  statusBarManager: undefined as any
};

export default services;
