import * as vscode from 'vscode';
import * as os from 'os';
import { v4 as uuid } from 'uuid';
import * as xml2js from 'xml2js';

const elements = {
    Project: 'Project',
    PropertyGroup: 'PropertyGroup',
    UserSecretsId: 'UserSecretsId'
};

export async function getUserSecretsId(csproj: vscode.TextDocument): Promise<string | undefined> {
    const content = csproj.getText();
    const parsed = await xml2js.parseStringPromise(content);

    const id = parsed &&
        parsed[elements.Project] &&
        parsed[elements.Project][elements.PropertyGroup] &&
        parsed[elements.Project][elements.PropertyGroup][0] &&
        parsed[elements.Project][elements.PropertyGroup][0][elements.UserSecretsId] &&
        parsed[elements.Project][elements.PropertyGroup][0][elements.UserSecretsId][0];

    return !!id || typeof id !== 'string' ? id : undefined;
}

export async function insertUserSecretsId(csproj: vscode.TextDocument) {
    const id = uuid();

    const content = csproj.getText();
    let parsed = await xml2js.parseStringPromise(content);

    if (!parsed) {
        parsed = {};
    }

    if (!parsed[elements.Project] || typeof parsed[elements.Project] !== 'object') {
        parsed[elements.Project] = {};
    }

    if (!parsed[elements.Project][elements.PropertyGroup]) {
        parsed[elements.Project][elements.PropertyGroup] = [];
    }

    if (!parsed[elements.Project][elements.PropertyGroup][0]
        || typeof parsed[elements.Project][elements.PropertyGroup][0] !== 'object') {
        parsed[elements.Project][elements.PropertyGroup][0] = {};
    }

    if (!parsed[elements.Project][elements.PropertyGroup][0][elements.UserSecretsId]) {
        parsed[elements.Project][elements.PropertyGroup][0][elements.UserSecretsId] = [];
    }

    if (!parsed[elements.Project][elements.PropertyGroup][0][elements.UserSecretsId][0]
        || typeof !parsed[elements.Project][elements.PropertyGroup][0][elements.UserSecretsId][0] !== 'string') {
        parsed[elements.Project][elements.PropertyGroup][0][elements.UserSecretsId][0] = id;
    }

    const updatedContent = new xml2js.Builder({ headless: true }).buildObject(parsed)
        .replace(/&#xD;/g, '\r')
        .replace(/^  <(?=\w)/gm, os.EOL + '  <')
        .replace(/(?=<\/Project>$)/, os.EOL);

    const fullRange = new vscode.Range(
        0, 0,
        csproj.lineCount - 1, csproj.lineAt(csproj.lineCount - 1).range.end.character);

    const edit = new vscode.WorkspaceEdit();
    edit.replace(csproj.uri, fullRange, updatedContent);

    await vscode.workspace.applyEdit(edit);
    await csproj.save();

    return id;
}