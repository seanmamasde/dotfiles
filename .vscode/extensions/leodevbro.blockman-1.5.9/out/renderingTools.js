"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderSingleBlock = void 0;
const extension_1 = require("./extension");
// import { renderSingleLineBoxV1 } from "./renderLineToolV1";
// import { renderSingleLineBoxV2 } from "./renderLineToolV2";
// import { renderSingleLineBoxV3 } from "./renderLineToolV3";
// import { renderSingleLineBoxV4 } from "./renderLineToolV4";
const renderLineToolV5_1 = require("./renderLineToolV5");
// import { renderSingleLineBoxV5SvgExperiment } from "./renderLineToolV5SvgExperiment";
const settingsManager_1 = require("./settingsManager");
const neu = "neutral";
const advNeu = settingsManager_1.makeInnerKitchenNotation("basic");
const renderSingleBlock = ({ firstLineHasVisibleChar, lastLineHasVisibleChar, firstVisibleChar, lastVisibleChar, optimalLeftOfRange, optimalRightOfRange, depth, inDepthBlockIndex, firstLineZeroOfRender, lastLineZeroOfRender, editorInfo, lang, isFocusedBlock, absRangeEndPos, currMaxDepthIndex, }) => {
    var _a;
    if (!firstVisibleChar || firstVisibleChar.lineZero < 0) {
        return;
    }
    // -----11111111111
    let inputBorderColor = `linear-gradient(to right, ${"transparent"}, ${"transparent"})`; // in final state it always must be linear gradient
    let inputBackgroundColor = `linear-gradient(to right, ${settingsManager_1.editorBackgroundFormula}, ${settingsManager_1.editorBackgroundFormula})`; // in final state it always must be linear gradient
    inputBorderColor = extension_1.glo.coloring.border;
    switch (depth) {
        case 0:
            inputBackgroundColor = extension_1.glo.coloring.onEachDepth[0];
            inputBorderColor = extension_1.glo.coloring.borderOfDepth0;
            break;
        case 1:
            inputBackgroundColor = extension_1.glo.coloring.onEachDepth[1];
            break;
        case 2:
            inputBackgroundColor = extension_1.glo.coloring.onEachDepth[2];
            break;
        case 3:
            inputBackgroundColor = extension_1.glo.coloring.onEachDepth[3];
            break;
        case 4:
            inputBackgroundColor = extension_1.glo.coloring.onEachDepth[4];
            break;
        case 5:
            inputBackgroundColor = extension_1.glo.coloring.onEachDepth[5];
            break;
        case 6:
            inputBackgroundColor = extension_1.glo.coloring.onEachDepth[6];
            break;
        case 7:
            inputBackgroundColor = extension_1.glo.coloring.onEachDepth[7];
            break;
        case 8:
            inputBackgroundColor = extension_1.glo.coloring.onEachDepth[8];
            break;
        case 9:
            inputBackgroundColor = extension_1.glo.coloring.onEachDepth[9];
            break;
        case 10:
            inputBackgroundColor = extension_1.glo.coloring.onEachDepth[10];
            break;
        default:
            inputBackgroundColor = extension_1.glo.coloring.onEachDepth[10];
    }
    let borderSize = extension_1.glo.borderSize;
    if (extension_1.glo.enableFocus && isFocusedBlock) {
        if (!extension_1.glo.coloring.focusedBlock.includes("same")) {
            inputBackgroundColor = extension_1.glo.coloring.focusedBlock;
        }
        if (!extension_1.glo.coloring.borderOfFocusedBlock.includes("same")) {
            inputBorderColor = extension_1.glo.coloring.borderOfFocusedBlock;
        }
        borderSize = 2;
    }
    // kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk
    let borderOfAC = undefined;
    let backgroundOfAC = undefined;
    const aCSettingsForBorders = extension_1.glo.coloring.advanced.forBorders;
    const aCSettingsForBackgrounds = extension_1.glo.coloring.advanced.forBackgrounds;
    const focPath = editorInfo.focusTreePath;
    // if (focPath) {
    //     if (focPath[depth] === inDepthBlockIndex) {
    //         // borderOfAC =
    //         //     "linear-gradient(to right, red, rgba(250, 10, 100, 0.3))";
    //     }
    // }
    const focInners = editorInfo.innersFromFocus;
    // if (focInners) {
    //     const indexes = focInners[depth];
    //     if (indexes && indexes.includes(inDepthBlockIndex)) {
    //         // borderOfAC = "linear-gradient(to right, blue, blue)";
    //     }
    // }
    const focusedBlockInfo = editorInfo.focusDuo.curr;
    const focDepth = focusedBlockInfo === null || focusedBlockInfo === void 0 ? void 0 : focusedBlockInfo.depth;
    // const focIndITD = focusedBlockInfo.indexInTheDepth;
    const inOnFocTree = focDepth &&
        depth <= focDepth &&
        focPath &&
        focPath[depth] === inDepthBlockIndex;
    const isInsideFoc = focDepth &&
        depth >= focDepth &&
        focInners &&
        ((_a = focInners[depth]) === null || _a === void 0 ? void 0 : _a.includes(inDepthBlockIndex));
    const decideColor = (aCSettings) => {
        for (let i = 0; i < aCSettings.length; i += 1) {
            const seqInfo = aCSettings[i];
            const kind = seqInfo.kind;
            if (kind === settingsManager_1.AdvancedColoringFields.fromD0ToInward_All) {
                const myColor = seqInfo.sequence[depth];
                if (myColor && myColor !== neu) {
                    // borderOfAC = myColor;
                    // break;
                    if (myColor === advNeu) {
                        return undefined;
                    }
                    return myColor;
                }
            }
            else if (kind === settingsManager_1.AdvancedColoringFields.fromD0ToInward_FocusTree) {
                let myColor = neu;
                if (inOnFocTree) {
                    myColor = seqInfo.sequence[depth];
                }
                if (myColor && myColor !== neu) {
                    // borderOfAC = myColor;
                    // break;
                    if (myColor === advNeu) {
                        return undefined;
                    }
                    return myColor;
                }
            }
            else if (kind === settingsManager_1.AdvancedColoringFields.fromFocusToInward_All) {
                let myColor = neu;
                if (focDepth && isInsideFoc) {
                    const myInd = depth - focDepth;
                    myColor = seqInfo.sequence[myInd];
                }
                if (myColor && myColor !== neu) {
                    // borderOfAC = myColor;
                    // break;
                    if (myColor === advNeu) {
                        return undefined;
                    }
                    return myColor;
                }
            }
            else if (kind === settingsManager_1.AdvancedColoringFields.fromFocusToOutward_All) {
                let myColor = neu;
                if (focDepth && depth <= focDepth) {
                    const myInd = focDepth - depth;
                    myColor = seqInfo.sequence[myInd];
                }
                if (myColor && myColor !== neu) {
                    // borderOfAC = myColor;
                    // break;
                    if (myColor === advNeu) {
                        return undefined;
                    }
                    return myColor;
                }
            }
            else if (kind === settingsManager_1.AdvancedColoringFields.fromFocusToOutward_FocusTree) {
                let myColor = neu;
                if (focDepth && inOnFocTree) {
                    const myInd = focDepth - depth;
                    myColor = seqInfo.sequence[myInd];
                }
                if (myColor && myColor !== neu) {
                    // borderOfAC = myColor;
                    // break;
                    if (myColor === advNeu) {
                        return undefined;
                    }
                    return myColor;
                }
            }
        }
        return undefined;
    };
    borderOfAC = decideColor(aCSettingsForBorders);
    backgroundOfAC = decideColor(aCSettingsForBackgrounds);
    // ------222222222
    if (borderOfAC) {
        inputBorderColor = borderOfAC;
    }
    if (backgroundOfAC) {
        inputBackgroundColor = backgroundOfAC;
    }
    // ------- 333333
    for (let currLineZero = firstVisibleChar.lineZero; currLineZero <= lastVisibleChar.lineZero; currLineZero += 1) {
        if (currLineZero < firstLineZeroOfRender) {
            continue;
        }
        if (currLineZero > lastLineZeroOfRender) {
            break;
        }
        let lChar = optimalLeftOfRange;
        let rChar = optimalRightOfRange;
        let currType;
        let isfirstFromTopToDown = false;
        let isFirstFromBottomToUp = false;
        // console.log("firstLineHasVisibleChar:", firstLineHasVisibleChar);
        // console.log("currLineZero:", currLineZero);
        // console.log(
        //     "firstVisibleChar.lineZero + 1:",
        //     firstVisibleChar.lineZero + 1,
        // );
        if (firstLineHasVisibleChar &&
            currLineZero === firstVisibleChar.lineZero + 1) {
            isfirstFromTopToDown = true;
        }
        if (lastLineHasVisibleChar &&
            currLineZero === lastVisibleChar.lineZero - 1) {
            isFirstFromBottomToUp = true;
        }
        if (firstVisibleChar.lineZero === lastVisibleChar.lineZero) {
            currType = "onlyLine";
        }
        else if (currLineZero === firstVisibleChar.lineZero) {
            currType = "opening";
            if (firstLineHasVisibleChar) {
                // if (!["python"].includes(lang)) {
                // for language which is not based on indentation
                lChar = firstVisibleChar.inLineIndexZero;
                // }
            }
        }
        else if (currLineZero === lastVisibleChar.lineZero) {
            currType = "closing";
            if (lastLineHasVisibleChar) {
                // if (!["python"].includes(lang)) {
                // for language which is not based on indentation
                // }
                if (!(absRangeEndPos &&
                    editorInfo.monoText[absRangeEndPos.globalIndexZero] ===
                        "\n")) {
                    rChar = lastVisibleChar.inLineIndexZero;
                }
            }
        }
        else {
            currType = "middle";
        }
        // if (depth === 2) {
        // console.log("rendering depth");
        const singleRangeRendArg = {
            editorInfo,
            depth,
            inDepthBlockIndex,
            lineBlockType: currType,
            isfirstFromTopToDown,
            isFirstFromBottomToUp,
            lineZero: currLineZero,
            boxHeight: extension_1.glo.eachCharFrameHeight,
            boxLeftEdge: extension_1.glo.eachCharFrameWidth * lChar,
            boxRightEdge: extension_1.glo.eachCharFrameWidth * (rChar + 1),
            optimalLeftOfRangePx: optimalLeftOfRange * extension_1.glo.eachCharFrameWidth,
            optimalRightOfRangePx: (optimalRightOfRange + 1) * extension_1.glo.eachCharFrameWidth,
            legitFirstLineZero: firstLineZeroOfRender,
            legitLastLineZero: lastLineZeroOfRender,
            isFocusedBlock,
            firstLineHasVisibleChar,
            lastLineHasVisibleChar,
            firstVisibleChar,
            lastVisibleChar,
            inputBorderColor,
            inputBackgroundColor,
            borderSize,
            currMaxDepthIndex,
        };
        // renderSingleLineBoxV1(singleRangeRendArg); // old renderer function
        // renderSingleLineBoxV2(singleRangeRendArg); // new renderer function
        // for V3
        const firstLineOfMiddles = firstVisibleChar.lineZero + 2;
        const lastLineOfMiddles = lastVisibleChar.lineZero - 2;
        const isMid = currLineZero >= firstLineOfMiddles &&
            currLineZero <= lastLineOfMiddles;
        // renderSingleLineBoxV4(singleRangeRendArg);
        renderLineToolV5_1.renderSingleLineBoxV5(singleRangeRendArg);
        // renderSingleLineBoxV5SvgExperiment(singleRangeRendArg);
        if (isMid) {
            currLineZero = lastLineOfMiddles;
        }
        // }
    }
};
exports.renderSingleBlock = renderSingleBlock;
//# sourceMappingURL=renderingTools.js.map