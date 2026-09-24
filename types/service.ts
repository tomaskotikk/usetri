export type ServiceCategory =
  | 'hudba'
  | 'video'
  | 'hry'
  | 'software'
  | 'vzdelavani'
  | 'zdravi'
  | 'soukromi'
  | 'cloud'
  | 'ai'
  | 'zpravy'

export type GlyphKey = 'spotify' | 'netflix' | 'disney' | 'youtube' | 'adobe'

export interface Service {
  slug: string
  name: string
  plan: string
  category: ServiceCategory
  color: string
  /** Monthly price of the whole shared plan, in CZK. */
  fullPrice: number
  /** How many people the official plan covers. */
  seats: number
  /** Mock count of groups currently looking for members. */
  openGroups: number
  glyph?: GlyphKey
}

export interface CategoryMeta {
  id: ServiceCategory
  label: string
  description: string
}

export const categories: CategoryMeta[] = [
  {
    id: 'video',
    label: 'Filmy a seriály',
    description:
      'Streamovací služby nabízí rodinné plány pro 3–6 obrazovek. Rozdělte si je a plaťte zlomek ceny.',
  },
  {
    id: 'hudba',
    label: 'Hudba a podcasty',
    description: 'Rodinné hudební plány počítají s celou domácností — stačí ji naplnit.',
  },
  {
    id: 'hry',
    label: 'Hry',
    description: 'Herní předplatné se dá sdílet napříč konzolemi i PC v rámci rodinné skupiny.',
  },
  {
    id: 'software',
    label: 'Software a kreativita',
    description: 'Nástroje pro tvorbu bývají nejdražší položkou. Týmové licence to řeší.',
  },
  {
    id: 'soukromi',
    label: 'Soukromí a bezpečnost',
    description: 'VPN a správci hesel počítají s víc zařízeními i členy rodiny.',
  },
  {
    id: 'cloud',
    label: 'Cloud a úložiště',
    description: 'Terabajty místa se dají sdílet, aniž by kdokoliv viděl vaše soubory.',
  },
  {
    id: 'vzdelavani',
    label: 'Vzdělávání',
    description: 'Jazykové a vzdělávací aplikace mají rodinné plány až pro šest lidí.',
  },
  {
    id: 'zdravi',
    label: 'Zdraví a sport',
    description: 'Od běhání po meditaci — rodinné plány fungují i tady.',
  },
  {
    id: 'zpravy',
    label: 'Zprávy a čtení',
    description: 'Předplatné médií se dá sdílet v rámci domácnosti nebo redakčního týmu.',
  },
]

export const services: Service[] = [
  // ---------- video ----------
  { slug: 'netflix-premium', name: 'Netflix', plan: 'Premium (4K, 4 obrazovky)', category: 'video', color: '#e50914', fullPrice: 309, seats: 4, openGroups: 34, glyph: 'netflix' },
  { slug: 'disney-plus', name: 'Disney+', plan: 'Standard (2 obrazovky)', category: 'video', color: '#0063e5', fullPrice: 189, seats: 4, openGroups: 27, glyph: 'disney' },
  { slug: 'hbo-max', name: 'HBO Max', plan: 'Standard', category: 'video', color: '#7b2bf9', fullPrice: 219, seats: 3, openGroups: 21 },
  { slug: 'apple-tv', name: 'Apple TV+', plan: 'Rodinné sdílení', category: 'video', color: '#111111', fullPrice: 199, seats: 6, openGroups: 16 },
  { slug: 'amazon-prime', name: 'Amazon Prime', plan: 'Prime Video', category: 'video', color: '#00a8e1', fullPrice: 149, seats: 3, openGroups: 12 },
  { slug: 'skyshowtime', name: 'SkyShowtime', plan: 'Standard', category: 'video', color: '#0c1c4c', fullPrice: 159, seats: 3, openGroups: 9 },
  { slug: 'voyo', name: 'Voyo', plan: 'Kompletní', category: 'video', color: '#e4002b', fullPrice: 199, seats: 4, openGroups: 14 },
  { slug: 'crunchyroll', name: 'Crunchyroll', plan: 'Mega Fan', category: 'video', color: '#f47521', fullPrice: 249, seats: 4, openGroups: 7 },
  { slug: 'paramount-plus', name: 'Paramount+', plan: 'Standard', category: 'video', color: '#0064ff', fullPrice: 149, seats: 3, openGroups: 6 },

  // ---------- hudba ----------
  { slug: 'spotify-family', name: 'Spotify', plan: 'Family (6 členů)', category: 'hudba', color: '#1db954', fullPrice: 259, seats: 6, openGroups: 41, glyph: 'spotify' },
  { slug: 'spotify-duo', name: 'Spotify', plan: 'Duo (2 členové)', category: 'hudba', color: '#1db954', fullPrice: 165, seats: 2, openGroups: 19, glyph: 'spotify' },
  { slug: 'youtube-premium', name: 'YouTube Premium', plan: 'Family (6 členů)', category: 'hudba', color: '#ff0033', fullPrice: 279, seats: 6, openGroups: 33, glyph: 'youtube' },
  { slug: 'apple-music', name: 'Apple Music', plan: 'Family (6 členů)', category: 'hudba', color: '#fa243c', fullPrice: 249, seats: 6, openGroups: 22 },
  { slug: 'deezer', name: 'Deezer', plan: 'Family (6 členů)', category: 'hudba', color: '#a238ff', fullPrice: 269, seats: 6, openGroups: 5 },
  { slug: 'tidal', name: 'Tidal', plan: 'Family', category: 'hudba', color: '#00ffff', fullPrice: 299, seats: 6, openGroups: 4 },

  // ---------- hry ----------
  { slug: 'nintendo-online', name: 'Nintendo Switch Online', plan: 'Family (8 členů)', category: 'hry', color: '#e60012', fullPrice: 149, seats: 8, openGroups: 13 },

  // ---------- software ----------
  { slug: 'adobe-cc', name: 'Adobe CC', plan: 'All Apps (Teams)', category: 'software', color: '#eb1000', fullPrice: 1450, seats: 4, openGroups: 15, glyph: 'adobe' },
  { slug: 'adobe-photography', name: 'Adobe', plan: 'Photography (Lr + Ps)', category: 'software', color: '#eb1000', fullPrice: 349, seats: 2, openGroups: 8, glyph: 'adobe' },
  { slug: 'microsoft-365', name: 'Microsoft 365', plan: 'Family (6 členů)', category: 'software', color: '#0078d4', fullPrice: 259, seats: 6, openGroups: 24 },
  { slug: 'canva-pro', name: 'Canva', plan: 'Teams (5 členů)', category: 'software', color: '#00c4cc', fullPrice: 379, seats: 5, openGroups: 12 },
  { slug: 'figma', name: 'Figma', plan: 'Professional', category: 'software', color: '#f24e1e', fullPrice: 349, seats: 3, openGroups: 6 },
  { slug: 'notion', name: 'Notion', plan: 'Plus (tým)', category: 'software', color: '#111111', fullPrice: 269, seats: 4, openGroups: 9 },

  // ---------- soukromi ----------
  { slug: 'nordvpn', name: 'NordVPN', plan: '6 zařízení', category: 'soukromi', color: '#4687ff', fullPrice: 199, seats: 6, openGroups: 28 },
  { slug: 'proton-family', name: 'Proton', plan: 'Family (6 členů)', category: 'soukromi', color: '#6d4aff', fullPrice: 599, seats: 6, openGroups: 18 },
  { slug: 'expressvpn', name: 'ExpressVPN', plan: '5 zařízení', category: 'soukromi', color: '#da3940', fullPrice: 249, seats: 5, openGroups: 9 },
  { slug: 'surfshark', name: 'Surfshark', plan: 'One', category: 'soukromi', color: '#1ebfbf', fullPrice: 179, seats: 5, openGroups: 7 },
  { slug: '1password', name: '1Password', plan: 'Family (5 členů)', category: 'soukromi', color: '#0572ec', fullPrice: 129, seats: 5, openGroups: 11 },

  // ---------- cloud ----------
  { slug: 'google-one', name: 'Google One', plan: '2 TB (5 členů)', category: 'cloud', color: '#1a73e8', fullPrice: 249, seats: 5, openGroups: 26 },
  { slug: 'icloud-plus', name: 'iCloud+', plan: '2 TB (rodina)', category: 'cloud', color: '#3b82f6', fullPrice: 249, seats: 6, openGroups: 23 },
  { slug: 'dropbox', name: 'Dropbox', plan: 'Family (6 členů)', category: 'cloud', color: '#0061ff', fullPrice: 449, seats: 6, openGroups: 5 },
  { slug: 'mega', name: 'MEGA', plan: 'Pro Flexi', category: 'cloud', color: '#d9272e', fullPrice: 299, seats: 3, openGroups: 3 },

  // ---------- vzdelavani ----------
  { slug: 'duolingo', name: 'Duolingo', plan: 'Super Family (6 členů)', category: 'vzdelavani', color: '#58cc02', fullPrice: 299, seats: 6, openGroups: 31 },
  { slug: 'babbel', name: 'Babbel', plan: 'Rodinné sdílení', category: 'vzdelavani', color: '#ff9c00', fullPrice: 249, seats: 6, openGroups: 8 },
  { slug: 'skillshare', name: 'Skillshare', plan: 'Teams', category: 'vzdelavani', color: '#00ff84', fullPrice: 399, seats: 4, openGroups: 5 },
  { slug: 'masterclass', name: 'MasterClass', plan: 'Duo / Family', category: 'vzdelavani', color: '#e50914', fullPrice: 449, seats: 6, openGroups: 4 },

  // ---------- zdravi ----------
  { slug: 'strava', name: 'Strava', plan: 'Family (4 členové)', category: 'zdravi', color: '#fc4c02', fullPrice: 249, seats: 4, openGroups: 14 },
  { slug: 'headspace', name: 'Headspace', plan: 'Family (6 členů)', category: 'zdravi', color: '#ff7e1d', fullPrice: 199, seats: 6, openGroups: 6 },
  { slug: 'calm', name: 'Calm', plan: 'Family (6 členů)', category: 'zdravi', color: '#2a6ef5', fullPrice: 229, seats: 6, openGroups: 5 },
  { slug: 'myfitnesspal', name: 'MyFitnessPal', plan: 'Premium Family', category: 'zdravi', color: '#0066ee', fullPrice: 249, seats: 6, openGroups: 4 },

  // ---------- zpravy ----------
  { slug: 'denik-n', name: 'Deník N', plan: 'Rodinné předplatné', category: 'zpravy', color: '#d7263d', fullPrice: 249, seats: 4, openGroups: 7 },
  { slug: 'seznam-zpravy', name: 'Seznam Zprávy', plan: 'Premium', category: 'zpravy', color: '#cc0000', fullPrice: 149, seats: 3, openGroups: 6 },
  { slug: 'nyt', name: 'New York Times', plan: 'All Access', category: 'zpravy', color: '#111111', fullPrice: 399, seats: 4, openGroups: 5 },
  { slug: 'medium', name: 'Medium', plan: 'Členství', category: 'zpravy', color: '#111111', fullPrice: 199, seats: 5, openGroups: 3 },
]

export function pricePerSeat(service: Service) {
  return Math.round(service.fullPrice / service.seats)
}

export function savingsPercent(service: Service) {
  return Math.round((1 - 1 / service.seats) * 100)
}

export function getService(slug: string) {
  return services.find((s) => s.slug === slug)
}

export function servicesByCategory(category: ServiceCategory) {
  return services.filter((s) => s.category === category)
}
