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
exports.SerialMonitor = void 0;
const vscode = require("vscode");
const arduinoContext_1 = require("../arduinoContext");
const constants = require("../common/constants");
const deviceContext_1 = require("../deviceContext");
const Logger = require("../logger/logger");
const outputBuffer_1 = require("./outputBuffer");
const serialportctrl_1 = require("./serialportctrl");
class SerialMonitor {
    constructor() {
        this._serialPortCtrl = null;
    }
    static listBaudRates() {
        return [300, 1200, 2400, 4800, 9600, 19200, 38400, 57600, 74880, 115200, 230400, 250000, 500000, 1000000, 2000000];
    }
    static getInstance() {
        if (SerialMonitor._serialMonitor === null) {
            SerialMonitor._serialMonitor = new SerialMonitor();
        }
        return SerialMonitor._serialMonitor;
    }
    initialize() {
        let defaultBaudRate;
        if (arduinoContext_1.default.arduinoApp && arduinoContext_1.default.arduinoApp.settings && arduinoContext_1.default.arduinoApp.settings.defaultBaudRate) {
            defaultBaudRate = arduinoContext_1.default.arduinoApp.settings.defaultBaudRate;
        }
        else {
            defaultBaudRate = SerialMonitor.DEFAULT_BAUD_RATE;
        }
        let defaultTimestampFormat;
        if (arduinoContext_1.default.arduinoApp && arduinoContext_1.default.arduinoApp.settings && arduinoContext_1.default.arduinoApp.settings.defaultTimestampFormat) {
            defaultTimestampFormat = arduinoContext_1.default.arduinoApp.settings.defaultTimestampFormat;
        }
        else {
            defaultTimestampFormat = SerialMonitor.DEFAULT_TIMESTAMP_FORMAT;
        }
        this._outputChannel = vscode.window.createOutputChannel(SerialMonitor.SERIAL_MONITOR);
        this._bufferedOutputChannel = new outputBuffer_1.BufferedOutputChannel(this._outputChannel.append, 300);
        this._currentBaudRate = defaultBaudRate;
        this._currentTimestampFormat = defaultTimestampFormat;
        this._portsStatusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, constants.statusBarPriority.PORT);
        this._portsStatusBar.command = "arduino.selectSerialPort";
        this._portsStatusBar.tooltip = "Select Serial Port";
        this._portsStatusBar.show();
        this._openPortStatusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, constants.statusBarPriority.OPEN_PORT);
        this._openPortStatusBar.command = "arduino.openSerialMonitor";
        this._openPortStatusBar.text = `$(plug)`;
        this._openPortStatusBar.tooltip = "Open Serial Monitor";
        this._openPortStatusBar.show();
        this._baudRateStatusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, constants.statusBarPriority.BAUD_RATE);
        this._baudRateStatusBar.command = "arduino.changeBaudRate";
        this._baudRateStatusBar.tooltip = "Baud Rate";
        this._baudRateStatusBar.text = defaultBaudRate.toString();
        this._timestampFormatStatusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, constants.statusBarPriority.TIMESTAMP_FORMAT);
        this._timestampFormatStatusBar.command = "arduino.changeTimestampFormat";
        this._timestampFormatStatusBar.tooltip = `Timestamp Format: "${defaultTimestampFormat}"`;
        this._timestampFormatStatusBar.text = `$(watch)`;
        this.updatePortListStatus();
        const dc = deviceContext_1.DeviceContext.getInstance();
        dc.onChangePort(() => {
            this.updatePortListStatus();
        });
    }
    get initialized() {
        return !!this._outputChannel;
    }
    dispose() {
        if (this._serialPortCtrl && this._serialPortCtrl.isActive) {
            return this._serialPortCtrl.stop();
        }
        this._outputChannel.dispose();
        this._bufferedOutputChannel.dispose();
    }
    selectSerialPort(vid, pid) {
        return __awaiter(this, void 0, void 0, function* () {
            const lists = yield serialportctrl_1.SerialPortCtrl.list();
            if (!lists.length) {
                vscode.window.showInformationMessage("No serial port is available.");
                return;
            }
            if (vid && pid) {
                const valueOfVid = parseInt(vid, 16);
                const valueOfPid = parseInt(pid, 16);
                const foundPort = lists.find((p) => {
                    // The pid and vid returned by SerialPortCtrl start with 0x prefix in Mac, but no 0x prefix in Win32.
                    // Should compare with decimal value to keep compatibility.
                    if (p.productId && p.vendorId) {
                        return parseInt(p.productId, 16) === valueOfPid && parseInt(p.vendorId, 16) === valueOfVid;
                    }
                    return false;
                });
                if (foundPort && !(this._serialPortCtrl && this._serialPortCtrl.isActive)) {
                    this.updatePortListStatus(foundPort.port);
                }
            }
            else {
                const chosen = yield vscode.window.showQuickPick(lists.map((l) => {
                    return {
                        description: l.desc,
                        label: l.port,
                    };
                }).sort((a, b) => {
                    return a.label === b.label ? 0 : (a.label > b.label ? 1 : -1);
                }), { placeHolder: "Select a serial port" });
                if (chosen && chosen.label) {
                    this.updatePortListStatus(chosen.label);
                }
            }
        });
    }
    openSerialMonitor() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this._currentPort) {
                const ans = yield vscode.window.showInformationMessage("No serial port was selected, please select a serial port first", "Yes", "No");
                if (ans === "Yes") {
                    yield this.selectSerialPort(null, null);
                }
                if (!this._currentPort) {
                    return;
                }
            }
            if (this._serialPortCtrl) {
                if (this._currentPort !== this._serialPortCtrl.currentPort) {
                    yield this._serialPortCtrl.changePort(this._currentPort);
                }
                else if (this._serialPortCtrl.isActive) {
                    vscode.window.showWarningMessage(`Serial monitor is already opened for ${this._currentPort}`);
                    return;
                }
            }
            else {
                this._serialPortCtrl = new serialportctrl_1.SerialPortCtrl(this._currentPort, this._currentBaudRate, this._currentTimestampFormat, this._bufferedOutputChannel, this._outputChannel.show);
            }
            if (!this._serialPortCtrl.currentPort) {
                Logger.traceError("openSerialMonitorError", new Error(`Failed to open serial port ${this._currentPort}`));
                return;
            }
            try {
                yield this._serialPortCtrl.open();
                this.updatePortStatus(true);
            }
            catch (error) {
                Logger.notifyUserWarning("openSerialMonitorError", error, `Failed to open serial port ${this._currentPort} due to error: + ${error.toString()}`);
            }
        });
    }
    sendMessageToSerialPort() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._serialPortCtrl && this._serialPortCtrl.isActive) {
                const text = yield vscode.window.showInputBox();
                try {
                    yield this._serialPortCtrl.sendMessage(text);
                }
                catch (error) {
                    Logger.notifyUserWarning("sendMessageToSerialPortError", error, constants.messages.FAILED_SEND_SERIALPORT);
                }
            }
            else {
                Logger.notifyUserWarning("sendMessageToSerialPortError", new Error(constants.messages.SEND_BEFORE_OPEN_SERIALPORT));
            }
        });
    }
    changeBaudRate() {
        return __awaiter(this, void 0, void 0, function* () {
            const rates = SerialMonitor.listBaudRates();
            const chosen = yield vscode.window.showQuickPick(rates.map((rate) => rate.toString()));
            if (!chosen) {
                Logger.warn("No baud rate selected, keeping previous baud rate.");
                return;
            }
            if (!parseInt(chosen, 10)) {
                Logger.warn("Invalid baud rate, keeping previous baud rate.", { value: chosen });
                return;
            }
            if (!this._serialPortCtrl) {
                Logger.warn("Serial Monitor has not been started.");
                return;
            }
            const selectedRate = parseInt(chosen, 10);
            yield this._serialPortCtrl.changeBaudRate(selectedRate);
            this._currentBaudRate = selectedRate;
            this._baudRateStatusBar.text = chosen;
        });
    }
    changeTimestampFormat() {
        return __awaiter(this, void 0, void 0, function* () {
            const timestampFormat = yield vscode.window.showInputBox();
            if (!timestampFormat) {
                Logger.warn("No timestamp format inputted, keeping previous timestamp format.");
                return;
            }
            if (timestampFormat.indexOf("%") < 0) {
                Logger.warn("Invalid timestamp format, keeping previous timestamp format.", { value: timestampFormat });
                return;
            }
            if (!this._serialPortCtrl) {
                Logger.warn("Serial Monitor has not been started.");
                return;
            }
            yield this._serialPortCtrl.changeTimestampFormat(timestampFormat);
            this._currentTimestampFormat = timestampFormat;
            this._timestampFormatStatusBar.tooltip = `Timestamp Format: "${timestampFormat}"`;
        });
    }
    closeSerialMonitor(port, showWarning = true) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._serialPortCtrl) {
                if (port && port !== this._serialPortCtrl.currentPort) {
                    // Port is not opened
                    return false;
                }
                const result = yield this._serialPortCtrl.stop();
                this.updatePortStatus(false);
                return result;
            }
            else if (!port && showWarning) {
                Logger.notifyUserWarning("closeSerialMonitorError", new Error(constants.messages.SERIAL_PORT_NOT_STARTED));
                return false;
            }
        });
    }
    updatePortListStatus(port) {
        const dc = deviceContext_1.DeviceContext.getInstance();
        if (port) {
            dc.port = port;
        }
        this._currentPort = dc.port;
        if (dc.port) {
            this._portsStatusBar.text = dc.port;
        }
        else {
            this._portsStatusBar.text = "<Select Serial Port>";
        }
    }
    updatePortStatus(isOpened) {
        if (isOpened) {
            this._openPortStatusBar.command = "arduino.closeSerialMonitor";
            this._openPortStatusBar.text = `$(x)`;
            this._openPortStatusBar.tooltip = "Close Serial Monitor";
            this._baudRateStatusBar.show();
            this._timestampFormatStatusBar.show();
        }
        else {
            this._openPortStatusBar.command = "arduino.openSerialMonitor";
            this._openPortStatusBar.text = `$(plug)`;
            this._openPortStatusBar.tooltip = "Open Serial Monitor";
            this._baudRateStatusBar.hide();
            this._timestampFormatStatusBar.hide();
        }
    }
}
exports.SerialMonitor = SerialMonitor;
SerialMonitor.SERIAL_MONITOR = "Serial Monitor";
SerialMonitor.DEFAULT_BAUD_RATE = 115200;
SerialMonitor.DEFAULT_TIMESTAMP_FORMAT = "";
SerialMonitor._serialMonitor = null;

//# sourceMappingURL=serialMonitor.js.map

// SIG // Begin signature block
// SIG // MIInqgYJKoZIhvcNAQcCoIInmzCCJ5cCAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // 5oK2POUVWvi9CWNVGFxyfE99/ltvt6jEERwD13ntlwag
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
// SIG // SEXAQsmbdlsKgEhr/Xmfwb1tbWrJUnMTDXpQzTGCGYEw
// SIG // ghl9AgEBMIGVMH4xCzAJBgNVBAYTAlVTMRMwEQYDVQQI
// SIG // EwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4w
// SIG // HAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xKDAm
// SIG // BgNVBAMTH01pY3Jvc29mdCBDb2RlIFNpZ25pbmcgUENB
// SIG // IDIwMTECEzMAAAJSizOq+JXzOdsAAAAAAlIwDQYJYIZI
// SIG // AWUDBAIBBQCgga4wGQYJKoZIhvcNAQkDMQwGCisGAQQB
// SIG // gjcCAQQwHAYKKwYBBAGCNwIBCzEOMAwGCisGAQQBgjcC
// SIG // ARUwLwYJKoZIhvcNAQkEMSIEICgKO0Nq1p3rnqd5IV3p
// SIG // 6WplOWTRheMoca4VFUhWqdRkMEIGCisGAQQBgjcCAQwx
// SIG // NDAyoBSAEgBNAGkAYwByAG8AcwBvAGYAdKEagBhodHRw
// SIG // Oi8vd3d3Lm1pY3Jvc29mdC5jb20wDQYJKoZIhvcNAQEB
// SIG // BQAEggEAU4gDjfWtb13ZWzhztpMGlmpesAryDin7N6zG
// SIG // YBMxLgEwDBZBrAwiJY5cTX0ZQUqyyYPozQyVBhf4Tmse
// SIG // BN4WWj4UMMkuxyFfl8xYDw+2IMnjXb1D+nOirn3vT2cM
// SIG // oTT/ztGYncVUZhE8nTu+m7DwPvTrtyI2gMBSUI5jTDsz
// SIG // SpfbTqZNEu2O5PESLkdZnJcafr9xXEw4O82fzsMfUKAp
// SIG // Mq8wtfp7QnEcRkMfq6V+ROazhVxgSnqKHx4rY0V30L5X
// SIG // pjVV1QLw/WYaX9fi03N5YO2sCfb5R083F13tdj3qQUuF
// SIG // 1gO4DT4LTcB+J+19AB9v8DNRB4RGM/ldG+9ovJg7iaGC
// SIG // FwswghcHBgorBgEEAYI3AwMBMYIW9zCCFvMGCSqGSIb3
// SIG // DQEHAqCCFuQwghbgAgEDMQ8wDQYJYIZIAWUDBAIBBQAw
// SIG // ggFUBgsqhkiG9w0BCRABBKCCAUMEggE/MIIBOwIBAQYK
// SIG // KwYBBAGEWQoDATAxMA0GCWCGSAFlAwQCAQUABCA01KN+
// SIG // 5HOzT21Yhm1EfNyU0k2+0BYHQ2O1jixr0M/aAQIGYmtK
// SIG // RgcQGBIyMDIyMDUwMzE5MDEwOC4xMVowBIACAfSggdSk
// SIG // gdEwgc4xCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNo
// SIG // aW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4wHAYDVQQK
// SIG // ExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xKTAnBgNVBAsT
// SIG // IE1pY3Jvc29mdCBPcGVyYXRpb25zIFB1ZXJ0byBSaWNv
// SIG // MSYwJAYDVQQLEx1UaGFsZXMgVFNTIEVTTjo2MEJDLUUz
// SIG // ODMtMjYzNTElMCMGA1UEAxMcTWljcm9zb2Z0IFRpbWUt
// SIG // U3RhbXAgU2VydmljZaCCEV8wggcQMIIE+KADAgECAhMz
// SIG // AAABpllFgzlNnutLAAEAAAGmMA0GCSqGSIb3DQEBCwUA
// SIG // MHwxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNoaW5n
// SIG // dG9uMRAwDgYDVQQHEwdSZWRtb25kMR4wHAYDVQQKExVN
// SIG // aWNyb3NvZnQgQ29ycG9yYXRpb24xJjAkBgNVBAMTHU1p
// SIG // Y3Jvc29mdCBUaW1lLVN0YW1wIFBDQSAyMDEwMB4XDTIy
// SIG // MDMwMjE4NTEyMVoXDTIzMDUxMTE4NTEyMVowgc4xCzAJ
// SIG // BgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAw
// SIG // DgYDVQQHEwdSZWRtb25kMR4wHAYDVQQKExVNaWNyb3Nv
// SIG // ZnQgQ29ycG9yYXRpb24xKTAnBgNVBAsTIE1pY3Jvc29m
// SIG // dCBPcGVyYXRpb25zIFB1ZXJ0byBSaWNvMSYwJAYDVQQL
// SIG // Ex1UaGFsZXMgVFNTIEVTTjo2MEJDLUUzODMtMjYzNTEl
// SIG // MCMGA1UEAxMcTWljcm9zb2Z0IFRpbWUtU3RhbXAgU2Vy
// SIG // dmljZTCCAiIwDQYJKoZIhvcNAQEBBQADggIPADCCAgoC
// SIG // ggIBANmYv3tSI+fJ/NQJnjz7JvCnc+Xm0rKoe9YKD4Mv
// SIG // MYCul7egdrT/zv5vFbQgjNQ74672fNweaztkR65V8y29
// SIG // u5PL2sf01p+uche0Zu4tSig+GsQ6ZQl9tjPRAY/3ITBH
// SIG // DeIYyvq8Wne9+7NoPLhxDSO6dtX7YCuQ4zcTP3SE6MvB
// SIG // 4b5NighdtvoZVaYk1lXpjUTfdmKoX1ABq1sJbULSnSi0
// SIG // Qd4vvl3mZ9jxwv9dR/nlZP62lrZYZq7LPtHD6BlmclB5
// SIG // PT89DnSm1sjaZnFHrKzOsmq5GlmL5SFugCCZOoKz133F
// SIG // JeQaFMcXBZSCQjNABWBbHIRCE1ysHHG83DdonRmnC8EO
// SIG // lYeRwTWz/QCz6q0riOIbYyC/A2BgUEpu9/9EymrTsyMr
// SIG // 2/zS8GdEybQ5W7f0WrcrmKB/Y62+g6TmfOS8NtU+L1jG
// SIG // oKNG6Q5RlfJwZu8J/Q9dl4OxyHKuy78+wm6HsF7uAizp
// SIG // sWh63UUaoK/OGQiBG3NJ+kef5eWpnva4ZJfhAnqYTAZD
// SIG // 1uHgf8VfQjnl0BB2YXzK9WaTqde8d+8qCxVKr5hJYvbO
// SIG // +X3+2k5PCirUK/SboreX+xUhVaQEhVDYqlatyPttI7Z2
// SIG // IrkhMzwFvc+p0QeyMiNmo2cBZejx8icDOcUidwymDUYq
// SIG // GPE7MA8vtKW3feeSSYJsCEkuUO/vAgMBAAGjggE2MIIB
// SIG // MjAdBgNVHQ4EFgQUOlQhO/zGlqK99UkNL/Gu/AryN9gw
// SIG // HwYDVR0jBBgwFoAUn6cVXQBeYl2D9OXSZacbUzUZ6XIw
// SIG // XwYDVR0fBFgwVjBUoFKgUIZOaHR0cDovL3d3dy5taWNy
// SIG // b3NvZnQuY29tL3BraW9wcy9jcmwvTWljcm9zb2Z0JTIw
// SIG // VGltZS1TdGFtcCUyMFBDQSUyMDIwMTAoMSkuY3JsMGwG
// SIG // CCsGAQUFBwEBBGAwXjBcBggrBgEFBQcwAoZQaHR0cDov
// SIG // L3d3dy5taWNyb3NvZnQuY29tL3BraW9wcy9jZXJ0cy9N
// SIG // aWNyb3NvZnQlMjBUaW1lLVN0YW1wJTIwUENBJTIwMjAx
// SIG // MCgxKS5jcnQwDAYDVR0TAQH/BAIwADATBgNVHSUEDDAK
// SIG // BggrBgEFBQcDCDANBgkqhkiG9w0BAQsFAAOCAgEAgMDx
// SIG // WDTpGqLnFoPhm/iDfwHGF8xr2NbrJl8egEg2ThTJsTf0
// SIG // wBE+ZQsnYfrRmXBbe6sCXLVN70qPuI+OEbN5MOai7Bue
// SIG // 1/4j5VTkWquH5GZeVat2N+dD7lSUWp0dU8j+uBhBL5GF
// SIG // SmoDVVm+zW2GR2juPI1v254AJTb2l458anlkJjGvmYn2
// SIG // BtRS13h/wDR7hrQaI7BgdyHWAV5+HEj5UhrIrrvtwJii
// SIG // vSaUEA3qK6ZK/rZIQv/uORDkONw+2pHHIE1SXm/WIlhr
// SIG // VS2HIogfr3JjqvZion6LJSD741j8xVDLiClwAbspHoVF
// SIG // jxtxBcMjqPx6aWCJS8vjSoTnhkV4PO55mqsM7Q8XQRGQ
// SIG // hA7w4zNQOJu9kD4xFdYpPUmLN/daIcEElofBjGz+sEd1
// SIG // B4yqqIk3u2G4VygTXFmthL8chSo7r+GIvTqWKhSA/san
// SIG // S4N3jCgCCe3FTSJsp4g5nwavLvWAtzcOIvSRorGmAeN0
// SIG // m2wgzBK95T/qgrGGDXSos1JNDWRVBnP0qsw1Qoq5G0D8
// SIG // hxvQPs3X43KBv1GJl0wo5rcC+9OMWxJlB63gtToQsA1C
// SIG // ErYoYLMZtUzJL74jwZk/grpHEQhIhB3sneC8wzGKJuft
// SIG // 7YO/HWCpuwdChIjynTnBh+yFGMdg3wRrIbOcw/iKmXZo
// SIG // pMTQMOcmIeIwJAezA7AwggdxMIIFWaADAgECAhMzAAAA
// SIG // FcXna54Cm0mZAAAAAAAVMA0GCSqGSIb3DQEBCwUAMIGI
// SIG // MQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3Rv
// SIG // bjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMVTWlj
// SIG // cm9zb2Z0IENvcnBvcmF0aW9uMTIwMAYDVQQDEylNaWNy
// SIG // b3NvZnQgUm9vdCBDZXJ0aWZpY2F0ZSBBdXRob3JpdHkg
// SIG // MjAxMDAeFw0yMTA5MzAxODIyMjVaFw0zMDA5MzAxODMy
// SIG // MjVaMHwxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNo
// SIG // aW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4wHAYDVQQK
// SIG // ExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xJjAkBgNVBAMT
// SIG // HU1pY3Jvc29mdCBUaW1lLVN0YW1wIFBDQSAyMDEwMIIC
// SIG // IjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEA5OGm
// SIG // TOe0ciELeaLL1yR5vQ7VgtP97pwHB9KpbE51yMo1V/YB
// SIG // f2xK4OK9uT4XYDP/XE/HZveVU3Fa4n5KWv64NmeFRiMM
// SIG // tY0Tz3cywBAY6GB9alKDRLemjkZrBxTzxXb1hlDcwUTI
// SIG // cVxRMTegCjhuje3XD9gmU3w5YQJ6xKr9cmmvHaus9ja+
// SIG // NSZk2pg7uhp7M62AW36MEBydUv626GIl3GoPz130/o5T
// SIG // z9bshVZN7928jaTjkY+yOSxRnOlwaQ3KNi1wjjHINSi9
// SIG // 47SHJMPgyY9+tVSP3PoFVZhtaDuaRr3tpK56KTesy+uD
// SIG // RedGbsoy1cCGMFxPLOJiss254o2I5JasAUq7vnGpF1tn
// SIG // YN74kpEeHT39IM9zfUGaRnXNxF803RKJ1v2lIH1+/Nme
// SIG // Rd+2ci/bfV+AutuqfjbsNkz2K26oElHovwUDo9Fzpk03
// SIG // dJQcNIIP8BDyt0cY7afomXw/TNuvXsLz1dhzPUNOwTM5
// SIG // TI4CvEJoLhDqhFFG4tG9ahhaYQFzymeiXtcodgLiMxhy
// SIG // 16cg8ML6EgrXY28MyTZki1ugpoMhXV8wdJGUlNi5UPkL
// SIG // iWHzNgY1GIRH29wb0f2y1BzFa/ZcUlFdEtsluq9QBXps
// SIG // xREdcu+N+VLEhReTwDwV2xo3xwgVGD94q0W29R6HXtqP
// SIG // nhZyacaue7e3PmriLq0CAwEAAaOCAd0wggHZMBIGCSsG
// SIG // AQQBgjcVAQQFAgMBAAEwIwYJKwYBBAGCNxUCBBYEFCqn
// SIG // Uv5kxJq+gpE8RjUpzxD/LwTuMB0GA1UdDgQWBBSfpxVd
// SIG // AF5iXYP05dJlpxtTNRnpcjBcBgNVHSAEVTBTMFEGDCsG
// SIG // AQQBgjdMg30BATBBMD8GCCsGAQUFBwIBFjNodHRwOi8v
// SIG // d3d3Lm1pY3Jvc29mdC5jb20vcGtpb3BzL0RvY3MvUmVw
// SIG // b3NpdG9yeS5odG0wEwYDVR0lBAwwCgYIKwYBBQUHAwgw
// SIG // GQYJKwYBBAGCNxQCBAweCgBTAHUAYgBDAEEwCwYDVR0P
// SIG // BAQDAgGGMA8GA1UdEwEB/wQFMAMBAf8wHwYDVR0jBBgw
// SIG // FoAU1fZWy4/oolxiaNE9lJBb186aGMQwVgYDVR0fBE8w
// SIG // TTBLoEmgR4ZFaHR0cDovL2NybC5taWNyb3NvZnQuY29t
// SIG // L3BraS9jcmwvcHJvZHVjdHMvTWljUm9vQ2VyQXV0XzIw
// SIG // MTAtMDYtMjMuY3JsMFoGCCsGAQUFBwEBBE4wTDBKBggr
// SIG // BgEFBQcwAoY+aHR0cDovL3d3dy5taWNyb3NvZnQuY29t
// SIG // L3BraS9jZXJ0cy9NaWNSb29DZXJBdXRfMjAxMC0wNi0y
// SIG // My5jcnQwDQYJKoZIhvcNAQELBQADggIBAJ1VffwqreEs
// SIG // H2cBMSRb4Z5yS/ypb+pcFLY+TkdkeLEGk5c9MTO1OdfC
// SIG // cTY/2mRsfNB1OW27DzHkwo/7bNGhlBgi7ulmZzpTTd2Y
// SIG // urYeeNg2LpypglYAA7AFvonoaeC6Ce5732pvvinLbtg/
// SIG // SHUB2RjebYIM9W0jVOR4U3UkV7ndn/OOPcbzaN9l9qRW
// SIG // qveVtihVJ9AkvUCgvxm2EhIRXT0n4ECWOKz3+SmJw7wX
// SIG // sFSFQrP8DJ6LGYnn8AtqgcKBGUIZUnWKNsIdw2FzLixr
// SIG // e24/LAl4FOmRsqlb30mjdAy87JGA0j3mSj5mO0+7hvoy
// SIG // GtmW9I/2kQH2zsZ0/fZMcm8Qq3UwxTSwethQ/gpY3UA8
// SIG // x1RtnWN0SCyxTkctwRQEcb9k+SS+c23Kjgm9swFXSVRk
// SIG // 2XPXfx5bRAGOWhmRaw2fpCjcZxkoJLo4S5pu+yFUa2pF
// SIG // EUep8beuyOiJXk+d0tBMdrVXVAmxaQFEfnyhYWxz/gq7
// SIG // 7EFmPWn9y8FBSX5+k77L+DvktxW/tM4+pTFRhLy/AsGC
// SIG // onsXHRWJjXD+57XQKBqJC4822rpM+Zv/Cuk0+CQ1Zyvg
// SIG // DbjmjJnW4SLq8CdCPSWU5nR0W2rRnj7tfqAxM328y+l7
// SIG // vzhwRNGQ8cirOoo6CGJ/2XBjU02N7oJtpQUQwXEGahC0
// SIG // HVUzWLOhcGbyoYIC0jCCAjsCAQEwgfyhgdSkgdEwgc4x
// SIG // CzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9u
// SIG // MRAwDgYDVQQHEwdSZWRtb25kMR4wHAYDVQQKExVNaWNy
// SIG // b3NvZnQgQ29ycG9yYXRpb24xKTAnBgNVBAsTIE1pY3Jv
// SIG // c29mdCBPcGVyYXRpb25zIFB1ZXJ0byBSaWNvMSYwJAYD
// SIG // VQQLEx1UaGFsZXMgVFNTIEVTTjo2MEJDLUUzODMtMjYz
// SIG // NTElMCMGA1UEAxMcTWljcm9zb2Z0IFRpbWUtU3RhbXAg
// SIG // U2VydmljZaIjCgEBMAcGBSsOAwIaAxUAanQzrZW9TB93
// SIG // Ve7Pa4UPao2ffK2ggYMwgYCkfjB8MQswCQYDVQQGEwJV
// SIG // UzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMH
// SIG // UmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBv
// SIG // cmF0aW9uMSYwJAYDVQQDEx1NaWNyb3NvZnQgVGltZS1T
// SIG // dGFtcCBQQ0EgMjAxMDANBgkqhkiG9w0BAQUFAAIFAOYb
// SIG // tz4wIhgPMjAyMjA1MDMxODE0MjJaGA8yMDIyMDUwNDE4
// SIG // MTQyMlowdzA9BgorBgEEAYRZCgQBMS8wLTAKAgUA5hu3
// SIG // PgIBADAKAgEAAgIjIQIB/zAHAgEAAgIR4DAKAgUA5h0I
// SIG // vgIBADA2BgorBgEEAYRZCgQCMSgwJjAMBgorBgEEAYRZ
// SIG // CgMCoAowCAIBAAIDB6EgoQowCAIBAAIDAYagMA0GCSqG
// SIG // SIb3DQEBBQUAA4GBAF08lyob0bCQbxCo161AJS+ztimS
// SIG // qe68NylB3gDkQQ5cPx2JrBGsMNZqLhblpFDrysIak19b
// SIG // 5DPCgmtF4IDpVtPGJ3Ih9X9I51MP/B5TP3J7uz1X3Pcp
// SIG // Q3aVRhPsBEz5ausiDIeOOlQaUQU9kExPxaABDz1DGTlU
// SIG // tsV2zGvTPAl2MYIEDTCCBAkCAQEwgZMwfDELMAkGA1UE
// SIG // BhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNV
// SIG // BAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBD
// SIG // b3Jwb3JhdGlvbjEmMCQGA1UEAxMdTWljcm9zb2Z0IFRp
// SIG // bWUtU3RhbXAgUENBIDIwMTACEzMAAAGmWUWDOU2e60sA
// SIG // AQAAAaYwDQYJYIZIAWUDBAIBBQCgggFKMBoGCSqGSIb3
// SIG // DQEJAzENBgsqhkiG9w0BCRABBDAvBgkqhkiG9w0BCQQx
// SIG // IgQgd3Wd91o1FuvmuqE/Ptbe2mYWijlr1cmRIB7MDwFs
// SIG // h+0wgfoGCyqGSIb3DQEJEAIvMYHqMIHnMIHkMIG9BCCD
// SIG // CxmLwz90fWvhMKbJTAQaKt3DoXeiAhfp8TD9tgSrDTCB
// SIG // mDCBgKR+MHwxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpX
// SIG // YXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4wHAYD
// SIG // VQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xJjAkBgNV
// SIG // BAMTHU1pY3Jvc29mdCBUaW1lLVN0YW1wIFBDQSAyMDEw
// SIG // AhMzAAABpllFgzlNnutLAAEAAAGmMCIEIFZw6kg1QMIZ
// SIG // KR0UpYNDan9Zuz2RfT/c7hJTW9ui0DO6MA0GCSqGSIb3
// SIG // DQEBCwUABIICAJ64pika+Uob0xOO2j5jHATpZ8zLtKvD
// SIG // FWv1jfWOwvdF6q0d8fq70yOSwjwxTyci4vp7Nm5i4jjj
// SIG // 7ZHSaC+si0MQRNGgWGzwpblZhd5AIfGxSBU/DqZLjDlB
// SIG // w0uIohwBj9dgWo99x0D946liXjVeJuwuU9PJZPmUnT4f
// SIG // usNzLvP9oqLUjCYmrYCKjlV89+LM9X88IVUmBuQxdWto
// SIG // b5eMAtbMhlANZ4MACISWaJV5EkZ4dgEFxcc9wo/pZdVx
// SIG // a+u/xyZpf4ExJBV1DtlwtDdhidOTlmWAycff99i4293s
// SIG // RA9jxo2tLO+qVPVIVAEEo3gYWGPlDB6f4/gOO68cooGC
// SIG // DyW6NpofOrTUrcpB38G01rgn/OwOG+RcwtJRMhJd1+in
// SIG // d4ezM0qRA7XZYeMPY9k3IMnSAaVXbe/iBOkeERrj8Vr6
// SIG // dbtukA5JpcGsxxcnk2llwIllJhA/qLKySjIAdSFEncsB
// SIG // Po5M9hj4B1lCyiSRDLelPNFEicG+4MtiGxmYbFcM8HiX
// SIG // hR/ChrcTa+ztSogJPlQRbII2LnfnO3lb+1dukUbPba0T
// SIG // zTwFuFa929SvZYGTA+Aun8EsxvMSys7RoIQcvM4Xgl+k
// SIG // Pwrv6s8mfTXR159Yn8gIo/KWMMg3JfZdaV0U6tr9P2Qx
// SIG // aIEDoJAKfJ//DJ3Q9pbR3tJHbyYFfH4wHUks
// SIG // End signature block
