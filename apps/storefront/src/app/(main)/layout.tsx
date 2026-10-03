import Footer from "@modules/layout/templates/footer"
import Nav from "@modules/layout/templates/nav"

export default function PageLayout(props: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Nav />
      <main className="relative flex-1">{props.children}</main>
      <Footer />
    </div>
  )
}
