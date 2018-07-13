export const CREDENTIALS_SEPARATOR = '##';

export const CONFIG = {
  BASE_URL: 'baseUrl',
  USERNAME: 'username',
  WORKING_PROJECT: 'workingProject'
};

export const CONFIG_NAME = 'jira-plugin';

export const SEARCH_MODE = {
  ALL: 'ALL',
  ID: 'ID',
  STATUS: 'STATUS',
  STATUS_ASSIGNEE: 'STATUS_ASSIGNEE',
  SUMMARY: 'SUMMARY',
  REFRESH: 'REFRESH'
};

export const STATUS_ICONS = {
  OPEN: { text: 'OPEN', icon: '$(beaker)', file: 'beaker.png' },
  PROGRESS: { text: 'PROGRESS', icon: '$(flame)', file: 'flame.png' },
  RESOLVE: { text: 'RESOLVE', icon: '$(check)', file: 'check.png' },
  CLOSE: { text: 'CLOSE', icon: '$(x)', file: 'x.png' },
  SUSPEND: { text: 'SUSPEND', icon: '$(alert)', file: 'alert.png' },
  DEFAULT: { text: 'DEFAULT', icon: '$(info)', file: 'info.png' }
};


export const LOADING = { text: 'LOADING', file: 'cloud.png' }
export const DIVIDER = { text: 'LOADING', file: 'divider.png' }
export const UNASSIGNED = 'Unassigned';
export const BACK_PICK_LABEL = '$(arrow-left) Back';
