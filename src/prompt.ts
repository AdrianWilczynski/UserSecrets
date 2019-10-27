import * as vscode from 'vscode';
import { shouldAsk, dontAskAgain } from './config';

const answers = {
    yes: 'Yes',
    no: 'Not Now',
    dontAskAgain: "Yes, Don't Ask Me Again"
};

export async function shouldGenerate() {
    if (shouldAsk()) {
        const answer = await vscode.window.showWarningMessage(
            'Unable to find a "UserSecretsId" in this ".csproj" file. Do you want us to try to generate it?',
            answers.no, answers.dontAskAgain, answers.yes);

        if (!answer || answer === answers.no) {
            return false;
        } else if (answer === answers.dontAskAgain) {
            await dontAskAgain();
        }
    }

    return true;
}