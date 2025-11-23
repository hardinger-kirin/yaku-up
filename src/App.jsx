import { useState } from 'react';
import tiles from './data/tiles.json';
import './App.css';

function App() {
  const chunTile = tiles.honors.find(t => t.id === 'Chun');
  const [flipped, setFlipped] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [logoClicked, setLogoClicked] = useState(false);

  const handleClick = () => setFlipped(!flipped);
  const toggleContrast = () => setHighContrast(!highContrast);

  const handleLogoClick = () => {
    setLogoClicked(true);
    setTimeout(() => setLogoClicked(false), 600); // duration matches animation
  };

  const tileFolder = highContrast ? 'dark' : 'regular';
  const imagePath = `${import.meta.env.BASE_URL}/tiles/${tileFolder}/Chun.png`;
  const frontFrame = `${import.meta.env.BASE_URL}/tiles/${tileFolder}/Front.png`;
  const logoPath = `${import.meta.env.BASE_URL}/logo.png`;

  return (
    <div className="container text-center mt-5">
      {/* Logo */}
      <img
        src={logoPath}
        alt="Yaku Up Logo"
        className={`logo ${logoClicked ? 'sway' : ''}`}
        onClick={handleLogoClick}
      />

      {/* High Contrast Toggle */}
      <button className="contrast-toggle" onClick={toggleContrast}>
        {highContrast ? '🌙' : '☀️'}
      </button>

      {/* CARD */}
      <div className="tile-card" onClick={handleClick}>
        <div className={`tile-inner ${flipped ? 'flipped' : ''}`}>
          {/* FRONT */}
          <div className="tile-face tile-front">
            <div
              className="tile-frame"
              style={{ backgroundImage: `url(${frontFrame})` }}
            >
              <img
                src={imagePath}
                draggable={false}
                alt={chunTile.name}
                className="tile-img"
              />
            </div>
          </div>

          {/* BACK */}
          <div className="tile-face tile-back">
            <h4>{chunTile.name}</h4>
            <p className="fs-1">{chunTile.kanji}</p>
            <p>"{chunTile.romaji}"</p>
          </div>
        </div>
      </div>

      <p className="text mt-3">Click the tile to flip it!</p>
    </div>
  );
}

export default App;
