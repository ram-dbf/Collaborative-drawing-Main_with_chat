import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import Stats from 'three/examples/jsm/libs/stats.module'

var socket

function setup(){
    const scene = new THREE.Scene()

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000)
    camera.position.set(3, 5, 8);
    camera.lookAt(scene.position);

    const renderer = new THREE.WebGLRenderer({antialias: true})
    renderer.setSize(window.innerWidth, window.innerHeight)
    document.body.appendChild(renderer.domElement)

    const controls = new OrbitControls(camera, renderer.domElement)

    scene.add(new THREE.GridHelper(10, 10));

    const geometry = new THREE.BoxGeometry(1, 1, 1)
    geometry.translate(0, 0.5, 0)
    const material = new THREE.MeshBasicMaterial({
        color: 0x00ff00,
        //wireframe: true,
    })
    const cube = new THREE.Mesh(geometry, material)
    scene.add(cube)

    // edges
    // var cubeEdges = new THREE.EdgesGeometry(geometry);
    // var edges = new THREE.LineSegments(cubeEdges, new THREE.LineBasicMaterial({color: "orange"}));
    // cube.add(edges);

    // for  dynamic window's resizing
    window.addEventListener(
        'resize',
        () => {
            camera.aspect = window.innerWidth / window.innerHeight
            camera.updateProjectionMatrix()
            renderer.setSize(window.innerWidth, window.innerHeight)
            renderer.render(scene, camera)
        },
        false
    )

    const stats = Stats()
    document.body.appendChild(stats.dom)

    // Setting the movement of the object
    var raycaster = new THREE.Raycaster();
    var mouse = new THREE.Vector2();
    var plane = new THREE.Plane();
    var pNormal = new THREE.Vector3(0, 1, 0); // plane's normal
    var planeIntersect = new THREE.Vector3(); // point of intersection with the plane
    var pIntersect = new THREE.Vector3(); // point of intersection with an object (plane's point)
    var shift = new THREE.Vector3(); // distance between position of an object and points of intersection with the object
    var isDragging = false;
    var dragObject;

    document.addEventListener("pointermove", event => {

        mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
          mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
          
      if (isDragging) {
          raycaster.ray.intersectPlane(plane, planeIntersect);
        dragObject.position.addVectors(planeIntersect, shift);
      }
    });
  
    document.addEventListener("pointerdown", () => {
            var intersects = raycaster.intersectObjects([pyramid]);
        if (intersects.length > 0) {
            controls.enabled = false;
            pIntersect.copy(intersects[0].point);
            plane.setFromNormalAndCoplanarPoint(pNormal, pIntersect);
            shift.subVectors(intersects[0].object.position, intersects[0].point);
            isDragging = true;
            dragObject = intersects[0].object;
            
        }
    } );
    
    document.addEventListener("pointerup", () => {
        isDragging = false;
        dragObject = null;
        controls.enabled = true;
    } );

    // Animate
    const clock = new THREE.Clock()

    // const tick = () =>
    // {
    //     const elapsedTime = clock.getElapsedTime()

    //     // Update controls
    //     controls.update()

    //     // Render
    //     renderer.render(scene, camera)

    //     // Call tick again on the next frame
    //     window.requestAnimationFrame(tick)

    //     stats.update()
    // }

    // tick()

    renderer.setAnimationLoop(() => {
        renderer.render(scene, camera);
      })

    socket = io.connect('http://localhost:3000') // Connect client to server in socket
}

setup()
//animate()