import StopSearchForm from "@/components/StopSearchForm";

export default function Home() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-16">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8 md:p-12">
        <p className="text-xs font-semibold uppercase tracking-wide text-halifax-blue sm:text-sm">
          Halifax Transit
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:mt-3 sm:text-4xl md:text-5xl">
          Find your next bus
        </h1>
        <p className="mt-3 max-w-xl text-base text-slate-600 sm:mt-4 sm:text-lg">
          Search by stop number to see real-time departures across Halifax.
        </p>

        <div className="mt-6 max-w-xl sm:mt-8">
          <StopSearchForm buttonLabel="View Departures" autoFocus />
        </div>
      </section>

      <section className="mt-6 grid gap-3 sm:mt-8 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
        {[
          {
            title: "Departures",
            description: "Live and scheduled buses for any stop.",
            href: "/departures",
          },
          {
            title: "Route Stats",
            description: "Headways, reliability, and daily trip counts.",
            href: "/route-stats",
          },
          {
            title: "Trip Planner",
            description: "Plan a trip between two Halifax stops.",
            href: "/trip-planner",
          },
        ].map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="block rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition active:scale-[0.99] hover:border-halifax-blue/40 hover:shadow-md sm:p-5"
          >
            <h2 className="font-semibold text-slate-900">{item.title}</h2>
            <p className="mt-2 text-sm text-slate-600">{item.description}</p>
          </a>
        ))}
      </section>
    </div>
  );
}