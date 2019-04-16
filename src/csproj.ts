import * as vscode from 'vscode';
import * as os from 'os';
import { v4 as uuid } from 'uuid';

export function getUserSecretsIdElement(csproj: vscode.TextDocument) {
    return getWithRegex(csproj.getText(), /<UserSecretsId>.*<\/UserSecretsId>/, 0);
}

export function getIdFromElement(element: string) {
    return getWithRegex(element, /<UserSecretsId>([\w.-]+)<\/UserSecretsId>/, 1);
}

function getWithRegex(text: string, pattern: RegExp, group: number) {
    const matches = text.match(pattern);
    if (!matches) {
        return;
    }

    return matches[group];
}

export async function insertUserSecretsIdElement(position: vscode.Position, csproj: vscode.TextDocument) {
    const id = uuid();
    let generatedElement;

    const linePrefix = getLinePrefix(csproj, position);
    if (isEmptyOrWhitespace(linePrefix)) {
        generatedElement = generateUserUserSecretsIdElement(id, false, linePrefix);
    } else {
        generatedElement = generateUserUserSecretsIdElement(id, true);
    }

    const edit = new vscode.WorkspaceEdit();
    edit.insert(csproj.uri, position, generatedElement);

    await vscode.workspace.applyEdit(edit);
    await csproj.save();

    return id;
}

function getLinePrefix(document: vscode.TextDocument, position: vscode.Position) {
    return document.lineAt(position).text.substr(0, position.character);
}

function isEmptyOrWhitespace(text: string) {
    return /^[ \t]*$/.test(text);
}

function generateUserUserSecretsIdElement(id: string, inline = false, indentation = '  ') {
    if (inline) {
        return `<UserSecretsId>${id}</UserSecretsId>`;
    } else {
        return `${indentation}<UserSecretsId>${id}</UserSecretsId>${os.EOL}${indentation}`;
    }
}

export function getPropertyGroupClosingTagLinePosition(csproj: vscode.TextDocument) {
    for (let index = 0; index < csproj.lineCount; index++) {
        const line = csproj.lineAt(index);

        if (/<\/PropertyGroup>/.test(line.text)) {
            return new vscode.Position(index, line.text.indexOf('</PropertyGroup>'));
        }
    }

    return;
}