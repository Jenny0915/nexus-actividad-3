import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

interface PurchaseItemInput {
  productType: "book" | "magazine";
  productId: number;
  quantity: number;
}

interface PurchaseRequestBody {
  userId: number;
  items: PurchaseItemInput[];
}

export async function POST(request: NextRequest) {
  const client = await db.connect();

  try {
    const body = (await request.json()) as PurchaseRequestBody;

    if (
      !Number.isInteger(body.userId) ||
      body.userId <= 0 ||
      !Array.isArray(body.items) ||
      body.items.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Debe enviar un usuario válido y al menos un producto para la compra.",
        },
        { status: 400 }
      );
    }

    const userResult = await client.query(
      `
        SELECT id
        FROM users
        WHERE id = $1
      `,
      [body.userId]
    );

    if (userResult.rowCount === 0) {
      return NextResponse.json(
        {
          success: false,
          message: `No se encontró el usuario con identificador ${body.userId}.`,
        },
        { status: 404 }
      );
    }

    await client.query("BEGIN");

    const processedItems: Array<{
      productType: "book" | "magazine";
      productId: number;
      quantity: number;
      unitPrice: number;
      subtotal: number;
    }> = [];

    let totalAmount = 0;

    for (const item of body.items) {
      if (
        !["book", "magazine"].includes(item.productType) ||
        !Number.isInteger(item.productId) ||
        item.productId <= 0 ||
        !Number.isInteger(item.quantity) ||
        item.quantity <= 0
      ) {
        throw new Error("INVALID_ITEM");
      }

      const table = item.productType === "book" ? "books" : "magazines";

      const productResult = await client.query(
        `
          SELECT
            id,
            price,
            stock,
            is_active
          FROM ${table}
          WHERE id = $1
          FOR UPDATE
        `,
        [item.productId]
      );

      if (productResult.rowCount === 0) {
        throw new Error(
          `PRODUCT_NOT_FOUND:${item.productType}:${item.productId}`
        );
      }

      const product = productResult.rows[0];

      if (!product.is_active) {
        throw new Error(
          `PRODUCT_INACTIVE:${item.productType}:${item.productId}`
        );
      }

      if (product.stock < item.quantity) {
        throw new Error(
          `INSUFFICIENT_STOCK:${item.productType}:${item.productId}`
        );
      }

      const unitPrice = Number(product.price);
      const subtotal = unitPrice * item.quantity;

      totalAmount += subtotal;

      processedItems.push({
        productType: item.productType,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice,
        subtotal,
      });
    }

    const purchaseResult = await client.query(
      `
        INSERT INTO purchases (
          user_id,
          status,
          total_amount,
          purchased_at
        )
        VALUES ($1, 'completed', $2, CURRENT_TIMESTAMP)
        RETURNING
          id,
          user_id,
          status,
          total_amount,
          purchased_at,
          created_at
      `,
      [body.userId, totalAmount]
    );

    const purchase = purchaseResult.rows[0];

    for (const item of processedItems) {
      const bookId =
        item.productType === "book" ? item.productId : null;

      const magazineId =
        item.productType === "magazine" ? item.productId : null;

      await client.query(
        `
          INSERT INTO purchase_items (
            purchase_id,
            book_id,
            magazine_id,
            quantity,
            unit_price
          )
          VALUES ($1, $2, $3, $4, $5)
        `,
        [
          purchase.id,
          bookId,
          magazineId,
          item.quantity,
          item.unitPrice,
        ]
      );

      const table =
        item.productType === "book" ? "books" : "magazines";

      await client.query(
        `
          UPDATE ${table}
          SET
            stock = stock - $1,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = $2
        `,
        [item.quantity, item.productId]
      );
    }

    await client.query("COMMIT");

    return NextResponse.json(
      {
        success: true,
        message: "Compra registrada correctamente.",
        data: {
          ...purchase,
          items: processedItems,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    await client.query("ROLLBACK");

    const message =
      error instanceof Error ? error.message : "UNKNOWN_ERROR";

    if (message === "INVALID_ITEM") {
      return NextResponse.json(
        {
          success: false,
          message: "Uno o más productos tienen datos inválidos.",
        },
        { status: 400 }
      );
    }

    if (message.startsWith("PRODUCT_NOT_FOUND")) {
      return NextResponse.json(
        {
          success: false,
          message: "Uno de los productos solicitados no existe.",
        },
        { status: 404 }
      );
    }

    if (message.startsWith("PRODUCT_INACTIVE")) {
      return NextResponse.json(
        {
          success: false,
          message: "Uno de los productos solicitados está inactivo.",
        },
        { status: 400 }
      );
    }

    if (message.startsWith("INSUFFICIENT_STOCK")) {
      return NextResponse.json(
        {
          success: false,
          message: "No hay stock suficiente para uno de los productos.",
        },
        { status: 409 }
      );
    }

    console.error("Error al registrar la compra:", error);

    return NextResponse.json(
      {
        success: false,
        message: "No fue posible registrar la compra.",
      },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}