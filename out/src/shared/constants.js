"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CREDENTIALS_SEPARATOR = '##';
exports.CONFIG = {
    BASE_URL: 'baseUrl',
    USERNAME: 'username',
    WORKING_PROJECT: 'workingProject'
};
exports.CONFIG_NAME = 'jira-plugin';
exports.YES = 'Yes';
exports.NO = 'No';
exports.SEARCH_MODE = {
    ALL: 'ALL',
    ID: 'ID',
    STATUS: 'STATUS',
    STATUS_ASSIGNEE: 'STATUS_ASSIGNEE',
    MY_IN_PROGRESS_ISSUES: 'MY_IN_PROGRESS_ISSUES',
    SUMMARY: 'SUMMARY',
    REFRESH: 'REFRESH'
};
exports.STATUS_ICONS = {
    OPEN: { text: 'OPEN', icon: '$(beaker)', file: 'beaker.png' },
    PROGRESS: { text: 'PROGRESS', icon: '$(flame)', file: 'flame.png' },
    RESOLVE: { text: 'RESOLVE', icon: '$(check)', file: 'check.png' },
    CLOSE: { text: 'CLOSE', icon: '$(x)', file: 'x.png' },
    SUSPEND: { text: 'SUSPEND', icon: '$(alert)', file: 'alert.png' },
    DEFAULT: { text: 'DEFAULT', icon: '$(info)', file: 'info.png' }
};
exports.LOADING = { text: 'LOADING', file: 'cloud.png' };
exports.DIVIDER = { text: 'LOADING', file: 'divider.png' };
exports.UNASSIGNED = 'Unassigned';
exports.NO_WORKING_ISSUE = { text: 'No working issue', key: 'NO_WORKING_ISSUE' };
exports.BACK_PICK_LABEL = '$(arrow-left) Back';
//# sourceMappingURL=constants.js.map