import { tailoringRunSchema } from "@/lib/schemas";
import {
  applyMockTailor,
  createMockTailoringRun,
} from "@/lib/mocks/tailoring-run";

const analyzed = createMockTailoringRun();
tailoringRunSchema.parse(analyzed);

const tailored = applyMockTailor(analyzed);
tailoringRunSchema.parse(tailored);

console.log("Mock tailoring runs pass Zod validation.");
