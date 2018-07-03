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
class IssueNewTransitionCommand {
    constructor() {
        this.id = 'jira-plugin.issueNewTransition';
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            if (state_1.canExecuteJiraAPI()) {
                const issueKey = yield utils_1.selectIssue();
                if (issueKey) {
                    const newTransition = yield this.selectTransition(issueKey);
                    if (newTransition) {
                        const result = yield state_1.default.jira.doTransition(issueKey, {
                            transition: {
                                id: newTransition.id
                            }
                        });
                        console.log(result);
                    }
                }
            }
        });
    }
    selectTransition(issueKey) {
        return __awaiter(this, void 0, void 0, function* () {
            const transitions = yield state_1.default.jira.getTransitions(issueKey);
            const picks = transitions.transitions.map(transition => ({
                label: transition.name,
                description: '',
                transition
            }));
            const selected = yield vscode.window.showQuickPick(picks, {
                placeHolder: `Select transition to execute for ${issueKey}`,
                matchOnDescription: true
            });
            return selected ? selected.transition : undefined;
        });
    }
}
__decorate([
    decko_1.bind,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], IssueNewTransitionCommand.prototype, "run", null);
exports.IssueNewTransitionCommand = IssueNewTransitionCommand;
//# sourceMappingURL=issue-new-transition.js.map