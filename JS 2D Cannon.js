//		https://output.jsbin.com/vupodeb
//		https://www.w3schools.com/tags/ref_canvas.asp
var canvas = document.querySelector('canvas');
console.log(canvas);

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

var ctx = canvas.getContext('2d');

var mousePressed = false;

var mouse = {
	x: undefined,
	y: undefined
}

window.addEventListener('mousemove', function(event){
	mouse.x = event.x;
	mouse.y = event.y;

	determineAngle(angleMode);
});

window.addEventListener('mousedown', function(event){
	mousePressed = true;
	mouse.x = event.x;
	mouse.y = event.y;
});

window.addEventListener('mouseup', function(event){
	mousePressed = false;
	mouse.x = event.x;
	mouse.y = event.y;
});

window.addEventListener('click', function(event){
	mouse.x = event.x;
	mouse.y = event.y;

	if(mouse.x < canvas.width-barWidth || !bar.show) shoot();
	else for(var i = 0; i < barTools.length; i++) barTools[i].checkClick();
});

window.addEventListener('resize', function(){
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;

	init();
});

var angleRads = 0;
var angleDegs = 0;
var fixedPoint = {
	// x: canvas.width/2,
	// y: canvas.height/2
	x: 0,
	y: canvas.height
}

/**
 * @description Draws a rounded rectangle using the current state of the canvas.
 * If you omit the last three params, it will draw a rectangle
 * outline with a 5 pixel border radius
 * @param {Number} x The top left x coordinate
 * @param {Number} y The top left y coordinate
 * @param {Number} width The width of the rectangle
 * @param {Number} height The height of the rectangle
 * @param {Number} [radius = 5] The corner radius
 * @param {Boolean} [fill = false] Whether to fill the rectangle.
 * @param {Boolean} [stroke = true] Whether to stroke the rectangle.
 */
function roundRect(x, y, width, height, radius, fill, stroke) {
	if (typeof stroke == 'undefined') {
	  stroke = true;
	}
	if (typeof radius === 'undefined') {
	  radius = 5;
	}
	ctx.beginPath();
	ctx.moveTo(x + radius.tl, y);
	ctx.lineTo(x + width - radius, y);
	ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
	ctx.lineTo(x + width, y + height - radius);
	ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
	ctx.lineTo(x + radius, y + height);
	ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
	ctx.lineTo(x, y + radius);
	ctx.quadraticCurveTo(x, y, x + radius, y);
	ctx.closePath();
	if (fill) {
	  ctx.fill();
	}
	if (stroke) {
	  ctx.stroke();
	}
}

/**
 * @description Determines whether the variable is positive or negative, 
 * 				mainly for the use of orientation of text and shapes.
 * @param {Number} variable Clearly a descriptive variable name... It represents
 * 							a value of any magnitude
 */
function direction(variable){
	return Math.abs(variable)/variable;
}

var angle = {
	start: 0,
	end: 2*Math.PI - angleRads
};
var angleMode = 'manual';
/**
 * @description Determines the angle between a fixed point (defnined above)
 * 				and the user's mouse coordinates.
 * @param {String} mode 'manual' mode sets the angle between a fixed point (defnined above)
 * 				and the user's mouse coordinates. Otherwise enter the number between quotes.
 * 				Ex: '15' for 15°.
 */
function determineAngle(mode){
	this.mode = mode;
	
	if(mode == 'manual'){
		if(mouse.y-fixedPoint.y < 0){
			angleRads = Math.atan2(mouse.y-fixedPoint.y, mouse.x-fixedPoint.x);
			angleRads += 2*Math.abs(angleRads);
			//angle *= 180/Math.PI; //Convert to Degrees
		}else {
			angleRads = -Math.atan2(fixedPoint.y-mouse.y, fixedPoint.x-mouse.x);
			//angle *= 180/Math.PI; //Convert to Degrees
			// angleRads += 2*Math.abs(angleRads);
			angleRads += Math.PI;
		}
		angleDegs = angleRads * 180/Math.PI;

	} else{
		angleDegs = parseInt(this.mode);
		angleRads = angleDegs * Math.PI/180;
	}
	//if(angleRads == 4 * Math.PI) angleRads = 0;
	//if(angleRads > Math.PI/2) angleRads = Math.PI/2;
	

	angle.start = Math.PI* 1/1.5;
	angle.end = 2*Math.PI - angleRads;
}

//	Forces
var gravity = 9.8;
var energyLoss = 0;
var xFriction = 0;
var xAccel = 0;
//	Initial/Constant Values
var initVel = Math.sqrt((-(1/2)*(gravity)*Math.pow(canvas.width/6,2)
			  /(Math.pow(Math.cos(Math.PI/4),2)*((fixedPoint.y-canvas.height) - canvas.width*Math.tan(Math.PI/4)))));
var dt = 0.1; //Delta Time
var colorArray = [
	'#1E1E1E',
	'#323232',
	'#4B4B4B',
	'#787878',
	'#919191'
]
var radius = 15;
var innerRadius = this.radius/10,
	outerRadius = this.radius;
/**
 * @description template for instantiating a Ball object.
 * @param {Number} x Initial X-Coordinate of the Ball when shot.
 * @param {Number} y Initial Y-Coordinate of the Ball when shot.
 * @param {Number} angle Established in determineAngle(). Determines the relation
 * 						 between the X and Y components of the Ball's velocity.
 */
function Ball(x, y, angle){
	this.x = x;
	this.y = y;
	this.vel = velSlider.value;
	this.angle = angle;
	this.dx = this.vel*Math.cos(this.angle);
	this.dy = -this.vel*Math.sin(this.angle);
	this.mass = 3.25;
	this.secondHalf = {bool: false, numDots: undefined};
	xAccel = xAccelSlider.value;

	this.yMax = canvas.height + radius;
	if(this.angle > Math.PI) this.yMax = fixedPoint.y;

	this.update = function(){
		if(this.y + radius > innerHeight){
			this.dy = -this.dy;
			if(this.y + radius > innerHeight) this.dy *= energyLoss;
		}

		this.x += this.dx;
		this.y += this.dy;

		if(Math.abs(this.y - (canvas.height - radius)) < 1){
			this.dx *= xFriction;
			if(Math.abs(this.dx) < .0000001){
				this.dx = 0;
			} 
			if(Math.abs(this.dy) < 1) this.dy = 0;
			
			if(intervalOn){
				window.clearInterval(interval);
				console.log(interval);
				intervalOn = false;
				dotsArray.push(new Dots(this.x + this.dx, canvas.height-radius, 0, 0));
			}
		} else if((!this.secondHalf.bool) && Math.abs(this.dy) < 1 && this.angle > 0.12 && gravToggle.turnedOn && dotsArray.length > 2){
			this.dotArr = dotsArray;
			this.secondHalf.numDots = dotsArray.length;
			window.clearInterval(interval);
			console.log(interval);
			
			this.yMax = this.y;
			if(this.angle >= 0.35) dotsArray.push(new Dots(this.x + this.dx*3, this.y, this.dx, 0));

			this.secondHalf.bool = true;
		}

		if(this.secondHalf.bool && intervalOn){
			if(initBallToggle.turnedOn && fixedPoint.y == canvas.height){
				for (var index = 1; index <= this.secondHalf.numDots-1; index++) {
					//console.log('loop');
					if(Math.abs(this.y - dotsArray[index].y) < radius/2 && (!dotsArray[index].seconded) 
					   && Math.abs(this.dy+dotsArray[index].dy) < 0.2 && dotsArray[index].dy !=0){
						console.log('if');
						dotsArray.push(new Dots(this.x + this.dx, dotsArray[index].y, this.dx, -dotsArray[index].dy));
						dotsArray[index].seconded = true;
						break;
					}
					if(this.y > fixedPoint.y){
						interval = window.setInterval(tickerTape, 125);
						this.secondHalf.bool = false;
						break;
					}
				}
			} else{
				for (var index = 0; index < this.secondHalf.numDots; index++) {
					//console.log('loop');
					if(Math.abs(this.y - dotsArray[index].y) < radius/2 && (!dotsArray[index].seconded) && Math.abs(this.dy+dotsArray[index].dy) < 0.2){
						console.log('if');
						dotsArray.push(new Dots(this.x + this.dx, dotsArray[index].y, this.dx, this.dy));
						dotsArray[index].seconded = true;
						break;
					}
					if(this.y > fixedPoint.y){
						interval = window.setInterval(tickerTape, 125);
						this.secondHalf.bool = false;
						break;
					}
				}
			}
		}

		if(xAccel != 0){
			//Velocity Formula: Vf = Vi + a*t
			this.dx += (xAccel/this.mass) * dt;
			//Position Formula: x = Vi*t + 1/2*a*t^2
			this.x += this.dx*dt + .5*(xAccel/this.mass)* Math.pow(dt,2);
		}

		if(this.y > canvas.height - radius){
			this.y = canvas.height - radius;
			this.dy *= -energyLoss;
		}else{
			if(gravToggle.turnedOn){
			//Velocity Formula: Vf = Vi + a*t
			this.dy += (gravity/this.mass) * dt;
			//Position Formula: x = Vi*t + 1/2*a*t^2
			this.y += this.dy*dt + .5*(gravity/this.mass)* Math.pow(dt,2);
			}
		} 

		//Interactivity
		if((this.dx != 0 || this.dy != 0) && intervalOn) this.draw();
	}

	
	this.draw = function(){
		ctx.beginPath();

		var gradient = ctx.createRadialGradient(this.x, this.y, innerRadius, this.x, this.y, outerRadius);
		gradient.addColorStop(0, colorArray[4]); //	White Core
		gradient.addColorStop(1, colorArray[0]); //	Black Base

		ctx.arc(this.x, this.y, radius, 0, 2 * Math.PI);
		ctx.fillStyle = gradient;
		ctx.fill();

		ctx.closePath();
	}
}

var dotsArray = [];
var showVelVector = true;
var showGravVector = false;

var vectorWidth = 3;
var vectorScale = 12;
/**
 * @description Called by tickerTape(), this function takes 'snapshots' of the Ball
 * 				as it follows its trajectory. Displaying its positioning, velocity, 
 * 				and acceleration at the moment captured.
 * @param {Number} x X-Coordinate of the Ball when the 'snapshot' was taken.
 * @param {Number} y Y-Coordinate of the Ball when the 'snapshot' was taken.
 * @param {Number} dx X-Velocity of the Ball when the 'snapshot' was taken.
 * @param {Number} dy Y-Velocity of the Ball when the 'snapshot' was taken.
 */
function Dots(x,y,dx, dy){
	this.x = x;
	this.y = y;
	this.dx = dx;
	this.dy = dy;
	this.vecTextCoord = {
		x: undefined,
		y: undefined
	};
	this.vectDirection = {
		x: this.x + radius* direction(this.dx),
		y: this.y + radius* direction(this.dy)
	};
	//	Counters for animating vectors
	this.vectMult = 0;

	this.seconded = false;

	this.update = function(){
		if(this.vectMult < 1) this.vectMult += 0.05;

		//Interactivity
		this.draw();
	}

	this.text = function(){
		if(velTxtToggle.turnedOn){
			//	Text Backdrop
			var gradient = ctx.createRadialGradient(this.x, this.y, 10, this.x + 20, this.y - 25, 100);
			gradient.addColorStop(0, "rgba(150,150,150,0.8)");
			gradient.addColorStop(1, "rgba(0,0,0,0.7)");

			ctx.fillStyle = gradient;

			if(this.x + radius + 53 < canvas.width){ // Greater the constant, more likely to be on left side.
				ctx.textAlign = 'left';
				this.vecTextCoord.x = this.x + radius;
				roundRect(this.vecTextCoord.x, this.vecTextCoord.y - 50/2.7, 85, 40,10, true, false);
			} else {
				ctx.textAlign = 'right';
				this.vecTextCoord.x = this.x - radius;
				if(this.dx == 0 && this.dy == 0) roundRect(this.vecTextCoord.x - 55, this.vecTextCoord.y - 50/2.7, 60, 40,10, true, false);
				else roundRect(this.vecTextCoord.x - 80, this.vecTextCoord.y - 50/2.7, 85, 40,10, true, false);
			}
			
			// Velocity Text
			ctx.font = "20px Times New Roman";
			ctx.fillStyle = 'white';

			if(this.y - radius - 25 < 0){
				this.vecTextCoord.y = this.y + radius * 1.8;
			} else {
				this.vecTextCoord.y = this.y - radius * 1.8;
			}

			ctx.fillText('Vx = ' + Math.round(this.dx*10)/10, this.vecTextCoord.x, this.vecTextCoord.y);
			ctx.fillText('Vy = ' + -Math.round(this.dy*10)/10, this.vecTextCoord.x, this.vecTextCoord.y + 20);
		}
	}

	this.draw = function(){
		//Cannonball
		ctx.beginPath();
		
		var gradient = ctx.createRadialGradient(this.x, this.y, innerRadius, this.x, this.y, outerRadius);
		gradient.addColorStop(0, colorArray[4]); //	White Core
		gradient.addColorStop(1, colorArray[0]); //	Black Base

		ctx.arc(this.x, this.y, radius, 0, 2 * Math.PI);
		ctx.fillStyle = gradient;
		ctx.fill();

		ctx.closePath();

		//	Gravity Vector
		if(showGravVector){
			ctx.lineWidth = vectorWidth;
			ctx.lineCap = 'round';

			ctx.beginPath();
			ctx.moveTo(this.x - radius/3, this.y);
			ctx.lineTo(this.x - radius/3, this.y + gravity*vectorScale * this.vectMult);
			ctx.stroke();
			ctx.closePath();
		}

		//	Velocity Vectors
		if(showVelVector){
			ctx.lineWidth = vectorWidth;
			ctx.lineCap = 'round';
			ctx.strokeStyle = 'black';

			//	X-Velocity
			ctx.beginPath();
			ctx.moveTo(this.vectDirection.x, this.y);
			ctx.lineTo(this.vectDirection.x + this.dx*vectorScale * this.vectMult, this.y);
			ctx.lineTo(this.vectDirection.x + this.dx*vectorScale * this.vectMult - 10 * direction(this.dx), this.y - 5);
			ctx.moveTo(this.vectDirection.x + this.dx*vectorScale * this.vectMult+3 * direction(this.dx), this.y+1);
			ctx.lineTo(this.vectDirection.x + this.dx*vectorScale * this.vectMult - 10 * direction(this.dx), this.y + 5);
			ctx.stroke();
			ctx.closePath();

			//	Y-Velocity
			ctx.beginPath();
			ctx.moveTo(this.x, this.vectDirection.y);
			ctx.lineTo(this.x, this.vectDirection.y + this.dy*vectorScale * this.vectMult);
			ctx.lineTo(this.x + 5, this.vectDirection.y + this.dy*vectorScale * this.vectMult - 10 * direction(this.dy));
			ctx.moveTo(this.x-0.5, this.vectDirection.y + this.dy*vectorScale * this.vectMult + (2 * direction(this.dy)));
			ctx.lineTo(this.x - 5, this.vectDirection.y + this.dy*vectorScale * this.vectMult - 10 * direction(this.dy));
			ctx.stroke();
			ctx.closePath();

			// Velocity Text
			if(Math.abs(mouse.x-this.x) < radius && Math.abs(mouse.y-this.y) < radius){
				this.text();
			}
		}
	}
}

/**
 * @description Instantiates a new Ball Object at the current Cannonball's
 * 				location to act as a 'Still-frame' photo of the ball's flight.
 */
function tickerTape(){
	this.x = ball.x;
	this.y = ball.y;
	this.dx = ball.dx;
	this.dy = ball.dy;

	dotsArray.push(new Dots(this.x, this.y, this.dx, this.dy));
	
	//console.log(Math.round(x) +', '+ Math.round(y));

}

var ball;
var interval;
var intervalOn = false;
/**
 * @description Called when the program starts and whenever the page gets resized.
 */
function init(){
	dotsArray = [];

	if(intervalOn){
		window.clearInterval(interval);
		console.log(interval);
		intervalOn = false;
	}

	ball = undefined;
}

/**
 * @description Instantiates the ball and starts the interval 
 * 				for the ticker tape diagram to begin.
 */
function shoot(){
	if(intervalOn){
		window.clearInterval(interval);
		console.log(interval);
		intervalOn = false;
	}

	dotsArray = [];
	ball = new Ball(radius, fixedPoint.y - radius*1.125, angleRads);
	//	Dot at the initial position of the ball, if toggle turned on
	if(initBallToggle.turnedOn) dotsArray.push(new Dots(ball.x, ball.y, ball.dx, ball.dy));
	//	Interval Instantiation
	if(gravToggle.turnedOn && !(ball.angle > Math.PI || ball.angle < 0.4)) interval = window.setInterval(tickerTape, 1000/((1.5*-ball.dy)/(gravity))/2);
	else interval = window.setInterval(tickerTape, 150);
	intervalOn = true;
	console.log(100*((2*-ball.dy)/(gravity)));
}


var barWidth = 140;
var bar = new SideBar();
/**
 * @description Creates a space for GUI Tools for the user to interact with.
 */
function SideBar(){
	this.show = false;
	let triagSize = 25, rectH = 60;
	let xTrap = canvas.width, yTrap = (canvas.height/2);

	this.update = function(){
		if(!this.show) this.displayTrapezoid();

		if(Math.abs(mouse.x-canvas.width) < triagSize && Math.abs(mouse.y-canvas.height/2.15) < rectH+triagSize) this.show = true;

		//Display SideBar
		if(this.show && Math.abs(mouse.x-canvas.width) < barWidth){
			this.draw();

			for(var i = 0; i < barTools.length; i++) barTools[i].update();
		}else this.show = false;
	}

	this.displayTrapezoid = function(){
		ctx.strokeStyle = 'rgba(0,0,0,0)';
		
		gradient = ctx.createLinearGradient(0, 0, 0, canvas.height/1.5);
		gradient.addColorStop(0, 'rgba(255,255,255,1)'); // Upper Zone 
		gradient.addColorStop(1, 'rgba(250,250,250,0.3)'); //	Lower Base 
		ctx.fillStyle = gradient;

		ctx.beginPath();
		
		ctx.moveTo(xTrap,yTrap + triagSize + (rectH/2));
		ctx.lineTo(xTrap - triagSize,yTrap - triagSize + (rectH/2));
		ctx.lineTo(xTrap- triagSize,yTrap -rectH);
		ctx.lineTo(xTrap,(yTrap-rectH) - triagSize - (rectH/2));

		ctx.fill();
		ctx.closePath();

		ctx.lineWidth = 4;
		ctx.strokeStyle = 'black';
		ctx.beginPath();
		ctx.moveTo(xTrap - triagSize/2,yTrap - triagSize - (rectH/2));
		ctx.lineTo(xTrap - triagSize/2,yTrap - triagSize + (rectH/2));
		ctx.stroke();
		ctx.closePath();
	}
	this.draw = function(){
		var grd = ctx.createLinearGradient(canvas.width, canvas.height, canvas.width, 0);
		grd.addColorStop(0, "rgba(0,0,0,0)");
		grd.addColorStop(1, "rgba(0,0,0,.3)");

		ctx.fillStyle = grd;
		ctx.fillRect(canvas.width - barWidth, 0, barWidth, canvas.height);
	}
}

var gravToggle = new BarToggle(canvas.width-barWidth/4.5, canvas.height/5, 'Gravity', true);
var initBallToggle = new BarToggle(canvas.width-barWidth/4.5, canvas.height/3.75, 'Initial Vel', true);
var velTxtToggle = new BarToggle(canvas.width-barWidth/4.5, canvas.height/3, 'Vel. Text', true);

var barTools = [];
barTools.push(gravToggle);
barTools.push(initBallToggle);
barTools.push(velTxtToggle);

/**
 * @description Template for instantiating Toggle objects.
 * @param {Number} x X-Coordinate representing the center horizontally.
 * @param {Number} y  Y-Coordinate representing the center vertically.
 * @param {String} text Text to be displayed next to the toggle.
 * @param {Boolean} turnedOn Boolean representing whether toggle is active or not.
 */
function BarToggle(x, y, text, turnedOn){
	this.x = x;
	this.y = y;
	this.text = text;
	this.turnedOn = turnedOn;
	this.width = barWidth * 0.2;
	this.radius = 13;

	var circleCoords = {
		x: this.x + this.width/2,
		y: this.y
	};
	this.update = function(){
		//Check for Click
		//...

		//Display Toggle
		this.draw();
	}

	this.checkClick = function(){
		if(Math.abs(mouse.x-this.x) < this.width && 
		   Math.abs(mouse.y-this.y) < this.radius) this.turnedOn = !this.turnedOn;
	}

	this.draw = function(){
		//	Toggle Text
		ctx.font = "20px Times New Roman";
		ctx.fillStyle = 'white';
		ctx.textAlign = 'center';
		
		ctx.fillText(text, this.x - barWidth/2, this.y + 7);

		ctx.lineWidth = this.radius*2.25;
		ctx.lineCap = 'round';
		ctx.strokeStyle = 'white';

		//	Draw Toggle
		ctx.beginPath();
		ctx.moveTo(this.x - this.width/2, this.y);
		ctx.lineTo(this.x + this.width/2, this.y);
		ctx.stroke();
		ctx.closePath();

		// Inner Toggle Visual
		ctx.lineWidth = this.radius*2;
		var gradient = ctx.createRadialGradient(circleCoords.x, circleCoords.y, (this.radius*2.25)/5, 
					   circleCoords.x, circleCoords.y, this.radius*7);
		
		if(this.turnedOn){
			gradient.addColorStop(0, "rgba(0,255,0,1)");
			circleCoords.x = this.x + this.width/2;
		} 
		else{
			gradient.addColorStop(0, "rgba(255,0,0,1)");
			circleCoords.x = this.x - this.width/2;
		} 
		
		gradient.addColorStop(1, "rgba(0,0,0,1)");
		ctx.strokeStyle = gradient;
		
		ctx.beginPath();
		ctx.moveTo(this.x - this.width/2, this.y);
		ctx.lineTo(this.x + this.width/2, this.y);
		ctx.stroke();
		ctx.closePath();

		//Circle Switch
		ctx.beginPath();
		gradient = ctx.createRadialGradient(circleCoords.x, circleCoords.y, (this.radius*2.25)/10, 
				   circleCoords.x, circleCoords.y, this.radius*2.25);

		gradient.addColorStop(0, "rgba(255,255,255,1)");
		gradient.addColorStop(1, "rgba(0,0,0,1)");

		ctx.arc(circleCoords.x, circleCoords.y, this.radius+.5, 0, 2 * Math.PI);
		ctx.fillStyle = gradient;
		ctx.fill();

		ctx.closePath();
	}
}

var yPosSelect = new BarSwitch(canvas.width-barWidth/2, canvas.height/2.25, 'Vertical Position', ['Bot','Mid', 'Top']);
barTools.push(yPosSelect);
/**
 * @description Template for instantiating Switch objects, which have three options to choose from.
 * @param {Number} x X-Coordinate representing the center horizontally.
 * @param {Number} y Y-Coordinate representing the center vertically.
 * @param {String} text Text to be displayed above the Switch.
 * @param {Array<String>} options Texts for each option.
 */
function BarSwitch(x, y, text, options){
	this.x = x;
	this.y = y;
	this.text = text;
	this.width = barWidth * 0.95;
	this.height = 40;

	this.options = options;
	this.numOptions = options.length;
	this.selection = 1;

	this.update = function(){
		//Check for Click

		//Display Selector
		this.draw();
	}

	this.checkClick = function(){
		if(Math.abs(mouse.x-this.x) < this.width/2 && Math.abs(mouse.y-(this.y+this.height/2)) < this.height/2){
			this.selection = Math.ceil((mouse.x-(this.x-this.width/2))/this.width*3);
			switch(this.selection){
				case 1: //Bottom
					fixedPoint.y = canvas.height;
					break;
				case 2: //Middle
					fixedPoint.y = canvas.height/2;
					break;
				case 3: //Top
					fixedPoint.y = radius*1.125;
					break;
			}
			init();
		}
	}

	this.draw = function(){
		//	Selector Title Text
		ctx.font = "20px Times New Roman";
		ctx.fillStyle = 'white';
		ctx.textAlign = 'center';
		
		ctx.fillText(text, this.x, this.y - 10);

		var gradient = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.height*1.5);
		gradient.addColorStop(0, "rgba(150,150,150,1)");
		gradient.addColorStop(1, "rgba(0,0,0,1)");

		ctx.fillStyle = gradient;
		ctx.lineWidth = 2;
		ctx.strokeStyle = "rgba(255,255,255,1)";
		roundRect(this.x - this.width/2, this.y, this.width, this.height, 5, true, true);

		// Inner Toggle Visual
		var gradient = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.height*1.5);
		
		if(true){
			gradient.addColorStop(0, "rgba(0,255,0,1)");
		} 
		else{
			gradient.addColorStop(0, "rgba(255,0,0,1)");
		} 
		gradient.addColorStop(1, "rgba(0,0,0,1)");
		ctx.fillStyle = gradient;
		roundRect(this.x - this.width/2 + ((this.selection-1)*this.width/3), this.y, this.width/3, this.height, 5, true, false);

		//Text within Selector
		ctx.fillStyle = 'white';
		for (let i = 0; i < this.options.length; i++) {
			ctx.fillText(this.options[i], this.x - this.width/3 + (i*this.width/3), this.y + 25);
		}
	}
}

var angleSelect = new BarSelector(canvas.width-barWidth/2, canvas.height/1.75, 'Angle Mode', 
								['Manual','0°','30°', '45°','60°','90°','270°', '300°','315°','330°']);
barTools.push(angleSelect);
/**
 * @description Template for instantiating Selector objects, which cycle through several options.
 * @param {Number} x X-Coordinate representing the center horizontally.
 * @param {Number} y Y-Coordinate representing the center vertically.
 * @param {String} text Text to be displayed next to the Selector.
 * @param {Array<String>} options Texts for each option.
 */
function BarSelector(x, y, text, options){
	this.x = x;
	this.y = y;
	this.text = text;
	this.width = barWidth * .9;
	this.height = 40;

	this.options = options;
	this.numOptions = options.length;
	this.selection = 0;

	this.update = function(){
		//Check for Click

		//Display Selector
		this.draw();
	}

	this.checkClick = function(){
		if(Math.abs(mouse.x-(this.x + this.width/2 - this.width/10)) < this.width/10 
		   && Math.abs(mouse.y-(this.y+this.height/2)) < this.height/2){
			init();
			this.selection++;
			if(this.selection > this.numOptions-1){
				this.selection = 0;
				//Set determineAngle to manual mode
				angleMode = 'manual';
			} else{
				angleMode = parseInt(this.options[this.selection]);
			}
			determineAngle(angleMode);
		}
		if(Math.abs(mouse.x-(this.x - this.width/2 + this.width/10)) < this.width/10 
		   && Math.abs(mouse.y-(this.y+this.height/2)) < this.height/2){
			init();
			this.selection--;
			if(this.selection < 0){
				this.selection = this.numOptions-1;
				angleMode = parseInt(this.options[this.selection]);
			} else{
				angleMode = parseInt(this.options[this.selection]);
			}
		}
		if(this.selection == 0){
			angleMode = 'manual';
		}
		determineAngle(angleMode);
	}

	this.draw = function(){
		//	Selector Title Text
		ctx.font = "20px Times New Roman";
		ctx.fillStyle = 'white';
		ctx.textAlign = 'center';
		
		ctx.fillText(text, this.x, this.y - 10);

		var gradient = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.height*1.5);
		gradient.addColorStop(0, "rgba(0,255,0,1)");
		gradient.addColorStop(1, "rgba(0,0,0,1)");

		ctx.fillStyle = gradient;
		ctx.lineWidth = 2.5;
		ctx.strokeStyle = "rgba(255,255,255,1)";
		roundRect(this.x - this.width/2, this.y, this.width, this.height, 5, true, true);

		// Side Rectangles Visual
		gradient = ctx.createRadialGradient(this.x, this.y, this.width/5, this.x, this.y + this.height*1.5, this.width);
		gradient.addColorStop(0, "rgba(255,255,255,.4)");
		gradient.addColorStop(0.8, "rgba(0,0,0,1)");
		ctx.fillStyle = gradient;
		roundRect(this.x - this.width/2, this.y+0.5, this.width/5, this.height/1.05, 5, true, false);
		roundRect(this.x + this.width/2 - this.width/5, this.y+0.5, this.width/5, this.height/1.05, 5, true, false);

		ctx.lineWidth = 5;
		ctx.lineCap = 'round';
		ctx.strokeStyle = 'black';
		
		//	Arrows - Left
		ctx.beginPath();
		ctx.moveTo(this.x - this.width/2+7, this.y+this.height/2);
		ctx.lineTo(this.x - this.width/2+17, this.y + this.height/5);
		ctx.moveTo(this.x - this.width/2+7, this.y+this.height/2);
		ctx.lineTo(this.x - this.width/2+17, this.y + this.height/1.3);
		ctx.stroke();
		ctx.closePath();

		//	Arrows - Right
		ctx.beginPath();
		ctx.moveTo(this.x + this.width/2-7, this.y+this.height/2);
		ctx.lineTo(this.x + this.width/2-17, this.y + this.height/5);
		ctx.moveTo(this.x + this.width/2-7, this.y+this.height/2);
		ctx.lineTo(this.x + this.width/2-17, this.y + this.height/1.3);
		ctx.stroke();
		ctx.closePath();

		//Text within Selector
		ctx.fillStyle = 'white';
		ctx.fillText(this.options[this.selection], this.x, this.y + 25);
	}
}

var xAccelSlider = new BarSlider(canvas.width-barWidth/2, canvas.height/1.45, 'X Acceleration', xAccel, 0, 10);
barTools.push(xAccelSlider);
var velSlider = new BarSlider(canvas.width-barWidth/2, canvas.height/1.275, 'Initial Velocity', initVel, initVel, 5);
barTools.push(velSlider);
/**
 * @description Template for instantiating Slider objects.
 * @param {Number} x X-Coordinate representing the center horizontally.
 * @param {Number} y  Y-Coordinate representing the center vertically.
 * @param {String} text Text to be displayed next to the Slider.
 * @param {Number} setVal Value to be modified by the slider.
 * @param {Number} baseVal Original, standard value for the slider.
 * @param {Number} magChange The magnitude of change from the baseVal to an endpoint.
 */
function BarSlider(x, y, text, setVal, baseVal, magChange){
	this.x = x;
	this.y = y;
	this.text = text;
	this.width = barWidth * 0.8;
	this.radius = 4;
	this.value = baseVal;
	this.baseVal = baseVal;
	this.magChange = magChange;

	var circleCoords = {
		x: this.x,
		y: this.y,
		radius: this.radius * 2.5
	};
	this.update = function(){
		//Check for Click
		this.checkClick();

		if(circleCoords.x > this.x + this.width/2) circleCoords.x = this.x + this.width/2;
		if(circleCoords.x < this.x - this.width/2) circleCoords.x = this.x - this.width/2;

		//Display Slider
		this.draw();
	}

	this.checkClick = function(){
		if(mousePressed){
			if((Math.abs(mouse.x-circleCoords.x) < circleCoords.radius && 
			Math.abs(mouse.y-circleCoords.y) < circleCoords.radius) ||
			(Math.abs(mouse.x-this.x) < this.width* 1.05/2 && 
			Math.abs(mouse.y-this.y) < this.radius)){
				circleCoords.x  = mouse.x;
				this.value = Math.round(this.baseVal) + Math.round(2*this.magChange/(this.width/(mouse.x - this.x)));
				 setVal = this.value;
				this.displayValue();
			} 
		}
	}

	this.displayValue = function(){
		var gradient = ctx.createRadialGradient(circleCoords.x, circleCoords.y, this.radius, 
			circleCoords.x, circleCoords.y, this.radius*15);
		gradient.addColorStop(0, "rgba(0,0,0,1)");

		gradient.addColorStop(1, "rgba(0,255,0,1)");
		ctx.fillStyle = gradient;
		ctx.strokeStyle = 'black';
		ctx.lineWidth = 2;
		roundRect(circleCoords.x - 15, this.y + radius*1.5, 30,30,2,true);

		ctx.font = "20px Times New Roman";
		ctx.fillStyle = 'white';
		ctx.textAlign = 'center';

		ctx.fillText(this.value, circleCoords.x, this.y + radius*2.75);
	}

	this.draw = function(){
		//	Slider Text
		ctx.font = "20px Times New Roman";
		ctx.fillStyle = 'white';
		ctx.textAlign = 'center';
		
		ctx.fillText(this.text, this.x, this.y - 15);

		ctx.lineWidth = this.radius*2.25;
		ctx.lineCap = 'round';
		ctx.strokeStyle = 'white';

		//	Draw Slider
		ctx.beginPath();
		ctx.moveTo(this.x - this.width/2, this.y);
		ctx.lineTo(this.x + this.width/2, this.y);
		ctx.stroke();
		ctx.closePath();

		// Inner Slider Visual
		ctx.lineWidth = this.radius*2;
		var gradient = ctx.createRadialGradient(circleCoords.x, circleCoords.y, this.radius, 
					   circleCoords.x, circleCoords.y, this.radius*20);
		gradient.addColorStop(0, "rgba(0,0,0,1)");
		
		gradient.addColorStop(1, "rgba(0,255,0,1)");
		ctx.strokeStyle = gradient;
		
		ctx.beginPath();
		ctx.moveTo(this.x - this.width/2, this.y);
		ctx.lineTo(this.x + this.width/2, this.y);
		ctx.stroke();
		ctx.closePath();

		//Circle Slider
		gradient = ctx.createRadialGradient(circleCoords.x, circleCoords.y, (this.radius*2.25)/10, 
				   circleCoords.x, circleCoords.y, this.radius*2.25);

		gradient.addColorStop(0, "rgba(255,255,255,1)");
		gradient.addColorStop(1, "rgba(255,255,255,.9)");

		ctx.arc(circleCoords.x, circleCoords.y, circleCoords.radius, 0, 2 * Math.PI);
		ctx.fillStyle = gradient;
		ctx.fill();
	}
}

/**
 * @description Main loop for the program to run off of.
 */
function animate(){
	requestAnimationFrame(animate);
	ctx.clearRect(0,0, canvas.width, canvas.height);
	
	//	Draw Background
	ctx.beginPath();
	var gradient = ctx.createLinearGradient(0, 0, 0, canvas.height/1.5);
	gradient.addColorStop(0, '#35478C'); // Upper Zone 
	gradient.addColorStop(1, '#7FB2F0'); //	Lower Base 
	ctx.fillStyle = gradient;
	ctx.fillRect(0,0, canvas.width, canvas.height);
	ctx.closePath();

	//	Arc to represent current angle
	ctx.beginPath();
	ctx.lineWidth = 5;
	ctx.lineCap = 'round';
	ctx.arc(radius/5, fixedPoint.y, 50, angle.start, angle.end, true);
	ctx.strokeStyle = 'black';
	ctx.stroke();
	ctx.closePath();

	//	Move the CannonBall
	if(ball != null){
		ball.update();
		for(var i = 0; i < dotsArray.length; i++){
			dotsArray[i].update();
		}
		for(var i = 0; i < dotsArray.length; i++){
			dotsArray[i].text();
		}
	} else {
		ctx.font = "35px Times New Roman";
		ctx.fillStyle = 'white';
		ctx.textAlign = 'center';
		ctx.fillText('Click to Fire the Cannonball!', canvas.width/2, canvas.height/8);
	}

	//Draw SideBar
	bar.update();

	ctx.font = "25px Times New Roman";
	ctx.fillStyle = 'white';
	ctx.textAlign = 'left';
	
	ctx.fillText(Math.round(angleDegs*100)/100 + '°', canvas.width - 110, 50);
	ctx.fillText(Math.round( (angleRads / Math.PI) *100)/100 + '  π', canvas.width - 110, 80);
	ctx.fillText(Math.round(angleRads*100)/100 + '  rads', canvas.width - 110, 110);
}

init();
animate();