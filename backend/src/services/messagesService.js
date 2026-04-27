export class MessagesService {
  constructor({ messagesRepository }) {
    this.messagesRepository = messagesRepository;
  }

  getAllMessages() {
    return this.messagesRepository.listMessages();
  }

  createMessage(payload) {
    const subject = payload?.subject?.trim();
    const body = payload?.body?.trim();

    if (!subject || !body) {
      return { error: 'Both subject and body are required.' };
    }

    const created = this.messagesRepository.addMessage({ subject, body });
    return { data: created };
  }
}
