type PageShellProps = {
  title: string;
  description: string;
  children: React.ReactNode;
};

export default function PageShell({
  title,
  description,
  children,
}: PageShellProps) {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          {title}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">
          {description}
        </p>
      </div>
      {children}
    </div>
  );
}