'use client';

import { useState, useRef, useEffect } from 'react';
import { useUno } from '@/hooks/useUno';
import { HandTracker, HandCursor } from '@/components/HandTracker';
import { UnoCard } from '@/components/Card';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { Color } from '@/lib/uno';

const colorClasses: Record<Color, string> = {
  red: 'bg-red-500',
  green: 'bg-green-500',
  blue: 'bg-blue-500',
  yellow: 'bg-yellow-400',
  wild: 'bg-gray-800'
};

export default function Home() {
  const {
    players,
    discardPile,
    currentPlayerIndex,
    direction,
    currentColor,
    winner,
    isColorPickerOpen,
    pendingWildCard,
    message,
    playCard,
    drawCard,
    initGame,
  } = useUno();

  const [cursor, setCursor] = useState<HandCursor | null>(null);
  const [draggedCardId, setDraggedCardId] = useState<string | null>(null);
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 });
  const discardPileRef = useRef<HTMLDivElement>(null);
  const pinchLockRef = useRef(false);

  useEffect(() => {
    if (winner && !winner.isAI) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [winner]);

  useEffect(() => {
    if (!cursor) return;

    const screenX = cursor.x * window.innerWidth;
    const screenY = cursor.y * window.innerHeight;

    if (cursor.isPinching) {
      if (draggedCardId) {
        setDragPos({ x: screenX, y: screenY });
        return;
      }

      if (pinchLockRef.current) return;

      const elements = document.elementsFromPoint(screenX, screenY);

      if (winner) {
        if (elements.some(el => el.id === 'play-again-btn')) {
          initGame();
          pinchLockRef.current = true;
        }
        return;
      }

      if (isColorPickerOpen && pendingWildCard) {
        const colorBtn = elements.find(el => el.id && el.id.startsWith('color-btn-'));
        if (colorBtn) {
          const color = colorBtn.id.replace('color-btn-', '') as Color;
          playCard('p1', pendingWildCard.id, color);
          pinchLockRef.current = true;
        }
        return;
      }

      if (elements.some(el => el.id === 'draw-pile')) {
        drawCard('p1');
        pinchLockRef.current = true;
        return;
      }

      const cardEl = elements.find(el => el.id && el.id.startsWith('card-'));
      if (cardEl) {
        setDraggedCardId(cardEl.id);
        setDragPos({ x: screenX, y: screenY });
      }
    } else {
      pinchLockRef.current = false;
      if (draggedCardId) {
        if (discardPileRef.current) {
          const rect = discardPileRef.current.getBoundingClientRect();
          // Expand drop zone a bit
          if (
            screenX >= rect.left - 50 && screenX <= rect.right + 50 &&
            screenY >= rect.top - 50 && screenY <= rect.bottom + 50
          ) {
            playCard('p1', draggedCardId);
          }
        }
        setDraggedCardId(null);
      }
    }
  }, [cursor, draggedCardId, playCard, drawCard, initGame, isColorPickerOpen, pendingWildCard, winner]);

  if (players.length === 0) return <div className="min-h-screen bg-green-800 flex items-center justify-center text-white text-2xl">Loading...</div>;

  const humanPlayer = players.find(p => !p.isAI)!;
  const aiPlayers = players.filter(p => p.isAI);

  return (
    <main className="min-h-screen bg-green-900 overflow-hidden relative font-sans text-white select-none">
      <div className="absolute inset-0 flex flex-col items-center justify-between p-4 sm:p-8">
        
        {/* Top AI */}
        <div className="flex flex-col items-center gap-2 mt-4">
          <div className="flex flex-col items-center gap-1 z-10">
            <span className={`font-bold px-4 py-1 rounded-full ${currentPlayerIndex === 2 ? 'bg-yellow-400 text-black' : 'bg-black/30'}`}>
              {aiPlayers[1].name}
            </span>
            <span className="text-xs font-bold bg-black/50 px-2 py-0.5 rounded-full">共 {aiPlayers[1].hand.length} 张</span>
          </div>
          <div className="flex -space-x-12 items-center">
            {aiPlayers[1].hand.slice(0, 7).map((_, i) => (
              <UnoCard key={i} isHidden className="scale-75" />
            ))}
          </div>
        </div>

        {/* Middle row */}
        <div className="flex w-full items-center px-2 sm:px-12">
          {/* Left AI */}
          <div className="w-1/3 flex justify-start min-w-0 relative h-48 items-center">
            <div className="absolute left-0 sm:left-4 flex flex-col items-center gap-1 z-10 transform -rotate-90 origin-center whitespace-nowrap">
              <span className={`font-bold px-3 py-1 text-sm sm:text-base rounded-full ${currentPlayerIndex === 1 ? 'bg-yellow-400 text-black' : 'bg-black/30'}`}>
                {aiPlayers[0].name}
              </span>
              <span className="text-xs font-bold bg-black/50 px-2 py-0.5 rounded-full">共 {aiPlayers[0].hand.length} 张</span>
            </div>
            <div className="absolute left-12 sm:left-20 transform -rotate-90 origin-center">
              <div className="flex -space-x-10 sm:-space-x-12 items-center">
                {aiPlayers[0].hand.slice(0, 7).map((_, i) => (
                  <UnoCard key={i} isHidden className="scale-75" />
                ))}
              </div>
            </div>
          </div>

          {/* Center Area */}
          <div className="w-1/3 flex justify-center gap-4 sm:gap-12 items-center min-w-0">
            <div className="flex flex-col items-center gap-3">
              <div 
                id="draw-pile"
                className="cursor-pointer hover:scale-105 transition-transform relative group"
                onClick={() => drawCard('p1')}
              >
                <UnoCard isHidden />
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-white font-bold text-lg drop-shadow-md">抽牌</span>
                </div>
              </div>
              <span className="text-white/90 font-black text-sm tracking-widest bg-black/40 px-3 py-1 rounded-full">抽牌</span>
            </div>

            <div className="flex flex-col items-center gap-3">
              <div ref={discardPileRef} className="relative w-20 h-28 sm:w-24 sm:h-36">
                {discardPile.map((card, i) => {
                  // Only render last 5 cards for performance
                  if (i < discardPile.length - 5) return null;
                  return (
                    <div key={card.id} className="absolute inset-0" style={{ transform: `rotate(${(i * 15) % 360}deg)` }}>
                      <UnoCard card={card} />
                    </div>
                  );
                })}
              </div>
              <span className="text-white/90 font-black text-sm tracking-widest bg-black/40 px-3 py-1 rounded-full">出牌</span>
            </div>
          </div>

          {/* Right AI */}
          <div className="w-1/3 flex justify-end min-w-0 relative h-48 items-center">
            <div className="absolute right-12 sm:right-20 transform rotate-90 origin-center">
              <div className="flex -space-x-10 sm:-space-x-12 items-center">
                {aiPlayers[2].hand.slice(0, 7).map((_, i) => (
                  <UnoCard key={i} isHidden className="scale-75" />
                ))}
              </div>
            </div>
            <div className="absolute right-0 sm:right-4 flex flex-col items-center gap-1 z-10 transform rotate-90 origin-center whitespace-nowrap">
              <span className={`font-bold px-3 py-1 text-sm sm:text-base rounded-full ${currentPlayerIndex === 3 ? 'bg-yellow-400 text-black' : 'bg-black/30'}`}>
                {aiPlayers[2].name}
              </span>
              <span className="text-xs font-bold bg-black/50 px-2 py-0.5 rounded-full">共 {aiPlayers[2].hand.length} 张</span>
            </div>
          </div>
        </div>

        {/* Human Player */}
        <div className="flex flex-col items-center gap-4 z-10 mb-4">
          <span className={`font-bold px-6 py-2 rounded-full text-xl ${currentPlayerIndex === 0 ? 'bg-yellow-400 text-black shadow-[0_0_15px_rgba(250,204,21,0.5)]' : 'bg-black/50'}`}>{humanPlayer.name}</span>
          <div className="flex flex-wrap justify-center gap-2 max-w-4xl relative min-h-[150px]">
            <AnimatePresence>
              {humanPlayer.hand.map((card) => {
                const isDragging = draggedCardId === card.id;
                return (
                  <motion.div
                    key={card.id}
                    layoutId={card.id}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ 
                      opacity: 1, 
                      y: 0,
                      scale: 1
                    }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    style={isDragging ? {
                      position: 'fixed',
                      left: dragPos.x - 40, // center card on cursor
                      top: dragPos.y - 60,
                      zIndex: 100,
                      pointerEvents: 'none'
                    } : {}}
                  >
                    <UnoCard 
                      id={card.id}
                      card={card} 
                      onClick={() => playCard('p1', card.id)}
                    />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Cursor */}
      {cursor && (
        <div 
          className="fixed w-8 h-8 rounded-full pointer-events-none z-50 transition-transform duration-75 flex items-center justify-center"
          style={{
            left: cursor.x * window.innerWidth - 16,
            top: cursor.y * window.innerHeight - 16,
            backgroundColor: cursor.isPinching ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.3)',
            transform: cursor.isPinching ? 'scale(0.8)' : 'scale(1)',
            boxShadow: '0 0 15px rgba(0,0,0,0.5)',
            border: '2px solid white'
          }}
        >
          {cursor.isPinching && <div className="w-2 h-2 bg-red-500 rounded-full" />}
        </div>
      )}

      {/* Color Picker Modal */}
      {isColorPickerOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-2xl shadow-2xl text-center">
            <h2 className="text-3xl font-black text-black mb-6">选择颜色</h2>
            <div className="grid grid-cols-2 gap-4">
              {(['red', 'green', 'blue', 'yellow'] as Color[]).map((color) => (
                <button
                  id={`color-btn-${color}`}
                  key={color}
                  className={`w-32 h-32 rounded-xl shadow-lg hover:scale-105 transition-transform ${colorClasses[color]} border-4 border-black/10`}
                  onClick={() => playCard('p1', pendingWildCard!.id, color)}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Winner Modal */}
      {winner && (
        <div className="fixed inset-0 bg-black/90 flex flex-col items-center justify-center z-50 backdrop-blur-md">
          <h1 className="text-7xl font-black text-yellow-400 mb-8 animate-bounce drop-shadow-[0_0_20px_rgba(250,204,21,0.8)]">{winner.name} 获胜！</h1>
          <button 
            id="play-again-btn"
            onClick={initGame}
            className="px-10 py-5 bg-white text-black font-black text-3xl rounded-full hover:bg-gray-200 transition-colors shadow-[0_0_30px_rgba(255,255,255,0.5)] hover:scale-105"
          >
            再玩一次
          </button>
        </div>
      )}

      {/* Message Toast */}
      <AnimatePresence>
        {message && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-8 py-4 rounded-full font-bold shadow-2xl z-40 border border-white/20 text-lg"
          >
            {message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Left Indicators */}
      <div className="fixed top-4 left-4 sm:top-8 sm:left-8 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 z-40">
        {/* Current Color Indicator */}
        <div className="flex items-center gap-3 bg-black/60 px-4 py-2 sm:px-6 sm:py-3 rounded-full shadow-lg border border-white/10">
          <span className="font-bold text-xs sm:text-sm uppercase tracking-wider">颜色</span>
          <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full ${colorClasses[currentColor]} border-2 border-white shadow-inner`} />
        </div>

        {/* Direction Indicator */}
        <div className="bg-black/60 px-4 py-2 sm:px-6 sm:py-3 rounded-full font-bold shadow-lg border border-white/10 flex items-center gap-2">
          <span className="text-xs sm:text-sm uppercase tracking-wider">方向</span>
          <span className="text-xl sm:text-2xl">{direction === 1 ? '→' : '←'}</span>
        </div>
      </div>

      <HandTracker onUpdate={setCursor} />
    </main>
  );
}
