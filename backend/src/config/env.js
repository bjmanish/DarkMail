import path from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const defaultDataFilePath = path.resolve(currentDir, '../../data/messages.json');

export const env = {
  port: Number(process.env.PORT ?? 3001),
  dataFilePath: process.env.DATA_FILE_PATH ?? defaultDataFilePath
};
