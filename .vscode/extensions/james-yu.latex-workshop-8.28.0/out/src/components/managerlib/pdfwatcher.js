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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PdfWatcher = void 0;
const vscode = __importStar(require("vscode"));
const chokidar = __importStar(require("chokidar"));
class PdfWatcher {
    constructor(extension) {
        this.watchedPdfLocalPaths = new Set();
        this.watchedPdfVirtualUris = new Set();
        this.ignoredPdfUris = new Set();
        this.extension = extension;
        this.pdfWatcher = this.initiatePdfWatcher();
        this.initiateVirtualUriWatcher();
    }
    async dispose() {
        await this.pdfWatcher.close();
    }
    toKey(pdfFileUri) {
        return pdfFileUri.toString(true);
    }
    initiatePdfWatcher() {
        const configuration = vscode.workspace.getConfiguration('latex-workshop');
        const usePolling = configuration.get('latex.watch.usePolling');
        const interval = configuration.get('latex.watch.interval');
        const pdfDelay = configuration.get('latex.watch.pdfDelay');
        const pdfWatcherOptions = {
            useFsEvents: false,
            usePolling,
            interval,
            binaryInterval: Math.max(interval, 1000),
            awaitWriteFinish: { stabilityThreshold: pdfDelay }
        };
        this.extension.logger.addLogMessage('Creating PDF file watcher.');
        this.extension.logger.addLogMessage(`watcherOptions: ${JSON.stringify(pdfWatcherOptions)}`);
        const pdfWatcher = chokidar.watch([], pdfWatcherOptions);
        pdfWatcher.on('change', (file) => this.onWatchedPdfChanged(file));
        pdfWatcher.on('unlink', (file) => this.onWatchedPdfDeleted(file));
        return pdfWatcher;
    }
    isWatchedVirtualUri(pdfFile) {
        if (this.extension.lwfs.isVirtualUri(pdfFile)) {
            const key = this.toKey(pdfFile);
            return this.watchedPdfVirtualUris.has(key);
        }
        else {
            return false;
        }
    }
    initiateVirtualUriWatcher() {
        const virtualUriWatcher = vscode.workspace.createFileSystemWatcher('**/*.{pdf,PDF}', false, false, true);
        const cb = (fileUri) => {
            if (this.isIgnored(fileUri)) {
                return;
            }
            if (this.isWatchedVirtualUri(fileUri)) {
                this.extension.viewer.refreshExistingViewer();
            }
        };
        // It is recommended to react to both change and create events.
        // See https://github.com/microsoft/vscode/issues/136460#issuecomment-982605100
        virtualUriWatcher.onDidChange(cb);
        virtualUriWatcher.onDidCreate(cb);
        return virtualUriWatcher;
    }
    onWatchedPdfChanged(file) {
        if (this.isIgnored(file)) {
            return;
        }
        this.extension.logger.addLogMessage(`PDF file watcher - file changed: ${file}`);
        this.extension.viewer.refreshExistingViewer();
    }
    onWatchedPdfDeleted(file) {
        this.extension.logger.addLogMessage(`PDF file watcher - file deleted: ${file}`);
        this.pdfWatcher.unwatch(file);
        this.watchedPdfLocalPaths.delete(file);
    }
    watchPdfFile(pdfFileUri) {
        const isLocal = this.extension.lwfs.isLocalUri(pdfFileUri);
        if (isLocal) {
            const pdfFilePath = pdfFileUri.fsPath;
            if (!this.watchedPdfLocalPaths.has(pdfFilePath)) {
                this.extension.logger.addLogMessage(`Added to PDF file watcher: ${pdfFileUri.toString(true)}`);
                this.pdfWatcher.add(pdfFilePath);
                this.watchedPdfLocalPaths.add(pdfFilePath);
            }
        }
        else {
            this.watchedPdfVirtualUris.add(this.toKey(pdfFileUri));
        }
    }
    isIgnored(pdfFile) {
        let pdfFileUri;
        if (typeof pdfFile === 'string') {
            pdfFileUri = vscode.Uri.file(pdfFile);
        }
        else {
            pdfFileUri = pdfFile;
        }
        const key = this.toKey(pdfFileUri);
        return this.ignoredPdfUris.has(key);
    }
    ignorePdfFile(pdfFileUri) {
        this.ignoredPdfUris.add(this.toKey(pdfFileUri));
    }
    logWatchedFiles() {
        this.extension.logger.addLogMessage(`PdfWatcher.pdfWatcher.getWatched: ${JSON.stringify(this.pdfWatcher.getWatched())}`);
        this.extension.logger.addLogMessage(`PdfWatcher.pdfsWatched: ${JSON.stringify(Array.from(this.watchedPdfLocalPaths))}`);
        this.extension.logger.addLogMessage(`PdfWatcher.watchedPdfVirtualUris: ${JSON.stringify(Array.from(this.watchedPdfVirtualUris))}`);
        this.extension.logger.addLogMessage(`PdfWatcher.ignoredPdfUris: ${JSON.stringify(Array.from(this.ignoredPdfUris))}`);
    }
}
exports.PdfWatcher = PdfWatcher;
//# sourceMappingURL=pdfwatcher.js.map