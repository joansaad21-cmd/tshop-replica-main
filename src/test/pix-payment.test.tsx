import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { PixPaymentPage } from "../components/shop/CheckoutPage";

function renderPayment(status = "PENDING") {
  const onCopy = vi.fn();
  const onRetry = vi.fn();
  render(
    <PixPaymentPage
      payment={{
        transactionId: "transaction-123",
        copyPaste: "00020101021226820014br.gov.bcb.pix",
        qrCode: "data:image/png;base64,cGxhaW4=",
        amount: 97.9,
      }}
      status={status}
      statusMessage="Aguardando confirmação do pagamento..."
      createdAt={new Date("2026-10-05T12:00:00")}
      copyMessage=""
      onCopy={onCopy}
      onBack={vi.fn()}
      onStore={vi.fn()}
      onRetry={onRetry}
    />,
  );
  return { onCopy, onRetry };
}

describe("PIX payment page", () => {
  it("shows the QR and copies the PIX code while payment is pending", () => {
    const { onCopy } = renderPayment();

    expect(screen.getByRole("heading", { name: "Aguardando o pagamento" })).toBeInTheDocument();
    expect(screen.getByText("R$ 97,90")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "QR Code para pagamento PIX" })).toBeInTheDocument();
    expect(screen.getByText("Gerado em", { exact: false })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Copiar" }));
    expect(onCopy).toHaveBeenCalledOnce();
  });

  it("offers a new PIX after an expired payment", () => {
    const { onRetry } = renderPayment("EXPIRED");

    expect(screen.getByRole("heading", { name: "PIX expirado" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Gerar novo PIX" }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it("shows the approved state without a copy action", () => {
    renderPayment("PAID");

    expect(screen.getByRole("heading", { name: "Pagamento aprovado" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Copiar" })).not.toBeInTheDocument();
  });
});
