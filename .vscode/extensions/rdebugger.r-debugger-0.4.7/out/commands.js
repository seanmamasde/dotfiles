"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.showDataViewer = void 0;
const vscode = require("vscode");
// Sends a custom request to R to show a variable in the data viewer
function showDataViewer(arg) {
    var _a;
    const args = {
        reason: 'showDataViewer',
        variablesReference: arg.container.variablesReference,
        name: arg.variable.name
    };
    void ((_a = vscode.debug.activeDebugSession) === null || _a === void 0 ? void 0 : _a.customRequest('custom', args));
}
exports.showDataViewer = showDataViewer;
//# sourceMappingURL=commands.js.map