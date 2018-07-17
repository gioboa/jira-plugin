"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const decko_1 = require("decko");
const vscode = require("vscode");
const no_working_issue_pick_1 = require("../picks/no-working-issue-pick");
const constants_1 = require("../shared/constants");
const select_utilities_1 = require("../shared/select-utilities");
const utilities_1 = require("../shared/utilities");
const state_1 = require("../state/state");
class SetWorkingIssueCommand {
    constructor() {
        this.id = 'jira-plugin.setWorkingIssueCommand';
    }
    menageResponse(response) {
        return __awaiter(this, void 0, void 0, function* () {
            if (response === constants_1.NO) {
                return;
            }
            let comment;
            if (response === constants_1.YES_WITH_COMMENT) {
                comment = yield vscode.window.showInputBox({
                    ignoreFocusOut: true,
                    placeHolder: 'Add worklog comment...'
                });
            }
            yield vscode.commands.executeCommand('jira-plugin.issueAddWorklogCommand', state_1.default.workingIssue.issue.key, state_1.default.workingIssue.timePerSecond, comment || '');
        });
    }
    run(storedWorkingIssue) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!!storedWorkingIssue) {
                const workingIssues = yield select_utilities_1.selectWorkingIssues();
                const issue = workingIssues.find(issue => issue.key === storedWorkingIssue.issue.key);
                if (!!issue) {
                    state_1.default.workingIssue = storedWorkingIssue;
                    vscode.window.showInformationMessage(`PENDING WORKING ISSUE: ${state_1.default.workingIssue.issue.key} | timeSpent: ${utilities_1.secondsToHHMMSS(state_1.default.workingIssue.timePerSecond)}`);
                    state_1.changeStateWorkingIssue(state_1.default.workingIssue.issue, state_1.default.workingIssue.timePerSecond);
                }
                else {
                    state_1.changeStateWorkingIssue(new no_working_issue_pick_1.default().pickValue, 0);
                }
            }
            else {
                const workingIssue = state_1.default.workingIssue || new no_working_issue_pick_1.default().pickValue;
                const newIssue = yield select_utilities_1.selectChangeWorkingIssue();
                if (!!newIssue && newIssue.key !== workingIssue.issue.key) {
                    if (workingIssue.issue.key !== constants_1.NO_WORKING_ISSUE.key) {
                        let action = yield vscode.window.showInformationMessage(`Add worklog for the previous working issue ${workingIssue.issue.key} | timeSpent: ${utilities_1.secondsToHHMMSS(workingIssue.timePerSecond)} ?`, constants_1.YES_WITH_COMMENT, constants_1.YES, constants_1.NO);
                        yield this.menageResponse(action || constants_1.NO);
                    }
                    state_1.changeStateWorkingIssue(newIssue, 0);
                }
            }
        });
    }
}
__decorate([
    decko_1.bind,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SetWorkingIssueCommand.prototype, "run", null);
exports.SetWorkingIssueCommand = SetWorkingIssueCommand;
//# sourceMappingURL=set-working-issue.js.map