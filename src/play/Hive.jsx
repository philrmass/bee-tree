// Seven hexagons in rows of 2-3-2, the center letter in the middle.
export function Hive({ center, outer, onLetter }) {
  const cell = (letter, isCenter = false) => (
    <button
      key={letter}
      class={`cell${isCenter ? ' center' : ''}`}
      onClick={() => onLetter(letter)}
      aria-label={letter}
    >
      {letter}
    </button>
  );

  return (
    <div class="hive">
      <div class="hive-row">{outer.slice(0, 2).map((l) => cell(l))}</div>
      <div class="hive-row">
        {cell(outer[2])}
        {cell(center, true)}
        {cell(outer[3])}
      </div>
      <div class="hive-row">{outer.slice(4, 6).map((l) => cell(l))}</div>
    </div>
  );
}
