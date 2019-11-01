import * as os from 'os';
import * as xml2js from 'xml2js';

const elements = {
    Project: 'Project',
    PropertyGroup: 'PropertyGroup',
    UserSecretsId: 'UserSecretsId'
};

export async function getUserSecretsId(csprojContent: string): Promise<string | undefined> {
    const parsed = await xml2js.parseStringPromise(csprojContent);

    const id = parsed &&
        parsed[elements.Project] &&
        parsed[elements.Project][elements.PropertyGroup] &&
        parsed[elements.Project][elements.PropertyGroup][0] &&
        parsed[elements.Project][elements.PropertyGroup][0][elements.UserSecretsId] &&
        parsed[elements.Project][elements.PropertyGroup][0][elements.UserSecretsId][0];

    return !!id || typeof id !== 'string' ? id : undefined;
}

export async function insertUserSecretsId(csprojContent: string, id: string) {
    let parsed = await xml2js.parseStringPromise(csprojContent);

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
        .replace(/^(?=  <\w)/gm, os.EOL)
        .replace(/(?=<\/Project>$)/, os.EOL)
        .replace(/(?=\/>$)/gm, ' ');

    return updatedContent;
}