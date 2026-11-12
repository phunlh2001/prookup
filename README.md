# Prookup — Product + Look Up

**Prookup is a product research dashboard for dropshippers selling in the US market.** It brings search trends, competition signals and supplier prices into one place, so you can see what's worth selling before everyone else does.

It answers three questions:

1. **Which niches are trending in the US right now?**
2. **Which products have the most potential for dropshipping?**
3. **What should I pay for them, and what should I sell them for?**

---

## What you can do

### See the market at a glance
The overview cards show how many niches and products are currently trending, how many are rising fast, and how many look like real opportunities. Each number is compared with the previous research period, with a small trend line beside it.

### Explore trending niches
Niches such as Pet Accessories, Home & Kitchen, Beauty & Personal Care, Fitness & Wellness, Outdoor & Camping and Smart Home Accessories are ranked by US search interest. Each shows its growth, trend direction (Rising, Stable or Declining) and how many promising products it contains. You can filter by direction or sort by the fastest growth. Clicking a niche shows its products.

### Discover products
Every researched product shows its trend score, search growth, sourcing cost, recommended selling price, gross profit and opportunity score. You can:
- filter by niche, trend direction, minimum opportunity score, minimum profit margin and price range
- sort by trend growth, opportunity score, estimated profit or discovery date
- switch between a card grid and a compact table
- search products and niches from the top bar

### Research a single product
Open any product for a full research page:
- **Product information:** description, key characteristics and images.
- **Market demand:** 12 months of weekly US search interest (hover for exact values, or open it as a table), growth against the previous three months, the top 10 US states by interest, and rising related searches.
- **Pricing analysis:** a step-by-step breakdown from selling price down to estimated net profit, so every number can be traced.
- **Market opportunity:** demand, momentum, competition and the overall score, with each factor's contribution and a research confidence level.
- **Research sources:** where each piece of data came from and when it was last updated.

### Get recommendations
The sidebar always shows the **top 3 products** worth researching further, with their sourcing cost, suggested price, gross profit and margin. These are recalculated from the latest research every time, never hand-picked.

### Use your own costs
Advertising cost per order, target margin, payment fees, default shipping and minimum markup are all editable. Changing one updates every price, profit, score and recommendation in the app instantly, and your settings are remembered in your browser.

### Stay up to date
Research refreshes automatically once a day, and you can trigger a refresh at any time. The header shows when the data was last synced. If a refresh fails, the previous research stays in place.

---

## Where the data comes from

| Source | Used for |
| --- | --- |
| **Google Trends** | Search interest over time, interest by US state, rising related searches |
| **Google Search** | Competition signals: ads and shopping listings for each product |
| **CJ Dropshipping** | Supplier sourcing cost, shipping, availability and product images |

Every external figure carries its source and timestamp. Any data that comes from a simulated or demo source is clearly marked **Simulated** wherever it appears. Prookup never invents Google Trends statistics or supplier prices.

---

## How the numbers are calculated

### Recommended selling price
The price is the higher of two rules:
- **Target margin:** the price that leaves your target net margin after all modeled costs:
  `(landed cost + ad cost + fixed payment fee) ÷ (1 − payment fee % − target margin)`
- **Minimum markup:** landed cost (sourcing + shipping) × your minimum multiple.

It is then rounded up to a .99 ending (optional).

### Profit
- **Gross profit** = selling price − sourcing cost − shipping
- **Estimated net profit** = gross profit − payment fees − advertising cost
- Gross and net margins are each shown as a share of the selling price.

If a supplier doesn't report shipping, your default shipping assumption is used and the figure is marked *estimated*.

### Opportunity score (0–100)
Each product gets a weighted score built from:

| Factor | Weight |
| --- | --- |
| Trend momentum | 18% |
| Search demand | 18% |
| Market growth | 16% |
| Gross profit | 14% |
| Net margin | 14% |
| Competition (lower is better) | 12% |
| Data confidence | 8% |

If a factor has no reliable data, it is left out and the remaining weights are rebalanced instead of guessed.

| Score | Rating |
| --- | --- |
| 80–100 | Excellent Opportunity |
| 65–79 | Promising |
| 45–64 | Moderate |
| Below 45 | Low Potential |

### Trend direction
Growth compares the last three months of search interest with the three months before: **Rising** is +10% or more, **Declining** is −10% or less, and anything in between is **Stable**.

> Scores, prices and profits are research estimates to guide decisions, not guaranteed business outcomes.

---

## Built with

React 19 · TypeScript · Vite · Tailwind CSS · shadcn/ui · Zustand · Axios · Lottie · Lucide icons

The dashboard is backed by a separate research service that collects data from the providers above, refreshes it daily, and serves one combined research snapshot.
