"use strict";
// Copyright (c) .NET Foundation and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.vsCodeCellOutputToContractCellOutput = exports.toInteractiveDocumentElement = exports.toNotebookDocument = exports.getEol = exports.toVsCodeDiagnostic = exports.convertToRange = exports.isAzureDataStudio = exports.isStableBuild = exports.isInsidersBuild = void 0;
const os = require("os");
const vscode = require("vscode");
const interfaces_1 = require("./interfaces");
const contracts_1 = require("./dotnet-interactive/contracts");
const interactiveNotebook_1 = require("./interactiveNotebook");
const vscodeLike = require("./interfaces/vscode-like");
function isInsidersBuild() {
    return vscode.version.indexOf('-insider') >= 0;
}
exports.isInsidersBuild = isInsidersBuild;
function isStableBuild() {
    return !isInsidersBuild();
}
exports.isStableBuild = isStableBuild;
function isAzureDataStudio(context) {
    var _a;
    return (_a = context.extension.packageJSON) === null || _a === void 0 ? void 0 : _a.azureDataStudioMode;
}
exports.isAzureDataStudio = isAzureDataStudio;
function convertToPosition(linePosition) {
    return new vscode.Position(linePosition.line, linePosition.character);
}
function convertToRange(linePositionSpan) {
    if (linePositionSpan === undefined) {
        return undefined;
    }
    return new vscode.Range(convertToPosition(linePositionSpan.start), convertToPosition(linePositionSpan.end));
}
exports.convertToRange = convertToRange;
function toVsCodeDiagnostic(diagnostic) {
    return {
        range: convertToRange(diagnostic.linePositionSpan),
        message: diagnostic.message,
        severity: toDiagnosticSeverity(diagnostic.severity)
    };
}
exports.toVsCodeDiagnostic = toVsCodeDiagnostic;
function toDiagnosticSeverity(severity) {
    switch (severity) {
        case contracts_1.DiagnosticSeverity.Error:
            return vscode.DiagnosticSeverity.Error;
        case contracts_1.DiagnosticSeverity.Info:
            return vscode.DiagnosticSeverity.Information;
        case contracts_1.DiagnosticSeverity.Warning:
            return vscode.DiagnosticSeverity.Warning;
        default:
            return vscode.DiagnosticSeverity.Error;
    }
}
function getEol() {
    const fileConfig = vscode.workspace.getConfiguration('files');
    const eol = fileConfig.get('eol');
    switch (eol) {
        case interfaces_1.NonWindowsEol:
            return interfaces_1.NonWindowsEol;
        case interfaces_1.WindowsEol:
            return interfaces_1.WindowsEol;
        default:
            // could be `undefined` or 'auto'
            if (os.platform() === 'win32') {
                return interfaces_1.WindowsEol;
            }
            else {
                return interfaces_1.NonWindowsEol;
            }
    }
}
exports.getEol = getEol;
function toNotebookDocument(document) {
    return {
        elements: document.getCells().map(toInteractiveDocumentElement),
        metadata: document.metadata
    };
}
exports.toNotebookDocument = toNotebookDocument;
function toInteractiveDocumentElement(cell) {
    var _a, _b;
    return {
        executionOrder: (_b = (_a = cell.executionSummary) === null || _a === void 0 ? void 0 : _a.executionOrder) !== null && _b !== void 0 ? _b : 0,
        language: cell.kind === vscode.NotebookCellKind.Code
            ? (0, interactiveNotebook_1.getSimpleLanguage)(cell.document.languageId)
            : 'markdown',
        contents: cell.document.getText(),
        outputs: cell.outputs.map(vsCodeCellOutputToContractCellOutput)
    };
}
exports.toInteractiveDocumentElement = toInteractiveDocumentElement;
function vsCodeCellOutputToContractCellOutput(output) {
    const outputItems = output.items;
    const errorOutputItems = outputItems.filter(oi => oi.mime === vscodeLike.ErrorOutputMimeType);
    if (errorOutputItems.length > 0) {
        // any error-like output takes precedence
        const errorOutputItem = errorOutputItems[0];
        const error = {
            errorName: 'Error',
            errorValue: '' + errorOutputItem.data,
            stackTrace: [],
        };
        return error;
    }
    else {
        //otherwise build the mime=>value dictionary
        const data = {};
        for (const outputItem of outputItems) {
            data[outputItem.mime] = outputItem.data;
        }
        const cellOutput = {
            data,
            metadata: {}
        };
        return cellOutput;
    }
}
exports.vsCodeCellOutputToContractCellOutput = vsCodeCellOutputToContractCellOutput;
//# sourceMappingURL=vscodeUtilities.js.map