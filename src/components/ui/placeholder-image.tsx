interface PlaceholderImageProps {
  name: string;
  type?: "certification" | "package";
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function PlaceholderImage({
  name,
  type = "certification",
  className = "",
  size = "md",
}: PlaceholderImageProps) {
  // Safely handle undefined/null/empty names
  const safeName =
    name || `${type === "certification" ? "Certification" : "Package"}`;

  // Get initials from name (first letter of each word, max 2)
  const initials = safeName
    .split(" ")
    .map(word => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("");

  // Generate a consistent color based on the name
  const hashCode = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
  };

  const hash = Math.abs(hashCode(safeName));

  // Color palettes for different types
  const certificationColors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-orange-500",
    "bg-red-500",
    "bg-teal-500",
    "bg-indigo-500",
    "bg-pink-500",
  ];

  const packageColors = [
    "bg-gray-600",
    "bg-slate-600",
    "bg-stone-600",
    "bg-zinc-600",
    "bg-neutral-600",
  ];

  const colors = type === "certification" ? certificationColors : packageColors;
  const bgColor = colors[hash % colors.length];

  // Size classes
  const sizeClasses = {
    sm: "h-12 w-12 text-xs",
    md: "h-16 w-16 text-sm",
    lg: "h-20 w-20 text-base",
  };

  return (
    <div
      className={`${sizeClasses[size]} ${bgColor} rounded-md flex items-center justify-center text-white font-semibold ${className}`}
    >
      {initials}
    </div>
  );
}
