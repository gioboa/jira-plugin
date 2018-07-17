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
const state_1 = require("../state/state");
class SetWorkingIssueCommand {
    constructor() {
        this.id = 'jira-plugin.setWorkingIssueCommand';
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            const newIssue = yield select_utilities_1.selectChangeWorkingIssue();
            const activeIssue = state_1.default.workingIssue || new no_working_issue_pick_1.default().pickValue;
            if (!!newIssue && activeIssue.key !== newIssue.key) {
                let action;
                if (newIssue.key !== constants_1.NO_WORKING_ISSUE.key) {
                    action = yield vscode.window.showInformationMessage(`NEW WORKING ISSUE: ${newIssue.key} - ${newIssue.fields.summary}?`, constants_1.YES_WITH_COMMENT, constants_1.YES, constants_1.NO);
                }
                else {
                    action = yield vscode.window.showInformationMessage(`REMOVE WORKING ISSUE: ${activeIssue.key} - ${activeIssue.fields.summary}?`, constants_1.YES_WITH_COMMENT, constants_1.YES, constants_1.NO);
                }
                if (action === constants_1.YES) {
                    if (activeIssue.key !== constants_1.NO_WORKING_ISSUE.key) {
                        const response = yield state_1.default.jira.addWorkLog(activeIssue.key, { timeSpentSeconds: 300 });
                    }
                    state_1.changeWorkingIssue(newIssue);
                }
            }
        });
    }
}
__decorate([
    decko_1.bind,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SetWorkingIssueCommand.prototype, "run", null);
exports.SetWorkingIssueCommand = SetWorkingIssueCommand;
//# sourceMappingURL=set-working-issue 2.js.map