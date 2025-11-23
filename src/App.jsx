import { useState, useEffect, useRef } from 'react';
import tiles from './data/tiles.json';
import './App.css';

function App() {
  const [flipped, setFlipped] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [logoClicked, setLogoClicked] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [shuffled, setShuffled] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [dragging, setDragging] = useState(false);

  const cardRef = useRef(null);

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

  const handleFlip = () => {
    if (!dragging) setFlipped(prev => !prev);
  };

  const handleMoveNext = (direction) => {
    if (!currentCard || swipeDirection) return;

    setSwipeDirection(direction);
    setFlipped(false);

    setTimeout(() => {
      let newCards = [...remainingCards];

      if (direction === 'right') {
        newCards.splice(currentIndex, 1);
        setCorrectCount(prev => prev + 1);
      } else {
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

  const resetProgress = () => {
    setRemainingCards([...allFlashcards]);
    setCurrentIndex(0);
    setCorrectCount(0);
    setFlipped(false);
    setSwipeDirection(null);
    setShuffled(false);
  };

  const toggleShuffle = () => {
    setFlipped(false);

    setTimeout(() => {
      if (!shuffled) {
        const shuffledCards = [...remainingCards];
        for (let i = shuffledCards.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffledCards[i], shuffledCards[j]] = [shuffledCards[j], shuffledCards[i]];
        }
        setRemainingCards(shuffledCards);
      } else {
        const ordered = allFlashcards.filter(c => remainingCards.includes(c));
        setRemainingCards(ordered);
      }

      setShuffled(prev => !prev);
      setCurrentIndex(0);
    }, 150);
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
  }, [currentCard, swipeDirection, dragging]);

  // Drag handlers
  const handleDragStart = (e) => {
    setDragStart({ x: e.clientX, y: e.clientY });
    setDragging(false);
  };

  const handleDragMove = (e) => {
    if (!dragStart) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    if (Math.abs(dx) > 10 || Math.abs(dy) > 10) setDragging(true);
  };

  const handleDragEnd = (e) => {
    if (!dragStart || !dragging) {
      setDragStart(null);
      setDragging(false);
      return;
    }

    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;

    // Determine direction
    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > 0) handleMoveNext('right');
      else handleMoveNext('left');
    } else if (dy < 0) {
      handleMoveNext('up');
    }

    setDragStart(null);
    setDragging(false);
  };

  return (
    <div className="container text-center mt-5">
      <img
        src={logoPath}
        alt="Yaku Up Logo"
        className={`logo ${logoClicked ? 'sway' : ''}`}
        onClick={handleLogoClick}
      />

      <button className="contrast-toggle" onClick={toggleContrast}>
        {highContrast ? '🌙' : '☀️'}
      </button>

      <p className="progress-text">
        Progress: {correctCount} / {totalCards}
      </p>

      {currentCard ? (
        <div
          className={`tile-card ${swipeDirection ? `swipe-${swipeDirection}` : ''}`}
          onClick={handleFlip}
          ref={cardRef}
          onMouseDown={handleDragStart}
          onMouseMove={handleDragMove}
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}
          onTouchStart={(e) => handleDragStart(e.touches[0])}
          onTouchMove={(e) => handleDragMove(e.touches[0])}
          onTouchEnd={(e) => handleDragEnd(e.changedTouches[0])}
        >
          <div className={`tile-inner ${flipped ? 'flipped' : ''}`}>
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

      {/* Reset and Shuffle Buttons */}
      <div className="button-row">
        <button className="reset-btn" onClick={resetProgress}>
          Reset Progress
        </button>

        {currentCard && (
          <button className="shuffle-btn" onClick={toggleShuffle}>
            {shuffled ? '🔁 Unshuffle' : '🔀 Shuffle'}
          </button>
        )}
      </div>
    </div>
  );
}

export default App;
