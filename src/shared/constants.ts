export const CREDENTIALS_SEPARATOR = '##';

export const CONFIG_NAME = 'jira-plugin';
export const CONFIG_WORKING_ISSUE = 'working-issue';
export const CONFIG_COUNTER = 'counter';

// all the plugin settings
export const CONFIG = {
  ADDITIONAL_STATUSES: 'additionalStatuses',
  BASE_URL: 'baseUrl',
  CHECK_FOR_NOTIFICATIONS_ENABLE: 'enableCheckForNotifications',
  DEFAULT_JQL_SEARCH: 'defaultJqlSearch',
  ENABLE_WORKING_ISSUE: 'enableWorkingIssue',
  GIT_INTEGRATION_ENABLED: 'gitIntegration',
  GROUP_TASK_AND_SUBTASKS: 'groupTaskAndSubtasks',
  ISSUE_LIST_AUTO_REFRESH_INTERVAL: 'issueListAutoRefreshInterval',
  NUMBER_ISSUES_IN_LIST: 'numberOfIssuesInList',
  PROJECT_KEY_MAPPING: 'projectKeyMapping',
  PROJECTS_TO_HIDE: 'projectsToHide',
  PROJECTS_TO_SHOW: 'projectsToShow',
  REQUESTS_TIMEOUT: 'requestsTimeout',
  STRICT_SSL: 'strictSSL',
  TRACKING_TIME_MODE: 'trackingTimeMode',
  TRACKING_TIME_MODE_HYBRID_TIMEOUT: 'trackingTimeModeHybridTimeout',
  USERNAME: 'username',
  WORKING_ISSUE_ASSIGNEES: 'workingIssueAssignees',
  WORKING_ISSUE_CHANGE_STATUS_AFTER_SELECTION: 'workingIssueChangeStatusAfterSelection',
  WORKING_ISSUE_SHOW_TIMER: 'workingIssueShowTimer',
  WORKING_ISSUE_STATUSES: 'workingIssueStatues',
  WORKING_PROJECT: 'workingProject',
  WORKLOG_MINIMUM_TRACKING_TIME: 'worklogMinimumTrackingTime'
};

// all the tracking time mode
export const TRACKING_TIME_MODE = {
  HYBRID: 'hybrid',
  ALWAYS: 'always',
  VSCODE_FOCUS: 'vsCodeFocus',
  NEVER: 'never'
};

export const DEFAULT_WORKING_ISSUE_STATUS = 'In progress';
export const DEFAULT_WORKING_ISSUE_ASSIGNEE = 'currentUser()';

// modal answers
export const ACTIONS = {
  YES: 'Yes',
  YES_WITH_COMMENT: 'Yes with comment',
  NO: 'No',
  LATER: 'Later',
  CLOSE: 'Close',
  MARK_AS_READ: 'Mark as read',
  OPEN_ISSUE: 'Open issue'
};

// all the search types
export const SEARCH_MODE = {
  DEFAULT: 'DEFAULT',
  ALL: 'ALL',
  CURRENT_SPRINT: 'CURRENT_SPRINT',
  ID: 'ID',
  STATUS: 'STATUS',
  MY_STATUS: 'MY_STATUS',
  STATUS_ASSIGNEE: 'STATUS_ASSIGNEE',
  WORKING_ISSUES: 'WORKING_ISSUES',
  FAVOURITES_FILTERS: 'FAVOURITES_FILTERS',
  SUMMARY: 'SUMMARY',
  REFRESH: 'REFRESH',
  AUTO_REFRESH: 'AUTO_REFRESH'
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
export const UNASSIGNED = 'Unassigned';
export const NO_WORKING_ISSUE = { text: 'No working issue', key: 'NO_WORKING_ISSUE' };
export const BACK_PICK_LABEL = '$(arrow-left) Back';
export const ERROR_WRONG_CONFIGURATION = 'Wrong configuration';

export const SEARCH_MAX_RESULTS = 1000;
export const ASSIGNEES_MAX_RESULTS = 1000;

export const GROUP_BY_FIELDS = {
  STATUS: { label: 'Status', value: 'status' },
  ASSIGNEE: { label: 'Assignee', value: 'assignee' },
  TYPE: { label: 'Type', value: 'issuetype' },
  PRIORITY: { label: 'Priority', value: 'priority' },
  UPDATED: { label: 'Updated', value: 'updated' }
};
