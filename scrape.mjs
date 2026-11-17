console.log('Bee Tree');

function findObjectInString(str) {
  let count = 0;
  let start = -1;
  let end = -1;

  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    if (char === '{') {
      count++;
      if (start === -1) {
        start = i;
      }
    }
    if (char === '}') {
      count--;
      if (count == 0) {
        end = i;
        break;
      }
    }
  }

  if (start >= 0 && end >= 0) {
    try {
      return JSON.parse(str.slice(start, end + 1));
    } catch (err) {
      console.log('ERR', err);
      return null;
    }
  }
}

async function scrapeCurrentPuzzle() {
  const url = 'https://www.nytimes.com/puzzles/spelling-bee';
  const response = await fetch(url);
  const text = await response.text();

  const start = 'window.gameData';
  const startIndex = text.indexOf(start);

  if (startIndex === -1) {
    return null;
  }

  const index = startIndex + start.length;
  const { today } = findObjectInString(text.slice(index));
  const { printDate, validLetters, answers } = today;

  return {
    date: printDate,
    letters: validLetters,
    answers,
  };
}

async function run() {
  const path = './data';
  const puzzle = await scrapeCurrentPuzzle();

  console.log('SAVE', path, puzzle);
}

run();
