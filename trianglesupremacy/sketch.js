// Triangle Supremacy
// Timothy Letkeman
// Wednesday 5th September, 2019
//
// Extra for Experts:
// - Classes
// - Vector2 implementation

function Vector2(x, y) {
	this.x = x;
	this.y = y;
}

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
		this.x /= mag;
		this.y /= mag;
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

const EnemyTypes = {
	Hexagon: 0,
	Circle: 1,
	Square: 2,
	Cross: 3,
	Arrow: 4,
	Trapezoid: 5,
	Elite: 6
};

class Enemy
{
	constructor(position, player, health)
	{
		this.position = position;
		this.player = player;
		this.health = health;
	}

	collides(point, extra)
	{

	}

	attack(damage) // returns true if killed
	{
		return false;
	}

	update() // return true if it dies
	{
		return false;
	}

	render()
	{

	}
}

class EHexagon extends Enemy // Hexagon dies in one hit no matter what
{
	constructor(position, player)
	{
		super(position, player, 0);

		this.accelerationSpeed = 0.02;
		this.moveSpeed = 2.2;
		this.radius = 7;

		//These values only used for rendering
		this.yHeight = Math.sqrt(3) * this.radius / 2;
		this.xWidth = this.radius / 2;

		this.velocity = new Vector2(random(-1, 1), random(-1, 1));
		this.velocity.normalize();
		this.positionOffset = new Vector2(random(-75, 75), random(-75, 75));
	}

	collides(point, extra)
	{
		return this.position.distance(point) <= this.radius + extra;
	}

	attack(damage) // Hexagon dies in one hit no matter what
	{
		return true;
	}

	update() // return true if it dies
	{
		this.velocity = this.velocity.moveTowards(this.player.position.subtract(this.position).add(this.positionOffset), this.accelerationSpeed);
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

		if (this.position.distance(this.player.position) <= this.radius + player.radius)
		{
			return true;
		}
		return false;
	}

	render()
	{
		fill(0);
		stroke(40, 190, 230);
		strokeWeight(2);

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
		super(position, player, 30 * (canSplit ? 1: 0.5));

		this.moveSpeed = 1.6;
		this.radius = 25 * (canSplit ? 1: 0.4);
		this.canSplit = canSplit;

		this.velocity = new Vector2(random(-1, 1), random(-1, 1));
		this.velocity.normalize();
	}

	collides(point, extra)
	{
		return this.position.distance(point) <= this.radius + extra;
	}

	attack(damage) 
	{
		this.health -= damage;
		if (this.health <= 0)
		{
			if (this.canSplit)
			{
				enemys.push(new ECircle(this.position, this.player, false));
				enemys.push(new ECircle(this.position, this.player, false));
				enemys.push(new ECircle(this.position, this.player, false));
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
		fill(0);
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

		this.speed = 0.5;
		this.shootFrames = 0;
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

			playerProjectiles.push(new Projectile(this.position, this.rotation.multiply(5), 7, [125, 125, 58], [255,255,255], 3, 20));
			playerProjectiles.push(new Projectile(this.position, this.rotation.multiply(4.6).rotate(-0.05), 5, [70, 125, 70], [255,255,255], 2, 10));
			playerProjectiles.push(new Projectile(this.position, this.rotation.multiply(4.6).rotate(0.05), 5, [70, 125, 70], [255,255,255], 2, 10));
		}
	}
	
	move()
	{
		this.rotation = new Vector2(mouseX, mouseY).subtract(this.position);
		this.rotation.normalized();

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

function setup() 
{
	//caps frames at 60
	frameRate(60);
	createCanvas(windowWidth, windowHeight);

	player = new Player();
	for (let i = 0; i < 50; i++)
	{
		enemys.push(new EHexagon(new Vector2(random(0, windowWidth), random(0, windowHeight)), player));
	}
	for (let i = 0; i < 20; i++)
	{
		enemys.push(new ECircle(new Vector2(random(0, windowWidth), random(0, windowHeight)), player, true));
	}
}

function draw() 
{
	//draw background colour
	background(0);

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
			enemys.splice(i, 1);
			i--;
		}
		else
		{
			enemys[i].render();
		}
	}
}