export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="rounded-full border border-black/10 px-3 py-1 text-xs font-medium tracking-wide text-foreground/60 dark:border-white/15">
          Cloudflare Workers · OpenNext
        </span>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">copenhagen</h1>
        <p className="max-w-md text-balance text-foreground/70">
          Next.js (App Router) を OpenNext で Cloudflare Workers 上にデプロイする最小スターターです。
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
        <a
          className="rounded-md bg-foreground px-4 py-2 font-medium text-background transition-opacity hover:opacity-90"
          href="https://opennext.js.org/cloudflare"
          target="_blank"
          rel="noopener noreferrer"
        >
          OpenNext ドキュメント
        </a>
        <a
          className="rounded-md border border-black/10 px-4 py-2 font-medium transition-colors hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
          href="/api/hello"
        >
          /api/hello を試す
        </a>
      </div>

      <code className="mt-4 rounded bg-black/5 px-2 py-1 text-xs text-foreground/70 dark:bg-white/10">
        bun run preview
      </code>
    </main>
  );
}
