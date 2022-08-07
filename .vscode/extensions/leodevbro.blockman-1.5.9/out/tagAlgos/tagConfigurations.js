"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultEmptyElements = void 0;
const vscode = require("vscode");
// import { TagStylerConfig } from "./tagStyler";
const extensionId = "highlight-matching-tag";
const defaultEmptyElements = [
    // "div",
    "area",
    "base",
    "br",
    "col",
    "embed",
    "hr",
    "img",
    "input",
    "keygen",
    "link",
    "meta",
    "param",
    "source",
    "track",
    "wbr",
];
exports.defaultEmptyElements = defaultEmptyElements;
class Configuration {
    get config() {
        const editor = vscode.window.activeTextEditor;
        return vscode.workspace.getConfiguration(extensionId, editor && editor.document.uri);
    }
    get isEnabled() {
        return !!this.config.get("enabled");
    }
    get highlightSelfClosing() {
        // return !!this.config.get("highlightSelfClosing");
        return false;
    }
    get highlightFromContent() {
        return !!this.config.get("highlightFromContent");
        // return false;
    }
    get highlightFromName() {
        return !!this.config.get("highlightFromName");
    }
    get highlightFromAttributes() {
        return !!this.config.get("highlightFromAttributes");
    }
    get showPath() {
        return !!this.config.get("showPath");
    }
    get showRuler() {
        return !!this.config.get("showRuler");
    }
    get emptyElements() {
        const defaultEmptyTags = this.config.get("noDefaultEmptyElements")
            ? []
            : defaultEmptyElements;
        const customEmptyTags = this.config.get("customEmptyElements") || [];
        return [...defaultEmptyTags, ...customEmptyTags];
    }
    // get styles() {
    //     return this.config.get<TagStylerConfig>("styles");
    // }
    get hasOldSettings() {
        return !!(this.config.get("style") ||
            this.config.get("leftStyle") ||
            this.config.get("rightStyle") ||
            this.config.get("beginningStyle") ||
            this.config.get("endingStyle"));
    }
}
const configuration = new Configuration();
exports.default = configuration;
//# sourceMappingURL=tagConfigurations.js.map