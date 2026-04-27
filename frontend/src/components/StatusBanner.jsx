export function StatusBanner({ health }) {
  return (
    <p className="status">
      Backend status: <strong>{health}</strong>
    </p>
  );
}
