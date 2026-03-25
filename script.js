/* =============================================
   Pokémon Random Display — script.js
   Uses PokéAPI (https://pokeapi.co)
   ============================================= */

const TOTAL_POKEMON = 1025; // Gen 1–9

// Game version display config: label, background color
const VERSION_CONFIG = {
  red:           { label: "赤",        color: "#CC0000" },
  blue:          { label: "青",        color: "#0030CC" },
  yellow:        { label: "黄",        color: "#CCA800" },
  gold:          { label: "金",        color: "#B8860B" },
  silver:        { label: "銀",        color: "#808080" },
  crystal:       { label: "クリスタル", color: "#2196A8" },
  ruby:          { label: "ルビー",    color: "#AA0000" },
  sapphire:      { label: "サファイア", color: "#0038A8" },
  emerald:       { label: "エメラルド", color: "#008840" },
  firered:       { label: "FR",        color: "#DD4400" },
  leafgreen:     { label: "LG",        color: "#228800" },
  diamond:       { label: "ダイヤ",    color: "#6658B0" },
  pearl:         { label: "パール",    color: "#C06080" },
  platinum:      { label: "プラチナ",  color: "#5A5A6A" },
  heartgold:     { label: "HG",        color: "#B07800" },
  soulsilver:    { label: "SS",        color: "#708090" },
  black:         { label: "ブラック",  color: "#222222" },
  white:         { label: "ホワイト",  color: "#888888" },
  "black-2":     { label: "B2",        color: "#333355" },
  "white-2":     { label: "W2",        color: "#999977" },
  x:             { label: "Ｘ",        color: "#025DA6" },
  y:             { label: "Ｙ",        color: "#D01030" },
  "omega-ruby":  { label: "OR",        color: "#AA2200" },
  "alpha-sapphire": { label: "AS",     color: "#0030AA" },
  sun:           { label: "サン",      color: "#E07000" },
  moon:          { label: "ムーン",    color: "#3040A0" },
  "ultra-sun":   { label: "US",        color: "#C84800" },
  "ultra-moon":  { label: "UM",        color: "#203888" },
  sword:         { label: "ソード",    color: "#3050B8" },
  shield:        { label: "シールド",  color: "#981840" },
  "legends-arceus": { label: "アルセウス", color: "#5A6830" },
  scarlet:       { label: "スカーレット", color: "#B82018" },
  violet:        { label: "バイオレット", color: "#5828A0" },
};

// Stat label map (JP)
const STAT_LABELS = {
  hp:              "HP",
  attack:          "こうげき",
  defense:         "ぼうぎょ",
  "special-attack": "とくこう",
  "special-defense": "とくぼう",
  speed:           "すばやさ",
};

// Stat bar color thresholds
function statColor(value) {
  if (value >= 120) return "#4CAF50";
  if (value >= 90)  return "#8BC34A";
  if (value >= 60)  return "#FFC107";
  if (value >= 40)  return "#FF9800";
  return "#F44336";
}

// Type name → Japanese
const TYPE_JP = {
  normal: "ノーマル", fire: "ほのお", water: "みず", electric: "でんき",
  grass: "くさ", ice: "こおり", fighting: "かくとう", poison: "どく",
  ground: "じめん", flying: "ひこう", psychic: "エスパー", bug: "むし",
  rock: "いわ", ghost: "ゴースト", dragon: "ドラゴン", dark: "あく",
  steel: "はがね", fairy: "フェアリー", stellar: "ステラ",
};

/* ---- DOM refs ---- */
const loadingEl   = document.getElementById("loading");
const errorEl     = document.getElementById("error");
const cardEl      = document.getElementById("pokemon-card");
const nextBtn     = document.getElementById("nextBtn");
const retryBtn    = document.getElementById("retryBtn");

const pokemonNumber = document.getElementById("pokemonNumber");
const pokemonName   = document.getElementById("pokemonName");
const pokemonGenus  = document.getElementById("pokemonGenus");
const pokemonTypes  = document.getElementById("pokemonTypes");
const pokemonSprite = document.getElementById("pokemonSprite");
const spriteBackdrop= document.getElementById("spriteBackdrop");
const flavorText    = document.getElementById("flavorText");
const statsGrid     = document.getElementById("statsGrid");
const versionsGrid  = document.getElementById("versionsGrid");

/* ---- State ---- */
let isLoading = false;

/* ---- Entry point ---- */
function init() {
  nextBtn.addEventListener("click", loadRandomPokemon);
  retryBtn.addEventListener("click", loadRandomPokemon);
  loadRandomPokemon();
}

/* ---- Main loader ---- */
async function loadRandomPokemon() {
  if (isLoading) return;
  isLoading = true;
  nextBtn.disabled = true;

  showLoading();

  const id = Math.floor(Math.random() * TOTAL_POKEMON) + 1;

  try {
    const [pokemon, species] = await Promise.all([
      fetchJSON(`https://pokeapi.co/api/v2/pokemon/${id}`),
      fetchJSON(`https://pokeapi.co/api/v2/pokemon-species/${id}`),
    ]);

    renderPokemon(pokemon, species);
    showCard();
  } catch (err) {
    console.error("Failed to fetch Pokémon:", err);
    showError();
  } finally {
    isLoading = false;
    nextBtn.disabled = false;
  }
}

/* ---- Render ---- */
function renderPokemon(pokemon, species) {
  // Number & name
  const nationalNo = species.pokedex_numbers.find(p => p.pokedex.name === "national")?.entry_number ?? pokemon.id;
  pokemonNumber.textContent = `#${String(nationalNo).padStart(3, "0")}`;

  const nameJa = species.names.find(n => n.language.name === "ja-Hrkt")?.name
               ?? species.names.find(n => n.language.name === "ja")?.name
               ?? pokemon.name;
  pokemonName.textContent = nameJa;

  // Genus (category)
  const genusJa = species.genera.find(g => g.language.name === "ja-Hrkt")?.genus
                ?? species.genera.find(g => g.language.name === "ja")?.genus
                ?? "";
  pokemonGenus.textContent = genusJa;

  // Types
  pokemonTypes.innerHTML = "";
  pokemon.types.forEach(({ type }) => {
    const span = document.createElement("span");
    span.className = `type-badge type-${type.name}`;
    span.textContent = TYPE_JP[type.name] ?? type.name;
    pokemonTypes.appendChild(span);
  });

  // Type-based backdrop color
  const primaryType = pokemon.types[0].type.name;
  spriteBackdrop.style.setProperty("--type-color", typeGlow(primaryType));

  // Sprite (prefer official artwork, fallback to front_default)
  const artwork = pokemon.sprites?.other?.["official-artwork"]?.front_default;
  const frontDefault = pokemon.sprites?.front_default;
  const spriteUrl = artwork || frontDefault || "";
  pokemonSprite.src = spriteUrl;
  pokemonSprite.alt = nameJa;

  // Flavor text (Japanese preferred: ja-Hrkt → ja → fallback)
  const jaHrkt = species.flavor_text_entries.filter(e => e.language.name === "ja-Hrkt");
  const jaKanji = species.flavor_text_entries.filter(e => e.language.name === "ja");
  const flavorEntry = (jaHrkt[jaHrkt.length - 1]) ?? (jaKanji[jaKanji.length - 1]);
  flavorText.textContent = flavorEntry
    ? flavorEntry.flavor_text.replace(/\f|\n/g, " ")
    : "???";

  // Stats
  statsGrid.innerHTML = "";
  pokemon.stats.forEach(({ stat, base_stat }) => {
    const label = STAT_LABELS[stat.name] ?? stat.name;
    const pct = Math.min((base_stat / 255) * 100, 100);

    statsGrid.insertAdjacentHTML("beforeend", `
      <div class="stat-row">
        <span class="stat-label">${label}</span>
        <div class="stat-bar-bg">
          <div class="stat-bar-fill" style="width: 0%; background: ${statColor(base_stat)};"></div>
        </div>
        <span class="stat-value">${base_stat}</span>
      </div>
    `);

    // Animate bar after paint
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const bar = statsGrid.lastElementChild.querySelector(".stat-bar-fill");
        if (bar) bar.style.width = `${pct}%`;
      });
    });
  });

  // Game versions — derive from flavor_text_entries (most comprehensive)
  const versionNames = getVersionsFromFlavor(species.flavor_text_entries);

  versionsGrid.innerHTML = "";
  if (versionNames.length === 0) {
    versionsGrid.insertAdjacentHTML("beforeend", `<span style="font-size:12px;color:#999;">情報なし</span>`);
  } else {
    versionNames.forEach(vName => {
      const cfg = VERSION_CONFIG[vName];
      const label = cfg ? cfg.label : formatVersionName(vName);
      const color = cfg ? cfg.color : "#666";

      versionsGrid.insertAdjacentHTML("beforeend", `
        <div class="version-badge" style="background: ${color};">
          <div class="version-dot"></div>
          ${label}
        </div>
      `);
    });
  }
}

/** Collect unique versions from flavor_text_entries (preserves release order) */
function getVersionsFromFlavor(entries) {
  const seen = new Set();
  const result = [];
  entries.forEach(e => {
    const v = e.version.name;
    if (!seen.has(v)) {
      seen.add(v);
      result.push(v);
    }
  });
  return result;
}

/** Fallback version name formatter */
function formatVersionName(name) {
  return name.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

/** Return a glow/bg color for type */
function typeGlow(typeName) {
  const colors = {
    normal: "#A8A878", fire: "#F08030", water: "#6890F0", electric: "#F8D030",
    grass: "#78C850", ice: "#98D8D8", fighting: "#C03028", poison: "#A040A0",
    ground: "#E0C068", flying: "#A890F0", psychic: "#F85888", bug: "#A8B820",
    rock: "#B8A038", ghost: "#705898", dragon: "#7038F8", dark: "#705848",
    steel: "#B8B8D0", fairy: "#EE99AC", stellar: "#40B5A5",
  };
  return colors[typeName] ?? "#90A4AE";
}

/* ---- UI state helpers ---- */
function showLoading() {
  loadingEl.hidden = false;
  errorEl.hidden = true;
  cardEl.hidden = true;
}

function showCard() {
  loadingEl.hidden = true;
  errorEl.hidden = true;
  cardEl.hidden = false;
}

function showError() {
  loadingEl.hidden = true;
  errorEl.hidden = false;
  cardEl.hidden = true;
}

/* ---- Fetch wrapper ---- */
async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
  return res.json();
}

/* ---- Boot ---- */
document.addEventListener("DOMContentLoaded", init);
