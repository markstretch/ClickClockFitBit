import clock from "clock";
import * as messaging from "messaging";
import document from "document";
import { HeartRateSensor } from "heart-rate";
import { battery } from "power";
import { charger } from "power";
import { preferences } from "user-settings";
import { today } from "user-activity";
import * as clockutil from "../common/clockutils";
import { display } from "display";
import { units } from "user-settings";
import { locale } from "user-settings";
import { user } from "user-profile";
import * as fs from "fs";
import { me } from "appbit";
import { me as device } from "device";

//SVG elements
const timeLable = document.getElementById("timeLable");
const hourLable = document.getElementById("hourLable");
const minuteLable = document.getElementById("minuteLable");
const replacetimeLable = document.getElementById("replacetimeLable");
const replacehourLable = document.getElementById("replacehourLable");
const replaceminuteLable = document.getElementById("replaceminuteLable");
let hrLable = document.getElementById("hrm");
let batLable = document.getElementById("batLable");
let stepLable = document.getElementById("stepLable");
let kmLable = document.getElementById("kmLable");
let dateLable = document.getElementById("dateLable");
let myElement = document.getElementById("myElement");
let heartpic = document.getElementById("heartpic");
let stepspic = document.getElementById("stepspic");
let floorspic = document.getElementById("floorspic");
let replaceLable = document.getElementById("replaceLable");
let replaceHeartLable = document.getElementById("replaceHeartLable");
let hrmrestLable = document.getElementById("hrmrestLable");
let floorsLable = document.getElementById("floorsLable");
let calspic = document.getElementById("calspic");
let calsLable = document.getElementById("calsLable");
let heartrestpic = document.getElementById("heartrestpic");
let batpic = document.getElementById("batpic");
let heartpicsvg = document.getElementById("heartpicsvg");
let batpicsvg = document.getElementById("batpicsvg");
let stepspicsvg = document.getElementById("stepspicsvg");

heartrestpic.style.visibility = "hidden";
floorspic.style.visibility = "hidden";
calspic.style.visibility = "hidden";

console.log((user.restingHeartRate || "Unknown") + " BPM");
console.log("Locale: " + locale.language);
console.log("from user settings: " + units.distance);

var todays = new Date();
var hrm = new HeartRateSensor();
var autochange = false;
var nighttime = false; //reserved
var staticColor = false;
var staticColorValue = "#1B2C40";
var colorhours = 0;

// minute clock
clock.granularity = "minutes";

// setup initial values
hrLable.text = "--";
batLable.text = "--%";

// Determine local and units
function setDistanceUnits()
{
  var localelang = locale.language;
  var userunits = units.distance;
  if (localelang.toLowerCase() == "en-us" || localelang.toLowerCase() == "en-gb" && userunits.toLowerCase() != "metric") {
      var num = ((today.local.distance /1000) * 0.62137);
      var n = num.toFixed(3);
      kmLable.text = n + " mi";
  } else {
      var num = (today.local.distance /1000);
      var n = num.toFixed(3);
      kmLable.text = n + " km";
  }
}

setDistanceUnits();

// Want heart rate to be constantly updated
hrm.onreading = function() {
  if (display.on) {
    console.log("heart rate: " + hrm.heartRate);
    hrLable.text = hrm.heartRate;
    replaceHeartLable.text = hrm.heartRate;
  }
}

batLable.text = Math.floor(battery.chargeLevel) + "%"; 
stepLable.text = today.local.steps;
dateLable.text = todays.getDate() + "-" + (todays.getMonth() + 1) + "-" + todays.getFullYear();

hrm.start();

// clock update event handler
clock.ontick = (evt) => {
  let today = evt.date;
  let hours = today.getHours();
  if (preferences.clockDisplay === "12h") {
    // 12h format
    hours = hours % 12 || 12;
  } else {
    // 24h format
    hours = clockutil.zeroPad(hours);
  }
  let mins = clockutil.zeroPad(today.getMinutes());
  colorhours = hours;
  hourLable.text = `${hours}`;
  minuteLable.text = `${mins}`;
  if (replacehourLable.style.visible != "hidden") {
    replaceminuteLable.text = minuteLable.text;
    replacehourLable.text = hourLable.text;
  } 
}

// update display with stats only when display is switched on
// saves battery - better than doing it in clock ticks - every minute
display.onchange = () => {
  //console.log(`The display was turned ${display.on ? "on" : "off"}`)
  console.log("Locale: " + locale.language);
  //update other stats
  if (display.on) {
    stepLable.text = today.local.steps;
    if (autochange == true) {
      //randomly change colors throught the day every minute
      myElement.gradient.colors.c2 = randomColors();
    }
    dateLable.text = todays.getDate() + "-" + (todays.getMonth() + 1) + "-" + todays.getFullYear();
    batLable.text = Math.floor(battery.chargeLevel) + "%"; 
    setDistanceUnits();
    //display real(ish) heart rate on pulsating heart image
    let imageanimate = document.getElementById("imageanimate");
    imageanimate.dur= 60/hrm.heartRate;
    batpic.style.opacity = Math.floor(battery.chargeLevel) / 100;
  }
}
               
// make a black background and dim forground colors for quieter night viewing- reserved
function invertColors() {
  myElement.style.fill = "black";
  stepLable.style.fill = "blue";
  kmLable.style.fill = "blue";
  batLable.style.fill = "blue";
  timeLable.style.fill = "blue";
}

// go back to initial static color or time chosen color - reserved
function revertColor() {
      myElement.style.fill = staticColorValue;
      stepLable.style.fill = "black";
      kmLable.style.fill = "black";
      batLable.style.fill = "black";
      timeLable.style.fill = "black";
}

hrLable.onmousedown = function(e) {
  hideAll();
  arrangeScreenOnHrLableClick();
}

heartpicsvg.onmousedown = function(e) {
  hideAll();
  arrangeScreenOnHrLableClick()
}

function arrangeScreenOnHrLableClick() {
  heartpic.style.visibility = "visible";
  replaceHeartLable.style.fontSize = 60;
  replaceHeartLable.style.visibility= "visible";
  replaceHeartLable.text = hrLable.text;
  hourLable.style.visibility= "hidden";
  timeLable.style.visibility= "hidden";
  minuteLable.style.visibility= "hidden";
  hrmrestLable.style.fontSize = 40;
  hrmrestLable.text = (user.restingHeartRate || "Unknown");
  hrmrestLable.style.visibility = "visible";
  heartrestpic.style.visibility = "visible";
}

hrmrestLable.onmousedown = function(e) {
  showAll();
  replaceLable.style.visibility= "hidden";
  hourLable.style.visibility= "visible";
  timeLable.style.visibility= "visible";
  minuteLable.style.visibility= "visible";
  hrmrestLable.style.visibility = "hidden";
  heartrestpic.style.visibility = "hidden";
  heartpic.style.visibility = "visible";
  hrmrestLable.style.visibility = "hidden";
  replaceHeartLable.style.visibility = "hidden";
}

batLable.onmousedown = function(e) {
  hideAll();
  replaceLable.style.fontSize = 60;
  replaceLable.style.visibility= "visible";
  replaceLable.text = batLable.text;
  hourLable.style.visibility= "hidden";
  timeLable.style.visibility= "hidden";
  minuteLable.style.visibility= "hidden";
  batpic.style.visibility= "visible";
}

batpic.onmousedown = function(e) {
  hideAll();
  arrangeScreenOnBatPicClick()
}

batpicsvg.onmousedown = function(e) {
  hideAll();
  arrangeScreenOnBatPicClick()
}

function arrangeScreenOnBatPicClick() {
  replaceLable.style.fontSize = 60;
  replaceLable.style.visibility= "visible";
  replaceLable.text = batLable.text;
  hourLable.style.visibility= "hidden";
  timeLable.style.visibility= "hidden";
  minuteLable.style.visibility= "hidden";
  batpic.style.visibility= "visible";
}

stepLable.onmousedown = function(e) {
  hideAll();
  arrangeScreenOnStepsPicClick();
}

stepspic.onmousedown = function(e) {
  hideAll();
  arrangeScreenOnStepsPicClick();
}

stepspicsvg.onmousedown = function(e) {
  hideAll();
  arrangeScreenOnStepsPicClick();
}

function arrangeScreenOnStepsPicClick() {
  stepspic.style.visibility = "visible";
  replaceLable.style.fontSize = 60;
  replaceLable.style.visibility= "visible";
  replaceLable.text = stepLable.text;
  hourLable.style.visibility= "hidden";
  timeLable.style.visibility= "hidden";
  minuteLable.style.visibility= "hidden";
  console.log(device.modelName);
  if (device.modelName.toLowerCase() == "ionic" || device.modelName.toLowerCase() == "versa" ) {
    floorspic.style.visibility = "visible";
    floorsLable.style.fontSize = 40;
    floorsLable.text = (today.local.elevationGain || 0);
    floorsLable.style.visibility = "visible";
  }
}

floorsLable.onmousedown = function(e) {
  showAll();
  replaceLable.style.visibility= "hidden";
  hourLable.style.visibility= "visible";
  timeLable.style.visibility= "visible";
  minuteLable.style.visibility= "visible";
  floorsLable.style.visibility = "hidden";
  floorspic.style.visibility = "hidden";
}

calsLable.onmousedown = function(e) {
  showAll();
  replaceLable.style.visibility= "hidden";
  hourLable.style.visibility= "visible";
  timeLable.style.visibility= "visible";
  minuteLable.style.visibility= "visible";
  calsLable.style.visibility = "hidden";
  calspic.style.visibility = "hidden";
}

kmLable.onmousedown = function(e) {
  hideAll();
  replaceLable.style.fontSize = 60;
  replaceLable.style.visibility= "visible";
  replaceLable.text = kmLable.text;
  hourLable.style.visibility= "hidden";
  timeLable.style.visibility= "hidden";
  minuteLable.style.visibility= "hidden";
  calspic.style.visibility = "visible";
  calsLable.style.fontSize = 40;
  calsLable.text = (today.local.calories || 0);
  calsLable.style.visibility = "visible";
}

dateLable.onmousedown = function(e) {
  hideAll();
  replaceLable.style.fontSize = 60;
  replaceLable.style.visibility= "visible";
  replaceLable.text = dateLable.text;
  hourLable.style.visibility= "hidden";
  timeLable.style.visibility= "hidden";
  minuteLable.style.visibility= "hidden";
}

timeLable.onmousedown = function(e) {
  hideAll();
  showreplacetimeLables();
}

function showreplacetimeLables() {
  replacetimeLable.text = timeLable.text;
  replacehourLable.text = hourLable.text;
  replaceminuteLable.text = minuteLable.text;
  replacetimeLable.style.visibility= "visible";
  replacehourLable.style.visibility= "visible";
  replaceminuteLable.style.visibility= "visible";
  timeLable.style.visibility= "hidden";
  hourLable.style.visibility= "hidden";
  minuteLable.style.visibility= "hidden";
  hrmrestLable.style.visibility = "hidden";
  floorsLable.style.visibility = "hidden";
  floorspic.style.visibility = "hidden";
  calsLable.style.visibility = "hidden";
  calspic.style.visibility = "hidden";
  heartrestpic.style.visibility = "hidden";
  heartpic.style.visibility = "hidden";
}

hourLable.onmousedown = function(e) {
  hideAll();
  showreplacetimeLables();
}

minuteLable.onmousedown = function(e) {
  hideAll();
  showreplacetimeLables();
}
  
replaceLable.onmousedown = function(e) {
  showAll();
  replaceLable.style.visibility= "hidden";
  hourLable.style.visibility= "visible";
  timeLable.style.visibility= "visible";
  minuteLable.style.visibility= "visible";
  hrmrestLable.style.visibility = "hidden";
  floorsLable.style.visibility = "hidden";
  floorspic.style.visibility = "hidden";
  calsLable.style.visibility = "hidden";
  calspic.style.visibility = "hidden";
  heartrestpic.style.visibility = "hidden";
  heartpic.style.visibility = "visible";
  hrmrestLable.style.visibility = "hidden";
}

replaceHeartLable.onmousedown = function(e) {
  showAll();
  replaceHeartLable.style.visibility= "hidden";
  hourLable.style.visibility= "visible";
  timeLable.style.visibility= "visible";
  minuteLable.style.visibility= "visible";
  hrmrestLable.style.visibility = "hidden";
  floorsLable.style.visibility = "hidden";
  floorspic.style.visibility = "hidden";
  calsLable.style.visibility = "hidden";
  calspic.style.visibility = "hidden";
  heartrestpic.style.visibility = "hidden";
  heartpic.style.visibility = "visible";
  hrmrestLable.style.visibility = "hidden";
}


replacetimeLable.onmousedown = function(e) {
  gobacktoMainScreen();
}

replacehourLable.onmousedown = function(e) {
  gobacktoMainScreen();
}

replaceminuteLable.onmousedown = function(e) {
  gobacktoMainScreen();
}


function gobacktoMainScreen() {
  showAll();
  replaceLable.style.visibility= "hidden";
  hourLable.style.visibility= "visible";
  timeLable.style.visibility= "visible";
  minuteLable.style.visibility= "visible";
  hrmrestLable.style.visibility = "hidden";
  floorsLable.style.visibility = "hidden";
  floorspic.style.visibility = "hidden";
  calsLable.style.visibility = "hidden";
  calspic.style.visibility = "hidden";
  heartrestpic.style.visibility = "hidden";
  hrmrestLable.style.visibility = "hidden";
  replaceHeartLable.style.visibility = "hidden";
  replacetimeLable.style.visibility= "hidden";
  replacehourLable.style.visibility= "hidden";
  replaceminuteLable.style.visibility= "hidden";

}

function hideAll () {
  console.log("replacetimelable clicked");
  hrLable.style.visibility = "hidden";
  batLable.style.visibility = "hidden";
  stepLable.style.visibility = "hidden";
  kmLable.style.visibility = "hidden";
  dateLable.style.visibility = "hidden";
  heartpic.style.visibility = "hidden";
  stepspic.style.visibility = "hidden";
  batpic.style.visibility = "hidden";
  replacetimeLable.style.visibility= "hidden";
  replacehourLable.style.visibility= "hidden";
  replaceminuteLable.style.visibility= "hidden";
}

function showAll () {
  hrLable.style.visibility = "visible";
  batLable.style.visibility = "visible";
  stepLable.style.visibility = "visible";
  kmLable.style.visibility = "visible";
  dateLable.style.visibility = "visible";
  heartpic.style.visibility = "visible";
  stepspic.style.visibility = "visible";
  batpic.style.visibility = "visible";
}

