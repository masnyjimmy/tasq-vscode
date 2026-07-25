import * as path from "path";
import { workspace, ExtensionContext, commands, window } from "vscode";

import {
    LanguageClient,
    LanguageClientOptions,
    ServerOptions,
    State,
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

    const stopCommand = commands.registerCommand("tasq.stopLanguageServer", async () => {
        if(!client) {
            window.showInformationMessage('Language client is not initialized.');
            return;
        }

        if(client.state == State.Running) {
            try {
                await client.stop();
                window.showInformationMessage('Language client stop succesfully');
            } catch(error) {
                window.showErrorMessage(`Failed to stop language server: ${error}`);
            }
        } else {
            window.showInformationMessage('Language server is not running');
        }
    });

    context.subscriptions.push(stopCommand);

    await client.start();
}

export async function deactivate() {
    await client?.dispose();
    client = undefined;
}