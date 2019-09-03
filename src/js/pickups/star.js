import { Pickup } from './pickup.js';
import * as util from '../utility';

export class StarPickup extends Pickup {

    constructor(props) {
        super(props);
    }

    update() {
        super.update();
    }

    applyTo(ship) {
        ship.rainbow = 8; // Be all rainbowy & invincible for 8s
        ship.maxSpeed *= 1.5; // Set max speed to be higher for the 8s
    }

    render() {
        this.context.save();
        this.context.translate(this.x, this.y);
        this.context.rotate(util.degToRad(this.rotation));

        this.context.beginPath();
        this.context.lineWidth = 2;
        this.context.strokeStyle = '#fff';

        // this.context.rect(
        //     Math.sqrt(Math.pow(this.radius * this.scale, 2) * .5),
        //     Math.sqrt(Math.pow(this.radius * this.scale, 2) * .5),
        //     Math.sqrt(Math.pow(this.radius * this.scale, 2) * .5) * -2,
        //     Math.sqrt(Math.pow(this.radius * this.scale, 2) * .5) * -2,
        // );
        // this.context.stroke();

        //this.context.beginPath();

        var rot = Math.PI / 2 * 3;
        var step = Math.PI / 5;

        this.context.moveTo(0, 0 - this.radius * this.scale * .7);
        for (let i = 0; i < 5; i++) {
            this.context.lineTo(
                Math.cos(rot) * this.radius * this.scale * .7,
                Math.sin(rot) * this.radius * this.scale * .7
            );
            rot += step;

            this.context.lineTo(
                Math.cos(rot) * this.radius * this.scale * .3,
                Math.sin(rot) * this.radius * this.scale * .3
            );
            rot += step;
        }
        this.context.lineTo(0, 0 - this.radius * this.scale * .7);

        this.context.closePath();
        this.context.stroke();
        this.context.restore();

        // Render the circle around the edge
        super.render();
    }

}