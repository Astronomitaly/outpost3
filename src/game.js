// OUTPOST II: Divided Destiny — Modern Remake
// Game engine — uses authentic data from original 1997 game files

// ═══════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════

const MAP_W = 128;
const MAP_H = 80;
const TILE_PX = 32;      // display pixels per tile (upscaled from 32x32 source)
const VIEW_MARGIN = 2;   // tiles of margin around colony

// Terrain types mapped to tileset indices (from original well*.bmp files)
const TERRAIN = {
  GROUND:   'ground',
  SAND:     'sand',
  ROCK:     'rock',
  DARK:     'dark',
  LAVA_R:   'lava_r',
  LAVA:     'lava',
  ORE:      'ore',
  RARE:     'rare',
  BLIGHT:   'blight',
};

// Building definitions (names match original game)
const BUILDINGS = {
  command:       { name:'Command Center',       icon:'🏛', cost:{ore:0},            ore:0,   food:0, workers:0,  morale:0,  desc:'Centre of command. Enables basic operations.' },
  mine:          { name:'Common Ore Mine',       icon:'⛏', cost:{ore:50},           ore:12,  food:0, workers:3,  morale:0,  desc:'Mines common ore (+12/turn).' },
  smelter:       { name:'Common Ore Smelter',    icon:'🔩', cost:{ore:60},           ore:5,   food:0, workers:3,  morale:0,  desc:'Processes ore into metals (+5 ore/turn).' },
  agridome:      { name:'Agridome',              icon:'🌿', cost:{ore:60},           ore:0,   food:12,workers:2,  morale:2,  desc:'Grows food for the colony (+12 food/turn).' },
  residence:     { name:'Residence',             icon:'🏠', cost:{ore:45},           ore:0,   food:0, workers:0,  morale:5,  desc:'Houses colonists. Increases pop capacity (+5 morale).' },
  basiclab:      { name:'Basic Laboratory',      icon:'🔬', cost:{ore:90,rare:8},    ore:0,   food:0, workers:4,  morale:0,  desc:'Enables basic research.', research:1 },
  stdlab:        { name:'Standard Laboratory',   icon:'🧪', cost:{ore:140,rare:15},  ore:0,   food:0, workers:5,  morale:0,  desc:'Enables advanced research.', research:2, req:'basiclab' },
  medcenter:     { name:'Medical Center',        icon:'🏥', cost:{ore:80,rare:8},    ore:0,   food:0, workers:3,  morale:9,  desc:'Improves colony health (+9 morale).' },
  recreation:    { name:'Recreation',            icon:'🎮', cost:{ore:65},           ore:0,   food:0, workers:1,  morale:11, desc:'Improves colonist morale (+11).' },
  tokamak:       { name:'Tokamak',               icon:'⚛', cost:{ore:160,rare:35},  ore:12,  food:0, workers:3,  morale:2,  desc:'Fusion power plant (+12 ore/turn).',    req:'tokamak_tech' },
  dirt:          { name:'DIRT',                  icon:'🚑', cost:{ore:80,rare:8},    ore:0,   food:0, workers:2,  morale:4,  desc:'Disaster Response Team (+4 morale).',    req:'EmergencyResp' },
  guardbay:      { name:'Guard Post',            icon:'🛡', cost:{ore:100,rare:12},  ore:0,   food:0, workers:2,  morale:0,  desc:'Defensive installation.' },
  robotcmd:      { name:'Robot Cmd Center',      icon:'🤖', cost:{ore:120,rare:20},  ore:0,   food:0, workers:4,  morale:0,  desc:'Enables vehicle production.',            req:'CybTeleoperation' },
  vehiclefac:    { name:'Vehicle Factory',       icon:'🏭', cost:{ore:150,rare:25},  ore:0,   food:0, workers:5,  morale:0,  desc:'Produces ground vehicles.',              req:'CybTeleoperation' },
  spaceport:     { name:'Spaceport',             icon:'🚀', cost:{ore:350,rare:120}, ore:0,   food:0, workers:8,  morale:14, shipPart:18, desc:'Builds starship components (+18% ship).' },
};

// Mission data — briefings loaded from story.json at runtime
const MISSION_META = {
  eden: [
    { num:1,  turn:1,  title:'Evacuation',         objectives:['Move all units to the mining beacon SE of the colony','Keep at least 20 children alive'] },
    { num:2,  turn:5,  title:'The Blight',          objectives:['Rebuild Astronomy database','Rebuild Boptronics','Rebuild Chemistry','Keep 20+ children alive'] },
    { num:3,  turn:9,  title:'Expansion',           objectives:['Research Emergency Response Systems','Research Health Maintenance','Research Cybernetic Teleoperation'] },
    { num:4,  turn:13, title:'Night Expedition',    objectives:['Transmit data from Lab 1 (46,34)','Transmit data from Lab 2 (26,25)','Transmit data from Lab 3 (20,55)'] },
    { num:5,  turn:17, title:'Starship Program',    objectives:['Build Spaceport','Research Robot-Assist Mechanic','Keep 40+ children alive'] },
    { num:6,  turn:21, title:'Conestoga Salvage',   objectives:['Recover 3 spacecraft parts from crash site','Return parts to Spaceport'] },
    { num:7,  turn:24, title:'The Gulag',           objectives:['Stockpile 7500 Rare Metals','Stockpile 10000 Common Metals'] },
    { num:8,  turn:27, title:'Resurrection',        objectives:['Research Dual-Turret Weapons','Build enough Evac Transports for population'] },
    { num:9,  turn:30, title:'Counterintelligence', objectives:['Recover 4 spacecraft parts from Plymouth territory','Return parts to base'] },
    { num:10, turn:33, title:'Open War',            objectives:['Research Improved Launch Vehicle','Keep 70+ children alive'] },
    { num:11, turn:36, title:'The Gene Bank',       objectives:['Capture Gene Bank from Plymouth Advanced Lab','Destroy Plymouth Spaceport'] },
    { num:12, turn:39, title:'Exodus',              objectives:['Launch Phoenix Module','Launch Stasis Systems','Evacuate 200 colonists','Evacuate 10000 Common Metals','Evacuate 10000 Rare Metals'] },
  ],
  plymouth: [
    { num:1,  turn:1,  title:'Eruption',            objectives:['Move all units to the mining beacon NW of the colony','Evacuate before lava reaches colony'] },
    { num:2,  turn:5,  title:'Seismic Activity',    objectives:['Rebuild scientific databases','Increase food production','Keep 20+ children alive'] },
    { num:3,  turn:9,  title:'Eden Discovery',      objectives:['Build Standard Labs','Research Emergency Response Systems','Investigate Eden satellite data'] },
    { num:4,  turn:13, title:'Valley of Death',     objectives:['Send recon to Eden site','Recover weapons data','Maintain colony during expedition'] },
    { num:5,  turn:17, title:'Diagnosis',           objectives:['Research Blight containment','Build Spaceport','Keep 40+ children alive'] },
    { num:6,  turn:21, title:'Starship',            objectives:['Recover ship parts from Conestoga crash site','Begin main ship modules'] },
    { num:7,  turn:24, title:'Rescue',              objectives:['Rescue Eden survivors from Badlands','Integrate their research into starship program'] },
    { num:8,  turn:27, title:'Recoil',              objectives:['Defend against Eden raids','Research Advanced Weapons','Build Evac Transports'] },
    { num:9,  turn:30, title:'Deadlock',            objectives:['Maintain position at Tsiolkovsky Hills','Complete critical ship modules'] },
    { num:10, turn:33, title:'Exchange',            objectives:['Secure salvaged starship tech','Prepare final evacuation'], },
    { num:11, turn:36, title:'The Raid',            objectives:['Protect Gene Bank from Eden raid','Defend Spaceport'] },
    { num:12, turn:39, title:'Breakaway',           objectives:['Launch Phoenix Module','Launch Stasis Systems','Evacuate 200 colonists'] },
  ],
};

// Procedural events
const PROC_EVENTS = [
  { title:'MAGNETIC STORM',
    body:'A severe ionospheric storm has struck the colony. Electronic systems are disrupted. Mining operations are temporarily offline.',
    choices:[ {text:'Activate emergency backup generators',fx:{ore:-60,morale:-3}}, {text:'Wait for the storm to pass',fx:{ore:-120,morale:-8}} ] },
  { title:'DORMITORY EPIDEMIC',
    body:'A viral outbreak is spreading rapidly through the worker dormitories. Medical staff are overwhelmed. Immediate intervention is required.',
    choices:[ {text:'Dedicate Rare Metals to pharmaceutical production',fx:{rare:-25,morale:5}}, {text:'Full sector quarantine',fx:{pop:-6,morale:-10}} ] },
  { title:'COLONIST MUTINY',
    body:'An organized group of colonists is demanding better living conditions and recreational facilities. Tensions have reached a critical point.',
    choices:[ {text:'Emergency construction of recreation facilities',fx:{ore:-90,morale:15}}, {text:'Security crackdown',fx:{morale:-20}} ] },
  { title:'UNDISCOVERED RARE ORE DEPOSIT',
    body:'A survey rover has located an unmapped Rare Ore deposit in a nearby volcanic crater. The site appears intact and highly valuable.',
    choices:[ {text:'Extract immediately',fx:{rare:110,ore:-30}}, {text:'Analyze deposit first',fx:{sci:90}} ] },
  { title:'METEORITE IMPACT',
    body:'A mid-sized meteorite has struck the industrial sector. Structural damage is significant. Production systems are offline.',
    choices:[ {text:'Emergency reconstruction',fx:{ore:-150,morale:-4}}, {text:'Relocate production to safe sectors',fx:{ore:-80,morale:-9}} ] },
  { title:'CONESTOGA ARCHIVE FRAGMENT',
    body:'Excavation work has unearthed a memory fragment from the Conestoga\'s archive. It contains Earth scientific data of enormous value.',
    choices:[ {text:'Full immediate analysis',fx:{sci:220,morale:5}}, {text:'Transfer to research team',fx:{sci:110,morale:9}} ] },
  { title:'SAVANT SIGNAL',
    body:'Savant AIs fused with the Blight are transmitting encrypted signals toward the colony. They appear to contain advanced propulsion schematics. Trust an intelligence merged with the Blight?',
    choices:[ {text:'Decrypt the Savant data (+Ship, Blight risk)',fx:{shipBonus:16,blightRisk:true}}, {text:'Block all signals — no contact with the Blight',fx:{morale:7}} ] },
  { title:'SCIENTIST STRIKE',
    body:'The research team is demanding more personnel and better equipment. They threaten to slow down starship research if ignored.',
    choices:[ {text:'Build additional laboratory',fx:{ore:-120,sciBonus:5}}, {text:'Negotiate — promise future resources',fx:{morale:-7,sci:90}} ] },
  { title:'ORBITAL SIGNAL',
    body:'A radio signal from orbit — a pre-catastrophe Earth automatic probe. It contains data on nearby habitable stellar systems.',
    choices:[ {text:'Download all astronomical data',fx:{shipBonus:11,sci:110}}, {text:'Analyze optimal escape routes',fx:{shipBonus:7,sci:160}} ] },
  { title:'UNDERGROUND VOLCANO',
    body:'A geothermal survey has detected an underground volcano in Sector North. The heat could power reactors at near-zero cost, but eruption risk is real.',
    choices:[ {text:'Install geothermal generators',fx:{oreBonus:12,morale:-4}}, {text:'Evacuate Sector North',fx:{ore:-60,morale:6}} ] },
  { title:'BLIGHT MUTATION',
    body:'Scientists have detected a new Blight mutation that accelerates its spread rate. Emergency countermeasures are needed immediately.',
    choices:[ {text:'Deploy containment barriers',fx:{ore:-100,blightDelay:6}}, {text:'Abandon perimeter, consolidate colony',fx:{morale:-8,blightDelay:3}} ] },
  { title:'CARGO TRUCK RECOVERY',
    body:'A long-lost Cargo Truck has been found intact at the edge of the colony perimeter. Its cargo holds are still sealed.',
    choices:[ {text:'Recover the cargo',fx:{ore:80,rare:30}}, {text:'Salvage for parts',fx:{ore:120}} ] },
];

// ═══════════════════════════════════════════════
// MAP ENGINE
// ═══════════════════════════════════════════════

class GameMap {
  constructor() {
    this.tiles = [];
    this.blightFront = MAP_W - 3;
    this.cx = 12; // colony center X
    this.cy = Math.floor(MAP_H / 2);
    this._generate();
  }

  _generate() {
    // Seeded noise-like generation using simple algorithm
    for (let y = 0; y < MAP_H; y++) {
      this.tiles[y] = [];
      for (let x = 0; x < MAP_W; x++) {
        const n = this._noise(x, y);
        let type;
        if      (n < 0.28) type = TERRAIN.GROUND;
        else if (n < 0.42) type = TERRAIN.SAND;
        else if (n < 0.55) type = TERRAIN.ORE;
        else if (n < 0.62) type = TERRAIN.RARE;
        else if (n < 0.74) type = TERRAIN.ROCK;
        else if (n < 0.82) type = TERRAIN.DARK;
        else               type = TERRAIN.ROCK;
        this.tiles[y][x] = { type, blight: false, building: null, variant: Math.floor(Math.random() * 4) };
      }
    }
    // Lava rivers (2-3 patches)
    for (let p = 0; p < 3; p++) {
      const lx = 30 + p * 25 + Math.floor(Math.random() * 15);
      const ly = 10 + Math.floor(Math.random() * (MAP_H - 20));
      for (let dy = -2; dy <= 2; dy++)
        for (let dx = -4; dx <= 4; dx++)
          if (Math.random() < 0.6) {
            const tx = lx+dx, ty = ly+dy;
            if (tx>=0&&tx<MAP_W&&ty>=0&&ty<MAP_H)
              this.tiles[ty][tx].type = Math.random() < 0.5 ? TERRAIN.LAVA : TERRAIN.LAVA_R;
          }
    }
    // Clear colony zone
    const cx = this.cx, cy = this.cy;
    for (let dy = -5; dy <= 5; dy++)
      for (let dx = -5; dx <= 5; dx++) {
        const tx=cx+dx, ty=cy+dy;
        if (tx>=0&&tx<MAP_W&&ty>=0&&ty<MAP_H) {
          this.tiles[ty][tx].type = TERRAIN.GROUND;
          this.tiles[ty][tx].variant = (Math.abs(dx)+Math.abs(dy)) % 4;
        }
      }
    // Place starting buildings
    this.tiles[cy][cx].building = 'command';
    this.tiles[cy][cx-1].building = 'mine';
    this.tiles[cy][cx+1].building = 'agridome';
    this.tiles[cy-1][cx].building = 'basiclab';
  }

  _noise(x, y) {
    // Simple pseudo-random noise
    const a = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
    const b = Math.sin(x * 269.5 + y * 183.3) * 43758.5453;
    const c = Math.sin(x * 419.2 + y * 371.9) * 43758.5453;
    return Math.abs((a - Math.floor(a)) * 0.5 + (b - Math.floor(b)) * 0.3 + (c - Math.floor(c)) * 0.2);
  }

  placeBuilding(id) {
    const cx = this.cx, cy = this.cy;
    for (let attempt = 0; attempt < 120; attempt++) {
      const dx = Math.floor(Math.random() * 22) - 11;
      const dy = Math.floor(Math.random() * 14) - 7;
      const x = cx + dx, y = cy + dy;
      if (x<1||x>=MAP_W-1||y<1||y>=MAP_H-1) continue;
      const t = this.tiles[y][x];
      if (!t.building && !t.blight && t.type !== TERRAIN.LAVA && t.type !== TERRAIN.LAVA_R) {
        t.building = id;
        t.type = TERRAIN.GROUND;
        return true;
      }
    }
    return false;
  }

  advanceBlight(distance) {
    this.blightFront = Math.max(this.cx + 5, this.blightFront - distance);
    for (let y = 0; y < MAP_H; y++) {
      for (let x = this.blightFront; x < MAP_W; x++) {
        if (!this.tiles[y][x].blight) {
          this.tiles[y][x].blight = true;
          if (this.tiles[y][x].building) {
            const bid = this.tiles[y][x].building;
            this.tiles[y][x].building = null;
            Game.log(`☢ Blight consumed: ${BUILDINGS[bid]?.name || bid}`, 'blight');
          }
        }
      }
    }
  }
}

// ═══════════════════════════════════════════════
// CANVAS RENDERER
// ═══════════════════════════════════════════════

class MapRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.tileImgs = {}; // terrain -> Image[]
    this.loaded = false;
    this.camX = 0; // camera offset in tiles
    this.camY = 0;
    this.buildingIcons = {}; // pre-rendered building icons
  }

  async loadTiles(tilesData) {
    const promises = [];
    for (const [name, b64list] of Object.entries(tilesData)) {
      this.tileImgs[name] = [];
      for (const b64 of b64list) {
        promises.push(new Promise(resolve => {
          const img = new Image();
          img.onload = () => { this.tileImgs[name].push(img); resolve(); };
          img.onerror = resolve;
          img.src = 'data:image/png;base64,' + b64;
        }));
      }
    }
    await Promise.all(promises);
    this.loaded = true;
    // Generate blight tile
    this._genBlightTile();
  }

  _genBlightTile() {
    const c = document.createElement('canvas');
    c.width = c.height = 32;
    const ctx = c.getContext('2d');
    // Deep purple base
    ctx.fillStyle = '#1a0530';
    ctx.fillRect(0,0,32,32);
    // Scattered purple/dark pixels
    for (let i=0; i<80; i++) {
      const x=Math.floor(Math.random()*32), y=Math.floor(Math.random()*32);
      const v = 30 + Math.floor(Math.random()*50);
      ctx.fillStyle = `rgb(${Math.floor(v*0.6)},${Math.floor(v*0.1)},${v})`;
      ctx.fillRect(x,y,1,1);
    }
    // Occasional bright purple spot
    for (let i=0; i<8; i++) {
      const x=Math.floor(Math.random()*30)+1, y=Math.floor(Math.random()*30)+1;
      ctx.fillStyle = 'rgba(140,40,200,0.4)';
      ctx.fillRect(x,y,2,2);
    }
    const img = new Image();
    img.src = c.toDataURL();
    if (!this.tileImgs['blight']) this.tileImgs['blight'] = [];
    this.tileImgs['blight'] = [img];
  }

  resize() {
    const wrap = document.getElementById('map-wrap');
    this.canvas.width  = wrap.offsetWidth;
    this.canvas.height = wrap.offsetHeight;
  }

  render(gameMap) {
    if (!this.loaded) return;
    const ctx = this.ctx;
    const cw = this.canvas.width, ch = this.canvas.height;
    const TS = TILE_PX;

    // Center camera on colony (with clamping)
    const viewTilesX = Math.ceil(cw / TS) + 1;
    const viewTilesY = Math.ceil((ch - 100) / TS) + 1; // subtract log height
    this.camX = Math.max(0, Math.min(MAP_W - viewTilesX, gameMap.cx - Math.floor(viewTilesX/2)));
    this.camY = Math.max(0, Math.min(MAP_H - viewTilesY, gameMap.cy - Math.floor(viewTilesY/2)));

    ctx.fillStyle = '#040608';
    ctx.fillRect(0, 0, cw, ch);

    // Draw tiles
    for (let y = this.camY; y < Math.min(MAP_H, this.camY + viewTilesY + 1); y++) {
      for (let x = this.camX; x < Math.min(MAP_W, this.camX + viewTilesX + 1); x++) {
        const tile = gameMap.tiles[y][x];
        const px = (x - this.camX) * TS;
        const py = (y - this.camY) * TS;

        // Select terrain image
        const tn = tile.blight ? 'blight' : tile.type;
        const imgs = this.tileImgs[tn] || this.tileImgs['ground'] || [];
        if (imgs.length > 0) {
          const img = imgs[tile.variant % imgs.length];
          if (img.complete && img.naturalWidth > 0) {
            ctx.drawImage(img, px, py, TS, TS);
          } else {
            ctx.fillStyle = this._fallbackColor(tn);
            ctx.fillRect(px, py, TS, TS);
          }
        } else {
          ctx.fillStyle = this._fallbackColor(tn);
          ctx.fillRect(px, py, TS, TS);
        }

        // Grid line (very subtle)
        if (TS >= 20) {
          ctx.fillStyle = 'rgba(0,0,0,0.18)';
          ctx.fillRect(px + TS - 1, py, 1, TS);
          ctx.fillRect(px, py + TS - 1, TS, 1);
        }

        // Building icon
        if (tile.building && BUILDINGS[tile.building]) {
          const b = BUILDINGS[tile.building];
          const fontSize = Math.max(12, Math.min(TS * 0.52, 18));
          ctx.font = `${fontSize}px serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          // Shadow
          ctx.fillStyle = 'rgba(0,0,0,0.6)';
          ctx.fillText(b.icon, px + TS/2 + 1, py + TS/2 + 1);
          ctx.fillText(b.icon, px + TS/2, py + TS/2);
        }

        // Ore/rare deposit shimmer
        if ((tile.type === TERRAIN.ORE || tile.type === TERRAIN.RARE) && !tile.blight && !tile.building) {
          const alpha = 0.12 + 0.06 * Math.sin(Date.now() * 0.002 + x + y);
          ctx.fillStyle = tile.type === TERRAIN.RARE
            ? `rgba(140,160,200,${alpha})`
            : `rgba(200,160,80,${alpha})`;
          ctx.fillRect(px, py, TS, TS);
        }
      }
    }

    // Blight overlay (right side)
    const bx = (gameMap.blightFront - this.camX) * TS;
    if (bx < cw) {
      const grd = ctx.createLinearGradient(bx - TS*3, 0, bx, 0);
      grd.addColorStop(0, 'rgba(60,10,100,0)');
      grd.addColorStop(1, 'rgba(60,10,100,0.28)');
      ctx.fillStyle = grd;
      ctx.fillRect(Math.max(0, bx - TS*3), 0, Math.min(TS*3, cw), ch);

      // Blight front line
      if (bx >= 0 && bx < cw) {
        ctx.strokeStyle = 'rgba(120,40,200,0.7)';
        ctx.lineWidth = 2;
        ctx.setLineDash([6,4]);
        ctx.beginPath();
        ctx.moveTo(bx, 0);
        ctx.lineTo(bx, ch);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.font = '8px "Share Tech Mono", monospace';
        ctx.fillStyle = 'rgba(160,80,220,0.9)';
        ctx.textAlign = 'left';
        ctx.fillText('BLIGHT FRONT ▶', bx + 4, 14);
      }
    }

    // Colony zone highlight
    const colPx = (gameMap.cx - this.camX) * TS;
    const colPy = (gameMap.cy - this.camY) * TS;
    ctx.strokeStyle = 'rgba(200,148,60,0.25)';
    ctx.lineWidth = 1;
    ctx.setLineDash([3,3]);
    ctx.strokeRect(colPx - 6*TS, colPy - 5*TS, 12*TS, 10*TS);
    ctx.setLineDash([]);

    // Top-left map info
    ctx.font = '8px "Share Tech Mono", monospace';
    ctx.fillStyle = 'rgba(200,148,60,0.75)';
    ctx.textAlign = 'left';
    if (window.Game && window.Game.state) {
      const G = window.Game.state;
      ctx.fillText(
        `NEW TERRA  |  TURN ${G.turn}  |  BLIGHT FRONT: ${gameMap.blightFront}  |  POP: ${Math.floor(G.population)}  |  MISSION ${G.mission+1}`,
        8, ch - 108 - 10
      );
    }
  }

  _fallbackColor(terrain) {
    const colors = {
      ground: '#5a5040', sand: '#6a5a3a', rock: '#383830',
      dark: '#2a2828', lava_r: '#5c2010', lava: '#7c3c08',
      ore: '#5a4a28', rare: '#3a4050', blight: '#1a0530',
    };
    return colors[terrain] || '#303030';
  }
}

// ═══════════════════════════════════════════════
// MAIN GAME STATE
// ═══════════════════════════════════════════════

class GameState {
  constructor(faction) {
    this.faction = faction;
    this.turn = 1;
    this.mission = 0;

    this.ore  = 500;
    this.rare = 60;
    this.food = 240;
    this.sci  = 0;

    this.population = 80;
    this.children = 20;
    this.workers = 48;
    this.scientists = 12;

    this.morale = faction === 'eden' ? 55 : 68;

    this.orePerTurn  = 12;
    this.rarePerTurn = 0;
    this.foodPerTurn = 12;
    this.sciPerTurn  = faction === 'eden' ? 8 : 5;

    this.oreBonus  = 0;
    this.sciBonus  = 0;

    this.shipProgress = 0;

    this.blightCountdown = 5;

    this.buildings = {
      command: 1, mine: 1, agridome: 1, basiclab: 1,
    };
    this.techDone     = [];
    this.researching  = null;
    this.researchProg = 0;

    this.log = [];
    this.triggered = {};
    this.procCooldown = 0;
    this.over = false;
  }

  addLog(text, type = 'event') {
    this.log.unshift({ text, type, turn: this.turn });
    if (this.log.length > 30) this.log.pop();
  }

  canAfford(cost) {
    for (const [r, v] of Object.entries(cost || {}))
      if (this[r] < v) return false;
    return true;
  }

  spend(cost) {
    for (const [r, v] of Object.entries(cost || {}))
      this[r] -= v;
  }

  applyFx(fx) {
    if (!fx) return;
    if (fx.ore)        this.ore = Math.max(0, this.ore + fx.ore);
    if (fx.rare)       this.rare = Math.max(0, this.rare + fx.rare);
    if (fx.sci)        this.sci += fx.sci;
    if (fx.morale)     this.morale = this._clamp(this.morale + fx.morale, 0, 100);
    if (fx.shipBonus)  this.shipProgress = Math.min(100, this.shipProgress + fx.shipBonus);
    if (fx.pop)        this.population = Math.max(10, this.population + fx.pop);
    if (fx.blightDelay) this.blightCountdown += fx.blightDelay;
    if (fx.blightRisk && Math.random() < 0.42) {
      this.blightCountdown = Math.max(1, this.blightCountdown - 8);
      this.addLog('Savant data corrupted! Blight is accelerating!', 'blight');
    }
    if (fx.oreBonus)   this.oreBonus  = (this.oreBonus || 0) + fx.oreBonus;
    if (fx.sciBonus)   this.sciBonus  = (this.sciBonus || 0) + fx.sciBonus;
    if (fx.moraleBonus) this.morale = Math.min(100, this.morale + fx.moraleBonus);
    if (fx.foodBonus)  this.foodPerTurn += fx.foodBonus;
  }

  _clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  build(id) {
    const b = BUILDINGS[id];
    if (!b) return false;
    if (b.req && !this.buildings[b.req] && !this.techDone.includes(b.req)) {
      Game.log(`Technology/building required: ${b.req}`, 'warn');
      return false;
    }
    if (!this.canAfford(b.cost)) {
      Game.log(`Insufficient resources for ${b.name}`, 'warn');
      return false;
    }
    this.spend(b.cost);
    this.buildings[id] = (this.buildings[id] || 0) + 1;
    if (b.ore)  this.orePerTurn  += b.ore;
    if (b.food) this.foodPerTurn += b.food;
    if (b.shipPart) this.shipProgress = Math.min(100, this.shipProgress + b.shipPart);
    this.addLog(`${b.name} constructed.`, 'ok');
    return true;
  }

  startResearch(tech) {
    if (this.techDone.includes(tech.id)) { Game.log(`${tech.name} already completed.`, 'warn'); return false; }
    if (this.researching) { Game.log(`Research in progress: ${this.researching.name}`, 'warn'); return false; }
    if (!this.buildings.basiclab && !this.buildings.stdlab) { Game.log('Build a laboratory first!', 'warn'); return false; }
    const labLevel = this.buildings.stdlab ? 2 : 1;
    if ((tech.lab || 1) > labLevel) { Game.log(`Standard Laboratory required for ${tech.name}`, 'warn'); return false; }
    this.researching = tech;
    this.researchProg = 0;
    this.addLog(`Research started: ${tech.name}`, 'event');
    return true;
  }

  tickTurn(gameMap) {
    this.turn++;
    this.procCooldown = Math.max(0, this.procCooldown - 1);

    // Income
    this.ore  += this.orePerTurn + (this.oreBonus || 0);
    this.rare += this.rarePerTurn;
    this.food += this.foodPerTurn;
    const labLevel = this.buildings.stdlab ? 2 : (this.buildings.basiclab ? 1 : 0);
    this.sci += labLevel > 0 ? (this.sciPerTurn + (this.sciBonus || 0)) * labLevel : 1;

    // Research progress
    if (this.researching) {
      this.researchProg += this.sciPerTurn * 1.7;
      if (this.researchProg >= this.researching.cost) {
        const t = this.researching;
        this.techDone.push(t.id);
        this.applyFx({ moraleBonus: 0, oreBonus: 0 }); // base completion
        // Apply tech improvements
        if (t.id === 'HydroponicGrowing') this.foodPerTurn += 8;
        if (t.id === 'HiTempSupercond')   this.oreBonus = (this.oreBonus||0) + 15;
        if (t.id === 'Metallogeny')        this.oreBonus = (this.oreBonus||0) + 10;
        if (t.id === 'EnvPsychology')      this.morale = Math.min(100, this.morale + 8);
        if (t.id === 'SocialSci')          this.morale = Math.min(100, this.morale + 6);
        if (t.id === 'HealthMaint')        this.morale = Math.min(100, this.morale + 5);
        if (t.id === 'GeneBank')           this.shipProgress = Math.min(100, this.shipProgress + 18);
        if (t.id === 'ImprLaunchVeh')      this.shipProgress = Math.min(100, this.shipProgress + 14);
        if (t.id === 'Seismology')         this.blightCountdown += 5;
        this.addLog(`✓ Research complete: ${t.name}`, 'ok');
        this.researching = null;
        this.researchProg = 0;
      }
    }

    // Morale dynamics
    const bldMorale = Object.entries(this.buildings)
      .reduce((s, [id, c]) => s + (BUILDINGS[id]?.morale || 0) * (c || 0), 0);

    if (this.food < 80)        this.morale = this._clamp(this.morale - 12, 0, 100);
    else if (this.food > 400)  this.morale = this._clamp(this.morale + 2, 0, 100);

    this.morale = this._clamp(this.morale + Math.min(bldMorale * 0.25, 3), 0, 100);
    if (this.morale < 25 && this.turn % 3 === 0) this.morale = this._clamp(this.morale - 3, 0, 100);

    // Population growth
    const growthRate = (this.morale / 100) * 2.8;
    this.population += Math.floor(growthRate);
    this.workers    = Math.floor(this.population * 0.60);
    this.scientists = Math.floor(this.population * 0.14);
    this.children   = Math.floor(this.population * 0.26);

    // Blight
    this.blightCountdown--;
    if (this.blightCountdown <= 0) {
      gameMap.advanceBlight(1 + Math.floor(Math.random() * 2));
      this.blightCountdown = 4 + Math.floor(Math.random() * 3);
      const dist = gameMap.blightFront - gameMap.cx;
      if (dist < 6)       this.addLog('⚠⚠ CRITICAL — Blight is at the colony perimeter!', 'danger');
      else if (dist < 14) this.addLog(`Blight advancing. Front ${dist} tiles from colony.`, 'blight');
    }

    // Check win/lose
    return this._checkEndCondition(gameMap);
  }

  _checkEndCondition(gameMap) {
    if (this.shipProgress >= 100)           return 'win-ship';
    if (gameMap.blightFront <= gameMap.cx)  return 'lose-blight';
    if (this.morale < 5)                    return 'lose-morale';
    return null;
  }
}

// ═══════════════════════════════════════════════
// GAME CONTROLLER
// ═══════════════════════════════════════════════

const Game = {
  state: null,
  map: null,
  renderer: null,
  storyData: null,
  techsData: null,
  renderLoop: null,
  pendingModal: null,

  async init() {
    // Load data files
    try {
      const [tilesRes, storyRes, techsRes] = await Promise.all([
        fetch('data/tiles.json').then(r => r.json()),
        fetch('data/story.json').then(r => r.json()),
        fetch('data/techs.json').then(r => r.json()),
      ]);
      this.tilesData = tilesRes;
      this.storyData = storyRes;
      this.techsData = techsRes;
    } catch(e) {
      console.error('Failed to load data:', e);
    }
  },

  async startGame(faction) {
    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('app').style.display = 'flex';

    this.state = new GameState(faction);
    this.map   = new GameMap();

    // Init renderer
    const canvas = document.getElementById('map-canvas');
    this.renderer = new MapRenderer(canvas);
    this.renderer.resize();
    if (this.tilesData) await this.renderer.loadTiles(this.tilesData);

    // Faction badge
    const fb = document.getElementById('hud-faction');
    fb.textContent = faction === 'eden' ? 'EDEN' : 'PLYMOUTH';
    fb.className = 'faction-tag ' + faction;

    this.state.addLog(
      `Colony ${faction === 'eden' ? 'Eden' : 'Plymouth'} online. Blight detected. Starship construction priority.`,
      'event'
    );
    this.state.addLog(
      faction === 'eden'
        ? 'Axen Moon: "Something has gone horribly wrong. Evacuate immediately."'
        : 'Emma Burke: "Volcanic eruption imminent. All units — move to extraction point."',
      'story'
    );

    // Show first mission briefing
    this._showMissionBriefing(0);

    // Start render loop
    this._startRenderLoop();
    this._renderUI();
  },

  _startRenderLoop() {
    const loop = () => {
      if (this.renderer && this.map) this.renderer.render(this.map);
      this.renderLoop = requestAnimationFrame(loop);
    };
    loop();
  },

  _showMissionBriefing(idx) {
    const missions = MISSION_META[this.state.faction];
    if (idx >= missions.length) return;
    const m = missions[idx];
    this.state.mission = idx;

    const brief = this.storyData?.[this.state.faction]?.briefings?.[idx] || '';
    const story = this.storyData?.[this.state.faction]?.story?.[idx] || '';

    document.getElementById('bm-label').textContent =
      `${this.state.faction.toUpperCase()} — MISSION ${m.num} OF 12`;
    document.getElementById('bm-title').textContent = m.title.toUpperCase();
    document.getElementById('bm-brief').textContent = brief || '(No briefing available)';

    const objEl = document.getElementById('bm-objectives');
    objEl.innerHTML = '<div class="bm-objectives-title">Mission Objectives</div>' +
      m.objectives.map(o => `<div class="bm-objective">${o}</div>`).join('');

    if (story) {
      document.getElementById('bm-story').style.display = 'block';
      document.getElementById('bm-story-title').textContent =
        `CHAPTER ${idx+1} — ${this.state.faction.toUpperCase()} PERSPECTIVE`;
      document.getElementById('bm-story-body').textContent = story.substring(0, 500) + '...';
    } else {
      document.getElementById('bm-story').style.display = 'none';
    }

    // Choices for this mission
    const choices = this._getMissionChoices(idx);
    const cc = document.getElementById('bm-choices');
    cc.innerHTML = '';
    choices.forEach(c => {
      const btn = document.createElement('button');
      btn.className = 'bm-choice';
      btn.textContent = c.text;
      btn.onclick = () => {
        this.state.applyFx(c.fx);
        document.getElementById('briefing-modal').style.display = 'none';
        this.state.addLog(`▶ ${c.text.substring(0, 70)}`, 'story');
        this._renderUI();
      };
      cc.appendChild(btn);
    });

    document.getElementById('briefing-modal').style.display = 'block';
    document.getElementById('hud-mission').textContent = `M${m.num}/12`;
  },

  _getMissionChoices(idx) {
    const eden_choices = [
      [{text:'Prioritise child evacuation (Morale+, Ore-)',fx:{morale:8,ore:-80}},{text:'Maximise resource extraction',fx:{ore:130,morale:-4}}],
      [{text:'Accelerate database reconstruction (+Science)',fx:{sci:200}},{text:'Reinforce Blight containment barriers',fx:{blightDelay:5,ore:-60}}],
      [{text:'Build Advanced Lab immediately',fx:{sci:160,ore:-200}},{text:'Prioritise population growth',fx:{morale:12,pop:18}}],
      [{text:'Decrypt Savant data (+Ship, Blight risk)',fx:{shipBonus:14,blightRisk:true}},{text:'Destroy the signal — no contact with Blight',fx:{morale:7,sci:100}}],
      [{text:'Resist the eugenics regime (Morale++)',fx:{morale:14,ore:-130}},{text:'Tactical compromise (Ore+, Morale-)',fx:{ore:110,morale:-12}}],
      [{text:'Accept Plymouth alliance — share ship data',fx:{shipBonus:12,morale:9,rare:45}},{text:'Eden proceeds alone',fx:{ore:90}}],
      [{text:'Organise secret rescue of Axen Moon',fx:{morale:16,ore:-160,shipBonus:5}},{text:'Axen is expendable — prioritise the ship',fx:{shipBonus:9,morale:-13}}],
      [{text:'Announce the ship plan publicly (Morale+++)',fx:{morale:20,ore:-80}},{text:'Keep it secret for security',fx:{ore:55,morale:4}}],
      [{text:'Silent recovery operation',fx:{shipBonus:19,ore:-110}},{text:'Direct assault — faster but costly',fx:{shipBonus:24,ore:-220,morale:-6}}],
      [{text:'Build advanced perimeter defences',fx:{ore:-190,morale:6,blightDelay:3}},{text:'Ignore defences — complete the ship',fx:{shipBonus:11,morale:-9}}],
      [{text:'Offer to share the ship with Plymouth children',fx:{morale:22,shipBonus:9}},{text:'The Gene Bank is ours',fx:{shipBonus:5,ore:110}}],
      [{text:'Embark Plymouth children on our ship',fx:{morale:28,shipBonus:16}},{text:'Our people first',fx:{shipBonus:8,ore:160}}],
    ];
    const ply_choices = [
      [{text:'Maximum evacuation speed (Morale+)',fx:{morale:9,ore:-65}},{text:'Carry maximum resources',fx:{ore:110,morale:-5}}],
      [{text:'Invest in food production (+Food/turn)',fx:{foodBonus:9,morale:5}},{text:'Prioritise scientific research',fx:{sci:160,ore:-80}}],
      [{text:'Send reconnaissance to Eden',fx:{sci:190,rare:35,morale:4}},{text:'Stay away from Eden — too dangerous',fx:{ore:65}}],
      [{text:'Eden data reveals Blight — share openly',fx:{sci:210,morale:9}},{text:'Keep discoveries secret for advantage',fx:{sci:210,ore:90}}],
      [{text:'Accelerate Blight research (BlightDelay+)',fx:{blightDelay:7,sci:210}},{text:'Absolute priority on ship construction',fx:{shipBonus:13,ore:-110}}],
      [{text:'Propose joint ship programme with Eden',fx:{shipBonus:11,morale:14,rare:45}},{text:'Plymouth builds alone',fx:{ore:110,morale:4}}],
      [{text:'Fully integrate Eden technicians',fx:{sci:210,morale:9,shipBonus:9}},{text:'Use them only for research',fx:{sci:160}}],
      [{text:'Build advanced Eden countermeasures',fx:{ore:-160,morale:7}},{text:'Counter-attack Eden immediately',fx:{shipBonus:6,ore:-110,morale:-6}}],
      [{text:'Offer Gene Bank trade to Eden',fx:{shipBonus:16,rare:65}},{text:'Plymouth is self-sufficient',fx:{ore:110}}],
      [{text:'Coordinate withdrawal with Eden technicians',fx:{morale:9,shipBonus:6}},{text:'Advance independently',fx:{ore:90}}],
      [{text:'Final offer: shared boarding for both colonies',fx:{morale:22,shipBonus:11}},{text:'Plymouth survives alone',fx:{ore:130,shipBonus:6}}],
      [{text:'Launch EMP missile on Eden, escape on ship',fx:{shipBonus:22,morale:-11}},{text:'Last offer: embark children from both colonies',fx:{shipBonus:16,morale:20}}],
    ];
    const choicesList = this.state.faction === 'eden' ? eden_choices : ply_choices;
    return choicesList[idx] || [];
  },

  nextTurn() {
    if (!this.state || this.state.over) return;

    // Check mission advance
    const missions = MISSION_META[this.state.faction];
    const nextIdx = this.state.mission + 1;
    if (nextIdx < missions.length) {
      const nextM = missions[nextIdx];
      if (this.state.turn >= nextM.turn && !this.state.triggered['m' + nextIdx]) {
        this.state.triggered['m' + nextIdx] = true;
        this._showMissionBriefing(nextIdx);
        return;
      }
    }

    // Procedural event
    if (this.state.procCooldown <= 0 && this.state.turn > 3 && Math.random() < 0.28) {
      const ev = PROC_EVENTS[Math.floor(Math.random() * PROC_EVENTS.length)];
      this.state.procCooldown = 3;
      this._showEventModal(ev);
      return;
    }

    this._continueTurn();
  },

  _continueTurn() {
    const result = this.state.tickTurn(this.map);
    if (result) this._endGame(result);
    else this._renderUI();
  },

  _showEventModal(ev) {
    document.getElementById('em-title').textContent = ev.title;
    document.getElementById('em-body').textContent  = ev.body;
    const cc = document.getElementById('em-choices');
    cc.innerHTML = '';
    ev.choices.forEach(c => {
      const btn = document.createElement('button');
      btn.className = 'bm-choice';
      btn.textContent = c.text;
      btn.onclick = () => {
        this.state.applyFx(c.fx);
        document.getElementById('event-modal').style.display = 'none';
        this.state.addLog(`▶ ${c.text.substring(0, 60)}`, 'story');
        this._renderUI();
        this._continueTurn();
      };
      cc.appendChild(btn);
    });
    document.getElementById('event-modal').style.display = 'block';
  },

  _endGame(result) {
    this.state.over = true;
    document.getElementById('turn-btn').disabled = true;
    if (this.renderLoop) cancelAnimationFrame(this.renderLoop);
    // One final render
    if (this.renderer && this.map) this.renderer.render(this.map);

    const s = document.getElementById('end-screen');
    const titleEl = document.getElementById('end-title');
    const subEl   = document.getElementById('end-subtitle');

    if (result === 'win-ship') {
      titleEl.textContent = 'HUMANITY SAVED';
      titleEl.style.color = '#4cbc6c';
      subEl.textContent = this.state.faction === 'eden'
        ? 'The Eden starship launches at turn ' + this.state.turn + '. Against the eugenics regime, Axen Moon ensured Plymouth\'s children boarded alongside Eden\'s. The Conestoga\'s legacy lives on among the stars.'
        : 'Plymouth\'s starship launches at turn ' + this.state.turn + '. Emma Burke fulfilled her promise — children of both colonies are aboard. New Terra fades into the dark behind them. Humanity endures.';
    } else if (result === 'lose-blight') {
      titleEl.textContent = 'COLONY CONSUMED';
      titleEl.style.color = '#cc3c2c';
      subEl.textContent = 'The Blight reached the colony core at turn ' + this.state.turn + '. The terraforming microbe — Eden\'s own creation — has consumed the last refuge of humanity on New Terra. The starship was never completed.';
    } else {
      titleEl.textContent = 'COLONY COLLAPSE';
      titleEl.style.color = '#cc3c2c';
      subEl.textContent = 'Morale collapsed to zero at turn ' + this.state.turn + '. The colony fractured from within — not from the Blight, not from the rival colony, but from despair. Without social cohesion, no ship can be built. Humanity fades in silence.';
    }

    document.getElementById('end-stats').innerHTML = `
      <div class="end-stat"><span class="es-val" style="color:#c8943c">${this.state.turn}</span><span class="es-lbl">Turns</span></div>
      <div class="end-stat"><span class="es-val" style="color:#c8943c">${Math.floor(this.state.ore)}</span><span class="es-lbl">Ore</span></div>
      <div class="end-stat"><span class="es-val" style="color:#8e97a7">${Math.floor(this.state.rare)}</span><span class="es-lbl">Rare Ore</span></div>
      <div class="end-stat"><span class="es-val" style="color:#cc80ff">${Math.floor(this.state.shipProgress)}%</span><span class="es-lbl">Ship</span></div>
      <div class="end-stat"><span class="es-val" style="color:#4cbc6c">${this.state.techDone.length}</span><span class="es-lbl">Techs</span></div>
      <div class="end-stat"><span class="es-val" style="color:#4cbc6c">${Math.floor(this.state.morale)}%</span><span class="es-lbl">Morale</span></div>
      <div class="end-stat"><span class="es-val">${Math.floor(this.state.population)}</span><span class="es-lbl">Survivors</span></div>
      <div class="end-stat"><span class="es-val" style="color:#cc80ff">${this.state.mission + 1}</span><span class="es-lbl">Mission</span></div>
    `;
    s.style.display = 'flex';
  },

  build(id) {
    if (!this.state || this.state.over) return;
    const ok = this.state.build(id);
    if (ok) this.map.placeBuilding(id);
    this._renderUI();
  },

  startResearch(techId) {
    if (!this.state || this.state.over) return;
    const allTechs = [
      ...(this.techsData?.multi || []),
      ...(this.techsData?.[this.state.faction] || []),
    ];
    const tech = allTechs.find(t => t.id === techId);
    if (tech) { this.state.startResearch(tech); this._renderUI(); }
  },

  log(text, type = 'event') {
    if (this.state) this.state.addLog(text, type);
    this._renderLog();
  },

  _renderUI() {
    this._renderHUD();
    this._renderBuildGrid();
    this._renderProdBars();
    this._renderTechTree();
    this._renderLog();
  },

  _renderHUD() {
    const G = this.state;
    document.getElementById('hud-ore').textContent   = fmt(G.ore);
    document.getElementById('hud-rare').textContent  = fmt(G.rare);
    document.getElementById('hud-food').textContent  = fmt(G.food);
    document.getElementById('hud-pop').textContent   = fmt(G.population);
    document.getElementById('hud-sci').textContent   = fmt(G.sci);
    document.getElementById('hud-ship').textContent  = Math.floor(G.shipProgress) + '%';
    document.getElementById('hud-turn').textContent  = G.turn;
    const moralePct = Math.floor(G.morale);
    document.getElementById('hud-morale-pct').textContent = moralePct + '%';
    const mf = document.getElementById('hud-morale-fill');
    mf.style.width = moralePct + '%';
    mf.style.background = moralePct > 70 ? '#4cbc6c' : moralePct > 38 ? '#c8943c' : '#cc3c2c';
    const bw = document.getElementById('hud-blight');
    bw.style.visibility = G.blightCountdown <= 4 ? 'visible' : 'hidden';
    bw.querySelector('.blight-text').textContent = `BLIGHT T-${Math.max(0,G.blightCountdown)}`;
    const sf = document.getElementById('ship-progress-fill');
    sf.style.width = Math.floor(G.shipProgress) + '%';
  },

  _renderBuildGrid() {
    const G = this.state;
    const grid = document.getElementById('build-grid');
    grid.innerHTML = Object.entries(BUILDINGS).map(([id, b]) => {
      const cnt  = G.buildings[id] || 0;
      const broke = !G.canAfford(b.cost);
      const locked = b.req && !G.buildings[b.req] && !G.techDone.includes(b.req);
      const cost = Object.entries(b.cost)
        .map(([r,v]) => `${v}${r==='ore'?'⚡':r==='rare'?'💎':'🌾'}`)
        .join(' ');
      const tip = `${b.desc}${locked ? ' — LOCKED: ' + b.req : ''}`.replace(/'/g,"'");
      return `<div class="build-card${broke?' broke':''}${locked?' locked':''}"
        onclick="Game.build('${id}')"
        onmouseenter="showTip(event,'${tip}')"
        onmouseleave="hideTip()">
        <span class="bc-icon">${locked ? '🔒' : b.icon}</span>
        <div class="bc-name">${b.name}</div>
        <div class="bc-cost">${cost}</div>
        <div class="bc-count">[${cnt}]</div>
      </div>`;
    }).join('');
  },

  _renderProdBars() {
    const G = this.state;
    const labLevel = G.buildings.stdlab ? 2 : (G.buildings.basiclab ? 1 : 0);
    const sciActual = labLevel > 0 ? (G.sciPerTurn + (G.sciBonus||0)) * labLevel : 1;
    const items = [
      {l:'Common Ore/t', v:G.orePerTurn+(G.oreBonus||0), max:80,  c:'#c8943c'},
      {l:'Rare Ore/t',   v:G.rarePerTurn,                max:30,  c:'#8e97a7'},
      {l:'Food/t',       v:G.foodPerTurn,                 max:60,  c:'#4cbc6c'},
      {l:'Science/t',    v:sciActual,                     max:40,  c:'#88aadd'},
      {l:'Ship %',       v:Math.floor(G.shipProgress),   max:100, c:'#cc80ff'},
    ];
    document.getElementById('prod-bars').innerHTML = items.map(it => `
      <div class="prod-row">
        <div class="prod-header">
          <span class="prod-label">${it.l}</span>
          <span class="prod-value" style="color:${it.c}">${it.v}</span>
        </div>
        <div class="prod-track">
          <div class="prod-fill" style="width:${Math.min(100,(it.v/it.max)*100)}%;background:${it.c}"></div>
        </div>
      </div>`).join('');
  },

  _renderTechTree() {
    if (!this.techsData) return;
    const G = this.state;
    const allTechs = [
      ...(this.techsData.multi || []),
      ...(this.techsData[G.faction] || []),
    ].slice(0, 40); // limit for performance

    const categories = {};
    allTechs.forEach(t => {
      const cat = t.id.includes('Geo') || t.id.includes('Ore') || t.id.includes('Hydro') || t.id.includes('Super') ? 'Production'
                : t.id.includes('Psych') || t.id.includes('Social') || t.id.includes('Health') || t.id.includes('Hypno') ? 'Colony'
                : t.id.includes('Gene') || t.id.includes('Launch') || t.id.includes('Space') || t.id.includes('Seism') ? 'Starship'
                : 'Research';
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(t);
    });

    let html = '';
    for (const [cat, techs] of Object.entries(categories)) {
      html += `<div class="tech-category">${cat}</div>`;
      techs.forEach(t => {
        const done = G.techDone.includes(t.id);
        const prog = G.researching?.id === t.id;
        const pct  = prog ? Math.round((G.researchProg / G.researching.cost) * 100) : 0;
        const tip  = (t.improve || t.desc || '').replace(/'/g,"'").substring(0,80);
        html += `<div class="tech-row${done?' t-done':prog?' t-prog':''}"
          onclick="${done||prog ? '' : `Game.startResearch('${t.id}')`}"
          onmouseenter="showTip(event,'${tip}')"
          onmouseleave="hideTip()">
          <span class="tech-name">${t.name}</span>
          ${done ? '<span class="tech-badge tb-done">DONE</span>'
                 : prog ? `<span class="tech-badge tb-prog">${pct}%</span>`
                 : `<span class="tech-cost">${t.cost}sc</span>`}
        </div>`;
      });
    }
    document.getElementById('tech-scroll').innerHTML = html;
  },

  _renderLog() {
    if (!this.state) return;
    const el = document.getElementById('log-inner');
    el.innerHTML = this.state.log
      .map(e => `<div class="log-entry le-${e.type[0]}">${e.text}</div>`)
      .join('');
  },
};

// ═══════════════════════════════════════════════
// TOOLTIP
// ═══════════════════════════════════════════════

function showTip(e, text) {
  if (!text) return;
  const t = document.getElementById('tooltip');
  t.textContent = text;
  t.style.display = 'block';
  _moveTip(e);
}
function hideTip() { document.getElementById('tooltip').style.display = 'none'; }
function _moveTip(e) {
  const t = document.getElementById('tooltip');
  let x = e.clientX + 14, y = e.clientY - 8;
  if (x + 240 > window.innerWidth) x = e.clientX - 250;
  t.style.left = x + 'px';
  t.style.top  = y + 'px';
}
document.addEventListener('mousemove', e => {
  const t = document.getElementById('tooltip');
  if (t.style.display === 'block') _moveTip(e);
});

// ═══════════════════════════════════════════════
// UTILS
// ═══════════════════════════════════════════════

function fmt(n) { return Math.floor(n).toLocaleString('en'); }

window.addEventListener('resize', () => {
  if (Game.renderer) { Game.renderer.resize(); }
});

// Boot
document.addEventListener('DOMContentLoaded', () => Game.init());
