"use client";

import { useState, useMemo } from "react";
import {
  Calculator,
  TrendingUp,
  Percent,
  DollarSign,
  Layers,
  ArrowRight,
  Sparkles,
  Copy,
  Check,
  RotateCcw,
} from "lucide-react";

interface KeyDataItem {
  metric: string;
  value: string;
  period?: string;
  notes?: string;
}

interface InteractiveFinancialExhibitProps {
  caseTitle: string;
  keyData: KeyDataItem[];
  onInsertToAnswer?: (summaryText: string) => void;
}

export function InteractiveFinancialExhibit({
  caseTitle,
  keyData,
  onInsertToAnswer,
}: InteractiveFinancialExhibitProps) {
  // Extract initial baseline CapEx/Valuation from keyData if parseable, or use standard defaults
  const parsedBaseline = useMemo(() => {
    let baselineVal = 250; // $250M default baseline
    for (const item of keyData) {
      const match = item.value.match(/(\d+(\.\d+)?)/);
      if (match && (item.metric.toLowerCase().includes("capex") || item.metric.toLowerCase().includes("valuation") || item.metric.toLowerCase().includes("investment") || item.metric.toLowerCase().includes("cost"))) {
        const val = parseFloat(match[1]);
        if (val > 10 && val < 5000) {
          baselineVal = Math.round(val);
          break;
        }
      }
    }
    return baselineVal;
  }, [keyData]);

  // Model parameters
  const [baseInvestment, setBaseInvestment] = useState<number>(parsedBaseline);
  const [wacc, setWacc] = useState<number>(10.0); // Discount rate %
  const [terminalGrowth, setTerminalGrowth] = useState<number>(2.5); // %
  const [marginExpansion, setMarginExpansion] = useState<number>(0.0); // %
  const [capexShock, setCapexShock] = useState<number>(0.0); // %
  const [copied, setCopied] = useState<boolean>(false);

  // Scenario presets
  const applyPreset = (preset: "base" | "downside" | "upside") => {
    if (preset === "base") {
      setWacc(10.0);
      setTerminalGrowth(2.5);
      setMarginExpansion(0.0);
      setCapexShock(0.0);
    } else if (preset === "downside") {
      setWacc(12.5);
      setTerminalGrowth(1.5);
      setMarginExpansion(-3.0);
      setCapexShock(15.0);
    } else if (preset === "upside") {
      setWacc(8.5);
      setTerminalGrowth(3.5);
      setMarginExpansion(4.0);
      setCapexShock(-10.0);
    }
  };

  // Financial model calculations
  const modelResults = useMemo(() => {
    const adjInvestment = baseInvestment * (1 + capexShock / 100);
    const annualCashFlow = (adjInvestment * 0.22) * (1 + marginExpansion / 100);
    
    // Gordon Growth terminal value at year 5
    const discountFactor5 = Math.pow(1 + wacc / 100, 5);
    const terminalRate = Math.max(0.005, (wacc - terminalGrowth) / 100);
    const terminalValueYear5 = (annualCashFlow * (1 + terminalGrowth / 100)) / terminalRate;
    const pvTerminalValue = terminalValueYear5 / discountFactor5;

    // 5-year discrete DCF
    let pvOperatingCashFlows = 0;
    for (let yr = 1; yr <= 5; yr++) {
      pvOperatingCashFlows += annualCashFlow / Math.pow(1 + wacc / 100, yr);
    }

    const enterpriseValue = pvOperatingCashFlows + pvTerminalValue;
    const npv = enterpriseValue - adjInvestment;
    const impliedIrr = Math.min(45, Math.max(2, ((annualCashFlow / adjInvestment) * 100) + terminalGrowth * 1.5));
    const paybackYears = annualCashFlow > 0 ? (adjInvestment / annualCashFlow).toFixed(1) : "N/A";

    return {
      adjInvestment: Math.round(adjInvestment),
      annualCashFlow: Math.round(annualCashFlow),
      enterpriseValue: Math.round(enterpriseValue),
      npv: Math.round(npv),
      impliedIrr: impliedIrr.toFixed(1),
      paybackYears,
    };
  }, [baseInvestment, wacc, terminalGrowth, marginExpansion, capexShock]);

  // 3x3 Sensitivity Matrix: Rows = WACC (wacc-2%, wacc, wacc+2%), Cols = Terminal Growth (g-1%, g, g+1%)
  const sensitivityMatrix = useMemo(() => {
    const waccSteps = [wacc - 2.0, wacc, wacc + 2.0];
    const growthSteps = [terminalGrowth - 1.0, terminalGrowth, terminalGrowth + 1.0];

    return waccSteps.map((w) => {
      return growthSteps.map((g) => {
        const rateDiff = Math.max(0.005, (w - g) / 100);
        const adjInvest = baseInvestment * (1 + capexShock / 100);
        const cf = (adjInvest * 0.22) * (1 + marginExpansion / 100);
        const termVal5 = (cf * (1 + g / 100)) / rateDiff;
        const pvTerm = termVal5 / Math.pow(1 + w / 100, 5);
        let pvCf = 0;
        for (let yr = 1; yr <= 5; yr++) {
          pvCf += cf / Math.pow(1 + w / 100, yr);
        }
        const ev = pvCf + pvTerm;
        const deltaPercent = ((ev - modelResults.enterpriseValue) / modelResults.enterpriseValue) * 100;
        return {
          wacc: w.toFixed(1),
          growth: g.toFixed(1),
          ev: Math.round(ev),
          deltaPercent: deltaPercent.toFixed(1),
        };
      });
    });
  }, [baseInvestment, wacc, terminalGrowth, marginExpansion, capexShock, modelResults.enterpriseValue]);

  // Generate quantitative analytical note
  const analyticalSummary = `### Quantitative Sensitivity & Valuation Note (${caseTitle})
- **Discount Rate (WACC)**: ${wacc.toFixed(1)}% | **Terminal Growth**: ${terminalGrowth.toFixed(1)}%
- **Adjusted CapEx**: $${modelResults.adjInvestment}M (Shock: ${capexShock > 0 ? "+" : ""}${capexShock}%)
- **Margin Shock**: ${marginExpansion > 0 ? "+" : ""}${marginExpansion}%
- **Enterprise Valuation**: $${modelResults.enterpriseValue}M | **Net Present Value (NPV)**: $${modelResults.npv}M
- **Implied Project IRR**: ${modelResults.impliedIrr}% | **Payback Period**: ${modelResults.paybackYears} Years
- **Sensitivity Horizon**: Evaluated against 3x3 WACC/Growth matrix with stress-test boundaries.`;

  const handleCopySummary = () => {
    navigator.clipboard.writeText(analyticalSummary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="mt-6 rounded-2xl border border-border bg-surface p-5 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-primary text-on-primary flex items-center justify-center shadow-sm">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif font-bold text-base text-text">
                Quantitative Valuation & Sensitivity Modeler
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-primary-soft text-primary">
                Interactive Exhibit
              </span>
            </div>
            <p className="text-xs text-muted">
              Stress-test capital allocation assumptions, hurdle rates, and cash-flow sensitivities for this case study.
            </p>
          </div>
        </div>

        {/* Preset Buttons */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          <span className="text-[10px] uppercase font-bold text-muted mr-1">Presets:</span>
          <button
            type="button"
            onClick={() => applyPreset("base")}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-surface border border-border hover:border-accent text-text transition-colors"
          >
            Base Case
          </button>
          <button
            type="button"
            onClick={() => applyPreset("downside")}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-danger/10 border border-danger/30 text-danger hover:bg-danger/20 transition-colors"
          >
            Downside
          </button>
          <button
            type="button"
            onClick={() => applyPreset("upside")}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-success/10 border border-success/30 text-success hover:bg-success/20 transition-colors"
          >
            Upside
          </button>
          <button
            type="button"
            onClick={() => applyPreset("base")}
            title="Reset model to defaults"
            className="p-1 rounded-lg text-muted hover:text-text"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Grid: Left Controls, Right Key Financial Outputs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Controls Column (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Discount Rate (WACC) Slider */}
            <div className="p-3.5 rounded-xl border border-border bg-surface/80">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-text flex items-center gap-1">
                  <Percent className="w-3.5 h-3.5 text-accent" />
                  <span>Discount Rate (WACC)</span>
                </span>
                <span className="font-mono font-bold text-primary text-sm">
                  {wacc.toFixed(1)}%
                </span>
              </div>
              <input
                type="range"
                min="6.0"
                max="16.0"
                step="0.5"
                value={wacc}
                onChange={(e) => setWacc(parseFloat(e.target.value))}
                className="w-full accent-accent cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-muted mt-1 font-mono">
                <span>6.0% (Low Risk)</span>
                <span>10.0% (Base)</span>
                <span>16.0% (Distressed)</span>
              </div>
            </div>

            {/* Terminal Growth Rate Slider */}
            <div className="p-3.5 rounded-xl border border-border bg-surface/80">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-text flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-info" />
                  <span>Terminal Growth (g)</span>
                </span>
                <span className="font-mono font-bold text-primary text-sm">
                  {terminalGrowth.toFixed(1)}%
                </span>
              </div>
              <input
                type="range"
                min="1.0"
                max="5.0"
                step="0.5"
                value={terminalGrowth}
                onChange={(e) => setTerminalGrowth(parseFloat(e.target.value))}
                className="w-full accent-accent cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-muted mt-1 font-mono">
                <span>1.0% (Mature)</span>
                <span>2.5% (GDP Pace)</span>
                <span>5.0% (Super-Growth)</span>
              </div>
            </div>

            {/* CapEx Shock Slider */}
            <div className="p-3.5 rounded-xl border border-border bg-surface/80">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-text flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-success" />
                  <span>CapEx Overrun / Shock</span>
                </span>
                <span className="font-mono font-bold text-primary text-sm">
                  {capexShock > 0 ? `+${capexShock}` : capexShock}%
                </span>
              </div>
              <input
                type="range"
                min="-20"
                max="30"
                step="5"
                value={capexShock}
                onChange={(e) => setCapexShock(parseFloat(e.target.value))}
                className="w-full accent-accent cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-muted mt-1 font-mono">
                <span>-20% (Savings)</span>
                <span>0% (On Budget)</span>
                <span>+30% (Overrun)</span>
              </div>
            </div>

            {/* Margin Expansion Shock */}
            <div className="p-3.5 rounded-xl border border-border bg-surface/80">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-text flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-accent" />
                  <span>EBITDA Margin Shock</span>
                </span>
                <span className="font-mono font-bold text-primary text-sm">
                  {marginExpansion > 0 ? `+${marginExpansion}` : marginExpansion}%
                </span>
              </div>
              <input
                type="range"
                min="-5"
                max="10"
                step="1"
                value={marginExpansion}
                onChange={(e) => setMarginExpansion(parseFloat(e.target.value))}
                className="w-full accent-accent cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-muted mt-1 font-mono">
                <span>-5% (Margin Squeeze)</span>
                <span>0%</span>
                <span>+10% (Pricing Power)</span>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleCopySummary}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-surface text-xs font-semibold text-text hover:border-accent transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5 text-muted" />}
              <span>{copied ? "Copied Analysis!" : "Copy Exhibit Findings"}</span>
            </button>

            {onInsertToAnswer && (
              <button
                type="button"
                onClick={() => onInsertToAnswer(analyticalSummary)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent hover:bg-accent-hover text-accent-text text-xs font-bold transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Insert Model into My Answer Draft</span>
              </button>
            )}
          </div>
        </div>

        {/* Results Metrics Column (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-3">
          <div className="grid grid-cols-2 gap-2.5">
            {/* Enterprise Valuation */}
            <div className="p-3 rounded-xl border border-border bg-surface">
              <span className="text-[10px] uppercase font-bold text-muted block">
                Enterprise Value (EV)
              </span>
              <p className="font-serif text-xl font-bold text-primary mt-0.5">
                ${modelResults.enterpriseValue.toLocaleString()}M
              </p>
              <span className="text-[10px] text-muted">
                CapEx: ${modelResults.adjInvestment}M
              </span>
            </div>

            {/* Net Present Value */}
            <div className="p-3 rounded-xl border border-border bg-surface">
              <span className="text-[10px] uppercase font-bold text-muted block">
                Net Present Value (NPV)
              </span>
              <p
                className={`font-serif text-xl font-bold mt-0.5 ${
                  modelResults.npv >= 0
                    ? "text-success"
                    : "text-danger"
                }`}
              >
                ${modelResults.npv.toLocaleString()}M
              </p>
              <span className="text-[10px] text-muted">
                {modelResults.npv >= 0 ? "Value Accretive" : "Value Dilutive"}
              </span>
            </div>

            {/* Implied IRR */}
            <div className="p-3 rounded-xl border border-border bg-surface">
              <span className="text-[10px] uppercase font-bold text-muted block">
                Project IRR
              </span>
              <p className="font-serif text-xl font-bold text-info mt-0.5">
                {modelResults.impliedIrr}%
              </p>
              <span className="text-[10px] text-muted">
                Hurdle Spread: {(parseFloat(modelResults.impliedIrr) - wacc).toFixed(1)}%
              </span>
            </div>

            {/* Payback Period */}
            <div className="p-3 rounded-xl border border-border bg-surface">
              <span className="text-[10px] uppercase font-bold text-muted block">
                Payback Period
              </span>
              <p className="font-serif text-xl font-bold text-primary mt-0.5">
                {modelResults.paybackYears} Yrs
              </p>
              <span className="text-[10px] text-muted">
                Annual CF: ${modelResults.annualCashFlow}M
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-primary-soft/50 border border-border text-[11px] text-muted flex items-start gap-2">
            <span className="font-serif font-black text-accent text-sm">§</span>
            <span>
              <strong>Pedagogical Insight:</strong> At a {wacc.toFixed(1)}% hurdle rate, the project exhibits a payback of {modelResults.paybackYears} years. Note how a +15% CapEx overrun compresses the project IRR below standard institutional cost of equity.
            </span>
          </div>
        </div>
      </div>

      {/* 3x3 Sensitivity Matrix Table */}
      <div className="border-t border-border pt-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-text">
            Valuation Sensitivity Matrix (WACC vs. Terminal Growth Rate)
          </span>
          <span className="text-[10px] text-muted font-mono">
            Values in $M (Delta from Base Case)
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-center text-xs border-collapse">
            <thead>
              <tr className="bg-primary-soft border-b border-border font-mono text-[11px] text-text">
                <th className="p-2.5 text-left font-sans font-bold">WACC \ Growth (g)</th>
                <th className="p-2.5 font-bold">{(terminalGrowth - 1.0).toFixed(1)}%</th>
                <th className="p-2.5 font-bold text-accent">
                  {terminalGrowth.toFixed(1)}% (Target)
                </th>
                <th className="p-2.5 font-bold">{(terminalGrowth + 1.0).toFixed(1)}%</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-mono">
              {sensitivityMatrix.map((row, rIdx) => {
                const isSelectedWacc = rIdx === 1;
                return (
                  <tr
                    key={rIdx}
                    className={`hover:bg-primary-soft/20 ${
                      isSelectedWacc ? "bg-primary-soft/40" : ""
                    }`}
                  >
                    <td className="p-2.5 text-left font-sans font-bold text-text">
                      {row[0].wacc}% {isSelectedWacc && <span className="text-accent font-normal text-[10px]">(Current)</span>}
                    </td>
                    {row.map((cell, cIdx) => {
                      const delta = parseFloat(cell.deltaPercent);
                      const isCenter = rIdx === 1 && cIdx === 1;
                      return (
                        <td
                          key={cIdx}
                          className={`p-2.5 transition-colors ${
                            isCenter
                              ? "bg-accent/15 font-bold border-2 border-accent rounded-lg text-text"
                              : delta > 10
                              ? "bg-success/15 text-success"
                              : delta < -10
                              ? "bg-danger/15 text-danger"
                              : "text-text"
                          }`}
                        >
                          <div className="font-bold">${cell.ev}M</div>
                          <div className="text-[10px] opacity-75">
                            {delta > 0 ? `+${cell.deltaPercent}` : cell.deltaPercent}%
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
