import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const userId = Number(id);

    if (!Number.isInteger(userId) || userId <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "El identificador del usuario debe ser un número entero válido.",
        },
        { status: 400 }
      );
    }

    const userResult = await db.query(
      `
        SELECT
          id,
          first_name,
          last_name,
          email
        FROM users
        WHERE id = $1
      `,
      [userId]
    );

    if (userResult.rowCount === 0) {
      return NextResponse.json(
        {
          success: false,
          message: `No se encontró un usuario con el identificador ${userId}.`,
        },
        { status: 404 }
      );
    }

    const purchasesResult = await db.query(
      `
        SELECT
          pu.id,
          pu.status,
          pu.total_amount,
          pu.purchased_at,
          pu.created_at,

          COALESCE(
            JSON_AGG(
              JSON_BUILD_OBJECT(
                'id', pi.id,
                'quantity', pi.quantity,
                'unit_price', pi.unit_price,
                'subtotal', pi.subtotal,
                'product_type',
                  CASE
                    WHEN pi.book_id IS NOT NULL THEN 'book'
                    WHEN pi.magazine_id IS NOT NULL THEN 'magazine'
                  END,
                'product_id',
                  COALESCE(pi.book_id, pi.magazine_id),
                'title',
                  COALESCE(b.title, m.title)
              )
              ORDER BY pi.id
            ) FILTER (WHERE pi.id IS NOT NULL),
            '[]'
          ) AS items

        FROM purchases pu

        LEFT JOIN purchase_items pi
          ON pi.purchase_id = pu.id

        LEFT JOIN books b
          ON b.id = pi.book_id

        LEFT JOIN magazines m
          ON m.id = pi.magazine_id

        WHERE pu.user_id = $1

        GROUP BY pu.id

        ORDER BY pu.purchased_at DESC
      `,
      [userId]
    );

    return NextResponse.json(
      {
        success: true,
        user: userResult.rows[0],
        count: purchasesResult.rowCount,
        data: purchasesResult.rows,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al consultar las compras del usuario:", error);

    return NextResponse.json(
      {
        success: false,
        message: "No fue posible consultar las compras del usuario.",
      },
      { status: 500 }
    );
  }
}