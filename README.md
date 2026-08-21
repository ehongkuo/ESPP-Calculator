# ESPP Calculator

A client-side calculator for comparing estimated post-tax payouts across three employee stock purchase plan sale scenarios:

- Selling immediately
- Holding for more than one year as a disqualifying disposition
- Holding for more than two years as a qualifying disposition

## Run locally

```bash
npm install
npm run dev
```

## Verify changes

```bash
npm test
npm run lint
npm run build
```

## Assumptions

The calculator models a 15% payroll contribution, a 15% purchase discount with lookback, and a 1,517-share purchase cap. Tax rates are user-provided estimates. The results are illustrative and are not tax advice.

🤖 Generated with Codex
