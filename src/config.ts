import * as vscode from 'vscode';

const configSection = 'userSecrets.ask';

export function shouldAsk() {
    const config = vscode.workspace.getConfiguration()
        .get(configSection);

    if (config === undefined) {
        return true;
    }

    return !!config;
}

export async function dontAskAgain() {
    await vscode.workspace.getConfiguration()
        .update(configSection, false, vscode.ConfigurationTarget.Global);
}