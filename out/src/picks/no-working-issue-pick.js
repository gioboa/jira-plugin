"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../shared/constants");
class NoWorkingIssuePick {
    get label() {
        return `$(x) ${constants_1.NO_WORKING_ISSUE.text}`;
    }
    get description() {
        return '';
    }
    get pickValue() {
        return {
            id: '',
            key: constants_1.NO_WORKING_ISSUE.key,
            fields: {
                summary: '',
                status: {
                    name: ''
                }
            }
        };
    }
}
exports.default = NoWorkingIssuePick;
//# sourceMappingURL=no-working-issue-pick.js.map