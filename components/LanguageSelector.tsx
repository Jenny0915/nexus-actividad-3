"use client";

import { useEffect, useRef, useState } from "react";

import {
  localeCookieName,
  localeLabels,
  supportedLocales,
  type Locale,
} from "@/lib/i18n/translations";

interface LanguageSelectorProps {
  locale: Locale;
  className?: string;
}

export default function LanguageSelector({
  locale,
  className,
}: LanguageSelectorProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  function changeLanguage(selectedLocale: Locale) {
    if (selectedLocale === locale) {
      setIsOpen(false);
      return;
    }

    const oneYearInSeconds = 60 * 60 * 24 * 365;

    document.cookie = [
      `${localeCookieName}=${selectedLocale}`,
      "path=/",
      `max-age=${oneYearInSeconds}`,
      "samesite=lax",
    ].join("; ");

    setIsOpen(false);

    window.location.reload();
  }

  return (
    <div
      ref={containerRef}
      className={`${className ?? ""} language-selector`}
    >
      <button
        type="button"
        className="language-selector__button"
        onClick={() => setIsOpen((currentValue) => !currentValue)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        <span>{localeLabels[locale]}</span>

        <span
          className={`language-selector__arrow ${
            isOpen ? "language-selector__arrow--open" : ""
          }`}
          aria-hidden="true"
        >
          ⌄
        </span>
      </button>

      {isOpen && (
        <div
          className="language-selector__menu"
          role="menu"
          aria-label="Seleccionar idioma"
        >
          {supportedLocales.map((supportedLocale) => (
            <button
              key={supportedLocale}
              type="button"
              role="menuitem"
              className={`language-selector__option ${
                supportedLocale === locale
                  ? "language-selector__option--active"
                  : ""
              }`}
              onClick={() => changeLanguage(supportedLocale)}
            >
              <span>{localeLabels[supportedLocale]}</span>

              <small>
                {supportedLocale === "es" ? "Español" : "English"}
              </small>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
