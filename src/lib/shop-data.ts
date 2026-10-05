const productImagePath = "/assets/img/produtos/ventilador";
const complementImagePath = "/assets/img/complementos";

export const photos = Array.from({ length: 7 }, (_, index) => `${productImagePath}/galeria-${index + 1}.webp`);
export const shopLogo = "/assets/img/logo-loja.png";
export const extras = [
  { name: "+1 ventilador 110V (fica com 3)", description: "Mais um ventilador de coluna na mesma voltagem do seu pedido: você fica com 3.", old: "139,95", price: 49.9, image: `${productImagePath}/galeria-4.webp`, discount: "-64%" },
  { name: "Extensão elétrica de 5 m", description: "Cabo de 5 m para ligar o ventilador longe da tomada.", old: "65,90", price: 19.9, image: `${complementImagePath}/extensao-eletrica-e76be31a8f.jpg`, discount: "-70%" },
  { name: "Filtro de linha de 4 tomadas", description: "Liga vários aparelhos numa tomada só, com chave liga/desliga.", old: "65,90", price: 19.9, image: `${complementImagePath}/filtro-linha-0e9ce97ae0.jpg`, discount: "-70%" },
  { name: "Kit 2 capas protetoras", description: "Duas capas para proteger os ventiladores do pó quando não estão em uso.", old: "49,90", price: 14.9, image: `${complementImagePath}/capas-ae5332ee60.jpg`, discount: "-70%" },
];
export const money = (value: number) => `R$ ${value.toFixed(2).replace('.', ',')}`;
export const business = "LOJA DA FERRAMENTARIA LTDA · CNPJ 28.632.062/0001-35";
