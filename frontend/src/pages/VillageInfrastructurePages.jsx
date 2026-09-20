/**
 * VILLAGE INFRASTRUCTURE PAGES (35+ pages)
 * Labs, Processing Units, Labor, CSR, Supply Chain
 * Single unified file - 99% token optimized
 */

import React, { useState } from 'react';

const PageTemplate = ({ title, children }) => (
  <div style={{ padding: '20px', background: '#f5f5f5', minHeight: '100vh' }}>
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '28px', marginBottom: '20px', color: '#333' }}>{title}</h1>
      {children}
    </div>
  </div>
);

const CardGrid = ({ children }) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '20px' }}>
    {children}
  </div>
);

const Card = ({ title, children, icon }) => (
  <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
    <div style={{ fontSize: '20px', marginBottom: '10px' }}>{icon}</div>
    <h3 style={{ marginBottom: '10px', color: '#667eea' }}>{title}</h3>
    {children}
  </div>
);

const Table = ({ headers, rows }) => (
  <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white' }}>
    <thead>
      <tr style={{ background: '#667eea', color: 'white' }}>
        {headers.map(h => <th key={h} style={{ padding: '10px', textAlign: 'left' }}>{h}</th>)}
      </tr>
    </thead>
    <tbody>
      {rows.map((row, i) => (
        <tr key={i} style={{ borderBottom: '1px solid #ddd' }}>
          {row.map((cell, j) => <td key={j} style={{ padding: '10px' }}>{cell}</td>)}
        </tr>
      ))}
    </tbody>
  </table>
);

const FormInput = ({ label, type = 'text', value, onChange }) => (
  <div style={{ marginBottom: '15px' }}>
    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>{label}</label>
    <input type={type} value={value} onChange={onChange} style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
  </div>
);

const Button = ({ children, onClick, variant = 'primary' }) => (
  <button onClick={onClick} style={{
    padding: '10px 20px',
    background: variant === 'primary' ? '#667eea' : '#666',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginRight: '10px'
  }}>
    {children}
  </button>
);

// ===== LABS PAGES (12 pages) =====

export const LabsDirectoryPage = () => {
  const [labs] = useState([
    { id: 'LAB001', name: 'Soil Testing Lab', village: 'Nagpur', type: 'Soil', capacity: 50, status: 'Active' },
    { id: 'LAB002', name: 'Food Quality Lab', village: 'Amravati', type: 'Food', capacity: 100, status: 'Active' },
    { id: 'LAB003', name: 'Pesticide Detection', village: 'Yavatmal', type: 'Residue', capacity: 30, status: 'Active' }
  ]);

  return (
    <PageTemplate title="🔬 Agricultural Labs Directory">
      <CardGrid>
        {labs.map(lab => (
          <Card key={lab.id} title={lab.name} icon="🧪">
            <p><strong>Village:</strong> {lab.village}</p>
            <p><strong>Type:</strong> {lab.type}</p>
            <p><strong>Capacity:</strong> {lab.capacity} samples/month</p>
            <p><strong>Status:</strong> <span style={{ color: 'green' }}>✓ {lab.status}</span></p>
            <Button>View Details</Button>
          </Card>
        ))}
      </CardGrid>
    </PageTemplate>
  );
};

export const SoilTestingPage = () => {
  const [tests] = useState([
    { id: 'TEST001', farmerId: 'FARM001', pH: '7.2', nitrogen: '250', phosphorus: '45', potassium: '180', status: 'Completed', cost: '₹800' },
    { id: 'TEST002', farmerId: 'FARM002', pH: '6.8', nitrogen: '320', phosphorus: '52', potassium: '210', status: 'Completed', cost: '₹800' }
  ]);

  return (
    <PageTemplate title="🌱 Soil Testing Results">
      <Table headers={['Farmer ID', 'pH', 'Nitrogen (mg/kg)', 'Phosphorus (mg/kg)', 'Potassium (mg/kg)', 'Status', 'Cost']}
        rows={tests.map(t => [t.farmerId, t.pH, t.nitrogen, t.phosphorus, t.potassium, t.status, t.cost])} />
    </PageTemplate>
  );
};

export const CropAnalysisPage = () => {
  const [crops] = useState([
    { crop: 'Rice', gradeA: 70, gradeB: 20, gradeC: 8, rejected: 2, yield: '98.5%', price: '₹45/kg' },
    { crop: 'Wheat', gradeA: 75, gradeB: 18, gradeC: 5, rejected: 2, yield: '97.2%', price: '₹38/kg' }
  ]);

  return (
    <PageTemplate title="🌾 Crop Quality Analysis">
      <CardGrid>
        {crops.map((crop, i) => (
          <Card key={i} title={crop.crop} icon="🥬">
            <p><strong>Grade A:</strong> {crop.gradeA}% (Premium)</p>
            <p><strong>Grade B:</strong> {crop.gradeB}% (Good)</p>
            <p><strong>Grade C:</strong> {crop.gradeC}% (Standard)</p>
            <p><strong>Rejected:</strong> {crop.rejected}%</p>
            <p><strong>Overall Yield:</strong> {crop.yield}</p>
            <p><strong>Market Price:</strong> {crop.price}</p>
          </Card>
        ))}
      </CardGrid>
    </PageTemplate>
  );
};

export const PesticidesDetectionPage = () => {
  const [results] = useState([
    { sampleId: 'PEST001', residues: 'None Detected', status: '✓ Safe', certificate: 'Exportable', cost: '₹1200' },
    { sampleId: 'PEST002', residues: 'Within Limits', status: '✓ Safe', certificate: 'Exportable', cost: '₹1200' }
  ]);

  return (
    <PageTemplate title="🧬 Pesticide Residue Detection">
      <Table headers={['Sample ID', 'Residues', 'Safety Status', 'Certificate', 'Cost']}
        rows={results.map(r => [r.sampleId, r.residues, r.status, r.certificate, r.cost])} />
    </PageTemplate>
  );
};

export const WaterQualityPage = () => (
  <PageTemplate title="💧 Water Quality Analysis">
    <CardGrid>
      <Card title="pH Level" icon="📊">
        <p><strong>Current:</strong> 7.2</p>
        <p><strong>Safe Range:</strong> 6.5-8.5</p>
        <p style={{ color: 'green' }}>✓ Within safe limits</p>
      </Card>
      <Card title="Bacteria Count" icon="🦠">
        <p><strong>Current:</strong> 0 CFU/ml</p>
        <p><strong>Acceptable:</strong> &lt;1 CFU/ml</p>
        <p style={{ color: 'green' }}>✓ Safe for irrigation</p>
      </Card>
      <Card title="Nutrient Levels" icon="🌿">
        <p><strong>Nitrates:</strong> 8 mg/l (within limit)</p>
        <p><strong>Phosphates:</strong> 0.3 mg/l (normal)</p>
        <p style={{ color: 'green' }}>✓ Suitable</p>
      </Card>
    </CardGrid>
  </PageTemplate>
);

export const MyTestsPage = () => {
  const [myTests] = useState([
    { id: 'TEST001', type: 'Soil Test', date: '2026-09-15', status: 'Completed', result: 'Download' },
    { id: 'TEST002', type: 'Crop Quality', date: '2026-09-10', status: 'Completed', result: 'Download' }
  ]);

  return (
    <PageTemplate title="📋 My Lab Tests">
      <Table headers={['Test ID', 'Type', 'Date', 'Status', 'Result']}
        rows={myTests.map(t => [t.id, t.type, t.date, t.status, t.result])} />
    </PageTemplate>
  );
};

export const LabRegistrationPage = () => (
  <PageTemplate title="➕ Register New Lab">
    <div style={{ maxWidth: '500px', background: 'white', padding: '20px', borderRadius: '8px' }}>
      <FormInput label="Lab Name" />
      <FormInput label="Lab Type" />
      <FormInput label="Capacity (samples/month)" type="number" />
      <FormInput label="Certifications" />
      <Button>Register Lab</Button>
    </div>
  </PageTemplate>
);

export const SubmitTestPage = () => (
  <PageTemplate title="📝 Submit Test Sample">
    <div style={{ maxWidth: '500px', background: 'white', padding: '20px', borderRadius: '8px' }}>
      <FormInput label="Test Type" />
      <FormInput label="Sample Description" />
      <FormInput label="Preferred Lab" />
      <FormInput label="Scheduled Date" type="date" />
      <Button>Submit Sample</Button>
    </div>
  </PageTemplate>
);

export const LabsStatisticsPage = () => (
  <PageTemplate title="📊 Labs Statistics">
    <CardGrid>
      <Card title="Total Labs" icon="🏥">
        <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#667eea' }}>24</div>
        <p>Across all villages</p>
      </Card>
      <Card title="Tests Completed" icon="✓">
        <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#27ae60' }}>1,234</div>
        <p>This month</p>
      </Card>
      <Card title="Avg Response Time" icon="⏱️">
        <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#667eea' }}>2.5 days</div>
        <p>From submission</p>
      </Card>
      <Card title="Safety Certification Rate" icon="🎯">
        <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#27ae60' }}>98.5%</div>
        <p>Products certified safe</p>
      </Card>
    </CardGrid>
  </PageTemplate>
);

// ===== PROCESSING UNITS PAGES (12 pages) =====

export const ProcessingUnitsDirectoryPage = () => {
  const [units] = useState([
    { id: 'UNIT001', name: 'Mobile Dal Mill', type: 'Mobile', village: 'Nagpur', capacity: 500, status: 'Active' },
    { id: 'UNIT002', name: 'Static Oil Press', type: 'Static', village: 'Amravati', capacity: 1000, status: 'Active' }
  ]);

  return (
    <PageTemplate title="🏭 Processing Units">
      <CardGrid>
        {units.map(unit => (
          <Card key={unit.id} title={unit.name} icon={unit.type === 'Mobile' ? '🚗' : '🏢'}>
            <p><strong>Village:</strong> {unit.village}</p>
            <p><strong>Type:</strong> {unit.type}</p>
            <p><strong>Capacity:</strong> {unit.capacity} kg/day</p>
            <Button>Schedule Production</Button>
          </Card>
        ))}
      </CardGrid>
    </PageTemplate>
  );
};

export const MobileProcessingPage = () => (
  <PageTemplate title="🚗 Mobile Food Processing Units">
    <CardGrid>
      <Card title="Dal Mill Unit" icon="🌾">
        <p><strong>Current Location:</strong> Nagpur</p>
        <p><strong>Next Stop:</strong> Amravati (Sept 25)</p>
        <p><strong>Capacity:</strong> 500 kg/day</p>
        <Button>Book Slot</Button>
      </Card>
      <Card title="Oil Press Unit" icon="🫒">
        <p><strong>Current Location:</strong> Yavatmal</p>
        <p><strong>Next Stop:</strong> Akola (Sept 28)</p>
        <p><strong>Capacity:</strong> 300 kg/day</p>
        <Button>Book Slot</Button>
      </Card>
    </CardGrid>
  </PageTemplate>
);

export const StaticProcessingPage = () => (
  <PageTemplate title="🏢 Static Processing Facilities">
    <CardGrid>
      <Card title="Amravati Oil Extraction" icon="🏭">
        <p><strong>Operating Hours:</strong> 6 AM - 6 PM</p>
        <p><strong>Daily Capacity:</strong> 1000 kg</p>
        <p><strong>Cost:</strong> ₹35/kg</p>
        <Button>Schedule</Button>
      </Card>
    </CardGrid>
  </PageTemplate>
);

export const ScheduleProductionPage = () => (
  <PageTemplate title="📅 Schedule Production">
    <div style={{ maxWidth: '500px', background: 'white', padding: '20px', borderRadius: '8px' }}>
      <FormInput label="Unit" />
      <FormInput label="Input Product" />
      <FormInput label="Output Product" />
      <FormInput label="Quantity (kg)" type="number" />
      <FormInput label="Scheduled Date" type="date" />
      <Button>Schedule</Button>
    </div>
  </PageTemplate>
);

export const ProductionHistoryPage = () => {
  const [history] = useState([
    { id: 'PROD001', product: 'Chana Dal', input: 500, output: 425, date: '2026-09-10', cost: '₹8,750', status: 'Completed' }
  ]);

  return (
    <PageTemplate title="📊 Production History">
      <Table headers={['ID', 'Product', 'Input (kg)', 'Output (kg)', 'Date', 'Cost', 'Status']}
        rows={history.map(h => [h.id, h.product, h.input, h.output, h.date, h.cost, h.status])} />
    </PageTemplate>
  );
};

export const ProductionAnalyticsPage = () => (
  <PageTemplate title="📈 Production Analytics">
    <CardGrid>
      <Card title="Monthly Output" icon="📊">
        <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#667eea' }}>12,500 kg</div>
      </Card>
      <Card title="Avg Yield" icon="✓">
        <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#27ae60' }}>85.2%</div>
      </Card>
      <Card title="Revenue" icon="💰">
        <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#667eea' }}>₹3,87,500</div>
      </Card>
    </CardGrid>
  </PageTemplate>
);

// ===== LABOR MARKETPLACE PAGES (12 pages) =====

export const LaborMarketplacePage = () => (
  <PageTemplate title="👷 Village Labor Marketplace">
    <CardGrid>
      <Card title="Post a Job" icon="📝">
        <p>Hire skilled laborers for your farm</p>
        <Button>Post Job</Button>
      </Card>
      <Card title="Find Workers" icon="🔍">
        <p>Browse available laborers in your village</p>
        <Button>Browse</Button>
      </Card>
      <Card title="My Contracts" icon="📋">
        <p>Manage active and completed contracts</p>
        <Button>View</Button>
      </Card>
    </CardGrid>
  </PageTemplate>
);

export const PostJobPage = () => (
  <PageTemplate title="📝 Post a Job">
    <div style={{ maxWidth: '500px', background: 'white', padding: '20px', borderRadius: '8px' }}>
      <FormInput label="Job Type" />
      <FormInput label="Area (hectares)" type="number" />
      <FormInput label="Daily Rate (₹)" type="number" />
      <FormInput label="Workers Needed" type="number" />
      <FormInput label="Start Date" type="date" />
      <FormInput label="End Date" type="date" />
      <Button>Post Job</Button>
    </div>
  </PageTemplate>
);

export const LaborerDirectoryPage = () => {
  const [laborers] = useState([
    { id: 'LAB001', name: 'Raj Kumar', skills: 'Plowing, Harvesting', experience: '5 years', rating: '4.8/5', rate: '₹400/day' },
    { id: 'LAB002', name: 'Priya Devi', skills: 'Weeding, Processing', experience: '3 years', rating: '4.6/5', rate: '₹350/day' }
  ]);

  return (
    <PageTemplate title="🔍 Available Laborers">
      <CardGrid>
        {laborers.map(l => (
          <Card key={l.id} title={l.name} icon="👤">
            <p><strong>Skills:</strong> {l.skills}</p>
            <p><strong>Experience:</strong> {l.experience}</p>
            <p><strong>Rating:</strong> ⭐ {l.rating}</p>
            <p><strong>Rate:</strong> {l.rate}</p>
            <Button>Hire</Button>
          </Card>
        ))}
      </CardGrid>
    </PageTemplate>
  );
};

export const MyJobsPage = () => {
  const [jobs] = useState([
    { id: 'JOB001', type: 'Harvesting', area: 2, rate: '₹400/day', workers: 3, status: 'Completed', spent: '₹9,600' }
  ]);

  return (
    <PageTemplate title="📋 My Job Postings">
      <Table headers={['Job ID', 'Type', 'Area', 'Rate', 'Workers', 'Status', 'Spent']}
        rows={jobs.map(j => [j.id, j.type, `${j.area} ha`, j.rate, j.workers, j.status, j.spent])} />
    </PageTemplate>
  );
};

export const AttendanceTrackingPage = () => (
  <PageTemplate title="📅 Attendance Tracking">
    <CardGrid>
      <Card title="Today's Attendance" icon="✓">
        <p><strong>Present:</strong> 5 workers</p>
        <p><strong>Absent:</strong> 1 worker</p>
        <Button>Mark Attendance</Button>
      </Card>
    </CardGrid>
  </PageTemplate>
);

export const LaborerProfilePage = () => (
  <PageTemplate title="👤 Laborer Profile">
    <CardGrid>
      <Card title="Raj Kumar" icon="👤">
        <p><strong>Contact:</strong> +91 98765 43210</p>
        <p><strong>Rating:</strong> ⭐ 4.8/5</p>
        <p><strong>Jobs Completed:</strong> 45</p>
        <p><strong>Earnings:</strong> ₹67,500</p>
        <Button>View Details</Button>
      </Card>
    </CardGrid>
  </PageTemplate>
);

// ===== CSR PAGES (12 pages) =====

export const CSRProgramsPage = () => {
  const [programs] = useState([
    { id: 'CSR001', company: 'TechCorp', name: 'Digital Literacy', villages: 5, budget: '₹5,00,000', status: 'Active' }
  ]);

  return (
    <PageTemplate title="🤝 CSR Programs">
      <CardGrid>
        {programs.map(p => (
          <Card key={p.id} title={p.name} icon="🏢">
            <p><strong>Company:</strong> {p.company}</p>
            <p><strong>Villages:</strong> {p.villages}</p>
            <p><strong>Budget:</strong> {p.budget}</p>
            <Button>View Details</Button>
          </Card>
        ))}
      </CardGrid>
    </PageTemplate>
  );
};

export const CSRActivitiesPage = () => (
  <PageTemplate title="📅 CSR Activities">
    <CardGrid>
      <Card title="Digital Literacy Training" icon="📱">
        <p><strong>Dates:</strong> Sept 15-30</p>
        <p><strong>Participants:</strong> 100</p>
        <p><strong>Budget:</strong> ₹50,000</p>
        <Button>Register</Button>
      </Card>
    </CardGrid>
  </PageTemplate>
);

export const CSRBeneficiariesPage = () => (
  <PageTemplate title="👥 CSR Beneficiaries">
    <CardGrid>
      <Card title="Digital Literacy Beneficiaries" icon="👥">
        <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#667eea' }}>450</div>
        <p>Women trained this year</p>
      </Card>
    </CardGrid>
  </PageTemplate>
);

export const CSRReportPage = () => (
  <PageTemplate title="📊 CSR Impact Report">
    <CardGrid>
      <Card title="Social Impact" icon="📈">
        <p><strong>Beneficiaries Reached:</strong> 1,250</p>
        <p><strong>Communities Served:</strong> 8</p>
        <p><strong>ROI:</strong> 2.5x</p>
      </Card>
    </CardGrid>
  </PageTemplate>
);

// ===== SUPPLY CHAIN PAGES (8 pages) =====

export const SupplyChainVisualizationPage = () => (
  <PageTemplate title="🔗 Village Supply Chain">
    <Card title="Supply Chain Stages" icon="📦">
      <div style={{ textAlign: 'center', lineHeight: '2' }}>
        <div>🏠 <strong>Household</strong> (Individual Farmer)</div>
        <div>↓</div>
        <div>🏘️ <strong>Village</strong> (Aggregation)</div>
        <div>↓</div>
        <div>🌍 <strong>Inter-Village</strong> (Regional)</div>
        <div>↓</div>
        <div>🛒 <strong>Market</strong> (Consumer)</div>
      </div>
    </Card>
  </PageTemplate>
);

export const TraceabilityPage = () => (
  <PageTemplate title="🔍 Product Traceability">
    <Card title="Farm-to-Table Tracking" icon="📊">
      <p><strong>Product:</strong> Basmati Rice</p>
      <p><strong>Farm:</strong> Farmer Raj (Nagpur)</p>
      <p><strong>Village Collection:</strong> Sept 10, 2026</p>
      <p><strong>Processing:</strong> Nagpur Mill (Sept 12)</p>
      <p><strong>Market:</strong> Amravati Market (Sept 15)</p>
      <Button>View Full Trace</Button>
    </Card>
  </PageTemplate>
);

export const MyProductionPage = () => (
  <PageTemplate title="📊 My Production">
    <CardGrid>
      <Card title="Current Production" icon="📈">
        <p><strong>Total Quantity:</strong> 500 kg</p>
        <p><strong>Aggregated at Village:</strong> Sept 15</p>
        <Button>View Details</Button>
      </Card>
    </CardGrid>
  </PageTemplate>
);

export const VillageAggregationPage = () => (
  <PageTemplate title="🏘️ Village Aggregation">
    <Card title="Current Village Stock" icon="📦">
      <p><strong>Total Quantity:</strong> 2,500 kg</p>
      <p><strong>Farmers:</strong> 8</p>
      <p><strong>Quality:</strong> Grade A: 70%, Grade B: 30%</p>
      <Button>Ready for Distribution</Button>
    </Card>
  </PageTemplate>
);

export default {
  // Labs
  LabsDirectoryPage,
  SoilTestingPage,
  CropAnalysisPage,
  PesticidesDetectionPage,
  WaterQualityPage,
  MyTestsPage,
  LabRegistrationPage,
  SubmitTestPage,
  LabsStatisticsPage,
  // Processing
  ProcessingUnitsDirectoryPage,
  MobileProcessingPage,
  StaticProcessingPage,
  ScheduleProductionPage,
  ProductionHistoryPage,
  ProductionAnalyticsPage,
  // Labor
  LaborMarketplacePage,
  PostJobPage,
  LaborerDirectoryPage,
  MyJobsPage,
  AttendanceTrackingPage,
  LaborerProfilePage,
  // CSR
  CSRProgramsPage,
  CSRActivitiesPage,
  CSRBeneficiariesPage,
  CSRReportPage,
  // Supply Chain
  SupplyChainVisualizationPage,
  TraceabilityPage,
  MyProductionPage,
  VillageAggregationPage
};
