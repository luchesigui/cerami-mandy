import Image from "next/image"

const Hero = () => {
  return (
    <section className="w-full bg-[#FCAB42] px-6 pb-14 pt-12 text-center text-[#13110C]">
      <h1 className="sr-only">Cerami Mandy</h1>
      <Image
        src="/cerami/logo-mark.png"
        alt="Logotipo da Cerami Mandy: rosto ilustrado com lettering retrô"
        width={495}
        height={440}
        priority
        className="mx-auto h-auto w-[180px] sm:w-[210px]"
      />
      <p className="mx-auto mt-9 max-w-[650px] text-sm leading-relaxed sm:text-base">
        Canecas únicas, cheias de personalidade e feitas 100% à mão por Amanda
        Yoshiizumi. Arte em cerâmica para quem quer transformar a hora do café
        e já não tem paciência para louça básica e sem graça.
      </p>
    </section>
  )
}

export default Hero
