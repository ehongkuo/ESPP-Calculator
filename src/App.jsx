import React, { useState, useMemo } from 'react';
import { Calculator, TrendingUp, PiggyBank, DollarSign } from 'lucide-react';

const formatCur = (num, dec = 2) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: dec, maximumFractionDigits: dec }).format(num);

function App() {
  const [salary, setSalary] = useState(165000);
  const [paychecks, setPaychecks] = useState(13);
  const [ordTaxRate, setOrdTaxRate] = useState(35);
  const [cgTaxRate, setCgTaxRate] = useState(15);
  
  const startPrice = 16.47;
  const [purchaseDatePrice, setPurchaseDatePrice] = useState(16.47);
  const [salePrice, setSalePrice] = useState(20.00);

  const stats = useMemo(() => {
    const ordRate = ordTaxRate / 100;
    const cgRate = cgTaxRate / 100;

    const biweeklyGross = Math.round((salary / 26) * 100) / 100;
    const perPaycheckContrib = Math.round((biweeklyGross * 0.15) * 100) / 100;
    const totalCash = perPaycheckContrib * paychecks;

    const discountedStart = startPrice * 0.85;
    const discountedPurchase = purchaseDatePrice * 0.85;
    const actualPurchasePrice = Math.min(discountedStart, discountedPurchase);

    let sharesBought = totalCash / actualPurchasePrice;
    if (sharesBought > 1517) sharesBought = 1517;

    // SCENARIO 1: Sell Immediately (< 1 yr)
    const s1OrdIncPerShare = purchaseDatePrice - actualPurchasePrice;
    const s1TotalOrdInc = s1OrdIncPerShare * sharesBought;
    const s1Tax = s1TotalOrdInc * ordRate;
    const s1Profit = s1TotalOrdInc - s1Tax; 
    const s1Payout = totalCash + s1Profit;

    // SCENARIO 2: Hold > 1 yr (Disqualifying)
    const s2OrdIncPerShare = purchaseDatePrice - actualPurchasePrice;
    const s2LTCGPerShare = salePrice - purchaseDatePrice;
    const s2TotalOrdInc = s2OrdIncPerShare * sharesBought;
    const s2TotalCG = s2LTCGPerShare * sharesBought;
    
    const s2OrdTax = s2TotalOrdInc * ordRate;
    const s2CGTax = s2TotalCG * cgRate; 
    const s2TotalTax = s2OrdTax + s2CGTax;
    
    const s2TotalProfit = (salePrice - actualPurchasePrice) * sharesBought;
    const s2NetProfit = s2TotalProfit - s2TotalTax;
    const s2Payout = totalCash + s2NetProfit;

    // SCENARIO 3: Hold > 2 yrs (Qualifying)
    const maxOrdIncPerShare = startPrice * 0.15;
    let s3OrdIncPerShare = 0;
    if (salePrice > actualPurchasePrice) {
        s3OrdIncPerShare = Math.min(maxOrdIncPerShare, salePrice - actualPurchasePrice);
    }
    
    const adjustedCostBasis = actualPurchasePrice + s3OrdIncPerShare;
    const s3LTCGPerShare = salePrice - adjustedCostBasis;

    const s3TotalOrdInc = s3OrdIncPerShare * sharesBought;
    const s3TotalCG = s3LTCGPerShare * sharesBought;

    const s3OrdTax = s3TotalOrdInc * ordRate;
    const s3CGTax = s3TotalCG * cgRate;
    const s3TotalTax = s3OrdTax + s3CGTax;

    const s3TotalProfit = (salePrice - actualPurchasePrice) * sharesBought;
    const s3NetProfit = s3TotalProfit - s3TotalTax;
    const s3Payout = totalCash + s3NetProfit;

    return {
      totalCash, actualPurchasePrice, sharesBought,
      s1: { totalOrdInc: s1TotalOrdInc, ordIncPerShare: s1OrdIncPerShare, cg: 0, tax: s1Tax, profit: s1Profit, payout: s1Payout },
      s2: { totalOrdInc: s2TotalOrdInc, ordIncPerShare: s2OrdIncPerShare, cg: s2TotalCG, tax: s2TotalTax, profit: s2NetProfit, payout: s2Payout },
      s3: { totalOrdInc: s3TotalOrdInc, ordIncPerShare: s3OrdIncPerShare, cg: s3TotalCG, tax: s3TotalTax, profit: s3NetProfit, payout: s3Payout }
    };
  }, [salary, paychecks, ordTaxRate, cgTaxRate, purchaseDatePrice, salePrice]);

  return (
    <div className="container">
      {/* Inputs Column */}
      <div>
        <div className="glass-card">
          <h2><Calculator size={24} /> ESPP & Tax Assumptions</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="salary">Gross Salary ($)</label>
              <input id="salary" type="number" value={salary} onChange={(e) => setSalary(Number(e.target.value) || 0)} />
            </div>
            <div className="form-group">
              <label htmlFor="paychecks">Paychecks</label>
              <input id="paychecks" type="number" value={paychecks} onChange={(e) => setPaychecks(Number(e.target.value) || 0)} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="ordTaxRate">Ordinary Tax Rate (%)</label>
              <input id="ordTaxRate" type="number" value={ordTaxRate} onChange={(e) => setOrdTaxRate(Number(e.target.value) || 0)} />
            </div>
            <div className="form-group">
              <label htmlFor="cgTaxRate">Long-Term CG Tax (%)</label>
              <input id="cgTaxRate" type="number" value={cgTaxRate} onChange={(e) => setCgTaxRate(Number(e.target.value) || 0)} />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="startPrice">Offering Date Price ($)</label>
            <input id="startPrice" type="number" value={startPrice} readOnly />
          </div>
        </div>

        <div className="glass-card">
          <h2><TrendingUp size={24} /> Market Scenarios</h2>
          
          <div className="form-group">
            <div className="slider-header">
              <label htmlFor="purchasePrice">Purchase Date Price (Dec 8)</label>
              <span className="slider-value">{formatCur(purchaseDatePrice)}</span>
            </div>
            <input 
              id="purchasePrice" type="range" min="5" max="40" step="0.01"
              value={purchaseDatePrice} onChange={(e) => setPurchaseDatePrice(Number(e.target.value))} 
            />
            <div className="info-text">Determines your Lookback discount & Ordinary Income.</div>
          </div>

          <div className="form-group" style={{ marginTop: '2rem' }}>
            <div className="slider-header">
              <label htmlFor="salePrice">Future Sale Price (For Holds &gt; 1 yr)</label>
              <span className="slider-value">{formatCur(salePrice)}</span>
            </div>
            <input 
              id="salePrice" type="range" min="5" max="40" step="0.01"
              value={salePrice} onChange={(e) => setSalePrice(Number(e.target.value))} 
            />
            <div className="info-text">Determines your Capital Gains.</div>
          </div>
        </div>
      </div>

      {/* Outputs Column */}
      <div>
        <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
          <h2><PiggyBank size={24} /> Purchase Summary</h2>
          <div className="purchase-summary-row purchase-summary">
            <div>
              <div className="data-label">Total Cash</div>
              <div className="data-value">{formatCur(stats.totalCash)}</div>
            </div>
            <div>
              <div className="data-label">Discount Price</div>
              <div className="data-value">{formatCur(stats.actualPurchasePrice, 4)}</div>
            </div>
            <div>
              <div className="data-label">Total Shares</div>
              <div className="data-value">{stats.sharesBought.toFixed(4)}</div>
            </div>
          </div>
        </div>

        <div className="glass-card">
          <h2><DollarSign size={24} /> Post-Tax Payout Comparison</h2>
          <p className="info-text" style={{ marginTop: '-1rem', marginBottom: '1.5rem' }}>
            Compares selling immediately vs. holding and selling later at your "Future Sale Price".
          </p>
          
          <div className="tax-grid">
            
            <div className="tax-card">
              <h3>Sell Immediately (&lt; 1 yr)</h3>
              <div className="data-row">
                <span className="data-label">Sale Price</span>
                <span className="data-value">{formatCur(purchaseDatePrice)}</span>
              </div>
              <div className="data-row">
                <span className="data-label">Ordinary Income</span>
                <div style={{ textAlign: 'right' }}>
                  <span className="data-value">{formatCur(stats.s1.totalOrdInc)}</span>
                  <div className="info-text">({formatCur(stats.s1.ordIncPerShare)} / sh)</div>
                </div>
              </div>
              <div className="data-row">
                <span className="data-label">Capital Gains</span>
                <span className="data-value">{formatCur(stats.s1.cg)}</span>
              </div>
              <div className="data-row">
                <span className="data-label">Total Taxes</span>
                <span className="data-value negative">-{formatCur(stats.s1.tax)}</span>
              </div>
              <div className="net-profit" style={{ marginTop: '1rem' }}>
                Net Profit: <span>{formatCur(stats.s1.profit)}</span>
              </div>
              <div className="net-payout">{formatCur(stats.s1.payout)}</div>
            </div>

            <div className="tax-card">
              <h3>Hold &gt; 1 yr (Disqualifying)</h3>
              <div className="data-row">
                <span className="data-label">Sale Price</span>
                <span className="data-value">{formatCur(salePrice)}</span>
              </div>
              <div className="data-row">
                <span className="data-label">Ordinary Income</span>
                <div style={{ textAlign: 'right' }}>
                  <span className="data-value">{formatCur(stats.s2.totalOrdInc)}</span>
                  <div className="info-text">({formatCur(stats.s2.ordIncPerShare)} / sh)</div>
                </div>
              </div>
              <div className="data-row">
                <span className="data-label">Long-Term CG</span>
                <span className="data-value">{formatCur(stats.s2.cg)}</span>
              </div>
              <div className="data-row">
                <span className="data-label">Total Taxes</span>
                <span className="data-value negative">-{formatCur(stats.s2.tax)}</span>
              </div>
              <div className="net-profit" style={{ marginTop: '1rem' }}>
                Net Profit: <span>{formatCur(stats.s2.profit)}</span>
              </div>
              <div className="net-payout">{formatCur(stats.s2.payout)}</div>
            </div>

            <div className="tax-card">
              <h3>Hold &gt; 2 yrs (Qualifying)</h3>
              <div className="data-row">
                <span className="data-label">Sale Price</span>
                <span className="data-value">{formatCur(salePrice)}</span>
              </div>
              <div className="data-row">
                <span className="data-label">Ordinary Income</span>
                <div style={{ textAlign: 'right' }}>
                  <span className="data-value">{formatCur(stats.s3.totalOrdInc)}</span>
                  <div className="info-text">({formatCur(stats.s3.ordIncPerShare)} / sh cap)</div>
                </div>
              </div>
              <div className="data-row">
                <span className="data-label">Long-Term CG</span>
                <span className="data-value">{formatCur(stats.s3.cg)}</span>
              </div>
              <div className="data-row">
                <span className="data-label">Total Taxes</span>
                <span className="data-value negative">-{formatCur(stats.s3.tax)}</span>
              </div>
              <div className="net-profit" style={{ marginTop: '1rem' }}>
                Net Profit: <span>{formatCur(stats.s3.profit)}</span>
              </div>
              <div className="net-payout">{formatCur(stats.s3.payout)}</div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
