
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-brand-brown">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-brand-orange mb-8 text-center">
          Welcome to Kusina de Amadeo
        </h1>

        <div className="flex flex-col gap-4 items-center">
          <button className="btn-primary">
            Primary Button
          </button>

          <button className="btn-secondary">
            Secondary Button
          </button>

          <p className="text-white mt-4">
            Testing our brand colors and TailwindCSS configuration
          </p>
        </div>
      </div>
    </main>
  );
}
