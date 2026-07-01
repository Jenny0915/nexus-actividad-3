import { db } from "@/lib/db";

export interface PurchaseUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
}

export type PurchaseProductType = "book" | "magazine";

export interface PurchaseItem {
  id: number;
  quantity: number;
  unit_price: string | number;
  subtotal: string | number;
  product_type: PurchaseProductType;
  product_id: number;
  title: string;
  cover_url: string | null;
}

export interface UserPurchase {
  id: number;
  status: string;
  total_amount: string | number;
  purchased_at: Date | string;
  created_at: Date | string;
  items: PurchaseItem[];
}

export interface UserPurchaseHistory {
  user: PurchaseUser;
  purchases: UserPurchase[];
}

/**
 * Consulta un usuario y todo su historial de compras.
 *
 * Se usa directamente desde Server Components para evitar realizar
 * una petición HTTP interna hacia la propia API de Next.js.
 */
export async function getUserPurchaseHistory(
  userId: number,
): Promise<UserPurchaseHistory | null> {
  try {
    const userResult = await db.query<PurchaseUser>(
      `
        SELECT
          id,
          first_name,
          last_name,
          email
        FROM users
        WHERE id = $1
      `,
      [userId],
    );

    if (userResult.rowCount === 0) {
      return null;
    }

    const purchasesResult = await db.query<UserPurchase>(
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
                  COALESCE(b.title, m.title),
                'cover_url',
                  COALESCE(b.cover_url, m.cover_url)
              )
              ORDER BY pi.id
            ) FILTER (WHERE pi.id IS NOT NULL),
            '[]'::json
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
      [userId],
    );

    return {
      user: userResult.rows[0],
      purchases: purchasesResult.rows,
    };
  } catch (error) {
    console.error(
      `Error al consultar las compras del usuario ${userId}:`,
      error,
    );

    throw new Error(
      "No fue posible consultar el historial de compras del usuario.",
    );
  }
}