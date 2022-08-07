"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initStatusBar = exports.createStatusBar = void 0;
const vscode_1 = require("vscode");
const node_1 = require("vscode-languageclient/node");
var Status;
(function (Status) {
    Status[Status["INIT"] = 1] = "INIT";
    Status[Status["RUNNING"] = 2] = "RUNNING";
    Status[Status["ERROR"] = 3] = "ERROR";
})(Status || (Status = {}));
const oldStatusBarUIElements = {
    [Status.INIT]: {
        icon: 'sync',
        tooltip: 'GraphQL language server is initializing',
    },
    [Status.RUNNING]: {
        icon: 'plug',
        tooltip: 'GraphQL language server is running',
    },
    [Status.ERROR]: {
        icon: 'stop',
        color: new vscode_1.ThemeColor('list.warningForeground'),
        tooltip: 'GraphQL language server has stopped',
    },
};
const statusBarUIElements = {
    [Status.INIT]: {
        icon: 'graphql-loading',
        tooltip: 'GraphQL language server is starting up, click to show logs',
    },
    [Status.RUNNING]: {
        icon: 'graphql-logo',
        tooltip: 'GraphQL language server is running, click to show logs',
    },
    [Status.ERROR]: {
        icon: 'graphql-error',
        color: new vscode_1.ThemeColor('list.warningForeground'),
        tooltip: 'GraphQL language server has stopped, click to show logs',
    },
};
let extensionStatus = Status.RUNNING;
let serverRunning = true;
const statusBarActivationLanguageIds = [
    'graphql',
    'javascript',
    'javascriptreact',
    'typescript',
    'typescriptreact',
];
const createStatusBar = () => {
    return vscode_1.window.createStatusBarItem(vscode_1.StatusBarAlignment.Right, 0);
};
exports.createStatusBar = createStatusBar;
function initStatusBar(statusBarItem, client, editor) {
    extensionStatus = Status.INIT;
    client.onNotification('init', _params => {
        extensionStatus = Status.RUNNING;
        serverRunning = true;
        updateStatusBar(statusBarItem, editor);
    });
    client.onNotification('exit', _params => {
        extensionStatus = Status.ERROR;
        serverRunning = false;
        updateStatusBar(statusBarItem, editor);
    });
    client.onDidChangeState(event => {
        if (event.newState === node_1.State.Running) {
            extensionStatus = Status.RUNNING;
            serverRunning = true;
        }
        else {
            extensionStatus = Status.ERROR;
            client.info('The graphql server has stopped running');
            serverRunning = false;
        }
        updateStatusBar(statusBarItem, editor);
    });
    updateStatusBar(statusBarItem, editor);
    vscode_1.window.onDidChangeActiveTextEditor((activeEditor) => {
        updateStatusBar(statusBarItem, activeEditor);
    });
}
exports.initStatusBar = initStatusBar;
function updateStatusBar(statusBarItem, editor) {
    extensionStatus = serverRunning ? Status.RUNNING : Status.ERROR;
    const [major, minor] = vscode_1.version.split('.');
    const userNewVersion = Number(major) > 1 || (Number(major) === 1 && Number(minor) >= 65);
    const statusBarUIElement = userNewVersion
        ? statusBarUIElements
        : oldStatusBarUIElements;
    const message = userNewVersion ? '' : ' GraphQL';
    const statusUI = statusBarUIElement[extensionStatus];
    statusBarItem.text = `$(${statusUI.icon})${message}`;
    statusBarItem.tooltip = statusUI.tooltip;
    statusBarItem.command = 'vscode-graphql.showOutputChannel';
    if ('color' in statusUI) {
        statusBarItem.color = statusUI.color;
    }
    if (editor &&
        statusBarActivationLanguageIds.indexOf(editor.document.languageId) > -1) {
        statusBarItem.show();
    }
    else {
        statusBarItem.hide();
    }
}
//# sourceMappingURL=statusBar.js.map