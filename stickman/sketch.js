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

	moveTowards: function(vector, delta) {
		delta = Math.min(delta, 1);
		let diff = vector.subtract(this);
		return this.add(diff.multiply(delta));
	},

	normalize: function() {
		let mag = this.magnitude();
		this.x /= mag;
		this.y /= mag;
		return this;
	},

	rotate: function(alpha) {
		let cos = Math.cos(alpha);
		let sin = Math.sin(alpha);
		let vector = new Vector2();
		vector.x = this.x * cos - this.y * sin;
		vector.y = this.x * sin + this.y * cos;
		return vector;
	},
}
//Vector2 code was taken from github and modifiyed https://gist.github.com/Dalimil/3daf2a0c531d7d030deb37a7bfeff454.

class Rigidbody 
{
	constructor(position, velocity) 
	{
	  this.position = position;
	  this.velocity = velocity;
	}
}

function setup() 
{
	//caps frames at 60
	frameRate(60);
}


function draw() 
{
	//draw background colour
	background(0);
}