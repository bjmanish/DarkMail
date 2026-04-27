import { useEffect, useState } from 'react';
import { StatusBanner } from './components/StatusBanner';
import { createMessage, getHealth, getMessages } from './api';
import { ComposeForm } from './features/compose/ComposeForm';
import { InboxList } from './features/inbox/InboxList';

export function App() {
  const [health, setHealth] = useState('checking...');
  const [messages, setMessages] = useState([]);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [error, setError] = useState('');

  async function load() {
    setError('');
    try {
      const [{ status }, messageResponse] = await Promise.all([getHealth(), getMessages()]);
      setHealth(status);
      setMessages(messageResponse.data);
    } catch (loadError) {
      setError(loadError.message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onSubmit(event) {
    event.preventDefault();
    setError('');

    try {
      await createMessage({ subject, body });
      setSubject('');
      setBody('');
      await load();
    } catch (submitError) {
      setError(submitError.message);
    }
  }

  return (
    <main className="container">
      <h1>DarkMail</h1>
      <StatusBanner health={health} />

      <section>
        <h2>Compose</h2>
        <ComposeForm
          subject={subject}
          body={body}
          onSubjectChange={setSubject}
          onBodyChange={setBody}
          onSubmit={onSubmit}
        />
      </section>

      <section>
        <h2>Inbox</h2>
        <InboxList messages={messages} />
      </section>

      {error ? <p className="error">{error}</p> : null}
    </main>
  );
}
