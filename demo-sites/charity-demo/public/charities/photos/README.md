# Charity gallery photos ("Inspiring giving in action" marquee)

Drop a photo here named by the charity's slug and the card on the homepage
uses it automatically. No code change is needed.

Only charities on the CHARITY_FLOW.md shortlist (the table of 15) may
appear anywhere on the site.

The card (`app/_components/home/charity-gallery-section.tsx`) looks for each
file by slug, trying `.webp` first then `.jpg`. Until a file is present the
card falls back to its abstract shape + the charity name, so the marquee
never looks broken.

The whole card sits in black-and-white and snaps to full colour on hover, so
photos with clear subjects and good contrast work best. Cards are ~280×280px
square; supply images at least 560px wide and crop to roughly square.

| Charity | File to add (either extension) |
|---|---|
| headspace | `headspace.webp` or `.jpg` |
| Cancer Council Australia | `cancer-council-australia.webp` or `.jpg` |
| Royal Flying Doctor Service | `rfds.webp` or `.jpg` |
| R U OK? | `ruok.webp` or `.jpg` |
| Starlight Children's Foundation | `starlight.webp` or `.jpg` |
| RSPCA Australia | `rspca-australia.webp` or `.jpg` |
| WWF-Australia | `wwf-australia.webp` or `.jpg` |
| St Vincent de Paul Society | `vinnies.webp` or `.jpg` |

Only use imagery these organisations publish for third-party use, or that you
have explicit permission to display. They are shown as illustrative examples
of eligible causes, not as confirmed partners.
