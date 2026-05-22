import { SettingsLayoutChrome } from "@/components/settings-layout-chrome";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return <SettingsLayoutChrome>{children}</SettingsLayoutChrome>;
}
