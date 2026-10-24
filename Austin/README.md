# Austin — from first light to last song

An English, Austin-specific adaptation of the original Murmansk site. It retains the original design language and immersive interaction patterns while replacing Arctic content with a local day-and-night story.

## Run

No installation or build is required.

```sh
cd Austin
python3 -m http.server 8081 --bind 0.0.0.0
```

On your own computer, open http://localhost:8081/. In a cloud workspace, use an exposed/forwarded port or the published hosting URL; another computer's localhost does not reach the cloud machine.

When served from the repository root, the path is `/Austin/`. All asset paths are relative, so the same folder can be hosted on its own or under GitHub Pages.

## Included

- Scroll-driven 24-hour canvas sky, skyline, water, and illustrated AUSTIN letter mask.
- Original Dela Gothic One, Inter, and Tenor Sans font families, loaded locally.
- Original GSAP 3.12.5 / ScrollTrigger libraries, loaded locally.
- Leap-year-aware daylight ring and year strip, pointer/touch/keyboard selection.
- America/Chicago local time and date, including daylight-saving offsets.
- Three-step trip builder with date, interests, length, transportation, and pace.
- Seasonal cautions, arrival/departure time, local alternatives without a car, and conditional park trips.
- Itinerary link sharing, clipboard fallback, downloadable text, and query-string restoration.
- Illustrated city carousel, moving scene ribbons, three route tabs, and scrolling route progress.
- Nighttime/civil-twilight chart, packing suggestions, and a seven-day daylight diary.
- Mobile navigation, reduced-motion behavior, focus styles, and a skip link.

## Files

- `index.html`: English content and structure.
- `original-design.css`: styling extracted from the original site.
- `austin.css`: local fonts and Austin-specific presentation.
- `austin.js`: Austin data, astronomy, planning rules, canvas rendering, and interactions.
- `assets/images/`: original illustrative placeholders.
- `assets/fonts/`, `assets/vendor/`: local fonts and animation libraries.
- `RESEARCH.md`: source register, editorial decisions, and verification limits.
- `ASSET_CREDITS.md`: design, imagery, font, and software provenance.

## Prototype content

The user authorized placeholders after official-source access was blocked. The illustrations are not photographs. The site does not display live weather, real event availability, confirmed opening hours, or bookings. Astronomy is approximate; operator links are provided for current access rules.

## Hosting

The Austin folder is additive: the original Murmansk site remains separate. A deployed branch must contain an `Austin/` directory to serve the Austin version at `/todo/Austin/`. Pushing a branch does not itself establish that GitHub Pages is enabled or that a deployment completed.
