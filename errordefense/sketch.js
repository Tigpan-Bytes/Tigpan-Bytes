// Error Defense
// Timothy Letkeman
// Thursday 12th September, 2019
//
// Extra for Experts:
// - 1800+ lines
// - Polymorphism
// - Tons of arrays
// - 1800+ lines
// - Reactive Pathfinding
// - Did I mention 1800+ lines?

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

	render(force) // returns a tower to be added to the tower render queue
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
			return this.tower;
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
		if (icon == 3) //console log
		{
			fill(255);
			stroke(50);
			strokeWeight(2);

			triangle(this.x + this.size / 2, this.y + 10,
				this.x + 10, this.y + this.size - 10,
				this.x + this.size - 10, this.y + this.size - 10);
		}
		if (icon == 4) //documentation
		{
			fill(170, 20, 170);
			stroke(100, 30, 100);
			strokeWeight(2);

			rect(this.x + 5, this.y + 5, this.size / 2 - 10, this.size / 2 - 10);
			rect(this.x + 5 + this.size / 2 , this.y + 5, this.size / 2 - 10, this.size / 2 - 10);
			rect(this.x + 5, this.y + 5 + this.size / 2 , this.size / 2 - 10, this.size / 2 - 10);
			rect(this.x + 5 + this.size / 2 , this.y + 5 + this.size / 2 , this.size / 2 - 10, this.size / 2 - 10);
		}
		if (icon == 5) //try catch
		{
			fill(60, 200, 200);
			stroke(100, 255, 255);
			strokeWeight(2);

			beginShape();
			vertex(this.x + this.size / 2, this.y + 5);
			vertex(this.x + (this.size / 5) * 3, this.y + (this.size / 5) * 2);
			vertex(this.x + this.size - 5, this.y + this.size / 2);
			vertex(this.x + (this.size / 5) * 3, this.y + (this.size / 5) * 3);
			vertex(this.x + this.size / 2, this.y + this.size - 5);
			vertex(this.x + (this.size / 5) * 2, this.y + (this.size / 5) * 3);
			vertex(this.x + 5, this.y + this.size / 2);
			vertex(this.x + (this.size / 5) * 2, this.y + (this.size / 5) * 2);
			endShape(CLOSE);
		}
		if (icon == 6) //test case
		{
			fill(235, 160, 100);
			stroke(255, 200, 0);
			strokeWeight(2);

			let yHeight = Math.sqrt(3) * (this.size - 10) / 4;
			let xWidth = (this.size - 10) / 4;

			beginShape();
			vertex(this.x + 5, this.y + this.size / 2);
			vertex(this.x + this.size / 2 - xWidth, this.y + this.size / 2 + yHeight);
			vertex(this.x + this.size / 2 + xWidth, this.y + this.size / 2 + yHeight);
			vertex(this.x + this.size - 5, this.y + this.size / 2);
			vertex(this.x + this.size / 2 + xWidth, this.y + this.size / 2 - yHeight);
			vertex(this.x + this.size / 2 - xWidth, this.y + this.size / 2 - yHeight);
			endShape(CLOSE);
		}
		if (icon == 7) //comment
		{
			stroke(160, 255, 80);
			strokeWeight(7);

			line(this.x + 7, this.y + this.size - 7, 
				this.x + this.size / 2, this.y + 7);
			line(this.x + this.size / 2, this.y + this.size - 7, 
				this.x + this.size - 7, this.y + 7);
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
		this.slow = 1;
		this.slowTimer = 0;

		this.x = cell.x;
		this.y = cell.y;

		this.health = (enemyType == EnemyType.Normal ? 20 : (enemyType == EnemyType.Swarm ? 7 : 100));
		this.health *= 0.1 + Math.pow((wave * 0.175) + 1, 1.5);
		this.maxHealth = this.health;
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
		this.slowTimer--;
		if (this.slowTimer <= 0)
		{
			this.slow = 1;
		}

		if (this.health <= 0)
		{
			return -1;
		}

		let xDisplace = Math.sign(this.cell.nextOnPath.x - this.x) * this.speed * this.slow;
		if (this.speed * this.slow > abs(this.cell.nextOnPath.x - this.x))
		{
			this.x = this.cell.nextOnPath.x;
		}
		else
		{
			this.x += xDisplace;
		}

		let yDisplace = Math.sign(this.cell.nextOnPath.y - this.y) * this.speed * this.slow;
		if (this.speed * this.slow > abs(this.cell.nextOnPath.y - this.y))
		{
			this.y = this.cell.nextOnPath.y;
		}
		else
		{
			this.y += yDisplace;
		}

		if (Math.abs(this.x - this.cell.nextOnPath.x) <= this.speed * this.slow * 1.5 && Math.abs(this.y - this.cell.nextOnPath.y) <= this.speed * this.slow * 1.5)
		{
			this.cell = this.cell.nextOnPath;
		}

		if (this.cell == finish)
		{
			//stops drones from continuing to latch
			this.health = -1;
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

			fill(50, 160, 50, 60);
			stroke(0,255,0,90);
			strokeWeight(2);
			rect(this.x * pixelsPerCell + 2.5 + leftBarWidth + colSpace, this.y * pixelsPerCell + 2.5 + rowSpace - pixelsPerCell / 4, (pixelsPerCell - 4) * (this.health / this.maxHealth), pixelsPerCell / 4 - 4);
		}
		else
		{
			fill(50, 160, 50, 60);
			stroke(0,255,0,90);
			strokeWeight(2);
			rect(this.x * pixelsPerCell + 2.5 + leftBarWidth + colSpace, this.y * pixelsPerCell + 2.5 + rowSpace - pixelsPerCell / 4, (pixelsPerCell - 4) * (this.health / this.maxHealth), pixelsPerCell / 4 - 4);
		}
	}
}

class Tower
{
	constructor(cell, cost)
	{
		this.cell = cell;
		this.level = 0;
		this.timer = 0;
		this.cost = cost;
		this.upgradeCost = cost * 2;

		this.xPlus = this.cell.x * pixelsPerCell + 0.5 + leftBarWidth + colSpace;
		this.yPlus = this.cell.y * pixelsPerCell + 0.5 + rowSpace;
	}

	increaseUpgradeCost()
	{
		this.level++;
		this.upgradeCost = this.upgradeCost * 2;
	}

	distance(x, y)
	{
		let xDist = this.cell.x - x;
		let yDist = this.cell.y - y;
		return Math.sqrt((xDist * xDist) + (yDist * yDist));
	}

	render()
	{
		textAlign(LEFT, TOP);
		textSize(10);
		fill(255);
		stroke(0);
		strokeWeight(2);
		
		text(this.level, this.xPlus + 2, this.yPlus + 2);
	}
}

const consoleLogRange = 3.5;

class ConsoleLog extends Tower
{
	constructor(cell)
	{
		super(cell, 25);

		this.maxTimer = 40;
		this.range = consoleLogRange;
		this.damage = 10;
	}

	upgrade()
	{
		this.increaseUpgradeCost();
		this.damage *= 1.75;
		this.range += 0.35;
		this.maxTimer -= (this.maxTimer - 30) * 0.2;
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
				strokeWeight(5);

				closestEnemy.damage(closestEnemy.elementType == Element.Logic ? this.damage * 2 : (closestEnemy.elementType == Element.Syntax ? this.damage * 0.5 : this.damage));

				line(this.xPlus + pixelsPerCell / 2, 
					this.yPlus + pixelsPerCell / 2,
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

		triangle(this.xPlus + pixelsPerCell / 2, this.yPlus + 5,
			this.xPlus + 5,  this.yPlus + pixelsPerCell - 5,
			this.xPlus + pixelsPerCell - 5, this.yPlus + pixelsPerCell - 5);

		super.render();
	}
}

const documentationRange = 2;

class Documentation extends Tower
{
	constructor(cell)
	{
		super(cell, 50);

		this.maxTimer = 40;
		this.animationTimer = random(0, Math.PI * 2);
		this.range = documentationRange;
		this.damage = 6;

		this.drones = new Array(3);
		for (let i = 0; i < this.drones.length; i++)
		{	//                 target   timer
			this.drones[i] = [undefined, 0];
		}
	}

	upgrade()
	{
		this.increaseUpgradeCost();
		this.damage *= 1.9;
		this.range += 0.2;
	}

	update()
	{
		this.timer--;
		this.animationTimer += 0.03;

		let lowestDrone = 3;
		if (this.drones[0][0] == undefined)
		{
			lowestDrone = 0;
		}
		else if (this.drones[1][0] == undefined)
		{
			lowestDrone = 1;
		}
		else if (this.drones[2][0] == undefined)
		{
			lowestDrone = 2;
		}

		if (this.timer <= 0 && lowestDrone < 3)
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

				this.drones[lowestDrone][0] = closestEnemy;
				//closestEnemy.damage(closestEnemy.element == Element.Syntax ? this.damage * 2 : (closestEnemy.element == Element.Runtime ? this.damage * 0.5 : this.damage));
			}
		}

		for (let i = 0; i < this.drones.length; i++)
		{	
			this.drones[i][1]--;

			if (this.drones[i][1] <= 0 && this.drones[i][0] != undefined)
			{
				this.drones[i][1] = 50;
				this.drones[i][0].damage(this.drones[i][0].elementType == Element.Syntax ? this.damage * 2 : (this.drones[i][0].elementType == Element.Runtime ? this.damage * 0.5 : this.damage));
				if (this.drones[i][0].health <= 0)
				{
					this.drones[i][0] = undefined;
				}
				else
				{
					stroke(255, 0, 255);
					strokeWeight(4);
					line(this.drones[i][0].x * pixelsPerCell + pixelsPerCell / 2 +  0.5 + leftBarWidth + colSpace - Math.sin(this.animationTimer + Math.PI * 2 * (i/3)) * pixelsPerCell, 
						this.drones[i][0].y  * pixelsPerCell + pixelsPerCell / 2 + 0.5 + rowSpace + Math.cos(this.animationTimer + Math.PI * 2 * (i/3))* pixelsPerCell,
						this.drones[i][0].x * pixelsPerCell + pixelsPerCell / 2 +  0.5 + leftBarWidth + colSpace, 
						this.drones[i][0].y  * pixelsPerCell + pixelsPerCell / 2 + 0.5 + rowSpace);
				}
			}
		}

	}

	render()
	{
		fill(170, 20, 170);
		stroke(100, 30, 100);
		strokeWeight(2);

		let rectSize = pixelsPerCell / 2 - 4;

		rect(this.xPlus + 2, this.yPlus + 2, rectSize, rectSize);
		rect(this.xPlus + 2 + pixelsPerCell / 2, this.yPlus + 2, rectSize, rectSize);
		rect(this.xPlus + 2, this.yPlus + 2 + pixelsPerCell / 2, rectSize, rectSize);
		rect(this.xPlus + 2 + pixelsPerCell / 2, this.yPlus + 2 + pixelsPerCell / 2, rectSize, rectSize);

		fill(255, 100, 255);
		stroke(140, 90, 140);
		strokeWeight(1);
		for (let i = 0; i < this.drones.length; i++)
		{
			if (this.drones[i][0] == undefined)
			{
				//ellipse(this.cell.x * pixelsPerCell + pixelsPerCell / 2 + this.xPlus - Math.sin(this.animationTimer + Math.PI * 2 * (i/3)) * pixelsPerCell, 
				//	this.cell.y * pixelsPerCell + pixelsPerCell / 2 + this.yPlus + Math.cos(this.animationTimer + Math.PI * 2 * (i/3))* pixelsPerCell, pixelsPerCell / 4);
				ellipse(pixelsPerCell / 2 + this.xPlus - Math.sin(this.animationTimer + Math.PI * 2 * (i/3)) * pixelsPerCell, 
					pixelsPerCell / 2 + this.yPlus + Math.cos(this.animationTimer + Math.PI * 2 * (i/3))* pixelsPerCell, pixelsPerCell / 4);
			}
			else
			{
				ellipse(this.drones[i][0].x * pixelsPerCell + pixelsPerCell / 2 + 0.5 + leftBarWidth + colSpace - Math.sin(this.animationTimer + Math.PI * 2 * (i/3)) * pixelsPerCell, 
					this.drones[i][0].y * pixelsPerCell + pixelsPerCell / 2 + 0.5 + rowSpace + Math.cos(this.animationTimer + Math.PI * 2 * (i/3))* pixelsPerCell, pixelsPerCell / 4);
			}
		}
		super.render();
	}
}

const tryCatchRange = 9;

class TryCatch extends Tower
{
	constructor(cell)
	{
		super(cell, 60);

		this.maxTimer = 300;
		this.range = tryCatchRange;
		this.damage = 40;
		this.firedTime = 0;
		this.firedX = 0;
		this.firedY = 0;
	}

	upgrade()
	{
		this.increaseUpgradeCost();
		this.damage *= 1.75;
		this.range += 0.4;
		this.maxTimer -= (this.maxTimer - 230) * 0.2;
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
				this.timer = this.maxTimer + floor(random(0, 3));
				stroke(0, 255, 255);
				strokeWeight(10);

				closestEnemy.damage(closestEnemy.elementType == Element.Runtime ? this.damage * 2 : (closestEnemy.elementType == Element.Logic ? this.damage * 0.5 : this.damage));

				this.firedX = closestEnemy.x * pixelsPerCell + 0.5 + leftBarWidth + colSpace + pixelsPerCell / 2;
				this.firedY = closestEnemy.y * pixelsPerCell + 0.5 + rowSpace + pixelsPerCell / 2;
				line(this.cell.x * pixelsPerCell + 0.5 + leftBarWidth + colSpace + pixelsPerCell / 2, 
					this.cell.y * pixelsPerCell + 0.5 + rowSpace + pixelsPerCell / 2,
					this.firedX,
					this.firedY);
				this.firedTime = 3;
			}
		}
	}

	render()
	{
		fill(60, 200, 200);
		stroke(100, 255, 255);
		strokeWeight(2);

		beginShape();
		vertex(this.xPlus + pixelsPerCell / 2, this.yPlus + 2);
		vertex(this.xPlus + (pixelsPerCell / 5) * 3, this.yPlus + (pixelsPerCell / 5) * 2);
		vertex(this.xPlus + pixelsPerCell - 3, this.yPlus + pixelsPerCell / 2);
		vertex(this.xPlus + (pixelsPerCell / 5) * 3, this.yPlus + (pixelsPerCell / 5) * 3);
		vertex(this.xPlus + pixelsPerCell / 2, this.yPlus + pixelsPerCell - 3);
		vertex(this.xPlus + (pixelsPerCell / 5) * 2, this.yPlus + (pixelsPerCell / 5) * 3);
		vertex(this.xPlus + 2, this.yPlus + pixelsPerCell / 2);
		vertex(this.xPlus + (pixelsPerCell / 5) * 2, this.yPlus + (pixelsPerCell / 5) * 2);
		endShape(CLOSE);
		
		if (this.firedTime > 0)
		{
			stroke(0, 255, 255);
			strokeWeight(10);

			line(this.cell.x * pixelsPerCell + 0.5 + leftBarWidth + colSpace + pixelsPerCell / 2, 
				this.cell.y * pixelsPerCell + 0.5 + rowSpace + pixelsPerCell / 2,
				this.firedX,
				this.firedY);
			this.firedTime--;
		}

		super.render();
	}
}

const testCaseRange = 2;

class TestCase extends Tower
{
	constructor(cell)
	{
		super(cell, 50);

		this.maxTimer = 130;
		this.range = testCaseRange;
		this.damage = 11;
		this.firedTime = 0;

		this.yHeight = Math.sqrt(3) * (pixelsPerCell - 4) / 4;
		this.xWidth = (pixelsPerCell - 4) / 4;
	}

	upgrade()
	{
		this.increaseUpgradeCost();
		this.damage *= 1.75;
		this.range += 0.15;
		this.maxTimer -= (this.maxTimer - 120) * 0.2;
	}

	update()
	{
		this.timer--;
		if (this.timer <= 0)
		{
			this.timer = floor(random(0, 10));
			let allEnemys = new Array();
			for (let i = 0; i < enemys.length; i++)
			{
				let distance = this.distance(enemys[i].x, enemys[i].y);
				if (distance < this.range)
				{
					allEnemys.push(enemys[i]);
				}
			}

			if (allEnemys.length > 0)
			{
				this.timer = this.maxTimer;
				fill(255, 200, 80, 70);
				stroke(255, 255, 0, 70);
				strokeWeight(5);

				for (let i = 0; i < allEnemys.length; i++)
				{
					allEnemys[i].damage(this.damage);
				}

				ellipse(this.cell.x * pixelsPerCell + 0.5 + leftBarWidth + colSpace + pixelsPerCell / 2, 
					this.cell.y * pixelsPerCell + 0.5 + rowSpace + pixelsPerCell / 2,
					pixelsPerCell * this.range * 2);
				this.firedTime = 7;
			}
		}
	}

	render()
	{
		fill(235, 160, 100);
		stroke(255, 200, 0);
		strokeWeight(2);

		beginShape();
		vertex(this.xPlus + 2, this.yPlus + pixelsPerCell / 2);
		vertex(this.xPlus + pixelsPerCell / 2 - this.xWidth, this.yPlus + pixelsPerCell / 2 + this.yHeight);
		vertex(this.xPlus + pixelsPerCell / 2 + this.xWidth, this.yPlus + pixelsPerCell / 2 + this.yHeight);
		vertex(this.xPlus + pixelsPerCell - 2, this.yPlus + pixelsPerCell / 2);
		vertex(this.xPlus + pixelsPerCell / 2 + this.xWidth, this.yPlus + pixelsPerCell / 2 - this.yHeight);
		vertex(this.xPlus + pixelsPerCell / 2 - this.xWidth, this.yPlus + pixelsPerCell / 2 - this.yHeight);
		endShape(CLOSE);

		if (this.firedTime > 0)
		{
			fill(255, 200, 80, 70);
			stroke(255, 255, 0, 70);
			strokeWeight(5);

			ellipse(this.cell.x * pixelsPerCell + 0.5 + leftBarWidth + colSpace + pixelsPerCell / 2, 
				this.cell.y * pixelsPerCell + 0.5 + rowSpace + pixelsPerCell / 2,
				pixelsPerCell * this.range * 2);
			this.firedTime--;
		}

		super.render();
	}
}

const commentsRange = 2.5;

class Comments extends Tower
{
	constructor(cell)
	{
		super(cell, 80);

		this.maxTimer = 10;
		this.range = commentsRange;
		this.slow = 0.7;
	}

	upgrade()
	{
		this.increaseUpgradeCost();
		this.slow -= (this.slow - 0.3) * 0.2;
		this.range += 0.2;
	}

	update()
	{
		this.timer--;
		if (this.timer <= 0)
		{
			this.timer = floor(random(0, 10));
			let allEnemys = new Array();
			for (let i = 0; i < enemys.length; i++)
			{
				let distance = this.distance(enemys[i].x, enemys[i].y);
				if (distance < this.range)
				{
					allEnemys.push(enemys[i]);
				}
			}

			if (allEnemys.length > 0)
			{
				this.timer = this.maxTimer;
				fill(140, 200, 255, 30);
				stroke(0, 150, 255, 30);
				strokeWeight(2);

				for (let i = 0; i < allEnemys.length; i++)
				{
					if (allEnemys[i].slow > this.slow)
					{
						allEnemys[i].slow = this.slow;
					}
					allEnemys[i].slowTimer = 15;
				}

				ellipse(this.cell.x * pixelsPerCell + 0.5 + leftBarWidth + colSpace + pixelsPerCell / 2, 
					this.cell.y * pixelsPerCell + 0.5 + rowSpace + pixelsPerCell / 2,
					pixelsPerCell * this.range * 2);
			}
		}
	}

	render()
	{
		stroke(160, 255, 80);
		strokeWeight(3);

		line(this.xPlus + 4, this.yPlus + pixelsPerCell - 4, 
			this.xPlus + pixelsPerCell / 2, this.yPlus + 4);
		line(this.xPlus + pixelsPerCell / 2, this.yPlus + pixelsPerCell - 4, 
			this.xPlus + pixelsPerCell - 4, this.yPlus + 4);

		super.render();
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

let money = 300;
let wave = -1;
let biggestWave = 0;

let deleteButton;
let upgradeButton;
let breakpointButton; // wall
let consoleLogButton; // base shooting (LOGIC, syntax)
let documentationButton; //drone latching (SYNTAX, runtime)
let tryCatchButton; // sniper (RUNTIME, logic)
let testCaseButton; // area of affect (NO BONUS)
let commentsButton; // slows (NO BONUS)
let startGameButton; // this .active stores the state of wether the game is paused or not

let framesUntilNextWave = 0;

let thisElement;
let thisType;

let nextElement;
let nextType;

let nextNextElement;
let nextNextType;

let isOnTitleScreen = true;

let failText = "";
let failTimer = 0;

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

function startGame()
{
	isOnTitleScreen = false;
	money = 300;
	wave = -1;
	spawners = new Array();
	enemys = new Array();

	cols = Math.floor((windowWidth - leftBarWidth) / pixelsPerCell);
	rows = Math.floor((windowHeight - bottomHeight) / pixelsPerCell);

	colSpace = ((windowWidth - leftBarWidth) % pixelsPerCell) / 2;
	rowSpace = ((windowHeight - bottomHeight) % pixelsPerCell) / 2;

	let size = leftBarWidth / 2 - 30;

	deleteButton = new TowerButton(20, 50, size);
	upgradeButton = new TowerButton(40 + size, 50, size);

	breakpointButton = new TowerButton(20, 70 + size, size);
	consoleLogButton = new TowerButton(40 + size, 70 + size, size);

	documentationButton = new TowerButton(20, 90 + size * 2, size);
	tryCatchButton = new TowerButton(40 + size, 90 + size * 2, size);

	testCaseButton = new TowerButton(20, 110 + size * 3, size);
	commentsButton = new TowerButton(40 + size, 110 + size * 3, size);

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
	if (isOnTitleScreen)
	{
		doTitleScreen();
	}
	else
	{
		render();
		
		if (startGameButton.active)
		{
			doGameLoop();
		}
	}
}

function mousePressed()
{
	if (!isOnTitleScreen)
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
		if (documentationButton.testClick())
		{
			activateButton(documentationButton);
		}
		if (tryCatchButton.testClick())
		{
			activateButton(tryCatchButton);
		}
		if (testCaseButton.testClick())
		{
			activateButton(testCaseButton);
		}
		if (commentsButton.testClick())
		{
			activateButton(commentsButton);
		}

		let x = floor((mouseX - 0.5 - leftBarWidth - colSpace) / pixelsPerCell);
		let y = floor((mouseY - 0.5 - rowSpace) / pixelsPerCell);
		let cell = getCell(x, y);
		if (cell != null)
		{
			if (deleteButton.active)
			{
				if (cell.tower != null)
				{
					money += floor(cell.tower.cost * 0.75);
					cell.tower = null;
				}
				else if (cell.tower == null && !cell.walkable && cell.buildable)
				{
					if (money >= 10)
					{
						cell.walkable = true;
						money -= 10;
						redoPaths();
					}
					else
					{
						failText = "Not enough memory. Costs 10 kB to remove a breakpoint.";
						failTimer = 120;
					}
				}
			}
			else if (upgradeButton.active && cell.tower != null)
			{
				if (money >= cell.tower.upgradeCost)
				{
					money -= cell.tower.upgradeCost;
					cell.tower.upgrade();
				}
				else
				{
					failText = "Not enough memory.";
					failTimer = 120;
				}
			}
			else if (breakpointButton.active && cell.walkable && cell.buildable)
			{
				if (money >= 5)
				{
					cell.walkable = !cell.walkable;
					if (!redoPaths())
					{
						cell.walkable = !cell.walkable;
						failText = "Can't block the errors.";
						failTimer = 120;
					}
					else
					{
						money -= 5;
					}
				}
				else
				{
					failText = "Not enough memory.";
					failTimer = 120;
				}
			}
			else if (cell.buildable && cell.tower == null && !cell.walkable)
			{
				if (consoleLogButton.active)
				{
					if (money >= 25)
					{
						cell.tower = new ConsoleLog(cell);
						money -= 25;
					}
					else
					{
						failText = "Not enough memory.";
						failTimer = 120;
					}
				}
				if (documentationButton.active)
				{
					if (money >= 50)
					{
						cell.tower = new Documentation(cell);
						money -= 50;
					}
					else
					{
						failText = "Not enough memory."
						failTimer = 120;
					}
				}
				if (tryCatchButton.active)
				{
					if (money >= 60)
					{
						cell.tower = new TryCatch(cell);
						money -= 60;
					}
					else
					{
						failText = "Not enough memory."
						failTimer = 120;
					}
				}
				if (testCaseButton.active)
				{
					if (money >= 50)
					{
						cell.tower = new TestCase(cell);
						money -= 50;
					}
					else
					{
						failText = "Not enough memory."
						failTimer = 120;
					}
				}
				if (commentsButton.active)
				{
					if (money >= 80)
					{
						cell.tower = new Comments(cell);
						money -= 80;
					}
					else
					{
						failText = "Not enough memory."
						failTimer = 120;
					}
				}
			}
			else
			{
				failText = "Can only build on an empty breakpoint.";
				failTimer = 120;
			}
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

	documentationButton.active = false;
	tryCatchButton.active = false;

	testCaseButton.active = false;
	commentsButton.active = false;

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
	textAlign(CENTER, BASELINE);

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
	text("Debuggers", 10, 10, leftBarWidth - 20);

	let size = leftBarWidth / 2 - 30;

	deleteButton.render(0);
	upgradeButton.render(1);

	breakpointButton.render(2);
	consoleLogButton.render(3);

	documentationButton.render(4);
	tryCatchButton.render(5);

	testCaseButton.render(6);
	commentsButton.render(7);

	textSize(26);
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
	if (deleteButton.active)
	{
		showTowerTopText("Delete", "Refunds 75% of the memory spent on a tower, but costs 10 kB to remove a breakpoint.", -1, 4, size);
	}
	if (upgradeButton.active)
	{
		showTowerTopText("Upgrade", "Levels a tower up, improving its stats.", -1, 2, size);
	}

	if (breakpointButton.active)
	{
		showTowerTopText("Break Point", "A wall that the errors cannot walk through. Debuggers must be placed on these.", 5, 4, size);
	}
	if (consoleLogButton.active)
	{
		showTowerTopText("Console Log", "A standard debugger that shoots the error closest to the end.", 25, 3, size);

		fill(200,200,255);
		text("200% against Logic.", 10, 260 + size, leftBarWidth - 20);
		fill(130,205,130);
		text("50% against Syntax.", 10, 280 + size, leftBarWidth - 20);
	}
	if (documentationButton.active)
	{
		showTowerTopText("Documentation", "Latchs drones onto enemys until they die. Effective at the start of long paths.", 50, 4, size);

		fill(200,255,200);
		text("200% against Syntax.", 10, 280 + size, leftBarWidth - 20);
		fill(205,130,130);
		text("50% against Runtime.", 10, 300 + size, leftBarWidth - 20);
	}
	if (tryCatchButton.active)
	{
		showTowerTopText("Try Catch", "A sniper debugger that has very long range and high damage, but slow fire rate.", 60, 4, size);

		fill(255,200,200);
		text("200% against Runtime.", 10, 280 + size, leftBarWidth - 20);
		fill(130,130,205);
		text("50% against Logic.", 10, 300 + size, leftBarWidth - 20);
	}
	if (testCaseButton.active)
	{
		showTowerTopText("Test Case", "Very low range but hits all errors in a radius around it.", 50, 3, size);
	}
	if (commentsButton.active)
	{
		showTowerTopText("Comments", "Doesn't hurt errors but slows them down significantly in a radius.", 80, 3, size);
	}
}

function showTowerTopText(title, desc, amount, descLines, size)
{
	fill(255);
	noStroke();
	text(title, 13, 130 + size, leftBarWidth - 20);
	textSize(16);
	fill(200);
	text(desc, 13, 165 + size, leftBarWidth - 20);
	if (amount != -1)
	{
		text("Cost: " + amount + " kB.", 13, 170 + size + descLines * 20, leftBarWidth - 20);
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

	let towerRenderQueue = new Array();
	for (let x = 0; x < cols; x++)
	{
		for (let y = 0; y < rows; y++)
		{
			towerRenderQueue.push(cells[x][y].render(false));
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

	for (let i = 0; i < towerRenderQueue.length; i++)
	{
		if (towerRenderQueue[i] != undefined)
		{
			towerRenderQueue[i].render();
		}
	}

	drawMenus();

	drawRangeDisplay();

	if (failTimer > 0)
	{
		textSize(24);
		textAlign(LEFT);
		fill(255, 0, 0);
		stroke(0);
		strokeWeight(4);

		text(failText, mouseX, mouseY - 15);
		failTimer--;
	}
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
	if (biggestWave < wave)
	{
		biggestWave = wave;
	}
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
				if (enemys[i].enemyType == EnemyType.Normal)
				{
					money += floor(5 * (wave / 14 + 1));
				}
				else if (enemys[i].enemyType == EnemyType.Swarm)
				{
					money += floor(wave / 14 + 1);
				}
				else if (enemys[i].enemyType == EnemyType.Tank)
				{
					money += floor(17 * (wave / 14 + 1));
				}
			}
			else
			{
				finish.health -= val;
			}
			enemys.splice(i, 1);
			i--;
		}
	}

	if (finish.health <= 0)
	{
		isOnTitleScreen = true;
	}

	framesUntilNextWave--;
}

function drawRangeDisplay() // also does upgrade text
{
	let x = floor((mouseX - 0.5 - leftBarWidth - colSpace) / pixelsPerCell);
	let y = floor((mouseY - 0.5 - rowSpace) / pixelsPerCell);
	let cell = getCell(x, y);

	fill(140, 140, 140, 90);
	stroke(190, 190, 190, 90);
	strokeWeight(4);

	if (cell != null)
	{
		if (cell.tower == null && cell.buildable && !cell.walkable)
		{
			x = x * pixelsPerCell + leftBarWidth + colSpace + pixelsPerCell / 2;
			y = y * pixelsPerCell + rowSpace + pixelsPerCell / 2;
			if (consoleLogButton.active)
			{
				ellipse(x, y, consoleLogRange * pixelsPerCell * 2);
			}
			if (documentationButton.active)
			{
				ellipse(x, y, documentationRange * pixelsPerCell * 2);
			}
			if (tryCatchButton.active)
			{
				ellipse(x, y, tryCatchRange * pixelsPerCell * 2);
			}
			if (testCaseButton.active)
			{
				ellipse(x, y, testCaseRange * pixelsPerCell * 2);
			}
			if (commentsButton.active)
			{
				ellipse(x, y, commentsRange * pixelsPerCell * 2);
			}
		}
		else if (cell.tower != null)
		{
			x = x * pixelsPerCell + leftBarWidth + colSpace + pixelsPerCell / 2;
			y = y * pixelsPerCell + rowSpace + pixelsPerCell / 2;

			ellipse(x, y, cell.tower.range * pixelsPerCell * 2);
			if (upgradeButton.active)
			{
				fill(255, 255, 120);
				stroke(0);
				strokeWeight(4);

				text("Upgrade: " + cell.tower.upgradeCost + " kB", x, y - pixelsPerCell);
			}
		}
	}
}

function doTitleScreen()
{
	//draw background colour
	background(0);
	textSize(60);
	noStroke();
	fill(255);

	textAlign(CENTER);
	text("Error Defense!", windowWidth / 2, 60);
	textSize(20);
	fill(180);
	text("The errors are invading your code! Stop them before it crashes!", windowWidth / 2, 100);

	fill(210);
	text("Place debuggers to stop the errors.", windowWidth / 2, 180);
	text("Survive as many waves of errors as possible.", windowWidth / 2, 210);
	text("Gain memory for killing errors so you can place more debuggers.", windowWidth / 2, 240);

	textSize(40);
	text("Highest wave this session: " + biggestWave, windowWidth / 2, windowHeight - 20);

	stroke(90);
	strokeWeight(2);
	if (mouseX >= windowWidth / 2 - 100 && mouseX <= windowWidth / 2 + 100 && mouseY >= windowHeight / 2 - 40 && mouseY <= windowHeight / 2 + 40)
	{
		fill(110);
		if (mouseIsPressed)
		{
			startGame();
		}
	}
	else
	{
		fill(60);
	}
	rect(windowWidth / 2 - 100, windowHeight / 2 - 40, 200, 80);
	fill(255);
	textSize(40);
	text("Start!", windowWidth / 2, windowHeight / 2 + 15);
}