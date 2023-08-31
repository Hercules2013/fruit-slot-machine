const PADDING_SIZE = 10,
  CELL_SIZE = 70;

const FRUITS: string[] = [
  'orange',
  'bell',
  'bar*50',
  'bar',
  'apple',
  'apple*2',
  'lemon',
  'watermelon',
  'watermelon*2',
  'free-spin',
  'apple',
  'orange*2',
  'orange',
  'bell',
  'seven*2',
  'seven',
  'apple',
  'lemon*2',
  'lemon',
  'star',
  'star*2',
  'free-spin',
  'apple',
  'bell*2',
];

const TEXTURE_TYPES: string[] = [
  'apple',
  'bar',
  'bell',
  'free-spin',
  'lemon',
  'mul-fifty',
  'mul-two',
  'orange',
  'seven',
  'star',
  'watermelon',
  'apple*2',
  'bar*50',
  'bell*2',
  'lemon*2',
  'orange*2',
  'seven*2',
  'star*2',
  'watermelon*2',
  'back',
  'logo',
  'btn',
  'btn-hover',
  'btn-pressed',
  'btn-disabled',
];

const BUTTON_TYPES: string[] = ['All\n+1', 'L', 'R', '1-6', '8-13', 'GO'];

const FRUIT_TYPES: string[] = [
  'bar',
  'seven',
  'star',
  'watermelon',
  'bell',
  'lemon',
  'orange',
  'apple',
];

interface FruitMulties {
  [key: string]: number;
}

const FRUIT_MULS: FruitMulties = {
  bar: 100,
  'bar*50': 50,
  seven: 40,
  star: 30,
  watermelon: 20,
  bell: 20,
  lemon: 15,
  orange: 10,
  apple: 5,
  'seven*2': 2,
  'star*2': 2,
  'watermelon*2': 2,
  'bell*2': 2,
  'lemon*2': 2,
  'orange*2': 2,
  'apple*2': 2,
};

const MULTIPLIES: number[] = [100, 40, 30, 20, 20, 15, 10, 5];

export {
  CELL_SIZE,
  PADDING_SIZE,
  FRUITS,
  TEXTURE_TYPES,
  BUTTON_TYPES,
  FRUIT_TYPES,
  FRUIT_MULS,
  MULTIPLIES,
};
