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
const configuration_1 = require("../shared/configuration");
const constants_1 = require("../shared/constants");
const utilities_1 = require("../shared/utilities");
class IssuesByStatusAssigneeCommand {
    constructor() {
        this.id = 'jira-plugin.issuesByStatusAssigneeCommand';
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            const issue = yield utilities_1.selectIssue(constants_1.SEARCH_MODE.STATUS_ASSIGNEE);
            if (issue) {
                const url = `${configuration_1.getConfigurationByKey(constants_1.CONFIG.BASE_URL)}/browse/${issue}`;
                yield vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(url));
            }
        });
    }
}
__decorate([
    decko_1.bind,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], IssuesByStatusAssigneeCommand.prototype, "run", null);
exports.IssuesByStatusAssigneeCommand = IssuesByStatusAssigneeCommand;
//# sourceMappingURL=issues-by-status-assignee.js.map