import cors from 'cors';
import express from 'express';
import { env } from './config/env.js';
import { createMessagesController } from './controllers/messagesController.js';
import { errorHandler } from './middleware/errorHandler.js';
import { MessagesRepository } from './repositories/messagesRepository.js';
import { createMessagesRouter } from './routes/messagesRoutes.js';
import { MessagesService } from './services/messagesService.js';

export function createApp() {
  const app = express();

  const messagesRepository = new MessagesRepository({
    dataFilePath: env.dataFilePath
  });
  const messagesService = new MessagesService({ messagesRepository });
  const messagesController = createMessagesController({ messagesService });

  app.use(cors());
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/api/messages', createMessagesRouter({ messagesController }));
  app.use(errorHandler);

  return app;
}
