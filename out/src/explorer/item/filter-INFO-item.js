"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const constants_1 = require("../../shared/constants");
const utilities_1 = require("../../shared/utilities");
class FilterInfoItem extends vscode.TreeItem {
    constructor(project, filter, issueCounter) {
        super(`${project} - ${filter} - COUNT: ${issueCounter}`, vscode.TreeItemCollapsibleState.None);
        this.iconPath = {
            light: utilities_1.getIconsPath(`light/${constants_1.STATUS_ICONS.DEFAULT.file}`),
            dark: utilities_1.getIconsPath(`dark/${constants_1.STATUS_ICONS.DEFAULT.file}`)
        };
        this.contextValue = 'FilterInfoItem';
    }
    get tooltip() {
        return '';
    }
}
exports.FilterInfoItem = FilterInfoItem;
//# sourceMappingURL=filter-info-item.js.map