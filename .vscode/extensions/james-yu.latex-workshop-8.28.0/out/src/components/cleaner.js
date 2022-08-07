"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cleaner = void 0;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const glob_1 = __importDefault(require("glob"));
const cs = __importStar(require("cross-spawn"));
/**
 * Removes the duplicate elements. Note that the order of the sequence will not be preserved.
 */
function unique(sequence) {
    return Array.from(new Set(sequence));
}
/**
 * Globs all given patterns into absolute paths. The result will be sorted in
 * reverse order and all tailing slashes will be stripped.
 *
 * The result is sorted in descending dictionary order, make sure the children are sorted before the parents.
 * For example: [..., 'out/folder1/folder2/', 'out/folder1/', ...] ('out/folder1/folder2/' > 'out/folder1/' in directory order)
 */
function globAll(globs, cwd) {
    return unique(globs.map(g => glob_1.default.sync(g, { cwd }))
        .flat()
        .map((globedPath) => path.resolve(cwd, globedPath))).sort((a, b) => b.localeCompare(a));
}
class Cleaner {
    constructor(extension) {
        this.extension = extension;
    }
    async clean(rootFile) {
        if (!rootFile) {
            if (this.extension.manager.rootFile !== undefined) {
                await this.extension.manager.findRoot();
            }
            rootFile = this.extension.manager.rootFile;
            if (!rootFile) {
                this.extension.logger.addLogMessage('Cannot determine the root file to be cleaned.');
                return;
            }
        }
        const configuration = vscode.workspace.getConfiguration('latex-workshop');
        const cleanMethod = configuration.get('latex.clean.method');
        switch (cleanMethod) {
            case 'glob':
                return this.cleanGlob(rootFile);
            case 'cleanCommand':
                return this.cleanCommand(rootFile);
            default:
                this.extension.logger.addLogMessage(`Unknown cleaning method: ${cleanMethod}`);
                return;
        }
    }
    /**
     * Splits the given glob patterns into three distinct groups (duplicates will be ignored)
     *   1. file or folder globs (not end with tailing slashes)
     *   2. globs explicitly for folders
     *   3. folder globs with globstar (`**`)
     *
     * We will remove the <1.> type paths if they are files, remove the <2.> type
     * paths if they are empty folders, and ignore the <3.> type paths.
     *
     * @param globs a list of glob patterns
     * @returns three distinct groups of glob patterns
     */
    static splitGlobs(globs) {
        const fileOrFolderGlobs = [];
        const folderGlobsWithGlobstar = [];
        const folderGlobsExplicit = [];
        for (const pattern of unique(globs)) {
            if (pattern.endsWith(path.sep)) {
                if (path.basename(pattern).includes('**')) {
                    folderGlobsWithGlobstar.push(pattern);
                }
                else {
                    folderGlobsExplicit.push(pattern);
                }
            }
            else {
                fileOrFolderGlobs.push(pattern);
            }
        }
        return { fileOrFolderGlobs, folderGlobsExplicit, folderGlobsWithGlobstar };
    }
    /**
     * Removes files in `outDir` matching the glob patterns.
     *
     * Also removes empty folders explicitly specified by the glob pattern. We
     * only remove folders that are empty and the folder glob pattern is added
     * intentionally by the user. Otherwise, the folders will be ignored.
     */
    async cleanGlob(rootFile) {
        const configuration = vscode.workspace.getConfiguration('latex-workshop', vscode.Uri.file(rootFile));
        let globs = configuration.get('latex.clean.fileTypes');
        const outdir = path.resolve(path.dirname(rootFile), this.extension.manager.getOutDir(rootFile));
        if (configuration.get('latex.clean.subfolder.enabled')) {
            globs = globs.map(globType => './**/' + globType);
        }
        this.extension.logger.addLogMessage(`Clean glob matched files: ${JSON.stringify({ globs, outdir })}`);
        const { fileOrFolderGlobs, folderGlobsExplicit, folderGlobsWithGlobstar } = Cleaner.splitGlobs(globs);
        this.extension.logger.addLogMessage(`Ignore folder glob patterns with globstar: ${folderGlobsWithGlobstar}`);
        const explicitFolders = globAll(folderGlobsExplicit, outdir);
        const explicitFoldersSet = new Set(explicitFolders);
        const filesOrFolders = globAll(fileOrFolderGlobs, outdir).filter(file => !explicitFoldersSet.has(file));
        // Remove files first
        for (const realPath of filesOrFolders) {
            try {
                const stats = fs.statSync(realPath);
                if (stats.isFile()) {
                    await fs.promises.unlink(realPath);
                    this.extension.logger.addLogMessage(`Cleaning file: ${realPath}`);
                }
                else if (stats.isDirectory()) {
                    this.extension.logger.addLogMessage(`Not removing folder that is not explicitly specified: ${realPath}`);
                }
                else {
                    this.extension.logger.addLogMessage(`Not removing non-file: ${realPath}`);
                }
            }
            catch (err) {
                this.extension.logger.addLogMessage(`Error cleaning path: ${realPath}`);
                if (err instanceof Error) {
                    this.extension.logger.logError(err);
                }
            }
        }
        // Then remove empty folders EXPLICITLY specified by the user
        for (const folderRealPath of explicitFolders) {
            try {
                if (fs.readdirSync(folderRealPath).length === 0) {
                    await fs.promises.rmdir(folderRealPath);
                    this.extension.logger.addLogMessage(`Removing empty folder: ${folderRealPath}`);
                }
                else {
                    this.extension.logger.addLogMessage(`Not removing non-empty folder: ${folderRealPath}`);
                }
            }
            catch (err) {
                this.extension.logger.addLogMessage(`Error cleaning folder: ${folderRealPath}`);
                if (err instanceof Error) {
                    this.extension.logger.logError(err);
                }
            }
        }
    }
    cleanCommand(rootFile) {
        const configuration = vscode.workspace.getConfiguration('latex-workshop', vscode.Uri.file(rootFile));
        const command = configuration.get('latex.clean.command');
        let args = configuration.get('latex.clean.args');
        if (args) {
            args = args.map(arg => arg.replace('%TEX%', rootFile));
        }
        this.extension.logger.logCommand('Clean temporary files command', command, args);
        return new Promise((resolve, _reject) => {
            const proc = cs.spawn(command, args, { cwd: path.dirname(rootFile), detached: true });
            let stderr = '';
            proc.stderr.on('data', newStderr => {
                stderr += newStderr;
            });
            proc.on('error', err => {
                this.extension.logger.addLogMessage(`Cannot run ${command}: ${err.message}, ${stderr}`);
                if (err instanceof Error) {
                    this.extension.logger.logError(err);
                }
                resolve();
            });
            proc.on('exit', exitCode => {
                if (exitCode !== 0) {
                    this.extension.logger.addLogMessage(`The clean command failed with exit code ${exitCode}`);
                    this.extension.logger.addLogMessage(`Clean command stderr: ${stderr}`);
                }
                resolve();
            });
        });
    }
}
exports.Cleaner = Cleaner;
//# sourceMappingURL=cleaner.js.map