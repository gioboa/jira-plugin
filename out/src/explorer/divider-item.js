"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const vscode = require("vscode");
class DividerItem extends vscode.TreeItem {
    constructor() {
        super('', vscode.TreeItemCollapsibleState.None);
        this.iconPath = {
            light: path.join(__filename, '..', '..', '..', '..', 'images', 'icons', 'divider.svg'),
            dark: path.join(__filename, '..', '..', '..', '..', 'images', 'icons', 'divider.svg')
        };
        this.contextValue = 'IssueItem';
    }
    get tooltip() {
        return '';
    }
}
exports.DividerItem = DividerItem;
//# sourceMappingURL=divider-item.js.map