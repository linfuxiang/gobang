import { GAME } from './game'
window.game = new GAME('#canvas', '#status', '.result');
game.init(20, 20, 1000, 1000);
document.querySelector('#result button').addEventListener('click', () => {
	game.init(20, 20, 1000, 1000);
	document.querySelector('#result').style.display = 'none';
});