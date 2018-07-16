"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../shared/constants");
class NoLogIssuePick {
    get label() {
        return `$(x) No active issue`;
    }
    get description() {
        return '';
    }
    get pickValue() {
        return {
            id: '',
            key: constants_1.NO_ACTIVE_ISSUE,
            fields: {
                summary: '',
                status: {
                    name: ''
                }
            }
        };
    }
}
exports.default = NoLogIssuePick;
//# sourceMappingURL=no-active-issue-pick.js.map