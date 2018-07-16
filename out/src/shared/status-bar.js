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
const state_1 = require("../state/state");
const configuration_1 = require("./configuration");
const constants_1 = require("./constants");
class StatusBarManager {
    constructor() {
        this.issueLoggingItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
        this.workingProjectItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 200);
    }
    updateWorkingProjectItem(project) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!state_1.default.jira) {
                return;
            }
            if (!project) {
                project = (yield configuration_1.getConfigurationByKey(constants_1.CONFIG.WORKING_PROJECT)) || '';
            }
            this.workingProjectItem.tooltip = 'Set working project';
            this.workingProjectItem.command = 'jira-plugin.setWorkingProjectCommand';
            this.workingProjectItem.text = `$(clippy) ` + (!!project ? `Project: ${project}` : `Project: NONE`);
            this.workingProjectItem.show();
            this.updateIssueLoggingItem();
        });
    }
    updateIssueLoggingItem() {
        return __awaiter(this, void 0, void 0, function* () {
            this.issueLoggingItem.text = `$(watch) ` + (state_1.default.issueLogging.key !== constants_1.NO_ISSUE_LOGGING.key ? `Logging Issue: - ${state_1.default.issueLogging.key || ''}` : constants_1.NO_ISSUE_LOGGING.text);
            this.issueLoggingItem.tooltip = 'Change log issue';
            this.issueLoggingItem.command = 'jira-plugin.changeIssueLoggingCommand';
            this.issueLoggingItem.show();
        });
    }
    dispose() {
        this.issueLoggingItem.dispose();
        this.workingProjectItem.dispose();
    }
}
exports.StatusBarManager = StatusBarManager;
//# sourceMappingURL=status-bar.js.map