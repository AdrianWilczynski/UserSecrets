import * as vscode from 'vscode';

export async function override(document: vscode.TextDocument, content: string) {
    const edit = new vscode.WorkspaceEdit();
    edit.replace(document.uri, fullRange(document), content);

    await vscode.workspace.applyEdit(edit);
    await document.save();
}

function fullRange(document: vscode.TextDocument) {
    return new vscode.Range(
        0, 0,
        document.lineCount - 1, document.lineAt(document.lineCount - 1).range.end.character);
}