type PatientRecord = {
  id: string;
  name: string;
  dob: string;
  diagnosis: string;
  lastVisit: string;
};

// Static realistic sample EHR data (20 records)
const patients: PatientRecord[] = [
  { id: "P-00001", name: "Emily Johnson", dob: "1985-03-12", diagnosis: "Type 2 Diabetes Mellitus", lastVisit: "2025-10-15" },
  { id: "P-00002", name: "Michael Chen", dob: "1978-11-05", diagnosis: "Essential Hypertension", lastVisit: "2025-10-18" },
  { id: "P-00003", name: "Sarah Martinez", dob: "1992-07-21", diagnosis: "Seasonal Allergic Rhinitis", lastVisit: "2025-09-28" },
  { id: "P-00004", name: "James Anderson", dob: "1969-02-14", diagnosis: "Coronary Artery Disease", lastVisit: "2025-10-12" },
  { id: "P-00005", name: "Olivia Rodriguez", dob: "2001-05-30", diagnosis: "Generalized Anxiety Disorder", lastVisit: "2025-10-20" },
  { id: "P-00006", name: "Benjamin Clark", dob: "1983-12-09", diagnosis: "Chronic Low Back Pain", lastVisit: "2025-09-25" },
  { id: "P-00007", name: "Amelia Davis", dob: "1990-09-17", diagnosis: "Iron Deficiency Anemia", lastVisit: "2025-10-08" },
  { id: "P-00008", name: "William Thompson", dob: "1975-01-22", diagnosis: "Chronic Obstructive Pulmonary Disease", lastVisit: "2025-09-30" },
  { id: "P-00009", name: "Charlotte Nguyen", dob: "1988-04-03", diagnosis: "Migraine Without Aura", lastVisit: "2025-10-16" },
  { id: "P-00010", name: "Henry Wilson", dob: "1995-06-27", diagnosis: "Irritable Bowel Syndrome", lastVisit: "2025-10-22" },
  { id: "P-00011", name: "Ethan Brown", dob: "1981-10-19", diagnosis: "Mixed Hyperlipidemia", lastVisit: "2025-09-18" },
  { id: "P-00012", name: "Isabella Garcia", dob: "1972-02-28", diagnosis: "Osteoarthritis of Knee", lastVisit: "2025-10-05" },
  { id: "P-00013", name: "Lucas Miller", dob: "2000-01-11", diagnosis: "Attention Deficit Hyperactivity Disorder", lastVisit: "2025-10-14" },
  { id: "P-00014", name: "Mia Robinson", dob: "1993-08-04", diagnosis: "Primary Hypothyroidism", lastVisit: "2025-10-11" },
  { id: "P-00015", name: "Daniel Walker", dob: "1966-05-16", diagnosis: "Benign Prostatic Hyperplasia", lastVisit: "2025-09-22" },
  { id: "P-00016", name: "Ava Lewis", dob: "1998-12-02", diagnosis: "Polycystic Ovary Syndrome", lastVisit: "2025-10-19" },
  { id: "P-00017", name: "Matthew Hall", dob: "1979-03-07", diagnosis: "Gastroesophageal Reflux Disease", lastVisit: "2025-10-03" },
  { id: "P-00018", name: "Harper Young", dob: "1986-07-25", diagnosis: "Major Depressive Disorder", lastVisit: "2025-10-17" },
  { id: "P-00019", name: "Elijah King", dob: "1991-11-13", diagnosis: "Psoriasis Vulgaris", lastVisit: "2025-09-29" },
  { id: "P-00020", name: "Grace Adams", dob: "1984-04-08", diagnosis: "Fibromyalgia", lastVisit: "2025-10-21" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-gray-900">PulseGrid</h1>
            <p className="mt-1 text-sm text-gray-600">Electronic Health Records Management</p>
          </div>

          <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto" style={{ maxHeight: "600px" }}>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-slate-800 sticky top-0">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                      Patient ID
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                      Patient Name
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                      Date of Birth
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                      Diagnosis / Condition
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                      Last Visit Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {patients.map((patient) => (
                    <tr key={patient.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                        {patient.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {patient.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {patient.dob}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {patient.diagnosis}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {patient.lastVisit}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bg-slate-50 px-6 py-3 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-slate-700">
                  Showing <span className="font-medium">20</span> of <span className="font-medium">20</span> results
                </div>
                <div className="text-xs text-slate-500">
                  Last updated: {new Date().toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
