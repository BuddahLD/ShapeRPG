import React from "react";
import { usePlayer } from "../lib/stores/usePlayer";

interface StatsInventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const StatsInventoryModal: React.FC<StatsInventoryModalProps> = ({ isOpen, onClose }) => {
  const { player } = usePlayer();

  if (!isOpen || !player) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="backdrop-blur-md bg-white/20 border border-white/30 shadow-lg rounded-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/20">
          <h2 className="text-stone-100 text-lg font-semibold">Character Stats</h2>
          <button
            onClick={onClose}
            className="text-stone-100 hover:text-white transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* Character Info */}
          <div className="space-y-3">
            <h3 className="text-stone-100 text-sm font-semibold uppercase tracking-wide">Character</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/10 rounded-lg p-3">
                <div className="text-stone-300 text-xs">Level</div>
                <div className="text-stone-100 text-lg font-semibold">{player.level}</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <div className="text-stone-300 text-xs">Gold</div>
                <div className="text-stone-100 text-lg font-semibold">{player.gold}</div>
              </div>
            </div>
            
            {/* XP Progress */}
            <div className="bg-white/10 rounded-lg p-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-stone-300 text-xs">Experience</span>
                <span className="text-stone-100 text-xs">{player.xp} / {100 * Math.pow(player.level, 2)}</span>
              </div>
              <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-secondary-400 to-secondary-500 rounded-full transition-all duration-500"
                  style={{ width: `${(player.xp / (100 * Math.pow(player.level, 2))) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="space-y-3">
            <h3 className="text-stone-100 text-sm font-semibold uppercase tracking-wide">Stats</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/10 rounded-lg p-3">
                <div className="text-stone-300 text-xs">Health</div>
                <div className="text-stone-100 text-lg font-semibold">{player.stats.hp}</div>
                <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden mt-1">
                  <div 
                    className="h-full bg-gradient-to-r from-red-400 to-red-500 rounded-full"
                    style={{ width: `${(player.stats.hp / 100) * 100}%` }}
                  />
                </div>
              </div>
              
              <div className="bg-white/10 rounded-lg p-3">
                <div className="text-stone-300 text-xs">Mana</div>
                <div className="text-stone-100 text-lg font-semibold">{player.stats.mana}</div>
                <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden mt-1">
                  <div 
                    className="h-full bg-gradient-to-r from-primary-400 to-primary-500 rounded-full"
                    style={{ width: `${(player.stats.mana / 50) * 100}%` }}
                  />
                </div>
              </div>
              
              <div className="bg-white/10 rounded-lg p-3">
                <div className="text-stone-300 text-xs">Attack</div>
                <div className="text-stone-100 text-lg font-semibold">{player.stats.atk}</div>
              </div>
              
              <div className="bg-white/10 rounded-lg p-3">
                <div className="text-stone-300 text-xs">Defense</div>
                <div className="text-stone-100 text-lg font-semibold">{player.stats.def}</div>
              </div>
              
              <div className="bg-white/10 rounded-lg p-3 col-span-2">
                <div className="text-stone-300 text-xs">Cast Speed</div>
                <div className="text-stone-100 text-lg font-semibold">{player.stats.castSpeed}</div>
              </div>
            </div>
          </div>

          {/* Spells */}
          <div className="space-y-3">
            <h3 className="text-stone-100 text-sm font-semibold uppercase tracking-wide">Spells Known</h3>
            {player.spells.length > 0 ? (
              <div className="grid grid-cols-1 gap-2">
                {player.spells.map((spellId, index) => (
                  <div key={index} className="bg-white/10 rounded-lg p-3 flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center mr-3">
                      <span className="text-white text-xs font-semibold">✨</span>
                    </div>
                    <div>
                      <div className="text-stone-100 text-sm font-medium capitalize">
                        {spellId.replace(/_/g, ' ')}
                      </div>
                      <div className="text-stone-300 text-xs">Active Spell</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white/10 rounded-lg p-4 text-center">
                <div className="text-stone-300 text-sm">No spells learned yet</div>
                <div className="text-stone-400 text-xs mt-1">Visit the trainer to learn spells</div>
              </div>
            )}
          </div>

          {/* Inventory Placeholder */}
          <div className="space-y-3">
            <h3 className="text-stone-100 text-sm font-semibold uppercase tracking-wide">Inventory</h3>
            <div className="bg-white/10 rounded-lg p-4 text-center">
              <div className="text-stone-300 text-sm">No items yet</div>
              <div className="text-stone-400 text-xs mt-1">Find items by exploring and defeating enemies</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsInventoryModal;