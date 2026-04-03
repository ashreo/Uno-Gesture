export type Color = 'red' | 'green' | 'blue' | 'yellow' | 'wild';
export type Value = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'skip' | 'reverse' | 'draw2' | 'wild' | 'draw4';

export interface Card {
  id: string;
  color: Color;
  value: Value;
}

export interface Player {
  id: string;
  name: string;
  hand: Card[];
  isAI: boolean;
}

export const createDeck = (): Card[] => {
  const deck: Card[] = [];
  const colors: Color[] = ['red', 'green', 'blue', 'yellow'];
  const values: Value[] = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'skip', 'reverse', 'draw2'];

  let idCounter = 0;

  colors.forEach(color => {
    deck.push({ id: `card-${idCounter++}`, color, value: '0' });
    values.forEach(value => {
      deck.push({ id: `card-${idCounter++}`, color, value });
      deck.push({ id: `card-${idCounter++}`, color, value });
    });
  });

  for (let i = 0; i < 4; i++) {
    deck.push({ id: `card-${idCounter++}`, color: 'wild', value: 'wild' });
    deck.push({ id: `card-${idCounter++}`, color: 'wild', value: 'draw4' });
  }

  return shuffle(deck);
};

export const shuffle = (deck: Card[]): Card[] => {
  const newDeck = [...deck];
  for (let i = newDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
  }
  return newDeck;
};

export const isValidPlay = (card: Card, topCard: Card, currentColor: Color): boolean => {
  if (card.color === 'wild') return true;
  if (card.color === currentColor) return true;
  if (card.value === topCard.value) return true;
  return false;
};
