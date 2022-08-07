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
exports.UsbDetector = void 0;
const fs = require("fs");
const os = require("os");
const path = require("path");
const vscode = require("vscode");
const vscodeSettings_1 = require("../arduino/vscodeSettings");
const arduinoActivator_1 = require("../arduinoActivator");
const arduinoContext_1 = require("../arduinoContext");
const constants_1 = require("../common/constants");
const workspace_1 = require("../common/workspace");
const util = require("../common/util");
const Logger = require("../logger/logger");
const serialMonitor_1 = require("./serialMonitor");
const HTML_EXT = ".html";
const MARKDOWN_EXT = ".md";
class UsbDetector {
    constructor() {
        this._boardDescriptors = null;
        this._extensionRoot = null;
    }
    static getInstance() {
        if (!UsbDetector._instance) {
            UsbDetector._instance = new UsbDetector();
        }
        return UsbDetector._instance;
    }
    initialize(extensionRoot) {
        this._extensionRoot = extensionRoot;
    }
    startListening() {
        return __awaiter(this, void 0, void 0, function* () {
            const enableUSBDetection = vscodeSettings_1.VscodeSettings.getInstance().enableUSBDetection;
            if (os.platform() === "linux" || !enableUSBDetection) {
                return;
            }
            this._usbDetector = require("usb-detection");
            if (!this._usbDetector) {
                return;
            }
            if (this._extensionRoot === null) {
                throw new Error("UsbDetector should be initialized before using.");
            }
            this._usbDetector.on("add", (device) => __awaiter(this, void 0, void 0, function* () {
                if (device.vendorId && device.productId) {
                    const deviceDescriptor = this.getUsbDeviceDescriptor(util.convertToHex(device.vendorId, 4), // vid and pid both are 2 bytes long.
                    util.convertToHex(device.productId, 4), this._extensionRoot);
                    // Not supported device for discovery.
                    if (!deviceDescriptor) {
                        return;
                    }
                    const boardKey = `${deviceDescriptor.package}:${deviceDescriptor.architecture}:${deviceDescriptor.id}`;
                    Logger.traceUserData("detected a board", { board: boardKey });
                    if (!arduinoContext_1.default.initialized) {
                        yield arduinoActivator_1.default.activate();
                    }
                    if (!serialMonitor_1.SerialMonitor.getInstance().initialized) {
                        serialMonitor_1.SerialMonitor.getInstance().initialize();
                    }
                    // TODO EW: this is board manager code which should be moved into board manager
                    let bd = arduinoContext_1.default.boardManager.installedBoards.get(boardKey);
                    const openEditor = vscode.window.activeTextEditor;
                    if (workspace_1.ArduinoWorkspace.rootPath && (util.fileExistsSync(path.join(workspace_1.ArduinoWorkspace.rootPath, constants_1.ARDUINO_CONFIG_FILE))
                        || (openEditor && openEditor.document.fileName.endsWith(".ino")))) {
                        if (!bd) {
                            arduinoContext_1.default.boardManager.updatePackageIndex(deviceDescriptor.indexFile).then((shouldLoadPackageContent) => {
                                const ignoreBoards = vscodeSettings_1.VscodeSettings.getInstance().ignoreBoards || [];
                                if (ignoreBoards.indexOf(deviceDescriptor.name) >= 0) {
                                    return;
                                }
                                vscode.window.showInformationMessage(`Install board package for ${deviceDescriptor.name}`, "Yes", "No", "Don't ask again").then((ans) => {
                                    if (ans === "Yes") {
                                        arduinoContext_1.default.arduinoApp.installBoard(deviceDescriptor.package, deviceDescriptor.architecture)
                                            .then(() => {
                                            if (shouldLoadPackageContent) {
                                                arduinoContext_1.default.boardManager.loadPackageContent(deviceDescriptor.indexFile);
                                            }
                                            arduinoContext_1.default.boardManager.updateInstalledPlatforms(deviceDescriptor.package, deviceDescriptor.architecture);
                                            bd = arduinoContext_1.default.boardManager.installedBoards.get(boardKey);
                                            this.switchBoard(bd, deviceDescriptor);
                                        });
                                    }
                                    else if (ans === "Don't ask again") {
                                        ignoreBoards.push(deviceDescriptor.name);
                                        vscodeSettings_1.VscodeSettings.getInstance().ignoreBoards = ignoreBoards;
                                    }
                                });
                            });
                        }
                        else if (arduinoContext_1.default.boardManager.currentBoard) {
                            const currBoard = arduinoContext_1.default.boardManager.currentBoard;
                            if (currBoard.board !== deviceDescriptor.id
                                || currBoard.platform.architecture !== deviceDescriptor.architecture
                                || currBoard.getPackageName() !== deviceDescriptor.package) {
                                const ignoreBoards = vscodeSettings_1.VscodeSettings.getInstance().ignoreBoards || [];
                                if (ignoreBoards.indexOf(deviceDescriptor.name) >= 0) {
                                    return;
                                }
                                vscode.window.showInformationMessage(`Detected board ${deviceDescriptor.name}. Would you like to switch to this board type?`, "Yes", "No", "Don't ask again")
                                    .then((ans) => {
                                    if (ans === "Yes") {
                                        return this.switchBoard(bd, deviceDescriptor);
                                    }
                                    else if (ans === "Don't ask again") {
                                        ignoreBoards.push(deviceDescriptor.name);
                                        vscodeSettings_1.VscodeSettings.getInstance().ignoreBoards = ignoreBoards;
                                    }
                                });
                            }
                            else {
                                const monitor = serialMonitor_1.SerialMonitor.getInstance();
                                monitor.selectSerialPort(deviceDescriptor.vid, deviceDescriptor.pid);
                                this.showReadMeAndExample(deviceDescriptor.readme);
                            }
                        }
                        else {
                            this.switchBoard(bd, deviceDescriptor);
                        }
                    }
                }
            }));
            this._usbDetector.startMonitoring();
        });
    }
    stopListening() {
        if (this._usbDetector) {
            this._usbDetector.stopMonitoring();
        }
    }
    pauseListening() {
        if (this._usbDetector) {
            this._usbDetector.stopMonitoring();
        }
    }
    resumeListening() {
        if (this._usbDetector) {
            this._usbDetector.startMonitoring();
        }
        else {
            this.startListening();
        }
    }
    switchBoard(bd, deviceDescriptor, showReadMe = true) {
        arduinoContext_1.default.boardManager.doChangeBoardType(bd);
        const monitor = serialMonitor_1.SerialMonitor.getInstance();
        monitor.selectSerialPort(deviceDescriptor.vid, deviceDescriptor.pid);
        if (showReadMe) {
            this.showReadMeAndExample(deviceDescriptor.readme);
        }
    }
    showReadMeAndExample(readme) {
        if (arduinoContext_1.default.boardManager.currentBoard) {
            let readmeFilePath = "";
            if (readme) {
                readmeFilePath = path.join(arduinoContext_1.default.boardManager.currentBoard.platform.rootBoardPath, readme);
            }
            if (!readmeFilePath || !util.fileExistsSync(readmeFilePath)) {
                readmeFilePath = path.join(arduinoContext_1.default.boardManager.currentBoard.platform.rootBoardPath, "README.md");
            }
            vscode.commands.executeCommand("arduino.showExamples", true);
            if (util.fileExistsSync(readmeFilePath)) {
                if (readmeFilePath.endsWith(MARKDOWN_EXT)) {
                    vscode.commands.executeCommand("markdown.showPreview", vscode.Uri.file(readmeFilePath));
                }
                else if (readmeFilePath.endsWith(HTML_EXT)) {
                    const panel = vscode.window.createWebviewPanel("arduinoBoardReadMe", "", vscode.ViewColumn.One, {
                        enableScripts: true,
                        retainContextWhenHidden: true,
                    });
                    panel.webview.html = fs.readFileSync(readmeFilePath, "utf8");
                }
            }
        }
    }
    getUsbDeviceDescriptor(vendorId, productId, extensionRoot) {
        if (!this._boardDescriptors) {
            this._boardDescriptors = [];
            const fileContent = fs.readFileSync(path.join(extensionRoot, "misc", "usbmapping.json"), "utf8");
            const boardIndexes = JSON.parse(fileContent);
            boardIndexes.forEach((boardIndex) => {
                boardIndex.boards.forEach((board) => board.indexFile = boardIndex.index_file);
                this._boardDescriptors = this._boardDescriptors.concat(boardIndex.boards);
            });
        }
        return this._boardDescriptors.find((obj) => {
            return obj.vid === vendorId && (obj.pid === productId || (obj.pid.indexOf && obj.pid.indexOf(productId) >= 0));
        });
    }
}
exports.UsbDetector = UsbDetector;

//# sourceMappingURL=usbDetector.js.map

// SIG // Begin signature block
// SIG // MIIntAYJKoZIhvcNAQcCoIInpTCCJ6ECAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // yOq3vqZEhTgrk/Xo3nQZnWr6uE5TtM9VyZgezXmgvcug
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
// SIG // SEXAQsmbdlsKgEhr/Xmfwb1tbWrJUnMTDXpQzTGCGYsw
// SIG // ghmHAgEBMIGVMH4xCzAJBgNVBAYTAlVTMRMwEQYDVQQI
// SIG // EwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4w
// SIG // HAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xKDAm
// SIG // BgNVBAMTH01pY3Jvc29mdCBDb2RlIFNpZ25pbmcgUENB
// SIG // IDIwMTECEzMAAAJSizOq+JXzOdsAAAAAAlIwDQYJYIZI
// SIG // AWUDBAIBBQCgga4wGQYJKoZIhvcNAQkDMQwGCisGAQQB
// SIG // gjcCAQQwHAYKKwYBBAGCNwIBCzEOMAwGCisGAQQBgjcC
// SIG // ARUwLwYJKoZIhvcNAQkEMSIEINU24eG9mtiBZSOzQBYL
// SIG // URlo1ie9rBEiyXA0EpriYnUjMEIGCisGAQQBgjcCAQwx
// SIG // NDAyoBSAEgBNAGkAYwByAG8AcwBvAGYAdKEagBhodHRw
// SIG // Oi8vd3d3Lm1pY3Jvc29mdC5jb20wDQYJKoZIhvcNAQEB
// SIG // BQAEggEAfwWgeui4koyj7aAMJfk5hSE4WjUBSX+PCgzf
// SIG // vCu37gftpig33TpnPHtDtQsXbaNoKAYDdthe2YIFnETp
// SIG // Ytzy5QD1ILyMeeYKQGESvGjwg7aiTOZI3iCn+uMVGocK
// SIG // HZ+lEgZqM5P3lvXoidqXJknY6N/+0YDpYCwSylbMQedc
// SIG // Y7p9z8dl4prqCauHYQ0qn+6K6sSabpGvBxxGV0L5jW8s
// SIG // Nq4ntEbXvLmPDWeQi3uVW2EMUjtT8LupL+KAhydPs8v7
// SIG // 2fzNR43Bqilg0Ebz10/HFgzPKk6WpeJznQjX5QJKm+qK
// SIG // Ts54wTMjK4PnNKFRYayyBP5XkhpuIj+Ql1byiXmCC6GC
// SIG // FxUwghcRBgorBgEEAYI3AwMBMYIXATCCFv0GCSqGSIb3
// SIG // DQEHAqCCFu4wghbqAgEDMQ8wDQYJYIZIAWUDBAIBBQAw
// SIG // ggFYBgsqhkiG9w0BCRABBKCCAUcEggFDMIIBPwIBAQYK
// SIG // KwYBBAGEWQoDATAxMA0GCWCGSAFlAwQCAQUABCBYCrFF
// SIG // BS4p96G2gNP5+vmj2grSx1F9vmB0nixN+BHH8AIGYmxK
// SIG // ouzUGBIyMDIyMDUwMzE5MDEwOC42MlowBIACAfSggdik
// SIG // gdUwgdIxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNo
// SIG // aW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4wHAYDVQQK
// SIG // ExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xLTArBgNVBAsT
// SIG // JE1pY3Jvc29mdCBJcmVsYW5kIE9wZXJhdGlvbnMgTGlt
// SIG // aXRlZDEmMCQGA1UECxMdVGhhbGVzIFRTUyBFU046MTc5
// SIG // RS00QkIwLTgyNDYxJTAjBgNVBAMTHE1pY3Jvc29mdCBU
// SIG // aW1lLVN0YW1wIFNlcnZpY2WgghFlMIIHFDCCBPygAwIB
// SIG // AgITMwAAAYo+OI3SDgL66AABAAABijANBgkqhkiG9w0B
// SIG // AQsFADB8MQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2Fz
// SIG // aGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UE
// SIG // ChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMSYwJAYDVQQD
// SIG // Ex1NaWNyb3NvZnQgVGltZS1TdGFtcCBQQ0EgMjAxMDAe
// SIG // Fw0yMTEwMjgxOTI3NDJaFw0yMzAxMjYxOTI3NDJaMIHS
// SIG // MQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3Rv
// SIG // bjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMVTWlj
// SIG // cm9zb2Z0IENvcnBvcmF0aW9uMS0wKwYDVQQLEyRNaWNy
// SIG // b3NvZnQgSXJlbGFuZCBPcGVyYXRpb25zIExpbWl0ZWQx
// SIG // JjAkBgNVBAsTHVRoYWxlcyBUU1MgRVNOOjE3OUUtNEJC
// SIG // MC04MjQ2MSUwIwYDVQQDExxNaWNyb3NvZnQgVGltZS1T
// SIG // dGFtcCBTZXJ2aWNlMIICIjANBgkqhkiG9w0BAQEFAAOC
// SIG // Ag8AMIICCgKCAgEAt/+ut6GDAyAZvegBhagWd0GoqT8l
// SIG // FHMepoWNOLPPEEoLuya4X3n+K14FvlZwFmKwqap6B+6E
// SIG // kITSjkecTSB6QRA4kivdJydlLvKrg8udtBu67LKyjQqw
// SIG // RzDQTRhECxpU30tdBE/AeyP95k7qndhIu/OpT4QGyGJU
// SIG // iMDlmZAiDPY5FJkitUgGvwMBHwogJz8FVEBFnViAURTJ
// SIG // 4kBDiU6ppbv4PI97+vQhpspDK+83gayaiRC3gNTGy3iO
// SIG // ie6Psl03cvYIiFcAJRP4O0RkeFlv/SQoomz3JtsMd9oo
// SIG // S/XO0vSN9h2DVKONMjaFOgnN5Rk5iCqwmn6qsme+haoR
// SIG // /TrCBS0zXjXsWTgkljUBtt17UBbW8RL+9LNw3cjPJ8EY
// SIG // RglMNXCYLM6GzCDXEvE9T//sAv+k1c84tmoiZDZBqBgr
// SIG // /SvL+gVsOz3EoDZQ26qTa1bEn/npxMmXctoZSe8SRDqg
// SIG // K0JUWhjKXgnyaOADEB+FtfIi+jdcUJbpPtAL4kWvVSRK
// SIG // ipVv8MEuYRLexXEDEBi+V4tfKApZhE4ga0p+QCiawHLB
// SIG // ZNoj3UQNzM5QVmGai3MnQFbZkhqbUDypo9vaWEeVeO35
// SIG // JfdLWjwRgvMX3VKZL57d7jmRjiVlluXjZFLx+rhJL7JY
// SIG // VptOPtF1MAtMYlp6OugnOpG+4W4MGHqj7YYfP0UCAwEA
// SIG // AaOCATYwggEyMB0GA1UdDgQWBBQj2kPY/WwZ1Jeup0lH
// SIG // hD4xkGkkAzAfBgNVHSMEGDAWgBSfpxVdAF5iXYP05dJl
// SIG // pxtTNRnpcjBfBgNVHR8EWDBWMFSgUqBQhk5odHRwOi8v
// SIG // d3d3Lm1pY3Jvc29mdC5jb20vcGtpb3BzL2NybC9NaWNy
// SIG // b3NvZnQlMjBUaW1lLVN0YW1wJTIwUENBJTIwMjAxMCgx
// SIG // KS5jcmwwbAYIKwYBBQUHAQEEYDBeMFwGCCsGAQUFBzAC
// SIG // hlBodHRwOi8vd3d3Lm1pY3Jvc29mdC5jb20vcGtpb3Bz
// SIG // L2NlcnRzL01pY3Jvc29mdCUyMFRpbWUtU3RhbXAlMjBQ
// SIG // Q0ElMjAyMDEwKDEpLmNydDAMBgNVHRMBAf8EAjAAMBMG
// SIG // A1UdJQQMMAoGCCsGAQUFBwMIMA0GCSqGSIb3DQEBCwUA
// SIG // A4ICAQDF9MESsPXDeRtfFo1f575iPfF9ARWbeuuNfM58
// SIG // 3IfTxfzZf2dv/me3DNi/KcNNEnR1TKbZtG7Lsg0cy/pK
// SIG // IEQOJG2fYaWwIIKYwuyDJI2Q4kVi5mzbV/0C5+vQQsQc
// SIG // CvfsM8K5X2ffifJi7tqeG0r58Cjgwe7xBYvguPmjUNxw
// SIG // TWvEjZIPfpjVUoaPCl6qqs0eFUb7bcLhzTEEYBnAj8ME
// SIG // NhiP5IJd4Pp5lFqHTtpec67YFmGuO/uIA/TjPBfctM5k
// SIG // UI+uzfyh/yIdtDNtkIz+e/xmXSFhiQER0uBjRobQZV6c
// SIG // +0TNtvRNLayU4u7Eekd7OaDXzQR0RuWGaSiwtN6Xc/Po
// SIG // NP0rezG6Ovcyow1qMoUkUEQ7qqD0Qq8QFwK0DKCdZSJt
// SIG // yBKMBpjUYCnNUZbYvTTWm4DXK5RYgf23bVBJW4Xo5w49
// SIG // 0HHo4TjWNqz17PqPyMCTnM8HcAqTnPeME0dPYvbdwzDM
// SIG // gbumydbJaq/06FImkJ7KXs9jxqDiE2PTeYnaj82n6Q//
// SIG // PqbHuxxJmwQO4fzdOgVqAEkG1XDmppVKW/rJxBN3IxyV
// SIG // r6QP9chY2MYVa0bbACI2dvU+R2QJlE5AjoMKy68WI1pm
// SIG // FT3JKBrracpy6HUjGrtV+/1U52brrElClVy5Fb8+UZWZ
// SIG // Lp82cuCztJMMSqW+kP5zyVBSvLM+4DCCB3EwggVZoAMC
// SIG // AQICEzMAAAAVxedrngKbSZkAAAAAABUwDQYJKoZIhvcN
// SIG // AQELBQAwgYgxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpX
// SIG // YXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4wHAYD
// SIG // VQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xMjAwBgNV
// SIG // BAMTKU1pY3Jvc29mdCBSb290IENlcnRpZmljYXRlIEF1
// SIG // dGhvcml0eSAyMDEwMB4XDTIxMDkzMDE4MjIyNVoXDTMw
// SIG // MDkzMDE4MzIyNVowfDELMAkGA1UEBhMCVVMxEzARBgNV
// SIG // BAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1vbmQx
// SIG // HjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjEm
// SIG // MCQGA1UEAxMdTWljcm9zb2Z0IFRpbWUtU3RhbXAgUENB
// SIG // IDIwMTAwggIiMA0GCSqGSIb3DQEBAQUAA4ICDwAwggIK
// SIG // AoICAQDk4aZM57RyIQt5osvXJHm9DtWC0/3unAcH0qls
// SIG // TnXIyjVX9gF/bErg4r25PhdgM/9cT8dm95VTcVrifkpa
// SIG // /rg2Z4VGIwy1jRPPdzLAEBjoYH1qUoNEt6aORmsHFPPF
// SIG // dvWGUNzBRMhxXFExN6AKOG6N7dcP2CZTfDlhAnrEqv1y
// SIG // aa8dq6z2Nr41JmTamDu6GnszrYBbfowQHJ1S/rboYiXc
// SIG // ag/PXfT+jlPP1uyFVk3v3byNpOORj7I5LFGc6XBpDco2
// SIG // LXCOMcg1KL3jtIckw+DJj361VI/c+gVVmG1oO5pGve2k
// SIG // rnopN6zL64NF50ZuyjLVwIYwXE8s4mKyzbnijYjklqwB
// SIG // Sru+cakXW2dg3viSkR4dPf0gz3N9QZpGdc3EXzTdEonW
// SIG // /aUgfX782Z5F37ZyL9t9X4C626p+Nuw2TPYrbqgSUei/
// SIG // BQOj0XOmTTd0lBw0gg/wEPK3Rxjtp+iZfD9M269ewvPV
// SIG // 2HM9Q07BMzlMjgK8QmguEOqEUUbi0b1qGFphAXPKZ6Je
// SIG // 1yh2AuIzGHLXpyDwwvoSCtdjbwzJNmSLW6CmgyFdXzB0
// SIG // kZSU2LlQ+QuJYfM2BjUYhEfb3BvR/bLUHMVr9lxSUV0S
// SIG // 2yW6r1AFemzFER1y7435UsSFF5PAPBXbGjfHCBUYP3ir
// SIG // Rbb1Hode2o+eFnJpxq57t7c+auIurQIDAQABo4IB3TCC
// SIG // AdkwEgYJKwYBBAGCNxUBBAUCAwEAATAjBgkrBgEEAYI3
// SIG // FQIEFgQUKqdS/mTEmr6CkTxGNSnPEP8vBO4wHQYDVR0O
// SIG // BBYEFJ+nFV0AXmJdg/Tl0mWnG1M1GelyMFwGA1UdIARV
// SIG // MFMwUQYMKwYBBAGCN0yDfQEBMEEwPwYIKwYBBQUHAgEW
// SIG // M2h0dHA6Ly93d3cubWljcm9zb2Z0LmNvbS9wa2lvcHMv
// SIG // RG9jcy9SZXBvc2l0b3J5Lmh0bTATBgNVHSUEDDAKBggr
// SIG // BgEFBQcDCDAZBgkrBgEEAYI3FAIEDB4KAFMAdQBiAEMA
// SIG // QTALBgNVHQ8EBAMCAYYwDwYDVR0TAQH/BAUwAwEB/zAf
// SIG // BgNVHSMEGDAWgBTV9lbLj+iiXGJo0T2UkFvXzpoYxDBW
// SIG // BgNVHR8ETzBNMEugSaBHhkVodHRwOi8vY3JsLm1pY3Jv
// SIG // c29mdC5jb20vcGtpL2NybC9wcm9kdWN0cy9NaWNSb29D
// SIG // ZXJBdXRfMjAxMC0wNi0yMy5jcmwwWgYIKwYBBQUHAQEE
// SIG // TjBMMEoGCCsGAQUFBzAChj5odHRwOi8vd3d3Lm1pY3Jv
// SIG // c29mdC5jb20vcGtpL2NlcnRzL01pY1Jvb0NlckF1dF8y
// SIG // MDEwLTA2LTIzLmNydDANBgkqhkiG9w0BAQsFAAOCAgEA
// SIG // nVV9/Cqt4SwfZwExJFvhnnJL/Klv6lwUtj5OR2R4sQaT
// SIG // lz0xM7U518JxNj/aZGx80HU5bbsPMeTCj/ts0aGUGCLu
// SIG // 6WZnOlNN3Zi6th542DYunKmCVgADsAW+iehp4LoJ7nvf
// SIG // am++Kctu2D9IdQHZGN5tggz1bSNU5HhTdSRXud2f8449
// SIG // xvNo32X2pFaq95W2KFUn0CS9QKC/GbYSEhFdPSfgQJY4
// SIG // rPf5KYnDvBewVIVCs/wMnosZiefwC2qBwoEZQhlSdYo2
// SIG // wh3DYXMuLGt7bj8sCXgU6ZGyqVvfSaN0DLzskYDSPeZK
// SIG // PmY7T7uG+jIa2Zb0j/aRAfbOxnT99kxybxCrdTDFNLB6
// SIG // 2FD+CljdQDzHVG2dY3RILLFORy3BFARxv2T5JL5zbcqO
// SIG // Cb2zAVdJVGTZc9d/HltEAY5aGZFrDZ+kKNxnGSgkujhL
// SIG // mm77IVRrakURR6nxt67I6IleT53S0Ex2tVdUCbFpAUR+
// SIG // fKFhbHP+CrvsQWY9af3LwUFJfn6Tvsv4O+S3Fb+0zj6l
// SIG // MVGEvL8CwYKiexcdFYmNcP7ntdAoGokLjzbaukz5m/8K
// SIG // 6TT4JDVnK+ANuOaMmdbhIurwJ0I9JZTmdHRbatGePu1+
// SIG // oDEzfbzL6Xu/OHBE0ZDxyKs6ijoIYn/ZcGNTTY3ugm2l
// SIG // BRDBcQZqELQdVTNYs6FwZvKhggLUMIICPQIBATCCAQCh
// SIG // gdikgdUwgdIxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpX
// SIG // YXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4wHAYD
// SIG // VQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xLTArBgNV
// SIG // BAsTJE1pY3Jvc29mdCBJcmVsYW5kIE9wZXJhdGlvbnMg
// SIG // TGltaXRlZDEmMCQGA1UECxMdVGhhbGVzIFRTUyBFU046
// SIG // MTc5RS00QkIwLTgyNDYxJTAjBgNVBAMTHE1pY3Jvc29m
// SIG // dCBUaW1lLVN0YW1wIFNlcnZpY2WiIwoBATAHBgUrDgMC
// SIG // GgMVAIDw82OvG1MFBB2n/4weVqpzV8ShoIGDMIGApH4w
// SIG // fDELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0
// SIG // b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1p
// SIG // Y3Jvc29mdCBDb3Jwb3JhdGlvbjEmMCQGA1UEAxMdTWlj
// SIG // cm9zb2Z0IFRpbWUtU3RhbXAgUENBIDIwMTAwDQYJKoZI
// SIG // hvcNAQEFBQACBQDmG2YwMCIYDzIwMjIwNTAzMTYyODMy
// SIG // WhgPMjAyMjA1MDQxNjI4MzJaMHQwOgYKKwYBBAGEWQoE
// SIG // ATEsMCowCgIFAOYbZjACAQAwBwIBAAICFd0wBwIBAAIC
// SIG // Ek4wCgIFAOYct7ACAQAwNgYKKwYBBAGEWQoEAjEoMCYw
// SIG // DAYKKwYBBAGEWQoDAqAKMAgCAQACAwehIKEKMAgCAQAC
// SIG // AwGGoDANBgkqhkiG9w0BAQUFAAOBgQAgWaexxXEtC4H/
// SIG // ZOs67e74FekNeyTGf518ag6a8OULLhsx2uy4znGkxFsf
// SIG // gD7y/mFa+gjpbGU+JriLSwwaSnjwhd4hjt0ZsiEKPuYG
// SIG // HzrMdtD7SUI+s4eKFNhQH0RX1Br1vB6JvKoh4RhTnKJf
// SIG // rRZXMV7QL4VBv2gk0x4n3czOLDGCBA0wggQJAgEBMIGT
// SIG // MHwxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNoaW5n
// SIG // dG9uMRAwDgYDVQQHEwdSZWRtb25kMR4wHAYDVQQKExVN
// SIG // aWNyb3NvZnQgQ29ycG9yYXRpb24xJjAkBgNVBAMTHU1p
// SIG // Y3Jvc29mdCBUaW1lLVN0YW1wIFBDQSAyMDEwAhMzAAAB
// SIG // ij44jdIOAvroAAEAAAGKMA0GCWCGSAFlAwQCAQUAoIIB
// SIG // SjAaBgkqhkiG9w0BCQMxDQYLKoZIhvcNAQkQAQQwLwYJ
// SIG // KoZIhvcNAQkEMSIEIFsJJDUMfbxN3rAzeZYdUydM8W6m
// SIG // /CB5HfyohhoVx0DGMIH6BgsqhkiG9w0BCRACLzGB6jCB
// SIG // 5zCB5DCBvQQg9L3gq3XfSr5+879/MPgxtZCFBoTtEeQ4
// SIG // foCSOU1UKb0wgZgwgYCkfjB8MQswCQYDVQQGEwJVUzET
// SIG // MBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVk
// SIG // bW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBvcmF0
// SIG // aW9uMSYwJAYDVQQDEx1NaWNyb3NvZnQgVGltZS1TdGFt
// SIG // cCBQQ0EgMjAxMAITMwAAAYo+OI3SDgL66AABAAABijAi
// SIG // BCDu8YhSZLK4s/blWIQBPe5NVGpsFBjZiIJxq3dBw0fk
// SIG // nDANBgkqhkiG9w0BAQsFAASCAgB/8Mxj1Y5uuhxOIfQ5
// SIG // mjeBgpe5dUKCGwJe+1BMj7rA2CAWcY33cbuS9+rc8/y0
// SIG // hVadYJ520QWEghcUB9J3DkdggN+rziPKl4B3Gmha3Q71
// SIG // HRH6iYbnxHM6N52PxVaahznZxz9SqTSO/ue0Xqe6f9Il
// SIG // hEdiz1r+ZKH7iiM465gPLIeUmou1SMHs0hf67pX1RjY3
// SIG // wWvljdsdQa2VyeCxQM4AyqTeCIxWW9mEoM+Wk5koA+ic
// SIG // CaCgON8hoVfzUEnicIjscSuDu2qwP4URBiv6oq8KhwmG
// SIG // dqelPrk9XKgO2oXa4SYdw+YA6mXvfOouEbQcSzGyGsQS
// SIG // EUwQsgRryr3Bx/mc9Vwr6/kaZXmeHtHIuH0ARl+I6+BH
// SIG // C+KVQupKsTNwwj6I94usMInM/UDeDDgqGx63wHzBCmrj
// SIG // TRJfQSX1dyCmH4vPEXckbsCyCGC+lF5fE6uzwZEnwKV8
// SIG // l7LkYFcNKaMFC2NbeQ5jHtJDtjAOvq48K8PBF1WvAONf
// SIG // ZTmvbt7ujTNiJhD11GXVzj/I5REm2ASmYIDfuYN50OGI
// SIG // NiksbHaMEP4Blk8UXVpxNvcnCcDDv4a2nvOd0jWfnCAy
// SIG // QLqYayJ60amCVGGE0TmH5VAJe14U770z0Nz+CiB5ck5v
// SIG // dH3xws40UQPv+AXDAUrUV6SFPuP31xtWQg7VLgmITXLa
// SIG // fZ38XA==
// SIG // End signature block
