"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderSingleLineBoxV5 = void 0;
const vscode = require("vscode");
const extension_1 = require("./extension");
const utils2_1 = require("./utils2");
const hasNonWhiteCloserAfterLastCharTillNewLine = (txt, lastCharIndex) => {
    for (let i = lastCharIndex + 1; i < txt.length; i += 1) {
        const currCh = txt[i];
        if (currCh === "\n") {
            return false;
        }
        else if (![" ", "\t"].includes(currCh)) {
            return true;
        }
    }
    return false;
};
console.log("ცვლილება 007");
// let kkk = 0;
// new renderer function
const renderSingleLineBoxV5 = ({ editorInfo, depth, inDepthBlockIndex, lineBlockType, isfirstFromTopToDown, isFirstFromBottomToUp, lineZero, boxHeight, boxLeftEdge, boxRightEdge, optimalLeftOfRangePx, optimalRightOfRangePx, legitFirstLineZero, legitLastLineZero, isFocusedBlock, firstLineHasVisibleChar, lastLineHasVisibleChar, firstVisibleChar, lastVisibleChar, inputBorderColor, inputBackgroundColor, borderSize, currMaxDepthIndex, }) => {
    var _a, _b;
    let isExpandableToRightAsMain = false;
    let isExpandableToRightAsClHelp = false;
    const eE = extension_1.glo.edgeExpanding;
    if (eE.rightSideBaseOfBlocks !== "innerC" ||
        eE.additionalPaddingRight !== 0 ||
        eE.minDistanceBetweenRightSideEdges !== 0) {
        const globalIndexOfThisLineStarter = editorInfo.textLinesMap[lastVisibleChar.lineZero];
        if (lineBlockType === "onlyLine") {
            if (hasNonWhiteCloserAfterLastCharTillNewLine(editorInfo.monoText, globalIndexOfThisLineStarter +
                lastVisibleChar.inLineIndexZero)) {
                // do nothing
            }
            else {
                // indentation based
                isExpandableToRightAsMain = true;
            }
        }
        else {
            if (lineZero !== lastVisibleChar.lineZero) {
                // it is not last line
                isExpandableToRightAsMain = true;
            }
            else {
                // it is last line
                if (!lastLineHasVisibleChar) {
                    isExpandableToRightAsMain = true;
                }
                else if (hasNonWhiteCloserAfterLastCharTillNewLine(editorInfo.monoText, globalIndexOfThisLineStarter +
                    lastVisibleChar.inLineIndexZero)) {
                    // bracket based
                    isExpandableToRightAsClHelp = true;
                }
                else {
                    // indentation based
                    isExpandableToRightAsMain = true;
                }
            }
        }
    }
    /*
    const globalIndexOfThisLineStarter =
        editorInfo.textLinesMap[lastVisibleChar.lineZero];

    if (lineBlockType === "onlyLine") {
        // inputBackgroundColor = "linear-gradient(to right, red, blue)";
        if (
            hasNonWhiteCloserAfterLastCharTillNewLine(
                editorInfo.monoText,
                globalIndexOfThisLineStarter + lastVisibleChar.inLineIndexZero,
            )
        ) {
            // do nothing
        } else {
            optimalRightOfRangePx = !currMaxDepthIndex
                ? 104
                : 104 + (currMaxDepthIndex - 1 - depth);
            boxRightEdge = !currMaxDepthIndex
                ? 104
                : 104 + (currMaxDepthIndex - 1 - depth);
        }
    } else {
        optimalRightOfRangePx = !currMaxDepthIndex
            ? 104
            : 104 + (currMaxDepthIndex - 1 - depth);

        if (lineZero !== lastVisibleChar.lineZero) {
            // optimalRightOfRangePx = 104;
            boxRightEdge = !currMaxDepthIndex
                ? 104
                : 104 + (currMaxDepthIndex - 1 - depth);
        } else {
            // lastLineHasVisibleChar
            // inputBackgroundColor = "linear-gradient(to right, red, blue)";
            if (!lastLineHasVisibleChar) {
                // optimalRightOfRangePx = 104;
                boxRightEdge = !currMaxDepthIndex
                    ? 104
                    : 104 + (currMaxDepthIndex - 1 - depth);
            } else if (
                hasNonWhiteCloserAfterLastCharTillNewLine(
                    editorInfo.monoText,
                    globalIndexOfThisLineStarter +
                        lastVisibleChar.inLineIndexZero,
                )
            ) {
                // bracket based
                // optimalRightOfRangePx = 104;
            } else {
                // indentation based
                // optimalRightOfRangePx = 104;
                boxRightEdge = !currMaxDepthIndex
                    ? 104
                    : 104 + (currMaxDepthIndex - 1 - depth);
            }
        }
    }
    */
    // const doc = editorInfo.editorRef.document;
    const firstLineOfMiddles = firstVisibleChar.lineZero + 2;
    const lastLineOfMiddles = lastVisibleChar.lineZero - 2;
    const isMid = lineZero >= firstLineOfMiddles && lineZero <= lastLineOfMiddles;
    // console.log("lineZero:", lineZero);
    const upEdge = editorInfo.upToDateLines.upEdge;
    const lowEdge = editorInfo.upToDateLines.lowEdge;
    if (
    // !isFocusedBlock &&
    upEdge >= 0 &&
        lowEdge >= 1 &&
        upEdge <= lowEdge &&
        lineZero >= upEdge &&
        lineZero <= lowEdge) {
        return;
    }
    if (lineBlockType === "onlyLine" &&
        !extension_1.glo.renderInSingleLineAreas &&
        !isFocusedBlock) {
        return;
    }
    const borderRadius = extension_1.glo.borderRadius;
    let borderColorToBeTransparent = inputBorderColor;
    borderColorToBeTransparent = "transparent"; // IMPORTANT
    let zIndex = -10000 + depth * 10;
    let borderCss;
    let borderRadiusCss;
    let top = 0;
    // let specificHeight = boxHeight; // DEPRECATED specificHeight
    let heightDelta = 0;
    //
    //
    //
    //
    //
    //
    //
    // const boxLeftEdgeFixedShift = boxLeftEdge - borderSize;
    if (lineBlockType === "opening") {
        borderCss = `
            border-left: ${borderSize}px solid ${borderColorToBeTransparent};
            border-top: ${borderSize}px solid ${borderColorToBeTransparent};
            border-right: ${borderSize}px solid ${borderColorToBeTransparent};

            
        `;
        borderRadiusCss = `${borderRadius}px ${borderRadius}px 0px 0px`;
        top += 2 - borderSize;
        // specificHeight -= isFirstFromBottomToUp ? 2 : 0;
        if (isFirstFromBottomToUp) {
            // specificHeight -= 2; // DEPRECATED specificHeight
            heightDelta -= 2;
            if (firstLineHasVisibleChar) {
                // top += 2; // 0
                // specificHeight -= 2; // boxHeight
            }
            else {
                // top = 0 + 2; // 0
                // specificHeight -= 2; // DEPRECATED specificHeight
                heightDelta -= 2;
            }
        }
        // specificHeight = isFirstFromBottomToUp
        //     ? boxHeight - generalBorderSize / 2
        //     : undefined;
    }
    else if (lineBlockType === "middle") {
        borderCss = `
            border-left: ${borderSize}px solid ${borderColorToBeTransparent};
            border-right: ${borderSize}px solid ${borderColorToBeTransparent};


           
        `;
        // top -= isfirstFromTopToDown ? generalBorderSize : 0;
        borderRadiusCss = `0px`;
        // zIndex -= 1;
        if (isfirstFromTopToDown) {
            // return;
            top += 2;
            // specificHeight -= 2; // DEPRECATED specificHeight
            heightDelta -= 2;
            // backgroundCSS = "red";
        }
        if (isFirstFromBottomToUp) {
            // specificHeight -= 2; // DEPRECATED specificHeight
            heightDelta -= 2;
        }
    }
    else if (lineBlockType === "closing") {
        // console.log("isfirstFromTopToDown:", isfirstFromTopToDown);
        borderCss = `
            border-left: ${borderSize}px solid ${borderColorToBeTransparent};
            border-right: ${borderSize}px solid ${borderColorToBeTransparent};
            border-bottom: ${borderSize}px solid ${borderColorToBeTransparent};

            
        `;
        // top += isfirstFromTopToDown ? generalBorderSize : 0;
        // top += 8;
        borderRadiusCss = `0px 0px ${borderRadius}px ${borderRadius}px;`;
        // specificHeight = isfirstFromTopToDown
        //     ? boxHeight - generalBorderSize / 2
        //     : undefined;
        // top -= 1;
        top -= 2;
        // specificHeight -= 2;
        if (isfirstFromTopToDown) {
            if (lastLineHasVisibleChar) {
                top += 2; // 0
                // specificHeight -= 2; // DEPRECATED specificHeight
                heightDelta -= 2;
            }
            else {
                top = 0 + 2; // 0
                // specificHeight -= 4; // DEPRECATED specificHeight
                heightDelta -= 4;
            }
        }
    }
    else {
        // lineBlockType === "onlyLine"
        borderCss = `
            border-left: ${borderSize}px solid ${borderColorToBeTransparent};
            border-right: ${borderSize}px solid ${borderColorToBeTransparent};
            border-bottom: ${borderSize}px solid ${borderColorToBeTransparent};
            border-top: ${borderSize}px solid ${borderColorToBeTransparent};
        `;
        borderRadiusCss = `${borderRadius}px ${borderRadius}px ${borderRadius}px ${borderRadius}px;`;
        top -= borderSize - 2;
        // specificHeight -= 4; // DEPRECATED specificHeight
        heightDelta -= 4;
    }
    const singleRange = new vscode.Range(lineZero, 0, lineZero, 0); // column must be ZERO! IMPORTANT! otherwise may be dimmer when text is dimmer
    const arrayOfCurrRanges = [singleRange];
    if (isMid) {
        arrayOfCurrRanges.length = 0;
        for (
        // let lz = firstLineOfMiddles;
        // lz <= lastLineOfMiddles;
        let lz = Math.max(firstLineOfMiddles, legitFirstLineZero); lz <= Math.min(lastLineOfMiddles, legitLastLineZero); lz += 1) {
            const nextLineRange = new vscode.Range(lz, 0, lz, 0); // column must be ZERO! IMPORTANT! otherwise may be dimmer when text is dimmer
            arrayOfCurrRanges.push(nextLineRange);
        }
    }
    if (lineZero === 0) {
        top += 1;
        heightDelta -= 1;
        // specificHeight -= 1; // DEPRECATED specificHeight
    }
    // =======================
    const newQueueInfo = {
        lineZero,
        depthIndex: depth,
        inDepthBlockIndex,
        decorsRefs: {
            mainBody: null,
            leftLineOfOpening: "f",
            rightLineOfClosing: "f", // may remain as "f", may change
        },
    };
    const thisLineObjectInitial = editorInfo.decors[lineZero];
    if (!thisLineObjectInitial) {
        editorInfo.decors[lineZero] = [];
    }
    const thisLineObjectNew = editorInfo.decors[lineZero];
    const thisLineDepthObjectInitial = thisLineObjectNew[depth];
    if (!thisLineDepthObjectInitial) {
        thisLineObjectNew[depth] = [newQueueInfo];
    }
    else {
        thisLineObjectNew[depth].push(newQueueInfo);
    }
    const thisLineDepthObjectNew = thisLineObjectNew[depth];
    // here the heavy heeeaaaavy job begins:
    // return;
    const isAtVeryLeft = boxLeftEdge === 0;
    const leftInc = isAtVeryLeft ? 2 : 0;
    const backgroundAndBorder = "background: " +
        inputBackgroundColor +
        " padding-box, " +
        inputBorderColor +
        "border-box;";
    // kkk += 1;
    // console.log(kkk);
    // return;
    let finalWidthCalcOfMain = "";
    // prettier-ignore
    const leftCalcOfMain = `calc((${boxLeftEdge} * (1ch + ${extension_1.glo.letterSpacing}px)) + ${leftInc - borderSize}px)`;
    // prettier-ignore
    const originalWidthCalc = `calc((${boxRightEdge - boxLeftEdge} * (1ch + ${extension_1.glo.letterSpacing}px)) - ${leftInc}px)`;
    finalWidthCalcOfMain = originalWidthCalc;
    if (isExpandableToRightAsMain) {
        if (eE.rightSideBaseOfBlocks === "innerC") {
            // prettier-ignore
            finalWidthCalcOfMain = `calc((${boxRightEdge - boxLeftEdge} * (1ch + ${extension_1.glo.letterSpacing}px)) - ${leftInc}px + ${(currMaxDepthIndex - depth) * eE.minDistanceBetweenRightSideEdges}px + ${eE.additionalPaddingRight}px)`;
        }
        else if (eE.rightSideBaseOfBlocks === "vpC") {
            // prettier-ignore
            finalWidthCalcOfMain = `calc((${boxLeftEdge} * (1ch + ${extension_1.glo.letterSpacing}px)) + ${leftInc - borderSize}px + 150%)`;
        }
        else if (eE.rightSideBaseOfBlocks === "fileC") {
            const fileCWidth = (_a = editorInfo.renderingInfoForFullFile) === null || _a === void 0 ? void 0 : _a.fileRightMost;
            if (fileCWidth) {
                // prettier-ignore
                finalWidthCalcOfMain = `calc((${1 + fileCWidth - boxLeftEdge} * (1ch + ${extension_1.glo.letterSpacing}px)) - ${leftInc}px + ${(currMaxDepthIndex - depth) * eE.minDistanceBetweenRightSideEdges}px + ${eE.additionalPaddingRight}px)`;
            }
        }
    }
    // prettier-ignore
    const lineDecoration = vscode.window.createTextEditorDecorationType({
        before: {
            // rangeBehavior: 1,
            contentText: ``,
            textDecoration: `;box-sizing: content-box !important;
                ${borderCss}
                
                border-radius: ${borderRadiusCss};

                width: ${finalWidthCalcOfMain};
                height: calc(100% + ${heightDelta}px);
                position: absolute;
                z-index: ${zIndex};
                top: ${top}px;
                left: ${leftCalcOfMain};
                ${backgroundAndBorder}
            `,
            // padding: 100px;
        },
    });
    if (lineBlockType === "opening") {
        // isFirstFromBottomToUp
        let b = -2;
        if (isFirstFromBottomToUp) {
            b += 2;
        }
        const isAtVeryLeft = optimalLeftOfRangePx === 0;
        const leftInc = isAtVeryLeft ? 2 : 0;
        const width = boxLeftEdge - optimalLeftOfRangePx;
        if (width > 0) {
            // prettier-ignore
            const leftCalcOfOpHelp = `calc((${optimalLeftOfRangePx} * (1ch + ${extension_1.glo.letterSpacing}px)) - ${borderSize - leftInc}px)`;
            // prettier-ignore
            const originalWidthCalcOfOpHelp = `calc((${width} * (1ch + ${extension_1.glo.letterSpacing}px)) - ${leftInc - 1}px)`;
            // prettier-ignore
            const leftLineOfOpening = vscode.window.createTextEditorDecorationType({
                before: {
                    // rangeBehavior: 1,
                    contentText: ``,
                    textDecoration: `;box-sizing: content-box !important;
                            border-bottom: ${borderSize}px solid ${borderColorToBeTransparent};

                            width: ${originalWidthCalcOfOpHelp};
                            bottom: ${b}px;
                            height: ${0}px;
                            position: absolute;
                            z-index: ${zIndex + 2};
                            
                            left: ${leftCalcOfOpHelp};
                            ${backgroundAndBorder}
                        `,
                    // padding: 100px;
                },
            });
            // thisLineDepthObjectAfter.decorsRefs.leftLineOfOpening = leftLineOfOpening;
            thisLineDepthObjectNew[thisLineDepthObjectNew.length - 1].decorsRefs.leftLineOfOpening = leftLineOfOpening;
            // if (lineZero === 103) {
            utils2_1.notYetDisposedDecsObject.decs.push({
                dRef: leftLineOfOpening,
                lineZero,
                // doc,
            });
            editorInfo.editorRef.setDecorations(leftLineOfOpening, arrayOfCurrRanges);
            // console.log("openingiiiisss - leftLineOfOpening");
            // }
        }
    }
    if (lineBlockType === "closing") {
        let t = -2;
        if (isfirstFromTopToDown) {
            t += 2;
        }
        const isAtVeryLeft = boxRightEdge === 0;
        const leftInc = isAtVeryLeft ? 2 : 0;
        const width = optimalRightOfRangePx - boxRightEdge;
        // if (width > 0) {
        if (width > 0 || isExpandableToRightAsClHelp) {
            let finalWidthCalcOfClHelp = "";
            // prettier-ignore
            const leftCalcOfClHelp = `calc((${boxRightEdge} * (1ch + ${extension_1.glo.letterSpacing}px)) + ${leftInc}px)`;
            // prettier-ignore
            const originalWidthCalcOfClHelp = `calc((${optimalRightOfRangePx - boxRightEdge} * (1ch + ${extension_1.glo.letterSpacing}px)) - ${leftInc - borderSize}px)`;
            finalWidthCalcOfClHelp = originalWidthCalcOfClHelp;
            if (isExpandableToRightAsClHelp) {
                if (eE.rightSideBaseOfBlocks === "innerC") {
                    // prettier-ignore
                    finalWidthCalcOfClHelp = `calc((${optimalRightOfRangePx - boxRightEdge} * (1ch + ${extension_1.glo.letterSpacing}px)) - ${leftInc - borderSize}px + ${(currMaxDepthIndex - depth) * eE.minDistanceBetweenRightSideEdges}px + ${eE.additionalPaddingRight}px)`;
                }
                else if (eE.rightSideBaseOfBlocks === "vpC") {
                    // prettier-ignore
                    finalWidthCalcOfClHelp = `calc((${optimalRightOfRangePx - boxRightEdge} * (1ch + ${extension_1.glo.letterSpacing}px)) - ${leftInc - borderSize}px + 150%)`;
                }
                else if (eE.rightSideBaseOfBlocks === "fileC") {
                    const fileCWidth = (_b = editorInfo.renderingInfoForFullFile) === null || _b === void 0 ? void 0 : _b.fileRightMost;
                    if (fileCWidth) {
                        // prettier-ignore
                        finalWidthCalcOfClHelp = `calc((${1 + fileCWidth - boxRightEdge} * (1ch + ${extension_1.glo.letterSpacing}px)) - ${leftInc - borderSize}px + ${(currMaxDepthIndex - depth) * eE.minDistanceBetweenRightSideEdges}px + ${eE.additionalPaddingRight}px)`;
                    }
                }
            }
            // prettier-ignore
            const rightLineOfClosing = vscode.window.createTextEditorDecorationType({
                before: {
                    // rangeBehavior: 1,
                    contentText: ``,
                    textDecoration: `;box-sizing: content-box !important;
                            border-top: ${borderSize}px solid ${borderColorToBeTransparent};

                            width: ${finalWidthCalcOfClHelp};
                            top: ${t}px;
                            height: ${0}px;
                            position: absolute;
                            z-index: ${zIndex + 2};
                            
                            left: ${leftCalcOfClHelp};
                            ${backgroundAndBorder}
                        `,
                    // padding: 100px;
                },
            });
            thisLineDepthObjectNew[thisLineDepthObjectNew.length - 1].decorsRefs.rightLineOfClosing = rightLineOfClosing;
            // if (lineZero === 103) {
            utils2_1.notYetDisposedDecsObject.decs.push({
                dRef: rightLineOfClosing,
                lineZero,
                // doc,
            });
            editorInfo.editorRef.setDecorations(rightLineOfClosing, arrayOfCurrRanges);
            // console.log("openingiiiisss - rightLineOfClosing");
            // }
        }
    }
    const ldoLen = thisLineDepthObjectNew.length;
    const lineDepthQueue = thisLineDepthObjectNew[ldoLen - 1];
    lineDepthQueue.decorsRefs.mainBody = lineDecoration;
    if (isMid) {
        lineDepthQueue.divType = "m";
        lineDepthQueue.midStartLine = firstLineOfMiddles;
        lineDepthQueue.midEndLine = lastLineOfMiddles;
    }
    utils2_1.notYetDisposedDecsObject.decs.push({
        dRef: lineDecoration,
        lineZero,
        // doc,
    });
    editorInfo.editorRef.setDecorations(lineDecoration, arrayOfCurrRanges);
};
exports.renderSingleLineBoxV5 = renderSingleLineBoxV5;
//# sourceMappingURL=renderLineToolV5.js.map