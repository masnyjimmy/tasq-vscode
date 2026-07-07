import * as path from "path";
import { workspace, ExtensionContext } from "vscode";

import {
    LanguageClient,
    LanguageClientOptions,
    ServerOptions,
    TransportKind,
} from 'vscode-languageclient/node';

let client: LanguageClient | undefined;

export async function activate(context: ExtensionContext) {
    let serverModule = context.asAbsolutePath(path.join('..', 'tsq', 'zig-out', 'bin', 'tasq.exe'));

    let serverOptions: ServerOptions = {
        run: { command: serverModule, args: ['--lsp'], transport: TransportKind.stdio },
        debug: {
            command: serverModule,
            args: ['--lsp'],
            transport: TransportKind.stdio,
        },
    };

    let clientOptions: LanguageClientOptions = {
        documentSelector: [
            { scheme: 'file', language: 'tasq' },
        ],
        synchronize: {
            fileEvents: workspace.createFileSystemWatcher('**/tasq'),
        },
    };

    client = new LanguageClient("tasq-lsp", serverOptions, clientOptions);

    await client.start();
}

export async function deactivate() {
    await client?.dispose();
    client = undefined;
}