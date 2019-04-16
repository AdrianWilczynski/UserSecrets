import * as os from 'os';
import * as path from 'path';
import * as fse from 'fs-extra';

export function getSecretsPath(id: string) {
    return getSecretsPathForSystem(id, getOperatingSystem());
}

enum OperatingSystem {
    Windows,
    Linux,
    macOS,
    Other
}

function getOperatingSystem() {
    switch (os.platform()) {
        case 'win32':
            return OperatingSystem.Windows;
        case 'linux':
            return OperatingSystem.Linux;
        case 'darwin':
            return OperatingSystem.macOS;
        default:
            return OperatingSystem.Other;
    }
}

function getSecretsPathForSystem(id: string, system: OperatingSystem) {
    if (system === OperatingSystem.Windows) {
        return path.join(os.homedir(), 'AppData', 'Roaming', 'Microsoft', 'UserSecrets', id, 'secrets.json');
    } else if (system === OperatingSystem.Linux || system === OperatingSystem.macOS) {
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
    return `{${os.EOL}${os.EOL}}`;
}