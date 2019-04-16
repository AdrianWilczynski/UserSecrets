import * as vscode from 'vscode';
import { getUserSecretsIdElement, getIdFromElement, getPropertyGroupClosingTagLinePosition, insertUserSecretsIdElement } from './csproj';
import { shouldGenerate } from './prompt';
import { getSecretsPath, ensureSecretsExist } from './secretsJson';

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.commands.registerCommand('extension.manageUserSecrets', manageUserSecrets));
}

export function deactivate() { }

async function manageUserSecrets(uri: vscode.Uri | undefined) {
    const csprojUri = uri || getOpenCsprojUri();
    if (!csprojUri) {
        return;
    }

    const csproj = await vscode.workspace.openTextDocument(csprojUri);

    const element = getUserSecretsIdElement(csproj);
    let id: string | undefined;

    if (element) {
        id = getIdFromElement(element);
        if (!id) {
            vscode.window.showWarningMessage(
                "There is a UserSecretsId element in this .csproj file but it doesn't seem to contain a valid identifier.");
            return;
        }
    } else if (await shouldGenerate()) {
        const position = getPropertyGroupClosingTagLinePosition(csproj);
        if (!position) {
            vscode.window.showWarningMessage(
                'Unable to find a PropertyGroup element in this .csproj file.');
            return;
        }

        id = await insertUserSecretsIdElement(position, csproj);
    } else {
        return;
    }

    const secretsPath = getSecretsPath(id);
    if (!secretsPath) {
        vscode.window.showWarningMessage(
            'Unable to determine secrets.json file location.');
        return;
    }

    await ensureSecretsExist(secretsPath);

    const secretsJson = await vscode.workspace.openTextDocument(secretsPath);
    await vscode.window.showTextDocument(secretsJson);
}

function getOpenCsprojUri() {
    if (!vscode.window.activeTextEditor || !vscode.window.activeTextEditor.document.fileName.endsWith('.csproj')) {
        return;
    }
    return vscode.window.activeTextEditor.document.uri;
}