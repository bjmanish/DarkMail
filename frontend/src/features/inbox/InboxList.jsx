export function InboxList({ messages }) {
  if (messages.length === 0) {
    return <p>No messages yet.</p>;
  }

  return (
    <ul className="message-list">
      {messages.map((message) => (
        <li key={message.id}>
          <h3>{message.subject}</h3>
          <p>{message.body}</p>
        </li>
      ))}
    </ul>
  );
}
