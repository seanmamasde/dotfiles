"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArduinoContentProvider = void 0;
const path = require("path");
const Uuid = require("uuid/v4");
const vscode = require("vscode");
const arduinoActivator_1 = require("../arduinoActivator");
const arduinoContext_1 = require("../arduinoContext");
const Constants = require("../common/constants");
const JSONHelper = require("../common/cycle");
const deviceContext_1 = require("../deviceContext");
const Logger = require("../logger/logger");
const localWebServer_1 = require("./localWebServer");
class ArduinoContentProvider {
    constructor(_extensionPath) {
        this._extensionPath = _extensionPath;
        this._onDidChange = new vscode.EventEmitter();
    }
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            this._webserver = new localWebServer_1.default(this._extensionPath);
            // Arduino Boards Manager
            this.addHandlerWithLogger("show-boardmanager", "/boardmanager", (req, res) => this.getHtmlView(req, res));
            this.addHandlerWithLogger("show-packagemanager", "/api/boardpackages", (req, res) => __awaiter(this, void 0, void 0, function* () { return yield this.getBoardPackages(req, res); }));
            this.addHandlerWithLogger("install-board", "/api/installboard", (req, res) => __awaiter(this, void 0, void 0, function* () { return yield this.installPackage(req, res); }), true);
            this.addHandlerWithLogger("uninstall-board", "/api/uninstallboard", (req, res) => __awaiter(this, void 0, void 0, function* () { return yield this.uninstallPackage(req, res); }), true);
            this.addHandlerWithLogger("open-link", "/api/openlink", (req, res) => __awaiter(this, void 0, void 0, function* () { return yield this.openLink(req, res); }), true);
            this.addHandlerWithLogger("open-settings", "/api/opensettings", (req, res) => this.openSettings(req, res), true);
            // Arduino Libraries Manager
            this.addHandlerWithLogger("show-librarymanager", "/librarymanager", (req, res) => this.getHtmlView(req, res));
            this.addHandlerWithLogger("load-libraries", "/api/libraries", (req, res) => __awaiter(this, void 0, void 0, function* () { return yield this.getLibraries(req, res); }));
            this.addHandlerWithLogger("install-library", "/api/installlibrary", (req, res) => __awaiter(this, void 0, void 0, function* () { return yield this.installLibrary(req, res); }), true);
            this.addHandlerWithLogger("uninstall-library", "/api/uninstalllibrary", (req, res) => __awaiter(this, void 0, void 0, function* () { return yield this.uninstallLibrary(req, res); }), true);
            this.addHandlerWithLogger("add-libpath", "/api/addlibpath", (req, res) => __awaiter(this, void 0, void 0, function* () { return yield this.addLibPath(req, res); }), true);
            // Arduino Board Config
            this.addHandlerWithLogger("show-boardconfig", "/boardconfig", (req, res) => this.getHtmlView(req, res));
            this.addHandlerWithLogger("load-installedboards", "/api/installedboards", (req, res) => this.getInstalledBoards(req, res));
            this.addHandlerWithLogger("load-configitems", "/api/configitems", (req, res) => __awaiter(this, void 0, void 0, function* () { return yield this.getBoardConfig(req, res); }));
            this.addHandlerWithLogger("update-selectedboard", "/api/updateselectedboard", (req, res) => this.updateSelectedBoard(req, res), true);
            this.addHandlerWithLogger("update-config", "/api/updateconfig", (req, res) => __awaiter(this, void 0, void 0, function* () { return yield this.updateConfig(req, res); }), true);
            // Arduino Examples TreeView
            this.addHandlerWithLogger("show-examplesview", "/examples", (req, res) => this.getHtmlView(req, res));
            this.addHandlerWithLogger("load-examples", "/api/examples", (req, res) => __awaiter(this, void 0, void 0, function* () { return yield this.getExamples(req, res); }));
            this.addHandlerWithLogger("open-example", "/api/openexample", (req, res) => this.openExample(req, res), true);
            yield this._webserver.start();
        });
    }
    provideTextDocumentContent(uri) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!arduinoContext_1.default.initialized) {
                yield arduinoActivator_1.default.activate();
            }
            let type = "";
            if (uri.toString() === Constants.BOARD_MANAGER_URI.toString()) {
                type = "boardmanager";
            }
            else if (uri.toString() === Constants.LIBRARY_MANAGER_URI.toString()) {
                type = "librarymanager";
            }
            else if (uri.toString() === Constants.BOARD_CONFIG_URI.toString()) {
                type = "boardConfig";
            }
            else if (uri.toString() === Constants.EXAMPLES_URI.toString()) {
                type = "examples";
            }
            const timeNow = new Date().getTime();
            return `
        <html>
        <head>
            <script type="text/javascript">
                window.onload = function() {
                    console.log('reloaded results window at time ${timeNow}ms');
                    var doc = document.documentElement;
                    var styles = window.getComputedStyle(doc);
                    var backgroundcolor = styles.getPropertyValue('--background-color') || '#1e1e1e';
                    var color = styles.getPropertyValue('--color') || '#d4d4d4';
                    var theme = document.body.className || 'vscode-dark';
                    var url = "${(yield vscode.env.asExternalUri(this._webserver.getEndpointUri(type))).toString()}?" +
                            "theme=" + encodeURIComponent(theme.trim()) +
                            "&backgroundcolor=" + encodeURIComponent(backgroundcolor.trim()) +
                            "&color=" + encodeURIComponent(color.trim());
                    document.getElementById('frame').src = url;
                };
            </script>
        </head>
        <body style="margin: 0; padding: 0; height: 100%; overflow: hidden;">
            <iframe id="frame" width="100%" height="100%" frameborder="0" style="position:absolute; left: 0; right: 0; bottom: 0; top: 0px;"/>
        </body>
        </html>`;
        });
    }
    get onDidChange() {
        return this._onDidChange.event;
    }
    update(uri) {
        this._onDidChange.fire(uri);
    }
    getHtmlView(req, res) {
        return res.sendFile(path.join(this._extensionPath, "./out/views/index.html"));
    }
    getBoardPackages(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            yield arduinoContext_1.default.boardManager.loadPackages(req.query.update === "true");
            return res.json({
                platforms: JSONHelper.decycle(arduinoContext_1.default.boardManager.platforms, undefined),
            });
        });
    }
    installPackage(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.body.packageName || !req.body.arch) {
                return res.status(400).send("BAD Request! Missing { packageName, arch } parameters!");
            }
            else {
                try {
                    yield arduinoContext_1.default.arduinoApp.installBoard(req.body.packageName, req.body.arch, req.body.version);
                    return res.json({
                        status: "OK",
                    });
                }
                catch (error) {
                    return res.status(500).send(`Install board failed with message "code:${error.code}, err:${error.stderr}"`);
                }
            }
        });
    }
    uninstallPackage(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.body.packagePath) {
                return res.status(400).send("BAD Request! Missing { packagePath } parameter!");
            }
            else {
                try {
                    yield arduinoContext_1.default.arduinoApp.uninstallBoard(req.body.boardName, req.body.packagePath);
                    return res.json({
                        status: "OK",
                    });
                }
                catch (error) {
                    return res.status(500).send(`Uninstall board failed with message "${error}"`);
                }
            }
        });
    }
    openLink(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.body.link) {
                return res.status(400).send("BAD Request! Missing { link } parameter!");
            }
            else {
                try {
                    yield vscode.commands.executeCommand("vscode.open", vscode.Uri.parse(req.body.link));
                    return res.json({
                        status: "OK",
                    });
                }
                catch (error) {
                    return res.status(500).send(`Cannot open the link with error message "${error}"`);
                }
            }
        });
    }
    openSettings(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.body.query) {
                return res.status(400).send("BAD Request! Missing { query } parameter!");
            }
            else {
                try {
                    yield vscode.commands.executeCommand("workbench.action.openGlobalSettings", { query: req.body.query });
                    return res.json({
                        status: "OK",
                    });
                }
                catch (error) {
                    return res.status(500).send(`Cannot open the setting with error message "${error}"`);
                }
            }
        });
    }
    getLibraries(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            yield arduinoContext_1.default.arduinoApp.libraryManager.loadLibraries(req.query.update === "true");
            return res.json({
                libraries: arduinoContext_1.default.arduinoApp.libraryManager.libraries,
            });
        });
    }
    installLibrary(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.body.libraryName) {
                return res.status(400).send("BAD Request! Missing { libraryName } parameters!");
            }
            else {
                try {
                    yield arduinoContext_1.default.arduinoApp.installLibrary(req.body.libraryName, req.body.version);
                    return res.json({
                        status: "OK",
                    });
                }
                catch (error) {
                    return res.status(500).send(`Install library failed with message "code:${error.code}, err:${error.stderr}"`);
                }
            }
        });
    }
    uninstallLibrary(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.body.libraryPath) {
                return res.status(400).send("BAD Request! Missing { libraryPath } parameters!");
            }
            else {
                try {
                    yield arduinoContext_1.default.arduinoApp.uninstallLibrary(req.body.libraryName, req.body.libraryPath);
                    return res.json({
                        status: "OK",
                    });
                }
                catch (error) {
                    return res.status(500).send(`Uninstall library failed with message "code:${error.code}, err:${error.stderr}"`);
                }
            }
        });
    }
    addLibPath(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.body.libraryPath) {
                return res.status(400).send("BAD Request! Missing { libraryPath } parameters!");
            }
            else {
                try {
                    yield arduinoContext_1.default.arduinoApp.includeLibrary(req.body.libraryPath);
                    return res.json({
                        status: "OK",
                    });
                }
                catch (error) {
                    return res.status(500).send(`Add library path failed with message "code:${error.code}, err:${error.stderr}"`);
                }
            }
        });
    }
    getInstalledBoards(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const installedBoards = [];
            arduinoContext_1.default.boardManager.installedBoards.forEach((b) => {
                const isSelected = arduinoContext_1.default.boardManager.currentBoard ? b.key === arduinoContext_1.default.boardManager.currentBoard.key : false;
                installedBoards.push({
                    key: b.key,
                    name: b.name,
                    platform: b.platform.name,
                    isSelected,
                });
            });
            return res.json({
                installedBoards: JSONHelper.decycle(installedBoards, undefined),
            });
        });
    }
    getBoardConfig(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            return res.json({
                configitems: (arduinoContext_1.default.boardManager.currentBoard === null) ? null : arduinoContext_1.default.boardManager.currentBoard.configItems,
            });
        });
    }
    updateSelectedBoard(req, res) {
        if (!req.body.boardId) {
            return res.status(400).send("BAD Request! Missing parameters!");
        }
        else {
            try {
                const bd = arduinoContext_1.default.boardManager.installedBoards.get(req.body.boardId);
                arduinoContext_1.default.boardManager.doChangeBoardType(bd);
                return res.json({
                    status: "OK",
                });
            }
            catch (error) {
                return res.status(500).send(`Update board config failed with message "code:${error.code}, err:${error.stderr}"`);
            }
        }
    }
    updateConfig(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.body.configId || !req.body.optionId) {
                return res.status(400).send("BAD Request! Missing parameters!");
            }
            else {
                try {
                    arduinoContext_1.default.boardManager.currentBoard.updateConfig(req.body.configId, req.body.optionId);
                    const dc = deviceContext_1.DeviceContext.getInstance();
                    dc.configuration = arduinoContext_1.default.boardManager.currentBoard.customConfig;
                    return res.json({
                        status: "OK",
                    });
                }
                catch (error) {
                    return res.status(500).send(`Update board config failed with message "code:${error.code}, err:${error.stderr}"`);
                }
            }
        });
    }
    getExamples(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const examples = yield arduinoContext_1.default.arduinoApp.exampleManager.loadExamples();
            return res.json({
                examples,
            });
        });
    }
    openExample(req, res) {
        if (!req.body.examplePath) {
            return res.status(400).send("BAD Request! Missing { examplePath } parameter!");
        }
        else {
            try {
                arduinoContext_1.default.arduinoApp.openExample(req.body.examplePath);
                return res.json({
                    status: "OK",
                });
            }
            catch (error) {
                return res.status(500).send(`Cannot open the example folder with error message "${error}"`);
            }
        }
    }
    addHandlerWithLogger(handlerName, url, handler, post = false) {
        const wrappedHandler = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const guid = Uuid().replace(/-/g, "");
            let properties = {};
            if (post) {
                properties = Object.assign({}, req.body);
                // Removal requirement for GDPR
                if ("install-board" === handlerName) {
                    const packageNameKey = "packageName";
                    delete properties[packageNameKey];
                }
            }
            Logger.traceUserData(`start-` + handlerName, Object.assign({ correlationId: guid }, properties));
            const timer1 = new Logger.Timer();
            try {
                yield Promise.resolve(handler(req, res));
            }
            catch (error) {
                Logger.traceError("expressHandlerError", error, Object.assign({ correlationId: guid, handlerName }, properties));
            }
            Logger.traceUserData(`end-` + handlerName, { correlationId: guid, duration: timer1.end() });
        });
        if (post) {
            this._webserver.addPostHandler(url, wrappedHandler);
        }
        else {
            this._webserver.addHandler(url, wrappedHandler);
        }
    }
}
exports.ArduinoContentProvider = ArduinoContentProvider;

//# sourceMappingURL=arduinoContentProvider.js.map

// SIG // Begin signature block
// SIG // MIInqAYJKoZIhvcNAQcCoIInmTCCJ5UCAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // Xqz49LW3BfXTd5Q3qEdalUDDjEzVkuyUMYOeECLWgbyg
// SIG // gg2BMIIF/zCCA+egAwIBAgITMwAAAlKLM6r4lfM52wAA
// SIG // AAACUjANBgkqhkiG9w0BAQsFADB+MQswCQYDVQQGEwJV
// SIG // UzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMH
// SIG // UmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBv
// SIG // cmF0aW9uMSgwJgYDVQQDEx9NaWNyb3NvZnQgQ29kZSBT
// SIG // aWduaW5nIFBDQSAyMDExMB4XDTIxMDkwMjE4MzI1OVoX
// SIG // DTIyMDkwMTE4MzI1OVowdDELMAkGA1UEBhMCVVMxEzAR
// SIG // BgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1v
// SIG // bmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlv
// SIG // bjEeMBwGA1UEAxMVTWljcm9zb2Z0IENvcnBvcmF0aW9u
// SIG // MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA
// SIG // 0OTPj7P1+wTbr+Qf9COrqA8I9DSTqNSq1UKju4IEV3HJ
// SIG // Jck61i+MTEoYyKLtiLG2Jxeu8F81QKuTpuKHvi380gzs
// SIG // 43G+prNNIAaNDkGqsENQYo8iezbw3/NCNX1vTi++irdF
// SIG // qXNs6xoc3B3W+7qT678b0jTVL8St7IMO2E7d9eNdL6RK
// SIG // fMnwRJf4XfGcwL+OwwoCeY9c5tvebNUVWRzaejKIkBVT
// SIG // hApuAMCtpdvIvmBEdSTuCKZUx+OLr81/aEZyR2jL1s2R
// SIG // KaMz8uIzTtgw6m3DbOM4ewFjIRNT1hVQPghyPxJ+ZwEr
// SIG // wry5rkf7fKuG3PF0fECGSUEqftlOptpXTQIDAQABo4IB
// SIG // fjCCAXowHwYDVR0lBBgwFgYKKwYBBAGCN0wIAQYIKwYB
// SIG // BQUHAwMwHQYDVR0OBBYEFDWSWhFBi9hrsLe2TgLuHnxG
// SIG // F3nRMFAGA1UdEQRJMEekRTBDMSkwJwYDVQQLEyBNaWNy
// SIG // b3NvZnQgT3BlcmF0aW9ucyBQdWVydG8gUmljbzEWMBQG
// SIG // A1UEBRMNMjMwMDEyKzQ2NzU5NzAfBgNVHSMEGDAWgBRI
// SIG // bmTlUAXTgqoXNzcitW2oynUClTBUBgNVHR8ETTBLMEmg
// SIG // R6BFhkNodHRwOi8vd3d3Lm1pY3Jvc29mdC5jb20vcGtp
// SIG // b3BzL2NybC9NaWNDb2RTaWdQQ0EyMDExXzIwMTEtMDct
// SIG // MDguY3JsMGEGCCsGAQUFBwEBBFUwUzBRBggrBgEFBQcw
// SIG // AoZFaHR0cDovL3d3dy5taWNyb3NvZnQuY29tL3BraW9w
// SIG // cy9jZXJ0cy9NaWNDb2RTaWdQQ0EyMDExXzIwMTEtMDct
// SIG // MDguY3J0MAwGA1UdEwEB/wQCMAAwDQYJKoZIhvcNAQEL
// SIG // BQADggIBABZJN7ksZExAYdTbQJewYryBLAFnYF9amfhH
// SIG // WTGG0CmrGOiIUi10TMRdQdzinUfSv5HHKZLzXBpfA+2M
// SIG // mEuJoQlDAUflS64N3/D1I9/APVeWomNvyaJO1mRTgJoz
// SIG // 0TTRp8noO5dJU4k4RahPtmjrOvoXnoKgHXpRoDSSkRy1
// SIG // kboRiriyMOZZIMfSsvkL2a5/w3YvLkyIFiqfjBhvMWOj
// SIG // wb744LfY0EoZZz62d1GPAb8Muq8p4VwWldFdE0y9IBMe
// SIG // 3ofytaPDImq7urP+xcqji3lEuL0x4fU4AS+Q7cQmLq12
// SIG // 0gVbS9RY+OPjnf+nJgvZpr67Yshu9PWN0Xd2HSY9n9xi
// SIG // au2OynVqtEGIWrSoQXoOH8Y4YNMrrdoOmjNZsYzT6xOP
// SIG // M+h1gjRrvYDCuWbnZXUcOGuOWdOgKJLaH9AqjskxK76t
// SIG // GI6BOF6WtPvO0/z1VFzan+2PqklO/vS7S0LjGEeMN3Ej
// SIG // 47jbrLy3/YAZ3IeUajO5Gg7WFg4C8geNhH7MXjKsClsA
// SIG // Pk1YtB61kan0sdqJWxOeoSXBJDIzkis97EbrqRQl91K6
// SIG // MmH+di/tolU63WvF1nrDxutjJ590/ALi383iRbgG3zkh
// SIG // EceyBWTvdlD6FxNbhIy+bJJdck2QdzLm4DgOBfCqETYb
// SIG // 4hQBEk/pxvHPLiLG2Xm9PEnmEDKo1RJpMIIHejCCBWKg
// SIG // AwIBAgIKYQ6Q0gAAAAAAAzANBgkqhkiG9w0BAQsFADCB
// SIG // iDELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0
// SIG // b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1p
// SIG // Y3Jvc29mdCBDb3Jwb3JhdGlvbjEyMDAGA1UEAxMpTWlj
// SIG // cm9zb2Z0IFJvb3QgQ2VydGlmaWNhdGUgQXV0aG9yaXR5
// SIG // IDIwMTEwHhcNMTEwNzA4MjA1OTA5WhcNMjYwNzA4MjEw
// SIG // OTA5WjB+MQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2Fz
// SIG // aGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UE
// SIG // ChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMSgwJgYDVQQD
// SIG // Ex9NaWNyb3NvZnQgQ29kZSBTaWduaW5nIFBDQSAyMDEx
// SIG // MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEA
// SIG // q/D6chAcLq3YbqqCEE00uvK2WCGfQhsqa+laUKq4Bjga
// SIG // BEm6f8MMHt03a8YS2AvwOMKZBrDIOdUBFDFC04kNeWSH
// SIG // fpRgJGyvnkmc6Whe0t+bU7IKLMOv2akrrnoJr9eWWcpg
// SIG // GgXpZnboMlImEi/nqwhQz7NEt13YxC4Ddato88tt8zpc
// SIG // oRb0RrrgOGSsbmQ1eKagYw8t00CT+OPeBw3VXHmlSSnn
// SIG // Db6gE3e+lD3v++MrWhAfTVYoonpy4BI6t0le2O3tQ5GD
// SIG // 2Xuye4Yb2T6xjF3oiU+EGvKhL1nkkDstrjNYxbc+/jLT
// SIG // swM9sbKvkjh+0p2ALPVOVpEhNSXDOW5kf1O6nA+tGSOE
// SIG // y/S6A4aN91/w0FK/jJSHvMAhdCVfGCi2zCcoOCWYOUo2
// SIG // z3yxkq4cI6epZuxhH2rhKEmdX4jiJV3TIUs+UsS1Vz8k
// SIG // A/DRelsv1SPjcF0PUUZ3s/gA4bysAoJf28AVs70b1FVL
// SIG // 5zmhD+kjSbwYuER8ReTBw3J64HLnJN+/RpnF78IcV9uD
// SIG // jexNSTCnq47f7Fufr/zdsGbiwZeBe+3W7UvnSSmnEyim
// SIG // p31ngOaKYnhfsi+E11ecXL93KCjx7W3DKI8sj0A3T8Hh
// SIG // hUSJxAlMxdSlQy90lfdu+HggWCwTXWCVmj5PM4TasIgX
// SIG // 3p5O9JawvEagbJjS4NaIjAsCAwEAAaOCAe0wggHpMBAG
// SIG // CSsGAQQBgjcVAQQDAgEAMB0GA1UdDgQWBBRIbmTlUAXT
// SIG // gqoXNzcitW2oynUClTAZBgkrBgEEAYI3FAIEDB4KAFMA
// SIG // dQBiAEMAQTALBgNVHQ8EBAMCAYYwDwYDVR0TAQH/BAUw
// SIG // AwEB/zAfBgNVHSMEGDAWgBRyLToCMZBDuRQFTuHqp8cx
// SIG // 0SOJNDBaBgNVHR8EUzBRME+gTaBLhklodHRwOi8vY3Js
// SIG // Lm1pY3Jvc29mdC5jb20vcGtpL2NybC9wcm9kdWN0cy9N
// SIG // aWNSb29DZXJBdXQyMDExXzIwMTFfMDNfMjIuY3JsMF4G
// SIG // CCsGAQUFBwEBBFIwUDBOBggrBgEFBQcwAoZCaHR0cDov
// SIG // L3d3dy5taWNyb3NvZnQuY29tL3BraS9jZXJ0cy9NaWNS
// SIG // b29DZXJBdXQyMDExXzIwMTFfMDNfMjIuY3J0MIGfBgNV
// SIG // HSAEgZcwgZQwgZEGCSsGAQQBgjcuAzCBgzA/BggrBgEF
// SIG // BQcCARYzaHR0cDovL3d3dy5taWNyb3NvZnQuY29tL3Br
// SIG // aW9wcy9kb2NzL3ByaW1hcnljcHMuaHRtMEAGCCsGAQUF
// SIG // BwICMDQeMiAdAEwAZQBnAGEAbABfAHAAbwBsAGkAYwB5
// SIG // AF8AcwB0AGEAdABlAG0AZQBuAHQALiAdMA0GCSqGSIb3
// SIG // DQEBCwUAA4ICAQBn8oalmOBUeRou09h0ZyKbC5YR4WOS
// SIG // mUKWfdJ5DJDBZV8uLD74w3LRbYP+vj/oCso7v0epo/Np
// SIG // 22O/IjWll11lhJB9i0ZQVdgMknzSGksc8zxCi1LQsP1r
// SIG // 4z4HLimb5j0bpdS1HXeUOeLpZMlEPXh6I/MTfaaQdION
// SIG // 9MsmAkYqwooQu6SpBQyb7Wj6aC6VoCo/KmtYSWMfCWlu
// SIG // WpiW5IP0wI/zRive/DvQvTXvbiWu5a8n7dDd8w6vmSiX
// SIG // mE0OPQvyCInWH8MyGOLwxS3OW560STkKxgrCxq2u5bLZ
// SIG // 2xWIUUVYODJxJxp/sfQn+N4sOiBpmLJZiWhub6e3dMNA
// SIG // BQamASooPoI/E01mC8CzTfXhj38cbxV9Rad25UAqZaPD
// SIG // XVJihsMdYzaXht/a8/jyFqGaJ+HNpZfQ7l1jQeNbB5yH
// SIG // PgZ3BtEGsXUfFL5hYbXw3MYbBL7fQccOKO7eZS/sl/ah
// SIG // XJbYANahRr1Z85elCUtIEJmAH9AAKcWxm6U/RXceNcbS
// SIG // oqKfenoi+kiVH6v7RyOA9Z74v2u3S5fi63V4GuzqN5l5
// SIG // GEv/1rMjaHXmr/r8i+sLgOppO6/8MO0ETI7f33VtY5E9
// SIG // 0Z1WTk+/gFcioXgRMiF670EKsT/7qMykXcGhiJtXcVZO
// SIG // SEXAQsmbdlsKgEhr/Xmfwb1tbWrJUnMTDXpQzTGCGX8w
// SIG // ghl7AgEBMIGVMH4xCzAJBgNVBAYTAlVTMRMwEQYDVQQI
// SIG // EwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4w
// SIG // HAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xKDAm
// SIG // BgNVBAMTH01pY3Jvc29mdCBDb2RlIFNpZ25pbmcgUENB
// SIG // IDIwMTECEzMAAAJSizOq+JXzOdsAAAAAAlIwDQYJYIZI
// SIG // AWUDBAIBBQCgga4wGQYJKoZIhvcNAQkDMQwGCisGAQQB
// SIG // gjcCAQQwHAYKKwYBBAGCNwIBCzEOMAwGCisGAQQBgjcC
// SIG // ARUwLwYJKoZIhvcNAQkEMSIEIKBEkXqCWY6gT/WilEd0
// SIG // jeBIYjDNvZRGCvNPeScqIgmuMEIGCisGAQQBgjcCAQwx
// SIG // NDAyoBSAEgBNAGkAYwByAG8AcwBvAGYAdKEagBhodHRw
// SIG // Oi8vd3d3Lm1pY3Jvc29mdC5jb20wDQYJKoZIhvcNAQEB
// SIG // BQAEggEAj7wG+9SdUHTQY/7p3TydtpkzF34ZKbMgZsBR
// SIG // cdLTgxH3mLPtfd8KcSsx+bSHfD71a/AQpT71c+Qcs9lC
// SIG // eThnYv8lAGGCh9NcgQ7TkyKidoY63RKMeBZQPcOjyJP8
// SIG // r6qbY0qraXFHQpn3RQ6dixQqZSH6ydgHApjxxMCKaQPV
// SIG // zx+bW9R7IuLwOmL11jdG3ZUvBVmV+8RmSUejxlVmSACk
// SIG // JsxP0bVt7meIPs7omnIRhTvXC3KH43rKz+f7e00lYA32
// SIG // ZJ30ctVcyt1VpOTAavrqUylPNt7+6UqA5x1PiuONntFy
// SIG // 1pHquHNDtQBQmQPv5+c9tL2U0YmHlJVR2LHhmsD49aGC
// SIG // FwkwghcFBgorBgEEAYI3AwMBMYIW9TCCFvEGCSqGSIb3
// SIG // DQEHAqCCFuIwghbeAgEDMQ8wDQYJYIZIAWUDBAIBBQAw
// SIG // ggFVBgsqhkiG9w0BCRABBKCCAUQEggFAMIIBPAIBAQYK
// SIG // KwYBBAGEWQoDATAxMA0GCWCGSAFlAwQCAQUABCACjQZv
// SIG // v6CfO8No59vbohQps5r+/1HQC+dkITWpUQcWUwIGYmtH
// SIG // bAUhGBMyMDIyMDUwMzE5MDEwOC4xMjRaMASAAgH0oIHU
// SIG // pIHRMIHOMQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2Fz
// SIG // aGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UE
// SIG // ChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMSkwJwYDVQQL
// SIG // EyBNaWNyb3NvZnQgT3BlcmF0aW9ucyBQdWVydG8gUmlj
// SIG // bzEmMCQGA1UECxMdVGhhbGVzIFRTUyBFU046RjdBNi1F
// SIG // MjUxLTE1MEExJTAjBgNVBAMTHE1pY3Jvc29mdCBUaW1l
// SIG // LVN0YW1wIFNlcnZpY2WgghFcMIIHEDCCBPigAwIBAgIT
// SIG // MwAAAaUA3gjEQAdxTgABAAABpTANBgkqhkiG9w0BAQsF
// SIG // ADB8MQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGlu
// SIG // Z3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMV
// SIG // TWljcm9zb2Z0IENvcnBvcmF0aW9uMSYwJAYDVQQDEx1N
// SIG // aWNyb3NvZnQgVGltZS1TdGFtcCBQQ0EgMjAxMDAeFw0y
// SIG // MjAzMDIxODUxMTlaFw0yMzA1MTExODUxMTlaMIHOMQsw
// SIG // CQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQ
// SIG // MA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9z
// SIG // b2Z0IENvcnBvcmF0aW9uMSkwJwYDVQQLEyBNaWNyb3Nv
// SIG // ZnQgT3BlcmF0aW9ucyBQdWVydG8gUmljbzEmMCQGA1UE
// SIG // CxMdVGhhbGVzIFRTUyBFU046RjdBNi1FMjUxLTE1MEEx
// SIG // JTAjBgNVBAMTHE1pY3Jvc29mdCBUaW1lLVN0YW1wIFNl
// SIG // cnZpY2UwggIiMA0GCSqGSIb3DQEBAQUAA4ICDwAwggIK
// SIG // AoICAQC6sYboIGpIvMLqDjDHe67BEJ5gIbVfIlNWNIrb
// SIG // B6t9E3QlyQ5r2Y2mfMrzh2BVYU8g9W+SRibcGY1s9X4J
// SIG // QqrMeagcT9VsdQmZ7ENbYkbEVkHNdlZBE5pGPMeOjIB7
// SIG // BsgJoTz6bIEZ5JRmoux6kBQd9cf0I5Me62wJa+j25QeL
// SIG // TpmkdZysZeFSILLQ8H53imqBBMOIjf8U3c7WY8MhomOY
// SIG // Taem3nrZHIs4CRTt/8kR2IdILZPm0RIa5iIG2q664G8+
// SIG // zLJwO7ZSrxnDvYh3OvtrMpqwFctws0OCDDTxXE08fME2
// SIG // fpKb+pRbNXhvMZX7LtjQ1irIazJSh9iaWM1gFtXwjg+Y
// SIG // q17BOCzr4sWUL253kBOvohnyEMGm4/n0XaLgFNgIhPom
// SIG // jbCA2qXSmm/Fi8c+lT0WxC/jOjBZHLKIrihx6LIQqeyY
// SIG // ZmfYjNMqxMdl3mzoWv10N+NirERrNodNoKV+sAcsk/Hg
// SIG // 9zCVSMUkZuDCyIpb1nKXfTd66KGsGy1OoHZO4KClkuvf
// SIG // sNo7aLlwhGLeiD32avJXYtC/wsGG7b+5mx5iGfTnNCRC
// SIG // XOm/YHFQ36D4npjCnM9eQS3qcse56UNjIgyiLHDqioV7
// SIG // mSPj2XqzTh4Yv77MtvxY/ZQepCazGEn1dBdn67wUgVzA
// SIG // e8Y7/KYKl+UF1HvJ08W+FHydHAwLwQIDAQABo4IBNjCC
// SIG // ATIwHQYDVR0OBBYEFF+mjwMAl66urXDu+9xZF0toqRrf
// SIG // MB8GA1UdIwQYMBaAFJ+nFV0AXmJdg/Tl0mWnG1M1Gely
// SIG // MF8GA1UdHwRYMFYwVKBSoFCGTmh0dHA6Ly93d3cubWlj
// SIG // cm9zb2Z0LmNvbS9wa2lvcHMvY3JsL01pY3Jvc29mdCUy
// SIG // MFRpbWUtU3RhbXAlMjBQQ0ElMjAyMDEwKDEpLmNybDBs
// SIG // BggrBgEFBQcBAQRgMF4wXAYIKwYBBQUHMAKGUGh0dHA6
// SIG // Ly93d3cubWljcm9zb2Z0LmNvbS9wa2lvcHMvY2VydHMv
// SIG // TWljcm9zb2Z0JTIwVGltZS1TdGFtcCUyMFBDQSUyMDIw
// SIG // MTAoMSkuY3J0MAwGA1UdEwEB/wQCMAAwEwYDVR0lBAww
// SIG // CgYIKwYBBQUHAwgwDQYJKoZIhvcNAQELBQADggIBAJab
// SIG // CxflMDCihEdqdFiZ6OBuhhhp34N6ow3Wh3Obr12LRuip
// SIG // h66gH/2Kh5JjaLUq+mRBJ5RgiWEe1t7ifuW6b49N8Bah
// SIG // nn70LCiEdvquk686M7z+DbKHVk0+UlafwukxAxriwvZj
// SIG // kCgOLci+NB01u7cW9HAHX4J8hxaCPwbGaPxWl3s0PITu
// SIG // MVI4Q6cjTXielmL1+TQvh7/Z5k8s46shIPy9nFwDpsRF
// SIG // r3zwENZX8b67VMBu+YxnlGnsJIcLc2pwpz95emI8CRSg
// SIG // ep+/017a34pNcWNZIHr9ScEOWlHT8cEnQ5hhOF0zdrOq
// SIG // TzovCDtffTn+gBL4eNXg8Uc/tdVVHKbhp+7SVHkk1Eh7
// SIG // L80PBAjo+cO+zL+efxfIVrtO3oJxvEq1o+fkxcTTwqcf
// SIG // wBTb88/qHU0U2XeC1rqJnDB1JixYlBjgHXrRekqHxxuR
// SIG // HBZ9A0w9WqQWcwj/MbBkHGYMFaqO6L9t/7iCZTAiwMk2
// SIG // GVfSEwj9PXIlCWygVQkDaxhJ0P1yxTvZsrMsg0a7x4VO
// SIG // bhj3V8+Cbdv2TeyUGEblTUrgqTcKCtCa9bOnIg7xxHi8
// SIG // onM8aCHvRh90sn2x8er/6YSPohNw1qNUwiu+RC+qbepO
// SIG // Yt+v5J9rklV3Ux+OGVZId/4oVd7xMLO/Lhpb7IjHKygY
// SIG // KaNx3XIwx4h6FrFH+BiMMIIHcTCCBVmgAwIBAgITMwAA
// SIG // ABXF52ueAptJmQAAAAAAFTANBgkqhkiG9w0BAQsFADCB
// SIG // iDELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0
// SIG // b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1p
// SIG // Y3Jvc29mdCBDb3Jwb3JhdGlvbjEyMDAGA1UEAxMpTWlj
// SIG // cm9zb2Z0IFJvb3QgQ2VydGlmaWNhdGUgQXV0aG9yaXR5
// SIG // IDIwMTAwHhcNMjEwOTMwMTgyMjI1WhcNMzAwOTMwMTgz
// SIG // MjI1WjB8MQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2Fz
// SIG // aGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UE
// SIG // ChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMSYwJAYDVQQD
// SIG // Ex1NaWNyb3NvZnQgVGltZS1TdGFtcCBQQ0EgMjAxMDCC
// SIG // AiIwDQYJKoZIhvcNAQEBBQADggIPADCCAgoCggIBAOTh
// SIG // pkzntHIhC3miy9ckeb0O1YLT/e6cBwfSqWxOdcjKNVf2
// SIG // AX9sSuDivbk+F2Az/1xPx2b3lVNxWuJ+Slr+uDZnhUYj
// SIG // DLWNE893MsAQGOhgfWpSg0S3po5GawcU88V29YZQ3MFE
// SIG // yHFcUTE3oAo4bo3t1w/YJlN8OWECesSq/XJprx2rrPY2
// SIG // vjUmZNqYO7oaezOtgFt+jBAcnVL+tuhiJdxqD89d9P6O
// SIG // U8/W7IVWTe/dvI2k45GPsjksUZzpcGkNyjYtcI4xyDUo
// SIG // veO0hyTD4MmPfrVUj9z6BVWYbWg7mka97aSueik3rMvr
// SIG // g0XnRm7KMtXAhjBcTyziYrLNueKNiOSWrAFKu75xqRdb
// SIG // Z2De+JKRHh09/SDPc31BmkZ1zcRfNN0Sidb9pSB9fvzZ
// SIG // nkXftnIv231fgLrbqn427DZM9ituqBJR6L8FA6PRc6ZN
// SIG // N3SUHDSCD/AQ8rdHGO2n6Jl8P0zbr17C89XYcz1DTsEz
// SIG // OUyOArxCaC4Q6oRRRuLRvWoYWmEBc8pnol7XKHYC4jMY
// SIG // ctenIPDC+hIK12NvDMk2ZItboKaDIV1fMHSRlJTYuVD5
// SIG // C4lh8zYGNRiER9vcG9H9stQcxWv2XFJRXRLbJbqvUAV6
// SIG // bMURHXLvjflSxIUXk8A8FdsaN8cIFRg/eKtFtvUeh17a
// SIG // j54WcmnGrnu3tz5q4i6tAgMBAAGjggHdMIIB2TASBgkr
// SIG // BgEEAYI3FQEEBQIDAQABMCMGCSsGAQQBgjcVAgQWBBQq
// SIG // p1L+ZMSavoKRPEY1Kc8Q/y8E7jAdBgNVHQ4EFgQUn6cV
// SIG // XQBeYl2D9OXSZacbUzUZ6XIwXAYDVR0gBFUwUzBRBgwr
// SIG // BgEEAYI3TIN9AQEwQTA/BggrBgEFBQcCARYzaHR0cDov
// SIG // L3d3dy5taWNyb3NvZnQuY29tL3BraW9wcy9Eb2NzL1Jl
// SIG // cG9zaXRvcnkuaHRtMBMGA1UdJQQMMAoGCCsGAQUFBwMI
// SIG // MBkGCSsGAQQBgjcUAgQMHgoAUwB1AGIAQwBBMAsGA1Ud
// SIG // DwQEAwIBhjAPBgNVHRMBAf8EBTADAQH/MB8GA1UdIwQY
// SIG // MBaAFNX2VsuP6KJcYmjRPZSQW9fOmhjEMFYGA1UdHwRP
// SIG // ME0wS6BJoEeGRWh0dHA6Ly9jcmwubWljcm9zb2Z0LmNv
// SIG // bS9wa2kvY3JsL3Byb2R1Y3RzL01pY1Jvb0NlckF1dF8y
// SIG // MDEwLTA2LTIzLmNybDBaBggrBgEFBQcBAQROMEwwSgYI
// SIG // KwYBBQUHMAKGPmh0dHA6Ly93d3cubWljcm9zb2Z0LmNv
// SIG // bS9wa2kvY2VydHMvTWljUm9vQ2VyQXV0XzIwMTAtMDYt
// SIG // MjMuY3J0MA0GCSqGSIb3DQEBCwUAA4ICAQCdVX38Kq3h
// SIG // LB9nATEkW+Geckv8qW/qXBS2Pk5HZHixBpOXPTEztTnX
// SIG // wnE2P9pkbHzQdTltuw8x5MKP+2zRoZQYIu7pZmc6U03d
// SIG // mLq2HnjYNi6cqYJWAAOwBb6J6Gngugnue99qb74py27Y
// SIG // P0h1AdkY3m2CDPVtI1TkeFN1JFe53Z/zjj3G82jfZfak
// SIG // Vqr3lbYoVSfQJL1AoL8ZthISEV09J+BAljis9/kpicO8
// SIG // F7BUhUKz/AyeixmJ5/ALaoHCgRlCGVJ1ijbCHcNhcy4s
// SIG // a3tuPywJeBTpkbKpW99Jo3QMvOyRgNI95ko+ZjtPu4b6
// SIG // MhrZlvSP9pEB9s7GdP32THJvEKt1MMU0sHrYUP4KWN1A
// SIG // PMdUbZ1jdEgssU5HLcEUBHG/ZPkkvnNtyo4JvbMBV0lU
// SIG // ZNlz138eW0QBjloZkWsNn6Qo3GcZKCS6OEuabvshVGtq
// SIG // RRFHqfG3rsjoiV5PndLQTHa1V1QJsWkBRH58oWFsc/4K
// SIG // u+xBZj1p/cvBQUl+fpO+y/g75LcVv7TOPqUxUYS8vwLB
// SIG // gqJ7Fx0ViY1w/ue10CgaiQuPNtq6TPmb/wrpNPgkNWcr
// SIG // 4A245oyZ1uEi6vAnQj0llOZ0dFtq0Z4+7X6gMTN9vMvp
// SIG // e784cETRkPHIqzqKOghif9lwY1NNje6CbaUFEMFxBmoQ
// SIG // tB1VM1izoXBm8qGCAs8wggI4AgEBMIH8oYHUpIHRMIHO
// SIG // MQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3Rv
// SIG // bjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMVTWlj
// SIG // cm9zb2Z0IENvcnBvcmF0aW9uMSkwJwYDVQQLEyBNaWNy
// SIG // b3NvZnQgT3BlcmF0aW9ucyBQdWVydG8gUmljbzEmMCQG
// SIG // A1UECxMdVGhhbGVzIFRTUyBFU046RjdBNi1FMjUxLTE1
// SIG // MEExJTAjBgNVBAMTHE1pY3Jvc29mdCBUaW1lLVN0YW1w
// SIG // IFNlcnZpY2WiIwoBATAHBgUrDgMCGgMVALPJcNtFs5sQ
// SIG // yojdS4Ye5mVl7rSooIGDMIGApH4wfDELMAkGA1UEBhMC
// SIG // VVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcT
// SIG // B1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jw
// SIG // b3JhdGlvbjEmMCQGA1UEAxMdTWljcm9zb2Z0IFRpbWUt
// SIG // U3RhbXAgUENBIDIwMTAwDQYJKoZIhvcNAQEFBQACBQDm
// SIG // G7SLMCIYDzIwMjIwNTAzMTgwMjUxWhgPMjAyMjA1MDQx
// SIG // ODAyNTFaMHQwOgYKKwYBBAGEWQoEATEsMCowCgIFAOYb
// SIG // tIsCAQAwBwIBAAICELkwBwIBAAICErswCgIFAOYdBgsC
// SIG // AQAwNgYKKwYBBAGEWQoEAjEoMCYwDAYKKwYBBAGEWQoD
// SIG // AqAKMAgCAQACAwehIKEKMAgCAQACAwGGoDANBgkqhkiG
// SIG // 9w0BAQUFAAOBgQA14LFUIBLHAq2OiUvmnTWdBRtu5WJE
// SIG // 3IuIrLNGAzDvAG9x7ZHSmTiqvIceKfCeANrUHnJp/Orm
// SIG // 5ATQrlFEMvXnef8OwtIB74Vlx9Oqn1QpMYivHGWleUry
// SIG // U5K26mvpmD6RL1LD+NZtertIXIyaJgmUwoWyCY4Q0bhc
// SIG // y+6izYzGLDGCBA0wggQJAgEBMIGTMHwxCzAJBgNVBAYT
// SIG // AlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQH
// SIG // EwdSZWRtb25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29y
// SIG // cG9yYXRpb24xJjAkBgNVBAMTHU1pY3Jvc29mdCBUaW1l
// SIG // LVN0YW1wIFBDQSAyMDEwAhMzAAABpQDeCMRAB3FOAAEA
// SIG // AAGlMA0GCWCGSAFlAwQCAQUAoIIBSjAaBgkqhkiG9w0B
// SIG // CQMxDQYLKoZIhvcNAQkQAQQwLwYJKoZIhvcNAQkEMSIE
// SIG // IH6UI0ioBmjUkmeYtQUyT8UkJ97pyRWXhQlXdwn1iLS4
// SIG // MIH6BgsqhkiG9w0BCRACLzGB6jCB5zCB5DCBvQQguAo4
// SIG // cX5mBLGgrdgFPNyoYfuiR5cpNwe9L3zBzJQS3FwwgZgw
// SIG // gYCkfjB8MQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2Fz
// SIG // aGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UE
// SIG // ChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMSYwJAYDVQQD
// SIG // Ex1NaWNyb3NvZnQgVGltZS1TdGFtcCBQQ0EgMjAxMAIT
// SIG // MwAAAaUA3gjEQAdxTgABAAABpTAiBCCxasnc2785Sh0s
// SIG // WRLLRS6vo+icQ91TWxJvaFXPRVNIgDANBgkqhkiG9w0B
// SIG // AQsFAASCAgBA4LQhvFC0mAmlJ3LmWoub3NcEmKVe77tP
// SIG // tJ+PG6anaGvHCAnT27+TJF6eVDHh8eAGwHseHzfdaenq
// SIG // 8KVh1AdJtRlfhctkj5xHYFIGPNAMtxAJZTd7aiQ51G/i
// SIG // kHBnp5jqmFE5UuwM8iKw4Qe+DfDMHwcluut3f8gosAZj
// SIG // 0pfHAtvmFBBn4UQmhc3/hLwGPdPi0MMGhPxII+mcOFML
// SIG // ueeW9fOaR6mcJgTmHCJBaNkeStCnA45FM3qQPsI1+vW+
// SIG // jMKRC1KGpktajlABCwblq/6fXbJ8IE+vJSlGiBW8vCAv
// SIG // AUcIaCzwZgceL8L19XE4LZXfBOUlmh1/qTfeEmwqK0m/
// SIG // CWbsYgBWWnj5KSFQtO5PtdS59qcCfps8/lzIYntx1ANg
// SIG // lDt3/sX3gi1bUr5ef3qw+oak94O5GnTrv5xvNYMUSvXa
// SIG // l1qzqvwuZsgaXs8JLIDXQVueWVlFP77GuRhs/ZP2q3e3
// SIG // TsTd8/Ox1BHqIsX9xR8YhGEWDyhQ3LYH85ABMRRhkf1O
// SIG // 35aRZQU6E7jnvZmxBs3D16DfHzYTGabja/MXtfWIpgB9
// SIG // mrG8eclM4z8e7/HRNymRWCYZ9buiVdFc375gFM8mjvF7
// SIG // ZJMtJqvqxNy8hnTqoIxoqA3yuYUZyMf8hLolvHbsBVxb
// SIG // AfDmcdg/7YAtTUPAZjoycZbWcTHAOCi8TQ==
// SIG // End signature block
