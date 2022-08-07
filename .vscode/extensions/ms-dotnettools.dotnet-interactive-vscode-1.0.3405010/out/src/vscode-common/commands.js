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
exports.selectDotNetInteractiveKernelForJupyter = exports.registerFileCommands = exports.registerKernelCommands = exports.registerAcquisitionCommands = void 0;
const vscode = require("vscode");
const path = require("path");
const acquisition_1 = require("./acquisition");
const vscodeUtilities_1 = require("./vscodeUtilities");
const extension_1 = require("./extension");
const utilities_1 = require("./utilities");
const notebookControllers = require("../notebookControllers");
const ipynbUtilities = require("./ipynbUtilities");
const interactiveNotebook_1 = require("./interactiveNotebook");
const versionSpecificFunctions = require("../versionSpecificFunctions");
const promiseCompletionSource_1 = require("./dotnet-interactive/promiseCompletionSource");
function registerAcquisitionCommands(context, diagnosticChannel) {
    const config = vscode.workspace.getConfiguration('dotnet-interactive');
    const minDotNetInteractiveVersion = config.get('minimumInteractiveToolVersion');
    const interactiveToolSource = config.get('interactiveToolSource');
    let cachedInstallArgs = undefined;
    let acquirePromise = undefined;
    context.subscriptions.push(vscode.commands.registerCommand('dotnet-interactive.acquire', (args) => __awaiter(this, void 0, void 0, function* () {
        try {
            const installArgs = (0, utilities_1.computeToolInstallArguments)(args);
            extension_1.DotNetPathManager.setDotNetPath(installArgs.dotnetPath);
            if (cachedInstallArgs) {
                if (installArgs.dotnetPath !== cachedInstallArgs.dotnetPath ||
                    installArgs.toolVersion !== cachedInstallArgs.toolVersion) {
                    // if specified install args are different than what we previously computed, invalidate the acquisition
                    acquirePromise = undefined;
                }
            }
            if (!acquirePromise) {
                const installationPromiseCompletionSource = new promiseCompletionSource_1.PromiseCompletionSource();
                acquirePromise = (0, acquisition_1.acquireDotnetInteractive)(installArgs, minDotNetInteractiveVersion, context.globalStorageUri.fsPath, getInteractiveVersion, createToolManifest, (version) => {
                    vscode.window.withProgress({ location: vscode.ProgressLocation.Notification, title: `Installing .NET Interactive version ${version}...` }, (_progress, _token) => installationPromiseCompletionSource.promise);
                }, installInteractiveTool, () => { installationPromiseCompletionSource.resolve(); });
            }
            const launchOptions = yield acquirePromise;
            return launchOptions;
        }
        catch (err) {
            diagnosticChannel.appendLine(`Error acquiring dotnet-interactive tool: ${err}`);
        }
    })));
    function createToolManifest(dotnetPath, globalStoragePath) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, utilities_1.executeSafeAndLog)(diagnosticChannel, 'create-tool-manifest', dotnetPath, ['new', 'tool-manifest'], globalStoragePath);
            if (result.code !== 0) {
                throw new Error(`Unable to create local tool manifest.  Command failed with code ${result.code}.\n\nSTDOUT:\n${result.output}\n\nSTDERR:\n${result.error}`);
            }
        });
    }
    function installInteractiveTool(args, globalStoragePath) {
        return __awaiter(this, void 0, void 0, function* () {
            // remove previous tool; swallow errors in case it's not already installed
            let uninstallArgs = [
                'tool',
                'uninstall',
                'Microsoft.dotnet-interactive'
            ];
            yield (0, utilities_1.executeSafeAndLog)(diagnosticChannel, 'tool-uninstall', args.dotnetPath, uninstallArgs, globalStoragePath);
            let toolArgs = [
                'tool',
                'install',
                '--add-source',
                interactiveToolSource,
                '--ignore-failed-sources',
                'Microsoft.dotnet-interactive'
            ];
            if (args.toolVersion) {
                toolArgs.push('--version', args.toolVersion);
            }
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                const result = yield (0, utilities_1.executeSafeAndLog)(diagnosticChannel, 'tool-install', args.dotnetPath, toolArgs, globalStoragePath);
                if (result.code === 0) {
                    resolve();
                }
                else {
                    reject();
                }
            }));
        });
    }
}
exports.registerAcquisitionCommands = registerAcquisitionCommands;
function registerKernelCommands(context, clientMapper) {
    context.subscriptions.push(vscode.commands.registerCommand('dotnet-interactive.restartCurrentNotebookKernel', (notebook) => __awaiter(this, void 0, void 0, function* () {
        if (!notebook) {
            if (!vscode.window.activeNotebookEditor) {
                // no notebook to operate on
                return;
            }
            notebook = versionSpecificFunctions.getNotebookDocumentFromEditor(vscode.window.activeNotebookEditor);
        }
        if (notebook) {
            yield vscode.commands.executeCommand('dotnet-interactive.stopCurrentNotebookKernel', notebook);
            const _client = yield clientMapper.getOrAddClient(notebook.uri);
        }
    })));
    context.subscriptions.push(vscode.commands.registerCommand('dotnet-interactive.stopCurrentNotebookKernel', (notebook) => __awaiter(this, void 0, void 0, function* () {
        if (!notebook) {
            if (!vscode.window.activeNotebookEditor) {
                // no notebook to operate on
                return;
            }
            notebook = versionSpecificFunctions.getNotebookDocumentFromEditor(vscode.window.activeNotebookEditor);
        }
        if (notebook) {
            for (const cell of notebook.getCells()) {
                notebookControllers.endExecution(cell, false);
            }
            clientMapper.closeClient(notebook.uri);
        }
    })));
    context.subscriptions.push(vscode.commands.registerCommand('dotnet-interactive.stopAllNotebookKernels', () => __awaiter(this, void 0, void 0, function* () {
        vscode.workspace.notebookDocuments
            .filter(document => clientMapper.isDotNetClient(document.uri))
            .forEach((document) => __awaiter(this, void 0, void 0, function* () { return yield vscode.commands.executeCommand('dotnet-interactive.stopCurrentNotebookKernel', document); }));
    })));
}
exports.registerKernelCommands = registerKernelCommands;
function registerFileCommands(context, parserServer, clientMapper) {
    const eol = (0, vscodeUtilities_1.getEol)();
    const notebookFileFilters = {
        '.NET Interactive Notebooks': ['dib', 'dotnet-interactive'],
        'Jupyter Notebooks': ['ipynb'],
    };
    context.subscriptions.push(vscode.commands.registerCommand('dotnet-interactive.newNotebook', () => __awaiter(this, void 0, void 0, function* () {
        if ((0, vscodeUtilities_1.isAzureDataStudio)(context)) {
            // only `.dib` is allowed
            yield vscode.commands.executeCommand('dotnet-interactive.newNotebookDib');
        }
        else {
            // offer to create either `.dib` or `.ipynb`
            const newDibNotebookText = `Create as '.dib'`;
            const newIpynbNotebookText = `Create as '.ipynb'`;
            const selected = yield vscode.window.showQuickPick([newDibNotebookText, newIpynbNotebookText]);
            switch (selected) {
                case newDibNotebookText:
                    yield vscode.commands.executeCommand('dotnet-interactive.newNotebookDib');
                    break;
                case newIpynbNotebookText:
                    yield vscode.commands.executeCommand('dotnet-interactive.newNotebookIpynb');
                    break;
                default:
                    break;
            }
        }
    })));
    context.subscriptions.push(vscode.commands.registerCommand('dotnet-interactive.newNotebookDib', () => __awaiter(this, void 0, void 0, function* () {
        yield newNotebook('.dib');
    })));
    context.subscriptions.push(vscode.commands.registerCommand('dotnet-interactive.newNotebookIpynb', () => __awaiter(this, void 0, void 0, function* () {
        // note, new .ipynb notebooks are currently affected by this bug: https://github.com/microsoft/vscode/issues/121974
        yield newNotebook('.ipynb');
        yield selectDotNetInteractiveKernelForJupyter();
    })));
    function newNotebook(extension) {
        return __awaiter(this, void 0, void 0, function* () {
            const viewType = extension === '.dib' || extension === '.dotnet-interactive'
                ? 'dotnet-interactive'
                : interactiveNotebook_1.jupyterViewType;
            // get language
            const newNotebookCSharp = `C#`;
            const newNotebookFSharp = `F#`;
            const newNotebookPowerShell = `PowerShell`;
            const notebookLanguage = yield vscode.window.showQuickPick([newNotebookCSharp, newNotebookFSharp, newNotebookPowerShell], { title: 'Default Language' });
            if (!notebookLanguage) {
                return;
            }
            const ipynbLanguageName = ipynbUtilities.mapIpynbLanguageName(notebookLanguage);
            const cellMetadata = {
                custom: {
                    metadata: {
                        dotnet_interactive: {
                            language: ipynbLanguageName
                        }
                    }
                }
            };
            const cell = new vscode.NotebookCellData(vscode.NotebookCellKind.Code, '', `dotnet-interactive.${ipynbLanguageName}`);
            cell.metadata = cellMetadata;
            const documentMetadata = {
                custom: {
                    metadata: {
                        kernelspec: {
                            display_name: `.NET (${notebookLanguage})`,
                            language: notebookLanguage,
                            name: `.net-${ipynbLanguageName}`
                        },
                        language_info: {
                            name: notebookLanguage
                        }
                    }
                }
            };
            const content = new vscode.NotebookData([cell]);
            content.metadata = documentMetadata;
            const notebook = yield vscode.workspace.openNotebookDocument(viewType, content);
            // The document metadata isn't preserved from the previous call.  This is addressed in the following issues:
            // - https://github.com/microsoft/vscode-jupyter/issues/6187
            // - https://github.com/microsoft/vscode-jupyter/issues/5622
            // In the meantime, the metadata can be set again to ensure it's persisted.
            const _succeeded = yield versionSpecificFunctions.replaceNotebookMetadata(notebook.uri, documentMetadata);
            const _editor = yield vscode.window.showNotebookDocument(notebook);
        });
    }
    if (!(0, vscodeUtilities_1.isAzureDataStudio)(context)) {
        context.subscriptions.push(vscode.commands.registerCommand('dotnet-interactive.openNotebook', (notebookUri) => __awaiter(this, void 0, void 0, function* () {
            // ensure we have a notebook uri
            if (!notebookUri) {
                const uris = yield vscode.window.showOpenDialog({
                    filters: notebookFileFilters
                });
                if (uris && uris.length > 0) {
                    notebookUri = uris[0];
                }
                if (!notebookUri) {
                    // no appropriate uri
                    return;
                }
            }
            yield openNotebook(notebookUri);
        })));
    }
    function openNotebook(uri) {
        return __awaiter(this, void 0, void 0, function* () {
            const extension = path.extname(uri.toString());
            const viewType = extension === '.dib' || extension === '.dotnet-interactive'
                ? 'dotnet-interactive'
                : interactiveNotebook_1.jupyterViewType;
            yield vscode.commands.executeCommand('vscode.openWith', uri, viewType);
        });
    }
    if (!(0, vscodeUtilities_1.isAzureDataStudio)(context)) {
        context.subscriptions.push(vscode.commands.registerCommand('dotnet-interactive.saveAsNotebook', () => __awaiter(this, void 0, void 0, function* () {
            if (vscode.window.activeNotebookEditor) {
                const uri = yield vscode.window.showSaveDialog({
                    filters: notebookFileFilters
                });
                if (!uri) {
                    return;
                }
                const notebook = versionSpecificFunctions.getNotebookDocumentFromEditor(vscode.window.activeNotebookEditor);
                const interactiveDocument = (0, vscodeUtilities_1.toNotebookDocument)(notebook);
                const uriPath = uri.toString();
                const extension = path.extname(uriPath);
                const documentType = (0, utilities_1.extensionToDocumentType)(extension);
                const buffer = yield parserServer.serializeNotebook(documentType, eol, interactiveDocument);
                yield vscode.workspace.fs.writeFile(uri, buffer);
                switch (path.extname(uriPath)) {
                    case '.dib':
                    case '.dotnet-interactive':
                        yield vscode.commands.executeCommand('dotnet-interactive.openNotebook', uri);
                        break;
                }
            }
        })));
    }
    if (!(0, vscodeUtilities_1.isAzureDataStudio)(context)) {
        context.subscriptions.push(vscode.commands.registerCommand('dotnet-interactive.createNewInteractive', () => __awaiter(this, void 0, void 0, function* () {
            const interactiveOpenArgs = [
                {},
                undefined,
                `${context.extension.id}/dotnet-interactive-window`,
                '.NET Interactive', // title
            ];
            const result = (yield vscode.commands.executeCommand('interactive.open', ...interactiveOpenArgs));
            if (result && result.notebookUri && typeof result.notebookUri.toString === 'function') {
                // this looks suspiciously like a uri, let's pre-load the backing process
                clientMapper.getOrAddClient(result.notebookUri.toString());
            }
        })));
    }
}
exports.registerFileCommands = registerFileCommands;
function selectDotNetInteractiveKernelForJupyter() {
    return __awaiter(this, void 0, void 0, function* () {
        const extension = 'ms-dotnettools.dotnet-interactive-vscode';
        const id = extension_1.KernelIdForJupyter;
        yield vscode.commands.executeCommand('notebook.selectKernel', { extension, id });
    });
}
exports.selectDotNetInteractiveKernelForJupyter = selectDotNetInteractiveKernelForJupyter;
// callbacks used to install interactive tool
function getInteractiveVersion(dotnetPath, globalStoragePath) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield (0, utilities_1.executeSafe)(dotnetPath, ['tool', 'run', 'dotnet-interactive', '--', '--version'], globalStoragePath);
        if (result.code === 0) {
            const versionString = (0, utilities_1.getVersionNumber)(result.output);
            return versionString;
        }
        return undefined;
    });
}
//# sourceMappingURL=commands.js.map