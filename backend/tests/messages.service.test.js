import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import { MessagesRepository } from '../src/repositories/messagesRepository.js';
import { MessagesService } from '../src/services/messagesService.js';

function createTestService() {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'darkmail-test-'));
  const dataFilePath = path.join(tempDir, 'messages.json');
  const messagesRepository = new MessagesRepository({ dataFilePath });
  messagesRepository.clearForTest();

  return {
    service: new MessagesService({ messagesRepository }),
    dataFilePath
  };
}

test('createMessage validates subject and body', () => {
  const { service } = createTestService();
  const result = service.createMessage({ subject: '', body: 'hello' });
  assert.equal(result.error, 'Both subject and body are required.');
});

test('createMessage persists messages in repository', () => {
  const { service, dataFilePath } = createTestService();

  const created = service.createMessage({ subject: 'Hello', body: 'DarkMail' });
  assert.ok(created.data);

  const messages = service.getAllMessages();
  assert.equal(messages.length, 1);
  assert.equal(messages[0].subject, 'Hello');
  assert.equal(messages[0].body, 'DarkMail');

  const file = JSON.parse(fs.readFileSync(dataFilePath, 'utf-8'));
  assert.equal(file.messages.length, 1);
  assert.equal(file.nextId, 2);
});
