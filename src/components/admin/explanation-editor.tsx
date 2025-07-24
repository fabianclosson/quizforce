"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Type,

  Eye,
  EyeOff,
} from "lucide-react";
import { XSSPrevention } from "@/lib/validators";

interface ExplanationEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  maxLength?: number;
  className?: string;
}

export function ExplanationEditor({
  value,
  onChange,
  placeholder = "Write your explanation here...",
  disabled = false,
  maxLength = 1000,
  className,
}: ExplanationEditorProps) {
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [currentLength, setCurrentLength] = useState(0);
  const editorRef = useRef<HTMLDivElement>(null);
  const [isEditorFocused, setIsEditorFocused] = useState(false);

  // Update character count when value changes
  useEffect(() => {
    const textLength = getTextContent(value).length;
    setCurrentLength(textLength);
  }, [value]);

  // Set initial content
  useEffect(() => {
    if (editorRef.current && !isPreviewMode) {
      const sanitizedValue = XSSPrevention.sanitizeHtml(value || "");
      if (editorRef.current.innerHTML !== sanitizedValue) {
        editorRef.current.innerHTML = sanitizedValue;
      }
    }
  }, [value, isPreviewMode]);

  // Helper function to get text content without HTML
  const getTextContent = (html: string): string => {
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || div.innerText || "";
  };

  // Handle content changes
  const handleContentChange = () => {
    if (editorRef.current && !disabled) {
      const newContent = editorRef.current.innerHTML;
      const textLength = getTextContent(newContent).length;

      if (textLength <= maxLength) {
        const sanitizedContent = XSSPrevention.sanitizeHtml(newContent);
        onChange(sanitizedContent);
      } else {
        // Revert to previous content if max length exceeded
        const sanitizedValue = XSSPrevention.sanitizeHtml(value || "");
        editorRef.current.innerHTML = sanitizedValue;
      }
    }
  };

  // Format text with basic HTML tags
  const formatText = (command: string, value?: string) => {
    if (disabled || isPreviewMode) return;

    document.execCommand(command, false, value);
    setTimeout(handleContentChange, 10);
    editorRef.current?.focus();
  };

  // Handle paste events to clean up pasted content
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    const sanitizedText = XSSPrevention.sanitizeText(text);
    document.execCommand("insertText", false, sanitizedText);
    setTimeout(handleContentChange, 10);
  };

  // Clear all formatting
  const clearFormatting = () => {
    if (disabled || isPreviewMode) return;

    if (editorRef.current) {
      const textContent = getTextContent(editorRef.current.innerHTML);
      editorRef.current.innerHTML = textContent;
      onChange(textContent);
    }
    editorRef.current?.focus();
  };

  // Toggle preview mode
  const togglePreview = () => {
    setIsPreviewMode(!isPreviewMode);
  };

  const getCharacterCountColor = () => {
    if (currentLength > maxLength * 0.9) return "text-red-600";
    if (currentLength > maxLength * 0.8) return "text-yellow-600";
    return "text-muted-foreground";
  };

  const isToolbarDisabled = disabled || isPreviewMode;

  return (
    <Card className={cn("w-full", className)}>
      <CardContent className="p-4">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1">
            <Badge variant="outline" className="text-xs">
              Explanation Editor
            </Badge>

            <Separator orientation="vertical" className="h-4 mx-2" />

            {/* Formatting buttons */}
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => formatText("bold")}
                disabled={isToolbarDisabled}
                className="h-8 w-8 p-0"
                title="Bold"
              >
                <Bold className="h-3.5 w-3.5" />
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => formatText("italic")}
                disabled={isToolbarDisabled}
                className="h-8 w-8 p-0"
                title="Italic"
              >
                <Italic className="h-3.5 w-3.5" />
              </Button>

              <Separator orientation="vertical" className="h-4 mx-1" />

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => formatText("insertUnorderedList")}
                disabled={isToolbarDisabled}
                className="h-8 w-8 p-0"
                title="Bullet List"
              >
                <List className="h-3.5 w-3.5" />
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => formatText("insertOrderedList")}
                disabled={isToolbarDisabled}
                className="h-8 w-8 p-0"
                title="Numbered List"
              >
                <ListOrdered className="h-3.5 w-3.5" />
              </Button>

              <Separator orientation="vertical" className="h-4 mx-1" />

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clearFormatting}
                disabled={isToolbarDisabled}
                className="h-8 w-8 p-0"
                title="Clear Formatting"
              >
                <Type className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Preview toggle and character count */}
          <div className="flex items-center gap-2">
            <span className={cn("text-xs", getCharacterCountColor())}>
              {currentLength}/{maxLength}
            </span>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={togglePreview}
              disabled={disabled}
              className="h-8 w-8 p-0"
              title={isPreviewMode ? "Edit Mode" : "Preview Mode"}
            >
              {isPreviewMode ? (
                <EyeOff className="h-3.5 w-3.5" />
              ) : (
                <Eye className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
        </div>

        {/* Editor/Preview Area */}
        <div className="relative">
          {isPreviewMode ? (
            /* Preview Mode */
            <div className="min-h-[100px] p-3 border rounded-md bg-muted/30">
              {value ? (
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: XSSPrevention.sanitizeHtml(value),
                  }}
                />
              ) : (
                <p className="text-muted-foreground italic">
                  No content to preview
                </p>
              )}
            </div>
          ) : (
            /* Editor Mode */
            <div
              ref={editorRef}
              contentEditable={!disabled}
              onInput={handleContentChange}
              onPaste={handlePaste}
              onFocus={() => setIsEditorFocused(true)}
              onBlur={() => setIsEditorFocused(false)}
              className={cn(
                "min-h-[100px] p-3 border rounded-md",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                "prose prose-sm max-w-none",
                disabled && "opacity-50 cursor-not-allowed bg-muted",
                isEditorFocused &&
                  !disabled &&
                  "ring-2 ring-ring ring-offset-2",
                !value && "text-muted-foreground"
              )}
              data-placeholder={placeholder}
              suppressContentEditableWarning={true}
            />
          )}

          {/* Empty state placeholder for editor */}
          {!isPreviewMode &&
            (!value || value.trim() === "") &&
            !isEditorFocused && (
              <div className="absolute inset-0 flex items-start justify-start p-3 pointer-events-none">
                <span className="text-muted-foreground">{placeholder}</span>
              </div>
            )}
        </div>

        {/* Help text */}
        <div className="mt-2 text-xs text-muted-foreground">
          Use the toolbar for formatting. Supports <strong>bold</strong>,{" "}
          <em>italic</em>, and lists. Click the eye icon to preview your
          content.
        </div>
      </CardContent>
    </Card>
  );
}
