import React from "react"

type SectionHeaderProps = {
  title: string
  subtitle?: string
  counter?: string
}

export default function SectionHeader({
  title,
  subtitle,
  counter,
}: SectionHeaderProps) {
  return (
    <div className="w-full border-b border-[#010204] bg-[#FFFDF9] py-3.5 px-6 sm:px-10 flex items-center justify-between uppercase text-xs sm:text-sm font-extrabold tracking-widest text-[#010204]">
      <div className="flex items-center gap-2">
        <span className="text-[#E87978] font-black">✦</span>
        <span>{subtitle || "SEÇÃO"}</span>
      </div>

      <h2 className="text-center text-sm sm:text-base font-black tracking-widest">
        [ {title} ]
      </h2>

      <div className="flex items-center gap-2 text-xs font-bold text-[#010204]/60">
        <span>{counter || "DISPONÍVEL"}</span>
      </div>
    </div>
  )
}
