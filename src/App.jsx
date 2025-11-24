import { useState, useEffect, useRef } from 'react';
import tiles from './data/tiles.json';
import yakuList from './data/yaku.json';
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

  const [enabledSets, setEnabledSets] = useState({
    man: true,
    pin: true,
    sou: true,
    winds: true,
    dragons: true,
    yaku: true
  });

  const cardRef = useRef(null);

  const allFlashcards = [
    ...tiles.man,
    ...tiles.pin,
    ...tiles.sou,
    ...tiles.honors.filter(t => ['Ton', 'Nan', 'Shaa', 'Pei'].includes(t.id)),
    ...tiles.honors.filter(t => ['Chun', 'Haku', 'Hatsu'].includes(t.id)),
    ...yakuList
  ];

  const filterEnabledCards = () => {
    return [
      ...(enabledSets.man ? tiles.man : []),
      ...(enabledSets.pin ? tiles.pin : []),
      ...(enabledSets.sou ? tiles.sou : []),
      ...(enabledSets.winds ? tiles.honors.filter(t => ['Ton', 'Nan', 'Shaa', 'Pei'].includes(t.id)) : []),
      ...(enabledSets.dragons ? tiles.honors.filter(t => ['Chun', 'Haku', 'Hatsu'].includes(t.id)) : []),
      ...(enabledSets.yaku ? yakuList : [])
    ];
  };

  const [remainingCards, setRemainingCards] = useState(filterEnabledCards());
  const totalCards = filterEnabledCards().length;
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
      const nextPos = findFirstEnabledPosition(newCards);
      setCurrentIndex(nextPos);
      setSwipeDirection(null);
    }, 150);
  };

  const handleLogoClick = () => {
    setLogoClicked(true);
    setTimeout(() => setLogoClicked(false), 600);
  };

  const toggleContrast = () => setHighContrast(prev => !prev);

  const resetProgress = () => {
    const filtered = filterEnabledCards();
    setRemainingCards(filtered);
    const pos = findFirstEnabledPosition(filtered);
    setRemainingCards(filtered);
    setCurrentIndex(pos);
    setCorrectCount(0);
    setFlipped(false);
    setSwipeDirection(null);
    setShuffled(false);
  };

  const toggleShuffle = () => {
    setFlipped(false);

    setTimeout(() => {
      const enabledIds = new Set(filterEnabledCards().map(c => c.id));
      const enabledPositions = [];
      for (let i = 0; i < remainingCards.length; i++) {
        if (enabledIds.has(remainingCards[i].id)) enabledPositions.push(i);
      }

      let newCards = [...remainingCards];

      if (!shuffled) {
        // shuffle only enabled cards
        const enabledCards = enabledPositions.map(i => remainingCards[i]);
        for (let i = enabledCards.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [enabledCards[i], enabledCards[j]] = [enabledCards[j], enabledCards[i]];
        }
        enabledPositions.forEach((pos, idx) => { newCards[pos] = enabledCards[idx]; });
      } else {
        // unshuffle: restore natural order for enabled cards only
        const naturalOrder = filterEnabledCards();
        const naturalIndex = Object.fromEntries(naturalOrder.map((c, idx) => [c.id, idx]));
        const enabledCards = enabledPositions.map(i => remainingCards[i]);
        enabledCards.sort((a, b) => {
          const ai = naturalIndex[a.id];
          const bi = naturalIndex[b.id];
          if (ai === undefined && bi === undefined) return 0;
          if (ai === undefined) return 1;
          if (bi === undefined) return -1;
          return ai - bi;
        });
        enabledPositions.forEach((pos, idx) => { newCards[pos] = enabledCards[idx]; });
      }

      setRemainingCards(newCards);
      const nextPos = findFirstEnabledPosition(newCards);
      setCurrentIndex(nextPos);
      setShuffled(prev => !prev);
    }, 150);
  };


  const findFirstEnabledPosition = (cards) => {
    const enabledIds = new Set(filterEnabledCards().map(c => c.id));
    for (let i = 0; i < cards.length; i++) {
      if (enabledIds.has(cards[i].id)) return i;
    }
    return -1;
  };

  useEffect(() => {
    const pos = findFirstEnabledPosition(remainingCards);
    setCurrentIndex(pos);
  }, [remainingCards, enabledSets]);

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

    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > 0) handleMoveNext('right');
      else handleMoveNext('left');
    }

    setDragStart(null);
    setDragging(false);
  };

  const toggleSet = (setName) => {
    const newEnabled = { ...enabledSets, [setName]: !enabledSets[setName] };
    setEnabledSets(newEnabled);
    const filtered = [
      ...(newEnabled.man ? tiles.man : []),
      ...(newEnabled.pin ? tiles.pin : []),
      ...(newEnabled.sou ? tiles.sou : []),
      ...(newEnabled.winds ? tiles.honors.filter(t => ['Ton', 'Nan', 'Shaa', 'Pei'].includes(t.id)) : []),
      ...(newEnabled.dragons ? tiles.honors.filter(t => ['Chun', 'Haku', 'Hatsu'].includes(t.id)) : []),
      ...(newEnabled.yaku ? yakuList : [])
    ];
    setRemainingCards(filtered);
    const pos = findFirstEnabledPosition(filtered);
    setRemainingCards(filtered);
    setCurrentIndex(pos);
    setCorrectCount(0);
    setFlipped(false);
    setSwipeDirection(null);
  };

  const renderDoneCard = () => (
    <div className="tile-card done-card">
      <div className="tile-inner">
        <div className="tile-face tile-front">

          <p className="fs-4 mt-4 done-card-text"><b>Congrats! 🎉</b><br /><br /><i>Reset Progress</i> or enable new sets <br />to keep learning.</p>

        </div>
      </div>
    </div>
  );

  return (
    <div className={`container text-center mt-5 ${highContrast ? 'high-contrast' : ''}`}>
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
            <div className="tile-face tile-front prevent-select">
              {currentCard.id.startsWith('Man') ||
                currentCard.id.startsWith('Pin') ||
                currentCard.id.startsWith('Sou') ||
                ['Ton', 'Nan', 'Shaa', 'Pei', 'Haku', 'Hatsu', 'Chun'].includes(currentCard.id) ? (
                <div
                  className="tile-frame yaku-card"
                  style={{ backgroundImage: `url(${frontFrame})` }}
                >
                  <img
                    src={`${import.meta.env.BASE_URL}/tiles/${tileFolder}/${currentCard.id}.png`}
                    draggable={false}
                    alt={currentCard.name}
                    className="tile-img"
                  />
                </div>
              ) : (
                <div className="tile-frame d-flex justify-content-center align-items-center" style={{ backgroundImage: `url(${frontFrame})` }}>
                  <p className="fs-3 yaku-text">{currentCard.name}</p>
                </div>
              )}
            </div>

            <div className="tile-face tile-back">
              {currentCard.id.startsWith('Man') ||
                currentCard.id.startsWith('Pin') ||
                currentCard.id.startsWith('Sou') ||
                ['Ton', 'Nan', 'Shaa', 'Pei', 'Haku', 'Hatsu', 'Chun'].includes(currentCard.id) ? (
                <>
                  <h4 className="prevent-select">{currentCard.name}</h4>
                  <p className="fs-1 prevent-select">{currentCard.kanji}</p>
                  <p className="prevent-select">"{currentCard.romaji}"</p>
                </>
              ) : (
                <>
                  <h4 className="prevent-select">{currentCard.kanji}</h4>
                  <p className="prevent-select">"{currentCard.romaji}"</p>
                  <p className="prevent-select">{currentCard.score}</p>
                  <p className="prevent-select">{currentCard.description}</p>
                </>
              )}
            </div>
          </div>
        </div>
      ) : (
        renderDoneCard()
      )}

      {currentCard && (
        <p className="text mt-3">
          Click the tile or press Space to flip. Use arrow keys →, ←, ↑ to move.
        </p>
      )}

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

      <div className="button-row mt-5">
        {['man', 'pin', 'sou', 'winds', 'dragons', 'yaku'].map((setName) => {
          const sampleTileId = {
            man: 'Man1',
            pin: 'Pin1',
            sou: 'Sou1',
            winds: 'Ton',
            dragons: 'Hatsu',
            yaku: null
          }[setName];

          return (
            <div
              key={setName}
              className="toggle-tile"
              onClick={() => toggleSet(setName)}
              style={{
                opacity: enabledSets[setName] ? 1 : 0.3,
                cursor: 'pointer'
              }}
            >
              {sampleTileId ? (
                <div className="toggle-tile-frame" style={{ backgroundImage: `url(${frontFrame})` }}>
                  <img
                    src={`${import.meta.env.BASE_URL}/tiles/${tileFolder}/${sampleTileId}.png`}
                    className="tile-img"
                    draggable={false}
                  />
                </div>
              ) : (
                <div className="toggle-tile-frame" style={{ backgroundImage: `url(${frontFrame})` }}>
                  <p className="fs-6 mt-3 yaku-toggle-label"><b>YAKU</b></p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="text mt-2">
        WARNING: Enabling or disabling sets will reset your progress.
      </p>
    </div>
  );
}

export default App;
