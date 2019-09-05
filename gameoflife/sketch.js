// Ga
// Your Name
// Date
//
// Extra for Experts:
// - describe what you did to take this project "above and beyond"

const startingAliveChance = 0.2;

const pixelsPerCell = 16;
const fps = 20;

const lonelyDeath = 1;
const overcrowdedDeath = 4;
const birthParents = 3;

let cells;
let cols;
let rows;

function get2dArray(cols, rows)
{
	let returnable = new Array(cols);
    for (let i = 0; i < cols; i++)
  	{
    	returnable[i] = new Array(rows);
  	}
 	return returnable;
}

function setup() 
{
	//Basic setup of starting board 
	createCanvas(windowWidth, windowHeight);
	frameRate(fps);

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
	background(0);

	for (let x = 0; x < cols; x++) 
	{
		for (let y = 0; y < rows; y++) 
		{
			if (cells[x][y] == 1)
			{
				let xPos = x * pixelsPerCell;
				let yPos = y * pixelsPerCell;

				fill(255);
				//stroke(0);
				rect(xPos, yPos, pixelsPerCell, pixelsPerCell);
			}
		}
	}

	let nextCells = get2dArray(cols, rows);

	for (let x = 0; x < cols; x++) 
	{
		for (let y = 0; y < rows; y++) 
		{
			let count = getNeighborCount(x, y);

			if (cells[x][y] == 1 && (count <= lonelyDeath || count >= overcrowdedDeath))
			{
				nextCells[x][y] = false;
			}
			else if (cells[x][y] == 0 && count == birthParents)
			{
				nextCells[x][y] = true;
			}
			else
			{			
				nextCells[x][y] = cells[x][y];
			}
		}
	}

	cells = nextCells;
}

function getNeighborCount(x, y)
{
	let count = 0;

	for (let xM = -1; xM <= 1; xM++) 
	{
		for (let yM = -1; yM <= 1; yM++) 
		{
			count += cells[(x + xM + cols) % cols][(y + yM + rows) % rows];
		}
	}
	count -= cells[x][y];

	return count;
}
