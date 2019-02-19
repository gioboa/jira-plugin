import * as assert from 'assert';
import ConfigurationService from '../../src/services/configuration.service';
import { settings } from './settings';
import { restoreSettings } from './utils';

suite('Setup settings', () => {
  test(`Restore Settings Backup`, async () => {
    restoreSettings(new ConfigurationService(), settings);
    assert.strictEqual(1, 1);
  });
});
