import ConfigurationService from '../../src/services/configuration.service';
import { CONFIG } from '../../src/shared/constants';
import { ISettings } from './settings.model';

export const backupSettings = async (configurationService: ConfigurationService, settings: ISettings) => {
  settings.baseUrl = await configurationService.get(CONFIG.BASE_URL);
  settings.username = await configurationService.get(CONFIG.USERNAME);
  settings.workingProject = await configurationService.get(CONFIG.WORKING_PROJECT);
  settings.enableWorkingIssue = await configurationService.get(CONFIG.ENABLE_WORKING_ISSUE);
  settings.workingIssueStatues = await configurationService.get(CONFIG.WORKING_ISSUE_STATUSES);
  settings.password = await configurationService.credentials.password;
  settings.counter = await configurationService.getGlobalCounter();
  settings.workingIssue = await configurationService.getGlobalWorkingIssue();
};

export const restoreSettings = async (configurationService: ConfigurationService, settings: ISettings) => {
  await configurationService.set(CONFIG.BASE_URL, settings.baseUrl);
  await configurationService.set(CONFIG.USERNAME, settings.username);
  await configurationService.set(CONFIG.WORKING_PROJECT, settings.workingProject);
  await configurationService.set(CONFIG.ENABLE_WORKING_ISSUE, settings.enableWorkingIssue);
  await configurationService.set(CONFIG.WORKING_ISSUE_STATUSES, settings.workingIssueStatues);
  await configurationService.setPassword(settings.password);
  await configurationService.setGlobalCounter(settings.counter);
  await configurationService.setGlobalWorkingIssue(settings.workingIssue);
};
