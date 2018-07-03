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
const configuration_1 = require("../configuration");
const extension_1 = require("../extension");
const state_1 = require("../state");
class ListMyIssuesCommand {
    constructor() {
        this.id = 'jira-plugin.listMyIssues';
    }
    get baseUrl() {
        return configuration_1.getConfiguration().baseUrl;
    }
    get projectNames() {
        return configuration_1.getConfiguration().projectNames.split(',');
    }
    run(withEmpty) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!extension_1.checkEnabled()) {
                return;
            }
            const issues = yield state_1.default.jira.search({
                jql: `project in (${this.projectNames.join(',')}) `
                    + 'AND resolution = Unresolved AND assignee in (currentUser()) ORDER BY updated DESC'
            });
            const picks = (issues.issues || []).map(issue => {
                return {
                    issue,
                    label: issue.key,
                    description: issue.fields.summary,
                    detail: issue.fields.description
                };
            });
            if (withEmpty) {
                picks.unshift({
                    issue: null,
                    label: withEmpty,
                    description: '',
                    detail: undefined
                });
            }
            const selected = yield vscode.window.showQuickPick(picks, {
                matchOnDescription: true,
                matchOnDetail: true,
                placeHolder: 'Select an issue'
            });
            if (selected) {
                return selected.issue;
            }
            return undefined;
        });
    }
}
__decorate([
    decko_1.bind,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ListMyIssuesCommand.prototype, "run", null);
exports.ListMyIssuesCommand = ListMyIssuesCommand;
//# sourceMappingURL=list-my-issues.js.map