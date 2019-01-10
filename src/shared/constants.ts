export const CREDENTIALS_SEPARATOR = '##';

// all the plugin settings
export const CONFIG = {
  BASE_URL: 'baseUrl',
  USERNAME: 'username',
  WORKING_PROJECT: 'workingProject',
  ENABLE_WORKING_ISSUE: 'enableWorkingIssue',
  TRACKING_TIME_MODE: 'trackingTimeMode',
  TRACKING_TIME_MODE_HYBRID_TIMEOUT: 'trackingTimeModeHybridTimeout',
  WORKLOG_MINIMUM_TRACKING_TIME: 'worklogMinimumTrackingTime',
  WORKING_ISSUE_STATUSES: 'workingIssueStatues',
  ADDITIONAL_STATUSES: 'additionalStatuses',
  GIT_INTEGRATION_ENABLED: 'gitIntegration'
};

// all the tracking time mode
export const TRACKING_TIME_MODE = {
  HYBRID: 'hybrid',
  ALWAYS: 'always',
  VSCODE_FOCUS: 'vsCodeFocus'
};

export const CONFIG_NAME = 'jira-plugin';
export const CONFIG_WORKING_ISSUE = 'working-issue';
export const CONFIG_COUNTER = 'counter';

export const DEFAULT_WORKING_ISSUE_STATUS = 'In progress';

// modal answers
export const YES = 'Yes';
export const YES_WITH_COMMENT = 'Yes with comment';
export const NO = 'No';
export const LATER = 'Later';

// all the search types
export const SEARCH_MODE = {
  ALL: 'ALL',
  CURRENT_SPRINT: 'CURRENT_SPRINT',
  ID: 'ID',
  STATUS: 'STATUS',
  MY_STATUS: 'MY_STATUS',
  STATUS_ASSIGNEE: 'STATUS_ASSIGNEE',
  MY_WORKING_ISSUES: 'MY_WORKING_ISSUES',
  FAVOURITES_FILTERS: 'FAVOURITES_FILTERS',
  SUMMARY: 'SUMMARY',
  REFRESH: 'REFRESH'
};

// status icons, used for show the correct icon
// https://octicons.github.com/
export const STATUS_ICONS = {
  OPEN: { text: 'OPEN', icon: '$(beaker)', file: 'beaker.png' },
  PROGRESS: { text: 'PROGRESS', icon: '$(flame)', file: 'flame.png' },
  RESOLVE: { text: 'RESOLVE', icon: '$(check)', file: 'check.png' },
  CLOSE: { text: 'CLOSE', icon: '$(x)', file: 'x.png' },
  SUSPEND: { text: 'SUSPEND', icon: '$(alert)', file: 'alert.png' },
  ESTIMATING: { text: 'ESTIMATING', icon: '$(gist-secret)', file: 'gist-secret.png' },
  ESTIMATED: { text: 'ESTIMATED', icon: '$(book)', file: 'book.png' },
  REMARKED: { text: 'REMARKED', icon: '$(eye)', file: 'eye.png' },
  APPROVED: { text: 'APPROVED', icon: '$(thumbsup)', file: 'thumbsup.png' },
  DEFAULT: { text: 'DEFAULT', icon: '$(info)', file: 'info.png' }
};

export const LOADING = { text: 'LOADING', file: 'cloud.png' };
export const DIVIDER = { text: 'DIVIDER', file: 'divider.png' };
export const UNASSIGNED = 'Unassigned';
export const NO_WORKING_ISSUE = { text: 'No working issue', key: 'NO_WORKING_ISSUE' };
export const BACK_PICK_LABEL = '$(arrow-left) Back';

export const LIST_MAX_RESULTS = 50;
export const SEARCH_MAX_RESULTS = 1000;
export const ASSIGNEES_MAX_RESULTS = 1000;
