"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  BookOpen,
  Star,
  Brain,
  FileText,
  Heart,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import {
  LandingNavbar,
  AuthenticatedNavbar,
} from "@/components/layout/landing-navbar";
import { QuizForceLogo } from "@/components/ui/quizforce-logo";

// Safe auth hook with fallback
function useSafeAuth() {
  try {
    return useAuth();
  } catch (error) {
    console.warn('Auth context error, using fallback:', error);
    return {
      user: null,
      loading: false,
      userRole: null,
      signOut: async () => {},
      refreshUser: async () => {},
      handleAuthError: async () => {},
    };
  }
}

// Animated Semi-Circle Path with Certification Badges Component
function CertificationPath() {
  const badges = [
    {
      name: "Platform Administrator",
      alt: "Platform Administrator",
      src: "/images/certifications/administrator.png",
      // Top of the large arc
      position: { top: "5%", left: "25%" },
    },
    {
      name: "Platform Developer I",
      alt: "Platform Developer I",
      src: "/images/certifications/platform-developer-1.png",
      // Left side of the large arc - moved even further left
      position: { top: "30%", left: "-3%" },
    },
    {
      name: "Sales Cloud Consultant",
      alt: "Sales Cloud Consultant",
      src: "/images/certifications/sales-cloud-consultant.webp",
      // Bottom-left of the large arc - moved even further left
      position: { top: "65%", left: "1%" },
    },
    {
      name: "Agentforce Specialist",
      alt: "Agentforce Specialist",
      src: "/images/certifications/agentforce-specialist.png",
      // Top-right of the large arc - moved down
      position: { top: "25%", left: "75%" },
    },
    {
      name: "Service Cloud Consultant",
      alt: "Service Cloud Consultant",
      src: "/images/certifications/service-cloud-consultant.png",
      // Bottom-right of the large arc
      position: { top: "62%", left: "73%" },
    },
  ];

  return (
    <>
      <style jsx>{`
        .certification-path {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 0;
        }

        .path-line {
          fill: none;
          stroke: #3b82f6;
          stroke-width: 3;
          stroke-linecap: round;
          stroke-dasharray: 10 15;
          opacity: 0.6;
          animation: pathFlow 15s linear infinite;
        }

        .certification-badge {
          position: absolute;
          width: 75px;
          height: 75px;
          border-radius: 50%;
          background: white;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          animation: badgeFloat 4s ease-in-out infinite;
          border: 4px solid #e2e8f0;
          z-index: 10;
        }

        .certification-badge:hover {
          transform: scale(1.2);
          box-shadow: 0 12px 48px rgba(59, 130, 246, 0.4);
          border-color: #3b82f6;
        }

        .certification-badge:nth-child(1) {
          animation-delay: 0s;
        }
        .certification-badge:nth-child(2) {
          animation-delay: 0.8s;
        }
        .certification-badge:nth-child(3) {
          animation-delay: 1.6s;
        }
        .certification-badge:nth-child(4) {
          animation-delay: 2.4s;
        }
        .certification-badge:nth-child(5) {
          animation-delay: 3.2s;
        }

        @keyframes pathFlow {
          0% {
            stroke-dashoffset: 0;
          }
          100% {
            stroke-dashoffset: 150;
          }
        }

        @keyframes badgeFloat {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        .badge-inner {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #fafafa;
        }
      `}</style>

      {/* SVG Large Curved Path */}
      <svg
        className="certification-path"
        viewBox="0 0 605 484"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Large encompassing arc that curves around the hero image */}
        <path
          className="path-line"
          d="M 145.2 24.2 
             Q 60.5 60.5 24.2 145.2
             Q 12.1 242 36.3 338.8
             Q 60.5 423.5 145.2 459.8
             Q 242 484 338.8 459.8
             Q 423.5 435.6 484 363
             Q 544.5 290.4 520.3 217.8
             Q 496.1 145.2 435.6 96.8
             Q 363 48.4 290.4 36.3
             Q 217.8 30.25 145.2 24.2"
        />
      </svg>

      {/* Certification Badges */}
      {badges.map((badge, index) => (
        <div
          key={badge.alt}
          className="certification-badge"
          style={{
            top: badge.position.top,
            left: badge.position.left,
            animationDelay: `${index * 0.8}s`,
          }}
          title={badge.alt}
        >
          <div className="badge-inner">
            <Image
              src={badge.src}
              alt={badge.alt}
              width={50}
              height={50}
              className="w-12 h-12 object-contain"
            />
          </div>
        </div>
      ))}
    </>
  );
}

export function LandingPageClient() {
  const { user } = useSafeAuth();

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      {user ? <AuthenticatedNavbar /> : <LandingNavbar />}

      {/* Hero Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 overflow-hidden min-h-[600px]">
        <div className="max-w-7xl mx-auto h-full">
          <div className="grid lg:grid-cols-2 gap-12 h-full min-h-[600px]">
            {/* Left Column - Text Content */}
            <div className="flex flex-col justify-center text-center lg:text-left py-20">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 dark:text-white mb-6">
                Practice Smarter.
                <span className="text-blue-600 dark:text-blue-400">
                  {" "}
                  Pass Sooner.
                </span>
              </h1>

              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl">
                Realistic practice exams that help you earn your Salesforce
                certifications with confidence.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                {user ? (
                  <Link href="/dashboard">
                    <Button
                      size="lg"
                      className="w-full sm:w-auto hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all duration-300 hover:shadow-lg"
                    >
                      Go to Dashboard
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/auth/signup">
                      <Button
                        size="lg"
                        className="w-full sm:w-auto hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all duration-300 hover:shadow-lg"
                      >
                        Start Free Practice
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </Link>
                    <Link href="/catalog">
                      <Button
                        variant="outline"
                        size="lg"
                        className="w-full sm:w-auto hover:bg-gray-200 transition-all duration-300 hover:shadow-lg"
                      >
                        Browse Certifications
                      </Button>
                    </Link>
                  </>
                )}
              </div>

              <p className="text-sm text-gray-500 dark:text-gray-400">
                2000+ Practice Questions • All Major Certifications • Real Exam
                Simulation
              </p>
            </div>

            {/* Right Column - Hero Image with Certification Path */}
            <div className="hidden md:flex items-center justify-center relative lg:items-end mt-8 lg:mt-0">
              <div className="flex justify-center relative z-20">
                <Image
                  src="/images/hero-image.png"
                  alt="Salesforce certified professional"
                  width={399}
                  height={456}
                  className="w-auto h-auto max-w-full object-contain max-h-[300px] lg:max-h-none"
                  priority
                />
              </div>

              {/* Certification Path - Hidden on mobile for performance */}
              <div className="hidden md:block">
                <CertificationPath />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose QuizForce?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Our platform combines realistic practice tests with intelligent
              learning features to give you the best chance of certification
              success.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-xl mb-2">
                  Real Practice Exams
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  Experience exam-like conditions with questions that mirror the
                  actual Salesforce certification tests.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Brain className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-xl mb-2">
                  Adaptive Learning
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  Our AI-powered system adapts to your learning style and
                  focuses on your weak areas.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-xl mb-2">
                  Expert-Crafted Content
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  Questions written by certified Salesforce professionals with
                  real-world experience.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-xl mb-2">
                  Detailed Explanations
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  Learn from mistakes with comprehensive explanations for every
                  question and answer choice.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Available Certifications Catalog Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Available Certifications Catalog
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Comprehensive practice tests for all major Salesforce
              certifications. Start with the fundamentals or jump to advanced
              topics.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {/* Administrator */}
            <Card className="border-2 border-transparent hover:border-[#3B82F6] shadow-lg hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-800 group">
              <CardHeader className="text-center pb-4">
                <div className="w-20 h-20 mx-auto mb-4 relative">
                  <Image
                    src="/images/certifications/administrator.png"
                    alt="Platform Administrator"
                    width={80}
                    height={80}
                    className="w-full h-full object-contain"
                  />
                </div>
                <CardTitle className="text-xl mb-2">Platform Administrator</CardTitle>
                <div className="flex justify-center">
                  <Badge variant="secondary" className="mb-2">
                    Most Popular
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <CardDescription className="text-gray-600 dark:text-gray-300 mb-4">
                  Master Salesforce administration fundamentals with our
                  comprehensive practice exams.
                </CardDescription>
                <div className="space-y-2 text-sm text-gray-500">
                  <div className="flex justify-center space-x-4">
                    <span>5 Practice Exams</span>
                    <span>•</span>
                    <span>300 Questions</span>
                  </div>
                </div>
                <div className="pt-4">
                  {user ? (
                    <Link href="/catalog/certification/administrator">
                      <Button className="w-full hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all duration-300 hover:shadow-lg">
                        Start Learning
                      </Button>
                    </Link>
                  ) : (
                    <Link href="/auth/signup">
                      <Button className="w-full hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all duration-300 hover:shadow-lg">
                        Enroll Now
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Platform Developer I */}
            <Card className="border-2 border-transparent hover:border-[#3B82F6] shadow-lg hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-800 group">
              <CardHeader className="text-center pb-4">
                <div className="w-20 h-20 mx-auto mb-4 relative">
                  <Image
                    src="/images/certifications/platform-developer-1.png"
                    alt="Platform Developer I"
                    width={80}
                    height={80}
                    className="w-full h-full object-contain"
                  />
                </div>
                <CardTitle className="text-xl mb-2">
                  Platform Developer I
                </CardTitle>
                <div className="flex justify-center">
                  <Badge variant="secondary" className="mb-2">
                    Developer Path
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <CardDescription className="text-gray-600 dark:text-gray-300 mb-4">
                  Learn Apex, Visualforce, and Lightning development with
                  hands-on practice questions.
                </CardDescription>
                <div className="space-y-2 text-sm text-gray-500">
                  <div className="flex justify-center space-x-4">
                    <span>6 Practice Exams</span>
                    <span>•</span>
                    <span>360 Questions</span>
                  </div>
                </div>
                <div className="pt-4">
                  {user ? (
                    <Link href="/catalog/certification/platform-developer-i">
                      <Button className="w-full hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all duration-300 hover:shadow-lg">
                        Start Learning
                      </Button>
                    </Link>
                  ) : (
                    <Link href="/auth/signup">
                      <Button className="w-full hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all duration-300 hover:shadow-lg">
                        Enroll Now
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Sales Cloud Consultant */}
            <Card className="border-2 border-transparent hover:border-[#3B82F6] shadow-lg hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-800 group">
              <CardHeader className="text-center pb-4">
                <div className="w-20 h-20 mx-auto mb-4 relative">
                  <Image
                    src="/images/certifications/sales-cloud-consultant.webp"
                    alt="Sales Cloud Consultant"
                    width={80}
                    height={80}
                    className="w-full h-full object-contain"
                  />
                </div>
                <CardTitle className="text-xl mb-2">
                  Sales Cloud Consultant
                </CardTitle>
                <div className="flex justify-center">
                  <Badge variant="secondary" className="mb-2">
                    Consultant Path
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <CardDescription className="text-gray-600 dark:text-gray-300 mb-4">
                  Become an expert in Sales Cloud implementation and best
                  practices.
                </CardDescription>
                <div className="space-y-2 text-sm text-gray-500">
                  <div className="flex justify-center space-x-4">
                    <span>4 Practice Exams</span>
                    <span>•</span>
                    <span>240 Questions</span>
                  </div>
                </div>
                <div className="pt-4">
                  {user ? (
                    <Link href="/catalog/certification/sales-cloud-consultant">
                      <Button className="w-full hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all duration-300 hover:shadow-lg">
                        Start Learning
                      </Button>
                    </Link>
                  ) : (
                    <Link href="/auth/signup">
                      <Button className="w-full hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all duration-300 hover:shadow-lg">
                        Enroll Now
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* AI Specialist */}
            <Card className="border-2 border-transparent hover:border-[#3B82F6] shadow-lg hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-800 group">
              <CardHeader className="text-center pb-4">
                <div className="w-20 h-20 mx-auto mb-4 relative">
                  <Image
                    src="/images/certifications/agentforce-specialist.png"
                    alt="Agentforce Specialist"
                    width={80}
                    height={80}
                    className="w-full h-full object-contain"
                  />
                </div>
                <CardTitle className="text-xl mb-2">Agentforce Specialist</CardTitle>
                <div className="flex justify-center">
                  <Badge variant="secondary" className="mb-2">
                    New
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <CardDescription className="text-gray-600 dark:text-gray-300 mb-4">
                  Master Einstein AI and machine learning capabilities in
                  Salesforce.
                </CardDescription>
                <div className="space-y-2 text-sm text-gray-500">
                  <div className="flex justify-center space-x-4">
                    <span>3 Practice Exams</span>
                    <span>•</span>
                    <span>120 Questions</span>
                  </div>
                </div>
                <div className="pt-4">
                  {user ? (
                    <Link href="/catalog/certification/ai-specialist">
                      <Button className="w-full hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all duration-300 hover:shadow-lg">
                        Start Learning
                      </Button>
                    </Link>
                  ) : (
                    <Link href="/auth/signup">
                      <Button className="w-full hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all duration-300 hover:shadow-lg">
                        Enroll Now
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Service Cloud Consultant */}
            <Card className="border-2 border-transparent hover:border-[#3B82F6] shadow-lg hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-800 group">
              <CardHeader className="text-center pb-4">
                <div className="w-20 h-20 mx-auto mb-4 relative">
                  <Image
                    src="/images/certifications/service-cloud-consultant.png"
                    alt="Service Cloud Consultant"
                    width={80}
                    height={80}
                    className="w-full h-full object-contain"
                  />
                </div>
                <CardTitle className="text-xl mb-2">
                  Service Cloud Consultant
                </CardTitle>
                <div className="flex justify-center">
                  <Badge variant="secondary" className="mb-2">
                    Consultant Path
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <CardDescription className="text-gray-600 dark:text-gray-300 mb-4">
                  Expertise in Service Cloud implementation and customer service
                  solutions.
                </CardDescription>
                <div className="space-y-2 text-sm text-gray-500">
                  <div className="flex justify-center space-x-4">
                    <span>4 Practice Exams</span>
                    <span>•</span>
                    <span>240 Questions</span>
                  </div>
                </div>
                <div className="pt-4">
                  {user ? (
                    <Link href="/catalog/certification/service-cloud-consultant">
                      <Button className="w-full hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all duration-300 hover:shadow-lg">
                        Start Learning
                      </Button>
                    </Link>
                  ) : (
                    <Link href="/auth/signup">
                      <Button className="w-full hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all duration-300 hover:shadow-lg">
                        Enroll Now
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Advanced Administrator */}
            <Card className="border-2 border-transparent hover:border-[#3B82F6] shadow-lg hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-800 group">
              <CardHeader className="text-center pb-4">
                <div className="w-20 h-20 mx-auto mb-4 relative">
                  <Image
                    src="/images/certifications/advanced-administrator.png"
                    alt="Advanced Administrator"
                    width={80}
                    height={80}
                    className="w-full h-full object-contain"
                  />
                </div>
                <CardTitle className="text-xl mb-2">
                  Advanced Administrator
                </CardTitle>
                <div className="flex justify-center">
                  <Badge variant="secondary" className="mb-2">
                    Advanced
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <CardDescription className="text-gray-600 dark:text-gray-300 mb-4">
                  Take your administration skills to the next level with
                  advanced features.
                </CardDescription>
                <div className="space-y-2 text-sm text-gray-500">
                  <div className="flex justify-center space-x-4">
                    <span>4 Practice Exams</span>
                    <span>•</span>
                    <span>240 Questions</span>
                  </div>
                </div>
                <div className="pt-4">
                  {user ? (
                    <Link href="/catalog/certification/advanced-administrator">
                      <Button className="w-full hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all duration-300 hover:shadow-lg">
                        Start Learning
                      </Button>
                    </Link>
                  ) : (
                    <Link href="/auth/signup">
                      <Button className="w-full hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all duration-300 hover:shadow-lg">
                        Enroll Now
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <Link href="/catalog">
              <Button
                size="lg"
                variant="outline"
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-200 transition-all duration-300 hover:shadow-lg"
              >
                View All Certifications
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-blue-600 dark:bg-blue-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to Start Your Certification Journey?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join smart professionals who have achieved Salesforce certification
            success with QuizForce.
          </p>

          {user ? (
            <Link href="/dashboard">
              <Button
                size="lg"
                variant="secondary"
                className="bg-white text-blue-600 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all duration-300 hover:shadow-lg"
              >
                Continue Learning
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          ) : (
            <Link href="/auth/signup">
              <Button
                size="lg"
                variant="secondary"
                className="bg-white text-blue-600 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all duration-300 hover:shadow-lg"
              >
                Start Free Practice
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            {/* Company Info */}
            <div className="col-span-1 lg:col-span-1">
              <div className="flex items-center space-x-2 mb-4">
                <QuizForceLogo
                  size={26}
                  withText={true}
                  textClassName="text-white"
                />
              </div>
              <p className="text-gray-400 text-sm">
                Salesforce Certification Practice Platform
              </p>
            </div>

            {/* Popular Certifications */}
            <div>
              <h3 className="font-semibold mb-4">Popular Certifications</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Platform Administrator
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Platform Developer I
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Sales Cloud Consultant
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Service Cloud Consultant
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Agentforce Specialist
                  </Link>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Study Guides
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Practice Tests
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Certification Roadmap
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Community
                  </Link>
                </li>
              </ul>
            </div>

            {/* About Us */}
            <div>
              <h3 className="font-semibold mb-4">About Us</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-sm text-gray-400">
                © 2025 QuizForce • Not affiliated with Salesforce
              </p>
              <div className="flex items-center space-x-2 mt-4 md:mt-0 text-sm text-gray-400">
                <span>Made with</span>
                <Heart className="h-4 w-4 text-red-500" />
                <span>for the Salesforce community</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
