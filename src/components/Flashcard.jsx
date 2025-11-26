export default function Flashcard({
  card,
  flipped,
  swipeDirection,
  onFlip,
  onDragStart,
  onDragMove,
  onDragEnd,
  cardRef,
  tileFolder,
  frontFrame
}) {
  const isTile =
    card.id.startsWith('Man') ||
    card.id.startsWith('Pin') ||
    card.id.startsWith('Sou') ||
    ['Ton', 'Nan', 'Shaa', 'Pei', 'Haku', 'Hatsu', 'Chun'].includes(card.id);

  return (
    <div
      className={`tile-card ${swipeDirection ? `swipe-${swipeDirection}` : ''}`}
      onClick={onFlip}
      ref={cardRef}
      onMouseDown={onDragStart}
      onMouseMove={onDragMove}
      onMouseUp={onDragEnd}
      onMouseLeave={onDragEnd}
      onTouchStart={(e) => onDragStart(e.touches[0])}
      onTouchMove={(e) => onDragMove(e.touches[0])}
      onTouchEnd={(e) => onDragEnd(e.changedTouches[0])}
    >
      <div className={`tile-inner ${flipped ? 'flipped' : ''}`}>
        {/* Front */}
        <div className="tile-face tile-front prevent-select">
          {isTile ? (
            <div
              className="tile-frame yaku-card"
              style={{ backgroundImage: `url(${frontFrame})` }}
            >
              <img
                src={`${import.meta.env.BASE_URL}/tiles/${tileFolder}/${card.id}.png`}
                draggable={false}
                alt={card.name}
                className="tile-img"
              />
            </div>
          ) : (
            <div
              className="tile-frame d-flex justify-content-center align-items-center"
              style={{ backgroundImage: `url(${frontFrame})` }}
            >
              <p className="fs-3 yaku-text">{card.name}</p>
            </div>
          )}
        </div>

        {/* Back */}
        <div className="tile-face tile-back">
          {isTile ? (
            <>
              <h4 className="prevent-select">{card.name}</h4>
              <p className="fs-1 prevent-select">{card.kanji}</p>
              <p className="prevent-select">"{card.romaji}"</p>
            </>
          ) : (
            <>
              <h4 className="prevent-select">{card.kanji}</h4>
              <p className="prevent-select">"{card.romaji}"</p>
              <p className="prevent-select">{card.score}</p>
              <p className="prevent-select">{card.description}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
