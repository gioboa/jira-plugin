import * as assert from 'node:assert';
import { describe, it } from 'vitest';
import UtilitiesService from '../../src/services/utilities.service';

describe(`Utilities`, () => {
  const utilities = new UtilitiesService();

  it('SecondsToHHMMSS', async () => {
    const result = utilities.secondsToHHMMSS(60);
    assert.strictEqual(result, '00:01:00');
  });

  it('SecondsToMinutes', async () => {
    const result = utilities.floorSecondsToMinutes(45);
    assert.strictEqual(result, 0);
  });

  it('FloorSecondsToMinutes', async () => {
    const result = utilities.floorSecondsToMinutes(61);
    assert.strictEqual(result, 1);
  });

  it('AddStatusIcon with valid status', async () => {
    const result = utilities.addStatusIcon('Open', true);
    assert.strictEqual(result, '$(beaker)  Open ');
  });

  it('AddStatusIcon with valid status, no description', async () => {
    const result = utilities.addStatusIcon('Open', false);
    assert.strictEqual(result, '$(beaker)');
  });

  it('AddStatusIcon with NOT valid status', async () => {
    const result = utilities.addStatusIcon('ABC', true);
    assert.strictEqual(result, '$(info)  ABC ');
  });
});
