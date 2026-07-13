// Public resource-hub articles. Content lives here as structured blocks so the
// pages need no MDX/markdown parser. Add a new article by appending an object.

export type Block =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "ul"; items: string[] };

export type Article = {
  slug: string;
  title: string;
  topic: "Exhibitions" | "Sales" | "Marketing" | "Follow-up";
  excerpt: string;
  readMinutes: number;
  featured?: boolean;
  publishedISO: string;
  body: Block[];
};

export const ARTICLES: Article[] = [
  {
    slug: "follow-up-after-trade-show",
    title: "7 ways to follow up after a trade show (without being annoying)",
    topic: "Follow-up",
    excerpt:
      "The first 72 hours decide whether a booth chat becomes an order. Here is the follow-up cadence that keeps you on a buyer's radar without wearing out your welcome.",
    readMinutes: 8,
    featured: true,
    publishedISO: "2026-07-13",
    body: [
      {
        type: "p",
        text: "You shook two hundred hands over three days. Two weeks later, half of those people have forgotten your name. The exhibitors who turn a show into revenue are rarely the ones with the biggest booth. They are the ones who follow up before the memory fades, in a way that feels helpful rather than pushy. Here is how to do that.",
      },
      { type: "h2", text: "1. Log the lead before you leave the booth" },
      {
        type: "p",
        text: "A business card in your pocket is a lead you will never call. The moment a conversation ends, capture three things while they are still fresh: who the person is, what company they represent, and what they actually wanted. A card gives you the first two. Only your memory gives you the third, and it fades fast.",
      },
      {
        type: "p",
        text: "Write down the product they asked about, the quantity they hinted at, and one personal detail from the conversation. That detail is what makes your follow-up feel human instead of automated.",
      },
      { type: "h2", text: "2. Send the first message within 72 hours" },
      {
        type: "p",
        text: "The window closes quickly. After a big show a buyer meets dozens of suppliers, and by the following week they are back to their day job and everyone blurs together. A short, specific message inside three days lands while they still remember your stand. Wait two weeks and you are a stranger again.",
      },
      { type: "h2", text: "3. Reference the actual conversation" },
      {
        type: "p",
        text: "Never send a generic thank-you-for-visiting blast. Open with the thing you talked about. If they asked about a particular grade of tea, a minimum order, or a delivery timeline, name it in the first line. This one habit separates the suppliers who get replies from the ones who get ignored.",
      },
      { type: "h2", text: "4. Lead with something useful, not a pitch" },
      {
        type: "p",
        text: "Your first follow-up is not the place to close a deal. It is the place to be useful. Send the spec sheet they wanted, a sample quote, a photo of the product line, or an answer to the question they raised at the booth. Give them a reason to reply that is about their need, not your target.",
      },
      { type: "h2", text: "5. Make the next step obvious" },
      {
        type: "p",
        text: "Every message should end with one clear, small ask. Not \"let me know if you are interested\", which invites silence, but something concrete: a sample shipment, a short call next week, or a price for a specific quantity. One decision, easy to say yes to.",
      },
      { type: "h2", text: "6. Space out your follow-ups on a schedule" },
      {
        type: "p",
        text: "Persistence works. Pestering does not. A workable rhythm looks like this:",
      },
      {
        type: "ul",
        items: [
          "Day 2: the first specific message referencing your conversation.",
          "Day 7: a helpful nudge, a sample or a spec, if you have not heard back.",
          "Day 21: a light check-in tied to their timeline or their next season.",
        ],
      },
      {
        type: "p",
        text: "If you track when each follow-up is due, you never drop a lead and you never crowd one either. That timing is the whole game.",
      },
      { type: "h2", text: "7. Keep the relationship warm until next year" },
      {
        type: "p",
        text: "Most exhibition relationships do not close on the first cycle. The buyer was scouting, the timing was wrong, the budget was next quarter. That does not mean the lead is dead. It means it is a lead for next year's show. Keep a note of what they deal in and when they buy, and reconnect before the next edition. The supplier who remembers a buyer twelve months later almost always wins the order.",
      },
      { type: "h2", text: "The point behind all seven" },
      {
        type: "p",
        text: "Following up well is not about being clever. It is about being organised. Capture the lead properly, reach out while it is warm, be specific, be useful, and keep track of the timing. Do that consistently and you will convert far more of your booth conversations than exhibitors who spend ten times more on the stand.",
      },
    ],
  },
  {
    slug: "qualify-lead-at-booth",
    title: "How to qualify a lead in 90 seconds at your booth",
    topic: "Sales",
    excerpt:
      "Not everyone who stops at your stand is a buyer. A few simple questions tell you who is worth your follow-up time and who is just collecting brochures.",
    readMinutes: 5,
    publishedISO: "2026-07-11",
    body: [
      {
        type: "p",
        text: "A busy exhibition floor is a numbers game, but not every number counts. Some visitors are serious buyers. Some are competitors, students, or people who collect free samples. If you treat every card the same, you waste your follow-up energy on people who were never going to buy. The fix is a quick, friendly qualification during the conversation itself.",
      },
      { type: "h2", text: "Ask what they trade, not whether they like your product" },
      {
        type: "p",
        text: "\"What do you deal in?\" tells you more in five seconds than any pitch. A real buyer answers with a category, a market, and often a volume. A tyre-kicker gives a vague answer. You learn immediately whether your products fit what they actually move.",
      },
      { type: "h2", text: "Find the quantity early" },
      {
        type: "p",
        text: "In product trade, quantity is everything. A buyer who needs a container a month is a different conversation from one who wants a single sample. Ask it plainly and without pressure: \"What kind of quantities do you usually work with?\" The answer sorts your leads faster than anything else.",
      },
      { type: "h2", text: "Three questions that do the work" },
      {
        type: "ul",
        items: [
          "What do you deal in, and which markets do you serve?",
          "What quantities do you typically buy or move?",
          "What is prompting you to look right now, a new line, a gap in supply, a season?",
        ],
      },
      {
        type: "p",
        text: "You are not interrogating anyone. These are the questions two trade people would naturally ask each other. But the answers tell you exactly how warm the lead is.",
      },
      { type: "h2", text: "Grade the lead before you move on" },
      {
        type: "p",
        text: "Before the next visitor arrives, give the conversation a quick mental grade. Hot means real need, real quantity, right market. Warm means genuine interest but wrong timing or unclear volume. Cold means polite curiosity with no fit. Note that grade with the contact. When you follow up next week, you will know who to call first.",
      },
      { type: "h2", text: "Why this matters more than lead count" },
      {
        type: "p",
        text: "Exhibitors love to brag about how many cards they collected. But a hundred unqualified cards is just a hundred hours of wasted follow-up. Twenty well-qualified leads, each with a note on what they trade and in what quantity, will out-earn the big pile every time. Qualify at the booth, and your follow-up becomes focused instead of frantic.",
      },
    ],
  },
  {
    slug: "choosing-right-exhibitions",
    title: "How to choose the right exhibitions as a product exporter",
    topic: "Exhibitions",
    excerpt:
      "A stand at the wrong show costs you thousands and returns nothing. Here is how to pick the exhibitions that actually put you in front of buyers.",
    readMinutes: 6,
    publishedISO: "2026-07-09",
    body: [
      {
        type: "p",
        text: "For a product exporter, exhibitions are one of the biggest line items in the marketing budget. A single international show can cost more than a year of digital ads once you add the stand, travel, samples, and staff time. That is exactly why the choice of which shows to attend deserves real thought, not habit.",
      },
      { type: "h2", text: "Follow the buyers, not the prestige" },
      {
        type: "p",
        text: "The most famous show in your industry is not automatically the right one for you. What matters is whether the buyers you can actually serve walk that floor. A large general show may bury you among thousands of exhibitors. A focused regional show might put you directly in front of the importers who buy your exact category.",
      },
      { type: "h2", text: "Judge a show by these signals" },
      {
        type: "ul",
        items: [
          "Who attends, importers and distributors, or mostly other manufacturers like you?",
          "Which regions the visitors come from, and whether those are markets you can supply.",
          "The ratio of trade visitors to public visitors. Trade-only shows are usually worth more.",
          "Whether your existing buyers already attend. If they go, your prospects go too.",
        ],
      },
      { type: "h2", text: "Match the show to your stage" },
      {
        type: "p",
        text: "A new exporter and an established one need different shows. If you are breaking into a market, a smaller specialised show in that region gives you concentrated access to the right buyers at a fraction of the cost. If you are defending a position, the flagship shows keep you visible to the whole industry. Be honest about which job you are trying to do this year.",
      },
      { type: "h2", text: "Count the real return, not the footfall" },
      {
        type: "p",
        text: "Organisers love to quote total visitor numbers. Those numbers are almost meaningless to you. What matters is how many qualified buyers for your specific products you can realistically meet, and how many of those turn into orders over the following year. One show that yields five serious buyers beats a huge event that yields a pile of cards and no deals.",
      },
      { type: "h2", text: "Keep a record year over year" },
      {
        type: "p",
        text: "The best exhibition decisions come from your own history. Track which shows produced real business, which buyers you met where, and which ones you should reconnect with next season. Over a few cycles this record becomes your most valuable planning tool. You stop guessing which shows are worth it, because your own results tell you.",
      },
      {
        type: "p",
        text: "Choosing shows well is not about attending the most. It is about attending the ones where your buyers actually are, then working them properly. Pick fewer, pick sharper, and follow up on everything you capture.",
      },
    ],
  },
];

export const TOPICS = ["Exhibitions", "Sales", "Marketing", "Follow-up"] as const;

export function getArticle(slug: string): Article | undefined {
  return ARTICLES.find((a) => a.slug === slug);
}
