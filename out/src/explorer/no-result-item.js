"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const vscode = require("vscode");
const constants_1 = require("../shared/constants");
class NoResultItem extends vscode.TreeItem {
    constructor(project) {
        super(`${project} - NO ISSUES`, vscode.TreeItemCollapsibleState.None);
        this.iconPath = {
            light: path.join(__filename, '..', '..', '..', '..', 'images', 'icons', constants_1.STATUS_ICONS.DEFAULT.file),
            dark: path.join(__filename, '..', '..', '..', '..', 'images', 'icons', constants_1.STATUS_ICONS.DEFAULT.file)
        };
        this.contextValue = 'IssueItem';
    }
    get tooltip() {
        return '';
    }
}
exports.NoResultItem = NoResultItem;
//# sourceMappingURL=no-result-item.js.map