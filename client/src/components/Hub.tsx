import React from "react";
import { useGameState } from "../lib/stores/useGameState";
import { usePlayer } from "../lib/stores/usePlayer";

const Hub: React.FC = () => {
  const { setCurrentLocation, setShowShop } = useGameState();
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

  return (
    <div className="absolute inset-0 z-5 pointer-events-none">
      {/* NPCs and Interaction Points */}
      <div className="absolute top-1/2 left-1/4 transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto">
        <button
          onClick={handleOpenWeaponShop}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg transition-all duration-200 active:scale-95"
        >
          🗡️ Weapon Shop
        </button>
      </div>

      <div className="absolute top-1/2 right-1/4 transform translate-x-1/2 -translate-y-1/2 pointer-events-auto">
        <button
          onClick={handleOpenArmorShop}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow-lg transition-all duration-200 active:scale-95"
        >
          🛡️ Armor Shop
        </button>
      </div>

      <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto">
        <button
          onClick={handleOpenTrainer}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg shadow-lg transition-all duration-200 active:scale-95"
        >
          📚 Trainer
        </button>
      </div>

      {/* Arena Entrance */}
      <div className="absolute bottom-1/4 left-1/2 transform -translate-x-1/2 translate-y-1/2 pointer-events-auto">
        <button
          onClick={handleEnterArena}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg shadow-lg transition-all duration-200 active:scale-95 text-lg font-bold"
        >
          ⚔️ Enter Arena
        </button>
      </div>

      {/* Hub Instructions */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 pointer-events-auto">
        <div className="bg-black bg-opacity-70 rounded-lg px-4 py-2">
          <p className="text-white text-sm text-center">
            Welcome to Figureium Hub! Visit shops to upgrade your gear or enter the Arena to fight.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Hub;
