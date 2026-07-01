import { NextResponse } from "next/server";

import { getAuthenticatedDatabaseUser } from "@/lib/data/auth-user";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getAuthenticatedDatabaseUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          authenticated: false,
          message: "No existe una sesión autenticada.",
        },
        { status: 401 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        authenticated: true,
        message:
          "El usuario de Auth0 está vinculado correctamente con PostgreSQL.",
        data: user,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(
      "Error al sincronizar el usuario autenticado:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        authenticated: false,
        message:
          error instanceof Error
            ? error.message
            : "No fue posible sincronizar el usuario.",
      },
      { status: 500 },
    );
  }
}