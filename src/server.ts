import fastify from 'fastify';
import 'dotenv/config';
import cors from '@fastify/cors';
import {
  ZodTypeProvider,
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod';
import { simulationRoutes } from './routes/simulationRoutes';
import { movementRoutes } from './routes/movementRoutes';
import { allocationRoutes } from './routes/allocationRoutes';
import { insuranceRoutes } from './routes/insuranceRoutes';

import fastify, { FastifyInstance } from 'fastify';
import 'dotenv/config';
import cors from '@fastify/cors';
import {
  ZodTypeProvider,
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod';
import { simulationRoutes } from './routes/simulationRoutes';
import { movementRoutes } from './routes/movementRoutes';
import { allocationRoutes } from './routes/allocationRoutes';
import { insuranceRoutes } from './routes/insuranceRoutes';

export function buildApp(): FastifyInstance {
  const app = fastify({
    logger: true,
  }).withTypeProvider<ZodTypeProvider>();

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  app.register(cors, {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  });

  app.register(simulationRoutes);
  app.register(movementRoutes);
  app.register(allocationRoutes);
  app.register(insuranceRoutes);

  return app;
}

const start = async () => {
  const app = buildApp();
  try {
    const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3333;
    await app.listen({ port: port, host: '0.0.0.0' });
    console.log(`🚀 Server listening on http://localhost:${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

if (require.main === module) {
  start();
}