import { createFileRoute } from "@tanstack/react-router";
import { CheckoutPage } from "../components/shop/CheckoutPage";
export const Route = createFileRoute("/ventilador/checkout")({
  head: () => ({ meta: [
    { title: "Checkout — Ofertas Tshop" },
    { name: "description", content: "Confira os itens, a entrega e o total do seu pedido na Ofertas Tshop." },
    { property: "og:title", content: "Checkout — Ofertas Tshop" },
    { property: "og:description", content: "Resumo do pedido do kit de ventiladores na Ofertas Tshop." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }), component: CheckoutPage,
});
