import { siteConfig } from "./metadata";

export interface OGImageOptions {
  title: string;
  subtitle?: string;
  type?:
    | "default"
    | "certification"
    | "package"
    | "exam"
    | "catalog"
    | "dashboard";
  bgColor?: string;
  textColor?: string;
  accentColor?: string;
}

/**
 * Generate SVG markup for Open Graph images
 */
export function generateOGImageSVG({
  title,
  subtitle,
  type = "default",
  bgColor = "#1e40af", // blue-700
  textColor = "#ffffff",
  accentColor = "#3b82f6", // blue-500
}: OGImageOptions): string {
  const width = 1200;
  const height = 630;

  // Get type-specific styling
  const typeConfig = getTypeConfig(type);

  return `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${bgColor};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${typeConfig.gradientEnd};stop-opacity:1" />
        </linearGradient>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="rgba(0,0,0,0.3)"/>
        </filter>
      </defs>
      
      <!-- Background -->
      <rect width="100%" height="100%" fill="url(#bgGradient)"/>
      
      <!-- Pattern overlay -->
      <g opacity="0.1">
        ${generateBackgroundPattern(type)}
      </g>
      
      <!-- Logo area -->
      <g transform="translate(80, 80)">
        <!-- Logo placeholder - replace with actual logo -->
        <rect x="0" y="0" width="60" height="60" rx="12" fill="${textColor}" opacity="0.9"/>
        <text x="30" y="40" text-anchor="middle" fill="${bgColor}" font-family="Arial, sans-serif" font-size="24" font-weight="bold">Q</text>
        
        <!-- Site name -->
        <text x="80" y="25" fill="${textColor}" font-family="Arial, sans-serif" font-size="28" font-weight="bold">${siteConfig.name}</text>
        <text x="80" y="50" fill="${textColor}" font-family="Arial, sans-serif" font-size="16" opacity="0.8">${typeConfig.tagline}</text>
      </g>
      
      <!-- Main content area -->
      <g transform="translate(80, 200)">
        <!-- Title -->
        <text x="0" y="0" fill="${textColor}" font-family="Arial, sans-serif" font-size="48" font-weight="bold" filter="url(#shadow)">
          ${wrapText(title, 45)}
        </text>
        
        <!-- Subtitle -->
        ${
          subtitle
            ? `
          <text x="0" y="80" fill="${textColor}" font-family="Arial, sans-serif" font-size="24" opacity="0.9">
            ${wrapText(subtitle, 60)}
          </text>
        `
            : ""
        }
      </g>
      
      <!-- Type icon -->
      <g transform="translate(${width - 200}, ${height - 200})">
        ${getTypeIcon(type, accentColor)}
      </g>
      
      <!-- Bottom brand bar -->
      <rect x="0" y="${height - 8}" width="${width}" height="8" fill="${accentColor}"/>
    </svg>
  `.trim();
}

/**
 * Get configuration for different image types
 */
function getTypeConfig(type: string) {
  const configs = {
    default: {
      tagline: "Salesforce Certification Practice",
      gradientEnd: "#1e3a8a", // blue-800
    },
    certification: {
      tagline: "Practice Exams & Study Guides",
      gradientEnd: "#059669", // emerald-600
    },
    package: {
      tagline: "Certification Bundles",
      gradientEnd: "#7c3aed", // violet-600
    },
    exam: {
      tagline: "Practice Exam",
      gradientEnd: "#dc2626", // red-600
    },
    catalog: {
      tagline: "Browse Certifications",
      gradientEnd: "#ea580c", // orange-600
    },
    dashboard: {
      tagline: "Track Your Progress",
      gradientEnd: "#0891b2", // cyan-600
    },
  };

  return configs[type as keyof typeof configs] || configs.default;
}

/**
 * Generate background pattern based on type
 */
function generateBackgroundPattern(type: string): string {
  switch (type) {
    case "certification":
      return `
        <circle cx="200" cy="100" r="40" fill="currentColor"/>
        <circle cx="400" cy="300" r="30" fill="currentColor"/>
        <circle cx="800" cy="150" r="35" fill="currentColor"/>
      `;
    case "package":
      return `
        <rect x="150" y="80" width="60" height="60" rx="8" fill="currentColor"/>
        <rect x="350" y="280" width="50" height="50" rx="8" fill="currentColor"/>
        <rect x="750" y="120" width="55" height="55" rx="8" fill="currentColor"/>
      `;
    case "exam":
      return `
        <polygon points="200,80 240,120 200,160 160,120" fill="currentColor"/>
        <polygon points="400,280 440,320 400,360 360,320" fill="currentColor"/>
        <polygon points="800,120 840,160 800,200 760,160" fill="currentColor"/>
      `;
    default:
      return `
        <circle cx="200" cy="100" r="30" fill="currentColor"/>
        <rect x="380" y="270" width="40" height="40" rx="6" fill="currentColor"/>
        <polygon points="800,120 830,150 800,180 770,150" fill="currentColor"/>
      `;
  }
}

/**
 * Get icon SVG for different types
 */
function getTypeIcon(type: string, color: string): string {
  const iconSize = 120;
  const iconColor = `${color}40`; // Add transparency

  switch (type) {
    case "certification":
      return `
        <circle cx="60" cy="60" r="50" fill="${iconColor}" stroke="${color}" stroke-width="4"/>
        <path d="M30 60 L50 80 L90 40" stroke="${color}" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      `;
    case "package":
      return `
        <rect x="10" y="30" width="100" height="60" rx="8" fill="${iconColor}" stroke="${color}" stroke-width="4"/>
        <rect x="20" y="20" width="80" height="8" rx="4" fill="${color}"/>
        <rect x="30" y="50" width="60" height="4" rx="2" fill="${color}"/>
        <rect x="30" y="65" width="40" height="4" rx="2" fill="${color}"/>
      `;
    case "exam":
      return `
        <rect x="20" y="10" width="80" height="100" rx="8" fill="${iconColor}" stroke="${color}" stroke-width="4"/>
        <rect x="35" y="25" width="50" height="4" rx="2" fill="${color}"/>
        <rect x="35" y="40" width="50" height="4" rx="2" fill="${color}"/>
        <rect x="35" y="55" width="30" height="4" rx="2" fill="${color}"/>
        <circle cx="45" cy="75" r="8" fill="${color}"/>
        <path d="M40 75 L43 78 L50 71" stroke="white" stroke-width="2" fill="none" stroke-linecap="round"/>
      `;
    case "catalog":
      return `
        <rect x="10" y="20" width="100" height="80" rx="8" fill="${iconColor}" stroke="${color}" stroke-width="4"/>
        <rect x="25" y="35" width="25" height="20" rx="4" fill="${color}"/>
        <rect x="55" y="35" width="25" height="20" rx="4" fill="${color}"/>
        <rect x="85" y="35" width="15" height="20" rx="4" fill="${color}"/>
        <rect x="25" y="65" width="25" height="20" rx="4" fill="${color}"/>
        <rect x="55" y="65" width="25" height="20" rx="4" fill="${color}"/>
      `;
    case "dashboard":
      return `
        <rect x="10" y="20" width="100" height="80" rx="8" fill="${iconColor}" stroke="${color}" stroke-width="4"/>
        <rect x="20" y="30" width="35" height="25" rx="4" fill="${color}"/>
        <rect x="65" y="30" width="25" height="15" rx="4" fill="${color}"/>
        <rect x="65" y="50" width="25" height="15" rx="4" fill="${color}"/>
        <rect x="20" y="70" width="70" height="20" rx="4" fill="${color}"/>
      `;
    default:
      return `
        <circle cx="60" cy="60" r="50" fill="${iconColor}" stroke="${color}" stroke-width="4"/>
        <text x="60" y="75" text-anchor="middle" fill="${color}" font-family="Arial, sans-serif" font-size="36" font-weight="bold">Q</text>
      `;
  }
}

/**
 * Simple text wrapping for SVG
 */
function wrapText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;

  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    if ((currentLine + word).length <= maxLength) {
      currentLine += (currentLine ? " " : "") + word;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }

  if (currentLine) lines.push(currentLine);

  return lines.slice(0, 2).join("\n"); // Limit to 2 lines
}

/**
 * Convert SVG to data URL for use in metadata
 */
export function svgToDataUrl(svg: string): string {
  const base64 = Buffer.from(svg).toString("base64");
  return `data:image/svg+xml;base64,${base64}`;
}

/**
 * Generate Open Graph image for different page types
 */
export function generatePageOGImage(
  title: string,
  type: OGImageOptions["type"] = "default",
  subtitle?: string
): string {
  const svg = generateOGImageSVG({
    title,
    subtitle,
    type,
  });

  return svgToDataUrl(svg);
}
