// Game of Life
// Timothy Letkeman
// Wednesday 5th September, 2019
//
// Extra for Experts:
// - Loops around screen
// - Gui for editing rules

//preset values
let startingAliveChance = 0.2;

let pixelsPerCell = 16;
let newPixelsPerCell = pixelsPerCell;
let fps = 20;

let lonelyDeath = 1;
let crowdDeath = 4;
let birth = 3;

let cells;
let cols;
let rows;

let fpsSlider;
let lonelyDeathSlider;
let crowdDeathSlider;
let birthSlider;
let startSlider;
let cellSizeSlider;

let resetButton;

function get2dArray(cols, rows)
{
	//returns an empty two dimensional array with the given rows and columns
	let returnable = new Array(cols);
    for (let i = 0; i < cols; i++)
  	{
    	returnable[i] = new Array(rows);
  	}
 	return returnable;
}

function setup() 
{
	//Caps the frame rate
	frameRate(fps);

	//Basic setup of starting board and cells
	createCanvas(windowWidth, windowHeight);

	reset();

	//gui elements to edit rules
	fpsSlider = createSlider(1, 60, fps, 1);
	fpsSlider.position(10, 10);
	fpsSlider.style('width', '100px');

	lonelyDeathSlider = createSlider(-1, 9, lonelyDeath, 1);
	lonelyDeathSlider.position(10, 40);
	lonelyDeathSlider.style('width', '100px');

	crowdDeathSlider = createSlider(-1, 9, crowdDeath, 1);
	crowdDeathSlider.position(10, 70);
	crowdDeathSlider.style('width', '100px');

	birthSlider = createSlider(-1, 9, birth, 1);
	birthSlider.position(10, 100);
	birthSlider.style('width', '100px');

	startSlider = createSlider(0, 1, startingAliveChance, 0.05);
	startSlider.position(10, 130);
	startSlider.style('width', '100px');

	cellSizeSlider = createSlider(4, 64, newPixelsPerCell, 4);
	cellSizeSlider.position(10, 160);
	cellSizeSlider.style('width', '100px');

	resetButton = createButton('Restart');
	resetButton.position(10, 190);
	resetButton.mousePressed(reset);
}

function reset()
{
	//resets the cells and cell sizes
	pixelsPerCell = newPixelsPerCell;
	
	cols = Math.floor(windowWidth / pixelsPerCell);
	rows = Math.floor(windowHeight / pixelsPerCell);

	cells = get2dArray(cols, rows);
  	for (let x = 0; x < cols; x++) 
  	{
    	for (let y = 0; y < rows; y++) 
    	{
			cells[x][y] = (Math.random() <= startingAliveChance) ? 1 : 0;
   	 	}
	}
}

function draw() 
{
	//makes the background black
	background(0);

	//the color of the cells
	fill(255);

	for (let x = 0; x < cols; x++) 
	{
		for (let y = 0; y < rows; y++) 
		{
			if (cells[x][y] == 1)
			{
				//Renders the cell as a square
				rect(x * pixelsPerCell, y * pixelsPerCell, pixelsPerCell, pixelsPerCell);
			}
		}
	}

	//then renders gui stuff
	fill('rgba(60%,100%,30%,0.6)');
	rect(0,0,310,470);

	fps = fpsSlider.value();
	frameRate(fps);
	textSize(20);
	fill(0);
	text('FPS Limit: ' + fps, 140, 30);

	lonelyDeath = lonelyDeathSlider.value();
	text('Lonely Death: ' + lonelyDeath, 140, 60);

	crowdDeath = crowdDeathSlider.value();
	text('Crowd Death: ' + crowdDeath, 140, 90);

	birth = birthSlider.value();
	text('Birth Parents: ' + birth, 140, 120);

	startingAliveChance = startSlider.value();
	text('Starting Alive: ' + startingAliveChance, 140, 150);

	startingAliveChance = startSlider.value();
	text('Starting Alive: ' + startingAliveChance, 140, 150);

	newPixelsPerCell = cellSizeSlider.value();
	text('Cell Size: ' + newPixelsPerCell, 140, 180);

	text('Lonely death means if there are less then or equal to that amount the cell will die. Crowd death means if there are greater then or equal to that amount the cell will die. Birth parents mean if there are exactly that amount then a cell will be born.', 10, 230, 290);

	//gets an array to be the next array of cells
	let nextCells = get2dArray(cols, rows);

	for (let x = 0; x < cols; x++) 
	{
		for (let y = 0; y < rows; y++) 
		{
			//gets the count of alive neighbors
			let count = getNeighborCount(x, y);

			//if you are alive and you are lonely or crowd then die a horrible gruesome death
			if (cells[x][y] == 1 && (count <= lonelyDeath || count >= crowdDeath))
			{
				nextCells[x][y] = false;
			}
			//if you are dead and their are enough neighbors to give birth, then you turn into a cute little baby cube
			else if (cells[x][y] == 0 && count == birth)
			{
				nextCells[x][y] = true;
			}
			//else just take the form of the previous cell
			else
			{			
				nextCells[x][y] = cells[x][y];
			}
		}
	}

	//sets the grid to the new grid
	cells = nextCells;
}

function getNeighborCount(x, y)
{
	//returns the amount of alive neighbors surrounding the given coordinate (wraps around the screen borders as well)
	let count = 0;

	for (let xM = -1; xM <= 1; xM++) 
	{
		for (let yM = -1; yM <= 1; yM++) 
		{
			// you have to add +cols and +rows or else the values may go negitive and throw fatal errors
			count += cells[(x + xM + cols) % cols][(y + yM + rows) % rows];
		}
	}
	//subtracts the state of the middle cell
	count -= cells[x][y];

	return count;
}
