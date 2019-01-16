import JiraExplorer from '../explorer/jira-explorer';
import ConfigurationService from './configuration.service';
import GitIntegrationService from './git-integration.service';
import LoggerService from './logger.service';
import SelectValuesService from './select-values.service';
import StatusBarService from './status-bar.service';
import UtilitiesService from './utilities.service';

export const configuration = new ConfigurationService();
export const jiraExplorer = new JiraExplorer();
export const logger = new LoggerService();
export const utilities = new UtilitiesService();
export const selectValues = new SelectValuesService();
export const gitIntegration = new GitIntegrationService(configuration);
export const statusBar = new StatusBarService(configuration);
