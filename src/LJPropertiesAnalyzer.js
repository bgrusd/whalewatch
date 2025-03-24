import React, { useState, useEffect } from 'react';

// SmartInputField: A simple input component that formats values.
const SmartInputField = ({ label, name, value, onBlurChange, percent = false, dollarSign = false }) => {
  const formatDisplay = (val) => (dollarSign ? Number(val).toLocaleString() : val.toString());
  const [localValue, setLocalValue] = useState(formatDisplay(value));
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!isFocused) {
      setLocalValue(formatDisplay(value));
    }
  }, [value, isFocused, dollarSign]);

  const handleFocus = () => {
    setIsFocused(true);
    if (dollarSign) setLocalValue(String(value));
  };

  const handleChange = (e) => {
    setLocalValue(e.target.value);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    let raw = e.target.value;
    if (dollarSign) raw = raw.replace(/,/g, '');
    if (raw.trim() === '') return;
    const parsed = parseFloat(raw);
    if (!isNaN(parsed)) {
      onBlurChange({ target: { name, value: parsed } });
      setLocalValue(dollarSign ? parsed.toLocaleString() : parsed.toString());
    }
  };

  return (
    <div style={{ marginBottom: '8px', position: 'relative' }}>
      <label
        style={{
          display: 'block',
          fontSize: '0.875rem',
          fontWeight: '500',
          color: '#374151',
          marginBottom: '4px'
        }}
      >
        {label}
      </label>
      <input
        type="text"
        name={name}
        value={localValue}
        onFocus={handleFocus}
        onChange={handleChange}
        onBlur={handleBlur}
        style={{
          width: '100%',
          borderRadius: '4px',
          border: '1px solid #d1d5db',
          padding: dollarSign ? '8px 8px 8px 24px' : '8px',
          boxSizing: 'border-box',
          fontSize: '0.875rem'
        }}
      />
      {dollarSign && (
        <span
          style={{
            position: 'absolute',
            left: '8px',
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
            color: '#6b7280'
          }}
        >
          $
        </span>
      )}
      {percent && (
        <span
          style={{
            position: 'absolute',
            right: '8px',
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
            color: '#6b7280'
          }}
        >
          %
        </span>
      )}
    </div>
  );
};

//////////////////////////////////////////////
// LJPropertiesAnalyzer Component
//////////////////////////////////////////////
const LJPropertiesAnalyzer = () => {
  // Primary Residence state (includes appraisedValue and taxBasis)
  const [primaryResidence, setPrimaryResidence] = useState({
    name: "Primary Residence",
    currentValue: 7500000,
    appraisedValue: 3700000,
    taxBasis: 3400000,
    squareFeet: 6000,
    condition: "Recently renovated",
    rentalIncomeMonthly: 25000,
    annualAppreciation: 4,
    maintenancePoolMonthly: 400,
    maintenanceGardeningMonthly: 1000,
    maintenanceUtilitiesMonthly: 1500,
    maintenanceOtherUpkeepMonthly: 2000,
    insuranceYearly: 18000,
    miscMaintenancePercent: 0.5,
    mortgagePaymentMonthly: 8425.46
  });

  // Ocean View Property state (with two appraised values and taxBasis)
  const [oceanViewProperty, setOceanViewProperty] = useState({
    name: "Ocean View Property",
    currentValue: 14000000,
    appraisedValueAsIs: 8500000,
    appraisedValueRenovated: 13500000,
    taxBasis: 8500000,
    renovationCost: 500000,
    squareFeet: 5000,
    postRenovationValue: 18000000,
    rentalIncomeMonthlyAsIs: 25000,
    rentalIncomeMonthlyRenovated: 36000,
    annualAppreciation: 4,
    maintenancePoolMonthlyAsIs: 400,
    maintenanceGardeningMonthlyAsIs: 1000,
    maintenanceUtilitiesMonthlyAsIs: 1500,
    maintenanceOtherUpkeepMonthlyAsIs: 3000,
    insuranceYearlyAsIs: 15000,
    miscMaintenancePercentAsIs: 1.0,
    maintenancePoolMonthlyRenovated: 400,
    maintenanceGardeningMonthlyRenovated: 1000,
    maintenanceUtilitiesMonthlyRenovated: 1500,
    maintenanceOtherUpkeepMonthlyRenovated: 2000,
    insuranceYearlyRenovated: 25000,
    miscMaintenancePercentRenovated: 1.0,
    renovationTimeMonths: 24,
    mortgagePaymentMonthlyCurrent: 0,
    mortgagePaymentMonthlyRenovated: 0
  });

  // Financial Assumptions.
  const [financialAssumptions, setFinancialAssumptions] = useState({
    investmentReturnRate: 7.5,
    mortgageInterestRate: 6.5,
    inflationRate: 3,
    capitalGainsTaxRate: 23.8+13.3,
    propertyTaxRate: 1.25,
    analysisTimeframeYears: 5,
    rentalIncomeAnnualIncrease: 3,
    propertyManagementFeePercentage: 8
  });

  // Results state: summary arrays and detailed breakdown objects.
  const [results, setResults] = useState({
    option1: { netCashflow: [], propertyValues: [], cumulativeReturn: [], npv: 0 },
    option2: { netCashflow: [], propertyValues: [], cumulativeReturn: [], npv: 0 },
    option3: { netCashflow: [], propertyValues: [], cumulativeReturn: [], npv: 0 },
    breakdown: { option1: [], option2: [], option3: [] },
    saleBreakdown: {}
  });

  const [activeTab, setActiveTab] = useState('assumptions');

  // Recalculate whenever any input changes.
  useEffect(() => {
    const newResults = calculateFinancials();
    setResults(newResults);
  }, [primaryResidence, oceanViewProperty, financialAssumptions]);

  // Helper functions.
  const formatNumber = (num) => Math.round(num).toLocaleString();
  const sumArray = (arr) => arr.reduce((a, b) => a + b, 0);

  const getBestOption = () => {
    const idx = financialAssumptions.analysisTimeframeYears - 1;
    const opts = [
      { name: "Option 1: Sell Ocean View", value: results.option1.cumulativeReturn[idx] },
      { name: "Option 2: Rent Ocean View As-Is", value: results.option2.cumulativeReturn[idx] },
      { name: "Option 3: Renovate & Move", value: results.option3.cumulativeReturn[idx] }
    ];
    opts.sort((a, b) => b.value - a.value);
    return opts[0].name;
  };

  // Detailed calculation function.
  function calculateFinancials() {
    const discountRate = financialAssumptions.investmentReturnRate / 100;
    const years = financialAssumptions.analysisTimeframeYears;
    const primaryMortgageAnnual = primaryResidence.mortgagePaymentMonthly * 12;
    const oceanMortgageAnnualCurrent = oceanViewProperty.mortgagePaymentMonthlyCurrent * 12;
    const oceanMortgageAnnualRenovated = oceanViewProperty.mortgagePaymentMonthlyRenovated * 12;

    // --- Option 1: Sell Ocean View As-Is ---
    const saleValue = oceanViewProperty.appraisedValueAsIs;
    const commission = saleValue * 0.06;
    const netSaleProceeds = saleValue - commission;
    const capitalGains = netSaleProceeds - oceanViewProperty.taxBasis;
    const capitalGainsTax = capitalGains > 0 ? capitalGains * (financialAssumptions.capitalGainsTaxRate / 100) : 0;
    const afterTaxProceeds = netSaleProceeds - capitalGainsTax;

    const option1 = {
      name: "Option 1: Sell Ocean View Property As-Is",
      initialInvestment: 0,
      netCashflow: [],
      propertyValues: [],
      cumulativeReturn: [],
      npv: 0
    };
    const option1Breakdown = [];
    for (let year = 1; year <= years; year++) {
      const inflationFactor = Math.pow(1 + financialAssumptions.inflationRate / 100, year - 1);
      const apprFactorPrimary = Math.pow(1 + primaryResidence.annualAppreciation / 100, year - 1);
      // Primary expenses breakdown.
      const primaryMonthlyMaintenance = primaryResidence.maintenancePoolMonthly +
                                        primaryResidence.maintenanceGardeningMonthly +
                                        primaryResidence.maintenanceUtilitiesMonthly +
                                        primaryResidence.maintenanceOtherUpkeepMonthly;
      const maintenanceExpensePrimary = primaryMonthlyMaintenance * 12 * inflationFactor;
      const insuranceExpensePrimary = primaryResidence.insuranceYearly * inflationFactor;
      const miscExpensePrimary = (primaryResidence.miscMaintenancePercent / 100) *
                                 (primaryResidence.currentValue * apprFactorPrimary);
      const totalPrimaryExpenses = maintenanceExpensePrimary + insuranceExpensePrimary + miscExpensePrimary;
      // Primary property tax based on appraised value.
      const primaryPropertyTax = primaryResidence.appraisedValue *
        Math.pow(1 + primaryResidence.annualAppreciation / 100, year - 1) *
        (financialAssumptions.propertyTaxRate / 100);
      const investmentReturn = afterTaxProceeds * (financialAssumptions.investmentReturnRate / 100);
      const annualCashflow = investmentReturn - primaryPropertyTax - totalPrimaryExpenses - primaryMortgageAnnual;
      option1.netCashflow.push(annualCashflow);
      const primaryValueEndOfYear = primaryResidence.currentValue *
        Math.pow(1 + primaryResidence.annualAppreciation / 100, year);
      option1.propertyValues.push(primaryValueEndOfYear);
      const cumulativeReturn = afterTaxProceeds * Math.pow(1 + financialAssumptions.investmentReturnRate / 100, year) +
                                primaryValueEndOfYear - primaryResidence.currentValue -
                                (primaryPropertyTax + totalPrimaryExpenses + primaryMortgageAnnual) * year;
      option1.cumulativeReturn.push(cumulativeReturn);
      option1.npv += annualCashflow / Math.pow(1 + discountRate, year);
      option1Breakdown.push({
        year,
        investmentReturn,
        primaryPropertyTax,
        maintenanceExpensePrimary,
        insuranceExpensePrimary,
        miscExpensePrimary,
        totalPrimaryExpenses,
        mortgage: primaryMortgageAnnual,
        annualCashflow,
        primaryValueEndOfYear,
        cumulativeReturn
      });
    }

    // --- Option 2: Rent Ocean View As-Is ---
    const option2 = {
      name: "Option 2: Rent Ocean View As-Is",
      initialInvestment: 0,
      netCashflow: [],
      propertyValues: [],
      cumulativeReturn: [],
      npv: 0
    };
    const option2Breakdown = [];
    for (let year = 1; year <= years; year++) {
      const rentalIncome = oceanViewProperty.rentalIncomeMonthlyAsIs * 12 *
        Math.pow(1 + financialAssumptions.rentalIncomeAnnualIncrease / 100, year - 1);
      const propertyManagementFee = rentalIncome * (financialAssumptions.propertyManagementFeePercentage / 100);
      const inflationFactor = Math.pow(1 + financialAssumptions.inflationRate / 100, year - 1);
      const apprFactorPrimary = Math.pow(1 + primaryResidence.annualAppreciation / 100, year - 1);
      // Primary expenses (same as Option 1).
      const primaryMonthlyMaintenance = primaryResidence.maintenancePoolMonthly +
                                        primaryResidence.maintenanceGardeningMonthly +
                                        primaryResidence.maintenanceUtilitiesMonthly +
                                        primaryResidence.maintenanceOtherUpkeepMonthly;
      const maintenanceExpensePrimary = primaryMonthlyMaintenance * 12 * inflationFactor;
      const insuranceExpensePrimary = primaryResidence.insuranceYearly * inflationFactor;
      const miscExpensePrimary = (primaryResidence.miscMaintenancePercent / 100) *
                                 (primaryResidence.currentValue * apprFactorPrimary);
      const totalPrimaryExpenses = maintenanceExpensePrimary + insuranceExpensePrimary + miscExpensePrimary;
      // Ocean expenses breakdown.
      const oceanInflationFactor = inflationFactor;
      const oceanMonthlyMaintenance = oceanViewProperty.maintenancePoolMonthlyAsIs +
                                      oceanViewProperty.maintenanceGardeningMonthlyAsIs +
                                      oceanViewProperty.maintenanceUtilitiesMonthlyAsIs +
                                      oceanViewProperty.maintenanceOtherUpkeepMonthlyAsIs;
      const maintenanceExpenseOcean = oceanMonthlyMaintenance * 12 * oceanInflationFactor;
      const insuranceExpenseOcean = oceanViewProperty.insuranceYearlyAsIs * oceanInflationFactor;
      const miscExpenseOcean = (oceanViewProperty.miscMaintenancePercentAsIs / 100) *
                               (oceanViewProperty.currentValue *
                                Math.pow(1 + oceanViewProperty.annualAppreciation / 100, year - 1));
      const totalOceanExpenses = maintenanceExpenseOcean + insuranceExpenseOcean + miscExpenseOcean;
      // Property taxes.
      const primaryPropertyTax = primaryResidence.appraisedValue *
        Math.pow(1 + primaryResidence.annualAppreciation / 100, year - 1) *
        (financialAssumptions.propertyTaxRate / 100);
      const oceanPropertyTax = oceanViewProperty.appraisedValueAsIs *
        Math.pow(1 + oceanViewProperty.annualAppreciation / 100, year - 1) *
        (financialAssumptions.propertyTaxRate / 100);
      const annualCashflow = rentalIncome - propertyManagementFee - primaryPropertyTax - oceanPropertyTax -
                             totalPrimaryExpenses - totalOceanExpenses - primaryMortgageAnnual - oceanMortgageAnnualCurrent;
      option2.netCashflow.push(annualCashflow);
      const primaryValueEndOfYear = primaryResidence.currentValue *
        Math.pow(1 + primaryResidence.annualAppreciation / 100, year);
      const oceanValueEndOfYear = oceanViewProperty.currentValue *
        Math.pow(1 + oceanViewProperty.annualAppreciation / 100, year);
      option2.propertyValues.push(primaryValueEndOfYear + oceanValueEndOfYear);
      const cumulativeReturn = (annualCashflow * year) +
                                (primaryValueEndOfYear + oceanValueEndOfYear) - (primaryResidence.currentValue + oceanViewProperty.currentValue);
      option2.cumulativeReturn.push(cumulativeReturn);
      option2.npv += annualCashflow / Math.pow(1 + discountRate, year);
      option2Breakdown.push({
        year,
        rentalIncome,
        propertyManagementFee,
        primaryPropertyTax,
        oceanPropertyTax,
        maintenanceExpensePrimary,
        insuranceExpensePrimary,
        miscExpensePrimary,
        totalPrimaryExpenses,
        maintenanceExpenseOcean,
        insuranceExpenseOcean,
        miscExpenseOcean,
        totalOceanExpenses,
        annualCashflow,
        primaryValueEndOfYear,
        oceanValueEndOfYear,
        cumulativeReturn
      });
    }

    // --- Option 3: Renovate & Move ---
    const option3 = {
      name: "Option 3: Renovate & Move",
      initialInvestment: oceanViewProperty.renovationCost,
      netCashflow: [],
      propertyValues: [],
      cumulativeReturn: [],
      npv: 0
    };
    const option3Breakdown = [];
    let npv3 = -oceanViewProperty.renovationCost;
    for (let year = 1; year <= years; year++) {
      let rentalIncome = 0;
      if (year === 1) {
        const monthsRenting = 12 - oceanViewProperty.renovationTimeMonths;
        rentalIncome = primaryResidence.rentalIncomeMonthly * monthsRenting;
      } else {
        rentalIncome = primaryResidence.rentalIncomeMonthly * 12 *
          Math.pow(1 + financialAssumptions.rentalIncomeAnnualIncrease / 100, year - 1);
      }
      const propertyManagementFee = rentalIncome * (financialAssumptions.propertyManagementFeePercentage / 100);
      const inflationFactor = Math.pow(1 + financialAssumptions.inflationRate / 100, year - 1);
      const apprFactorPrimary = Math.pow(1 + primaryResidence.annualAppreciation / 100, year - 1);
      // Primary expenses (same as before).
      const primaryMonthlyMaintenance = primaryResidence.maintenancePoolMonthly +
                                        primaryResidence.maintenanceGardeningMonthly +
                                        primaryResidence.maintenanceUtilitiesMonthly +
                                        primaryResidence.maintenanceOtherUpkeepMonthly;
      const maintenanceExpensePrimary = primaryMonthlyMaintenance * 12 * inflationFactor;
      const insuranceExpensePrimary = primaryResidence.insuranceYearly * inflationFactor;
      const miscExpensePrimary = (primaryResidence.miscMaintenancePercent / 100) *
                                 (primaryResidence.currentValue * apprFactorPrimary);
      const totalPrimaryExpenses = maintenanceExpensePrimary + insuranceExpensePrimary + miscExpensePrimary;
      let oceanPropertyTax, oceanExpenses = 0, oceanValue;
      let renovationCost = 0;
      if (year === 1) {
        const monthsAsIs = oceanViewProperty.renovationTimeMonths;
        const monthsRenovated = 12 - monthsAsIs;
        oceanValue = (oceanViewProperty.appraisedValueAsIs * (monthsAsIs / 12)) +
                     (oceanViewProperty.appraisedValueRenovated * (monthsRenovated / 12));
        const monthlyMaintenanceAsIs = oceanViewProperty.maintenancePoolMonthlyAsIs +
                                       oceanViewProperty.maintenanceGardeningMonthlyAsIs +
                                       oceanViewProperty.maintenanceUtilitiesMonthlyAsIs +
                                       oceanViewProperty.maintenanceOtherUpkeepMonthlyAsIs;
        const maintenanceExpenseAsIs = monthlyMaintenanceAsIs * monthsAsIs;
        const insuranceExpenseAsIs = oceanViewProperty.insuranceYearlyAsIs * (monthsAsIs / 12);
        const miscExpenseAsIs = (oceanViewProperty.miscMaintenancePercentAsIs / 100) *
                                ((oceanViewProperty.currentValue + oceanViewProperty.renovationCost * (monthsAsIs / 12)) * (monthsAsIs / 12));
        const totalExpensesAsIs = maintenanceExpenseAsIs + insuranceExpenseAsIs + miscExpenseAsIs;
        const monthlyMaintenanceRenovated = oceanViewProperty.maintenancePoolMonthlyRenovated +
                                            oceanViewProperty.maintenanceGardeningMonthlyRenovated +
                                            oceanViewProperty.maintenanceUtilitiesMonthlyRenovated +
                                            oceanViewProperty.maintenanceOtherUpkeepMonthlyRenovated;
        const maintenanceExpenseRenovated = monthlyMaintenanceRenovated * monthsRenovated;
        const insuranceExpenseRenovated = oceanViewProperty.insuranceYearlyRenovated * (monthsRenovated / 12);
        const miscExpenseRenovated = (oceanViewProperty.miscMaintenancePercentRenovated / 100) *
                                     (oceanViewProperty.postRenovationValue * (monthsRenovated / 12));
        const totalExpensesRenovated = maintenanceExpenseRenovated + insuranceExpenseRenovated + miscExpenseRenovated;
        oceanExpenses = totalExpensesAsIs + totalExpensesRenovated;
        renovationCost = oceanViewProperty.renovationCost;
      } else {
        oceanValue = oceanViewProperty.appraisedValueRenovated * Math.pow(1 + oceanViewProperty.annualAppreciation / 100, year - 1);
        const monthlyMaintenanceRenovated = oceanViewProperty.maintenancePoolMonthlyRenovated +
                                            oceanViewProperty.maintenanceGardeningMonthlyRenovated +
                                            oceanViewProperty.maintenanceUtilitiesMonthlyRenovated +
                                            oceanViewProperty.maintenanceOtherUpkeepMonthlyRenovated;
        const maintenanceExpenseOcean = monthlyMaintenanceRenovated * 12 * inflationFactor;
        const insuranceExpenseOcean = oceanViewProperty.insuranceYearlyRenovated * inflationFactor;
        const miscExpenseOcean = (oceanViewProperty.miscMaintenancePercentRenovated / 100) *
                                 (oceanViewProperty.postRenovationValue * Math.pow(1 + oceanViewProperty.annualAppreciation / 100, year - 1));
        oceanExpenses = maintenanceExpenseOcean + insuranceExpenseOcean + miscExpenseOcean;
      }
      oceanPropertyTax = oceanValue * (financialAssumptions.propertyTaxRate / 100);
      const primaryPropertyTax = primaryResidence.appraisedValue *
        Math.pow(1 + primaryResidence.annualAppreciation / 100, year - 1) *
        (financialAssumptions.propertyTaxRate / 100);
      const annualCashflow = rentalIncome - propertyManagementFee - primaryPropertyTax - oceanPropertyTax -
                             totalPrimaryExpenses - oceanExpenses - renovationCost - primaryMortgageAnnual - oceanMortgageAnnualRenovated;
      option3.netCashflow.push(annualCashflow);
      const primaryValueEndOfYear = primaryResidence.currentValue * Math.pow(1 + primaryResidence.annualAppreciation / 100, year);
      const oceanValueEndOfYear = (year === 1)
        ? oceanViewProperty.currentValue + oceanViewProperty.renovationCost
        : oceanViewProperty.postRenovationValue * Math.pow(1 + oceanViewProperty.annualAppreciation / 100, year - 1);
      option3.propertyValues.push(primaryValueEndOfYear + oceanValueEndOfYear);
      const cumulativeReturn = option3.netCashflow.reduce((sum, v) => sum + v, 0) +
                                (primaryValueEndOfYear + oceanValueEndOfYear) - (primaryResidence.currentValue + oceanViewProperty.currentValue);
      option3.cumulativeReturn.push(cumulativeReturn);
      npv3 += annualCashflow / Math.pow(1 + discountRate, year);
      option3Breakdown.push({
        year,
        rentalIncome,
        propertyManagementFee,
        primaryPropertyTax,
        oceanPropertyTax,
        maintenanceExpensePrimary,
        insuranceExpensePrimary,
        miscExpensePrimary,
        totalPrimaryExpenses,
        oceanExpenses,
        renovationCost,
        annualCashflow,
        primaryValueEndOfYear,
        oceanValueEndOfYear,
        cumulativeReturn
      });
    }
    option3.npv = npv3;

    return {
      option1,
      option2,
      option3,
      breakdown: {
        option1: option1Breakdown,
        option2: option2Breakdown,
        option3: option3Breakdown
      },
      saleBreakdown: {
        saleValue,
        commission,
        netSaleProceeds,
        taxBasis: oceanViewProperty.taxBasis,
        capitalGains,
        capitalGainsTax,
        afterTaxProceeds
      }
    };
  }

  // Handlers for input changes.
  const handlePrimaryChange = (e) => {
    const { name, value } = e.target;
    const updatedValue = parseFloat(value);
    setPrimaryResidence({
      ...primaryResidence,
      [name]: isNaN(updatedValue) ? value : updatedValue
    });
  };

  const handleOceanViewChange = (e) => {
    const { name, value } = e.target;
    const updatedValue = parseFloat(value);
    setOceanViewProperty({
      ...oceanViewProperty,
      [name]: isNaN(updatedValue) ? value : updatedValue
    });
  };

  const handleFinancialChange = (e) => {
    const { name, value } = e.target;
    const updatedValue = name === 'analysisTimeframeYears' ? parseInt(value) : parseFloat(value);
    setFinancialAssumptions({
      ...financialAssumptions,
      [name]: isNaN(updatedValue) ? value : updatedValue
    });
  };

  const RenderInputField = (props) => <SmartInputField {...props} onBlurChange={props.onChange} />;

  // Tab Button component.
  const TabButton = ({ id, label, active }) => (
    <button
      onClick={() => setActiveTab(id)}
      style={{
        padding: '8px 16px',
        fontWeight: '500',
        fontSize: '0.875rem',
        borderRadius: '8px 8px 0 0',
        backgroundColor: active ? '#2563eb' : '#e5e7eb',
        color: active ? '#ffffff' : '#374151',
        border: 'none',
        cursor: 'pointer',
        marginRight: '8px'
      }}
    >
      {label}
    </button>
  );

  const renderTabs = () => (
    <div style={{ marginBottom: '16px', borderBottom: '1px solid #e5e7eb' }}>
      <div style={{ display: 'flex', gap: '8px' }}>
        <TabButton id="assumptions" label="Assumptions" active={activeTab === 'assumptions'} />
        <TabButton id="cashflow" label="Annual Cashflow" active={activeTab === 'cashflow'} />
        <TabButton id="propertyValues" label="Property Values" active={activeTab === 'propertyValues'} />
        <TabButton id="returns" label="Financial Returns" active={activeTab === 'returns'} />
        <TabButton id="npv" label="NPV" active={activeTab === 'npv'} />
        <TabButton id="summary" label="5-Year Summary" active={activeTab === 'summary'} />
        <TabButton id="recommendation" label="Recommendation" active={activeTab === 'recommendation'} />
      </div>
    </div>
  );

  // Render Assumptions Tab.
  const renderAssumptionsTab = () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
      <div style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h3>Primary Residence</h3>
        <RenderInputField label="Current Value" name="currentValue" value={primaryResidence.currentValue} onChange={handlePrimaryChange} dollarSign={true} />
        <RenderInputField label="Appraised Value" name="appraisedValue" value={primaryResidence.appraisedValue} onChange={handlePrimaryChange} dollarSign={true} />
        <RenderInputField label="Tax Basis" name="taxBasis" value={primaryResidence.taxBasis} onChange={handlePrimaryChange} dollarSign={true} />
        <RenderInputField label="Square Feet" name="squareFeet" value={primaryResidence.squareFeet} onChange={handlePrimaryChange} />
        <RenderInputField label="Monthly Rental Income" name="rentalIncomeMonthly" value={primaryResidence.rentalIncomeMonthly} onChange={handlePrimaryChange} dollarSign={true} />
        <RenderInputField label="Annual Appreciation (%)" name="annualAppreciation" value={primaryResidence.annualAppreciation} onChange={handlePrimaryChange} percent={true} />
        <RenderInputField label="Pool (Monthly)" name="maintenancePoolMonthly" value={primaryResidence.maintenancePoolMonthly} onChange={handlePrimaryChange} dollarSign={true} />
        <RenderInputField label="Gardening (Monthly)" name="maintenanceGardeningMonthly" value={primaryResidence.maintenanceGardeningMonthly} onChange={handlePrimaryChange} dollarSign={true} />
        <RenderInputField label="Utilities (Monthly)" name="maintenanceUtilitiesMonthly" value={primaryResidence.maintenanceUtilitiesMonthly} onChange={handlePrimaryChange} dollarSign={true} />
        <RenderInputField label="Other Upkeep (Monthly)" name="maintenanceOtherUpkeepMonthly" value={primaryResidence.maintenanceOtherUpkeepMonthly} onChange={handlePrimaryChange} dollarSign={true} />
        <RenderInputField label="Insurance (Yearly)" name="insuranceYearly" value={primaryResidence.insuranceYearly} onChange={handlePrimaryChange} dollarSign={true} />
        <RenderInputField label="Misc Maintenance (% of Home Value)" name="miscMaintenancePercent" value={primaryResidence.miscMaintenancePercent} onChange={handlePrimaryChange} percent={true} />
        <RenderInputField label="Mortgage Payment (Monthly)" name="mortgagePaymentMonthly" value={primaryResidence.mortgagePaymentMonthly} onChange={handlePrimaryChange} dollarSign={true} />
      </div>

      <div style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h3>Ocean View Property</h3>
        <RenderInputField label="Current Value" name="currentValue" value={oceanViewProperty.currentValue} onChange={handleOceanViewChange} dollarSign={true} />
        <RenderInputField label="Appraised Value (As-Is)" name="appraisedValueAsIs" value={oceanViewProperty.appraisedValueAsIs} onChange={handleOceanViewChange} dollarSign={true} />
        <RenderInputField label="Appraised Value (Renovated)" name="appraisedValueRenovated" value={oceanViewProperty.appraisedValueRenovated} onChange={handleOceanViewChange} dollarSign={true} />
        <RenderInputField label="Tax Basis" name="taxBasis" value={oceanViewProperty.taxBasis} onChange={handleOceanViewChange} dollarSign={true} />
        <RenderInputField label="Square Feet" name="squareFeet" value={oceanViewProperty.squareFeet} onChange={handleOceanViewChange} />
        <RenderInputField label="Renovation Cost" name="renovationCost" value={oceanViewProperty.renovationCost} onChange={handleOceanViewChange} dollarSign={true} />
        <RenderInputField label="Post-Renovation Value" name="postRenovationValue" value={oceanViewProperty.postRenovationValue} onChange={handleOceanViewChange} dollarSign={true} />
        <RenderInputField label="Monthly Rental (As-Is)" name="rentalIncomeMonthlyAsIs" value={oceanViewProperty.rentalIncomeMonthlyAsIs} onChange={handleOceanViewChange} dollarSign={true} />
        <RenderInputField label="Monthly Rental (Renovated)" name="rentalIncomeMonthlyRenovated" value={oceanViewProperty.rentalIncomeMonthlyRenovated} onChange={handleOceanViewChange} dollarSign={true} />
        <RenderInputField label="Annual Appreciation (%)" name="annualAppreciation" value={oceanViewProperty.annualAppreciation} onChange={handleOceanViewChange} percent={true} />
        <RenderInputField label="Pool (Monthly, As-Is)" name="maintenancePoolMonthlyAsIs" value={oceanViewProperty.maintenancePoolMonthlyAsIs} onChange={handleOceanViewChange} dollarSign={true} />
        <RenderInputField label="Gardening (Monthly, As-Is)" name="maintenanceGardeningMonthlyAsIs" value={oceanViewProperty.maintenanceGardeningMonthlyAsIs} onChange={handleOceanViewChange} dollarSign={true} />
        <RenderInputField label="Utilities (Monthly, As-Is)" name="maintenanceUtilitiesMonthlyAsIs" value={oceanViewProperty.maintenanceUtilitiesMonthlyAsIs} onChange={handleOceanViewChange} dollarSign={true} />
        <RenderInputField label="Other Upkeep (Monthly, As-Is)" name="maintenanceOtherUpkeepMonthlyAsIs" value={oceanViewProperty.maintenanceOtherUpkeepMonthlyAsIs} onChange={handleOceanViewChange} dollarSign={true} />
        <RenderInputField label="Insurance (Yearly, As-Is)" name="insuranceYearlyAsIs" value={oceanViewProperty.insuranceYearlyAsIs} onChange={handleOceanViewChange} dollarSign={true} />
        <RenderInputField label="Misc Maintenance (% As-Is)" name="miscMaintenancePercentAsIs" value={oceanViewProperty.miscMaintenancePercentAsIs} onChange={handleOceanViewChange} percent={true} />
        <RenderInputField label="Pool (Monthly, Renovated)" name="maintenancePoolMonthlyRenovated" value={oceanViewProperty.maintenancePoolMonthlyRenovated} onChange={handleOceanViewChange} dollarSign={true} />
        <RenderInputField label="Gardening (Monthly, Renovated)" name="maintenanceGardeningMonthlyRenovated" value={oceanViewProperty.maintenanceGardeningMonthlyRenovated} onChange={handleOceanViewChange} dollarSign={true} />
        <RenderInputField label="Utilities (Monthly, Renovated)" name="maintenanceUtilitiesMonthlyRenovated" value={oceanViewProperty.maintenanceUtilitiesMonthlyRenovated} onChange={handleOceanViewChange} dollarSign={true} />
        <RenderInputField label="Other Upkeep (Monthly, Renovated)" name="maintenanceOtherUpkeepMonthlyRenovated" value={oceanViewProperty.maintenanceOtherUpkeepMonthlyRenovated} onChange={handleOceanViewChange} dollarSign={true} />
        <RenderInputField label="Insurance (Yearly, Renovated)" name="insuranceYearlyRenovated" value={oceanViewProperty.insuranceYearlyRenovated} onChange={handleOceanViewChange} dollarSign={true} />
        <RenderInputField label="Misc Maintenance (% Renovated)" name="miscMaintenancePercentRenovated" value={oceanViewProperty.miscMaintenancePercentRenovated} onChange={handleOceanViewChange} percent={true} />
        <RenderInputField label="Renovation Time (Months)" name="renovationTimeMonths" value={oceanViewProperty.renovationTimeMonths} onChange={handleOceanViewChange} />
        <RenderInputField label="Current Mortgage (Monthly)" name="mortgagePaymentMonthlyCurrent" value={oceanViewProperty.mortgagePaymentMonthlyCurrent} onChange={handleOceanViewChange} dollarSign={true} />
        <RenderInputField label="Post-Renovation Mortgage (Monthly)" name="mortgagePaymentMonthlyRenovated" value={oceanViewProperty.mortgagePaymentMonthlyRenovated} onChange={handleOceanViewChange} dollarSign={true} />
      </div>

      <div style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h3>Financial Assumptions</h3>
        <RenderInputField label="Investment Return Rate (%)" name="investmentReturnRate" value={financialAssumptions.investmentReturnRate} onChange={handleFinancialChange} percent={true} />
        <RenderInputField label="Mortgage Interest Rate (%)" name="mortgageInterestRate" value={financialAssumptions.mortgageInterestRate} onChange={handleFinancialChange} percent={true} />
        <RenderInputField label="Annual Inflation Rate (%)" name="inflationRate" value={financialAssumptions.inflationRate} onChange={handleFinancialChange} percent={true} />
        <RenderInputField label="Capital Gains Tax Rate (%)" name="capitalGainsTaxRate" value={financialAssumptions.capitalGainsTaxRate} onChange={handleFinancialChange} percent={true} />
        <RenderInputField label="Property Tax Rate (%)" name="propertyTaxRate" value={financialAssumptions.propertyTaxRate} onChange={handleFinancialChange} percent={true} />
        <RenderInputField label="Rental Income Annual Increase (%)" name="rentalIncomeAnnualIncrease" value={financialAssumptions.rentalIncomeAnnualIncrease} onChange={handleFinancialChange} percent={true} />
        <RenderInputField label="Property Management Fee (%)" name="propertyManagementFeePercentage" value={financialAssumptions.propertyManagementFeePercentage} onChange={handleFinancialChange} percent={true} />
        <RenderInputField label="Analysis Timeframe (Years)" name="analysisTimeframeYears" value={financialAssumptions.analysisTimeframeYears} onChange={handleFinancialChange} />
      </div>
    </div>
  );

  // Generic breakdown table renderer.
  const renderBreakdownTable = (data, columns) => (
    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px' }}>
      <thead style={{ backgroundColor: '#f3f4f6' }}>
        <tr>
          {columns.map((col, i) => (
            <th key={i} style={{ padding: '6px', border: '1px solid #d1d5db', fontSize: '0.75rem', textAlign: 'center' }}>
              {col.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, idx) => (
          <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f9fafb' }}>
            {columns.map((col, i) => (
              <td key={i} style={{ padding: '6px', border: '1px solid #d1d5db', fontSize: '0.75rem', textAlign: 'center' }}>
                {typeof row[col.field] === 'number' ? 
  (col.field === 'discountFactor' ? row[col.field].toFixed(2) : formatNumber(row[col.field])) 
  : row[col.field]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );

  // Render Cashflow Tab.
  const renderCashflowTab = () => {
    // Helper for discounted cash flow will be in the NPV tab.
    return (
      <div>
        <div style={{ backgroundColor: '#eef', padding: '12px', marginBottom: '16px', borderRadius: '8px' }}>
          <h4>Option 1 – Sale Breakdown</h4>
          {renderBreakdownTable([results.saleBreakdown], [
            { label: 'Sale Value', field: 'saleValue' },
            { label: 'Commission', field: 'commission' },
            { label: 'Net Proceeds', field: 'netSaleProceeds' },
            { label: 'Tax Basis', field: 'taxBasis' },
            { label: 'Cap Gains', field: 'capitalGains' },
            { label: 'Cap Gains Tax', field: 'capitalGainsTax' },
            { label: 'After-Tax Proceeds', field: 'afterTaxProceeds' }
          ])}
        </div>
        <div style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '16px' }}>
          <h3>Net Annual Cashflow Summary</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ backgroundColor: '#f9fafb' }}>
                <tr>
                  <th style={{ padding: '8px', border: '1px solid #d1d5db' }}>Year</th>
                  <th style={{ padding: '8px', border: '1px solid #d1d5db' }}>Option 1</th>
                  <th style={{ padding: '8px', border: '1px solid #d1d5db' }}>Option 2</th>
                  <th style={{ padding: '8px', border: '1px solid #d1d5db' }}>Option 3</th>
                </tr>
              </thead>
              <tbody>
                {[...Array(financialAssumptions.analysisTimeframeYears)].map((_, index) => (
                  <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#ffffff' : '#f3f4f6' }}>
                    <td style={{ padding: '8px', border: '1px solid #d1d5db' }}>Year {index + 1}</td>
                    <td style={{ padding: '8px', border: '1px solid #d1d5db', color: results.option1.netCashflow[index] >= 0 ? '#16a34a' : '#dc2626' }}>
                      ${formatNumber(results.option1.netCashflow[index] || 0)}
                    </td>
                    <td style={{ padding: '8px', border: '1px solid #d1d5db', color: results.option2.netCashflow[index] >= 0 ? '#16a34a' : '#dc2626' }}>
                      ${formatNumber(results.option2.netCashflow[index] || 0)}
                    </td>
                    <td style={{ padding: '8px', border: '1px solid #d1d5db', color: results.option3.netCashflow[index] >= 0 ? '#16a34a' : '#dc2626' }}>
                      ${formatNumber(results.option3.netCashflow[index] || 0)}
                    </td>
                  </tr>
                ))}
                <tr style={{ backgroundColor: '#f9fafb' }}>
                  <td style={{ padding: '8px', border: '1px solid #d1d5db', fontWeight: '500' }}>Total</td>
                  <td style={{ padding: '8px', border: '1px solid #d1d5db', fontWeight: '500', color: sumArray(results.option1.netCashflow) >= 0 ? '#16a34a' : '#dc2626' }}>
                    ${formatNumber(sumArray(results.option1.netCashflow))}
                  </td>
                  <td style={{ padding: '8px', border: '1px solid #d1d5db', fontWeight: '500', color: sumArray(results.option2.netCashflow) >= 0 ? '#16a34a' : '#dc2626' }}>
                    ${formatNumber(sumArray(results.option2.netCashflow))}
                  </td>
                  <td style={{ padding: '8px', border: '1px solid #d1d5db', fontWeight: '500', color: sumArray(results.option3.netCashflow) >= 0 ? '#16a34a' : '#dc2626' }}>
                    ${formatNumber(sumArray(results.option3.netCashflow))}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div>
          <h4>Step-by-Step Cash Flow – Option 1 (Sale)</h4>
          {renderBreakdownTable(results.breakdown.option1, [
            { label: 'Year', field: 'year' },
            { label: 'Invest Return', field: 'investmentReturn' },
            { label: 'Prim Tax', field: 'primaryPropertyTax' },
            { label: 'Maint Exp', field: 'maintenanceExpensePrimary' },
            { label: 'Ins Exp', field: 'insuranceExpensePrimary' },
            { label: 'Misc Exp', field: 'miscExpensePrimary' },
            { label: 'Tot Prim Exp', field: 'totalPrimaryExpenses' },
            { label: 'Mortgage', field: 'mortgage' },
            { label: 'Annual CF', field: 'annualCashflow' },
            { label: 'Cum Return', field: 'cumulativeReturn' }
          ])}
          <h4>Step-by-Step Cash Flow – Option 2 (Rent As-Is)</h4>
          {renderBreakdownTable(results.breakdown.option2, [
            { label: 'Year', field: 'year' },
            { label: 'Rental Inc', field: 'rentalIncome' },
            { label: 'Mgmt Fee', field: 'propertyManagementFee' },
            { label: 'Prim Tax', field: 'primaryPropertyTax' },
            { label: 'Ocean Tax', field: 'oceanPropertyTax' },
            { label: 'Prim Maint', field: 'maintenanceExpensePrimary' },
            { label: 'Prim Ins', field: 'insuranceExpensePrimary' },
            { label: 'Prim Misc', field: 'miscExpensePrimary' },
            { label: 'Tot Prim Exp', field: 'totalPrimaryExpenses' },
            { label: 'Ocean Maint', field: 'maintenanceExpenseOcean' },
            { label: 'Ocean Ins', field: 'insuranceExpenseOcean' },
            { label: 'Ocean Misc', field: 'miscExpenseOcean' },
            { label: 'Tot Ocean Exp', field: 'totalOceanExpenses' },
            { label: 'Annual CF', field: 'annualCashflow' },
            { label: 'Cum Return', field: 'cumulativeReturn' }
          ])}
          <h4>Step-by-Step Cash Flow – Option 3 (Renovate & Move)</h4>
          {renderBreakdownTable(results.breakdown.option3, [
            { label: 'Year', field: 'year' },
            { label: 'Rental Inc', field: 'rentalIncome' },
            { label: 'Mgmt Fee', field: 'propertyManagementFee' },
            { label: 'Prim Tax', field: 'primaryPropertyTax' },
            { label: 'Ocean Tax', field: 'oceanPropertyTax' },
            { label: 'Prim Maint', field: 'maintenanceExpensePrimary' },
            { label: 'Prim Ins', field: 'insuranceExpensePrimary' },
            { label: 'Prim Misc', field: 'miscExpensePrimary' },
            { label: 'Tot Prim Exp', field: 'totalPrimaryExpenses' },
            { label: 'Ocean Tot Exp', field: 'oceanExpenses' },
            { label: 'Renov Cost', field: 'renovationCost' },
            { label: 'Annual CF', field: 'annualCashflow' },
            { label: 'Cum Return', field: 'cumulativeReturn' }
          ])}
        </div>
      </div>
    );
  };

  // Render Property Values Tab.
  const renderPropertyValuesTab = () => (
    <div>
      <div style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '16px' }}>
        <h3>Total Property Values (End of Year)</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#f9fafb' }}>
              <tr>
                <th style={{ padding: '8px', border: '1px solid #d1d5db' }}>Year</th>
                <th style={{ padding: '8px', border: '1px solid #d1d5db' }}>Option 1</th>
                <th style={{ padding: '8px', border: '1px solid #d1d5db' }}>Option 2</th>
                <th style={{ padding: '8px', border: '1px solid #d1d5db' }}>Option 3</th>
              </tr>
            </thead>
            <tbody>
              {[...Array(financialAssumptions.analysisTimeframeYears)].map((_, index) => (
                <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#ffffff' : '#f3f4f6' }}>
                  <td style={{ padding: '8px', border: '1px solid #d1d5db' }}>Year {index + 1}</td>
                  <td style={{ padding: '8px', border: '1px solid #d1d5db' }}>
                    ${formatNumber(results.option1.propertyValues[index] || 0)}
                  </td>
                  <td style={{ padding: '8px', border: '1px solid #d1d5db' }}>
                    ${formatNumber(results.option2.propertyValues[index] || 0)}
                  </td>
                  <td style={{ padding: '8px', border: '1px solid #d1d5db' }}>
                    ${formatNumber(results.option3.propertyValues[index] || 0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Render Returns Tab.
  const renderReturnsTab = () => (
    <div>
      <div style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '16px' }}>
        <h3>Cumulative Financial Return</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#f9fafb' }}>
              <tr>
                <th style={{ padding: '8px', border: '1px solid #d1d5db' }}>Year</th>
                <th style={{ padding: '8px', border: '1px solid #d1d5db' }}>Option 1</th>
                <th style={{ padding: '8px', border: '1px solid #d1d5db' }}>Option 2</th>
                <th style={{ padding: '8px', border: '1px solid #d1d5db' }}>Option 3</th>
              </tr>
            </thead>
            <tbody>
              {[...Array(financialAssumptions.analysisTimeframeYears)].map((_, index) => (
                <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#ffffff' : '#f3f4f6' }}>
                  <td style={{ padding: '8px', border: '1px solid #d1d5db' }}>Year {index + 1}</td>
                  <td style={{ padding: '8px', border: '1px solid #d1d5db', color: results.option1.cumulativeReturn[index] >= 0 ? '#16a34a' : '#dc2626' }}>
                    ${formatNumber(results.option1.cumulativeReturn[index] || 0)}
                  </td>
                  <td style={{ padding: '8px', border: '1px solid #d1d5db', color: results.option2.cumulativeReturn[index] >= 0 ? '#16a34a' : '#dc2626' }}>
                    ${formatNumber(results.option2.cumulativeReturn[index] || 0)}
                  </td>
                  <td style={{ padding: '8px', border: '1px solid #d1d5db', color: results.option3.cumulativeReturn[index] >= 0 ? '#16a34a' : '#dc2626' }}>
                    ${formatNumber(results.option3.cumulativeReturn[index] || 0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div>
        <h4>Detailed Cumulative Return – Option 1</h4>
        {renderBreakdownTable(results.breakdown.option1, [
          { label: 'Year', field: 'year' },
          { label: 'Cum Return', field: 'cumulativeReturn' }
        ])}
        <h4>Detailed Cumulative Return – Option 2</h4>
        {renderBreakdownTable(results.breakdown.option2, [
          { label: 'Year', field: 'year' },
          { label: 'Cum Return', field: 'cumulativeReturn' }
        ])}
        <h4>Detailed Cumulative Return – Option 3</h4>
        {renderBreakdownTable(results.breakdown.option3, [
          { label: 'Year', field: 'year' },
          { label: 'Cum Return', field: 'cumulativeReturn' }
        ])}
      </div>
    </div>
  );

  // Render NPV Tab.
  const renderNPVTab = () => {
    const renderDiscountedTable = (data, optionName) => {
      const discountRate = financialAssumptions.investmentReturnRate / 100;
      const columns = [
        { label: 'Year', field: 'year' },
        { label: 'Annual CF', field: 'annualCashflow' },
        { label: 'Discount Factor', field: 'discountFactor' },
        { label: 'Discounted CF', field: 'discountedCF' }
      ];
      const tableData = data.map((row) => {
        const discountFactor = Math.pow(1 + discountRate, row.year);
        const discountedCF = row.annualCashflow / discountFactor;
        return { ...row, discountFactor, discountedCF };
      });
      return (
        <div style={{ marginBottom: '16px' }}>
          <h4>Discounted Cashflows – {optionName}</h4>
          {renderBreakdownTable(tableData, columns)}
        </div>
      );
    };

    return (
      <div>
        <div style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '16px' }}>
          <h3>Net Present Value (NPV) Summary</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#f9fafb' }}>
              <tr>
                <th style={{ padding: '8px', border: '1px solid #d1d5db' }}>Option</th>
                <th style={{ padding: '8px', border: '1px solid #d1d5db' }}>NPV</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ backgroundColor: '#f3f4f6' }}>
                <td style={{ padding: '8px', border: '1px solid #d1d5db' }}>Option 1: Sell Ocean View</td>
                <td style={{ padding: '8px', border: '1px solid #d1d5db' }}>${formatNumber(results.option1.npv)}</td>
              </tr>
              <tr style={{ backgroundColor: '#ffffff' }}>
                <td style={{ padding: '8px', border: '1px solid #d1d5db' }}>Option 2: Rent Ocean View As-Is</td>
                <td style={{ padding: '8px', border: '1px solid #d1d5db' }}>${formatNumber(results.option2.npv)}</td>
              </tr>
              <tr style={{ backgroundColor: '#f3f4f6' }}>
                <td style={{ padding: '8px', border: '1px solid #d1d5db' }}>Option 3: Renovate & Move</td>
                <td style={{ padding: '8px', border: '1px solid #d1d5db' }}>${formatNumber(results.option3.npv)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        {renderDiscountedTable(results.breakdown.option1, "Option 1")}
        {renderDiscountedTable(results.breakdown.option2, "Option 2")}
        {renderDiscountedTable(results.breakdown.option3, "Option 3")}
      </div>
    );
  };

  // Render Summary Tab.
  const renderSummaryTab = () => (
    <div style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '16px' }}>
      <h3>5-Year Summary</h3>
      <p style={{ color: '#4b5563' }}>
        Overview of net cashflow, property appreciation, cumulative returns, and NPV over {financialAssumptions.analysisTimeframeYears} years.
      </p>
      <ul style={{ marginTop: '16px', paddingLeft: '16px', color: '#4b5563' }}>
        <li>Option 1 Total Return: ${formatNumber(sumArray(results.option1.cumulativeReturn))}</li>
        <li>Option 2 Total Return: ${formatNumber(sumArray(results.option2.cumulativeReturn))}</li>
        <li>Option 3 Total Return: ${formatNumber(sumArray(results.option3.cumulativeReturn))}</li>
        <li>Option 1 NPV: ${formatNumber(results.option1.npv)}</li>
        <li>Option 2 NPV: ${formatNumber(results.option2.npv)}</li>
        <li>Option 3 NPV: ${formatNumber(results.option3.npv)}</li>
      </ul>
      <h4 style={{ marginTop: '24px' }}>Detailed Calculation breakdowns are provided in each results tab.</h4>
    </div>
  );

  // Render Recommendation Tab.
  const renderRecommendationTab = () => (
    <div style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <h3>Recommendation</h3>
      <p style={{ color: '#4b5563' }}>Based on 5-year cumulative return and NPV, the recommended option is:</p>
      <p style={{ marginTop: '8px', fontSize: '1.25rem', fontWeight: 'bold', color: '#2563eb' }}>{getBestOption()}</p>
    </div>
  );

  return (
    <div style={{ padding: '24px' }}>
      {renderTabs()}
      {activeTab === 'assumptions' && renderAssumptionsTab()}
      {activeTab === 'cashflow' && renderCashflowTab()}
      {activeTab === 'propertyValues' && renderPropertyValuesTab()}
      {activeTab === 'returns' && renderReturnsTab()}
      {activeTab === 'npv' && renderNPVTab()}
      {activeTab === 'summary' && renderSummaryTab()}
      {activeTab === 'recommendation' && renderRecommendationTab()}
    </div>
  );
};

export default LJPropertiesAnalyzer;