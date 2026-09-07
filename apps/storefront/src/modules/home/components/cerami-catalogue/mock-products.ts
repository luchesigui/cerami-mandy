// ponytail: dados mock locais e estáticos; catálogo real só quando o backend tiver os produtos.
export type MockProduct = {
  handle: string
  title: string
  price: string
  image: string
  alt: string
  description: string
}

export const mockProducts: MockProduct[] = [
  {
    handle: "caneca-duo-carinhas",
    title: "Caneca Duo Carinhas",
    price: "R$ 189",
    image: "/cerami/produto-1.jpg",
    alt: "Duas canecas empilhadas, uma verde e uma azul, com rostinhos ilustrados",
    description:
      "Par de canecas empilháveis com rostinhos ilustrados à mão. Peça demonstrativa da coleção Cerami Mandy.",
  },
  {
    handle: "caneca-ondas",
    title: "Caneca Ondas",
    price: "R$ 159",
    image: "/cerami/produto-2.jpg",
    alt: "Caneca arredondada com faixas onduladas em verde, cinza e azul",
    description:
      "Caneca arredondada com faixas onduladas em tons de verde, cinza e azul. Peça demonstrativa da coleção Cerami Mandy.",
  },
  {
    handle: "caneca-coracoes",
    title: "Caneca Corações",
    price: "R$ 169",
    image: "/cerami/produto-3.jpg",
    alt: "Duas canecas empilhadas, uma creme com corações vermelhos e outra amarela com rostinho",
    description:
      "Dupla de canecas com corações vermelhos e rostinho amarelo. Peça demonstrativa da coleção Cerami Mandy.",
  },
  {
    handle: "caneca-florinda",
    title: "Caneca Florinda",
    price: "R$ 149",
    image: "/cerami/produto-4.jpg",
    alt: "Caneca azul texturizada com motivos amarelos em relevo",
    description:
      "Caneca azul texturizada com motivos amarelos em relevo. Peça demonstrativa da coleção Cerami Mandy.",
  },
  {
    handle: "vasilha-alice",
    title: "Vasilha Alice",
    price: "R$ 249",
    image: "/cerami/produto-5.jpg",
    alt: "Vasilha quadrada colorida inspirada em Alice no País das Maravilhas",
    description:
      "Vasilha quadrada colorida inspirada em Alice no País das Maravilhas. Peça demonstrativa da coleção Cerami Mandy.",
  },
  {
    handle: "caneca-bolinhas",
    title: "Caneca Bolinhas",
    price: "R$ 139",
    image: "/cerami/produto-6.jpg",
    alt: "Caneca baixa verde-azulada com saliências arredondadas",
    description:
      "Caneca baixa verde-azulada com saliências arredondadas. Peça demonstrativa da coleção Cerami Mandy.",
  },
]

export const getMockProduct = (handle: string) =>
  mockProducts.find((p) => p.handle === handle)
