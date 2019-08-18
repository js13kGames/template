import { Sprite, keyPressed } from 'kontra';
import * as util from './utility';
import getKeys from './controls';
import ships from './ships/import.js';

export class Ship extends Sprite.class {

    constructor(props) {
        super(props);

        // Default properties for all ships
        this.type = 'ship';
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
        this.cs = props.collisionSystem;

        // Assign props from the ship type file e.g. 'diamondback', AND
        // overwrite with any weird props that were passed into new Ship(...)
        Object.assign(this, ships[props.shipType || 'tri'], props);

        this.lines.random = [];
        this.lines.body = this.lines.body || [];
        this.lines.detail = this.lines.detail || [];
        this.lines.thrust = this.lines.thrust || [];

        // Set control scheme
        if (this.controls) {
            this.keys = getKeys(this.controls);
        }

        Object.keys(this.lines).forEach(lineType => {
            // Scale all the lines (except ship as that would * scale * scale)
            this.lines[lineType].forEach((line, i) => {
                line.forEach((v, i) => { line[i] *= this.scale });
            });
        });

        // Merge body & detail into 'ship' line array for doing fun effects etc
        this.lines.ship = this.lines.body.concat(this.lines.detail);

        // If the ship doesn't have a collision box defined, use it's body
        // Assumes that the body is a consecutive set of lines
        // (e.g. line end coords match the following lines start coords)
        if (!this.lines.hitbox) {
            this.lines.hitbox = [];
            this.lines.body.forEach(line => {
                this.lines.hitbox.push([line[0], line[1]]);
            });
        }

        this.hitbox = props.collisionSystem.createPolygon(
            this.x,
            this.y,
            this.lines.hitbox
        );
        this.hitbox.scale = this.scale;
        this.hitbox.owner = this;
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
            name: 'bullet',
            type: 'bullet',
            parent: this,

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
            color: this.color,
            hitbox: this.cs.createPoint(this.x, this.y),

            update() {
                this.advance();
                this.hitbox.x = this.x;
                this.hitbox.y = this.y;
            }
        });

        bullet.hitbox.owner = bullet;
        bullet.owner = this;

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

            if (this.ddx || this.ddy) {
                this.lines.thrust.forEach((line, i) => {
                    // If x,y of 1st point of new line match 2nd point of prev
                    if (i > 0 &&
                        this.lines.thrust[i - 1][2] === line[0] &&
                        this.lines.thrust[i - 1][3] === line[1]) {
                        // Draw line connected to previous
                        this.context.lineTo(line[2], line[3]);
                    } else {
                        // Draw line NOT connect to previous
                        this.context.moveTo(line[0], line[1]);
                        this.context.lineTo(line[2], line[3]);
                    }
                });
            }
        }

        this.context.strokeStyle = this.color;
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

        // Call the original Kontra update function
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
            } else {
                this.dx = 0;
            }
            if (Math.abs(this.dy) > .01) {
                this.dy *= .99;
            } else {
                this.dy = 0;
            }
        }

        this.hitbox.x = this.x;
        this.hitbox.y = this.y;
        this.hitbox.angle = util.degToRad(this.rotation);

        if (keyPressed(this.keys.fire) && this.fireDt > this.rof) {
            this.fire(sprites);
        }
    }

    explode(sprites) {
        this.exploded = true;

        const cos = Math.cos(util.degToRad(this.rotation));
        const sin = Math.sin(util.degToRad(this.rotation));

        // Create new line sprites where the ship lines were
        this.lines.ship.forEach(line => {

            let center = {
                x: (line[0] + line[2]) / 2,
                y: (line[1] + line[3]) / 2
            };

            let lineSprite = Sprite({
                type: 'shrapnel',
                x: this.x + (center.x * cos - center.y * sin),
                y: this.y + (center.y * cos + center.x * sin),
                rotation: this.rotation,
                color: this.color,
                p1: {
                    x: line[0] - center.x,
                    y: line[1] - center.y
                },
                p2: {
                    x: line[2] - center.x,
                    y: line[3] - center.y
                },

                // Modify these for more crazy "explosions"
                dx: this.dx + Math.random() * 2 - 1,
                dy: this.dy + Math.random() * 2 - 1,
                ttl: 120 + Math.random() * 60, // 2-3s
                dr: Math.random() * 20 - 10,

                update() {
                    this.rotation += this.dr;
                    this.advance();
                },

                render() {
                    this.context.save();
                    this.context.beginPath();

                    // Rotate
                    this.context.translate(this.x, this.y);
                    this.context.rotate(util.degToRad(this.rotation));

                    // Draw
                    this.context.strokeStyle = this.color;
                    this.context.lineWidth = 2;
                    this.context.moveTo(this.p1.x, this.p1.y);
                    this.context.lineTo(this.p2.x, this.p2.y);

                    this.context.stroke();
                    this.context.restore();
                }
            });

            sprites.push(lineSprite);
        });
    }
}
