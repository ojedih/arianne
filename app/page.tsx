import { Calendar, Car, Sparkles, Users } from "lucide-react";

const features = [
  {
    icon: Car,
    title: "Vehicle-aware booking",
    description:
      "Customers enter their vehicle details upfront so your team always knows exactly what's coming in.",
  },
  {
    icon: Calendar,
    title: "Real-time availability",
    description:
      "Smart scheduling respects your working hours, buffers, and capacity — no double-bookings.",
  },
  {
    icon: Sparkles,
    title: "Branded experience",
    description:
      "Each business gets a fully branded booking flow with custom colors and your own domain handle.",
  },
  {
    icon: Users,
    title: "Multi-tenant",
    description:
      "Manage multiple locations or businesses from one platform, each with isolated data and settings.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0c0c0c] text-[#f2ede4]">
      {/* Nav */}
      <header className="border-b border-[#1e1e1e] px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <span className="text-xl font-bold tracking-tight text-[#f2ede4]">
            Arianne
          </span>
          <a
            href="mailto:hello@arianne.app"
            className="text-sm font-medium text-[#c9a96e] hover:text-[#dbbf80] transition-colors"
          >
            Contact us
          </a>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1">
        <section className="max-w-6xl mx-auto px-6 pt-28 pb-24 text-center">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-[#c9a96e] bg-[#c9a96e]/10 border border-[#c9a96e]/20 px-3 py-1 rounded-full mb-8">
            Online booking for service businesses
          </span>
          <h1 className="text-5xl sm:text-6xl font-bold leading-tight tracking-tight max-w-3xl mx-auto text-[#f2ede4]">
            Let customers book
            <br />
            <span className="text-[#c9a96e]">in under a minute.</span>
          </h1>
          <p className="mt-6 text-lg text-[#7a7570] max-w-xl mx-auto leading-relaxed">
            Arianne gives your business a branded, mobile-ready booking page
            with smart scheduling, vehicle lookup, and automatic confirmations.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="mailto:hello@arianne.app"
              className="inline-flex items-center justify-center h-12 px-8 rounded-xl bg-[#c9a96e] text-[#0c0c0c] font-semibold text-base hover:bg-[#dbbf80] transition-colors"
            >
              Get early access
            </a>
            <a
              href="/demo/book/vehicle"
              className="inline-flex items-center justify-center h-12 px-8 rounded-xl border border-[#2a2a2a] text-[#a09890] font-semibold text-base hover:border-[#3a3a3a] hover:text-[#f2ede4] transition-colors"
            >
              See a demo
            </a>
          </div>
        </section>

        {/* Features */}
        <section className="max-w-6xl mx-auto px-6 pb-28">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="bg-[#131313] border border-[#1e1e1e] rounded-2xl p-6 flex flex-col gap-3 hover:border-[#2a2a2a] transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-[#c9a96e]/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-[#c9a96e]" strokeWidth={1.5} />
                </div>
                <h3 className="font-semibold text-[#f2ede4] text-sm">{title}</h3>
                <p className="text-[#6b6560] text-sm leading-relaxed">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1e1e1e] py-8 text-center text-sm text-[#3d3a38]">
        © {new Date().getFullYear()} Arianne. All rights reserved.
      </footer>
    </div>
  );
}
