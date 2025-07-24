/**
 * Mapping of certification names to their corresponding image files
 * This helps match certification names from the database to the actual badge images
 */

export interface CertificationImageMapping {
  name: string;
  image: string;
  keywords: string[]; // Alternative names/keywords to match against
}

export const certificationImages: CertificationImageMapping[] = [
  {
    name: "Administrator",
    image: "/images/certifications/administrator.png",
    keywords: ["admin", "administrator", "salesforce administrator"],
  },
  {
    name: "Advanced Administrator",
    image: "/images/certifications/advanced-administrator.png",
    keywords: ["advanced admin", "advanced administrator"],
  },
  {
    name: "Platform Developer I",
    image: "/images/certifications/platform-developer-1.png",
    keywords: ["platform developer", "developer i", "platform dev"],
  },
  {
    name: "Sales Cloud Consultant",
    image: "/images/certifications/sales-cloud-consultant.webp",
    keywords: ["sales cloud", "sales consultant"],
  },
  {
    name: "Service Cloud Consultant",
    image: "/images/certifications/service-cloud-consultant.png",
    keywords: ["service cloud", "service consultant"],
  },
  {
    name: "AI Specialist",
    image: "/images/certifications/ai-specialist.png",
    keywords: ["ai", "artificial intelligence", "einstein"],
  },
  {
    name: "Data Cloud Consultant",
    image: "/images/certifications/data-cloud-consultant.png",
    keywords: ["data cloud", "data consultant"],
  },
  {
    name: "Business Analyst",
    image: "/images/certifications/business-analyst.png",
    keywords: ["business analyst", "ba"],
  },
  {
    name: "Strategy Designer",
    image: "/images/certifications/strategy-designer.png",
    keywords: ["strategy", "designer"],
  },
  {
    name: "Technical Architect",
    image: "/images/certifications/technical-architect.webp",
    keywords: ["technical architect", "architect"],
  },
  {
    name: "Marketing Cloud Administrator",
    image: "/images/certifications/marketing-cloud-administrator.webp",
    keywords: ["marketing cloud", "marketing admin"],
  },
  {
    name: "CPQ Specialist",
    image: "/images/certifications/cpq-specialist.png",
    keywords: ["cpq", "configure price quote"],
  },
  {
    name: "B2C Commerce Developer",
    image: "/images/certifications/b2c-commerce-developer.png",
    keywords: ["b2c", "commerce", "b2c commerce"],
  },
  {
    name: "Nonprofit Cloud Consultant",
    image: "/images/certifications/nonprofit-cloud-consultant.png",
    keywords: ["nonprofit", "non-profit", "nonprofit cloud"],
  },
  {
    name: "Slack Administrator",
    image: "/images/certifications/slack-administrator.png",
    keywords: ["slack", "slack admin"],
  },
  {
    name: "Agentforce Specialist",
    image: "/images/certifications/agentforce-specialist.png",
    keywords: ["agentforce", "agent force"],
  },
];

/**
 * Get the certification image path for a given certification name
 * Uses fuzzy matching to find the best match
 */
export function getCertificationImage(
  certificationName: string
): string | null {
  if (!certificationName) return null;

  const searchName = certificationName.toLowerCase().trim();

  // First try exact name match
  const exactMatch = certificationImages.find(
    cert => cert.name.toLowerCase() === searchName
  );

  if (exactMatch) {
    return exactMatch.image;
  }

  // Then try keyword matching
  const keywordMatch = certificationImages.find(cert =>
    cert.keywords.some(
      keyword =>
        searchName.includes(keyword.toLowerCase()) ||
        keyword.toLowerCase().includes(searchName)
    )
  );

  if (keywordMatch) {
    return keywordMatch.image;
  }

  // Try partial matching (if certification name contains any of our known names)
  const partialMatch = certificationImages.find(
    cert =>
      searchName.includes(cert.name.toLowerCase()) ||
      cert.name.toLowerCase().includes(searchName)
  );

  return partialMatch?.image || null;
}

/**
 * Get all available certification images for reference
 */
export function getAllCertificationImages(): CertificationImageMapping[] {
  return certificationImages;
}

/**
 * Check if a certification has an available image
 */
export function hasCertificationImage(certificationName: string): boolean {
  return getCertificationImage(certificationName) !== null;
}
