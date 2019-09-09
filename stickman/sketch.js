// Birbs/Boids
// Timothy Letkeman
// Wednesday 5th September, 2019
//
// Extra for Experts:
// - more complicated than expected of cs30 because it deals with classes and whatnot
// - Gui for editing rules
// - decently complicated to implement all of the rules


//Vector2 code was taken from github and modifiyed https://gist.github.com/Dalimil/3daf2a0c531d7d030deb37a7bfeff454,
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
		let x = Math.abs(this.x - vector.x);
		let y = Math.abs(this.y - vector.y);
		return Math.sqrt(x * x + y * y);
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
//Vector2 code was taken from github and modifiyed https://gist.github.com/Dalimil/3daf2a0c531d7d030deb37a7bfeff454.

class Rigidbody 
{
	constructor(position, velocity, colliders, gravity) 
	{
	  this.position = position;
	  this.velocity = velocity;

	  this.colliders = colliders;
	  this.joints = new Array();
	  this.gravity = gravity;
	  this.mass = 1;
	}

	addDistanceJoint(other, distance)
	{
		this.joints.push(new DistanceJoint(this, other, distance));
	}

	update()
	{
		this.velocity.y += this.gravity;
		let remainingVelocity = 1;

		for (let c = 0; c < maxCollisions; c++)
		{
			let lowestHit = null;
			let lowestTime = 1;

			for (let i = 0; i < this.colliders.length; i++)
			{
				let newHit = this.colliders[i].collides(this.position, this.velocity.multiply(remainingVelocity));
				if (newHit !== null && newHit.time < lowestTime)
				{
					lowestHit = newHit;
				}
			}

			if (lowestHit === null)
			{
				break;
			}

			if (lowestHit.normal.x === 0)
			{						
				this.position.y = lowestHit.pos.y - (lowestHit.pos.y - this.position.y);
				this.velocity.y = -this.velocity.y;
			}
			else
			{
				this.position.x = lowestHit.pos.x - (lowestHit.pos.x - this.position.x);
				this.velocity.x = -this.velocity.x;
			}
			remainingVelocity -= lowestTime;
		}
		
		this.position = this.position.add(this.velocity.multiply(remainingVelocity));
	}

	lateUpdate()
	{
		for (let i = 0; i < this.joints.length; i++)
		{
			this.joints[i].resolve();
		}
	}
}

class RaycastHit // taken from https://noonat.github.io/intersect/#aabb-vs-segment and modifiyed to fit these requirements
{
	constructor(collider) 
	{
		this.collider = collider;
		this.pos = new Vector2();
		this.delta = new Vector2();
		this.normal = new Vector2();
		this.time = 0;
	}
}

class Collider
{
	constructor(position) 
	{
		this.position = position;
	}

	collides(pos, delta) //raycast
	{

	}

	render()
	{

	}

	static clamp01(val)
	{
		if (val < 0)
		{
			return 0;
		}
		if (val > 1)
		{
			return 1;
		}
		return val;
	}
}

class AABBCollider extends Collider
{
	constructor(position, half) 
	{
	  	super(position);
	  	this.half = half;
	}

	collides(pos, delta) //raycast, taken from https://noonat.github.io/intersect/#aabb-vs-segment and modifiyed to fit these requirements
	{
		const scaleX = 1.0 / delta.x;
		const scaleY = 1.0 / delta.y;
		const signX = Math.sign(scaleX);
		const signY = Math.sign(scaleY);
		const nearTimeX = (this.position.x - signX * this.half.x - pos.x) * scaleX;
		const nearTimeY = (this.position.y - signY * this.half.y - pos.y) * scaleY;
		const farTimeX = (this.position.x + signX * this.half.x  - pos.x) * scaleX;
		const farTimeY = (this.position.y + signY * this.half.y - pos.y) * scaleY;

		if (nearTimeX > farTimeY || nearTimeY > farTimeX) 
		{
			return null;
		}

		const nearTime = nearTimeX > nearTimeY ? nearTimeX : nearTimeY;
		const farTime = farTimeX < farTimeY ? farTimeX : farTimeY;
		
		if (nearTime >= 1 || farTime <= 0) 
		{
			return null;
		}

		const hit = new RaycastHit(this);
		hit.time = Collider.clamp01(nearTime);
		if (nearTimeX > nearTimeY) 
		{
			hit.normal.x = -signX;
			hit.normal.y = 0;
		} 
		else 
		{
			hit.normal.x = 0;
			hit.normal.y = -signY;
		}
		hit.delta.x = hit.time * delta.x;
		hit.delta.y = hit.time * delta.y;
		hit.pos.x = pos.x + hit.delta.x;
		hit.pos.y = pos.y + hit.delta.y;
		return hit;
	}

	render()
	{
		fill(255, 180, 190);
		rect(this.position.x - this.half.x, this.position.y - this.half.y, this.half.x * 2, this.half.y * 2);
	}
}

class Joint
{
	constructor(parent, connector) 
	{
		this.parent = parent;
	  	this.connector = connector;
	}

	resolve()
	{

	}
}

class DistanceJoint extends Joint
{
	constructor(parent, connector, distance) 
	{
		super(parent, connector);
	  	this.targetDistance = distance;
	}

	resolve()
	{
		let posOne = new Vector2(this.parent.position.x, this.parent.position.y);
		let posTwo = new Vector2(this.connector.position.x, this.connector.position.y);

		let distance = this.parent.position.distance(this.connector.position);
		//print(distance);
		/*
		if (dist > this.distance)
		{
			//this.parent.position = this.parent.position.moveTowards(posC, dist - this.distance);
			//this.connector.position = this.connector.position.moveTowards(posP, dist - this.distance);

			this.parent.velocity = this.parent.velocity.add(this.parent.position.subtract(posP));
			this.connector.velocity = this.connector.velocity.add(this.connector.position.subtract(ScriptProcessorNode));
		}*/


		if (distance > this.targetDistance)
        {
			this.parent.position = this.parent.position.moveTowards(posTwo, (distance - this.targetDistance) / (this.parent.mass / (this.parent.mass + this.connector.mass)));
			this.connector.position = this.connector.position.moveTowards(posOne, (distance - this.targetDistance) / (this.connector.mass / (this.parent.mass + this.connector.mass)));

            this.parent.velocity = this.parent.velocity.add(this.parent.position.subtract(posOne).multiply((this.parent.mass / (this.parent.mass + this.connector.mass))));
            this.connector.velocity = this.connector.velocity.add(this.connector.position.subtract(posTwo).multiply((this.connector.mass / (this.parent.mass + this.connector.mass))));
        }
	}
}

let baseGravity = 0.25;
let maxCollisions = 4;

let rb1;
let rb2;
let joint;

let floor;
let rWall;
let lWall;
let center;

function setup() 
{
	//caps frames at 60
	frameRate(60);
	createCanvas(windowWidth, windowHeight);

	floor = new AABBCollider(new Vector2(windowWidth / 2, windowHeight), new Vector2(windowWidth / 2, 5));
	rWall = new AABBCollider(new Vector2(windowWidth, windowHeight / 2), new Vector2(5, windowHeight / 2));
	lWall = new AABBCollider(new Vector2(0, windowHeight / 2), new Vector2(5, windowHeight / 2));
	center = new AABBCollider(new Vector2(windowWidth / 2, windowHeight / 2), new Vector2(100, 100));

	rb1 = new Rigidbody(new Vector2(100, 100), new Vector2(3, 1), [floor, rWall, lWall, center], baseGravity);
	rb2 = new Rigidbody(new Vector2(150, 100), new Vector2(3, -1), [floor, rWall, lWall, center], baseGravity);
	rb1.addDistanceJoint(rb2, 50);
}

function draw() 
{
	//draw background colour
	background(0);
	noStroke();

	rb1.update();
	rb2.update();
	rb1.lateUpdate();
	rb2.lateUpdate();

	fill(255);
	ellipse(rb1.position.x, rb1.position.y, 15, 15);
	ellipse(rb2.position.x, rb2.position.y, 15, 15);

	floor.render();
	rWall.render();
	lWall.render();
	center.render();
}