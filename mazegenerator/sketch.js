// Birbs/Boids
// Timothy Letkeman
// Wednesday 5th September, 2019
//
// Extra for Experts:
// - more complicated than expected of cs30 because it deals with classes and whatnot
// - Gui for editing rules
// - decently complicated to implement all of the rules

const Passage = {
	Unused: 0,
	Open: 1,
	Blocked: 2
};

const Directions = {
	North: 0,
	East: 1,
	South: 2,
	West: 3
};

class MazeCell 
{
	constructor(x, y) 
	{
		this.x = x;
		this.y = y;
		
		this.r = closedR;
		this.g = closedG;
		this.b = closedB;
	}

	render()
	{
		fill(this.r, this.g, this.b);
		return rect(this.x * pixelsPerCell, this.y * pixelsPerCell, pixelsPerCell, pixelsPerCell);
	}

	setOpen()
	{
		this.r = openR;
		this.g = openG;
		this.b = openB;
	}

	setClosed()
	{
		this.r = closedR;
		this.g = closedG;
		this.b = closedB;
	}
}

class VertexMazeCell extends MazeCell
{
	constructor(x, y) 
	{
		super(x, y);
		this.allCells = null;
		this.alive = false;

		this.neighbors = null;
		this.initializedEdgeCount = 0;
		this.passages = new Array(4);
	}

	setup(neighbors, allCells)
	{
		this.neighbors = neighbors;
		this.allCells = allCells;
		for (let i = 0; i < 4; i++)
		{
			this.passages[i] = Passage.Unused;
		}
	}

	awake()
	{
		this.alive = true;
		this.setOpen();
	}

	setPassage(direction, type)
	{
		this.setSoloPassage(direction, type);
		if (type == Passage.Open)
		{
			this.allCells[this.x + this.getDirectionX(direction)][this.y + this.getDirectionY(direction)].setOpen();
		}
		if (this.neighbors[direction] !== null)
		{
			this.neighbors[direction].setSoloPassage((direction + 2) % 4, type);
		}
	}

	get getAvailableDirection()
	{
		let skips = floor(random(0, 4 - this.initializedEdgeCount));
		for (let i = 0; i < 4; i++)
		{
			if (this.passages[i] == Passage.Unused)
			{
				if (skips == 0)
				{
					return i;
				}
				skips -= 1;
			}
		}
		return NaN;
	}

	setSoloPassage(direction, type)
	{
		this.initializedEdgeCount++;
		this.passages[direction] = type;
	}

	getDirectionX(direction)
	{			// East			 	// West
		return direction == 1 ? 1 : direction == 3 ? -1 : 0
	}

	getDirectionY(direction)
	{			// North			 // South
		return direction == 0 ? 1 : direction == 2 ? -1 : 0
	}
}

const openR = 255;
const openG = 255;
const openB = 255;

const closedR = 0;
const closedG = 0;
const closedB = 0;

//preset values
let roomAttempts = 150;
let roomMaxSize = 3;
let roomMinSize = 2;

let pixelsPerCell = 16;
let genSpeed = 5;

let cells;
let cols;
let rows;
let activeCells;

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
	frameRate(100);
	//Basic setup of starting flight area 
	createCanvas(windowWidth, windowHeight);

	reset();
}

function reset()
{
	cols = Math.floor((windowWidth / pixelsPerCell) / 2) * 2;
	if (cols + 1 > windowWidth / pixelsPerCell)
	{
		cols--;
	}
	else
	{
		cols++;
	}
	rows = Math.floor((windowHeight / pixelsPerCell) / 2) * 2;
	if (rows + 1 > windowHeight / pixelsPerCell)
	{
		rows--;
	}
	else
	{
		rows++;
	}

	cells = get2dArray(cols, rows);
	for (let x = 0; x < cols; x++)
	{
		for (let y = 0; y < rows; y++)
		{
			if (x % 2 == 1 && y % 2 == 1)
			{
				cells[x][y] = new VertexMazeCell(x, y);
			}
			else
			{
				cells[x][y] = new MazeCell(x, y);
			}
		}
	}

	for (let x = 0; x < cols; x++)
	{
		for (let y = 0; y < rows; y++)
		{
			if (x % 2 == 1 && y % 2 == 1)
			{
				cells[x][y].setup([getCell(x, y + 2), getCell(x + 2, y), getCell(x, y - 2), getCell(x - 2, y)], cells);
			}
		}
	}

	generate();
}

function generate()
{
	activeCells = new Array();
	activeCells.push(cells[floor(random(0, floor(cols / 2))) * 2 + 1][floor(random(0, floor(rows / 2))) * 2 + 1]);
	activeCells[0].awake();
}

function isInBounds(x, y)
{
	return x >= 0 && y >= 0 && x < cols - 1 / 2 && y < rows - 1 / 2;
}

function doMazeGen()
{
	let curIndex = activeCells.length - 1;

	if (activeCells[curIndex].initializedEdgeCount === 4)
	{
		activeCells.pop();
		return;
	}

	let dir = activeCells[curIndex].getAvailableDirection;
	let x = activeCells[curIndex].x + activeCells[curIndex].getDirectionX(dir) * 2;
	let y = activeCells[curIndex].y + activeCells[curIndex].getDirectionY(dir) * 2;

	if (isInBounds(x,y) && !cells[x][y].alive)
	{
		activeCells[curIndex].setPassage(dir, Passage.Open);
		activeCells.push(cells[x][y]);
		cells[x][y].awake();
	}
	else
	{
		activeCells[curIndex].setPassage(dir, Passage.Blocked);
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

	//print(activeCells.length);
	for (let i = 0; i < genSpeed; i++)
	{
		if (activeCells.length > 0)
		{
			doMazeGen();
		}
	}

	noStroke();

	for (let x = 0; x < cols; x++)
	{
		for (let y = 0; y < rows; y++)
		{
			cells[x][y].render();
		}
	}
}