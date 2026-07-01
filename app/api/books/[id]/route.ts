import { NextRequest, NextResponse } from "next/server";

import { getBookById } from "@/lib/data/books";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  context: RouteContext,
) {
  try {
    const { id } = await context.params;
    const book = await getBookById(id);

    if (!book) {
      return NextResponse.json(
        {
          success: false,
          message: `No se encontró un libro activo con el identificador ${id}.`,
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: book,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error al consultar el libro:", error);

    return NextResponse.json(
      {
        success: false,
        message: "No fue posible consultar la información del libro.",
      },
      { status: 500 },
    );
  }
}
