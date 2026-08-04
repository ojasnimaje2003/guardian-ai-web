"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { useAppState } from "@/lib/app-state";
import { ScreenContainer } from "@/components/design-system/screen-container";
import { TopAppBar } from "@/components/design-system/top-app-bar";
import { SectionHeader } from "@/components/design-system/section-header";
import { Caption } from "@/components/design-system/typography";
import { SettingsRow } from "@/components/design-system/settings-row";
import { PermissionStatusRow } from "@/components/design-system/permission-status-row";
import { Toast } from "@/components/design-system/toast";
import { ListRowSkeleton } from "@/components/design-system/loading";

/**
 * Settings — docs/13 Screen 10. Emergency Contact and Permissions
 * sections are real, reflecting the same simulated state Home and
 * onboarding read/write. Accessibility (font size/contrast/read-aloud)
 * is a docs/12 Should-Have, not Must-Have, and isn't built this
 * milestone — not in scope per the current priority list.
 */
export default function SettingsPage() {
  const router = useRouter();
  const { isHydrated, emergencyContact, phoneState, accessibilityService } =
    useAppState();

  return (
    <ScreenContainer>
      <TopAppBar title="Settings" onBack={() => router.push("/home")} />

      <div className="gap-xl py-lg flex flex-col">
        <div className="gap-sm flex flex-col">
          <SectionHeader>Emergency Contact</SectionHeader>
          {!isHydrated ? (
            <ListRowSkeleton />
          ) : (
            <SettingsRow
              label={emergencyContact ? emergencyContact.name : "Not set"}
              value={emergencyContact?.phoneNumber}
              onClick={() => router.push("/onboarding/contact")}
            />
          )}
        </div>

        <div className="gap-sm flex flex-col">
          <SectionHeader>Permissions</SectionHeader>
          {!isHydrated ? (
            <>
              <ListRowSkeleton />
              <ListRowSkeleton />
            </>
          ) : (
            <>
              <PermissionStatusRow
                label="Phone State"
                description="Know when you're on a call."
                status={phoneState === "granted" ? "granted" : "not-granted"}
                onFix={() => router.push("/onboarding/phone-state")}
              />
              <PermissionStatusRow
                label="Accessibility Service"
                description="Notice if a screen-sharing app opens during a call."
                status={
                  accessibilityService === "granted" ? "granted" : "not-granted"
                }
                onFix={() =>
                  router.push("/onboarding/accessibility?from=settings")
                }
              />
            </>
          )}
        </div>

        <div className="gap-sm flex flex-col">
          <SectionHeader>About & Privacy</SectionHeader>
          <Caption>
            Guardian AI currently watches for one pattern — a screen-sharing app
            opening during a call. It cannot see your screen or hear your calls.
          </Caption>
        </div>
      </div>

      <Suspense fallback={null}>
        <UpdatedToast />
      </Suspense>
    </ScreenContainer>
  );
}

/** Shows the "Emergency contact updated" snackbar after an edit-mode save. */
function UpdatedToast() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (searchParams.get("updated") === "1") {
      setOpen(true);
      router.replace("/settings");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Toast
      open={open}
      message="Emergency contact updated"
      onOpenChange={setOpen}
    />
  );
}
