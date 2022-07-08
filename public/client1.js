import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import Stats from 'three/examples/jsm/libs/stats.module'
//import GUI from 'lil-gui'; 

const gui = new GUI({ width: 280 });
//gui.add( document, 'title' );

const myObject = {
	newCube: 'Space',
	goUp: 'Arrow Up',
    goDown: 'Arrow Down',
    scaleUp: 'Left Shift',
    scaleDown: 'Right Shift',
    rotateToBeam: 'b',
    rotateToColumn: 'c',
    moveCube: 'Mouse left click and drag'
};

gui.add( myObject, 'moveCube' ); 
gui.add( myObject, 'newCube' ); 
gui.add( myObject, 'goUp' ); 
gui.add( myObject, 'goDown' ); 
gui.add( myObject, 'scaleUp' ); 
gui.add( myObject, 'scaleDown' ); 
gui.add( myObject, 'rotateToBeam' ); 
gui.add( myObject, 'rotateToColumn' ); 



var socket
socket = io.connect('http://localhost:3000') // Connect client to server in socket

// Creating a scene, camera, etc
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 1, 1000);
camera.position.set(3, 5, 8);
camera.lookAt(scene.position);
const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);

let controls = new OrbitControls(camera, renderer.domElement);

scene.add(new THREE.GridHelper(10, 10));

let colour = new THREE.Color(Math.random(), Math.random(), Math.random())

window.addEventListener('resize',()=>{
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.render(scene, camera)
}, false )

let i = 1

// Creating a class that draws a cube and allows to drad it by mouse
class Cube{
    constructor(){
        

        this.boxGeom = new THREE.BoxGeometry(1, 1, 1);
        this.boxGeom.translate(0, 0.5, 0);

        this.boxMat = new THREE.MeshBasicMaterial({color: colour});

        this.box = new THREE.Mesh(this.boxGeom, this.boxMat);
        scene.add(this.box);

        // this.edges = new THREE.EdgesGeometry(this.boxGeom);
        // this.line = new THREE.LineSegments( this.edges, new THREE.LineBasicMaterial( { color: 0xffffff } ) );
        // this.box.add( this.line );

        // This stuff is to allow the dragging of a cube
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.plane = new THREE.Plane();
        this.pNormal = new THREE.Vector3(0, 1, 0); // plane's normal
        this.planeIntersect = new THREE.Vector3(); // point of intersection with the plane
        this.pIntersect = new THREE.Vector3(); // point of intersection with an object (plane's point)
        this.shift = new THREE.Vector3(); // distance between position of an object and points of intersection with the object
        this.isDragging = false;
        this.dragObject;

        document.addEventListener("pointermove", event => {

        this.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        this.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
        this.raycaster.setFromCamera(this.mouse, camera);
        
        if (this.isDragging) {
            this.raycaster.ray.intersectPlane(this.plane, this.planeIntersect);
            this.dragObject.position.addVectors(this.planeIntersect, this.shift);
            }
        });

        document.addEventListener("pointerdown", () => {
                var intersects = this.raycaster.intersectObjects([this.box]);
            if (intersects.length > 0) {
                controls.enabled = false;
                this.pIntersect.copy(intersects[0].point);
                this.plane.setFromNormalAndCoplanarPoint(this.pNormal, this.pIntersect);
                this.shift.subVectors(intersects[0].object.position, intersects[0].point);
                this.isDragging = true;
                this.dragObject = intersects[0].object;
                //this.line.geometry.verticesNeedUpdate = true
            
            }
        } );



        document.addEventListener("pointerup", () => {
            this.isDragging = false;
            this.dragObject = null;
            controls.enabled = true;
            // After dragging the cube, we save its position
            var data = {
                x: this.box.position.x,
                y: this.box.position.y,
                z: this.box.position.z,
                idCube: i
            }
            // And send it to the server with 'Get positions' message
            socket.emit('Get positions', data)
            
        } );


        // document.addEventListener("keydown", event => {
        //     if (event.code === 'ArrowUp') {
        //         this.box.position.y +=1
        //         }
        //     else if (event.code === 'ArrowDown') {
        //         this.box.position.y -=1
        //         }
        // })

        // Call animate method every time the cube class is called
        this.animate()
    }


    animate(){
        renderer.setAnimationLoop(() => {
            renderer.render(scene, camera);
            
            })

    }

    
}
// Instantiate (call) a class (it will draw cube on a canvas when server is launched 1st time)
let newbox = new Cube()

socket.on('Redraw figure', (data)=>{
    // Recieve 'Redraw figure' message from server with data and move the cube according to the recieved data
    newbox.box.position.set(data.x, data.y, data.z)
})

socket.on('Update cube', (dataControls)=>{
    // Recieve 'Redraw figure' message from server with data and move the cube according to the recieved data
    newbox.box.position.y = dataControls.pos
    newbox.box.scale.y = dataControls.scale
    newbox.box.rotation.x = dataControls.rot

})


document.addEventListener("keydown", event => {
    if (event.code === 'Space') {
        //When spacebar is pressed, draw a new cube in a canvas
        newbox = new Cube()
        i+=1
        // Send this cube to the server with 'New Box' message
        socket.emit('New Box', newbox)
    }
})

document.addEventListener("keydown", event => {
    if (event.code === 'ArrowUp') {
        newbox.box.position.y +=1
        }  
    else if (event.code === 'ArrowDown') {
        newbox.box.position.y -=1
        }
    else if (event.code === 'ShiftLeft') {
        newbox.box.scale.y +=1
         }
    else if (event.code === 'ShiftRight') {
        newbox.box.scale.y -=1
    }
    else if (event.code === 'KeyB') {
        newbox.box.rotation.x += Math.PI/2
            //newbox.boxGeom.translate(0, 0.5, 0)
        }
    else if (event.code === 'KeyC') {
        newbox.box.rotation.x -= Math.PI/2
            //newbox.boxGeom.translate(0, 0.5, 0)
        }
    let dataControls = {
        pos: newbox.box.position.y,
        scale: newbox.box.scale.y,
        rot: newbox.box.rotation.x 
    }

    socket.emit('Transformed cube', dataControls)
})


socket.on('Draw new box', (box1)=>{
    // When recieve 'Draw new box' message from the server, draw a cube (it allows a new cube to appear in all the clients)
    newbox = new Cube()
    i+= 1
})

// socket.on('Redraw figure', (data)=>{
//     newbox.box.position.set(data.x, data.y, data.z)
// })

// newbox.animate()
//Cube().animate