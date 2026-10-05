import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Bookmark, ChevronLeft, ChevronRight, Grid2X2, ShieldCheck, Store, Ticket, Truck, X } from "lucide-react";
import { Button } from "../ui/button";
import { business, photos, shopLogo } from "../../lib/shop-data";

export function ProductPage() {
  const navigate = useNavigate();
  const [photo, setPhoto] = useState(0);
  const [voltage, setVoltage] = useState<"110V" | "220V">("110V");
  const [saved, setSaved] = useState(false);
  const [gallery, setGallery] = useState(false);
  const checkout = () => navigate({ to: "/ventilador/checkout", search: { voltagem: voltage } });
  return <main className="shop-shell product-page">
    <nav className="product-tabs"><span>Visão geral</span><a href="#avaliacoes">Avaliações</a><a href="#descricao">Descrição</a></nav>
    <div className="hero-photo" onClick={() => setGallery(true)} role="button" tabIndex={0} onKeyDown={e => { if (e.key === "Enter") setGallery(true); }} aria-label="Abrir fotos do produto">
      <img src={photos[photo]} alt={`Kit de dois ventiladores, foto ${photo + 1}`} />
      <span className="photo-count">{photo + 1}/{photos.length}</span>
    </div>
    <div className="flash"><div><strong><span className="mini-badge">-61%</span> <small>R$</small>109<sup>,90</sup> <Ticket size={13}/></strong><del>R$ 279,90</del></div><div className="flash-right"><b>⚡ Oferta Relâmpago</b><small>Termina em: 17:24:24</small></div></div>
    <section className="product-title"><p className="sale-note"><Ticket size={13} fill="currentColor"/> Desconto máximo de R$ 170,00 aplicado</p><div className="title-line"><h1>Kit 2 Ventiladores de Coluna 40 cm Turbo 126W Preto — Compre 1 Leve 2 — {voltage}...</h1><Button variant="ghost" size="icon" aria-label={saved ? "Remover dos favoritos" : "Adicionar aos favoritos"} onClick={() => setSaved(!saved)}><Bookmark size={20} fill={saved ? "currentColor" : "none"}/></Button></div></section>
    <section className="white-section variants"><p>Voltagem: <b>{voltage}</b></p><div className="variant-buttons">{(["110V", "220V"] as const).map(v => <Button key={v} variant="outline" className={voltage === v ? "selected" : ""} onClick={() => setVoltage(v)}>{v}</Button>)}</div></section>
    <section className="white-section info-lines"><div className="info-row"><Truck size={17}/><div><p><span className="green-label">Frete grátis</span> <del>R$ 26,60</del></p><b>Receba até 9 – 15 de out.</b></div><ChevronRight size={18}/></div><div className="info-row"><Grid2X2 size={17}/><img src={photos[0]} alt=""/><span>Selecionado: Voltagem: {voltage}</span><ChevronRight size={18}/></div><div className="info-row protection"><ShieldCheck size={18}/><div><b>Proteção do cliente</b><p>✓ Devolução gratuita　✓ Reembolso se algo der errado</p><p>✓ Pagamento seguro　✓ Se o seu pedido não for enviado no prazo</p></div><ChevronRight size={18}/></div></section>
    <section className="white-section reviews" id="avaliacoes"><div className="section-heading"><h2>Avaliações dos clientes (0)</h2><span>Ver mais <ChevronRight size={16}/></span></div><div className="empty-reviews"><b>Ainda não há avaliações</b><p>Este produto é novo na loja. As primeiras avaliações aparecem aqui assim que os clientes receberem o pedido.</p></div></section>
    <section className="white-section seller"><img src={shopLogo} alt="Logo Ofertas Tshop"/><div><h2>Ofertas Tshop</h2><span>Loja oficial</span><p>Envio com código de rastreio<br/>Pagamento por Pix aprovado na hora</p></div></section>
    <section className="white-section description" id="descricao"><h2>Sobre este produto</h2><h3>Detalhes</h3><p className="detail-row">Quantidade por embalagem <strong>2</strong></p><h3>Descrição</h3><p>Kit 2 Ventiladores de Coluna 40 cm Turbo 126W Preto — Compre 1 Leve 2 — {voltage}</p><p>Mantenha seus ambientes sempre frescos com este kit contendo 2 ventiladores de coluna de alta potência. Com 126W de desempenho e hélice de 6 pás, proporciona excelente vazão de ar para residências, escritórios, comércios, salões e diversos outros ambientes. Possui 3 velocidades e altura regulável para direcionar o fluxo de ar com mais conforto e eficiência.</p><h3>Principais características</h3><p>• Kit com 2 ventiladores de coluna.<br/>• Potência de 126W.<br/>• Hélice com 6 pás.<br/>• 3 níveis de velocidade.<br/>• Altura ajustável (85 cm a 105 cm).<br/>• Cor: Preto.</p><h3>O que vem na caixa</h3><p>• 2 ventiladores de coluna 126W<br/>• 1 manual de instruções</p><h3>Fotos do produto</h3>{photos.map((src, i) => <img className="description-photo" src={src} alt={`Detalhe ${i + 1} dos ventiladores`} key={src}/>)}</section>
    <footer className="business">{business}</footer>
    <div className="product-bottom"><Button variant="ghost" className="store-button" aria-label="Loja" onClick={() => window.scrollTo({top:0, behavior:"smooth"})}><Store size={22}/><small>Loja</small></Button><Button className="cart-button" onClick={checkout}>Adicionar<br/>ao carrinho</Button><Button className="buy-button" onClick={checkout}>Comprar agora<small>Frete grátis</small></Button></div>
    {gallery && <div className="gallery-overlay"><div className="gallery-top"><Button variant="ghost" size="icon" aria-label="Fechar galeria" onClick={() => setGallery(false)}><X/></Button><span>{photo + 1}/{photos.length}</span></div><img src={photos[photo]} alt={`Foto ${photo + 1} do kit de ventiladores`}/><div className="gallery-controls"><Button variant="outline" size="icon" aria-label="Foto anterior" onClick={() => setPhoto((photo + 6) % 7)}><ChevronLeft/></Button><Button variant="outline" size="icon" aria-label="Próxima foto" onClick={() => setPhoto((photo + 1) % 7)}><ChevronRight/></Button></div><div className="thumbs">{photos.map((src, i) => <Button variant="ghost" key={src} className={photo === i ? "active" : ""} onClick={() => setPhoto(i)} aria-label={`Foto ${i + 1}`}><img src={src} alt=""/></Button>)}</div></div>}
  </main>;
}
