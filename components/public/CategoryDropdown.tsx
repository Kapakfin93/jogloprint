"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Category } from "@/lib/types/database";

interface CategoryDropdownProps {
  readonly categories: Category[];
}

export default function CategoryDropdown({ categories }: CategoryDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  if (!categories || categories.length === 0) return null;

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1 shrink-0 select-none ${
          isOpen
            ? "bg-amber-50 text-amber-700 ring-1 ring-amber-300"
            : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
        }`}
      >
        <span>Lainnya</span>
        <svg
          className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? "rotate-180 text-amber-600" : "text-slate-400"}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute left-0 lg:left-auto lg:right-0 mt-2 w-56 rounded-2xl bg-white p-2 shadow-xl border border-slate-200/90 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1">
            Kategori Lainnya ({categories.length})
          </div>
          <div className="max-h-72 overflow-y-auto space-y-0.5">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/kategori/${cat.slug}`}
                onClick={() => setIsOpen(false)}
                className="group flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-amber-800 hover:bg-amber-50 transition"
              >
                <span className="truncate">{cat.name}</span>
                <span className="text-[10px] text-slate-300 group-hover:text-amber-500 transition-colors ml-2">
                  →
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
