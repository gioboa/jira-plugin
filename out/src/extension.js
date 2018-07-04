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
require("isomorphic-fetch");
const vscode = require("vscode");
const api_1 = require("./api");
const change_issue_assignee_1 = require("./commands/change-issue-assignee");
const change_issue_status_1 = require("./commands/change-issue-status");
const issue_by_id_1 = require("./commands/issue-by-id");
const issues_by_status_assignee_1 = require("./commands/issues-by-status-assignee");
const my_issues_by_status_1 = require("./commands/my-issues-by-status");
const set_current_project_1 = require("./commands/set-current-project");
const setup_credentials_1 = require("./commands/setup-credentials");
const configuration_1 = require("./configuration");
const document_link_provider_1 = require("./document-link-provider");
const state_1 = require("./state");
const status_bar_1 = require("./status-bar");
let channel;
exports.activate = (context) => {
    channel = vscode.window.createOutputChannel('JIRA');
    context.subscriptions.push(channel);
    const jiraLinkProvider = new document_link_provider_1.IssueLinkProvider();
    vscode.languages.registerDocumentLinkProvider('*', jiraLinkProvider);
    if (configuration_1.getConfigurationByKey(configuration_1.CONFIG.BASE_URL)) {
        const connect = () => __awaiter(this, void 0, void 0, function* () {
            state_1.default.jira = (yield exports.connectToJira(context));
            state_1.default.context = context;
            state_1.default.statuses = yield state_1.default.jira.getStatuses();
            state_1.default.projects = yield state_1.default.jira.getProjects();
        });
        connect().catch(() => {
            vscode.window.showErrorMessage('Failed to connect to jira');
        });
    }
    const statusBar = new status_bar_1.StatusBarManager();
    const commands = [
        new setup_credentials_1.SetupCredentialsCommand(context),
        new set_current_project_1.SetCurrentProjectCommand(statusBar),
        new my_issues_by_status_1.MyIssuesByStatusCommand(),
        new issues_by_status_assignee_1.IssuesByStatusAssigneeCommand(),
        new issue_by_id_1.IssueByIdCommand(),
        new change_issue_status_1.ChangeIssueStatusCommand(),
        new change_issue_assignee_1.ChangeIssueAssigneeCommand()
    ];
    context.subscriptions.push(...commands.map(command => vscode.commands.registerCommand(command.id, command.run)));
    context.subscriptions.push(statusBar);
};
exports.connectToJira = (context) => __awaiter(this, void 0, void 0, function* () {
    const baseUrl = configuration_1.getConfigurationByKey(configuration_1.CONFIG.BASE_URL) || '';
    const [username, password] = configuration_1.getGlobalStateConfiguration(context).split(configuration_1.CREDENTIALS_SEPARATOR);
    if (!!baseUrl && !!username && !!password) {
        try {
            const client = api_1.createClient(baseUrl, username, password);
            const serverInfo = yield client.serverInfo();
            if (serverInfo.versionNumbers[0] < 5) {
                vscode.window.showInformationMessage(`Unsupported JIRA version '${serverInfo.version}'. Must be at least 5.0.0`);
                return;
            }
            channel.appendLine(`Connected to JIRA server at '${baseUrl}'`);
            return client;
        }
        catch (e) {
            channel.appendLine(`Failed to contact JIRA server using '${baseUrl}'. Please check url and credentials`);
            channel.appendLine(e.message);
        }
    }
    return undefined;
});
//# sourceMappingURL=extension.js.map