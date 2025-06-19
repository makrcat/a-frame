//@ts-check

//@ts-ignore
const THREE = AFRAME.THREE;



class Firework {
    constructor(position, LL = 2.5, PTL = 3, color=[1, 0.1, 0], tail=15, launchVI = 35, burstVI = 20, BRI = 1) {
        this.position = position.clone();
        this.LL = 2.5;
        this.PTL = 3;
        this.elapsedTime = 0;
        this.state = "launch";
        this.particles = [];
        this.first = null;
        this.color = color;
        this.tail = tail;
        this.launchVI = launchVI;
        this.burstVI = burstVI;
        this.burstRandVI = BRI;
    }

    setupParticles(THREEscene) {
        const particleCount = 300;

        let a = new ParticleObj(THREEscene, this.launchVI, Math.PI, 0, this.PTL, this.position, this.color, this.tail);
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
    constructor(position, VI= 25) {
        super(position, 2.5, 3, [1, 0.2, 0.8], 5, 40, VI, 1);
    }
}

class ParticleObj {
    constructor(scene, speed, theta, phi, lifetime, position, color=[1, 0.1, 0], tail=20) {

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

        this.velocity.y -= 9.8 * deltaSeconds;
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
                    /*
                    blending: THREE.AdditiveBlending,
                    */
                   blending: THREE.NormalBlending,
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
        const baseOpacity = 1 - t;
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

                this.trailSprites[len - 1 - i].material.opacity = opacity * n;

                const baseScale = 0.6
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

// A-FRAME
// @ts-ignore typescript pllease stop
AFRAME.registerComponent('particle-animation', {
    schema: {},

    init: function () {
        this.firework = new Peony(new THREE.Vector3(0, 2, 0), 20);

        this.firework.setupParticles(this.el.sceneEl.object3D);
    },

    tick: function (time, delta) {
        const deltaSeconds = delta / 1000;
        this.firework.update(deltaSeconds);
    }


});
