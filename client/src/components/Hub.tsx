import React from "react";
import { useGameState } from "../lib/stores/useGameState";
import { usePlayer } from "../lib/stores/usePlayer";

const Hub: React.FC = () => {
  const { setCurrentLocation, setShowShop, nearbyNPC, interactWithNPC } = useGameState();
  const { player } = usePlayer();

  const handleEnterArena = () => {
    setCurrentLocation("LOC_ARENA_1");
  };

  const handleOpenWeaponShop = () => {
    setShowShop("weapons");
  };

  const handleOpenArmorShop = () => {
    setShowShop("armor");
  };

  const handleOpenTrainer = () => {
    // TODO: Implement trainer interface
    console.log("Trainer interface not yet implemented");
  };

  if (!player) return null;

  const getNPCName = (npcId: string) => {
    switch (npcId) {
      case 'weapon_shop': return '⚔️ Weapon Shop';
      case 'armor_shop': return '🛡️ Armor Shop';
      case 'trainer': return '📚 Trainer';
      default: return 'Unknown NPC';
    }
  };

  return (
    <div className="absolute inset-0 z-5 pointer-events-none">
      {/* NPC Interaction Prompt */}
      {nearbyNPC && (
        <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto">
          <div className="bg-black bg-opacity-80 rounded-lg px-6 py-4 border-2 border-white">
            <p className="text-white text-center mb-2">Near: {getNPCName(nearbyNPC)}</p>
            <button
              onClick={interactWithNPC}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg w-full transition-all duration-200 active:scale-95"
            >
              Press to Interact
            </button>
          </div>
        </div>
      )}


      {/* Hub Instructions */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 pointer-events-auto">
        <div className="bg-black bg-opacity-70 rounded-lg px-4 py-2">
          <p className="text-white text-sm text-center">
            Walk to NPCs to interact. Go east to explore fields, then arena!
          </p>
        </div>
      </div>
    </div>
  );
};

export default Hub;
