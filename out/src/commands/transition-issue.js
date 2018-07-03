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
const extension_1 = require("../extension");
const state_1 = require("../state");
class TransitionIssueCommand {
    constructor() {
        this.id = 'jira-plugin.transitionIssues';
    }
    run(withDeactivation = true) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!extension_1.checkEnabled()) {
                return;
            }
            const activeIssue = state_1.getActiveIssue();
            if (activeIssue) {
                const selected = yield this.selectTransition(withDeactivation, activeIssue);
                if (selected === null) {
                    yield vscode.commands.executeCommand('jira-plugin.activateIssues', null);
                }
                else if (selected !== undefined) {
                    yield state_1.default.jira.doTransition(activeIssue.key, {
                        transition: {
                            id: selected.id
                        }
                    });
                    yield this.deactivateWhenDone(activeIssue);
                }
                state_1.default.update();
            }
        });
    }
    selectTransition(withActivation, activeIssue) {
        return __awaiter(this, void 0, void 0, function* () {
            const transitions = yield state_1.default.jira.getTransitions(activeIssue.key);
            const picks = transitions.transitions.map(transition => ({
                label: 'Next:',
                description: transition.name,
                transition
            }));
            if (withActivation) {
                picks.unshift({
                    label: 'Pause:',
                    description: this.getDeactivationText(activeIssue),
                    transition: null
                });
            }
            const selected = yield vscode.window.showQuickPick(picks, {
                placeHolder: `Select transition to execute for ${activeIssue.key}`,
                matchOnDescription: true
            });
            return selected ? selected.transition : undefined;
        });
    }
    getDeactivationText(activeIssue) {
        return `Deactivate ${activeIssue.key}`;
    }
    deactivateWhenDone(activeIssue) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield state_1.default.jira.search({ jql: `issue = "${activeIssue.key}" AND resolution = Resolved` });
            if ((result.issues || []).length > 0) {
                vscode.commands.executeCommand('jira-plugin.activateIssues', null);
            }
        });
    }
}
__decorate([
    decko_1.bind,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TransitionIssueCommand.prototype, "run", null);
exports.TransitionIssueCommand = TransitionIssueCommand;
//# sourceMappingURL=transition-issue.js.map