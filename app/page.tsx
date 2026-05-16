import Link from "next/link";
import SoundToggle from "./_shared/SoundToggle";

const GAMES = [
  {
    emoji: "🌍",
    title: "Pongo",
    subtitle: "Esplora il mondo",
    href: "/giochi/pianeta-pongo",
  },
  {
    emoji: "🧪",
    title: "Laboratorio",
    subtitle: "Combina gli atomi",
    href: "/giochi/laboratorio",
  },
  {
    emoji: "📐",
    title: "Geometria",
    subtitle: "Costruisci le forme",
    href: "/giochi/geometria",
  },
  {
    emoji: "⚙️",
    title: "La Macchina",
    subtitle: "Catene di reazioni",
    href: "/giochi/fisica",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-900 text-white px-6 py-10 flex flex-col items-center relative">
      <SoundToggle className="absolute top-4 right-4 text-2xl bg-white/10 hover:bg-white/20 rounded-full w-11 h-11 flex items-center justify-center transition" />

      <header className="text-center mb-10">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
          Giochi Lab
        </h1>
        <p className="mt-3 text-slate-300 text-base sm:text-lg">
          Quattro giochi per imparare giocando.
        </p>
      </header>

      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl">
        {GAMES.map((g) => (
          <li key={g.href}>
            <Link
              href={g.href}
              className="block rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 px-5 py-6 transition"
            >
              <div className="flex items-center gap-4">
                <span className="text-4xl" aria-hidden>
                  {g.emoji}
                </span>
                <div>
                  <div className="text-xl font-bold">{g.title}</div>
                  <div className="text-sm text-slate-300">{g.subtitle}</div>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      <footer className="mt-12 text-xs text-slate-500">
        v0 — Home base. Le pagine dei giochi vengono montate una alla volta.
      </footer>
    </main>
  );
}
