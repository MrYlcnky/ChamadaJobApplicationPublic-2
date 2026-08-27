import React from "react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

export default function DataTableSortHeader({ column, title }) {
  if (!column.getCanSort()) {
    return (
      <span className="text-xs font-bold uppercase tracking-wide text-gray-600">
        {title}
      </span>
    );
  }

  const durum = column.getIsSorted();

  return (
    <button
      type="button"
      onClick={column.getToggleSortingHandler()}
      className="
        -ml-2
        inline-flex
        items-center
        gap-1.5
        rounded-lg
        px-2
        py-1.5
        text-xs
        font-bold
        uppercase
        tracking-wide
        text-gray-600
        transition-colors
        hover:bg-gray-100
        hover:text-gray-900
      "
    >
      {title}

      {durum === "asc" ? (
        <ArrowUp className="h-3.5 w-3.5" />
      ) : durum === "desc" ? (
        <ArrowDown className="h-3.5 w-3.5" />
      ) : (
        <ArrowUpDown className="h-3.5 w-3.5 text-gray-400" />
      )}
    </button>
  );
}
