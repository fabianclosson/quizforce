import { Certification } from "@/types/catalog";

// Map certification names/slugs to actual badge image filenames
export function getCertificationBadgeImage(
  certification: Certification
): string {
  const nameOrSlug = (
    certification.name ||
    certification.slug ||
    ""
  ).toLowerCase();

  // Salesforce Administrator
  if (nameOrSlug.includes("administrator") || nameOrSlug.includes("admin")) {
    if (nameOrSlug.includes("advanced")) {
      return "/images/certifications/advanced-administrator.png";
    }
    if (nameOrSlug.includes("slack")) {
      return "/images/certifications/slack-administrator.png";
    }
    if (nameOrSlug.includes("marketing")) {
      return "/images/certifications/marketing-cloud-administrator.webp";
    }
    return "/images/certifications/administrator.png";
  }

  // Associate - use admin badge as fallback since no specific associate badge exists
  if (nameOrSlug.includes("associate")) {
    return "/images/certifications/administrator.png";
  }

  // Sales Cloud Consultant
  if (nameOrSlug.includes("sales-cloud-consultant")) {
    return "/images/certifications/sales-cloud-consultant.webp";
  }

  // Service Cloud Consultant
  if (nameOrSlug.includes("service-cloud-consultant")) {
    return "/images/certifications/service-cloud-consultant.png";
  }

  // Platform Developer I
  if (
    nameOrSlug.includes("platform-developer-1") ||
    nameOrSlug.includes("platform-developer-i")
  ) {
    return "/images/certifications/platform-developer-1.png";
  }

  // Business Analyst
  if (nameOrSlug.includes("business-analyst")) {
    return "/images/certifications/business-analyst.png";
  }

  // Data Cloud
  if (nameOrSlug.includes("data-cloud-consultant")) {
    return "/images/certifications/data-cloud-consultant.png";
  }
  if (nameOrSlug.includes("data-cloud")) {
    return "/images/certifications/data-cloud.png";
  }

  // CPQ Specialist
  if (nameOrSlug.includes("cpq-specialist")) {
    return "/images/certifications/cpq-specialist.png";
  }

  // B2C Commerce Developer
  if (nameOrSlug.includes("b2c-commerce-developer")) {
    return "/images/certifications/b2c-commerce-developer.png";
  }

  // Nonprofit Cloud Consultant
  if (nameOrSlug.includes("nonprofit-cloud-consultant")) {
    return "/images/certifications/nonprofit-cloud-consultant.png";
  }

  // Technical Architect
  if (nameOrSlug.includes("technical-architect")) {
    return "/images/certifications/technical-architect.webp";
  }

  // AI Specialist
  if (nameOrSlug.includes("ai-specialist")) {
    return "/images/certifications/ai-specialist.png";
  }

  // Agentforce Specialist
  if (nameOrSlug.includes("agentforce-specialist")) {
    return "/images/certifications/agentforce-specialist.png";
  }

  // Strategy Designer
  if (nameOrSlug.includes("strategy-designer")) {
    return "/images/certifications/strategy-designer.png";
  }

  // Fallback to generic image
  return "/images/og-certification.png";
}
