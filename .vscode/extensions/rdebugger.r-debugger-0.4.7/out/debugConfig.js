"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DebugConfigurationResolver = exports.DynamicDebugConfigurationProvider = exports.InitialDebugConfigurationProvider = exports.DebugAdapterDescriptorFactory = void 0;
const vscode = require("vscode");
const debugAdapter_1 = require("./debugAdapter");
const fs = require("fs");
const path = require("path");
class DebugAdapterDescriptorFactory {
    constructor(helpPanel) {
        this.helpPanel = helpPanel;
    }
    createDebugAdapterDescriptor(session) {
        const config = session.configuration;
        if (config.request === 'launch') {
            const commandLineArgs = [];
            if ('commandLineArgs' in config) {
                commandLineArgs.push(...config.commandLineArgs);
            }
            return new vscode.DebugAdapterInlineImplementation(new debugAdapter_1.DebugAdapter(this.helpPanel, config));
        }
        else if (config.request === 'attach') {
            const port = Number(config.port || 18721);
            const host = String(config.host || 'localhost');
            return new vscode.DebugAdapterServer(port, host);
        }
        else {
            throw new Error('Invalid entry "request" in debug config. Valid entries are "launch" and "attach"');
        }
    }
}
exports.DebugAdapterDescriptorFactory = DebugAdapterDescriptorFactory;
class InitialDebugConfigurationProvider {
    provideDebugConfigurations(folder) {
        return [
            {
                type: 'R-Debugger',
                name: 'Launch R-Workspace',
                request: 'launch',
                debugMode: 'workspace',
                workingDirectory: '${workspaceFolder}'
            },
            {
                type: 'R-Debugger',
                name: 'Debug R-File',
                request: 'launch',
                debugMode: 'file',
                workingDirectory: '${workspaceFolder}',
                file: '${file}'
            },
            {
                type: 'R-Debugger',
                name: 'Debug R-Function',
                request: 'launch',
                debugMode: 'function',
                workingDirectory: '${workspaceFolder}',
                file: '${file}',
                mainFunction: 'main',
                allowGlobalDebugging: false
            },
            {
                type: 'R-Debugger',
                name: 'Debug R-Package',
                request: 'launch',
                debugMode: 'workspace',
                workingDirectory: '${workspaceFolder}',
                includePackageScopes: true,
                loadPackages: ['.']
            },
            {
                type: 'R-Debugger',
                request: 'attach',
                name: 'Attach to R process',
                splitOverwrittenOutput: true
            }
        ];
    }
}
exports.InitialDebugConfigurationProvider = InitialDebugConfigurationProvider;
class DynamicDebugConfigurationProvider {
    provideDebugConfigurations(folder) {
        const doc = vscode.window.activeTextEditor;
        const docValid = doc && doc.document.uri.scheme === 'file';
        const wd = (folder ? '${workspaceFolder}' : (docValid ? '${fileDirname}' : '.'));
        const hasDescription = folder && fs.existsSync(path.join(folder.uri.fsPath, 'DESCRIPTION'));
        const configs = [];
        configs.push({
            type: 'R-Debugger',
            request: 'launch',
            name: 'Launch R-Workspace',
            debugMode: 'workspace',
            workingDirectory: wd,
            allowGlobalDebugging: true
        });
        if (docValid) {
            configs.push({
                type: 'R-Debugger',
                request: 'launch',
                name: 'Debug R-File',
                debugMode: 'file',
                workingDirectory: wd,
                file: '${file}',
                allowGlobalDebugging: true
            });
            configs.push({
                type: 'R-Debugger',
                request: 'launch',
                name: 'Debug R-Function',
                debugMode: 'function',
                workingDirectory: wd,
                file: '${file}',
                mainFunction: 'main',
                allowGlobalDebugging: false
            });
        }
        if (hasDescription) {
            configs.push({
                type: 'R-Debugger',
                name: 'Debug R-Package',
                request: 'launch',
                debugMode: 'workspace',
                workingDirectory: wd,
                loadPackages: ['.'],
                includePackageScopes: true,
                allowGlobalDebugging: true
            });
        }
        configs.push({
            type: 'R-Debugger',
            request: 'attach',
            name: 'Attach to R process',
            splitOverwrittenOutput: true
        });
        return configs;
    }
}
exports.DynamicDebugConfigurationProvider = DynamicDebugConfigurationProvider;
class DebugConfigurationResolver {
    constructor(customPort, customHost = 'localhost', supportsHelpViewer = false) {
        this.customPort = customPort;
        this.customHost = customHost;
        this.supportsHelpViewer = supportsHelpViewer;
    }
    resolveDebugConfiguration(folder, config, token) {
        var _a, _b, _c, _d, _e;
        let strictConfig = null;
        const doc = vscode.window.activeTextEditor;
        const docValid = doc && doc.document.uri.scheme === 'file';
        const wd = (folder ? '${workspaceFolder}' : (docValid ? '${fileDirname}' : '.'));
        const hasDescription = folder && fs.existsSync(path.join(folder.uri.fsPath, 'DESCRIPTION'));
        // if the debugger was launched without config
        if (!config.type && !config.request && !config.name) {
            if (hasDescription) {
                config = {
                    type: 'R-Debugger',
                    name: 'Debug R-Package',
                    request: 'launch',
                    debugMode: 'workspace',
                    workingDirectory: wd,
                    loadPackages: ['.'],
                    includePackageScopes: true,
                    allowGlobalDebugging: true
                };
            }
            else if (docValid) {
                // if file is open, debug file
                config = {
                    type: 'R-Debugger',
                    name: 'Launch R Debugger',
                    request: 'launch',
                    debugMode: 'file',
                    file: '${file}',
                    workingDirectory: wd
                };
            }
            else {
                // if folder but no file is open, launch workspace
                config = {
                    type: 'R-Debugger',
                    name: 'Launch R Debugger',
                    request: 'launch',
                    debugMode: 'workspace',
                    workingDirectory: wd
                };
            }
        }
        config.debugMode || (config.debugMode = docValid ? 'file' : 'workspace');
        (_a = config.allowGlobalDebugging) !== null && _a !== void 0 ? _a : (config.allowGlobalDebugging = true);
        // fill custom capabilities/socket info
        if (config.request === 'launch') {
            // capabilities that are always true for this extension:
            config.supportsStdoutReading = true;
            config.supportsWriteToStdinEvent = true;
            config.supportsShowingPromptRequest = true;
            // set to true if not specified. necessary since its default in vscDebugger is FALSE:
            (_b = config.overwriteHelp) !== null && _b !== void 0 ? _b : (config.overwriteHelp = true);
            config.overwriteHelp && (config.overwriteHelp = this.supportsHelpViewer); // check if helpview available
        }
        else if (config.request === 'attach') {
            // communication info with TerminalHandler():
            (_c = config.customPort) !== null && _c !== void 0 ? _c : (config.customPort = this.customPort);
            config.customHost || (config.customHost = this.customHost);
            (_d = config.useCustomSocket) !== null && _d !== void 0 ? _d : (config.useCustomSocket = true);
            (_e = config.supportsWriteToStdinEvent) !== null && _e !== void 0 ? _e : (config.supportsWriteToStdinEvent = true);
            config.overwriteLoadAll = false;
        }
        // make sure the config matches the requirements of one of the debug modes
        const debugMode = config.debugMode;
        if (config.request === 'attach') {
            // no fields mandatory
            strictConfig = config;
        }
        else if (debugMode === 'function') {
            // make sure that all required fields (workingDirectory, file, function) are filled:
            config.workingDirectory || (config.workingDirectory = wd);
            config.file || (config.file = '${file}');
            config.mainFunction || (config.mainFunction = 'main');
            strictConfig = config;
        }
        else if (debugMode === 'file') {
            // make sure that all required fields (workingDirectory, file) are filled:
            config.workingDirectory || (config.workingDirectory = wd);
            config.file || (config.file = '${file}');
            strictConfig = config;
        }
        else if (debugMode === 'workspace') {
            // make sure that all required fields (workingDirectory) are filled:
            config.workingDirectory || (config.workingDirectory = wd);
            strictConfig = config;
        }
        else {
            strictConfig = null;
        }
        return strictConfig;
    }
}
exports.DebugConfigurationResolver = DebugConfigurationResolver;
//# sourceMappingURL=debugConfig.js.map