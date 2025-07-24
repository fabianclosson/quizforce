import { ComponentType } from "react";
import {
  BookOpen,
  Brain,
  CheckCircle,
  Clock,
  FileText,
  GraduationCap,
  Home,
  Menu,
  Search,
  Settings,
  Star,
  Trophy,
  User,
  Users,
  XCircle,
  Zap,
  BarChart3,
  Calendar,
  Download,
  Edit,
  Eye,
  Heart,
  Lock,
  Mail,
  Play,
  Plus,
  Target,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

type IconData = {
  icon: ComponentType<{ className?: string }>;
  name: string;
  context: string;
};

export default function IconShowcase() {
  const quizForceIcons: IconData[] = [
    { icon: BookOpen, name: "BookOpen", context: "Study Materials" },
    { icon: Brain, name: "Brain", context: "Learning & Intelligence" },
    { icon: GraduationCap, name: "GraduationCap", context: "Certification" },
    { icon: Trophy, name: "Trophy", context: "Achievement" },
    { icon: Target, name: "Target", context: "Goals & Objectives" },
    { icon: Zap, name: "Zap", context: "Practice & Energy" },
    { icon: FileText, name: "FileText", context: "Exam Content" },
    { icon: BarChart3, name: "BarChart3", context: "Performance" },
  ];

  const uiIcons: IconData[] = [
    { icon: Home, name: "Home", context: "Navigation" },
    { icon: User, name: "User", context: "Profile" },
    { icon: Settings, name: "Settings", context: "Configuration" },
    { icon: Search, name: "Search", context: "Find Content" },
    { icon: Menu, name: "Menu", context: "Navigation" },
    { icon: Plus, name: "Plus", context: "Add/Create" },
    { icon: Edit, name: "Edit", context: "Modify" },
    { icon: Eye, name: "Eye", context: "View" },
  ];

  const statusIcons: IconData[] = [
    { icon: CheckCircle, name: "CheckCircle", context: "Success/Correct" },
    { icon: XCircle, name: "XCircle", context: "Error/Incorrect" },
    { icon: Clock, name: "Clock", context: "Time/Pending" },
    { icon: Star, name: "Star", context: "Rating/Favorite" },
    { icon: TrendingUp, name: "TrendingUp", context: "Progress" },
    { icon: Heart, name: "Heart", context: "Like/Favorite" },
    { icon: Lock, name: "Lock", context: "Locked/Premium" },
    { icon: Mail, name: "Mail", context: "Communication" },
  ];

  const renderIconGrid = (
    icons: IconData[],
    title: string,
    description: string
  ) => (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {icons.map(({ icon: Icon, name, context }) => (
            <div
              key={name}
              className="flex flex-col items-center p-4 border border-border rounded-lg hover:bg-accent transition-colors"
            >
              <Icon className="h-8 w-8 text-primary mb-2" />
              <span className="text-sm font-medium text-center">{name}</span>
              <span className="text-xs text-muted-foreground text-center mt-1">
                {context}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto p-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold quizforce-text-gradient">
          <BookOpen className="inline mr-3" />
          QuizForce Icons
        </h1>
        <p className="text-lg text-muted-foreground">
          Lucide React icons integrated with shadcn/ui and QuizForce theme
        </p>
      </div>

      {/* Icon Integration Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Icon Integration Examples</CardTitle>
          <CardDescription>
            How icons work with buttons, badges, and other UI components
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Buttons with Icons */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground">
              Buttons with Icons
            </h4>
            <div className="flex flex-wrap gap-4">
              <Button>
                <Play className="mr-2 h-4 w-4" />
                Start Exam
              </Button>
              <Button variant="secondary">
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
              <Button variant="outline">
                <Calendar className="mr-2 h-4 w-4" />
                Schedule
              </Button>
              <Button variant="destructive">
                <XCircle className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>

          <Separator />

          {/* Badges with Icons */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground">
              Status Badges with Icons
            </h4>
            <div className="flex flex-wrap gap-4">
              <Badge className="bg-green-500 hover:bg-green-600">
                <CheckCircle className="mr-1 h-3 w-3" />
                Completed
              </Badge>
              <Badge className="bg-yellow-500 hover:bg-yellow-600">
                <Clock className="mr-1 h-3 w-3" />
                In Progress
              </Badge>
              <Badge variant="destructive">
                <XCircle className="mr-1 h-3 w-3" />
                Failed
              </Badge>
              <Badge variant="outline">
                <Star className="mr-1 h-3 w-3" />
                Featured
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Icon Sizes */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground">
              Icon Sizes
            </h4>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <Trophy className="h-4 w-4 text-primary mx-auto mb-1" />
                <span className="text-xs">Small (16px)</span>
              </div>
              <div className="text-center">
                <Trophy className="h-6 w-6 text-primary mx-auto mb-1" />
                <span className="text-xs">Medium (24px)</span>
              </div>
              <div className="text-center">
                <Trophy className="h-8 w-8 text-primary mx-auto mb-1" />
                <span className="text-xs">Large (32px)</span>
              </div>
              <div className="text-center">
                <Trophy className="h-12 w-12 text-primary mx-auto mb-1" />
                <span className="text-xs">XL (48px)</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* QuizForce Specific Icons */}
      {renderIconGrid(
        quizForceIcons,
        "QuizForce Core Icons",
        "Icons specifically relevant to certification and learning"
      )}

      {/* UI Icons */}
      {renderIconGrid(
        uiIcons,
        "Interface Icons",
        "Common UI elements and navigation icons"
      )}

      {/* Status Icons */}
      {renderIconGrid(
        statusIcons,
        "Status & Action Icons",
        "Icons for states, actions, and user feedback"
      )}

      {/* Color Variants */}
      <Card>
        <CardHeader>
          <CardTitle>Icon Color Variants</CardTitle>
          <CardDescription>
            How icons adapt to different theme colors
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border border-border rounded-lg">
              <Zap className="h-8 w-8 text-primary mx-auto mb-2" />
              <span className="text-sm">Primary</span>
            </div>
            <div className="text-center p-4 border border-border rounded-lg">
              <Zap className="h-8 w-8 text-secondary-foreground mx-auto mb-2" />
              <span className="text-sm">Secondary</span>
            </div>
            <div className="text-center p-4 border border-border rounded-lg">
              <Zap className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <span className="text-sm">Muted</span>
            </div>
            <div className="text-center p-4 border border-border rounded-lg">
              <Zap className="h-8 w-8 text-destructive mx-auto mb-2" />
              <span className="text-sm">Destructive</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Real-World Usage Examples</CardTitle>
          <CardDescription>
            How these icons would be used in QuizForce features
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 p-3 border border-border rounded-lg">
            <BookOpen className="h-5 w-5 text-primary" />
            <div>
              <span className="font-medium">
                Salesforce Admin Certification
              </span>
              <p className="text-sm text-muted-foreground">
                Practice exam with 65 questions
              </p>
            </div>
            <Badge className="ml-auto bg-green-500">
              <CheckCircle className="mr-1 h-3 w-3" />
              Active
            </Badge>
          </div>

          <div className="flex items-center gap-3 p-3 border border-border rounded-lg">
            <Users className="h-5 w-5 text-primary" />
            <div>
              <span className="font-medium">
                Study Group: Platform Developer
              </span>
              <p className="text-sm text-muted-foreground">
                12 members, next session tomorrow
              </p>
            </div>
            <Badge variant="outline">
              <Calendar className="mr-1 h-3 w-3" />
              Scheduled
            </Badge>
          </div>

          <div className="flex items-center gap-3 p-3 border border-border rounded-lg">
            <BarChart3 className="h-5 w-5 text-primary" />
            <div>
              <span className="font-medium">Performance Analytics</span>
              <p className="text-sm text-muted-foreground">
                Track your progress across all certifications
              </p>
            </div>
            <Badge className="ml-auto bg-blue-500">
              <TrendingUp className="mr-1 h-3 w-3" />
              Improving
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
