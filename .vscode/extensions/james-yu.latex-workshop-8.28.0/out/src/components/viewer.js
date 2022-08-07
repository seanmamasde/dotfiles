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
exports.Viewer = exports.PdfViewerHookProvider = void 0;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const cs = __importStar(require("cross-spawn"));
const webview_1 = require("../utils/webview");
const theme_1 = require("../utils/theme");
const client_1 = require("./viewerlib/client");
const pdfviewerpanel_1 = require("./viewerlib/pdfviewerpanel");
const pdfviewermanager_1 = require("./viewerlib/pdfviewermanager");
const eventbus_1 = require("./eventbus");
var pdfviewerhook_1 = require("./viewerlib/pdfviewerhook");
Object.defineProperty(exports, "PdfViewerHookProvider", { enumerable: true, get: function () { return pdfviewerhook_1.PdfViewerHookProvider; } });
class Viewer {
    constructor(extension) {
        this.extension = extension;
        this.panelService = new pdfviewerpanel_1.PdfViewerPanelService(extension);
        this.managerService = new pdfviewermanager_1.PdfViewerManagerService(extension);
        this.pdfViewerPanelSerializer = new pdfviewerpanel_1.PdfViewerPanelSerializer(extension, this.panelService, this.managerService);
    }
    createClientSet(pdfFileUri) {
        this.managerService.createClientSet(pdfFileUri);
    }
    /**
     * Returns the set of client instances of a PDF file.
     * Returns `undefined` if the viewer have not recieved any request for the PDF file.
     *
     * @param pdfFileUri The path of a PDF file.
     */
    getClientSet(pdfFileUri) {
        return this.managerService.getClientSet(pdfFileUri);
    }
    getPanelSet(pdfFileUri) {
        return this.managerService.getPanelSet(pdfFileUri);
    }
    get clientMap() {
        return this.managerService.clientMap;
    }
    initiatePdfViewerPanel(pdfPanel) {
        return this.managerService.initiatePdfViewerPanel(pdfPanel);
    }
    encodePathWithPrefix(pdfFileUri) {
        return this.extension.server.pdfFilePathEncoder.encodePathWithPrefix(pdfFileUri);
    }
    /**
     * Refreshes PDF viewers of `sourceFile`.
     *
     * @param sourceFile The path of a LaTeX file. If `sourceFile` is `undefined`,
     * refreshes all the PDF viewers.
     */
    refreshExistingViewer(sourceFile) {
        this.extension.logger.addLogMessage(`Call refreshExistingViewer: ${JSON.stringify({ sourceFile })}`);
        if (sourceFile === undefined) {
            this.clientMap.forEach(clientSet => {
                clientSet.forEach(client => {
                    client.send({ type: 'refresh' });
                });
            });
            return;
        }
        const pdfFile = this.tex2pdf(sourceFile, true);
        const clientSet = this.getClientSet(pdfFile);
        if (!clientSet) {
            this.extension.logger.addLogMessage(`Not found PDF viewers to refresh: ${pdfFile}`);
            return;
        }
        this.extension.logger.addLogMessage(`Refresh PDF viewer: ${pdfFile}`);
        clientSet.forEach(client => {
            client.send({ type: 'refresh' });
        });
    }
    async checkViewer(sourceFile, respectOutDir = true) {
        const pdfFile = this.tex2pdf(sourceFile, respectOutDir);
        if (!await this.extension.lwfs.exists(pdfFile)) {
            this.extension.logger.addLogMessage(`Cannot find PDF file ${pdfFile}`);
            this.extension.logger.displayStatus('check', 'statusBar.foreground', `Cannot view file PDF file. File not found: ${pdfFile}`, 'warning');
            return;
        }
        const url = `http://127.0.0.1:${this.extension.server.port}/viewer.html?file=${this.encodePathWithPrefix(pdfFile)}`;
        return url;
    }
    /**
     * Opens the PDF file of `sourceFile` in the browser.
     *
     * @param sourceFile The path of a LaTeX file.
     */
    async openBrowser(sourceFile) {
        const url = await this.checkViewer(sourceFile, true);
        if (!url) {
            return;
        }
        const pdfFileUri = this.tex2pdf(sourceFile);
        this.createClientSet(pdfFileUri);
        this.extension.manager.watchPdfFile(pdfFileUri);
        try {
            this.extension.logger.addLogMessage(`Serving PDF file at ${url}`);
            await vscode.env.openExternal(vscode.Uri.parse(url, true));
            this.extension.logger.addLogMessage(`Open PDF viewer for ${pdfFileUri.toString(true)}`);
        }
        catch (e) {
            void vscode.window.showInputBox({
                prompt: 'Unable to open browser. Please copy and visit this link.',
                value: url
            });
            this.extension.logger.addLogMessage(`Something bad happened when opening PDF viewer for ${pdfFileUri.toString(true)}`);
            if (e instanceof Error) {
                this.extension.logger.logError(e);
            }
        }
    }
    tex2pdf(sourceFile, respectOutDir) {
        const pdfFilePath = this.extension.manager.tex2pdf(sourceFile, respectOutDir);
        return vscode.Uri.file(pdfFilePath);
    }
    /**
     * Opens the PDF file of `sourceFile` in the internal PDF viewer.
     *
     * @param sourceFile The path of a LaTeX file.
     * @param respectOutDir
     * @param tabEditorGroup
     * @param preserveFocus
     */
    async openTab(sourceFile, respectOutDir, tabEditorGroup, preserveFocus = true) {
        const url = await this.checkViewer(sourceFile, respectOutDir);
        if (!url) {
            return;
        }
        const pdfFile = this.tex2pdf(sourceFile, respectOutDir);
        return this.openPdfInTab(pdfFile, tabEditorGroup, preserveFocus);
    }
    async openPdfInTab(pdfFileUri, tabEditorGroup, preserveFocus = true) {
        const activeDocument = vscode.window.activeTextEditor?.document;
        const panel = await this.createPdfViewerPanel(pdfFileUri, vscode.ViewColumn.Active);
        if (!panel) {
            return;
        }
        if (activeDocument) {
            await (0, webview_1.openWebviewPanel)(panel.webviewPanel, tabEditorGroup, activeDocument, preserveFocus);
        }
        this.extension.logger.addLogMessage(`Open PDF tab for ${pdfFileUri.toString(true)}`);
    }
    async createPdfViewerPanel(pdfFileUri, viewColumn) {
        const panel = await this.panelService.createPdfViewerPanel(pdfFileUri, viewColumn);
        this.initiatePdfViewerPanel(panel);
        return panel;
    }
    /**
     * Opens the PDF file of `sourceFile` in the external PDF viewer.
     *
     * @param sourceFile The path of a LaTeX file.
     */
    openExternal(sourceFile) {
        const pdfFile = this.extension.manager.tex2pdf(sourceFile);
        const configuration = vscode.workspace.getConfiguration('latex-workshop');
        let command = configuration.get('view.pdf.external.viewer.command');
        let args = configuration.get('view.pdf.external.viewer.args');
        if (!command) {
            switch (process.platform) {
                case 'win32':
                    command = 'SumatraPDF.exe';
                    args = ['%PDF%'];
                    break;
                case 'linux':
                    command = 'xdg-open';
                    args = ['%PDF%'];
                    break;
                case 'darwin':
                    command = 'open';
                    args = ['%PDF%'];
                    break;
                default:
                    break;
            }
        }
        if (args) {
            args = args.map(arg => arg.replace('%PDF%', pdfFile));
        }
        this.extension.logger.addLogMessage(`Open external viewer for ${pdfFile}`);
        this.extension.logger.logCommand('Execute the external PDF viewer command', command, args);
        const proc = cs.spawn(command, args, { cwd: path.dirname(sourceFile), detached: true });
        let stdout = '';
        proc.stdout.on('data', newStdout => {
            stdout += newStdout;
        });
        let stderr = '';
        proc.stderr.on('data', newStderr => {
            stderr += newStderr;
        });
        const cb = () => {
            void this.extension.logger.addLogMessage(`The external PDF viewer stdout: ${stdout}`);
            void this.extension.logger.addLogMessage(`The external PDF viewer stderr: ${stderr}`);
        };
        proc.on('error', cb);
        proc.on('exit', cb);
    }
    /**
     * Handles the request from the internal PDF viewer.
     *
     * @param websocket The WebSocket connecting with the viewer.
     * @param msg A message from the viewer in JSON fromat.
     */
    handler(websocket, msg) {
        const data = JSON.parse(msg);
        if (data.type !== 'ping') {
            this.extension.logger.addLogMessage(`Handle data type: ${data.type}`);
        }
        switch (data.type) {
            case 'open': {
                const pdfFileUri = vscode.Uri.parse(data.pdfFileUri, true);
                const clientSet = this.managerService.getClientSet(pdfFileUri);
                if (clientSet === undefined) {
                    break;
                }
                const client = new client_1.Client(data.viewer, websocket);
                clientSet.add(client);
                client.onDidDispose(() => {
                    clientSet.delete(client);
                });
                break;
            }
            case 'loaded': {
                this.extension.eventBus.fire(eventbus_1.PdfViewerPagesLoaded);
                const configuration = vscode.workspace.getConfiguration('latex-workshop');
                if (configuration.get('synctex.afterBuild.enabled')) {
                    this.extension.logger.addLogMessage('SyncTex after build invoked.');
                    const uri = vscode.Uri.parse(data.pdfFileUri, true);
                    this.extension.locator.syncTeX(undefined, undefined, uri.fsPath);
                }
                break;
            }
            case 'reverse_synctex': {
                const uri = vscode.Uri.parse(data.pdfFileUri, true);
                void this.extension.locator.locate(data, uri.fsPath);
                break;
            }
            case 'ping': {
                // nothing to do
                break;
            }
            case 'add_log': {
                this.extension.logger.addLogMessage(`[PDF Viewer] ${data.message}`);
                break;
            }
            default: {
                this.extension.logger.addLogMessage(`Unknown websocket message: ${msg}`);
                break;
            }
        }
    }
    viewerParams() {
        const configuration = vscode.workspace.getConfiguration('latex-workshop');
        const invertType = configuration.get('view.pdf.invertMode.enabled');
        const invertEnabled = (invertType === 'auto' && ((0, theme_1.getCurrentThemeLightness)() === 'dark')) ||
            invertType === 'always' ||
            (invertType === 'compat' && (configuration.get('view.pdf.invert') > 0));
        const pack = {
            scale: configuration.get('view.pdf.zoom'),
            trim: configuration.get('view.pdf.trim'),
            scrollMode: configuration.get('view.pdf.scrollMode'),
            spreadMode: configuration.get('view.pdf.spreadMode'),
            hand: configuration.get('view.pdf.hand'),
            invertMode: {
                enabled: invertEnabled,
                brightness: configuration.get('view.pdf.invertMode.brightness'),
                grayscale: configuration.get('view.pdf.invertMode.grayscale'),
                hueRotate: configuration.get('view.pdf.invertMode.hueRotate'),
                invert: configuration.get('view.pdf.invert'),
                sepia: configuration.get('view.pdf.invertMode.sepia'),
            },
            color: {
                light: {
                    pageColorsForeground: configuration.get('view.pdf.color.light.pageColorsForeground') || 'CanvasText',
                    pageColorsBackground: configuration.get('view.pdf.color.light.pageColorsBackground') || 'Canvas',
                    backgroundColor: configuration.get('view.pdf.color.light.backgroundColor', '#ffffff')
                },
                dark: {
                    pageColorsForeground: configuration.get('view.pdf.color.dark.pageColorsForeground') || 'CanvasText',
                    pageColorsBackground: configuration.get('view.pdf.color.dark.pageColorsBackground') || 'Canvas',
                    backgroundColor: configuration.get('view.pdf.color.dark.backgroundColor', '#ffffff')
                }
            },
            keybindings: {
                synctex: configuration.get('view.pdf.internal.synctex.keybinding')
            }
        };
        return pack;
    }
    /**
     * Reveals the position of `record` on the internal PDF viewers.
     *
     * @param pdfFile The path of a PDF file.
     * @param record The position to be revealed.
     */
    syncTeX(pdfFile, record) {
        const pdfFileUri = vscode.Uri.file(pdfFile);
        const clientSet = this.getClientSet(pdfFileUri);
        if (clientSet === undefined) {
            this.extension.logger.addLogMessage(`PDF is not viewed: ${pdfFile}`);
            return;
        }
        const needDelay = this.revealWebviewPanel(pdfFileUri);
        for (const client of clientSet) {
            setTimeout(() => {
                client.send({ type: 'synctex', data: record });
            }, needDelay ? 200 : 0);
            this.extension.logger.addLogMessage(`Try to synctex ${pdfFile}`);
        }
    }
    /**
     * Reveals the internal PDF viewer of `pdfFileUri`.
     * The first one is revealed.
     *
     * @param pdfFileUri The path of a PDF file.
     * @returns Returns `true` if `WebviewPanel.reveal` called.
     */
    revealWebviewPanel(pdfFileUri) {
        const panelSet = this.getPanelSet(pdfFileUri);
        if (!panelSet) {
            return;
        }
        for (const panel of panelSet) {
            const isSyntexOn = !panel.state || panel.state.synctexEnabled;
            if (panel.webviewPanel.visible && isSyntexOn) {
                return;
            }
        }
        const activeViewColumn = vscode.window.activeTextEditor?.viewColumn;
        for (const panel of panelSet) {
            if (panel.webviewPanel.viewColumn !== activeViewColumn) {
                const isSyntexOn = !panel.state || panel.state.synctexEnabled;
                if (!panel.webviewPanel.visible && isSyntexOn) {
                    panel.webviewPanel.reveal(undefined, true);
                    return true;
                }
                return;
            }
        }
        return;
    }
    /**
     * Returns the state of the internal PDF viewer of `pdfFilePath`.
     *
     * @param pdfFileUri The path of a PDF file.
     */
    getViewerState(pdfFileUri) {
        const panelSet = this.getPanelSet(pdfFileUri);
        if (!panelSet) {
            return [];
        }
        return Array.from(panelSet).map(e => e.state);
    }
}
exports.Viewer = Viewer;
//# sourceMappingURL=viewer.js.map