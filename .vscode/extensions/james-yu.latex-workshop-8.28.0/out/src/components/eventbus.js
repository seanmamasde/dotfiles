"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventBus = exports.CachedContentUpdated = exports.FindRootFileEnd = exports.RootFileChanged = exports.PdfViewerStatusChanged = exports.PdfViewerPagesLoaded = exports.BuildFinished = void 0;
const events_1 = require("events");
exports.BuildFinished = 'buildfinished';
exports.PdfViewerPagesLoaded = 'pdfviewerpagesloaded';
exports.PdfViewerStatusChanged = 'pdfviewerstatuschanged';
exports.RootFileChanged = 'rootfilechanged';
exports.FindRootFileEnd = 'findrootfileend';
exports.CachedContentUpdated = 'cachedcontentupdated';
class EventBus {
    constructor() {
        this.eventEmitter = new events_1.EventEmitter();
    }
    dispose() {
        this.eventEmitter.removeAllListeners();
    }
    fire(eventName, arg) {
        this.eventEmitter.emit(eventName, arg);
    }
    onDidChangeRootFile(cb) {
        return this.registerListener('rootfilechanged', cb);
    }
    onDidEndFindRootFile(cb) {
        return this.registerListener('findrootfileend', cb);
    }
    onDidUpdateCachedContent(cb) {
        return this.registerListener('cachedcontentupdated', cb);
    }
    onDidChangePdfViewerStatus(cb) {
        return this.registerListener('pdfviewerstatuschanged', cb);
    }
    registerListener(eventName, cb) {
        this.eventEmitter.on(eventName, cb);
        const disposable = {
            dispose: () => { this.eventEmitter.removeListener(eventName, cb); }
        };
        return disposable;
    }
    on(eventName, argCb) {
        const cb = () => argCb();
        this.eventEmitter.on(eventName, cb);
        const disposable = {
            dispose: () => { this.eventEmitter.removeListener(eventName, cb); }
        };
        return disposable;
    }
}
exports.EventBus = EventBus;
//# sourceMappingURL=eventbus.js.map