import { db } from "@/lib/db";

export interface NexusUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
}

export async function getUsers(): Promise<NexusUser[]> {
  const query = `
    SELECT
      id,
      first_name,
      last_name,
      email,
      role
    FROM users
    ORDER BY first_name ASC, last_name ASC
  `;

  try {
    const result = await db.query<NexusUser>(query);

    return result.rows;
  } catch (error) {
    console.error("Error al consultar los usuarios:", error);

    throw new Error("No fue posible consultar los usuarios.");
  }
}