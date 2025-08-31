import React from "react";
import StatsInventoryModal from "./StatsInventoryModal";
import { HPMPContainer } from "./ui/HPMPContainer";
import { LocationIndicator } from "./ui/LocationIndicator";
import { PlayerProgressBar } from "./ui/PlayerProgressBar";
import { ActionBar } from "./ui/ActionBar";

/**
 * GameHUD - Single Responsibility: Orchestrate UI components layout
 * SOLID: Composes focused components, each with single responsibility
 */
interface GameHUDProps {
  showCharInfo: boolean;
  setShowCharInfo: (show: boolean) => void;
  activeTab: 'stats' | 'spells' | 'inventory';
  setActiveTab: (tab: 'stats' | 'spells' | 'inventory') => void;
}

const GameHUD: React.FC<GameHUDProps> = ({ showCharInfo, setShowCharInfo, activeTab, setActiveTab }) => {
  const handleLevelBarClick = () => {
    setShowCharInfo(true);
    setActiveTab('inventory');
  };

  const handleCloseCharInfo = () => {
    setShowCharInfo(false);
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      {/* SOLID: Each component has single responsibility and is extensible */}
      <HPMPContainer 
        wrapContent={true}
        maxWidth="250px"
        className="bg-white/5 border-white/20"
      />
      <LocationIndicator />
      <PlayerProgressBar onLevelBarClick={handleLevelBarClick} />
      <ActionBar />

      {/* Character Info Modal */}
      {showCharInfo && (
        <StatsInventoryModal
          isOpen={showCharInfo}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onClose={handleCloseCharInfo}
        />
      )}
    </div>
  );
};

export default GameHUD;