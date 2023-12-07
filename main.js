//IMPORT MODULES
import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import GUI from 'lil-gui';

//CONSTANT & VARIABLES
let width = window.innerWidth;
let height = window.innerHeight;

//GUI PAREMETERS
var gui;
const parameters = {
  level: 2,
  length: 2,
  numBranches: 10
}

//-- SCENE VARIABLES
var scene;
var camera;
var renderer;
var container;
var control;
var ambientLight;
var directionalLight;

//-- GEOMETRY PARAMETERS
//Create an empty array for storing all the cubes
var nodes = [];
var edges = [];
var level = parameters.level;
var numBranches = parameters.numBranches;
var length = parameters.length;

function main() {
  //GUI
  gui = new GUI();
  gui.add(parameters, 'level', 1, 3, 1);
  gui.add(parameters, 'numBranches', 1, 10, 1);
  gui.add(parameters, 'length', 0.1, 10, 0.1);

  

  //CREATE SCENE AND CAMERA
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 100);
  camera.position.set(0, 10, 0);

  //LIGHTINGS
  ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(2, 5, 5);
  directionalLight.target.position.set(-1, -1, 0);
  scene.add(directionalLight);
  scene.add(directionalLight.target);

  //GEOMETRY INITIATION

  //TESTING NODE CLASS
  var location = new THREE.Vector3(0, 0, 0);
  var testNode = new TreeNode(location, 1, 0, null);
  console.log(testNode);
  generateTree(location, level, 0, null);

  //RESPONSIVE WINDOW
  window.addEventListener('resize', handleResize);

  //CREATE A RENDERER
  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container = document.querySelector('#threejs-container');
  container.append(renderer.domElement);

  //CREATE MOUSE CONTROL
  control = new OrbitControls(camera, renderer.domElement);

  //EXECUTE THE UPDATE
  animate();
}

//-----------------------------------------------------------------------------------
//HELPER FUNCTIONS
//-----------------------------------------------------------------------------------

//RECURSIVE TREE GENERATION
function generateTree(position, level, parentAngle, parent) {
  var node = new TreeNode(position, level, parentAngle, parent);
  nodes.push(node);

  if (level > 0) {
    node.createChildren();
    for (var i = 0; i < numBranches; i++) {
      var child = node.children[i];
      generateTree(child.position, child.level, child.angle, node);
    }
  }
}

//RESPONSIVE
function handleResize() {
  width = window.innerWidth;
  height = window.innerHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
  renderer.render(scene, camera);
}


//ANIMATE AND RENDER
function animate() {
  requestAnimationFrame(animate);

  // Clear nodes and edges
  nodes = [];
  edges = [];

  // Generate tree with updated parameters
  generateTree(new THREE.Vector3(0, 0, 0), parameters.level, 0, null);

  renderer.render(scene, camera);
}
//-----------------------------------------------------------------------------------
// CLASS
//-----------------------------------------------------------------------------------
class TreeNode {
  constructor(position, level, parentAngle, parent) {
    this.position = position;
    this.level = level;
    this.parentAngle = parentAngle * (Math.PI / 180);
    this.parentDirection = new THREE.Vector3(0, 1, 0);
    this.parent = parent;
    this.children = [];

    //CREATE SHAPE FOR NODE
    var nodeGeometry = new THREE.SphereGeometry(0.07, 10, 10);
    var material = new THREE.MeshBasicMaterial({ color: 0x666666 });
    this.nodeMesh = new THREE.Mesh(nodeGeometry, material);
    this.nodeMesh.position.copy(this.position);

    

    //ADD NODE TO SCENE
    scene.add(this.nodeMesh);

    //CREATE AN EDGE (BRANCH) CONNECTING TO PARENT IF IT EXISTS
    if (parent) {
      var edge = new Edge(parent.position, this.position);
      this.edgeMesh = edge.mesh;
      scene.add(this.edgeMesh);
    }
  }

  createChildren() {
    for (var i = 0; i < numBranches; i++) {
      var childPosition = new THREE.Vector3().copy(this.position);

      var angleIncrement = (Math.PI * 2) / 10;
      var radialAngle = angleIncrement * i;

      childPosition.x += Math.cos(radialAngle) * 2;
      childPosition.y -= length;
      childPosition.z += Math.sin(radialAngle) * 2;

      var child = new TreeNode(childPosition, this.level - 1, radialAngle * (180 / Math.PI), this);

      this.children.push(child);
    }
  }
}

class Edge {
  constructor(start, end) {
    this.start = start;
    this.end = end;

    const direction = new THREE.Vector3().subVectors(end, start);
    const edgeLength = direction.length();
    const midpoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
    const quaternion = new THREE.Quaternion();
    quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.clone().normalize());

    const radius = 0.03; 
    const segments = 10;
    const cylinderGeometry = new THREE.CylinderGeometry(radius, radius, edgeLength, segments);
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
    this.mesh = new THREE.Mesh(cylinderGeometry, material);
    this.mesh.position.copy(midpoint);
    this.mesh.quaternion.copy(quaternion);
    scene.add(this.mesh);
  }
}

//-----------------------------------------------------------------------------------
// EXECUTE MAIN 
//-----------------------------------------------------------------------------------

main();
