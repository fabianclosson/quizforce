import type { Metadata } from "next";
import { config } from "./config";

// Base site configuration
export const siteConfig = {
  name: "QuizForce",
  title: "QuizForce - Salesforce Certification Practice",
  description:
    "Master Salesforce certifications with realistic practice exams. Get certified faster with our comprehensive practice tests.",
  url: config.siteUrl,
  ogImage: "/images/og-default.png",
  links: {
    twitter: "https://twitter.com/quizforce",
    github: "https://github.com/quizforce",
  },
  creator: "QuizForce Team",
  authors: [
    {
      name: "QuizForce Team",
      url: config.siteUrl,
    },
  ],
  author: "QuizForce Team",
  twitterHandle: "@quizforce",
  keywords: [
    "Salesforce",
    "certification",
    "practice exams",
    "QuizForce",
    "training",
    "learning",
    "admin",
    "developer",
    "consultant",
  ],
};

// Open Graph image configurations
export const OG_IMAGE_CONFIG = {
  width: 1200,
  height: 630,
  defaultImage: "/images/og-default.png",
  homeImage: "/images/og-home.png",
  catalogImage: "/images/og-catalog.png",
  certificationImage: "/images/og-certification.png",
  packageImage: "/images/og-package.png",
  examImage: "/images/og-exam.png",
  dashboardImage: "/images/og-dashboard.png",
} as const;

// Metadata generation utilities
export interface MetadataProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  imageAlt?: string;
  canonical?: string;
  noIndex?: boolean;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
}

/**
 * Generate Open Graph image object with proper dimensions and alt text
 */
function generateOGImage(imageUrl: string, alt?: string) {
  const fullImageUrl = imageUrl.startsWith("http")
    ? imageUrl
    : `${siteConfig.url}${imageUrl}`;

  return {
    url: fullImageUrl,
    width: OG_IMAGE_CONFIG.width,
    height: OG_IMAGE_CONFIG.height,
    alt: alt || siteConfig.title,
    type: "image/png",
  };
}

/**
 * Generate metadata for a page with SEO best practices
 */
export function generatePageMetadata({
  title,
  description,
  keywords = [],
  image,
  imageAlt,
  canonical,
  noIndex = false,
  type = "website",
  publishedTime,
  modifiedTime,
  section,
  tags = [],
}: MetadataProps = {}): Metadata {
  const fullTitle = title ? `${title} | ${siteConfig.name}` : siteConfig.title;
  const fullDescription = description || siteConfig.description;
  const fullImage = image || siteConfig.ogImage;
  const fullKeywords = [...siteConfig.keywords, ...keywords];
  const fullUrl = canonical ? `${siteConfig.url}${canonical}` : siteConfig.url;

  // Generate Open Graph images array
  const ogImages = [generateOGImage(fullImage, imageAlt)];

  return {
    title: fullTitle,
    description: fullDescription,
    keywords: fullKeywords.join(", "),
    authors: siteConfig.authors,
    creator: siteConfig.creator,
    publisher: siteConfig.name,

    // Robots
    robots: {
      index: !noIndex,
      follow: !noIndex,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },

    // Open Graph
    openGraph: {
      type,
      locale: "en_US",
      url: fullUrl,
      title: fullTitle,
      description: fullDescription,
      siteName: siteConfig.name,
      images: ogImages,
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
      ...(section && { section }),
      ...(tags.length > 0 && { tags }),
    },

    // Twitter
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: fullDescription,
      images: [ogImages[0].url],
      creator: siteConfig.twitterHandle,
      site: siteConfig.twitterHandle,
    },

    // Additional
    alternates: {
      canonical: fullUrl,
    },

    // Verification (add when available)
    verification: {
      google: config.seo.googleVerification,
      yandex: config.seo.yandexVerification,
      yahoo: config.seo.yahooVerification,
    },
  };
}

/**
 * Generate metadata for the home page with optimized social sharing
 */
export function generateHomeMetadata(): Metadata {
  return generatePageMetadata({
    title: "Master Salesforce Certifications with Practice Exams",
    description:
      "Practice with real Salesforce certification exam questions. Track your progress, get instant feedback, and achieve your certification goals with confidence. Free practice questions available.",
    keywords: [
      "Salesforce certification practice",
      "real exam questions",
      "certification training",
      "practice tests",
      "study materials",
      "exam preparation",
    ],
    image: OG_IMAGE_CONFIG.homeImage,
    imageAlt:
      "QuizForce - Master Salesforce Certifications with Practice Exams",
    canonical: "/",
    type: "website",
  });
}

/**
 * Generate metadata for the catalog page
 */
export function generateCatalogMetadata(): Metadata {
  return generatePageMetadata({
    title: "Salesforce Certification Practice Catalog",
    description:
      "Browse our comprehensive collection of Salesforce certification practice exams. Find study materials for Administrator, Developer, Consultant, and other certifications.",
    keywords: [
      "Salesforce certification catalog",
      "practice exam collection",
      "certification study materials",
      "Salesforce training courses",
      "exam preparation resources",
    ],
    image: OG_IMAGE_CONFIG.catalogImage,
    imageAlt: "QuizForce Certification Catalog - Browse Practice Exams",
    canonical: "/catalog",
    type: "website",
  });
}

/**
 * Generate metadata for certification pages
 */
export function generateCertificationMetadata(
  certificationName: string,
  description?: string,
  image?: string,
  questionCount?: number,
  examCount?: number
): Metadata {
  const questionText = questionCount
    ? ` ${questionCount} practice questions.`
    : "";
  const examText = examCount ? ` ${examCount} practice exams.` : "";
  const fullDescription =
    description ||
    `Practice for the ${certificationName} certification with real exam questions, detailed explanations, and progress tracking.${questionText}${examText}`;

  return generatePageMetadata({
    title: `${certificationName} Practice Exam`,
    description: fullDescription,
    keywords: [
      certificationName,
      "practice exam",
      "certification prep",
      "study guide",
      "exam questions",
      "Salesforce certification",
    ],
    image: image || OG_IMAGE_CONFIG.certificationImage,
    imageAlt: `${certificationName} Practice Exam - QuizForce`,
    canonical: `/catalog/certification/${certificationName.toLowerCase().replace(/\s+/g, "-")}`,
    type: "website",
    section: "Certification",
  });
}

/**
 * Generate metadata for package pages
 */
export function generatePackageMetadata(
  packageName: string,
  description?: string,
  certifications?: string[],
  image?: string,
  price?: number,
  originalPrice?: number
): Metadata {
  const certsText = certifications?.length
    ? ` Includes ${certifications.join(", ")} certifications.`
    : "";

  const priceText = price
    ? ` Starting at $${price}${originalPrice ? ` (Save $${originalPrice - price})` : ""}.`
    : "";

  const fullDescription =
    description ||
    `Complete certification bundle for ${packageName}.${certsText} Save money with our comprehensive package deal.${priceText}`;

  return generatePageMetadata({
    title: `${packageName} Bundle`,
    description: fullDescription,
    keywords: [
      packageName,
      "certification bundle",
      "package deal",
      "multiple certifications",
      "study package",
      "Salesforce certification",
    ],
    image: image || OG_IMAGE_CONFIG.packageImage,
    imageAlt: `${packageName} Bundle - QuizForce`,
    canonical: `/catalog/package/${packageName.toLowerCase().replace(/\s+/g, "-")}`,
    type: "website",
    section: "Package",
  });
}

/**
 * Generate metadata for exam pages
 */
export function generateExamMetadata(
  examName: string,
  certificationName: string,
  questionCount?: number,
  timeLimit?: number
): Metadata {
  const questionText = questionCount ? ` ${questionCount} questions.` : "";
  const timeText = timeLimit ? ` ${timeLimit} minutes time limit.` : "";

  return generatePageMetadata({
    title: `${examName} - Practice Exam`,
    description: `Take the ${examName} practice exam for ${certificationName} certification.${questionText}${timeText} Timed exam with instant feedback and detailed explanations.`,
    keywords: [
      examName,
      certificationName,
      "practice exam",
      "timed exam",
      "certification test",
      "Salesforce certification",
    ],
    image: OG_IMAGE_CONFIG.examImage,
    imageAlt: `${examName} Practice Exam - QuizForce`,
    canonical: `/exam/${examName.toLowerCase().replace(/\s+/g, "-")}`,
    noIndex: true, // Don't index active exam pages
    type: "article",
    section: "Exam",
  });
}

/**
 * Generate metadata for dashboard pages
 */
export function generateDashboardMetadata(
  pageTitle?: string,
  description?: string
): Metadata {
  const title = pageTitle ? `${pageTitle} - Dashboard` : "Dashboard";
  const desc =
    description ||
    "Track your certification progress, view study analytics, and manage your practice exams.";

  return generatePageMetadata({
    title,
    description: desc,
    keywords: [
      "certification dashboard",
      "study progress",
      "exam analytics",
      "learning tracker",
    ],
    image: OG_IMAGE_CONFIG.dashboardImage,
    imageAlt: "QuizForce Dashboard - Track Your Progress",
    canonical: `/dashboard${pageTitle ? `/${pageTitle.toLowerCase().replace(/\s+/g, "-")}` : ""}`,
    noIndex: true, // Don't index user-specific pages
    type: "website",
  });
}

/**
 * Generate structured data (JSON-LD) for different page types
 */
export function generateStructuredData(
  type: "Organization" | "Course" | "Product" | "WebSite" | "BreadcrumbList",
  data: any = {}
) {
  const baseData = {
    "@context": "https://schema.org",
    "@type": type,
  };

  switch (type) {
    case "Organization":
      return {
        ...baseData,
        name: siteConfig.name,
        url: siteConfig.url,
        logo: `${siteConfig.url}/images/logo.png`,
        description: siteConfig.description,
        sameAs: [
          // Add social media URLs when available
        ],
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer service",
          availableLanguage: "English",
        },
      };

    case "WebSite":
      return {
        ...baseData,
        name: siteConfig.name,
        url: siteConfig.url,
        description: siteConfig.description,
        publisher: {
          "@type": "Organization",
          name: siteConfig.name,
          url: siteConfig.url,
        },
        potentialAction: {
          "@type": "SearchAction",
          target: `${siteConfig.url}/catalog?search={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      };

    case "Course":
      return {
        ...baseData,
        name: data.name,
        description: data.description,
        provider: {
          "@type": "Organization",
          name: siteConfig.name,
          url: siteConfig.url,
        },
        courseCode: data.code,
        educationalLevel: "Professional",
        teaches: data.skills || [],
        hasCourseInstance: data.instances || [],
        totalTime: data.duration,
        coursePrerequisites: data.prerequisites || [],
      };

    case "Product":
      return {
        ...baseData,
        name: data.name,
        description: data.description,
        brand: {
          "@type": "Brand",
          name: siteConfig.name,
        },
        category: data.category || "Educational Software",
        offers: data.price
          ? {
              "@type": "Offer",
              price: data.price,
              priceCurrency: "USD",
              availability: "https://schema.org/InStock",
              validFrom: data.validFrom,
              priceValidUntil: data.priceValidUntil,
            }
          : undefined,
        aggregateRating: data.rating
          ? {
              "@type": "AggregateRating",
              ratingValue: data.rating.value,
              reviewCount: data.rating.count,
              bestRating: 5,
              worstRating: 1,
            }
          : undefined,
      };

    case "BreadcrumbList":
      return {
        ...baseData,
        itemListElement:
          data.items?.map((item: any, index: number) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.name,
            item: `${siteConfig.url}${item.url}`,
          })) || [],
      };

    default:
      return baseData;
  }
}

/**
 * Generate JSON-LD script content for structured data
 */
export function getStructuredDataScript(data: any): string {
  return JSON.stringify(data);
}

/**
 * Generate breadcrumb structured data for navigation
 */
export function generateBreadcrumbData(
  items: Array<{ name: string; url: string }>
) {
  return generateStructuredData("BreadcrumbList", { items });
}
