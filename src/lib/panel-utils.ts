export type ClampPanelWidthOptions = {
  min?: number;
  maxRatio?: number;
  viewportPadding?: number;
  fallbackMax?: number;
};

export function clampPanelWidth(width: number, options: ClampPanelWidthOptions = {}) {
  const { min = 320, maxRatio = 0.5, viewportPadding = 48, fallbackMax = 720 } = options;
  const max =
    typeof window !== "undefined" ? Math.floor((window.innerWidth - viewportPadding) * maxRatio) : fallbackMax;
  return Math.max(min, Math.min(max, Math.round(width)));
}
