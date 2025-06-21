//@ts-check

//@ts-ignore
const THREE = AFRAME.THREE;



class Firework {
    constructor(position, LL = 2.5, PTL = 3, color = [1, 0.1, 0], tail = 15, launchVI = 35, burstVI = 20, particles = 100, BRI = 1) {
        this.position = position.clone();
        this.LL = LL;
        this.PTL = PTL;
        this.elapsedTime = 0;
        this.state = "launch";
        this.particles = [];
        this.first = null;
        this.color =new THREE.Color(...color),
        this.tail = tail;
        this.launchVI = launchVI;
        this.burstVI = burstVI;
        this.burstRandVI = BRI;
        this.particleCount = particles
    }

    setupParticles(THREEscene) {
        const particleCount = this.particleCount;

        let a = new ParticleObj(THREEscene, this.launchVI, Math.PI, 0, this.LL, this.position, this.color, this.tail);
        a.scale(3);
        a.setup();
        this.first = a;

        for (let i = 0; i < particleCount; i++) {

            const speed = Math.random() * this.burstRandVI + this.burstVI;
            const theta = Math.random() * 2 * Math.PI
            const phi = Math.random() * (Math.PI);

            let aaa = new ParticleObj(THREEscene, speed, theta, phi, this.PTL, this.position, this.color, this.tail);
            aaa.setup();

            this.particles.push(aaa);

        }
    }

    update(deltaSeconds) {
        if (this.state === "launch") {

            //@ts-ignore
            this.first.update(deltaSeconds);

            this.elapsedTime += deltaSeconds;

            if (this.elapsedTime >= this.LL) {
                this.state = "explode";
                this.first?.setOpacity(0);

                //@ts-ignore
                for (const p of this.first?.trailSprites) {
                    p.material.opacity = 0;
                }

                for (const p of this.particles) {
                    //@ts-ignore
                    p.updatePosition(this.first?.glow.position);
                }
            }

        } else if (this.state === "explode") {
            for (const p of this.particles) {
                p.update(deltaSeconds);
            }
        }
    }

}

class Peony extends Firework {
    constructor(position, color = [1, 0.2, 0.8], VI = 15) {
        super(position, 1.5, 1, color, 5, 60, VI, 200, 1);
        // launch vi then burst vi
    }
}

class Willow extends Firework {
    constructor(position, color = [1, 0.2, 0.8] , VI = 10) {
        super(position, 2, 1.5, color, 200, 60, VI, 40, 8);
    }
}

class Chrysanthemum extends Firework {
    constructor(position, color = [1, 0.2, 0.8], VI = 20) {
        super(position, 2, 1.3, color, 25, 60, VI, 200, 1);
        // launch vi then burst vi
    }
}

class Spider extends Firework {
    constructor(position, color = [1, 0.2, 0.8], VI = 70) {
        super(position, 0.5, 0.3, color, 100, 170, VI, 60, 30);
        // launch vi then burst vi
    }
}


class ParticleObj {
    constructor(scene, speed, theta, phi, lifetime, position, color = [1, 0.1, 0], tail = 20) {

        this.scene = scene;
        this.speed = speed;
        this.theta = theta;
        this.phi = phi;
        this.lifetime = lifetime;
        this.particleLifetime = lifetime;

        this.position = position.clone();

        this.trailPoints = [];
        this.trailSprites = [];
        this.color = color;
        this.tailLength = tail;


        this.velocity = new THREE.Vector3(
            speed * Math.sin(phi) * Math.cos(theta),
            speed * Math.cos(phi) + 10,
            speed * Math.sin(phi) * Math.sin(theta)
        );

        this.glow = new GlowParticle('soft-circle.png', color); // [1, 0.1, 0]
        this.core = new GlowParticle('core-circle.png', color);
        this.glow.setPosition(this.position);
        this.core.setPosition(this.position);

        this.glow.setOpacity(0);
        this.core.setOpacity(0);

        // 
    }

    setup() {
        this.glow.addTo(this.scene);
        this.core.addTo(this.scene);
    }

    updatePosition(pos) {
        this.position = pos.clone();
        this.glow.setPosition(this.position);
        this.core.setPosition(this.position);
    }

    update(deltaSeconds) {

        this.velocity.y += -18.8 * deltaSeconds;
        this.position.addScaledVector(this.velocity, deltaSeconds);

        //
        this.trailPoints.push(this.position.clone());

        if (this.trailPoints.length > this.tailLength) {
            this.trailPoints.shift();
        }

        for (let i = 0; i < this.trailPoints.length; i++) {
            let sprite = this.trailSprites[i];

            if (!sprite) {
                const material = new THREE.SpriteMaterial({
                    map: new THREE.TextureLoader().load('soft-circle.png'),
                    color: this.color,
                    transparent: true,
                    
                    blending: THREE.AdditiveBlending,
                    
                    // blending: THREE.NormalBlending,
                    depthWrite: false
                });
                sprite = new THREE.Sprite(material);
                this.scene.add(sprite);
                this.trailSprites[i] = sprite;
            }

            sprite.position.copy(this.trailPoints[i]);
        }
        ///

        this.glow.setPosition(this.position);
        this.core.setPosition(this.position);

        this.fadehelper(deltaSeconds);

        //

        this.lifetime -= deltaSeconds;

    }

    fadehelper(deltaSeconds) {
        const t = 1 - (this.lifetime / this.particleLifetime);
        //const baseOpacity = (1 - t);
        const baseOpacity = 1 - Math.pow(1 - t, 2); // ok so when it is 1.5 it breaks idk
        const flickerFactor = t > 0.4 ? (Math.random() * 0.6 + 0.4) : (Math.random() * 0.3 + 0.7);
        const opacity = baseOpacity * flickerFactor;

        const eased = t * t;
        const scale = (1 - eased) * flickerFactor;


        this.glow.setOpacity(opacity);
        //this.glow.setScale(scale);

        this.core.setOpacity(opacity);
        this.core.setScale(scale);


        ////

        if (this.trailSprites) {
            const len = this.trailSprites.length;
            for (let i = 0; i < this.trailSprites.length; i++) {
                const n = 1 - i / len;

                this.trailSprites[len - 1 - i].material.opacity = 
                Math.max(0, (baseOpacity - 0.3) * n);

                const baseScale = 0.6;
                this.trailSprites[len - 1 - i].scale.set(baseScale * n, baseScale * n, 1);
            }
        }

        while (this.trailSprites.length > this.trailPoints.length) {
            let sprite = this.trailSprites.pop();
            this.scene.remove(sprite);
            sprite.material.map.dispose();
            sprite.material.dispose();
        }

    }

    scale(n) {
        this.glow.setScale(n);
        this.core.setScale(n);
    }

    setOpacity(n) {
        this.glow.setOpacity(n);
        this.core.setOpacity(n);
    }
}

// glasses
class GlowParticle {
    constructor(textureUrl, color, size = 1) {
        const map = new THREE.TextureLoader().load(textureUrl);
        const material = new THREE.SpriteMaterial({
            map,
            color: new THREE.Color(...color),
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        });
        this.sprite = new THREE.Sprite(material);
        this.sprite.scale.set(size, size, size);
    }

    addTo(scene) {
        scene.add(this.sprite);
    }

    setPosition(pos) {
        this.sprite.position.copy(pos);
    }

    setOpacity(alpha) {
        this.sprite.material.opacity = alpha;
    }

    setScale(scale) {
        this.sprite.scale.set(scale, scale, scale);
    }

    get position() {
        return this.sprite.position;
    }
}

function brightcolor() {
    const c = [Math.random(), Math.random(), Math.random()];
    const max = Math.max(...c);
    return c.map(v => v / max);
}


// A-FRAME
// @ts-ignore typescript pllease stop
AFRAME.registerComponent('particle-animation', {
    schema: {
        count: { type: 'int', default: 5 },
        staggerTime: { type: 'number', default: 5000 }
    },

    init: function () {
        this.fireworks = [];
        this.startTimes = [];

        const basePosition = new THREE.Vector3(100, 0, 0);

        for (let i = 0; i < this.data.count; i++) {
            const position = new THREE.Vector3(
                basePosition.x + (Math.random()) * 50,
                basePosition.y,
                basePosition.z + (Math.random()) * 100,
            );
            const color = brightcolor();

           // const firework = new Willow(position, color);
            const firework = new Chrysanthemum(position, color);
            //const firework = new Spider(position, color);


            firework.setupParticles(this.el.sceneEl.object3D);
            this.fireworks.push(firework);

            // Record when each firework is allowed to start (staggered)
            this.startTimes.push(i * this.data.staggerTime);
        }

        this.elapsed = 0;
    },

    tick: function (time, delta) {
        const deltaSeconds = delta / 2000;
        this.elapsed += delta;

        // Update fireworks in reverse order so we can safely remove finished ones
        for (let i = this.fireworks.length - 1; i >= 0; i--) {
            if (this.elapsed >= this.startTimes[i]) {
                const done = this.fireworks[i].update(deltaSeconds);
                if (done) {
                    // If firework signals it's done, remove it and its startTime
                    this.fireworks.splice(i, 1);
                    this.startTimes.splice(i, 1);
                }
            }
        }
    }
});



// @ts-ignore
AFRAME.registerGeometry('custom-geometry', {
    init: function () {
        const geometry = new THREE.BufferGeometry();

        const vertices = new Float32Array([
            -1, 0, 1,
            1, 0, 1,
            1, 0, -1,
            -1, 0, -1,
            0, 1, 0
        ]);

        const indices = [
            0, 1, 4,  // front face
            1, 2, 4,  // right face
            2, 3, 4,  // back face
            3, 0, 4,  // left face
            0, 3, 2,  // bottom face triangle 1
            0, 2, 1   // bottom face triangle 2
        ];

        const uvs = new Float32Array([
            0, 0,
            1, 0,
            1, 1,
            0, 1,
            0.5, 1
        ]);

        geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
        geometry.setIndex(indices);
        geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
        geometry.computeVertexNormals();

        this.geometry = geometry;

        // Set attributes and indices
        geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
        geometry.setIndex(indices);

        // Calculate normals for lighting
        geometry.computeVertexNormals();

        this.geometry = geometry;
    }
});
