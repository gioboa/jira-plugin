export const CREDENTIALS_SEPARATOR = '##';

export const CONFIG = {
  BASE_URL: 'baseUrl',
  USERNAME: 'username',
  WORKING_PROJECT: 'workingProject'
};

export const CONFIG_NAME = 'jira-plugin';

export const SEARCH_MODE = {
  ID: 'ID',
  STATUS: 'STATUS',
  STATUS_ASSIGNEE: 'STATUS_ASSIGNEE',
  SUMMARY: 'summary'
};

export const STATUS_ICONS = {
  OPEN: { text: 'OPEN', icon: '$(beaker)' },
  PROGRESS: { text: 'PROGRESS', icon: '$(flame)' },
  RESOLVE: { text: 'RESOLVE', icon: '$(check)' },
  CLOSE: { text: 'CLOSE', icon: '$(x)' },
  SUSPEND: { text: 'SUSPEND', icon: '$(alert)' },
  DEFAULT: { text: 'DEFAULT', icon: '$(info)' }
};

export const UNASSIGNED = 'Unassigned';
export const BACK_PICK_LABEL = '$(arrow-left) Back';
