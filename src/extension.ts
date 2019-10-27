import * as vscode from 'vscode';
import { getUserSecretsId, insertUserSecretsId } from './csproj';
import { shouldGenerate } from './prompt';
import { getSecretsPath, ensureSecretsExist } from './secretsJson';

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.commands.registerCommand('extension.manageUserSecrets', manageUserSecrets));
}

export function deactivate() { }

async function manageUserSecrets(uri: vscode.Uri | undefined) {
    try {
        const csprojUri = uri || getOpenCsprojUri();
        if (!csprojUri) {
            return;
        }

        const csproj = await vscode.workspace.openTextDocument(csprojUri);

        let id = await getUserSecretsId(csproj);

        if (!id && await shouldGenerate()) {
            id = await insertUserSecretsId(csproj);
        }

        if (!id) {
            return;
        }

        const secretsPath = getSecretsPath(id);
        if (!secretsPath) {
            vscode.window.showWarningMessage('Unable to determine "secrets.json" file location.');
            return;
        }

        await ensureSecretsExist(secretsPath);

        const secretsJson = await vscode.workspace.openTextDocument(secretsPath);
        await vscode.window.showTextDocument(secretsJson);
    } catch (error) {
        if (error instanceof Error && error.message) {
            vscode.window.showErrorMessage(error.message);
        }
    }
}

function getOpenCsprojUri() {
    if (!vscode.window.activeTextEditor || !vscode.window.activeTextEditor.document.fileName.endsWith('.csproj')) {
        return;
    }

    return vscode.window.activeTextEditor.document.uri;
}