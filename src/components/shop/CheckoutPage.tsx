import { useEffect, useState } from "react";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Clock3,
  Copy,
  MapPin,
  Minus,
  Plus,
  QrCode,
  Smile,
} from "lucide-react";
import { Button } from "../ui/button";
import { business, extras, money, photos } from "../../lib/shop-data";
import { checkZuckPayPix, createZuckPayPix } from "../../lib/zuckpay.functions";

const shipping = [
  {
    name: "Frete grátis",
    provider: "Loggi",
    details: "1 a 2 dias úteis · chega de 6 a 7 de out.",
    price: 0,
  },
  {
    name: "Entrega rápida",
    provider: "",
    details: "3 a 6 dias úteis · chega de 8 a 13 de out.",
    price: 27.9,
  },
  {
    name: "Entrega expressa",
    provider: "",
    details: "2 a 5 dias úteis · chega de 7 a 12 de out.",
    price: 47.9,
  },
];
type CheckoutAddress = {
  name: string;
  phone: string;
  email: string;
  cpf: string;
  postal: string;
  street: string;
  number: string;
  complement: string;
  district: string;
  city: string;
  state: string;
  summary: string;
};
type PixPayment = { transactionId: string; copyPaste: string; qrCode: string; amount: number };

export function CheckoutPage() {
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as { voltagem?: string };
  const voltage = search.voltagem === "220V" ? "220V" : "110V";
  const [quantity, setQuantity] = useState(1);
  const [delivery, setDelivery] = useState(0);
  const [selected, setSelected] = useState<number[]>([]);
  const [address, setAddress] = useState<CheckoutAddress | null>(null);
  const [notice, setNotice] = useState("");
  const [pix, setPix] = useState<PixPayment | null>(null);
  const [showPaymentPage, setShowPaymentPage] = useState(false);
  const [pixCreatedAt, setPixCreatedAt] = useState<Date | null>(null);
  const [pixStatus, setPixStatus] = useState("PENDING");
  const [pixError, setPixError] = useState("");
  const [copyMessage, setCopyMessage] = useState("");
  const [creatingPix, setCreatingPix] = useState(false);
  const [externalIdClient, setExternalIdClient] = useState<string | null>(null);
  const createPix = useServerFn(createZuckPayPix);
  const checkPix = useServerFn(checkZuckPayPix);
  useEffect(() => {
    const saved = sessionStorage.getItem("tshop-address");
    if (!saved) return;
    try {
      const value = JSON.parse(saved) as Partial<CheckoutAddress>;
      setAddress({
        name: String(value.name ?? ""),
        phone: String(value.phone ?? ""),
        email: String(value.email ?? ""),
        cpf: String(value.cpf ?? ""),
        postal: String(value.postal ?? ""),
        street: String(value.street ?? ""),
        number: String(value.number ?? ""),
        complement: String(value.complement ?? ""),
        district: String(value.district ?? ""),
        city: String(value.city ?? ""),
        state: String(value.state ?? ""),
        summary: String(value.summary ?? saved),
      });
    } catch {
      setAddress({
        name: "",
        phone: "",
        email: "",
        cpf: "",
        postal: "",
        street: "",
        number: "",
        complement: "",
        district: "",
        city: "",
        state: "",
        summary: saved,
      });
    }
  }, []);
  const extrasPrice = selected.reduce((sum, i) => sum + (extras[i]?.price ?? 0), 0);
  const deliveryPrice = shipping[delivery]?.price ?? 0;
  const total = quantity * 109.9 + extrasPrice + deliveryPrice;
  const toggleExtra = (i: number) =>
    setSelected(selected.includes(i) ? selected.filter((x) => x !== i) : [...selected, i]);
  const order = async () => {
    if (!address?.name || !address.email || !address.phone || !address.cpf) {
      setNotice("Atualize seus dados de contato para gerar o PIX.");
      navigate({ to: "/endereco" });
      return;
    }
    const requestId = externalIdClient ?? `tshop-${crypto.randomUUID()}`;
    setExternalIdClient(requestId);
    setPixError("");
    setCopyMessage("");
    setCreatingPix(true);
    try {
      const result = await createPix({
        data: {
          name: address.name,
          phone: address.phone,
          email: address.email,
          cpf: address.cpf,
          voltage,
          quantity,
          extraIndexes: selected,
          shippingIndex: delivery,
          externalIdClient: requestId,
        },
      });
      if (!result.ok) {
        setPixError(result.error);
        return;
      }
      setPix(result);
      setPixCreatedAt(new Date());
      setPixStatus("PENDING");
      setShowPaymentPage(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setPixError("Não foi possível gerar o PIX. Confira os dados e tente novamente.");
    } finally {
      setCreatingPix(false);
    }
  };
  const copyPix = async () => {
    if (!pix) return;
    try {
      await navigator.clipboard.writeText(pix.copyPaste);
      setCopyMessage("Código PIX copiado.");
    } catch {
      setCopyMessage("Não foi possível copiar. Selecione o código acima.");
    }
  };
  useEffect(() => {
    if (!pix || pixStatus !== "PENDING") return;
    let active = true;
    const checkStatus = async () => {
      const result = await checkPix({ data: { transactionId: pix.transactionId } }).catch(
        () => null,
      );
      if (!active || !result) return;
      const status = result.state.toUpperCase();
      if (["PAID", "EXPIRED", "FAILED", "REFUSED"].includes(status)) setPixStatus(status);
    };
    void checkStatus();
    const timer = window.setInterval(() => void checkStatus(), 5000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [pix, pixStatus, checkPix]);
  const pixStatusMessage =
    pixStatus === "PAID"
      ? "Pagamento aprovado pela ZuckPay."
      : pixStatus === "EXPIRED"
        ? "Este PIX expirou. Gere uma nova cobrança."
        : ["FAILED", "REFUSED"].includes(pixStatus)
          ? "A cobrança não foi aprovada. Gere um novo PIX ou tente novamente."
          : "Aguardando confirmação do pagamento...";
  if (pix && showPaymentPage) {
    return (
      <PixPaymentPage
        payment={pix}
        status={pixStatus}
        statusMessage={pixStatusMessage}
        createdAt={pixCreatedAt}
        copyMessage={copyMessage}
        onCopy={() => void copyPix()}
        onBack={() => setShowPaymentPage(false)}
        onStore={() => navigate({ to: "/ventilador" })}
        onRetry={() => {
          setPix(null);
          setPixCreatedAt(null);
          setExternalIdClient(null);
          setPixStatus("PENDING");
          setShowPaymentPage(false);
        }}
      />
    );
  }
  return (
    <main className="shop-shell checkout-page">
      <header className="checkout-header">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate({ to: "/ventilador" })}
          aria-label="Voltar"
        >
          <ArrowLeft size={21} />
        </Button>
        <b>Ofertas Tshop</b>
      </header>
      <section className="address-bar">
        <MapPin size={18} />
        <b>Endereço de envio</b>
        <Link to="/endereco">{address?.summary ? "Alterar endereço" : "+ Adicionar endereço"}</Link>
        {address?.summary && <p>{address.summary}</p>}
        {notice && <p className="address-error">{notice}</p>}
      </section>
      <div className="color-divider" />
      <section className="checkout-block order-product">
        <div className="checkout-section-head">
          <b>Ofertas Tshop</b>
          <span>
            Adicionar nota <ChevronRight size={14} />
          </span>
        </div>
        <div className="product-order-row">
          <img src={photos[0]} alt="Kit de 2 ventiladores" />
          <div className="order-details">
            <p>Kit 2 Ventiladores de Coluna 40 cm — {voltage}</p>
            <span className="flash-tag">⚡ Oferta Relâmpago 17:24:16</span>
            <small className="return-label">◉ Devolução gratuita</small>
            <strong>
              {money(109.9)} <span>🎟</span>
            </strong>
            <div className="order-pricing">
              <del>R$ 279,90</del> <em>-61%</em>
            </div>
          </div>
          <div className="quantity">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Diminuir quantidade"
              disabled={quantity <= 1}
              onClick={() => setQuantity(quantity - 1)}
            >
              <Minus size={14} />
            </Button>
            <span>{quantity}</span>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Aumentar quantidade"
              onClick={() => setQuantity(quantity + 1)}
            >
              <Plus size={14} />
            </Button>
          </div>
        </div>
        <h3>Opções de entrega</h3>
        <div className="shipping-options">
          {shipping.map((item, i) => (
            <label className={`shipping-option ${delivery === i ? "active" : ""}`} key={item.name}>
              <input
                type="radio"
                name="shipping"
                checked={delivery === i}
                onChange={() => setDelivery(i)}
              />
              <div>
                <b>{item.name}</b> <span>· {item.provider}</span>
                <small>{item.details}</small>
              </div>
              <strong>
                {i === 0 ? (
                  <>
                    <del>R$ 26,60</del>Grátis
                  </>
                ) : (
                  money(item.price)
                )}
              </strong>
            </label>
          ))}
        </div>
      </section>
      <section className="checkout-block extras-block">
        <h2>🧰 Leve junto com desconto</h2>
        <p>Só nesta compra. Toque para adicionar ao pedido.</p>
        <div className="extras-list">
          {extras.map((item, i) => (
            <label
              className={`extra-option ${selected.includes(i) ? "active" : ""}`}
              key={item.name}
            >
              <img src={item.image} alt="" />
              <div>
                <b>{item.name.replace("110V", voltage)}</b>
                <p>{item.description.replace("110V", voltage)}</p>
                <div>
                  <del>R$ {item.old}</del> <strong>+ {money(item.price)}</strong>{" "}
                  <em>{item.discount}</em>
                </div>
              </div>
              <input
                type="checkbox"
                checked={selected.includes(i)}
                onChange={() => toggleExtra(i)}
                aria-label={`Adicionar ${item.name}`}
              />
            </label>
          ))}
        </div>
      </section>
      <section className="checkout-block discount-block">
        <h2>Desconto da Ofertas Tshop</h2>
        <p>
          Frete grátis <span>- R$ 170,00</span>
        </p>
      </section>
      <section className="checkout-block summary">
        <h2>Resumo do pedido</h2>
        <div>
          <span>Itens adicionais ({selected.length})</span>
          <span>+ {money(extrasPrice)}</span>
        </div>
        <div>
          <span>Subtotal do produto</span>
          <span>{money(quantity * 109.9)}</span>
        </div>
        <div>
          <span>Preço original</span>
          <span>{money(quantity * 279.9)}</span>
        </div>
        <div>
          <span>Desconto no produto</span>
          <span>- {money(quantity * 170)}</span>
        </div>
        <div>
          <span>Subtotal do envio</span>
          <span>{money(deliveryPrice)}</span>
        </div>
        <div>
          <span>Taxa de envio</span>
          <span>{money(delivery === 0 ? 26.6 : deliveryPrice)}</span>
        </div>
        <div>
          <span>Desconto de envio</span>
          <span>- {money(delivery === 0 ? 26.6 : 0)}</span>
        </div>
        <div className="summary-total">
          <b>Total</b>
          <strong>{money(total)}</strong>
        </div>
        <small>Impostos inclusos</small>
      </section>
      <section className="checkout-block payment">
        <h2>Forma de pagamento</h2>
        <div className="payment-row">
          <div className="pix-icon">◆</div>
          <div>
            <b>Pix</b>
            <p>Pagamento instantâneo · Aprovação em segundos</p>
          </div>
          <span>✓</span>
        </div>
        {pix && (
          <div className="pix-result" aria-live="polite">
            <strong>{pixStatus === "PAID" ? "Pagamento aprovado" : "Pague com Pix"}</strong>
            <span>Total da cobrança: {money(pix.amount)}</span>
            {pixStatus !== "PAID" && pix.qrCode && <img src={pix.qrCode} alt="QR Code Pix" />}
            {pixStatus !== "PAID" && <code>{pix.copyPaste}</code>}
            {pixStatus !== "PAID" && (
              <Button className="buy-button" onClick={() => void copyPix()}>
                <Copy size={16} /> Copiar código Pix
              </Button>
            )}
            {copyMessage && <p role="status">{copyMessage}</p>}
            <p role="status">{pixStatusMessage}</p>
            {["EXPIRED", "FAILED", "REFUSED"].includes(pixStatus) && (
              <Button
                variant="outline"
                onClick={() => {
                  setPix(null);
                  setExternalIdClient(null);
                  setPixStatus("PENDING");
                }}
              >
                Gerar novo Pix
              </Button>
            )}
          </div>
        )}
        {pixError && (
          <p className="pix-error" role="alert">
            {pixError}
          </p>
        )}
      </section>
      <p className="terms">
        Ao fazer um pedido, você concorda com os Termos de uso e venda da Ofertas Tshop e reconhece
        que leu e concordou com a Política de privacidade da Ofertas Tshop.
      </p>
      <footer className="business">{business}</footer>
      <div className="checkout-bottom">
        <div className="savings">
          <Smile size={14} /> Você está economizando {money(quantity * 196.6)} nesse pedido.
        </div>
        <div className="bottom-total">
          <b>
            Total ({quantity + selected.length}{" "}
            {quantity + selected.length === 1 ? "item" : "itens"})
          </b>
          <strong>{money(pix?.amount ?? total)}</strong>
        </div>
        <Button
          className="buy-button order-button"
          onClick={() => void order()}
          disabled={creatingPix || Boolean(pix)}
        >
          {creatingPix
            ? "Gerando Pix..."
            : pix
              ? pixStatus === "PAID"
                ? "Pagamento aprovado"
                : "Pix gerado"
              : "Fazer pedido"}
          <small>{pix ? "Aguardando pagamento" : "O cupom expira em 17:24:16"}</small>
        </Button>
      </div>
    </main>
  );
}

type PixPaymentPageProps = {
  payment: PixPayment;
  status: string;
  statusMessage: string;
  createdAt: Date | null;
  copyMessage: string;
  onCopy: () => void;
  onBack: () => void;
  onStore: () => void;
  onRetry: () => void;
};

export function PixPaymentPage({
  payment,
  status,
  statusMessage,
  createdAt,
  copyMessage,
  onCopy,
  onBack,
  onStore,
  onRetry,
}: PixPaymentPageProps) {
  const paid = status === "PAID";
  const expired = status === "EXPIRED";
  const failed = ["FAILED", "REFUSED"].includes(status);
  const pending = !paid && !expired && !failed;
  const heading = paid
    ? "Pagamento aprovado"
    : expired
      ? "PIX expirado"
      : failed
        ? "Pagamento não confirmado"
        : "Aguardando o pagamento";
  const createdLabel = createdAt?.toLocaleString("pt-BR", {
    dateStyle: "long",
    timeStyle: "short",
  });

  return (
    <main className="shop-shell pix-payment-page">
      <header className="payment-header">
        <Button variant="ghost" size="icon" onClick={onBack} aria-label="Voltar ao checkout">
          <ArrowLeft size={21} />
        </Button>
        <b>Código do pagamento</b>
      </header>
      <section className="pix-payment-summary" aria-live="polite">
        <div className="pix-payment-status">
          <div>
            <h1>{heading}</h1>
            <strong>{money(payment.amount)}</strong>
          </div>
          <span
            className={`payment-status-icon ${paid ? "is-paid" : failed || expired ? "has-error" : "is-pending"}`}
          >
            {paid ? (
              <CheckCircle2 size={22} />
            ) : failed || expired ? (
              <CircleAlert size={22} />
            ) : (
              <Clock3 size={22} />
            )}
          </span>
        </div>
        <div className="pix-payment-meta">
          {pending && (
            <span className="pix-pending-label">
              <Clock3 size={13} /> Aguardando confirmação
            </span>
          )}
          {createdLabel && <p>Gerado em {createdLabel}</p>}
        </div>
      </section>
      <section className="pix-payment-card" aria-label="Pagamento via PIX">
        <div className="pix-card-label">
          <QrCode size={19} />
          <b>PIX</b>
        </div>
        {pending && payment.qrCode ? (
          <img className="payment-qr-code" src={payment.qrCode} alt="QR Code para pagamento PIX" />
        ) : pending ? (
          <div className="payment-qr-missing">
            <QrCode size={34} />
            <span>QR Code indisponível. Use o código PIX abaixo.</span>
          </div>
        ) : (
          <div className={`payment-result-icon ${paid ? "is-paid" : "has-error"}`}>
            {paid ? <CheckCircle2 size={34} /> : <CircleAlert size={34} />}
          </div>
        )}
        <code className="payment-copy-code" title={payment.copyPaste}>
          {payment.copyPaste}
        </code>
        {pending && (
          <Button className="pix-copy-button" onClick={onCopy}>
            <Copy size={16} />
            Copiar
          </Button>
        )}
        {copyMessage && (
          <p className="payment-copy-message" role="status">
            {copyMessage}
          </p>
        )}
        <p className="payment-status-message" role="status">
          {statusMessage}
        </p>
        {(expired || failed) && (
          <Button variant="outline" className="pix-retry-button" onClick={onRetry}>
            Gerar novo PIX
          </Button>
        )}
      </section>
      <section className="pix-instructions">
        <h2>Como fazer pagamentos com PIX?</h2>
        <p>
          Copie o código de pagamento acima, selecione Pix no seu app de internet ou de banco e cole
          o código. Ou escaneie o QR Code.
        </p>
      </section>
      <footer className="pix-payment-bottom">
        <Button variant="ghost" onClick={onStore}>
          Voltar à loja
        </Button>
      </footer>
    </main>
  );
}
