"use client";

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";

import { cn } from "@/lib/utils";
import { Button } from "./button";

/**
 * ConfirmDialog — docs/15 Task 2 "Components → Dialogs": "MD3 Basic
 * Dialog, used exactly once: the 'Remove emergency contact?'
 * confirmation ... Two actions (Cancel — Text button; Remove — Filled
 * button in `concern` coloring, since this is a meaningful, if
 * reversible, action worth a moment's pause)."
 *
 * 16dp radius (`--radius-dialog`) and Level 3 elevation (a visible
 * shadow — "the one place a visible shadow is appropriate, since a
 * dialog needs to read as clearly above the page," docs/15 Task 2
 * Elevation) are applied unconditionally. `destructive` maps to the
 * documented `concern`-toned confirm button; omit it for a dialog that
 * isn't a removal/undo-risk confirmation.
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  cancelLabel = "Cancel",
  onConfirm,
  destructive = false,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  destructive?: boolean;
}) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className="bg-foreground/20 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0 fixed inset-0 z-50" />
        <DialogPrimitive.Popup
          className={cn(
            "bg-popover p-lg text-popover-foreground fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-(--radius-dialog) shadow-[0_8px_24px_rgba(28,30,31,0.18)] outline-none",
            "data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 duration-100"
          )}
        >
          <DialogPrimitive.Title className="text-heading font-semibold">
            {title}
          </DialogPrimitive.Title>
          {description && (
            <DialogPrimitive.Description className="mt-sm text-body text-muted-foreground">
              {description}
            </DialogPrimitive.Description>
          )}
          <div className="mt-lg gap-sm flex flex-col-reverse sm:flex-row sm:justify-end">
            <DialogPrimitive.Close render={<Button variant="text" />}>
              {cancelLabel}
            </DialogPrimitive.Close>
            <Button
              variant="filled"
              tone={destructive ? "concern" : "default"}
              onClick={() => {
                onConfirm();
                onOpenChange(false);
              }}
            >
              {confirmLabel}
            </Button>
          </div>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
