import { auth0 } from "@/lib/auth0";
import { db } from "@/lib/db";

export interface AuthenticatedDatabaseUser {
  id: number;
  auth0_id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: "customer" | "admin";
  created_at: Date | string;
  updated_at: Date | string;
}

interface Auth0UserInformation {
  name?: string | null;
  given_name?: string | null;
  family_name?: string | null;
  nickname?: string | null;
  email?: string | null;
}

function capitalizeName(value: string): string {
  const normalizedValue = value
    .trim()
    .replace(/[._-]+/g, " ")
    .replace(/\s+/g, " ");

  return normalizedValue
    .split(" ")
    .filter(Boolean)
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1).toLowerCase(),
    )
    .join(" ");
}

function isUsableName(value?: string | null): value is string {
  if (!value) {
    return false;
  }

  const normalizedValue = value.trim();

  return (
    normalizedValue.length > 0 &&
    !normalizedValue.includes("@")
  );
}

function getNameParts(user: Auth0UserInformation) {
  const emailUsername =
    user.email?.split("@")[0]?.trim() || "Usuario";

  const usableCompleteName = isUsableName(user.name)
    ? user.name.trim()
    : isUsableName(user.nickname)
      ? user.nickname.trim()
      : emailUsername;

  const nameParts = usableCompleteName
    .split(/\s+/)
    .filter(Boolean);

  const firstName = capitalizeName(
    isUsableName(user.given_name)
      ? user.given_name
      : nameParts[0] || "Usuario",
  );

  const lastNameCandidate = isUsableName(user.family_name)
    ? user.family_name
    : nameParts.slice(1).join(" ");

  const lastName = capitalizeName(
    lastNameCandidate || "Nexus",
  );

  return {
    firstName,
    lastName,
  };
}

export async function getAuthenticatedDatabaseUser(): Promise<
  AuthenticatedDatabaseUser | null
> {
  const session = await auth0.getSession();

  if (!session?.user) {
    return null;
  }

  const auth0Id = session.user.sub;
  const email = session.user.email?.trim().toLowerCase();

  if (!auth0Id || !email) {
    throw new Error(
      "La cuenta autenticada no contiene identificador o correo electrónico.",
    );
  }

  const { firstName, lastName } = getNameParts(
    session.user,
  );

  const userByAuth0Result =
    await db.query<AuthenticatedDatabaseUser>(
      `
        SELECT
          id,
          auth0_id,
          first_name,
          last_name,
          email,
          role,
          created_at,
          updated_at
        FROM users
        WHERE auth0_id = $1
        LIMIT 1
      `,
      [auth0Id],
    );

  if ((userByAuth0Result.rowCount ?? 0) > 0) {
    const updatedUserResult =
      await db.query<AuthenticatedDatabaseUser>(
        `
          UPDATE users
          SET
            first_name = $2,
            last_name = $3,
            email = $4,
            updated_at = CURRENT_TIMESTAMP
          WHERE auth0_id = $1
          RETURNING
            id,
            auth0_id,
            first_name,
            last_name,
            email,
            role,
            created_at,
            updated_at
        `,
        [auth0Id, firstName, lastName, email],
      );

    return updatedUserResult.rows[0];
  }

  const userByEmailResult =
    await db.query<AuthenticatedDatabaseUser>(
      `
        SELECT
          id,
          auth0_id,
          first_name,
          last_name,
          email,
          role,
          created_at,
          updated_at
        FROM users
        WHERE LOWER(email) = LOWER($1)
        LIMIT 1
      `,
      [email],
    );

  if ((userByEmailResult.rowCount ?? 0) > 0) {
    const existingUser = userByEmailResult.rows[0];

    if (
      existingUser.auth0_id &&
      existingUser.auth0_id !== auth0Id
    ) {
      throw new Error(
        "El correo autenticado ya está vinculado con otra cuenta de Auth0.",
      );
    }

    const linkedUserResult =
      await db.query<AuthenticatedDatabaseUser>(
        `
          UPDATE users
          SET
            auth0_id = $2,
            first_name = $3,
            last_name = $4,
            email = $5,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = $1
          RETURNING
            id,
            auth0_id,
            first_name,
            last_name,
            email,
            role,
            created_at,
            updated_at
        `,
        [
          existingUser.id,
          auth0Id,
          firstName,
          lastName,
          email,
        ],
      );

    return linkedUserResult.rows[0];
  }

  const insertedUserResult =
    await db.query<AuthenticatedDatabaseUser>(
      `
        INSERT INTO users (
          auth0_id,
          first_name,
          last_name,
          email,
          role
        )
        VALUES ($1, $2, $3, $4, 'customer')
        RETURNING
          id,
          auth0_id,
          first_name,
          last_name,
          email,
          role,
          created_at,
          updated_at
      `,
      [auth0Id, firstName, lastName, email],
    );

  return insertedUserResult.rows[0];
}