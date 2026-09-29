import React, { Suspense } from "react"

import ImageGallery from "@modules/products/components/image-gallery"
import ProductActions from "@modules/products/components/product-actions"
import ProductOnboardingCta from "@modules/products/components/product-onboarding-cta"
import ProductTabs from "@modules/products/components/product-tabs"
import RelatedProducts from "@modules/products/components/related-products"
import ProductInfo from "@modules/products/templates/product-info"
import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products"
import { notFound } from "next/navigation"
import { HttpTypes } from "@medusajs/types"

import ProductActionsWrapper from "./product-actions-wrapper"

type ProductTemplateProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  countryCode: string
  images: HttpTypes.StoreProductImage[]
}

const ProductTemplate: React.FC<ProductTemplateProps> = ({
  product,
  region,
  countryCode,
  images,
}) => {
  if (!product || !product.id) {
    return notFound()
  }

  return (
    <>
      <div
        className="content-container  flex flex-col small:flex-row small:items-start py-6 relative"
        data-testid="product-container"
      >
        <div className="flex flex-col small:sticky small:top-48 small:py-0 small:max-w-[300px] w-full py-8 gap-y-6">
          <ProductInfo product={product} />
          <ProductTabs product={product} />
        </div>
        <div className="block w-full relative">
          <ImageGallery images={images} />
        </div>
        <div className="flex flex-col small:sticky small:top-48 small:py-0 small:max-w-[300px] w-full py-8 gap-y-12">
          <ProductOnboardingCta />
          <Suspense
            fallback={
              <ProductActions
                disabled={true}
                product={product}
                region={region}
              />
            }
          >
            <ProductActionsWrapper id={product.id} region={region} />
          </Suspense>
        </div>
      </div>
      <section className="border-t border-[#13110C]/10 bg-white px-6 py-12 lg:px-12 xl:px-16">
        <div className="mx-auto max-w-[1440px]">
          <h2 className="mb-5 text-sm font-bold uppercase tracking-wider text-[#13110C]">
            INFORMAÇÕES ADICIONAIS
          </h2>
          <div className="max-w-4xl space-y-4 text-sm leading-relaxed text-[#13110C]">
            <p>
              <strong className="font-bold">✨ 100% Modelada e Pintada à Mão:</strong>{" "}
              Da modelagem inicial de cada curva aos detalhes minuciosos da pintura, tudo foi feito manualmente. É uma escultura utilitária criada sem moldes industriais — o que significa formas orgânicas, personalidade viva e a certeza de que é uma peça absolutamente única no mundo, assim como você!
            </p>
            <p>
              <strong className="font-bold">Material:</strong> Cerâmica de alta temperatura.
            </p>
            <p>
              <strong className="font-bold">Cuidados:</strong> Para conservar a peça, lave com água, sabão neutro e esponja macia, evitando o uso de produtos abrasivos. Pode ir na máquina de lavar e no microondas.
            </p>
          </div>
        </div>
      </section>
      <div
        className="content-container my-16 small:my-32"
        data-testid="related-products-container"
      >
        <Suspense fallback={<SkeletonRelatedProducts />}>
          <RelatedProducts product={product} countryCode={countryCode} />
        </Suspense>
      </div>
    </>
  )
}

export default ProductTemplate
