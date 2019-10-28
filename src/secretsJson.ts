import * as os from 'os';
import * as path from 'path';
import * as fse from 'fs-extra';

export function getSecretsPath(id: string) {
    const platform = os.platform();

    if (platform === 'win32') {
        return path.join(os.homedir(), 'AppData', 'Roaming', 'Microsoft', 'UserSecrets', id, 'secrets.json');
    } else if (platform === 'linux' || platform === 'darwin') {
        return path.join(os.homedir(), '.microsoft', 'usersecrets', id, 'secrets.json');
    } else {
        return;
    }
}

export async function ensureSecretsExist(secretsPath: string) {
    if (!fse.existsSync(secretsPath)) {
        await fse.outputFile(secretsPath, getEmptyJsonFileContent());
    }
}

function getEmptyJsonFileContent() {
    return `{${os.EOL}    ${os.EOL}}`;
}