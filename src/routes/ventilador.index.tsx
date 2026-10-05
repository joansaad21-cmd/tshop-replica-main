import { createFileRoute } from "@tanstack/react-router";
import { ProductPage } from "../components/shop/ProductPage";
export const Route = createFileRoute("/ventilador/")({
  head: () => ({ meta: [
    { title: "Kit 2 Ventiladores de Coluna 40 cm — Ofertas Tshop" },
    { name: "description", content: "Kit com dois ventiladores de coluna 40 cm Turbo 126W preto. Confira a oferta da Ofertas Tshop." },
    { property: "og:title", content: "Kit 2 Ventiladores de Coluna — Ofertas Tshop" },
    { property: "og:description", content: "Kit com dois ventiladores de coluna 40 cm Turbo 126W preto." },
    { property: "og:type", content: "product" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }), component: ProductPage,
});
