"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Contact as ContactIcon } from "lucide-react";

import { useAppState } from "@/lib/app-state";
import { mockEmergencyContact } from "@/data/mock-data";
import { ScreenContainer } from "@/components/design-system/screen-container";
import { TopAppBar } from "@/components/design-system/top-app-bar";
import { StepIndicator } from "@/components/design-system/step-indicator";
import { Heading, Caption } from "@/components/design-system/typography";
import { TextField } from "@/components/design-system/text-field";
import { Button } from "@/components/design-system/button";
import { BottomActionBar } from "@/components/design-system/bottom-action-bar";
import { ConfirmDialog } from "@/components/design-system/confirm-dialog";

const PHONE_PATTERN = /^[6-9]\d{9}$/;

/**
 * Set Emergency Contact: docs/13 Screen 5. "Choose from contacts" opens
 * the native Android contact picker on a real device; a browser has no
 * equivalent, so it's simulated here by filling the form with a sample
 * contact, an honest stand-in for the picker result, not a real
 * device-contacts integration.
 */
export default function SetEmergencyContactPage() {
  const router = useRouter();
  const {
    emergencyContact,
    isHydrated,
    onboardingStep,
    setEmergencyContact,
    setOnboardingStep,
  } = useAppState();
  const isEditMode = onboardingStep === "done";
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);

  // First-time capture (reached via onboarding) persists step progress
  // immediately, per docs/14 §14. Edit mode (reached via Settings, once
  // onboarding is already "done") must never regress that.
  useEffect(() => {
    if (onboardingStep !== "done") setOnboardingStep("contact");
  }, [onboardingStep, setOnboardingStep]);

  // Edit mode pre-fills the current contact (docs/13 Screen 11).
  useEffect(() => {
    if (isHydrated && emergencyContact) {
      setName(emergencyContact.name);
      setPhone(emergencyContact.phoneNumber);
    }
  }, [isHydrated, emergencyContact]);

  const phoneError =
    phoneTouched && phone.length > 0 && !PHONE_PATTERN.test(phone)
      ? "This doesn't look like a valid phone number"
      : undefined;
  const isBlank = name.trim().length === 0 && phone.length === 0;
  // docs/13 Screen 5/11 edge case: "Editing to remove the contact
  // entirely (leaving the field blank and saving) is allowed and shows
  // a distinct confirmation": blank fields are a valid Save target in
  // edit mode specifically, not a validation failure.
  const canSave =
    isEditMode && isBlank
      ? true
      : name.trim().length > 0 && PHONE_PATTERN.test(phone);

  function chooseFromContacts() {
    setName(mockEmergencyContact.name);
    setPhone(mockEmergencyContact.phoneNumber);
    setPhoneTouched(true);
  }

  function removeContact() {
    setEmergencyContact(null);
    router.push("/settings");
  }

  function save() {
    if (!canSave) return;
    if (isEditMode && isBlank) {
      setRemoveDialogOpen(true);
      return;
    }
    setEmergencyContact({
      id: emergencyContact?.id ?? crypto.randomUUID(),
      name: name.trim(),
      phoneNumber: phone,
      createdAt: emergencyContact?.createdAt ?? new Date().toISOString(),
    });
    if (isEditMode) {
      router.push("/settings?updated=1");
    } else {
      setOnboardingStep("complete");
      router.push("/onboarding/complete");
    }
  }

  return (
    <ScreenContainer>
      {isEditMode && (
        <TopAppBar
          title="Emergency Contact"
          onBack={() => router.push("/settings")}
        />
      )}
      <div className="gap-lg py-lg flex flex-col">
        {!isEditMode && <StepIndicator current={4} total={5} />}
        {/* h1 in first-time onboarding (no TopAppBar present, so this is
            the page's only top-level heading); h2 in edit mode, since
            TopAppBar above already renders the page's h1 ("Emergency
            Contact"), never both, to avoid two competing h1s. */}
        <Heading as={isEditMode ? "h2" : "h1"}>
          Who should we notify if something looks like a scam?
        </Heading>

        <TextField
          label="Name"
          placeholder="e.g., Anjali"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <TextField
          label="Phone number"
          placeholder="e.g., 98765 43210"
          inputMode="numeric"
          value={phone}
          onChange={(e) =>
            setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
          }
          onBlur={() => setPhoneTouched(true)}
          error={phoneError}
        />

        <Button
          variant="filled-tonal"
          onClick={chooseFromContacts}
          className="w-fit"
        >
          <ContactIcon className="size-4" aria-hidden />
          Choose from contacts
        </Button>

        <Caption>
          We&apos;ll send them a short message with your name and the time.
          Nothing about your accounts or money.
        </Caption>
      </div>

      <BottomActionBar className="mt-xl">
        <Button variant="filled" onClick={save} disabled={!canSave}>
          Save
        </Button>
      </BottomActionBar>

      <ConfirmDialog
        open={removeDialogOpen}
        onOpenChange={setRemoveDialogOpen}
        title="Remove emergency contact?"
        description="Without an emergency contact, Guardian AI can still warn you, but won't be able to notify anyone else."
        confirmLabel="Remove"
        onConfirm={removeContact}
        destructive
      />
    </ScreenContainer>
  );
}
