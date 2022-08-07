"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PdfViewerManagerService = void 0;
class PdfViewerManagerService {
    constructor(extension) {
        this.webviewPanelMap = new Map();
        this.clientMap = new Map();
        this.extension = extension;
    }
    toKey(pdfFileUri) {
        return pdfFileUri.toString(true).toLocaleUpperCase();
    }
    createClientSet(pdfFileUri) {
        const key = this.toKey(pdfFileUri);
        if (!this.clientMap.has(key)) {
            this.clientMap.set(key, new Set());
        }
        if (!this.webviewPanelMap.has(key)) {
            this.webviewPanelMap.set(key, new Set());
        }
    }
    /**
     * Returns the set of client instances of a PDF file.
     * Returns `undefined` if the viewer have not recieved any request for the PDF file.
     *
     * @param pdfFileUri The path of a PDF file.
     */
    getClientSet(pdfFileUri) {
        return this.clientMap.get(this.toKey(pdfFileUri));
    }
    getPanelSet(pdfFileUri) {
        return this.webviewPanelMap.get(this.toKey(pdfFileUri));
    }
    findClient(pdfFileUri, websocket) {
        const clientSet = this.getClientSet(pdfFileUri);
        if (clientSet === undefined) {
            return;
        }
        for (const client of clientSet) {
            if (client.websocket === websocket) {
                return client;
            }
        }
        return;
    }
    initiatePdfViewerPanel(pdfPanel) {
        const pdfFileUri = pdfPanel.pdfFileUri;
        this.extension.manager.watchPdfFile(pdfFileUri);
        this.createClientSet(pdfFileUri);
        const panelSet = this.getPanelSet(pdfFileUri);
        if (!panelSet) {
            return;
        }
        panelSet.add(pdfPanel);
        pdfPanel.webviewPanel.onDidDispose(() => {
            panelSet.delete(pdfPanel);
        });
        return pdfPanel;
    }
}
exports.PdfViewerManagerService = PdfViewerManagerService;
//# sourceMappingURL=pdfviewermanager.js.map