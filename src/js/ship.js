import { Sprite, keyPressed } from 'kontra';
import * as util from './utility';
import getKeys from './controls';
import ships from './ships/import.js';

export class Ship extends Sprite.class {

    constructor(props) {
        super(props);

        // Default properties for all ships
        this.turnRate = 4;
        this.locationHistory = [];
        this.maxSpeed = 3;
        this.rewindSpeed = 5; // E.g. rewind time 5* faster than realtime
        this.rewinding = 0;
        this.fireDt = 0;
        this.rof = .25; // 4x a second
        this.scale = 2;
        this.mass = 4;
        this.thrust = 4;

        // Assign props from the ship type file e.g. 'diamondback', AND
        // overwrite with any weird props that were passed into new Ship(...)
        Object.assign(this, ships[props.shipType || 'tri'], props);

        this.lines.ship = [];
        this.lines.random = [];
        this.lines.detail = this.lines.detail || [];
        this.lines.all = [];

        // Set control scheme
        if (this.controls) {
            this.keys = getKeys(this.controls);
        }

        Object.keys(this.lines).forEach(lineType => {
            if (lineType === 'body' || lineType === 'detail') {
                this.lines[lineType].forEach(line => {
                    line.forEach((point, i) => {
                        line[i] *= 2;
                    });
                    this.lines.ship.push(line);
                });
            }
        });
    }

    fire(sprites) {

        // Can't shoot if rewinding
        if (this.rewinding) {
            return false;
        }

        const cos = Math.cos(util.degToRad(this.rotation));
        const sin = Math.sin(util.degToRad(this.rotation));

        this.fireDt = 0;

        // Knockback (hass less effect for ships with greater mass)
        this.dx -= cos / this.mass;
        this.dy -= sin / this.mass;

        let bullet = Sprite({
            type: 'bullet',

            // Start at tip of the triangle (To understand: magic no.)
            x: this.x + cos * 12,
            y: this.y + sin * 12,

            // Move bullet #x faster than the ship
            dx: this.dx + cos * 12,
            dy: this.dy + sin * 12,

            // live 60 frames (1s)
            ttl: 60,

            width: 4,
            height: 4,
            color: this.color
        });

        sprites.push(bullet);
    }

    render() {
        this.context.save();

        // Rotate
        this.context.translate(this.x, this.y);
        this.context.rotate(util.degToRad(this.rotation));

        // Draw
        this.context.strokeStyle = this.color;
        this.context.lineWidth = 2;
        this.context.beginPath();

        // Draw circle around ship for debugging
        // this.context.beginPath();  // start drawing a shape
        // this.context.arc(0, 0, this.radius * this.scale + 3, 0, Math.PI * 2);
        // this.context.stroke();

        if (this.rewinding) {
            this.rewindingFrame = this.rewindingFrame || 1;
            if (this.rewindingFrame === 1) {
                this.lines.random = [];
                this.lines.ship.forEach(line => {
                    this.lines.random.push([
                        line[0] * Math.random() * 2,
                        line[1] * Math.random() * 2,
                        line[2] * Math.random() * 2,
                        line[3] * Math.random() * 2
                    ]);
                });
            }
            if (this.rewindingFrame < 4) {
                this.rewindingFrame++;
            } else {
                this.rewindingFrame = 1;
            }

            this.lines.random.forEach(line => {
                this.context.moveTo(line[0], line[1]);
                this.context.lineTo(line[2], line[3]);
            });

        } else {
            this.context.beginPath();
            this.context.moveTo(
                this.lines.body[0][0],
                this.lines.body[0][1]
            );
            for (var i = 0; i < this.lines.body.length - 1; i++) {
                this.context.lineTo(
                    this.lines.body[i][2],
                    this.lines.body[i][3]
                );
            }
            this.context.closePath();

            this.lines.detail.forEach(line => {
                this.context.moveTo(line[0], line[1]);
                this.context.lineTo(line[2], line[3]);
            });
        }

        this.context.stroke();
        this.context.restore();
    }

    shipUpdate(sprites) {

        // Go back in time
        if (!this.rewinding && keyPressed(this.keys.rewind)) {
            this.rewinding = this.locationHistory.length;
        }

        this.fireDt += 1 / 60;

        if (keyPressed(this.keys.left)) {
            this.rotation -= this.turnRate;
        }
        if (keyPressed(this.keys.right)) {
            this.rotation += this.turnRate;
        }

        if (this.rewinding > 0) {
            this.rewinding = this.rewinding - this.rewindSpeed;

            // If something borked (can't go back that far?) cancel rewind
            if (!this.locationHistory[this.rewinding]) {
                this.rewinding = 0;
                return;
            }

            // More x and y coordinates "back in time"
            if (this.rewinding < this.locationHistory.length) {
                this.x = this.locationHistory[this.rewinding].x;
                this.y = this.locationHistory[this.rewinding].y;
            }

            // Last rewind update, lose 20% velocity
            if (this.rewinding === 0) {
                this.dx *= .8;
                this.dy *= .8;
            }

            return; // Don't do any other ship updating this game update
        }


        const cos = Math.cos(util.degToRad(this.rotation));
        const sin = Math.sin(util.degToRad(this.rotation));

        // Moving forward
        if (keyPressed(this.keys.thrust)) {
            // a = F / m (Newton's 2nd law of motion)
            this.ddx = cos * .1 * this.thrust / this.mass;
            this.ddy = sin * .1 * this.thrust / this.mass;
        } else {
            this.ddx = this.ddy = 0;
        }

        // Call the original update func
        // This does (non-rewindy) position, velocity, & TTL
        this.advance();

        // Record current location into locations history
        this.locationHistory.push({ x: this.x, y: this.y});
        // Remove last update location from location history
        if (this.locationHistory.length > 90) {
            this.locationHistory.shift();
        }

        // Cap speed
        const magnitude = Math.sqrt(this.dx * this.dx + this.dy * this.dy);
        if (magnitude > this.maxSpeed) {
            this.dx *= .95;
            this.dy *= .95;
        } else {
            if (Math.abs(this.dx) > .01) {
                this.dx *= .99;
            }
            if (Math.abs(this.dy) > .01) {
                this.dy *= .99;
            }
        }

        if (keyPressed(this.keys.fire) && this.fireDt > this.rof) {
            this.fire(sprites);
        }
    }
}