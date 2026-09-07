import Image from "next/image"

import { Button } from "@modules/common/components/ui"

const Hero = () => {
  return (
    <div className="w-full border-b border-ui-border-base bg-[#FFAD40]">
      <div className="content-container py-16 small:py-24 grid grid-cols-1 small:grid-cols-2 gap-10 items-center">
        <div className="flex flex-col gap-y-6">
          <span className="txt-small-plus text-[#010204] uppercase">
            Cerâmica artesanal brasileira
          </span>
          <h1 className="text-3xl small:text-5xl leading-tight text-[#010204] font-medium">
            Peças de cerâmica com cara, alma e rostinho.
          </h1>
          <p className="text-[#010204]/80 max-w-md text-lg">
            Cerami Mandy cria peças autênticas, criativas e únicas, feitas à
            mão por @mandyellow.jpg. Cada caneca e vasilha sai do ateliê com
            personalidade própria.
          </p>
          <div className="flex gap-x-4">
            <a href="#catalogo">
              <Button className="bg-[#010204] text-white hover:bg-[#010204]/90 border-none">
                Ver catálogo demo
              </Button>
            </a>
          </div>
        </div>
        <div className="flex justify-center small:justify-end">
          <Image
            src="/cerami/logo.jpg"
            alt="Logotipo da Cerami Mandy: rosto ilustrado sobre fundo laranja com lettering retrô"
            width={360}
            height={360}
            priority
            className="rounded-large w-56 small:w-80 h-auto"
          />
        </div>
      </div>
    </div>
  )
}

export default Hero
