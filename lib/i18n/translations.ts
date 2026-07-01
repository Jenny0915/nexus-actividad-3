export const supportedLocales = ["es", "en"] as const;

export type Locale = (typeof supportedLocales)[number];

export const defaultLocale: Locale = "es";

export const localeCookieName = "nexus_locale";

export const localeLabels: Record<Locale, string> = {
  es: "ES",
  en: "EN",
};

export const translations = {
  es: {
    common: {
      home: "Inicio",
      library: "Librería",
      coworking: "Co-working",
      login: "Iniciar sesión",
      logout: "Cerrar sesión",
      signedIn: "Sesión iniciada",
      universityCommunity: "Comunidad universitaria",
    },
    home: {
      brandAria: "Nexus - Inicio",
      mainNavigationAria: "Navegación principal",
      heroTitle:
        "Conocimiento, espacios y comunidad en un mismo punto de encuentro",
      heroDescription:
        "Nexus conecta a la comunidad universitaria con servicios pensados para aprender, colaborar y aprovechar mejor cada espacio del campus.",
      exploreLibrary: "Explorar librería",
      viewSpaces: "Ver espacios disponibles",
      servicesEyebrow: "Servicios Nexus",
      servicesTitle:
        "Todo lo que necesitas para tu experiencia universitaria",
      servicesDescription:
        "Una plataforma que reúne conocimiento, colaboración y servicios pensados para acompañar a la comunidad académica.",
      services: [
        {
          title: "Librería universitaria",
          description:
            "Consulta libros y revistas, explora categorías, revisa detalles y gestiona tus compras.",
          label: "Explorar librería",
        },
        {
          title: "Espacios de co-working",
          description:
            "Encuentra espacios disponibles, consulta su ocupación y realiza nuevas reservas.",
          label: "Consultar espacios",
        },
        {
          title: "Cafetería universitaria",
          description:
            "Un servicio complementario pensado para compartir y hacer una pausa dentro del campus.",
          label: "Próximamente",
        },
        {
          title: "Eventos académicos",
          description:
            "Encuentra actividades culturales, académicas y de integración para la comunidad.",
          label: "Próximamente",
        },
      ],
      centralizedExperience: "Experiencia centralizada",
      connectedExperience: "Una experiencia conectada",
      experienceTitle:
        "Diseñada para facilitar cada momento de tu vida académica",
      experienceDescription:
        "Consulta el catálogo, accede a tus compras, revisa espacios disponibles y administra tus reservas desde una experiencia sencilla y centralizada.",
      experienceItems: [
        "Acceso seguro mediante autenticación con Google.",
        "Información actualizada desde PostgreSQL en Neon.",
        "Navegación disponible en español e inglés.",
      ],
      ctaEyebrow: "Empieza a explorar Nexus",
      ctaTitle: "Tu comunidad universitaria, ahora más conectada",
      ctaButton: "Comenzar",
      footerDescription:
        "Plataforma universitaria que reúne servicios de conocimiento, colaboración y reserva de espacios para la comunidad académica.",
      footerNavigation: "Navegación",
      footerNavigationAria: "Navegación del pie de página",
      footerServices: "Servicios",
      footerServicesAria: "Servicios de Nexus",
      footerTechnology: "Tecnología",
      universityLibrary: "Librería universitaria",
      coworkingSpaces: "Espacios de co-working",
      bookCatalog: "Catálogo de libros",
      universityMagazines: "Revistas universitarias",
      consultSpaces: "Consultar espacios",
      myReservations: "Mis reservas",
      auth0Authentication: "Autenticación con Auth0",
      deploymentVercel: "Despliegue en Vercel",
      copyright:
        "© 2026 Nexus. Proyecto académico de Desarrollo Web con Frameworks Front-End.",
      author: "Por: Jenny Andrea Laverde Rodríguez",
      footerHomeAria: "Ir al inicio de Nexus",
    },
  },
  en: {
    common: {
      home: "Home",
      library: "Library",
      coworking: "Co-working",
      login: "Sign in",
      logout: "Sign out",
      signedIn: "Signed in",
      universityCommunity: "University community",
    },
    home: {
      brandAria: "Nexus - Home",
      mainNavigationAria: "Main navigation",
      heroTitle:
        "Knowledge, spaces and community in one shared meeting point",
      heroDescription:
        "Nexus connects the university community with services designed for learning, collaboration and better use of every campus space.",
      exploreLibrary: "Explore library",
      viewSpaces: "View available spaces",
      servicesEyebrow: "Nexus services",
      servicesTitle: "Everything you need for your university experience",
      servicesDescription:
        "A platform that brings together knowledge, collaboration and services designed to support the academic community.",
      services: [
        {
          title: "University library",
          description:
            "Browse books and magazines, explore categories, review details and manage your purchases.",
          label: "Explore library",
        },
        {
          title: "Co-working spaces",
          description:
            "Find available spaces, review occupancy and create new reservations.",
          label: "View spaces",
        },
        {
          title: "University café",
          description:
            "A complementary service designed for sharing and taking a break on campus.",
          label: "Coming soon",
        },
        {
          title: "Academic events",
          description:
            "Discover cultural, academic and community activities for the university community.",
          label: "Coming soon",
        },
      ],
      centralizedExperience: "Centralized experience",
      connectedExperience: "A connected experience",
      experienceTitle:
        "Designed to make every moment of your academic life easier",
      experienceDescription:
        "Browse the catalog, access your purchases, review available spaces and manage reservations through one simple, centralized experience.",
      experienceItems: [
        "Secure access through Google authentication.",
        "Up-to-date information from PostgreSQL on Neon.",
        "Navigation available in Spanish and English.",
      ],
      ctaEyebrow: "Start exploring Nexus",
      ctaTitle: "Your university community, now more connected",
      ctaButton: "Get started",
      footerDescription:
        "A university platform that brings together knowledge services, collaboration and space reservations for the academic community.",
      footerNavigation: "Navigation",
      footerNavigationAria: "Footer navigation",
      footerServices: "Services",
      footerServicesAria: "Nexus services",
      footerTechnology: "Technology",
      universityLibrary: "University library",
      coworkingSpaces: "Co-working spaces",
      bookCatalog: "Book catalog",
      universityMagazines: "University magazines",
      consultSpaces: "View spaces",
      myReservations: "My reservations",
      auth0Authentication: "Auth0 authentication",
      deploymentVercel: "Deployment on Vercel",
      copyright:
        "© 2026 Nexus. Academic Front-End Frameworks Development project.",
      author: "By: Jenny Andrea Laverde Rodríguez",
      footerHomeAria: "Go to Nexus home",
    },
  },
} as const;

export function isSupportedLocale(value: string): value is Locale {
  return supportedLocales.includes(value as Locale);
}

export function getTranslations(locale: Locale) {
  return translations[locale];
}
