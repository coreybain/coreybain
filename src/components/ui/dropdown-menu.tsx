"use client";

import * as React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

type DropdownMenuProps = React.PropsWithChildren<{
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  modal?: boolean;
}>;

type DropdownMenuTriggerProps = React.PropsWithChildren<{
  asChild?: boolean;
  disabled?: boolean;
}>;

type DropdownMenuContentProps = React.PropsWithChildren<{
  align?: "start" | "center" | "end";
  className?: string;
  side?: "top" | "right" | "bottom" | "left";
  sideOffset?: number;
}>;

type DropdownMenuItemProps = React.PropsWithChildren<{
  className?: string;
  disabled?: boolean;
  onSelect?: (event: Event) => void;
}>;

type DropdownMenuSeparatorProps = {
  className?: string;
};

const RadixDropdownMenuRoot =
  DropdownMenuPrimitive.Root as unknown as React.ElementType;
const RadixDropdownMenuTrigger =
  DropdownMenuPrimitive.Trigger as unknown as React.ElementType;
const RadixDropdownMenuPortal =
  DropdownMenuPrimitive.Portal as unknown as React.ElementType;
const RadixDropdownMenuContent =
  DropdownMenuPrimitive.Content as unknown as React.ElementType;
const RadixDropdownMenuItem =
  DropdownMenuPrimitive.Item as unknown as React.ElementType;
const RadixDropdownMenuSeparator =
  DropdownMenuPrimitive.Separator as unknown as React.ElementType;

function DropdownMenu(props: DropdownMenuProps) {
  return React.createElement(RadixDropdownMenuRoot, props);
}

const DropdownMenuTrigger = React.forwardRef<any, DropdownMenuTriggerProps>(
  ({ ...props }, ref) =>
    React.createElement(RadixDropdownMenuTrigger, { ...props, ref })
);
DropdownMenuTrigger.displayName = DropdownMenuPrimitive.Trigger.displayName;

const DropdownMenuContent = React.forwardRef<HTMLDivElement, DropdownMenuContentProps>(
  ({ className, sideOffset = 8, ...props }, ref) => (
    React.createElement(
      RadixDropdownMenuPortal,
      null,
      React.createElement(RadixDropdownMenuContent, {
        ...props,
        className: cn(
          "z-50 min-w-44 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 text-slate-950 shadow-xl shadow-slate-950/10 outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-50",
          className,
        ),
        ref,
        sideOffset,
      })
    )
  )
);
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName;

const DropdownMenuItem = React.forwardRef<HTMLDivElement, DropdownMenuItemProps>(
  ({ className, ...props }, ref) => (
    React.createElement(RadixDropdownMenuItem, {
      ...props,
      className: cn(
        "relative flex cursor-default select-none items-center gap-2 rounded-xl px-3 py-2 text-sm outline-none transition-colors focus:bg-slate-100 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 dark:focus:bg-slate-800",
        className,
      ),
      ref,
    })
  )
);
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName;

const DropdownMenuSeparator = React.forwardRef<
  HTMLDivElement,
  DropdownMenuSeparatorProps
>(({ className, ...props }, ref) => (
  React.createElement(RadixDropdownMenuSeparator, {
    ...props,
    className: cn("my-1 h-px bg-slate-200 dark:bg-slate-800", className),
    ref,
  })
));
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName;

export {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
};
