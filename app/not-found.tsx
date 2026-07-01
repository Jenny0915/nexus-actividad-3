import Image from "next/image";
import Link from "next/link";

import styles from "./not-found.module.css";

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5.5 10v9h13v-9" />
      <path d="M9.5 19v-5h5v5" />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v16H6.5A2.5 2.5 0 0 0 4 21.5v-16Z" />
      <path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H13v16h4.5a2.5 2.5 0 0 1 2.5 2.5v-16Z" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12h14" />
      <path d="m14 7 5 5-5 5" />
    </svg>
  );
}

export default function NotFound() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <Link href="/" className={styles.brand} aria-label="Nexus - Inicio">
            <Image
              src="/nexus2.png"
              alt="Isotipo Nexus"
              width={72}
              height={72}
              priority
            />

            <span>
              <strong>Nexus</strong>
              <small>Comunidad universitaria</small>
            </span>
          </Link>

          <nav className={styles.navigation} aria-label="Navegación principal">
            <Link href="/">Inicio</Link>
            <Link href="/library">Librería</Link>
            <Link href="/coworking">Co-working</Link>

            <button type="button" className={styles.languageButton}>
              ES
              <span aria-hidden="true">⌄</span>
            </button>

            <button type="button" className={styles.loginButton}>
              Iniciar sesión
            </button>
          </nav>
        </div>
      </header>

      <section className={styles.errorSection}>
        <div className={styles.decoration} aria-hidden="true">
          <span className={styles.decorationCircleOne} />
          <span className={styles.decorationCircleTwo} />
          <span className={styles.decorationLineOne} />
          <span className={styles.decorationLineTwo} />
        </div>

        <div className={styles.errorContent}>
          <div className={styles.errorCode}>
            <span>4</span>

            <div className={styles.logoCircle}>
              <Image
                src="/nexus2.png"
                alt=""
                width={115}
                height={115}
              />
            </div>

            <span>4</span>
          </div>

          <span className={styles.eyebrow}>Página no encontrada</span>

          <h1>No encontramos el contenido que estás buscando</h1>

          <p>
            Es posible que la dirección sea incorrecta, que el recurso haya
            cambiado de ubicación o que ya no esté disponible.
          </p>

          <div className={styles.actions}>
            <Link href="/" className={styles.primaryButton}>
              <HomeIcon />
              Regresar al inicio
            </Link>

            <Link href="/library" className={styles.secondaryButton}>
              <BookIcon />
              Explorar la librería
              <ArrowIcon />
            </Link>
          </div>

          <div className={styles.helpCard}>
            <span className={styles.helpIcon}>?</span>

            <div>
              <strong>¿Buscabas un libro?</strong>

              <p>
                Regresa al catálogo y utiliza el buscador o los filtros para
                encontrar la publicación que necesitas.
              </p>
            </div>

            <Link href="/library#catalogo">
              Ver catálogo
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <Image
            src="/nexus.png"
            alt="Nexus"
            width={155}
            height={100}
          />

          <nav aria-label="Navegación del pie de página">
            <Link href="/">Inicio</Link>
            <Link href="/library">Librería universitaria</Link>
            <Link href="/coworking">Espacios de co-working</Link>
          </nav>

          <span>
            Proyecto académico desarrollado con Next.js y PostgreSQL.
          </span>
        </div>

        <div className={styles.footerBottom}>
          <span>
            © 2026 Nexus. Desarrollo Web con Frameworks Front-End.
          </span>

          <span>Por: Jenny Andrea Laverde Rodríguez</span>
        </div>
      </footer>
    </main>
  );
}