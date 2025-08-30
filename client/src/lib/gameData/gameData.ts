export const gameData = {
  hero_start: {
    level: 1,
    xp: 0,
    stats: {
      hp: 100,
      mana: 50,
      atk: 5,
      def: 2,
      castSpeed: 1.0
    },
    spells: ["SPL01"],
    inventory: []
  },
  
  enemies_arena1: [
    {
      id: "TRI_SMALL",
      shape: "Triangle",
      hp: 30,
      atk: 3,
      def: 1,
      xp: 10,
      gold: [5, 10],
      bookDrop: 0.05,
      attackWindow: 1000
    },
    {
      id: "TRI_MEDIUM",
      shape: "Triangle",
      hp: 60,
      atk: 6,
      def: 2,
      xp: 20,
      gold: [10, 20],
      bookDrop: 0.07,
      attackWindow: 900
    },
    {
      id: "TRI_ELITE",
      shape: "Triangle",
      hp: 120,
      atk: 10,
      def: 3,
      xp: 50,
      gold: [20, 40],
      bookDrop: 0.12,
      attackWindow: 800
    }
  ],
  
  shops: {
    weapons: [
      { id: "WPN01", name: "Wooden Wand", atk: 3, cost: 50 },
      { id: "WPN02", name: "Iron Staff", atk: 6, cost: 120 },
      { id: "WPN03", name: "Crystal Rod", atk: 10, mana: 5, cost: 250 }
    ],
    armor: [
      { id: "ARM01", name: "Cloth Robe", def: 2, cost: 40 },
      { id: "ARM02", name: "Leather Coat", def: 5, cost: 100 },
      { id: "ARM03", name: "Magic Cloak", def: 8, hp: 20, cost: 220 }
    ]
  },
  
  spells: [
    {
      id: "SPL01",
      name: "Fire Bolt",
      pattern: "line",
      level: 1,
      mana: 5,
      castTime: 1000,
      effect: { type: "damage", amount: 10 },
      type: "attack"
    },
    {
      id: "SPL02",
      name: "Ice Shard",
      pattern: "zigzag",
      level: 2,
      mana: 8,
      castTime: 1200,
      effect: { type: "damage+slow", damage: 8, slowSeconds: 2 },
      type: "attack"
    },
    {
      id: "SPL03",
      name: "Shield Aura",
      pattern: "circle",
      level: 3,
      mana: 12,
      castTime: 1500,
      effect: { type: "buff", defPlus: 5, durationSec: 10 },
      type: "buff"
    },
    {
      id: "SPL04",
      name: "Dark Mist",
      pattern: "wave",
      level: 4,
      mana: 15,
      castTime: 2000,
      effect: { type: "blackout", target: "enemies", durationSec: 3 },
      type: "debuff"
    }
  ],
  
  debuff_pool: [
    { id: "DBF_SELF_DMG", effect: "self_damage", amount: 5 },
    { id: "DBF_SLOW", effect: "slow_player", multiplier: 0.5, durationSec: 2 },
    { id: "DBF_BLACKOUT", effect: "screen_blackout", durationSec: 2 },
    { id: "DBF_WEAKNESS", effect: "atk_scale", multiplier: 0.001, durationSec: 3 }
  ],
  
  locations: [
    {
      id: "LOC_HUB_FIGUREIUM",
      name: "Фігуріум",
      type: "hub_safe",
      npcs: ["NPC_SHOP_WEAPONS", "NPC_SHOP_ARMOR", "NPC_TRAINER"]
    },
    {
      id: "LOC_ARENA_1",
      name: "Арена #1",
      type: "combat",
      enemies: ["TRI_SMALL", "TRI_MEDIUM", "TRI_ELITE"]
    }
  ],
  
  npcs: [
    {
      id: "NPC_SHOP_WEAPONS",
      type: "shop_weapons",
      inventory_ids: ["WPN01", "WPN02", "WPN03"]
    },
    {
      id: "NPC_SHOP_ARMOR",
      type: "shop_armor",
      inventory_ids: ["ARM01", "ARM02", "ARM03"]
    },
    {
      id: "NPC_TRAINER",
      type: "trainer",
      services: ["teach_spells", "upgrade_time_slow"],
      teaches_spell_ids: ["SPL02", "SPL03", "SPL04"]
    }
  ]
};
