//@ts-check

//@ts-ignore
const THREE = AFRAME.THREE;

class Firework {
    constructor(position) {
        this.position = position.clone();
        this.LL = 2;
        this.PTL = 3;
        this.elapsedTime = 0;
        this.state = "launch";
        this.particles = [];
        this.first = null;
    }

    setupParticles(THREEscene) {
        const particleCount = 100;

        let a = new ParticleObj(20, Math.PI, 0, this.PTL, this.position);
        a.scale(6);
        a.setup(THREEscene);
        this.first = a;

        for (let i = 0; i < particleCount; i++) {

            const speed = Math.random() * 2 + 15;
            const theta = Math.random() * 2 * Math.PI;
            const phi = Math.random() * (Math.PI / 4);

            let aaa = new ParticleObj(speed, theta, phi, this.PTL, this.position);
            aaa.setup(THREEscene);

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

class ParticleObj {
    constructor(speed, theta, phi, lifetime, position) {

        this.speed = speed;
        this.theta = theta;
        this.phi = phi;
        this.lifetime = lifetime;
        this.particleLifetime = lifetime;
        this.position = position.clone();

        this.velocity = new THREE.Vector3(
            speed * Math.sin(phi) * Math.cos(theta),
            speed * Math.cos(phi) + 10,
            speed * Math.sin(phi) * Math.sin(theta)
        );

        this.glow = new GlowParticle('soft-circle.png', [1, 0.1, 0]);
        this.core = new GlowParticle('core-circle.png', [1, 0.1, 0]);
        this.glow.setPosition(this.position);
        this.core.setPosition(this.position);
        // 
    }

    setup(THREEscene) {
        this.glow.addTo(THREEscene);
        this.core.addTo(THREEscene);

    }

    updatePosition(pos) {
        this.position = pos.clone();
        this.glow.setPosition(this.position);
        this.core.setPosition(this.position);
    }

    update(deltaSeconds) {

        this.velocity.y -= 9.8 * deltaSeconds;

        this.position.addScaledVector(this.velocity, deltaSeconds);
        this.glow.setPosition(this.position);
        this.core.setPosition(this.position);

        this.fadehelper(deltaSeconds);

        this.lifetime -= deltaSeconds;
    }

    fadehelper(deltaSeconds) {
        const t = 1 - (this.lifetime / this.particleLifetime);
        const opacity = 1 - t;
        const scale = (1 - t) * 1.5;

        this.glow.setOpacity(opacity * 0.5);
        this.glow.setScale(scale);

        this.core.setOpacity(opacity * 0.6);
        this.core.setScale(scale * 0.4);
    }

    scale(n) {
        this.glow.setScale(n);
        this.core.setScale(n);
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
        this.firework = new Firework(new THREE.Vector3(0, 2, -3));
        this.firework.setupParticles(this.el.sceneEl.object3D);
    },

    tick: function (time, delta) {
        const deltaSeconds = delta / 1000;
        this.firework.update(deltaSeconds);
    }


});
