import { ColorKey, Colors, colors as palette } from "../foundation";
import { ThemeableColorOptions } from "../plugin";

export const BACKGROUND_PROPERTY = "--wg-background";

/**
 * Retrieves a specific color from Tailwind's themable colors based on a provided key or color string.
 *
 * @param keyOrColor - The key representing a color in the palette (e.g. "wg-blue") or a direct color string (e.g. "#FFFFFF").
 *
 * @returns the DEFAULT color for that key is returned
 *
 * @example
 * getColorFromPalette("wg-blue");  // return the DEFAULT color for the 'wg-blue' key
 * getColorFromPalette("#FFFFFF");  // returns "#FFFFFF"
 */
export const getColorFromPalette = (keyOrColor: string, themeColors: Colors): string => {
  // Try to find the key in the palette
  if (keyOrColor in themeColors) {
    const colorKey = keyOrColor as ColorKey;

    return themeColors[colorKey]?.DEFAULT ?? (themeColors[colorKey] as string);
  }

  // If the color is not in the palette, return the color as-is
  return keyOrColor;
};

/**
 * Generates CSS variable declarations for themable colors based on user preferences.
 *
 * The function fetches colors from the palette or defaults based on the provided themeable options.
 * It constructs CSS for both light and dark color schemes.
 *
 * @param colors - User-specified themeable color options. If omitted, defaults are used.
 * @returns An object with CSS selectors and their corresponding themable color declarations.
 *
 * @example
 * const themeColors = getBaseThemableColors({
 *   light: { background: 'wg-blue' },
 *   dark: { background: 'wg-dark' }
 * });
 */
const getBaseThemableColors = (colors?: ThemeableColorOptions, themeColors?: Colors) => {
  const defaultLightBgColor = palette["wg-white"].DEFAULT;
  const defaultDarkBgColor = palette["wg-dark"].DEFAULT;

  const lightBgColor = getColorFromPalette(
    colors?.light?.background ?? defaultLightBgColor,
    themeColors ?? palette // Fallback to the default, non extended palette if no themeable colors are available
  );

  const darkBgColor = getColorFromPalette(
    colors?.dark?.background ?? defaultDarkBgColor,
    themeColors ?? palette // Fallback to the default, non extended palette if no themeable colors are available
  );

  return {
    ":root, .light": {
      [BACKGROUND_PROPERTY]: lightBgColor,
    },
    "@media (prefers-color-scheme: dark)": {
      ":root": {
        [BACKGROUND_PROPERTY]: darkBgColor,
      },
    },
    ".dark": {
      [BACKGROUND_PROPERTY]: darkBgColor,
    },
  };
};

/**
 * For basic colors, add the additional CSS property
 */
const createSimpleColorUtility = (colorName: string, colorValue: string) => {
  return {
    [`.wg-background-${colorName}`]: {
      backgroundColor: colorValue,
      [BACKGROUND_PROPERTY]: colorValue,
    },
  };
};

/**
 * For colors with shades, loop through shades and add the additional CSS property
 */
const createShadedColorUtility = (colorName: string, colorValues: Record<string, string>) => {
  const utilities: Record<string, Record<string, string>> = {};

  for (const [shade, value] of Object.entries(colorValues)) {
    if (shade === "DEFAULT") {
      utilities[`.wg-background-${colorName}`] = {
        backgroundColor: value,
        [BACKGROUND_PROPERTY]: value,
      };
    } else {
      utilities[`.wg-background-${colorName}-${shade}`] = {
        backgroundColor: value,
        [BACKGROUND_PROPERTY]: value,
      };
    }
  }

  return utilities;
};

/**
 * Generate the extended surface utilities
 */
const generateExtendedColorUtilities = (colors: Record<string, any>) => {
  let utilities: typeof colors = {};

  for (const [colorName, colorValue] of Object.entries(colors)) {
    if (typeof colorValue === "string") {
      Object.assign(utilities, createSimpleColorUtility(colorName, colorValue));
    } else if (typeof colorValue === "object") {
      Object.assign(utilities, createShadedColorUtility(colorName, colorValue));
    }
  }

  return utilities;
};

export {
  createShadedColorUtility,
  createSimpleColorUtility,
  generateExtendedColorUtilities,
  getBaseThemableColors,
};