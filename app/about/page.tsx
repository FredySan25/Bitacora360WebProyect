import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { PageHeader } from "@/core/components/PageHeader";

export const metadata: Metadata = {
  title: "Acerca de · Bitácora360",
};

const linkClassName =
  "font-medium text-accent underline underline-offset-2 hover:text-accent-hover";

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-border bg-paper-elevated p-5">
      <h2 className="font-display text-xl font-semibold text-ink">{title}</h2>
      {children}
    </section>
  );
}

/**
 * What Bitácora360 is and the credits of the catalogs the watchlist uses.
 * TMDB asks for its logo and notice in a section like this one. Public: it
 * reads the same with or without a session.
 */
export default function AboutPage() {
  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-10 md:py-16">
      <Link href="/" className="mb-6 inline-block text-sm text-ink-muted hover:text-ink">
        ← Volver a Bitácora360
      </Link>

      <PageHeader title="Acerca de Bitácora360" />

      <div className="flex flex-col gap-5 text-sm leading-relaxed text-ink">
        <Block title="Qué es">
          <p>
            Bitácora360 es un proyecto personal, sin fines comerciales: no se vende, no tiene
            anuncios ni suscripciones. Es un registro propio de hábitos, finanzas y una watchlist de
            películas, series y libros.
          </p>
        </Block>

        <Block title="Películas y series">
          <a
            href="https://www.themoviedb.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-fit"
          >
            <Image src="/tmdb-logo.svg" alt="Logo de TMDB" width={160} height={21} />
          </a>
          <p>
            Los pósters y los datos de películas y series vienen de{" "}
            <a
              href="https://www.themoviedb.org/"
              target="_blank"
              rel="noopener noreferrer"
              className={linkClassName}
            >
              TMDB
            </a>
            .
          </p>
          <p>Este producto usa la API de TMDB, pero no está respaldado ni certificado por TMDB.</p>
          <p lang="en" className="text-ink-muted">
            This product uses the TMDB API but is not endorsed or certified by TMDB.
          </p>
        </Block>

        <Block title="Libros">
          <p>
            Los datos y las portadas de libros vienen de{" "}
            <a
              href="https://books.google.com/"
              target="_blank"
              rel="noopener noreferrer"
              className={linkClassName}
            >
              Google Books
            </a>{" "}
            y de{" "}
            <a
              href="https://openlibrary.org/"
              target="_blank"
              rel="noopener noreferrer"
              className={linkClassName}
            >
              Open Library
            </a>{" "}
            (Internet Archive).
          </p>
        </Block>

        <p className="text-xs text-ink-muted">
          Los pósters, las portadas y los datos de cada catálogo pertenecen a sus dueños.
        </p>
      </div>
    </main>
  );
}
