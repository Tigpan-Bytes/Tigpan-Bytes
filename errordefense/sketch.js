// Game of Life
// Timothy Letkeman
// Thursday 12th September, 2019
//
// Extra for Experts:
// - Loops around screen
// - Gui for editing rules

class Tile
{
	constructor(x, y, walkable, buildable)
	{
		this.x = x;
		this.y = y;
		this.walkable = walkable;
		this.buildable = buildable;

		this.tower = null;

		this.north;
		this.south;
		this.east;
		this.west;

		this.nextOnPath = null;
		this.distance = 5318008; //boobs
		this.psuedoNextOnPath = null;
		this.psuedoDistance = 5318008; //boobs
	}

	resetPath()
	{
		this.psuedoDistance = 5318008;
		this.psuedoNextOnPath = null;
	}

	foundPath()
	{
		return (this.psuedoDistance != 5318008);
	}

	nextPathGen(next)
	{
		if (!this.foundPath() || next == null || next.foundPath() || !next.walkable) {
			return null;
		}
		next.psuedoDistance = this.psuedoDistance + 1
		next.psuedoNextOnPath = this;
		return next;
	}

	genNorth() { return this.nextPathGen(this.north); }
	genSouth() { return this.nextPathGen(this.south); }
	genEast() { return this.nextPathGen(this.east); }
	genWest() { return this.nextPathGen(this.west); }

	assignPath()
	{
		this.distance = this.psuedoDistance;
		this.nextOnPath = this.psuedoNextOnPath;
	}

	setNeighbors(n,s,e,w)
	{
		this.north = n;
		this.south = s;
		this.east = e;
		this.west = w;
	}

	update()
	{
		if (this.tower != null)
		{
			this.tower.update();
		}
	}

	render(force)
	{
		stroke(60, 100, 130);
		strokeWeight(0.5);

		if (this.walkable)
		{
			noFill();
		}
		else
		{
			fill(30, 60, 100);
		}

		rect(this.x * pixelsPerCell + 0.5 + leftBarWidth + colSpace, this.y * pixelsPerCell + 0.5 + rowSpace, pixelsPerCell - 1, pixelsPerCell - 1);

		if (this.tower != null)
		{
			this.tower.render();
		}
	}
}

class FinishTile extends Tile
{
	constructor(x, y, walkable, buildable)
	{
		super(x, y, walkable, buildable);
		this.health = 100;

		this.animationTimer = 0;
	}

	render(force)
	{
		if (force)
		{
			this.animationTimer += 0.01;

			fill(60, 100, 100);
			stroke(255, 255, 0);

			let renderX = this.x * pixelsPerCell + 0.5 + leftBarWidth + colSpace;
			let renderY = this.y * pixelsPerCell + 0.5 + rowSpace;

			rect(renderX, renderY, pixelsPerCell - 1, pixelsPerCell - 1);

			stroke(255, 255, 0, 150);
			strokeWeight(5);

			renderX += pixelsPerCell / 2;
			renderY += pixelsPerCell / 2;

			line(renderX - Math.sin(this.animationTimer) * pixelsPerCell * 0.7, renderY + Math.cos(this.animationTimer) * pixelsPerCell * 0.7, renderX + Math.sin(this.animationTimer) * pixelsPerCell * 0.7, renderY - Math.cos(this.animationTimer) * pixelsPerCell * 0.7);
			this.animationTimer += Math.PI / 2;
			line(renderX - Math.sin(this.animationTimer) * pixelsPerCell * 0.7, renderY + Math.cos(this.animationTimer) * pixelsPerCell * 0.7, renderX + Math.sin(this.animationTimer) * pixelsPerCell * 0.7, renderY - Math.cos(this.animationTimer) * pixelsPerCell * 0.7);
			this.animationTimer -= Math.PI / 2;
		}
	}
}

class SpawnerTile extends Tile
{
	constructor(x, y, walkable, buildable, timeUntilActive)
	{
		super(x, y, walkable, buildable);
		this.timeUntilActive = timeUntilActive;
		this.enemys = new Array();
		this.enemyTimer = 0;
		//this.health = 100 + Math.pow(waveSpawned + 2, 1.5);
	}

	render(force)
	{
		if (force)
		{
			if (this.timeUntilActive <= 0)
			{
				fill(random(60, 80), random(0, 25), random(0, 25));
				stroke(255, 0, 0);
				strokeWeight(1);
	
				rect(this.x * pixelsPerCell + 0.5 + leftBarWidth + colSpace, this.y * pixelsPerCell + 0.5 + rowSpace, pixelsPerCell - 1, pixelsPerCell - 1);
			}
			else
			{
				fill(20, 0, 0);
				textAlign(CENTER);
				textSize(14);
				stroke(120, 0, 0);
				strokeWeight(0.5);
	
				rect(this.x * pixelsPerCell + 0.5 + leftBarWidth + colSpace, this.y * pixelsPerCell + 0.5 + rowSpace, pixelsPerCell - 1, pixelsPerCell - 1);
				fill(255, 0, 0);
				noStroke();
				text(this.timeUntilActive, this.x * pixelsPerCell + 0.5 + leftBarWidth + colSpace + pixelsPerCell / 2, this.y * pixelsPerCell + 0.5 + rowSpace + pixelsPerCell / 2 + 3);
			}
		}
	}

	update()
	{
		this.enemyTimer--;
		if (this.enemyTimer <= 0 && this.enemys.length > 0)
		{
			let summonMod = (1 - (wave / 100));
			if (summonMod < 0.25)
			{
				summonMod = 0.25;
			}

			let newEnemy = this.enemys.pop();
			//add it to the global enemy array
			enemys.push(newEnemy);

			if (newEnemy.enemyType == EnemyType.Normal)
			{
				this.enemyTimer = 40 * summonMod + random(0, 3);
			}
			if (newEnemy.enemyType == EnemyType.Swarm)
			{
				this.enemyTimer = 15 * summonMod + random(0, 3);
			}
			if (newEnemy.enemyType == EnemyType.Tank)
			{
				this.enemyTimer = 130 * summonMod + random(0, 3);
			}
		}
	}
}

class TowerButton
{
	constructor(x, y, size)
	{
		this.x = x;
		this.y = y;
		this.size = size;
		this.active = false;
	}

	render(icon)
	{
		fill(15);
		if (mouseX >= this.x && mouseY >= this.y && mouseX <= this.x + this.size && mouseY <= this.y + this.size)
		{
			strokeWeight(2);
			stroke(255,255,255);
		}
		else
		{
			if (this.active && icon != 8) //dont highlight if play/pause button
			{
				strokeWeight(2);
				stroke(255,255,0);
			}
			else
			{
				strokeWeight(1);
				stroke(160,160,160);
			}
		}
		rect(this.x, this.y, this.size, this.size);

		if (icon == 0) //delete
		{
			stroke(200, 40, 40);
			strokeWeight(4);

			line(this.x + 10, this.y + 10, this.x - 10 + this.size, this.y - 10 + this.size);
			line(this.x - 10 + this.size, this.y + 10, this.x + 10, this.y - 10 + this.size);
		}
		if (icon == 1) //upgrade
		{
			stroke(210, 210, 50);
			strokeWeight(4);

			line(this.x + 10, this.y - 10 + this.size, this.x + this.size / 2, this.y + this.size / 2);
			line(this.x - 10 + this.size, this.y - 10 + this.size, this.x + this.size / 2, this.y + this.size / 2);

			line(this.x + 10, this.y + this.size / 2, this.x + this.size / 2, this.y + 10);
			line(this.x - 10 + this.size, this.y + this.size / 2, this.x + this.size / 2, this.y + 10);
		}
		if (icon == 2) //breakpoint
		{
			fill(30, 60, 100);
			stroke(60, 100, 130);
			strokeWeight(1);

			rect(this.x + 10, this.y + 10, this.size - 20, this.size - 20);
		}
		if (icon == 8) //play
		{
			if (!this.active)
			{
				fill(90, 180, 90);
				stroke(0, 255, 0);
				strokeWeight(2);

				triangle(this.x - 10 + this.size, this.y + this.size / 2, 
					this.x + 10, this.y - 10 + this.size, 
					this.x + 10, this.y + 10);
			}
			else
			{
				fill(180, 130, 90);
				stroke(255, 125, 0);
				strokeWeight(2);

				rect(this.x + 10, this.y + 10, this.size / 2 - 15, this.size - 20);
				rect(this.x + this.size / 2 + 5, this.y + 10, this.size / 2 - 15, this.size - 20);
			}
		}
	}

	testClick()
	{
		return mouseX >= this.x && mouseY >= this.y && mouseX <= this.x + this.size && mouseY <= this.y + this.size;
	}
}

const Element = {
	Syntax: 0, // green
	Runtime: 1, // red
	Logic: 2 // blue
};

const EnemyType = {
	Normal: 0, // square
	Swarm: 1, // tiny circle, no stroke
	Tank: 2 // Big circle, big stroke
};

class Enemy
{
	constructor(elementType, enemyType, cell, wave)
	{
		this.elementType = elementType;
		this.enemyType = enemyType;
		this.cell = cell;
		this.wave = wave;

		this.speed = (enemyType == EnemyType.Normal ? 0.025 : (enemyType == EnemyType.Swarm ? 0.0325 : 0.015));
		this.speed *= 1 + Math.sqrt((wave + 3) / 20);

		this.x = cell.x;
		this.y = cell.y;

		this.health = (enemyType == EnemyType.Normal ? 20 : (enemyType == EnemyType.Swarm ? 5 : 100));
		this.health *= 0.25 + Math.pow((wave * 0.2) + 1, 1.5);
	}

	damage(dam)
	{
		this.health -= dam;
	}

	allowsChange()
	{
		return this.cell.psuedoNextOnPath != null;
	}

	update() // returns a number if it reaches the end, or -1 if is dead
	{
		if (this.health <= 0)
		{
			return -1;
		}

		let xDisplace = Math.sign(this.cell.nextOnPath.x - this.x) * this.speed;
		if (this.speed > abs(this.cell.nextOnPath.x - this.x))
		{
			this.x = this.cell.nextOnPath.x;
		}
		else
		{
			this.x += xDisplace;
		}

		let yDisplace = Math.sign(this.cell.nextOnPath.y - this.y) * this.speed;
		if (this.speed > abs(this.cell.nextOnPath.y - this.y))
		{
			this.y = this.cell.nextOnPath.y;
		}
		else
		{
			this.y += yDisplace;
		}

		if (Math.abs(this.x - this.cell.nextOnPath.x) <= this.speed * 1.5 && Math.abs(this.y - this.cell.nextOnPath.y) <= this.speed * 1.5)
		{
			this.cell = this.cell.nextOnPath;
		}

		if (this.cell == finish)
		{
			return (this.enemyType == EnemyType.Normal ? 5 : (this.enemyType == EnemyType.Swarm ? 2 : 15))
		}
		return 0;
	}

	render()
	{
		if (this.elementType == Element.Syntax)
		{
			fill(110, 220, 110);
			stroke(0,255,0);
		}
		if (this.elementType == Element.Runtime)
		{
			fill(220, 110, 110);
			stroke(255,0,0);
		}
		if (this.elementType == Element.Logic)
		{
			fill(110, 110, 220);
			stroke(0,0,255);
		}

		if (this.enemyType == EnemyType.Normal)
		{
			strokeWeight(1);

			rect(this.x * pixelsPerCell + 0.5 + leftBarWidth + colSpace + pixelsPerCell / 4, 
				this.y * pixelsPerCell + 0.5 + rowSpace + pixelsPerCell / 4, 
				(pixelsPerCell - 1) / 2, (pixelsPerCell - 1) / 2);
		}
		if (this.enemyType == EnemyType.Swarm)
		{
			strokeWeight(1);

			ellipse(this.x * pixelsPerCell + 0.5 + leftBarWidth + colSpace + pixelsPerCell / 2, 
				this.y * pixelsPerCell + 0.5 + rowSpace + pixelsPerCell / 2, pixelsPerCell / 4);
		}
		if (this.enemyType == EnemyType.Tank)
		{
			strokeWeight(4);

			ellipse(this.x * pixelsPerCell + 0.5 + leftBarWidth + colSpace + pixelsPerCell / 2, 
				this.y * pixelsPerCell + 0.5 + rowSpace + pixelsPerCell / 2, pixelsPerCell / 1.3);
		}
	}
}

class Tower
{
	constructor(cell, cost)
	{
		this.cell = cell;
		this.level = 0;
		this.cost = cost;
	}

	distance(x, y)
	{
		let xDist = this.cell.x - x;
		let yDist = this.cell.y - y;
		return (xDist * xDist) + (yDist * yDist);
	}
}

class ConsoleLog extends Tower
{
	constructor(cell)
	{
		super(cell, 25);

		this.maxTimer = 40;
		this.timer = this.maxTimer;
		this.range = 6;
		this.damage = 10;
	}

	update()
	{
		this.timer--;
		if (this.timer <= 0)
		{
			this.timer = floor(random(0, 10));
			let closestEnemy = null;
			let greatestDistance = 5318008;
			for (let i = 0; i < enemys.length; i++)
			{
				let distance = this.distance(enemys[i].x, enemys[i].y);
				if (distance < this.range && enemys[i].cell.distance < greatestDistance)
				{
					greatestDistance = enemys[i].cell.distance;
					closestEnemy = enemys[i];
				}
			}

			if (closestEnemy != null)
			{
				this.timer = this.maxTimer;
				stroke(255, 0, 0);
				strokeWeight(3);

				closestEnemy.damage(this.damage);

				line(this.cell.x * pixelsPerCell + 0.5 + leftBarWidth + colSpace + pixelsPerCell / 2, 
					this.cell.y * pixelsPerCell + 0.5 + rowSpace + pixelsPerCell / 2,
					closestEnemy.x * pixelsPerCell + 0.5 + leftBarWidth + colSpace + pixelsPerCell / 2,
					closestEnemy.y * pixelsPerCell + 0.5 + rowSpace + pixelsPerCell / 2);
			}
		}
	}

	render()
	{
		fill(255);
		stroke(50);
		strokeWeight(2);

		triangle(this.cell.x * pixelsPerCell + leftBarWidth + colSpace + pixelsPerCell / 2, this.cell.y * pixelsPerCell + rowSpace + 5,
			this.cell.x * pixelsPerCell + leftBarWidth + colSpace + 5, this.cell.y * pixelsPerCell + rowSpace+ pixelsPerCell - 5,
			this.cell.x * pixelsPerCell + leftBarWidth + colSpace + pixelsPerCell - 5, this.cell.y * pixelsPerCell + rowSpace + pixelsPerCell - 5);
	}
}

//preset values
const pixelsPerCell = 28;
const leftBarWidth = 200;
const bottomHeight = 80;

let cols;
let rows;
let colSpace;
let rowSpace;

let cells;
let finish;
let spawners = new Array();
let enemys = new Array();

let money = 200;
let wave = -1;

let deleteButton;
let upgradeButton;
let breakpointButton;
let consoleLogButton;
let forumsButton;
let testCaseButton;
let warningsButton;
let tryCatchButton;
let startGameButton; // this . active stores the state of wether the game is paused or not

let framesUntilNextWave = 0;

let thisElement;
let thisType;

let nextElement;
let nextType;

let nextNextElement;
let nextNextType;

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

	cols = Math.floor((windowWidth - leftBarWidth) / pixelsPerCell);
	rows = Math.floor((windowHeight - bottomHeight) / pixelsPerCell);

	colSpace = ((windowWidth - leftBarWidth) % pixelsPerCell) / 2;
	rowSpace = ((windowHeight - bottomHeight) % pixelsPerCell) / 2;

	let size = leftBarWidth / 2 - 30;

	deleteButton = new TowerButton(20, 50, size);
	upgradeButton = new TowerButton(40 + size, 50, size);

	breakpointButton = new TowerButton(20, 70 + size, size);
	consoleLogButton = new TowerButton(40 + size, 70 + size, size);

	forumsButton = new TowerButton(20, 90 + size * 2, size);
	testCaseButton = new TowerButton(40 + size, 90 + size * 2, size);

	warningsButton = new TowerButton(20, 110 + size * 3, size);
	tryCatchButton = new TowerButton(40 + size, 110 + size * 3, size);

	startGameButton = new TowerButton(windowWidth - bottomHeight + 5, windowHeight - bottomHeight + 5, bottomHeight - 10);

	thisElement = floor(random(0,3));
	thisType = 0;

	let e = floor(random(0, 3));
	nextElement = ((e == thisElement) ? floor(random(0, 3)) : e);
	nextType = 0;

	e = floor(random(0, 3));
	nextNextElement = ((e == nextElement) ? floor(random(0, 3)) : e);
	nextNextType = floor(random(0,3));

	do
	{
		cells = get2dArray(cols, rows);
		for (let x = 0; x < cols; x++) 
		{
			for (let y = 0; y < rows; y++) 
			{
				cells[x][y] = new Tile(x, y, 0.1 < Math.random(), true);
			}
		}

		let x = floor(random(cols * 0.4, cols * 0.6));
		let y = floor(random(rows * 0.4, rows * 0.6));

		cells[x][y] = new FinishTile(x, y, true, false);
		finish = cells[x][y];

		//sets spawners
		let spawnLocations = new Array();
		for (let i = 0; i < spawners.length; i++)
		{
			cells[spawners[i].x][spawners[i].y] = new Tile(x, y, 0.1 < Math.random(), true);
		}
		spawners = new Array();
		spawnLocations.push([floor(random(cols * 0.05, cols * 0.95)), floor(random(rows * 0.05, rows * 0.3))]);
		spawnLocations.push([floor(random(cols * 0.05, cols * 0.95)), floor(random(rows * 0.7, rows * 0.95))]);
		spawnLocations.push([floor(random(cols * 0.05, cols * 0.3)), floor(random(rows * 0.05, rows * 0.95))]);
		spawnLocations.push([floor(random(cols * 0.7, cols * 0.95)), floor(random(rows * 0.05, rows * 0.95))]);

		for (let i = 0; i < 4; i++)
		{
			let newSpawn = new SpawnerTile(spawnLocations[i][0], spawnLocations[i][1], true, false, i * 3);
			cells[spawnLocations[i][0]][spawnLocations[i][1]] = newSpawn;
			spawners.push(newSpawn);
		}

		//sets neighboors
		for (let x = 0; x < cols; x++) 
		{
			for (let y = 0; y < rows; y++) 
			{
				cells[x][y].setNeighbors(getCell(x, y + 1), getCell(x + 1, y), getCell(x, y - 1), getCell(x - 1, y));
			}
		}

	} while (!redoPaths())
}

function redoPaths() //returns true if you can't find a path from all the spawners
{
	queue = new Array();

	for (let x = 0; x < cols; x++) 
  	{
    	for (let y = 0; y < rows; y++) 
    	{
			cells[x][y].resetPath();
   	 	}
	}

	finish.psuedoDistance = 0;

	queue.push(finish);
	while (queue.length > 0) 
	{
		next = queue.shift();
		if (next != null)
		{
			if (isCellCheckerboard(next))
			{
				queue.push(next.genNorth());
				queue.push(next.genSouth());
				queue.push(next.genEast());
				queue.push(next.genWest());
			}
			else
			{
				queue.push(next.genWest());
				queue.push(next.genEast());
				queue.push(next.genSouth());
				queue.push(next.genNorth());
			}
		}
	}

	for (let i = 0; i < spawners.length; i++)
	{
		if (!spawners[i].foundPath())
		{
			return false;
		}
	}
	for (let i = 0; i < enemys.length; i++)
	{
		if (!enemys[i].allowsChange())
		{
			return false;
		}
	}
		
	for (let x = 0; x < cols; x++) 
  	{
    	for (let y = 0; y < rows; y++) 
    	{
			cells[x][y].assignPath();
		}
	}

	return true;
}

function isCellCheckerboard(cell)
{
	//bitwise and to get the last digit, much faster than modulo
	let yCheck = ((cell.y & 1) == 0)
	return ((cell.x & 1) == 0) ? yCheck : !yCheck
}

function getCell(x, y)
{
	if (x < 0 || y < 0 || x >= cols || y >= rows)
	{
		return null;
	}
	return cells[x][y];
}

function draw() 
{
	render();
	
	if (startGameButton.active)
	{
		doGameLoop();
	}
}

function mousePressed()
{
	if (startGameButton.testClick())
	{
		startGameButton.active = !startGameButton.active;
	}

	if (deleteButton.testClick())
	{
		activateButton(deleteButton);
	}
	if (upgradeButton.testClick())
	{
		activateButton(upgradeButton);
	}
	if (breakpointButton.testClick())
	{
		activateButton(breakpointButton);
	}
	if (consoleLogButton.testClick())
	{
		activateButton(consoleLogButton);
	}
	if (forumsButton.testClick())
	{
		activateButton(forumsButton);
	}
	if (testCaseButton.testClick())
	{
		activateButton(testCaseButton);
	}
	if (warningsButton.testClick())
	{
		activateButton(warningsButton);
	}
	if (tryCatchButton.testClick())
	{
		activateButton(tryCatchButton);
	}

	let x = floor((mouseX - 0.5 - leftBarWidth - colSpace) / pixelsPerCell);
	let y = floor((mouseY - 0.5 - rowSpace) / pixelsPerCell);
	let cell = getCell(x, y);
	if (cell != null)
	{
		if (breakpointButton.active && money >= 5 && cell.walkable)
		{
			cell.walkable = !cell.walkable;
			if (!redoPaths())
			{
				cell.walkable = !cell.walkable;
			}
			else
			{
				money -= 5;
			}
		}
		if (consoleLogButton.active && money >= 25 && cell.buildable && cell.tower == null && !cell.walkable)
		{
			cell.tower = new ConsoleLog(cell);
			money -= 25;
		}
	}
}

function activateButton(button)
{
	let bState = button.active;
	
	deleteButton.active = false;
	upgradeButton.active = false;

	breakpointButton.active = false;
	consoleLogButton.active = false;

	forumsButton.active = false;
	testCaseButton.active = false;

	warningsButton.active = false;
	tryCatchButton.active = false;

	button.active = !bState;
}

function previewNextWaves()
{
	fill(30, 30, 30, 150);
	stroke(90, 140, 170);
	strokeWeight(2);
	rect(windowWidth - 500, 40, 500, 130);

	textAlign(LEFT);
	noStroke();

	text("wave[" + (wave + 1) + "].contents == (" + getTypePreview(thisType) + getElementPreview(thisElement), windowWidth - 490, 70);

	text("wave[" + (wave + 2) + "].contents == (" + getTypePreview(nextType) + getElementPreview(nextElement), windowWidth - 490, 110);

	text("wave[" + (wave + 3) + "].contents == (" + getTypePreview(nextNextType) + getElementPreview(nextNextElement), windowWidth - 490, 150);
}

function getTypePreview(type)
{
	if (type == EnemyType.Normal)
	{
		return "Normal "
	}

	if (type == EnemyType.Swarm)
	{
		return "A Swarm of "
	}

	if (type == EnemyType.Tank)
	{
		return "Massive "
	}
}

function getElementPreview(element)
{
	if (element == Element.Syntax)
	{
		fill(190,255,190);
		return "Syntax Errors);"
	}

	if (element == Element.Runtime)
	{
		fill(255,190,190);
		return "Runtime Errors);"
	}

	if (element == Element.Logic)
	{
		fill(190,190,255);
		return "Logic Errors);"
	}
}

function drawMenus()
{
	textSize(20);
	textAlign(CENTER);

	fill(30);
	stroke(90, 140, 170);
	strokeWeight(2);

	rect(0, 0, leftBarWidth, windowHeight);
	rect(leftBarWidth, windowHeight - bottomHeight, windowWidth - leftBarWidth, bottomHeight);

	fill(30, 30, 30, 150);
	rect(windowWidth - 150, 0, 150, 40);
	fill(180);
	noStroke();
	text("View Waves", windowWidth - 150, 10, 150);
	if (mouseX > windowWidth - 150 && mouseY < 40)
	{
		previewNextWaves();
	}
	textAlign(CENTER);

	//left bar
	textSize(30);
	fill(255);
	noStroke();
	text("Towers", 10, 10, leftBarWidth - 20);

	let size = leftBarWidth / 2 - 30;

	deleteButton.render(0);
	upgradeButton.render(1);

	breakpointButton.render(2);
	consoleLogButton.render(3);

	forumsButton.render(4);
	testCaseButton.render(5);

	warningsButton.render(6);
	tryCatchButton.render(7);

	drawTowerText(size * 4);

	textSize(32);
	textAlign(LEFT);
	fill(255);
	noStroke();
	text("Memory: " + money + "kB", leftBarWidth + 15, windowHeight - (bottomHeight - 30) / 2);
	text("Stability: " + finish.health + "/100", leftBarWidth + 15 + ((windowWidth - leftBarWidth) / 3), windowHeight - (bottomHeight - 30) / 2);
	text("Wave: " + (wave == -1 ? 0 : wave), leftBarWidth + 15 + ((windowWidth - leftBarWidth) / 3) * 2, windowHeight - (bottomHeight - 30) / 2);

	startGameButton.render(8);
}

function drawTowerText(size)
{
	if (breakpointButton.active)
	{
		fill(255);
		noStroke();
		text("Break Point", 10, 130 + size, leftBarWidth - 20);
		textSize(16);
		fill(200);
		text("A wall that the errors cannot walk through.", 10, 165 + size, leftBarWidth - 20);
		text("Cost: 5 kB.", 10, 210 + size, leftBarWidth - 20);
	}
	if (consoleLogButton.active)
	{
		fill(255);
		noStroke();
		text("Console Log", 10, 130 + size, leftBarWidth - 20);
		textSize(16);
		fill(200);
		text("A standard tower that shoots the error closest to the end.", 10, 165 + size, leftBarWidth - 20);
		text("Cost: 25 kB.", 10, 230 + size, leftBarWidth - 20);

		fill(200,200,255);
		text("Strong against Logic.", 10, 260 + size, leftBarWidth - 20);
		fill(200,255,200);
		text("Poor against Syntax.", 10, 280 + size, leftBarWidth - 20);
	}
}

function render()
{
	//makes the background black
	background(0);

	noStroke();
	fill(30,40,40);

	for (let i = 0; i < spawners.length; i++)
	{
		let cell = spawners[i].nextOnPath;
		while (cell != null)
		{
			rect(cell.x * pixelsPerCell + leftBarWidth + colSpace + 1, cell.y* pixelsPerCell + rowSpace + 1, pixelsPerCell - 2, pixelsPerCell - 2);
			cell = cell.nextOnPath;
		}
	}
	
	stroke(60, 100, 130);
	strokeWeight(0.5);

	for (let x = 0; x < cols; x++)
	{
		for (let y = 0; y < rows; y++)
		{
			cells[x][y].render(false);
		}
	}

	finish.render(true);

	for (let i = 0; i < spawners.length; i++)
	{
		spawners[i].render(true);
	}

	for (let i = 0; i < enemys.length; i++)
	{
		enemys[i].render();
	}

	drawMenus();
}

function spawnWave()
{
	for (let i = 0; i < spawners.length; i++)
	{
		if (spawners[i].timeUntilActive <= 0)
		{
			if (thisType == EnemyType.Normal)
			{
				let max = (Math.sqrt(wave + 6) * 1.25) - 0.5;
				if (wave < 2)
				{
					max *= 2;
				}
				else if (wave < 5)
				{
					max *= 1.25;
				}
				else if (wave > 9)
				{
					max += random(0, 1);
				}

				for (let count = 0; count < max; count++)
				{
					spawners[i].enemys.push(new Enemy(thisElement, thisType, spawners[i], wave));
				}
			}
			if (thisType == EnemyType.Swarm)
			{
				let max = (Math.sqrt(wave * 1.5 + 6) * 1.5);
				if (wave < 2)
				{
					max *= 2;
				}
				else if (wave < 5)
				{
					max *= 1.25;
				}
				else if (wave > 9)
				{
					max += random(0, 2);
				}

				for (let count = 0; count < max; count++)
				{
					spawners[i].enemys.push(new Enemy(thisElement, thisType, spawners[i], wave));
				}
			}
			if (thisType == EnemyType.Tank)
			{
				let max = (Math.sqrt(wave * 0.65 + 6) * 0.667) - 1;
				if (wave < 2)
				{
					max *= 2;
				}
				else if (wave < 5)
				{
					max *= 1.25;
				}
				else if (wave > 9)
				{
					max += random(0, 0.5);
				}

				for (let count = 0; count < max; count++)
				{
					spawners[i].enemys.push(new Enemy(thisElement, thisType, spawners[i], wave));
				}
			}
		}
		else
		{
			spawners[i].timeUntilActive--;
		}
	}

	thisElement = nextElement;
	thisType = nextType;

	nextElement = nextNextElement;
	nextType = nextNextType;

	let e = floor(random(0, 3));
	nextNextElement = (e == nextElement ? floor(random(0, 3)) : e);
	nextNextType = ((wave % 3) == 0 ? 0 : floor(random(0, 3)));

	framesUntilNextWave = 1100;
	wave++;
}

function doGameLoop()
{
	if ((framesUntilNextWave == 0 || enemys.length == 0) && spawners[0].enemys.length == 0 && spawners[1].enemys.length == 0 && spawners[2].enemys.length == 0 && spawners[3].enemys.length == 0)
	{
		spawnWave();
	}

	for (let x = 0; x < cols; x++)
	{
		for (let y = 0; y < rows; y++)
		{
			cells[x][y].update();
		}
	}

	for (let i = 0; i < enemys.length; i++)
	{
		let val = enemys[i].update();
		if (val != 0)
		{
			if (val == -1)
			{
				money += 5;
			}
			else
			{
				finish.health -= val;
			}
			enemys.splice(i, 1);
			i--;
		}
	}

	framesUntilNextWave--;
}
