import FieldGuideProgress from "@/components/learn/FieldGuideProgress";

export const metadata = {
  title: "New e-waste sourcing leads | JoshHub",
  description: "DubboEwaste evidence-based research, contact routes and safe device sourcing.",
};

const guideUrl = "https://github.com/joshualparris/JoshHub/blob/main/docs/research/DUBBO-NEW-EWASTE-OUTREACH-LEADS-2026-10-11.md";
const leads = [
  {name:"Custom Computer Creations",sector:"Independent computer repairs",email:"sales@customcomputercreations.com.au",status:"Directory email: verify first",why:"PC upgrades and faulty parts; customer devices are not stock.",url:"https://www.customcomputercreations.com.au/contact"},
  {name:"Right Click Go",sector:"Independent computer support",email:"Use contact form",status:"Business form verified",why:"Ask about owner-released failed repairs and referrals.",url:"https://www.rightclickgo.com.au/contact-us/"},
  {name:"Inland Technology",sector:"Managed print",email:"contactus@inlandtechnology.com.au",status:"Business email verified",why:"Ask about lifecycle and vendor-controlled printer equipment.",url:"https://inlandtechnology.com.au/Dubbo"},
  {name:"Page Electronics",sector:"Electronics repair",email:"shop@pageelectronics.com.au",status:"Business email verified",why:"Possible parts and repair mentorship; mostly television work.",url:"https://www.pageelectronics.com.au/contact"},
  {name:"Westhaven",sector:"Regional employer",email:"choice@westhaven.org.au",status:"Business email verified",why:"Historical Chromebook refresh; ask current ICT asset owner.",url:"https://www.westhaven.org.au/enquire-now/"},
  {name:"Fletcher International",sector:"Regional employer",email:"mailbox@fletchint.com.au",status:"Business email verified",why:"Ask about office computer lifecycle, not industrial machinery.",url:"https://www.fletchint.com.au/contacts/"},
  {name:"MAAS Group",sector:"Regional employer",email:"info@maasgroup.com.au",status:"Business email verified",why:"First determine which group entity owns assets.",url:"https://maasgroup.com.au/contact.html"},
  {name:"Earlyrise Baking",sector:"Regional employer",email:"sales@earlyrisebaking.com.au",status:"General sales email verified",why:"Ask about office and logistics handheld equipment.",url:"https://www.earlyrisebaking.com.au/contact"},
  {name:"Inland Petroleum",sector:"Regional employer",email:"mailbox@inlandpetrol.com.au",status:"Business email verified",why:"Multi-location operator; ask who decides disposal of devices.",url:"https://www.inlandpetroleum.com.au/contact"},
  {name:"Macquarie Anglican Grammar School",sector:"Independent school",email:"contact@mags.nsw.edu.au",status:"Published directory email",why:"Find business manager and ICT policy before discussing donation.",url:"https://www.mags.nsw.edu.au/contact-us/"},
  {name:"Central West Leadership Academy",sector:"Independent school",email:"office@theacademy.nsw.edu.au",status:"Business email verified",why:"Ask if an education or repair partnership fits approved policies.",url:"https://theacademy.nsw.edu.au/contact-us"},
];
const lessons = [
  {id:"locate",title:"1. Find an uncontacted source",question:"Two potential sources reply: a computer repair shop has six uncollected client laptops; an employer has three owned PCs with approved release records but no stated erasure method. Which lead should you advance first?",options:["Contact both organisations with the same agreement and adjust the forms after the first collection.","Arrange collection of the six laptops after the shop's manager agrees verbally.","Explore a strictly conditional pilot with the employer, verifying data sanitisation/custody before any collection.","Collect only the laptops without chargers because they have little resale value."],answer:2,explanation:"The employer has a clearer potential ownership path, but data responsibility is still unresolved. No stock should move before authorisation and safe handoff."},
  {id:"authority",title:"2. Qualify a safe five-device pilot",question:"A business manager offers five retired laptops. Two are leased, one has a swollen battery, and the remaining two have unidentified drives. Which pilot scope is most justified?",options:["Remove drives from the five units at collection, treating the battery risk as separate from the device donation.","Accept the two non-leased units straightaway because unidentified storage can be wiped later.","Include all five after receiving one generic donation form signed by the manager.","Exclude leased units pending title confirmation and isolate the damaged battery device; consider the two others only after release, sanitisation and downstream responsibilities are settled."],answer:3,explanation:"Asset class and condition matter. A transfer form does not cancel lease obligations or battery hazards, and data-bearing equipment needs an authorised plan."},
  {id:"capacity",title:"3. Plan a sustainable fortnight",question:"You have three hours of project time this fortnight, two uncontacted independent shops, an unanswered existing email and no space for more than five devices. Which plan best balances learning, relationships and capacity?",options:["Follow up once with the existing contact when reasonable, approach one genuinely uncontacted shop with a process question, and reserve time to prepare a five-unit acceptance checklist.","Send the same collection offer to both shops and the local schools, then prioritise whoever replies first.","Use the full three hours building a stock-tracking database so outreach can begin once the software is complete.","Spend the three hours researching every local employer in case one has a large fleet."],answer:0,explanation:"A narrow, consent-aware process enquiry and a verified acceptance workflow fit a small part-time pilot better than volume or premature tooling."},
];
export default function OutreachLearningPage() {
  return <main className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-6">
    <header className="space-y-3">
      <a className="underline" href="/learn">← Learning catalogue</a>
      <p className="text-sm uppercase tracking-wide">DubboEwaste · Research checked 11 October 2026</p>
      <h1 className="text-3xl font-bold sm:text-5xl">Find additional local e-waste sources responsibly</h1>
      <p>27 additional prospects or contact routes, checked against 21 sent outreach messages. No organisation has offered free equipment, and no new enquiries have been sent.</p>
      <p><a href="https://github.com/joshualparris/JoshHub/blob/main/docs/research/DUBBO-TECH-BUSINESS-DECISION-BRIEF-2026-10-11.md" className="underline" target="_blank" rel="noreferrer">Read the complete business comparison and 56 decision-maker questions ↗</a></p>
      <a className="underline" href={guideUrl} target="_blank" rel="noreferrer">Read the full 27-lead research, sources and 30-day plan ↗</a>
    </header>
    <section className="space-y-4" aria-labelledby="lessons-title">
      <h2 id="lessons-title" className="text-2xl font-semibold">Three short lessons</h2>
      <div className="space-y-4">
        <article className="rounded-xl border p-5"><h3 className="font-semibold">1. Identify the actual owner</h3><p>Repairers may hold customer devices; employers may own office fleets; chains may return equipment centrally. Distinguish a physical repair opportunity from permission to take the item.</p><p className="mt-2">Practice: compare Custom Computer Creations with Westhaven. Write down who you would ask and why.</p></article>
        <article className="rounded-xl border p-5"><h3 className="font-semibold">2. Set a responsible handoff</h3><p>Confirm written release, serials, data-bearing storage, sanitisation responsibilities, battery safety and a fallback recycling pathway. Do not promise certified destruction until it is demonstrably supported.</p><p className="mt-2">Practice: draft a five-device hypothetical handoff with one rejection/stop condition.</p></article>
        <article className="rounded-xl border p-5"><h3 className="font-semibold">3. Use a small two-week outreach budget</h3><p>Contact two suitable organisations, not everyone at once. Ask a genuine process question rather than assuming donation. Keep independent project contacts separate from employer relationships.</p><p className="mt-2">Practice: record the role to contact, question, effort cap and follow-up date.</p></article>
      </div>
    </section>
    <FieldGuideProgress storageKey="field-guide:dubbo-ewaste-outreach:2026-10-11.2" lessons={lessons.map(({id,title,question,options,answer,explanation})=>({id,title,check:{question,options,answer,explanation}}))} />
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold">Recommended research contacts</h2>
      <p>These eleven are highlights only. The linked report contains all 27 and their evidence sources. “Email verified” means published, not tested for delivery or a guarantee of response.</p>
      <div className="grid gap-3 sm:grid-cols-2">{leads.map(lead=><article key={lead.name} className="space-y-2 rounded-xl border p-4">
        <h3 className="font-semibold">{lead.name}</h3><p className="text-sm">{lead.sector}</p><p>{lead.why}</p>
        <p className="break-all text-sm">{lead.email}</p><p className="text-sm">{lead.status}</p>
        <a className="underline" href={lead.url} rel="noreferrer" target="_blank">Check official contact and services ↗</a>
      </article>)}</div>
    </section>
    <section className="rounded-xl border p-5">
      <h2 className="text-xl font-semibold">Important boundaries</h2>
      <p>NSW public schools have a dedicated departmental e-waste contract, so individual school enquiries should not try to bypass it. Leases, warranty returns, client property, business data and battery hazards may exclude items from reuse.</p>
      <a className="underline" target="_blank" rel="noreferrer" href="https://education.nsw.gov.au/policy-library/policies/pd-2024-0481-01">NSW Education technology procedures ↗</a>
    </section>
  </main>;
}
