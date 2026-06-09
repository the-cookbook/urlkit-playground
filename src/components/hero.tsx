import { playgroundHero } from "@/data/copies"

export function Hero() {
  return (
    <section>
      <div className="mb-2 space-y-3">
        <h2 className="text-4xl font-semibold tracking-tight md:text-6xl">
          {playgroundHero.title}
        </h2>
        <p className="max-w-4xl text-base text-muted-foreground md:text-lg">
          {playgroundHero.description}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {playgroundHero.badges.map((badge) => (
          <span
            key={badge}
            className="rounded-full border bg-background px-3 py-1 text-xs font-semibold text-muted-foreground"
          >
            {badge}
          </span>
        ))}
      </div>
    </section>
  )
}
