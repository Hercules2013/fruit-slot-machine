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

// For test
gameScene.setToken(
  'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpYXQiOjE2OTQ1MjQxNzgsImV4cCI6MTY5NDUyNzc3OCwicm9sZXMiOlsiUk9MRV9VU0VSIiwidXNlciJdLCJ1c2VybmFtZSI6Ing0NXh6OCIsInV1aWQiOiIxZWU1MTZkYS0xMDBjLTYyYTYtYTVhOC0wMjQyYWMxZDAwMDciLCJnYW1lX3BhdGgiOiIvZ2FtZS90ZXN0L2ZydWl0eS1mb3J0dW5lLWZyZW56eS1kZXYifQ.ScW2FQ-ljJIWiazczpKt5jqBICGFtnZNAyJIoAYl3MlI08cMOyTL_91n3_jne9NpndOMdDXrofnOb5g1id4O1IWSNXZXDN2zazYNROObLcsCQ84o4JakyaOifFeELDHJ8vHRzE52MnG69Cacj7AVNXRG84GWqi6YT0AcY4w2MaMBdPtlAMwEF9V48FRi7hZS0o6ICVcAjK-wXR-ybAvUwhfVW45vAGj6dzz7-_YcHdqO4sP_jqLd76Z-3-ItIA4j6Q39HxGHBXX47giKPwu06398FWSapsYNvQjtnH03Eg1hS3W2Ux46Wjm7LNq2wpWm2JKX8Uz3RZU04O4K6HL5gA',
);
gameScene.setApiUrl('https://gameserver.demo.itbcode.com');

let stopOnField = 0;

Object.defineProperty(window, 'stopOnField', {
  get: () => stopOnField,
  set: (newValue) => {
    stopOnField = newValue;

    gameScene.handleGo(newValue, false);
  },
});

window.addEventListener('message', (event) => {
  if (event.data.token) {
    gameScene.setToken(event.data.token);
    gameScene.setApiUrl(event.data.api_url);
    gameScene.setUserInfo(event.data.user);
  }
});
