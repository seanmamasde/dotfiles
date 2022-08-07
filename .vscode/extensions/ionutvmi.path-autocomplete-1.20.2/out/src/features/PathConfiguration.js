"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = __importDefault(require("vscode"));
class PathConfiguration {
    constructor() {
        this.data = {};
        this.update();
    }
    update(fileUri) {
        const codeConfiguration = vscode_1.default.workspace.getConfiguration('path-autocomplete', fileUri || null);
        this.data.withExtension = codeConfiguration.get('includeExtension');
        this.data.withExtensionOnImport = codeConfiguration.get('extensionOnImport');
        this.data.excludedItems = codeConfiguration.get('excludedItems');
        this.data.pathMappings = codeConfiguration.get('pathMappings');
        this.data.pathSeparators = codeConfiguration.get('pathSeparators');
        this.data.transformations = codeConfiguration.get('transformations');
        this.data.triggerOutsideStrings = codeConfiguration.get('triggerOutsideStrings');
        this.data.disableUpOneFolder = codeConfiguration.get('disableUpOneFolder');
        this.data.useBackslash = codeConfiguration.get('useBackslash');
        this.data.enableFolderTrailingSlash = codeConfiguration.get('enableFolderTrailingSlash');
        this.data.ignoredFilesPattern = codeConfiguration.get('ignoredFilesPattern');
        this.data.ignoredPrefixes = codeConfiguration.get('ignoredPrefixes');
        this.data.homeDirectory =
            process.env[process.platform === 'win32' ? 'USERPROFILE' : 'HOME'];
        const workspaceRootFolder = vscode_1.default.workspace.workspaceFolders
            ? vscode_1.default.workspace.workspaceFolders[0]
            : null;
        let workspaceFolder = workspaceRootFolder;
        if (fileUri) {
            workspaceFolder = vscode_1.default.workspace.getWorkspaceFolder(fileUri);
        }
        this.data.workspaceFolderPath = workspaceFolder && workspaceFolder.uri.fsPath;
        this.data.workspaceRootPath = workspaceRootFolder && workspaceRootFolder.uri.fsPath;
    }
}
exports.default = PathConfiguration;
PathConfiguration.configuration = new PathConfiguration();
//# sourceMappingURL=PathConfiguration.js.map