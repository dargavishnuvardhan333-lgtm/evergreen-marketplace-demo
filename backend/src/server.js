import 'dotenv/config';
import app from './app.js';
import { connectDatabase } from './config/db.js';

const port = Number(process.env.PORT) || 5000;

async function start() {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be configured with at least 32 characters in backend/.env.');
  }
  await connectDatabase();
  app.listen(port, () => console.log(`Commers API listening at http://localhost:${port}`));
}

start().catch((error) => {
  console.error(`Server startup failed: ${error.message}`);
  process.exitCode = 1;
});
