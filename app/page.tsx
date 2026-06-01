import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function LandingPage() {
  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Tailor your resume to any job—truthfully
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          Resume Shapeshifter scores how well your resume matches a job description,
          rewrites bullets with evidence-backed language, surfaces honest gaps, and
          exports a side-by-side PDF proof artifact.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/tailor">
            <Button>Start tailoring</Button>
          </Link>
          <Link href="/tailor?sample=1">
            <Button variant="outline">Load sample data</Button>
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Match scoring</CardTitle>
            <CardDescription>Before and after alignment estimates with explanations.</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Bullet rewrites</CardTitle>
            <CardDescription>Per-bullet reasons, keywords, and confidence levels.</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Gap analysis</CardTitle>
            <CardDescription>Actionable gaps—never silent fabrication.</CardDescription>
          </CardHeader>
        </Card>
      </section>

      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-base">Current build: Phase 3</CardTitle>
          <CardDescription>
            Live LLM analysis when GROQ_API_KEY is set; falls back to mock data
            otherwise. Dynamic PDF export is fully supported.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          See <code className="rounded bg-muted px-1">docs/implementation-plan.md</code> for
          the full roadmap.
        </CardContent>
      </Card>
    </div>
  );
}
