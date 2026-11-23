/**
 * AeroShield Knowledge Base
 * Scientific data on winter smog, thermal inversions, IAQ interventions,
 * and low-emission household choices.
 */

export const AQI_BREAKPOINTS = {
  GOOD: { min: 0, max: 50, label: 'Good', color: '#10b981', advice: 'Air quality is satisfactory. Ideal for all normal activities.' },
  MODERATE: { min: 51, max: 100, label: 'Moderate', color: '#f59e0b', advice: 'Acceptable air quality. Sensitive individuals should monitor symptoms.' },
  UNHEALTHY_SENSITIVE: { min: 101, max: 150, label: 'Unhealthy for Sensitive Groups', color: '#f97316', advice: 'Children, elderly, and people with respiratory diseases should limit prolonged outdoor exertion.' },
  UNHEALTHY: { min: 151, max: 200, label: 'Unhealthy', color: '#ef4444', advice: 'Everyone may begin to experience health effects; sensitive groups face serious health risks.' },
  VERY_UNHEALTHY: { min: 201, max: 300, label: 'Very Unhealthy', color: '#8b5cf6', advice: 'Health alert: increased risk of health effects for everyone. Keep windows sealed.' },
  HAZARDOUS: { min: 301, max: 999, label: 'Hazardous (Severe Smog)', color: '#7f1d1d', advice: 'Emergency conditions: severe winter inversion event. Total avoidance of outdoor exertion required.' }
};

export const PRESET_CITIES = {
  delhi: {
    name: 'Delhi NCR',
    country: 'India',
    lat: 28.6139,
    lon: 77.2090,
    baseAqi: 365,
    basePm25: 295,
    basePm10: 420,
    baseNo2: 68,
    inversionIntensity: 'Severe',
    notes: 'Severe winter inversion combined with low wind speeds and agricultural/vehicular emissions.'
  },
  beijing: {
    name: 'Beijing',
    country: 'China',
    lat: 39.9042,
    lon: 116.4074,
    baseAqi: 185,
    basePm25: 125,
    basePm10: 190,
    baseNo2: 52,
    inversionIntensity: 'Moderate-High',
    notes: 'Seasonal heating inversion coupled with basin topography trapping industrial particulate.'
  },
  lahore: {
    name: 'Lahore',
    country: 'Pakistan',
    lat: 31.5204,
    lon: 74.3587,
    baseAqi: 390,
    basePm25: 330,
    basePm10: 480,
    baseNo2: 74,
    inversionIntensity: 'Extreme',
    notes: 'Dense toxic winter smog layer trapped below 150m boundary layer.'
  },
  saltlake: {
    name: 'Salt Lake City',
    country: 'USA',
    lat: 40.7608,
    lon: -111.8910,
    baseAqi: 155,
    basePm25: 65,
    basePm10: 85,
    baseNo2: 40,
    inversionIntensity: 'High',
    notes: 'Valley topography creates multi-day winter cold pool trapping urban particulate.'
  },
  london: {
    name: 'London',
    country: 'UK',
    lat: 51.5074,
    lon: -0.1278,
    baseAqi: 82,
    basePm25: 28,
    basePm10: 42,
    baseNo2: 45,
    inversionIntensity: 'Mild-Moderate',
    notes: 'Winter anti-cyclonic stagnation with elevated roadside nitrogen dioxide.'
  },
  mumbai: {
    name: 'Mumbai',
    country: 'India',
    lat: 19.0760,
    lon: 72.8777,
    baseAqi: 195,
    basePm25: 115,
    basePm10: 180,
    baseNo2: 58,
    inversionIntensity: 'Moderate',
    notes: 'Coastal moisture combined with winter temperature drops creating dense morning haze.'
  }
};

export const IAQ_HACKS = [
  {
    id: 'corsi-rosenthal',
    title: 'DIY Corsi-Rosenthal Box / Fan Filter',
    category: 'Filtration',
    cost: 'Low ($15 - $35)',
    effort: '30 mins assembly',
    effectiveness: 'High (85-92% PM2.5 reduction)',
    description: 'Construct a multi-filter cubic air scrubber using a standard 20-inch box fan and MERV-13 furnace filters.',
    scientificBacking: 'Peer-reviewed studies by UC Davis prove a single box fan with 4 MERV-13 filters delivers Clean Air Delivery Rates (CADR) exceeding commercial $400 HEPA units.',
    materials: ['Standard box fan or table fan', '1-4 MERV-13 or HEPA replacement filters', 'Duct tape', 'Cardboard base shroud'],
    instructions: [
      'Orient the filters with arrows pointing towards the center of the box.',
      'Tape filters along the edges to seal air leaks.',
      'Mount the fan on top blowing clean air upwards into the room.',
      'Cut a round cardboard shroud for the fan face to eliminate corner air turbulence.'
    ]
  },
  {
    id: 'wet-screen-trap',
    title: 'Wet Micro-Curtain Particulate Trap',
    category: 'DIY Moisture & Capture',
    cost: 'Free ($0)',
    effort: '5 mins',
    effectiveness: 'Moderate (35-45% coarse & soot capture)',
    description: 'Hang a damp microfiber towel or cotton sheet near partially opened or drafty window crevices.',
    scientificBacking: 'Water surface tension captures hygroscopic winter soot and coarse aerosols before they settle deep into household soft furnishings.',
    materials: ['Damp microfiber towels', 'Spray bottle with clean water', 'Clothes hangers or curtain clips'],
    instructions: [
      'Moisten clean towels until damp but not dripping.',
      'Hang along window seams where draft leaks are detected.',
      'Re-mist every 3-4 hours during peak morning inversion.',
      'Wash towels daily to avoid mold buildup.'
    ]
  },
  {
    id: 'strategic-ventilation',
    title: 'Thermal Inversion Micro-Ventilation Window',
    category: 'Ventilation',
    cost: 'Free ($0)',
    effort: '10 mins daily',
    effectiveness: 'Critical for CO2 balance',
    description: 'Time window opening strictly between 1:00 PM and 3:00 PM when solar radiation raises the atmospheric boundary layer.',
    scientificBacking: 'Atmospheric mixing depth reaches its diurnal maximum in early afternoon, dropping ground PM2.5 levels by 40-60% compared to 7:00 AM inversion traps.',
    materials: ['Timer/Alarm', 'Cross-breeze control'],
    instructions: [
      'Keep all doors and windows tightly shut from 6:00 PM to 11:00 AM.',
      'Open windows on the side facing away from the primary road at 1:15 PM for 15-20 minutes.',
      'Run indoor filtration on high speed immediately after closing windows.'
    ]
  },
  {
    id: 'anti-voc-protocol',
    title: 'Zero-VOC Smog Lockdown Routine',
    category: 'Source Control',
    cost: 'Free ($0)',
    effort: 'Habitual swap',
    effectiveness: 'High (prevents 80% indoor secondary smog)',
    description: 'Eliminate indoor combustion and volatile organic compound emissions while the home is sealed.',
    scientificBacking: 'Sealing a home without eliminating indoor sources causes indoor TVOCs and ultrafine particles to soar 400% higher than outdoor levels.',
    materials: ['Lid for cooking pots', 'Electric kettle/induction', 'Baking soda/vinegar cleaners'],
    instructions: [
      'Do not light incense, scented candles, or mosquito coils.',
      'Always use tight pot lids while frying or sauteing to trap cooking plumes.',
      'Avoid chemical spray fresheners, solvent-based cleaners, and nail polish removers during smog alerts.'
    ]
  },
  {
    id: 'botanical-iaq-boost',
    title: 'CAM Night-Oxygen Botanical Trio',
    category: 'Biophilic',
    cost: 'Low ($10 - $25)',
    effort: 'Weekly watering',
    effectiveness: 'Mild-Moderate (supports nighttime oxygenation)',
    description: 'Deploy Crassulacean Acid Metabolism (CAM) indoor plants like Snake Plant (Sansevieria) and Spider Plant in bedrooms.',
    scientificBacking: 'NASA Clean Air Studies and subsequent biophilic research document CAM plants absorb carbon dioxide and release oxygen at night while taking up trace formaldehyde.',
    materials: ['Sansevieria trifasciata (Snake plant)', 'Chlorophytum comosum (Spider plant)', 'Well-drained soil pots'],
    instructions: [
      'Place 2-3 mature snake plants in each bedroom.',
      'Keep soil moderately dry in winter to prevent indoor fungal spores.',
      'Wipe leaves weekly with a damp cloth to remove settled dust and restore stomatal breathability.'
    ]
  },
  {
    id: 'door-sweep-sealing',
    title: 'Draft Stopper & Weatherstripping Seal',
    category: 'Envelope Sealing',
    cost: 'Low ($3 - $8)',
    effort: '15 mins',
    effectiveness: 'High (cuts outdoor infiltration by 50%)',
    description: 'Block outside infiltration through bottom door thresholds and window gaps using rolled fabric or foam strips.',
    scientificBacking: 'Stack-effect air infiltration during cold weather pulls outdoor winter smog through gaps beneath main entry doors at up to 1.5 air changes per hour.',
    materials: ['Rolled towel, rolled foam, or silicone adhesive door sweep'],
    instructions: [
      'Inspect main exterior door with a flashlight in the dark; any visible light is a smog corridor.',
      'Position rolled draft stopper or apply peel-and-stick silicone sweep snugly against the floor threshold.',
      'Seal electrical conduit and AC pipe wall pass-throughs with removable putty.'
    ]
  }
];

export const SUSTAINABLE_ALTERNATIVES = [
  {
    id: 'neighborhood-carpool-ring',
    title: 'Neighborhood School & Office Carpool Ring',
    category: 'Mobility',
    individualBenefit: 'Eliminates open scooter/bike smog inhalation by 70%',
    communityImpact: 'Reduces 4-6 vehicle cold-start trips per morning block',
    co2SavedPerWeek: '18.4 kg CO2e',
    pmSavedPerWeek: '42 grams PM2.5/PM10',
    description: 'Coordinate with 3 neighboring families to consolidate morning school drop-offs and office commutes into one sealed vehicle or dedicated vanpool.'
  },
  {
    id: 'clean-electric-heating',
    title: 'Zero-Combustion Heating & Anti-Open-Burning Alliance',
    category: 'Heating & Waste',
    individualBenefit: 'Eliminates lethal carbon monoxide and tar exposure',
    communityImpact: 'Prevents localized ground-level toxic smoke spikes in your street',
    co2SavedPerWeek: '32.0 kg CO2e',
    pmSavedPerWeek: '180 grams PM2.5',
    description: 'Replace biomass/charcoal space heaters with infrared/oil-filled electric radiators; report and assist local watchmen with community-funded electric warmers instead of trash burning.'
  },
  {
    id: 'staggered-transit-routing',
    title: 'Staggered Off-Peak Sealed Rail / Metro Transit',
    category: 'Commute Timing',
    individualBenefit: 'Cuts respiratory particulate intake by up to 82% vs rush-hour street canyon traffic',
    communityImpact: 'Decongests critical road bottlenecks that cause idling emissions',
    co2SavedPerWeek: '12.8 kg CO2e',
    pmSavedPerWeek: '25 grams PM2.5',
    description: 'Shift commute by 45 minutes to utilize underground or sealed metro lines, bypassing stagnant vehicular exhaust plumes on congested arterial flyovers.'
  },
  {
    id: 'anti-idling-pledge',
    title: 'School & Market Zero-Idling Zone Pledge',
    category: 'Community Policy',
    individualBenefit: 'Creates safe breathing zones for children waiting at pickup gates',
    communityImpact: 'Drops ground-level benzene, NOx, and ultrafine particles by up to 55%',
    co2SavedPerWeek: '8.5 kg CO2e',
    pmSavedPerWeek: '15 grams PM2.5',
    description: 'Pledge to turn off engines when parked for more than 30 seconds at school gates, drive-throughs, and residential gates.'
  }
];

export const COMMUNITY_PLEDGES = [
  {
    id: 'pledge-anti-idling',
    title: 'Zero Idle Neighborhood School Gate',
    participants: 142,
    target: 200,
    category: 'Mobility'
  },
  {
    id: 'pledge-heater-provision',
    title: 'Security Guard Electric Blanket Fund (Stop Biomass Burning)',
    participants: 89,
    target: 100,
    category: 'Clean Heat'
  },
  {
    id: 'pledge-clean-school-run',
    title: 'Shared Clean Vanpool for Morning Elementary School',
    participants: 64,
    target: 75,
    category: 'Carpool'
  },
  {
    id: 'pledge-waste-reporting',
    title: 'Civic Anti-Incineration Watch & Rapid Action',
    participants: 215,
    target: 250,
    category: 'Civic'
  }
];
