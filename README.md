# Sarakalai Panchapatchi v047

Pages:
- index.html — Live
- lookup.html — selected date/time lookup using live-card UI
- reference.html — Reference

Profile removed. Lookup controls are mobile-friendly near the footer/sticky bottom.

Generated: 2026-06-08


## v048
Lookup input reload fixed. Normal live timer no longer overrides lookup. Countdown/progress use selected date/time.
assets/js/app.js: OK
assets/js/lookup.js: OK

## v049
Fixed lookup.js parseTime issue with standalone lookupParseTime().
assets/js/app.js: OK
assets/js/lookup.js: OK

## v050 lookup clean build/render
Rebuilt lookup.js around clean buildLookup() and renderLookup().
No dependency on DAY_TA, DAY_EN, parseTime, fmt, mmss, or CLS.

assets/js/app.js: OK
assets/js/lookup.js: OK
