"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.yamlFn = void 0;
const utils_1 = require("../utils");
const YAML = require("yaml");
// @ts-ignore
const traverse = require("ast-traverse");
const python_algo_1 = require("../pythonAlgos/python-algo");
const yamlAstMaker = YAML.parseDocument;
const nearestLeftNonSpaceIsNewLineChar = (txt, initialIndex) => {
    if (initialIndex < 1) {
        return false;
    }
    for (let i = initialIndex - 1; i >= 0; i -= 1) {
        if (![" ", "\n"].includes(txt[i])) {
            return false;
        }
        if (txt[i] === "\n") {
            return true;
        }
    }
    return false;
};
const yamlFn = (yamlTextInput, editorInfo) => {
    // const newText = yamlTextInput + "\n\n\n";
    const newText = yamlTextInput;
    let lMap = editorInfo.textLinesMap;
    const originalLastInd = newText.length - 1;
    const yamlAst = yamlAstMaker(newText);
    let myTokens = [];
    traverse(yamlAst, {
        pre: function (node, parent, prop, idx) {
            const range = node.range;
            if (!!range) {
                const [starter, ender] = range;
                if (!"{}[]".includes(newText[ender])) {
                    // excluding bracket blocks by Yaml tokenizer, because has issues,
                    // but we still get bracket blocks from global bracket tokenizer
                    const starterLeftNonSpaceIsNlChar = nearestLeftNonSpaceIsNewLineChar(newText, starter);
                    const enderLeftNonSpaceIsNlChar = nearestLeftNonSpaceIsNewLineChar(newText, ender);
                    if (enderLeftNonSpaceIsNlChar &&
                        starterLeftNonSpaceIsNlChar) {
                        myTokens.push(range);
                    }
                }
            }
        },
    });
    const blockOpenersClosers = [];
    myTokens = myTokens.filter((x) => {
        const opener = x[0];
        const { inLineIndexZero } = utils_1.findLineZeroAndInLineIndexZero({
            globalIndexZero: opener,
            editorInfo,
        });
        return inLineIndexZero !== 0;
    });
    // console.log(myTokens);
    myTokens.map((x) => {
        // if (x[0] > 27) {
        //     return;
        // }
        if (x[0]) {
            const tokenGlo = x[0] - 1;
            const { lineZero: tokenLine } = utils_1.findLineZeroAndInLineIndexZero({
                globalIndexZero: tokenGlo,
                editorInfo,
            });
            const realLineZero = python_algo_1.findUpperNonCommentLineZero(newText, tokenLine, lMap);
            const globalIndexZero = lMap[realLineZero + 1] - 1;
            const { inLineIndexZero } = utils_1.findLineZeroAndInLineIndexZero({
                globalIndexZero,
                editorInfo,
            });
            blockOpenersClosers.push({
                globalIndexZero,
                lineZero: realLineZero,
                inLineIndexZero,
                type: "s",
            });
        }
        if (x[1]) {
            const tokenGlo = x[1];
            const { lineZero: tokenLine } = utils_1.findLineZeroAndInLineIndexZero({
                globalIndexZero: tokenGlo,
                editorInfo,
            });
            let realLineZero = python_algo_1.findUpperNonCommentLineZero(newText, tokenLine, lMap) + 1;
            const globalIndexZero = lMap[realLineZero] - 1;
            const { inLineIndexZero } = utils_1.findLineZeroAndInLineIndexZero({
                globalIndexZero,
                editorInfo,
            });
            blockOpenersClosers.push({
                globalIndexZero,
                lineZero: realLineZero - 1,
                inLineIndexZero,
                type: "e",
            });
        }
    });
    return blockOpenersClosers;
};
exports.yamlFn = yamlFn;
//# sourceMappingURL=yaml-algo.js.map