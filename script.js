import * as THREE from 'three';

//@ts-check

const LFTIME = 300;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 100;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const particleCount = 300;
const particlesGeometry = new THREE.BufferGeometry();
const positions = new Float32Array(particleCount * 3);

const velocities = [];
const colors = new Float32Array(particleCount * 3); // RGB per particle

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

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

const particlesMaterial = new THREE.PointsMaterial({
    size: 3,
    vertexColors: true, 
});

const particles = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particles);

const lifetimes = new Array(particleCount).fill(LFTIME);

function animate() {
    requestAnimationFrame(animate);

    const positions = particles.geometry.attributes.position.array;

    for (let i = 0; i < particleCount; i++) {
        if (lifetimes[i] > 0 ) {
            positions[i * 3] += velocities[i].x;
            positions[i * 3 + 1] += velocities[i].y;
            positions[i * 3 + 2] += velocities[i].z;

            velocities[i].y -= 0.02;
            lifetimes[i]--;

            const t = 1 - lifetimes[i] / LFTIME; // 0 at start, 1 at end

            colors[i * 3] =  (1 - t) * 1.0;
            colors[i * 3 + 1] = (1 - t) * 0.1;
            colors[i * 3 + 2] = 0; 

        }
    }

    particles.geometry.attributes.position.needsUpdate = true;
    particles.geometry.attributes.color.needsUpdate = true;
    renderer.render(scene, camera);
}

animate();
