# Change Log

## 1.0.16 - 2022-08-02
- Hotfix for extension crashing the extension hot

## 1.0.15 - 2022-07-20
- Fix for blingfire crashes and requests timing out
- Added resiliency when worker threads crash

## 1.0.14 - 2022-06-28
- Updating vscode extension telemetry package
- Removing duplicate telemetry sent

## 1.0.13 - 2022-06-21
- Updating extension to use VS Code finalized InlineCompletion API 
- Improved error handling and logging in worker thread

## 1.0.12 - 2022-05-05
- Updating minimist version

## 1.0.11 - 2022-04-13 

- Updating to temporary VS Code proposed API while their migration is taking place
- This change only impacts version 1.67 i.e. VS Code Insiders
- Most of the changes made in this version will be changed again when 1.67 is ready to be moved to VS Code Stable.

## 1.0.10 - 2022-04-12

- In workbook documents, use code context from preceding cells
- Update outdated dependencies
- Simplify extension name

## 1.0.8 - 2022-02-15

- Refinements to parse error completion filtering
    - Disallow completions containing Python 2.x-style print statements
    - Allow completions which open blocks without closing them
- Remove superfluous settings which caused problems with completion insertion in some situations
