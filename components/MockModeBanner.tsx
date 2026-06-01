export function MockModeBanner() {
  return (
    <div
      className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
      role="status"
    >
      <strong>Mock mode:</strong> Set <code className="rounded bg-amber-100 px-1">GROQ_API_KEY</code> in{" "}
      <code className="rounded bg-amber-100 px-1">.env.local</code> for live LLM analysis. Using
      sample mock data until then.
    </div>
  );
}
