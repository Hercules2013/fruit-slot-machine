import { Application, Graphics, Sprite } from 'pixi.js';

import 'normalize.css';
import './style.css';

import Game from './game';

const app = new Application<HTMLCanvasElement>({
  resolution: window.devicePixelRatio ?? 1,
  resizeTo: window,
  autoDensity: true,
  background: '#000000',
  width: 640,
  height: 480,
});

const backGraphics = new Graphics();
backGraphics.beginFill('#1099bb');
backGraphics.drawRect(0, 0, 100, 100);
backGraphics.endFill();

const backgroundTexture = app.renderer.generateTexture(backGraphics);

const backgroundSpirite = new Sprite(backgroundTexture);

backgroundSpirite.width = app.screen.width;
backgroundSpirite.height = app.screen.height;

app.stage.addChildAt(backgroundSpirite, 0);

document.body.appendChild(app.view);

const gameScene = new Game(app);
app.stage.addChild(gameScene);
