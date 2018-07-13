"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const constants_1 = require("../../shared/constants");
const utilities_1 = require("../../shared/utilities");
class NoResultItem extends vscode.TreeItem {
    constructor(project) {
        super(`${project} - NO ISSUES`, vscode.TreeItemCollapsibleState.None);
        this.iconPath = {
            light: utilities_1.getIconsPath(`light/${constants_1.STATUS_ICONS.DEFAULT.file}`),
            dark: utilities_1.getIconsPath(`dark/${constants_1.STATUS_ICONS.DEFAULT.file}`)
        };
        this.contextValue = 'NoResultItem';
    }
    get tooltip() {
        return '';
    }
}
exports.NoResultItem = NoResultItem;
//# sourceMappingURL=no-result-item.js.map