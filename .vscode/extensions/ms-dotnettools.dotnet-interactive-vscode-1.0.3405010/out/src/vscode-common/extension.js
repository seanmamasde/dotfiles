"use strict";
// Copyright (c) .NET Foundation and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = exports.DotNetPathManager = exports.CachedDotNetPathManager = exports.KernelIdForJupyter = void 0;
const contracts = require("./dotnet-interactive/contracts");
const fs = require("fs");
const os = require("os");
const path = require("path");
const vscode = require("vscode");
const clientMapper_1 = require("./clientMapper");
const messageClient_1 = require("./messageClient");
const stdioDotnetInteractiveChannel_1 = require("./stdioDotnetInteractiveChannel");
const languageProvider_1 = require("./languageProvider");
const commands_1 = require("./commands");
const interactiveNotebook_1 = require("./interactiveNotebook");
const utilities_1 = require("./utilities");
const OutputChannelAdapter_1 = require("./OutputChannelAdapter");
const notebookControllers = require("../notebookControllers");
const notebookSerializers = require("../notebookSerializers");
const versionSpecificFunctions = require("../versionSpecificFunctions");
const vscodeUtilities_1 = require("./vscodeUtilities");
const ipynbUtilities_1 = require("./ipynbUtilities");
const node_fetch_1 = require("node-fetch");
const logger_1 = require("./dotnet-interactive/logger");
const childProcessLineAdapter_1 = require("./childProcessLineAdapter");
const notebookParserServer_1 = require("./notebookParserServer");
const variableExplorer_1 = require("./variableExplorer");
exports.KernelIdForJupyter = 'dotnet-interactive-for-jupyter';
class CachedDotNetPathManager {
    constructor() {
        this.dotNetPath = 'dotnet'; // default to global tool if possible
        this.outputChannelAdapter = undefined;
    }
    getDotNetPath() {
        return this.dotNetPath;
    }
    setDotNetPath(dotNetPath) {
        if (this.dotNetPath !== dotNetPath) {
            this.dotNetPath = dotNetPath;
            if (this.outputChannelAdapter) {
                this.outputChannelAdapter.appendLine(`dotnet path set to '${this.dotNetPath}'`);
            }
        }
    }
    setOutputChannelAdapter(outputChannelAdapter) {
        this.outputChannelAdapter = outputChannelAdapter;
    }
}
exports.CachedDotNetPathManager = CachedDotNetPathManager;
exports.DotNetPathManager = new CachedDotNetPathManager();
function activate(context) {
    return __awaiter(this, void 0, void 0, function* () {
        const config = vscode.workspace.getConfiguration('dotnet-interactive');
        const minDotNetSdkVersion = config.get('minimumDotNetSdkVersion') || '6.0';
        const diagnosticsChannel = new OutputChannelAdapter_1.OutputChannelAdapter(vscode.window.createOutputChannel('.NET Interactive : diagnostics'));
        const loggerChannel = new OutputChannelAdapter_1.OutputChannelAdapter(vscode.window.createOutputChannel('.NET Interactive : logger'));
        exports.DotNetPathManager.setOutputChannelAdapter(diagnosticsChannel);
        logger_1.Logger.configure('extension host', logEntry => {
            const config = vscode.workspace.getConfiguration('dotnet-interactive');
            const loggerLevelString = config.get('logLevel') || logger_1.LogLevel[logger_1.LogLevel.Error];
            const loggerLevelKey = loggerLevelString;
            const logLevel = logger_1.LogLevel[loggerLevelKey];
            if (logEntry.logLevel >= logLevel) {
                const messageLogLevel = logger_1.LogLevel[logEntry.logLevel];
                loggerChannel.appendLine(`[${messageLogLevel}] ${logEntry.source}: ${logEntry.message}`);
            }
        });
        yield waitForSdkPackExtension();
        // this must happen early, because some following functions use the acquisition command
        (0, commands_1.registerAcquisitionCommands)(context, diagnosticsChannel);
        // check sdk version
        try {
            const dotnetVersion = yield (0, utilities_1.getDotNetVersionOrThrow)(exports.DotNetPathManager.getDotNetPath(), diagnosticsChannel);
            if (!(0, utilities_1.isVersionSufficient)(dotnetVersion, minDotNetSdkVersion)) {
                const message = `The .NET SDK version ${dotnetVersion} is not sufficient. The minimum required version is ${minDotNetSdkVersion}.`;
                diagnosticsChannel.appendLine(message);
                vscode.window.showErrorMessage(message);
                throw new Error(message);
            }
        }
        catch (e) {
            vscode.window.showErrorMessage(`Please install the .NET SDK version ${minDotNetSdkVersion} from https://dotnet.microsoft.com/en-us/download`);
            throw e;
        }
        function kernelChannelCreator(notebookUri) {
            var _a;
            return __awaiter(this, void 0, void 0, function* () {
                const launchOptions = yield getInteractiveLaunchOptions();
                if (!launchOptions) {
                    throw new Error(`Unable to get interactive launch options.  Please see the '${diagnosticsChannel.getName()}' output window for details.`);
                }
                // prepare kernel transport launch arguments and working directory using a fresh config item so we don't get cached values
                const kernelTransportArgs = config.get('kernelTransportArgs');
                const argsTemplate = {
                    args: kernelTransportArgs,
                    workingDirectory: config.get('kernelTransportWorkingDirectory')
                };
                // try to use $HOME/Downloads as a fallback for remote notebooks, but use the home directory if all else fails
                const homeDir = os.homedir();
                const downloadsDir = path.join(homeDir, 'Downloads');
                const fallbackWorkingDirectory = fs.existsSync(downloadsDir) ? downloadsDir : homeDir;
                const workspaceFolderUris = ((_a = vscode.workspace.workspaceFolders) === null || _a === void 0 ? void 0 : _a.map(folder => folder.uri)) || [];
                const workingDirectory = (0, utilities_1.getWorkingDirectoryForNotebook)(notebookUri, workspaceFolderUris, fallbackWorkingDirectory);
                const processStart = (0, utilities_1.processArguments)(argsTemplate, workingDirectory, exports.DotNetPathManager.getDotNetPath(), launchOptions.workingDirectory);
                let notification = {
                    displayError: (message) => __awaiter(this, void 0, void 0, function* () { yield vscode.window.showErrorMessage(message, { modal: false }); }),
                    displayInfo: (message) => __awaiter(this, void 0, void 0, function* () { yield vscode.window.showInformationMessage(message, { modal: false }); }),
                };
                const channel = new stdioDotnetInteractiveChannel_1.StdioDotnetInteractiveChannel(notebookUri.toString(), processStart, diagnosticsChannel, (pid, code, signal) => {
                    clientMapper.closeClient(notebookUri, false);
                });
                yield channel.waitForReady();
                return channel;
            });
        }
        function configureKernel(compositeKernel, notebookUri) {
            compositeKernel.setDefaultTargetKernelNameForCommand(contracts.RequestInputType, compositeKernel.name);
            compositeKernel.setDefaultTargetKernelNameForCommand(contracts.SendEditableCodeType, compositeKernel.name);
            compositeKernel.registerCommandHandler({
                commandType: contracts.RequestInputType, handle: (commandInvocation) => __awaiter(this, void 0, void 0, function* () {
                    const requestInput = commandInvocation.commandEnvelope.command;
                    const prompt = requestInput.prompt;
                    const password = requestInput.isPassword;
                    const value = yield vscode.window.showInputBox({ prompt, password });
                    if (!value) {
                        commandInvocation.context.fail('Input request cancelled');
                    }
                    else {
                        commandInvocation.context.publish({
                            eventType: contracts.InputProducedType,
                            event: {
                                value
                            },
                            command: commandInvocation.commandEnvelope,
                        });
                    }
                })
            });
            compositeKernel.registerCommandHandler({
                commandType: contracts.SendEditableCodeType, handle: (commandInvocation) => __awaiter(this, void 0, void 0, function* () {
                    const addCell = commandInvocation.commandEnvelope.command;
                    const language = addCell.language;
                    const contents = addCell.code;
                    const notebookDocument = vscode.workspace.notebookDocuments.find(notebook => notebook.uri.toString() === notebookUri.toString());
                    if (notebookDocument) {
                        const range = new vscode.NotebookRange(notebookDocument.cellCount, notebookDocument.cellCount);
                        const cellKind = (0, interactiveNotebook_1.languageToCellKind)(language);
                        const notebookCellLanguage = (0, interactiveNotebook_1.getNotebookSpecificLanguage)(language);
                        const newCell = new vscode.NotebookCellData(cellKind, contents, notebookCellLanguage);
                        const succeeded = versionSpecificFunctions.replaceNotebookCells(notebookDocument.uri, range, [newCell]);
                        if (!succeeded) {
                            throw new Error(`Unable to add cell to notebook '${notebookUri.toString()}'.`);
                        }
                    }
                    else {
                        throw new Error(`Unable to get notebook document for URI '${notebookUri.toString()}'.`);
                    }
                })
            });
        }
        // register with VS Code
        const clientMapperConfig = {
            channelCreator: kernelChannelCreator,
            createErrorOutput,
            diagnosticsChannel,
            configureKernel,
        };
        const clientMapper = new clientMapper_1.ClientMapper(clientMapperConfig);
        (0, commands_1.registerKernelCommands)(context, clientMapper);
        (0, variableExplorer_1.registerVariableExplorer)(context, clientMapper);
        const hostVersionSuffix = (0, vscodeUtilities_1.isInsidersBuild)() ? 'Insiders' : 'Stable';
        diagnosticsChannel.appendLine(`Extension started for VS Code ${hostVersionSuffix}.`);
        const languageServiceDelay = config.get('languageServiceDelay') || 500; // fall back to something reasonable
        const preloads = getPreloads(context.extensionPath);
        ////////////////////////////////////////////////////////////////////////////////
        const launchOptions = yield getInteractiveLaunchOptions();
        const serializerCommand = config.get('notebookParserArgs') || []; // TODO: fallback values?
        const serializerCommandProcessStart = (0, utilities_1.processArguments)({ args: serializerCommand, workingDirectory: launchOptions.workingDirectory }, '.', exports.DotNetPathManager.getDotNetPath(), context.globalStorageUri.fsPath);
        const serializerLineAdapter = new childProcessLineAdapter_1.ChildProcessLineAdapter(serializerCommandProcessStart.command, serializerCommandProcessStart.args, serializerCommandProcessStart.workingDirectory, true, diagnosticsChannel);
        const messageClient = new messageClient_1.MessageClient(serializerLineAdapter);
        const parserServer = new notebookParserServer_1.NotebookParserServer(messageClient);
        // startup time consistently <300ms
        // old startup time ~4800ms
        ////////////////////////////////////////////////////////////////////////////////
        const serializerMap = registerWithVsCode(context, clientMapper, parserServer, clientMapperConfig.createErrorOutput, ...preloads);
        (0, commands_1.registerFileCommands)(context, parserServer, clientMapper);
        context.subscriptions.push(vscode.workspace.onDidCloseNotebookDocument(notebookDocument => clientMapper.closeClient(notebookDocument.uri)));
        context.subscriptions.push(vscode.workspace.onDidRenameFiles(e => handleFileRenames(e, clientMapper)));
        // clean up processes
        context.subscriptions.push(serializerLineAdapter);
        clientMapper.onClientCreate((_uri, client) => {
            context.subscriptions.push(client);
        });
        // language registration
        context.subscriptions.push(vscode.workspace.onDidOpenTextDocument((e) => __awaiter(this, void 0, void 0, function* () { return yield updateNotebookCellLanguageInMetadata(e); })));
        context.subscriptions.push((0, languageProvider_1.registerLanguageProviders)(clientMapper, languageServiceDelay));
        vscode.window.registerUriHandler({
            handleUri(uri) {
                const params = new URLSearchParams(uri.query);
                switch (uri.path) {
                    case '/newNotebook':
                        // Examples:
                        //   vscode://ms-dotnettools.dotnet-interactive-vscode/newNotebook?as=dib
                        //   vscode://ms-dotnettools.dotnet-interactive-vscode/newNotebook?as=ipynb
                        const asType = params.get('as');
                        vscode.commands.executeCommand('dotnet-interactive.acquire').then(() => {
                            const commandName = asType === 'ipynb'
                                ? 'dotnet-interactive.newNotebookIpynb'
                                : 'dotnet-interactive.newNotebookDib';
                            vscode.commands.executeCommand(commandName).then(() => { });
                        });
                        break;
                    case '/openNotebook':
                        // Open a local notebook
                        //   vscode://ms-dotnettools.dotnet-interactive-vscode/openNotebook?path=C%3A%5Cpath%5Cto%5Cnotebook.dib
                        // New untitled notebook from remote source
                        //   vscode://ms-dotnettools.dotnet-interactive-vscode/openNotebook?url=http%3A%2F%2Fexample.com%2Fnotebook.dib
                        const notebookPath = params.get('path');
                        const url = params.get('url');
                        const notebookFormat = params.get('notebookFormat');
                        if (notebookPath) {
                            vscode.commands.executeCommand('dotnet-interactive.acquire').then(() => {
                                vscode.commands.executeCommand('dotnet-interactive.openNotebook', vscode.Uri.file(notebookPath)).then(() => { });
                            });
                        }
                        else if (url) {
                            openNotebookFromUrl(url, notebookFormat, serializerMap, diagnosticsChannel).then(() => { });
                        }
                        break;
                }
            }
        });
    });
}
exports.activate = activate;
function deactivate() {
}
exports.deactivate = deactivate;
function getPreloads(extensionPath) {
    const preloads = [];
    const errors = [];
    const apiFiles = [
        'kernelApiBootstrapper.js'
    ];
    for (const apiFile of apiFiles) {
        const apiFileUri = vscode.Uri.file(path.join(extensionPath, 'resources', apiFile));
        if (fs.existsSync(apiFileUri.fsPath)) {
            preloads.push(apiFileUri);
        }
        else {
            errors.push(`Unable to find API file expected at  ${apiFileUri.fsPath}`);
        }
    }
    if (errors.length > 0) {
        const error = errors.join("\n");
        throw new Error(error);
    }
    return preloads;
}
function createErrorOutput(message, outputId) {
    const error = { name: 'Error', message };
    const errorItem = vscode.NotebookCellOutputItem.error(error);
    const cellOutput = (0, utilities_1.createOutput)([errorItem], outputId);
    return cellOutput;
}
function registerWithVsCode(context, clientMapper, parserServer, createErrorOutput, ...preloadUris) {
    const config = {
        clientMapper,
        preloadUris,
        createErrorOutput,
    };
    context.subscriptions.push(new notebookControllers.DotNetNotebookKernel(config));
    return notebookSerializers.createAndRegisterNotebookSerializers(context, parserServer);
}
function openNotebookFromUrl(notebookUrl, notebookFormat, serializerMap, diagnosticsChannel) {
    return __awaiter(this, void 0, void 0, function* () {
        yield vscode.commands.executeCommand('dotnet-interactive.acquire');
        try {
            logger_1.Logger.default.info(`Opening notebook from URL: ${notebookUrl}`);
            const response = yield (0, node_fetch_1.default)(notebookUrl);
            if (response.redirected) {
                logger_1.Logger.default.info(`Redirected to: ${response.url}`);
            }
            if (response.status >= 400) {
                const errorText = yield response.text();
                logger_1.Logger.default.error(`Failed to open notebook from URL: ${notebookUrl}.  ${errorText}`);
                vscode.window.showErrorMessage(`Failed to open notebook from URL: ${notebookUrl}.  ${errorText}`);
                return;
            }
            const resolvedUri = vscode.Uri.parse(response.url);
            if (response.redirected && !notebookFormat) {
                // if no notebook format was passed in _and_ we redirected, check the final resolved url for a format
                const searchParams = new URLSearchParams(resolvedUri.query);
                notebookFormat = searchParams.get('notebookFormat');
            }
            if (!notebookFormat) {
                // if no format was specified on either uri, fall back to the extension
                let extension = path.extname(resolvedUri.path);
                switch (extension) {
                    case '.dib':
                    case '.dotnet-interactive':
                        notebookFormat = 'dib';
                        break;
                    case '.ipynb':
                        notebookFormat = 'ipynb';
                        break;
                    default:
                        throw new Error(`Unsupported notebook extension '${extension}'`);
                }
            }
            let viewType = undefined;
            switch (notebookFormat) {
                case 'dib':
                    viewType = 'dotnet-interactive';
                    break;
                case 'ipynb':
                    viewType = 'jupyter-notebook';
                    break;
                default:
                    throw new Error(`Unsupported notebook format: ${notebookFormat}`);
            }
            const serializer = serializerMap.get(viewType);
            if (!serializer) {
                throw new Error(`Unsupported notebook view type: ${viewType}`);
            }
            const arrayBuffer = yield response.arrayBuffer();
            const content = new Uint8Array(arrayBuffer);
            const cancellationTokenSource = new vscode.CancellationTokenSource();
            const notebookData = yield serializer.deserializeNotebook(content, cancellationTokenSource.token);
            const notebook = yield vscode.workspace.openNotebookDocument(viewType, notebookData);
            const _editor = yield vscode.window.showNotebookDocument(notebook);
        }
        catch (e) {
            vscode.window.showWarningMessage(`Unable to read notebook from '${notebookUrl}': ${e}`);
        }
    });
}
function waitForSdkPackExtension() {
    return __awaiter(this, void 0, void 0, function* () {
        const sdkExtension = vscode.extensions.getExtension("ms-dotnettools.vscode-dotnet-pack");
        if (sdkExtension && !sdkExtension.isActive) {
            yield sdkExtension.activate();
        }
    });
}
// keep the cell's language in metadata in sync with what VS Code thinks it is
function updateNotebookCellLanguageInMetadata(candidateNotebookCellDocument) {
    return __awaiter(this, void 0, void 0, function* () {
        const notebook = vscode.workspace.notebookDocuments.find(notebook => notebook.getCells().some(cell => cell.document === candidateNotebookCellDocument));
        if (notebook &&
            (0, interactiveNotebook_1.isJupyterNotebookViewType)(notebook.notebookType) &&
            (0, interactiveNotebook_1.isDotnetInteractiveLanguage)(candidateNotebookCellDocument.languageId)) {
            const cell = notebook.getCells().find(c => c.document === candidateNotebookCellDocument);
            if (cell) {
                const cellLanguage = cell.kind === vscode.NotebookCellKind.Code
                    ? (0, interactiveNotebook_1.getSimpleLanguage)(candidateNotebookCellDocument.languageId)
                    : 'markdown';
                const dotnetMetadata = (0, ipynbUtilities_1.getDotNetMetadata)(cell.metadata);
                if (dotnetMetadata.language !== cellLanguage) {
                    const newMetadata = (0, ipynbUtilities_1.withDotNetCellMetadata)(cell.metadata, cellLanguage);
                    const _succeeded = yield versionSpecificFunctions.replaceNotebookCellMetadata(notebook.uri, cell.index, newMetadata);
                }
            }
        }
    });
}
function handleFileRenames(e, clientMapper) {
    for (const fileRename of e.files) {
        clientMapper.reassociateClient(fileRename.oldUri, fileRename.newUri);
    }
}
function getInteractiveLaunchOptions() {
    return __awaiter(this, void 0, void 0, function* () {
        // use dotnet-interactive or install
        const installArgs = {
            dotnetPath: exports.DotNetPathManager.getDotNetPath(),
        };
        const launchOptions = yield vscode.commands.executeCommand('dotnet-interactive.acquire', installArgs);
        return launchOptions;
    });
}
//# sourceMappingURL=extension.js.map