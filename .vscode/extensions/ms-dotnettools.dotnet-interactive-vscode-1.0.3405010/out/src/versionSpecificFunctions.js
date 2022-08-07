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
exports.replaceNotebookMetadata = exports.replaceNotebookCellMetadata = exports.replaceNotebookCells = exports.getNotebookDocumentFromEditor = void 0;
const vscode = require("vscode");
function getNotebookDocumentFromEditor(notebookEditor) {
    return notebookEditor.notebook;
}
exports.getNotebookDocumentFromEditor = getNotebookDocumentFromEditor;
function replaceNotebookCells(notebookUri, range, cells) {
    return __awaiter(this, void 0, void 0, function* () {
        const notebookEdit = vscode.NotebookEdit.replaceCells(range, cells);
        const edit = new vscode.WorkspaceEdit();
        edit.set(notebookUri, [notebookEdit]);
        const succeeded = yield vscode.workspace.applyEdit(edit);
        return succeeded;
    });
}
exports.replaceNotebookCells = replaceNotebookCells;
function replaceNotebookCellMetadata(notebookUri, cellIndex, newCellMetadata) {
    return __awaiter(this, void 0, void 0, function* () {
        const notebookEdit = vscode.NotebookEdit.updateCellMetadata(cellIndex, newCellMetadata);
        const edit = new vscode.WorkspaceEdit();
        edit.set(notebookUri, [notebookEdit]);
        const succeeded = yield vscode.workspace.applyEdit(edit);
        return succeeded;
    });
}
exports.replaceNotebookCellMetadata = replaceNotebookCellMetadata;
function replaceNotebookMetadata(notebookUri, documentMetadata) {
    return __awaiter(this, void 0, void 0, function* () {
        const notebookEdit = vscode.NotebookEdit.updateNotebookMetadata(documentMetadata);
        const edit = new vscode.WorkspaceEdit();
        edit.set(notebookUri, [notebookEdit]);
        const succeeded = yield vscode.workspace.applyEdit(edit);
        return succeeded;
    });
}
exports.replaceNotebookMetadata = replaceNotebookMetadata;
//# sourceMappingURL=versionSpecificFunctions.js.map