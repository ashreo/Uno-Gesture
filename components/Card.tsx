import { Card as CardType } from '@/lib/uno';
import { motion } from 'motion/react';

export const UnoCard = ({ 
  card, 
  isHidden = false, 
  onClick, 
  className = '',
  style,
  id
}: { 
  card?: CardType; 
  isHidden?: boolean; 
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
  id?: string;
}) => {
  if (isHidden) {
    return (
      <motion.div 
        id={id}
        className={`w-16 h-24 sm:w-20 sm:h-32 rounded-xl bg-black border-2 border-white shadow-lg flex items-center justify-center ${className}`}
        style={style}
      >
        <div className="w-12 h-20 sm:w-16 sm:h-28 rounded-lg border-2 border-red-500 bg-red-600 flex items-center justify-center transform -rotate-12">
          <span className="text-yellow-400 font-bold text-lg sm:text-xl italic transform rotate-12">UNO</span>
        </div>
      </motion.div>
    );
  }

  if (!card) return null;

  const bgColors = {
    red: 'bg-red-500',
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    yellow: 'bg-yellow-400',
    wild: 'bg-gray-800'
  };

  const textColors = {
    red: 'text-red-500',
    green: 'text-green-500',
    blue: 'text-blue-500',
    yellow: 'text-yellow-500',
    wild: 'text-black'
  };

  const displayValue = () => {
    switch (card.value) {
      case 'skip': return '⊘';
      case 'reverse': return '⇄';
      case 'draw2': return '+2';
      case 'draw4': return '+4';
      case 'wild': return 'W';
      default: return card.value;
    }
  };

  return (
    <motion.div 
      id={id}
      onClick={onClick}
      className={`w-20 h-28 sm:w-24 sm:h-36 rounded-xl border-4 border-white shadow-xl flex flex-col items-center justify-center relative cursor-pointer ${bgColors[card.color]} ${className}`}
      style={style}
      whileHover={{ y: -10, scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <div className="absolute top-1 left-2 text-white font-bold text-xs sm:text-sm">{displayValue()}</div>
      <div className="absolute bottom-1 right-2 text-white font-bold text-xs sm:text-sm transform rotate-180">{displayValue()}</div>
      
      <div className="w-14 h-20 sm:w-16 sm:h-24 bg-white rounded-[2rem] flex items-center justify-center transform -rotate-12 shadow-inner">
        <span className={`font-black text-3xl sm:text-4xl transform rotate-12 ${textColors[card.color]}`}>
          {displayValue()}
        </span>
      </div>
    </motion.div>
  );
};
