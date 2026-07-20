// Public resource-hub articles. Content lives here as structured blocks so the
// pages need no MDX/markdown parser. Add a new article by appending an object.

export type Block =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
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
  {
    slug: "modern-exhibitor-playbook",
    title: "The Modern Exhibitor's Playbook: why success goes beyond the exhibition booth",
    topic: "Exhibitions",
    excerpt:
      "Foot traffic was never the point. Modern exhibitors prepare earlier, qualify harder and follow up with more consistency, and they measure the show on business won rather than visitors counted.",
    readMinutes: 5,
    publishedISO: "2026-07-20",
    body: [
      {
        type: "p",
        text: "For many years, exhibiting at trade shows followed a familiar formula. Companies invested heavily in booth design, promotional materials, and giveaways, hoping to attract as many visitors as possible and generate new business.",
      },
      { type: "p", text: "Today, that approach is no longer enough." },
      {
        type: "p",
        text: "Successful exhibitors no longer measure an exhibition by the number of people who stop at their stand. Instead, they focus on building meaningful conversations, identifying qualified opportunities, and creating a structured follow-up process that delivers measurable business results.",
      },
      { type: "p", text: "In this guide, we'll explore:" },
      {
        type: "ul",
        items: [
          "Why the traditional exhibiting approach no longer delivers the best return on investment",
          "How the mindset of successful exhibitors has changed",
          "The growing role of AI and data in exhibition planning",
          "Why your exhibition stand should become a meeting hub, not simply a place to collect visitors",
        ],
      },
      {
        type: "p",
        text: "Modern exhibitions are becoming increasingly data-driven, and businesses that adapt to this shift are far more likely to maximise their investment.",
      },
      { type: "h2", text: "Why the traditional exhibition strategy falls short" },
      {
        type: "p",
        text: "For decades, success at an exhibition was often judged by one simple metric: foot traffic.",
      },
      {
        type: "p",
        text: "Companies competed to build the biggest booth, create the most eye-catching displays, and attract as many visitors as possible. The assumption was straightforward. The more visitors you attracted, the more sales opportunities you would generate.",
      },
      { type: "p", text: "In reality, that wasn't always the case." },
      {
        type: "p",
        text: "A crowded stand doesn't necessarily produce qualified prospects. Many conversations never progress beyond the exhibition floor, making it difficult to justify the significant investment in booth construction, travel, accommodation, promotional materials, and staff.",
      },
      {
        type: "p",
        text: "This is one of the biggest weaknesses of the traditional exhibition model. It measures activity rather than outcomes.",
      },
      {
        type: "p",
        text: "Without a structured process to identify, qualify, and follow up with the right visitors, exhibitors often relied more on luck than strategy.",
      },
      {
        type: "p",
        text: "Today, companies are looking beyond visitor numbers and focusing on measurable return on investment.",
      },
      { type: "h2", text: "The exhibitor mindset has changed" },
      {
        type: "p",
        text: "Modern exhibitors understand that success isn't about collecting the highest number of business cards or scanning the most visitor badges.",
      },
      { type: "p", text: "It's about identifying the right people." },
      {
        type: "p",
        text: "Rather than treating every visitor equally, exhibitors now focus on building relationships with prospects who genuinely match their products, services, and business objectives.",
      },
      {
        type: "p",
        text: "Having access to attendee information before meetings has become increasingly valuable. Understanding a visitor's industry, areas of interest, company profile, and business needs allows exhibitors to prepare meaningful conversations instead of generic sales pitches.",
      },
      {
        type: "p",
        text: "This shift enables sales teams to personalise every interaction, increasing the likelihood of creating genuine business opportunities.",
      },
      {
        type: "p",
        text: "Instead of simply generating leads, exhibitions have become an important stage in moving prospects further along the sales pipeline.",
      },
      { type: "h2", text: "How AI and data are reshaping exhibitions" },
      {
        type: "p",
        text: "Technology has transformed the way businesses prepare for exhibitions.",
      },
      {
        type: "p",
        text: "Instead of relying on chance encounters, exhibitors now use data to make informed decisions before, during, and after every event.",
      },
      {
        type: "p",
        text: "AI-powered tools help businesses identify high-value prospects, recommend potential meetings, prioritise follow-up activities, and automate routine tasks that previously consumed valuable sales time.",
      },
      {
        type: "p",
        text: "Real-time event dashboards also provide visibility into visitor engagement while the exhibition is taking place, allowing teams to adjust their approach instead of waiting until the event has ended.",
      },
      {
        type: "p",
        text: "The result is a far more strategic exhibiting process where every conversation can be measured, every opportunity tracked, and every follow-up managed more effectively.",
      },
      {
        type: "p",
        text: "Data has replaced guesswork, allowing exhibitors to focus their efforts where they're most likely to generate results.",
      },
      { type: "h2", text: "The exhibition booth is no longer the destination" },
      {
        type: "p",
        text: "Today's buyers arrive at exhibitions far better prepared than ever before.",
      },
      {
        type: "p",
        text: "Many have already researched suppliers, compared products, explored company websites, connected through event platforms, and scheduled meetings before walking onto the exhibition floor.",
      },
      { type: "p", text: "As a result, the role of the exhibition booth has evolved." },
      {
        type: "p",
        text: "Rather than acting as the primary tool for attracting visitors, the booth has become a dedicated space for meaningful conversations, product demonstrations, and relationship building.",
      },
      {
        type: "p",
        text: "Comfortable meeting areas, personalised discussions, and collaborative problem-solving are increasingly replacing traditional sales pitches.",
      },
      {
        type: "p",
        text: "The exhibition itself is now just one touchpoint within a much longer customer journey, one that begins well before the event opens and continues long after the exhibition closes.",
      },
      { type: "h2", text: "Final thoughts" },
      {
        type: "p",
        text: "Successful exhibitors no longer rely solely on an impressive booth to deliver results.",
      },
      {
        type: "p",
        text: "They prepare earlier, use better data, prioritise quality over quantity, and follow up with greater consistency.",
      },
      {
        type: "p",
        text: "As exhibitions continue to evolve, businesses that embrace a more strategic and data-driven approach will consistently outperform those relying on traditional methods.",
      },
      {
        type: "p",
        text: "At ExpoLead, we believe every conversation at an exhibition has the potential to become a valuable business opportunity. The key is having the right process to capture, organise, and follow up on those opportunities, long after the exhibition ends.",
      },
    ],
  },
  {
    slug: "exhibition-booth-preparation-checklist",
    title: "The ultimate exhibition booth preparation checklist",
    topic: "Exhibitions",
    excerpt:
      "A successful exhibition does not begin when the doors open. This is the full preparation timeline, from 90 days out to the final morning of the show, plus the checklist to run through before you leave.",
    readMinutes: 9,
    publishedISO: "2026-07-20",
    body: [
      {
        type: "p",
        text: "A successful exhibition doesn't begin when the doors open, it starts weeks or even months before the event.",
      },
      {
        type: "p",
        text: "Many companies invest thousands of dollars in exhibition space, booth design, travel, accommodation, and marketing. Yet despite this investment, many leave the event disappointed because they prepared for the booth but not for the business opportunities.",
      },
      {
        type: "p",
        text: "The most successful exhibitors understand that an exhibition is more than a marketing event. It's an opportunity to build relationships, generate qualified leads, strengthen existing partnerships, understand market trends, and ultimately drive revenue.",
      },
      {
        type: "p",
        text: "Proper preparation is what separates businesses that simply attend exhibitions from those that consistently achieve measurable results.",
      },
      {
        type: "p",
        text: "This guide walks through every stage of exhibition preparation, from three months before the event until the final day of the show.",
      },
      { type: "h2", text: "Why preparation determines exhibition success" },
      {
        type: "p",
        text: "Many exhibitors focus most of their attention on booth design. While appearance certainly matters, a beautiful stand alone won't generate sales.",
      },
      {
        type: "p",
        text: "Preparation involves much more than graphics and banners. It includes setting clear objectives, training your team, identifying target buyers, scheduling meetings, preparing marketing materials, and establishing a process for capturing and following up on leads.",
      },
      {
        type: "p",
        text: "Without these elements, even a busy booth can result in very few real business opportunities.",
      },
      {
        type: "p",
        text: "The exhibition itself lasts only a few days. The planning behind it determines whether those few days become a worthwhile investment.",
      },
      { type: "h2", text: "90 days before the exhibition" },
      {
        type: "p",
        text: "The most successful exhibitors begin preparing at least three months before the event. This is the time to define exactly what success looks like.",
      },
      { type: "p", text: "Ask yourself:" },
      {
        type: "ul",
        items: [
          "Why are we attending this exhibition?",
          "Are we launching a product?",
          "Looking for distributors?",
          "Meeting existing customers?",
          "Finding new buyers?",
          "Building brand awareness?",
          "Researching competitors?",
        ],
      },
      { type: "p", text: "Clear objectives influence every decision that follows." },
      { type: "p", text: "You should also establish measurable goals, such as:" },
      {
        type: "ul",
        items: [
          "Number of meetings",
          "Qualified leads",
          "Product demonstrations",
          "Distributor enquiries",
          "Sales opportunities",
          "Revenue target",
        ],
      },
      {
        type: "p",
        text: "Without measurable goals, it's impossible to evaluate your return on investment after the event.",
      },
      { type: "h3", text: "Research the visitor profile" },
      { type: "p", text: "Not every exhibition attracts the same audience. Study previous attendee statistics carefully." },
      { type: "p", text: "Consider:" },
      {
        type: "ul",
        items: [
          "Industries represented",
          "Company sizes",
          "Countries attending",
          "Job titles",
          "Decision-makers versus influencers",
          "Returning visitors",
          "Buyer demographics",
        ],
      },
      {
        type: "p",
        text: "Understanding your audience allows you to tailor your messaging and decide which products deserve the most attention.",
      },
      { type: "h3", text: "Book meetings before the exhibition" },
      {
        type: "p",
        text: "One of the biggest mistakes exhibitors make is relying on walk-in traffic. Today's buyers often arrive with their schedules already full.",
      },
      { type: "p", text: "Weeks before the event, reach out to:" },
      {
        type: "ul",
        items: [
          "Existing customers",
          "Warm prospects",
          "LinkedIn connections",
          "Industry contacts",
          "Distributors",
          "Suppliers",
          "Partners",
        ],
      },
      {
        type: "p",
        text: "Invite them to visit your booth at a specific time. Pre-booked meetings almost always produce higher-quality conversations than spontaneous booth visits.",
      },
      { type: "h2", text: "60 days before the exhibition" },
      { type: "p", text: "Now it's time to prepare your marketing assets. Ensure you have:" },
      {
        type: "ul",
        items: [
          "Updated brochures",
          "Business cards",
          "Product catalogues",
          "QR codes",
          "Digital presentations",
          "Product videos",
          "Price lists, if appropriate",
          "Samples",
        ],
      },
      {
        type: "p",
        text: "Everything should communicate a consistent message and clearly explain the value your business offers.",
      },
      { type: "h3", text: "Train your exhibition team" },
      { type: "p", text: "Your booth staff are the face of your company. Everyone attending should understand:" },
      {
        type: "ul",
        items: [
          "Your products",
          "Your ideal customer",
          "Common customer questions",
          "Competitor positioning",
          "Pricing strategy",
          "Lead qualification process",
          "Next steps after the exhibition",
        ],
      },
      {
        type: "p",
        text: "Role-playing customer conversations before the event builds confidence and creates consistency across the team.",
      },
      { type: "h2", text: "30 days before the exhibition" },
      { type: "p", text: "At this stage, logistics become the priority. Confirm:" },
      {
        type: "ul",
        items: [
          "Booth construction",
          "Furniture",
          "Lighting",
          "Internet access",
          "Power requirements",
          "Shipping arrangements",
          "Product samples",
          "Customs documentation",
          "Hotel reservations",
          "Travel schedules",
        ],
      },
      {
        type: "p",
        text: "Leaving logistics until the final week often creates unnecessary stress and additional costs.",
      },
      { type: "h3", text: "Prepare your lead capture process" },
      {
        type: "p",
        text: "Many exhibitors still rely on handwritten notes or stacks of business cards. Unfortunately, valuable information is often forgotten once the exhibition ends.",
      },
      { type: "p", text: "Every conversation should capture information such as:" },
      {
        type: "ul",
        items: [
          "Contact details",
          "Company",
          "Products of interest",
          "Buying timeline",
          "Budget",
          "Decision-making authority",
          "Pain points",
          "Next action",
        ],
      },
      { type: "p", text: "The more structured your process, the easier your follow-up becomes." },
      { type: "h3", text: "Build a lead qualification framework" },
      {
        type: "p",
        text: "Not every visitor deserves the same level of attention after the exhibition. Create a simple scoring system. For example:",
      },
      { type: "h3", text: "Hot leads" },
      {
        type: "ul",
        items: ["Immediate buying need", "Decision-maker", "Budget available"],
      },
      { type: "h3", text: "Warm leads" },
      {
        type: "ul",
        items: ["Strong interest", "Future opportunity", "Needs nurturing"],
      },
      { type: "h3", text: "Cold leads" },
      {
        type: "ul",
        items: ["Information gathering", "Students", "Media", "Suppliers"],
      },
      { type: "p", text: "This allows your sales team to prioritise follow-up after the event." },
      { type: "h2", text: "One week before the exhibition" },
      { type: "p", text: "Perform a final review. Confirm:" },
      {
        type: "ul",
        items: [
          "Travel documents",
          "Exhibition passes",
          "Hotel bookings",
          "Meeting schedule",
          "Product samples",
          "Marketing material",
          "Chargers and extension cords",
          "Laptop and tablets",
          "Phone chargers",
          "Business cards",
          "Company uniforms",
          "Stationery",
          "Emergency contacts",
        ],
      },
      { type: "p", text: "Small details often become major problems if overlooked." },
      { type: "h2", text: "During the exhibition" },
      { type: "p", text: "Preparation doesn't stop once the exhibition begins. Each morning:" },
      {
        type: "ul",
        items: [
          "Review the day's meetings",
          "Assign responsibilities",
          "Check product displays",
          "Test presentation equipment",
          "Brief the team",
        ],
      },
      { type: "p", text: "At the end of each day:" },
      {
        type: "ul",
        items: [
          "Review every lead collected",
          "Update notes while conversations are still fresh",
          "Identify urgent follow-ups",
          "Prepare for tomorrow's meetings",
        ],
      },
      { type: "p", text: "Daily reviews prevent valuable information from being lost." },
      { type: "h2", text: "Common booth preparation mistakes" },
      {
        type: "p",
        text: "Many exhibitors make avoidable mistakes that reduce their return on investment. Common examples include:",
      },
      {
        type: "ul",
        items: [
          "Waiting for visitors instead of engaging them",
          "Focusing on quantity rather than quality",
          "Not qualifying leads",
          "Collecting business cards without recording context",
          "Failing to schedule meetings in advance",
          "Having inconsistent messaging across team members",
          "Delaying follow-up after the event",
        ],
      },
      {
        type: "p",
        text: "Avoiding these mistakes often delivers a greater improvement than increasing your exhibition budget.",
      },
      { type: "h2", text: "Your exhibition preparation checklist" },
      {
        type: "p",
        text: "Before leaving for the exhibition, ensure you have completed the following:",
      },
      { type: "h3", text: "Strategy" },
      {
        type: "ul",
        items: ["Defined clear objectives", "Established measurable KPIs", "Identified target audience"],
      },
      { type: "h3", text: "Marketing" },
      {
        type: "ul",
        items: ["Brochures", "Business cards", "Product catalogues", "QR codes", "Digital presentations"],
      },
      { type: "h3", text: "Booth" },
      {
        type: "ul",
        items: ["Graphics installed", "Furniture confirmed", "Internet tested", "Lighting checked"],
      },
      { type: "h3", text: "Sales" },
      {
        type: "ul",
        items: [
          "Meeting schedule prepared",
          "Lead qualification questions ready",
          "Sales team trained",
          "Lead capture system tested",
        ],
      },
      { type: "h3", text: "Logistics" },
      {
        type: "ul",
        items: ["Flights booked", "Hotels confirmed", "Product samples packed", "Shipping verified"],
      },
      { type: "h2", text: "Final thoughts" },
      { type: "p", text: "Exceptional exhibitions rarely happen by chance." },
      {
        type: "p",
        text: "Behind every productive booth is a carefully planned strategy, a well-prepared team, and a structured process that begins long before the exhibition opens.",
      },
      {
        type: "p",
        text: "While attractive booth designs can capture attention, it's preparation that converts conversations into meaningful business opportunities.",
      },
      {
        type: "p",
        text: "The businesses that consistently achieve the best exhibition results don't simply work harder during the event, they prepare smarter before it.",
      },
      {
        type: "p",
        text: "And once those valuable conversations begin, having a reliable system to capture, organise, qualify, and follow up on every lead becomes just as important as the booth itself. That's where solutions like ExpoLead help exhibitors ensure that no opportunity is lost after the event.",
      },
    ],
  },
];

export const TOPICS = ["Exhibitions", "Sales", "Marketing", "Follow-up"] as const;

export function getArticle(slug: string): Article | undefined {
  return ARTICLES.find((a) => a.slug === slug);
}
