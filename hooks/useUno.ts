import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, Color, Player, createDeck, isValidPlay } from '@/lib/uno';

interface GameState {
  players: Player[];
  deck: Card[];
  discardPile: Card[];
  currentPlayerIndex: number;
  direction: 1 | -1;
  currentColor: Color;
  winner: Player | null;
  isColorPickerOpen: boolean;
  pendingWildCard: Card | null;
  message: string;
}

export const useUno = () => {
  const [state, setState] = useState<GameState>({
    players: [],
    deck: [],
    discardPile: [],
    currentPlayerIndex: 0,
    direction: 1,
    currentColor: 'red',
    winner: null,
    isColorPickerOpen: false,
    pendingWildCard: null,
    message: '正在初始化...',
  });

  const aiTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const initGame = useCallback(() => {
    let newDeck = createDeck();
    const newPlayers: Player[] = [
      { id: 'p1', name: '你', hand: [], isAI: false },
      { id: 'p2', name: '电脑 1', hand: [], isAI: true },
      { id: 'p3', name: '电脑 2', hand: [], isAI: true },
      { id: 'p4', name: '电脑 3', hand: [], isAI: true },
    ];

    for (let i = 0; i < 7; i++) {
      newPlayers.forEach(p => {
        p.hand.push(newDeck.pop()!);
      });
    }

    let firstCard = newDeck.pop()!;
    while (firstCard.color === 'wild') {
      newDeck.unshift(firstCard);
      firstCard = newDeck.pop()!;
    }

    setState({
      players: newPlayers,
      deck: newDeck,
      discardPile: [firstCard],
      currentPlayerIndex: 0,
      direction: 1,
      currentColor: firstCard.color,
      winner: null,
      isColorPickerOpen: false,
      pendingWildCard: null,
      message: '游戏开始！轮到你了。',
    });
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const playCard = useCallback((playerId: string, cardId: string, chosenColor?: Color) => {
    setState(prev => {
      if (prev.winner) return prev;
      const playerIndex = prev.players.findIndex(p => p.id === playerId);
      if (playerIndex !== prev.currentPlayerIndex) return prev;

      const player = prev.players[playerIndex];
      const cardIndex = player.hand.findIndex(c => c.id === cardId);
      if (cardIndex === -1) return prev;

      const card = player.hand[cardIndex];
      const topCard = prev.discardPile[prev.discardPile.length - 1];

      if (!isValidPlay(card, topCard, prev.currentColor)) {
        return { ...prev, message: '出牌无效！' };
      }

      if (card.color === 'wild' && !chosenColor && !player.isAI) {
        return { ...prev, pendingWildCard: card, isColorPickerOpen: true };
      }

      let nextColor = card.color === 'wild' ? chosenColor || 'red' : card.color;
      
      if (player.isAI && card.color === 'wild') {
        const colorCounts = { red: 0, green: 0, blue: 0, yellow: 0 };
        player.hand.forEach(c => {
          if (c.color !== 'wild') colorCounts[c.color as keyof typeof colorCounts]++;
        });
        const colors = Object.keys(colorCounts) as Color[];
        nextColor = colors.reduce((a, b) => colorCounts[a as keyof typeof colorCounts] > colorCounts[b as keyof typeof colorCounts] ? a : b);
        if (colorCounts[nextColor as keyof typeof colorCounts] === 0) nextColor = 'red'; // fallback
      }

      const newHand = [...player.hand];
      newHand.splice(cardIndex, 1);

      const newPlayers = [...prev.players];
      newPlayers[playerIndex] = { ...player, hand: newHand };

      let nextDir = prev.direction;
      let skipNext = false;
      let cardsToDraw = 0;

      if (card.value === 'reverse') {
        nextDir = prev.direction === 1 ? -1 : 1;
      } else if (card.value === 'skip') {
        skipNext = true;
      } else if (card.value === 'draw2') {
        skipNext = true;
        cardsToDraw = 2;
      } else if (card.value === 'draw4') {
        skipNext = true;
        cardsToDraw = 4;
      }

      let currentDeck = [...prev.deck];
      let currentDiscard = [...prev.discardPile, card];

      if (cardsToDraw > 0) {
        let targetIndex = (playerIndex + nextDir) % 4;
        if (targetIndex < 0) targetIndex += 4;
        
        const drawn: Card[] = [];
        for (let i = 0; i < cardsToDraw; i++) {
          if (currentDeck.length === 0) {
            if (currentDiscard.length > 1) {
              const top = currentDiscard.pop()!;
              currentDeck = createDeck(); // Simplified reshuffle
              currentDiscard = [top];
            } else break;
          }
          drawn.push(currentDeck.pop()!);
        }
        
        const targetPlayer = newPlayers[targetIndex];
        newPlayers[targetIndex] = { ...targetPlayer, hand: [...targetPlayer.hand, ...drawn] };
      }

      let nextIndex = (playerIndex + nextDir) % 4;
      if (nextIndex < 0) nextIndex += 4;
      
      if (skipNext) {
        nextIndex = (nextIndex + nextDir) % 4;
        if (nextIndex < 0) nextIndex += 4;
      }

      let msg = newHand.length === 0 ? `${player.name} 赢了！` : newHand.length === 1 ? `${player.name} 喊了 UNO！` : `${player.name} 出了一张牌。`;

      return {
        ...prev,
        players: newPlayers,
        deck: currentDeck,
        discardPile: currentDiscard,
        currentColor: nextColor,
        direction: nextDir,
        currentPlayerIndex: nextIndex,
        winner: newHand.length === 0 ? player : null,
        isColorPickerOpen: false,
        pendingWildCard: null,
        message: msg,
      };
    });
  }, []);

  const drawCard = useCallback((playerId: string) => {
    setState(prev => {
      if (prev.winner) return prev;
      const playerIndex = prev.players.findIndex(p => p.id === playerId);
      if (playerIndex !== prev.currentPlayerIndex) return prev;

      let currentDeck = [...prev.deck];
      let currentDiscard = [...prev.discardPile];
      const drawn: Card[] = [];

      if (currentDeck.length === 0) {
        if (currentDiscard.length > 1) {
          const top = currentDiscard.pop()!;
          currentDeck = createDeck();
          currentDiscard = [top];
        }
      }

      if (currentDeck.length > 0) {
        drawn.push(currentDeck.pop()!);
      }

      const newPlayers = [...prev.players];
      newPlayers[playerIndex] = { ...newPlayers[playerIndex], hand: [...newPlayers[playerIndex].hand, ...drawn] };

      let nextIndex = (playerIndex + prev.direction) % 4;
      if (nextIndex < 0) nextIndex += 4;

      return {
        ...prev,
        players: newPlayers,
        deck: currentDeck,
        discardPile: currentDiscard,
        currentPlayerIndex: nextIndex,
        message: `${newPlayers[playerIndex].name} 抽了一张牌。`,
      };
    });
  }, []);

  useEffect(() => {
    if (state.winner) return;
    if (state.players.length === 0) return;
    
    const currentPlayer = state.players[state.currentPlayerIndex];
    if (!currentPlayer.isAI) return;

    if (aiTimeoutRef.current) clearTimeout(aiTimeoutRef.current);

    aiTimeoutRef.current = setTimeout(() => {
      const topCard = state.discardPile[state.discardPile.length - 1];
      const validCards = currentPlayer.hand.filter(c => isValidPlay(c, topCard, state.currentColor));

      if (validCards.length > 0) {
        playCard(currentPlayer.id, validCards[0].id);
      } else {
        drawCard(currentPlayer.id);
      }
    }, 1500);

    return () => {
      if (aiTimeoutRef.current) clearTimeout(aiTimeoutRef.current);
    };
  }, [state.currentPlayerIndex, state.players, state.discardPile, state.currentColor, state.winner, playCard, drawCard]);

  return {
    ...state,
    playCard,
    drawCard,
    initGame,
    setIsColorPickerOpen: (isOpen: boolean) => setState(prev => ({ ...prev, isColorPickerOpen: isOpen }))
  };
};
