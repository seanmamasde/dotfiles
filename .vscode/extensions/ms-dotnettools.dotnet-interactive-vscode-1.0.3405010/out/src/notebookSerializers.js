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
exports.createAndRegisterNotebookSerializers = void 0;
const vscode = require("vscode");
const contracts = require("./vscode-common/dotnet-interactive/contracts");
const utilities = require("./vscode-common/interfaces/utilities");
const vscodeLike = require("./vscode-common/interfaces/vscode-like");
const interactiveNotebook_1 = require("./vscode-common/interactiveNotebook");
const vscodeUtilities_1 = require("./vscode-common/vscodeUtilities");
function toInteractiveDocumentElement(cell) {
    var _a, _b;
    const outputs = cell.outputs || [];
    return {
        executionOrder: (_b = (_a = cell.executionSummary) === null || _a === void 0 ? void 0 : _a.executionOrder) !== null && _b !== void 0 ? _b : 0,
        language: (0, interactiveNotebook_1.getSimpleLanguage)(cell.languageId),
        contents: cell.value,
        outputs: outputs.map(vscodeUtilities_1.vsCodeCellOutputToContractCellOutput)
    };
}
function deserializeNotebookByType(parserServer, serializationType, rawData) {
    return __awaiter(this, void 0, void 0, function* () {
        const interactiveDocument = yield parserServer.parseInteractiveDocument(serializationType, rawData);
        const notebookData = {
            cells: interactiveDocument.elements.map(toVsCodeNotebookCellData)
        };
        return notebookData;
    });
}
function serializeNotebookByType(parserServer, serializationType, eol, data) {
    return __awaiter(this, void 0, void 0, function* () {
        const interactiveDocument = {
            elements: data.cells.map(toInteractiveDocumentElement),
            metadata: {}
        };
        const rawData = yield parserServer.serializeNotebook(serializationType, eol, interactiveDocument);
        return rawData;
    });
}
function createAndRegisterNotebookSerializers(context, parserServer) {
    const eol = (0, vscodeUtilities_1.getEol)();
    const createAndRegisterSerializer = (serializationType, notebookType) => {
        const serializer = {
            deserializeNotebook(content, _token) {
                return deserializeNotebookByType(parserServer, serializationType, content);
            },
            serializeNotebook(data, _token) {
                return serializeNotebookByType(parserServer, serializationType, eol, data);
            },
        };
        const notebookSerializer = vscode.workspace.registerNotebookSerializer(notebookType, serializer);
        context.subscriptions.push(notebookSerializer);
        return serializer;
    };
    const serializers = new Map();
    serializers.set('dotnet-interactive', createAndRegisterSerializer(contracts.DocumentSerializationType.Dib, 'dotnet-interactive'));
    serializers.set('jupyter-notebook', createAndRegisterSerializer(contracts.DocumentSerializationType.Ipynb, 'dotnet-interactive-jupyter'));
    return serializers;
}
exports.createAndRegisterNotebookSerializers = createAndRegisterNotebookSerializers;
function toVsCodeNotebookCellData(cell) {
    const cellData = new vscode.NotebookCellData((0, interactiveNotebook_1.languageToCellKind)(cell.language), cell.contents, (0, interactiveNotebook_1.getNotebookSpecificLanguage)(cell.language));
    cellData.outputs = cell.outputs.map(outputElementToVsCodeCellOutput);
    return cellData;
}
function outputElementToVsCodeCellOutput(output) {
    const outputItems = [];
    if (utilities.isDisplayOutput(output)) {
        for (const mimeKey in output.data) {
            outputItems.push(generateVsCodeNotebookCellOutputItem(output.data[mimeKey], mimeKey));
        }
    }
    else if (utilities.isErrorOutput(output)) {
        outputItems.push(generateVsCodeNotebookCellOutputItem(output.errorValue, vscodeLike.ErrorOutputMimeType));
    }
    else if (utilities.isTextOutput(output)) {
        outputItems.push(generateVsCodeNotebookCellOutputItem(output.text, 'text/plain'));
    }
    return new vscode.NotebookCellOutput(outputItems);
}
function generateVsCodeNotebookCellOutputItem(value, mime) {
    const displayValue = utilities.reshapeOutputValueForVsCode(value, mime);
    return new vscode.NotebookCellOutputItem(displayValue, mime);
}
//# sourceMappingURL=notebookSerializers.js.map