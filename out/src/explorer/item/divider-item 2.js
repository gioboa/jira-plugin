"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const utilities_1 = require("../../shared/utilities");
class DividerItem extends vscode.TreeItem {
    constructor() {
        super('------', vscode.TreeItemCollapsibleState.None);
        this.iconPath = {
            light: utilities_1.getIconsPath(`light/divider.png`),
            dark: utilities_1.getIconsPath(`dark/divider.png`)
        };
        this.contextValue = 'DividerItem';
    }
    get tooltip() {
        return '';
    }
}
exports.DividerItem = DividerItem;
//# sourceMappingURL=divider-item 2.js.map