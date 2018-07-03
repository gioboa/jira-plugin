"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const state = {
    jira: undefined,
    subscriber: [],
    update() {
        this.subscriber.forEach(subscriber => subscriber());
    }
};
exports.default = state;
function getActiveIssue() {
    if (state.workspaceState) {
        return state.workspaceState.get('vscode-jira:active-issue');
    }
    return undefined;
}
exports.getActiveIssue = getActiveIssue;
function setActiveIssue(issue) {
    if (state.workspaceState) {
        state.workspaceState.update('vscode-jira:active-issue', issue
            ? {
                key: issue.key
            }
            : undefined);
        state.update();
    }
}
exports.setActiveIssue = setActiveIssue;
//# sourceMappingURL=state.js.map