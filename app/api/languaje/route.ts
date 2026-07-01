import { NextRequest, NextResponse } from "next/server";

import {
  isSupportedLocale,
  localeCookieName,
} from "@/lib/i18n/translations";

interface LanguageRequestBody {
  locale?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as LanguageRequestBody;
    const locale = body.locale?.trim().toLowerCase();

    if (!locale || !isSupportedLocale(locale)) {
      return NextResponse.json(
        {
          success: false,
          message: "El idioma seleccionado no es válido.",
        },
        { status: 400 },
      );
    }

    const response = NextResponse.json({
      success: true,
      locale,
    });

    response.cookies.set({
      name: localeCookieName,
      value: locale,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });

    return response;
  } catch (error) {
    console.error("Error al guardar el idioma:", error);

    return NextResponse.json(
      {
        success: false,
        message: "No fue posible guardar el idioma seleccionado.",
      },
      { status: 500 },
    );
  }
}
