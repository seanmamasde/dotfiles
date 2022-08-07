"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
const installRPackage_1 = require("./installRPackage");
const terminals_1 = require("./terminals");
const utils_1 = require("./utils");
const debugConfig_1 = require("./debugConfig");
const commands_1 = require("./commands");
// this method is called when the extension is activated
async function activate(context) {
    if (context.globalState.get('ignoreDeprecatedConfig', false) !== true) {
        void utils_1.checkSettings().then((ret) => {
            void context.globalState.update('ignoreDeprecatedConfig', ret);
        });
    }
    const rExtension = vscode.extensions.getExtension('ikuyadeu.r');
    let rHelpPanel = undefined;
    if (rExtension) {
        const api = await rExtension.activate();
        if (api) {
            rHelpPanel = api.helpPanel;
        }
    }
    const supportsHelpViewer = !!rHelpPanel;
    const terminalHandler = new terminals_1.TerminalHandler();
    const port = await terminalHandler.portPromise;
    context.subscriptions.push(terminalHandler);
    // register configuration resolver
    const resolver = new debugConfig_1.DebugConfigurationResolver(port, 'localhost', supportsHelpViewer);
    context.subscriptions.push(vscode.debug.registerDebugConfigurationProvider('R-Debugger', resolver));
    // register dynamic configuration provider
    const dynamicProvider = new debugConfig_1.DynamicDebugConfigurationProvider();
    context.subscriptions.push(vscode.debug.registerDebugConfigurationProvider('R-Debugger', dynamicProvider, vscode.DebugConfigurationProviderTriggerKind.Dynamic));
    // register initial configuration provider
    const initialProvider = new debugConfig_1.InitialDebugConfigurationProvider();
    context.subscriptions.push(vscode.debug.registerDebugConfigurationProvider('R-Debugger', initialProvider, vscode.DebugConfigurationProviderTriggerKind.Initial));
    // register the debug adapter descriptor provider
    const factory = new debugConfig_1.DebugAdapterDescriptorFactory(rHelpPanel);
    context.subscriptions.push(vscode.debug.registerDebugAdapterDescriptorFactory('R-Debugger', factory));
    if (vscode.workspace.getConfiguration('r.debugger').get('trackTerminals', false)) {
        terminals_1.trackTerminals(context.environmentVariableCollection);
    }
    context.subscriptions.push(vscode.commands.registerCommand('r.debugger.updateRPackage', () => installRPackage_1.updateRPackage(context.extensionPath)), vscode.commands.registerCommand('r.debugger.showDataViewer', (arg) => {
        commands_1.showDataViewer(arg);
    }));
}
exports.activate = activate;
// this method is called when the extension is deactivated
function deactivate() {
    // dummy
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map