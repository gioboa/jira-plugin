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
const state_1 = require("./state");
exports.selectProject = () => __awaiter(this, void 0, void 0, function* () {
    const projects = yield state_1.default.jira.getProjects();
    const picks = projects.map(project => ({
        label: project.key,
        description: project.name
    }));
    const selected = yield vscode.window.showQuickPick(picks, { placeHolder: `Set current project`, matchOnDescription: true });
    return selected ? selected.label : '';
});
exports.selectStatus = () => __awaiter(this, void 0, void 0, function* () {
    const projects = yield state_1.default.jira.getProjects();
    const picks = projects.map(project => ({
        label: project.key,
        description: project.name
    }));
    const selected = yield vscode.window.showQuickPick(picks, { placeHolder: `Set current project`, matchOnDescription: true });
    return selected ? selected.label : '';
});
//# sourceMappingURL=utils 2.js.map