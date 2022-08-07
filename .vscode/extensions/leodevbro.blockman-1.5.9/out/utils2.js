"use strict";
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
exports.updateRender = exports.updateFocusInfo = exports.selectFocusedBlock = exports.getLastColIndexForLineWithColorDecSpaces = exports.colorDecorsToSpacesForFile = exports.nukeJunkDecorations = exports.junkDecors3dArr = exports.nukeAllDecs = exports.notYetDisposedDecsObject = exports.calculateCharIndexFromColumn = exports.calculateColumnFromCharIndex = void 0;
const vscode_1 = require("vscode");
const vscode = require("vscode");
const extension_1 = require("./extension");
const utils_1 = require("./utils");
const regex_main_1 = require("./helpers/regex-main");
const calculateColumnFromCharIndex = (lineText, charIndex, tabSize) => {
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
};
exports.calculateColumnFromCharIndex = calculateColumnFromCharIndex;
const calculateCharIndexFromColumn = (lineText, column, tabSize) => {
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
};
exports.calculateCharIndexFromColumn = calculateCharIndexFromColumn;
exports.notYetDisposedDecsObject = {
    decs: [],
    sameFirstElementCounter: 0,
    firstDRef: undefined,
};
const nukeAllDecs = () => {
    // console.log("all nuke eeeeeeeeeeeeeeeeeeeeeeeee");
    exports.notYetDisposedDecsObject.decs.map((dec) => {
        dec.dRef.dispose();
    });
    exports.notYetDisposedDecsObject.decs.length = 0;
    exports.notYetDisposedDecsObject.decs = [];
    exports.notYetDisposedDecsObject.sameFirstElementCounter = 0;
    exports.notYetDisposedDecsObject.firstDRef = undefined;
};
exports.nukeAllDecs = nukeAllDecs;
exports.junkDecors3dArr = []; // structure for optimization, not for decor history
const nukeJunkDecorations = () => {
    exports.junkDecors3dArr.forEach((fileDecors) => {
        if (fileDecors) {
            fileDecors.forEach((lineDecors) => {
                if (lineDecors) {
                    lineDecors.forEach((depthDecors) => {
                        if (depthDecors) {
                            depthDecors.forEach((inLineInDepthInQueueInfo) => {
                                if (inLineInDepthInQueueInfo) {
                                    for (const key in inLineInDepthInQueueInfo.decorsRefs) {
                                        const decorRef = inLineInDepthInQueueInfo.decorsRefs[key];
                                        if (decorRef && decorRef !== "f") {
                                            decorRef.dispose();
                                            // for memory leak prevention
                                            exports.notYetDisposedDecsObject.decs =
                                                exports.notYetDisposedDecsObject.decs.filter((dec) => dec.dRef !== decorRef);
                                        }
                                    }
                                }
                            });
                        }
                    });
                }
            });
        }
    });
    exports.junkDecors3dArr.length = 0;
    exports.junkDecors3dArr = [];
    // OPTIMIZATION took very seriously:
    if (exports.notYetDisposedDecsObject.decs.length >= 1) {
        if (exports.notYetDisposedDecsObject.firstDRef ===
            exports.notYetDisposedDecsObject.decs[0].dRef) {
            exports.notYetDisposedDecsObject.sameFirstElementCounter += 1;
        }
        else {
            exports.notYetDisposedDecsObject.sameFirstElementCounter = 0;
            exports.notYetDisposedDecsObject.firstDRef =
                exports.notYetDisposedDecsObject.decs[0].dRef;
        }
        if (exports.notYetDisposedDecsObject.sameFirstElementCounter > 100) {
            exports.nukeAllDecs();
            extension_1.updateAllControlledEditors({ alsoStillVisibleAndHist: true });
        }
    }
};
exports.nukeJunkDecorations = nukeJunkDecorations;
const colorDecorsToSpacesForFile = (txt, editorInfo) => {
    const cDArr = editorInfo.colorDecoratorsArr;
    if (cDArr.length === 0) {
        return txt;
    }
    let textWithColorDecorSpaces = "";
    let currSplitterIndex = 0;
    // const cDAlt = glo.trySupportDoubleWidthChars ? "   " : "  ";
    const cDAlt = "  ";
    for (let i = 0; i < cDArr.length; i += 1) {
        const currSP = cDArr[i];
        const g = currSP.cDGlobalIndexZeroInMonoText;
        textWithColorDecorSpaces += txt.slice(currSplitterIndex, g) + cDAlt;
        currSplitterIndex = g;
    }
    textWithColorDecorSpaces += txt.slice(currSplitterIndex, txt.length);
    return textWithColorDecorSpaces;
};
exports.colorDecorsToSpacesForFile = colorDecorsToSpacesForFile;
const getLastColIndexForLineWithColorDecSpaces = (lineTxt, editorInfo, lineIndex, currLastColIndex) => {
    // return lineTxt;
    let withPlusOne = currLastColIndex + 1;
    const cDArr = editorInfo.colorDecoratorsArr;
    const filteredArr = cDArr.filter((x) => x.cDLineZero === lineIndex);
    if (filteredArr.length === 0) {
        return currLastColIndex;
    }
    const sortedArr = filteredArr.sort((a, b) => a.cDGlobalIndexZeroInMonoText - b.cDGlobalIndexZeroInMonoText);
    const myCount = sortedArr.filter((x) => x.cDCharZeroInMonoText <= withPlusOne).length;
    // for (let i = 0; i < sortedArr.length; i += 1) {
    //     const currSP = sortedArr[i];
    //     const col = currSP.cDCharZeroInMonoText;
    // }
    return withPlusOne + myCount * 2 - 1;
};
exports.getLastColIndexForLineWithColorDecSpaces = getLastColIndexForLineWithColorDecSpaces;
const selectFocusedBlock = () => {
    const thisEditor = vscode_1.window.activeTextEditor;
    if (thisEditor) {
        const thisEditorInfo = extension_1.infosOfControlledEditors.find((x) => x.editorRef === thisEditor);
        if (thisEditorInfo) {
            const focus = thisEditorInfo.focusDuo.curr;
            if (focus) {
                const fDepth = focus.depth;
                const fIndexInDepth = focus.indexInTheDepth;
                const renderingInfoForFullFile = thisEditorInfo.renderingInfoForFullFile;
                if (fDepth >= 1 && renderingInfoForFullFile) {
                    const masterLevels = renderingInfoForFullFile.masterLevels;
                    const allit = renderingInfoForFullFile.allit;
                    const theBlock = masterLevels[fDepth - 1][fIndexInDepth];
                    const rangeStart = allit[theBlock.s];
                    const rangeEnd = allit[theBlock.e];
                    const monoLineOfStart = thisEditorInfo.monoText.slice(thisEditorInfo.textLinesMap[rangeStart.lineZero], thisEditorInfo.textLinesMap[rangeStart.lineZero + 1]);
                    const monoLineOfEnd = thisEditorInfo.monoText.slice(thisEditorInfo.textLinesMap[rangeEnd.lineZero], thisEditorInfo.textLinesMap[rangeEnd.lineZero + 1]);
                    vscode.commands
                        .executeCommand("vscode.executeDocumentColorProvider", thisEditorInfo.editorRef.document.uri)
                        .then((dataArr) => {
                        // item.range.start.line,
                        // item.range.start.character,
                        let colorPosArr = [];
                        const arr = dataArr;
                        if (arr && arr.length >= 1) {
                            colorPosArr = arr.filter((x) => {
                                return [
                                    rangeStart.lineZero,
                                    rangeEnd.lineZero,
                                ].includes(x.range.start.line);
                            });
                            colorPosArr.sort((a, b) => a.range.start.line - b.range.start.line);
                        }
                        const sArray = colorPosArr.filter((x) => x.range.start.line === rangeStart.lineZero);
                        const eArray = colorPosArr.filter((x) => x.range.start.line === rangeEnd.lineZero);
                        let countS = 0;
                        let countE = 0;
                        sArray.map((x) => {
                            if (x.range.start.character <
                                rangeStart.inLineIndexZero) {
                                countS += 1;
                            }
                        });
                        eArray.map((x) => {
                            if (x.range.start.character <
                                rangeEnd.inLineIndexZero) {
                                countE += 1;
                            }
                        });
                        const monoInLineIndexZeroOfStart = rangeStart.inLineIndexZero + 1 - 2 * countS;
                        const monoInLineIndexZeroOfEnd = rangeEnd.inLineIndexZero - 2 * countE;
                        const currDoc = thisEditorInfo.editorRef.document;
                        const docLineOfStart = currDoc.lineAt(rangeStart.lineZero).text;
                        const docLineOfEnd = currDoc.lineAt(rangeEnd.lineZero).text;
                        let tabSize = thisEditorInfo.editorRef.options.tabSize;
                        if (typeof tabSize !== "number") {
                            tabSize = 4;
                        }
                        const docInLineCharZeroOfStart = exports.calculateCharIndexFromColumn(docLineOfStart, monoInLineIndexZeroOfStart, tabSize);
                        const docInLineCharZeroOfEnd = exports.calculateCharIndexFromColumn(docLineOfEnd, monoInLineIndexZeroOfEnd, tabSize);
                        const rangeAsArray = [
                            rangeStart.lineZero,
                            docInLineCharZeroOfStart,
                            rangeEnd.lineZero,
                            docInLineCharZeroOfEnd,
                        ];
                        thisEditor.selection = new vscode.Selection(...rangeAsArray);
                    });
                }
            }
        }
    }
};
exports.selectFocusedBlock = selectFocusedBlock;
const generateInDepthIndexesOfEachDepthFromFocus = (editorInfo) => {
    // return type is (number[] | null)[] because number is the indexInDepth for each depth
    // all "null"s from depth0 to focus (excluded)
    // and all "number[]"s from Focus to inside
    var _a;
    const currFocusBlock = editorInfo.focusDuo.curr;
    if (!currFocusBlock) {
        return null;
    }
    const levels = (_a = editorInfo.renderingInfoForFullFile) === null || _a === void 0 ? void 0 : _a.masterLevels;
    let my2dPath = [[currFocusBlock.indexInTheDepth]];
    if (!levels) {
        return null;
    }
    const superLevels = [[], ...levels];
    for (let i = currFocusBlock.depth + 1; i <= extension_1.glo.maxDepth + 3; i += 1) {
        const last1dInMyPath = my2dPath[my2dPath.length - 1];
        if (superLevels[i] && superLevels[i].length) {
            const nextInnerIndexes = superLevels[i]
                .map((x, i) => {
                return {
                    currI: i,
                    outerI: x.outerIndexInOuterLevel,
                };
            })
                .filter((y) => {
                const outer = y.outerI;
                if (typeof outer === "number" &&
                    last1dInMyPath.includes(outer)) {
                    return true;
                }
                return false;
            })
                .map((x) => x.currI);
            if (nextInnerIndexes.length) {
                my2dPath.push(nextInnerIndexes);
            }
            else {
                break;
            }
        }
        else {
            break;
        }
    }
    // if (currFocusBlock.depth + 1 !== my2dPath.length + 1) {
    //     return null;
    // }
    const starter = new Array(currFocusBlock.depth).fill(null); // not +1 because focus level is excluded
    const finalThing = [...starter, ...my2dPath];
    // return [0, ...myPath];
    return finalThing;
};
const generateFocusTreePath = (editorInfo) => {
    // return type is number[] because number is the indexInDepth for each depth from depth0 to Focus
    var _a;
    const currFocusBlock = editorInfo.focusDuo.curr;
    if (!currFocusBlock) {
        return null;
    }
    const levels = (_a = editorInfo.renderingInfoForFullFile) === null || _a === void 0 ? void 0 : _a.masterLevels;
    let myPath = [currFocusBlock.indexInTheDepth]; // reversed
    if (!levels) {
        return null;
    }
    const superLevels = [[], ...levels];
    // console.log("exla iwyeba curr outer", levels, currFocusBlock);
    for (let i = currFocusBlock.depth; i >= -3; i -= 1) {
        const firstInMyPath = myPath[0];
        if (superLevels[i] && superLevels[i][firstInMyPath]) {
            const nextOuterIndex = superLevels[i][firstInMyPath].outerIndexInOuterLevel;
            if (typeof nextOuterIndex === "number") {
                myPath.unshift(nextOuterIndex);
            }
            else {
                break;
            }
        }
        else {
            break;
        }
    }
    if (currFocusBlock.depth + 1 !== myPath.length + 1) {
        return null;
    }
    return [0, ...myPath];
};
const updateFocusInfo = (editorInfo) => {
    var _a, _b;
    if (editorInfo.focusDuo.currIsFreezed) {
        return;
    }
    const thisEditorInfo = editorInfo;
    const thisEditor = editorInfo.editorRef;
    const textLinesMap = thisEditorInfo.textLinesMap;
    const cursorPos = thisEditor.selection.active;
    const focusedLineZeroInDoc = cursorPos.line;
    const focusedColumnZeroInDoc = cursorPos.character - 1;
    // console.log("focusedLineZeroInDoc:", focusedLineZeroInDoc);
    // console.log("focusedColumnZeroInDoc:", focusedColumnZeroInDoc);
    // thisEditor.document.lineAt(cursorPos).range.end.character;
    let globalIndexZero = -1;
    // if (focusedColumnZeroInDoc === -1) {
    // if (false) {
    //     globalIndexZero = textLinesMap[focusedLineZeroInDoc] - 1 + 1;
    // } else {
    const lineTextInDocBeforeColumn = thisEditor.document
        .lineAt(cursorPos)
        .text.slice(0, focusedColumnZeroInDoc + 1);
    let lineMonoTextBeforeColumn = utils_1.tabsIntoSpaces(lineTextInDocBeforeColumn, thisEditor.options.tabSize || 4);
    if (extension_1.glo.trySupportDoubleWidthChars) {
        lineMonoTextBeforeColumn = lineMonoTextBeforeColumn.replace(regex_main_1.doubleWidthCharsReg, "Z_");
    }
    // let tabSize = 4; // default
    // const fetchedTabSize = editorInfo.editorRef.options.tabSize;
    // if (fetchedTabSize && typeof fetchedTabSize === "number") {
    //     tabSize = fetchedTabSize;
    // }
    let lastColIndex = lineMonoTextBeforeColumn.length - 1;
    if (extension_1.glo.colorDecoratorsInStyles &&
        editorInfo.colorDecoratorsArr.length >= 1) {
        lastColIndex = exports.getLastColIndexForLineWithColorDecSpaces(lineMonoTextBeforeColumn, editorInfo, focusedLineZeroInDoc, lastColIndex);
    }
    globalIndexZero = textLinesMap[focusedLineZeroInDoc] + lastColIndex;
    // }
    // gvaqvs globalIndexZero
    let candidate = { globalLength: 9999999999, depthMOeee: -1, blockInd: 0 };
    const depths = (_a = thisEditorInfo.renderingInfoForFullFile) === null || _a === void 0 ? void 0 : _a.masterLevels;
    const allit = (_b = thisEditorInfo.renderingInfoForFullFile) === null || _b === void 0 ? void 0 : _b.allit;
    if (depths && allit) {
        // let zz_sGlobal: number = -7;
        // let zz_eGlobal: number = -7;
        // depthMOeee -> depth Minus One ->> eee
        // let breakDepthloop = false;
        for (let depthMOeee = 0; depthMOeee < depths.length; depthMOeee += 1) {
            for (let blockInd = 0; blockInd < depths[depthMOeee].length; blockInd += 1) {
                const thisBlock = depths[depthMOeee][blockInd];
                const sGlobal = allit[thisBlock.s].globalIndexZero;
                const eGlobal = allit[thisBlock.e].globalIndexZero;
                if (sGlobal <= globalIndexZero &&
                    eGlobal > globalIndexZero &&
                    eGlobal - sGlobal < candidate.globalLength) {
                    candidate = {
                        blockInd,
                        depthMOeee: depthMOeee,
                        globalLength: eGlobal - sGlobal,
                    };
                    // zz_sGlobal = sGlobal;
                    // zz_eGlobal = eGlobal;
                }
            }
        }
        // thisEditorInfo.focusedBlock = {
        //     depth: candidate.depthMOeee,
        //     index: candidate.blockInd,
        // };
        const fDuo = thisEditorInfo.focusDuo;
        if (fDuo.curr) {
            fDuo.prev = {
                depth: fDuo.curr.depth,
                indexInTheDepth: fDuo.curr.indexInTheDepth,
            };
        }
        else {
            fDuo.prev = null;
        }
        fDuo.curr = {
            depth: candidate.depthMOeee + 1,
            indexInTheDepth: candidate.blockInd,
        };
        editorInfo.focusTreePath = generateFocusTreePath(editorInfo);
        editorInfo.innersFromFocus =
            generateInDepthIndexesOfEachDepthFromFocus(editorInfo);
        // console.log("currrrrrrrr", editorInfo.innersFromFocus);
        // console.log(editorInfo.renderingInfoForFullFile?.masterLevels);
        // console.log(editorInfo.renderingInfoForFullFile?.allit);
    }
};
exports.updateFocusInfo = updateFocusInfo;
const updateRender = ({ editorInfo, timer, supMode }) => {
    if (!extension_1.glo.isOn ||
        extension_1.glo.blackListOfFileFormats.includes(editorInfo.editorRef.document.languageId)) {
        if (editorInfo.decors.length > 0) {
            editorInfo.upToDateLines.upEdge = -1;
            editorInfo.upToDateLines.lowEdge = -1;
            exports.junkDecors3dArr.push(editorInfo.decors);
            exports.nukeJunkDecorations();
            editorInfo.decors = [];
            editorInfo.needToAnalyzeFile = true;
        }
        return;
    }
    clearTimeout(editorInfo.timerForDo);
    // if (editorInfo.needToAnalyzeFile) {
    //     timer = glo.renderTimerForChange;
    // }
    editorInfo.timerForDo = setTimeout(() => __awaiter(void 0, void 0, void 0, function* () {
        // console.log("<new cycle>");
        if (extension_1.glo.maxDepth <= -2) {
            editorInfo.upToDateLines.upEdge = -1;
            editorInfo.upToDateLines.lowEdge = -1;
            exports.junkDecors3dArr.push(editorInfo.decors);
            exports.nukeJunkDecorations();
            editorInfo.decors = [];
            editorInfo.needToAnalyzeFile = true;
            return;
        }
        const visRanges = editorInfo.editorRef.visibleRanges;
        const firstVisLine = visRanges[0].start.line;
        const lastVisLine = visRanges[visRanges.length - 1].end.line;
        const firstLineZeroOfRender = firstVisLine - extension_1.glo.renderIncBeforeAfterVisRange;
        const lastLineZeroOfRender = lastVisLine + extension_1.glo.renderIncBeforeAfterVisRange;
        // --------------
        // console.log("easy");
        editorInfo.upToDateLines.upEdge = -1;
        editorInfo.upToDateLines.lowEdge = -1;
        exports.junkDecors3dArr.push(editorInfo.decors);
        editorInfo.decors = [];
        if (editorInfo.needToAnalyzeFile) {
            // console.time("getFF");
            editorInfo.renderingInfoForFullFile = yield utils_1.getFullFileStats({
                editorInfo,
            });
            // console.timeEnd("getFF");
        }
        if (editorInfo.renderingInfoForFullFile) {
            editorInfo.needToAnalyzeFile = false;
            exports.updateFocusInfo(editorInfo);
            // console.time("renderLevelsEasy");
            utils_1.renderLevels(editorInfo, firstLineZeroOfRender, lastLineZeroOfRender);
            // console.timeEnd("renderLevelsEasy");
        }
        exports.nukeJunkDecorations();
    }), timer); // ms
};
exports.updateRender = updateRender;
//# sourceMappingURL=utils2.js.map