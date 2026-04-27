import fs from 'node:fs';
import path from 'node:path';

export class MessagesRepository {
  constructor({ dataFilePath }) {
    this.dataFilePath = dataFilePath;
    this.ensureStore();
  }

  ensureStore() {
    const dir = path.dirname(this.dataFilePath);
    fs.mkdirSync(dir, { recursive: true });

    if (!fs.existsSync(this.dataFilePath)) {
      const seed = {
        nextId: 2,
        messages: [
          {
            id: 1,
            subject: 'Welcome to DarkMail',
            body: 'Your starter project is up and running.'
          }
        ]
      };

      fs.writeFileSync(this.dataFilePath, JSON.stringify(seed, null, 2));
    }
  }

  readStore() {
    return JSON.parse(fs.readFileSync(this.dataFilePath, 'utf-8'));
  }

  writeStore(store) {
    fs.writeFileSync(this.dataFilePath, JSON.stringify(store, null, 2));
  }

  listMessages() {
    const store = this.readStore();
    return [...store.messages].reverse();
  }

  addMessage({ subject, body }) {
    const store = this.readStore();

    const message = {
      id: store.nextId,
      subject,
      body
    };

    store.nextId += 1;
    store.messages.push(message);
    this.writeStore(store);

    return message;
  }

  clearForTest() {
    const empty = {
      nextId: 1,
      messages: []
    };

    this.writeStore(empty);
  }
}
