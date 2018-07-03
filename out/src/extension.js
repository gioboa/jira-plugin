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
const browse_my_issues_1 = require("./commands/browse-my-issues");
const set_current_project_1 = require("./commands/set-current-project");
const setup_credentials_1 = require("./commands/setup-credentials");
const configuration_1 = require("./configuration");
const constants_1 = require("./constants");
const document_link_provider_1 = require("./document-link-provider");
const state_1 = require("./state");
const status_bar_1 = require("./status-bar");
let context;
let channel;
function activate(_context) {
    context = _context;
    state_1.default.workspaceState = context.workspaceState;
    channel = vscode.window.createOutputChannel('JIRA');
    context.subscriptions.push(channel);
    const jiraLinkProvider = new document_link_provider_1.IssueLinkProvider();
    vscode.languages.registerDocumentLinkProvider('*', jiraLinkProvider);
    if (configuration_1.getConfigurationByKey(configuration_1.CONFIG.BASE_URL)) {
        const connect = () => __awaiter(this, void 0, void 0, function* () {
            state_1.default.jira = (yield connectToJira(context));
            state_1.default.update();
        });
        connect().catch(() => {
            vscode.window.showErrorMessage('Failed to connect to jira');
        });
    }
    const statusBar = new status_bar_1.StatusBarManager();
    const commands = [new setup_credentials_1.SetupCredentialsCommand(context), new set_current_project_1.ChangeCurrentProjectCommand(statusBar), new browse_my_issues_1.BrowseMyIssuesCommand()];
    context.subscriptions.push(...commands.map(command => vscode.commands.registerCommand(command.id, command.run)));
    context.subscriptions.push(statusBar);
}
exports.activate = activate;
function checkEnabled() {
    const config = vscode.workspace.getConfiguration('jira');
    if (!state_1.default.jira || !config.has('baseUrl') || !config.has('projectNames')) {
        vscode.window.showInformationMessage('No JIRA client configured. Setup baseUrl, projectNames, username and password');
        return false;
    }
    return true;
}
exports.checkEnabled = checkEnabled;
function connectToJira(ceontext) {
    return __awaiter(this, void 0, void 0, function* () {
        const baseUrl = configuration_1.getConfigurationByKey(configuration_1.CONFIG.BASE_URL);
        const globalConfig = configuration_1.getGlobalStateConfiguration(context);
        if (baseUrl && globalConfig) {
            try {
                const [username, password] = globalConfig.split(constants_1.CREDENTIALS_SEPARATOR);
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
}
exports.connectToJira = connectToJira;
//# sourceMappingURL=extension.js.map