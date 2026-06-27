// src/types/index.ts

/**
 * Represents a single scene in the Story Section.
 * Each scene has a unique image source, descriptive alt text, and copy ≤ 25 words.
 */
export interface StorySceneData {
    id: string
    imageSrc: string
    imageAlt: string
    copy: string  // ≤ 25 words
}

/**
 * Represents a single item in the Gallery Section.
 * Aspect ratios must alternate (no two consecutive items with same ratio).
 */
export interface GalleryItemData {
    src: string
    alt: string
    caption: string
    aspectRatio: '16/9' | '3/4' | '1/1' | '9/16'
}

/**
 * Layout family identifiers for sections.
 * No two consecutive sections may share the same layout family.
 */
export type LayoutFamily =
    | 'pinned-scroll-hero'
    | 'sticky-stack'
    | 'horizontal-scroll-hijack'
    | 'editorial-manifesto'
    | 'minimal-cta'
