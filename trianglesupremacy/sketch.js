// Triangle Supremacy
// Timothy Letkeman
// Monday 9th September, 2019
//
// Extra for Experts:
// - Classes / Polymorpism
// - Vector2 implementation
// - Made my own shapes

//creates a variable type to store 2 number
function Vector2(x, y) {
	this.x = x;
	this.y = y;
}

//lets you 
Vector2.prototype = {
	add: function(vector) {
		return new Vector2(this.x + vector.x, this.y + vector.y);
	},

	subtract: function(vector) {
		return new Vector2(this.x - vector.x, this.y - vector.y);
	},

	multiply: function(scalar) {
		return new Vector2(this.x * scalar, this.y * scalar);
	},

	divide: function(scalar) {
		return new Vector2(this.x / scalar, this.y / scalar);
	},

	magnitude: function() {
		return Math.sqrt(this.x * this.x + this.y * this.y);
	},

	distance: function(vector) {
		let xx = Math.abs(this.x - vector.x);
		let yy = Math.abs(this.y - vector.y);
		return Math.sqrt(xx * xx + yy * yy);
	},

	moveTowards: function(vector, delta) {
		let diff = vector.subtract(this);
		diff.normalize();
		return this.add(diff.multiply(delta));
	},

	normalize: function() {
		let mag = this.magnitude();
		this.x /= mag;
		this.y /= mag;
		return this;
	},

	normalized: function() {
		let mag = this.magnitude();
		return new Vector2(this.x / mag, this.y / mag);
	},

	rotate: function(alpha) {
		let cos = Math.cos(alpha);
		let sin = Math.sin(alpha);
		let vector = new Vector2();
		vector.x = this.x * cos - this.y * sin;
		vector.y = this.x * sin + this.y * cos;
		return vector;
	},
	
	lerp: function(vector, by) {
		let x = this.x * (1 - by) + vector.x * by;
		let y = this.y * (1 - by) + vector.y * by;
		return new Vector2(x, y);
	}
}

class Enemy
{
	constructor(position, player, radius, health, damage)
	{
		this.position = position;
		this.player = player;
		this.health = health;
		this.damage = damage;
		this.radius = radius;
	}

	collides(point, extra)
	{
		return this.position.distance(point) <= this.radius + extra;
	}
}

class EHexagon extends Enemy // Hexagon dies in one hit no matter what
{
	constructor(position, player)
	{
		super(position, player, 8, 0, 5);

		this.accelerationSpeed = 0.02;
		this.moveSpeed = 2.2;

		//These values only used for rendering
		this.yHeight = Math.sqrt(3) * this.radius / 2;
		this.xWidth = this.radius / 2;

		this.velocity = new Vector2(random(-1, 1), random(-1, 1));
		this.velocity.normalize();
		this.positionOffset = new Vector2(random(-75, 75), random(-75, 75));
	}

	attack(damage) // Hexagon dies in one hit no matter what
	{
		return true;
	}

	update() // return true if it dies
	{
		//dont offset the target if its close to the player
		let distance = this.position.distance(this.player.position);
		if (distance < 175)
		{
			this.velocity = this.velocity.moveTowards(this.player.position.subtract(this.position), this.accelerationSpeed);
		}
		else if (distance > 600)
		{
			this.velocity = this.velocity.moveTowards(this.player.position.subtract(this.position).add(this.positionOffset.multiply(3)), this.accelerationSpeed / 3);
		}
		else
		{
			this.velocity = this.velocity.moveTowards(this.player.position.subtract(this.position).add(this.positionOffset), this.accelerationSpeed);
		}
		this.velocity.normalize();

		//restrict to not go off the edge
		if (this.position.x < 0)
		{
			this.velocity.x = Math.abs(this.velocity.x);
		}
		if (this.position.y < 0)
		{
			this.velocity.y = Math.abs(this.velocity.y);
		}
		if (this.position.x > windowWidth)
		{
			this.velocity.x = -Math.abs(this.velocity.x);
		}
		if (this.position.y > windowHeight)
		{
			this.velocity.y = -Math.abs(this.velocity.y);
		}

		this.position = this.position.add(this.velocity.multiply(this.moveSpeed));

		if (distance <= this.radius + player.radius)
		{
			return true;
		}
		return false;
	}

	render()
	{
		noFill();
		stroke(40, 190, 230);
		strokeWeight(2);

		//draws the hex
		beginShape();
		vertex(this.position.x - this.radius, this.position.y);
		vertex(this.position.x - this.xWidth, this.position.y + this.yHeight);
		vertex(this.position.x + this.xWidth, this.position.y + this.yHeight);
		vertex(this.position.x + this.radius, this.position.y);
		vertex(this.position.x + this.xWidth, this.position.y - this.yHeight);
		vertex(this.position.x - this.xWidth, this.position.y - this.yHeight);
		endShape(CLOSE);
	}
}

class ECircle extends Enemy // Circle will split into three when killed
{
	constructor(position, player, canSplit)
	{
		super(position, player, 25 * (canSplit ? 1: 0.4), 30 * (canSplit ? 1: 0.2), canSplit ? 15: 10);

		this.moveSpeed = 1.6 * (canSplit ? 1: 0.8);
		this.canSplit = canSplit;

		this.velocity = new Vector2(random(-1, 1), random(-1, 1));
		this.velocity.normalize();
	}

	attack(damage) 
	{
		this.health -= damage;
		if (this.health <= 0)
		{
			//when it dies split
			if (this.canSplit)
			{
				enemys.push(new ECircle(this.position.add(new Vector2(random(-15, 15), random(-15, 15))), this.player, false));
				enemys.push(new ECircle(this.position.add(new Vector2(random(-15, 15), random(-15, 15))), this.player, false));
				enemys.push(new ECircle(this.position.add(new Vector2(random(-15, 15), random(-15, 15))), this.player, false));
			}
			return true;
		}
		return false;
	}

	update() // return true if it dies
	{
		if (this.position.x < 0)
		{
			this.velocity.x = Math.abs(this.velocity.x);
		}
		if (this.position.y < 0)
		{
			this.velocity.y = Math.abs(this.velocity.y);
		}
		if (this.position.x > windowWidth)
		{
			this.velocity.x = -Math.abs(this.velocity.x);
		}
		if (this.position.y > windowHeight)
		{
			this.velocity.y = -Math.abs(this.velocity.y);
		}

		this.position = this.position.add(this.velocity.multiply(this.moveSpeed));

		if (this.position.distance(this.player.position) <= this.radius + player.radius)
		{
			return true;
		}
		return false;
	}

	render()
	{
		noFill();
		if (this.canSplit)
		{
			stroke(80, 255, 150);
		}
		else
		{
			stroke(40, 210, 100);
		}
		strokeWeight(2);

		beginShape();
		ellipse(this.position.x, this.position.y, this.radius * 2)
		endShape(CLOSE);
	}
}

class ESquare extends Enemy //moves slow randomly and shoots at player
{
	constructor(position, player)
	{
		super(position, player, 15, 40, 15);

		this.accelerationSpeed = 0.07;
		this.moveSpeed = 0.8;

		this.shootFrames = 0;

		this.velocity = new Vector2(random(-1, 1), random(-1, 1));
		this.velocity.normalize();
		this.target = new Vector2(random(0, windowWidth), random(0, windowHeight));
	}

	attack(damage) 
	{
		this.health -= damage;
		this.shootFrames += 50;
		return (this.health <= 0);
	}

	update() // return true if it dies
	{
		this.move();

		//shooting timer
		this.shootFrames++;

		if (this.shootFrames > 200)
		{
			this.shootFrames = random(0, 50);

			//spawn a projectile
			enemyProjectiles.push(new Projectile(this.position, this.player.position.subtract(this.position).rotate(random(-0.5, 0.5)).normalized().multiply(3.2), 5, [130, 0, 0], [255, 0, 0], 2, 10));
		}

		if (this.position.distance(this.player.position) <= this.radius + player.radius)
		{
			return true;
		}
		return false;
	}

	move()
	{
		if (this.position.distance(this.target) < 20)
		{
			this.target = new Vector2(random(0, windowWidth), random(0, windowHeight));
		}
		this.velocity = this.velocity.moveTowards(this.target.subtract(this.position), this.accelerationSpeed);
		this.velocity.normalize();

		if (this.position.x < 0)
		{
			this.velocity.x = Math.abs(this.velocity.x);
		}
		if (this.position.y < 0)
		{
			this.velocity.y = Math.abs(this.velocity.y);
		}
		if (this.position.x > windowWidth)
		{
			this.velocity.x = -Math.abs(this.velocity.x);
		}
		if (this.position.y > windowHeight)
		{
			this.velocity.y = -Math.abs(this.velocity.y);
		}

		this.position = this.position.add(this.velocity.multiply(this.moveSpeed));
	}

	render()
	{
		noFill();
		stroke(190, 60, 40);
		strokeWeight(2);

		rect(this.position.x - this.radius, this.position.y - this.radius, this.radius * 2, this.radius * 2);
	}
}

class ECross extends Enemy //bounces off the walls erratically and shoots when hitting a wall
{
	constructor(position, player)
	{
		super(position, player, 15, 30, 20);

		this.moveSpeed = 3.8;

		this.velocity = new Vector2(random(-1, 1), random(-1, 1));
		this.velocity.normalize();
		
		this.looking = new Vector2(random(-1, 1), random(-1, 1));
		this.looking.normalize();
	}

	attack(damage)
	{
		this.health -= damage;
		return (this.health <= 0);
	}

	update() // return true if it dies
	{
		this.looking = this.looking.rotate(0.05);
		this.move();

		if (this.position.distance(this.player.position) <= this.radius + player.radius)
		{
			return true;
		}
		return false;
	}

	move()
	{
		if (this.position.x < 0)
		{
			this.velocity.x = random(1);
			this.velocity.y = random(-1, 1);
			this.velocity.normalize();
			this.shoot();
		}
		if (this.position.y < 0)
		{
			this.velocity.x = random(-1, 1);
			this.velocity.y = random(1);
			this.velocity.normalize();
			this.shoot();
		}
		if (this.position.x > windowWidth)
		{
			this.velocity.x = random(1) - 2;
			this.velocity.y = random(-1, 1);
			this.velocity.normalize();
			this.shoot();
		}
		if (this.position.y > windowHeight)
		{
			this.velocity.x = random(-1, 1);
			this.velocity.y = random(1) - 2;
			this.velocity.normalize();
			this.shoot();
		}

		this.position = this.position.add(this.velocity.multiply(this.moveSpeed));
	}

	shoot()
	{
		enemyProjectiles.push(new Projectile(this.position, this.looking.multiply(3.2), 5, [130, 0, 0], [255, 0, 0], 2, 10));
		enemyProjectiles.push(new Projectile(this.position, this.looking.multiply(-3.2), 5, [130, 0, 0], [255, 0, 0], 2, 10));
		enemyProjectiles.push(new Projectile(this.position, this.looking.multiply(3.2).rotate(1.57), 5, [130, 0, 0], [255, 0, 0], 2, 10));
		enemyProjectiles.push(new Projectile(this.position, this.looking.multiply(-3.2).rotate(1.57), 5, [130, 0, 0], [255, 0, 0], 2, 10));
	}

	render()
	{
		noFill();
		stroke(255, 60, 255);
		strokeWeight(2);

		let v1 = this.position.add(this.looking.multiply(this.radius));
		let v2 = this.position.subtract(this.looking.multiply(this.radius));
		let v3 = this.position.add(this.looking.multiply(this.radius).rotate(1.57));
		let v4 = this.position.subtract(this.looking.multiply(this.radius).rotate(1.57));

		line(v1.x, v1.y, v2.x, v2.y);
		line(v3.x, v3.y, v4.x, v4.y);
	}
}

class EDiamond extends Enemy //lots of health that moves toward the player quickly
{
	constructor(position, player)
	{
		super(position, player, 20, 140, 30);

		this.accelerationSpeed = 0.15;
		this.moveSpeed = 6.7;

		this.movementFrames = 0;

		this.velocity = new Vector2(random(-1, 1), random(-1, 1));
		this.velocity.normalize();
		this.positionOffset = new Vector2(random(-5, 5), random(-5, 5));
	}

	attack(damage) // Hexagon dies in one hit no matter what
	{
		this.health -= damage;

		return (this.health <= 0);
	}

	update() // return true if it dies
	{
		this.move();

		if (this.position.distance(this.player.position) <= this.radius + player.radius)
		{
			return true;
		}
		return false;
	}

	move()
	{
		if (this.position.x < 0)
		{
			this.velocity.x = Math.abs(this.velocity.x);
		}
		if (this.position.y < 0)
		{
			this.velocity.y = Math.abs(this.velocity.y);
		}
		if (this.position.x > windowWidth)
		{
			this.velocity.x = -Math.abs(this.velocity.x);
		}
		if (this.position.y > windowHeight)
		{
			this.velocity.y = -Math.abs(this.velocity.y);
		}

		//movement "jolt" timer
		this.movementFrames++;
		if (this.movementFrames < 20)
		{
			this.position = this.position.add(this.velocity.multiply(this.moveSpeed));
		}
		else if (this.movementFrames < 60)
		{
			this.velocity = this.velocity.moveTowards(this.player.position.subtract(this.position).add(this.positionOffset), this.accelerationSpeed);
			this.velocity.normalize();
		}
		else
		{
			this.positionOffset = new Vector2(random(-100, 100), random(-100, 100));
			this.movementFrames = 0;
		}
	}

	render()
	{
		noFill();
		stroke(255, 255, 130);
		strokeWeight(2);

		beginShape();
		vertex(this.position.x + this.velocity.x * this.radius * 1.5, 
			this.position.y + this.velocity.y * this.radius * 1.5);
		vertex(this.position.x + this.velocity.rotate(1.57).x * this.radius * 0.8, 
			this.position.y + this.velocity.rotate(1.57).y * this.radius * 0.8);
		vertex(this.position.x - this.velocity.x * this.radius * 1.5, 
			this.position.y - this.velocity.y * this.radius * 1.5);
		vertex(this.position.x - this.velocity.rotate(1.57).x * this.radius * 0.8, 
			this.position.y - this.velocity.rotate(1.57).y * this.radius * 0.8);
		endShape(CLOSE);
	}
}

class Projectile
{
	constructor(position, velocity, radius, fill, stroke, strokeSize, damage)
	{
		this.position = position;
		this.velocity = velocity;
		this.radius = radius;
		this.fill = fill;
		this.stroke = stroke;
		this.strokeSize = strokeSize;
		this.damage = damage;
	}

	update() //return true if dead
	{
		this.position = this.position.add(this.velocity);

		return (this.position.x < 0 || this.position.y < 0 || this.position.x > windowWidth || this.position.y > windowHeight);
	}

	render()
	{
		fill(this.fill[0], this.fill[1], this.fill[2]);
		stroke(this.stroke[0], this.stroke[1], this.stroke[2]);
		strokeWeight(this.strokeSize);

		ellipse(this.position.x, this.position.y, this.radius * 2);
	}
}

class Player
{
	constructor()
	{
		this.position = new Vector2(windowWidth / 2, windowHeight / 2);
		this.rotation = new Vector2(0, 1);
		this.velocity = new Vector2(0, 0);
		this.radius = 15;
		this.health = 100;

		this.speed = 0.5;
		this.shootFrames = 0;
	}

	collides(point, extra)
	{
		return this.position.distance(point) <= this.radius + extra;
	}

	update()
	{
		this.move();
		this.shoot();
	}

	shoot()
	{
		this.shootFrames++;

		if (this.shootFrames > 30 && mouseIsPressed)
		{
			this.shootFrames = 0;

			//bullet in the center does 2x damage
			playerProjectiles.push(new Projectile(this.position, this.rotation.multiply(6), 7, [125, 125, 58], [255,255,255], 3, 20));
			playerProjectiles.push(new Projectile(this.position, this.rotation.multiply(5.6).rotate(-0.07), 5, [70, 125, 70], [255,255,255], 2, 10));
			playerProjectiles.push(new Projectile(this.position, this.rotation.multiply(5.6).rotate(0.07), 5, [70, 125, 70], [255,255,255], 2, 10));
		}
	}
	
	move()
	{
		this.rotation = new Vector2(mouseX, mouseY).subtract(this.position);
		this.rotation.normalize();

		this.velocity = this.velocity.multiply(0.8);

		if (keyIsDown(87)) // w
		{
			this.velocity.y -= 1;
		}
		if (keyIsDown(83)) // s
		{
			this.velocity.y += 1;
		}

		if (keyIsDown(68)) // d
		{
			this.velocity.x += 1;
		}
		if (keyIsDown(65)) // a
		{
			this.velocity.x -= 1;
		}

		if (this.position.x < 0 && this.velocity.x < 0)
		{
			this.velocity.x = 0;
		}
		if (this.position.y < 0 && this.velocity.y < 0)
		{
			this.velocity.y = 0;
		}
		if (this.position.x > windowWidth && this.velocity.x > 0)
		{
			this.velocity.x = 0;
		}
		if (this.position.y > windowHeight && this.velocity.y > 0)
		{
			this.velocity.y = 0;
		}

		this.position = this.position.add(this.velocity.multiply(this.speed));
	}

	render()
	{
		fill(160);
		stroke(255, 255, 255);
		strokeWeight(4);

		let v1 = this.position.add(this.rotation.rotate(-40).multiply(this.radius));
		let v2 = this.position.add(this.rotation.rotate(40).multiply(this.radius));
		let v3 = this.position.add(this.rotation.multiply(this.radius));

		triangle(v1.x, v1.y, v2.x, v2.y, v3.x, v3.y)
	}
}

let playerProjectiles = new Array();
let player;
let enemyProjectiles = new Array();
let enemys = new Array();

let gameRunning = false;
let wave = 0;
let biggestWave = 0;
let spawnSide = false;

function setup() 
{
	//caps frames at 60
	frameRate(60);
	createCanvas(windowWidth, windowHeight);
}

function drawTitle()
{
	//draw background colour
	background(0);
	textSize(40);
	noStroke();
	fill(255);

	textAlign(CENTER);
	text("Triangle Supremacy", windowWidth / 2, 50);
	textSize(20);
	fill(180);
	text("The other shapes are invading! Show them triangles are the best!", windowWidth / 2, 90);

	fill(210);
	text("WASD to Move. Mouse to aim. Left mouse button to shoot.", windowWidth / 2, 180);
	text("Survive as many waves of shapes as possible.", windowWidth / 2, 210);
	text("The next wave will come from the red zone.", windowWidth / 2, 240);
	text("Press M to start or restart at any point.", windowWidth / 2, windowHeight / 2);

	text("Highest wave this session: " + biggestWave, windowWidth / 2, windowHeight - 10);
}

function startGame()
{
	wave = 0;
	gameRunning = true;

	player = new Player();
	enemys = new Array();
	playerProjectiles = new Array();
	enemyProjectiles = new Array();

	spawnWave();
}

function spawnWave()
{
	wave++;
	if (wave > biggestWave)
	{
		biggestWave = wave;
	}

	for (let i = 0; i < 7 + wave * random(1.5, 2.5); i++)
	{
		enemys.push(new EHexagon(getSpawn(), player));
	}
	for (let i = 0; i < 1 + wave * random(0.5, 1); i++)
	{
		enemys.push(new ECircle(getSpawn(), player, true));
	}
	if (wave > 1)
	{
		for (let i = 0; i < 1 + wave * random(0.6, 1.2); i++)
		{
			enemys.push(new ESquare(getSpawn(), player));
		}
	}
	if (wave > 2)
	{
		for (let i = 0; i < 0 + wave * random(0.5, 1); i++)
		{
			enemys.push(new ECross(getSpawn(), player));
		}
	}
	if (wave > 3)
	{
		for (let i = 0; i < -1 + wave * random(0.3,0.7); i++)
		{
			enemys.push(new EDiamond(getSpawn(), player));
		}
	}
	spawnSide = (0.2 < random(1) ? !spawnSide : spawnSide);
}

function getSpawn()
{
	return (spawnSide ? new Vector2(random(windowWidth * 0.8, windowWidth), random(0, windowHeight)) : new Vector2(random(0, windowWidth * 0.2), random(0, windowHeight))); 
}

function drawGame()
{
	//draw background colour
	background(0);
	fill(50, 0, 0);
	noStroke();
	if (spawnSide)
	{
		rect(windowWidth - 20, 0, 20, windowHeight);
	}
	else
	{
		rect(0, 0, 20, windowHeight);
	}

	textAlign(LEFT);
	textSize(30);
	fill(255);
	text("Wave: " + wave, 10, 30);
	text("Health: " + player.health, 10, 70);

	if (player.health <= 0)
	{
		gameRunning = false;
	}

	player.update();

	for (let i = 0; i < playerProjectiles.length; i++)
	{
		playerProjectiles[i].update();
		playerProjectiles[i].render();
		for (let e = 0; e < enemys.length; e++)
		{
			if (enemys[e].collides(playerProjectiles[i].position, playerProjectiles[i].radius))
			{
				if (enemys[e].attack(playerProjectiles[i].damage))
				{
					enemys.splice(e, 1);
					e--;
				}
				playerProjectiles.splice(i, 1);
				i--;
				break;
			}
		}
	}

	player.render();

	for (let i = 0; i < enemys.length; i++)
	{
		if (enemys[i].update())
		{
			player.health -= enemys[i].damage;
			enemys.splice(i, 1);
			i--;
		}
		else
		{
			enemys[i].render();
		}
	}

	for (let i = 0; i < enemyProjectiles.length; i++)
	{
		enemyProjectiles[i].update();
		enemyProjectiles[i].render();

		if (player.collides(enemyProjectiles[i].position, enemyProjectiles[i].radius))
		{
			player.health -= enemyProjectiles[i].damage;
			enemyProjectiles.splice(i, 1);
			i--;
			break;
		}
	}

	if (enemys.length <= wave * 2 + 2)
	{
		spawnWave();
	}
}

function draw() 
{
	if (gameRunning)
	{
		drawGame();
	}
	else
	{
		drawTitle();
	}
}

function keyPressed()
{
	if (keyCode === 77) //m
	{
		startGame();
	}
}
