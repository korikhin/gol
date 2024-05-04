const EDGE = 4;
const CELL = EDGE + 2;
const ROWS = 120;
const COLS = 180;

const fpsDefault = 30;
const moldOpacity = 10;

let grid;
let moldMode;

let pCol = -1;
let pRow = -1;

function setup() {
  createCanvas(COLS * CELL, ROWS * CELL).parent("#display");

  colorMode(HSB, 360, 255, 255, 100);
  frameRate(fpsDefault);
  noStroke();

  setupControls();

  grid = makeGrid(ROWS, COLS, true);
}

function draw() {
  if (!moldMode) background(255);

  const fps = select("#fps");
  frameRate(fps ? fps.value() : fpsDefault);

  updateGrid();
  drawGrid();
}

function makeGrid(rows, cols, toPopulate = false) {
  const arr = Array.from({ length: rows }, () => Array(cols).fill(false));
  return toPopulate ? fillGrid(arr) : arr;
}

function fillGrid(arr) {
  const density = 0.5;

  for (let i = 0; i < ROWS; i++) {
    for (let j = 0; j < COLS; j++) {
      arr[i][j] = random() < density;
    }
  }

  return arr;
}

function updateGrid() {
  const newGrid = makeGrid(ROWS, COLS);
  for (let i = 0; i < ROWS; i++) {
    for (let j = 0; j < COLS; j++) {
      const neighbors = countNeighbors(i, j);
      newGrid[i][j] = grid[i][j]
        ? neighbors === 2 || neighbors === 3
          ? 1
          : 0
        : neighbors === 3
          ? 1
          : 0;
    }
  }

  grid = newGrid;
}

function countNeighbors(x, y) {
  let count = 0;
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      if (i === 0 && j === 0) continue;
      const row = (x + i + ROWS) % ROWS;
      const col = (y + j + COLS) % COLS;
      count += grid[row][col];
    }
  }

  return count;
}

function drawGrid() {
  for (let i = 0; i < ROWS; i++) {
    for (let j = 0; j < COLS; j++) {
      if (grid[i][j]) {
        fill(floor(random(360)), 255, 250, moldMode ? moldOpacity : 100);
        drawCell(i, j);
      }
    }
  }
}

function drawCell(row, col) {
  square(col * CELL + 1, row * CELL + 1, EDGE);
}

function mousePressed() {
  if (isLooping() || moldMode) return;

  const row = Math.floor(mouseY / CELL);
  const col = Math.floor(mouseX / CELL);
  if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return;

  grid[row][col] ? fill(255) : fill(0);
  drawCell(row, col);
  grid[row][col] = !grid[row][col];
}

function mouseMoved() {
  if (isLooping() || moldMode) return;

  const row = Math.floor(mouseY / CELL);
  const col = Math.floor(mouseX / CELL);

  if (pRow >= 0 && pCol >= 0 && !grid[pRow][pCol]) {
    fill(255);
    drawCell(pRow, pCol);
  }

  if (row >= 0 && row < ROWS && col >= 0 && col < COLS) {
    if (!grid[row][col]) {
      fill(0);
      drawCell(row, col);
    }

    pRow = row;
    pCol = col;
  }
}

function setupControls() {
  const buttonToggle = select("#toggle");
  buttonToggle.mouseReleased(function () {
    const icon = this.elt.children[0];
    icon.classList.toggle("fa-pause");
    icon.classList.toggle("fa-play");

    isLooping() ? noLoop() : loop();
  });

  const buttonStep = select("#step");
  buttonStep.mouseReleased(() => {
    if (!isLooping()) {
      redraw();
    }
  });

  const buttonReset = select("#reset");
  buttonReset.mouseReleased(() => {
    grid = makeGrid(ROWS, COLS, true);
    clear();
    if (!isLooping()) {
      drawGrid();
    }
  });

  const buttonClear = select("#clear");
  buttonClear.mouseReleased(() => {
    grid = makeGrid(ROWS, COLS);
    clear();
  });

  const moldCheckbox = select("#mold");
  moldMode = moldCheckbox.checked();
  moldCheckbox.changed(function () {
    moldMode = this.checked();
    if (!isLooping() && !moldMode) {
      clear();
      drawGrid();
    }
  });
}
