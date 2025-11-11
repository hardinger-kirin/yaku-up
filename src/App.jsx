import { useState } from 'react';
import tiles from './tiles.json';
import './App.css';

function App() {
  const chunTile = tiles.honors.find(t => t.id === 'chun');
  const [showImage, setShowImage] = useState(true);

  const handleClick = () => setShowImage(!showImage);

  // Dynamically build image path based on ID and suit
  const imagePath = `${import.meta.env.BASE_URL}/tiles/regular/chun.png`;

  return (
    <div className="container text-center mt-5">
      <h1 className="mb-4">Yaku Up!</h1>
      <p>Learn Riichi Mahjong tiles and yaku through interactive flashcards.</p>

      <div
        className="card mx-auto mt-4 p-4 shadow-sm d-flex align-items-center justify-content-center"
        style={{
          width: '200px',
          height: '260px',
          cursor: 'pointer',
        }}
        onClick={handleClick}
      >
        {showImage ? (
          <img
            src={imagePath}
            alt={chunTile.name}
            className="img-fluid"
            style={{ maxHeight: '100%' }}
          />
        ) : (
          <div>
            <h4>{chunTile.name}</h4>
            <p className="fs-1">{chunTile.kanji}</p>
            <p>"{chunTile.romaji}"</p>
          </div>
        )}
      </div>

      <p className="text-muted mt-3">Click the tile to flip it!</p>
    </div>
  );
}

export default App;
