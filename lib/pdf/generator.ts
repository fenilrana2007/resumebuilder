import PDFDocument from "pdfkit";
import type { TailoringRun } from "@/lib/schemas";

// Helper to wrap pdfkit creation in a promise returning a Buffer
function buildPdfBuffer(buildFn: (doc: typeof PDFDocument) => void): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40, size: "A4" });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", (err: Error) => reject(err));

    try {
      buildFn(doc);
      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

export function generateTailoredResumePdf(run: TailoringRun): Promise<Buffer> {
  return buildPdfBuffer((doc) => {
    const resume = run.resume;
    const tailored = run.tailoredResume;

    if (!resume || !tailored) {
      throw new Error("Missing parsed resume or tailored resume data");
    }

    // 1. Contact Information Header
    const contact = resume.contact || {};
    const name = contact.name || "Resume";
    doc.fontSize(20).font("Helvetica-Bold").text(name, { align: "center" });
    
    const contactLineParts = [];
    if (contact.email) contactLineParts.push(contact.email);
    if (contact.phone) contactLineParts.push(contact.phone);
    if (contact.location) contactLineParts.push(contact.location);
    if (contact.website) contactLineParts.push(contact.website);
    if (contact.github) contactLineParts.push(contact.github);
    if (contact.linkedin) contactLineParts.push(contact.linkedin);

    if (contactLineParts.length > 0) {
      doc.moveDown(0.2);
      doc.fontSize(9).font("Helvetica").text(contactLineParts.join("  |  "), { align: "center" });
    }
    
    doc.moveDown(1);

    // Section header drawing helper
    function drawSectionHeader(title: string) {
      doc.moveDown(0.8);
      doc.fontSize(11).font("Helvetica-Bold").text(title.toUpperCase());
      const y = doc.y;
      doc.moveTo(40, y).lineTo(555, y).lineWidth(0.5).strokeColor("#cccccc").stroke();
      doc.moveDown(0.5);
    }

    // 2. Summary
    const summaryText = tailored.tailoredSummary || resume.summary;
    if (summaryText) {
      drawSectionHeader("Professional Summary");
      doc.fontSize(9.5).font("Helvetica").text(summaryText, { align: "justify", lineGap: 2 });
    }

    // 3. Skills
    const skillsList = tailored.tailoredSkills.length > 0 ? tailored.tailoredSkills : resume.skills;
    if (skillsList && skillsList.length > 0) {
      drawSectionHeader("Skills");
      doc.fontSize(9.5).font("Helvetica").text(skillsList.join(", "));
    }

    // 4. Experience
    if (resume.experience && resume.experience.length > 0) {
      drawSectionHeader("Professional Experience");

      resume.experience.forEach((exp) => {
        const tailoredExp = tailored.tailoredExperience?.find(
          (t) => t.company === exp.company && t.title === exp.title
        );
        const bullets = tailoredExp ? tailoredExp.bullets.map((b) => b.tailored) : exp.bullets;

        doc.fontSize(10).font("Helvetica-Bold").text(exp.title, { continued: true });
        doc.font("Helvetica").text(`  |  ${exp.company}`, { continued: false });
        
        // Date range on right (using absolute positioning or right margin)
        const dateStr = `${exp.startDate} - ${exp.endDate}`;
        doc.fontSize(9).font("Helvetica-Oblique").text(dateStr, { align: "right" });
        doc.moveDown(0.2);

        bullets.forEach((bullet) => {
          doc.fontSize(9.5).font("Helvetica").text(`\u2022  ${bullet}`, {
            indent: 10,
            paragraphGap: 3,
            lineGap: 1.5,
            align: "justify"
          });
        });
        doc.moveDown(0.5);
      });
    }

    // 5. Projects
    if (resume.projects && resume.projects.length > 0) {
      drawSectionHeader("Projects");
      resume.projects.forEach((proj) => {
        doc.fontSize(10).font("Helvetica-Bold").text(proj.name);
        if (proj.technologies && proj.technologies.length > 0) {
          doc.fontSize(9).font("Helvetica-Oblique").text(`Technologies: ${proj.technologies.join(", ")}`, { align: "right" });
        }
        doc.moveDown(0.2);

        proj.bullets.forEach((bullet) => {
          doc.fontSize(9.5).font("Helvetica").text(`\u2022  ${bullet}`, {
            indent: 10,
            paragraphGap: 3,
            lineGap: 1.5,
            align: "justify"
          });
        });
        doc.moveDown(0.5);
      });
    }

    // 6. Education
    if (resume.education && resume.education.length > 0) {
      drawSectionHeader("Education");
      resume.education.forEach((edu) => {
        doc.fontSize(10).font("Helvetica-Bold").text(edu.degree, { continued: true });
        doc.font("Helvetica").text(`  |  ${edu.institution}`, { continued: false });
        if (edu.dates) {
          doc.fontSize(9).font("Helvetica-Oblique").text(edu.dates, { align: "right" });
        }
        doc.moveDown(0.3);
      });
    }

    // 7. Certifications
    if (resume.certifications && resume.certifications.length > 0) {
      drawSectionHeader("Certifications");
      doc.fontSize(9.5).font("Helvetica").text(resume.certifications.join(", "));
    }
  });
}

export function generateComparisonPdf(run: TailoringRun): Promise<Buffer> {
  return buildPdfBuffer((doc) => {
    const resume = run.resume;
    const jd = run.jobDescription;
    const tailored = run.tailoredResume;
    const originalMatch = run.originalMatch;
    const tailoredMatch = run.tailoredMatch;
    const gaps = run.gapAnalysis?.gaps || [];

    if (!resume || !jd || !tailored || !originalMatch || !tailoredMatch) {
      throw new Error("Missing required data sections for comparison PDF");
    }

    // Header Title
    doc.fillColor("#1a365d").fontSize(18).font("Helvetica-Bold").text("Resume Shapeshifter \u2014 Tailoring Report", { align: "center" });
    doc.fillColor("#4a5568").fontSize(10).font("Helvetica").text(`Target Job: ${jd.jobTitle}  |  Company: ${jd.company || "N/A"}`, { align: "center" });
    doc.moveDown(0.5);

    // Disclaimer Banner
    const disclaimerText = "Disclaimer: This document is a side-by-side tailoring proof of work. Resume Shapeshifter aims to rephrase existing experience to align with target role keywords truthfully. The candidate must verify all content for absolute accuracy before submitting to any employer.";
    doc.fontSize(8.5);
    const disclaimerHeight = doc.heightOfString(disclaimerText, { width: 495 });
    
    doc.save();
    doc.rect(40, doc.y, 515, disclaimerHeight + 12)
       .fillAndStroke("#fffbeb", "#fef3c7");
    doc.fillColor("#b45309").fontSize(8.5).font("Helvetica-Oblique")
       .text(disclaimerText, 50, doc.y + 6, { width: 495, align: "justify" });
    doc.restore();
    
    doc.y += disclaimerHeight + 20;

    // Score comparison side-by-side
    const scoresY = doc.y;
    // Original Score Card on left
    doc.save();
    doc.rect(40, scoresY, 245, 110).fillAndStroke("#f8fafc", "#e2e8f0");
    doc.fillColor("#1e293b").fontSize(11).font("Helvetica-Bold").text("Original Alignment", 50, scoresY + 10);
    doc.fillColor("#e11d48").fontSize(26).text(`${originalMatch.overallScore}%`, 50, scoresY + 28);
    
    doc.fontSize(8.5).fillColor("#64748b").font("Helvetica");
    doc.text(`Skills Coverage: ${originalMatch.skillCoverageScore}%`, 50, scoresY + 62);
    doc.text(`Responsibilities: ${originalMatch.responsibilityAlignmentScore}%`, 50, scoresY + 74);
    doc.text(`Keywords: ${originalMatch.keywordScore}%`, 50, scoresY + 86);
    doc.text(`Seniority: ${originalMatch.seniorityScore}%`, 50, scoresY + 98);
    doc.restore();

    // Tailored Score Card on right
    doc.save();
    doc.rect(310, scoresY, 245, 110).fillAndStroke("#f0fdf4", "#dcfce7");
    doc.fillColor("#14532d").fontSize(11).font("Helvetica-Bold").text("Tailored Alignment", 320, scoresY + 10);
    doc.fillColor("#16a34a").fontSize(26).text(`${tailoredMatch.overallScore}%`, 320, scoresY + 28);
    
    doc.fontSize(8.5).fillColor("#166534").font("Helvetica");
    doc.text(`Skills Coverage: ${tailoredMatch.skillCoverageScore}%`, 320, scoresY + 62);
    doc.text(`Responsibilities: ${tailoredMatch.responsibilityAlignmentScore}%`, 320, scoresY + 74);
    doc.text(`Keywords: ${tailoredMatch.keywordScore}%`, 320, scoresY + 86);
    doc.text(`Seniority: ${tailoredMatch.seniorityScore}%`, 320, scoresY + 98);
    doc.restore();

    doc.y = scoresY + 125;

    // Match explanation
    doc.fillColor("#1e293b").fontSize(10).font("Helvetica-Bold").text("Tailored Match Explanation:");
    doc.fillColor("#475569").fontSize(9.5).font("Helvetica").text(tailoredMatch.explanation, { lineGap: 2 });
    doc.moveDown(1);

    // JD Keyword & Summary Table
    doc.fillColor("#1a365d").fontSize(12).font("Helvetica-Bold").text("Job Description Requirements Summary");
    doc.moveTo(40, doc.y).lineTo(555, doc.y).lineWidth(0.5).strokeColor("#cbd5e1").stroke();
    doc.moveDown(0.4);

    doc.fontSize(9.5);
    doc.fillColor("#334155").font("Helvetica-Bold").text("Extracted Required Skills: ", { continued: true });
    doc.font("Helvetica").text(jd.requiredSkills.slice(0, 10).join(", ") + (jd.requiredSkills.length > 10 ? "..." : ""));
    doc.font("Helvetica-Bold").text("Preferred Skills: ", { continued: true });
    doc.font("Helvetica").text(jd.preferredSkills.slice(0, 10).join(", ") + (jd.preferredSkills.length > 10 ? "..." : ""));
    doc.font("Helvetica-Bold").text("Tools & Technologies: ", { continued: true });
    doc.font("Helvetica").text(jd.tools.slice(0, 10).join(", ") + (jd.tools.length > 10 ? "..." : ""));
    doc.font("Helvetica-Bold").text("Seniority Target: ", { continued: true });
    doc.font("Helvetica").text(jd.seniorityLevel);
    doc.moveDown(1);

    // Gap Analysis Section
    doc.fillColor("#1a365d").fontSize(12).font("Helvetica-Bold").text("Gap Analysis Summary");
    doc.moveTo(40, doc.y).lineTo(555, doc.y).lineWidth(0.5).strokeColor("#cbd5e1").stroke();
    doc.moveDown(0.4);

    if (gaps.length === 0) {
      doc.fontSize(9.5).font("Helvetica-Oblique").fillColor("#64748b").text("No critical gaps identified.");
      doc.moveDown(0.8);
    } else {
      gaps.forEach((gap) => {
        const severityColor = gap.importance === "high" ? "#dc2626" : gap.importance === "medium" ? "#d97706" : "#4b5563";
        doc.fontSize(9.5).font("Helvetica-Bold").fillColor(severityColor).text(`\u2022  ${gap.name}`, { continued: true });
        doc.fillColor("#475569").font("Helvetica").text(` (${gap.importance} importance)`);
        doc.fontSize(8.5).font("Helvetica-Oblique").text(`Evidence: ${gap.jdEvidence}`, { indent: 10 });
        doc.font("Helvetica").text(`Recommendation: ${gap.suggestedAction}`, { indent: 10 });
        doc.moveDown(0.4);
      });
      doc.moveDown(0.5);
    }

    // Bullet-by-Bullet experience tailoring (highlighting changed bullets)
    doc.addPage();
    doc.fillColor("#1a365d").fontSize(14).font("Helvetica-Bold").text("Bullet-Level Tailoring Comparison");
    doc.fontSize(9).font("Helvetica-Oblique").fillColor("#64748b").text("Changed bullets are highlighted with a light background.");
    doc.moveDown(0.8);

    resume.experience.forEach((exp) => {
      const tailoredExp = tailored.tailoredExperience?.find(
        (t) => t.company === exp.company && t.title === exp.title
      );
      if (!tailoredExp) return;

      doc.fillColor("#1e293b").fontSize(11).font("Helvetica-Bold").text(`${exp.title} \u2014 ${exp.company}`);
      doc.moveTo(40, doc.y).lineTo(555, doc.y).lineWidth(0.5).strokeColor("#e2e8f0").stroke();
      doc.moveDown(0.4);

      exp.bullets.forEach((origBullet, idx) => {
        const tBulletObj = tailoredExp.bullets[idx];
        if (!tBulletObj) return;

        const changed = origBullet.trim() !== tBulletObj.tailored.trim();

        const bulletTextY = doc.y;
        
        if (changed) {
          // Highlight background
          doc.save();
          // Estimate height of columns to draw background box
          doc.fontSize(9);
          const originalHeight = doc.heightOfString(`Original:\n${origBullet}`, { width: 235 });
          const tailoredHeight = doc.heightOfString(`Tailored:\n${tBulletObj.tailored}`, { width: 235 });
          doc.fontSize(8);
          const metadataHeight = doc.heightOfString(`Reason: ${tBulletObj.changeReason}\nKeywords: ${tBulletObj.keywordsAddressed.join(", ")}`, { width: 495 });
          const totalBoxHeight = Math.max(originalHeight, tailoredHeight) + metadataHeight + 25;
          
          // Page boundary check before drawing box
          if (doc.y + totalBoxHeight > doc.page.height - 50) {
            doc.addPage();
            doc.fillColor("#1a365d").fontSize(11).font("Helvetica-Bold").text(`${exp.title} \u2014 ${exp.company} (Continued)`);
            doc.moveTo(40, doc.y).lineTo(555, doc.y).lineWidth(0.5).strokeColor("#e2e8f0").stroke();
            doc.moveDown(0.4);
          }

          const boxY = doc.y;
          doc.rect(40, boxY, 515, totalBoxHeight)
             .fillAndStroke("#f8fafc", "#cbd5e1");
          
          doc.fillColor("#1e293b");
          
          // Left column: Original
          doc.fontSize(8.5).font("Helvetica-Bold").text("ORIGINAL BULLET", 50, boxY + 8);
          doc.fontSize(9).font("Helvetica").text(origBullet, 50, boxY + 20, { width: 230, align: "justify" });

          // Right column: Tailored
          doc.fontSize(8.5).font("Helvetica-Bold").fillColor("#0f766e").text("TAILORED BULLET", 305, boxY + 8);
          doc.fontSize(9).font("Helvetica").fillColor("#0f766e").text(tBulletObj.tailored, 305, boxY + 20, { width: 230, align: "justify" });

          // Metadata below columns
          const metaY = boxY + Math.max(originalHeight, tailoredHeight) + 12;
          doc.moveTo(50, metaY).lineTo(545, metaY).lineWidth(0.3).strokeColor("#cbd5e1").stroke();
          
          doc.fontSize(8).font("Helvetica-Bold").fillColor("#475569").text("Change Reason: ", 50, metaY + 6, { continued: true });
          doc.font("Helvetica").fillColor("#64748b").text(tBulletObj.changeReason, { width: 485 });
          
          doc.font("Helvetica-Bold").fillColor("#475569").text("Keywords Addressed: ", { continued: true });
          doc.font("Helvetica").fillColor("#64748b").text(tBulletObj.keywordsAddressed.join(", ") || "None");
          
          if (tBulletObj.riskFlag) {
            doc.font("Helvetica-Bold").fillColor("#b45309").text("Risk Flag: ", { continued: true });
            doc.font("Helvetica-Oblique").text(tBulletObj.riskFlag);
          }
          
          doc.restore();
          doc.y = boxY + totalBoxHeight + 8;
        } else {
          // Not changed, standard presentation
          if (doc.y + 70 > doc.page.height - 50) {
            doc.addPage();
            doc.fillColor("#1e293b").fontSize(11).font("Helvetica-Bold").text(`${exp.title} \u2014 ${exp.company} (Continued)`);
            doc.moveTo(40, doc.y).lineTo(555, doc.y).lineWidth(0.5).strokeColor("#e2e8f0").stroke();
            doc.moveDown(0.4);
          }

          doc.fontSize(8.5).font("Helvetica-Bold").fillColor("#64748b").text("UNCHANGED BULLET");
          doc.fontSize(9).font("Helvetica").fillColor("#475569").text(origBullet, { align: "justify" });
          doc.moveDown(0.5);
        }
      });
      doc.moveDown(1);
    });
  });
}
