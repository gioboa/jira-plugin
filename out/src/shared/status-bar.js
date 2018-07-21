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
const utilities_1 = require("./utilities");
class StatusBarManager {
    constructor() {
        this.workingIssueItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
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
            if (configuration_1.getConfigurationByKey(constants_1.CONFIG.ENABLE_WORKING_ISSUE)) {
                this.updateWorkingIssueItem(true);
            }
        });
    }
    workingIssueItemText(workingIssue) {
        return (`$(watch) ` + (workingIssue.issue.key !== constants_1.NO_WORKING_ISSUE.key ? `Working Issue: - ${workingIssue.issue.key || ''} ${utilities_1.secondsToHHMMSS(workingIssue.timePerSecond) || ''}` : constants_1.NO_WORKING_ISSUE.text));
    }
    updateWorkingIssueItem(checkGlobalStore) {
        let issue;
        if (checkGlobalStore) {
            issue = configuration_1.getGlobalWorkingIssue(state_1.default.context);
            if (!!issue) {
                vscode.commands.executeCommand('jira-plugin.setWorkingIssueCommand', JSON.parse(issue));
                configuration_1.setGlobalWorkingIssue(state_1.default.context, undefined);
                return;
            }
        }
        this.clearWorkingIssueInterval();
        if (state_1.default.workingIssue.issue.key !== constants_1.NO_WORKING_ISSUE.key) {
            this.startWorkingIssueInterval();
        }
        else {
            configuration_1.setGlobalWorkingIssue(state_1.default.context, undefined);
        }
        this.workingIssueItem.text = this.workingIssueItemText(state_1.default.workingIssue);
        this.workingIssueItem.tooltip = 'Set working issue';
        this.workingIssueItem.command = 'jira-plugin.setWorkingIssueCommand';
        this.workingIssueItem.show();
    }
    clearWorkingIssueInterval() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
    }
    startWorkingIssueInterval() {
        this.clearWorkingIssueInterval();
        this.intervalId = setInterval(() => {
            if (vscode.window.state.focused) {
                // If we are coming back from a short away period catch up our logging time
                // If the away time was > awayTime, workingIssueItem.awayTime will be -1, so we won't log time.
                if (this.workingIssueItem.awayTime && this.workingIssueItem.awayTime > 0) {
                    state_1.default.workingIssue.timePerSecond += this.workingIssueItem.awayTime;
                }
                // Clear the away timer
                this.workingIssueItem.awayTime = 0;
                // Update as normal
                state_1.incrementStateWorkingIssueTimePerSecond();
                this.workingIssueItem.text = this.workingIssueItemText(state_1.default.workingIssue);
            } else {
                // If we are away from the Window capture the time, if it's less than our awayTimeout
                const awayTimeout = 20 * 60; // TODO: this value should come from in the settings file
                if (this.workingIssueItem.awayTime >= 0) {
                    if ((awayTimeout - this.workingIssueItem.awayTime) > 0) {
                        this.workingIssueItem.awayTime++;
                        // console.log('Away for '+ this.workingIssueItem.awayTime+' seconds.');
                        console.log('Away catchup will timeout in ' + utilities_1.secondsToHHMMSS(awayTimeout - this.workingIssueItem.awayTime) ); // TODO: put ( Snooze icon + the countdown value ) in statusbar next to paused issue time
                    } else {
                        // We've been away longer than the away timeout, we are probably working on something else
                        // we set the away timer to -1 to disable it until the next away period
                        this.workingIssueItem.awayTime = -1;
                        console.log('Away for too long... not going to log time against working issue');
                    }
                }
            }
        }, 1000);
    }
    dispose() {
        return __awaiter(this, void 0, void 0, function* () {
            this.clearWorkingIssueInterval();
            this.workingIssueItem.dispose();
            this.workingProjectItem.dispose();
        });
    }
}
exports.StatusBarManager = StatusBarManager;
//# sourceMappingURL=status-bar.js.map