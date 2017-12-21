import { GAME } from './game'
window.game = new GAME('#canvas', '#status');
game.init(20, 20, 1000, 1000);