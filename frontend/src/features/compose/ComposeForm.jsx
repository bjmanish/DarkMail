export function ComposeForm({ subject, body, onSubjectChange, onBodyChange, onSubmit }) {
  return (
    <form onSubmit={onSubmit} className="compose-form">
      <input
        value={subject}
        onChange={(event) => onSubjectChange(event.target.value)}
        placeholder="Subject"
        required
      />
      <textarea
        value={body}
        onChange={(event) => onBodyChange(event.target.value)}
        placeholder="Write your message"
        rows={4}
        required
      />
      <button type="submit">Send</button>
    </form>
  );
}
