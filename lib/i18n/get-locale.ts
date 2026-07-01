import { cookies } from "next/headers";

import {
  defaultLocale,
  isSupportedLocale,
  localeCookieName,
  type Locale,
} from "@/lib/i18n/translations";

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const storedLocale = cookieStore.get(localeCookieName)?.value;

  if (storedLocale && isSupportedLocale(storedLocale)) {
    return storedLocale;
  }

  return defaultLocale;
}
