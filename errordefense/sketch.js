// Game of Life
// Timothy Letkeman
// Wednesday 5th September, 2019
//
// Extra for Experts:
// - Loops around screen
// - Gui for editing rules

//preset values
let cells;

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
	frameRate(60);

	//Basic setup of starting board and cells
	createCanvas(windowWidth, windowHeight);
}

function draw() 
{
	//makes the background black
	background(0);

	//the color of the cells
	noFill();
	fill(255);

	ellipse(mouseX, mouseY, 20, 20);
}
