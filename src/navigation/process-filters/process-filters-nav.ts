import { Filter, ListChecks, type LucideIcon, Plus, Settings } from "lucide-react";

export type ProcessFiltersNavSubItem = {
  title: string;
  url: string;
  icon: LucideIcon;
};

export const processFiltersNavItem = {
  title: "Process Filters",
  url: "/dashboard/process-filters",
  icon: Filter,
  subItems: [
    { title: "Settings", url: "/dashboard/process-filters#settings", icon: Settings },
    { title: "Add New Rule", url: "/dashboard/process-filters#add-new-rule", icon: Plus },
    { title: "Existing Rules", url: "/dashboard/process-filters#existing-rules", icon: ListChecks },
  ],
} satisfies {
  title: string;
  url: string;
  icon: LucideIcon;
  subItems: ProcessFiltersNavSubItem[];
};
