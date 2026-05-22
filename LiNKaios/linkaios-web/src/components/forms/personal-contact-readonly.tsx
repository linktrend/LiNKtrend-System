import {
  formatPersonalAddressNatural,
  formatPersonalPhoneDisplay,
  type PersonalAddressParts,
} from "@/lib/personal-contact-display";
import { FIELD, PROFILE } from "@/lib/ui-standards";

export function PersonalPhoneReadOnly(props: { countryCode: string; phoneNumber: string }) {
  return (
    <div className={PROFILE.readonlyField}>
      <p className={`${FIELD.label} ${PROFILE.readonlyLabel}`}>Phone</p>
      <p className="text-sm leading-relaxed text-zinc-900 dark:text-zinc-100">
        {formatPersonalPhoneDisplay(props.countryCode, props.phoneNumber)}
      </p>
    </div>
  );
}

export function PersonalAddressReadOnly(props: PersonalAddressParts) {
  const lines = formatPersonalAddressNatural(props);

  return (
    <div className={PROFILE.readonlyField}>
      <p className={`${FIELD.label} ${PROFILE.readonlyLabel}`}>Address</p>
      {lines.length > 0 ? (
        <div className="space-y-0.5 text-sm leading-relaxed text-zinc-900 dark:text-zinc-100">
          {lines.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      ) : (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">—</p>
      )}
    </div>
  );
}
