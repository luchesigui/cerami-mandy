// ponytail: dados mock locais e estáticos; catálogo real só quando o backend tiver os produtos.
export type MockProduct = {
  title: string
  price: string
  image: string
  alt: string
}

export const mockProducts: MockProduct[] = [
  {
    title: "Caneca Duo Carinhas",
    price: "R$ 189",
    image: "/cerami/produto-1.jpg",
    alt: "Duas canecas empilhadas, uma verde e uma azul, com rostinhos ilustrados",
  },
  {
    title: "Caneca Ondas",
    price: "R$ 159",
    image: "/cerami/produto-2.jpg",
    alt: "Caneca arredondada com faixas onduladas em verde, cinza e azul",
  },
  {
    title: "Caneca Corações",
    price: "R$ 169",
    image: "/cerami/produto-3.jpg",
    alt: "Duas canecas empilhadas, uma creme com corações vermelhos e outra amarela com rostinho",
  },
  {
    title: "Caneca Florinda",
    price: "R$ 149",
    image: "/cerami/produto-4.jpg",
    alt: "Caneca azul texturizada com motivos amarelos em relevo",
  },
  {
    title: "Vasilha Alice",
    price: "R$ 249",
    image: "/cerami/produto-5.jpg",
    alt: "Vasilha quadrada colorida inspirada em Alice no País das Maravilhas",
  },
  {
    title: "Caneca Bolinhas",
    price: "R$ 139",
    image: "/cerami/produto-6.jpg",
    alt: "Caneca baixa verde-azulada com saliências arredondadas",
  },
]
