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
const state_1 = require("../state");
const utils_1 = require("../utils");
class ChangeIssueAssigneeCommand {
    constructor() {
        this.id = 'jira-plugin.changeIssueAssigneeCommand';
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            const issueKey = yield utils_1.selectIssue(utils_1.SEARCH_MODE.ID);
            if (issueKey) {
                const assignee = yield utils_1.selectAssignee();
                if (assignee !== utils_1.UNASSIGNED) {
                    const res = yield state_1.default.jira.assignIssue(issueKey, {
                        name: assignee
                    });
                }
                else {
                    vscode.window.showInformationMessage(`It's no possible to assign the issue to the user Unassigned`);
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
], ChangeIssueAssigneeCommand.prototype, "run", null);
exports.ChangeIssueAssigneeCommand = ChangeIssueAssigneeCommand;
//# sourceMappingURL=assign-issue.js.map