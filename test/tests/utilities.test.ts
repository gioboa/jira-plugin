import * as assert from 'assert';
import UtilitiesService from '../../src/services/utilities.service';

suite(`Utilities`, () => {
  const utilities = new UtilitiesService();

  test('SecondsToHHMMSS', async () => {
    const result = utilities.secondsToHHMMSS(60);
    assert.equal(result, '00:01:00');
  });

  test('SecondsToMinutes', async () => {
    const result = utilities.floorSecondsToMinutes(45);
    assert.equal(result, '0');
  });

  test('FloorSecondsToMinutes', async () => {
    const result = utilities.floorSecondsToMinutes(61);
    assert.equal(result, '1');
  });

  test('AddStatusIcon with valid status', async () => {
    const result = utilities.addStatusIcon('Open', true);
    assert.equal(result, '$(beaker)  Open ');
  });

  test('AddStatusIcon with valid status, no description', async () => {
    const result = utilities.addStatusIcon('Open', false);
    assert.equal(result, '$(beaker)');
  });

  test('AddStatusIcon with NOT valid status', async () => {
    const result = utilities.addStatusIcon('ABC', true);
    assert.equal(result, '$(info)  ABC ');
  });
});
