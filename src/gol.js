const EDGE = 10;
const CELL = EDGE + 2;
const ROWS = 60;
const COLS = 106;
const FPS = 30;
const OPACITY = 10;

let cells;
let traceMode;

let pRow, pCol;

function setup() {
  createCanvas(COLS * CELL, ROWS * CELL).parent("display");

  colorMode(HSB, 360, 100, 100, 100);
  frameRate(FPS);
  drawGrid();

  setupControls();
  cells = makeCells(ROWS, COLS, true /* populate */);
}

function draw() {
  if (!traceMode) {
    clear();
    drawGrid();
  }

  const fps = select("#fps");
  frameRate(fps ? fps.value() : FPS);

  updateCells();
  drawCells();
}

function drawGrid() {
  stroke(232, 60, 98, 30); // NOTE: --color-blue with an alpha of 30%

  for (let d = CELL; d < Math.max(height, width); d += CELL) {
    if (d < height) line(0, d, width, d);
    if (d < width) line(d, 0, d, height);
  }
}

function mousePressed() {
  if (isLooping() || traceMode) return;

  const row = Math.floor(mouseY / CELL);
  const col = Math.floor(mouseX / CELL);
  if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return;

  fill(0);
  drawCell(row, col);
  cells[row][col] = !cells[row][col];

  return false;
}

function mouseDragged() {
  if (isLooping() || traceMode) return;

  const row = Math.floor(mouseY / CELL);
  const col = Math.floor(mouseX / CELL);
  if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return;

  fill(0);
  if (!cells[row][col]) {
    drawCell(row, col);
    cells[row][col] = true;
  }

  return false;
}

function mouseMoved() {
  if (isLooping() || traceMode || mouseIsPressed) return;

  const row = Math.floor(mouseY / CELL);
  const col = Math.floor(mouseX / CELL);

  fill(0);
  if (pRow >= 0 && pCol >= 0 && !cells[pRow][pCol]) {
    erase();
    drawCell(pRow, pCol);
    noErase();
  }
  if (row >= 0 && row < ROWS && col >= 0 && col < COLS) {
    if (!cells[row][col]) {
      drawCell(row, col);
    }

    pRow = row;
    pCol = col;
  }

  return false;
}

function makeCells(rows, cols, toPopulate = false) {
  const arr = Array.from({ length: rows }, () => Array(cols).fill(false));
  return toPopulate ? fillCells(arr) : arr;
}

function fillCells(arr) {
  const density = 0.5;

  for (let i = 0; i < ROWS; i++) {
    for (let j = 0; j < COLS; j++) {
      arr[i][j] = random() < density;
    }
  }

  return arr;
}

function updateCells() {
  const newCells = makeCells(ROWS, COLS);
  for (let i = 0; i < ROWS; i++) {
    for (let j = 0; j < COLS; j++) {
      const neighbors = countNeighbors(i, j);
      newCells[i][j] = cells[i][j]
        ? neighbors === 2 || neighbors === 3
          ? 1
          : 0
        : neighbors === 3
          ? 1
          : 0;
    }
  }

  cells = newCells;
}

function drawCell(row, col) {
  noStroke();
  square(col * CELL + 1, row * CELL + 1, EDGE);
}

function drawCells() {
  for (let i = 0; i < ROWS; i++) {
    for (let j = 0; j < COLS; j++) {
      if (cells[i][j]) {
        fill(floor(random(360)), 100, 100, traceMode ? OPACITY : 100);
        drawCell(i, j);
      }
    }
  }
}

function countNeighbors(x, y) {
  let count = 0;
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      if (i === 0 && j === 0) continue;
      const row = (x + i + ROWS) % ROWS;
      const col = (y + j + COLS) % COLS;
      count += cells[row][col];
    }
  }

  return count;
}

function setupControls() {
  const buttonToggle = select("#toggle");
  buttonToggle.mouseClicked(function () {
    const icon = this.elt.children[0];
    icon.classList.toggle("fa-pause");
    icon.classList.toggle("fa-play");

    isLooping() ? noLoop() : loop();
  });

  const buttonStep = select("#step");
  buttonStep.mouseClicked(() => {
    if (!isLooping()) {
      redraw();
    }
  });

  const buttonReset = select("#reset");
  buttonReset.mouseClicked(() => {
    clear();
    cells = makeCells(ROWS, COLS, true);
    if (!isLooping()) {
      drawCells();
    }
  });

  const buttonClear = select("#clear");
  buttonClear.mouseClicked(() => {
    clear();
    cells = makeCells(ROWS, COLS);
  });

  const traceCheckbox = select("#trace");
  traceMode = traceCheckbox.checked();
  traceCheckbox.changed(function () {
    traceMode = this.checked();
  });
}
