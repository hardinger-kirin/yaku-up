import { useState, useEffect } from 'react';
import tiles from './data/tiles.json';
import './App.css';

function App() {
  const [flipped, setFlipped] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [logoClicked, setLogoClicked] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState(null);
  const [correctCount, setCorrectCount] = useState(0);

  // Initialize flashcards
  const allFlashcards = [
    ...tiles.man,
    ...tiles.pin,
    ...tiles.sou,
    ...tiles.honors.filter(t => ['Chun', 'Haku', 'Hatsu'].includes(t.id)),
    ...tiles.honors.filter(t => ['Ton', 'Nan', 'Shaa', 'Pei'].includes(t.id))
  ];

  const [remainingCards, setRemainingCards] = useState([...allFlashcards]);
  const totalCards = allFlashcards.length;

  const currentCard = remainingCards[currentIndex] || null;

  const handleFlip = () => setFlipped(prev => !prev);

  // Handle indicating tile
  const handleMoveNext = (direction) => {
    if (!currentCard || swipeDirection) return;

    setSwipeDirection(direction);
    setFlipped(false);

    setTimeout(() => {
      let newCards = [...remainingCards];

      if (direction === 'right') {
        // Correct: remove card
        newCards.splice(currentIndex, 1);
        setCorrectCount(prev => prev + 1);
      } else {
        // Wrong or skipped: move card to end
        newCards.push(newCards.splice(currentIndex, 1)[0]);
      }

      setRemainingCards(newCards);
      setSwipeDirection(null);
      setCurrentIndex(0);
    }, 150);
  };

  const handleLogoClick = () => {
    setLogoClicked(true);
    setTimeout(() => setLogoClicked(false), 600);
  };

  const toggleContrast = () => setHighContrast(prev => !prev);

  // Reset progress handler
  const resetProgress = () => {
    setRemainingCards([...allFlashcards]);
    setCurrentIndex(0);
    setCorrectCount(0);
    setFlipped(false);
    setSwipeDirection(null);
  };

  const tileFolder = highContrast ? 'dark' : 'regular';
  const frontFrame = `${import.meta.env.BASE_URL}/tiles/${tileFolder}/Front.png`;
  const logoPath = `${import.meta.env.BASE_URL}/logo.png`;

  // Keyboard controls
  useEffect(() => {
    const handleKey = (e) => {
      if (!currentCard) return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          handleFlip();
          break;
        case 'ArrowRight':
          handleMoveNext('right');
          break;
        case 'ArrowLeft':
          handleMoveNext('left');
          break;
        case 'ArrowUp':
          handleMoveNext('up');
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [currentCard, swipeDirection]);

  return (
    <div className="container text-center mt-5">
      {/* LOGO */}
      <img
        src={logoPath}
        alt="Yaku Up Logo"
        className={`logo ${logoClicked ? 'sway' : ''}`}
        onClick={handleLogoClick}
      />

      {/* HIGH CONTRAST TOGGLE */}
      <button className="contrast-toggle" onClick={toggleContrast}>
        {highContrast ? '🌙' : '☀️'}
      </button>

      {/* PROGRESS */}
      <p className="progress-text">
        Progress: {correctCount} / {totalCards}
      </p>

      {/* CURRENT PROGRESS */}
      {currentCard ? (
        <div
          className={`tile-card ${swipeDirection ? `swipe-${swipeDirection}` : ''}`}
          onClick={handleFlip}
        >
          <div className={`tile-inner ${flipped ? 'flipped' : ''}`}>
            {/* FRONT */}
            <div className="tile-face tile-front">
              <div
                className="tile-frame"
                style={{ backgroundImage: `url(${frontFrame})` }}
              >
                <img
                  src={`${import.meta.env.BASE_URL}/tiles/${tileFolder}/${currentCard.id}.png`}
                  draggable={false}
                  alt={currentCard.name}
                  className="tile-img"
                />
              </div>
            </div>

            {/* BACK */}
            <div className="tile-face tile-back">
              <h4>{currentCard.name}</h4>
              <p className="fs-1">{currentCard.kanji}</p>
              <p>"{currentCard.romaji}"</p>
            </div>
          </div>
        </div>
      ) : (
        <p className="text mt-5 fs-3">You're done!</p>
      )}

      {currentCard && (
        <>
          <p className="text mt-3">
            Click the tile or press Space to flip. Use arrow keys →, ←, ↑ to move.
          </p>
        </>
      )}

      {/* RESET PROGRESS */}
      <button className="reset-btn mt-2" onClick={resetProgress}>
        Reset Progress
      </button>
    </div>
  );
}

export default App;
