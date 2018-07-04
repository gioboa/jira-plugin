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
const vscode = require("vscode");
const state_1 = require("../state/state");
const configuration_1 = require("./configuration");
const constants_1 = require("./constants");
class StatusBarManager {
    constructor() {
        this.item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    }
    updateStatusBar(project) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!state_1.default.jira) {
                return;
            }
            if (!project) {
                project = (yield configuration_1.getConfigurationByKey(constants_1.CONFIG.WORKING_PROJECT)) || '';
            }
            if (!!project) {
                this.item.text = `Jira-plugin: working project -> ${project}`;
            }
            else {
                this.item.text = `Jira-plugin: no working project`;
            }
            this.item.show();
        });
    }
    dispose() {
        this.item.dispose();
    }
}
exports.StatusBarManager = StatusBarManager;
//# sourceMappingURL=status-bar.js.map