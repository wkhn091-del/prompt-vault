export type MediaType = "video" | "image" | "live_preview";

export type PromptDTO = {
  id: string;
  title: string;
  slug: string;
  category: string;
  /** Present for clipboard copy only — never render in the UI. */
  promptText: string;
  mediaUrl: string | null;
  mediaType: MediaType | null;
  previewHtml: string | null;
  backdropColor: string | null;
  isPremium: boolean;
  price: number;
  createdAt: string;
};

export type DuplicateMatch = {
  id: string;
  title: string;
  slug: string;
  similarity: number;
  exact: boolean;
};

export type ApiError = {
  error: string;
  duplicate?: DuplicateMatch;
};
