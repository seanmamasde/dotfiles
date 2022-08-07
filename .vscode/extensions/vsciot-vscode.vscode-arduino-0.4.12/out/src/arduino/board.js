"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
Object.defineProperty(exports, "__esModule", { value: true });
exports.boardEqual = exports.Board = exports.parseBoardDescriptor = void 0;
const package_1 = require("./package");
function parseBoardDescriptor(boardDescriptor, plat) {
    const boardLineRegex = /([^.]+)\.(\S+)=(.+)/;
    const result = new Map();
    const lines = boardDescriptor.split(/(?:\r|\r\n|\n)/);
    const menuMap = new Map();
    lines.forEach((line) => {
        // Ignore comments.
        if (line.startsWith("#")) {
            return;
        }
        const match = boardLineRegex.exec(line);
        if (match) {
            if (line.startsWith("menu.")) {
                menuMap.set(match[2], match[3]);
                return;
            }
            let boardObject = result.get(match[1]);
            if (!boardObject) {
                boardObject = new Board(match[1], plat, menuMap);
                result.set(boardObject.board, boardObject);
            }
            if (match[2] === "name") {
                boardObject.name = match[3].trim();
            }
            else {
                boardObject.addParameter(match[2], match[3]);
            }
        }
    });
    return result;
}
exports.parseBoardDescriptor = parseBoardDescriptor;
const MENU_REGEX = /menu\.([^.]+)\.([^.]+)(\.?(\S+)?)/;
class Board {
    constructor(_board, _platform, _menuMap) {
        this._board = _board;
        this._platform = _platform;
        this._menuMap = _menuMap;
        this._configItems = [];
    }
    get board() {
        return this._board;
    }
    get platform() {
        return this._platform;
    }
    addParameter(key, value) {
        const match = key.match(MENU_REGEX);
        if (match) {
            const existingItem = this._configItems.find((item) => item.id === match[1]);
            if (existingItem) {
                if (!existingItem.selectedOption) {
                    existingItem.selectedOption = match[2];
                }
                const existingOption = existingItem.options.find((opt) => opt.id === match[2]);
                if (!existingOption) {
                    existingItem.options.push({ id: match[2], displayName: value });
                }
            }
            else {
                this._configItems.push({
                    displayName: this._menuMap.get(match[1]),
                    id: match[1],
                    selectedOption: match[2],
                    options: [{ id: match[2], displayName: value }],
                });
            }
        }
    }
    getBuildConfig() {
        return `${this.getPackageName()}:${this.platform.architecture}:${this.board}${this.customConfig ? ":" + this.customConfig : ""}`;
    }
    /**
     * @returns {string} Return board key in format packageName:arch:boardName
     */
    get key() {
        return `${this.getPackageName()}:${this.platform.architecture}:${this.board}`;
    }
    get customConfig() {
        if (this._configItems && this._configItems.length > 0) {
            return this._configItems.map((configItem) => `${configItem.id}=${configItem.selectedOption}`).join(",");
        }
    }
    get configItems() {
        return this._configItems;
    }
    loadConfig(configString) {
        // An empty or undefined config string resets the configuration
        if (!configString) {
            this.resetConfig();
            return package_1.BoardConfigResult.Success;
        }
        const configSections = configString.split(",");
        const keyValueRegex = /(\S+)=(\S+)/;
        let result = package_1.BoardConfigResult.Success;
        for (const section of configSections) {
            const match = section.match(keyValueRegex);
            if (!match) {
                return package_1.BoardConfigResult.InvalidFormat;
            }
            const r = this.updateConfig(match[1], match[2]);
            switch (r) {
                case package_1.BoardConfigResult.SuccessNoChange:
                    result = r;
                    break;
                case package_1.BoardConfigResult.Success:
                    break;
                default:
                    return r;
            }
        }
        return result;
    }
    /**
     * For documentation see the documentation on IBoard.updateConfig().
     */
    updateConfig(configId, optionId) {
        const targetConfig = this._configItems.find((config) => config.id === configId);
        if (!targetConfig) {
            return package_1.BoardConfigResult.InvalidConfigID;
        }
        // Iterate through all options and ...
        for (const o of targetConfig.options) {
            // Make sure that we only set valid options, e.g. when loading
            // from config files.
            if (o.id === optionId) {
                if (targetConfig.selectedOption !== optionId) {
                    targetConfig.selectedOption = optionId;
                    return package_1.BoardConfigResult.Success;
                }
                return package_1.BoardConfigResult.SuccessNoChange;
            }
        }
        return package_1.BoardConfigResult.InvalidOptionID;
    }
    resetConfig() {
        for (const c of this._configItems) {
            c.selectedOption = c.options[0].id;
        }
    }
    getPackageName() {
        return this.platform.packageName ? this.platform.packageName : this.platform.package.name;
    }
}
exports.Board = Board;
/**
 * Test if two boards are of the same type, i.e. have the same key.
 * @param {IBoard | undefined} a A board.
 * @param {IBoard | undefined} b And another board.
 * @returns {boolean} true if two boards are of the same type, else false.
 */
function boardEqual(a, b) {
    if (a && b) {
        return a.key === b.key;
    }
    else if (a || b) {
        return false;
    }
    return true;
}
exports.boardEqual = boardEqual;

//# sourceMappingURL=board.js.map

// SIG // Begin signature block
// SIG // MIInpwYJKoZIhvcNAQcCoIInmDCCJ5QCAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // pNm5JCUCP4kdvBR3jLRPvt09Ji/h9L1NNtMZcTqZCDSg
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
// SIG // SEXAQsmbdlsKgEhr/Xmfwb1tbWrJUnMTDXpQzTGCGX4w
// SIG // ghl6AgEBMIGVMH4xCzAJBgNVBAYTAlVTMRMwEQYDVQQI
// SIG // EwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4w
// SIG // HAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xKDAm
// SIG // BgNVBAMTH01pY3Jvc29mdCBDb2RlIFNpZ25pbmcgUENB
// SIG // IDIwMTECEzMAAAJSizOq+JXzOdsAAAAAAlIwDQYJYIZI
// SIG // AWUDBAIBBQCgga4wGQYJKoZIhvcNAQkDMQwGCisGAQQB
// SIG // gjcCAQQwHAYKKwYBBAGCNwIBCzEOMAwGCisGAQQBgjcC
// SIG // ARUwLwYJKoZIhvcNAQkEMSIEIN210fGVr04rp9wu9+70
// SIG // cfygoZ0zudrGioOrw79gd7+XMEIGCisGAQQBgjcCAQwx
// SIG // NDAyoBSAEgBNAGkAYwByAG8AcwBvAGYAdKEagBhodHRw
// SIG // Oi8vd3d3Lm1pY3Jvc29mdC5jb20wDQYJKoZIhvcNAQEB
// SIG // BQAEggEAQ9lI9N6eOpuZwnYi76WRwR9d3S43cvYRad4S
// SIG // l1wH9VHV13hKdS02VbCtCXqCe2QeuIUfw2fN3z7XEdbW
// SIG // 4S5QAc53pF0awFZTDvB5VUUKugybUwqhKtB0/rYo3ICS
// SIG // HqNAgajUpAah6oBTypdHtB6+PLpZuUP24NH47FGj5N6o
// SIG // +Ua6Xalrc2Dvas46qOTVwHomLmxbyYO8sF8bXFF1YjyR
// SIG // JiWsaQF7hsRtNrSne09K/M04790AQZDwMJzZPlkJQu2X
// SIG // 7lvYsPsTxa5nWPF7YvcM8EoT76MhoU7zSCe1VO5K5LSp
// SIG // lyDFMi7Sm15u20zAViPrbS6oTRcHOvVaBYHTrZFxQqGC
// SIG // FwgwghcEBgorBgEEAYI3AwMBMYIW9DCCFvAGCSqGSIb3
// SIG // DQEHAqCCFuEwghbdAgEDMQ8wDQYJYIZIAWUDBAIBBQAw
// SIG // ggFUBgsqhkiG9w0BCRABBKCCAUMEggE/MIIBOwIBAQYK
// SIG // KwYBBAGEWQoDATAxMA0GCWCGSAFlAwQCAQUABCCV7ukj
// SIG // ElRfiBy7bnWo/7RoDkhoLa16HBLM6mymq/siYwIGYmtH
// SIG // bAUjGBIyMDIyMDUwMzE5MDEwOC4xNFowBIACAfSggdSk
// SIG // gdEwgc4xCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNo
// SIG // aW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4wHAYDVQQK
// SIG // ExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xKTAnBgNVBAsT
// SIG // IE1pY3Jvc29mdCBPcGVyYXRpb25zIFB1ZXJ0byBSaWNv
// SIG // MSYwJAYDVQQLEx1UaGFsZXMgVFNTIEVTTjpGN0E2LUUy
// SIG // NTEtMTUwQTElMCMGA1UEAxMcTWljcm9zb2Z0IFRpbWUt
// SIG // U3RhbXAgU2VydmljZaCCEVwwggcQMIIE+KADAgECAhMz
// SIG // AAABpQDeCMRAB3FOAAEAAAGlMA0GCSqGSIb3DQEBCwUA
// SIG // MHwxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNoaW5n
// SIG // dG9uMRAwDgYDVQQHEwdSZWRtb25kMR4wHAYDVQQKExVN
// SIG // aWNyb3NvZnQgQ29ycG9yYXRpb24xJjAkBgNVBAMTHU1p
// SIG // Y3Jvc29mdCBUaW1lLVN0YW1wIFBDQSAyMDEwMB4XDTIy
// SIG // MDMwMjE4NTExOVoXDTIzMDUxMTE4NTExOVowgc4xCzAJ
// SIG // BgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAw
// SIG // DgYDVQQHEwdSZWRtb25kMR4wHAYDVQQKExVNaWNyb3Nv
// SIG // ZnQgQ29ycG9yYXRpb24xKTAnBgNVBAsTIE1pY3Jvc29m
// SIG // dCBPcGVyYXRpb25zIFB1ZXJ0byBSaWNvMSYwJAYDVQQL
// SIG // Ex1UaGFsZXMgVFNTIEVTTjpGN0E2LUUyNTEtMTUwQTEl
// SIG // MCMGA1UEAxMcTWljcm9zb2Z0IFRpbWUtU3RhbXAgU2Vy
// SIG // dmljZTCCAiIwDQYJKoZIhvcNAQEBBQADggIPADCCAgoC
// SIG // ggIBALqxhuggaki8wuoOMMd7rsEQnmAhtV8iU1Y0itsH
// SIG // q30TdCXJDmvZjaZ8yvOHYFVhTyD1b5JGJtwZjWz1fglC
// SIG // qsx5qBxP1Wx1CZnsQ1tiRsRWQc12VkETmkY8x46MgHsG
// SIG // yAmhPPpsgRnklGai7HqQFB31x/Qjkx7rbAlr6PblB4tO
// SIG // maR1nKxl4VIgstDwfneKaoEEw4iN/xTdztZjwyGiY5hN
// SIG // p6beetkcizgJFO3/yRHYh0gtk+bREhrmIgbarrrgbz7M
// SIG // snA7tlKvGcO9iHc6+2symrAVy3CzQ4IMNPFcTTx8wTZ+
// SIG // kpv6lFs1eG8xlfsu2NDWKshrMlKH2JpYzWAW1fCOD5ir
// SIG // XsE4LOvixZQvbneQE6+iGfIQwabj+fRdouAU2AiE+iaN
// SIG // sIDapdKab8WLxz6VPRbEL+M6MFkcsoiuKHHoshCp7Jhm
// SIG // Z9iM0yrEx2XebOha/XQ342KsRGs2h02gpX6wByyT8eD3
// SIG // MJVIxSRm4MLIilvWcpd9N3rooawbLU6gdk7goKWS69+w
// SIG // 2jtouXCEYt6IPfZq8ldi0L/CwYbtv7mbHmIZ9Oc0JEJc
// SIG // 6b9gcVDfoPiemMKcz15BLepyx7npQ2MiDKIscOqKhXuZ
// SIG // I+PZerNOHhi/vsy2/Fj9lB6kJrMYSfV0F2frvBSBXMB7
// SIG // xjv8pgqX5QXUe8nTxb4UfJ0cDAvBAgMBAAGjggE2MIIB
// SIG // MjAdBgNVHQ4EFgQUX6aPAwCXrq6tcO773FkXS2ipGt8w
// SIG // HwYDVR0jBBgwFoAUn6cVXQBeYl2D9OXSZacbUzUZ6XIw
// SIG // XwYDVR0fBFgwVjBUoFKgUIZOaHR0cDovL3d3dy5taWNy
// SIG // b3NvZnQuY29tL3BraW9wcy9jcmwvTWljcm9zb2Z0JTIw
// SIG // VGltZS1TdGFtcCUyMFBDQSUyMDIwMTAoMSkuY3JsMGwG
// SIG // CCsGAQUFBwEBBGAwXjBcBggrBgEFBQcwAoZQaHR0cDov
// SIG // L3d3dy5taWNyb3NvZnQuY29tL3BraW9wcy9jZXJ0cy9N
// SIG // aWNyb3NvZnQlMjBUaW1lLVN0YW1wJTIwUENBJTIwMjAx
// SIG // MCgxKS5jcnQwDAYDVR0TAQH/BAIwADATBgNVHSUEDDAK
// SIG // BggrBgEFBQcDCDANBgkqhkiG9w0BAQsFAAOCAgEAlpsL
// SIG // F+UwMKKER2p0WJno4G6GGGnfg3qjDdaHc5uvXYtG6KmH
// SIG // rqAf/YqHkmNotSr6ZEEnlGCJYR7W3uJ+5bpvj03wFqGe
// SIG // fvQsKIR2+q6TrzozvP4NsodWTT5SVp/C6TEDGuLC9mOQ
// SIG // KA4tyL40HTW7txb0cAdfgnyHFoI/BsZo/FaXezQ8hO4x
// SIG // UjhDpyNNeJ6WYvX5NC+Hv9nmTyzjqyEg/L2cXAOmxEWv
// SIG // fPAQ1lfxvrtUwG75jGeUaewkhwtzanCnP3l6YjwJFKB6
// SIG // n7/TXtrfik1xY1kgev1JwQ5aUdPxwSdDmGE4XTN2s6pP
// SIG // Oi8IO199Of6AEvh41eDxRz+11VUcpuGn7tJUeSTUSHsv
// SIG // zQ8ECOj5w77Mv55/F8hWu07egnG8SrWj5+TFxNPCpx/A
// SIG // FNvzz+odTRTZd4LWuomcMHUmLFiUGOAdetF6SofHG5Ec
// SIG // Fn0DTD1apBZzCP8xsGQcZgwVqo7ov23/uIJlMCLAyTYZ
// SIG // V9ITCP09ciUJbKBVCQNrGEnQ/XLFO9mysyyDRrvHhU5u
// SIG // GPdXz4Jt2/ZN7JQYRuVNSuCpNwoK0Jr1s6ciDvHEeLyi
// SIG // czxoIe9GH3SyfbHx6v/phI+iE3DWo1TCK75EL6pt6k5i
// SIG // 36/kn2uSVXdTH44ZVkh3/ihV3vEws78uGlvsiMcrKBgp
// SIG // o3HdcjDHiHoWsUf4GIwwggdxMIIFWaADAgECAhMzAAAA
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
// SIG // HVUzWLOhcGbyoYICzzCCAjgCAQEwgfyhgdSkgdEwgc4x
// SIG // CzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9u
// SIG // MRAwDgYDVQQHEwdSZWRtb25kMR4wHAYDVQQKExVNaWNy
// SIG // b3NvZnQgQ29ycG9yYXRpb24xKTAnBgNVBAsTIE1pY3Jv
// SIG // c29mdCBPcGVyYXRpb25zIFB1ZXJ0byBSaWNvMSYwJAYD
// SIG // VQQLEx1UaGFsZXMgVFNTIEVTTjpGN0E2LUUyNTEtMTUw
// SIG // QTElMCMGA1UEAxMcTWljcm9zb2Z0IFRpbWUtU3RhbXAg
// SIG // U2VydmljZaIjCgEBMAcGBSsOAwIaAxUAs8lw20WzmxDK
// SIG // iN1Lhh7mZWXutKiggYMwgYCkfjB8MQswCQYDVQQGEwJV
// SIG // UzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMH
// SIG // UmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBv
// SIG // cmF0aW9uMSYwJAYDVQQDEx1NaWNyb3NvZnQgVGltZS1T
// SIG // dGFtcCBQQ0EgMjAxMDANBgkqhkiG9w0BAQUFAAIFAOYb
// SIG // tIswIhgPMjAyMjA1MDMxODAyNTFaGA8yMDIyMDUwNDE4
// SIG // MDI1MVowdDA6BgorBgEEAYRZCgQBMSwwKjAKAgUA5hu0
// SIG // iwIBADAHAgEAAgIQuTAHAgEAAgISuzAKAgUA5h0GCwIB
// SIG // ADA2BgorBgEEAYRZCgQCMSgwJjAMBgorBgEEAYRZCgMC
// SIG // oAowCAIBAAIDB6EgoQowCAIBAAIDAYagMA0GCSqGSIb3
// SIG // DQEBBQUAA4GBADXgsVQgEscCrY6JS+adNZ0FG27lYkTc
// SIG // i4iss0YDMO8Ab3HtkdKZOKq8hx4p8J4A2tQecmn86ubk
// SIG // BNCuUUQy9ed5/w7C0gHvhWXH06qfVCkxiK8cZaV5SvJT
// SIG // krbqa+mYPpEvUsP41m16u0hcjJomCZTChbIJjhDRuFzL
// SIG // 7qLNjMYsMYIEDTCCBAkCAQEwgZMwfDELMAkGA1UEBhMC
// SIG // VVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcT
// SIG // B1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jw
// SIG // b3JhdGlvbjEmMCQGA1UEAxMdTWljcm9zb2Z0IFRpbWUt
// SIG // U3RhbXAgUENBIDIwMTACEzMAAAGlAN4IxEAHcU4AAQAA
// SIG // AaUwDQYJYIZIAWUDBAIBBQCgggFKMBoGCSqGSIb3DQEJ
// SIG // AzENBgsqhkiG9w0BCRABBDAvBgkqhkiG9w0BCQQxIgQg
// SIG // yUwJr6/xz+D3fytkr13edMYJqeUyW8U9ZLpXsHKpIfIw
// SIG // gfoGCyqGSIb3DQEJEAIvMYHqMIHnMIHkMIG9BCC4Cjhx
// SIG // fmYEsaCt2AU83Khh+6JHlyk3B70vfMHMlBLcXDCBmDCB
// SIG // gKR+MHwxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNo
// SIG // aW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4wHAYDVQQK
// SIG // ExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xJjAkBgNVBAMT
// SIG // HU1pY3Jvc29mdCBUaW1lLVN0YW1wIFBDQSAyMDEwAhMz
// SIG // AAABpQDeCMRAB3FOAAEAAAGlMCIEILFqydzbvzlKHSxZ
// SIG // EstFLq+j6JxD3VNbEm9oVc9FU0iAMA0GCSqGSIb3DQEB
// SIG // CwUABIICAK0X/ggDgC3URWddhcCGzGGey+MWnxnWyUNy
// SIG // PGOPxbxW/+8m2TPOf2AgcPDU2vxdnkGrz25KggKQHFPq
// SIG // 6AMlLahtNRyVcTcmNHwnjy2GF1Urxzmid0tKyFeJrZBr
// SIG // R6MtsrcPvSQ29e7KngXxbK3AxhFyeoK+IVTL88Vjkk3/
// SIG // kmKDszjzGYcrwKuSfkmxlCUq7FxR5AbxVzAui2v+qcyR
// SIG // 0a6nZUo13gRMTdZIbIBKJ0OH2kAXrISPBg1zU3gYQvB5
// SIG // M7wCf2AsR2LOzh+6facSH03MuJk78Tsz0Ki6MpdWMH1m
// SIG // ZDGdLsbdM9jDPe3BdBT9zRRZuXbL4byYaUcClm04VqfR
// SIG // 1hV2j24XtvoYRi7jjHyRnx07+/iDEMW/tQ3p3kmMKVUU
// SIG // L4KM4GLYh7hwkhzcmV2hdNHv9IlUK4ReBJL3F0nEYqoX
// SIG // RhnGfUxZRvrFxqzYQ81xJ3/SK+Oi+2GWVYPynDvTV+5u
// SIG // iNzQumtYVxBWUIID1Zxj+0PG5aoqRzaC5jDHlrLGq1Tg
// SIG // 2y2dqNI24qX1yR1pWP7Az+YiFt2nQ4Mz9CHJqZAJUvCW
// SIG // n9NPcI9NkVQxYTq3WabXOY2O9WgP+xKLEzmCPch+Jm0e
// SIG // FTP7edUGePBP2+gs07Ic6NX+naN/2yeaGO629UZKyfQD
// SIG // /Y8LpINxdD8InpSRGmGnP3fO7FR+cc5s
// SIG // End signature block
