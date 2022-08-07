"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExampleProvider = void 0;
const path = require("path");
const vscode = require("vscode");
const deviceContext_1 = require("../deviceContext");
class ExampleProvider {
    constructor(_exampleManager, _boardManager) {
        this._exampleManager = _exampleManager;
        this._boardManager = _boardManager;
        this._onDidChangeTreeData = new vscode.EventEmitter();
        // tslint:disable-next-line:member-ordering
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        this._exmaples = null;
        this._boardManager.onBoardTypeChanged(() => {
            this.loadData();
        });
    }
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        if (!this._exmaples) {
            this.loadData();
            return null;
        }
        if (!element) {
            return this.createExampleItemList(this._exmaples);
        }
        else {
            return this.createExampleItemList(element.getChildren());
        }
    }
    loadData() {
        this._exmaples = null;
        this._exampleManager.loadExamples().then((examples) => {
            this._exmaples = examples;
            this._onDidChangeTreeData.fire(null);
        });
    }
    createExampleItemList(examples) {
        const result = [];
        if (examples && examples.length) {
            examples.forEach((example) => {
                result.push(new ExampleItem(example));
            });
        }
        return result;
    }
}
exports.ExampleProvider = ExampleProvider;
class ExampleItem extends vscode.TreeItem {
    constructor(_example) {
        super(_example.name, _example.isLeaf ? vscode.TreeItemCollapsibleState.None : vscode.TreeItemCollapsibleState.Collapsed);
        this._example = _example;
        if (_example.isLeaf) {
            this.command = {
                title: "Open Example",
                command: "arduino.openExample",
                arguments: [_example.path],
            };
            this.iconPath = ExampleItem.getInoIcon();
        }
        else {
            this.iconPath = ExampleItem.getFolderIcon();
        }
    }
    static getFolderIcon() {
        if (!ExampleItem._folderIcon) {
            ExampleItem._folderIcon = {
                light: ExampleItem.getIconUri("Folder_16x.svg"),
                dark: ExampleItem.getIconUri("Folder_16x_inverse.svg"),
            };
        }
        return ExampleItem._folderIcon;
    }
    static getInoIcon() {
        if (!ExampleItem._inoIcon) {
            ExampleItem._inoIcon = ExampleItem.getIconUri("ino_16x.svg");
        }
        return ExampleItem._inoIcon;
    }
    static getIconUri(uriPath) {
        const dc = deviceContext_1.DeviceContext.getInstance();
        return vscode.Uri.file(path.join(dc.extensionPath, "images/examples", uriPath));
    }
    getChildren() {
        return this._example.children;
    }
}

//# sourceMappingURL=exampleProvider.js.map

// SIG // Begin signature block
// SIG // MIIntQYJKoZIhvcNAQcCoIInpjCCJ6ICAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // xDU/LVPjRLXHiAp2mJm5xcsIDfXpEc6XPlFAVP7FmD2g
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
// SIG // SEXAQsmbdlsKgEhr/Xmfwb1tbWrJUnMTDXpQzTGCGYww
// SIG // ghmIAgEBMIGVMH4xCzAJBgNVBAYTAlVTMRMwEQYDVQQI
// SIG // EwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4w
// SIG // HAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xKDAm
// SIG // BgNVBAMTH01pY3Jvc29mdCBDb2RlIFNpZ25pbmcgUENB
// SIG // IDIwMTECEzMAAAJSizOq+JXzOdsAAAAAAlIwDQYJYIZI
// SIG // AWUDBAIBBQCgga4wGQYJKoZIhvcNAQkDMQwGCisGAQQB
// SIG // gjcCAQQwHAYKKwYBBAGCNwIBCzEOMAwGCisGAQQBgjcC
// SIG // ARUwLwYJKoZIhvcNAQkEMSIEIF/C9m0Hc663ovGK2lfo
// SIG // rUU5GxZJIum2JTFqLvVlQQTiMEIGCisGAQQBgjcCAQwx
// SIG // NDAyoBSAEgBNAGkAYwByAG8AcwBvAGYAdKEagBhodHRw
// SIG // Oi8vd3d3Lm1pY3Jvc29mdC5jb20wDQYJKoZIhvcNAQEB
// SIG // BQAEggEAs9HdzfR12ZXrv1qW6Ou7EToYHW5fyROih5Z3
// SIG // 94s4k23VOfE0Si9zQ6X91ICfOsTywbBp29yj8Ha4IZ85
// SIG // aJMl2TFDCZzmm2O+2nqrlfonSE02RDq44/+ltsdV5FZo
// SIG // kqXtklN15weONT43Pf6GDT0G75/LRHXR32Ro3RTdugDw
// SIG // 8lfr28p3FK1ikALY4KwSF7lB3k1rvNB7qwbMJsltOBMd
// SIG // 8c1u0whTft2hxB5gRLG5D2jlxYCOMzdSn9fEQMbzZ7fu
// SIG // hFSlumbBvSwtcwAoKeAHu0a9z00uB4B9FYrqu8zh2i/E
// SIG // mS4xxLR6qEq9cmKovTjd554sPROPkFJxnuX9288s+aGC
// SIG // FxYwghcSBgorBgEEAYI3AwMBMYIXAjCCFv4GCSqGSIb3
// SIG // DQEHAqCCFu8wghbrAgEDMQ8wDQYJYIZIAWUDBAIBBQAw
// SIG // ggFZBgsqhkiG9w0BCRABBKCCAUgEggFEMIIBQAIBAQYK
// SIG // KwYBBAGEWQoDATAxMA0GCWCGSAFlAwQCAQUABCChjdFR
// SIG // UCWsA9jB2TrZ9udvPo5Kd9lKUwHOJYE9fjl9vQIGYmxK
// SIG // ouzLGBMyMDIyMDUwMzE5MDEwOC40ODdaMASAAgH0oIHY
// SIG // pIHVMIHSMQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2Fz
// SIG // aGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UE
// SIG // ChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMS0wKwYDVQQL
// SIG // EyRNaWNyb3NvZnQgSXJlbGFuZCBPcGVyYXRpb25zIExp
// SIG // bWl0ZWQxJjAkBgNVBAsTHVRoYWxlcyBUU1MgRVNOOjE3
// SIG // OUUtNEJCMC04MjQ2MSUwIwYDVQQDExxNaWNyb3NvZnQg
// SIG // VGltZS1TdGFtcCBTZXJ2aWNloIIRZTCCBxQwggT8oAMC
// SIG // AQICEzMAAAGKPjiN0g4C+ugAAQAAAYowDQYJKoZIhvcN
// SIG // AQELBQAwfDELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldh
// SIG // c2hpbmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNV
// SIG // BAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjEmMCQGA1UE
// SIG // AxMdTWljcm9zb2Z0IFRpbWUtU3RhbXAgUENBIDIwMTAw
// SIG // HhcNMjExMDI4MTkyNzQyWhcNMjMwMTI2MTkyNzQyWjCB
// SIG // 0jELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0
// SIG // b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1p
// SIG // Y3Jvc29mdCBDb3Jwb3JhdGlvbjEtMCsGA1UECxMkTWlj
// SIG // cm9zb2Z0IElyZWxhbmQgT3BlcmF0aW9ucyBMaW1pdGVk
// SIG // MSYwJAYDVQQLEx1UaGFsZXMgVFNTIEVTTjoxNzlFLTRC
// SIG // QjAtODI0NjElMCMGA1UEAxMcTWljcm9zb2Z0IFRpbWUt
// SIG // U3RhbXAgU2VydmljZTCCAiIwDQYJKoZIhvcNAQEBBQAD
// SIG // ggIPADCCAgoCggIBALf/rrehgwMgGb3oAYWoFndBqKk/
// SIG // JRRzHqaFjTizzxBKC7smuF95/iteBb5WcBZisKmqegfu
// SIG // hJCE0o5HnE0gekEQOJIr3ScnZS7yq4PLnbQbuuyyso0K
// SIG // sEcw0E0YRAsaVN9LXQRPwHsj/eZO6p3YSLvzqU+EBshi
// SIG // VIjA5ZmQIgz2ORSZIrVIBr8DAR8KICc/BVRARZ1YgFEU
// SIG // yeJAQ4lOqaW7+DyPe/r0IabKQyvvN4GsmokQt4DUxst4
// SIG // jonuj7JdN3L2CIhXACUT+DtEZHhZb/0kKKJs9ybbDHfa
// SIG // KEv1ztL0jfYdg1SjjTI2hToJzeUZOYgqsJp+qrJnvoWq
// SIG // Ef06wgUtM1417Fk4JJY1Abbde1AW1vES/vSzcN3IzyfB
// SIG // GEYJTDVwmCzOhswg1xLxPU//7AL/pNXPOLZqImQ2QagY
// SIG // K/0ry/oFbDs9xKA2UNuqk2tWxJ/56cTJl3LaGUnvEkQ6
// SIG // oCtCVFoYyl4J8mjgAxAfhbXyIvo3XFCW6T7QC+JFr1Uk
// SIG // SoqVb/DBLmES3sVxAxAYvleLXygKWYROIGtKfkAomsBy
// SIG // wWTaI91EDczOUFZhmotzJ0BW2ZIam1A8qaPb2lhHlXjt
// SIG // +SX3S1o8EYLzF91SmS+e3e45kY4lZZbl42RS8fq4SS+y
// SIG // WFabTj7RdTALTGJaejroJzqRvuFuDBh6o+2GHz9FAgMB
// SIG // AAGjggE2MIIBMjAdBgNVHQ4EFgQUI9pD2P1sGdSXrqdJ
// SIG // R4Q+MZBpJAMwHwYDVR0jBBgwFoAUn6cVXQBeYl2D9OXS
// SIG // ZacbUzUZ6XIwXwYDVR0fBFgwVjBUoFKgUIZOaHR0cDov
// SIG // L3d3dy5taWNyb3NvZnQuY29tL3BraW9wcy9jcmwvTWlj
// SIG // cm9zb2Z0JTIwVGltZS1TdGFtcCUyMFBDQSUyMDIwMTAo
// SIG // MSkuY3JsMGwGCCsGAQUFBwEBBGAwXjBcBggrBgEFBQcw
// SIG // AoZQaHR0cDovL3d3dy5taWNyb3NvZnQuY29tL3BraW9w
// SIG // cy9jZXJ0cy9NaWNyb3NvZnQlMjBUaW1lLVN0YW1wJTIw
// SIG // UENBJTIwMjAxMCgxKS5jcnQwDAYDVR0TAQH/BAIwADAT
// SIG // BgNVHSUEDDAKBggrBgEFBQcDCDANBgkqhkiG9w0BAQsF
// SIG // AAOCAgEAxfTBErD1w3kbXxaNX+e+Yj3xfQEVm3rrjXzO
// SIG // fNyH08X82X9nb/5ntwzYvynDTRJ0dUym2bRuy7INHMv6
// SIG // SiBEDiRtn2GlsCCCmMLsgySNkOJFYuZs21f9Aufr0ELE
// SIG // HAr37DPCuV9n34nyYu7anhtK+fAo4MHu8QWL4Lj5o1Dc
// SIG // cE1rxI2SD36Y1VKGjwpeqqrNHhVG+23C4c0xBGAZwI/D
// SIG // BDYYj+SCXeD6eZRah07aXnOu2BZhrjv7iAP04zwX3LTO
// SIG // ZFCPrs38of8iHbQzbZCM/nv8Zl0hYYkBEdLgY0aG0GVe
// SIG // nPtEzbb0TS2slOLuxHpHezmg180EdEblhmkosLTel3Pz
// SIG // 6DT9K3sxujr3MqMNajKFJFBEO6qg9EKvEBcCtAygnWUi
// SIG // bcgSjAaY1GApzVGW2L001puA1yuUWIH9t21QSVuF6OcO
// SIG // PdBx6OE41jas9ez6j8jAk5zPB3AKk5z3jBNHT2L23cMw
// SIG // zIG7psnWyWqv9OhSJpCeyl7PY8ag4hNj03mJ2o/Np+kP
// SIG // /z6mx7scSZsEDuH83ToFagBJBtVw5qaVSlv6ycQTdyMc
// SIG // la+kD/XIWNjGFWtG2wAiNnb1PkdkCZROQI6DCsuvFiNa
// SIG // ZhU9ySga62nKcuh1Ixq7Vfv9VOdm66xJQpVcuRW/PlGV
// SIG // mS6fNnLgs7STDEqlvpD+c8lQUryzPuAwggdxMIIFWaAD
// SIG // AgECAhMzAAAAFcXna54Cm0mZAAAAAAAVMA0GCSqGSIb3
// SIG // DQEBCwUAMIGIMQswCQYDVQQGEwJVUzETMBEGA1UECBMK
// SIG // V2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwG
// SIG // A1UEChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMTIwMAYD
// SIG // VQQDEylNaWNyb3NvZnQgUm9vdCBDZXJ0aWZpY2F0ZSBB
// SIG // dXRob3JpdHkgMjAxMDAeFw0yMTA5MzAxODIyMjVaFw0z
// SIG // MDA5MzAxODMyMjVaMHwxCzAJBgNVBAYTAlVTMRMwEQYD
// SIG // VQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25k
// SIG // MR4wHAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24x
// SIG // JjAkBgNVBAMTHU1pY3Jvc29mdCBUaW1lLVN0YW1wIFBD
// SIG // QSAyMDEwMIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIIC
// SIG // CgKCAgEA5OGmTOe0ciELeaLL1yR5vQ7VgtP97pwHB9Kp
// SIG // bE51yMo1V/YBf2xK4OK9uT4XYDP/XE/HZveVU3Fa4n5K
// SIG // Wv64NmeFRiMMtY0Tz3cywBAY6GB9alKDRLemjkZrBxTz
// SIG // xXb1hlDcwUTIcVxRMTegCjhuje3XD9gmU3w5YQJ6xKr9
// SIG // cmmvHaus9ja+NSZk2pg7uhp7M62AW36MEBydUv626GIl
// SIG // 3GoPz130/o5Tz9bshVZN7928jaTjkY+yOSxRnOlwaQ3K
// SIG // Ni1wjjHINSi947SHJMPgyY9+tVSP3PoFVZhtaDuaRr3t
// SIG // pK56KTesy+uDRedGbsoy1cCGMFxPLOJiss254o2I5Jas
// SIG // AUq7vnGpF1tnYN74kpEeHT39IM9zfUGaRnXNxF803RKJ
// SIG // 1v2lIH1+/NmeRd+2ci/bfV+AutuqfjbsNkz2K26oElHo
// SIG // vwUDo9Fzpk03dJQcNIIP8BDyt0cY7afomXw/TNuvXsLz
// SIG // 1dhzPUNOwTM5TI4CvEJoLhDqhFFG4tG9ahhaYQFzymei
// SIG // XtcodgLiMxhy16cg8ML6EgrXY28MyTZki1ugpoMhXV8w
// SIG // dJGUlNi5UPkLiWHzNgY1GIRH29wb0f2y1BzFa/ZcUlFd
// SIG // Etsluq9QBXpsxREdcu+N+VLEhReTwDwV2xo3xwgVGD94
// SIG // q0W29R6HXtqPnhZyacaue7e3PmriLq0CAwEAAaOCAd0w
// SIG // ggHZMBIGCSsGAQQBgjcVAQQFAgMBAAEwIwYJKwYBBAGC
// SIG // NxUCBBYEFCqnUv5kxJq+gpE8RjUpzxD/LwTuMB0GA1Ud
// SIG // DgQWBBSfpxVdAF5iXYP05dJlpxtTNRnpcjBcBgNVHSAE
// SIG // VTBTMFEGDCsGAQQBgjdMg30BATBBMD8GCCsGAQUFBwIB
// SIG // FjNodHRwOi8vd3d3Lm1pY3Jvc29mdC5jb20vcGtpb3Bz
// SIG // L0RvY3MvUmVwb3NpdG9yeS5odG0wEwYDVR0lBAwwCgYI
// SIG // KwYBBQUHAwgwGQYJKwYBBAGCNxQCBAweCgBTAHUAYgBD
// SIG // AEEwCwYDVR0PBAQDAgGGMA8GA1UdEwEB/wQFMAMBAf8w
// SIG // HwYDVR0jBBgwFoAU1fZWy4/oolxiaNE9lJBb186aGMQw
// SIG // VgYDVR0fBE8wTTBLoEmgR4ZFaHR0cDovL2NybC5taWNy
// SIG // b3NvZnQuY29tL3BraS9jcmwvcHJvZHVjdHMvTWljUm9v
// SIG // Q2VyQXV0XzIwMTAtMDYtMjMuY3JsMFoGCCsGAQUFBwEB
// SIG // BE4wTDBKBggrBgEFBQcwAoY+aHR0cDovL3d3dy5taWNy
// SIG // b3NvZnQuY29tL3BraS9jZXJ0cy9NaWNSb29DZXJBdXRf
// SIG // MjAxMC0wNi0yMy5jcnQwDQYJKoZIhvcNAQELBQADggIB
// SIG // AJ1VffwqreEsH2cBMSRb4Z5yS/ypb+pcFLY+TkdkeLEG
// SIG // k5c9MTO1OdfCcTY/2mRsfNB1OW27DzHkwo/7bNGhlBgi
// SIG // 7ulmZzpTTd2YurYeeNg2LpypglYAA7AFvonoaeC6Ce57
// SIG // 32pvvinLbtg/SHUB2RjebYIM9W0jVOR4U3UkV7ndn/OO
// SIG // PcbzaN9l9qRWqveVtihVJ9AkvUCgvxm2EhIRXT0n4ECW
// SIG // OKz3+SmJw7wXsFSFQrP8DJ6LGYnn8AtqgcKBGUIZUnWK
// SIG // NsIdw2FzLixre24/LAl4FOmRsqlb30mjdAy87JGA0j3m
// SIG // Sj5mO0+7hvoyGtmW9I/2kQH2zsZ0/fZMcm8Qq3UwxTSw
// SIG // ethQ/gpY3UA8x1RtnWN0SCyxTkctwRQEcb9k+SS+c23K
// SIG // jgm9swFXSVRk2XPXfx5bRAGOWhmRaw2fpCjcZxkoJLo4
// SIG // S5pu+yFUa2pFEUep8beuyOiJXk+d0tBMdrVXVAmxaQFE
// SIG // fnyhYWxz/gq77EFmPWn9y8FBSX5+k77L+DvktxW/tM4+
// SIG // pTFRhLy/AsGConsXHRWJjXD+57XQKBqJC4822rpM+Zv/
// SIG // Cuk0+CQ1ZyvgDbjmjJnW4SLq8CdCPSWU5nR0W2rRnj7t
// SIG // fqAxM328y+l7vzhwRNGQ8cirOoo6CGJ/2XBjU02N7oJt
// SIG // pQUQwXEGahC0HVUzWLOhcGbyoYIC1DCCAj0CAQEwggEA
// SIG // oYHYpIHVMIHSMQswCQYDVQQGEwJVUzETMBEGA1UECBMK
// SIG // V2FzaGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwG
// SIG // A1UEChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMS0wKwYD
// SIG // VQQLEyRNaWNyb3NvZnQgSXJlbGFuZCBPcGVyYXRpb25z
// SIG // IExpbWl0ZWQxJjAkBgNVBAsTHVRoYWxlcyBUU1MgRVNO
// SIG // OjE3OUUtNEJCMC04MjQ2MSUwIwYDVQQDExxNaWNyb3Nv
// SIG // ZnQgVGltZS1TdGFtcCBTZXJ2aWNloiMKAQEwBwYFKw4D
// SIG // AhoDFQCA8PNjrxtTBQQdp/+MHlaqc1fEoaCBgzCBgKR+
// SIG // MHwxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNoaW5n
// SIG // dG9uMRAwDgYDVQQHEwdSZWRtb25kMR4wHAYDVQQKExVN
// SIG // aWNyb3NvZnQgQ29ycG9yYXRpb24xJjAkBgNVBAMTHU1p
// SIG // Y3Jvc29mdCBUaW1lLVN0YW1wIFBDQSAyMDEwMA0GCSqG
// SIG // SIb3DQEBBQUAAgUA5htmMDAiGA8yMDIyMDUwMzE2Mjgz
// SIG // MloYDzIwMjIwNTA0MTYyODMyWjB0MDoGCisGAQQBhFkK
// SIG // BAExLDAqMAoCBQDmG2YwAgEAMAcCAQACAhXdMAcCAQAC
// SIG // AhJOMAoCBQDmHLewAgEAMDYGCisGAQQBhFkKBAIxKDAm
// SIG // MAwGCisGAQQBhFkKAwKgCjAIAgEAAgMHoSChCjAIAgEA
// SIG // AgMBhqAwDQYJKoZIhvcNAQEFBQADgYEAIFmnscVxLQuB
// SIG // /2TrOu3u+BXpDXskxn+dfGoOmvDlCy4bMdrsuM5xpMRb
// SIG // H4A+8v5hWvoI6WxlPia4i0sMGkp48IXeIY7dGbIhCj7m
// SIG // Bh86zHbQ+0lCPrOHihTYUB9EV9Qa9bweibyqIeEYU5yi
// SIG // X60WVzFe0C+FQb9oJNMeJ93MziwxggQNMIIECQIBATCB
// SIG // kzB8MQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGlu
// SIG // Z3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMV
// SIG // TWljcm9zb2Z0IENvcnBvcmF0aW9uMSYwJAYDVQQDEx1N
// SIG // aWNyb3NvZnQgVGltZS1TdGFtcCBQQ0EgMjAxMAITMwAA
// SIG // AYo+OI3SDgL66AABAAABijANBglghkgBZQMEAgEFAKCC
// SIG // AUowGgYJKoZIhvcNAQkDMQ0GCyqGSIb3DQEJEAEEMC8G
// SIG // CSqGSIb3DQEJBDEiBCBQyKuAHlMequ9gZOpyyUQnLmBf
// SIG // EJTr2A3eNz+FVmsnQjCB+gYLKoZIhvcNAQkQAi8xgeow
// SIG // gecwgeQwgb0EIPS94Kt130q+fvO/fzD4MbWQhQaE7RHk
// SIG // OH6AkjlNVCm9MIGYMIGApH4wfDELMAkGA1UEBhMCVVMx
// SIG // EzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1Jl
// SIG // ZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3Jh
// SIG // dGlvbjEmMCQGA1UEAxMdTWljcm9zb2Z0IFRpbWUtU3Rh
// SIG // bXAgUENBIDIwMTACEzMAAAGKPjiN0g4C+ugAAQAAAYow
// SIG // IgQg7vGIUmSyuLP25ViEAT3uTVRqbBQY2YiCcat3QcNH
// SIG // 5JwwDQYJKoZIhvcNAQELBQAEggIAf5JqGmz/9fyd+dDL
// SIG // yRDGOAa/MIOwAIW3voJQ8azLb1XAdYAEHQMvFnRhwy4K
// SIG // RVB0FG6PdYKVU+Psu9DPOHnrYDgYMlbgv5En9IeRA+fF
// SIG // ntW+PSfR6fT8uxtszE4wYnH7oLOxGkjrZz41BCjsVMiU
// SIG // APThOJwJsWteG8sa2QVqMr2bvdp+5SpWekUwEehmEPLS
// SIG // 3MEO4jy52FTIxIq7LMUByaBYPmIsCBe9OU8bW9F9VQ2Y
// SIG // 7oO4+/ToIwJrLtNXLPDJU9MCedbbUz0eeex1zQdad86F
// SIG // WPk/hlUwLCUEWAFKpl5bgaFqVqlB/rSp3RE6Q0N4cdTh
// SIG // tjZ8Vhp24mFav6HyrPkZXh/l1mlqob8LpLzlqMX1sD1k
// SIG // RTI85GMSN+sV5WdWzeSKoVB1Kfod1cI8yzfIvy4A9ZNA
// SIG // kVXjNzto5POcXIjw4oMgVQBbziEi5HuG8ylTuIE/Xktn
// SIG // lXNrCGyTd8nfOnuR0EeeSi6jOJi33zTmlnMOh4eh/a5n
// SIG // FKB08mYI5NLq89+gTddd7LblFVt6oyH4+Vbj1U1311Hu
// SIG // Jk5XGhYgccOJ2yo7KLfPC9PgIxSNjvFuBDjomPaLv+Ac
// SIG // Pk9dttdVFciJgn2vYQwlU9NuKH+bXcHpnkN4wgHRjIhT
// SIG // TJ/YO3s2bjATkKm8nIKJ+60dvWhYn0k8dBjFVB3LUDpl
// SIG // t40BiB4=
// SIG // End signature block
