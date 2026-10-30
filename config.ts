import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

/**
 * Finds an environment file in the locations used by both source and compiled builds.
 *
 * @param name - The environment file name to locate, such as `.env` or `.env.local`.
 * @returns The absolute path to the first matching file, or `null` when no candidate exists.
 * @remarks
 * The search checks the current working directory, the directory containing this
 * module, and its parent. This keeps configuration loading working when the app is
 * executed from TypeScript sources or from the compiled `build/` directory.
 */
function findEnvFile(name: string): string | null {
    const candidates = [
        path.resolve(process.cwd(), name),
        path.resolve(__dirname, name),
        path.resolve(__dirname, '..', name)
    ];
    return candidates.find((candidate) => fs.existsSync(candidate)) ?? null;
}

const envPath = findEnvFile('.env');
if (envPath) {
    dotenv.config({ path: envPath });
}

const localEnvPath = findEnvFile('.env.local');
if (localEnvPath) {
    dotenv.config({ path: localEnvPath });
}

const config = {
    port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3200,
    mongodbUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/eris_dev',
    basePath: process.env.BASE_PATH || '/eris'
};

export default config;
