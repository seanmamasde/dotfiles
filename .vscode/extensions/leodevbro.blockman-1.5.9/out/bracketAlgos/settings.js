"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const textMateLoader_1 = require("./textMateLoader");
class Settings {
    constructor() {
        // const workspaceColors = vscode.workspace.getConfiguration(
        //     "workbench.colorCustomizations",
        //     undefined,
        // );
        this.TextMateLoader = new textMateLoader_1.default();
        this.isDisposed = false;
        // const configuration = vscode.workspace.getConfiguration(
        //     "bracket-pair-colorizer-2",
        //     undefined,
        // );
        // this.scopeLineRelativePosition = configuration.get(
        //     "scopeLineRelativePosition",
        // ) as boolean;
        // if (typeof this.scopeLineRelativePosition !== "boolean") {
        //     throw new Error("scopeLineRelativePosition is not a boolean");
        // }
        // this.showBracketsInGutter = configuration.get(
        //     "showBracketsInGutter",
        // ) as boolean;
        // if (typeof this.showBracketsInGutter !== "boolean") {
        //     throw new Error("showBracketsInGutter is not a boolean");
        // }
        // this.showBracketsInRuler = configuration.get(
        //     "showBracketsInRuler",
        // ) as boolean;
        // if (typeof this.showBracketsInRuler !== "boolean") {
        //     throw new Error("showBracketsInRuler is not a boolean");
        // }
        // this.rulerPosition = configuration.get("rulerPosition") as string;
        // if (typeof this.rulerPosition !== "string") {
        //     throw new Error("rulerPosition is not a string");
        // }
        // this.unmatchedScopeColor = configuration.get(
        //     "unmatchedScopeColor",
        // ) as string;
        // if (typeof this.unmatchedScopeColor !== "string") {
        //     throw new Error("unmatchedScopeColor is not a string");
        // }
        // this.forceUniqueOpeningColor = configuration.get(
        //     "forceUniqueOpeningColor",
        // ) as boolean;
        // if (typeof this.forceUniqueOpeningColor !== "boolean") {
        //     throw new Error("forceUniqueOpeningColor is not a boolean");
        // }
        // this.forceIterationColorCycle = configuration.get(
        //     "forceIterationColorCycle",
        // ) as boolean;
        // if (typeof this.forceIterationColorCycle !== "boolean") {
        //     throw new Error("forceIterationColorCycle is not a boolean");
        // }
        // this.colorMode = (ColorMode as any)[
        //     configuration.get("colorMode") as string
        // ];
        // if (typeof this.colorMode !== "number") {
        //     throw new Error("colorMode enum could not be parsed");
        // }
        // this.colors = configuration.get("colors") as string[];
        // if (!Array.isArray(this.colors)) {
        //     throw new Error("colors is not an array");
        // }
        // const excludedLanguages = configuration.get(
        //     "excludedLanguages",
        // ) as string[];
        // if (!Array.isArray(excludedLanguages)) {
        //     throw new Error("excludedLanguages is not an array");
        // }
        this.excludedLanguages = new Set([]);
    }
}
exports.default = Settings;
//# sourceMappingURL=settings.js.map