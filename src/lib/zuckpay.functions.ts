import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const API = "https://www.zuckpay.com.br/conta";
const PRODUCT_PRICE = 109.9;
const EXTRA_PRICES = [49.9, 19.9, 19.9, 14.9];
const SHIPPING_PRICES = [0, 27.9, 47.9];

function getAuthorization() {
  const clientId = process.env["ZUCKPAY_CLIENT_ID"];
  const clientSecret = process.env["ZUCKPAY_CLIENT_SECRET"];
  if (!clientId || !clientSecret) throw new Error("Credenciais da ZuckPay não configuradas.");
  return `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`;
}

function validCpf(value: string) {
  const cpf = value.replace(/\D/g, "");
  if (cpf.length !== 11 || /^([0-9])\1+$/.test(cpf)) return false;
  const digit = (length: number) => {
    let sum = 0;
    for (let index = 0; index < length; index++) sum += Number(cpf[index]) * (length + 1 - index);
    const result = (sum * 10) % 11;
    return result === 10 ? 0 : result;
  };
  return digit(9) === Number(cpf[9]) && digit(10) === Number(cpf[10]);
}

const createPixSchema = z.object({
  name: z.string().trim().min(3).max(100),
  cpf: z.string().refine(validCpf, "CPF inválido."),
  email: z.string().trim().email().max(255),
  phone: z.string().refine(value => [10, 11].includes(value.replace(/\D/g, "").length)),
  voltage: z.enum(["110V", "220V"]),
  quantity: z.number().int().min(1).max(20),
  extraIndexes: z.array(z.number().int().min(0).max(3)).max(4)
    .refine(indexes => new Set(indexes).size === indexes.length),
  shippingIndex: z.number().int().min(0).max(2),
  externalIdClient: z.string().min(1).max(100).regex(/^[A-Za-z0-9._:-]+$/),
});

function record(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function responseData(value: unknown) {
  const root = record(value);
  const data = record(root.data);
  return Object.keys(data).length > 0 ? data : root;
}

function qrImage(value: unknown) {
  if (typeof value !== "string" || !value) return "";
  if (value.startsWith("data:") || /^https?:\/\//i.test(value)) return value;
  return `data:image/png;base64,${value}`;
}

export const createZuckPayPix = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => createPixSchema.parse(data))
  .handler(async ({ data }) => {
    const amount = Math.round((
      PRODUCT_PRICE * data.quantity +
      data.extraIndexes.reduce((sum, index) => sum + (EXTRA_PRICES[index] ?? 0), 0) +
      (SHIPPING_PRICES[data.shippingIndex] ?? 0)
    ) * 100) / 100;

    try {
      const response = await fetch(`${API}/v3/pix/qrcode`, {
        method: "POST",
        headers: {
          Authorization: getAuthorization(),
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          nome: data.name,
          cpf: data.cpf.replace(/\D/g, ""),
          email: data.email,
          telefone: data.phone.replace(/\D/g, ""),
          valor: amount,
          descricao: `Kit ventiladores ${data.voltage} - Pedido ${data.externalIdClient}`,
          external_id_client: data.externalIdClient,
        }),
        signal: AbortSignal.timeout(15000),
        redirect: "error",
      });
      const result = responseData(await response.json().catch(() => ({})));
      const transactionId = result.transactionId ?? result.id;
      if (!response.ok || transactionId == null || typeof result.qrcode !== "string" || !result.qrcode) {
        console.error("ZuckPay PIX creation failed", response.status);
        return { ok: false as const, error: "Não foi possível gerar o PIX. Confira seus dados e tente novamente." };
      }
      return {
        ok: true as const,
        transactionId: String(transactionId),
        copyPaste: result.qrcode,
        qrCode: qrImage(result.qrcode_image),
        amount,
      };
    } catch (error) {
      console.error("ZuckPay PIX request failed", error instanceof Error ? error.name : "Unknown error");
      return { ok: false as const, error: "Pagamento indisponível no momento. Tente novamente." };
    }
  });

const statusSchema = z.object({
  transactionId: z.string().min(1).max(100).regex(/^[A-Za-z0-9._:-]+$/),
});

export const checkZuckPayPix = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => statusSchema.parse(data))
  .handler(async ({ data }) => {
    try {
      const url = new URL(`${API}/v3/pix/status`);
      url.searchParams.set("transactionId", data.transactionId);
      const response = await fetch(url, {
        headers: { Authorization: getAuthorization(), Accept: "application/json" },
        signal: AbortSignal.timeout(10000),
        redirect: "error",
      });
      if (!response.ok) return { state: "PENDING" };
      const result = responseData(await response.json().catch(() => ({})));
      return { state: String(result.status ?? "PENDING").toUpperCase() };
    } catch {
      return { state: "PENDING" };
    }
  });