# Validation record

Checked in the cloud Chromium browser on 2026-10-24 against the independently served /Austin/ folder.

## Passed

- Local HTML, CSS, JavaScript, font, image, and animation-library loading: no failed HTTP asset requests.
- Browser runtime: no uncaught JavaScript errors.
- No third-party requests needed to render or interact with the page.
- GSAP 3.12.5 and the local Dela Gothic One font loaded.
- Desktop and touch/mobile rendering, including widths 320, 390, 768, 1024, and 1440 pixels: no document-level horizontal overflow.
- Mobile navigation opens; reduced-motion mode loads without the animated intro.
- Route tab switching displays the selected route.
- Calendar arrow key followed by Enter applies the next day.
- February 29, 2028 restores correctly and renders 366 daily rays.
- Daylight estimate plausibility: about 14.10 hours at the June solstice and 10.19 hours at the December solstice.
- America/Chicago offsets change from UTC-6 to UTC-5 at spring DST and back to UTC-6 in fall.
- Computation and display checked with browsers in Asia/Tokyo, Pacific/Honolulu, and Europe/London time zones.
- 48 itinerary combinations checked across trip lengths 2–7 days, four seasonal sample dates, and both transportation choices.
- No empty itinerary days; no regional driving excursion in a plan without a car.
- Shared URL restores a leap-day arrival, duration, interests, transport, and pace.
- Download produces an Austin-date.txt itinerary.
- All visible page text is English, apart from the original designer's name rendered in Latin characters.
- Visual review of desktop hero, daylight calendar, itinerary, route storytelling, and mobile layout.

## Scope limits

These checks demonstrate prototype behavior, not a completed source-research review. Placeholder art is intentional. Pool/park conditions, venue calendars, road traffic, and current weather are not queried.

GitHub Pages activation and the public site's HTTP response cannot be verified from this environment: its GitHub API and github.io requests are denied by the network gateway. Repository pushes and deployment-branch contents are verified separately.
