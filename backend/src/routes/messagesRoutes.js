import { Router } from 'express';

export function createMessagesRouter({ messagesController }) {
  const messagesRouter = Router();

  messagesRouter.get('/', messagesController.readMessages);
  messagesRouter.post('/', messagesController.postMessage);

  return messagesRouter;
}
