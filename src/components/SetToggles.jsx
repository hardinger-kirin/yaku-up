/*
  Handles set toggles for enabling/disabling different tile and yaku sets.
  Displays sample tile images (first tile in sequence of that set) or "YAKU" text on the toggles.
  Warning text indicates that changing sets will reset progress.
*/

export default function SetToggles({
  enabledSets,
  toggleSet,
  tileFolder,
  frontFrame
}) {
  const sampleTile = {
    man: 'Man1',
    pin: 'Pin1',
    sou: 'Sou1',
    winds: 'Ton',
    dragons: 'Hatsu',
    yaku: null
  };

  return (
    <>
      <div className="button-row mt-5">
        {Object.keys(enabledSets).map((setName) => {
          const tile = sampleTile[setName];
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
              {tile ? (
                <div
                  className="toggle-tile-frame"
                  style={{ backgroundImage: `url(${frontFrame})` }}
                >
                  <img
                    src={`${import.meta.env.BASE_URL}/tiles/${tileFolder}/${tile}.png`}
                    className="tile-img"
                    draggable={false}
                  />
                </div>
              ) : (
                <div
                  className="toggle-tile-frame"
                  style={{ backgroundImage: `url(${frontFrame})` }}
                >
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
    </>
  );
}
