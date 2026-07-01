import Image from "next/image";
import Link from "next/link";

import AuthMenu from "@/components/AuthMenu";
import LanguageSelector from "@/components/LanguageSelector";
import { getLocale } from "@/lib/i18n/get-locale";
import { getTranslations } from "@/lib/i18n/translations";

type ServiceType = "book" | "coworking" | "coffee" | "events";

interface ServiceConfiguration {
  icon: ServiceType;
  href: string;
  available: boolean;
}

const serviceConfiguration: ServiceConfiguration[] = [
  {
    icon: "book",
    href: "/library",
    available: true,
  },
  {
    icon: "coworking",
    href: "/coworking",
    available: true,
  },
  {
    icon: "coffee",
    href: "#",
    available: false,
  },
  {
    icon: "events",
    href: "#",
    available: false,
  },
];

function ServiceIcon({ type }: { type: ServiceType }) {
  if (type === "book") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v16H6.5A2.5 2.5 0 0 0 4 21.5v-16Z" />
        <path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H13v16h4.5a2.5 2.5 0 0 1 2.5 2.5v-16Z" />
      </svg>
    );
  }

  if (type === "coworking") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="4" width="18" height="11" rx="2" />
        <path d="M8 20h8M12 15v5M7 9h3M14 9h3" />
      </svg>
    );
  }

  if (type === "coffee") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 8h11v5a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5V8Z" />
        <path d="M16 10h2a3 3 0 0 1 0 6h-3M8 3v2M12 3v2" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path d="M8 3v4M16 3v4M4 10h16M8 14h3M14 14h2" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

export default async function Home() {
  const locale = await getLocale();
  const dictionary = getTranslations(locale);

  const services = serviceConfiguration.map((configuration, index) => ({
    ...configuration,
    ...dictionary.home.services[index],
  }));

  return (
    <main className="home-page">
      <header className="main-header">
        <div className="main-header__content">
          <Link
            href="/"
            className="brand"
            aria-label={dictionary.home.brandAria}
          >
            <Image
              src="/nexus2.png"
              alt="Isotipo Nexus"
              width={72}
              height={72}
              priority
              className="brand__logo"
            />

            <span className="brand__copy">
              <strong>Nexus</strong>
              <small>{dictionary.common.universityCommunity}</small>
            </span>
          </Link>

          <nav
            className="main-navigation"
            aria-label={dictionary.home.mainNavigationAria}
          >
            <Link href="/" className="main-navigation__active">
              {dictionary.common.home}
            </Link>

            <Link href="/library">{dictionary.common.library}</Link>

            <Link href="/coworking">{dictionary.common.coworking}</Link>

            <LanguageSelector
              locale={locale}
              className="language-selector"
            />

            <AuthMenu
              loginClassName="login-button"
              containerClassName="auth-menu"
              userClassName="auth-user"
              logoutClassName="logout-button"
            />
          </nav>
        </div>
      </header>

      <section className="hero-banner">
        <div className="hero-banner__overlay" />

        <div className="hero-banner__inner">
          <div className="hero-banner__content">
            <h1>{dictionary.home.heroTitle}</h1>

            <p>{dictionary.home.heroDescription}</p>

            <div className="hero-banner__actions">
              <Link href="/library" className="primary-button">
                <ServiceIcon type="book" />
                {dictionary.home.exploreLibrary}
                <span aria-hidden="true">→</span>
              </Link>

              <Link href="/coworking" className="secondary-button">
                <LocationIcon />
                {dictionary.home.viewSpaces}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="services-section" id="servicios">
        <div className="section-heading">
          <span className="section-heading__eyebrow">
            {dictionary.home.servicesEyebrow}
          </span>

          <h2>{dictionary.home.servicesTitle}</h2>

          <p>{dictionary.home.servicesDescription}</p>
        </div>

        <div className="services-grid">
          {services.map((service, index) => (
            <article
              key={service.title}
              className={`service-card ${
                service.available
                  ? "service-card--active"
                  : "service-card--disabled"
              }`}
            >
              <div className="service-card__accent" />

              <div className="service-card__top">
                <div className="service-card__icon">
                  <ServiceIcon type={service.icon} />
                </div>

                <span className="service-card__number">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>

              <h3>{service.title}</h3>

              <p>{service.description}</p>

              {service.available ? (
                <Link href={service.href} className="service-card__link">
                  {service.label}
                  <span aria-hidden="true">→</span>
                </Link>
              ) : (
                <span className="service-card__status">{service.label}</span>
              )}
            </article>
          ))}
        </div>
      </section>

      <section className="experience-section">
        <div className="experience-section__content">
          <div className="experience-section__visual">
            <div className="product-preview">
              <div className="product-preview__topbar">
                <div className="product-preview__browser-dots">
                  <span />
                  <span />
                  <span />
                </div>

                <div className="product-preview__address" />
              </div>

              <div className="product-preview__body">
                <aside className="product-preview__sidebar">
                  <div className="product-preview__mini-logo">N</div>

                  <div className="product-preview__menu">
                    <span className="product-preview__menu-active" />
                    <span />
                    <span />
                    <span />
                  </div>
                </aside>

                <div className="product-preview__main">
                  <div className="product-preview__heading">
                    <div>
                      <span className="product-preview__title-line" />
                      <span className="product-preview__subtitle-line" />
                    </div>

                    <span className="product-preview__button" />
                  </div>

                  <div className="product-preview__cards">
                    {[1, 2, 3].map((card) => (
                      <article key={card}>
                        <span className="product-preview__card-icon" />
                        <span className="product-preview__card-title" />
                        <span className="product-preview__card-text" />
                      </article>
                    ))}
                  </div>

                  <div className="product-preview__rows">
                    <span />
                    <span />
                  </div>
                </div>
              </div>
            </div>

            <span className="product-preview__badge">
              {dictionary.home.centralizedExperience}
            </span>
          </div>

          <div className="experience-section__text">
            <span className="section-heading__eyebrow">
              {dictionary.home.connectedExperience}
            </span>

            <h2>{dictionary.home.experienceTitle}</h2>

            <p>{dictionary.home.experienceDescription}</p>

            <ul>
              {dictionary.home.experienceItems.map((item, index) => (
                <li key={item}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-section__content">
          <div>
            <span>{dictionary.home.ctaEyebrow}</span>

            <h2>{dictionary.home.ctaTitle}</h2>
          </div>

          <Link href="/library" className="cta-button">
            {dictionary.home.ctaButton}
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>

      <footer className="main-footer">
        <div className="main-footer__content">
          <div className="main-footer__brand">
            <Link href="/" aria-label={dictionary.home.footerHomeAria}>
              <Image
                src="/nexus.png"
                alt="Nexus"
                width={190}
                height={130}
                className="main-footer__logo"
              />
            </Link>

            <p>{dictionary.home.footerDescription}</p>
          </div>

          <div className="main-footer__column">
            <h3>{dictionary.home.footerNavigation}</h3>

            <nav aria-label={dictionary.home.footerNavigationAria}>
              <Link href="/">{dictionary.common.home}</Link>
              <Link href="/library">
                {dictionary.home.universityLibrary}
              </Link>
              <Link href="/coworking">
                {dictionary.home.coworkingSpaces}
              </Link>
            </nav>
          </div>

          <div className="main-footer__column">
            <h3>{dictionary.home.footerServices}</h3>

            <nav aria-label={dictionary.home.footerServicesAria}>
              <Link href="/library">{dictionary.home.bookCatalog}</Link>
              <Link href="/library">
                {dictionary.home.universityMagazines}
              </Link>
              <Link href="/coworking">
                {dictionary.home.consultSpaces}
              </Link>
              <Link href="/coworking/reservations">
                {dictionary.home.myReservations}
              </Link>
            </nav>
          </div>

          <div className="main-footer__column">
            <h3>{dictionary.home.footerTechnology}</h3>

            <ul className="main-footer__technologies">
              <li>Next.js & TypeScript</li>
              <li>PostgreSQL on Neon</li>
              <li>{dictionary.home.auth0Authentication}</li>
              <li>{dictionary.home.deploymentVercel}</li>
            </ul>
          </div>
        </div>

        <div className="main-footer__bottom">
          <div className="main-footer__bottom-content">
            <span>{dictionary.home.copyright}</span>
            <span>{dictionary.home.author}</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
