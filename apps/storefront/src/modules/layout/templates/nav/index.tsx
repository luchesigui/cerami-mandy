import BagNavLink from "@modules/bag/components/bag-nav-link"
import SideMenu from "@modules/layout/components/side-menu"

export default function Nav() {
  const linkClassName =
    "h-full flex items-center px-5 sm:px-6 text-sm uppercase text-white hover:text-[#FCAB42] transition-colors"

  return (
    <div className="sticky top-0 inset-x-0 z-50 group">
      <header className="relative h-[50px] w-full bg-[#13110C]">
        <nav className="h-full flex items-stretch justify-between px-2 sm:px-4">
          <div className="flex items-stretch">
            <SideMenu />
          </div>

          <div className="flex items-stretch py-[5px]">
            <BagNavLink className={linkClassName} />
          </div>
        </nav>
      </header>
    </div>
  )
}
