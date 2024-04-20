const edge = 4;
const width = 1200;
const height = 700;
const rows = height / edge;
const cols = width / edge;

const moldOpacity = 10;
const fpsDefault = 30;
const densityDefault = 0.15;

let grid;
let isLooping = true;
let moldMode = false;

function setup() {
  createCanvas(width, height).parent("display");

  colorMode(HSB, 360, 255, 255, 100);
  frameRate(fpsDefault);
  noStroke();

  setupControls();

  grid = makeGrid(rows, cols, densityDefault);
}

function draw() {
  if (!moldMode) clear();

  const fps = select("#fps");
  frameRate(fps ? fps.value() : fpsDefault);

  updateGrid();
  drawGrid();
}

// Place and Remove cells with mouse
function mousePressed() {
  if (isLooping) return;

  const col = Math.floor(mouseX / edge);
  const row = Math.floor(mouseY / edge);

  if (col >= 0 && col < cols && row >= 0 && row < rows) {
    grid[row][col] = 1 - grid[row][col];
    fill(grid[row][col] ? 0 : 255);
    rect(col * edge, row * edge, edge - 1, edge - 1);
  }
}

function updateGrid() {
  const newGrid = makeGrid(rows, cols);
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const neighbors = countNeighbors(i, j);
      newGrid[i][j] = grid[i][j]
        ? neighbors === 2 || neighbors === 3 ? 1 : 0
        : neighbors === 3 ? 1 : 0;
    }
  }

  grid = newGrid;
}

function makeGrid(rows, cols, density = 0) {
  const arr = Array.from({ length: rows }, () => Array(cols).fill(0));
  return density ? fillGrid(arr, density) : arr;
}

function fillGrid(arr, density) {
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      arr[i][j] = random() < density ? 1 : 0;
    }
  }

  return arr;
}

function countNeighbors(x, y) {
  let count = 0;
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      if (i === 0 && j === 0) continue;
      const row = (x + i + rows) % rows;
      const col = (y + j + cols) % cols;
      count += grid[row][col];
    }
  }

  return count;
}

function drawGrid() {
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (grid[i][j]) {
        fill(floor(random(360)), 255, 250, moldMode ? moldOpacity : 100);
        rect(j * edge, i * edge, edge - 1, edge - 1);
      }
    }
  }
}

function setupControls() {
  const buttonToggle = select("#toggle");
  const toggleIcon = select("#toggle-i").elt;
  buttonToggle.mouseReleased(() => {
    toggleIcon.classList.toggle("fa-pause");
    toggleIcon.classList.toggle("fa-play");
    isLooping = !isLooping;
    isLooping ? loop() : noLoop();
  });

  const buttonStep = select("#step");
  buttonStep.mouseReleased(() => {
    if (!isLooping) {
      draw();
    }
  });

  const buttonReset = select("#reset");
  buttonReset.mouseReleased(() => {
    grid = makeGrid(rows, cols, densityDefault);
    if (moldMode) clear();
    draw();
  });

  const buttonClear = select("#clear");
  buttonClear.mouseReleased(() => {
    grid = makeGrid(rows, cols);
    if (moldMode) clear();
    draw();
  });

  const moldCheckbox = select("#mold");
  moldCheckbox.changed((e) => {
    moldMode = e.target.checked;
  });
}
