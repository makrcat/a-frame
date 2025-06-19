import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';


//@ts-check

const LFTIME = 300;
const sceneEl = document.querySelector('a-scene');
const scene = sceneEl.object3D;

/*
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 25;
camera.position.set(0, 1, 25);
camera.lookAt(0, 0, 0);


const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; 


// Directional light
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(0, 20, 10);
light.castShadow = true;
light.shadow.mapSize.width = 1024;
light.shadow.mapSize.height = 1024;
light.shadow.camera.near = 0.5;
light.shadow.camera.far = 50;
light.shadow.camera.left = -25;
light.shadow.camera.right = 25;
light.shadow.camera.top = 25;
light.shadow.camera.bottom = -25;


const plane = new THREE.Mesh(
  new THREE.PlaneGeometry(200, 200),
  new THREE.MeshStandardMaterial({ color: 0x696969, side: THREE.DoubleSide })
);

plane.rotation.x = -Math.PI / 2;

plane.receiveShadow = true;
scene.add(plane);


const controls = new PointerLockControls(camera, document.body);
scene.add(controls.getObject());

document.addEventListener('click', () => {
    controls.lock();
});


const keys = {};
document.addEventListener('keydown', e => keys[e.code] = true);
document.addEventListener('keyup', e => keys[e.code] = false);


// aframe should have defaults
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
const speed = 5;


const particleCount = 300;
const particlesGeometry = new THREE.BufferGeometry();
const particlePositions = new Float32Array(particleCount * 3);

// --- cube ---
const geometry = new THREE.BoxGeometry(5, 5, 5);
const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });


const cube = new THREE.Mesh(geometry, material);
cube.position.y = 2.5;
cube.castShadow = true; 
scene.add(cube);

// ------
*/

const particleVelocities = [];
const particleColors = new Float32Array(particleCount * 3); // RGB per particle

for (let i = 0; i < particleCount; i++) {
    particlePositions[i * 3] = 0;
    particlePositions[i * 3 + 1] = 0;
    particlePositions[i * 3 + 2] = 0;

    const speed = Math.random() * 1.5 + 1.0;
    const theta = Math.random() * 2 * Math.PI;
    const phi = Math.random() * Math.PI;

    particleColors[i * 3] = 1.0;
    particleColors[i * 3 + 1] = 0.1;
    particleColors[i * 3 + 2] = 0.0;

    const vx = speed * Math.sin(phi) * Math.cos(theta);
    const vy = speed * Math.cos(phi);
    const vz = speed * Math.sin(phi) * Math.sin(theta);

    particleVelocities.push(new THREE.Vector3(vx, vy, vz));
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
particlesGeometry.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

const particlesMaterial = new THREE.PointsMaterial({
    size: 3,
    vertexColors: true,
});

const particles = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particles);

const lifetimes = new Array(particleCount).fill(LFTIME);


AFRAME.registerComponent('particle-animation', {
  schema: {},

  init: function () {
    const particleCount = 300;
    const LFTIME = 300;

    // Create particle geometry
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const velocities = [];
    const lifetimes = new Array(particleCount).fill(LFTIME);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = 0;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = 0;

      const speed = Math.random() * 1.5 + 1.0;
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.random() * Math.PI;

      colors[i * 3] = 1.0;
      colors[i * 3 + 1] = 0.1;
      colors[i * 3 + 2] = 0.0;

      const vx = speed * Math.sin(phi) * Math.cos(theta);
      const vy = speed * Math.cos(phi);
      const vz = speed * Math.sin(phi) * Math.sin(theta);

      velocities.push(new THREE.Vector3(vx, vy, vz));
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 3,
      vertexColors: true,
    });

    const particles = new THREE.Points(geometry, material);
    this.el.object3D.add(particles);

    // Store data for access in tick()
    this.particles = particles;
    this.velocities = velocities;
    this.lifetimes = lifetimes;
    this.LFTIME = LFTIME;
  },

  tick: function () {
    const positions = this.particles.geometry.attributes.position.array;
    const colors = this.particles.geometry.attributes.color.array;

    for (let i = 0; i < this.lifetimes.length; i++) {
      if (this.lifetimes[i] > 0) {
        positions[i * 3] += this.velocities[i].x;
        positions[i * 3 + 1] += this.velocities[i].y;
        positions[i * 3 + 2] += this.velocities[i].z;

        this.velocities[i].y -= 0.02;
        this.lifetimes[i]--;

        const t = 1 - this.lifetimes[i] / this.LFTIME;

        colors[i * 3] = (1 - t) * 1.0;
        colors[i * 3 + 1] = (1 - t) * 0.1;
        colors[i * 3 + 2] = 0;
      }
    }

    this.particles.geometry.attributes.position.needsUpdate = true;
    this.particles.geometry.attributes.color.needsUpdate = true;
  }
});