import React, { useState, useEffect } from 'react';



export default function LJPropertiesSales() {
  const [primaryResidence, setPrimaryResidence] = useState({
    currentValue: 7500000,
    annualAppreciation: 4,
    taxBasis: 3400000
  });
  const [oceanViewProperty, setOceanViewProperty] = useState({
    currentValue: 14000000,
    annualAppreciation: 4,
    taxBasisAsIs: 8500000,
    taxBasisRenovated: 13500000,
    postRenovationValue: 18000000
  });
  const [financialAssumptions] = useState({ capitalGainsTaxRate: 37.1 });
  const [years] = useState(5);
  const [saleBreakdown, setSaleBreakdown] = useState([]);

  const LJPropertiesSales = ({ saleBreakdown }) => {
    return (
      <div>
        {saleBreakdown.map(row => (
          <div key={row.year}>
            {/* render exactly the same markup you have in renderSalesTab */}
          </div>
        ))}
      </div>
    );
  };

  useEffect(() => {
    const data = [];
    for (let year = 1; year <= years; year++) {
      // Primary
      const salePricePrimary = primaryResidence.currentValue * Math.pow(1 + primaryResidence.annualAppreciation/100, year - 1);
      const commissionPrimary = salePricePrimary * 0.06;
      const gainsPrimary = Math.max(salePricePrimary - commissionPrimary - primaryResidence.taxBasis, 0);
      const taxesPrimary = gainsPrimary * (financialAssumptions.capitalGainsTaxRate/100);
      const netPrimary = salePricePrimary - commissionPrimary - taxesPrimary;

      // Ocean View As-Is
      const salePriceOceanAsIs = oceanViewProperty.currentValue * Math.pow(1 + oceanViewProperty.annualAppreciation/100, year - 1);
      const commissionOceanAsIs = salePriceOceanAsIs * 0.06;
      const gainsOceanAsIs = Math.max(salePriceOceanAsIs - commissionOceanAsIs - oceanViewProperty.taxBasisAsIs, 0);
      const taxesOceanAsIs = gainsOceanAsIs * (financialAssumptions.capitalGainsTaxRate/100);
      const netOceanAsIs = salePriceOceanAsIs - commissionOceanAsIs - taxesOceanAsIs;

      // Ocean View Renovated
      const salePriceOceanRen = oceanViewProperty.postRenovationValue * Math.pow(1 + oceanViewProperty.annualAppreciation/100, year - 1);
      const commissionOceanRen = salePriceOceanRen * 0.06;
      const gainsOceanRen = Math.max(salePriceOceanRen - commissionOceanRen - oceanViewProperty.taxBasisRenovated, 0);
      const taxesOceanRen = gainsOceanRen * (financialAssumptions.capitalGainsTaxRate/100);
      const netOceanRen = salePriceOceanRen - commissionOceanRen - taxesOceanRen;

      data.push({
        year,
        salePricePrimary, commissionPrimary, taxableBasisPrimary: primaryResidence.taxBasis, taxesPrimary, netPrimary,
        salePriceOceanAsIs, commissionOceanAsIs, taxableBasisOceanAsIs: oceanViewProperty.taxBasisAsIs, taxesOceanAsIs, netOceanAsIs,
        salePriceOceanRen, commissionOceanRen, taxableBasisOceanRenovated: oceanViewProperty.taxBasisRenovated, taxesOceanRen, netOceanRen
      });
    }
    setSaleBreakdown(data);
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h2>Sales Tab</h2>
      {saleBreakdown.map(row => (
        <div key={row.year} style={{ marginBottom: 24, border: '1px solid #ccc', padding: 12, borderRadius: 8 }}>
          <h4>Year {row.year}</h4>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#f0f0f0' }}>
              <tr>
                <th>Metric</th>
                <th>Primary Residence</th>
                <th>Ocean View (As-Is)</th>
                <th>Ocean View (Renovated)</th>
              </tr>
            </thead>
            <tbody>
              {[['Sale Price','salePricePrimary','salePriceOceanAsIs','salePriceOceanRen'],
                ['Commission','commissionPrimary','commissionOceanAsIs','commissionOceanRen'],
                ['Taxable Basis','taxableBasisPrimary','taxableBasisOceanAsIs','taxableBasisOceanRenovated'],
                ['Taxes','taxesPrimary','taxesOceanAsIs','taxesOceanRen'],
                ['Net Proceeds','netPrimary','netOceanAsIs','netOceanRen']
              ].map(([label, p, a, r]) => (
                <tr key={label} style={{ borderTop: '1px solid #ddd' }}>
                  <td style={{ padding: 8 }}>{label}</td>
                  <td style={{ padding: 8 }}>${Math.round(row[p]).toLocaleString()}</td>
                  <td style={{ padding: 8 }}>${Math.round(row[a]).toLocaleString()}</td>
                  <td style={{ padding: 8 }}>${Math.round(row[r]).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
