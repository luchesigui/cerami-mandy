"use client"

import { Popover, PopoverPanel, Transition } from "@headlessui/react"
import useToggleState from "@lib/hooks/use-toggle-state"
import { ArrowRightMini, XMark } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Text, clx } from "@modules/common/components/ui"
import { Fragment } from "react"
import CountrySelect from "../country-select"
import LanguageSelect from "../language-select"
import { Locale } from "@lib/data/locales"


const SideMenuItems = {
  Início: "/",
  Loja: "/store",
  Conta: "/account",
  Carrinho: "/cart",
}

type SideMenuProps = {
  regions: HttpTypes.StoreRegion[] | null
  locales: Locale[] | null
  currentLocale: string | null
}

const SideMenu = ({ regions, locales, currentLocale }: SideMenuProps) => {
  const countryToggleState = useToggleState()
  const languageToggleState = useToggleState()

  return (
    <div className="h-full">
      <div className="flex items-center h-full">
        <Popover className="h-full flex">
          {({ open, close }) => (
            <>
              <div className="relative flex h-full">
                <Popover.Button
                  data-testid="nav-menu-button"
                  className="relative h-full flex items-center px-6 transition-all ease-out duration-200 focus:outline-none text-xs font-bold uppercase tracking-widest text-[#010204] hover:bg-[#FFCB98]/30"
                >
                  Menu
                </Popover.Button>
              </div>

              {open && (
                <div
                  className="fixed inset-0 z-[50] bg-black/40 backdrop-blur-sm pointer-events-auto"
                  onClick={close}
                  data-testid="side-menu-backdrop"
                />
              )}

              <Transition
                show={open}
                as={Fragment}
                enter="transition ease-out duration-200"
                enterFrom="-translate-x-full opacity-0"
                enterTo="translate-x-0 opacity-100"
                leave="transition ease-in duration-150"
                leaveFrom="translate-x-0 opacity-100"
                leaveTo="-translate-x-full opacity-0"
              >
                <PopoverPanel className="fixed inset-y-0 left-0 z-[51] w-full sm:w-[360px] h-screen bg-[#FFFDF9] text-[#010204] border-r border-[#010204] shadow-2xl flex flex-col justify-between overflow-y-auto">
                  <div data-testid="nav-menu-popup" className="flex flex-col h-full justify-between">
                    <div>
                      {/* Top bar com botão de fechar */}
                      <div className="flex items-center justify-between px-6 py-5 border-b border-[#010204] bg-[#FFFDF9]">
                        <span className="text-xs font-bold uppercase tracking-widest text-[#010204]">Navegação</span>
                        <button
                          data-testid="close-menu-button"
                          onClick={close}
                          className="text-[#010204] hover:opacity-70 transition-opacity p-1"
                          aria-label="Fechar menu"
                        >
                          <XMark />
                        </button>
                      </div>

                      {/* Lista de links com divisores wireframe */}
                      <ul className="flex flex-col divide-y divide-[#010204] border-b border-[#010204]">
                        {Object.entries(SideMenuItems).map(([name, href]) => {
                          return (
                            <li key={name}>
                              <LocalizedClientLink
                                href={href}
                                className="block px-6 py-4 text-lg font-bold uppercase tracking-wider text-[#010204] hover:bg-[#FFCB98]/30 transition-colors"
                                onClick={close}
                                data-testid={`${name.toLowerCase()}-link`}
                              >
                                {name}
                              </LocalizedClientLink>
                            </li>
                          )
                        })}
                      </ul>
                    </div>

                    {/* Rodapé do menu lateral */}
                    <div className="flex flex-col gap-y-4 p-6 border-t border-[#010204] bg-[#FFFDF9] text-xs">
                      {!!locales?.length && (
                        <div
                          className="flex justify-between items-center py-2 border-b border-[#010204]/20"
                          onMouseEnter={languageToggleState.open}
                          onMouseLeave={languageToggleState.close}
                        >
                          <LanguageSelect
                            toggleState={languageToggleState}
                            locales={locales}
                            currentLocale={currentLocale}
                          />
                          <ArrowRightMini
                            className={clx(
                              "transition-transform duration-150",
                              languageToggleState.state ? "-rotate-90" : ""
                            )}
                          />
                        </div>
                      )}
                      <div
                        className="flex justify-between items-center py-2 border-b border-[#010204]/20"
                        onMouseEnter={countryToggleState.open}
                        onMouseLeave={countryToggleState.close}
                      >
                        {regions && (
                          <CountrySelect
                            toggleState={countryToggleState}
                            regions={regions}
                          />
                        )}
                        <ArrowRightMini
                          className={clx(
                            "transition-transform duration-150",
                            countryToggleState.state ? "-rotate-90" : ""
                          )}
                        />
                      </div>
                      <Text className="txt-compact-small text-[#010204]/60 pt-2">
                        © {new Date().getFullYear()} Cerami Mandy. Todos os direitos reservados.
                      </Text>
                    </div>
                  </div>
                </PopoverPanel>
              </Transition>
            </>
          )}
        </Popover>
      </div>
    </div>
  )
}

export default SideMenu
