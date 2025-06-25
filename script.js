//@ts-check


/**
 * @type {any}
 */

//@ts-ignore
window.settings = window.settings || { spawnDelay: 2000 };

//@ts-ignore
const THREE = AFRAME.THREE;



class Firework {
    constructor(position, LL = 2.5, PTL = 3, color = [1, 0.1, 0], tail = 15, launchVI = 35, burstVI = 20, particles = 100, BRI = 1, defaultDirection = { theta: Math.PI, phi: 0 }) {
        this.position = position.clone();
        this.LL = LL;
        this.PTL = PTL;
        this.elapsedTime = 0;
        this.state = "launch";
        this.particles = [];
        this.first = null;
        this.color = new THREE.Color(...color),
            this.tail = tail;

        this.launchVI = launchVI;
        this.burstVI = burstVI;
        this.burstRandVI = BRI;
        this.particleCount = particles

        this.defaultDirection = defaultDirection;
    }

    setupParticles(THREEscene) {
        const particleCount = this.particleCount;

        const { theta, phi } = this.defaultDirection;

        let a = new ParticleObj(THREEscene, this.launchVI, theta, phi, this.LL, this.position, this.color, this.tail);
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

    setSpawnPosition(pos) {
        // should run aftersteup particles, right before explod
        this.position = pos.clone();
        this.first?.updatePosition(pos);

        for (const p of this.particles) {
            p.updatePosition(pos);
        }
    }

    update(deltaSeconds) {
        this.elapsedTime += deltaSeconds;
        if (this.state === "launch") {

            //@ts-ignore
            this.first.update(deltaSeconds);



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

    dispose() {
        this.first?.dispose?.();

        for (const p of this.particles) {
            p.dispose?.();
        }
        this.particles = [];
    }


}

class Crossette {
    constructor(position, color = [1, 0.1, 0], launchVI = 30) {
        this.position = position.clone();

        this.color = color;
        this.smallFireworks = [];
        this.state = "launch";
        this.elapsedTime = 0;

        this.first = null;
        this.launchVI = launchVI;

        this.tail = 50;
        this.LL = 1.0;

        // chrys fireworks
        for (let i = 0; i < 5; i++) {
            const { theta, phi } = getRandomDirection();
            const smallFirework = new Firework(
                position,
                1.0,
                1.5,
                color,
                10, // tail
                20, // launchVI 
                20, // burstVI
                20, // particles
                1,
                { theta, phi }
            );
            this.smallFireworks.push(smallFirework);
        }
    }

    setupParticles(THREEscene) {
        let a = new ParticleObj(THREEscene, this.launchVI, Math.PI, 0, this.LL, this.position, this.color, this.tail);
        a.scale(3);
        a.setup();
        this.first = a;


        this.smallFireworks.forEach(fw => fw.setupParticles(THREEscene));
    }



    update(deltaSeconds) {
        this.elapsedTime += deltaSeconds;
        if (this.state === "launch") {

            //@ts-ignore
            this.first.update(deltaSeconds);


            if (this.elapsedTime >= this.LL) {
                this.state = "explode";
                this.first?.setOpacity(0);

                //@ts-ignore
                for (const p of this.first?.trailSprites) {
                    p.material.opacity = 0;
                }

                for (const f of this.smallFireworks) {

                    f.setSpawnPosition(this.first?.position);
                    console.log(f);

                }
            }

        } else if (this.state === "explode") {
            for (const f of this.smallFireworks) {
                f.update(deltaSeconds);
            }
        }
    }

    dispose() {
        this.first?.dispose?.();

        for (const f of this.smallFireworks) {
            f.dispose?.();
        }

        this.smallFireworks = [];
    }

}

function getRandomDirection() {
    // thx gpt
    const theta = Math.random() * 2 * Math.PI; // 0 to 2π
    const phi = Math.acos(2 * Math.random() - 1); // Correctly distribute points on sphere (0 to π)
    return { theta, phi };
}



/*
constructor(position, LL = 2.5, PTL = 3, color = [1, 0.1, 0], 

tail = 15, launchVI = 35, burstVI = 20, particles = 100, BRI = 1, defaultDirection = { theta: Math.PI, phi: 0 }) {
*/

class Peony extends Firework {
    constructor(position, color = [1, 0.2, 0.8], VI = 15) {
        super(position, 1.5, 1, color, 20, 40, VI, 200, 1);
        // launch vi then burst vi
    }
}

class Willow extends Firework {
    constructor(position, color = [1, 0.2, 0.8], VI = 10) {
        super(position, 2, 2.5, color, 200, 30, VI, 40, 8);
    }
}

class Chrysanthemum extends Firework {
    constructor(position, color = [1, 0.2, 0.8], VI = 20) {
        super(position, 2, 1.6, color, 40, 40, VI, 200, 1);
        // launch vi then burst vi
    }
}

class Spider extends Firework {
    constructor(position, color = [1, 0.2, 0.8], VI = 30) {
        super(position, 0.8, 1, color, 100, 40, VI, 60, 30);
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

        this.glow = new GlowParticle('assets/soft-circle.png', color); // [1, 0.1, 0]
        this.core = new GlowParticle('assets/core-circle.png', color);
        this.glow.setPosition(this.position);
        this.core.setPosition(this.position);

        this.glow.setOpacity(0);
        this.core.setOpacity(0);

        // 
    }

    setDirectionFromSpherical(speed, theta, phi) {
        this.speed = speed;
        this.theta = theta;
        this.phi = phi;
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

        this.fadehelper();
        this.lifetime -= deltaSeconds;

    }

    fadehelper() {
        const t = 1 - (this.lifetime / this.particleLifetime);
        const baseOpacity = (1 - t);
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

    dispose() {
        // Remove and dispose glow + core
        if (this.glow?.sprite) {
            this.scene.remove(this.glow.sprite);
            this.glow.dispose();
        }
        if (this.core?.sprite) {
            this.scene.remove(this.core.sprite);
            this.core.dispose();
        }

        // Remove and dispose trail sprites
        for (const sprite of this.trailSprites) {
            this.scene.remove(sprite);
            if (sprite.material.map) sprite.material.map.dispose();
            sprite.material.dispose();
        }

        this.trailSprites = [];
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

    dispose() {
        if (this.sprite?.material.map) {
            this.sprite.material.map.dispose();
        }
        this.sprite.material.dispose();
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

function merica() {
  const baseColors = {
    red:    [0.8, 0.1, 0.1],
    orange:    [0.8, 0.4, 0.1],
    white:  [0.8, 0.8, 0.8],
    blue:   [0.1, 0.1, 0.8],
    yellow: [0.8, 0.6, 0.1],
    lightblue: [0.3, 0.3, 0.7],
  };

  const keys = Object.keys(baseColors);
  const choice = keys[Math.floor(Math.random() * keys.length)];
  const base = baseColors[choice];

  return base.map(c => c * (0.7 + Math.random() * 0.3));
}

function newyear() {
  const baseColors = {
    gold:   [1, 0.84, 0],   
    silver: [0.75, 0.75, 0.75], 
    red:    [0.8, 0.2, 0.2],
    red_again:  [0.6, 0.1, 0.1],
    
    orange:    [0.8, 0.4, 0.1],
    white:  [0.8, 0.8, 0.8],
    yellow: [0.7, 0.6, 0.1],
    blue:   [0.1 , 0.1, 0.6],
    pink: [0.984, 0.776, 0.812],

    lightGold:[1, 0.9, 0.4],
  };

  const keys = Object.keys(baseColors);
  const choice = keys[Math.floor(Math.random() * keys.length)];
  const base = baseColors[choice];

  return base.map(c => c * (0.7 + Math.random() * 0.3));
}

//@ts-ignore
// fixed
AFRAME.registerComponent('particle-animation', {
    schema: {
        maxActive: { type: 'int', default: 8 }
    },

    init: function () {
        this.fireworks = [];
        this.startTimes = [];
        this.elapsed = 0;
        this.nextSpawnTime = 0;

        this.basePosition = new THREE.Vector3(-50, 0, -70);
    },

    tick: function (time, delta) {
        const deltaSeconds = delta / 1000;
        this.elapsed += delta;


        if (this.elapsed >= this.nextSpawnTime) {
            this.spawnFirework();

            //@ts-ignore
            this.nextSpawnTime = this.elapsed + Math.floor(Math.random() * 500 + window.settings["spawnDelay"]);
        }

        // update all fireworks
        for (let i = 0; i < this.fireworks.length; i++) {
            let f = this.fireworks[i];
            f.update(deltaSeconds);


            // dispose if its over

            if (f.elapsedTime > f.LL + f.PTL) {
                f.dispose();
                this.fireworks.splice(i, 1);
                this.startTimes.splice(i, 1);
                // delete
            }
        }

        // hard delete
        while (this.fireworks.length > this.data.maxActive) {
            const removed = this.fireworks.shift();
            removed.dispose?.(); // clean up materials and geometry!!
            this.startTimes.shift();
        }
    },

    spawnFirework: function () {
        const position = new THREE.Vector3(
            this.basePosition.x + Math.random() * 100,
            this.basePosition.y,
            this.basePosition.z - Math.random() * 25
        );


        let color;
        //@ts-ignore
        switch (window.settings["theme"]) {
            case "July4": color = merica(); break;
            case "New year": color = newyear(); break;

            default: color = brightcolor();
        }


        let FireworkClass;

        //@ts-ignore
        switch (window.settings["fireworkType"]) {
            case "Peony": FireworkClass = Peony; break;
            case "Willow": FireworkClass = Willow; break;
            case "Chrysanthemum": FireworkClass = Chrysanthemum; break;
            case "Spider": FireworkClass = Spider; break;
            case "Crossette": FireworkClass = Crossette; break;

            default:
                const fireworkClasses = [Willow, Chrysanthemum, Spider, Peony, Crossette, Crossette];
                FireworkClass = fireworkClasses[Math.floor(Math.random() * fireworkClasses.length)];
        }

        const firework = new FireworkClass(position, color);
        firework.setupParticles(this.el.sceneEl.object3D);

        this.fireworks.push(firework);
        this.startTimes.push(this.elapsed);
    },

    dispose: function () {

        this.first.dispose();
        for (const p of this.particles) {
            p.dispose();
        }
        this.particles = [];
    }
});
