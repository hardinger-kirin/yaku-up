/*
  Handles High Contrast mode button, which is normal by default (sun icon). 
  When clicked, toggles to High Contrast mode (moon icon).
*/

export default function ContrastToggle({ highContrast, toggle }) {
  return (
    <button className="contrast-toggle" onClick={toggle}>
      {highContrast ? '🌙' : '☀️'}
    </button>
  );
}
