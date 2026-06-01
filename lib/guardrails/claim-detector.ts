import type { ResumeProfile } from "@/lib/schemas";

export interface BulletRisk {
  type: "metric" | "technology" | "leadership" | "employer" | "education";
  message: string;
  severity: "high" | "medium" | "low";
}

/**
 * Normalizes entity names (companies, schools, etc.) for stable matching.
 */
function normalizeEntityName(name: string): string {
  return name.toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
    .replace(/\b(llc|inc|corp|corporation|ltd|co|limited|gmbh|sa|pvt|pty)\b/gi, "")
    .trim();
}

/**
 * Extracts all numbers, percentages, and currencies from a string.
 */
function extractMetrics(text: string): string[] {
  const metricRegex = /(\d+(?:\.\d+)?%?|\$\d+(?:,\d+)*(?:\.\d+)?(?:\s*[kKmMbB])?)/g;
  return text.match(metricRegex) || [];
}

/**
 * Checks if any metric in the tailored bullet is missing/different from the original bullet.
 */
export function detectMetricInflation(original: string, tailored: string): BulletRisk | null {
  const origMetrics = extractMetrics(original);
  const tailMetrics = extractMetrics(tailored);

  // Check if tailored bullet contains metrics that did not exist in the original bullet
  const inflatedMetrics = tailMetrics.filter((m) => !origMetrics.includes(m));

  if (inflatedMetrics.length > 0) {
    return {
      type: "metric",
      message: `Review metric inflation: Tailored bullet introduces new or modified metrics (${inflatedMetrics.join(", ")}). Verify this is truthful.`,
      severity: "medium",
    };
  }

  return null;
}

/**
 * Basic heuristic to detect potential leadership/seniority scope inflation.
 */
export function detectLeadershipInflation(original: string, tailored: string): BulletRisk | null {
  const leadershipKeywords = [
    /\blead\b/i,
    /\bled\b/i,
    /\bmanage\b/i,
    /\bmanaged\b/i,
    /\bdirect\b/i,
    /\bdirected\b/i,
    /\bsupervise\b/i,
    /\bsupervised\b/i,
    /\bowner\b/i,
    /\bowned\b/i,
    /\bhead of\b/i,
  ];

  const hasOrigLeadership = leadershipKeywords.some((regex) => regex.test(original));
  const hasTailLeadership = leadershipKeywords.some((regex) => regex.test(tailored));

  if (!hasOrigLeadership && hasTailLeadership) {
    return {
      type: "leadership",
      message: "Review leadership inflation: Tailored bullet adds leadership or management verbs (e.g. 'led', 'managed', 'owned') not present in the original description.",
      severity: "medium",
    };
  }

  return null;
}

/**
 * Checks if the tailored bullet introduces technologies or tools not evidenced in the original resume.
 */
export function detectUnsupportedTechnologies(
  original: string,
  tailored: string,
  resume: ResumeProfile
): BulletRisk | null {
  // Combine all known original resume text to build a trust catalog of skills/technologies
  const allResumeText = [
    resume.summary,
    ...resume.skills,
    ...resume.experience.flatMap((e) => [e.company, e.title, ...e.bullets]),
    ...resume.projects.flatMap((p) => [p.name, ...(p.bullets || []), ...(p.technologies || [])]),
    ...resume.education.flatMap((ed) => [ed.institution, ed.degree]),
    ...resume.certifications,
  ].join(" ").toLowerCase();

  // Search for capitalized terms in the tailored bullet (potential technologies/tools)
  // excluding standard English start-of-sentence capitalization.
  const words = tailored.match(/\b[A-Z][a-zA-Z0-9+#\.]*\b/g) || [];
  const unrecognizedTech: string[] = [];

  words.forEach((word) => {
    // Exclude common grammatical start words or standard pronouns
    const lowerWord = word.toLowerCase();
    const commonStopwords = [
      "i", "the", "we", "our", "my", "designed", "built", "implemented", "developed", 
      "engineered", "collaborated", "fixed", "improved", "led", "managed", "conducted", 
      "created", "wrote", "highly", "acme", "techflow", "brightstart", "delivered", 
      "spearheaded", "accelerated", "maximized", "optimized", "increased", "decreased"
    ];
    
    if (commonStopwords.includes(lowerWord)) return;
    if (word.length <= 1) return;

    // If the word does not exist in any part of the original resume text
    if (!allResumeText.includes(lowerWord)) {
      unrecognizedTech.push(word);
    }
  });

  if (unrecognizedTech.length > 0) {
    // Deduplicate list
    const uniqueTech = [...new Set(unrecognizedTech)];
    return {
      type: "technology",
      message: `Review unsupported technology: Tailored bullet introduces terms or tools (${uniqueTech.join(", ")}) not present in your original resume. Ensure you have experience with these.`,
      severity: "high",
    };
  }

  return null;
}

/**
 * Checks if the tailored bullet introduces a company/employer name not present in the original resume experience.
 */
export function detectEmployerInflation(
  original: string,
  tailored: string,
  resume: ResumeProfile
): BulletRisk | null {
  const origCompanies = resume.experience.map((e) => normalizeEntityName(e.company)).filter(Boolean);
  
  // Look for company suffixes or preposition patterns (e.g. "at Acme", "for TechCorp")
  const companySuffixRegex = /\b([A-Z][a-zA-Z0-9]*)\s+(Inc|LLC|Corp|Corporation|Ltd|Limited|Co)\b/g;
  const prepCompanyRegex = /\b(?:at|for|joined|with)\s+([A-Z][a-zA-Z0-9]*)\b/g;

  const potentialCompanies = new Set<string>();

  let match;
  while ((match = companySuffixRegex.exec(tailored)) !== null) {
    potentialCompanies.add(match[1]);
  }
  while ((match = prepCompanyRegex.exec(tailored)) !== null) {
    const word = match[1];
    const lower = word.toLowerCase();
    const commonStopwords = ["i", "the", "we", "our", "my", "designed", "built", "implemented", "developed", "engineered", "collaborated", "fixed", "improved", "led", "managed", "conducted", "created", "wrote", "highly"];
    if (!commonStopwords.includes(lower) && word.length > 1) {
      potentialCompanies.add(word);
    }
  }

  const unrecognized: string[] = [];
  potentialCompanies.forEach((comp) => {
    const normComp = normalizeEntityName(comp);
    if (normComp.length === 0) return;
    const isOriginal = origCompanies.some(
      (orig) => orig.includes(normComp) || normComp.includes(orig)
    );
    if (!isOriginal) {
      unrecognized.push(comp);
    }
  });

  if (unrecognized.length > 0) {
    return {
      type: "employer",
      message: `Review employer inflation: Tailored bullet introduces company/employer names (${unrecognized.join(", ")}) not present in your original experience list.`,
      severity: "high",
    };
  }
  return null;
}

/**
 * Checks if the tailored bullet introduces a school or degree not in the original education list.
 */
export function detectEducationInflation(
  original: string,
  tailored: string,
  resume: ResumeProfile
): BulletRisk | null {
  const origSchools = resume.education.map((ed) => normalizeEntityName(ed.institution)).filter(Boolean);
  const origDegrees = resume.education.map((ed) => normalizeEntityName(ed.degree)).filter(Boolean);

  const degreeKeywords = ["bachelor", "master", "phd", "doctorate", "degree", "bs", "ms", "ba", "ma", "b.s.", "m.s."];
  const schoolKeywords = ["university", "college", "school", "institute", "academy"];

  const lowerTailored = tailored.toLowerCase();
  
  // Check school mentions
  const mentionsSchool = schoolKeywords.some((kw) => lowerTailored.includes(kw));
  if (mentionsSchool) {
    const matchesAnyOriginalSchool = origSchools.some((school) => lowerTailored.includes(school));
    if (!matchesAnyOriginalSchool && origSchools.length > 0) {
      return {
        type: "education",
        message: "Review education inflation: Tailored bullet mentions a school or academic institution not present in your original education section.",
        severity: "high",
      };
    }
  }

  // Check degree mentions
  const mentionsDegree = degreeKeywords.some((kw) => new RegExp(`\\b${kw}\\b`, "i").test(lowerTailored));
  if (mentionsDegree) {
    const matchesAnyOriginalDegree = origDegrees.some((degree) => lowerTailored.includes(degree));
    if (!matchesAnyOriginalDegree && origDegrees.length > 0) {
      return {
        type: "education",
        message: "Review education inflation: Tailored bullet mentions a degree or credential not present in your original education section.",
        severity: "high",
      };
    }
  }

  return null;
}

/**
 * Checks if the tailored bullet introduces a certification not in the original certifications list.
 */
export function detectCertificationInflation(
  original: string,
  tailored: string,
  resume: ResumeProfile
): BulletRisk | null {
  const origCerts = resume.certifications.map((c) => normalizeEntityName(c)).filter(Boolean);

  const certKeywords = ["certified", "certification", "cert", "pmp", "scrum master", "csm", "aws certified", "comptia"];
  const lowerTailored = tailored.toLowerCase();

  const mentionsCert = certKeywords.some((kw) => lowerTailored.includes(kw));
  if (mentionsCert) {
    const matchesAnyOriginalCert = origCerts.some((cert) => lowerTailored.includes(cert));
    if (!matchesAnyOriginalCert && origCerts.length > 0) {
      return {
        type: "education", // Education category spans degrees/certs in the validation UI
        message: "Review certification inflation: Tailored bullet mentions a certification not present in your original resume.",
        severity: "high",
      };
    }
  }

  return null;
}

/**
 * Full claim verification engine running guardrails on tailored experience.
 */
export function runGuardrailsOnBullet(
  original: string,
  tailored: string,
  resume: ResumeProfile
): BulletRisk[] {
  const risks: BulletRisk[] = [];

  const metricRisk = detectMetricInflation(original, tailored);
  if (metricRisk) risks.push(metricRisk);

  const leadershipRisk = detectLeadershipInflation(original, tailored);
  if (leadershipRisk) risks.push(leadershipRisk);

  const techRisk = detectUnsupportedTechnologies(original, tailored, resume);
  if (techRisk) risks.push(techRisk);

  const employerRisk = detectEmployerInflation(original, tailored, resume);
  if (employerRisk) risks.push(employerRisk);

  const eduRisk = detectEducationInflation(original, tailored, resume);
  if (eduRisk) risks.push(eduRisk);

  const certRisk = detectCertificationInflation(original, tailored, resume);
  if (certRisk) risks.push(certRisk);

  return risks;
}
