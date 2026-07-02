import Link from "next/link";
import { pageMetadata } from "@/lib/metadata";
import ledger from "@/lib/ledger.json";

export const metadata = pageMetadata({
  title: "The giving ledger. TheGoodIntro.",
  description:
    "A permanent public record of every charitable gift funded by a TheGoodIntro meeting. Date, charity, amount, confirmation.",
  path: "/ledger",
});

type Gift = {
  date: string;
  charity: string;
  amount: string;
  confirmation: string;
  confirmationUrl?: string;
};

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// Deterministic AU-style date from an ISO yyyy-mm-dd string. No Date object,
// so the static output never shifts with the build machine's timezone.
function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${parseInt(d, 10)} ${MONTHS[parseInt(m, 10) - 1]} ${y}`;
}

// Reuses the /giving terms language. Short, fixed, and load-bearing.
const TERMS = [
  {
    label: "DGR-endorsed only",
    body: "Only deductible gift recipient (DGR) endorsed Australian charities are eligible, so every gift is publicly verifiable on the ATO register.",
  },
  {
    label: "Paid within 14 days",
    body: "Once a meeting takes place the gift is committed and paid within 14 days, regardless of the commercial outcome of the conversation.",
  },
  {
    label: "Confirmed in writing",
    body: "The executive receives written confirmation that the gift was made, and that confirmation is recorded against the entry here.",
  },
  {
    label: "Never reversed",
    body: "Once committed, a gift is never reversed or clawed back, whatever happens after the meeting. Nothing is ever removed from this record.",
  },
];

export default function Ledger() {
  const gifts = ledger.gifts as Gift[];
  const opened = formatDate(ledger.openedOn);

  return (
    <>
      {/* Header + record */}
      <section style={{ background: "var(--paper-white)" }}>
        <div className="mx-auto max-w-5xl px-6 lg:px-10 pt-24 md:pt-32 pb-20 md:pb-28">
          <span
            className="font-mono text-[11px] uppercase tracking-[0.22em]"
            style={{ color: "var(--cream-9)" }}
          >
            The record
          </span>
          <h1
            className="mt-5 font-extrabold tracking-[-0.02em]"
            style={{
              color: "var(--cream-11)",
              fontSize: "clamp(2.25rem, 4.4vw, 3.25rem)",
              lineHeight: 1.04,
              fontFamily: "var(--font-inter), sans-serif",
            }}
          >
            Every gift, permanently.
          </h1>
          <p
            className="mt-6 max-w-2xl text-[16px] leading-relaxed"
            style={{ color: "var(--cream-9)" }}
          >
            Every meeting on TheGoodIntro funds a real gift to a DGR-endorsed
            Australian charity chosen by the executive. Each one is recorded
            here, permanently, with its written confirmation. This page is the
            proof the model runs on.
          </p>

          {/* The record: table once gifts exist, austere empty state until then */}
          <div className="mt-14 md:mt-16">
            {gifts.length === 0 ? (
              <div
                className="rounded-2xl border px-6 py-20 text-center"
                style={{ borderColor: "var(--hair)", background: "var(--cream-1)" }}
              >
                <p
                  className="mx-auto max-w-xl text-[16px] leading-relaxed"
                  style={{ color: "var(--cream-11)" }}
                >
                  The first gift will appear here after the first meeting.
                  Nothing will ever be removed.
                </p>
                <p
                  className="mt-5 font-mono text-[11px] uppercase tracking-[0.18em]"
                  style={{ color: "var(--cream-9)" }}
                >
                  Ledger opened {opened}
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr>
                      {["Date", "Charity", "Amount", "Confirmation"].map((h) => (
                        <th
                          key={h}
                          className="border-b py-3 pr-4 font-mono text-[10px] font-medium uppercase tracking-[0.18em]"
                          style={{
                            borderColor: "var(--border)",
                            color: "var(--cream-9)",
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {gifts.map((g, i) => (
                      <tr key={`${g.date}-${g.charity}-${i}`}>
                        <td
                          className="border-b py-4 pr-4 align-top font-mono text-[13px] whitespace-nowrap"
                          style={{ borderColor: "var(--hair)", color: "var(--cream-11)" }}
                        >
                          {formatDate(g.date)}
                        </td>
                        <td
                          className="border-b py-4 pr-4 align-top text-[14px]"
                          style={{ borderColor: "var(--hair)", color: "var(--cream-11)" }}
                        >
                          {g.charity}
                        </td>
                        <td
                          className="border-b py-4 pr-4 align-top font-mono text-[13px] tabular-nums whitespace-nowrap"
                          style={{ borderColor: "var(--hair)", color: "var(--cream-11)" }}
                        >
                          {g.amount}
                        </td>
                        <td
                          className="border-b py-4 align-top text-[13px]"
                          style={{ borderColor: "var(--hair)", color: "var(--cream-9)" }}
                        >
                          {g.confirmationUrl ? (
                            <a
                              href={g.confirmationUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="underline underline-offset-4 hover:text-primary"
                            >
                              {g.confirmation}
                            </a>
                          ) : (
                            g.confirmation
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
                <p
                  className="mt-6 font-mono text-[11px] uppercase tracking-[0.18em]"
                  style={{ color: "var(--cream-9)" }}
                >
                  Ledger opened {opened} · {gifts.length}{" "}
                  {gifts.length === 1 ? "gift" : "gifts"} recorded · nothing is
                  ever removed
                </p>
              </>
            )}
          </div>
        </div>
      </section>

      {/* The terms this runs on */}
      <section
        className="border-t"
        style={{ background: "var(--paper-oat)", borderColor: "var(--border)" }}
      >
        <div className="mx-auto max-w-5xl px-6 lg:px-10 py-20 md:py-24">
          <span
            className="font-mono text-[11px] uppercase tracking-[0.22em]"
            style={{ color: "var(--cream-9)" }}
          >
            The terms this runs on
          </span>
          <dl className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2">
            {TERMS.map((t) => (
              <div key={t.label}>
                <dt
                  className="text-[15px] font-semibold tracking-tight"
                  style={{ color: "var(--cream-11)" }}
                >
                  {t.label}
                </dt>
                <dd
                  className="mt-2 text-[14px] leading-relaxed"
                  style={{ color: "var(--cream-9)" }}
                >
                  {t.body}
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-12 text-[14px]" style={{ color: "var(--cream-9)" }}>
            More on how the giving works, and how to verify any charity, on the{" "}
            <Link
              href="/giving"
              className="underline underline-offset-4 hover:text-primary"
            >
              giving page
            </Link>
            .
          </p>
        </div>
      </section>
    </>
  );
}
