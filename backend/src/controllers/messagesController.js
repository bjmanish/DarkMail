export function createMessagesController({ messagesService }) {
  return {
    readMessages(_req, res) {
      res.json({ data: messagesService.getAllMessages() });
    },

    postMessage(req, res) {
      const result = messagesService.createMessage(req.body);

      if (result.error) {
        return res.status(400).json({ error: result.error });
      }

      return res.status(201).json({ data: result.data });
    }
  };
}
