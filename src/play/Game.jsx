import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { checkGuess, puzzleLetters } from '../../utilities/solver.js';
import { getRank, isPangram, totalScore, wordScore } from '../../utilities/score.js';
import { buildHintRows, revealNext } from '../../utilities/hints.js';
import { loadProgress, saveProgress } from '../progress.js';
import { Hive } from './Hive.jsx';
import { Hints } from './Hints.jsx';
import { Found } from './Found.jsx';
import { Ranks } from './Ranks.jsx';

const MESSAGES = {
  'too-short': 'Too short',
  'bad-letters': 'Bad letters',
  'missing-center': 'Missing center letter',
  'not-in-list': 'Not in word list',
  'already-found': 'Already found',
};
const MAX_WORD = 19;

function shuffled(letters) {
  const out = [...letters];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function Game({ puzzle, showRanks, onToggleRanks }) {
  const { date, center, outer, answers } = puzzle;
  const letters = useMemo(() => puzzleLetters(center, outer).join(''), [center, outer]);
  const [progress, setProgress] = useState(() => loadProgress(date));
  const [word, setWord] = useState('');
  const [order, setOrder] = useState(outer);
  const [message, setMessage] = useState(null);
  const timer = useRef(null);

  useEffect(() => saveProgress(date, progress), [date, progress]);
  useEffect(() => () => clearTimeout(timer.current), []);

  function flash(text, kind) {
    clearTimeout(timer.current);
    setMessage({ text, kind });
    timer.current = setTimeout(() => setMessage(null), 1600);
  }

  function submit() {
    if (!word) return;
    const result = checkGuess(word, puzzle, progress.found);
    if (result.ok) {
      const points = wordScore(result.word, letters);
      setProgress((p) => ({ ...p, found: [...p.found, result.word] }));
      flash(isPangram(result.word, letters) ? `Pangram! +${points}` : `+${points}`, 'good');
    } else {
      flash(MESSAGES[result.reason], 'bad');
    }
    setWord('');
  }

  const type = (letter) => setWord((w) => (w.length < MAX_WORD ? w + letter : w));
  const erase = () => setWord((w) => w.slice(0, -1));
  const shuffle = () => setOrder((o) => shuffled(o));

  // Typing on a keyboard works anywhere on the page.
  const submitRef = useRef(submit);
  submitRef.current = submit;
  useEffect(() => {
    function onKey(event) {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.target.closest?.('input, textarea, select')) return;
      if (/^[a-z]$/i.test(event.key)) {
        type(event.key.toLowerCase());
      } else if (event.key === 'Backspace') {
        erase();
      } else if (event.key === 'Enter') {
        submitRef.current();
      } else {
        return;
      }
      event.preventDefault();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const score = totalScore(progress.found, letters);
  const maxScore = totalScore(answers, letters);
  const rank = getRank(score, maxScore);
  const rows = buildHintRows(answers, progress.found, progress.reveals);
  const show = (row) => setProgress((p) => ({ ...p, reveals: revealNext(row, p.reveals) }));

  return (
    <>
      <button class="score-toggle" aria-expanded={showRanks} onClick={onToggleRanks}>
        <span class={`disclosure${showRanks ? ' open' : ''}`}>
          Score <strong>{score}</strong> · {rank.name}
        </span>
      </button>

      <div class={`play-area${showRanks ? ' with-ranks' : ''}`}>
        <div class="puzzle">
          <div class="entry">
            <div class="word" aria-live="polite">
              {[...word].map((l, i) => (
                <span key={i} class={l === center ? 'center' : letters.includes(l) ? '' : 'invalid'}>
                  {l}
                </span>
              ))}
              <span class="caret" />
            </div>
            <div class={`message ${message?.kind ?? ''}`}>{message?.text ?? ' '}</div>
          </div>

          <Hive center={center} outer={order} onLetter={type} />

          <div class="controls">
            <button onClick={erase}>Delete</button>
            <button onClick={shuffle} aria-label="Shuffle">Shuffle</button>
            <button onClick={submit}>Enter</button>
          </div>
        </div>
        {showRanks && <Ranks score={score} maxScore={maxScore} />}
      </div>

      <Hints rows={rows} found={progress.found.length} total={answers.length} onShow={show} />
      <Found found={progress.found} letters={letters} />
    </>
  );
}
