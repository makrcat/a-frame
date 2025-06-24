//@ts-check

//@ts-ignore
AFRAME.registerComponent('extended-wasd-controls', {
    schema: {
        acceleration: { type: 'number', default: 65 },
        fly: { type: 'boolean', default: true }
    },
    init: function () {
        this.keys = {};
        this.speed = 0.2;


        this.onKeyDown = this.keydown.bind(this);
        this.onKeyUp = this.keyup.bind(this);


        window.addEventListener('keydown', this.onKeyDown);
        window.addEventListener('keyup', this.onKeyUp);
    },
    remove: function () {
        window.removeEventListener('keydown', this.onKeyDown);
        window.removeEventListener('keyup', this.onKeyUp);
    },
    tick: function (t) {
        const data = this.data;
        const el = this.el;
        const position = el.getAttribute('position');
        const moveSpeed = this.speed * (data.acceleration / 60);

        if (this.keys['Digit3'] || this.keys['PageUp']) {
            position.y += moveSpeed;
        }
        if (this.keys['KeyZ'] || this.keys['PageDown']) {
            position.y -= moveSpeed;
        }
        el.setAttribute('position', position);
    },
    keydown: function (evt) {
        this.keys[evt.code] = true;
    },
    keyup: function (evt) {
        this.keys[evt.code] = false;
    }
});
