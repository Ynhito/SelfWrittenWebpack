import message from './message.js';
import {component1Name} from './components/component1/index.js';

const paragraph = document.querySelector('#paragraph');
paragraph.innerHTML = message;

const paragraph1 = document.querySelector('.component1');
paragraph1.innerHTML = component1Name;

console.log(message);
