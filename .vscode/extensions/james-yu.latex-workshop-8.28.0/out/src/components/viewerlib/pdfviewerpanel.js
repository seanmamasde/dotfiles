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
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _PdfViewerPanel_state;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PdfViewerPanelService = exports.PdfViewerPanelSerializer = exports.PdfViewerPanel = void 0;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const utils_1 = require("../../utils/utils");
const eventbus_1 = require("../eventbus");
class PdfViewerPanel {
    constructor(extension, pdfFileUri, panel) {
        _PdfViewerPanel_state.set(this, void 0);
        this.extension = extension;
        this.pdfFileUri = pdfFileUri;
        this.webviewPanel = panel;
        panel.webview.onDidReceiveMessage((msg) => {
            switch (msg.type) {
                case 'state': {
                    __classPrivateFieldSet(this, _PdfViewerPanel_state, msg.state, "f");
                    this.extension.eventBus.fire(eventbus_1.PdfViewerStatusChanged, msg.state);
                    break;
                }
                default: {
                    break;
                }
            }
        });
    }
    get state() {
        return __classPrivateFieldGet(this, _PdfViewerPanel_state, "f");
    }
}
exports.PdfViewerPanel = PdfViewerPanel;
_PdfViewerPanel_state = new WeakMap();
class PdfViewerPanelSerializer {
    constructor(extension, panelService, service) {
        this.extension = extension;
        this.panelService = panelService;
        this.managerService = service;
    }
    async deserializeWebviewPanel(panel, argState) {
        await this.extension.server.serverStarted;
        this.extension.logger.addLogMessage(`Restoring the PDF viewer at the column ${panel.viewColumn} from the state: ${JSON.stringify(argState)}`);
        const state = argState.state;
        let pdfFileUri;
        if (state.path) {
            pdfFileUri = vscode.Uri.file(state.path);
        }
        else if (state.pdfFileUri) {
            pdfFileUri = vscode.Uri.parse(state.pdfFileUri, true);
        }
        if (!pdfFileUri) {
            this.extension.logger.addLogMessage('Error of restoring PDF viewer: the path of PDF file is undefined.');
            panel.webview.html = '<!DOCTYPE html> <html lang="en"><meta charset="utf-8"/><br>The path of PDF file is undefined.</html>';
            return;
        }
        if (!await this.extension.lwfs.exists(pdfFileUri)) {
            const s = (0, utils_1.escapeHtml)(pdfFileUri.toString());
            this.extension.logger.addLogMessage(`Error of restoring PDF viewer: file not found ${pdfFileUri.toString(true)}.`);
            panel.webview.html = `<!DOCTYPE html> <html lang="en"><meta charset="utf-8"/><br>File not found: ${s}</html>`;
            return;
        }
        panel.webview.html = await this.panelService.getPDFViewerContent(pdfFileUri);
        const pdfPanel = new PdfViewerPanel(this.extension, pdfFileUri, panel);
        this.managerService.initiatePdfViewerPanel(pdfPanel);
        return;
    }
}
exports.PdfViewerPanelSerializer = PdfViewerPanelSerializer;
class PdfViewerPanelService {
    constructor(extension) {
        this.alreadyOpened = false;
        this.extension = extension;
    }
    encodePathWithPrefix(pdfFileUri) {
        return this.extension.server.pdfFilePathEncoder.encodePathWithPrefix(pdfFileUri);
    }
    async tweakForCodespaces(url) {
        if (this.alreadyOpened) {
            return;
        }
        if (vscode.env.remoteName === 'codespaces' && vscode.env.uiKind === vscode.UIKind.Web) {
            const configuration = vscode.workspace.getConfiguration('latex-workshop');
            const delay = configuration.get('codespaces.portforwarding.openDelay', 20000);
            // We have to open the url in a browser tab for the authentication of port forwarding through githubpreview.dev.
            await vscode.env.openExternal(url);
            await (0, utils_1.sleep)(delay);
        }
        this.alreadyOpened = true;
    }
    async createPdfViewerPanel(pdfFileUri, viewColumn) {
        await this.extension.server.serverStarted;
        const htmlContent = await this.getPDFViewerContent(pdfFileUri);
        const panel = vscode.window.createWebviewPanel('latex-workshop-pdf', path.basename(pdfFileUri.path), viewColumn, {
            enableScripts: true,
            retainContextWhenHidden: true
        });
        panel.webview.html = htmlContent;
        const pdfPanel = new PdfViewerPanel(this.extension, pdfFileUri, panel);
        return pdfPanel;
    }
    getKeyboardEventConfig() {
        const configuration = vscode.workspace.getConfiguration('latex-workshop');
        const setting = configuration.get('viewer.pdf.internal.keyboardEvent', 'auto');
        if (setting === 'auto') {
            return true;
        }
        else if (setting === 'force') {
            return true;
        }
        else {
            return false;
        }
    }
    /**
     * Returns the HTML content of the internal PDF viewer.
     *
     * @param pdfFile The path of a PDF file to be opened.
     */
    async getPDFViewerContent(pdfFile) {
        const serverPort = this.extension.server.port;
        // viewer/viewer.js automatically requests the file to server.ts, and server.ts decodes the encoded path of PDF file.
        const origUrl = `http://127.0.0.1:${serverPort}/viewer.html?file=${this.encodePathWithPrefix(pdfFile)}`;
        const url = await vscode.env.asExternalUri(vscode.Uri.parse(origUrl, true));
        const iframeSrcOrigin = `${url.scheme}://${url.authority}`;
        const iframeSrcUrl = url.toString(true);
        await this.tweakForCodespaces(url);
        this.extension.logger.addLogMessage(`The internal PDF viewer url: ${iframeSrcUrl}`);
        const rebroadcast = this.getKeyboardEventConfig();
        return `
        <!DOCTYPE html><html><head><meta http-equiv="Content-Security-Policy" content="default-src 'none'; base-uri 'none'; frame-src ${iframeSrcOrigin}; script-src 'unsafe-inline'; style-src 'unsafe-inline';"></head>
        <body><iframe id="preview-panel" class="preview-panel" src="${iframeSrcUrl}" style="position:absolute; border: none; left: 0; top: 0; width: 100%; height: 100%;">
        </iframe>
        <script>
        // When the tab gets focus again later, move the
        // the focus to the iframe so that keyboard navigation works in the pdf.
        const iframe = document.getElementById('preview-panel');
        window.onfocus = function() {
            setTimeout(function() { // doesn't work immediately
                iframe.contentWindow.focus();
            }, 100);
        }
        
        const vsStore = acquireVsCodeApi();
        // To enable keyboard shortcuts of VS Code when the iframe is focused,
        // we have to dispatch keyboard events in the parent window.
        // See https://github.com/microsoft/vscode/issues/65452#issuecomment-586036474
        window.addEventListener('message', (e) => {
            if (e.origin !== '${iframeSrcOrigin}') {
                return;
            }
            switch (e.data.type) {
                case 'initialized': {
                    const state = vsStore.getState();
                    if (state) {
                        state.type = 'restore_state';
                        iframe.contentWindow.postMessage(state, '${iframeSrcOrigin}');
                    } else {
                        iframe.contentWindow.postMessage({type: 'restore_state', state: {kind: 'not_stored'} }, '${iframeSrcOrigin}');
                    }
                    break;
                }
                case 'keyboard_event': {
                    if (${rebroadcast}) {
                        window.dispatchEvent(new KeyboardEvent('keydown', e.data.event));
                    }
                    break;
                }
                case 'state': {
                    vsStore.setState(e.data);
                    break;
                }
                default:
                break;
            }
            vsStore.postMessage(e.data)
        });
        </script>
        </body></html>
        `;
    }
}
exports.PdfViewerPanelService = PdfViewerPanelService;
//# sourceMappingURL=pdfviewerpanel.js.map