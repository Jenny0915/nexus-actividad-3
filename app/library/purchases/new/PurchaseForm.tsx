"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";

import styles from "./purchase.module.css";

interface PurchaseBook {
  id: number;
  title: string;
  price: number;
  stock: number;
}

interface PurchaseUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

interface PurchaseFormProps {
  book: PurchaseBook;
  user: PurchaseUser;
}

interface PurchaseResponse {
  success: boolean;
  message: string;
  data?: {
    id: number;
    user_id: number;
    status: string;
    total_amount: string | number;
    purchased_at: string;
  };
}

function formatPrice(value: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function ShoppingIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="9" cy="20" r="1" />
      <circle cx="18" cy="20" r="1" />
      <path d="M3 4h2l2.4 10.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 1.9-1.4L21 8H7" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
  );
}

export default function PurchaseForm({
  book,
  user,
}: PurchaseFormProps) {
  const [quantity, setQuantity] = useState(1);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [purchase, setPurchase] =
    useState<PurchaseResponse["data"] | null>(null);

  const total = useMemo(
    () => book.price * quantity,
    [book.price, quantity],
  );

  function handleQuantityChange(value: number) {
    if (!Number.isInteger(value)) {
      return;
    }

    const validatedQuantity = Math.min(
      Math.max(value, 1),
      book.stock,
    );

    setQuantity(validatedQuantity);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    if (!acceptTerms) {
      setErrorMessage(
        "Debes confirmar la información antes de registrar la compra.",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/purchases", {
        method: "POST",
        credentials: "include",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          items: [
            {
              productType: "book",
              productId: book.id,
              quantity,
            },
          ],
        }),
      });

      const contentType = response.headers.get("content-type") ?? "";

      if (!contentType.includes("application/json")) {
        throw new Error(
          "El servicio de compras devolvió una respuesta inesperada.",
        );
      }

      const result = (await response.json()) as PurchaseResponse;

      if (!response.ok || !result.success) {
        setErrorMessage(
          result.message || "No fue posible registrar la compra.",
        );
        return;
      }

      setPurchase(result.data ?? null);
    } catch (error) {
      console.error("Error al enviar la compra:", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No fue posible conectar con el servicio de compras.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (purchase) {
    return (
      <section className={styles.successCard}>
        <div className={styles.successIcon}>
          <CheckIcon />
        </div>

        <span>Compra registrada</span>

        <h2>La compra se completó correctamente</h2>

        <p>
          La publicación fue asociada a tu cuenta y el inventario se actualizó
          en la base de datos.
        </p>

        <div className={styles.purchaseReference}>
          <div>
            <span>Número de compra</span>
            <strong>#{purchase.id}</strong>
          </div>

          <div>
            <span>Estado</span>
            <strong>{purchase.status}</strong>
          </div>

          <div>
            <span>Total registrado</span>
            <strong>{formatPrice(Number(purchase.total_amount))}</strong>
          </div>
        </div>

        <div className={styles.successActions}>
          <Link href="/library/purchases">
            Consultar mis compras
          </Link>

          <Link href="/library#catalogo">
            Continuar explorando
          </Link>
        </div>
      </section>
    );
  }

  return (
    <form className={styles.purchaseForm} onSubmit={handleSubmit}>
      <div className={styles.formHeader}>
        <span>Datos de la operación</span>
        <h2>Información de compra</h2>

        <p>
          La operación se asociará automáticamente a la cuenta con la que
          iniciaste sesión.
        </p>
      </div>

      {errorMessage && (
        <div className={styles.errorMessage} role="alert">
          <strong>No fue posible continuar</strong>
          <span>{errorMessage}</span>
        </div>
      )}

      <section className={styles.authenticatedBuyer}>
        <span className={styles.authenticatedBuyerIcon}>
          <UserIcon />
        </span>

        <div>
          <small>Usuario comprador</small>
          <strong>
            {user.firstName} {user.lastName}
          </strong>
          <span>{user.email}</span>
        </div>
      </section>

      <div className={styles.formGroup}>
        <label htmlFor="purchase-quantity">
          Cantidad
          <span>*</span>
        </label>

        <div className={styles.quantityControl}>
          <button
            type="button"
            onClick={() => handleQuantityChange(quantity - 1)}
            disabled={quantity <= 1 || isSubmitting}
            aria-label="Disminuir cantidad"
          >
            −
          </button>

          <input
            id="purchase-quantity"
            type="number"
            min="1"
            max={book.stock}
            value={quantity}
            onChange={(event) =>
              handleQuantityChange(Number(event.target.value))
            }
            disabled={isSubmitting}
          />

          <button
            type="button"
            onClick={() => handleQuantityChange(quantity + 1)}
            disabled={quantity >= book.stock || isSubmitting}
            aria-label="Aumentar cantidad"
          >
            +
          </button>
        </div>

        <small>
          Puedes adquirir hasta {book.stock} unidades.
        </small>
      </div>

      <div className={styles.orderSummary}>
        <h3>Resumen de la compra</h3>

        <dl>
          <div>
            <dt>Libro</dt>
            <dd>{book.title}</dd>
          </div>

          <div>
            <dt>Precio unitario</dt>
            <dd>{formatPrice(book.price)}</dd>
          </div>

          <div>
            <dt>Cantidad</dt>
            <dd>{quantity}</dd>
          </div>
        </dl>

        <div className={styles.totalRow}>
          <span>Total</span>
          <strong>{formatPrice(total)}</strong>
        </div>
      </div>

      <label className={styles.confirmationField}>
        <input
          type="checkbox"
          checked={acceptTerms}
          onChange={(event) => setAcceptTerms(event.target.checked)}
          disabled={isSubmitting}
        />

        <span>
          Confirmo que la información seleccionada es correcta y deseo
          registrar esta compra.
        </span>
      </label>

      <button
        type="submit"
        className={styles.submitButton}
        disabled={isSubmitting || !acceptTerms}
      >
        <ShoppingIcon />

        {isSubmitting
          ? "Registrando compra..."
          : `Confirmar compra por ${formatPrice(total)}`}
      </button>
    </form>
  );
}
