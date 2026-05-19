# Charity logos (rotator)

Same pattern as QuotaClub's `public/logos/`: drop the official logo file
here and the rotator uses it automatically. No code change is needed.

The marquee (`app/_components/LogoMarquee.tsx`) looks for each file by the
slug below, trying `.svg` first then `.png`. SVG is preferred (sharp at any
size); a transparent or white background looks best on the white chip.

Until a file is present, that charity falls back to a live logo-by-domain
service, and finally to its name in its brand colour, so the strip never
looks broken.

| Charity | File to add (either extension) | Get the official asset from |
|---|---|---|
| Beyond Blue | `beyond-blue.svg` or `.png` | beyondblue.org.au media/brand resources |
| The Smith Family | `the-smith-family.svg` or `.png` | thesmithfamily.com.au media centre |
| OzHarvest | `ozharvest.svg` or `.png` | ozharvest.org media/brand kit |
| Royal Flying Doctor Service | `royal-flying-doctor-service.svg` or `.png` | flyingdoctor.org.au media resources |
| Cancer Council | `cancer-council.svg` or `.png` | cancer.org.au media/brand guidelines |
| Australian Red Cross | `australian-red-cross.svg` or `.png` | redcross.org.au newsroom/brand |
| The Fred Hollows Foundation | `the-fred-hollows-foundation.svg` or `.png` | hollows.org media centre |

Only use logos these organisations publish for third-party use, or that
you have permission to display. They are shown as illustrative examples of
eligible causes, not as partners.
