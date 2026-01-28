"use client"

import * as React from "react"
import { Drawer as DrawerPrimitive } from "vaul"
import { XIcon } from "lucide-react"

import { cn } from "@/lib/utils"

type DrawerContentProps = React.ComponentProps<typeof DrawerPrimitive.Content> & {
  /**
   * For left/right drawers: distance (top/bottom and left/right) from the viewport edge.
   * - number -> px
   * - string -> any valid CSS length (e.g. "2rem", "24px", "10vh")
   */
  sideOffset?: number | string
  /**
   * For left/right drawers: horizontal offset from the viewport edge (left or right).
   * Overrides `sideOffset` for the X axis.
   */
  sideOffsetX?: number | string
  /**
   * For left/right drawers: vertical offset from the viewport edge (top and bottom).
   * Overrides `sideOffset` for the Y axis.
   */
  sideOffsetY?: number | string
  /**
   * For left/right drawers: width.
   * - number -> px
   * - string -> any valid CSS length (e.g. "420px", "75vw")
   */
  sideWidth?: number | string
  /**
   * For left/right drawers: max-width applied at `sm` breakpoint and up.
   * - number -> px
   * - string -> any valid CSS length (e.g. "32rem")
   */
  sideMaxWidth?: number | string
  /**
   * Customize the overlay for specific drawers.
   */
  overlayClassName?: string
  overlayStyle?: React.CSSProperties
  /**
   * When true, do not render the overlay (useful for non-modal side panels).
   */
  hideOverlay?: boolean
  /**
   * Optional actions rendered next to the close button for left/right drawers.
   */
  headerActions?: React.ReactNode
}

function Drawer({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Root>) {
  return <DrawerPrimitive.Root data-slot="drawer" {...props} />
}

function DrawerTrigger({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Trigger>) {
  return <DrawerPrimitive.Trigger data-slot="drawer-trigger" {...props} />
}

function DrawerPortal({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Portal>) {
  return <DrawerPrimitive.Portal data-slot="drawer-portal" {...props} />
}

function DrawerClose({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Close>) {
  return <DrawerPrimitive.Close data-slot="drawer-close" {...props} />
}

function DrawerOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Overlay>) {
  return (
    <DrawerPrimitive.Overlay
      data-slot="drawer-overlay"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
        className
      )}
      {...props}
    />
  )
}

function DrawerContent({
  className,
  children,
  sideOffset,
  sideOffsetX,
  sideOffsetY,
  sideWidth,
  sideMaxWidth,
  overlayClassName,
  overlayStyle,
  hideOverlay,
  headerActions,
  style,
  ...props
}: DrawerContentProps) {
  const resolvedSideOffsetX = sideOffsetX ?? sideOffset
  const resolvedSideOffsetY = sideOffsetY ?? sideOffset

  const variableStyle = {
    ...(resolvedSideOffsetX != null
      ? {
          ["--drawer-side-offset-x" as any]:
            typeof resolvedSideOffsetX === "number"
              ? `${resolvedSideOffsetX}px`
              : resolvedSideOffsetX,
        }
      : {}),
    ...(resolvedSideOffsetY != null
      ? {
          ["--drawer-side-offset-y" as any]:
            typeof resolvedSideOffsetY === "number"
              ? `${resolvedSideOffsetY}px`
              : resolvedSideOffsetY,
        }
      : {}),
    ...(sideWidth != null
      ? {
          ["--drawer-side-width" as any]:
            typeof sideWidth === "number" ? `${sideWidth}px` : sideWidth,
        }
      : {}),
    ...(sideMaxWidth != null
      ? {
          ["--drawer-side-max-width" as any]:
            typeof sideMaxWidth === "number"
              ? `${sideMaxWidth}px`
              : sideMaxWidth,
        }
      : {}),
  } as React.CSSProperties

  return (
    <DrawerPortal data-slot="drawer-portal">
      {!hideOverlay && <DrawerOverlay className={overlayClassName} style={overlayStyle} />}
      <DrawerPrimitive.Content
        data-slot="drawer-content"
        // Prevent Vaul's default `::after` background extender from painting outside
        // the drawer when we use an inset (e.g. `right-4`) side drawer.
        data-vaul-custom-container="true"
        style={{ ...variableStyle, ...style }}
        className={cn(
          "group/drawer-content bg-background fixed z-50 flex h-auto flex-col",
          "[--drawer-side-offset-x:1rem] [--drawer-side-offset-y:1rem] [--drawer-side-width:75%] [--drawer-side-max-width:24rem]",
          "data-[vaul-drawer-direction=top]:inset-x-0 data-[vaul-drawer-direction=top]:top-0 data-[vaul-drawer-direction=top]:mb-24 data-[vaul-drawer-direction=top]:max-h-[80vh] data-[vaul-drawer-direction=top]:rounded-b-lg data-[vaul-drawer-direction=top]:border-b",
          "data-[vaul-drawer-direction=bottom]:inset-x-0 data-[vaul-drawer-direction=bottom]:bottom-0 data-[vaul-drawer-direction=bottom]:mt-24 data-[vaul-drawer-direction=bottom]:max-h-[80vh] data-[vaul-drawer-direction=bottom]:rounded-t-lg data-[vaul-drawer-direction=bottom]:border-t",
          "data-[vaul-drawer-direction=right]:top-[var(--drawer-side-offset-y)] data-[vaul-drawer-direction=right]:bottom-[var(--drawer-side-offset-y)] data-[vaul-drawer-direction=right]:right-[var(--drawer-side-offset-x)] data-[vaul-drawer-direction=right]:w-[var(--drawer-side-width)] data-[vaul-drawer-direction=right]:rounded-lg data-[vaul-drawer-direction=right]:border data-[vaul-drawer-direction=right]:shadow-lg data-[vaul-drawer-direction=right]:sm:max-w-[var(--drawer-side-max-width)]",
          "data-[vaul-drawer-direction=left]:top-[var(--drawer-side-offset-y)] data-[vaul-drawer-direction=left]:bottom-[var(--drawer-side-offset-y)] data-[vaul-drawer-direction=left]:left-[var(--drawer-side-offset-x)] data-[vaul-drawer-direction=left]:w-[var(--drawer-side-width)] data-[vaul-drawer-direction=left]:rounded-lg data-[vaul-drawer-direction=left]:border data-[vaul-drawer-direction=left]:shadow-lg data-[vaul-drawer-direction=left]:sm:max-w-[var(--drawer-side-max-width)]",
          className
        )}
        {...props}
      >
        <div className="bg-muted mx-auto mt-4 hidden h-2 w-[100px] shrink-0 rounded-full group-data-[vaul-drawer-direction=bottom]/drawer-content:block" />
        {children}
        <div
          data-slot="drawer-header-actions"
          className={cn(
            "absolute top-4 right-4 z-10 hidden items-center gap-1",
            "group-data-[vaul-drawer-direction=right]/drawer-content:inline-flex group-data-[vaul-drawer-direction=left]/drawer-content:inline-flex"
          )}
        >
          {headerActions}
          <DrawerPrimitive.Close
            data-slot="drawer-close-button"
            className={cn(
              "ring-offset-background focus:ring-ring data-[state=open]:bg-secondary inline-flex size-8 items-center justify-center rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none"
            )}
          >
            <XIcon className="size-4" />
            <span className="sr-only">Close</span>
          </DrawerPrimitive.Close>
        </div>
      </DrawerPrimitive.Content>
    </DrawerPortal>
  )
}

function DrawerHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-header"
      className={cn(
        "flex flex-col gap-0.5 p-4 group-data-[vaul-drawer-direction=bottom]/drawer-content:text-center group-data-[vaul-drawer-direction=top]/drawer-content:text-center md:gap-1.5 md:text-left",
        "group-data-[vaul-drawer-direction=right]/drawer-content:pr-12 group-data-[vaul-drawer-direction=left]/drawer-content:pr-12",
        className
      )}
      {...props}
    />
  )
}

function DrawerFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-footer"
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...props}
    />
  )
}

function DrawerTitle({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Title>) {
  return (
    <DrawerPrimitive.Title
      data-slot="drawer-title"
      className={cn("text-foreground font-semibold", className)}
      {...props}
    />
  )
}

function DrawerDescription({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Description>) {
  return (
    <DrawerPrimitive.Description
      data-slot="drawer-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
}
