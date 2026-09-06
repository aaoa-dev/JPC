# Japan Salary & Tax Calculator

A small single-page calculator for estimating Japanese salary, tax, and savings for FY2026. Live at **https://aaoa-dev.github.io/JPC/**.

It has two modes, switched with the toggle at the top:

- **I know my salary**: enter a gross annual salary and a lifestyle/spending profile to see take-home pay after tax and insurance, plus estimated yearly savings.
- **I know my target take-home**: enter the net pay you want (monthly or yearly) and it solves backwards for the gross salary needed to get there.

Both modes account for employee vs. freelancer status, first-year-in-Japan exemptions, and the Blue Return deduction for freelancers.

## Structure

- `index.html`: markup only, both calculator panels plus the mode toggle
- `style.css`: all styling, shared between both panels
- `script.js`: shared FY2026 tax model (income tax, resident tax, social insurance) and shared UI wiring
- `earn-target.js` / `take-home.js`: per-mode state and rendering logic
- `app.js`: mode toggle wiring

No build step, no dependencies. Open `index.html` directly or serve the folder statically.

## Disclaimer

Estimates only, not official tax advice.
