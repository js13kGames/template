/**
 * When a new "input device" (gamepad, keyboard wasd, keyboard arrows), etc.
 * add a new player (if they don't exist already)
 */

import { newPlayer } from './newPlayer';
import { bindKeys, unbindKeys } from 'kontra';

// Setup a global array for holding gamepad infos
window.gamepads = [];

function setupGamepad(e) {
    let pad = e.gamepad;

    //console.log(`Gamepad connected at index ${pad.index}: ${pad.id}. ${pad.buttons.length} buttons, ${pad.axes.length} axes.`);
    window.gamepads[pad.index] = {
        id: pad.id,
        pressedButtons: {},
        axes: {}
    };
    if (pad.id.indexOf('Joy-Con') > -1) {
        window.gamepads[pad.index].buttonMap = {
            'a': 1,
            'b': 0,
            'x': 3,
            'y': 2,
            'l': 4,
            'r': 5
        };
        window.gamepads[pad.index].axesMap = {
            'x': 4,
            'y': 5
        };
    }

    // Code to handle new players being added with new gamepads.
    newPlayer(window.game, 'gamepad', pad.id)
}

function keySetUsed(keys) {
    if (!window.game.players.some(p => p.controls === keys)) {
        newPlayer(window.game, keys)
    }
}

export function detectNewInput() {

    // Event when new gamepads get connected
    window.addEventListener('gamepadconnected', setupGamepad);

    bindKeys(['space', 'up', 'right', 'down', 'left'], function(e) {
      keySetUsed('arrows');
    });

    bindKeys(['w', 'a', 's', 'd'], function(e) {
      keySetUsed('wasd');
    });
}

export function dontDetectNewInput() {
    window.removeEventListener('gamepadconnected', setupGamepad);
    unbindKeys(['space', 'up', 'right', 'down', 'left', 'w', 'a', 's', 'd']);
}