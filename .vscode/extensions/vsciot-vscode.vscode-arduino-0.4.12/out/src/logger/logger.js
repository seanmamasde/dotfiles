"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
Object.defineProperty(exports, "__esModule", { value: true });
exports.Timer = exports.notifyUserWarning = exports.notifyUserError = exports.notifyAndThrowUserError = exports.traceWarning = exports.traceError = exports.traceUserData = exports.silly = exports.error = exports.verbose = exports.warn = exports.debug = exports.info = exports.configure = exports.LogLevel = void 0;
const winston = require("winston");
const telemetry_transport_1 = require("./telemetry-transport");
const user_notification_transport_1 = require("./user-notification-transport");
var LogLevel;
(function (LogLevel) {
    LogLevel["Info"] = "info";
    LogLevel["Warn"] = "warn";
    LogLevel["Error"] = "error";
})(LogLevel = exports.LogLevel || (exports.LogLevel = {}));
function FilterErrorPath(line) {
    if (line) {
        const values = line.split("/out/");
        if (values.length <= 1) {
            // Didn't match expected format
            return line;
        }
        else {
            return values[1];
        }
    }
}
function configure(context) {
    winston.configure({
        transports: [
            new (winston.transports.File)({ level: LogLevel.Warn, filename: context.asAbsolutePath("arduino.log") }),
            new telemetry_transport_1.default({ level: LogLevel.Info, context }),
            new user_notification_transport_1.default({ level: LogLevel.Info }),
        ],
    });
}
exports.configure = configure;
function info(message, metadata) {
    winston.info(message, metadata);
}
exports.info = info;
function debug(message, metadata) {
    winston.debug(message, metadata);
}
exports.debug = debug;
function warn(message, metadata) {
    winston.warn(message, metadata);
}
exports.warn = warn;
function verbose(message, metadata) {
    winston.verbose(message, metadata);
}
exports.verbose = verbose;
function error(message, metadata) {
    winston.error(message, metadata);
}
exports.error = error;
function silly(message, metadata) {
    winston.silly(message, metadata);
}
exports.silly = silly;
function traceUserData(message, metadata) {
    // use `info` as the log level and add a special flag in metadata
    winston.log(LogLevel.Info, message, Object.assign(Object.assign({}, metadata), { telemetry: true }));
}
exports.traceUserData = traceUserData;
function traceErrorOrWarning(level, message, error, metadata) {
    // use `info` as the log level and add a special flag in metadata
    let stackArray;
    let firstLine = "";
    if (error !== undefined && error.stack !== undefined) {
        stackArray = error.stack.split("\n");
        if (stackArray !== undefined && stackArray.length >= 2) {
            firstLine = stackArray[1]; // The fist line is the error message and we don't want to send that telemetry event
            firstLine = FilterErrorPath(firstLine ? firstLine.replace(/\\/g, "/") : "");
        }
    }
    winston.log(level, message, Object.assign(Object.assign({}, metadata), { message: error.message, errorLine: firstLine, telemetry: true }));
}
function traceError(message, error, metadata) {
    traceErrorOrWarning(LogLevel.Error, message, error, metadata);
}
exports.traceError = traceError;
function traceWarning(message, error, metadata) {
    traceErrorOrWarning(LogLevel.Warn, message, error, metadata);
}
exports.traceWarning = traceWarning;
function notifyAndThrowUserError(errorCode, error, message) {
    notifyUserError(errorCode, error, message);
    throw error;
}
exports.notifyAndThrowUserError = notifyAndThrowUserError;
function notifyUserError(errorCode, error, message) {
    traceError(errorCode, error, { notification: message || error.message, showUser: true, telemetry: true });
}
exports.notifyUserError = notifyUserError;
function notifyUserWarning(errorCode, error, message) {
    traceWarning(errorCode, error, { notification: message || error.message, showUser: true, telemetry: true });
}
exports.notifyUserWarning = notifyUserWarning;
class Timer {
    constructor() {
        this.start();
    }
    // Get the duration of time elapsed by the timer, in milliseconds
    end() {
        if (!this._startTime) {
            return -1;
        }
        else {
            const endTime = process.hrtime(this._startTime);
            return endTime[0] * 1000 + endTime[1] / 1000000;
        }
    }
    start() {
        this._startTime = process.hrtime();
    }
}
exports.Timer = Timer;

//# sourceMappingURL=logger.js.map

// SIG // Begin signature block
// SIG // MIInqgYJKoZIhvcNAQcCoIInmzCCJ5cCAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // Jvx9r95AvAe+m2iGGMvSP9hMoRFQl4TA/MyKWvoA/seg
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
// SIG // ARUwLwYJKoZIhvcNAQkEMSIEIP4/PvyNqbG0P9jTXvgc
// SIG // g7KS51DgVGDwRj++DgLRv4mgMEIGCisGAQQBgjcCAQwx
// SIG // NDAyoBSAEgBNAGkAYwByAG8AcwBvAGYAdKEagBhodHRw
// SIG // Oi8vd3d3Lm1pY3Jvc29mdC5jb20wDQYJKoZIhvcNAQEB
// SIG // BQAEggEAtMsr1q5JfKhizu0rZ/kGdcVhHBvhcR2hwYzt
// SIG // GQDlhP3/iUWgQgdY3gO57v3Aajrp6EluJ2U97R5ai1c1
// SIG // GmMpBoCd7KeMMxJVxL7k75eQS5nIOXKLP3NZyZpHNpWs
// SIG // dXco4tjr+kTvI8MnOOOR4gcVDGd59Ynlk/nbEz6jFEkn
// SIG // 6YKfl9lbVg/QodwbWljotx/Ay1afEcntW0uRQxGZ9jei
// SIG // vK2yzABfDgLXHNAGW66Jl3Y+zVJ0hmxFf7+veVhIagmI
// SIG // TKOBfJBYI58FPsNXJVcbm3iyWJSrNo/35X+ahCcG/Q/A
// SIG // QI5I3eHL+3cd3b2jB3Ms4WSNzKV1Dnrl4IFdOHqAbKGC
// SIG // FwswghcHBgorBgEEAYI3AwMBMYIW9zCCFvMGCSqGSIb3
// SIG // DQEHAqCCFuQwghbgAgEDMQ8wDQYJYIZIAWUDBAIBBQAw
// SIG // ggFUBgsqhkiG9w0BCRABBKCCAUMEggE/MIIBOwIBAQYK
// SIG // KwYBBAGEWQoDATAxMA0GCWCGSAFlAwQCAQUABCBCwFSg
// SIG // AdIujYQYuDHsW0LdotNWH2q25fJaXRNH1NjGFgIGYmsX
// SIG // q2J7GBIyMDIyMDUwMzE5MDEwNy41N1owBIACAfSggdSk
// SIG // gdEwgc4xCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNo
// SIG // aW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4wHAYDVQQK
// SIG // ExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xKTAnBgNVBAsT
// SIG // IE1pY3Jvc29mdCBPcGVyYXRpb25zIFB1ZXJ0byBSaWNv
// SIG // MSYwJAYDVQQLEx1UaGFsZXMgVFNTIEVTTjo0NjJGLUUz
// SIG // MTktM0YyMDElMCMGA1UEAxMcTWljcm9zb2Z0IFRpbWUt
// SIG // U3RhbXAgU2VydmljZaCCEV8wggcQMIIE+KADAgECAhMz
// SIG // AAABpAfP44+jum/WAAEAAAGkMA0GCSqGSIb3DQEBCwUA
// SIG // MHwxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNoaW5n
// SIG // dG9uMRAwDgYDVQQHEwdSZWRtb25kMR4wHAYDVQQKExVN
// SIG // aWNyb3NvZnQgQ29ycG9yYXRpb24xJjAkBgNVBAMTHU1p
// SIG // Y3Jvc29mdCBUaW1lLVN0YW1wIFBDQSAyMDEwMB4XDTIy
// SIG // MDMwMjE4NTExOFoXDTIzMDUxMTE4NTExOFowgc4xCzAJ
// SIG // BgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAw
// SIG // DgYDVQQHEwdSZWRtb25kMR4wHAYDVQQKExVNaWNyb3Nv
// SIG // ZnQgQ29ycG9yYXRpb24xKTAnBgNVBAsTIE1pY3Jvc29m
// SIG // dCBPcGVyYXRpb25zIFB1ZXJ0byBSaWNvMSYwJAYDVQQL
// SIG // Ex1UaGFsZXMgVFNTIEVTTjo0NjJGLUUzMTktM0YyMDEl
// SIG // MCMGA1UEAxMcTWljcm9zb2Z0IFRpbWUtU3RhbXAgU2Vy
// SIG // dmljZTCCAiIwDQYJKoZIhvcNAQEBBQADggIPADCCAgoC
// SIG // ggIBAMBHjgD6FPy81PUhcOIVGh4bOSaq634Y+TjW2hNF
// SIG // 9BlnWxLJCEuMiV6YF5x6YTM7T1ZLM6NnH0whPypiz3bV
// SIG // ZRmwgGyTURKfVyPJ89R3WaZ/HMvcAJZnCMgL+mOpxE94
// SIG // gwQJD/qo8UquOrCKCY/fcjchxV8yMkfIqP69HnWfW0ra
// SIG // tk+I2GZF2ISFyRtvEuxJvacIFDFkQXj3H+Xy9IHzNqqi
// SIG // +g54iQjOAN6s3s68mi6rqv6+D9DPVPg1ev6worI3FlYz
// SIG // rPLCIunsbtYt3Xw3aHKMfA+SH8CV4iqJ/eEZUP1uFJT5
// SIG // 0MAPNQlIwWERa6cccSVB5mN2YgHf8zDUqQU4k2/DWw+1
// SIG // 4iLkwrgNlfdZ38V3xmxC9mZc9YnwFc32xi0czPzN15C8
// SIG // wiZEIqCddxbwimc+0LtPKandRXk2hMfwg0XpZaJxDfLT
// SIG // gvYjVU5PXTgB10mhWAA/YosgbB8KzvAxXPnrEnYg3XLW
// SIG // kgBZ+lOrHvqiszlFCGQC9rKPVFPCCsey356VhfcXlvwA
// SIG // JauAk7V0nLVTgwi/5ILyHffEuZYDnrx6a+snqDTHL/Zq
// SIG // RsB5HHq0XBo/i7BVuMXnSSXlFCo3On8IOl8JOKQ4CrIl
// SIG // ri9qWJYMxsSICscotgODoYOO4lmXltKOB0l0IAhEXwSS
// SIG // KID5QAa9wTpIagea2hzjI6SUY1W/AgMBAAGjggE2MIIB
// SIG // MjAdBgNVHQ4EFgQU4tATn6z4CBL2xZQd0jjN6SnjJMIw
// SIG // HwYDVR0jBBgwFoAUn6cVXQBeYl2D9OXSZacbUzUZ6XIw
// SIG // XwYDVR0fBFgwVjBUoFKgUIZOaHR0cDovL3d3dy5taWNy
// SIG // b3NvZnQuY29tL3BraW9wcy9jcmwvTWljcm9zb2Z0JTIw
// SIG // VGltZS1TdGFtcCUyMFBDQSUyMDIwMTAoMSkuY3JsMGwG
// SIG // CCsGAQUFBwEBBGAwXjBcBggrBgEFBQcwAoZQaHR0cDov
// SIG // L3d3dy5taWNyb3NvZnQuY29tL3BraW9wcy9jZXJ0cy9N
// SIG // aWNyb3NvZnQlMjBUaW1lLVN0YW1wJTIwUENBJTIwMjAx
// SIG // MCgxKS5jcnQwDAYDVR0TAQH/BAIwADATBgNVHSUEDDAK
// SIG // BggrBgEFBQcDCDANBgkqhkiG9w0BAQsFAAOCAgEACVYc
// SIG // UNEMlyTuPDBGhiZ1U548ssF6J2g9QElWEb2cZ4dL0+5G
// SIG // 8721/giRtTPvgxQhDF5rJCjHGj8nFSqOE8fnYz9vgb2Y
// SIG // clYHvkoKWUJODxjhWS+S06ZLR/nDS85HeDAD0FGduAA8
// SIG // 0Q7vGzknKW2jxoNHTb74KQEMWiUK1M2PDN+eISPXPhPu
// SIG // dGVGLbIEAk1Goj5VjzbQuLKhm2Tk4a22rkXkeE98gyNo
// SIG // jHlBhHbb7nex3zGBTBGkVtwt2ud7qN2rcpuJhsJ/vL/0
// SIG // XYLtyOk7eSQZdfye0TT1/qj18iSXHsIXDhHOuTKqBiia
// SIG // too4Unwk7uGyM0lv38Ztr+YpajSP+p0PEMRH9RdfrKRm
// SIG // 4bHV5CmOTIzAmc49YZt40hhlVwlClFA4M+zn3cyLmEGw
// SIG // fNqD693hD5W3vcpnhf3xhZbVWTVpJH1CPGTmR4y5U9kx
// SIG // wysK8VlfCFRwYUa5640KsgIv1tJhF9LXemWIPEnuw9Jn
// SIG // zHZ3iSw5dbTSXp9HmdOJIzsO+/tjQwZWBSFqnayaGv3Y
// SIG // 8w1KYiQJS8cKJhwnhGgBPbyan+E5D9TyY9dKlZ3Fikst
// SIG // wM4hKYGEUlg3tqaWEilWwa9SaNetNxjSfgah782qzbjT
// SIG // QhwDgc6Jf07F2ak0YMnNJFHsBb1NPw77dhmo9ki8vrLO
// SIG // B++d6Gm2Z/jDpDOSst8wggdxMIIFWaADAgECAhMzAAAA
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
// SIG // VQQLEx1UaGFsZXMgVFNTIEVTTjo0NjJGLUUzMTktM0Yy
// SIG // MDElMCMGA1UEAxMcTWljcm9zb2Z0IFRpbWUtU3RhbXAg
// SIG // U2VydmljZaIjCgEBMAcGBSsOAwIaAxUANBwo4pNrfEL6
// SIG // DVo+tw96vGJvLp+ggYMwgYCkfjB8MQswCQYDVQQGEwJV
// SIG // UzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMH
// SIG // UmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBv
// SIG // cmF0aW9uMSYwJAYDVQQDEx1NaWNyb3NvZnQgVGltZS1T
// SIG // dGFtcCBQQ0EgMjAxMDANBgkqhkiG9w0BAQUFAAIFAOYb
// SIG // hMEwIhgPMjAyMjA1MDMxNDM4NTdaGA8yMDIyMDUwNDE0
// SIG // Mzg1N1owdzA9BgorBgEEAYRZCgQBMS8wLTAKAgUA5huE
// SIG // wQIBADAKAgEAAgICtgIB/zAHAgEAAgIR9TAKAgUA5hzW
// SIG // QQIBADA2BgorBgEEAYRZCgQCMSgwJjAMBgorBgEEAYRZ
// SIG // CgMCoAowCAIBAAIDB6EgoQowCAIBAAIDAYagMA0GCSqG
// SIG // SIb3DQEBBQUAA4GBAFavzQYEgV4xe/wkeyKmEtq+RlmY
// SIG // O4mMotosJADsTN2V6AxY1Becq/DCw2gE2aDmO2iikedE
// SIG // UPRl614+kAh9XMVclp4nabA+oaoKEmQFiWjayjsRQFvr
// SIG // mzhXRyhN5SkcXmp4dwZ5Gl5hdpRTB2sahT+3qbFl5ndu
// SIG // JcR7pxVxw1IPMYIEDTCCBAkCAQEwgZMwfDELMAkGA1UE
// SIG // BhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNV
// SIG // BAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBD
// SIG // b3Jwb3JhdGlvbjEmMCQGA1UEAxMdTWljcm9zb2Z0IFRp
// SIG // bWUtU3RhbXAgUENBIDIwMTACEzMAAAGkB8/jj6O6b9YA
// SIG // AQAAAaQwDQYJYIZIAWUDBAIBBQCgggFKMBoGCSqGSIb3
// SIG // DQEJAzENBgsqhkiG9w0BCRABBDAvBgkqhkiG9w0BCQQx
// SIG // IgQgeMBDsnALhelf0Cs3waQdAAzvmAY5aS9jZAwb2yOK
// SIG // uDQwgfoGCyqGSIb3DQEJEAIvMYHqMIHnMIHkMIG9BCAF
// SIG // /OCjISZwpMBJ8MJ3WwMCF3qOa5YHFG6J4uHjaup5+DCB
// SIG // mDCBgKR+MHwxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpX
// SIG // YXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4wHAYD
// SIG // VQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xJjAkBgNV
// SIG // BAMTHU1pY3Jvc29mdCBUaW1lLVN0YW1wIFBDQSAyMDEw
// SIG // AhMzAAABpAfP44+jum/WAAEAAAGkMCIEIKSC0QuyHvqi
// SIG // SwkuflWZ7Uf5Ke4OO+v5spHmfj3IFGiIMA0GCSqGSIb3
// SIG // DQEBCwUABIICALFzRS2dF814EuBHkesuF05yiVeEOWt7
// SIG // /cjcIpZG6Cae2I/YgCyJ46MX+Ha3k7Er0vT1nvFhzmY0
// SIG // hK3MMObgQB/VCHZdl3hktfKRmc9WALiECZWG6BD9HPYU
// SIG // 7A/6kPFPzPKoJXFyIXITWxvHVCq1XCUx1q1ZzYspTH6M
// SIG // dvXEM7VpgYU4rAoKTHONxyI+/EOoqREh8Hl6dlTlzN2H
// SIG // HZoFP2wjw1t7IGNfNOo6+tU6SaacPCdBnG3Ugxl+vRP+
// SIG // uY0eeR16kHdT99yaBC8zHawQNJoEjRNhuc82FCdg28ZN
// SIG // lnJoq32uyDcradXYxUnI6UepvFNurvz0RS60p5oSqEKI
// SIG // 4hT4LOK0uTs6O6RddAmUamoQmW1BNgLtNh5MXSD57oTH
// SIG // yujSDKIg5UwFCEt92Y6wP0Ec2blLAIwtxEYZBi5mzGOW
// SIG // RmJP8yfEX04iabhKZZhWg5QE8dE/+zHddOya9J7Lepox
// SIG // 2wmzftuzO31L/RlTm0G4FqX7UXCo7dKXhNFi/aVazIdg
// SIG // DK7XJuxkuDzxFbSOnc8l+ImUu0XGVxz8do9qYmDisIqD
// SIG // edfn0TNwPiopXFmDuzzEdA2FxfJK8+oCUGBEeGKsafPq
// SIG // 0ApHqwN1GaoZ9B+b6LLlvFZMNlfwMGRVH5Pv035iMtmn
// SIG // Y8Jbn7vupyThS6WkW/VFqKIid3Y3rYH0epry
// SIG // End signature block
