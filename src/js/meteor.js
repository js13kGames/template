/**
 * Techically the big one in the middle is supposed to be
 * 20461 Dioretsa, and the smaller space rocks are meteoroids!
 */

import { Sprite } from 'kontra';
import * as util from './utility';
import { createShrapnel } from './shrapnel';

function createLines(radius) {

    var pointNum =  Math.round(3 + Math.random() * 3 + Math.sqrt(radius));
    var lines = [];

    for (var i = 1; i <= pointNum; i++) {
        // Increase the (end) multiplier here for more wonky asteroids (inwards)
        // Decrease the (start) integer here for more-outside-ey hitboxes
        var rand = 1 + Math.random() * .1;
        var x = Math.cos((2 * Math.PI * i) / pointNum) * radius * rand;
        var y = Math.sin((2 * Math.PI * i) / pointNum) * radius * rand;

        // If not the first point
        if (i > 1) {
            // Put the new x, y coords in the 3rd and 4th items in prev line
            lines[lines.length - 1].push(x, y);
        }

        lines.push([ x, y ]);

        // Last point
        if (i === pointNum) {
            // Put the 1st x, y coords in the 3rd and 4th items of current line
            lines[lines.length - 1].push(lines[0][0], lines[0][1]);
        }
    }
    return lines;
}

export function createMeteor(props) {
    let meteor = Sprite({
        type: 'meteor',
        x: props.x,
        y: props.y,
        dx: props.dx !== undefined ? props.dx : Math.random() - .5,
        dy: props.dy !== undefined ? props.dy : Math.random() - .5,
        radius: props.radius,
        mass: props.mass || (Math.PI * props.radius * props.radius),
        lines: createLines(props.radius),
        game: props.game,
        color: '#fff',
        dr: props.dr || 0,

        render(scale) {
            this.context.save();
            this.context.scale(scale, scale);
            this.context.translate(this.x, this.y);
            this.context.rotate(util.degToRad(this.rotation));
            this.context.strokeStyle = '#fff';
            this.context.lineWidth = 1;
            this.context.beginPath();
            this.lines.forEach((line, i) => {
                if (!i) {
                    // For the first line, start at it's start x,y
                    this.context.moveTo(line[0], line[1]);
                }
                // For every line, draw a line to it's end x,y
                this.context.lineTo(line[2], line[3]);
            });
            this.context.closePath();
            this.context.stroke();
            this.context.restore();
        },

        update() {
            this.rotation += this.dr;
            this.advance();
            this.hitbox.x = this.x;
            this.hitbox.y = this.y;
            this.hitbox.angle = util.degToRad(this.rotation);
        },

        explode() {
            this.exploded = true;
            this.ttl = 0;

            // Create new line sprites where the ship lines were
            this.lines.forEach(line => {
                createShrapnel(line, this, this.game.sprites);
            });
        }
    });

    if (meteor.radius > 12) {
        meteor.hitboxLines = [];
        meteor.lines.forEach((line, i) => {
            meteor.hitboxLines.push([line[0], line[1]]);
        });
        meteor.hitbox = meteor.game.cSystem.createPolygon(
            meteor.x,
            meteor.y,
            meteor.hitboxLines
        );
    } else {
        meteor.hitbox = meteor.game.cSystem.createCircle(
            meteor.x,
            meteor.y,
            meteor.radius
        );
    }

    meteor.hitbox.owner = meteor;

    props.game.sprites.push(meteor);
    props.game.meteors.push(meteor);
}
