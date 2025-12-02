import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from project root (one level up from server directory)
dotenv.config({ path: path.join(__dirname, '../.env') });

export const PORT = process.env.PORT || 3002;
export const SOCKET_PORT = process.env.SOCKET_PORT || 3002;
export const JSON_SERVER_URL = process.env.JSON_SERVER_URL || 'http://localhost:3001';
export const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
