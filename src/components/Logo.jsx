export default function Logo({ src, clicked, onClick }) {
  return (
    <img
      src={src}
      alt="Yaku Up Logo"
      className={`logo ${clicked ? 'sway' : ''}`}
      onClick={onClick}
    />
  );
}
