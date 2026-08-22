import { createFileRoute } from "@tanstack/react-router";
import { Page, SiteFooter, SiteHeader } from "@/components/site-chrome";
import { RacketChat } from "@/components/racket-chat";
import { CATALOG_DISCLAIMER } from "@/lib/racket-db";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "Chatbot de tenis — RacketIQ" },
      {
        name: "description",
        content:
          "Pregunta sobre raquetas, cuerdas, tensiones, patrones de encordado y comparaciones. El chatbot responde con las especificaciones reales de nuestro catálogo.",
      },
      { property: "og:title", content: "Chatbot de tenis — RacketIQ" },
      {
        property: "og:description",
        content: "Asistente de equipamiento con datos reales de raquetas y categorías de cuerda.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ChatPage,
});

function ChatPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <Page>
          <p className="eyebrow">Chatbot</p>
          <h1 className="text-display mt-3 text-4xl font-extrabold">Pregúntale al asistente</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Raquetas, cuerdas, tensiones, patrones de encordado, comparaciones entre modelos y dudas
            sobre especificaciones. Si un dato no está en la base de datos, te lo dirá en lugar de
            inventarlo.
          </p>
          <div className="mt-8">
            <RacketChat />
          </div>
          <p className="mt-6 text-xs text-muted-foreground">{CATALOG_DISCLAIMER}</p>
        </Page>
      </main>
      <SiteFooter />
    </>
  );
}
