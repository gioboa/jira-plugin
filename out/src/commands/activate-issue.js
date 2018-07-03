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
class ActivateIssueCommand {
    constructor() {
        this.id = 'jira-plugin.activateIssues';
    }
    run(preselected) {
        return __awaiter(this, void 0, void 0, function* () {
            const issue = yield this.selectIssue(preselected);
            if (issue !== undefined) {
                state_1.setActiveIssue(issue);
            }
        });
    }
    selectIssue(preselected) {
        return __awaiter(this, void 0, void 0, function* () {
            if (preselected || preselected === null) {
                return preselected;
            }
            const activateIssue = state_1.getActiveIssue();
            const name = activateIssue ? `Deactivate ${activateIssue.key}` : undefined;
            return yield vscode.commands.executeCommand('jira-plugin.listMyIssues', name);
        });
    }
}
__decorate([
    decko_1.bind,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ActivateIssueCommand.prototype, "run", null);
exports.ActivateIssueCommand = ActivateIssueCommand;
//# sourceMappingURL=activate-issue.js.map