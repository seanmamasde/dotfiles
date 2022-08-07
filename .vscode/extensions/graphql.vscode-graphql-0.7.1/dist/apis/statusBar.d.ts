import { StatusBarItem, TextEditor } from 'vscode';
import { LanguageClient } from 'vscode-languageclient/node';
export declare const createStatusBar: () => StatusBarItem;
export declare function initStatusBar(statusBarItem: StatusBarItem, client: LanguageClient, editor: TextEditor | undefined): void;
//# sourceMappingURL=statusBar.d.ts.map