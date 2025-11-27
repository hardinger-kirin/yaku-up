import { useState, useEffect, useRef, useMemo } from 'react';
import tiles from './data/tiles.json';
import yaku from './data/yaku.json';
import './App.css';

import Logo from './components/Logo';
import ContrastToggle from './components/ContrastToggle';
import ProgressText from './components/ProgressText';
import Flashcard from './components/Flashcard';
import DoneCard from './components/DoneCard';
import ControlButtons from './components/ControlButtons';
import SetToggles from './components/SetToggles';

function App() {
  // ---- UI and Initial Card State ----
  // By default, cards are unflipped (showing the front face), normal contrast mode, and logo is unclicked.
  const [flipped, setFlipped] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [logoClicked, setLogoClicked] = useState(false);

  // By default, the sets are unshuffled.
  const [remainingCards, setRemainingCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [swipeDirection, setSwipeDirection] = useState(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [shuffled, setShuffled] = useState(false);

  // No user interaction yet, so no swipe direction or feedback.
  const [dragStart, setDragStart] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // By default, all sets are enabled.
  const [enabledSets, setEnabledSets] = useState({
    man: true,
    pin: true,
    sou: true,
    winds: true,
    dragons: true,
    yaku: true
  });

  const cardRef = useRef(null);

  // By default, all enabled cards are included.
  const enabledCards = useMemo(() => {
    return [
      ...(enabledSets.man ? tiles.man : []),
      ...(enabledSets.pin ? tiles.pin : []),
      ...(enabledSets.sou ? tiles.sou : []),
      ...(enabledSets.winds ? tiles.honors.filter(t => ['Ton', 'Nan', 'Shaa', 'Pei'].includes(t.id)) : []),
      ...(enabledSets.dragons ? tiles.honors.filter(t => ['Chun', 'Haku', 'Hatsu'].includes(t.id)) : []),
      ...(enabledSets.yaku ? yaku : [])
    ];
  }, [enabledSets]);

  const totalCards = enabledCards.length;
  // ---- END UI / Card State ----

  // ---- Handlers and helpers ----
  const shuffleArray = (arr) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  const findFirstEnabledPosition = (cards) => {
    const enabledIds = new Set(enabledCards.map(c => c.id));
    for (let i = 0; i < cards.length; i++) {
      if (enabledIds.has(cards[i].id)) return i;
    }
    return -1;
  };

  useEffect(() => {
    setRemainingCards(enabledCards);
    setCurrentIndex(enabledCards.length > 0 ? 0 : -1);
    setCorrectCount(0);
    setFlipped(false);
    setSwipeDirection(null);
    setShuffled(false);
  }, [enabledCards]);

  const currentCard =
    currentIndex >= 0 && currentIndex < remainingCards.length
      ? remainingCards[currentIndex]
      : null;

  const handleFlip = () => {
    if (!dragging) setFlipped(f => !f);
  };

  const handleMoveNext = (direction) => {
    if (!currentCard || swipeDirection) return;

    // Visual feedback (green = correct, red = incorrect)
    const feedbackClass = direction === 'right' ? 'feedback-correct' : 'feedback-incorrect';
    setSwipeDirection(null);          // ensure swipe class not active yet
    setFlipped(false);
    setFeedback(feedbackClass);       // NEW: trigger flash effect

    // Step 1 — play the flash animation
    setTimeout(() => {
      setFeedback(null);              // remove flash
      setSwipeDirection(direction);   // now start swipe animation

      // Step 2 — after swipe, modify deck
      setTimeout(() => {
        const newCards = [...remainingCards];

        if (direction === 'right') {
          newCards.splice(currentIndex, 1);
          setCorrectCount(c => c + 1);
        } else {
          newCards.push(newCards.splice(currentIndex, 1)[0]);
        }

        const nextPos = findFirstEnabledPosition(newCards);
        setRemainingCards(newCards);
        setCurrentIndex(nextPos);
        setSwipeDirection(null);

        if (nextPos === -1) setCurrentIndex(-1);
      }, 350); // swipe animation duration
    }, 300); // flash duration
  };

  const handleLogoClick = () => {
    setLogoClicked(true);
    setTimeout(() => setLogoClicked(false), 600);
  };

  const toggleContrast = () => setHighContrast(c => !c);

  const resetProgress = () => {
    setRemainingCards(enabledCards);
    setCurrentIndex(enabledCards.length > 0 ? 0 : -1);
    setCorrectCount(0);
    setFlipped(false);
    setSwipeDirection(null);
    setShuffled(false);
  };

  const toggleShuffle = () => {
    setFlipped(false);

    setTimeout(() => {
      const runtime = [...remainingCards];
      const enabledIdSet = new Set(enabledCards.map(c => c.id));
      const enabledPositions = [];

      for (let i = 0; i < runtime.length; i++)
        if (enabledIdSet.has(runtime[i].id)) enabledPositions.push(i);

      let newRuntime = [...runtime];

      if (!shuffled) {
        const enabledOnly = enabledPositions.map(i => runtime[i]);
        const shuffledEnabled = shuffleArray(enabledOnly);
        enabledPositions.forEach((pos, idx) => {
          newRuntime[pos] = shuffledEnabled[idx];
        });
      } else {
        const naturalIndex = Object.fromEntries(
          enabledCards.map((c, idx) => [c.id, idx])
        );

        const enabledOnly = enabledPositions.map(i => runtime[i]);

        enabledOnly.sort((a, b) => {
          const ai = naturalIndex[a.id];
          const bi = naturalIndex[b.id];
          if (ai === undefined && bi === undefined) return 0;
          if (ai === undefined) return 1;
          if (bi === undefined) return -1;
          return ai - bi;
        });

        enabledPositions.forEach((pos, idx) => {
          newRuntime[pos] = enabledOnly[idx];
        });
      }

      const nextPos = findFirstEnabledPosition(newRuntime);
      setRemainingCards(newRuntime);
      setCurrentIndex(nextPos);
      setShuffled(s => !s);
      if (nextPos === -1) setCurrentIndex(-1);
    }, 150);
  };

  const toggleSet = (setName) => {
    setEnabledSets(prev => ({ ...prev, [setName]: !prev[setName] }));
  };

  // ---- Keyboard input ----
  useEffect(() => {
    const handleKey = (e) => {
      if (currentIndex === -1) return;

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
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [remainingCards, currentIndex, swipeDirection, dragging]);

  // ---- Mouse / Touch Drag Handlers ----
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
  // ---- END Mouse / Touch Drag Handlers ----
  // ---- END Handlers and helpers ----

  // ---- Rendering logic ----
  const tileFolder = highContrast ? 'dark' : 'regular';
  const frontFrame = `${import.meta.env.BASE_URL}/tiles/${tileFolder}/Front.png`;
  const logoPath = `${import.meta.env.BASE_URL}/logo.png`;

  return (
    <div className={`container text-center mt-5 ${highContrast ? 'high-contrast' : ''}`}>
      <Logo src={logoPath} clicked={logoClicked} onClick={handleLogoClick} />
      <ContrastToggle highContrast={highContrast} toggle={toggleContrast} />

      <ProgressText correct={correctCount} total={totalCards} />

      {currentCard ? (
        <Flashcard
          card={currentCard}
          flipped={flipped}
          swipeDirection={swipeDirection}
          feedback={feedback}
          onFlip={handleFlip}
          onDragStart={handleDragStart}
          onDragMove={handleDragMove}
          onDragEnd={handleDragEnd}
          cardRef={cardRef}
          tileFolder={tileFolder}
          frontFrame={frontFrame}
        />
      ) : (
        <DoneCard />
      )}

      {currentCard && (
        <p className="text mt-3">
          Click the tile or press Space to flip.<br />
          Use arrow keys or drag the tile to mark correct / incorrect.
        </p>
      )}

      <ControlButtons
        currentCard={currentCard}
        shuffled={shuffled}
        onReset={resetProgress}
        onShuffle={toggleShuffle}
      />

      <SetToggles
        enabledSets={enabledSets}
        toggleSet={toggleSet}
        tileFolder={tileFolder}
        frontFrame={frontFrame}
      />
    </div>
  );
  // ---- END Rendering logic ----
}

export default App;
