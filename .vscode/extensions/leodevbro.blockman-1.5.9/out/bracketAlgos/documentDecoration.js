"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const lineState_1 = require("./lineState");
const textLine_1 = require("./textLine");
const vscodeFiles_1 = require("./vscodeFiles");
// import { TextDocumentContentChangeEvent } from "vscode";
const extension_1 = require("../extension");
const utils2_1 = require("../utils2");
// let refresherTimeout: NodeJS.Timeout | undefined = undefined;
let leakCleanTimeoutStarted = false;
class DocumentDecoration {
    constructor(document, config, settings) {
        // This program caches lines, and will only analyze linenumbers including or above a modified line
        this.lines = [];
        this.scopeDecorations = [];
        this.scopeSelectionHistory = [];
        this.settings = settings;
        this.document = document;
        this.languageConfig = config;
    }
    dispose() {
        this.disposeScopeDecorations();
    }
    // Lines are stored in an array, if line is requested outside of array bounds
    // add emptys lines until array is correctly sized
    getLine(index, state) {
        if (index < this.lines.length) {
            return this.lines[index];
        }
        else {
            if (this.lines.length === 0) {
                this.lines.push(new textLine_1.default(state, new lineState_1.default(this.settings, this.languageConfig), 0));
            }
            if (index < this.lines.length) {
                return this.lines[index];
            }
            if (index === this.lines.length) {
                const previousLine = this.lines[this.lines.length - 1];
                const newLine = new textLine_1.default(state, previousLine.cloneState(), index);
                this.lines.push(newLine);
                return newLine;
            }
            throw new Error("Cannot look more than one line ahead");
        }
    }
    tokenizeDocument(editorInfo) {
        // console.log("Tokenizing " + this.document.fileName);
        // One document may be shared by multiple editors (side by side view)
        const editors = vscode.window.visibleTextEditors.filter((e) => this.document === e.document);
        if (editors.length === 0) {
            console.warn("No editors associated with document: " +
                this.document.fileName);
            // if (refresherTimeout) {
            // clearTimeout(refresherTimeout); // maybe it's better without it
            // }
            // refresherTimeout = setTimeout(() => {
            // console.log("before if");
            if (!leakCleanTimeoutStarted) {
                // console.log("after if");
                leakCleanTimeoutStarted = true;
                setTimeout(() => {
                    leakCleanTimeoutStarted = false;
                    // junkDecors3dArr.push(editorInfo.decors);
                    utils2_1.nukeJunkDecorations();
                    utils2_1.nukeAllDecs();
                    extension_1.updateAllControlledEditors({
                        alsoStillVisibleAndHist: true,
                    });
                }, 20000);
            }
            return [];
        }
        // console.time("tokenizeDocument");
        this.lines = [];
        const lineIndex = this.lines.length;
        const lineCount = this.document.lineCount;
        if (lineIndex < lineCount) {
            // console.log("Reparse from line: " + (lineIndex + 1));
            for (let i = lineIndex; i < lineCount; i++) {
                const newLine = this.tokenizeLine(i, editorInfo);
                this.lines.push(newLine);
            }
        }
        // console.log("Coloring document");
        // IMPORTANT
        let myBrackets = [];
        for (const line of this.lines) {
            const brackets = line.getAllBrackets();
            for (const bracket of brackets) {
                myBrackets.push({
                    char: bracket.token.character,
                    type: bracket.token.type,
                    inLineIndexZero: bracket.token.range.start.character,
                    lineZero: bracket.token.range.start.line,
                });
            }
        }
        // console.log("myBrackets:", myBrackets);
        return myBrackets;
        // IMPORTANT GO GO GO
        // this.colorDecorations(editors);
        // console.timeEnd("tokenizeDocument");
    }
    tokenizeLine(index, editorInfo) {
        // const originalLine = this.document.lineAt(index).text;
        const monoLine = editorInfo.monoText.slice(editorInfo.textLinesMap[index], editorInfo.textLinesMap[index + 1]);
        // console.log(`originalLine->${originalLine}`);
        // tabsIntoSpaces
        // let tabsize = 4;
        // if (typeof editorInfo.editorRef.options.tabSize === "number") {
        //     tabsize = editorInfo.editorRef.options.tabSize;
        // }
        // let preparedLineText = originalLine;
        // if (this.document.eol === 2) {
        //     preparedLineText = preparedLineText.replace(/\r/g, ``); // may be needed, LF, CRLF
        // }
        // preparedLineText = tabsIntoSpaces(preparedLineText, tabsize);
        // if (glo.trySupportDoubleWidthChars) {
        //     preparedLineText = preparedLineText.replace(
        //         doubleWidthCharsReg,
        //         "Z_",
        //     );
        // }
        const newText = monoLine;
        const previousLineRuleStack = index > 0 ? this.lines[index - 1].getRuleStack() : undefined;
        const previousLineState = index > 0
            ? this.lines[index - 1].cloneState()
            : new lineState_1.default(this.settings, this.languageConfig);
        const tokenized = this.languageConfig.grammar.tokenizeLine2(newText, previousLineRuleStack);
        const tokens = tokenized.tokens;
        const lineTokens = new vscodeFiles_1.LineTokens(tokens, newText);
        const matches = new Array();
        const count = lineTokens.getCount();
        for (let i = 0; i < count; i++) {
            const tokenType = lineTokens.getStandardTokenType(i);
            if (!vscodeFiles_1.ignoreBracketsInToken(tokenType)) {
                const searchStartOffset = tokens[i * 2];
                const searchEndOffset = i < count ? tokens[(i + 1) * 2] : newText.length;
                const currentTokenText = newText.substring(searchStartOffset, searchEndOffset);
                let result;
                // tslint:disable-next-line:no-conditional-assignment
                while ((result =
                    this.languageConfig.regex.exec(currentTokenText)) !==
                    null) {
                    matches.push({
                        content: result[0],
                        index: result.index + searchStartOffset,
                    });
                }
            }
        }
        const newLine = new textLine_1.default(tokenized.ruleStack, previousLineState, index);
        for (const match of matches) {
            const lookup = this.languageConfig.bracketToId.get(match.content);
            if (lookup) {
                newLine.AddToken(match.content, match.index, lookup.key, lookup.open);
            }
        }
        return newLine;
    }
    disposeScopeDecorations() {
        for (const decoration of this.scopeDecorations) {
            decoration.dispose();
        }
        this.scopeDecorations = [];
    }
    searchScopeForwards(position) {
        for (let i = position.line; i < this.lines.length; i++) {
            const endBracket = this.lines[i].getClosingBracket(position);
            if (endBracket) {
                return endBracket;
            }
        }
    }
    calculateColumnFromCharIndex(lineText, charIndex, tabSize) {
        let spacing = 0;
        for (let index = 0; index < charIndex; index++) {
            if (lineText.charAt(index) === "\t") {
                spacing += tabSize - (spacing % tabSize);
            }
            else {
                spacing++;
            }
        }
        return spacing;
    }
    calculateCharIndexFromColumn(lineText, column, tabSize) {
        let spacing = 0;
        for (let index = 0; index <= column; index++) {
            if (spacing >= column) {
                return index;
            }
            if (lineText.charAt(index) === "\t") {
                spacing += tabSize - (spacing % tabSize);
            }
            else {
                spacing++;
            }
        }
        return spacing;
    }
}
exports.default = DocumentDecoration;
//# sourceMappingURL=documentDecoration.js.map