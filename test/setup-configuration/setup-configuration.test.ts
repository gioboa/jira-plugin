import * as assert from 'assert';
import ConfigurationService from '../../src/services/configuration.service';
import { CONFIG } from '../../src/shared/constants';
import { configuration } from './configuration';

suite('configurationService', () => {
  const configurationService = new ConfigurationService();

  test(`Restore Settings Backup`, async () => {
    await configurationService.set(CONFIG.BASE_URL, configuration.baseUrl);
    await configurationService.set(CONFIG.USERNAME, configuration.username);
    await configurationService.set(CONFIG.WORKING_PROJECT, configuration.working_project);
    await configurationService.set(CONFIG.ENABLE_WORKING_ISSUE, configuration.enable_working_issue);
    await configurationService.set(CONFIG.WORKING_ISSUE_STATUSES, undefined);
    await configurationService.setPassword(configuration.password);
    await configurationService.setGlobalCounter(-1);
    await configurationService.setGlobalWorkingIssue(undefined);

    assert.equal(1, 1);
  });
});
