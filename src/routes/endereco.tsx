import { createFileRoute } from "@tanstack/react-router";
import { AddressPage } from "../components/shop/AddressPage";
export const Route = createFileRoute("/endereco")({
  head: () => ({ meta: [
    { title: "Adicionar endereço — Ofertas Tshop" },
    { name: "description", content: "Adicione um endereço de envio para conferir o pedido na Ofertas Tshop." },
    { property: "og:title", content: "Adicionar endereço — Ofertas Tshop" },
    { property: "og:description", content: "Informe um endereço de envio para o pedido de ventiladores." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }), component: AddressPage,
});
