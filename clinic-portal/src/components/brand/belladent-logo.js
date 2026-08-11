"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

const LOGOS = {
  wordmark: {
    src: "/images/belladent_logo_with_name.jpg",
    width: 2080,
    height: 653,
  },
  mark: {
    src: "/images/belladent_logo.jpg",
    width: 2080,
    height: 2048,
  },
};

export default function BellaDentLogo({ variant = "wordmark", className, priority = false, alt = "BellaDent" }) {
  const logo = LOGOS[variant] || LOGOS.wordmark;

  return (
    <Image
      src={logo.src}
      alt={alt}
      width={logo.width}
      height={logo.height}
      priority={priority}
      unoptimized
      className={cn("block object-contain", className)}
    />
  );
}
