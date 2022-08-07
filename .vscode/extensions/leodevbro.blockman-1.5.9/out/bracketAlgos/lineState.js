"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const multipleIndexes_1 = require("./multipleIndexes");
const singularIndex_1 = require("./singularIndex");
const token_1 = require("./token");
class LineState {
    constructor(settings, languageConfig, previousState) {
        this.settings = settings;
        this.languageConfig = languageConfig;
        let cM = 1;
        if (previousState !== undefined) {
            this.bracketManager = previousState.colorIndexes;
            this.previousBracketColor = previousState.previousBracketColor;
        }
        else {
            switch (cM) {
                case 0:
                    this.bracketManager = new singularIndex_1.default(settings);
                    break;
                case 1:
                    this.bracketManager = new multipleIndexes_1.default(settings, languageConfig);
                    break;
                default:
                    throw new RangeError("Not implemented enum value");
            }
        }
    }
    getBracketHash() {
        return this.bracketManager.getHash();
    }
    cloneState() {
        const clone = {
            colorIndexes: this.bracketManager.copyCumulativeState(),
            previousBracketColor: this.previousBracketColor,
        };
        return new LineState(this.settings, this.languageConfig, clone);
    }
    getClosingBracket(position) {
        return this.bracketManager.getClosingBracket(position);
    }
    offset(startIndex, amount) {
        this.bracketManager.offset(startIndex, amount);
    }
    addBracket(type, character, beginIndex, lineIndex, open) {
        const token = new token_1.default(type, character, beginIndex, lineIndex);
        if (open) {
            this.addOpenBracket(token);
        }
        else {
            this.addCloseBracket(token);
        }
    }
    getAllBrackets() {
        return this.bracketManager.getAllBrackets();
    }
    addOpenBracket(token) {
        this.bracketManager.addOpenBracket(token, 0);
    }
    addCloseBracket(token) {
        this.bracketManager.addCloseBracket(token);
    }
}
exports.default = LineState;
//# sourceMappingURL=lineState.js.map