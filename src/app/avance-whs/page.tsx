"use client";

import { useEffect, useMemo, useState } from "react";

const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

type Month = (typeof months)[number];
type Mark = "" | "✓" | "R" | "X";
type ChecklistState = Record<string, Partial<Record<Month, Mark>>>;

const kitItems = [
  ["Instructions for providing first aid, including CPR flow chart", "1"],
  ["Notebook and pen", "1"],
  ["Resuscitation face mask or face shield", "1"],
  ["Disposable nitrile examination gloves", "5 pairs"],
  ["Sterile gauze 7.5 × 7.5 cm (3 per pack)", "5 packs"],
  ["Saline 15 mL", "8"],
  ["Wound cleaning wipes", "10"],
  ["Adhesive dressing strips (packet of 50)", "1 pack"],
  ["Single-use splinter probes", "10"],
  ["Tweezers / forceps", "1"],
  ["Antiseptic liquid or spray 50 mL", "1"],
  ["Non-adherent wound dressing 5 × 5 cm", "6"],
  ["Non-adherent wound dressing 7.5 × 10 cm", "3"],
  ["Non-adherent wound dressing 10 × 10 cm", "1"],
  ["Conforming cotton bandage 5 cm", "3"],
  ["Conforming cotton bandage 7.5 cm", "3"],
  ["Crepe bandage 10 cm", "1"],
  ["Scissors", "1"],
  ["Hypoallergenic adhesive tape 2.5 cm roll", "1"],
  ["Safety pins (packet of 6)", "1 pack"],
  ["BPC wound dressing No. 14, medium", "1"],
  ["BPC wound dressing No. 15, large", "1"],
  ["Combine dressing pad 9 × 20 cm", "1"],
  ["Clip-seal plastic bag", "1"],
  ["Triangular bandage, minimum 90 cm width", "2"],
  ["Emergency rescue blanket", "1"],
  ["Eye pad, single use", "4"],
  ["Burns: clean running water or hydrogel access", "20 L water or 5 sachets"],
  ["Instant ice pack", "1"],
] as const;

const markCycle: Mark[] = ["", "✓", "R", "X"];
const storageKey = "joshhub-avance-first-aid-checklist-v1";

const sourceLinks = [
  {
    label: "SafeWork NSW — First aid in the workplace",
    href: "https://www.safework.nsw.gov.au/safety-starts-here/safety-overview/first-aid-in-the-workplace",
  },
  {
    label: "SafeWork NSW — First aid in the workplace Code of Practice",
    href: "https://www.safework.nsw.gov.au/__data/assets/pdf_file/0004/50089/SW08836-Code-of-practice-First-aid-in-the-workplace.pdf",
  },
  {
    label: "SafeWork NSW — Safety induction",
    href: "https://www.safework.nsw.gov.au/safety-starts-here/safety-support/training-and-orienting-workers/safety-induction",
  },
  {
    label: "NSW Work Health and Safety Regulation 2025",
    href: "https://legislation.nsw.gov.au/view/html/inforce/current/sl-2025-0440",
  },
  {
    label: "NSW Work Health and Safety Act 2011",
    href: "https://legislation.nsw.gov.au/view/html/inforce/current/act-2011-010",
  },
];

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h2 className="font-semibold text-slate-950 dark:text-white">{title}</h2>
      <div className="mt-2 space-y-1 text-sm leading-5 text-slate-600 dark:text-slate-300">
        {children}
      </div>
    </article>
  );
}

export default function AvanceWhsPage() {
  const [checks, setChecks] = useState<ChecklistState>({});
  const [year, setYear] = useState(new Date().getFullYear());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) {
        const saved = JSON.parse(raw) as {
          year?: number;
          checks?: ChecklistState;
        };
        if (saved.year) setYear(saved.year);
        if (saved.checks) setChecks(saved.checks);
      }
    } catch {
      // The page remains usable when browser storage is blocked or malformed.
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify({ year, checks }));
    } catch {
      // Printing and manual use still work without local storage.
    }
  }, [checks, year, loaded]);

  const recordedCells = useMemo(() => {
    return Object.values(checks).reduce(
      (total, row) => total + Object.values(row).filter(Boolean).length,
      0
    );
  }, [checks]);

  const cycleMark = (item: string, month: Month) => {
    setChecks((current) => {
      const currentMark = current[item]?.[month] ?? "";
      const nextMark = markCycle[(markCycle.indexOf(currentMark) + 1) % markCycle.length];
      return {
        ...current,
        [item]: {
          ...current[item],
          [month]: nextMark,
        },
      };
    });
  };

  const clearChecklist = () => {
    if (window.confirm("Clear all monthly first aid kit marks?")) {
      setChecks({});
    }
  };

  return (
    <main className="avance-whs-page mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <header className="print:hidden">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
          Avance Business Technology · Dubbo NSW
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950 dark:text-white">
          WHS, Emergency &amp; First Aid Hub
        </h1>
        <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-600 dark:text-slate-300">
          Operational reference for induction, emergency response, injury reporting and first aid
          kit maintenance. It supports record-keeping but does not replace actual instruction,
          supervision, consultation, risk assessment, first aid arrangements or the workplace
          emergency plan.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 print:hidden">
        <Panel title="Workplace">
          <p>
            <strong>Site:</strong> 10/36 Darling Street, Dubbo NSW 2830
          </p>
          <p>
            <strong>Phone:</strong> (02) 6837 1555
          </p>
          <p>IT/MSP office work and client-site support.</p>
        </Panel>

        <Panel title="First aid">
          <p>
            <strong>Kit:</strong> Kitchen
          </p>
          <p>
            <strong>First aider / kit checks:</strong> Joshua Parris
          </p>
          <p>
            <strong>Avance check frequency:</strong> Monthly + after use
          </p>
        </Panel>

        <Panel title="Emergency">
          <p>
            <strong>Coordinator:</strong> Andrew Johnston (Managing Director); if absent, senior
            worker present
          </p>
          <p>
            <strong>Assembly point:</strong> Car Compound
          </p>
          <p>
            <strong>Emergency:</strong> 000
          </p>
        </Panel>

        <Panel title="Reporting">
          <p>Report work-related injury or illness promptly to Andrew Johnston or Joshua Parris.</p>
          <p>
            <strong>SafeWork notifiable incidents:</strong> 13 10 50
          </p>
        </Panel>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 print:hidden">
        <h2 className="text-xl font-semibold text-slate-950 dark:text-white">Quick forms</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <a
            className="rounded-xl border border-blue-200 p-4 text-sm font-semibold text-blue-700 hover:bg-blue-50 dark:border-blue-900 dark:text-blue-300 dark:hover:bg-slate-800"
            href="https://forms.gle/KpvtLfVrXWxZCuEW9"
            target="_blank"
            rel="noreferrer"
          >
            WHS induction form ↗
          </a>
          <a
            className="rounded-xl border border-blue-200 p-4 text-sm font-semibold text-blue-700 hover:bg-blue-50 dark:border-blue-900 dark:text-blue-300 dark:hover:bg-slate-800"
            href="https://tinyurl.com/AVANCEINJURYREGISTERENTRY"
            target="_blank"
            rel="noreferrer"
          >
            Injury Register entry ↗
          </a>
          <a
            className="rounded-xl border border-blue-200 p-4 text-sm font-semibold text-blue-700 hover:bg-blue-50 dark:border-blue-900 dark:text-blue-300 dark:hover:bg-slate-800"
            href="https://docs.google.com/forms/d/1EU2LnrUjssuqwSra_gimNzhJHxA4m9C7R8BQ5Wzw33Q/viewform"
            target="_blank"
            rel="noreferrer"
          >
            Hazard / incident report ↗
          </a>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2 print:hidden">
        <Panel title="Emergency & first aid procedure">
          <p>
            Raise the alarm, call 000 when required and evacuate by the nearest safe exit to the Car
            Compound. Do not re-enter until authorised and report anyone missing.
          </p>
          <p>
            Joshua Parris, or another trained first aider, provides first aid within training, uses
            the kitchen kit, calls 000 when needed and records treatment/injury.
          </p>
          <p>
            For fire, electrical or other danger: do not take unsafe action. Isolate or evacuate;
            use emergency equipment only if trained and safe.
          </p>
          <p>
            The Emergency Coordinator communicates with workers/emergency services, accounts for
            people and arranges help for anyone needing assistance to evacuate.
          </p>
          <p>
            If Joshua is absent, management must ensure adequate access to a trained first aider
            before work is undertaken.
          </p>
        </Panel>

        <Panel title="Injury, claims & recovery at work">
          <p>
            Record every work-related injury or illness. Avance&apos;s plan says the insurer/claims
            service provider is notified within 48 hours.
          </p>
          <p>
            Death, serious injury/illness or a dangerous incident must be notified to SafeWork NSW
            immediately where the statutory notification test is met, and the site preserved where
            required.
          </p>
          <p>
            <strong>Workers compensation insurer:</strong> icare Workers Insurance · policy
            enquiries 13 44 22.
          </p>
          <p>
            <strong>Recovery at Work:</strong> Andrew Johnston. Avance consults and supports the
            worker, cooperates with injury management, and provides suitable work where reasonably
            practicable.
          </p>
          <p>
            <strong>Dispute help:</strong> SIRA 13 74 72 · IRO 13 94 76 · Personal Injury
            Commission.
          </p>
        </Panel>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 print:hidden">
        <h2 className="text-xl font-semibold text-slate-950 dark:text-white">
          WHS induction — keep it short and role-specific
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
          Record worker name, role, induction date, supervisor and work location; explain WHS
          duties; relevant hazards, risks and controls; safe work procedures/equipment/PPE where
          applicable; psychosocial and client-site/remote-work risks where relevant; hazard, injury,
          incident and near-miss reporting; consultation; emergency exits, evacuation and assembly
          point; first aid; and whether the worker understands or needs further training.
        </p>
        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
          A form is evidence of induction, not the induction itself. General HR matters such as
          awards, leave, payroll/time recording and meal breaks do not need to be duplicated in this
          WHS-only record unless they are relevant to a specific safety risk or procedure.
        </p>
      </section>

      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-950 dark:border-amber-900/70 dark:bg-amber-950/30 dark:text-amber-100 print:hidden">
        <h2 className="font-semibold">Client-site / mobile-worker action</h2>
        <p className="mt-1 leading-6">
          SafeWork NSW guidance says portable first aid kits should be provided in vehicles used by
          mobile workers. Confirm Avance&apos;s arrangement for technicians travelling to client
          sites and add vehicle-kit checks to the workplace risk controls where applicable.
        </p>
      </section>

      <section
        id="first-aid-checklist"
        className="first-aid-print rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between print:mb-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 print:text-black">
              Avance Business Technology
            </p>
            <h2 className="text-2xl font-bold text-slate-950 dark:text-white print:text-lg print:text-black">
              First Aid Kit Inspection Checklist
            </h2>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 print:text-black">
              10/36 Darling Street, Dubbo NSW 2830 · Kit: Kitchen · Responsible: Joshua Parris ·
              Monthly + after use
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 print:hidden">
            <label className="text-sm text-slate-600 dark:text-slate-300">
              Year
              <input
                type="number"
                value={year}
                onChange={(event) => setYear(Number(event.target.value))}
                className="ml-2 w-24 rounded-md border border-slate-300 bg-white px-2 py-1 dark:border-slate-700 dark:bg-slate-950"
              />
            </label>
            <button
              type="button"
              onClick={() => window.print()}
              className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-950"
            >
              Print A4 landscape
            </button>
            <button
              type="button"
              onClick={clearChecklist}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Clear
            </button>
          </div>
        </div>

        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 dark:text-slate-300 print:text-[7px] print:text-black">
          <p>
            <strong>Legend:</strong> ✓ OK · R Restock · X Replace · tap/click a month cell to cycle
          </p>
          <p>
            <strong>Year:</strong> {year} · <strong>Recorded cells:</strong> {recordedCells}
          </p>
        </div>

        <div className="overflow-x-auto print:overflow-visible">
          <table className="w-full min-w-[1050px] border-collapse text-xs print:min-w-0 print:text-[6.5px]">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800 print:bg-white">
                <th className="border border-slate-300 px-2 py-1 text-left font-semibold dark:border-slate-700 print:border-black print:px-1">
                  Item
                </th>
                <th className="w-24 border border-slate-300 px-2 py-1 text-center font-semibold dark:border-slate-700 print:w-[20mm] print:border-black print:px-1">
                  Qty
                </th>
                {months.map((month) => (
                  <th
                    key={month}
                    className="w-10 border border-slate-300 px-1 py-1 text-center font-semibold dark:border-slate-700 print:w-[9mm] print:border-black print:px-0"
                  >
                    {month}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {kitItems.map(([item, qty]) => (
                <tr key={item}>
                  <td className="border border-slate-300 px-2 py-1 leading-tight text-slate-800 dark:border-slate-700 dark:text-slate-100 print:border-black print:px-1 print:py-[1px] print:text-black">
                    {item}
                  </td>
                  <td className="border border-slate-300 px-2 py-1 text-center font-medium text-slate-700 dark:border-slate-700 dark:text-slate-200 print:border-black print:px-1 print:py-[1px] print:text-black">
                    {qty}
                  </td>
                  {months.map((month) => {
                    const mark = checks[item]?.[month] ?? "";
                    return (
                      <td
                        key={month}
                        className="border border-slate-300 p-0 text-center dark:border-slate-700 print:border-black"
                      >
                        <button
                          type="button"
                          onClick={() => cycleMark(item, month)}
                          aria-label={`${item}, ${month}: ${mark || "blank"}`}
                          className="h-7 w-full font-bold text-slate-900 hover:bg-blue-50 dark:text-white dark:hover:bg-slate-800 print:h-auto print:min-h-[3.6mm] print:text-black"
                        >
                          {mark}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-3 grid gap-2 text-xs text-slate-700 dark:text-slate-200 sm:grid-cols-2 print:mt-1 print:grid-cols-2 print:text-[7px] print:text-black">
          <p>
            <strong>Each check confirms:</strong> required contents present; used items replaced;
            sterile items sealed and undamaged; expiry dates checked; kit accessible and
            identifiable.
          </p>
          <p>
            <strong>Checked by / date / action:</strong>
            ________________________________________________________________
          </p>
        </div>
        <p className="mt-2 text-[11px] leading-4 text-slate-500 dark:text-slate-400 print:mt-1 print:text-[6px] print:leading-tight print:text-black">
          The contents above follow the SafeWork NSW Code of Practice Appendix C example for most
          workplaces. Actual contents must be based on Avance&apos;s workplace risk assessment and
          may require additional items. Monthly + after-use checking is Avance&apos;s nominated
          maintenance schedule, not a claim that NSW law prescribes a monthly interval.
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 print:hidden">
        <h2 className="text-xl font-semibold text-slate-950 dark:text-white">
          Plan control &amp; official sources
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
          Avance&apos;s current plan calls for emergency arrangements to be reviewed at least
          annually and after incidents/changes, emergency procedures to be tested at least annually
          and after significant changes/incidents, and the plan to be provided at induction and
          after changes. The RTW section in the source document assumes Avance is a NSW Category 2
          employer; that classification should be confirmed against current SIRA requirements.
        </p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {sourceLinks.map((source) => (
            <a
              key={source.href}
              href={source.href}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-slate-200 p-3 text-sm font-medium text-blue-700 hover:bg-blue-50 dark:border-slate-700 dark:text-blue-300 dark:hover:bg-slate-800"
            >
              {source.label} ↗
            </a>
          ))}
        </div>
      </section>

      <style jsx global>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 6mm;
          }
          body > div > header,
          nav,
          footer,
          aside {
            display: none !important;
          }
          html,
          body {
            background: white !important;
          }
          body {
            margin: 0 !important;
          }
          .avance-whs-page > *:not(.first-aid-print) {
            display: none !important;
          }
          .first-aid-print {
            border: 0 !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
          }
        }
      `}</style>
    </main>
  );
}
