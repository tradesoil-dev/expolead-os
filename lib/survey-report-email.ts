import { Resend } from "resend";
import { buildSurveyReportEmail, type SurveyReportEmailOpts } from "@/lib/survey-report-email-html";

// Emails a survey respondent a copy of their post-show report.
export async function sendSurveyReportEmail(opts: SurveyReportEmailOpts & { email: string }) {
  const { subject, html } = buildSurveyReportEmail(opts);
  const resend = new Resend(process.env.RESEND_API_KEY);
  return resend.emails.send({ from: "Gladwin & Gayan at ExpoLead OS <hello@expoleados.com>", to: opts.email, subject, html });
}
