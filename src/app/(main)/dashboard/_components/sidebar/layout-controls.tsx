"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { type FontKey, fontOptions } from "@/lib/fonts/registry";
import type { ContentLayout, NavbarStyle, SidebarCollapsible, SidebarVariant } from "@/lib/preferences/layout";
import {
  applyContentLayout,
  applyFont,
  applyNavbarStyle,
  applySidebarCollapsible,
  applySidebarVariant,
} from "@/lib/preferences/layout-utils";
import { PREFERENCE_DEFAULTS } from "@/lib/preferences/preferences-config";
import { persistPreference } from "@/lib/preferences/preferences-storage";
import { THEME_PRESET_OPTIONS, type ThemeMode, type ThemePreset } from "@/lib/preferences/theme";
import { applyThemePreset } from "@/lib/preferences/theme-utils";
import { cn } from "@/lib/utils";
import { usePreferencesStore } from "@/stores/preferences/preferences-provider";

export function LayoutControls() {
  const themeMode = usePreferencesStore((s) => s.themeMode);
  const resolvedThemeMode = usePreferencesStore((s) => s.resolvedThemeMode);
  const setThemeMode = usePreferencesStore((s) => s.setThemeMode);
  const themePreset = usePreferencesStore((s) => s.themePreset);
  const setThemePreset = usePreferencesStore((s) => s.setThemePreset);
  const contentLayout = usePreferencesStore((s) => s.contentLayout);
  const setContentLayout = usePreferencesStore((s) => s.setContentLayout);
  const navbarStyle = usePreferencesStore((s) => s.navbarStyle);
  const setNavbarStyle = usePreferencesStore((s) => s.setNavbarStyle);
  const variant = usePreferencesStore((s) => s.sidebarVariant);
  const setSidebarVariant = usePreferencesStore((s) => s.setSidebarVariant);
  const collapsible = usePreferencesStore((s) => s.sidebarCollapsible);
  const setSidebarCollapsible = usePreferencesStore((s) => s.setSidebarCollapsible);
  const font = usePreferencesStore((s) => s.font);
  const setFont = usePreferencesStore((s) => s.setFont);

  const onThemePresetChange = async (preset: ThemePreset) => {
    applyThemePreset(preset);
    setThemePreset(preset);
    persistPreference("theme_preset", preset);
  };

  const onThemeModeChange = async (mode: ThemeMode | "") => {
    if (!mode) return;
    setThemeMode(mode);
    persistPreference("theme_mode", mode);
  };

  const onContentLayoutChange = async (layout: ContentLayout | "") => {
    if (!layout) return;
    applyContentLayout(layout);
    setContentLayout(layout);
    persistPreference("content_layout", layout);
  };

  const onNavbarStyleChange = async (style: NavbarStyle | "") => {
    if (!style) return;
    applyNavbarStyle(style);
    setNavbarStyle(style);
    persistPreference("navbar_style", style);
  };

  const onSidebarStyleChange = async (value: SidebarVariant | "") => {
    if (!value) return;
    setSidebarVariant(value);
    applySidebarVariant(value);
    persistPreference("sidebar_variant", value);
  };

  const onSidebarCollapseModeChange = async (value: SidebarCollapsible | "") => {
    if (!value) return;
    setSidebarCollapsible(value);
    applySidebarCollapsible(value);
    persistPreference("sidebar_collapsible", value);
  };

  const onFontChange = async (value: FontKey | "") => {
    if (!value) return;
    applyFont(value);
    setFont(value);
    persistPreference("font", value);
  };

  const handleRestore = () => {
    onThemePresetChange(PREFERENCE_DEFAULTS.theme_preset);
    onThemeModeChange(PREFERENCE_DEFAULTS.theme_mode);
    onContentLayoutChange(PREFERENCE_DEFAULTS.content_layout);
    onNavbarStyleChange(PREFERENCE_DEFAULTS.navbar_style);
    onSidebarStyleChange(PREFERENCE_DEFAULTS.sidebar_variant);
    onSidebarCollapseModeChange(PREFERENCE_DEFAULTS.sidebar_collapsible);
    onFontChange(PREFERENCE_DEFAULTS.font);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-1">
        <h2 className="text-base font-semibold">Appearance</h2>
        <p className="text-sm text-muted-foreground">
          Customize the appearance of the app. Automatically switch between day and night themes.
        </p>
      </div>
      <Separator />
      <div className="space-y-6 **:data-[slot=toggle-group]:w-full **:data-[slot=toggle-group-item]:flex-1 **:data-[slot=toggle-group-item]:text-xs">
        <div className="space-y-2">
          <Label className="text-xs font-medium">Font</Label>
          <Select value={font} onValueChange={onFontChange}>
            <SelectTrigger size="sm" className="w-full text-xs">
              <SelectValue placeholder="Select font" />
            </SelectTrigger>
            <SelectContent>
              {fontOptions.map((font) => (
                <SelectItem key={font.key} className="text-xs" value={font.key}>
                  {font.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">Set the font you want to use in the dashboard.</p>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-medium">Theme Preset</Label>
          <Select value={themePreset} onValueChange={onThemePresetChange}>
            <SelectTrigger size="sm" className="w-full text-xs">
              <SelectValue placeholder="Preset" />
            </SelectTrigger>
            <SelectContent>
              {THEME_PRESET_OPTIONS.map((preset) => (
                <SelectItem key={preset.value} className="text-xs" value={preset.value}>
                  <span
                    className="size-2.5 rounded-full"
                    style={{
                      backgroundColor:
                        (resolvedThemeMode ?? "light") === "dark" ? preset.primary.dark : preset.primary.light,
                    }}
                  />
                  {preset.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">Select the color preset for the dashboard.</p>
        </div>

        <div className="space-y-3">
          <Label className="text-xs font-medium">Theme</Label>
          <p className="text-xs text-muted-foreground">Select the theme for the dashboard.</p>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {[
              { value: "light", label: "Light" },
              { value: "dark", label: "Dark" },
              { value: "system", label: "System" },
            ].map((mode) => {
              const isActive = themeMode === mode.value;
              return (
                <button
                  key={mode.value}
                  type="button"
                  onClick={() => onThemeModeChange(mode.value as ThemeMode)}
                  className={cn(
                    "group flex w-full items-center gap-3 rounded-md border p-3 text-left text-sm transition",
                    "hover:bg-muted/40",
                    isActive ? "border-foreground/50 ring-2 ring-foreground/10" : "border-border",
                  )}
                  aria-pressed={isActive}
                >
                  <div
                    className={cn(
                      "flex h-20 w-24 flex-col gap-2 rounded-md border p-2",
                      mode.value === "dark" ? "bg-zinc-950 border-zinc-800" : "bg-white border-zinc-200",
                    )}
                  >
                    <div className={cn("h-4 rounded-full", mode.value === "dark" ? "bg-slate-700" : "bg-zinc-200")} />
                    <div
                      className={cn("h-4 rounded-full", mode.value === "dark" ? "bg-slate-700/80" : "bg-zinc-200/80")}
                    />
                    <div className="mt-auto flex items-center gap-2">
                      <div
                        className={cn("size-4 rounded-full", mode.value === "dark" ? "bg-slate-600" : "bg-zinc-200")}
                      />
                      <div
                        className={cn(
                          "h-3 flex-1 rounded-full",
                          mode.value === "dark" ? "bg-slate-700/80" : "bg-zinc-200/80",
                        )}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{mode.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {mode.value === "system" ? "Match your OS settings." : `Use ${mode.label.toLowerCase()} theme.`}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-medium">Page Layout</Label>
          <ToggleGroup
            size="sm"
            variant="outline"
            type="single"
            value={contentLayout}
            onValueChange={onContentLayoutChange}
          >
            <ToggleGroupItem value="centered" aria-label="Toggle centered">
              Centered
            </ToggleGroupItem>
            <ToggleGroupItem value="full-width" aria-label="Toggle full-width">
              Full Width
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-medium">Navbar Behavior</Label>
          <ToggleGroup
            size="sm"
            variant="outline"
            type="single"
            value={navbarStyle}
            onValueChange={onNavbarStyleChange}
          >
            <ToggleGroupItem value="sticky" aria-label="Toggle sticky">
              Sticky
            </ToggleGroupItem>
            <ToggleGroupItem value="scroll" aria-label="Toggle scroll">
              Scroll
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-medium">Sidebar Style</Label>
          <ToggleGroup size="sm" variant="outline" type="single" value={variant} onValueChange={onSidebarStyleChange}>
            <ToggleGroupItem value="inset" aria-label="Toggle inset">
              Inset
            </ToggleGroupItem>
            <ToggleGroupItem value="sidebar" aria-label="Toggle sidebar">
              Sidebar
            </ToggleGroupItem>
            <ToggleGroupItem value="floating" aria-label="Toggle floating">
              Floating
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-medium">Sidebar Collapse Mode</Label>
          <ToggleGroup
            size="sm"
            variant="outline"
            type="single"
            value={collapsible}
            onValueChange={onSidebarCollapseModeChange}
          >
            <ToggleGroupItem value="icon" aria-label="Toggle icon">
              Icon
            </ToggleGroupItem>
            <ToggleGroupItem value="offcanvas" aria-label="Toggle offcanvas">
              OffCanvas
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button type="button" size="sm">
            Update settings
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={handleRestore}>
            Restore Defaults
          </Button>
        </div>
      </div>
    </div>
  );
}
