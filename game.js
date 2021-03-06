/*

 _   __      _       _    _    _       _     _                
| | / /     (_)     | |  | |  | |     | |   | |               
| |/ /  __ _ _  __ _| | _| | _| |_   _| |__ | |__   ___ _ __  
|    \ / _` | |/ _` | |/ / |/ / | | | | '_ \| '_ \ / _ \ '_ \ 
| |\  \ (_| | | (_| |   <|   <| | |_| | |_) | |_) |  __/ | | |
\_| \_/\__,_| |\__,_|_|\_\_|\_\_|\__,_|_.__/|_.__/ \___|_| |_| . org
           _/ |                                               
          |__/

Thanks to XKCD and the people who wrote the original javascript.


*/


var upPressed = false;
var downPressed = false;
var leftPressed = false;
var rightPressed = false;
var debugSpeed = false;
var balloon = false;
var upPressedNow = false;
var isGrounded = false;
var wasGrounded = false;

function pad(number, length) {
   
    var str = '' + number;
    while (str.length < length) {
        str = '0' + str;
    }
   
    return str;

}
function cache(evt, b) {
	var triggered = false;

	switch(evt.keyCode) {
		case 37:
			if(!gameIntro)
				StartIntro();
			leftPressed = b;
			triggered = true;
			break;
		case 38:
			if(!gameIntro)
				StartIntro();
			if(!upPressed && b)
				upPressedNow = true;

			upPressed = b;
			triggered = true;

			break;
		case 39:
			if(!gameIntro)
				StartIntro();
			rightPressed = b;
			triggered = true;
			break;
		case 40:
			if(!gameIntro)
				StartIntro();
			downPressed = b;
			triggered = true;
			break;
		case 70:
			if(evt.shiftKey)
			{
				debugSpeed = b;
				triggered = true;
			}
			break;
		case 32:
			if(!gameIntro)
				StartIntro();

			balloon = b;
			triggered = true;
			break;
	}

	if(gameIntro)
	{
		downPressed = false;
		leftPressed = false;
		rightPressed = false;
		upPressed = false;
		balloon = false;
	}

	return !triggered;
};

function StartIntro()
{
	if (!gameStarted) {
		if(collisionMap['1n1e'] === false || collisionMap['1n1w'] === false || collisionMap['2n1w'] === false || collisionMap['1n2e'] === false) {
			$("#loadingwarning").fadeIn('slow', function() {$(this).fadeOut('slow');});
			return;
		}
		else $("#loadingwarning").fadeOut('slow');

		gameIntro = true;
		gameStarted = true;
		window.setInterval(update,33);
		window.setInterval(log,20000);
	}
}
function teleport(x,y)
{
	player.x = x;
	player.y = y;
	player.vx = 0;
	player.vy = -5;
	camx = 0;
	camy = 0;
}

gameStarted = false;
gameIntro = false;

document.onmousedown = function(e){
	if(!gameIntro)
		StartIntro();
}

$(document).keyup(function(evt) {
	if(evt.keyCode == 89 && evt.shiftKey) {
		alert(getImageForPixel(player.centerX(), player.centerY()).id +
				"\nMap: " + Math.floor(player.centerX()) + "," + Math.floor(player.centerY())+
				"\nStart tile: " + Math.floor(player.x) + "," + Math.floor(player.y));
	}

	if(evt.keyCode == 84 && evt.shiftKey) {
		var s = prompt("Teleport: Where do you want to go (0-9)?: ");

		switch(s)
		{
			case '0':
				teleport(8879,35460); // ufo
			break;
			case '1':
				teleport(26033,1050); // ship under bridge
			break;
			case '2':
				teleport(53671,-11750); // huge tower
			break;
			case '3':
				teleport(3529,-17703); // flying rocket
			break;
			case '4':
				teleport(1065,-25550); // whale
			break;
			case '5':
				teleport(-45210,-2350); // rocket
			break;
			case '6':
				teleport(-18620,-298); // rocket
			break;
			case '7':
				teleport(-35141,1084); // cave1
			break;
			case '8':
				teleport(-34495,16207); // cave fighter
			break;
			case '9':
				teleport(-5835,28077); // cave place
			break;
			case '-1':
				teleport(97724,-490); // end of the world?
			break;
			case '-2':
				teleport(-650,29850); // end of the world?
			break;
		}
	}
});

$(document).keydown(function(evt) { return cache(evt, true);  });
$(document).keyup(function(evt) { return cache(evt, false); });

function Player() {
	this.map = $(".map");
	this.map.append('<img src="player/man_air_01.png" style="position: relative; z-index: 20" id="stickfigure">');
	this.player = $("#stickfigure", this.map);

	this.x = 0;
	this.y = 0;

	this.vx = 0;
	this.vy = 0;

	this.flipped;

	this.climbing = false;
	this.inWater = false;
	this.feetIinWater = false;

	var lastPressed = "right";

	var frame = 0;
	var animation = "air";
	var justJumped = true;

	var cnt = 0;
	var factor = 1.0;
	var maxFactor = 1.0;	

	this.centerX = function() {
		return player.player.position().left+player.player.width()/2.0;
	}

	this.centerY = function() {
		return player.player.position().top + player.player.height()/2.0;
	}

	this.update = function () {
		this.factor = 0.6;
		this.maxFactor = 0.6;
		if(debugSpeed) {
			this.factor = 1.25;
			this.maxFactor = 1.25;
		}	

		if(this.balloon)
			this.climbing = false;

		if(this.climbing)
		{
			this.factor = 0.5;
			this.maxFactor = 0.4;
		}

		if(!isGrounded)
		{
			this.factor = 0.3;
		}

		if(leftPressed) {
			if(player.vx>-7*this.maxFactor)
				player.vx -=2*this.factor;

			lastPressed = "left";
		}
		else if(rightPressed) {
			if(player.vx<7*this.maxFactor)
				player.vx +=2*this.factor;
			lastPressed = "right";
		}
		else
			player.vx = 0;

		this.inWater = materialAtPixel(player.centerX(), player.centerY()+5) == col_water;
		this.feetIinWater = materialAtPixel(player.centerX(), player.centerY()+15) == col_water;

		var climbDist = PlayerRaytrace(0,0,0,-1,5,false,col_climbable);
		var climbDistStop = PlayerRaytrace(0,-5,0,-1,5,true,col_climbable);
		var currentClimbable  = climbDist != -1;
		if(upPressed) {
			if(isGrounded && !this.climbing && headFree && upPressedNow) {
				justJumped = true;
				player.vy = -12;
			}

			if(currentClimbable && !balloon) {
					player.vy = -2;
					this.climbing = true;
					if(climbDistStop != -1)
					{
						player.vy = 0;
					}
			}
			else this.climbing = false;
		}
		else {
			if(this.climbing) {
				if(!currentClimbable) this.climbing = false;
				else if(downPressed) player.vy = 2;
				else this.vy = 0;
			}
			else if(this.inWater && downPressed) this.vy = 4;
		}

		if(balloon)
		{
			this.climbing = false;

			if(player.vy>-6)
				player.vy += -2.0;
		}

		if(lastPressed != "right" && !this.climbing) this.flipped = true;
		else this.flipped = false;

		upPressedNow = false;
	}

	this.animateFrame = function(ani, frms, loop, stp) {
		if(animation == ani) {
			if(stp != undefined) {
				cnt++;
				if(cnt%stp!=0)
					return;
			}
			if(!loop) {
				frame = (frame+1);
				frame = frame > frms-1 ? frms-1 : frame;
			}
			else frame = (frame+1)%frms;
		}
		else {
			cnt = 0;
			frame = 0;
		}

		animation = ani;
	}
	
	var landEnd = false;
	var landing = false;
	
	this.animate = function() {
		if(player.climbing)
		{
			//Climbing
			if(upPressed || downPressed || rightPressed || leftPressed) 
			{
				this.animateFrame("climb", 9, true, 2);
			}
		}
		else if(player.feetIinWater)
		{
			//Water
			this.animateFrame("climb", 9, true, 2);
		}
		else if(isGrounded)
		{
			//Ground			
			if(!wasGrounded && lastVY > 19) landing = true;
							
			if(landing)
			{
				if(frame == 3)
					landing = false;
					
				this.animateFrame("fast_land", 4, false, 4);				
			}			
			else if(leftPressed || rightPressed) //Run
				this.animateFrame("run", 8, true, 2);
			else //Idle
				this.animateFrame("idle", 15, true, 2);
		}
		else
		{
			//Air
			if(balloon)
			{
				this.animateFrame("air", 1, true, 2);
			}
			else
			{
				if(player.vy < 0 && animation != "air") {
					this.animateFrame("jump", 2, false, 3);
				}
				else if(player.vy > 3)
				{
					if(player.vy > 19)
					{
						this.animateFrame("fast_fall", 1, false, 2);
					}
					else
					{
						this.animateFrame("fall", 1, false, 2);
					}
					fallSpeed = player.vy;
				}				
			}
		}		
		
		var ani = "player/man_" + animation +  "_" + pad(1+frame, 2) + ".png";

		this.player.attr("src", ani)

		this.player.removeClass(function () { return false; });

		var c = "";

		if(this.flipped) c += "flip";

		this.player.attr("class", c);
	}
}

var camx = 100.0;
var camy = 40.0;

var lastVY;

function update() {
	player.update();

	updatePhysics();

	if(gameIntro)
	{
		player.vy -= 0.971;
		player.vx = 2.13;
		if(isGrounded)
		{
			gameIntro = false;
			gameHasBeenStarted = true;
		}
	}

	player.animate();
	if(!gameIntro)
	{
		camy += (player.y-camy)/5.0;
		camx += (player.x-camx)/5.0;

		camy = Math.floor(camy);
		camx = Math.floor(camx);
	}
	oldPlayerX = player.x;

	player.x += player.vx;
	player.y += player.vy;

	updateMap();
	lastVY = player.vy;
}

function updateMap()
{
	var x = initMapPos[0] - camx;
	var y = initMapPos[1] - camy;

	map.position()[0] = x;
	map.position()[1] = y;

	map.update();

	offset = player.player.offsetParent().offsetParent().offset();
	offset.left += player.player.offsetParent().offsetParent().width()/2-35;
	offset.top +=player.player.offsetParent().offsetParent().height()/2+160;

	//player.player.offset({left: 650, top: 400});
	player.player.offset({left: offset.left+(player.x-camx), top: offset.top+(player.y-camy)});
}

function log(){
	/*($.ajax({
		url:"http://xkcd.kajakklubben.org/log.php",
		crossDomain: true,
		type: "POST",
		dataType: 'jsonp', // Notice! JSONP <-- P (lowercase)
		data: {
			a: "log",
			xpos: player.x,
			ypos: player.y
		}
	});*/
}

var groundedFrames;
var headFree;
function updatePhysics()
{
	wasGrounded = isGrounded;
	if(groundedFrames==0) {
		isGrounded = false;
	}
	else
		groundedFrames--;

	headFree = PlayerRaytrace(0,-20,0,-1,1);
if(headFree != -1 && player.vy<0)
	player.vy = 0;

	var playerWidth = 20;
	var playerHeight = 52;

	if(player.inWater) {

		player.vy -= 1.5;
		if(player.vy < -4)
			player.vy = -4;
	}
	else if(!player.climbing)
		player.vy += 1;

	if(player.vy > 20) { //max fall speed
		player.vy = 20;
	}

	var dirX = player.vx>0?1:-1;
	var dirY = player.vy>0?1:-1;
	var centerHorDist = PlayerRaytrace(dirX*playerWidth/2,playerHeight/5,dirX,0,Math.abs(player.vx));
	var stopHorizontal = false;

	if(centerHorDist!=-1)
	{
		player.x = player.x+dirX*(centerHorDist+playerWidth/2)-dirX*playerWidth/2;
		player.vx = 0;
		stopHorizontal = true;
	}

	var centerVerDistLeft = PlayerRaytrace(-2,dirY*playerHeight/2,0,dirY,1+Math.abs(player.vy));
	var centerVerDistRight = PlayerRaytrace(2,dirY*playerHeight/2,0,dirY,1+Math.abs(player.vy));

	//Slide on edges
	if(centerVerDistLeft != -1 && centerVerDistRight == -1)
	{
		player.vy *=0.7;
		if(player.vx<7*player.maxFactor)
			player.vx +=2;
	}

	if(centerVerDistLeft == -1 && centerVerDistRight != -1)
	{
		player.vy *=0.7;
		if(player.vx>-7*player.maxFactor)
			player.vx -=2;
	}

	if(centerVerDistLeft != -1 || centerVerDistRight != -1) {
		if(player.vy>0) // only when falling down
		{
			groundedFrames = 3; // we are grounded for the next 3 frames
			isGrounded = true; 
		}

		if(centerVerDistLeft != -1 && centerVerDistRight != -1) 
		{
			player.vy = 0;
		}

		//player.vy = dirY*Math.min(centerVerDistRight,centerVerDistLeft);
		var dist = PlayerRaytrace(player.vx,playerHeight/2+player.vy,0,-1,playerHeight,true);
		if(dist != -1)
		{
			player.y = player.y - (dist-1);
			//player.vx *0.7;
		}
		else
		{
			var dist = PlayerRaytrace(player.vx,-playerHeight/2+player.vy,0,1,playerHeight,true);
			if(dist != -1)
			{
				player.y = player.y + (dist-1);
				//player.vx *0.7;
			}
		}

		if( centerVerDistLeft == 0 && centerVerDistRight == 0 && centerHorDist == 0 && !headFree)
		{
			//we might be stuck
			player.y = player.y - 10;
		}
	}
}

function PlayerRaytrace(xoffset,yoffset,dx,dy,dist,flip,compare) {
	dist = Math.max(1,dist);
	if(flip == undefined)
		flip = false;
	if(compare == undefined)
		compare = col_ground;

	var x = player.centerX()+xoffset;
	var y = player.centerY()+yoffset+2;

	var maxraytrace = 20.0; //lower this to gain performance. 10 might be too small

	var step = Math.ceil(dist/maxraytrace);

	var ground = false;
	for(i = 0;i<dist;)
	{
		ground = materialAtPixel(x+i*dx, y+i*dy) == compare;
		
		if((!flip && ground) || (flip && !ground))
			return i;
		//we always want to trace the first  pixels due to better walking
		if(i<2)
			i++;
		else
			i+=step;
	}
	return -1;

}

var  col_air = 0;
var  col_climbable = 1;
var  col_water = 2;
var  col_ground = 3;

function materialAtPixel(x, y) {
	var img = getImageForPixel(x, y);
	
	if(img != undefined)  {
		var localX = x - img.left;
		var localY = y - img.top;
		
		return materialAtImagePixel(img.id, localX, localY);
	}
	
	return col_air;
}

function materialAtImagePixel(name, x, y) {
	var data = collisionMap[name];
	
	if(data === undefined)
		return col_air; 
	else if(data === false)
		return col_ground;

	var i = (Math.floor(y/2) * 4) * 1024 + (Math.floor(x/2) * 4);

	if(data[i+0] <  50 && data[i+1] < 50 && data[i+2] < 50)
		return col_ground;
	if(data[i+0] < 50 && data[i+1] > 50 && data[i+2] <  50 )
		return col_climbable;
	if(data[i+0] < 50 && data[i+1] <  50 && data[i+2] > 50)
		return col_water;
	return col_air;
}

var lastMap;
var activeMaps;
var collisionMap = [];

function getImageForPixel(x, y) {

	if(lastMap != undefined)
	{
		if(lastMap.left <= x && x < lastMap.left +  lastMap.width && lastMap.top <= y && y < lastMap.top +  lastMap.height)
		{	
			return lastMap;
		}
	}
	lastMap = $(activeMaps).filter(function(index) {

		return (this.left <= x && x < this.left +  this.width && this.top <= y && y < this.top +  this.height)
	})[0];

	return lastMap;
}

var player;
var map;
var initMapPos ;
$(function() {
	map=new Map($('#comic'));
	initMapPos = [Math.floor(map.position()[0]), Math.floor(map.position()[1])];
	player = new Player();
	//player position in original comic
	player.x = -305+25;
	player.y =-56-170;
	camx = 0.0;
	camy = 0.0;
	updateMap();


	$("#canvascontainer").hide();
	
});
