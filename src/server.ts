import dotenv from 'dotenv';
import app from './app';
import { initDB, pool } from './db';

// Load env variables
dotenv.config();

const PORT = process.env.PORT || 3000;

async function bootstrap() {
  try {
    // 1. Initialize database tables/triggers
    await initDB();

    // 2. Start listening
    const server = app.listen(PORT, () => {
      console.log(`=========================================`);
      console.log(`🚀 DevPulse server is running on port ${PORT}`);
      console.log(`👉 Health check: http://localhost:${PORT}/health`);
      console.log(`=========================================`);
    });

    // Handle graceful shutdowns
    const shutdown = async () => {
      console.log('\nStopping server and closing DB connection pool...');
      server.close(async () => {
        await pool.end();
        console.log('Server and database pool stopped. Goodbye.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

  } catch (error) {
    console.error('Fatal error during application boot:', error);
    process.exit(1);
  }
}

// Boot the application
bootstrap();
