import { loginAction } from "@/lib/auth/actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-lg border border-border bg-card p-8">
        <h1 className="mb-2 text-2xl font-bold text-foreground">Accedi</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Inserisci la password per accedere a Soli Projects.
        </p>

        <form action={loginAction}>
          <input type="hidden" name="next" value={params.next ?? "/"} />
          <input
            type="password"
            name="password"
            autoFocus
            required
            placeholder="Password"
            className="w-full rounded-md border border-input bg-background px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {params.error ? (
            <p className="mt-2 text-sm text-destructive">
              {params.error === "invalid" ? "Password errata" : "Errore di autenticazione"}
            </p>
          ) : null}
          <button
            type="submit"
            className="mt-4 w-full rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-primary/90"
          >
            Entra
          </button>
        </form>
      </div>
    </main>
  );
}
