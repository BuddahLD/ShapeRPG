import React, { useState } from "react";
import { usePlayer } from "../presentation/hooks/usePlayerManager";

interface StatsInventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: 'stats' | 'spells' | 'inventory';
  setActiveTab: (tab: 'stats' | 'spells' | 'inventory') => void;
}

type TabType = 'stats' | 'spells' | 'inventory';

const StatsInventoryModal: React.FC<StatsInventoryModalProps> = ({ isOpen, onClose, activeTab, setActiveTab }) => {
  console.log('StatsInventoryModal: Component rendered with props:', { isOpen, activeTab });
  
  const { player } = usePlayer();
  console.log('StatsInventoryModal: usePlayer returned:', player);

  if (!isOpen) {
    console.log('StatsInventoryModal: Returning null because isOpen = false');
    return null;
  }
  
  // Define handleBackdropClick before using it in fallback modal
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!player) {
    console.log('StatsInventoryModal: Player data missing, using fallback data');
    // Use fallback data to prevent modal from disappearing
    const fallbackPlayer = {
      level: 1,
      experience: 0,
      gold: 100,
      stats: {
        hp: 100,
        maxHp: 100,
        mana: 50,
        maxMana: 50,
        attack: 10,
        defense: 5,
        castSpeed: 1.0
      },
      knownSpells: ['fire-bolt', 'ice-shard', 'shield-aura'],
      inventory: []
    };
    
    return (
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[1000] flex items-center justify-center p-4 pointer-events-auto"
        onClick={handleBackdropClick}
        style={{ touchAction: 'none' }}
      >
        <div className="backdrop-blur-md bg-white/20 border border-white/30 shadow-lg rounded-xl max-w-sm w-full h-[500px] flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-white/20 flex-shrink-0">
            <h2 className="text-stone-100 text-lg font-semibold">Character (Fallback)</h2>
            <button
              onClick={onClose}
              className="text-stone-100 hover:text-white transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <div className="text-stone-300 text-center">Player data is loading...</div>
          </div>
        </div>
      </div>
    );
  }

  const renderStatsTab = () => (
    <div className="space-y-3">
      {/* Character Info */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white/10 rounded-lg p-2 text-center">
          <div className="text-stone-300 text-xs">Level</div>
          <div className="text-stone-100 text-sm font-semibold">{player.level}</div>
        </div>
        <div className="bg-white/10 rounded-lg p-2 text-center">
          <div className="text-stone-300 text-xs">Gold</div>
          <div className="text-stone-100 text-sm font-semibold">{player.gold}</div>
        </div>
        <div className="bg-white/10 rounded-lg p-2 text-center">
          <div className="text-stone-300 text-xs">XP</div>
                        <div className="text-stone-100 text-sm font-semibold">{player.experience}/{100 * Math.pow(player.level, 2)}</div>
        </div>
      </div>
      
      {/* XP Progress */}
      <div className="bg-white/10 rounded-lg p-2">
        <div className="text-stone-300 text-xs mb-1">Experience Progress</div>
        <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-secondary-400 to-secondary-500 rounded-full transition-all duration-500"
            style={{ width: `${(player.experience / (100 * Math.pow(player.level, 2))) * 100}%` }}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-white/10 rounded-lg p-2">
          <div className="text-stone-300 text-xs">Health</div>
          <div className="text-stone-100 text-sm font-semibold">{player.stats.hp}/100</div>
          <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden mt-1">
            <div 
              className="h-full bg-gradient-to-r from-red-400 to-red-500 rounded-full"
              style={{ width: `${(player.stats.hp / 100) * 100}%` }}
            />
          </div>
        </div>
        
        <div className="bg-white/10 rounded-lg p-2">
          <div className="text-stone-300 text-xs">Mana</div>
          <div className="text-stone-100 text-sm font-semibold">{player.stats.mana}/50</div>
          <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden mt-1">
            <div 
              className="h-full bg-gradient-to-r from-primary-400 to-primary-500 rounded-full"
              style={{ width: `${(player.stats.mana / 50) * 100}%` }}
            />
          </div>
        </div>
        
        <div className="bg-white/10 rounded-lg p-2 text-center">
          <div className="text-stone-300 text-xs">Attack</div>
          <div className="text-stone-100 text-sm font-semibold">{player.stats.attack}</div>
        </div>
        
        <div className="bg-white/10 rounded-lg p-2 text-center">
          <div className="text-stone-300 text-xs">Defense</div>
          <div className="text-stone-100 text-sm font-semibold">{player.stats.defense}</div>
        </div>
      </div>
      
      <div className="bg-white/10 rounded-lg p-2 text-center">
        <div className="text-stone-300 text-xs">Cast Speed</div>
        <div className="text-stone-100 text-sm font-semibold">{player.stats.castSpeed}</div>
      </div>
    </div>
  );

  const renderSpellsTab = () => (
    <div className="space-y-2">
      {player.knownSpells.length > 0 ? (
        player.knownSpells.map((spellId, index) => (
          <div key={index} className="bg-white/10 rounded-lg p-3 flex items-center">
            <div className="w-6 h-6 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center mr-3">
              <span className="text-white text-xs">✨</span>
            </div>
            <div className="flex-1">
              <div className="text-stone-100 text-sm font-medium capitalize">
                {spellId.replace(/_/g, ' ')}
              </div>
              <div className="text-stone-300 text-xs">Active Spell</div>
            </div>
          </div>
        ))
      ) : (
        <div className="bg-white/10 rounded-lg p-4 text-center">
          <div className="text-stone-300 text-sm">No spells learned</div>
          <div className="text-stone-400 text-xs mt-1">Visit the trainer to learn spells</div>
        </div>
      )}
    </div>
  );

  const renderInventoryTab = () => (
    <div className="space-y-2">
      <div className="bg-white/10 rounded-lg p-4 text-center">
        <div className="text-stone-300 text-sm">Inventory empty</div>
        <div className="text-stone-400 text-xs mt-1">Find items by exploring and defeating enemies</div>
      </div>
    </div>
  );

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[1000] flex items-center justify-center p-4 pointer-events-auto"
      onClick={handleBackdropClick}
      style={{ touchAction: 'none' }}
    >
      <div className="backdrop-blur-md bg-white/20 border border-white/30 shadow-lg rounded-xl max-w-sm w-full h-[500px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/20 flex-shrink-0">
          <h2 className="text-stone-100 text-lg font-semibold">Character</h2>
          <button
            onClick={onClose}
            className="text-stone-100 hover:text-white transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/20 flex-shrink-0">
          {[
            { id: 'inventory' as TabType, label: 'Items', icon: '🎒' },
            { id: 'stats' as TabType, label: 'Stats', icon: '📊' },
            { id: 'spells' as TabType, label: 'Spells', icon: (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3"/>
                <path d="M12 1v6m0 6v6"/>
                <path d="m21 12-6-3-6 3-6-3"/>
                <path d="M12 8L8 4l4-4 4 4-4 4"/>
                <path d="M12 16l4 4-4 4-4-4 4-4"/>
              </svg>
            ) }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 px-2 text-xs font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-stone-100 bg-white/10'
                  : 'text-stone-300 hover:text-stone-100'
              }`}
            >
              <div className="flex flex-col items-center space-y-1">
                <span className="text-stone-100">{tab.icon}</span>
                <span>{tab.label}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'stats' && renderStatsTab()}
          {activeTab === 'spells' && renderSpellsTab()}
          {activeTab === 'inventory' && renderInventoryTab()}
        </div>
      </div>
    </div>
  );
};

export default StatsInventoryModal;