// Socket client side 
//import * as THREE from 'three'
//import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

var socket

function setup() {
  createCanvas(600, 400)
  background(51)

  socket = io.connect('http://localhost:3000') // Connect client to server in socket
  //receiving data from a server
  socket.on('mouse', newDrawing) // If recieves the message 'mouse' from the server, trigger the function
}


// This is coming from different device
function newDrawing(data) {
  noStroke()
  fill(255, 0, 100)
  ellipse(data.x, data.y, 36, 36)
}

function mouseDragged() {
  console.log(mouseX + ',' + mouseY)

  var data = { // Data for the message
    x: mouseX,
    y: mouseY
  }
  // Send the message 'mouse' to the server with some data
  socket.emit('mouse', data) // Message itself, mouse is the name

  noStroke()
  fill(255)
  ellipse(mouseX, mouseY, 36, 36)

}

//let a = mouseX
//let b = mouseY
// Creating a message


// function draw() {
  
// }