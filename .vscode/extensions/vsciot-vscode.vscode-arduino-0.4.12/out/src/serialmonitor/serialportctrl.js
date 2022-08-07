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
exports.SerialPortCtrl = void 0;
const os = require("os");
const serialport_1 = require("serialport");
const strftime = require("strftime");
class SerialPortCtrl {
    constructor(port, baudRate, timestampFormat, _bufferedOutputChannel, showOutputChannel) {
        this._bufferedOutputChannel = _bufferedOutputChannel;
        this.showOutputChannel = showOutputChannel;
        this._currentBaudRate = baudRate;
        this._currentPort = port;
        this._currentTimestampFormat = timestampFormat;
    }
    /**
     * Check which external serial devices are connected.
     *
     * @returns An array of ISerialPortDetail from external serial devices.
     *
     */
    static list() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield serialport_1.SerialPort.list()).map((port) => {
                var _a;
                return {
                    port: port.path,
                    desc: (_a = port.friendlyName) !== null && _a !== void 0 ? _a : port.manufacturer,
                    vendorId: port.vendorId,
                    productId: port.productId,
                };
            });
        });
    }
    get isActive() {
        var _a, _b;
        return (_b = (_a = this._port) === null || _a === void 0 ? void 0 : _a.isOpen) !== null && _b !== void 0 ? _b : false;
    }
    get currentPort() {
        return this._currentPort;
    }
    open() {
        return __awaiter(this, void 0, void 0, function* () {
            this._bufferedOutputChannel.appendLine(`[Starting] Opening the serial port - ${this._currentPort}`);
            this.showOutputChannel();
            if (this.isActive) {
                yield this.close();
            }
            yield new Promise((resolve, reject) => {
                this._port = new serialport_1.SerialPort({ autoOpen: false, path: this._currentPort, baudRate: this._currentBaudRate }, (err) => {
                    if (err) {
                        reject(err);
                    }
                });
                this._port.open((err) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        // These pins are tied to boot and reset on some devices like the
                        // ESP32. We need to pull them high to avoid unexpected behavior when
                        // opening the serial monitor.
                        this._port.set({ dtr: true, cts: true, rts: true }, (err2) => {
                            if (err2) {
                                reject(err2);
                            }
                            else {
                                resolve();
                            }
                        });
                    }
                });
            });
            let lastDataEndedWithNewline = true;
            this._port.on("data", (data) => {
                const text = data.toString("utf8");
                if (this._currentTimestampFormat) {
                    const timestamp = strftime(this._currentTimestampFormat);
                    this._bufferedOutputChannel.append(
                    // Timestamps should only be added at the beginning of a line.
                    // Look for newlines except at the very end of the string.
                    (lastDataEndedWithNewline ? timestamp : "") +
                        text.replace(/\n(?!$)/g, "\n" + timestamp));
                    lastDataEndedWithNewline = text.endsWith("\n");
                }
                else {
                    this._bufferedOutputChannel.append(text);
                }
            });
        });
    }
    sendMessage(text) {
        return new Promise((resolve, reject) => {
            if (!text || !this.isActive) {
                resolve();
                return;
            }
            this._port.write(text + "\n", (error) => {
                if (!error) {
                    resolve();
                }
                else {
                    return reject(error);
                }
            });
        });
    }
    changePort(newPort) {
        return __awaiter(this, void 0, void 0, function* () {
            if (newPort === this._currentPort) {
                return;
            }
            this._currentPort = newPort;
            if (!this.isActive) {
                return;
            }
            yield this.close();
        });
    }
    stop() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isActive) {
                return false;
            }
            yield this.close();
            if (this._bufferedOutputChannel) {
                this._bufferedOutputChannel.appendLine(`[Done] Closed the serial port ${os.EOL}`);
            }
            return true;
        });
    }
    changeBaudRate(newRate) {
        return __awaiter(this, void 0, void 0, function* () {
            this._currentBaudRate = newRate;
            if (!this.isActive) {
                return;
            }
            yield this.stop();
            yield this.open();
        });
    }
    changeTimestampFormat(newTimestampFormat) {
        return __awaiter(this, void 0, void 0, function* () {
            this._currentTimestampFormat = newTimestampFormat;
        });
    }
    close() {
        return new Promise((resolve, reject) => {
            this._port.close((err) => {
                if (err) {
                    reject(err);
                }
                else {
                    this._port = undefined;
                    resolve();
                }
            });
        });
    }
}
exports.SerialPortCtrl = SerialPortCtrl;

//# sourceMappingURL=serialportctrl.js.map

// SIG // Begin signature block
// SIG // MIInqwYJKoZIhvcNAQcCoIInnDCCJ5gCAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // Zy2KrX4vohzBJZa3Z/kKcfAxIo4vLHBhSQx0In67jl2g
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
// SIG // SEXAQsmbdlsKgEhr/Xmfwb1tbWrJUnMTDXpQzTGCGYIw
// SIG // ghl+AgEBMIGVMH4xCzAJBgNVBAYTAlVTMRMwEQYDVQQI
// SIG // EwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4w
// SIG // HAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xKDAm
// SIG // BgNVBAMTH01pY3Jvc29mdCBDb2RlIFNpZ25pbmcgUENB
// SIG // IDIwMTECEzMAAAJSizOq+JXzOdsAAAAAAlIwDQYJYIZI
// SIG // AWUDBAIBBQCgga4wGQYJKoZIhvcNAQkDMQwGCisGAQQB
// SIG // gjcCAQQwHAYKKwYBBAGCNwIBCzEOMAwGCisGAQQBgjcC
// SIG // ARUwLwYJKoZIhvcNAQkEMSIEID0F+OxI9NX+N0indmzZ
// SIG // xQgd178vZTBAc3u4D6ZDfI1KMEIGCisGAQQBgjcCAQwx
// SIG // NDAyoBSAEgBNAGkAYwByAG8AcwBvAGYAdKEagBhodHRw
// SIG // Oi8vd3d3Lm1pY3Jvc29mdC5jb20wDQYJKoZIhvcNAQEB
// SIG // BQAEggEAnS+rsAfqX2fFlRPwEcU8VdCyDw3WA39cCc7R
// SIG // DMmNP3YJ9jhXeyvNIbofwoa1mpWIlxBEP7r10RFr3+BJ
// SIG // HiPUasDbOh/iJIZpwEK1WjKqKI+tJEnqCfZw3uskqQ+Y
// SIG // OQA+JQodQ1CUkBpe+F0/7x68Mt+Ywd343MIP11K/l2VD
// SIG // k7pZ5FkJyWCOg2TC5vHQPkMdh3cMTq8jypRNg55rwQZz
// SIG // 03h5FVKL+ijgA6aEi4XzjrjnO/byBnYONLrJ0k2fygxi
// SIG // ImeYvtJ0T2ilzB+WJHhuxE7oGmLWlBYpQcaTNGlgnVzd
// SIG // ic0SnvMdo4DsbPMIFEYHSrVBQTGPGv61nCxGGw41sqGC
// SIG // FwwwghcIBgorBgEEAYI3AwMBMYIW+DCCFvQGCSqGSIb3
// SIG // DQEHAqCCFuUwghbhAgEDMQ8wDQYJYIZIAWUDBAIBBQAw
// SIG // ggFVBgsqhkiG9w0BCRABBKCCAUQEggFAMIIBPAIBAQYK
// SIG // KwYBBAGEWQoDATAxMA0GCWCGSAFlAwQCAQUABCDrcZPj
// SIG // clC7a7ErNCcLk5LfkEctTVcXTT0kZxo75z7/JAIGYmtC
// SIG // c+BgGBMyMDIyMDUwMzE5MDEwNy42ODlaMASAAgH0oIHU
// SIG // pIHRMIHOMQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2Fz
// SIG // aGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UE
// SIG // ChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMSkwJwYDVQQL
// SIG // EyBNaWNyb3NvZnQgT3BlcmF0aW9ucyBQdWVydG8gUmlj
// SIG // bzEmMCQGA1UECxMdVGhhbGVzIFRTUyBFU046QzRCRC1F
// SIG // MzdGLTVGRkMxJTAjBgNVBAMTHE1pY3Jvc29mdCBUaW1l
// SIG // LVN0YW1wIFNlcnZpY2WgghFfMIIHEDCCBPigAwIBAgIT
// SIG // MwAAAaP7mrOOe4ZDTwABAAABozANBgkqhkiG9w0BAQsF
// SIG // ADB8MQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGlu
// SIG // Z3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMV
// SIG // TWljcm9zb2Z0IENvcnBvcmF0aW9uMSYwJAYDVQQDEx1N
// SIG // aWNyb3NvZnQgVGltZS1TdGFtcCBQQ0EgMjAxMDAeFw0y
// SIG // MjAzMDIxODUxMTZaFw0yMzA1MTExODUxMTZaMIHOMQsw
// SIG // CQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQ
// SIG // MA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9z
// SIG // b2Z0IENvcnBvcmF0aW9uMSkwJwYDVQQLEyBNaWNyb3Nv
// SIG // ZnQgT3BlcmF0aW9ucyBQdWVydG8gUmljbzEmMCQGA1UE
// SIG // CxMdVGhhbGVzIFRTUyBFU046QzRCRC1FMzdGLTVGRkMx
// SIG // JTAjBgNVBAMTHE1pY3Jvc29mdCBUaW1lLVN0YW1wIFNl
// SIG // cnZpY2UwggIiMA0GCSqGSIb3DQEBAQUAA4ICDwAwggIK
// SIG // AoICAQDvvU3Ky3sqCnAqi2zbc+zbdiWz9UxM8zIYvOIE
// SIG // umCyOwhenVUgOSNWxQh3MOmRdnhfEImn9KNl0l3/46eb
// SIG // IJlGLTGxouJ3gLVkjSucobeIskIQcZ9EyEKhfjYrIgcV
// SIG // vnoTGFhGxSPu3EnV/3VsPv2PPzLvbqt1wiuT9hvmYm1c
// SIG // DlR/efiIkxp5qHMVoHbNKpQaWta2IN25fF1XuS9qk1Ji
// SIG // Qb50Kcdm1K7u9Jbdvx6FOWwWyygIQj6ccuJ5rK3Tkdxr
// SIG // +FG3wJraUJ7T++fDUT4YNWwAh9OhZb2yMj/P7kbN8dt9
// SIG // t3WmhqSUGEKGaQAYOtqxQ0yePntOrbfsW376fDPZaPGt
// SIG // WoH8WUNaSE9VZyXWjvfIFjIjFuuXXhVIlEflp4EFX79o
// SIG // C7L+qO/jnKc8ukR2SJulhBmfSwbee9TXwrMec9CJb6+k
// SIG // szdEG2liUyyFm18G1FSmHm61xFRTMoblRkB3rGQflcFd
// SIG // /OoWKJzMbNI7zPBqTnMdMS8spuNlwPfVUqbLor0yYOKP
// SIG // GtQAiW0wVRaBAN1axUmMznUOr818a8cOov09d/Jvlxfs
// SIG // irQBJ4aflHgDIZcO4z/fRAJYBlJdCpHAY02E8/oxMj4C
// SIG // mna1NaH+aBYv6vWA5a1b/R+CbFXvBhzDpD0zaAeNNvI/
// SIG // PDhHuNugbH3Fy5ItKYT6e4q1tAG0XQIDAQABo4IBNjCC
// SIG // ATIwHQYDVR0OBBYEFFBR+7M8Jgixz00vQaNoqy5yY4uq
// SIG // MB8GA1UdIwQYMBaAFJ+nFV0AXmJdg/Tl0mWnG1M1Gely
// SIG // MF8GA1UdHwRYMFYwVKBSoFCGTmh0dHA6Ly93d3cubWlj
// SIG // cm9zb2Z0LmNvbS9wa2lvcHMvY3JsL01pY3Jvc29mdCUy
// SIG // MFRpbWUtU3RhbXAlMjBQQ0ElMjAyMDEwKDEpLmNybDBs
// SIG // BggrBgEFBQcBAQRgMF4wXAYIKwYBBQUHMAKGUGh0dHA6
// SIG // Ly93d3cubWljcm9zb2Z0LmNvbS9wa2lvcHMvY2VydHMv
// SIG // TWljcm9zb2Z0JTIwVGltZS1TdGFtcCUyMFBDQSUyMDIw
// SIG // MTAoMSkuY3J0MAwGA1UdEwEB/wQCMAAwEwYDVR0lBAww
// SIG // CgYIKwYBBQUHAwgwDQYJKoZIhvcNAQELBQADggIBAFry
// SIG // 3qdpl8OorgcRrtD7LLZlyOYC5oD5EykJ44GZbKHoqbLW
// SIG // vaJLtDE1cZR1XXHQWxXFRzC0UZFBSJHyp2nJcpeXso9N
// SIG // 8Hg+m/6VHxcg2QfAGaRlF4U2CzUfD3qTOsg+oPtBNZx9
// SIG // DIThqBOlxbn5G5+niHTUxrlsAXhK9gzYhoQxpcGlB+RC
// SIG // 894bbsjMligIGBdvAuIssoWHb5RvVTeiZwuJnPxCLedA
// SIG // Qh6fGUAJOxwt0TpbYNYLuTYxmklXYrGouTiVn+nubGEH
// SIG // QwTWClyXYh3otTeyvi+bNb1fgund07BffgDaYqAQwDhp
// SIG // xUmLeD/rrVtdYt+4iyy2/duqQi+C8vvhlNMJc2H5+59t
// SIG // kckJrw9daMomR4ZkbLAwarAPp7wlbX5x9fNw3+aAQVbJ
// SIG // M2XCU1IwsWmoAyuwKgekANx+5f9khXnqn1/w7XZXuAfr
// SIG // z1eJatQgrNANSwfZZs0tL8aEQ7rGPNA0ItdCt0n2StYc
// SIG // smo/WvKW2RtAbAadjcHOMbTgxHgU1qAMxfZKOFendPbh
// SIG // RaSay6FfnvHCVP4U9/kpVu3Z6+XbWL84h06Wbrkb+ClO
// SIG // hdzkMzaR3+3AS6VikV0YxmHVZwBm/Dc1usFk42YzAjXQ
// SIG // hRu6ZCizDhnajwxXX5PhGBOUUhvcsUu+nD316kSlbSWU
// SIG // nCBeuHo512xSLOW4fCsBMIIHcTCCBVmgAwIBAgITMwAA
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
// SIG // tB1VM1izoXBm8qGCAtIwggI7AgEBMIH8oYHUpIHRMIHO
// SIG // MQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3Rv
// SIG // bjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMVTWlj
// SIG // cm9zb2Z0IENvcnBvcmF0aW9uMSkwJwYDVQQLEyBNaWNy
// SIG // b3NvZnQgT3BlcmF0aW9ucyBQdWVydG8gUmljbzEmMCQG
// SIG // A1UECxMdVGhhbGVzIFRTUyBFU046QzRCRC1FMzdGLTVG
// SIG // RkMxJTAjBgNVBAMTHE1pY3Jvc29mdCBUaW1lLVN0YW1w
// SIG // IFNlcnZpY2WiIwoBATAHBgUrDgMCGgMVAB5f6V5CzAGz
// SIG // 2qQsGvhl3N0pQw0ToIGDMIGApH4wfDELMAkGA1UEBhMC
// SIG // VVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcT
// SIG // B1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jw
// SIG // b3JhdGlvbjEmMCQGA1UEAxMdTWljcm9zb2Z0IFRpbWUt
// SIG // U3RhbXAgUENBIDIwMTAwDQYJKoZIhvcNAQEFBQACBQDm
// SIG // G69vMCIYDzIwMjIwNTAzMTc0MTAzWhgPMjAyMjA1MDQx
// SIG // NzQxMDNaMHcwPQYKKwYBBAGEWQoEATEvMC0wCgIFAOYb
// SIG // r28CAQAwCgIBAAICC/wCAf8wBwIBAAICEWowCgIFAOYd
// SIG // AO8CAQAwNgYKKwYBBAGEWQoEAjEoMCYwDAYKKwYBBAGE
// SIG // WQoDAqAKMAgCAQACAwehIKEKMAgCAQACAwGGoDANBgkq
// SIG // hkiG9w0BAQUFAAOBgQAW/FtWHYf6wZUj6aXn5W1GDDza
// SIG // elQo93ig+sx+AzRvXPpoYGWUJdjkn7Qj6Y+pvdrlzMID
// SIG // a81EbYcyRkE8oeU8OHXT7c/UTPZkqtwNp5qvPi0Kjw8d
// SIG // ix1R7zsdZgI2Mgp3eH3Lpewwy16E2jmTnwiDwn9pJCKm
// SIG // /C1MKg2vRzrsCDGCBA0wggQJAgEBMIGTMHwxCzAJBgNV
// SIG // BAYTAlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYD
// SIG // VQQHEwdSZWRtb25kMR4wHAYDVQQKExVNaWNyb3NvZnQg
// SIG // Q29ycG9yYXRpb24xJjAkBgNVBAMTHU1pY3Jvc29mdCBU
// SIG // aW1lLVN0YW1wIFBDQSAyMDEwAhMzAAABo/uas457hkNP
// SIG // AAEAAAGjMA0GCWCGSAFlAwQCAQUAoIIBSjAaBgkqhkiG
// SIG // 9w0BCQMxDQYLKoZIhvcNAQkQAQQwLwYJKoZIhvcNAQkE
// SIG // MSIEIMvMrrIVQH777Znylq4p0pCwlqZyV8X0W/YiBsg6
// SIG // AfXhMIH6BgsqhkiG9w0BCRACLzGB6jCB5zCB5DCBvQQg
// SIG // jPi4sAZxzDKDnf7IG2mMacLxCZURGZf6Uz5Jc+nrjf4w
// SIG // gZgwgYCkfjB8MQswCQYDVQQGEwJVUzETMBEGA1UECBMK
// SIG // V2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwG
// SIG // A1UEChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMSYwJAYD
// SIG // VQQDEx1NaWNyb3NvZnQgVGltZS1TdGFtcCBQQ0EgMjAx
// SIG // MAITMwAAAaP7mrOOe4ZDTwABAAABozAiBCBgbb6EEgh4
// SIG // KZG5niVP5PcQGsjkWnHVlRMyo+GIw7BfozANBgkqhkiG
// SIG // 9w0BAQsFAASCAgBTrdwXdkHebpytRC5uooPHdaxZ9v/I
// SIG // 7nZVNXQH2dj1tQSzeIeKYW9fCZa/HHEDBm6AlEpLFVsp
// SIG // OvxUsk1p19+GzoJ2x/WcuE2+KjcyegDqiy6yYu+KdNgs
// SIG // 0w6tHnvjqZsfB9WkVAYrbm3EOMKk/p4FMY3DfjPtDoCe
// SIG // EGAHPsO0oDKHZdnWR141aOeP95ySi4TF+WWGtxWSEo19
// SIG // Ovj86wcGTTaz40Dx3aTsI+ZVX7NqmSNY689xqAV/xhYx
// SIG // 5CYfgCoOjTaN5TY/qmbJKCWfJ9wlPxhAlfwbMgZf4uNa
// SIG // hKgRklj+TmY+tfU+JqiVcDPJP51A7BLIgLSjV7R4ZZCn
// SIG // Ujs/4mripwUndnQwxMkKTuIeiUdfGS4908hSV73ZK7I8
// SIG // jaZ3HF4jp4TLDpxpAeDcGXnFlEz8yOSNbDI8l7Iieh0Z
// SIG // uhWGgQ5jORcGkn/mmZHLpDzjEvpTOi3sJNlHIjU+HEP8
// SIG // n2cYCEZv5IDYBioY4vggSnogA13GN+slMj5Rh96nxrF3
// SIG // L/cO53hFC1Z/Kmwf0+K1uRj8eUm8sK7WM0V1TfBAbTVn
// SIG // HGEdEIoulszfv4zdSonus4FG53Hgw+nXHHsT5eoOzbbz
// SIG // FoguVnnMa+KaoWGMxkzL8NNwoQI7pLdlpHamh+/UXqWj
// SIG // joJtnY5rmK8du0KKi+GtRNBd8suxJHn2Ey3b1w==
// SIG // End signature block
