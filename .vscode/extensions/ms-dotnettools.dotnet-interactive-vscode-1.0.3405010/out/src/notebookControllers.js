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
exports.endExecution = exports.updateCellLanguages = exports.DotNetNotebookKernel = void 0;
const vscode = require("vscode");
const contracts = require("./vscode-common/dotnet-interactive/contracts");
const diagnostics = require("./vscode-common/diagnostics");
const vscodeUtilities = require("./vscode-common/vscodeUtilities");
const interactiveNotebook_1 = require("./vscode-common/interactiveNotebook");
const ipynbUtilities_1 = require("./vscode-common/ipynbUtilities");
const utilities_1 = require("./vscode-common/interfaces/utilities");
const commands_1 = require("./vscode-common/commands");
const logger_1 = require("./vscode-common/dotnet-interactive/logger");
const notebookMessageHandler = require("./vscode-common/notebookMessageHandler");
const executionTasks = new Map();
const viewType = 'dotnet-interactive';
const legacyViewType = 'dotnet-interactive-legacy';
class DotNetNotebookKernel {
    constructor(config) {
        this.config = config;
        this.disposables = [];
        this.uriMessageHandlerMap = new Map();
        const preloads = config.preloadUris.map(uri => new vscode.NotebookRendererScript(uri));
        // .dib execution
        const dibController = vscode.notebooks.createNotebookController('dotnet-interactive', viewType, '.NET Interactive', this.executeHandler.bind(this), preloads);
        this.commonControllerInit(dibController);
        // .dotnet-interactive execution
        const legacyController = vscode.notebooks.createNotebookController('dotnet-interactive-legacy', legacyViewType, '.NET Interactive', this.executeHandler.bind(this), preloads);
        this.commonControllerInit(legacyController);
        // .ipynb execution via Jupyter extension (optional)
        const jupyterController = vscode.notebooks.createNotebookController('dotnet-interactive-for-jupyter', interactiveNotebook_1.jupyterViewType, '.NET Interactive', this.executeHandler.bind(this), preloads);
        jupyterController.onDidChangeSelectedNotebooks((e) => __awaiter(this, void 0, void 0, function* () {
            // update metadata
            if (e.selected) {
                yield updateNotebookMetadata(e.notebook, this.config.clientMapper);
            }
        }));
        this.commonControllerInit(jupyterController);
        // interactive window controller
        const interactiveController = vscode.notebooks.createNotebookController('dotnet-interactive-window', 'interactive', '.NET Interactive', this.executeHandler.bind(this), preloads);
        this.commonControllerInit(interactiveController);
        this.disposables.push(vscode.workspace.onDidOpenNotebookDocument((notebook) => __awaiter(this, void 0, void 0, function* () {
            if (isDotNetNotebook(notebook)) {
                // eagerly spin up the backing process
                const _client = yield config.clientMapper.getOrAddClient(notebook.uri);
                if (notebook.notebookType === interactiveNotebook_1.jupyterViewType) {
                    jupyterController.updateNotebookAffinity(notebook, vscode.NotebookControllerAffinity.Preferred);
                    yield (0, commands_1.selectDotNetInteractiveKernelForJupyter)();
                    yield updateNotebookMetadata(notebook, this.config.clientMapper);
                }
            }
        })));
    }
    dispose() {
        this.disposables.forEach(d => d.dispose());
    }
    commonControllerInit(controller) {
        controller.supportedLanguages = interactiveNotebook_1.notebookCellLanguages;
        this.disposables.push(controller.onDidReceiveMessage(e => {
            const notebookUri = e.editor.notebook.uri;
            const notebookUriString = notebookUri.toString();
            if (e.message.envelope) {
                let messageHandler = this.uriMessageHandlerMap.get(notebookUriString);
                messageHandler === null || messageHandler === void 0 ? void 0 : messageHandler.next(e.message.envelope);
            }
            switch (e.message.preloadCommand) {
                case '#!connect':
                    this.config.clientMapper.getOrAddClient(notebookUri).then(() => {
                        notebookMessageHandler.hashBangConnect(this.config.clientMapper, this.uriMessageHandlerMap, (arg) => controller.postMessage(arg), notebookUri);
                    });
                    break;
            }
            if (e.message.logEntry) {
                logger_1.Logger.default.write(e.message.logEntry);
            }
        }));
        this.disposables.push(controller);
    }
    executeHandler(cells, document, controller) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const cell of cells) {
                yield this.executeCell(cell, controller);
            }
        });
    }
    executeCell(cell, controller) {
        return __awaiter(this, void 0, void 0, function* () {
            const executionTask = controller.createNotebookCellExecution(cell);
            if (executionTask) {
                executionTasks.set(cell.document.uri.toString(), executionTask);
                let outputUpdatePromise = Promise.resolve();
                try {
                    const startTime = Date.now();
                    executionTask.start(startTime);
                    yield executionTask.clearOutput(cell);
                    const controllerErrors = [];
                    function outputObserver(outputs) {
                        outputUpdatePromise = outputUpdatePromise.catch(ex => {
                            console.error('Failed to update output', ex);
                        }).finally(() => updateCellOutputs(executionTask, [...outputs]));
                    }
                    const client = yield this.config.clientMapper.getOrAddClient(cell.notebook.uri);
                    executionTask.token.onCancellationRequested(() => {
                        client.cancel().catch((err) => __awaiter(this, void 0, void 0, function* () {
                            // command failed to cancel
                            const cancelFailureMessage = typeof (err === null || err === void 0 ? void 0 : err.message) === 'string' ? err.message : '' + err;
                            const errorOutput = new vscode.NotebookCellOutput(this.config.createErrorOutput(cancelFailureMessage).items.map(oi => generateVsCodeNotebookCellOutputItem(oi.data, oi.mime, oi.stream)));
                            yield executionTask.appendOutput(errorOutput);
                        }));
                    });
                    const source = cell.document.getText();
                    const diagnosticCollection = diagnostics.getDiagnosticCollection(cell.document.uri);
                    function diagnosticObserver(diags) {
                        diagnosticCollection.set(cell.document.uri, diags.filter(d => d.severity !== contracts.DiagnosticSeverity.Hidden).map(vscodeUtilities.toVsCodeDiagnostic));
                    }
                    return client.execute(source, (0, interactiveNotebook_1.getSimpleLanguage)(cell.document.languageId), outputObserver, diagnosticObserver, { id: cell.document.uri.toString() }).then(() => __awaiter(this, void 0, void 0, function* () {
                        yield outputUpdatePromise;
                        endExecution(cell, true);
                    })).catch(() => __awaiter(this, void 0, void 0, function* () {
                        yield outputUpdatePromise;
                        endExecution(cell, false);
                    }));
                }
                catch (err) {
                    const errorOutput = new vscode.NotebookCellOutput(this.config.createErrorOutput(`Error executing cell: ${err}`).items.map(oi => generateVsCodeNotebookCellOutputItem(oi.data, oi.mime, oi.stream)));
                    yield executionTask.appendOutput(errorOutput);
                    yield outputUpdatePromise;
                    endExecution(cell, false);
                    throw err;
                }
            }
        });
    }
}
exports.DotNetNotebookKernel = DotNetNotebookKernel;
function updateNotebookMetadata(notebook, clientMapper) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // update various metadata
            yield updateDocumentKernelspecMetadata(notebook);
            yield updateCellLanguages(notebook);
            // force creation of the client so we don't have to wait for the user to execute a cell to get the tool
            yield clientMapper.getOrAddClient(notebook.uri);
        }
        catch (err) {
            vscode.window.showErrorMessage(`Failed to set document metadata for '${notebook.uri}': ${err}`);
        }
    });
}
function updateCellLanguages(document) {
    return __awaiter(this, void 0, void 0, function* () {
        const documentLanguageInfo = (0, ipynbUtilities_1.getLanguageInfoMetadata)(document.metadata);
        // update cell language
        yield Promise.all(document.getCells().map((cell) => __awaiter(this, void 0, void 0, function* () {
            const cellMetadata = (0, ipynbUtilities_1.getDotNetMetadata)(cell.metadata);
            const cellText = cell.document.getText();
            const newLanguage = cell.kind === vscode.NotebookCellKind.Code
                ? (0, ipynbUtilities_1.getCellLanguage)(cellText, cellMetadata, documentLanguageInfo, cell.document.languageId)
                : 'markdown';
            if (cell.document.languageId !== newLanguage) {
                yield vscode.languages.setTextDocumentLanguage(cell.document, newLanguage);
            }
        })));
    });
}
exports.updateCellLanguages = updateCellLanguages;
function updateCellOutputs(executionTask, outputs) {
    return __awaiter(this, void 0, void 0, function* () {
        const streamMimetypes = ['application/vnd.code.notebook.stderr', 'application/vnd.code.notebook.stdout'];
        const reshapedOutputs = [];
        outputs.forEach((o) => __awaiter(this, void 0, void 0, function* () {
            if (o.items.length > 1) {
                // multi mimeType outputs should not be processed
                reshapedOutputs.push(new vscode.NotebookCellOutput(o.items));
            }
            else {
                // If current nad previous items are of the same stream type then append currentItem to previousOutput.
                const currentItem = generateVsCodeNotebookCellOutputItem(o.items[0].data, o.items[0].mime, o.items[0].stream);
                const previousOutput = reshapedOutputs.length ? reshapedOutputs[reshapedOutputs.length - 1] : undefined;
                const previousOutputItem = (previousOutput === null || previousOutput === void 0 ? void 0 : previousOutput.items.length) === 1 ? previousOutput.items[0] : undefined;
                if (previousOutput && (previousOutputItem === null || previousOutputItem === void 0 ? void 0 : previousOutputItem.mime) && streamMimetypes.includes(previousOutputItem === null || previousOutputItem === void 0 ? void 0 : previousOutputItem.mime) && streamMimetypes.includes(currentItem.mime)) {
                    const decoder = new TextDecoder();
                    const newText = `${decoder.decode(previousOutputItem.data)}${decoder.decode(currentItem.data)}`;
                    const newItem = previousOutputItem.mime === 'application/vnd.code.notebook.stderr' ? vscode.NotebookCellOutputItem.stderr(newText) : vscode.NotebookCellOutputItem.stdout(newText);
                    previousOutput.items[previousOutput.items.length - 1] = newItem;
                }
                else {
                    reshapedOutputs.push(new vscode.NotebookCellOutput([currentItem]));
                }
            }
        }));
        yield executionTask.replaceOutput(reshapedOutputs);
    });
}
function endExecution(cell, success) {
    const key = cell.document.uri.toString();
    const executionTask = executionTasks.get(key);
    if (executionTask) {
        executionTasks.delete(key);
        const endTime = Date.now();
        executionTask.end(success, endTime);
    }
}
exports.endExecution = endExecution;
function generateVsCodeNotebookCellOutputItem(data, mime, stream) {
    const displayData = (0, utilities_1.reshapeOutputValueForVsCode)(data, mime);
    switch (stream) {
        case 'stdout':
            return vscode.NotebookCellOutputItem.stdout(new TextDecoder().decode(displayData));
        case 'stderr':
            return vscode.NotebookCellOutputItem.stderr(new TextDecoder().decode(displayData));
        default:
            return new vscode.NotebookCellOutputItem(displayData, mime);
    }
}
function updateDocumentKernelspecMetadata(document) {
    return __awaiter(this, void 0, void 0, function* () {
        const documentKernelMetadata = (0, ipynbUtilities_1.withDotNetKernelMetadata)(document.metadata);
        const notebookEdit = vscode.NotebookEdit.updateNotebookMetadata(documentKernelMetadata);
        const edit = new vscode.WorkspaceEdit();
        edit.set(document.uri, [notebookEdit]);
        yield vscode.workspace.applyEdit(edit);
    });
}
function isDotNetNotebook(notebook) {
    if (notebook.uri.toString().endsWith('.dib')) {
        return true;
    }
    if ((0, ipynbUtilities_1.isDotNetNotebookMetadata)(notebook.metadata)) {
        // metadata looked correct
        return true;
    }
    if (notebook.uri.scheme === 'untitled' && notebook.cellCount === 1) {
        // untitled with a single cell, check cell
        const cell = notebook.cellAt(0);
        if ((0, interactiveNotebook_1.isDotnetInteractiveLanguage)(cell.document.languageId) && cell.document.getText() === '') {
            // language was one of ours and cell was emtpy
            return true;
        }
    }
    // doesn't look like us
    return false;
}
//# sourceMappingURL=notebookControllers.js.map