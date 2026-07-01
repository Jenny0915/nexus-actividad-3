import { getAuthenticatedDatabaseUser } from "@/lib/data/auth-user";
import { getLocale } from "@/lib/i18n/get-locale";
import { getTranslations } from "@/lib/i18n/translations";

interface AuthMenuProps {
  loginClassName?: string;
  containerClassName?: string;
  userClassName?: string;
  logoutClassName?: string;
}

function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export default async function AuthMenu({
  loginClassName,
  containerClassName,
  userClassName,
  logoutClassName,
}: AuthMenuProps) {
  const [user, locale] = await Promise.all([
    getAuthenticatedDatabaseUser(),
    getLocale(),
  ]);

  const dictionary = getTranslations(locale);

  if (!user) {
    return (
      <a href="/auth/login" className={loginClassName}>
        {dictionary.common.login}
      </a>
    );
  }

  return (
    <div className={containerClassName}>
      <div className={userClassName}>
        <span className="auth-user__avatar">
          {getInitials(user.first_name, user.last_name)}
        </span>

        <span className="auth-user__information">
          <small>{dictionary.common.signedIn}</small>
          <strong>{user.first_name}</strong>
        </span>
      </div>

      <a href="/auth/logout" className={logoutClassName}>
        {dictionary.common.logout}
      </a>
    </div>
  );
}
