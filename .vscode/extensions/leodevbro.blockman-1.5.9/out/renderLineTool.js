"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderSingleLineBox = exports.ldn007Range = exports.ldn007 = void 0;
const vscode = require("vscode");
const extension_1 = require("./extension");
const utils2_1 = require("./utils2");
let cou = 0;
const ldn007 = () => vscode.window.createTextEditorDecorationType({
    before: {
        // rangeBehavior: 1,
        contentText: `7777777777`,
        textDecoration: `;box-sizing: content-box !important;
                          
                          border: 1px solid red;
                          border-radius: ${"5px"};

                          width: ${300 + ++cou * 5}px;
                          height: ${"16"}px;
                          position: absolute;
                          
                          top: 0px;
                          left: 20px;
                          `,
        // padding: 100px;
    },
});
exports.ldn007 = ldn007;
exports.ldn007Range = new vscode.Range(1083, 0, 1083, 0);
console.log("ცვლილება 002");
// let kkk = 0;
// new renderer function
const renderSingleLineBox = ({ editorInfo, depth, inDepthBlockIndex, lineBlockType, isfirstFromTopToDown, isFirstFromBottomToUp, lineZero, boxHeight, boxLeftEdge, boxRightEdge, optimalLeftOfRangePx, optimalRightOfRangePx, legitFirstLineZero, legitLastLineZero, isFocusedBlock, firstLineHasVisibleChar, lastLineHasVisibleChar, }) => {
    var _a;
    // if (["opening", "middle", "closing"].includes(lineBlockType)) {
    if (["middle"].includes(lineBlockType)) {
        return;
    }
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
    let borderSize = extension_1.glo.borderSize;
    const borderRadius = extension_1.glo.borderRadius;
    let borderColorToBeTransparent = extension_1.glo.coloring.border;
    let zIndex = -1000 + depth * 10;
    let borderCss;
    let borderRadiusCss;
    let top = 0;
    let specificHeight = boxHeight;
    let backgroundCSS = "red";
    switch (depth) {
        case 0:
            backgroundCSS = extension_1.glo.coloring.onEachDepth[0];
            borderColorToBeTransparent = extension_1.glo.coloring.borderOfDepth0;
            // zIndex = -100 + 10;
            break;
        case 1:
            backgroundCSS = extension_1.glo.coloring.onEachDepth[1];
            break;
        case 2:
            backgroundCSS = extension_1.glo.coloring.onEachDepth[2];
            break;
        case 3:
            backgroundCSS = extension_1.glo.coloring.onEachDepth[3];
            break;
        case 4:
            backgroundCSS = extension_1.glo.coloring.onEachDepth[4];
            break;
        case 5:
            backgroundCSS = extension_1.glo.coloring.onEachDepth[5];
            break;
        case 6:
            backgroundCSS = extension_1.glo.coloring.onEachDepth[6];
            break;
        case 7:
            backgroundCSS = extension_1.glo.coloring.onEachDepth[7];
            break;
        case 8:
            backgroundCSS = extension_1.glo.coloring.onEachDepth[8];
            break;
        case 9:
            backgroundCSS = extension_1.glo.coloring.onEachDepth[9];
            break;
        case 10:
            backgroundCSS = extension_1.glo.coloring.onEachDepth[10];
            break;
        default:
            backgroundCSS = extension_1.glo.coloring.onEachDepth[10];
    }
    if (extension_1.glo.enableFocus && isFocusedBlock) {
        // backgroundCSS = "rgb(21, 5, 64)";
        // backgroundCSS = "rgb(13, 2, 41)";
        // backgroundCSS = "rgb(27, 12, 48)";
        if (extension_1.glo.coloring.focusedBlock !== "same") {
            backgroundCSS = extension_1.glo.coloring.focusedBlock;
            // backgroundCSS = "rgba(154, 10, 80, 0)";
        }
        if (extension_1.glo.coloring.borderOfFocusedBlock !== "same") {
            borderColorToBeTransparent = extension_1.glo.coloring.borderOfFocusedBlock;
        }
        borderSize = 2;
        // zIndex = -3;
    }
    const borderColorNewVarToSupportGraient = borderColorToBeTransparent;
    borderColorToBeTransparent = "transparent";
    // const boxLeftEdgeFixedShift = boxLeftEdge - borderSize;
    if (lineBlockType === "opening") {
        borderCss = `
            border-left: ${borderSize}px solid ${borderColorToBeTransparent};
            border-top: ${borderSize}px solid ${borderColorToBeTransparent};
            border-right: ${borderSize}px solid ${borderColorToBeTransparent};

            
        `;
        borderRadiusCss = `${borderRadius}px ${borderRadius}px 0px 0px`;
        top += 2 - borderSize;
        specificHeight -= isFirstFromBottomToUp ? 2 : 0;
        if (isFirstFromBottomToUp) {
            if (firstLineHasVisibleChar) {
                // top += 2; // 0
                // specificHeight -= 2; // boxHeight
            }
            else {
                // top = 0 + 2; // 0
                specificHeight -= 2; // boxHeight
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
            specificHeight -= 2;
            // backgroundCSS = "red";
        }
        if (isFirstFromBottomToUp) {
            specificHeight -= 2;
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
                specificHeight -= 2; // boxHeight
            }
            else {
                top = 0 + 2; // 0
                specificHeight -= 4; // boxHeight
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
        specificHeight -= 4;
    }
    const currVsRange = new vscode.Range(lineZero, 0, lineZero, 0); // must be ZERO! IMPORTANT! otherwise may be dimmer when text is dimmer
    if (lineZero === 0) {
        top += 1;
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
    const thisLineObjectBefore = editorInfo.decors[lineZero];
    if (!thisLineObjectBefore) {
        editorInfo.decors[lineZero] = [];
    }
    const thisLineObjectAfter = editorInfo.decors[lineZero];
    const thisLineDepthObjectBefore = thisLineObjectAfter[depth];
    if (!thisLineDepthObjectBefore) {
        thisLineObjectAfter[depth] = [newQueueInfo];
    }
    else {
        (_a = thisLineObjectAfter[depth]) === null || _a === void 0 ? void 0 : _a.push(newQueueInfo);
    }
    const thisLineDepthObjectAfter = thisLineObjectAfter[depth];
    // here the heavy heeeaaaavy job begins:
    // return;
    const isAtVeryLeft = boxLeftEdge === 0;
    const leftInc = isAtVeryLeft ? 2 : 0;
    const backgroundAndBorder = "background: " +
        backgroundCSS +
        " padding-box, " +
        borderColorNewVarToSupportGraient +
        "border-box;";
    // kkk += 1;
    // console.log(kkk);
    // return;
    const lineDecoration = vscode.window.createTextEditorDecorationType({
        before: {
            // rangeBehavior: 1,
            contentText: ``,
            textDecoration: `;box-sizing: content-box !important;
                              ${borderCss}
                              
                              border-radius: ${borderRadiusCss};

                              width: calc((${boxRightEdge - boxLeftEdge} * (1ch + ${extension_1.glo.letterSpacing}px)) - ${leftInc}px);
                              height: ${specificHeight}px;
                              position: absolute;
                              z-index: ${zIndex};
                              top: ${top}px;
                              left: calc((${boxLeftEdge} * (1ch + ${extension_1.glo.letterSpacing}px)) + ${leftInc - borderSize}px);
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
            const leftLineOfOpening = vscode.window.createTextEditorDecorationType({
                before: {
                    // rangeBehavior: 1,
                    contentText: ``,
                    textDecoration: `;box-sizing: content-box !important;
                                      border-bottom: ${borderSize}px solid ${borderColorToBeTransparent};
     
                                      width: calc((${width} * (1ch + ${extension_1.glo.letterSpacing}px)) - ${leftInc - 1}px);
                                      bottom: ${b}px;
                                      height: ${0}px;
                                      position: absolute;
                                      z-index: ${zIndex + 300};
                                      
                                      left: calc((${optimalLeftOfRangePx} * (1ch + ${extension_1.glo.letterSpacing}px)) -
                                          ${borderSize - leftInc}px);
                                          ${backgroundAndBorder}
                                      `,
                    // padding: 100px;
                },
            });
            // thisLineDepthObjectAfter.decorsRefs.leftLineOfOpening = leftLineOfOpening;
            thisLineDepthObjectAfter[thisLineDepthObjectAfter.length - 1].decorsRefs.leftLineOfOpening = leftLineOfOpening;
            // if (lineZero === 103) {
            utils2_1.notYetDisposedDecsObject.decs.push({
                dRef: leftLineOfOpening,
                lineZero,
            });
            editorInfo.editorRef.setDecorations(leftLineOfOpening, [
                currVsRange,
            ]);
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
        if (width > 0) {
            const rightLineOfClosing = vscode.window.createTextEditorDecorationType({
                before: {
                    // rangeBehavior: 1,
                    contentText: ``,
                    textDecoration: `;box-sizing: content-box !important;
                                      border-top: ${borderSize}px solid ${borderColorToBeTransparent};
     
                                      width: calc((${optimalRightOfRangePx - boxRightEdge} * (1ch + ${extension_1.glo.letterSpacing}px)) - ${leftInc - borderSize}px);
                                      top: ${t}px;
                                      height: ${0}px;
                                      position: absolute;
                                      z-index: ${zIndex + 300};
                                      
                                      left: calc((${boxRightEdge} * (1ch + ${extension_1.glo.letterSpacing}px)) + ${leftInc}px);
                        ${backgroundAndBorder}
                                      `,
                    // padding: 100px;
                },
            });
            thisLineDepthObjectAfter[thisLineDepthObjectAfter.length - 1].decorsRefs.rightLineOfClosing = rightLineOfClosing;
            // if (lineZero === 103) {
            utils2_1.notYetDisposedDecsObject.decs.push({
                dRef: rightLineOfClosing,
                lineZero,
            });
            editorInfo.editorRef.setDecorations(rightLineOfClosing, [
                currVsRange,
            ]);
            // console.log("openingiiiisss - rightLineOfClosing");
            // }
        }
    }
    thisLineDepthObjectAfter[thisLineDepthObjectAfter.length - 1].decorsRefs.mainBody = lineDecoration;
    // if (lineZero === 103) {
    utils2_1.notYetDisposedDecsObject.decs.push({
        dRef: lineDecoration,
        lineZero,
    });
    editorInfo.editorRef.setDecorations(lineDecoration, [currVsRange]);
    // }
};
exports.renderSingleLineBox = renderSingleLineBox;
//# sourceMappingURL=renderLineTool.js.map