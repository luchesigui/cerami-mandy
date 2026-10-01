"use client"

import { Popover, PopoverPanel, Transition } from "@headlessui/react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Fragment } from "react"

const SideMenuItems = {
  Início: "/",
  Peças: "/#catalogo",
  Sacola: "/sacola",
}

const CloseIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5" aria-hidden="true">
    <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
  </svg>
)

const SideMenu = () => {
  return (
    <div className="h-full">
      <div className="flex items-center h-full">
        <Popover className="h-full flex">
          {({ open, close }) => (
            <>
              <div className="relative flex h-full">
                <Popover.Button
                  data-testid="nav-menu-button"
                  className="relative h-full flex items-center px-6 transition-all ease-out duration-200 focus:outline-none text-sm uppercase text-white hover:text-[#FCAB42]"
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
                          <CloseIcon />
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
                      <p className="text-xs text-[#010204]/60 pt-2">
                        © {new Date().getFullYear()} Cerami Mandy. Todos os direitos reservados.
                      </p>
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
