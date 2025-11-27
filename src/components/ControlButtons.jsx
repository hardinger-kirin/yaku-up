/*
  Handles buttons to reset the progress and shuffle/unshuffle the cards.
  The user may only shuffle/unshuffle if there is a card to display.
*/

export default function ControlButtons({ currentCard, shuffled, onReset, onShuffle }) {
  return (
    <div className="button-row">
      <button className="reset-btn" onClick={onReset}>
        Reset Progress
      </button>

      {currentCard && (
        <button className="shuffle-btn" onClick={onShuffle}>
          {shuffled ? '🔁 Unshuffle' : '🔀 Shuffle'}
        </button>
      )}
    </div>
  );
}
