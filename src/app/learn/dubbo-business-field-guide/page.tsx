import data from "@/data/dubbo-business-field-guide.json";
import FieldGuideProgress from "@/components/learn/FieldGuideProgress";
export const metadata = { title: "Dubbo business field guide | JoshHub" };

const sourceMap = new Map(data.sources.map((source) => [source.id, source]));
function Evidence({ text }: { text: string }) {
  return <>{text.split(/(\[[A-Z]+\d+(?:, [A-Z]+\d+)*\])/g).map((part, index) => {
    if (!/^\[[A-Z]+\d+/.test(part)) return <span key={index}>{part}</span>;
    return <span key={index}> {part.slice(1, -1).split(", ").map((id) => <a key={id} className="underline" href={sourceMap.get(id)?.url} target="_blank" rel="noreferrer">[{id}] </a>)}</span>;
  })}</>;
}
export default function BusinessFieldGuidePage() {
  return <article className="field-guide mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-6">
    <header className="space-y-4">
      <a href="/learn" className="underline">← All learning</a>
      <p className="text-sm uppercase tracking-widest">Local business field guide · {data.reviewed}</p>
      <h1 className="text-3xl font-bold sm:text-5xl">{data.title}</h1>
      <p className="text-lg">{data.summary}</p>
      <p>Six lessons · about 100 minutes · optional fieldwork. Learn how these businesses operate, what public evidence says about working there, and where your projects may fit.</p>
      <p><strong>Evidence boundary:</strong> public role maps and documented practices; gaps remain where internal reporting lines or employee experience cannot be verified.</p>
      <p><a href="https://github.com/joshualparris/JoshHub/blob/main/docs/research/DUBBO-TECH-BUSINESS-DECISION-BRIEF-2026-10-11.md" className="underline" target="_blank" rel="noreferrer">Open the completed A–G comparison: 15 locations, relationship map, shortlists and 56 interview questions ↗</a></p>
      <a href="https://github.com/joshualparris/JoshHub/blob/main/docs/research/DUBBO-TECH-BUSINESS-FIELD-GUIDE-2026-10-10.md" className="inline-block rounded border px-4 py-2 underline">Read the full research report on GitHub</a>
    </header>
    <nav aria-label="Field guide sections" className="flex flex-wrap gap-4 rounded-xl border p-4">
      <a className="underline" href="#pathway">Lessons</a><a className="underline" href="#businesses">Business dossiers</a><a className="underline" href="#projects">Project experiments</a><a className="underline" href="#priorities">First conversations</a><a className="underline" href="#method">Method & limits</a><a className="underline" href="#sources">67 sources</a>
    </nav>
    <section id="pathway" className="space-y-5">
      <h2 className="text-2xl font-semibold">Learning pathway</h2>
      <ol className="list-inside list-decimal space-y-2">{data.lessons.map((lesson) => <li key={lesson.id}><a className="underline" href={`#lesson-${lesson.id}`}>{lesson.title.replace(/^\d+\. /, "")}</a> · {lesson.minutes} min</li>)}</ol>
      {data.lessons.map((lesson) => <section key={lesson.id} id={`lesson-${lesson.id}`} className="scroll-mt-8 space-y-4 rounded-xl border p-5">
        <h3 className="text-xl font-semibold">{lesson.title}</h3>
        <p><strong>Objective:</strong> {lesson.objective}</p>
        {lesson.reading.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        <div className="rounded border-l-4 p-4"><strong>Put it into practice</strong><p className="mt-2">{lesson.practice}</p></div>
        <a className="underline" href="#checks-title">Answer the knowledge check</a>
      </section>)}
    </section>
    <FieldGuideProgress lessons={data.lessons.map(({ id, title, check }) => ({ id, title, check }))} />
    <section id="businesses" className="space-y-5">
      <h2 className="text-2xl font-semibold">14 businesses · 15 locations</h2>
      <p>Case Indulgence has two locations. No driving-distance ranking or 20-minute filter is asserted. Open a dossier to see its evidence and questions.</p>
      {data.businesses.map((business) => <details key={business.id} id={`business-${business.id}`} className="scroll-mt-8 rounded-xl border p-5">
        <summary className="cursor-pointer text-xl font-semibold">{business.name}<span className="mt-1 block text-sm font-normal">{business.model}</span></summary>
        <div className="mt-5 space-y-5">
          <p><strong>Locations:</strong> {business.locations.join("; ")}</p>
          <section><h3 className="font-semibold">Identity & scope</h3><p><Evidence text={business.identity} /></p></section>
          <section><h3 className="font-semibold">Public people & role map</h3><p className="mb-2 text-sm">Listed roles do not establish unverified reporting lines.</p><ul className="list-disc space-y-2 pl-5">{business.team.map((item) => <li key={item}><Evidence text={item} /></li>)}</ul></section>
          <section><h3 className="font-semibold">How work runs</h3><ul className="list-disc space-y-2 pl-5">{business.operations.map((item) => <li key={item}><Evidence text={item} /></li>)}</ul></section>
          <section><h3 className="font-semibold">What working there may be like</h3><p><Evidence text={business.workplace} /></p></section>
          <section><h3 className="font-semibold">Device lifecycle & gaps</h3><p><Evidence text={business.lifecycle} /></p></section>
          <section><h3 className="font-semibold">Project implications — research inferences</h3><ul className="list-disc space-y-2 pl-5">{business.opportunities.map((item) => <li key={item}><Evidence text={item} /></li>)}</ul></section>
          <section><h3 className="font-semibold">Questions to verify</h3><ul className="list-disc space-y-2 pl-5">{business.questions.map((item) => <li key={item}>{item}</li>)}</ul></section>
          <p className="text-sm"><strong>Assessment:</strong> reuse: {business.ratings[0]}; Repair Café: {business.ratings[1]}; workplace evidence: {business.ratings[2]}; decision authority: {business.ratings[3]}.</p>
          <ul className="space-y-1">{business.sources.map((id) => <li key={id}><a className="underline" href={sourceMap.get(id)?.url} target="_blank" rel="noreferrer">{id} — {sourceMap.get(id)?.title}</a></li>)}</ul>
        </div>
      </details>)}
    </section>
    <section id="projects" className="space-y-4">
      <h2 className="text-2xl font-semibold">A separate experiment for each project</h2>
      {data.projectBriefs.map((project) => <section className="space-y-2 rounded-xl border p-5" key={project.project}>
        <h3 className="text-xl font-semibold">{project.project}</h3><p><strong>Research leads:</strong> {project.first}</p><p><strong>Deliverable:</strong> {project.deliverable}</p><p><strong>Success:</strong> {project.success}</p>
      </section>)}
    </section>
    <section id="priorities" className="space-y-4">
      <h2 className="text-2xl font-semibold">Five useful first conversations</h2>
      <p>Analyst priorities for learning and project fit, not rankings of employer quality or available donations.</p>
      {data.priorities.map((priority) => <section className="space-y-2 border-l-4 pl-4" key={priority.rank}>
        <h3 className="text-xl font-semibold">{priority.rank}. {priority.business}</h3><p><strong>{priority.goal}</strong></p><p>{priority.reason}</p><p>{priority.references.map((id) => <a key={id} className="mr-3 underline" href={sourceMap.get(id)?.url}>[{id}]</a>)}</p>
      </section>)}
    </section>
    <section id="method" className="space-y-3"><h2 className="text-2xl font-semibold">Research method & limits</h2>{data.method.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}<p>Refresh before outreach and at least every six months. Verify staffing, reporting relationships, local work conditions, release authority and current contractual arrangements directly. No outreach was sent.</p></section>
    <section id="sources" className="space-y-4"><h2 className="text-2xl font-semibold">Source register</h2><ol className="space-y-4">{data.sources.map((source) => <li id={`source-${source.id}`} key={source.id}><a className="underline" href={source.url} target="_blank" rel="noreferrer">{source.id} — {source.title}</a><p className="text-sm">{source.kind} · {source.date} · Accessed {source.accessed}</p></li>)}</ol></section>
  </article>;
}
