"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  IdCard,
  Loader2,
  Mail,
  Trash2,
  User,
  XCircle,
} from "lucide-react";

import { OperatorProfileHero } from "@/components/settings/profile/operator-profile-hero";
import { OperatorProfileSectionCard } from "@/components/settings/profile/operator-profile-section-card";
import { OperatorWorkspaceAccessCard } from "@/components/settings/profile/operator-workspace-access-card";
import {
  FormField,
  FormTextInput,
  PersonalAddressFields,
  PersonalAddressReadOnly,
  PersonalNameFields,
  PersonalPhoneFields,
  PersonalPhoneReadOnly,
} from "@/components/forms";

import {
  emptyEducationEntry,
  emptyWorkEntry,
  operatorFullName,
  operatorInitials,
  readOperatorProfile,
  writeOperatorProfile,
  type OperatorEducationEntry,
  type OperatorProfile,
  type OperatorWorkEntry,
} from "@/lib/operator-profile";
import type { OperatorAccessScope } from "@/lib/operator-access-scope";
import { formatPersonalAddressHeroLines } from "@/lib/personal-contact-display";
import { BUTTON, FIELD, PROFILE } from "@/lib/ui-standards";
import { USERNAME_VALIDATION_RULES } from "@/lib/form-validation";

const RESERVED_USERNAMES = new Set(["admin", "linktrend", "operator", "root", "system"]);

type ProfileSectionId = "basic" | "contact" | "about";

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}

function ProfileLabel({ htmlFor, children }: { htmlFor?: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className={`mb-1.5 block ${FIELD.label}`}>
      {children}
    </label>
  );
}

function ReadOnlyField({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={`${PROFILE.readonlyField} ${PROFILE.readonlyFieldItem} ${className ?? ""}`.trim()}>
      <p className={`${FIELD.label} ${PROFILE.readonlyLabel}`}>{label}</p>
      <p className={PROFILE.readonlyValue}>{value.trim() ? value : "—"}</p>
    </div>
  );
}

type OperatorProfilePageProps = {
  email: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  accessScope: OperatorAccessScope;
};

export function OperatorProfilePage({
  email,
  displayName,
  avatarUrl,
  accessScope,
}: OperatorProfilePageProps) {
  const seed = useMemo(() => ({ email, displayName, avatarUrl }), [email, displayName, avatarUrl]);

  const [profile, setProfile] = useState<OperatorProfile | null>(null);
  const [savedUsername, setSavedUsername] = useState("");
  const [editingSection, setEditingSection] = useState<ProfileSectionId | null>(null);
  const [sectionSnapshot, setSectionSnapshot] = useState<OperatorProfile | null>(null);
  const [savingSection, setSavingSection] = useState<ProfileSectionId | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [submittedSection, setSubmittedSection] = useState<ProfileSectionId | null>(null);

  const debouncedUsername = useDebouncedValue(
    editingSection === "basic" ? (profile?.username ?? "") : "",
    400
  );

  useEffect(() => {
    const loaded = readOperatorProfile(seed);
    setProfile(loaded);
    setSavedUsername(loaded.username);
  }, [seed]);

  useEffect(() => {
    if (editingSection !== "basic" || !profile) return;

    if (!debouncedUsername || debouncedUsername === savedUsername) {
      setUsernameAvailable(null);
      setUsernameError(null);
      setCheckingUsername(false);
      return;
    }

    if (debouncedUsername.length < 3) {
      setUsernameAvailable(false);
      setUsernameError("Username must be at least 3 characters.");
      setCheckingUsername(false);
      return;
    }

    if (!/^[a-z0-9_]+$/.test(debouncedUsername)) {
      setUsernameAvailable(false);
      setUsernameError("Use lowercase letters, numbers, and underscores only.");
      setCheckingUsername(false);
      return;
    }

    setCheckingUsername(true);
    const timer = window.setTimeout(() => {
      const taken = RESERVED_USERNAMES.has(debouncedUsername);
      setUsernameAvailable(!taken);
      setUsernameError(taken ? "That username is reserved." : null);
      setCheckingUsername(false);
    }, 200);

    return () => window.clearTimeout(timer);
  }, [debouncedUsername, savedUsername, profile, editingSection]);

  const updateField = useCallback(<K extends keyof OperatorProfile>(key: K, value: OperatorProfile[K]) => {
    setProfile((prev) => (prev ? { ...prev, [key]: value } : prev));
  }, []);

  const updateEducation = useCallback(
    (id: string, field: keyof OperatorEducationEntry, value: string | number | null) => {
      setProfile((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          education: prev.education.map((entry) => (entry.id === id ? { ...entry, [field]: value } : entry)),
        };
      });
    },
    []
  );

  const updateWork = useCallback((id: string, field: keyof OperatorWorkEntry, value: string) => {
    setProfile((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        work_experience: prev.work_experience.map((entry) =>
          entry.id === id ? { ...entry, [field]: value } : entry
        ),
      };
    });
  }, []);

  const handleAvatarUpload = useCallback(
    (file: File) => {
      if (file.size > 512_000) {
        setSaveMessage("Profile picture must be under 512 KB.");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result !== "string") return;
        setProfile((prev) => {
          if (!prev) return prev;
          const next = { ...prev, avatar_url: reader.result as string };
          writeOperatorProfile(next);
          return next;
        });
        setSaveMessage("Profile picture updated.");
      };
      reader.readAsDataURL(file);
    },
    []
  );

  function startEditing(section: ProfileSectionId) {
    if (!profile) return;
    if (editingSection && editingSection !== section && sectionSnapshot) {
      setProfile(sectionSnapshot);
    }
    setSaveMessage(null);
    setSectionSnapshot(structuredClone(profile));
    setEditingSection(section);
  }

  function cancelEditing() {
    if (sectionSnapshot) setProfile(sectionSnapshot);
    setEditingSection(null);
    setSectionSnapshot(null);
    setUsernameError(null);
    setUsernameAvailable(null);
  }

  async function saveSection(section: ProfileSectionId) {
    if (!profile) return;

    if (section === "basic") {
      if (usernameError || usernameAvailable === false) {
        setSubmittedSection("basic");
        return;
      }
      if (!profile.first_name.trim() || !profile.last_name.trim()) {
        setSubmittedSection("basic");
        setSaveMessage("First and last name are required.");
        return;
      }
    }

    setSubmittedSection(null);
    setSavingSection(section);
    setSaveMessage(null);
    setSubmittedSection(null);
    await new Promise((resolve) => window.setTimeout(resolve, 300));
    writeOperatorProfile(profile);
    if (section === "basic") setSavedUsername(profile.username);
    setSavingSection(null);
    setEditingSection(null);
    setSectionSnapshot(null);
    setSaveMessage(`${sectionTitle(section)} saved.`);
  }

  function sectionTitle(section: ProfileSectionId): string {
    if (section === "basic") return "Basic Information";
    if (section === "contact") return "Contact Details";
    return "About You";
  }

  if (!profile) {
    return (
      <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading profile…
      </div>
    );
  }

  const fullName = operatorFullName(profile);
  const phoneDisplay =
    profile.phone_number.trim().length > 0
      ? `${profile.phone_country_code} ${profile.phone_number}`.trim()
      : "No phone on file";
  const usernameDisplay = profile.username ? `@${profile.username}` : "Username pending";
  const locationHeroLines = formatPersonalAddressHeroLines({
    streetAddress1: profile.personal_street_address_1,
    streetAddress2: profile.personal_street_address_2,
    city: profile.personal_city,
    state: profile.personal_state,
    postalCode: profile.personal_postal_code,
    country: profile.personal_country,
  });
  const locationLabel =
    locationHeroLines.length > 0 ? locationHeroLines.join("\n") : "Location not set";
  const timezoneLabel = Intl.DateTimeFormat().resolvedOptions().timeZone.replace(/_/g, " ");

  return (
    <div className="space-y-6">
      {saveMessage ? (
        <div
          role="status"
          className={`rounded-xl px-4 py-3 text-sm ${
            saveMessage.includes("saved")
              ? "bg-emerald-50 text-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-100"
              : "bg-amber-50 text-amber-900 dark:bg-amber-950/30 dark:text-amber-100"
          }`}
        >
          {saveMessage}
        </div>
      ) : null}

      <OperatorProfileHero
        fullName={fullName}
        username={usernameDisplay}
        avatarUrl={profile.avatar_url}
        initials={operatorInitials(profile)}
        email={profile.email}
        phoneDisplay={phoneDisplay}
        timezoneLabel={timezoneLabel}
        locationLabel={locationLabel}
        statusLabel="Online"
        accessScope={accessScope}
        onAvatarUpload={handleAvatarUpload}
      />

      <div className="space-y-5">
        <OperatorProfileSectionCard
          icon={User}
          title="Basic Information"
          description="These details appear on your profile and throughout LiNKaios."
          editing={editingSection === "basic"}
          saving={savingSection === "basic"}
          onEdit={() => startEditing("basic")}
          onSave={() => void saveSection("basic")}
          onCancel={cancelEditing}
          viewContent={
            <div className={PROFILE.viewGrid4Col}>
              <ReadOnlyField
                className="col-start-1 row-start-1"
                label="Title"
                value={profile.personal_title}
              />
              <ReadOnlyField
                className="col-start-1 row-start-2"
                label="Display Name"
                value={profile.display_name}
              />
              <div className={PROFILE.viewGrid4ColBlock}>
                <ReadOnlyField label="First Name" value={profile.first_name} />
                <ReadOnlyField label="Middle Name" value={profile.middle_name} />
                <ReadOnlyField label="Last Name" value={profile.last_name} />
                <div aria-hidden="true" />
                <ReadOnlyField label="Username" value={profile.username ? `@${profile.username}` : ""} />
                <div aria-hidden="true" />
              </div>
            </div>
          }
          editContent={
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <FormField id="display_name" label="Display Name">
                  {({ id, describedBy }) => (
                    <FormTextInput
                      id={id}
                      describedBy={describedBy}
                      fullWidth={false}
                      value={profile.display_name}
                      onChange={(display_name) => updateField("display_name", display_name)}
                      placeholder="Display Name"
                    />
                  )}
                </FormField>
                <FormField
                  id="username"
                  label="Username"
                  required
                  value={profile.username}
                  validationRules={USERNAME_VALIDATION_RULES}
                  showValidationHints={false}
                  error={usernameError}
                >
                  {({ id, describedBy, invalid }) => (
                    <div className="relative max-w-xl">
                      <FormTextInput
                        id={id}
                        describedBy={describedBy}
                        invalid={invalid || usernameAvailable === false}
                        fullWidth={false}
                        value={profile.username}
                        onChange={(username) => updateField("username", username.toLowerCase())}
                        placeholder="johndoe"
                      />
                      <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                        {checkingUsername ? (
                          <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
                        ) : usernameAvailable === true ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        ) : usernameAvailable === false ? (
                          <XCircle className="h-4 w-4 text-red-500" />
                        ) : null}
                      </div>
                    </div>
                  )}
                </FormField>
              </div>
              <PersonalNameFields
                idPrefix="profile"
                submitted={submittedSection === "basic"}
                value={{
                  nameTitle: profile.personal_title,
                  firstName: profile.first_name,
                  middleName: profile.middle_name,
                  lastName: profile.last_name,
                }}
                onChange={(patch) => {
                  if (patch.nameTitle !== undefined) updateField("personal_title", patch.nameTitle);
                  if (patch.firstName !== undefined) updateField("first_name", patch.firstName);
                  if (patch.middleName !== undefined) updateField("middle_name", patch.middleName);
                  if (patch.lastName !== undefined) updateField("last_name", patch.lastName);
                }}
              />
            </>
          }
        />

        <OperatorProfileSectionCard
          icon={Mail}
          title="Contact Details"
          description="Keep this information current so teammates can reach you."
          editing={editingSection === "contact"}
          saving={savingSection === "contact"}
          onEdit={() => startEditing("contact")}
          onSave={() => void saveSection("contact")}
          onCancel={cancelEditing}
          viewContent={
            <div className="space-y-6">
              <PersonalPhoneReadOnly
                countryCode={profile.phone_country_code}
                phoneNumber={profile.phone_number}
              />
              <PersonalAddressReadOnly
                streetAddress1={profile.personal_street_address_1}
                streetAddress2={profile.personal_street_address_2}
                city={profile.personal_city}
                state={profile.personal_state}
                postalCode={profile.personal_postal_code}
                country={profile.personal_country}
              />
            </div>
          }
          editContent={
            <div className="space-y-4">
              <PersonalPhoneFields
                idPrefix="personal"
                value={{
                  phoneCountryCode: profile.phone_country_code,
                  phoneNumber: profile.phone_number,
                }}
                onChange={(patch) => {
                  if (patch.phoneCountryCode !== undefined) updateField("phone_country_code", patch.phoneCountryCode);
                  if (patch.phoneNumber !== undefined) updateField("phone_number", patch.phoneNumber);
                }}
              />
              <PersonalAddressFields
                idPrefix="personal"
                value={{
                  streetAddress1: profile.personal_street_address_1,
                  streetAddress2: profile.personal_street_address_2,
                  city: profile.personal_city,
                  state: profile.personal_state,
                  postalCode: profile.personal_postal_code,
                  country: profile.personal_country,
                }}
                onChange={(patch) => {
                  if (patch.streetAddress1 !== undefined) updateField("personal_street_address_1", patch.streetAddress1);
                  if (patch.streetAddress2 !== undefined) updateField("personal_street_address_2", patch.streetAddress2);
                  if (patch.city !== undefined) updateField("personal_city", patch.city);
                  if (patch.state !== undefined) updateField("personal_state", patch.state);
                  if (patch.postalCode !== undefined) updateField("personal_postal_code", patch.postalCode);
                  if (patch.country !== undefined) updateField("personal_country", patch.country);
                }}
              />
            </div>
          }
        />

        <OperatorProfileSectionCard
          icon={IdCard}
          title="About You"
          description="Share your background, education, and work history."
          editing={editingSection === "about"}
          saving={savingSection === "about"}
          onEdit={() => startEditing("about")}
          onSave={() => void saveSection("about")}
          onCancel={cancelEditing}
          viewContent={
            <div className="space-y-8">
              <div>
                <p className={`${FIELD.label} ${PROFILE.readonlyLabel}`}>Bio</p>
                <p className="mt-2 text-sm leading-relaxed text-zinc-800 dark:text-zinc-200">
                  {profile.bio.trim() || "—"}
                </p>
              </div>
              <div>
                <p className={`${FIELD.label} ${PROFILE.readonlyLabel}`}>Education</p>
                <div className={`${PROFILE.sectionLabelGap} space-y-4`}>
                  {profile.education.filter((e) => e.institution.trim()).length > 0 ? (
                    profile.education
                      .filter((e) => e.institution.trim())
                      .map((entry) => (
                        <div key={entry.id} className="space-y-1">
                          <p className="font-medium text-zinc-900 dark:text-zinc-100">{entry.institution}</p>
                          <p className="text-sm text-zinc-600 dark:text-zinc-400">
                            {[entry.degree, entry.field].filter(Boolean).join(" · ") || "—"}
                          </p>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            {[entry.start_year, entry.end_year].filter(Boolean).join(" – ") || "Dates not provided"}
                          </p>
                        </div>
                      ))
                  ) : (
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">No education listed.</p>
                  )}
                </div>
              </div>
              <div>
                <p className={`${FIELD.label} ${PROFILE.readonlyLabel}`}>Work experience</p>
                <div className={`${PROFILE.sectionLabelGap} space-y-4`}>
                  {profile.work_experience.filter((e) => e.company.trim() || e.position.trim()).length > 0 ? (
                    profile.work_experience
                      .filter((e) => e.company.trim() || e.position.trim())
                      .map((entry) => (
                        <div key={entry.id} className="space-y-1">
                          <p className="font-medium text-zinc-900 dark:text-zinc-100">
                            {entry.position || "—"}
                            {entry.company ? (
                              <span className="font-normal text-zinc-500 dark:text-zinc-400"> · {entry.company}</span>
                            ) : null}
                          </p>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            {[entry.start_date, entry.end_date].filter(Boolean).join(" – ") || "Dates not provided"}
                          </p>
                          {entry.description ? (
                            <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{entry.description}</p>
                          ) : null}
                        </div>
                      ))
                  ) : (
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">No work experience listed.</p>
                  )}
                </div>
              </div>
            </div>
          }
          editContent={
            <div className="space-y-8">
              <div>
                <ProfileLabel htmlFor="bio">Bio</ProfileLabel>
                <textarea
                  id="bio"
                  rows={4}
                  className={FIELD.controlFull}
                  value={profile.bio}
                  onChange={(e) => updateField("bio", e.target.value)}
                  placeholder="Tell us about yourself"
                />
              </div>
              <div className="space-y-4 border-t border-zinc-200 pt-6 dark:border-zinc-800">
                <h4 className="font-medium text-zinc-900 dark:text-zinc-100">Education</h4>
                <div className="space-y-3">
                  {profile.education.map((entry, index) => (
                    <div key={entry.id} className="space-y-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-700">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Entry {index + 1}</p>
                        {profile.education.length > 1 ? (
                          <button
                            type="button"
                            aria-label={`Remove education entry ${index + 1}`}
                            className="rounded-lg p-2 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-800 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                            onClick={() =>
                              setProfile((prev) =>
                                prev
                                  ? { ...prev, education: prev.education.filter((item) => item.id !== entry.id) }
                                  : prev
                              )
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        ) : null}
                      </div>
                      <div className="grid gap-3 md:grid-cols-2">
                        <div>
                          <ProfileLabel>Institution</ProfileLabel>
                          <input
                            className={FIELD.control}
                            value={entry.institution}
                            onChange={(e) => updateEducation(entry.id, "institution", e.target.value)}
                          />
                        </div>
                        <div>
                          <ProfileLabel>Degree</ProfileLabel>
                          <input
                            className={FIELD.control}
                            value={entry.degree}
                            onChange={(e) => updateEducation(entry.id, "degree", e.target.value)}
                          />
                        </div>
                        <div>
                          <ProfileLabel>Field</ProfileLabel>
                          <input
                            className={FIELD.control}
                            value={entry.field}
                            onChange={(e) => updateEducation(entry.id, "field", e.target.value)}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <ProfileLabel>Start Year</ProfileLabel>
                            <input
                              type="number"
                              min={1900}
                              max={2100}
                              className={FIELD.control}
                              value={entry.start_year ?? ""}
                              onChange={(e) =>
                                updateEducation(
                                  entry.id,
                                  "start_year",
                                  e.target.value ? Number(e.target.value) : null
                                )
                              }
                            />
                          </div>
                          <div>
                            <ProfileLabel>End Year</ProfileLabel>
                            <input
                              type="number"
                              min={1900}
                              max={2100}
                              className={FIELD.control}
                              value={entry.end_year ?? ""}
                              onChange={(e) =>
                                updateEducation(entry.id, "end_year", e.target.value ? Number(e.target.value) : null)
                              }
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    aria-label="Add education entry"
                    className={BUTTON.ghostTight}
                    onClick={() =>
                      setProfile((prev) =>
                        prev ? { ...prev, education: [...prev.education, emptyEducationEntry()] } : prev
                      )
                    }
                  >
                    + Add
                  </button>
                </div>
              </div>
              <div className="space-y-4 border-t border-zinc-200 pt-6 dark:border-zinc-800">
                <h4 className="font-medium text-zinc-900 dark:text-zinc-100">Work Experience</h4>
                <div className="space-y-3">
                  {profile.work_experience.map((entry, index) => (
                    <div key={entry.id} className="space-y-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-700">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Position {index + 1}</p>
                        {profile.work_experience.length > 1 ? (
                          <button
                            type="button"
                            aria-label={`Remove work entry ${index + 1}`}
                            className="rounded-lg p-2 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-800 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                            onClick={() =>
                              setProfile((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      work_experience: prev.work_experience.filter((item) => item.id !== entry.id),
                                    }
                                  : prev
                              )
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        ) : null}
                      </div>
                      <div className="grid gap-3 md:grid-cols-2">
                        <div>
                          <ProfileLabel>Company</ProfileLabel>
                          <input
                            className={FIELD.control}
                            value={entry.company}
                            onChange={(e) => updateWork(entry.id, "company", e.target.value)}
                          />
                        </div>
                        <div>
                          <ProfileLabel>Position</ProfileLabel>
                          <input
                            className={FIELD.control}
                            value={entry.position}
                            onChange={(e) => updateWork(entry.id, "position", e.target.value)}
                          />
                        </div>
                        <div>
                          <ProfileLabel>Start Date</ProfileLabel>
                          <input
                            className={FIELD.control}
                            placeholder="Jan 2020"
                            value={entry.start_date}
                            onChange={(e) => updateWork(entry.id, "start_date", e.target.value)}
                          />
                        </div>
                        <div>
                          <ProfileLabel>End Date</ProfileLabel>
                          <input
                            className={FIELD.control}
                            placeholder="Present"
                            value={entry.end_date}
                            onChange={(e) => updateWork(entry.id, "end_date", e.target.value)}
                          />
                        </div>
                        <div className="md:col-span-2">
                          <ProfileLabel>Description</ProfileLabel>
                          <textarea
                            className={FIELD.controlFull}
                            rows={3}
                            value={entry.description}
                            onChange={(e) => updateWork(entry.id, "description", e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    aria-label="Add work role"
                    className={BUTTON.ghostTight}
                    onClick={() =>
                      setProfile((prev) =>
                        prev ? { ...prev, work_experience: [...prev.work_experience, emptyWorkEntry()] } : prev
                      )
                    }
                  >
                    + Add
                  </button>
                </div>
              </div>
            </div>
          }
        />

        <OperatorWorkspaceAccessCard accessScope={accessScope} />
      </div>
    </div>
  );
}
