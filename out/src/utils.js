"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const configuration_1 = require("./configuration");
const state_1 = require("./state");
exports.selectProject = () => __awaiter(this, void 0, void 0, function* () {
    if (state_1.canExecuteJiraAPI()) {
        const projects = yield state_1.default.jira.getProjects();
        const picks = projects.map(project => ({
            label: project.key,
            description: project.name
        }));
        const selected = yield vscode.window.showQuickPick(picks, { placeHolder: `Set current project`, matchOnDescription: true });
        return selected ? selected.label : '';
    }
    return '';
});
exports.selectStatus = () => __awaiter(this, void 0, void 0, function* () {
    if (state_1.canExecuteJiraAPI()) {
        const statuses = yield state_1.default.jira.getStatuses();
        const picks = statuses.map(status => ({
            label: status.name,
            description: status.description
        }));
        const selected = yield vscode.window.showQuickPick(picks, { placeHolder: `Filter by STATUS`, matchOnDescription: true });
        return selected ? selected.label : '';
    }
    return '';
});
exports.selectIssue = () => __awaiter(this, void 0, void 0, function* () {
    if (state_1.canExecuteJiraAPI()) {
        const currentProject = configuration_1.getConfigurationByKey(configuration_1.CONFIG.CURRENT_PROJECT);
        const status = yield exports.selectStatus();
        if (!!status) {
            const issues = yield state_1.default.jira.search({
                jql: `project in (${currentProject}) AND status = '${status}' AND assignee in (currentUser()) ORDER BY updated DESC`
            });
            const picks = (issues.issues || []).map((issue) => {
                return {
                    issue,
                    label: issue.key,
                    description: issue.fields.summary,
                    detail: issue.fields.description
                };
            });
            if (picks.length > 0) {
                const selected = yield vscode.window.showQuickPick(picks, {
                    matchOnDescription: true,
                    matchOnDetail: true,
                    placeHolder: 'Select an issue'
                });
                return selected ? selected.label : undefined;
            }
            else {
                vscode.window.showInformationMessage(`No issues found: project - ${currentProject} | status - ${status}`);
            }
        }
    }
    return undefined;
});
//# sourceMappingURL=utils.js.map