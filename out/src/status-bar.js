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
const configuration_1 = require("./configuration");
const state_1 = require("./state");
class StatusBarManager {
    constructor() {
        this.item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
        setTimeout(() => this.updateStatusBar(''), 2000);
    }
    updateStatusBar(currentProject) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!state_1.default.jira) {
                return;
            }
            if (!currentProject) {
                currentProject = (yield configuration_1.getConfigurationByKey(configuration_1.CONFIG.CURRENT_PROJECT)) || '';
            }
            if (!!currentProject) {
                this.item.text = `JIRA current project -> ${currentProject}`;
            }
            else {
                this.item.text = `JIRA no project selected`;
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