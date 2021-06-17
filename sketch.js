var rocks = [];
var upRock;
var downRock;

var analyzer;

var osc = [];
var numVoices = 5;

var env;
var lpf;
var distortion;
var reverb;

var neck;
var body;
var legs = [];
var head;

var prevX; 
var prevY;

function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();
  
  //set up osc
  for(var i = 0; i<numVoices; i++) {
    osc[i] = new p5.Oscillator();
    osc[i].setType('sine'); // sawtooth, triangle, square
  }

  //set up effects
  env = new p5.Env();
  env.setADSR(5, 5, 0.0, 0.5); //set attackLevel, releaseLevel (volume)
  env.setRange(1,0);
  env.setExp(); 
  distortion = new p5.Distortion(0.0, 'none');
  lpf = new p5.LowPass();
  reverb = new p5.Reverb();

  //effects chain
  for(var i = 0; i<numVoices; i++) {
    osc[i].amp(env);
    osc[i].disconnect(); 
    osc[i].connect(distortion);
    osc[i].connect(reverb);
    osc[i].connect(lpf);
    osc[i].start(); 
  }
  
  // create a new freq analyzer
  analyzer = new p5.FFT();
  //analyzer.setInput(osc); // Patch the input to an analyzer

  //initialise llama parts
  neck = new Neck(200,200,50,100);
  body = new Body(neck.x,neck.y+neck.h,300,100);
  legs[0] = new Leg(body.x,body.y+body.h,20,100);
  legs[1] = new Leg(body.x+30,body.y+body.h,20,100);
  legs[2] = new Leg(body.x+body.w-30,body.y+body.h,20,100);
  legs[3] = new Leg(body.x+body.w-60,body.y+body.h,20,100);
  head = new Head(neck.x+neck.w,neck.y-50, neck.x+neck.w,neck.y, neck.x-50,neck.y-10, neck.x-50,neck.y-40);

  //initialise rocks
  rocks[0] = new Rock(100, 500, 20, 48);
  rocks[1] = new Rock(150, 450, 20, 49);
  rocks[2] = new Rock(200, 500, 20, 50);
  rocks[3] = new Rock(250, 450, 20, 51);
  rocks[4] = new Rock(300, 500, 20, 52);
  rocks[5] = new Rock(400, 500, 20, 53);
  rocks[6] = new Rock(450, 450, 20, 54);
  rocks[7] = new Rock(500, 500, 20, 55);
  rocks[8] = new Rock(550, 450, 20, 56);
  rocks[9] = new Rock(600, 500, 20, 57);
  rocks[10] = new Rock(650, 450, 20, 58);
  rocks[11] = new Rock(700, 500, 20, 59);
  rocks[12] = new Rock(800, 500, 20, 60);

  upRock = new Rock(width-100, 450, 20, -1);
  upRock.oct = 1;
  downRock = new Rock(width-100, 550, 20, -1);
  downRock.oct = -1;
}

function draw() {
  background(190, 220, 255);

  //drawing ground
  var base = 400;
  fill(150, 100, 10);
  rect(0, base, width, height-base);
  fill(0,255,100);
  rect(0, base, width, 10);

  //audio visual of spectrum
  var spectrum = analyzer.analyze();

  for (i = 0; i < spectrum.length; i++) {
    fill(0,255,100);
    rect(i*(width/spectrum.length), base - spectrum[i], 1, spectrum[i]);
  }
  
  //map llama size to audio effects
  var attack = map(legs[0].h, 30, 200, 0.0, 2.0); //1 - 10
  var decay = map(legs[1].h, 30, 200, 0.0, 2.0); // 0.1 - 2
  var sustain = map(legs[2].h, 30, 200, 0.0, 1.0); //0.0 - 0.5
  var release = map(legs[3].h, 30, 200, 0.0, 2.0); //0.5 - 1.0

  env.setADSR(attack, decay, sustain, release);
  env.setRange(0.1,0); 
  lpf.set(map(body.w, 150, 1000, 0, 22040), 15); //filterFreq, filterRes
  distortion.set(map(neck.h, 50, 200, 0.0, 0.3), 'none');
  reverb.drywet(map(body.h, 50, 200, 0, 1));


  //display llama and rocks
  neck.display();
  head.display();
  body.display();
  for(var i = 0; i<legs.length; i++) {
    legs[i].display();
  }
  for(var i = 0; i<rocks.length; i++) {
    rocks[i].display();
  }
  upRock.display();
  downRock.display();

  //for dragged events
  prevX = mouseX;
  prevY = mouseY;
}

//highlights which part of llama or rock can be interacted with
function mouseMoved() { 
  neck.isOn(mouseX, mouseY);
  body.isOn(mouseX, mouseY);
  for(var i = 0; i<legs.length; i++) {
    legs[i].isOn(mouseX, mouseY);
  }
  head.isOn(mouseX, mouseY);
  for(var i = 0; i<rocks.length; i++) {
    rocks[i].isOn(mouseX, mouseY);
  }
  upRock.isOn(mouseX, mouseY);
  downRock.isOn(mouseX, mouseY);
}

//for dragging size of llama
function mouseDragged() {
  if(neck.mouseOn) { //moves head with neck height change
    neck.changeHeight(prevY - mouseY);
    head.updatePos(neck.x+neck.w,neck.y-50, neck.x+neck.w,neck.y, neck.x-50,neck.y-10, neck.x-50,neck.y-40);
  }
  if(body.mouseOn) { //moves legs with body size change
    body.changeSize(mouseX - prevX, mouseY - prevY);
    legs[0].updatePos(body.x,body.y+body.h);
    legs[1].updatePos(body.x+30,body.y+body.h);
    legs[2].updatePos(body.x+body.w-30,body.y+body.h);
    legs[3].updatePos(body.x+body.w-60,body.y+body.h);
  }
  for(var i = 0; i<legs.length; i++) {
    if(legs[i].mouseOn) {
      legs[i].changeHeight(mouseY - prevY);
      break;
    }
  }

  prevX = mouseX;
  prevY = mouseY;
}

//for playing the rocks like a MIDI keyboard
//and toggle between triangle and sawtooth
function mousePressed() {
  for(var i = 0; i<rocks.length; i++) {
    if(rocks[i].mouseOn) {
      env.play();
      var freq = midiToFreq(rocks[i].n);

      for(var j = 0; j<numVoices; j++) {
        osc[j].freq(freq*(j+1)); //each additional osc plays j*fundamental freq
      }
    }
    else if(upRock.mouseOn) rocks[i].n += 12;
    else if(downRock.mouseOn) rocks[i].n -= 12;
  }

  if(head.mouseOn) {
    head.redEye = !head.redEye;
    if(head.redEye) 
      for(var i = 0; i<rocks.length; i++) 
        for(var j = 0; j<numVoices; j++) 
          osc[j].setType('triangle');
    else 
      for(var i = 0; i<rocks.length; i++) 
        for(var j = 0; j<numVoices; j++) 
          osc[j].setType('sine');
  }
}

function keyPressed() {
  upRock.mouseOn = false;
  downRock.mouseOn = false;
  if (keyCode == UP_ARROW) {
    for(var i = 0; i<rocks.length; i++) rocks[i].n += 12;
    upRock.mouseOn = true;
  } 
  else if (keyCode == DOWN_ARROW) {
    for(var i = 0; i<rocks.length; i++) rocks[i].n -= 12;
    downRock.mouseOn = true;
  }
}

//for keyboard input of midi notes
function keyTyped() {
  var idx = null;
  for(var i = 0; i<rocks.length; i++) rocks[i].mouseOn = false;

  if(key == 'a') idx = 0;
  if(key == 'w') idx = 1;
  if(key == 's') idx = 2;
  if(key == 'e') idx = 3;
  if(key == 'd') idx = 4;
  if(key == 'f') idx = 5;
  if(key == 't') idx = 6;
  if(key == 'g') idx = 7;
  if(key == 'y') idx = 8;
  if(key == 'h') idx = 9;
  if(key == 'u') idx = 10;
  if(key == 'j') idx = 11;
  if(key == 'k') idx = 12;

  if(idx != null) {
    rocks[idx].mouseOn = true;
    env.play();
    var freq = midiToFreq(rocks[idx].n);

    for(var i = 0; i<rocks.length; i++)  
      for(var j = 0; j<numVoices; j++) 
        osc[j].freq(freq*(j+1)); //each additional osc plays j*fundamental freq
  }
}

//Neck controls distortion
class Neck{
  constructor(xval, base, width, height){
    this.x = xval;
    this.b = base;
    this.w = width;
    this.h = height
    this.mouseOn = false;
    this.y = this.b - this.h;
  }

  changeHeight(hupdate){
    this.h = this.h + hupdate;
    if(this.h < 50) this.h = 50; 
    this.y = this.b - this.h;
  }

  display(){
    if(this.mouseOn) {
      fill(255,255,255);
      rect(this.x-2,this.y-2,this.w+4,this.h+4);
    }
    fill(255,255,200);
    rect(this.x,this.y,this.w,this.h);
  }

  isOn(xval, yval){
    if(xval > this.x && xval < this.x+this.w && yval > this.y && yval < this.y+this.h) this.mouseOn = true;
    if(xval > this.x && xval < this.x+this.w && yval > this.y && yval < this.y+this.h) console.log("CHECKING");
    else this.mouseOn = false;
  }
}

//Body width controls lpf
//Body height controls dry/wet of reverb
class Body{ 
  constructor(xval, yval, width, height){
    this.x = xval;
    this.y = yval;
    this.w = width;
    this.h = height
    this.mouseOn = false;
  }

  changeSize(wupdate, hupdate){
    this.w = this.w + wupdate;
    if(this.w < 150) this.w = 150; 

    this.h = this.h + hupdate;
    if(this.h < 50) this.h = 50; 
  }

  display(){
    if(this.mouseOn) {
      fill(255,255,255);
      rect(this.x-2,this.y-2,this.w+4,this.h+4);
    }
    fill(255,255,200);
    rect(this.x,this.y,this.w,this.h);
  }

  isOn(xval, yval){
    if(xval > this.x && xval < this.x+this.w && yval > this.y && yval < this.y+this.h) this.mouseOn = true;
    else this.mouseOn = false;
  }
}

//Each leg controls one of ADSR
class Leg{
  constructor(xval, yval, width, height){
    this.x = xval;
    this.y = yval;
    this.w = width;
    this.h = height
    this.mouseOn = false;
  }

  changeHeight(hupdate){
    this.h = this.h + hupdate;
    if(this.h < 30) this.h = 30; 
  }

  updatePos(xval, yval) {
    this.x = xval;
    this.y = yval;
  }

  display(){
    if(this.mouseOn) {
      fill(255,255,255);
      rect(this.x-2,this.y-2,this.w+4,this.h+4);
    }
    fill(255,255,200);
    rect(this.x,this.y,this.w,this.h);
  }

  isOn(xval, yval){
    if(xval > this.x && xval < this.x+this.w && yval > this.y && yval < this.y+this.h) this.mouseOn = true;
    else this.mouseOn = false;
  }
}


class Head{
  constructor(x1, y1, x2, y2, x3, y3, x4, y4){ 
    // top right
    this.x1 = x1; 
    this.y1 = y1;
    // bot right
    this.x2 = x2; 
    this.y2 = y2;
    // bot left
    this.x3 = x3; 
    this.y3 = y3;
    // top left
    this.x4 = x4; 
    this.y4 = y4;

    this.mouseOn = false;
    this.redEye = false;
  }

  changeWidth(wupdate){
    
  }

  updatePos(x1, y1, x2, y2, x3, y3, x4, y4){
    // top right
    this.x1 = x1; 
    this.y1 = y1;
    // bot right
    this.x2 = x2; 
    this.y2 = y2;
    // bot left
    this.x3 = x3; 
    this.y3 = y3;
    // top left
    this.x4 = x4; 
    this.y4 = y4;
  }

  display(){
    if(this.mouseOn) {
      fill(255,255,255);

      beginShape(); 
      vertex(this.x1+2,this.y1-2);
      vertex(this.x2+2,this.y2+2);
      vertex(this.x3-2,this.y3+2);
      vertex(this.x4-2,this.y4-2);
      endShape();
    }

    fill(255,255,200);
    beginShape(); 
    vertex(this.x1,this.y1);
    vertex(this.x2,this.y2);
    vertex(this.x3,this.y3);
    vertex(this.x4,this.y4);
    endShape();

    triangle(this.x1, this.y1, this.x1-10, this.y1, this.x1-5, this.y1-30);
    triangle(this.x1-10, this.y1, this.x1-20, this.y1, this.x1-15, this.y1-30);

    if(this.redEye) fill(255,0,0);
    else fill(0);
    ellipse(this.x1-50, this.y1+10, 15);
  }

  isOn(xval, yval){
    if(xval > this.x4 && xval < this.x1 && yval > this.y1 && yval < this.y2) this.mouseOn = true; 
    else this.mouseOn = false;
  }
}

class Rock{
  constructor(xval, yval, rad, midiNote){
    this.x = xval;
    this.y = yval, 
    this.r = rad;
    this.n = midiNote;
    this.mouseOn = false;
    this.oct = 0;
  }

  display(){
    if(this.mouseOn) {
      fill(255,255,255);
      ellipse(this.x, this.y, (this.r*2)+4);
    }
    fill(100);
    ellipse(this.x, this.y, this.r*2);

    if(this.oct != 0) {
      if(this.mouseOn) fill(255);
      else fill(0);

      if(this.oct == 1) {
        triangle(this.x-5, this.y+5, this.x, this.y-5, this.x+5, this.y+5);
      }
      else if(this.oct == -1) {
        triangle(this.x-5, this.y-5, this.x, this.y+5, this.x+5, this.y-5);
      }
    }
  }

  isOn(xval, yval){
    if(xval > this.x && xval < this.x+this.w && yval > this.y && yval < this.y+this.h) this.mouseOn = true;
    else this.mouseOn = false;

    var x2 = (this.x-xval)*(this.x-xval);
    var y2 = (this.y-yval)*(this.y-yval);
    var c = Math.sqrt(x2 + y2);

    if(c <= this.r) this.mouseOn = true;
    else this.mouseOn = false;
  }
}

