export default function ContrastToggle({ highContrast, toggle }) {
  return (
    <button className="contrast-toggle" onClick={toggle}>
      {highContrast ? '🌙' : '☀️'}
    </button>
  );
}
