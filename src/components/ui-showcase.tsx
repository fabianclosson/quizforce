"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function UIShowcase() {
  const [inputValue, setInputValue] = useState("");

  return (
    <div className="container mx-auto p-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold quizforce-text-gradient">
          QuizForce UI Components
        </h1>
        <p className="text-lg text-muted-foreground">
          Testing shadcn/ui components with our custom QuizForce theme
        </p>
      </div>

      {/* Buttons Section */}
      <Card>
        <CardHeader>
          <CardTitle>Buttons</CardTitle>
          <CardDescription>Various button styles and states</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <Button>Default</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
          </div>

          <div className="flex flex-wrap gap-4">
            <Button size="sm">Small</Button>
            <Button>Default Size</Button>
            <Button size="lg">Large</Button>
            <Button disabled>Disabled</Button>
          </div>
        </CardContent>
      </Card>

      {/* Input and Forms Section */}
      <Card>
        <CardHeader>
          <CardTitle>Form Elements</CardTitle>
          <CardDescription>Input fields and labels</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              type="email"
              id="email"
              placeholder="Email"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
            />
          </div>

          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="password">Password</Label>
            <Input type="password" id="password" placeholder="Password" />
          </div>

          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="disabled">Disabled Input</Label>
            <Input type="text" id="disabled" placeholder="Disabled" disabled />
          </div>
        </CardContent>
      </Card>

      {/* Badges Section */}
      <Card>
        <CardHeader>
          <CardTitle>Badges</CardTitle>
          <CardDescription>Status indicators and labels</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="destructive">Error</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge className="bg-green-500 hover:bg-green-600">Success</Badge>
            <Badge className="bg-yellow-500 hover:bg-yellow-600">Warning</Badge>
            <Badge className="bg-blue-500 hover:bg-blue-600">Info</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Avatar Section */}
      <Card>
        <CardHeader>
          <CardTitle>Avatars</CardTitle>
          <CardDescription>User profile pictures and fallbacks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-center">
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>

            <Avatar className="h-12 w-12">
              <AvatarFallback>QF</AvatarFallback>
            </Avatar>

            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-lg">JD</AvatarFallback>
            </Avatar>
          </div>
        </CardContent>
      </Card>

      {/* Interactive Components Section */}
      <Card>
        <CardHeader>
          <CardTitle>Interactive Components</CardTitle>
          <CardDescription>Dialogs, dropdowns, and overlays</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            {/* Dialog */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Open Dialog</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>QuizForce Dialog</DialogTitle>
                  <DialogDescription>
                    This is a sample dialog using our custom theme. Perfect for
                    exam instructions, results, or settings.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <p>Dialog content goes here...</p>
                  <Button className="w-full">Action Button</Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Alert Dialog */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Delete Item</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    the item.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction>Continue</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* Dropdown Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">Menu</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>QuizForce Menu</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Practice Exams</DropdownMenuItem>
                <DropdownMenuItem>Study Materials</DropdownMenuItem>
                <DropdownMenuItem>Performance</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuItem>Sign Out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      {/* Layout Elements */}
      <Card>
        <CardHeader>
          <CardTitle>Layout Elements</CardTitle>
          <CardDescription>
            Separators and structural components
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="text-sm font-medium">Section A</h4>
            <p className="text-sm text-muted-foreground">
              Content for section A
            </p>
          </div>

          <Separator />

          <div>
            <h4 className="text-sm font-medium">Section B</h4>
            <p className="text-sm text-muted-foreground">
              Content for section B
            </p>
          </div>

          <Separator />

          <div>
            <h4 className="text-sm font-medium">Section C</h4>
            <p className="text-sm text-muted-foreground">
              Content for section C
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Color Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Theme Integration</CardTitle>
          <CardDescription>
            How components look with our QuizForce theme
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-primary text-primary-foreground rounded-lg">
              <h4 className="font-semibold">Primary Theme</h4>
              <p className="text-sm opacity-90">
                Components using primary colors
              </p>
            </div>

            <div className="p-4 bg-secondary text-secondary-foreground rounded-lg">
              <h4 className="font-semibold">Secondary Theme</h4>
              <p className="text-sm opacity-90">
                Components using secondary colors
              </p>
            </div>
          </div>

          <div className="p-4 quizforce-gradient text-white rounded-lg">
            <h4 className="font-semibold">QuizForce Branding</h4>
            <p className="text-sm opacity-90">
              Custom gradient for brand elements
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
