"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const constants_1 = require("../../shared/constants");
const utilities_1 = require("../../shared/utilities");
class LoadingItem extends vscode.TreeItem {
    constructor() {
        super('LOADING...', vscode.TreeItemCollapsibleState.None);
        this.iconPath = {
            light: utilities_1.getIconsPath(`light/${constants_1.LOADING.file}`),
            dark: utilities_1.getIconsPath(`dark/${constants_1.LOADING.file}`)
        };
        this.contextValue = 'LoadingItem';
    }
    get tooltip() {
        return '';
    }
}
exports.LoadingItem = LoadingItem;
//# sourceMappingURL=loading-item.js.map