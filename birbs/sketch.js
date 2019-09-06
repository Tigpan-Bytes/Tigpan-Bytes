// Ga
// Your Name
// Date
//
// Extra for Experts:
// - describe what you did to take this project "above and beyond"

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
	//Basic setup of starting board 
	createCanvas(windowWidth, windowHeight);
}

function draw() 
{
	background(180);
}