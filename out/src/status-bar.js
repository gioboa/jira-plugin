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
const state_1 = require("./state");
class StatusBarManager {
    constructor() {
        this.item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
        this.item.text = '$(issue-opened)';
        state_1.default.subscriber.push(() => {
            this.updateStatus();
        });
        this.interval = setInterval(() => {
            this.updateStatus();
        }, 1000 * 60 * 5);
    }
    updateStatus() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!state_1.default.jira) {
                return;
            }
            this.item.show();
            const activeIssue = state_1.getActiveIssue();
            if (activeIssue) {
                const issue = yield state_1.default.jira.getIssue(activeIssue.key);
                this.item.text = `$(issue-opened) ${activeIssue.key} ${issue.fields.status.name}`;
                this.item.tooltip = 'Click to transition issue...';
                this.item.command = 'jira-plugin.transitionIssues';
            }
            else {
                this.item.text = '$(issue-opened)';
                this.item.tooltip = 'Click to activate issue...';
                this.item.command = 'jira-plugin.activateIssues';
            }
        });
    }
    dispose() {
        this.item.dispose();
        clearInterval(this.interval);
    }
}
exports.StatusBarManager = StatusBarManager;
//# sourceMappingURL=status-bar.js.map