"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const vscode = require("vscode");
const constants_1 = require("../shared/constants");
class FilterItem extends vscode.TreeItem {
    constructor(project, filter) {
        super(`${project} - ${filter}`, vscode.TreeItemCollapsibleState.None);
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
exports.FilterItem = FilterItem;
//# sourceMappingURL=filter-item 2.js.map