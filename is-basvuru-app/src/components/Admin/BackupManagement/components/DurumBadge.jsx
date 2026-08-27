import React from "react";

export default function DurumBadge({
  icon: IconComponent,
  text,
  className = "",
  iconClassName = "",
}) {
  return (
    <span
      className={`
        inline-flex
        items-center
        gap-1.5
        rounded-full
        border
        px-2.5
        py-1
        text-xs
        font-semibold
        ${className}
      `}
    >
      {IconComponent && (
        <IconComponent className={`h-3.5 w-3.5 ${iconClassName}`} />
      )}

      {text}
    </span>
  );
}
