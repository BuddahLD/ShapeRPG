import React from "react";
import { useGameState } from "../presentation/hooks/useGameStateManager";
import { usePlayer } from "../presentation/hooks/usePlayerManager";
// useInventory removed - using clean architecture instead
// gameData removed - using clean architecture instead

const Shop: React.FC = () => {
  const { showShop, setShowShop } = useGameState();
  const { player, updatePlayer } = usePlayer();
  // useInventory removed - using clean architecture instead

  if (!showShop || !player) return null;

  const handlePurchase = (item: any) => {
    if (player.gold >= item.cost) {
      // Deduct gold
      updatePlayer({ gold: player.gold - item.cost });
      
      // Add item to inventory
      addItem(item);
      
      // Apply immediate stat bonuses if it's equipment
      if (item.atk || item.def || item.hp || item.mana) {
        const statUpdate: any = {};
        
        if (item.atk) statUpdate.atk = player.stats.atk + item.atk;
        if (item.def) statUpdate.def = player.stats.def + item.def;
        if (item.hp) statUpdate.hp = Math.min(player.stats.hp + (item.hp || 0), 100 + (item.hp || 0));
        if (item.mana) statUpdate.mana = Math.min(player.stats.mana + (item.mana || 0), 50 + (item.mana || 0));
        
        updatePlayer({ stats: { ...player.stats, ...statUpdate } });
      }
      
      console.log(`Purchased ${item.name} for ${item.cost} gold`);
    } else {
      console.log("Not enough gold!");
    }
  };

  const handleClose = () => {
    setShowShop(null);
  };

  const getShopItems = () => {
    if (showShop === "weapons") {
      return gameData.shops.weapons;
    } else if (showShop === "armor") {
      return gameData.shops.armor;
    }
    return [];
  };

  const shopItems = getShopItems();
  const shopTitle = showShop === "weapons" ? "Weapon Shop" : "Armor Shop";

  return (
    <div className="fixed inset-0 z-40 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-white text-xl font-bold">{shopTitle}</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>
        
        <div className="mb-4">
          <p className="text-yellow-400">Gold: {player.gold}</p>
        </div>

        <div className="space-y-3">
          {shopItems.map((item) => (
            <div
              key={item.id}
              className="bg-gray-700 rounded-lg p-4 border border-gray-600"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-white font-semibold">{item.name}</h3>
                <span className="text-yellow-400 font-bold">{item.cost}g</span>
              </div>
              
              <div className="text-sm text-gray-300 mb-3">
                {item.atk && <span className="mr-3">⚔️ ATK: +{item.atk}</span>}
                {item.def && <span className="mr-3">🛡️ DEF: +{item.def}</span>}
                {item.hp && <span className="mr-3">❤️ HP: +{item.hp}</span>}
                {item.mana && <span className="mr-3">💙 Mana: +{item.mana}</span>}
              </div>
              
              <button
                onClick={() => handlePurchase(item)}
                disabled={player.gold < item.cost}
                className={`w-full py-2 px-4 rounded-lg font-semibold transition-all duration-200 ${
                  player.gold >= item.cost
                    ? "bg-green-600 hover:bg-green-700 text-white active:scale-95"
                    : "bg-gray-600 text-gray-400 cursor-not-allowed"
                }`}
              >
                {player.gold >= item.cost ? "Purchase" : "Not enough gold"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Shop;
