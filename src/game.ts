import {
  Application,
  Container,
  Sprite,
  Assets,
  Graphics,
  RenderTexture,
} from 'pixi.js';
import { Text, TextStyle } from '@pixi/text';
import { Button } from '@pixi/ui';
import { gsap } from 'gsap';
import { sound } from '@pixi/sound';
import axios from 'axios';

import {
  PADDING_SIZE,
  CELL_SIZE,
  FRUITS,
  TEXTURE_TYPES,
  BUTTON_TYPES,
  FRUIT_TYPES,
  FRUIT_MULS,
  MULTIPLIES,
} from './config';

interface Credits {
  [key: string]: Text;
}

interface CtrlButton {
  [key: string]: Button;
}

interface FieldObject {
  [key: string]: {
    a: number;
    b: number;
    c: number;
    d: number;
  };
}

interface UserInfo {
  balance: number;
  id: number;
  username: string;
}

class Game extends Container {
  app: Application<HTMLCanvasElement>;
  startX: number;
  startY: number;
  credits: Credits;
  isInit: boolean;
  activeCell: number;
  activeSprites: Sprite[];
  curSpeed: number;
  btnCtrls: CtrlButton;
  ctrlGuess: Text;
  ctrlWin: Text;
  ctrlCredits: Text;
  bonusCount: number;
  coinCount: number;
  guessNumber: number;
  activeMultiply: Text[];
  moveInterval: number;
  addCoins: number;
  transfer: number;
  tween: any;
  token: string;
  apiUrl: string;

  constructor(app: Application<HTMLCanvasElement>) {
    super();
    this.app = app;
    this.startX = this.startY = 0;
    this.credits = {};
    this.isInit = false;
    this.activeCell = 0;
    this.activeSprites = [];
    this.curSpeed = 0;
    this.btnCtrls = {};
    this.ctrlGuess = this.ctrlWin = this.ctrlCredits = new Text();
    this.bonusCount = 0;
    this.coinCount = 520;
    this.guessNumber = 0;
    this.activeMultiply = [];
    this.moveInterval = -1;
    this.addCoins = 1;
    this.transfer = 0;
    this.tween = null;
    this.token = this.apiUrl = '';

    // functions
    this.update = this.update.bind(this);
    this.addFruitCredit = this.addFruitCredit.bind(this);
    this.slotCompleted = this.slotCompleted.bind(this);

    this.initialize();
  }

  initialize() {
    this.startX = (this.app.screen.width - 480) / 2;
    this.startY = 150;
    this.loadAssets();
    Assets.load(TEXTURE_TYPES).then((textures) => {
      this.onAssetsLoaded(textures);
    });
    this.app.ticker.add(this.update);
  }

  loadAssets() {
    /* eslint-disable */
    Assets.add('back', require('./assets/image/background.png'));
    Assets.add('logo', require('./assets/image/logo.png'));

    // buttons
    Assets.add('btn', require('./assets/image/btn.png'));
    Assets.add('btn-hover', require('./assets/image/btn-hover.png'));
    Assets.add('btn-pressed', require('./assets/image/btn-pressed.png'));
    Assets.add('btn-disabled', require('./assets/image/btn-disabled.png'));

    // fruits
    Assets.add(['apple', 'apple*2'], require('./assets/image/apple.png'));
    Assets.add(['bar', 'bar*50'], require('./assets/image/bar.png'));
    Assets.add(['bell', 'bell*2'], require('./assets/image/bell.png'));
    Assets.add(
      ['free-spin', 'free-spin*2'],
      require('./assets/image/free-spin.png'),
    );
    Assets.add(['lemon', 'lemon*2'], require('./assets/image/lemon.png'));
    Assets.add(['mul-fifty'], require('./assets/image/mul-fifty.png'));
    Assets.add(['mul-two'], require('./assets/image/mul-two.png'));
    Assets.add(['orange', 'orange*2'], require('./assets/image/orange.png'));
    Assets.add(['seven', 'seven*2'], require('./assets/image/seven.png'));
    Assets.add(['star', 'star*2'], require('./assets/image/star.png'));
    Assets.add(
      ['watermelon', 'watermelon*2'],
      require('./assets/image/watermelon.png'),
    );

    sound.add('click', './sound/click.mp3');
    sound.add('count', './sound/count.mp3');
    sound.add('error', './sound/error.mp3');
    sound.add('spin', './sound/spin.mp3');
    sound.add('win', './sound/win.mp3');
  }

  onAssetsLoaded(textures: Record<string, any>) {
    const backSprite: Sprite = Sprite.from(textures['back']);
    backSprite.x = this.startX + CELL_SIZE;
    backSprite.y = this.startY + CELL_SIZE;
    backSprite.width = backSprite.height = CELL_SIZE * 5;
    this.addChild(backSprite);

    for (let i = 0; i < 4; ++i) {
      for (let j = 0; j < 6; ++j) {
        const fruitName: string = FRUITS[i * 6 + j];
        let { x, y } = this.getXY(i, j);
        // add rect to the fruit position
        const border: Graphics = new Graphics();
        border.lineStyle(2, 0x0, 0.5);
        border.beginFill('#ccc8a5');
        border.drawRect(0, 0, CELL_SIZE, CELL_SIZE);
        border.endFill();

        const backTexture: RenderTexture =
          this.app.renderer.generateTexture(border);

        const backSprite: Sprite = Sprite.from(backTexture);
        backSprite.x = this.startX + x;
        backSprite.y = this.startY + y;
        this.addChild(backSprite);

        // add fruits
        const sprite: Sprite = Sprite.from(textures[fruitName]);
        sprite.x = this.startX + x + PADDING_SIZE / 2;
        sprite.y = this.startY + y + PADDING_SIZE / 2;
        sprite.width = sprite.height = CELL_SIZE - PADDING_SIZE;
        this.addChild(sprite);

        // if multi
        if (fruitName.endsWith('*2') || fruitName.endsWith('*50')) {
          const spriteMulty: Sprite = Sprite.from(
            textures[fruitName.endsWith('*2') ? 'mul-two' : 'mul-fifty'],
          );
          spriteMulty.x = sprite.x;
          spriteMulty.y = sprite.y;
          spriteMulty.width = spriteMulty.height = CELL_SIZE - PADDING_SIZE;
          this.addChild(spriteMulty);
        }
      }
    }

    // Draw Active Cell
    const activeBorder: Graphics = new Graphics();
    activeBorder.lineStyle(3, 0xff0000, 1);
    activeBorder.beginFill('#cc000022');
    activeBorder.drawRect(0, 0, CELL_SIZE - 2, CELL_SIZE - 2);
    activeBorder.endFill();
    const activeTexture: RenderTexture =
      this.app.renderer.generateTexture(activeBorder);

    let XYs = [
      {
        x:
          this.startX +
          this.getXY(Math.floor(this.activeCell / 6), this.activeCell % 6).x,
        y:
          this.startY +
          this.getXY(Math.floor(this.activeCell / 6), this.activeCell % 6).y,
        visible: true,
      },
      { x: 0, y: 0, visible: false },
      { x: 0, y: 0, visible: false },
      { x: 0, y: 0, visible: false },
    ];

    for (let i = 0; i < XYs.length; ++i) {
      const activeSprite = Sprite.from(activeTexture);
      activeSprite.x = XYs[i].x;
      activeSprite.y = XYs[i].y;
      activeSprite.visible = XYs[i].visible;
      this.addChild(activeSprite);

      this.activeSprites.push(activeSprite);
    }

    // Draw Fruit Slot Logo
    const logoSprite: Sprite = Sprite.from(textures['logo']);
    logoSprite.x = this.startX + CELL_SIZE + (CELL_SIZE * 5 - 221) / 2;
    logoSprite.y = this.startY + CELL_SIZE + 50;
    logoSprite.width = 221;
    logoSprite.height = 149;
    this.addChild(logoSprite);

    // Bet Result
    const guessText: Text = new Text(
      '00',
      new TextStyle({
        fontSize: 42,
        fontWeight: 'bold',
        fill: '#ffffff',
      }),
    );
    guessText.x = this.startX + (CELL_SIZE * 7) / 2 - 21;
    guessText.y = this.startY + CELL_SIZE * 5 - PADDING_SIZE;
    this.addChild(guessText);
    this.ctrlGuess = guessText;

    const goldTextStyle = new TextStyle({ fontSize: 42, fill: '#ddff55' });
    const winText: Text = new Text('0'.padStart(8, '0'), goldTextStyle);
    winText.x = this.startX;
    winText.y = this.startY - 50;
    this.addChild(winText);
    this.ctrlWin = winText;
    const creditText: Text = new Text(
      this.coinCount.toString().padStart(8, '0'),
      goldTextStyle,
    );
    creditText.x = this.startX + CELL_SIZE * 7 - 186;
    creditText.y = this.startY - 50;
    this.addChild(creditText);
    this.ctrlCredits = creditText;

    BUTTON_TYPES.forEach((text, index) => {
      const btnView: Sprite = Sprite.from(textures['btn']);
      btnView.width = btnView.height = CELL_SIZE;
      btnView.x =
        this.startX + index * (CELL_SIZE + PADDING_SIZE) + CELL_SIZE * 0.6;
      btnView.y = this.startY + CELL_SIZE * 8 - PADDING_SIZE * 2;
      btnView.anchor.set(0.5);

      const textView = new Text(
        text,
        new TextStyle({
          fontSize: 40,
          fontWeight: 'bold',
        }),
      );
      textView.y -= 15;
      textView.anchor.set(0.5);
      btnView.addChild(textView);

      const button = new Button(btnView);
      button.onHover.connect(() => (btnView.texture = textures['btn-hover']));
      button.onDown.connect(() => {
        btnView.texture = textures['btn-pressed'];
        if (text == 'L') {
          this.handleMoveCoin('left');
        }
        if (text == 'R') {
          this.handleMoveCoin('right');
        }
      });
      button.onUp.connect(() => {
        if (text == 'L' || text == 'R') this.handleStopMoveCoin();
      });
      button.onOut.connect(() => {
        btnView.texture = textures['btn'];
      });
      button.onPress.connect(() => {
        btnView.texture = textures['btn-hover'];
        this.playSound('click');
        switch (text) {
          case 'All\n+1':
            this.handlePlusAll();
            break;
          case '1-6':
            this.handleBetDoubling('small');
            break;
          case '8-13':
            this.handleBetDoubling('big');
            break;
          case 'GO':
            // this.handleGo('');
            this.bet();
            break;
        }
      });
      this.addChild(button.view);
      this.btnCtrls[text] = button;
    });

    FRUIT_TYPES.forEach((type, index) => {
      const multipleView = new Text(
        MULTIPLIES[index].toString(),
        new TextStyle({ fontSize: 20, fill: '#ffff00' }),
      );
      multipleView.y -= 15;
      multipleView.anchor.set(0.5);
      multipleView.x = this.startX + index * CELL_SIZE;
      multipleView.y = this.startY + CELL_SIZE * 8.5;
      this.addChild(multipleView);
      this.activeMultiply.push(multipleView);

      const coinView = new Text(
        '00',
        new TextStyle({
          fontSize: 28,
        }),
      );
      coinView.y -= 15;
      coinView.anchor.set(0.5);
      coinView.x = this.startX + index * CELL_SIZE;
      coinView.y = this.startY + CELL_SIZE * 9;
      this.addChild(coinView);
      this.credits[type] = coinView;

      const btnView: Sprite = Sprite.from(textures['btn']);
      btnView.width = btnView.height = CELL_SIZE;
      btnView.x = this.startX + index * CELL_SIZE;
      btnView.y = this.startY + CELL_SIZE * 10 - PADDING_SIZE;
      btnView.anchor.set(0.5);

      const fruitView: Sprite = Sprite.from(textures[type]);
      fruitView.y -= 15;
      fruitView.anchor.set(0.5);
      fruitView.width = fruitView.height = CELL_SIZE * 1.5;
      btnView.addChild(fruitView);

      const button = new Button(btnView);
      button.onHover.connect(() => (btnView.texture = textures['btn-hover']));
      button.onOut.connect(() => (btnView.texture = textures['btn']));
      button.onDown.connect(() => (btnView.texture = textures['btn-pressed']));
      button.onPress.connect(() => {
        btnView.texture = textures['btn-hover'];
        this.playSound('click');
        this.addFruitCredit(type);
      });
      this.addChild(button.view);
    });
    this.isInit = true;

    console.info('Initialized.');
  }

  update(delta: number) {
    if (!this.isInit || this.curSpeed == 0) return;

    this.invalidate();
  }

  invalidate() {
    this.activeCell = (this.activeCell + this.curSpeed) % 24;
    this.activeSprites[0].x =
      this.startX +
      this.getXY(
        Math.floor(this.activeCell / 6),
        Math.floor(this.activeCell) % 6,
      ).x;
    this.activeSprites[0].y =
      this.startY +
      this.getXY(
        Math.floor(this.activeCell / 6),
        Math.floor(this.activeCell) % 6,
      ).y;
  }

  getXY(i: number, j: number) {
    let x: number = 0,
      y: number = 0;
    switch (i) {
      case 0:
        x = j * CELL_SIZE;
        y = 0;
        break;
      case 1:
        x = CELL_SIZE * 6;
        y = j * CELL_SIZE;
        break;
      case 2:
        x = CELL_SIZE * 6 - j * CELL_SIZE;
        y = CELL_SIZE * 6;
        break;
      case 3:
        x = 0;
        y = CELL_SIZE * 6 - j * CELL_SIZE;
        break;
    }
    return { x, y };
  }

  addFruitCredit(fruit: string) {
    if (this.coinCount < 1) return;

    let betNumber: number = parseInt(this.credits[fruit].text) + 1;
    this.credits[fruit].text = betNumber.toString().padStart(2, '0');

    this.coinCount--;
    this.ctrlCredits.text = this.coinCount.toString().padStart(8, '0');
  }

  handlePlusAll() {
    FRUIT_TYPES.forEach((fruit) => {
      this.addFruitCredit(fruit);
    });
  }

  handleMoveCoin(direction: string) {
    if (this.moveInterval != -1) {
      clearInterval(this.moveInterval);
    }
    // Play Count Sound
    this.playSound('count');

    this.tween = gsap.fromTo(
      this,
      {
        transfer: 0,
      },
      {
        transfer: direction === 'right' ? this.bonusCount : +this.coinCount,
        duration:
          (direction === 'right' ? this.bonusCount : this.coinCount) * 0.05,
        ease: 'none',
        onStart: () => {
          // this.btnCtrls['L'].enabled = false;
          // this.btnCtrls['R'].enabled = false;
        },
        onUpdate: () => {
          const transferValue = parseInt(
            (direction == 'right' ? -this.transfer : this.transfer).toString(),
          );
          this.ctrlWin.text = (this.bonusCount + transferValue)
            .toString()
            .padStart(8, '0');
          this.ctrlCredits.text = (this.coinCount - transferValue)
            .toString()
            .padStart(8, '0');
        },
        onComplete: () => {
          // this.btnCtrls['L'].enabled = true;
          // this.btnCtrls['R'].enabled = true;

          let totalCount = this.bonusCount + this.coinCount;
          this.bonusCount = direction == 'left' ? totalCount : 0;
          this.coinCount = direction == 'right' ? totalCount : 0;
          this.ctrlWin.text = this.bonusCount.toString().padStart(8, '0');
          this.ctrlCredits.text = this.coinCount.toString().padStart(8, '0');
        },
      },
    );
  }

  handleStopMoveCoin() {
    if (this.tween == null) return;
    this.tween.kill();
    this.bonusCount = parseInt(this.ctrlWin.text);
    this.coinCount = parseInt(this.ctrlCredits.text);
    this.tween = null;
  }

  handleBetDoubling(doubling: string) {
    if (this.bonusCount == 0) {
      this.playSound('error');
      return;
    }

    console.log(this.bonusCount);

    this.guessNumber = Math.floor(Math.random() * 13) + 1;
    this.ctrlGuess.text = this.guessNumber.toString().padStart(2, '0');

    const isWin =
      (doubling == 'small' && this.guessNumber < 7) ||
      (doubling != 'small' && this.guessNumber > 7);

    // Win Or Lose Sound
    this.playSound(this.bonusCount == 0 ? 'error' : 'win');

    this.win(isWin ? this.bonusCount : -this.bonusCount)
      .then((res) => {
        this.bonusCount = 0;
        this.coinCount = res.data.balance;
        this.ctrlWin.text = this.bonusCount.toString().padStart(8, '0');
        this.ctrlCredits.text = this.coinCount.toString().padStart(8, '0');
      })
      .catch((error) => {
        console.error(error);
      });
  }

  handleGo(stopField: string, bonus: boolean) {
    let target: number = FRUITS.indexOf(stopField);
    // console.log('Go to :: ', target);

    var totalBetCoins: number = 0;
    Object.keys(this.credits).forEach((key) => {
      totalBetCoins += parseInt(this.credits[key].text);
    });
    if (totalBetCoins == 0) {
      this.playSound('error');
      return;
    }

    if (parseInt(this.ctrlWin.text) > 0) {
      this.coinCount += this.bonusCount;
      this.bonusCount = 0;
      this.ctrlCredits.text = this.coinCount.toString().padStart(8, '0');
      this.ctrlWin.text = '0'.padStart(8, '0');
    }

    this.activeMultiply.forEach((am) => {
      am.style.fill = 'yellow';
    });

    this.btnCtrls['All\n+1'].enabled = false;
    this.btnCtrls['L'].enabled = false;
    this.btnCtrls['R'].enabled = false;
    this.btnCtrls['1-6'].enabled = false;
    this.btnCtrls['8-13'].enabled = false;

    this.activeSprites[1].visible = false;
    this.activeSprites[2].visible = false;
    this.activeSprites[3].visible = false;

    let accelerate_time = Math.random() / 2 + 0.5;
    let decelerate_time = 0.81181669;

    this.playSound('spin');

    gsap.to(this, {
      curSpeed: 1,
      duration: accelerate_time,
      ease: 'none',
      onComplete: () => {
        setTimeout(() => {
          let delay =
            target < 0 ? 0 : ((target + 23 - this.activeCell - 1) % 24) * 16.67;
          setTimeout(() => {
            gsap.to(this, {
              curSpeed: 0,
              duration: decelerate_time,
              ease: 'none',
              onComplete: () => {
                if (bonus) {
                  let starIndex = stopField.indexOf('*');
                  let originName = stopField.slice(
                    0,
                    starIndex == -1 ? stopField.length : starIndex,
                  );
                  let index = FRUIT_TYPES.indexOf(originName);
                  if (index != -1)
                    this.activeMultiply[
                      FRUIT_TYPES.indexOf(originName)
                    ].style.fill = 'red';
                }

                this.curSpeed = 0;
                this.activeCell = target < 0 ? this.activeCell : target;
                console.log('**', this.activeCell);
                this.invalidate();
                this.slotCompleted();
              },
            });
          }, delay);
        }, 3000 - (accelerate_time + decelerate_time) * 1000);
      },
    });
  }

  getRandomElements(arr: string[], numElements: number): Set<number> {
    let randomElements = [];
    let indices = new Set<number>();

    while (indices.size < numElements) {
      let index = Math.floor(Math.random() * arr.length);
      if (!indices.has(index)) {
        indices.add(index);
        randomElements.push(arr[index]);
      }
    }

    return indices;
  }

  slotCompleted() {
    let _active = Math.floor(this.activeCell),
      fruitName = FRUITS[_active];
    let starIndex = fruitName.indexOf('*');
    let originName = fruitName.slice(
        0,
        starIndex == -1 ? fruitName.length : starIndex,
      ),
      totalEarned = 0;

    if (originName == 'free-spin') {
      let random_number = Math.floor(Math.random() * 4);
      let luck_fruits: Set<number> = this.getRandomElements(
          FRUIT_TYPES,
          random_number,
        ),
        i = 1;
      luck_fruits.forEach((fruit) => {
        let filterFruits = FRUITS.map((f, index) => {
          return { name: f, index: index };
        }).filter((f) => f.name.startsWith(FRUIT_TYPES[fruit]));
        let randomIndex = Math.floor(Math.random() * filterFruits.length);
        let fIndex = filterFruits[randomIndex].index,
          fName = filterFruits[randomIndex].name;

        console.log(
          filterFruits[randomIndex],
          this.getXY(Math.floor(fIndex / 6), fIndex % 6),
        );

        this.activeSprites[i].x =
          this.startX + this.getXY(Math.floor(fIndex / 6), fIndex % 6).x;
        this.activeSprites[i].y =
          this.startY + this.getXY(Math.floor(fIndex / 6), fIndex % 6).y;
        this.activeSprites[i].visible = true;
        ++i;

        // console.log(this.credits, fName, FRUIT_TYPES[fruit], this.credits[FRUIT_TYPES[fruit]]);

        let betNumber: number = parseInt(this.credits[FRUIT_TYPES[fruit]].text);
        let mul =
          this.activeMultiply[FRUIT_TYPES.indexOf(fName)].style.fill ==
          '#ff0000'
            ? FRUIT_MULS[fName]
            : 1;
        totalEarned += mul * betNumber * (fName.indexOf('*') == -1 ? 1 : 2);
      });
    } else {
      let betNumber: number = parseInt(this.credits[originName].text);
      let mul =
        this.activeMultiply[FRUIT_TYPES.indexOf(originName)].style.fill ==
        '#ff0000'
          ? FRUIT_MULS[originName]
          : 1;

      totalEarned = mul * betNumber * (starIndex == -1 ? 1 : 2);
    }

    // Update balance from server
    this.win(totalEarned)
      .then((res) => {
        console.log(res);
      })
      .catch((error) => {
        console.error(error);
      });

    // Enable All Buttons
    this.btnCtrls['All\n+1'].enabled = true;
    this.btnCtrls['L'].enabled = true;
    this.btnCtrls['R'].enabled = true;
    this.btnCtrls['1-6'].enabled = true;
    this.btnCtrls['8-13'].enabled = true;

    gsap.fromTo(
      this,
      {
        transfer: this.bonusCount,
      },
      {
        transfer: this.bonusCount + totalEarned,
        duration: 1,
        ease: 'power1.in',
        onUpdate: () => {
          this.ctrlWin.text = parseInt(this.transfer.toString())
            .toString()
            .padStart(8, '0');
        },
        onComplete: () => {
          this.bonusCount = this.bonusCount + totalEarned;
          this.ctrlWin.text = this.bonusCount.toString().padStart(8, '0');

          // Reset bet numbers
          Object.keys(this.credits).forEach((key) => {
            this.credits[key].text = '00';
          });
        },
      },
    );

    // this.bonusCount += totalEarned;
    // this.ctrlWin.text = this.bonusCount.toString().padStart(8, '0');
  }

  playSound(type: string) {
    console.log(`Play Sound :: ${type}`);
    // sound.play(type);
  }

  setToken(token: string) {
    this.token = token;
  }

  setApiUrl(url: string) {
    this.apiUrl = url;
  }

  setUserInfo(info: UserInfo) {
    this.coinCount = info.balance;
  }

  bet() {
    const headers = {
      Authorization: 'Bearer ' + this.token,
      'Content-Type': 'application/json',
    };

    let fields: FieldObject = {
      apple: { a: 1, b: 2, c: 5, d: 10 },
      orange: { a: 1, b: 2, c: 10, d: 20 },
      lemon: { a: 1, b: 2, c: 15, d: 30 },
      bell: { a: 1, b: 2, c: 20, d: 40 },
      watermelon: { a: 1, b: 2, c: 20, d: 40 },
      star: { a: 1, b: 2, c: 30, d: 60 },
      seven: { a: 1, b: 2, c: 40, d: 80 },
      bar: { a: 1, b: 2, c: 50, d: 100 },
    };

    let randomFruit = FRUIT_TYPES[Math.floor(Math.random() * 8)];
    let randomFields = fields[randomFruit];

    let betNumber: number = parseInt(this.credits[randomFruit].text);

    randomFields.a *= betNumber;
    randomFields.b *= betNumber;
    randomFields.c *= betNumber;
    randomFields.d *= betNumber;

    console.log(randomFields);

    let raw = JSON.stringify({
      fields: {
        fruit: randomFields,
      },
    });

    axios
      .post(this.apiUrl + '/api/bet/new', raw, { headers: headers })
      .then((response) => {
        // let balance = response.data.balance;
        let bets = response.data.bets.fruit;

        let canFruits = [];
        if (bets.a)
          canFruits.push({
            fruit: randomFruit,
            bonus: randomFruit == 'bar' || randomFruit == 'apple',
          });
        if (bets.b)
          canFruits.push({
            fruit: randomFruit + '*2',
            bonus: randomFruit == 'bar' || randomFruit == 'apple',
          });
        if (bets.c) canFruits.push({ fruit: randomFruit, bonus: true });
        if (bets.d) canFruits.push({ fruit: randomFruit + '*2', bonus: true });

        let index = Math.floor(canFruits.length * Math.random());

        console.log(canFruits[index].fruit, canFruits[index].bonus);

        this.handleGo(canFruits[index].fruit, canFruits[index].bonus);
      })
      .catch((error) => {
        console.error(error);
      });
  }

  win(amount: number) {
    const headers = {
      Authorization: 'Bearer ' + this.token,
      'Content-Type': 'application/json',
    };

    let raw = JSON.stringify({
      amount: amount,
    });

    return axios.post(this.apiUrl + '/api/bet/win', raw, { headers: headers });
  }
}

export default Game;
