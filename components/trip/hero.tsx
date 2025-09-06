export default function Hero({ name }: { name: string }) {
  return (
    <section className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 text-white p-6 md:p-8 shadow-sm">
      <h1 className="text-balance text-3xl md:text-4xl [font-family:var(--font-cursive)]">
        {`Welcome ${name} to TravelBud`}
      </h1>
      <p className="mt-2 max-w-xl text-white/90">
        Discover, plan and join memorable trips with your crew. Track destinations, dates and more.
      </p>
    </section>
  )
}
