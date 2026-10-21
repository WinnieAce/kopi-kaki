// subset-font ships without types. Used only by scripts/subset-chinese-font.ts.
declare module 'subset-font' {
  export default function subsetFont(
    font: Uint8Array,
    text: string,
    options?: { targetFormat?: 'woff2' | 'woff' | 'sfnt' | 'truetype' },
  ): Promise<Uint8Array>
}
