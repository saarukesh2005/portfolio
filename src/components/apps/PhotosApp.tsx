"use client";

import { useState } from "react";
import Image from "next/image";
import { gallery, type GalleryItem } from "@/content/gallery";

export default function PhotosApp() {
  const [open, setOpen] = useState<GalleryItem | null>(null);

  if (gallery.length === 0) {
    return (
      <div className="grid h-full place-items-center px-8 text-center">
        <div className="max-w-[42ch]">
          <span className="mb-3 block text-[34px]">🖼️</span>
          <h2 className="mb-2 text-[16px] font-semibold">No photos yet</h2>
          <p className="text-[13px] leading-relaxed text-mid">
            This is where your certificates go — the CMA Foundation marksheet, NSS and Rotaract,
            anything a recruiter would rather see than read about.
          </p>
          <p className="mt-4 text-[12.5px] leading-relaxed text-lo">
            Every certification is listed in About in the meantime.
          </p>
        </div>
      </div>
    );
  }

  const albums = [...new Set(gallery.map((g) => g.album))];

  return (
    <div className="mac-scroll relative h-full overflow-y-auto p-5">
      {albums.map((album) => (
        <section key={album} className="mb-7 last:mb-0">
          <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-lo">{album}</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {gallery
              .filter((g) => g.album === album)
              .map((g) => (
                <button
                  key={g.src}
                  onClick={() => setOpen(g)}
                  className="group overflow-hidden rounded-xl border border-[var(--glass-stroke)] bg-[var(--fill-1)] text-left transition-transform hover:-translate-y-0.5"
                >
                  <span className="relative block h-[118px] w-full overflow-hidden">
                    <Image src={g.src} alt={g.title} fill className="object-cover transition-transform duration-300 group-hover:scale-[1.04]" />
                  </span>
                  <span className="block px-2.5 py-2">
                    <span className="block truncate text-[12.5px] font-medium">{g.title}</span>
                    {g.caption && <span className="block truncate text-[11.5px] text-lo">{g.caption}</span>}
                  </span>
                </button>
              ))}
          </div>
        </section>
      ))}

      {open && (
        <div
          onClick={() => setOpen(null)}
          className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-black/85 p-6 backdrop-blur-sm"
        >
          <span className="relative max-h-[78%] w-full max-w-[560px] flex-1">
            <Image src={open.src} alt={open.title} fill className="object-contain" />
          </span>
          <span className="text-center">
            <span className="block text-[14px] font-medium text-white">{open.title}</span>
            {open.caption && <span className="block text-[12.5px] text-white/60">{open.caption}</span>}
          </span>
        </div>
      )}
    </div>
  );
}
