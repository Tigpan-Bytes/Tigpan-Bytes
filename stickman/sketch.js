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
//Vector2 code was taken from github and modifiyed https://gist.github.com/Dalimil/3daf2a0c531d7d030deb37a7bfeff454.

class Rigidbody 
{
	constructor(position, velocity, colliders, gravity, mass, drag, friction, elastisity) 
	{
	  this.position = position;
	  this.velocity = velocity;

	  this.colliders = colliders;
	  this.joints = new Array();
	  this.gravity = gravity;
	  this.mass = mass;
	  this.drag = drag;
	  this.friction = friction;
	  this.elastisity = elastisity;
	}

	addDistanceJoint(other, distance)
	{
		this.joints.push(new DistanceJoint(this, other, distance));
	}

	update()
	{
		this.velocity = this.velocity.multiply(this.drag);
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
				this.velocity.y = -this.velocity.y * this.elastisity;
				this.velocity.x = this.velocity.x * this.friction;
			}
			else
			{
				this.position.x = lowestHit.pos.x - (lowestHit.pos.x - this.position.x);
				this.velocity.x = -this.velocity.x * this.elastisity;
				this.velocity.y = this.velocity.y * this.friction;
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
			let desiredOne = this.parent.position.moveTowards(posTwo, (distance - this.targetDistance) / (this.parent.mass / (this.parent.mass + this.connector.mass)));
			let desiredTwo = this.connector.position.moveTowards(posOne, (distance - this.targetDistance) / (this.connector.mass / (this.parent.mass + this.connector.mass)));

            this.parent.velocity = this.parent.velocity.add(desiredOne.subtract(posOne).multiply((this.parent.mass / (this.parent.mass + this.connector.mass)) * ((distance - this.targetDistance) * 0.5 / this.targetDistance)));
            this.connector.velocity = this.connector.velocity.add(desiredTwo.subtract(posTwo).multiply((this.connector.mass / (this.parent.mass + this.connector.mass)) * ((distance - this.targetDistance) * 0.5 / this.targetDistance)));
        }
	}
}

class Stickman
{
	constructor(position, colliders) 
	{
		this.head = new Rigidbody(new Vector2(position.x, position.y + 95), new Vector2(0, 0), colliders, baseGravity, 1, baseDrag, baseFriction, baseElastisity);
		this.chest = new Rigidbody(new Vector2(position.x, position.y + 80), new Vector2(0, 0), colliders, baseGravity, 2, baseDrag, baseFriction, baseElastisity);
		this.hip = new Rigidbody(new Vector2(position.x, position.y + 50), new Vector2(0, 0), colliders, baseGravity, 2, baseDrag, baseFriction, baseElastisity);

		this.rUpperLeg = new Rigidbody(new Vector2(position.x + 10, position.y + 25), new Vector2(5, 0), colliders, baseGravity, 1, baseDrag, baseFriction, baseElastisity);
		this.lUpperLeg = new Rigidbody(new Vector2(position.x - 10, position.y + 25), new Vector2(5, 0), colliders, baseGravity, 1, baseDrag, baseFriction, baseElastisity);

		this.rLowerLeg = new Rigidbody(new Vector2(position.x + 20, position.y), new Vector2(0, 5), colliders, baseGravity, 1, baseDrag, baseFriction, baseElastisity);
		this.lLowerLeg = new Rigidbody(new Vector2(position.x - 20, position.y), new Vector2(0, 5), colliders, baseGravity, 1, baseDrag, baseFriction, baseElastisity);

		this.rUpperArm = new Rigidbody(new Vector2(position.x + 10, position.y + 55), new Vector2(5, 0), colliders, baseGravity, 1, baseDrag, baseFriction, baseElastisity);
		this.lUpperArm = new Rigidbody(new Vector2(position.x - 10, position.y + 55), new Vector2(0, 0), colliders, baseGravity, 1, baseDrag, baseFriction, baseElastisity);
		
		this.rLowerArm = new Rigidbody(new Vector2(position.x + 20, position.y + 30), new Vector2(0, 0), colliders, baseGravity, 1, baseDrag, baseFriction, baseElastisity);
		this.lLowerArm = new Rigidbody(new Vector2(position.x - 20, position.y + 30), new Vector2(0, 0), colliders, baseGravity, 1, baseDrag, baseFriction, baseElastisity);

		this.lLowerArm.addDistanceJoint(this.lUpperArm, 29);
		this.rLowerArm.addDistanceJoint(this.rUpperArm, 29);

		this.lUpperArm.addDistanceJoint(this.chest, 29);
		this.rUpperArm.addDistanceJoint(this.chest, 29);

		this.lLowerLeg.addDistanceJoint(this.lUpperLeg, 29);
		this.rLowerLeg.addDistanceJoint(this.rUpperLeg, 29);

		this.lUpperLeg.addDistanceJoint(this.hip, 29);
		this.rUpperLeg.addDistanceJoint(this.hip, 29);

		this.hip.addDistanceJoint(this.chest, 30);
		this.chest.addDistanceJoint(this.head, 15);
	}

	update()
	{
		this.head.update();
		this.chest.update();
		this.hip.update();

		this.rUpperLeg.update();
		this.lUpperLeg.update();

		this.rLowerLeg.update();
		this.lLowerLeg.update();

		this.rUpperArm.update();
		this.lUpperArm.update();
		
		this.rLowerArm.update();
		this.lLowerArm.update();
	}

	lateUpdate()
	{
		this.head.lateUpdate();
		this.chest.lateUpdate();
		this.hip.lateUpdate();

		this.rUpperLeg.lateUpdate();
		this.lUpperLeg.lateUpdate();

		this.rLowerLeg.lateUpdate();
		this.lLowerLeg.lateUpdate();

		this.rUpperArm.lateUpdate();
		this.lUpperArm.lateUpdate();
		
		this.rLowerArm.lateUpdate();
		this.lLowerArm.lateUpdate();
	}

	render()
	{
		strokeWeight(3);
		stroke(255);
		fill(255);

		ellipse(this.head.position.x, this.head.position.y - 5, 15);

		line(this.head.position.x, this.head.position.y, this.chest.position.x, this.chest.position.y);
		line(this.chest.position.x, this.chest.position.y, this.hip.position.x, this.hip.position.y);

		line(this.rUpperArm.position.x, this.rUpperArm.position.y, this.chest.position.x, this.chest.position.y);
		line(this.rUpperArm.position.x, this.rUpperArm.position.y, this.rLowerArm.position.x, this.rLowerArm.position.y);

		line(this.lUpperArm.position.x, this.lUpperArm.position.y, this.chest.position.x, this.chest.position.y);
		line(this.lUpperArm.position.x, this.lUpperArm.position.y, this.lLowerArm.position.x, this.lLowerArm.position.y);

		line(this.rUpperLeg.position.x, this.rUpperLeg.position.y, this.hip.position.x, this.hip.position.y);
		line(this.rUpperLeg.position.x, this.rUpperLeg.position.y, this.rLowerLeg.position.x, this.rLowerLeg.position.y);

		line(this.lUpperLeg.position.x, this.lUpperLeg.position.y, this.hip.position.x, this.hip.position.y);
		line(this.lUpperLeg.position.x, this.lUpperLeg.position.y, this.lLowerLeg.position.x, this.lLowerLeg.position.y);
	}
}

let baseGravity = 0.25;
let baseDrag = 0.98;
let baseFriction = 0.7;
let baseElastisity = 0.9;

let maxCollisions = 4;

let man;
let joint;

let coliders;

let floor;
let rWall;
let lWall;
let center;

function setup() 
{
	//caps frames at 60
	frameRate(60);
	createCanvas(windowWidth, windowHeight);

	colliders = new Array();
	colliders.push(new AABBCollider(new Vector2(windowWidth / 2, windowHeight), new Vector2(windowWidth / 2, 5)));
	colliders.push(new AABBCollider(new Vector2(windowWidth, windowHeight / 2), new Vector2(5, windowHeight / 2)));
	colliders.push(new AABBCollider(new Vector2(0, windowHeight / 2), new Vector2(5, windowHeight / 2)));
	colliders.push(new AABBCollider(new Vector2(windowWidth / 2, windowHeight / 2), new Vector2(100, 100)));

	man = new Stickman(new Vector2(100, 100), colliders);
}

function draw() 
{
	//draw background colour
	background(0);
	noStroke();

	for (let i = 0; i < colliders.length; i++)
	{
		colliders[i].render();
	}

	if (mouseIsPressed)
	{
		man.chest.velocity = man.chest.velocity.add(new Vector2(mouseX, mouseY).subtract(man.chest.position).normalize().multiply(5));
	}

	man.update();
	man.lateUpdate();
	man.render();
}