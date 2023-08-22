import 'normalize.css';
import './style.css';
import { Application, Graphics, Sprite } from 'pixi.js';

const app = new Application<HTMLCanvasElement>({
  resolution: window.devicePixelRatio ?? 1,
  resizeTo: window,
  autoDensity: true,
  background: '#000000',
  width: 640,
  height: 480,
});

const graphics = new Graphics();
graphics.beginFill('#ff0000');
graphics.drawRect(0, 0, 100, 100);
graphics.endFill();

const texture = app.renderer.generateTexture(graphics);

const sprite = new Sprite(texture);
sprite.x = app.screen.width / 2;
sprite.y = app.screen.height / 2;
sprite.anchor.set(0.5);

app.stage.addChild(sprite);

app.ticker.add((delta) => {
  sprite.rotation += 0.01 * delta;
});

document.body.appendChild(app.view);
