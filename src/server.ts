import fastify from 'fastify';
import { z } from 'zod';
import 'dotenv/config';

const app = fastify({
  logger: true,
});

app.get('/', async (request, reply) => {
  return { hello: 'world, the MFO planner is running!' };
});

const start = async () => {
  try {
    const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3333;
    await app.listen({ port: port, host: '0.0.0.0' });
    console.log(`🚀 Server listening on http://localhost:${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();