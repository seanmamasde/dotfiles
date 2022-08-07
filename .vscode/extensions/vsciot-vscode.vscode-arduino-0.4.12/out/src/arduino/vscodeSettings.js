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
exports.VscodeSettings = void 0;
const vscode = require("vscode");
const util_1 = require("../common/util");
const configKeys = {
    ARDUINO_PATH: "arduino.path",
    ARDUINO_COMMAND_PATH: "arduino.commandPath",
    ADDITIONAL_URLS: "arduino.additionalUrls",
    LOG_LEVEL: "arduino.logLevel",
    CLEAR_OUTPUT_ON_START: "arduino.clearOutputOnBuild",
    AUTO_UPDATE_INDEX_FILES: "arduino.autoUpdateIndexFiles",
    ALLOW_PDE_FILETYPE: "arduino.allowPDEFiletype",
    ENABLE_USB_DETECTION: "arduino.enableUSBDetection",
    DISABLE_TESTING_OPEN: "arduino.disableTestingOpen",
    IGNORE_BOARDS: "arduino.ignoreBoards",
    SKIP_HEADER_PROVIDER: "arduino.skipHeaderProvider",
    DEFAULT_BAUD_RATE: "arduino.defaultBaudRate",
    USE_ARDUINO_CLI: "arduino.useArduinoCli",
    DISABLE_INTELLISENSE_AUTO_GEN: "arduino.disableIntelliSenseAutoGen",
    DEFAULT_TIMESTAMP_FORMAT: "arduino.defaultTimestampFormat",
    ANALYZE_ON_OPEN: "arduino.analyzeOnOpen",
    ANALYZE_ON_SETTING_CHANGE: "arduino.analyzeOnSettingChange",
};
class VscodeSettings {
    constructor() {
    }
    static getInstance() {
        if (!VscodeSettings._instance) {
            VscodeSettings._instance = new VscodeSettings();
        }
        return VscodeSettings._instance;
    }
    get arduinoPath() {
        return this.getConfigValue(configKeys.ARDUINO_PATH);
    }
    get commandPath() {
        return this.getConfigValue(configKeys.ARDUINO_COMMAND_PATH);
    }
    get additionalUrls() {
        const value = this.getConfigValue(configKeys.ADDITIONAL_URLS);
        // Even though the schema says value must be a string array, version
        // 0.4.9 and earlier also allowed a single comma delimeted string. We
        // continue to unofficially support that format to avoid breaking
        // existing settings, but we immediately write back the correctly
        // formatted version.
        const split = util_1.toStringArray(value);
        if (typeof value === "string") {
            this.updateAdditionalUrls(split);
        }
        return split;
    }
    get logLevel() {
        return this.getConfigValue(configKeys.LOG_LEVEL) || "info";
    }
    get clearOutputOnBuild() {
        return this.getConfigValue(configKeys.CLEAR_OUTPUT_ON_START);
    }
    get allowPDEFiletype() {
        return this.getConfigValue(configKeys.ALLOW_PDE_FILETYPE);
    }
    get enableUSBDetection() {
        return this.getConfigValue(configKeys.ENABLE_USB_DETECTION);
    }
    get disableTestingOpen() {
        return this.getConfigValue(configKeys.DISABLE_TESTING_OPEN);
    }
    get ignoreBoards() {
        return this.getConfigValue(configKeys.IGNORE_BOARDS);
    }
    set ignoreBoards(value) {
        this.setConfigValue(configKeys.IGNORE_BOARDS, value, true);
    }
    get defaultBaudRate() {
        return this.getConfigValue(configKeys.DEFAULT_BAUD_RATE);
    }
    get useArduinoCli() {
        return this.getConfigValue(configKeys.USE_ARDUINO_CLI);
    }
    get skipHeaderProvider() {
        return this.getConfigValue(configKeys.SKIP_HEADER_PROVIDER);
    }
    get disableIntelliSenseAutoGen() {
        return this.getConfigValue(configKeys.DISABLE_INTELLISENSE_AUTO_GEN);
    }
    get defaultTimestampFormat() {
        return this.getConfigValue(configKeys.DEFAULT_TIMESTAMP_FORMAT);
    }
    get analyzeOnOpen() {
        return this.getConfigValue(configKeys.ANALYZE_ON_OPEN);
    }
    get analyzeOnSettingChange() {
        return this.getConfigValue(configKeys.ANALYZE_ON_SETTING_CHANGE);
    }
    updateAdditionalUrls(value) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.setConfigValue(configKeys.ADDITIONAL_URLS, value, true);
        });
    }
    getConfigValue(key) {
        const workspaceConfig = vscode.workspace.getConfiguration();
        return workspaceConfig.get(key);
    }
    setConfigValue(key, value, global = true) {
        return __awaiter(this, void 0, void 0, function* () {
            const workspaceConfig = vscode.workspace.getConfiguration();
            yield workspaceConfig.update(key, value, global);
        });
    }
}
exports.VscodeSettings = VscodeSettings;

//# sourceMappingURL=vscodeSettings.js.map

// SIG // Begin signature block
// SIG // MIInqwYJKoZIhvcNAQcCoIInnDCCJ5gCAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // Ca11xYda7xwSGBli0n6x7NYdoLnqAihQomWdT1o1qfOg
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
// SIG // ARUwLwYJKoZIhvcNAQkEMSIEIIK3tRty0H4pQtyKlet8
// SIG // lGDpS9HGjF2ty0JMl/k3Qs/KMEIGCisGAQQBgjcCAQwx
// SIG // NDAyoBSAEgBNAGkAYwByAG8AcwBvAGYAdKEagBhodHRw
// SIG // Oi8vd3d3Lm1pY3Jvc29mdC5jb20wDQYJKoZIhvcNAQEB
// SIG // BQAEggEAC8qsEP6lm5hTIradLB0tpl/3qbhjMbp4g8VN
// SIG // KV7ACwGS9WiGfV1uVlw+WS6mdvuyTl6zXscmlYT4T7+O
// SIG // rIGtqobM8xCI7zpCkncd4pJsuyAcq/x979cMXNfVNaSM
// SIG // L0JQoTdaazkBt4cJpKRjp8RqWm7DIje8OyxUBy36TIjz
// SIG // Hav7FZ+EcVzN/3S8IzIF2hhjbxCaTtNh0P0bv3bEavsr
// SIG // i8+3c8C+awtGURJX78ld/JHSiYJ/oBO8hqNwJzSxsTER
// SIG // gQVuZMZpETsb+/bhSQGlAzo1kVgLp0GgNvZC7n1xFQXT
// SIG // bpLXYtsCNMMsx1CuHV3Nq7eGM0NngDBckaMjaHnfUaGC
// SIG // FwwwghcIBgorBgEEAYI3AwMBMYIW+DCCFvQGCSqGSIb3
// SIG // DQEHAqCCFuUwghbhAgEDMQ8wDQYJYIZIAWUDBAIBBQAw
// SIG // ggFVBgsqhkiG9w0BCRABBKCCAUQEggFAMIIBPAIBAQYK
// SIG // KwYBBAGEWQoDATAxMA0GCWCGSAFlAwQCAQUABCBFj0r7
// SIG // 2k4OOK64is99kJvyCIRnGvT3VfvsnkZkgMfe7QIGYmtW
// SIG // 2QVAGBMyMDIyMDUwMzE5MDEwOC4xMTRaMASAAgH0oIHU
// SIG // pIHRMIHOMQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2Fz
// SIG // aGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UE
// SIG // ChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMSkwJwYDVQQL
// SIG // EyBNaWNyb3NvZnQgT3BlcmF0aW9ucyBQdWVydG8gUmlj
// SIG // bzEmMCQGA1UECxMdVGhhbGVzIFRTUyBFU046RDlERS1F
// SIG // MzlBLTQzRkUxJTAjBgNVBAMTHE1pY3Jvc29mdCBUaW1l
// SIG // LVN0YW1wIFNlcnZpY2WgghFfMIIHEDCCBPigAwIBAgIT
// SIG // MwAAAaxmvIciXd49ewABAAABrDANBgkqhkiG9w0BAQsF
// SIG // ADB8MQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGlu
// SIG // Z3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMV
// SIG // TWljcm9zb2Z0IENvcnBvcmF0aW9uMSYwJAYDVQQDEx1N
// SIG // aWNyb3NvZnQgVGltZS1TdGFtcCBQQ0EgMjAxMDAeFw0y
// SIG // MjAzMDIxODUxMjlaFw0yMzA1MTExODUxMjlaMIHOMQsw
// SIG // CQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQ
// SIG // MA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9z
// SIG // b2Z0IENvcnBvcmF0aW9uMSkwJwYDVQQLEyBNaWNyb3Nv
// SIG // ZnQgT3BlcmF0aW9ucyBQdWVydG8gUmljbzEmMCQGA1UE
// SIG // CxMdVGhhbGVzIFRTUyBFU046RDlERS1FMzlBLTQzRkUx
// SIG // JTAjBgNVBAMTHE1pY3Jvc29mdCBUaW1lLVN0YW1wIFNl
// SIG // cnZpY2UwggIiMA0GCSqGSIb3DQEBAQUAA4ICDwAwggIK
// SIG // AoICAQDHeAtQxRdi7sdxzCvABJTHUxeIhvUTsikFhXoU
// SIG // 13vhF9UDq0wRZ4TACjRyEFqMZCtVutv6EEEJrSB6PLKY
// SIG // TLdVqZCzbwpty2vLHVS97fwQMe1FpJn77oydyg2koLd3
// SIG // JXObjT1I+3t9lOJ/xKfaDnPj7/xB3O1xh9Xxkby0WM8K
// SIG // MT9cZCpXrrGyM0/2ip+lgtgYID84x14p/ShO5K4grqgP
// SIG // iTYbJJHnUxyUCKLW5Ufq2XLHsU0pozvme0dJn3h4lPA5
// SIG // 7b2b2f/WnfV1IQ8FCRSmfGWb8Z6p2V8BWJAyjWoGPINO
// SIG // gRdbw7pW5QLOgOIbj9Xu6bShaaQdVWZC1AJiFtccSRrN
// SIG // 5HonQE1iFcdtrBlcnpmk9vTX7Q6f40bA8P2ocL9TZL+l
// SIG // r8pKLytJAzyGPUwlvXEW71HhJZPvglTO3CKq5fEGN5oB
// SIG // EPKIuOVcxAV7mNOGNSoo2xi2ERTVMqVzEQwKVfpHIxvL
// SIG // kk9d5kgn9ojIVkUS8/f48iMHu5Zl8+M1MmHJK/tjZvBq
// SIG // 0quX1QD7ISDvAG/2jqOv6Htxt2PnIpfIskSSyTcWzGMY
// SIG // kCSmb28ZQiKfqRiJ2g9d+9zOyjzxf8l3k+IRtC6lyr3p
// SIG // ZILZac3nz65lFbqY2E4Hhn7qVMBc8pkpOCUTTtbYUQdG
// SIG // wygyMjTFahLr1dVMXXK4nFdKI4HiRwIDAQABo4IBNjCC
// SIG // ATIwHQYDVR0OBBYEFFgRn3cEyx9AZ0o8fElamFrAQI5N
// SIG // MB8GA1UdIwQYMBaAFJ+nFV0AXmJdg/Tl0mWnG1M1Gely
// SIG // MF8GA1UdHwRYMFYwVKBSoFCGTmh0dHA6Ly93d3cubWlj
// SIG // cm9zb2Z0LmNvbS9wa2lvcHMvY3JsL01pY3Jvc29mdCUy
// SIG // MFRpbWUtU3RhbXAlMjBQQ0ElMjAyMDEwKDEpLmNybDBs
// SIG // BggrBgEFBQcBAQRgMF4wXAYIKwYBBQUHMAKGUGh0dHA6
// SIG // Ly93d3cubWljcm9zb2Z0LmNvbS9wa2lvcHMvY2VydHMv
// SIG // TWljcm9zb2Z0JTIwVGltZS1TdGFtcCUyMFBDQSUyMDIw
// SIG // MTAoMSkuY3J0MAwGA1UdEwEB/wQCMAAwEwYDVR0lBAww
// SIG // CgYIKwYBBQUHAwgwDQYJKoZIhvcNAQELBQADggIBAHnQ
// SIG // tQJYVVxwpXZPLaCMwFvUMiE3EXsoVKbNbg+u8wgt9PH0
// SIG // c2BREv9rzF+6NDmyYMwsU9Z4tL5HLPFhtjFCLJPdUQjy
// SIG // Hg800CLSKY/WU8/YdLbn3Chpt2oZJ0bNYaFddo0RZHGq
// SIG // lyaNX7MrqCoA/hU09pTr6xLDYyYecBLIvjwf5lZofyWt
// SIG // FbvI4VCXNYawVEOWIrEODdNLJ2cITqAnj123Q+hxrNXJ
// SIG // rF2W65E/LzT2FfC5yOJcbif2GmEttKkK+mPQyBxQzWMW
// SIG // W05bEHl7Pyo54UTXRYghqAHCx1sHlnkbM4dolITH2Nf+
// SIG // /Xe7KJn48emciT2Tq+HxNFE9pf6wWgU66D6Qzr6WjrGO
// SIG // hP7XiyzH8p6+lDkHhOJUYsOfbIlRsgBqqUwU23cwBSwR
// SIG // R+NLm6+1RJXZo4h2teBJGcWL3IMysSqrm+Mqymn6P4/W
// SIG // lG8C6y9lTB1nKWtfCYb+syI3dNSBpFHY91CfiSkDQM+X
// SIG // sj8kEmT7fcLPG8p6HRpTOZ2JBwcu6z74+Ocvmc+46y4I
// SIG // 4L2SIsRrM8KisiieOwDx8ax/BowkLrG71vTReCwGCqGW
// SIG // Ro+z8JkAPl5sA+bX1ENCrszERZjKTlM7YkwICY0H/UzL
// SIG // nN6WJqRVhK/JLGHcK463VmACwlwPyEFxHQIrEMI+WM07
// SIG // IeEMU1Kvr0UsbPd8gd5yMIIHcTCCBVmgAwIBAgITMwAA
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
// SIG // A1UECxMdVGhhbGVzIFRTUyBFU046RDlERS1FMzlBLTQz
// SIG // RkUxJTAjBgNVBAMTHE1pY3Jvc29mdCBUaW1lLVN0YW1w
// SIG // IFNlcnZpY2WiIwoBATAHBgUrDgMCGgMVALEa0hOwuLBJ
// SIG // /egDIYzZF2dGNYqgoIGDMIGApH4wfDELMAkGA1UEBhMC
// SIG // VVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcT
// SIG // B1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jw
// SIG // b3JhdGlvbjEmMCQGA1UEAxMdTWljcm9zb2Z0IFRpbWUt
// SIG // U3RhbXAgUENBIDIwMTAwDQYJKoZIhvcNAQEFBQACBQDm
// SIG // G8P3MCIYDzIwMjIwNTAzMTkwODM5WhgPMjAyMjA1MDQx
// SIG // OTA4MzlaMHcwPQYKKwYBBAGEWQoEATEvMC0wCgIFAOYb
// SIG // w/cCAQAwCgIBAAICExwCAf8wBwIBAAICETswCgIFAOYd
// SIG // FXcCAQAwNgYKKwYBBAGEWQoEAjEoMCYwDAYKKwYBBAGE
// SIG // WQoDAqAKMAgCAQACAwehIKEKMAgCAQACAwGGoDANBgkq
// SIG // hkiG9w0BAQUFAAOBgQCUsbL1q99n2M8vk2PZS+RmWyh6
// SIG // Nn+qyoTEZfhRk1W8azcF4TpIWfFSFrvRyV1pL8hvg6XF
// SIG // eY8pyZ0a4emWzPinv2R9DaN3XuQLKGxcbmHBl0E2HjXE
// SIG // 8VKUND8cw+6+MKHXbvrN741udCPKozu+Pspnos01HuqT
// SIG // CC3uJKAzqKbqYjGCBA0wggQJAgEBMIGTMHwxCzAJBgNV
// SIG // BAYTAlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYD
// SIG // VQQHEwdSZWRtb25kMR4wHAYDVQQKExVNaWNyb3NvZnQg
// SIG // Q29ycG9yYXRpb24xJjAkBgNVBAMTHU1pY3Jvc29mdCBU
// SIG // aW1lLVN0YW1wIFBDQSAyMDEwAhMzAAABrGa8hyJd3j17
// SIG // AAEAAAGsMA0GCWCGSAFlAwQCAQUAoIIBSjAaBgkqhkiG
// SIG // 9w0BCQMxDQYLKoZIhvcNAQkQAQQwLwYJKoZIhvcNAQkE
// SIG // MSIEIC4qnmb1sgdg3JxqCWNVMvaicUFx8nb+83/E04Xo
// SIG // QKdkMIH6BgsqhkiG9w0BCRACLzGB6jCB5zCB5DCBvQQg
// SIG // +bcBkoM4LwlxAHK1c+epu/T6fm0CX/tPi4Nn2gQswvUw
// SIG // gZgwgYCkfjB8MQswCQYDVQQGEwJVUzETMBEGA1UECBMK
// SIG // V2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwG
// SIG // A1UEChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMSYwJAYD
// SIG // VQQDEx1NaWNyb3NvZnQgVGltZS1TdGFtcCBQQ0EgMjAx
// SIG // MAITMwAAAaxmvIciXd49ewABAAABrDAiBCApy/5GlOby
// SIG // qzQkH9s9OOUNuhMmp65JBNfh3OUnpQCaWjANBgkqhkiG
// SIG // 9w0BAQsFAASCAgBYjR9pmCOtYi7S+S/dqTj9vB/ZPSrp
// SIG // 2YXvlXIkZ3IU+IFibXSU3xizBKltKwmr5k23pPbJGZp7
// SIG // VqJYJbh+v+lzss7Sc1BZaMg/7kmWVMhzEVVuAahoeFHE
// SIG // 8Ooi/Q1PTwTADorJY5uvi91EIWD4W7BSDaSa8KhXNIZr
// SIG // RsU4cTHT68BrGbgitObgz1iXCz150ERRFhZkOy5UpeGv
// SIG // BwpC7dk6yWL6mohWzc6S3bQKcx/4Cs5De8DVLqg7TuwX
// SIG // goYtQWgJY2aOuGgNUP/BFI0HlquykN8pkqzlpGXdHNTE
// SIG // JsTolyMSLBOWoGq1bOtkL231rAyEQRBseGwTDWn/P03n
// SIG // RNrHenU9OCK1ODH+nXGtx+5KxpYWgGLlGLrDj+Rn64p8
// SIG // M4FO3a8j0lW3pm1fFsrv3Iyawh6qzCgJeXhaQcSc/Eq8
// SIG // 80e55tNd3596IDUM/F3sSXE6+diNpUGZPyfTabZuJdJy
// SIG // Zechc+p+mJB9xgb8ydQdu1O1t2rYuE/NVU06jN8h2BZA
// SIG // rOQtwh7K+q2tuMrjDBMMd9JpbakcEC7vxid/ZtEWHyGN
// SIG // RyEoLv5MLSaPURR7bvVC63f0rrlZZmIutB9JinyFLTs5
// SIG // PKy2Cj9uxCY9lkDnsS6xEfwdvjIZYWuUAulPyE2kOxh0
// SIG // wC8NgLbV2Ir2M9yOB5mV8AfigPOYmgGQynfdHw==
// SIG // End signature block
