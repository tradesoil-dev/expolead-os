import type { Block } from "@/lib/articles";

// In-app Help Center content. Block-based so no markdown parser is needed.
// Add an article by appending an object; it shows on /help automatically.
export type HelpArticle = {
  slug: string;
  title: string;
  summary: string;
  body: Block[];
};

export const HELP_ARTICLES: HelpArticle[] = [
  {
    slug: "change-your-password",
    title: "Change your password",
    summary: "Update your password from Settings in a few seconds.",
    body: [
      { type: "p", text: "You can change your password anytime from inside ExpoLead OS. You do not need to sign out." },
      { type: "h2", text: "Steps" },
      { type: "ul", items: [
        "Open Settings from the sidebar.",
        "Scroll to the Account Security card.",
        "Under Change password, enter your current password.",
        "Enter your new password (at least 8 characters), then type it again to confirm.",
        "Click Update password. You will see a confirmation once it is done.",
      ] },
      { type: "h2", text: "Good to know" },
      { type: "ul", items: [
        "We verify your current password before changing it, so no one can change it from an unlocked session without knowing it.",
        "Your new password must be at least 8 characters.",
        "Your session stays active after the change, but you can sign out and back in to confirm the new password works.",
      ] },
      { type: "h2", text: "Forgot your current password?" },
      { type: "p", text: "If you do not remember your current password, sign out and use the “Forgot password?” link on the sign-in page. A secure reset link is sent to your email." },
    ],
  },
  {
    slug: "delete-your-account",
    title: "Delete your account",
    summary: "Permanently remove your account and all your data.",
    body: [
      { type: "p", text: "You can permanently delete your ExpoLead OS account and all of your data at any time. This is irreversible, so please read this first." },
      { type: "h2", text: "Export your data first" },
      { type: "p", text: "Deletion cannot be undone. If you may want your records later, export them before you delete: use Export CSV on the Connections page and on the Opportunities page." },
      { type: "h2", text: "Steps" },
      { type: "ul", items: [
        "Open Settings from the sidebar.",
        "Scroll to the Account Security card.",
        "Under Delete account, click Delete my account.",
        "Type DELETE in the confirmation box.",
        "Click Permanently delete account. You will be signed out immediately.",
      ] },
      { type: "h2", text: "What gets deleted" },
      { type: "ul", items: [
        "Your login and account details.",
        "All connections and their contacts, products and notes.",
        "All opportunities, product lines and follow-ups.",
        "All exhibitions and reports data.",
      ] },
      { type: "p", text: "Once deleted, this data cannot be recovered. If you need help, contact hello@expoleados.com before deleting." },
    ],
  },
  {
    slug: "export-your-data",
    title: "Export your data",
    summary: "Download your connections and opportunities as CSV. Your data is always yours.",
    body: [
      { type: "p", text: "You own everything you put into ExpoLead OS and you can take it with you at any time." },
      { type: "h2", text: "How to export" },
      { type: "ul", items: [
        "Connections: open the Connections tab and click Export CSV. The current filters apply, so you can export a subset if you like.",
        "Opportunities: open the Opportunities tab and click Export CSV.",
      ] },
      { type: "h2", text: "Good to know" },
      { type: "ul", items: [
        "CSV export is a paid feature, available on the Starter and Growth plans.",
        "If you are on a free trial and need a copy of your data, email hello@expoleados.com and we will provide it.",
      ] },
    ],
  },
  {
    slug: "your-data-and-security",
    title: "Your data & security",
    summary: "How ExpoLead OS keeps your data, and your clients' data, private and secure.",
    body: [
      { type: "p", text: "ExpoLead OS holds sensitive commercial data, so protecting it is core to the product." },
      { type: "h2", text: "You own your data" },
      { type: "p", text: "The connections, buyers, contacts and opportunities you enter are yours. We only act as a processor on your behalf, storing and processing that data to run the service for you. We never sell it, never use it for advertising, and never share it with data brokers." },
      { type: "h2", text: "How it is protected" },
      { type: "ul", items: [
        "Database-level isolation: every record is tied to your account, so no other customer can see your data.",
        "Encrypted in transit (HTTPS/TLS) and at rest (AES-256).",
        "Passwords are hashed; we never store or see them in plain text.",
        "Automated backups so your data can be recovered.",
      ] },
      { type: "h2", text: "Your control" },
      { type: "ul", items: [
        "Export your data as CSV anytime.",
        "Delete your account and all your data anytime.",
        "Request access to or correction of your data.",
      ] },
      { type: "p", text: "Full details are in our Privacy Notice at /privacy. A Data Processing Agreement is available on request at hello@expoleados.com." },
    ],
  },
];

export function getHelpArticle(slug: string): HelpArticle | undefined {
  return HELP_ARTICLES.find((a) => a.slug === slug);
}
