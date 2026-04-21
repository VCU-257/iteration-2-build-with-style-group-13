// MÖRK BORG Bare Bones dice + ruleset wiring
// Rule references cite the Bare Bones Edition PDF page numbers.
(function () {
  'use strict';

  var STORE_PREFIX = 'mb.rules.';

  function readFlag(key) {
    try { return localStorage.getItem(STORE_PREFIX + key) === 'true'; }
    catch (e) { return false; }
  }

  function readString(key) {
    try { return localStorage.getItem(STORE_PREFIX + key) || ''; }
    catch (e) { return ''; }
  }

  function writeValue(key, value) {
    try { localStorage.setItem(STORE_PREFIX + key, value); } catch (e) { /* ignore */ }
  }

  function rollDie(sides) {
    return Math.floor(Math.random() * sides) + 1;
  }

  function rollNdX(count, sides) {
    var total = 0;
    for (var i = 0; i < count; i += 1) total += rollDie(sides);
    return total;
  }

  // Bare Bones p.27 — 3d6 sum mapped to ability modifier (-3 to +3)
  function sumToAbility(sum) {
    if (sum <= 4) return -3;
    if (sum <= 6) return -2;
    if (sum <= 8) return -1;
    if (sum <= 12) return 0;
    if (sum <= 14) return 1;
    if (sum <= 16) return 2;
    return 3;
  }

  function rollAbility3d6() {
    var sum = rollNdX(3, 6);
    return { sum: sum, notation: '3d6=' + sum, value: sumToAbility(sum) };
  }

  // p.27 optional — 4d6 drop lowest (non-class rule, allowed for two abilities)
  function rollAbility4d6DropLowest() {
    var rolls = [rollDie(6), rollDie(6), rollDie(6), rollDie(6)].sort(function (a, b) { return a - b; });
    var sum = rolls[1] + rolls[2] + rolls[3];
    return { sum: sum, notation: '4d6d=' + sum, value: sumToAbility(sum) };
  }

  function setInput(id, value) {
    var input = document.getElementById(id);
    if (!input) return;
    input.value = value;
    input.classList.add('rolling');
    setTimeout(function () { input.classList.remove('rolling'); }, 250);
  }

  function showResult(id, text) {
    var el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  function currentAbilityRoll() {
    return readFlag('variant4d6') ? rollAbility4d6DropLowest() : rollAbility3d6();
  }

  function rollAbilityFor(ability) {
    var r = currentAbilityRoll();
    var signed = (r.value >= 0 ? '+' : '') + r.value;
    setInput(ability, r.value);
    showResult(ability + 'Result', r.notation + ' → ' + signed);
  }

  function rollAllAbilities() {
    ['strength', 'agility', 'presence', 'toughness'].forEach(rollAbilityFor);
  }

  // p.29 — HP: Toughness + d8, minimum 1
  function rollHp() {
    var toughEl = document.getElementById('toughness');
    if (!toughEl || toughEl.value === '') {
      showResult('hpResult', 'roll toughness first');
      return;
    }
    var tough = parseInt(toughEl.value, 10) || 0;
    var die = rollDie(8);
    var hp = Math.max(1, tough + die);
    setInput('hp', hp);
    showResult('hpResult', 'd8=' + die + ' + tgh=' + (tough >= 0 ? '+' + tough : tough) + ' → ' + hp);
  }

  // p.21 — 2d6 × 10 starting silver
  function rollSilver() {
    var a = rollDie(6);
    var b = rollDie(6);
    var amount = (a + b) * 10;
    setInput('silver', amount);
    showResult('silverResult', '2d6=' + (a + b) + ' × 10 → ' + amount + 's');
  }

  // p.37 — Omens. Default d2; varies by class (Esoteric Hermit/Heretical Priest d4)
  function rollOmen() {
    var classEl = document.getElementById('className');
    var cls = classEl ? (classEl.value || '') : '';
    var die = 2;
    if (cls === 'Esoteric Hermit' || cls === 'Heretical Priest') die = 4;
    var value = rollDie(die);
    setInput('omen', value);
    showResult('omenResult', 'd' + die + ' → ' + value);
  }

  // ----- Rules toggles (persist to localStorage) -----
  function bindRulesControls() {
    var toggles = document.querySelectorAll('[data-rule-toggle]');
    toggles.forEach(function (toggle) {
      var key = toggle.getAttribute('data-rule-toggle');
      toggle.checked = readFlag(key);
      toggle.addEventListener('change', function () {
        writeValue(key, toggle.checked);
      });
    });

    var selects = document.querySelectorAll('[data-rule-select]');
    selects.forEach(function (select) {
      var key = select.getAttribute('data-rule-select');
      var saved = readString(key);
      if (saved) select.value = saved;
      select.addEventListener('change', function () {
        writeValue(key, select.value);
      });
    });

    var houseRules = document.getElementById('houseRules');
    if (houseRules) {
      houseRules.value = readString('house');
      houseRules.addEventListener('input', function () {
        writeValue('house', houseRules.value);
      });
    }
  }

  function bindButtons() {
    var handlers = {
      rollStrength:     function () { rollAbilityFor('strength'); },
      rollAgility:      function () { rollAbilityFor('agility'); },
      rollPresence:     function () { rollAbilityFor('presence'); },
      rollToughness:    function () { rollAbilityFor('toughness'); },
      rollAllAbilities: rollAllAbilities,
      rollHp:           rollHp,
      rollSilver:       rollSilver,
      rollOmen:         rollOmen
    };
    Object.keys(handlers).forEach(function (id) {
      var btn = document.getElementById(id);
      if (btn) btn.addEventListener('click', handlers[id]);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    bindButtons();
    bindRulesControls();
  });
})();

// ======================================================================
// MÖRK BORG table data + rollers (Bare Bones Edition page references)
// Shared across CharacterCreation, CharacterPage, Library.
// ======================================================================
(function () {
  'use strict';

  var NAMES = [
    "Aerg-Tval","Agn","Arvant","Belsum","Belum","Brint","Börda","Daeru",
    "Eldar","Felban","Gotven","Graft","Grin","Grittr","Haerü","Hargha",
    "Harmug","Jotna","Karg","Karva","Katla","Keftar","Klort","Kratar",
    "Kutz","Kvetin","Lygan","Margar","Merkari","Nagl","Niduk","Nifehl",
    "Prügl","Qillnach","Risten","Svind","Theras","Therg","Torvul","Törn",
    "Urm","Urvarg","Vagal","Vatan","Von","Vrakh","Vresi","Wemut"
  ];

  // Class → origin table (pp.46-56)
  var ORIGINS = {
    "Fanged Deserter": [
      "A burnt-black building in Sarkash. Your home?",
      "A derelict rotting ship rolling endlessly across a grey sea.",
      "A brothel in Schleswig. Quite a friendly environment.",
      "Sleeping with dogs in the corner of an inn, waiting for someone to return.",
      "Following an army in eastern Wästland.",
      "Suckling a wolf in the wild of Bergen Chrypt."
    ],
    "Gutterborn Scum": [
      "Dumped onto a moving shit-cart still in your birth caul.",
      "Mother hanged from a tree outside of Galgenbeck, you fell from the corpse.",
      "Raised by rats in the gutters of Grift.",
      "Kicked and beaten beneath a baker's table in Schleswig.",
      "Escaped the Tvelandian orphanarium.",
      "Educated by outlaws in a hovel south of Alliáns."
    ],
    "Esoteric Hermit": [
      "Awakening, adult, in a ritual circle underneath the northern bridge to Grift.",
      "Wandered, memoryless, from the mouth of a cavern at the cliffs of Terion.",
      "Single child survivor of an incident in the Valley of the Unfortunate Undead.",
      "Dying of plague in a Bergen Chrypt hovel, you touched something from outside.",
      "An average individual until you encountered something in a dim glade in Sarkash.",
      "Raised on a lonely island in Lake Onda. No one else has ever heard of this island and you can't return."
    ],
    "Wretched Royalty": [
      "Your Wästland palace was reduced to rubble.",
      "Your caravan kingdom of Tveland fell into penury.",
      "King Fathmu IX's brother Zigmund, your father, was murdered.",
      "The southern empire of Südglans sank into the sea.",
      "Anthelia demanded a gift of noble blood.",
      "Two young princes were kidnapped west of Bergen Chrypt and disappeared into the black crevasse of the eastern slopes."
    ],
    "Heretical Priest": [
      "Galgenbeck, near the cathedral of the Two-Headed Basilisks.",
      "Massacred Alliáns cult, sole survivor.",
      "The crypts of Grift.",
      "Temple ruins in the Valley of the Unfortunate Undead.",
      "One of the many Graven-Tosk thief-tunnels.",
      "Secret Bergen Chrypt church."
    ],
    "Occult Herbmaster": [
      "Calm isolation in the Sarkash dark.",
      "Calm isolation in the Sarkash dark.",
      "Calm isolation in the Sarkash dark.",
      "The illegal midnight markets of Schleswig.",
      "The heretic isle of Crëlut, two nautical miles east of Grift.",
      "The old frozen ruins not far from Alliáns.",
      "A little witches cottage in Galgenbeck.",
      "The ruins of the Shadow King's manse, thick with memories of mushrooms and smoke."
    ]
  };

  // Terrible Traits — d20 (p.38)
  var TERRIBLE_TRAITS = [
    "Endlessly aggravated","Inferiority complex","Problems with authority","Loud mouth",
    "Cruel","Egocentric","Nihilistic","Prone to substance abuse","Conflicted","Shrewd",
    "Vindictive","Cowardly","Lazy","Suspicious","Ruthless","Worried","Bitter","Deceitful",
    "Wasteful","Arrogant"
  ];

  // Broken Bodies — d20 (p.39)
  var BROKEN_BODIES = [
    "Staring manic gaze.",
    "Covered in (for some) blasphemous tattoos.",
    "Rotting face. Wears a mask.",
    "Lost three toes, limps.",
    "Starved: gaunt and pale.",
    "One hand replaced with rusting hook (d6 damage).",
    "Decaying teeth.",
    "Hauntingly beautiful, unnervingly clean.",
    "Hands caked with sores.",
    "Cataracts slowly but surely spreading in both eyes.",
    "Long tangled hair, at least one cockroach in residence.",
    "Broken, crushed ears.",
    "Juddering and stuttering from nerve damage or stress.",
    "Corpulent, ravenous, drooling.",
    "One hand lacks thumb and index finger, grips like a lobster.",
    "Red, swollen alcoholic's nose.",
    "Resting maniac face, making friends is hard.",
    "Chronic athlete's foot. Stinks.",
    "Recently slashed and stinking eye covered with a patch.",
    "Nails cracked and black, maybe about to drop off."
  ];

  // Bad Habits — d20 (p.40)
  var BAD_HABITS = [
    "Obsessively collect small sharp stones.",
    "Won't use a blade without testing it on your own flesh. Arms knitted with scars.",
    "Can't stop drinking once you start.",
    "Gambling addict. Must bet every day. If you lose, raise and bet again.",
    "Cannot tolerate criticism of any kind. Results in rage and weeping.",
    "Unable to get to the point. Have never actually finished a story.",
    "Best friend is a skull. Carry it with you, tell it everything, you trust no one more.",
    "You pick your nose so deep it bleeds.",
    "Laugh hysterically at your own jokes which you then explain in detail.",
    "A nihilist. You insist on telling everyone you are a nihilist and explaining why.",
    "Inveterate bug eater.",
    "Stress response is aesthetic display. The worse things get the fancier you need to be.",
    "Permanent phlegm deposit in throat. Continuously cough, snort, spit and swallow.",
    "Pyromaniac.",
    "Consistently lose important items and forget vital facts.",
    "Insecure shit-stirrer. Will talk about whoever just left the room.",
    "You stutter when lying.",
    "You giggle insanely at the worst possible times.",
    "You whistle while trying to hide. You will deny this.",
    "You make jewelry from the teeth of the dead."
  ];

  // Troubling Tales — d20 (p.41-42)
  var TROUBLING_TALES = [
    "Pursued for manslaughter. There is a bounty.",
    "In massive debt. The debt is being traded to successively more ruthless groups.",
    "Have a rare, sought after item.",
    "Have a cursed never healing wound.",
    "Had an illegal, immoral and secret affair with a member of the royal family. Has proof.",
    "Escaped cult member. Terrified and paranoid.",
    "An identity thief who recently killed and replaced this person.",
    "Banished and disowned for unspecified deeds. Can never go home.",
    "Deserted military after witnessing a massacre, bounty on head.",
    "Very recently murdered a close relative. Very recently.",
    "A puzzle cube has been calibrated incorrectly (or has it?), awakening a slumbering abomination.",
    "Evil creatures love the scent of your spoor and are drawn to it, bringing disaster in your wake.",
    "A battle wound left a shard of metal slowly inching closer to your heart.",
    "Violence forced you into the wilderness. You think waving trees are whispering.",
    "Cursed to share the nightmares of others, you sleep far, far away.",
    "At permanent war with all corvids. No contact without some violence.",
    "After dreaming of an underground temple to a forgotten god you understand the songs of insects and worms.",
    "Being tracked and observed by a golem after an agreement which you know has been wiped from your mind.",
    "\"Burn or be burned\" is the fate you accept.",
    "Your flesh heals twice as fast, but your companions twice as slow. You see a many-eyed \"guardian angel.\""
  ];

  // Weapons — d10 (p.23 / p.26)
  var WEAPONS = [
    { key:"Unarmed",    entry:"Unarmed — d2 damage." },
    { key:"1",          entry:"Femur — d4 damage (p.23)." },
    { key:"2",          entry:"Staff — d4 damage." },
    { key:"3",          entry:"Shortsword — d4 damage." },
    { key:"4",          entry:"Knife — d4 damage." },
    { key:"5",          entry:"Warhammer — d6 damage." },
    { key:"6",          entry:"Sword — d6 damage." },
    { key:"7",          entry:"Bow — d6 damage (+ Presence +10 arrows)." },
    { key:"8",          entry:"Flail — d8 damage." },
    { key:"9",          entry:"Crossbow — d8 damage (+ Presence +10 bolts)." },
    { key:"10",         entry:"Zweihänder — d10 damage (zweihand; breaks scrolls)." }
  ];

  // Armor — d4 (p.23)
  var ARMOR = [
    { key:"1", entry:"No armor (tier 0)." },
    { key:"2", entry:"Light — fur, padded cloth, leather. -d2 damage. Tier 1. 20s." },
    { key:"3", entry:"Medium — scale, mail. -d4 damage. Tier 2. 100s. DR +2 on Agility tests." },
    { key:"4", entry:"Heavy — splint, plate. -d6 damage. Tier 3. 200s. DR +4 on Agility, Defence DR +2." }
  ];

  // Equipment shop (selected, p.24-26)
  var EQUIPMENT_SHOP = [
    { key:"—", entry:"Backpack, 6s — holds 7 normal-sized items." },
    { key:"—", entry:"Bear trap, 20s — Presence DR14 to spot, d8 damage." },
    { key:"—", entry:"Caltrops, 7s — d4 damage + infection 1-in-6." },
    { key:"—", entry:"Crowbar, 8s — d4 as improvised weapon." },
    { key:"—", entry:"Crucifix (silver), 60s." },
    { key:"—", entry:"Dried food, 1s per day." },
    { key:"—", entry:"Grappling hook, 12s." },
    { key:"—", entry:"Lantern oil, 5s — Presence + 6 hours." },
    { key:"—", entry:"Lockpicks, 5s." },
    { key:"—", entry:"Medicine box, 15s — stops bleeding/infection and +d6 HP. Presence + 4 uses." },
    { key:"—", entry:"Poison (black), 20s — Toughness DR14 or d6 damage + blind 1 hr. 3 doses." },
    { key:"—", entry:"Poison (red), 20s — Toughness DR12 or d10 damage. 3 doses." },
    { key:"—", entry:"Rope, 4s — 30 feet." },
    { key:"—", entry:"Scroll — roughly 50s to the right buyer." },
    { key:"—", entry:"Tent, 12s." },
    { key:"—", entry:"Torch, 2s." },
    { key:"—", entry:"Waterskin, 4s — 4 days of water." }
  ];

  // Occult Treasures — d10 (p.3)
  var OCCULT_TREASURES = [
    "Ash-grey ring, a finger-width wide. All that passes through is obliterated.",
    "Vile flute. Its keening music animates a fetus-sized meat golem in a nearby corpse.",
    "Famine spoon. One taste means death from slow starvation.",
    "Malevolently-accurate mirror. The image shows only the shameful truth of their soul.",
    "Vampiric phurba. Heals you as it harms your target (d3). Risk of addiction.",
    "Black pearl. If dropped in darkness it rolls towards the nearest exit to day.",
    "Torch that burns for an immortal hour. Hold it and live — lose limbs, enter negative HP, won't die unless it burns out.",
    "Silver bird cage. Whatever's placed inside dies over one long night, then reanimates twice as strong.",
    "Black Crown of the Crippled King. +10 attack / -10 defence for everyone within 100 yards.",
    "Ancient blindfold. Wearer becomes invisible to those who breathe; the undead attack obsessively."
  ];

  // Weather — d12 (p.4)
  var WEATHER = [
    "Lifeless grey","Hammering rain","Piercing wind","Deafening storm","Black as night","Dead quiet",
    "Cloudburst","Soup-thick mist","Crackling frost","Irritating drizzle","Roaring thunder","Gravelike cold"
  ];

  // Traps and Devilry — d12 (p.4)
  var TRAPS = [
    "Well dressed corpse, booby trapped",
    "Wall-holes shoot poisonous arrows",
    "Bells and marbles on the floor",
    "Scorpion-filled basket poised to fall",
    "Fish hooks hanging at eye level",
    "Chest marked with explosive runes",
    "Lock trapped with vial of poison gas",
    "Jewel removal leads to roof collapse",
    "Slanted floor, translucent oil, pit",
    "Snake-cages on collapsing ceiling tiles",
    "Evil urns release cold ghosts",
    "Coins coated in grime and poison"
  ];

  // The Basilisks Demand — d20 (p.36)
  var BASILISKS_DEMAND = [
    "A sword that has killed exactly one dozen times",
    "A widower's wedding ring",
    "Silver from a sinner's grave",
    "Eyes that have seen the Shimmering Fields",
    "The year's first-born goat",
    "Blutday bread",
    "The cuticle of an executed innocent",
    "A troll's heart valves",
    "A dagger onto which the condemned carved their victims' name",
    "Rare anti-obsidian from the Urilian crypts",
    "The forbidden brew of the hermit of Terion",
    "An orgh-maggot from the ice of Kergüs",
    "A body mutilated by those who loved it in life",
    "Joy's lampoon written in blood",
    "The gall of a Chrypt-vulture",
    "Moss upon which a dying man has slept",
    "A child born with the third eye",
    "A body drowned in Lake Onda",
    "The rear molar of the Gluttonous",
    "Gems from overflowing pockets"
  ];

  // Reaction — 2d6 result range (p.32)
  var REACTION = [
    { key:"2-3",   entry:"Kill!" },
    { key:"4-6",   entry:"Angered" },
    { key:"7-8",   entry:"Indifferent" },
    { key:"9-10",  entry:"Almost friendly" },
    { key:"11-12", entry:"Helpful" }
  ];

  // Arcane Catastrophes — d20 (p.43-45), abbreviated
  var ARCANE_CATASTROPHES = [
    "Teeth fall out; long brittle fingernails replace them in your gums.",
    "You feel fine. A magical STD; intimates die of plague in d4 days.",
    "Your skeleton is possessed and will do anything to kill you and escape.",
    "Illusion of the celestial sphere is lifted. Gazing at night skies drives you mad.",
    "An unending black-ash snowfall only you and the mad perceive.",
    "Earth decays around you. You sink 3 feet, clung by d4 crayfish-children with your face.",
    "Skin tatters, flesh melts, intestines bloat — you become a walking skeleton.",
    "A gnashing gap-toothed mouth splits your neck; speaks your secrets.",
    "Sky warps. You are thrown one day into the future. A Misery is fulfilled.",
    "Light despises you. Candles, lamps and torches snuff out when you gaze on them.",
    "A cocoon heaves from the ground in d4 days and spawns your clone.",
    "Your eyes burn and fall from their sockets; you keep seeing through them.",
    "You and a nearby creature pass out. Souls switched. Welcome to your new flesh.",
    "Five skeletal arms burst from your back — mischievous, violent, cruel.",
    "Skin pales and emits sickly green light. Those held close fall ill.",
    "The Power works, but fate perverts its effects to your precise disadvantage.",
    "The scroll crumbles to black powder reaching for your nose and mouth (Toughness DR14 or -d10 HP).",
    "The Power feeds on your anima. Permanently gaunt, insatiably hungry.",
    "You fall through Refva into the esoteric dimension of Cube-Violet.",
    "HE emerges from the shadows. The two-headed basilisk devours you."
  ];

  // Adventure Spark — d100, abbreviated to 50 hooks (p.69-70)
  var ADVENTURE_SPARK = [
    "The undead-riddled Valley awaits",
    "Thirteen priests are missing",
    "Wrongly imprisoned for murder",
    "66 sacrifices are needed",
    "Children missing at Lake Onda",
    "Sinkhole swallows half of Schleswig",
    "Sabotage an unholy alliance",
    "The count goes insane at night",
    "Hunted by bloodthirsty death-cult",
    "Trapped by an earthquake",
    "Verhu's prophecy is false!",
    "Rumours of a cursed treasure",
    "Kidnapped blood-wizard",
    "A dead demon is resurrected",
    "Every grave is emptied one night",
    "Enormous cave system near Grift",
    "The dead refuse to stay dead",
    "PCs are selected for ritual sacrifice",
    "Anthelia falls severely ill",
    "PC dopplegangers go berserk",
    "Take part in a holy mass burial",
    "The entire kingdom has nightmares",
    "Something has infiltrated the court",
    "Artefact must be destroyed",
    "Map the land in the west",
    "Talk of an unexplored island",
    "Gain the trust of a dangerous hermit",
    "Find the way to Cube-Violet",
    "Stop a Grift suicide-cult",
    "Pardon a mad mass-murderer",
    "Defend a fort from the undead",
    "Steal a sarcophagus from a caravan",
    "A fire threatens to devour Sarkash",
    "Go to the land of the dead and back",
    "HE demands a gift. See it delivered",
    "Powerful elixir needs ingredients",
    "Slave revolt in Galgenbeck",
    "Mystical ruins are unearthed",
    "They're coming out of the walls!",
    "Three assassinations each night",
    "Alchemist needs a living goblin",
    "A strange ship ran aground",
    "A weirdness leaves Bergen Chrypt",
    "Seven women with black eyes",
    "The icon's eyes have been stolen",
    "The beast beneath the bridge",
    "Movement in a black star's crater",
    "Light from broken sewer gate",
    "Children hum forbidden songs",
    "Newly discovered path in Sarkash"
  ];

  // Who (or what) contacts you? — d20 (p.68-69)
  var WHO_CONTACTS = [
    "One-eyed woman who rules the thieves",
    "Bureaucrat with enemies and no honor",
    "Badly burned priest",
    "Noble child said to see dark visions",
    "Warrior that switched loyalties",
    "Faint whispers from the crypt",
    "Remorseful hangman",
    "Tortured traitor",
    "Recurring vision in a horrid nightmare",
    "Hermit mocked by the other cave-folk",
    "Demented elder",
    "Sacrifice who escaped a death-cult",
    "Monk who was bitten at night",
    "Unshaved mystic at The Paunchy Swine",
    "Devastated mother dressed in white",
    "Sailor too long at sea",
    "Scoundrel covered in ulcers",
    "Drunk seeress with no teeth",
    "Restless soul by the name of Ghast",
    "Terrified soldier with broken knees"
  ];

  // Where do you wander? — d12 (p.68)
  var WHERE_WANDER = [
    "On the barren fields of Kergüs",
    "In the centre of Alliáns",
    "On a beach not distant from Grift",
    "On a dirty Schleswig street",
    "In the poor Wästland countryside",
    "At the city wall of Galgenbeck",
    "In the untamed wilds of Tveland",
    "Near the Valley of the Unfortunate Undead",
    "Pretty much lost in Sarkash",
    "At the Bergen Chrypt tree line",
    "Onboard a ship on the Endless Sea",
    "In a forgotten part of Graven-Tosk"
  ];

  // ---------- Helpers ----------
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  // List helpers for Library: turn strings-only arrays into keyed d20/d12/etc.
  function stringArrayToDice(arr) {
    return arr.map(function (s, i) { return { key: String(i + 1), entry: s }; });
  }

  // ---------- Table registry ----------
  var TABLES = {
    names:        { title:"Names",               die:"d6 × d8",   sub:"Man? Woman? Lost souls all. (p.2)",           entries: stringArrayToDice(NAMES) },
    terrible:     { title:"Terrible Traits",     die:"d20 x 2",   sub:"Trauma, a bad childhood, a twisted fate. (p.38)", entries: stringArrayToDice(TERRIBLE_TRAITS) },
    broken:       { title:"Broken Bodies",       die:"d20",       sub:"Flesh already ruined. (p.39)",                  entries: stringArrayToDice(BROKEN_BODIES) },
    bad:          { title:"Bad Habits",          die:"d20",       sub:"Twitches, addictions, obsessions. (p.40)",     entries: stringArrayToDice(BAD_HABITS) },
    tales:        { title:"Troubling Tales",     die:"d20",       sub:"A backstory, hook or shared bond. (p.41-42)",  entries: stringArrayToDice(TROUBLING_TALES) },
    weapons:      { title:"Weapons",             die:"d10",       sub:"What will you wield? (p.23)",                    entries: WEAPONS },
    armor:        { title:"Armor",               die:"d4",        sub:"Three tiers of protection. (p.23)",              entries: ARMOR },
    equipment:    { title:"Equipment (Shop)",    die:"browse",    sub:"Common gear and prices. (p.24-26)",              entries: EQUIPMENT_SHOP },
    occult:       { title:"Occult Treasures",    die:"d10",       sub:"Forbidden relics and curses. (p.3)",             entries: stringArrayToDice(OCCULT_TREASURES) },
    weather:      { title:"Weather",             die:"d12",       sub:"The mood of a dying world. (p.4)",               entries: stringArrayToDice(WEATHER) },
    traps:        { title:"Traps & Devilry",     die:"d12",       sub:"Cruelty of the dungeon. (p.4)",                  entries: stringArrayToDice(TRAPS) },
    basilisks:    { title:"The Basilisks Demand",die:"d20",       sub:"Gifts to appease HE. (p.36)",                   entries: stringArrayToDice(BASILISKS_DEMAND) },
    catastrophe:  { title:"Arcane Catastrophes", die:"d20",       sub:"Scroll fumbles and mystic ruin. (p.43-45)",     entries: stringArrayToDice(ARCANE_CATASTROPHES) },
    reaction:     { title:"Reaction",            die:"2d6",       sub:"Friend or foe? (p.32)",                          entries: REACTION },
    spark:        { title:"Adventure Spark",     die:"d50",       sub:"Hooks for the dying world. (p.69-70)",           entries: stringArrayToDice(ADVENTURE_SPARK) },
    contacts:     { title:"Who Contacts You?",   die:"d20",       sub:"The one who brings the call. (p.68-69)",        entries: stringArrayToDice(WHO_CONTACTS) },
    wander:       { title:"Where Do You Wander?",die:"d12",       sub:"When the adventure begins. (p.68)",             entries: stringArrayToDice(WHERE_WANDER) }
  };

  // ---------- Exports ----------
  window.MB = {
    tables: TABLES,
    // Raw arrays for targeted pulls:
    _names: NAMES,
    _origins: ORIGINS,
    _terrible: TERRIBLE_TRAITS,
    _broken: BROKEN_BODIES,
    _bad: BAD_HABITS,

    // Rollers
    rollName: function () { return pick(NAMES) + " " + pick(NAMES); },
    rollOrigin: function (className) {
      var list = ORIGINS[className];
      if (!list) {
        // Random class if none selected
        var keys = Object.keys(ORIGINS);
        list = ORIGINS[keys[Math.floor(Math.random() * keys.length)]];
      }
      return pick(list);
    },
    rollTerribleTrait: function () { return pick(TERRIBLE_TRAITS); },
    rollBadHabit:      function () { return pick(BAD_HABITS); },
    rollBrokenBody:    function () { return pick(BROKEN_BODIES); },

    // Library: pick a random entry from a table id
    rollTable: function (tableId) {
      var t = TABLES[tableId];
      if (!t) return null;
      var i = Math.floor(Math.random() * t.entries.length);
      return { index: i, entry: t.entries[i] };
    },

    escHtml: function (s) {
      return String(s == null ? "" : s)
        .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
    },

    omensMaxFor: function (className) {
      if (className === "Esoteric Hermit" || className === "Heretical Priest") return "d4";
      return "d2";
    }
  };
})();
