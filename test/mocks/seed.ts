// Seeds the mocked VS Code configuration. Imported first by setup.ts so it runs before the
// extension services are instantiated (they snapshot the configuration at import time).
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { settings } from '../utils/settings';
import { __mock } from './vscode';

// defaults declared in package.json "contributes.configuration"
const packageJson = JSON.parse(readFileSync(join(__dirname, '../../package.json'), 'utf8'));
const properties = packageJson.contributes.configuration.properties as Record<
  string,
  { default: any }
>;
for (const [key, property] of Object.entries(properties)) {
  __mock.configStore.set(key, property.default);
}

// test settings (real credentials for the e2e suite, placeholders otherwise)
__mock.configStore.set('jira-plugin.baseUrl', settings.baseUrl);
__mock.configStore.set('jira-plugin.username', settings.username);
__mock.configStore.set('jira-plugin.workingProject', settings.workingProject);
__mock.configStore.set('jira-plugin.enableWorkingIssue', settings.enableWorkingIssue);
__mock.configStore.set('jira-plugin.workingIssueStatues', settings.workingIssueStatues);
