import { useEffect, useRef, useState, type FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "../ui/button";
const states = "AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO".split(" ");
export function AddressPage() {
  const navigate = useNavigate();
  const [isDefault, setIsDefault] = useState(false);
  const [postal, setPostal] = useState("");
  const [postalStatus, setPostalStatus] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const input = (name: string, placeholder: string, required = true, type = "text") => <input aria-label={name} name={name} placeholder={placeholder} required={required} type={type} />;
  useEffect(() => {
    const digits = postal.replace(/\D/g, "");
    if (digits.length !== 8) {
      setPostalStatus("");
      return;
    }
    const controller = new AbortController();
    setPostalStatus("Buscando endereço pelo CEP...");
    fetch(`https://viacep.com.br/ws/${digits}/json/`, { signal: controller.signal })
      .then(response => response.ok ? response.json() : Promise.reject(new Error("CEP lookup failed")))
      .then(result => {
        if (result.erro) {
          setPostalStatus("CEP não encontrado. Confira os números ou preencha o endereço.");
          return;
        }
        const fields: Record<string, string> = {
          address: result.logradouro ?? "",
          district: result.bairro ?? "",
          city: result.localidade ?? "",
          state: result.uf ?? "",
        };
        for (const [name, value] of Object.entries(fields)) {
          const field = formRef.current?.elements.namedItem(name);
          if (field instanceof HTMLInputElement || field instanceof HTMLSelectElement) {
            if (value) field.value = value;
          }
        }
        setPostalStatus("Endereço preenchido pelo CEP.");
      })
      .catch(error => {
        if (error.name !== "AbortError") setPostalStatus("Não foi possível consultar o CEP. Preencha o endereço manualmente.");
      });
    return () => controller.abort();
  }, [postal]);
  const save = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const summary = `${form.get("address")}, ${form.get("number")} · ${form.get("district")} · ${form.get("city")}/${form.get("state")} · CEP ${form.get("postal")}`;
        sessionStorage.setItem("tshop-address", JSON.stringify({
          name: String(form.get("name") ?? ""),
          phone: String(form.get("phone") ?? ""),
          email: String(form.get("email") ?? ""),
          cpf: String(form.get("cpf") ?? ""),
          postal: String(form.get("postal") ?? ""),
          street: String(form.get("address") ?? ""),
          number: String(form.get("number") ?? ""),
          complement: String(form.get("complement") ?? ""),
          district: String(form.get("district") ?? ""),
          city: String(form.get("city") ?? ""),
          state: String(form.get("state") ?? ""),
          summary,
        }));
    navigate({ to: "/ventilador/checkout" });
  };
  return <main className="shop-shell address-page"><header className="checkout-header"><Button variant="ghost" size="icon" aria-label="Voltar" onClick={() => navigate({to:"/ventilador/checkout"})}><ArrowLeft size={21}/></Button><b>Adicionar o novo<br/>endereço</b></header><form ref={formRef} onSubmit={save}><div className="form-group-heading">Informações de contato</div>{input("name", "Nome completo")}<div className="phone-field"><span>BR&nbsp; +55</span>{input("phone", "Número de telefone", true, "tel")}</div>{input("email", "Email", true, "email")}<div className="form-group-heading">Informações de endereço</div><input aria-label="CEP/Código postal" name="postal" placeholder="CEP/Código postal" required minLength={9} maxLength={9} inputMode="numeric" autoComplete="postal-code" value={postal} onChange={event => { const value = event.target.value.replace(/\D/g, "").slice(0, 8); setPostal(value.length > 5 ? `${value.slice(0, 5)}-${value.slice(5)}` : value); }} />{postalStatus && <p className="form-hint" role="status">{postalStatus}</p>}<div className="form-inline"><select name="state" aria-label="Estado/UF" required defaultValue=""><option value="" disabled>Estado/UF</option>{states.map(s => <option key={s}>{s}</option>)}</select>{input("city", "Cidade")}</div>{input("district", "Bairro/Distrito")}{input("address", "Endereço")}{input("number", 'Nº da residência. Use "s/n" se nenhum')}{input("complement", "Apartamento, bloco, unidade etc. (opcional)", false)}<div className="form-group-heading">Informações fiscais</div>{input("cpf", "CPF")}<p className="form-hint">O CPF será usado para emitir faturas.</p><div className="form-group-heading">Configurações</div><label className="default-toggle">Definir como padrão <input type="checkbox" checked={isDefault} onChange={e => setIsDefault(e.target.checked)}/><span/></label><div className="address-spacer"/><div className="address-bottom"><p>Leia a <b>Política de privacidade da Ofertas Tshop</b> para saber mais sobre como usamos as suas informações pessoais.</p><Button type="submit" className="buy-button">Salvar</Button></div></form></main>;
}
