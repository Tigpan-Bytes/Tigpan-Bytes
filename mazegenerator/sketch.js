// Birbs/Boids
// Timothy Letkeman
// Wednesday 5th September, 2019
//
// Extra for Experts:
// - more complicated than expected of cs30 because it deals with classes and whatnot
// - Gui for editing rules
// - decently complicated to implement all of the rules

let Passage = {
	Unused: 0,
	Open: 1,
	Blocked: 2
};

let Directions = {
	North: 0,
	East: 1,
	South: 2,
	West: 3
};

class MazeCell 
{
	constructor() 
	{
		this.x = NaN;
		this.y = NaN;

		this.neighbors = null;
		this.passages = new Array(4);
	}

	setup(x, y, neighbors)
	{
		this.x = x;
		this.y = y;

		this.neighbors = null;
		for (let i = 0; i < 4; i++)
		{
			this.passages = Passage.Unused;
		}
	}

	setPassage(direction, type)
	{
		this.passages[direction] = type;
		this.passages[direction] = type;
		if (this.neighbors[direction] !== null)
		{
			this.neighbors[direction].setPassage((direction + 2) % 4, type);
		}
	}

	render()
	{
		return rect(this.x * pixelsPerCell, this.y * pixelsPerCell, pixelsPerCell, pixelsPerCell);
	}
}

//preset values
let roomAttempts = 150;
let roomMaxSize = 3;
let roomMinSize = 2;

let pixelsPerCell = 16;

let cells;
let cols;
let rows;

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
	//caps frames at 60
	frameRate(60);
	//Basic setup of starting flight area 
	createCanvas(windowWidth, windowHeight);

	reset();
}

function reset()
{
	cols = Math.floor((windowWidth / pixelsPerCell) / 2) * 2 - 1;
	rows = Math.floor((windowHeight / pixelsPerCell) / 2) * 2 - 1;

	cells = get2dArray(cols, rows);
	for (let x = 0; x < cols; x++)
	{
		for (let y = 0; y < rows; y++)
		{
			cells[x][y] = new MazeCell();
		}
	}

	for (let x = 0; x < cols; x++)
	{
		for (let y = 0; y < rows; y++)
		{
			cells[x][y].setup(x, y, [getCell(x, y + 1), getCell(x + 1, y), getCell(x, y - 1), getCell(x - 1,y)]);
		}
	}
}

function getCell(x, y)
{
	if (x >= 0 && y >= 0 && x < cols && y < rows)
	{
		return cells[x][y];
	}
	return null;
}

function draw() 
{
	//draw background colour
	background(0);

	fill(255);
	for (let x = 0; x < cols; x++)
	{
		for (let y = 0; y < rows; y++)
		{
			cells[x][y].render();
		}
	}
}