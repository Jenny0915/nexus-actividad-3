import { NextRequest, NextResponse } from "next/server";

import { getAuthenticatedDatabaseUser } from "@/lib/data/auth-user";
import { db } from "@/lib/db";

interface PurchaseItemInput {
  productType: "book" | "magazine";
  productId: number | string;
  quantity: number | string;
}

interface PurchaseRequestBody {
  items: PurchaseItemInput[];
}

interface ProcessedItem {
  productType: "book" | "magazine";
  productId: number;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export async function POST(request: NextRequest) {
  const authenticatedUser = await getAuthenticatedDatabaseUser();

  if (!authenticatedUser) {
    return NextResponse.json(
      {
        success: false,
        message: "Debes iniciar sesión para registrar una compra.",
      },
      { status: 401 },
    );
  }

  const client = await db.connect();
  let transactionStarted = false;

  try {
    const body = (await request.json()) as PurchaseRequestBody;

    if (!Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Debe enviar al menos un producto para la compra.",
        },
        { status: 400 },
      );
    }

    await client.query("BEGIN");
    transactionStarted = true;

    const processedItems: ProcessedItem[] = [];
    let totalAmount = 0;

    for (const item of body.items) {
      const productType = item.productType;
      const productId = Number(item.productId);
      const quantity = Number(item.quantity);

      const isValidProductType =
        productType === "book" || productType === "magazine";

      if (
        !isValidProductType ||
        !Number.isInteger(productId) ||
        productId <= 0 ||
        !Number.isInteger(quantity) ||
        quantity <= 0
      ) {
        throw new Error("INVALID_ITEM");
      }

      const table = productType === "book" ? "books" : "magazines";

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
        [productId],
      );

      if (productResult.rowCount === 0) {
        throw new Error(
          `PRODUCT_NOT_FOUND:${productType}:${productId}`,
        );
      }

      const product = productResult.rows[0];

      if (!product.is_active) {
        throw new Error(
          `PRODUCT_INACTIVE:${productType}:${productId}`,
        );
      }

      const availableStock = Number(product.stock);

      if (
        !Number.isFinite(availableStock) ||
        availableStock < quantity
      ) {
        throw new Error(
          `INSUFFICIENT_STOCK:${productType}:${productId}`,
        );
      }

      const unitPrice = Number(product.price);

      if (!Number.isFinite(unitPrice) || unitPrice < 0) {
        throw new Error(
          `INVALID_PRICE:${productType}:${productId}`,
        );
      }

      const subtotal = unitPrice * quantity;

      totalAmount += subtotal;

      processedItems.push({
        productType,
        productId,
        quantity,
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
      [authenticatedUser.id, totalAmount],
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
        ],
      );

      const table =
        item.productType === "book" ? "books" : "magazines";

      const stockUpdateResult = await client.query(
        `
          UPDATE ${table}
          SET
            stock = stock - $1,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = $2
            AND stock >= $1
          RETURNING stock
        `,
        [item.quantity, item.productId],
      );

      if (stockUpdateResult.rowCount === 0) {
        throw new Error(
          `INSUFFICIENT_STOCK:${item.productType}:${item.productId}`,
        );
      }
    }

    await client.query("COMMIT");
    transactionStarted = false;

    return NextResponse.json(
      {
        success: true,
        message: "Compra registrada correctamente.",
        data: {
          ...purchase,
          items: processedItems,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    if (transactionStarted) {
      await client.query("ROLLBACK");
    }

    const message =
      error instanceof Error ? error.message : "UNKNOWN_ERROR";

    if (message === "INVALID_ITEM") {
      return NextResponse.json(
        {
          success: false,
          message: "Uno o más productos tienen datos inválidos.",
        },
        { status: 400 },
      );
    }

    if (message.startsWith("PRODUCT_NOT_FOUND")) {
      return NextResponse.json(
        {
          success: false,
          message: "Uno de los productos solicitados no existe.",
        },
        { status: 404 },
      );
    }

    if (message.startsWith("PRODUCT_INACTIVE")) {
      return NextResponse.json(
        {
          success: false,
          message: "Uno de los productos solicitados está inactivo.",
        },
        { status: 400 },
      );
    }

    if (message.startsWith("INSUFFICIENT_STOCK")) {
      return NextResponse.json(
        {
          success: false,
          message: "No hay stock suficiente para uno de los productos.",
        },
        { status: 409 },
      );
    }

    if (message.startsWith("INVALID_PRICE")) {
      return NextResponse.json(
        {
          success: false,
          message: "El producto tiene un precio inválido.",
        },
        { status: 400 },
      );
    }

    console.error("Error al registrar la compra:", error);

    return NextResponse.json(
      {
        success: false,
        message: "No fue posible registrar la compra.",
      },
      { status: 500 },
    );
  } finally {
    client.release();
  }
}
