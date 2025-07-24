"use client";

import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className="flex items-center justify-between"
        >
          <div className="flex items-center">
            <Sun className="mr-2 h-4 w-4" />
            Light
          </div>
          {theme === "light" && <Badge variant="secondary">Active</Badge>}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className="flex items-center justify-between"
        >
          <div className="flex items-center">
            <Moon className="mr-2 h-4 w-4" />
            Dark
          </div>
          {theme === "dark" && <Badge variant="secondary">Active</Badge>}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className="flex items-center justify-between"
        >
          <div className="flex items-center">
            <Monitor className="mr-2 h-4 w-4" />
            System
          </div>
          {theme === "system" && <Badge variant="secondary">Active</Badge>}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function ThemeSwitcherInline() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Theme:</span>
      <div className="flex rounded-lg border">
        <Button
          variant={theme === "light" ? "default" : "ghost"}
          size="sm"
          onClick={() => setTheme("light")}
          className="rounded-r-none"
        >
          <Sun className="mr-1 h-3 w-3" />
          Light
        </Button>
        <Button
          variant={theme === "dark" ? "default" : "ghost"}
          size="sm"
          onClick={() => setTheme("dark")}
          className="rounded-none border-x"
        >
          <Moon className="mr-1 h-3 w-3" />
          Dark
        </Button>
        <Button
          variant={theme === "system" ? "default" : "ghost"}
          size="sm"
          onClick={() => setTheme("system")}
          className="rounded-l-none"
        >
          <Monitor className="mr-1 h-3 w-3" />
          System
        </Button>
      </div>
    </div>
  );
}
