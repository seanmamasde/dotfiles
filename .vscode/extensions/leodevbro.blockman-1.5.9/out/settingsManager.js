"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyAllBlockmanSettings = exports.defaultsForAdvancedColoringOptions = exports.AdvancedColoringFields = exports.makeInnerKitchenNotation = exports.editorBackgroundFormula = void 0;
const vscode = require("vscode");
const vscode_1 = require("vscode");
const colors_1 = require("./colors");
const extension_1 = require("./extension");
// Possible color values are almost (Please see the notes below) all CSS color/gradient values.
// ---- 'transparent' (or any rgba/hsla... value with partial transparency) - as itself or as inside gradient, works fine for borders, but for backgrounds, transparency is problematic, so 'transparent' will be the color of editor background.
// ---- 'none' is the same as 'transparent', but 'none' works only as itself, not as inside gradient.
// ---- 'neutral' (or undefined, null, false, '', ) means it can be overriden by any other setting. If nothing overrides it, then it should be transparent (Or editor background).
exports.editorBackgroundFormula = "var(--vscode-editor-background)";
const makeInnerKitchenNotation = (possiblyLegitColor, // it may be gradient
tempTransparent) => {
    // !!! IMPORTANT !!!
    // In order to be able to use gradient in borders,
    // new rendering function uses background property with
    // padding-box (for background) and border-box (for border) values.
    // CSS background with padding-box and border-box values
    // does not work if any of them is solid color.
    // for example, this works fine:
    /*
    background:
        linear-gradient(red, red) padding-box,
        linear-gradient(green, green) border-box;
    */
    // but this does not work:
    /*
    background:
        red padding-box,
        green border-box;
    */
    // So, instead of sending solid color, maybe we should always
    // convert it as linear-gradient notation.
    if (typeof possiblyLegitColor !== "string") {
        return "neutral";
    }
    const trimmed = possiblyLegitColor.trim();
    if (trimmed === "" || trimmed === "neutral") {
        return "neutral";
    }
    if (["none", "transparent"].includes(trimmed)) {
        if (tempTransparent === "back") {
            return `linear-gradient(to right, ${exports.editorBackgroundFormula}, ${exports.editorBackgroundFormula})`;
        }
        else {
            return `linear-gradient(to right, ${"transparent"}, ${"transparent"})`;
        }
    }
    if (trimmed.includes(`url(`)) {
        return trimmed;
    }
    if (trimmed.includes("gradient")) {
        return trimmed;
    }
    else {
        return `linear-gradient(to right, ${trimmed}, ${trimmed})`;
    }
};
exports.makeInnerKitchenNotation = makeInnerKitchenNotation;
var AdvancedColoringFields;
(function (AdvancedColoringFields) {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    AdvancedColoringFields["fromD0ToInward_All"] = "fromD0ToInward_All";
    // eslint-disable-next-line @typescript-eslint/naming-convention
    AdvancedColoringFields["fromD0ToInward_FocusTree"] = "fromD0ToInward_FocusTree";
    //
    //
    // eslint-disable-next-line @typescript-eslint/naming-convention
    AdvancedColoringFields["fromFocusToOutward_FocusTree"] = "fromFocusToOutward_FocusTree";
    // eslint-disable-next-line @typescript-eslint/naming-convention
    AdvancedColoringFields["fromFocusToOutward_All"] = "fromFocusToOutward_All";
    //
    //
    // eslint-disable-next-line @typescript-eslint/naming-convention
    AdvancedColoringFields["fromFocusToInward_All"] = "fromFocusToInward_All";
})(AdvancedColoringFields = exports.AdvancedColoringFields || (exports.AdvancedColoringFields = {}));
exports.defaultsForAdvancedColoringOptions = {
    [AdvancedColoringFields.fromD0ToInward_All]: [10, 0, 1, 1],
    [AdvancedColoringFields.fromFocusToOutward_All]: [20, 0, 0, 1],
    [AdvancedColoringFields.fromD0ToInward_FocusTree]: [30, 0, 1, 1],
    [AdvancedColoringFields.fromFocusToOutward_FocusTree]: [40, 0, 1, 1],
    [AdvancedColoringFields.fromFocusToInward_All]: [50, 0, 0, 1],
};
const generateOneChainOfColorsForEachDepth = (myString, // e.g. '50,0,0,0; hsl(0, 0%, 100%, 0.25)>red>blue'
// where first number relates priority
// Second number relates zero-based index of first item of first loop, So it splits what should be looped from what should not be looped.
// third number relates loop part reversion:
//---- 0: original,
//---- 1: reversed,
// fourth number relates looping strategy:
//---- 0: all the continuation items to be 'neutral', 'neutral' means it will be overriden by any other setting.
//---- 1: Only the last item will be looped. Yes, it will ignore the second option;
//---- 2: loop as forward,
//---- 3: loop as pair of forward and backward,
// type "!" to disable the sequence, like this: '!50,0,0,0; hsl(0, 0%, 100%, 0.25)>red>blue'
// kind: keyof typeof defaultsForAdvancedColoringOptions, // maybe not needed
tempTransparent) => {
    if (typeof myString !== "string") {
        return undefined;
    }
    let tr = myString.trim();
    if (!tr || tr[0] === "!") {
        return undefined;
    }
    const trL = tr.length;
    if (tr[trL - 1] === ">") {
        tr = tr.slice(0, trL - 1);
    }
    const optionsAndColorsAsTwoStrings = tr.split(";").map((x) => x.trim());
    const optionsSequenceRaw = optionsAndColorsAsTwoStrings[0]
        .split(",")
        .map((x) => x.trim());
    if (optionsSequenceRaw.length !== 4 ||
        optionsSequenceRaw.some((x) => x === "")) {
        return undefined;
    }
    const optionsSequence = optionsSequenceRaw.map((x) => Number(x));
    for (let i = 0; i < optionsSequence.length; i += 1) {
        if (i === 0) {
            const prio = optionsSequence[i];
            if (Number.isNaN(prio)) {
                return undefined;
            }
            continue;
        }
        else if (!Number.isInteger(optionsSequence[i])) {
            return undefined;
        }
    }
    const priority = optionsSequence[0];
    let loopStartIndex = optionsSequence[1];
    const reverseLoop = optionsSequence[2];
    const loopingStrategy = optionsSequence[3];
    // ------------
    const coloringSequence = optionsAndColorsAsTwoStrings[1]
        .split(">")
        .map((x) => exports.makeInnerKitchenNotation(x.trim(), tempTransparent));
    if (coloringSequence.length === 0 ||
        coloringSequence.some((x) => x === "")) {
        return undefined;
    }
    if ([0, 1].includes(loopingStrategy)) {
        loopStartIndex = coloringSequence.length - 1;
    }
    if (priority < -1000000 ||
        priority > 1000000 ||
        reverseLoop < 0 ||
        reverseLoop > 1 ||
        loopingStrategy < 0 ||
        loopingStrategy > 3 ||
        loopStartIndex < 0 ||
        loopStartIndex > coloringSequence.length - 1) {
        return undefined;
    }
    // ..........................
    // Now we have optionsSequence and coloringSequence
    // ============
    // ===================
    const nonLoopPart = coloringSequence.slice(0, loopStartIndex);
    const loopPart = coloringSequence.slice(loopStartIndex, coloringSequence.length);
    const reversedOrNotLoopPart = reverseLoop === 0 ? [...loopPart] : [...loopPart].reverse();
    const loopLen = reversedOrNotLoopPart.length;
    const legitSequence = [...nonLoopPart, ...reversedOrNotLoopPart];
    const leLen = legitSequence.length;
    const lengthOfDepths = extension_1.glo.maxDepth + 2; // because glo.maxDepth is as minus 1
    if (lengthOfDepths < 1) {
        return undefined;
    }
    const finalArrayOfColors = [];
    if (loopingStrategy === 0) {
        // the rest are neutral
        finalArrayOfColors.push(...legitSequence);
        // the rest will be undefined, so they will be neutral
    }
    else if (loopingStrategy === 1) {
        //1: the rest are last item
        finalArrayOfColors.push(...legitSequence);
        const lastItem = legitSequence[leLen - 1];
        for (let i = leLen; i <= lengthOfDepths - 1; i += 1) {
            finalArrayOfColors.push(lastItem);
        }
    }
    else if (loopingStrategy === 2) {
        // 2: loop as forward
        finalArrayOfColors.push(...nonLoopPart);
        while (finalArrayOfColors.length < lengthOfDepths) {
            finalArrayOfColors.push(...[...reversedOrNotLoopPart]);
        }
        finalArrayOfColors.length = lengthOfDepths;
    }
    else if (loopingStrategy === 3) {
        //3: loop as pair of forward and backward
        finalArrayOfColors.push(...nonLoopPart);
        const inner = reversedOrNotLoopPart.slice(1, loopLen - 1);
        const innerRev = [...inner].reverse();
        const head = reversedOrNotLoopPart[0];
        const tail = reversedOrNotLoopPart[loopLen - 1];
        while (finalArrayOfColors.length < lengthOfDepths) {
            finalArrayOfColors.push(head, ...inner, tail, ...innerRev);
        }
        finalArrayOfColors.length = lengthOfDepths;
    }
    return { priority, sequence: finalArrayOfColors };
};
const chooseColorCombo = (selectedCombo, darkCombo, lightCombo, highContrastCombo) => {
    const currVscodeThemeKind = vscode.window.activeColorTheme.kind;
    const isTruthy = (combo) => {
        if (combo && combo.toLowerCase() !== "none") {
            return true;
        }
        else {
            return false;
        }
    };
    let resultCombo = selectedCombo;
    if (isTruthy(darkCombo) && currVscodeThemeKind === vscode_1.ColorThemeKind.Dark) {
        resultCombo = darkCombo;
        // console.log("dark kind");
    }
    else if (isTruthy(lightCombo) &&
        currVscodeThemeKind === vscode_1.ColorThemeKind.Light) {
        resultCombo = lightCombo;
        // console.log("light king");
    }
    else if (isTruthy(highContrastCombo) &&
        currVscodeThemeKind === vscode_1.ColorThemeKind.HighContrast) {
        resultCombo = highContrastCombo;
        // console.log("HC king");
    }
    // console.log("resultCombo:", resultCombo);
    return resultCombo;
};
const applyAllBlockmanSettings = () => {
    const blockmanConfig = vscode_1.workspace.getConfiguration("blockman");
    const bc = blockmanConfig;
    // =============
    const candLineHeight = bc.get("n01LineHeight");
    if (typeof candLineHeight === "number" &&
        candLineHeight >= 2 &&
        candLineHeight < 130) {
        // glo.eachCharFrameHeight = candLineHeight;
    }
    // =============
    const candEachCharFrameWidth = bc.get("n02EachCharFrameWidth");
    if (typeof candEachCharFrameWidth === "number" &&
        candEachCharFrameWidth >= 2 &&
        candEachCharFrameWidth < 130) {
        // glo.eachCharFrameWidth = candEachCharFrameWidth;
    }
    // =============
    const candMaxDepth = bc.get("n03MaxDepth");
    if (typeof candMaxDepth === "number" && candMaxDepth >= -1) {
        extension_1.glo.maxDepth = Math.floor(candMaxDepth - 1);
        // glo.maxDepth = 100;
    }
    // ============= Coloring
    const selectedColorComboName = bc.get("n04ColorComboPreset");
    const selectedColorComboNameForDarkTheme = bc.get("n04Sub01ColorComboPresetForDarkTheme");
    const selectedColorComboNameForLightTheme = bc.get("n04Sub02ColorComboPresetForLightTheme");
    const selectedColorComboNameForHighContrastTheme = bc.get("n04Sub03ColorComboPresetForHighContrastTheme");
    // console.log("selectedColorComboName:", selectedColorComboName);
    let thisColorCombo = undefined;
    let chosenColorCombo = chooseColorCombo(selectedColorComboName, selectedColorComboNameForDarkTheme, selectedColorComboNameForLightTheme, selectedColorComboNameForHighContrastTheme);
    if (chosenColorCombo) {
        thisColorCombo = colors_1.colorCombos.find((combo) => combo.name === chosenColorCombo);
    }
    // start moding---------
    // n04Sub04RightSideBaseOfBlocks
    // n04Sub05MinDistanceBetweenRightSideEdges
    // n04Sub06AdditionalPaddingRight
    const fetchedRightSideBaseOfBlocks = bc.get("n04Sub04RightSideBaseOfBlocks");
    const fetchedMinDistanceBetweenRightSideEdges = bc.get("n04Sub05MinDistanceBetweenRightSideEdges");
    const fetchedAdditionalPaddingRight = bc.get("n04Sub06AdditionalPaddingRight");
    if (typeof fetchedRightSideBaseOfBlocks === "string") {
        const myEntries = Object.entries(extension_1.optionsForRightEdgeBaseOfBlocks);
        for (const [key, value] of myEntries) {
            if (fetchedRightSideBaseOfBlocks === value) {
                extension_1.glo.edgeExpanding.rightSideBaseOfBlocks = key;
                break;
            }
        }
    }
    if (typeof fetchedMinDistanceBetweenRightSideEdges === "number") {
        extension_1.glo.edgeExpanding.minDistanceBetweenRightSideEdges =
            fetchedMinDistanceBetweenRightSideEdges;
    }
    if (typeof fetchedAdditionalPaddingRight === "number") {
        extension_1.glo.edgeExpanding.additionalPaddingRight =
            fetchedAdditionalPaddingRight;
    }
    // end --------------
    const customColorOfDepth0 = bc.get("n05CustomColorOfDepth0");
    const customColorOfDepth1 = bc.get("n06CustomColorOfDepth1");
    const customColorOfDepth2 = bc.get("n07CustomColorOfDepth2");
    const customColorOfDepth3 = bc.get("n08CustomColorOfDepth3");
    const customColorOfDepth4 = bc.get("n09CustomColorOfDepth4");
    const customColorOfDepth5 = bc.get("n10CustomColorOfDepth5");
    const customColorOfDepth6 = bc.get("n11CustomColorOfDepth6");
    const customColorOfDepth7 = bc.get("n12CustomColorOfDepth7");
    const customColorOfDepth8 = bc.get("n13CustomColorOfDepth8");
    const customColorOfDepth9 = bc.get("n14CustomColorOfDepth9");
    const customColorOfDepth10 = bc.get("n15CustomColorOfDepth10");
    const customColorsOnEachDepth = [
        customColorOfDepth0,
        customColorOfDepth1,
        customColorOfDepth2,
        customColorOfDepth3,
        customColorOfDepth4,
        customColorOfDepth5,
        customColorOfDepth6,
        customColorOfDepth7,
        customColorOfDepth8,
        customColorOfDepth9,
        customColorOfDepth10,
    ];
    const customColorOfFocusedBlock = bc.get("n17CustomColorOfFocusedBlock");
    const customColorOfFocusedBlockBorder = bc.get("n18CustomColorOfFocusedBlockBorder");
    const customColorOfBlockBorder = bc.get("n19CustomColorOfBlockBorder");
    const customColorOfDepth0Border = bc.get("n20CustomColorOfDepth0Border");
    if (thisColorCombo) {
        extension_1.glo.coloring.onEachDepth = thisColorCombo.onEachDepth.map((color) => color); // important to copy the array, using map() or using [...array]
        extension_1.glo.coloring.focusedBlock = thisColorCombo.focusedBlock;
        extension_1.glo.coloring.border = thisColorCombo.border;
        extension_1.glo.coloring.borderOfDepth0 = thisColorCombo.borderOfDepth0;
        extension_1.glo.coloring.borderOfFocusedBlock = thisColorCombo.borderOfFocusedBlock;
    }
    customColorsOnEachDepth.map((color, i) => {
        if (color && color.trim()) {
            // glo.coloring.onEachDepth[i] = color;
            extension_1.glo.coloring.onEachDepth[i] = color;
        }
    });
    if (customColorOfFocusedBlock && customColorOfFocusedBlock.trim()) {
        extension_1.glo.coloring.focusedBlock = customColorOfFocusedBlock;
    }
    if (customColorOfFocusedBlockBorder &&
        customColorOfFocusedBlockBorder.trim()) {
        extension_1.glo.coloring.borderOfFocusedBlock = customColorOfFocusedBlockBorder;
    }
    if (customColorOfBlockBorder && customColorOfBlockBorder.trim()) {
        extension_1.glo.coloring.border = customColorOfBlockBorder;
    }
    if (customColorOfDepth0Border && customColorOfDepth0Border.trim()) {
        extension_1.glo.coloring.borderOfDepth0 = customColorOfDepth0Border;
    }
    // ===========
    const enableFocus = bc.get("n16EnableFocus");
    if (enableFocus) {
        extension_1.glo.enableFocus = true;
    }
    else if (enableFocus === false) {
        extension_1.glo.enableFocus = false;
    }
    // ===========
    const candBorderRadius = bc.get("n21BorderRadius");
    if (typeof candBorderRadius === "number" && candBorderRadius >= 0) {
        extension_1.glo.borderRadius = candBorderRadius;
    }
    // ===========
    const analyzeCurlyBrackets = bc.get("n22AnalyzeCurlyBrackets");
    if (analyzeCurlyBrackets) {
        extension_1.glo.analyzeCurlyBrackets = true;
    }
    else if (analyzeCurlyBrackets === false) {
        extension_1.glo.analyzeCurlyBrackets = false;
    }
    // ===========
    const analyzeSquareBrackets = bc.get("n23AnalyzeSquareBrackets");
    if (analyzeSquareBrackets) {
        extension_1.glo.analyzeSquareBrackets = true;
    }
    else if (analyzeSquareBrackets === false) {
        extension_1.glo.analyzeSquareBrackets = false;
    }
    // ===========
    const analyzeRoundBrackets = bc.get("n24AnalyzeRoundBrackets");
    if (analyzeRoundBrackets) {
        extension_1.glo.analyzeRoundBrackets = true;
    }
    else if (analyzeRoundBrackets === false) {
        extension_1.glo.analyzeRoundBrackets = false;
    }
    // ===========
    const analyzeTags = bc.get("n25AnalyzeTags");
    if (analyzeTags) {
        extension_1.glo.analyzeTags = true;
    }
    else if (analyzeTags === false) {
        extension_1.glo.analyzeTags = false;
    }
    // ===========
    const analyzeIndentDedentTokens = bc.get("n26AnalyzeIndentDedentTokens");
    if (analyzeIndentDedentTokens) {
        extension_1.glo.analyzeIndentDedentTokens = true;
    }
    else if (analyzeIndentDedentTokens === false) {
        extension_1.glo.analyzeIndentDedentTokens = false;
    }
    // ===========
    const alsoRenderBlocksInsideSingleLineAreas = bc.get("n27AlsoRenderBlocksInsideSingleLineAreas");
    if (alsoRenderBlocksInsideSingleLineAreas) {
        extension_1.glo.renderInSingleLineAreas = true;
    }
    else if (alsoRenderBlocksInsideSingleLineAreas === false) {
        extension_1.glo.renderInSingleLineAreas = false;
    }
    // ==============
    const timeToWaitBeforeRerenderAfterLastChangeEvent = bc.get("n28TimeToWaitBeforeRerenderAfterLastChangeEvent");
    if (typeof timeToWaitBeforeRerenderAfterLastChangeEvent === "number" &&
        timeToWaitBeforeRerenderAfterLastChangeEvent >= 0 &&
        timeToWaitBeforeRerenderAfterLastChangeEvent < 10) {
        extension_1.glo.renderTimerForChange =
            timeToWaitBeforeRerenderAfterLastChangeEvent * 1000;
    }
    // ==============
    const timeToWaitBeforeRerenderAfterlastFocusEvent = bc.get("n29TimeToWaitBeforeRerenderAfterLastFocusEvent");
    if (typeof timeToWaitBeforeRerenderAfterlastFocusEvent === "number" &&
        timeToWaitBeforeRerenderAfterlastFocusEvent >= 0 &&
        timeToWaitBeforeRerenderAfterlastFocusEvent < 10) {
        extension_1.glo.renderTimerForFocus =
            timeToWaitBeforeRerenderAfterlastFocusEvent * 1000;
    }
    // ==============
    const timeToWaitBeforeRerenderAfterlastScrollEvent = bc.get("n30TimeToWaitBeforeRerenderAfterLastScrollEvent");
    // console.log("iissss:", timeToWaitBeforeRerenderAfterlastScrollEvent);
    if (typeof timeToWaitBeforeRerenderAfterlastScrollEvent === "number" &&
        timeToWaitBeforeRerenderAfterlastScrollEvent >= 0 &&
        timeToWaitBeforeRerenderAfterlastScrollEvent < 10) {
        extension_1.glo.renderTimerForScroll =
            timeToWaitBeforeRerenderAfterlastScrollEvent * 1000;
    }
    // ==============
    const renderIncrementBeforeAndAfterVisibleRange = bc.get("n31RenderIncrementBeforeAndAfterVisibleRange");
    // console.log("iissss:", timeToWaitBeforeRerenderAfterlastScrollEvent);
    if (typeof renderIncrementBeforeAndAfterVisibleRange === "number" &&
        renderIncrementBeforeAndAfterVisibleRange >= -200 &&
        renderIncrementBeforeAndAfterVisibleRange <= 200) {
        extension_1.glo.renderIncBeforeAfterVisRange = Math.floor(renderIncrementBeforeAndAfterVisibleRange);
    }
    const customBlackListOfFileFormats = bc.get("n32BlackListOfFileFormats");
    // console.log(glo.coloring.border);
    if (typeof customBlackListOfFileFormats === "string") {
        const stringWithoutSpaces = customBlackListOfFileFormats.replace(/ /g, ``);
        const stringWithoutSpacesAndTabs = stringWithoutSpaces.replace(/	/g, ``);
        if (stringWithoutSpacesAndTabs) {
            const mySplitArr = stringWithoutSpacesAndTabs.split(",");
            extension_1.glo.blackListOfFileFormats = mySplitArr;
        }
        else {
            extension_1.glo.blackListOfFileFormats = [];
        }
    }
    // ! IMPORTANT
    extension_1.glo.coloring.border = exports.makeInnerKitchenNotation(extension_1.glo.coloring.border);
    extension_1.glo.coloring.borderOfDepth0 = exports.makeInnerKitchenNotation(extension_1.glo.coloring.borderOfDepth0);
    extension_1.glo.coloring.borderOfFocusedBlock = exports.makeInnerKitchenNotation(extension_1.glo.coloring.borderOfFocusedBlock);
    extension_1.glo.coloring.focusedBlock = exports.makeInnerKitchenNotation(extension_1.glo.coloring.focusedBlock, "back");
    extension_1.glo.coloring.onEachDepth = extension_1.glo.coloring.onEachDepth.map((color) => exports.makeInnerKitchenNotation(color, "back"));
    // console.log(">>>>>>>>>>>>>", glo.coloring.focusedBlock);
    const adCoFromDepth0ToInwardForAllBorders = bc.get("n33A01B1FromDepth0ToInwardForAllBorders");
    const adCoFromDepth0ToInwardForAllBackgrounds = bc.get("n33A01B2FromDepth0ToInwardForAllBackgrounds");
    // --------------------
    const adCoFromFocusToOutwardForAllBorders = bc.get("n33A02B1FromFocusToOutwardForAllBorders");
    const adCoFromFocusToOutwardForAllBackgrounds = bc.get("n33A02B2FromFocusToOutwardForAllBackgrounds");
    // --------------------
    const adCoFromDepth0ToInwardForFocusTreeBorders = bc.get("n33A03B1FromDepth0ToInwardForFocusTreeBorders");
    const adCoFromDepth0ToInwardForFocusTreeBackgrounds = bc.get("n33A03B2FromDepth0ToInwardForFocusTreeBackgrounds");
    // --------------------
    const adCoFromFocusToOutwardForFocusTreeBorders = bc.get("n33A04B1FromFocusToOutwardForFocusTreeBorders");
    const adCoFromFocusToOutwardForFocusTreeBackgrounds = bc.get("n33A04B2FromFocusToOutwardForFocusTreeBackgrounds");
    // --------------------
    const adCoFromFocusToInwardForAllBorders = bc.get("n33A05B1FromFocusToInwardForAllBorders");
    const adCoFromFocusToInwardForAllBackgrounds = bc.get("n33A05B2FromFocusToInwardForAllBackgrounds");
    // =======================
    // =======================
    // -----
    const advancedColoringSettingsOfBorders = [
        {
            val: adCoFromDepth0ToInwardForAllBorders,
            kind: AdvancedColoringFields.fromD0ToInward_All,
        },
        {
            val: adCoFromFocusToOutwardForAllBorders,
            kind: AdvancedColoringFields.fromFocusToOutward_All,
        },
        {
            val: adCoFromDepth0ToInwardForFocusTreeBorders,
            kind: AdvancedColoringFields.fromD0ToInward_FocusTree,
        },
        {
            val: adCoFromFocusToOutwardForFocusTreeBorders,
            kind: AdvancedColoringFields.fromFocusToOutward_FocusTree,
        },
        {
            val: adCoFromFocusToInwardForAllBorders,
            kind: AdvancedColoringFields.fromFocusToInward_All,
        },
    ];
    const advancedColoringSettingsOfBackgrounds = [
        {
            val: adCoFromDepth0ToInwardForAllBackgrounds,
            kind: AdvancedColoringFields.fromD0ToInward_All,
        },
        {
            val: adCoFromFocusToOutwardForAllBackgrounds,
            kind: AdvancedColoringFields.fromFocusToOutward_All,
        },
        {
            val: adCoFromDepth0ToInwardForFocusTreeBackgrounds,
            kind: AdvancedColoringFields.fromD0ToInward_FocusTree,
        },
        {
            val: adCoFromFocusToOutwardForFocusTreeBackgrounds,
            kind: AdvancedColoringFields.fromFocusToOutward_FocusTree,
        },
        {
            val: adCoFromFocusToInwardForAllBackgrounds,
            kind: AdvancedColoringFields.fromFocusToInward_All,
        },
    ];
    const processAC = (arr, tempTransparent) => {
        return arr
            .map((x) => ({
            kind: x.kind,
            val: generateOneChainOfColorsForEachDepth(x.val, tempTransparent),
        }))
            .filter((x) => !!x.val)
            .map((x) => ({
            priority: x.val.priority,
            sequence: x.val.sequence,
            kind: x.kind,
        }))
            .sort((a, b) => b.priority - a.priority); // descending order
    };
    extension_1.glo.coloring.advanced.forBorders = processAC(advancedColoringSettingsOfBorders);
    extension_1.glo.coloring.advanced.forBackgrounds = processAC(advancedColoringSettingsOfBackgrounds, "back");
    // ..........
};
exports.applyAllBlockmanSettings = applyAllBlockmanSettings;
//# sourceMappingURL=settingsManager.js.map