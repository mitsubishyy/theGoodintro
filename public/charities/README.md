# Charity logos (rotator)

Same pattern as QuotaClub's `public/logos/`: drop the official logo file
here and the rotator uses it automatically. No code change is needed.

Only charities on the CHARITY_FLOW.md shortlist (the table of 15) may
appear anywhere on the site.

The marquee (`app/_components/LogoMarquee.tsx`) looks for each file by the
slug below, trying `.svg` first then `.png`. SVG is preferred (sharp at any
size); a transparent or white background looks best on the white chip.
The homepage marquee (`app/_components/home/charity-marquee-section.tsx`)
references its assets by explicit path in that component.

Until a file is present, that charity falls back to a live logo-by-domain
service, and finally to its name as a text chip, so the strip never looks
broken.

| Charity | File to add (either extension) | Get the official asset from |
|---|---|---|
| Leukaemia Foundation | `leukaemia-foundation.svg` or `.png` | leukaemia.org.au media resources |
| Royal Flying Doctor Service | `royal-flying-doctor-service.svg` or `.png` | flyingdoctor.org.au media resources |
| R U OK? | `r-u-ok.svg` or `.png` | ruok.org.au media resources |
| headspace | `headspace.svg` or `.png` | headspace.org.au media centre |
| Starlight Children's Foundation | `starlight-children-s-foundation.svg` or `.png` | starlight.org.au media resources |
| Ronald McDonald House Charities | `ronald-mcdonald-house-charities.svg` or `.png` | rmhc.org.au media resources |
| St Vincent de Paul Society | `st-vincent-de-paul-society.svg` or `.png` | vinnies.org.au media centre |
| Children's Ground | `children-s-ground.svg` or `.png` | childrensground.org.au media resources |
| WWF-Australia | `wwf-australia.svg` or `.png` | wwf.org.au media resources |
| RSPCA Australia | `rspca-australia.svg` or `.png` | rspca.org.au media centre |
| Guide Dogs Australia | `guide-dogs-australia.svg` or `.png` | guidedogsaustralia.com media resources |
| Save the Children Australia | `save-the-children-australia.svg` or `.png` | savethechildren.org.au media resources |
| World Vision Australia | `world-vision-australia.svg` or `.png` | worldvision.com.au media centre |
| Cerebral Palsy Alliance | `cerebral-palsy-alliance.svg` or `.png` | cerebralpalsy.org.au media resources |
| Cancer Council Australia | `cancer-council-australia.svg` or `.png` | cancer.org.au media/brand guidelines |

Only use logos these organisations publish for third-party use, or that
you have permission to display. They are shown as illustrative examples of
eligible causes, not as partners.
