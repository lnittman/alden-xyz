// Color palette organized by color families
export const PALETTE = {
  NEUTRALS: {
    WARM: [
      '#D7CEC7', // Warm Gray 1
      '#C8C1BB', // Moon Rock
      '#B7B1A9', // Ash
      '#A69F98', // Atmosphere
      '#958B84', // Timber Wolf
    ],
    COOL: [
      '#D3DBCE', // Lily White
      '#C5D5CB', // Glacier Gray
      '#B5C7CC', // Harbor Mist
      '#98B4D4', // Serenity
      '#89A7C2', // Celestial
    ]
  },
  EARTH: {
    SAND: [
      '#E8E3D9', // Cloud Cream
      '#E6D3C5', // Toasted Almond
      '#E4D5C5', // Sand Dollar
      '#D1BAA3', // Hazelnut
      '#C5A992', // Warm Sand
    ],
    STONE: [
      '#DAD7CB', // Tidal Foam
      '#D4CDC1', // Peyote
      '#C2BAB1', // Feather Gray
      '#B6ADA5', // Atmosphere
      '#A89D94', // Desert Taupe
    ]
  },
  NATURE: {
    SAGE: [
      '#D2D5C9', // Desert Sage
      '#C3C6BA', // Laurel Oak
      '#B4B7AB', // Rock Ridge
      '#A5A89C', // Dried Herb
      '#96998D', // Vetiver
    ],
    MOSS: [
      '#CCD4C8', // Mineral Gray
      '#BDC5B9', // Shadow Green
      '#AEB6AA', // Alfalfa
      '#9FA79B', // Oil Green
      '#90988C', // Moss Gray
    ]
  },
  WATER: {
    MIST: [
      '#E4E6E8', // Morning Mist
      '#D5D7D9', // Dawn Gray
      '#C6C8CA', // Vapor
      '#B7B9BB', // Silver Cloud
      '#A8AAAC', // Ghost Gray
    ],
    FOG: [
      '#DCE2E5', // Sea Salt
      '#CDD3D6', // Foggy Dew
      '#BEC4C7', // Sterling Blue
      '#AFB5B8', // Blue Fog
      '#A0A6A9', // Storm Gray
    ]
  }
} as const;

// Flattened array of all colors for the random generator
const ALL_COLORS = Object.values(PALETTE)
  .flatMap(family => Object.values(family))
  .flat();

type ColorFamily = keyof typeof PALETTE;
type ColorSubFamily = {
  [K in ColorFamily]: keyof typeof PALETTE[K];
}[ColorFamily];

interface ColorInfo {
  hex: string;
  family: ColorFamily;
  subFamily: ColorSubFamily;
  index: number;
}

/**
 * Generates a consistent color based on an input string
 * @param input - String to generate color from (e.g. user ID, asset ID)
 * @returns Hex color code from the predefined palette
 */
export function generateColor(input: string): string {
  const hash = Array.from(input).reduce(
    (acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0
  );
  return ALL_COLORS[Math.abs(hash) % ALL_COLORS.length];
}

/**
 * Gets detailed information about a color including its family
 * @param hex - The hex color code to look up
 * @returns ColorInfo object or undefined if not found
 */
export function getColorInfo(hex: string): ColorInfo | undefined {
  for (const [family, subFamilies] of Object.entries(PALETTE)) {
    for (const [subFamily, colors] of Object.entries(subFamilies)) {
      const index = colors.indexOf(hex);
      if (index !== -1) {
        return {
          hex,
          family: family as ColorFamily,
          subFamily: subFamily as ColorSubFamily,
          index
        };
      }
    }
  }
  return undefined;
}

/**
 * Gets a complementary color from the opposite family
 * @param hex - The hex color code to find complement for
 * @returns Complementary hex color code
 */
export function getComplementaryColor(hex: string): string {
  const info = getColorInfo(hex);
  if (!info) return hex;

  // Get opposite family
  const families = Object.keys(PALETTE) as ColorFamily[];
  const currentFamilyIndex = families.indexOf(info.family);
  const oppositeFamily = families[(currentFamilyIndex + 2) % families.length];

  // Get first subfamily from opposite family
  const subFamilies = Object.keys(PALETTE[oppositeFamily]) as Array<keyof typeof PALETTE[typeof oppositeFamily]>;
  const oppositeSubFamily = subFamilies[0];

  // Get color at same intensity level
  return PALETTE[oppositeFamily][oppositeSubFamily][info.index];
}

/**
 * Gets a harmonious color from the same family
 * @param hex - The hex color code to find harmony for
 * @returns Harmonious hex color code
 */
export function getHarmoniousColor(hex: string): string {
  const info = getColorInfo(hex);
  if (!info) return hex;

  // Get other subfamily from same family
  const subFamilies = Object.keys(PALETTE[info.family]) as Array<keyof typeof PALETTE[typeof info.family]>;
  const currentSubFamilyIndex = subFamilies.indexOf(info.subFamily as keyof typeof PALETTE[typeof info.family]);
  const harmoniousSubFamily = subFamilies[(currentSubFamilyIndex + 1) % subFamilies.length];

  // Get color at same intensity level
  return PALETTE[info.family][harmoniousSubFamily][info.index];
}

/**
 * Determines if white or black text should be used on a given background color
 * @param bgColor - The background color in hex format
 * @returns '#000000' for dark text or '#ffffff' for light text
 */
export function getContrastingTextColor(bgColor: string): string {
  const r = parseInt(bgColor.slice(1, 3), 16);
  const g = parseInt(bgColor.slice(3, 5), 16);
  const b = parseInt(bgColor.slice(5, 7), 16);
  
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#ffffff';
}

/**
 * Adjusts the opacity of a hex color
 * @param hex - The hex color code
 * @param opacity - Opacity value (0-100)
 * @returns Hex color with opacity
 */
export function withOpacity(hex: string, opacity: number): string {
  const alpha = Math.round((opacity / 100) * 255).toString(16);
  return `${hex}${alpha.padStart(2, '0')}`;
}