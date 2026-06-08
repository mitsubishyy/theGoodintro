// Public surface for @thegoodintro/ui (UI_KIT_BRIEF §1 barrel). Source-only TS;
// Next transpiles via `transpilePackages` in apps/platform/next.config.ts.

// ── Tokens / brand ──────────────────────────────────────────────────────────
export { Wordmark } from "./Wordmark";
export type { WordmarkProps } from "./Wordmark";

// ── Icons (also exported as a subpath: "@thegoodintro/ui/icons") ────────────
export { Icon } from "./icons";
export type { IconName, IconProps } from "./icons";

// ── Primitives ──────────────────────────────────────────────────────────────
export { Button } from "./primitives/Button";
export type { ButtonVariant, ButtonSize } from "./primitives/Button";
export { Badge } from "./primitives/Badge";
export type { BadgeProps } from "./primitives/Badge";
export { StatusDot } from "./primitives/StatusDot";
export type { StatusDotProps } from "./primitives/StatusDot";
export { Avatar, initialsOf } from "./primitives/Avatar";
export type { AvatarProps } from "./primitives/Avatar";
export { EmptyState } from "./primitives/EmptyState";
export type { EmptyStateProps } from "./primitives/EmptyState";
export { Skeleton } from "./primitives/Skeleton";
export type { SkeletonProps, SkeletonVariant } from "./primitives/Skeleton";
export { ErrorInline } from "./primitives/ErrorInline";
export type { ErrorInlineProps } from "./primitives/ErrorInline";
export { Tabs } from "./primitives/Tabs";
export type { TabsProps, TabsItem } from "./primitives/Tabs";
export { Field } from "./primitives/Field";
export type { FieldProps } from "./primitives/Field";
export { TogglePill } from "./primitives/TogglePill";
export type { TogglePillProps } from "./primitives/TogglePill";
export { RadioCard } from "./primitives/RadioCard";
export type { RadioCardProps, RadioCardOption } from "./primitives/RadioCard";
export { WhatHappensNext } from "./primitives/WhatHappensNext";
export type { WhatHappensNextProps } from "./primitives/WhatHappensNext";

// ── Shell ───────────────────────────────────────────────────────────────────
export { PortalShell } from "./shell/PortalShell";
export type { PortalShellProps } from "./shell/PortalShell";
export { PortalSidebar } from "./shell/PortalSidebar";
export type { PortalSidebarProps } from "./shell/PortalSidebar";
export { PortalTopbar } from "./shell/PortalTopbar";
export type { PortalTopbarProps } from "./shell/PortalTopbar";
export { PortalPage } from "./shell/PortalPage";
export type { PortalPageProps, BreadcrumbItem } from "./shell/PortalPage";

// ── Templates (T1 + T2; T3-T6 land alongside the first screen port) ─────────
export { MetricsRibbon } from "./templates/MetricsRibbon";
export type { MetricsRibbonProps } from "./templates/MetricsRibbon";
export { Widget } from "./templates/Widget";
export type { WidgetProps } from "./templates/Widget";
export { DataTable } from "./templates/DataTable";
export type { DataTableProps, DataTableColumn, DataTableDensity, SortState } from "./templates/DataTable";
export { RecordDetail } from "./templates/RecordDetail";
export type { RecordDetailProps, DetailModule, DetailFact, ActivityItem } from "./templates/RecordDetail";
export { RecordForm } from "./templates/RecordForm";
export type { RecordFormProps, RecordFormVariant, FormSection } from "./templates/RecordForm";
export { Checklist } from "./templates/Checklist";
export type { ChecklistProps, ChecklistItem } from "./templates/Checklist";
export { ExecCardGrid } from "./templates/ExecCardGrid";
export type { ExecCardGridProps, ExecCard } from "./templates/ExecCardGrid";
export { InlineFilterBar } from "./templates/InlineFilterBar";
export type { InlineFilterBarProps, FilterPill } from "./templates/InlineFilterBar";

// ── Shared types ────────────────────────────────────────────────────────────
export type {
  Portal,
  LoadState,
  Tone,
  NavItem,
  IdentityCard,
  AccountChip,
  RibbonStat,
  RibbonGroup,
  Column,
} from "./types";
