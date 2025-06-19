//@ts-check

//@ts-ignore it's gonna complain about aframe but yeah
const THREE = AFRAME.THREE;

//@ts-ignore
AFRAME.registerComponent('particle-animation', {
    schema: {},

    init: function () {
        const particleCount = 200;
        const LFTIME = 300;

        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const velocities = [];
        const lifetimes = new Array(particleCount).fill(LFTIME);

        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = 0;
            positions[i * 3 + 1] = 0;
            positions[i * 3 + 2] = 0;

            const speed = Math.random() * 1.5 + 5.0;
            const theta = Math.random() * 2 * Math.PI;

            // const speed = Math.random() * 4 + 2;
            // speed from 2 to 6, bigger
            const phi = Math.random() * (Math.PI / 4);
            // narrower vertical spread (0 to 45°) for more upward shots

            const vx = speed * Math.sin(phi) * Math.cos(theta);
            const vy = speed * Math.cos(phi) + 10;
            const vz = speed * Math.sin(phi) * Math.sin(theta);

            velocities.push(new THREE.Vector3(vx, vy, vz));
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 0.2,
            vertexColors: true,
        });

        const particles = new THREE.Points(geometry, material);
        this.el.object3D.add(particles);

        this.particles = particles;
        this.velocities = velocities;
        this.lifetimes = lifetimes;
        this.LFTIME = LFTIME;
    },

    tick: function (time, delta) {
        const deltaSeconds = delta / 1000;

        const positions = this.particles.geometry.attributes.position.array;
        const colors = this.particles.geometry.attributes.color.array;

        for (let i = 0; i < this.lifetimes.length; i++) {
            if (this.lifetimes[i] > 0) {
                positions[i * 3] += this.velocities[i].x * deltaSeconds;
                positions[i * 3 + 1] += this.velocities[i].y * deltaSeconds;
                positions[i * 3 + 2] += this.velocities[i].z * deltaSeconds;

                this.velocities[i].y += -9.8 * deltaSeconds; // gravity m/s²

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