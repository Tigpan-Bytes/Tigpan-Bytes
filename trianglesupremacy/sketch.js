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

	collides(point)
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

		this.accelerationSpeed = 0.03;
		this.moveSpeed = 2.2;
		this.radius = 7;

		//These values only used for rendering
		this.yHeight = Math.sqrt(3) * this.radius / 2;
		this.xWidth = this.radius / 2;

		this.velocity = new Vector2(random(-1, 1), random(-1, 1));
		this.velocity.normalize();
		this.positionOffset = new Vector2(random(-25, 25), random(-25, 25));
	}

	collides(point)
	{
		return this.position.distance(point) <= this.radius;
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
		super(position, player, 30);

		this.moveSpeed = 1.6;
		this.radius = 25 * (canSplit ? 1: 0.5);

		this.velocity = new Vector2(random(-1, 1), random(-1, 1));
		this.velocity.normalize();
	}

	collides(point)
	{
		return this.position.distance(point) <= this.radius;
	}

	attack(damage) 
	{
		return true;
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
		stroke(80, 255, 150);
		strokeWeight(2);

		beginShape();
		ellipse(this.position.x, this.position.y, this.radius * 2)
		endShape(CLOSE);
	}
}

class Projectile
{
	constructor(position, velocity, radius, fill, stroke, strokeSize)
	{
		
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
		shootFrames++;

		if (this.shootFrames > 30)
		{
			shootFrames = 0;
		}
	}
	
	move()
	{
		this.rotation = this.position.subtract(new Vector2(mouseX, mouseY));
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

		let v1 = this.position.subtract(this.rotation.rotate(-40).multiply(this.radius));
		let v2 = this.position.subtract(this.rotation.rotate(40).multiply(this.radius));
		let v3 = this.position.subtract(this.rotation.multiply(this.radius));

		triangle(v1.x, v1.y, v2.x, v2.y, v3.x, v3.y)
	}
}

let player;
let enemyProjectiles = new Array();
let enemys = new Array();

function setup() 
{
	//caps frames at 60
	frameRate(60);
	createCanvas(windowWidth, windowHeight);

	player = new Player();
	for (let i = 0; i < 20; i++)
	{
		enemys.push(new EHexagon(new Vector2(random(0, windowWidth), random(0, windowHeight)), player));
		enemys.push(new ECircle(new Vector2(random(0, windowWidth), random(0, windowHeight)), player));
	}
}

function draw() 
{
	//draw background colour
	background(0);

	player.update();
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