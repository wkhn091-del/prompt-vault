import sanitizeHtml from "sanitize-html";

/**
 * Sanitize preview HTML before storing.
 * Uses sanitize-html (no jsdom) — isomorphic-dompurify crashes on Vercel ESM.
 * Keeps layout + CSS; strips scripts, handlers, javascript: URLs.
 */
export function sanitizePreviewHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
      "img",
      "video",
      "source",
      "picture",
      "svg",
      "path",
      "g",
      "circle",
      "rect",
      "line",
      "polyline",
      "polygon",
      "defs",
      "use",
      "symbol",
      "clipPath",
      "linearGradient",
      "radialGradient",
      "stop",
      "style",
      "section",
      "header",
      "footer",
      "nav",
      "main",
      "article",
      "figure",
      "figcaption",
      "canvas",
    ]),
    // No script / iframe / object / embed / form / base
    disallowedTagsMode: "discard",
    allowedAttributes: {
      "*": [
        "class",
        "id",
        "style",
        "title",
        "role",
        "aria-label",
        "aria-hidden",
        "data-*",
      ],
      a: ["href", "name", "target", "rel"],
      img: ["src", "srcset", "alt", "width", "height", "loading"],
      video: ["src", "poster", "width", "height", "autoplay", "muted", "loop", "playsinline"],
      source: ["src", "type"],
      svg: ["viewBox", "xmlns", "width", "height", "fill", "stroke"],
      path: ["d", "fill", "stroke", "transform"],
      circle: ["cx", "cy", "r", "fill", "stroke"],
      rect: ["x", "y", "width", "height", "rx", "ry", "fill", "stroke"],
      use: ["href", "xlink:href"],
      stop: ["offset", "stop-color", "stop-opacity"],
    },
    allowedSchemes: ["http", "https", "mailto", "tel", "data"],
    allowedSchemesByTag: {
      img: ["http", "https", "data"],
      video: ["http", "https"],
      source: ["http", "https"],
    },
    allowProtocolRelative: false,
    // Keep inline styles for motion previews (no url(javascript:))
    parseStyleAttributes: true,
  });
}
