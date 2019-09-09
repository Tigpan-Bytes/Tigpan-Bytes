// Dungeon Generator
// Timothy Letkeman
// Thursday 6th September, 2019
//
// Extra for Experts:
// - more complicated than expected of cs30 because it deals with classes, inheritance, and enumerators
// - Also its just pretty darn complicated period.
// - You have to place rooms, then fill everything in with a maze, then connect the seperate regions, the erase dead ends

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

		this.region = -1;
		this.walled = true;

		this.r = closedBrightness;
		this.g = closedBrightness;
		this.b = closedBrightness;
	}

	render()
	{
		//If its black then don't even bother drawing a rect
		if (this.r === 0 && this.g === 0 && this.b === 0)
		{
			return;
		}
		if (cellOutline)
		{
			stroke(this.r - 130, this.g - 130, this.b - 130);
		}
		fill(this.r, this.g, this.b);
		rect(this.x * pixelsPerCell, this.y * pixelsPerCell, pixelsPerCell, pixelsPerCell)
	}

	setOpen()
	{
		this.r = openBrightness;
		this.g = openBrightness;
		this.b = openBrightness;

		this.walled = false;
	}

	setClosed()
	{
		this.r = closedBrightness;
		this.g = closedBrightness;
		this.b = closedBrightness;

		this.walled = true;
	}

	changeColour(newR, newG, newB)
	{
		this.r = newR;
		this.g = newG;
		this.b = newB;
	}
}

class VertexMazeCell extends MazeCell
{
	constructor(x, y) 
	{
		super(x, y);
		this.allCells = null;
		this.isStart = false;

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

	setStart()
	{
		this.isStart = true;
		this.changeColour(0,255,0);
	}

	awake(region)
	{
		this.region = region;
		this.walled = false;
		this.setOpen();
	}

	setPassage(direction, type)
	{
		//initilizes a direction
		this.setSoloPassage(direction, type);
		if (type == Passage.Open)
		{
			//if the direction is set to be open change the color of the cell
			this.allCells[this.x + VertexMazeCell.getDirectionX(direction)][this.y + VertexMazeCell.getDirectionY(direction)].setOpen();
			this.allCells[this.x + VertexMazeCell.getDirectionX(direction)][this.y + VertexMazeCell.getDirectionY(direction)].region = this.region;
		}
		if (this.neighbors[direction] !== null)
		{
			this.neighbors[direction].setSoloPassage((direction + 2) % 4, type);
		}
	}

	get getAvailableDirection()
	{
		//returns an UNBIASED direction that hasn't been initilized and NaN if all directions are used (although that should never be called)
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
		//just sets a direction for itself and ups the initilized edge count
		this.initializedEdgeCount++;
		this.passages[direction] = type;
	}

	static getDirectionX(direction)
	{			// East			 	// West
		return direction == 1 ? 1 : direction == 3 ? -1 : 0
	}

	static getDirectionY(direction)
	{			// North			 // South
		return direction == 0 ? 1 : direction == 2 ? -1 : 0
	}
}

const openBrightness = 255;

const closedBrightness = 0;

//preset values
let roomAttempts = 80;
let roomMaxSize = 3;
let roomMinSize = 1;

let deadEndRemoval = 0.85;
let randomConnection = 0.005;
let pixelsPerCell = 16;
let cellOutline = true;

let cells;

let cols;
let vertexCols = 15;
let rows;
let vertexRows = 15;

let activeCells;
let curRegion;
let startCell;
let rooms;

let hasGenerated = false;

let xSizeSlider;
let ySizeSlider;
let pixelsPerCellSlider;
let roomAttemptsSlider;
let roomMinSizeSlider;
let roomMaxSizeSlider;
let deadEndRemovalSlider;
let randomConnectionSlider;

let generateButton;
let defaultsButton;

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
	createGui();
}

function createGui()
{
	//Basic setup of starting gui area
	createCanvas(780, 370);

	//gui elements to edit rules
	xSizeSlider = createSlider(5, 400, vertexCols, 5);
	xSizeSlider.position(10, 10);
	xSizeSlider.style('width', '500px');

	ySizeSlider = createSlider(5, 400, vertexRows, 5);
	ySizeSlider.position(10, 40);
	ySizeSlider.style('width', '500px');

	pixelsPerCellSlider = createSlider(2, 64, pixelsPerCell, 1);
	pixelsPerCellSlider.position(10, 70);
	pixelsPerCellSlider.style('width', '500px');

	roomAttemptsSlider = createSlider(0, 5000, roomAttempts, 25);
	roomAttemptsSlider.position(10, 100);
	roomAttemptsSlider.style('width', '500px');

	roomMinSizeSlider = createSlider(1, 20, roomMinSize, 1);
	roomMinSizeSlider.position(10, 130);
	roomMinSizeSlider.style('width', '500px');

	roomMaxSizeSlider = createSlider(1, 20, roomMaxSize, 1);
	roomMaxSizeSlider.position(10, 160);
	roomMaxSizeSlider.style('width', '500px');

	deadEndRemovalSlider = createSlider(0, 1, deadEndRemoval, 0.01);
	deadEndRemovalSlider.position(10, 190);
	deadEndRemovalSlider.style('width', '500px');

	randomConnectionSlider = createSlider(0, 0.1, randomConnection, 0.001);
	randomConnectionSlider.position(10, 220);
	randomConnectionSlider.style('width', '500px');

	generateButton = createButton('Generate');
	generateButton.position(10, 250);
	generateButton.mousePressed(reset);

	defaultsButton = createButton('Reset Defaults');
	defaultsButton.position(90, 250);
	defaultsButton.mousePressed(setDefaults);

	hasGenerated = false;
}

function setDefaults()
{
	xSizeSlider.value(15);
	ySizeSlider.value(15);
	roomAttemptsSlider.value(80);
	roomMinSizeSlider.value(1);
	roomMaxSizeSlider.value(3);
	pixelsPerCellSlider.value(16);
	deadEndRemovalSlider.value(0.85);
	randomConnectionSlider.value(0.005);
}

function reset()
{
	//starts the generation process

	//gets rules from gui
	vertexCols = xSizeSlider.value();
	vertexRows = ySizeSlider.value();
	pixelsPerCell = pixelsPerCellSlider.value();
	roomAttempts = roomAttemptsSlider.value();
	if (roomAttempts == 0)
	{
		roomAttempts = 1;
	}
	roomMinSize = roomMinSizeSlider.value();
	roomMaxSize = roomMaxSizeSlider.value();
	deadEndRemoval = deadEndRemovalSlider.value();
	randomConnection = randomConnectionSlider.value();

	//erases the gui
	xSizeSlider.remove();
	ySizeSlider.remove();
	pixelsPerCellSlider.remove();
	roomAttemptsSlider.remove();
	roomMinSizeSlider.remove();
	roomMaxSizeSlider.remove();
	deadEndRemovalSlider.remove();
	randomConnectionSlider.remove();
	generateButton.remove();
	defaultsButton.remove();

	//Cells are organized as such (V = Vertex, R = Regular)
	
	// R R R R R
	// R V R V R
	// R R R R R
	// R V R V R
	// R R R R R

	cols = vertexCols * 2 + 1;
	rows = vertexRows * 2 + 1;

	hasGenerated = true;
	createCanvas(cols * pixelsPerCell, rows * pixelsPerCell);

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

	//sets up the vertex cells with their position and the list of all cells
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
	curRegion = 0;

	generateRooms(); // places the rooms
	generateMaze(); // fills in remaining space with maze corridors
	connectRegions(); // connects rooms and mazes
	removeDeadEnds(); // removes some dead ends in maze corridors
	setEnd(); // decides what the ending room should be
	render(); // renders everything
}

function generateRooms() // places the rooms
{
	rooms = new Array();
	//attempts to place rooms
	for (let i = 0; i < roomAttempts; i++)
	{
		let xSize = floor(random(roomMinSize, roomMaxSize + 1));
		let ySize = floor(random(roomMinSize, roomMaxSize + 1));

		let xPos = floor(random(0, vertexCols - xSize));
		let yPos = floor(random(0, vertexRows - ySize));

		//checks if the room is not overlapping other rooms
		let succeded = true;
		for (let x = xPos; x < xPos + xSize + 1; x++)
		{
			for (let y = yPos; y < yPos + ySize + 1; y++)
			{
				if (!cells[x * 2 + 1][y * 2 + 1].walled)
				{
					succeded = false;
					break;
				}
			}
			if (!succeded)
			{
				break;
			}
		}
		if (succeded)
		{
			//if its valid pick a color then fill in all the cells with the color and region data
			let colour = floor(random(0,3));
			let r;
			let g;
			let b;
			
			if (colour == 0)
			{
				r = 255 - floor(random(0, 50));
				g = 255 - floor(random(30, 140));
				b = 255 - floor(random(30, 140));
			}
			else if (colour == 1)
			{
				r = 255 - floor(random(30, 140));
				g = 255 - floor(random(0, 50));
				b = 255 - floor(random(30, 140));
			}
			else
			{
				r = 255 - floor(random(30, 140));
				g = 255 - floor(random(30, 140));
				b = 255 - floor(random(0, 50));
			}

			for (let x = xPos * 2 + 1; x < (xPos + xSize) * 2 + 2; x++)
			{
				for (let y = yPos * 2 + 1; y < (yPos + ySize) * 2 + 2; y++)
				{
					cells[x][y].walled = false;
					cells[x][y].changeColour(r,g,b);
					cells[x][y].region = curRegion;
				}
			}
			//save the room for future use during the decision to place the end
			rooms.push([xPos, yPos, xSize, ySize]);
			curRegion++;
		}
	}
}

function generateMaze()  // fills in remaining space with maze corridors
{
	//while there are valid positions to place the maze
	let pos = getValidPosition();
	while (pos !== null)
	{
		//the maze algoritim works like this
		//1. pick a cell to be patient zero
		//2. move along available edges placing cells and add every cell to a list
		//3. if the cell has no more edges to initilize then remove it from the list
		//4. if the front item in the list was removed then use the next
		//5. quit when there are no more cells in the list

		activeCells = new Array();
		activeCells.push(cells[pos[0]][pos[1]]);
		activeCells[0].awake(curRegion);

		while (activeCells.length > 0)
		{
			doMazeGen();
		}
		curRegion++;
		pos = getValidPosition();
	}
}

function connectRegions()  // connects rooms and mazes
{
	let regions = new Array(curRegion);
	for (let i = 0; i < curRegion; i++)
	{
		regions[i] = new Array();
	}

	//add all possible region connections to a list
	for (let x = 1; x < cols - 1; x++)
	{
		for (let y = 1; y < rows - 1; y++)
		{
			for (let d = 0; d < 4; d++) 
			{
				//Dont go off the edge looking for connections	
				if ((y == 1 || y == 2) && d == 2)
				{
					continue;
				} 
				if ((x == 1 || x == 2) && d == 3)
				{
					continue;
				} 
				if ((y == rows - 2 || y == rows - 3) && d == 0)
				{
					continue;
				} 
				if ((x == cols - 2 || x == cols - 3) && d == 1)
				{
					continue;
				} 

				let cellOne = cells[x][y];
				let cellTwo = cells[x + VertexMazeCell.getDirectionX(d) * 2][y + VertexMazeCell.getDirectionY(d) * 2];

				if (cellOne.region !== -1 && cellTwo.region !== -1 && cellOne.region !== cellTwo.region)
				{
					regions[cellOne.region].push([cellTwo.region, x + VertexMazeCell.getDirectionX(d), y + VertexMazeCell.getDirectionY(d)]);
				}
			}
		}
	}

	//[0] == otherRegion, [1] == x, [2] == y
	// when a region is conencted add all of its connections to the first region. only connect with regions that haven't been connected with yet.
	let mergedRegions = new Array(0);
	mergedRegions.push(0);
	while (regions[0].length > 0)
	{
		let connection = regions[0][floor(random(0, regions[0].length))];
		cells[connection[1]][connection[2]].setOpen();

		while (regions[connection[0]].length > 0)
		{
			regions[0].push(regions[connection[0]].pop());
		}

		mergedRegions.push(connection[0]);
		for (let j = 0; j < regions[0].length; j++)
		{
			if (mergedRegions.includes(regions[0][j][0]))
			{
				//chance to randomly open connection
				if (random(1) < randomConnection && canRandomlyConnect(regions[0][j][1], regions[0][j][2]))
				{
					cells[regions[0][j][1]][regions[0][j][2]].setOpen();
				}
				regions[0].splice(j, 1);
				j--;
			}
		}
	}
}

function removeDeadEnds() // removes some dead ends in maze corridors
{
	//get a list of all deadends with the direction of the only path
	let deadEnds = new Array();
	for (let x = 0; x < vertexCols; x++)
	{
		for (let y = 0; y < vertexRows; y++)
		{
			let dir = isDeadEnd([x * 2 + 1, y * 2 + 1]);
			if (dir !== null)
			{
				deadEnds.push([dir, x * 2 + 1, y * 2 + 1]);
			}
		}
	}

	//set a dead end as the start
	let index = floor(random(0, deadEnds.length));
	startCell = cells[deadEnds[index][1]][deadEnds[index][2]];
	deadEnds.splice(index, 1);
	startCell.setStart();

	//kill deadends
	for (let i = 0; i < deadEnds.length; i++)
	{
		if (random(1) < deadEndRemoval)
		{
			let pos = [deadEnds[i][1], deadEnds[i][2]];
			let dir = deadEnds[i][0];
			while (dir !== null)
			{
				cells[pos[0]][pos[1]].setClosed();
				pos[0] = pos[0] + VertexMazeCell.getDirectionX(dir);
				pos[1] = pos[1] + VertexMazeCell.getDirectionY(dir);
				dir = isDeadEnd(pos);
			}
		}
	}
}

function setEnd() // decides what the ending room should be
{
	//picks farthest room (with randomness)

	let heighestDistance = -5318008; // heh boobies
	let heighestRoomIndex = -1;
	for (let i = 0; i < rooms.length; i++) //0 == xPos, 1 == yPos, 2 == xSize, 3 == ySize
	{
		let x = Math.abs(startCell.x - rooms[i][0] * 2 + 1 + rooms[i][2] / 2) + random(0, vertexCols);
		let y = Math.abs(startCell.y - rooms[i][1] * 2 + 1 + rooms[i][3] / 2) + random(0, vertexRows);
		let distance = Math.sqrt(x * x + y * y) * random(0.2, 1) * random(0.2, 1);
		if (random(1) < 0.1)
		{
			distance *= 1.5;
			if (random(1) < 0.1)
			{
				distance *= 1.5;
			}
		}
		if (distance > heighestDistance)
		{
			heighestDistance = distance;
			heighestRoomIndex = i;
		}
	}

	//set one of the non-edge cells in the room to 
	cells[rooms[heighestRoomIndex][0] * 2 + 2 + floor(random(0, rooms[heighestRoomIndex][2] * 2 - 1))][rooms[heighestRoomIndex][1] * 2 + 2 + floor(random(0, rooms[heighestRoomIndex][3] * 2 - 1))].changeColour(255, 0, 0);
}

function isDeadEnd(pos)
{
	//is a cell a dead end
	let count = 0;
	let dir = null;
	for (let i = 0; i < 4 && count <= 1; i++)
	{
		if (!cells[pos[0] + VertexMazeCell.getDirectionX(i)][pos[1] + VertexMazeCell.getDirectionY(i)].walled)
		{
			dir = i;
			count++;
		}
	}
	return count == 1 ? dir : null;
}

function canRandomlyConnect(x, y)
{
	//a cell can only randomly connect if it has only two adjacent non walled blocks
	let count = 0;
	for (let i = 0; i < 4 && count <= 2; i++)
	{
		if (!cells[x + VertexMazeCell.getDirectionX(i)][y + VertexMazeCell.getDirectionY(i)].walled)
		{
			count++;
		}
	}
	return count == 2 ? true : false;
}

function getValidPosition()
{
	//gets a NON-BIASED valid position
	let xStart = floor(random(0, vertexCols));
	let yStart = floor(random(0, vertexRows));

	let x = xStart;
	let y = yStart;

	do
	{
		do
		{
			if (cells[x * 2 + 1][y * 2 + 1].walled)
			{
				return [x * 2 + 1, y * 2 + 1];
			}
			y = (y + 1) % vertexRows;
		} while(y != yStart)
		x = (x + 1) % vertexCols;
	} while(x != xStart)

	return null;
}

function isInBounds(x, y)
{
	return x >= 0 && y >= 0 && x < cols - 1 / 2 && y < rows - 1 / 2;
}

function doMazeGen()
{
	//get the most recent cell in the list
	let curIndex = activeCells.length - 1;

	if (activeCells[curIndex].initializedEdgeCount === 4)
	{
		//if all edges are initilized remove it.
		activeCells.pop();
		return;
	}

	let dir = activeCells[curIndex].getAvailableDirection;
	let x = activeCells[curIndex].x + VertexMazeCell.getDirectionX(dir) * 2;
	let y = activeCells[curIndex].y + VertexMazeCell.getDirectionY(dir) * 2;

	if (isInBounds(x,y) && cells[x][y].walled) //sets a walkable passage
	{
		activeCells[curIndex].setPassage(dir, Passage.Open);
		activeCells.push(cells[x][y]);
		cells[x][y].awake(curRegion);
	}
	else //initilize a wall
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

function render() // renders the dungeon
{
	//draw background colour
	background(0);
	noStroke();
	strokeWeight(0.5); 

	for (let x = 0; x < cols; x++)
	{
		for (let y = 0; y < rows; y++)
		{
			cells[x][y].render();
		}
	}
}

function draw() // draws only the gui when the dungeon isn't generated
{
	if (!hasGenerated)
	{	
		background(255);

		fill('rgba(30%,60%,20%,0.6)');
		rect(0,0,780,370);

		textSize(20);
		fill(0);
		noStroke();

		text('X Size: ' + xSizeSlider.value(), 520, 30);
		text('Y Size: ' + ySizeSlider.value(), 520, 60);
		text('Pixels Per Cell: ' + pixelsPerCellSlider.value(), 520, 90);
		if (roomAttemptsSlider.value() == 0)
		{
			text('Room Attempts: 1', 520, 120);
		}
		else
		{
			text('Room Attempts: ' + roomAttemptsSlider.value(), 520, 120);
		}
		text('Room Min Size: ' + roomMinSizeSlider.value(), 520, 150);
		text('Room Max Size: ' + roomMaxSizeSlider.value(), 520, 180);
		text('Dead End Removal: ' + deadEndRemovalSlider.value(), 520, 210);
		text('Random Connection: ' + randomConnectionSlider.value(), 520, 240);
		text('Right click on the finished dungeon to save it as an image.', 10, 295);
		text('Press G to regenerate using the same settings.', 10, 325);
		text('Press R to return to the options.', 10, 355);
	}
}

function keyPressed() // regenerate the maze or go back to options
{
	if (hasGenerated && keyCode === 71)  //g
	{
		reset();
	}
	if (hasGenerated && keyCode === 82)  //r
	{
		createGui();
	}
}