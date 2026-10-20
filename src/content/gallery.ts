/**
 * The Photos app reads this file — certificates, marksheets, award photos.
 *
 * Drop the image files in `public/certificates/`, then add an entry each.
 * Empty by default because I don't have the files.
 */

export type GalleryItem = {
  src: string;
  title: string;
  caption?: string;
  /** groups the grid; e.g. "Certifications", "Volunteering" */
  album: string;
};

export const gallery: GalleryItem[] = [
  // {
  //   src: "/certificates/cma-foundation.jpg",
  //   title: "CMA Foundation",
  //   caption: "ICMAI · Dec 2022 · 264/400",
  //   album: "Certifications",
  // },
];
