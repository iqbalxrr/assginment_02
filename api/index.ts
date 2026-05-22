import app from '../src/app';
import { initDB } from '../src/db';
import type { IncomingMessage, ServerResponse } from 'http';

const databaseReady = initDB();

export default async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  await databaseReady;
  app(req, res);
}
