```ts
import {
    Activity,
    AlertTriangle,
    ArrowLeft,
    Banknote,
    Briefcase,
    Building2,
    Calendar,
    Camera,
    Clock,
    FastForward,
    FileText,
    Image as ImageIcon,
    Lightbulb,
    MapPin,
    Maximize2,
    PieChart,
    TrendingUp,
    Users,
    X
} from 'lucide-react';
import { useState } from 'react';

// --- MOCK DATA BASED ON YOUR PLAN ---
const PROJECT_DATA = {
  id: "PROJ-2024-001",
  title: "Rehabilitation of Farm-to-Market Road: Sitio Kawayan to Centro",
  category: "Infrastructure",
  project_type_name: "Farm-to-Market Road",
  status: "Ongoing",
  description: "Concreting of 5.2km earth road to improve transport of agricultural products from highland sitios to the barangay center. Includes construction of 2 box culverts and slope protection.",
  start_date: "2024-01-15",
  end_date: "2024-08-30",
  budget: 12500000,
  completion_percentage: 45.5, // Overall actual
  project_manager_team: {
    agency: "Provincial Engineering Office (PEO)"
  },
  project_sitios: [
    { id: 1, sitio_name: "Sitio Kawayan", barangay: "Brgy. San Jose", municipality: "Esperanza", beneficiaries_target: 120, focal_person: "Kag. Juan Dela Cruz", priority: "High" },
    { id: 2, sitio_name: "Sitio Upper", barangay: "Brgy. San Jose", municipality: "Esperanza", beneficiaries_target: 85, focal_person: "Mr. Pedro Penduko", priority: "Medium" },
    { id: 3, sitio_name: "Purok 4", barangay: "Brgy. Centro", municipality: "Esperanza", beneficiaries_target: 250, focal_person: "Mrs. Maria Clara", priority: "High" }
  ],
  funding_sources: [
    { source_name: "Provincial LDF 2024", type: "Provincial", amount: 10000000, percentage: 80 },
    { source_name: "National DA Counterpart", type: "National", amount: 2500000, percentage: 20 }
  ],
  budget_components: [
    { component_name: "Materials & Supplies", amount: 7500000, percentage: 60 },
    { component_name: "Labor Cost", amount: 3750000, percentage: 30 },
    { component_name: "Equipment Rental", amount: 1000000, percentage: 8 },
    { component_name: "Admin & Overhead", amount: 250000, percentage: 2 }
  ],
  employment_generated: {
    male: 45,
    female: 12,
    total: 57
  },
  // Enhanced with Status Summary fields (Issues, Recommendations, Catch-up Plan)
  monthly_monitoring: [
    {
      month: "Jan 2024",
      plan_physical: 5, actual_physical: 5,
      plan_financial: 1875000, actual_financial: 1875000,
      status: "On Track",
      remarks: "Mobilization of equipment and initial clearing operations commenced. Site office established.",
      issues: "Minor delay in equipment mobilization due to permit approval process at the municipal level.",
      recommendations: "Coordinate early with LGU for faster permit processing for future equipment deployment.",
      catch_up_plan: "No major catch-up needed; extend work hours slightly to finalize clearing.",
      images: [1, 2]
    },
    {
      month: "Feb 2024",
      plan_physical: 15, actual_physical: 14,
      plan_financial: 1250000, actual_financial: 1200000,
      status: "Slight Delay",
      remarks: "Subgrade preparation underway. Slight delay due to unseasonal rains affecting the lower section.",
      issues: "Unseasonal heavy rains caused softness in the subgrade at Station 0+200.",
      recommendations: "Install temporary drainage canals immediately to divert runoff water.",
      catch_up_plan: "Deploy additional compactors once weather clears to speed up subgrade preparation.",
      images: [1, 2, 3]
    },
    {
      month: "Mar 2024",
      plan_physical: 30, actual_physical: 28,
      plan_financial: 2000000, actual_financial: 1500000,
      status: "Delayed",
      remarks: "Installation of Box Culvert #1. Delay persists due to supply chain issues with cement delivery.",
      issues: "Critical shortage of cement supply from the main contractor's supplier.",
      recommendations: "Source cement from alternative suppliers in the neighboring province to avoid work stoppage.",
      catch_up_plan: "Schedule double shifts for concreting works as soon as materials arrive.",
      images: [1]
    },
    {
      month: "Apr 2024",
      plan_physical: 45, actual_physical: 45.5,
      plan_financial: 2500000, actual_financial: 2800000,
      status: "On Track",
      remarks: "Catch-up plan implemented. Concreting of Station 0+000 to 0+500 completed. Slope protection started.",
      issues: "Minor slope erosion observed near the box culvert site.",
      recommendations: "Reinforce slope protection with grouted riprap immediately.",
      catch_up_plan: "Successfully implemented previous catch-up plan; project is back on schedule.",
      images: [1, 2, 3, 4]
    },
    {
      month: "May 2024",
      plan_physical: 60, actual_physical: null,
      plan_financial: 1500000, actual_financial: null,
      status: "Planned",
      remarks: "Scheduled for next phase of concreting and Box Culvert #2 installation.",
      issues: null,
      recommendations: null,
      catch_up_plan: null,
      images: []
    },
    {
      month: "Jun 2024",
      plan_physical: 80, actual_physical: null,
      plan_financial: 1500000, actual_financial: null,
      status: "Planned",
      remarks: "Target substantial completion of roadway.",
      issues: null,
      recommendations: null,
      catch_up_plan: null,
      images: []
    }
  ]
};

// --- UTILITY COMPONENTS ---

const Card = ({ children, className = "", onClick }) => (
  <div
    onClick={onClick}
    className={`bg-white rounded-xl border border-slate-200 shadow-sm ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''} ${className}`}
  >
    {children}
  </div>
);

const Badge = ({ children, type = "neutral" }) => {
  const styles = {
    neutral: "bg-slate-100 text-slate-700",
    success: "bg-emerald-100 text-emerald-700",
    warning: "bg-amber-100 text-amber-700",
    danger: "bg-rose-100 text-rose-700",
    blue: "bg-blue-100 text-blue-700",
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[type] || styles.neutral}`}>
      {children}
    </span>
  );
};

const SectionTitle = ({ icon: Icon, title }) => (
  <div className="flex items-center gap-2 mb-4">
    <div className="p-1.5 bg-blue-50 rounded-lg">
      <Icon className="w-4 h-4 text-blue-600" />
    </div>
    <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
  </div>
);

const ProgressBar = ({ value, max = 100, label, sublabel, color = "bg-blue-600" }) => (
  <div className="w-full">
    <div className="flex justify-between items-end mb-1">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <span className="text-sm font-bold text-slate-900">{value}% <span className="text-slate-400 font-normal text-xs">{sublabel}</span></span>
    </div>
    <div className="w-full bg-slate-100 rounded-full h-2.5">
      <div className={`h-2.5 rounded-full ${color}`} style={{ width: `${Math.min(value, 100)}%` }}></div>
    </div>
  </div>
);

// --- MODAL COMPONENT ---

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

// --- TAB COMPONENTS ---

const OverviewTab = ({ data }) => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    {/* Left Column: Description & Agency */}
    <div className="lg:col-span-2 space-y-6">
      <Card className="p-6">
        <SectionTitle icon={FileText} title="Project Scope" />
        <p className="text-slate-600 leading-relaxed mb-6">
          {data.description}
        </p>
        <div className="pt-6 border-t border-slate-100">
          <div>
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Implementing Agency</span>
            <div className="flex items-center gap-2 mt-1">
              <Building2 className="w-4 h-4 text-slate-400" />
              <span className="text-slate-700 font-medium">{data.project_manager_team.agency}</span>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <SectionTitle icon={Briefcase} title="Impact & Employment" />
        <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-slate-50 rounded-lg border border-slate-100">
                <div className="text-2xl font-bold text-slate-800">{data.employment_generated.total}</div>
                <div className="text-xs text-slate-500 uppercase font-medium mt-1">Total Jobs</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-100">
                <div className="text-2xl font-bold text-blue-700">{data.employment_generated.male}</div>
                <div className="text-xs text-blue-600 uppercase font-medium mt-1">Male</div>
            </div>
            <div className="text-center p-4 bg-pink-50 rounded-lg border border-pink-100">
                <div className="text-2xl font-bold text-pink-700">{data.employment_generated.female}</div>
                <div className="text-xs text-pink-600 uppercase font-medium mt-1">Female</div>
            </div>
        </div>
      </Card>
    </div>

    {/* Right Column: Key Metrics */}
    <div className="space-y-6">
      <Card className="p-6">
        <SectionTitle icon={Activity} title="Current Status" />
        <div className="space-y-6">
          <ProgressBar
            value={data.completion_percentage}
            label="Physical Completion"
            sublabel="Actual"
            color="bg-emerald-500"
          />
           <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-amber-800">Timeline Analysis</h4>
                  <p className="text-xs text-amber-700 mt-1">
                    Project is currently 2 days behind the planned schedule for this month.
                  </p>
                </div>
              </div>
           </div>
        </div>
      </Card>

      <Card className="p-6">
        <SectionTitle icon={Calendar} title="Duration" />
        <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <span className="text-sm text-slate-500">Start Date</span>
                <span className="text-sm font-medium text-slate-800">{data.start_date}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <span className="text-sm text-slate-500">Target Completion</span>
                <span className="text-sm font-medium text-slate-800">{data.end_date}</span>
            </div>
            <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">Total Duration</span>
                <span className="text-sm font-medium text-slate-800">228 Days</span>
            </div>
        </div>
      </Card>
    </div>
  </div>
);

const LocationsTab = ({ sites }) => (
  <Card className="overflow-hidden">
    <div className="p-6 border-b border-slate-100 flex justify-between items-center">
        <SectionTitle icon={MapPin} title="Involved Sitios & Beneficiaries" />
        <Badge type="blue">{sites.length} Sitios</Badge>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
          <tr>
            <th className="px-6 py-3 font-semibold">Sitio / Area</th>
            <th className="px-6 py-3 font-semibold">Location</th>
            <th className="px-6 py-3 font-semibold text-center">Beneficiaries</th>
            <th className="px-6 py-3 font-semibold">Focal Person</th>
            <th className="px-6 py-3 font-semibold text-center">Priority</th>
          </tr>
        </thead>
        <tbody>
          {sites.map((site) => (
            <tr key={site.id} className="border-b border-slate-50 hover:bg-slate-50/50">
              <td className="px-6 py-4 font-medium text-slate-900">{site.sitio_name}</td>
              <td className="px-6 py-4 text-slate-600">
                <div className="flex flex-col">
                    <span>{site.barangay}</span>
                    <span className="text-xs text-slate-400">{site.municipality}</span>
                </div>
              </td>
              <td className="px-6 py-4 text-center">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-medium">
                    <Users className="w-3 h-3" /> {site.beneficiaries_target}
                </span>
              </td>
              <td className="px-6 py-4 text-slate-600">{site.focal_person}</td>
              <td className="px-6 py-4 text-center">
                <Badge type={site.priority === "High" ? "danger" : "warning"}>{site.priority}</Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </Card>
);

const FinancialsTab = ({ data }) => {
    const formatCurrency = (amount) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);

    return (
        <div className="space-y-6">
            {/* Top Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6 bg-linear-to-br from-blue-600 to-blue-700 text-white border-none">
                    <div className="flex items-center gap-3 mb-2 opacity-90">
                        <Banknote className="w-5 h-5" />
                        <span className="font-medium">Total Allocation</span>
                    </div>
                    <div className="text-3xl font-bold tracking-tight">{formatCurrency(data.budget)}</div>
                    <div className="mt-4 pt-4 border-t border-blue-500/30 flex gap-4 text-sm opacity-90">
                        <div>
                            <span className="block text-blue-200 text-xs">Utilized</span>
                            <span className="font-semibold">₱5,625,000</span>
                        </div>
                        <div>
                            <span className="block text-blue-200 text-xs">Remaining</span>
                            <span className="font-semibold">₱6,875,000</span>
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <SectionTitle icon={PieChart} title="Funding Sources" />
                    <div className="space-y-4">
                        {data.funding_sources.map((source, idx) => (
                            <div key={idx} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-2 h-2 rounded-full ${source.type === 'National' ? 'bg-indigo-500' : 'bg-emerald-500'}`}></div>
                                    <div>
                                        <div className="text-sm font-medium text-slate-900">{source.source_name}</div>
                                        <div className="text-xs text-slate-500">{source.type} Gov't</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-semibold text-slate-900">{formatCurrency(source.amount)}</div>
                                    <div className="text-xs text-slate-500">{source.percentage}%</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            <Card className="p-6">
                <SectionTitle icon={TrendingUp} title="Budget Breakdown" />
                <div className="space-y-5">
                    {data.budget_components.map((comp, idx) => (
                         <div key={idx}>
                            <div className="flex justify-between items-end mb-1">
                                <span className="text-sm font-medium text-slate-700">{comp.component_name}</span>
                                <span className="text-sm text-slate-600">{formatCurrency(comp.amount)} <span className="text-xs text-slate-400">({comp.percentage}%)</span></span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2">
                                <div className="h-2 rounded-full bg-slate-600" style={{ width: `${comp.percentage}%` }}></div>
                            </div>
                         </div>
                    ))}
                </div>
            </Card>
        </div>
    );
};

const MonitoringTab = ({ data }) => {
    const [selectedReport, setSelectedReport] = useState(null);

    // Helper to determine status color
    const getStatusColor = (status) => {
        switch(status) {
            case "On Track": return "bg-emerald-500";
            case "Slight Delay": return "bg-amber-500";
            case "Delayed": return "bg-rose-500";
            default: return "bg-slate-300";
        }
    };

    const getStatusBadgeType = (status) => {
        switch(status) {
            case "On Track": return "success";
            case "Slight Delay": return "warning";
            case "Delayed": return "danger";
            default: return "neutral";
        }
    };

    const formatCurrency = (amount) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);

    return (
        <div className="relative">
            <div className="mb-6 flex items-center justify-between">
                 <SectionTitle icon={Activity} title="Monthly Progress Timeline" />
                 <div className="text-xs text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200">
                    Click a report card to view detailed documentation
                 </div>
            </div>

            <div className="space-y-8 relative pl-6 sm:pl-10 before:absolute before:inset-0 before:ml-6 sm:before:ml-10 before:w-0.5 before:-translate-x-1/2 before:bg-slate-200 before:content-['']">
                {data.monthly_monitoring.map((report, idx) => (
                    <div key={idx} className="relative group">
                        {/* Timeline Dot */}
                        <div className={`absolute top-6 -left-6 sm:-left-10 w-4 h-4 rounded-full border-4 border-white shadow-sm -translate-x-1/2 z-10 ${getStatusColor(report.status)}`} />

                        {/* Content Card */}
                        <Card
                          onClick={() => setSelectedReport(report)}
                          className="p-5 hover:border-blue-300 transition-all cursor-pointer relative overflow-hidden"
                        >
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h4 className="text-lg font-bold text-slate-900">{report.month}</h4>
                                        <Badge type={getStatusBadgeType(report.status)}>{report.status}</Badge>
                                    </div>
                                    <p className="text-slate-600 text-sm line-clamp-2 mb-4 max-w-xl">
                                        {report.remarks}
                                    </p>

                                    {/* Mini Stats Grid */}
                                    <div className="flex flex-wrap gap-4 text-sm">
                                        <div className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                            <span className="text-slate-500 block text-xs uppercase tracking-wider">Physical</span>
                                            <div className="font-semibold text-slate-800">
                                                {report.actual_physical !== null ? `${report.actual_physical}%` : 'TBD'}
                                                <span className="text-slate-400 font-normal"> / {report.plan_physical}%</span>
                                            </div>
                                        </div>
                                        <div className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                            <span className="text-slate-500 block text-xs uppercase tracking-wider">Financial Release</span>
                                            <div className="font-semibold text-slate-800">
                                                {report.actual_financial !== null ? formatCurrency(report.actual_financial) : 'TBD'}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Image Preview Bubbles */}
                                {report.images && report.images.length > 0 && (
                                    <div className="flex -space-x-3 self-start sm:self-center">
                                        {report.images.slice(0,3).map((_, i) => (
                                            <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-slate-400 shadow-sm">
                                                <ImageIcon className="w-4 h-4" />
                                            </div>
                                        ))}
                                        {report.images.length > 3 && (
                                            <div className="w-10 h-10 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-xs font-medium text-slate-600 shadow-sm">
                                                +{report.images.length - 3}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Hover Indicator */}
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-blue-500">
                                <Maximize2 className="w-5 h-5" />
                            </div>
                        </Card>
                    </div>
                ))}
            </div>

            {/* Detail Modal */}
            <Modal
                isOpen={!!selectedReport}
                onClose={() => setSelectedReport(null)}
                title={`Progress Report: ${selectedReport?.month}`}
            >
                {selectedReport && (
                    <div className="space-y-6">
                        {/* Status Banner */}
                        <div className={`p-4 rounded-xl border ${getStatusColor(selectedReport.status).replace('bg-', 'bg-opacity-10 bg-').replace('500', '50')} ${getStatusColor(selectedReport.status).replace('bg-', 'border-').replace('500', '200')}`}>
                            <div className="flex items-center gap-3">
                                <div className={`w-3 h-3 rounded-full ${getStatusColor(selectedReport.status)}`}></div>
                                <span className="font-semibold text-slate-900">{selectedReport.status}</span>
                                <span className="text-slate-500 text-sm">- {selectedReport.remarks}</span>
                            </div>
                        </div>

                        {/* Detailed Stats */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <h4 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                                    <Activity className="w-4 h-4 text-blue-600" /> Physical Progress
                                </h4>
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Planned</span>
                                        <span className="font-medium">{selectedReport.plan_physical}%</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Actual</span>
                                        <span className="font-bold text-slate-900">{selectedReport.actual_physical ?? '-'}%</span>
                                    </div>
                                    <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2">
                                        <div
                                            className="bg-blue-600 h-1.5 rounded-full"
                                            style={{ width: `${selectedReport.actual_physical || 0}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <h4 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                                    <Banknote className="w-4 h-4 text-emerald-600" /> Financial Releases
                                </h4>
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Planned</span>
                                        <span className="font-medium">{formatCurrency(selectedReport.plan_financial)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Actual</span>
                                        <span className="font-bold text-slate-900">{selectedReport.actual_financial ? formatCurrency(selectedReport.actual_financial) : '-'}</span>
                                    </div>
                                    <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2">
                                        <div
                                            className="bg-emerald-500 h-1.5 rounded-full"
                                            style={{ width: `${(selectedReport.actual_financial / selectedReport.plan_financial) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Status Summary (New Added Section) */}
                        { (selectedReport.issues || selectedReport.recommendations || selectedReport.catch_up_plan) && (
                           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {/* Issues */}
                              <div className="p-4 bg-rose-50 rounded-xl border border-rose-100">
                                  <h4 className="text-sm font-semibold text-rose-800 mb-2 flex items-center gap-2">
                                      <AlertTriangle className="w-4 h-4" /> Issues Encountered
                                  </h4>
                                  <p className="text-xs text-rose-700 leading-relaxed">
                                      {selectedReport.issues || "No issues reported for this period."}
                                  </p>
                              </div>

                              {/* Recommendations */}
                              <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                                  <h4 className="text-sm font-semibold text-amber-800 mb-2 flex items-center gap-2">
                                      <Lightbulb className="w-4 h-4" /> Recommendations
                                  </h4>
                                  <p className="text-xs text-amber-700 leading-relaxed">
                                      {selectedReport.recommendations || "No recommendations for this period."}
                                  </p>
                              </div>

                              {/* Catch-up Plan */}
                              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                                  <h4 className="text-sm font-semibold text-blue-800 mb-2 flex items-center gap-2">
                                      <FastForward className="w-4 h-4" /> Catch-up Plan
                                  </h4>
                                  <p className="text-xs text-blue-700 leading-relaxed">
                                      {selectedReport.catch_up_plan || "No catch-up plan required."}
                                  </p>
                              </div>
                           </div>
                        )}

                        {/* Site Documentation / Images */}
                        <div>
                            <h4 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                <Camera className="w-4 h-4 text-slate-600" /> Site Documentation
                            </h4>

                            {selectedReport.images && selectedReport.images.length > 0 ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {selectedReport.images.map((_, idx) => (
                                        <div key={idx} className="aspect-video bg-slate-100 rounded-lg border border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:bg-slate-200 transition-colors cursor-pointer group">
                                            <ImageIcon className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform" />
                                            <span className="text-xs font-medium">Image {idx + 1}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400 text-sm">
                                    No documentation images uploaded for this month.
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

// --- MAIN LAYOUT COMPONENT ---

export default function ProjectDetailView() {
  const [activeTab, setActiveTab] = useState("overview");

  const tabs = [
    { id: "overview", label: "Overview", icon: FileText },
    { id: "financials", label: "Financials", icon: Banknote },
    { id: "locations", label: "Sitios & Locations", icon: MapPin },
    { id: "monitoring", label: "Monthly Monitoring", icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-12">
      {/* Top Navigation / Breadcrumb Area */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 gap-4">
             <button className="p-2 -ml-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5" />
             </button>
             <div className="flex flex-col">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                    <span>Projects</span>
                    <span className="text-slate-300">/</span>
                    <span>{PROJECT_DATA.category}</span>
                    <span className="text-slate-300">/</span>
                    <span className="text-slate-800 font-medium">{PROJECT_DATA.id}</span>
                </div>
             </div>
             <div className="ml-auto flex items-center gap-3">
                <button className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-sm">
                    Edit Project
                </button>
                <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm shadow-blue-200">
                    Generate Report
                </button>
             </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Project Header Block */}
        <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="space-y-2 max-w-3xl">
                    <div className="flex items-center gap-3">
                        <Badge type="success">{PROJECT_DATA.status}</Badge>
                        <Badge type="blue">{PROJECT_DATA.project_type_name}</Badge>
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight leading-tight">
                        {PROJECT_DATA.title}
                    </h1>
                </div>
                <div className="flex flex-col items-end gap-1">
                     <span className="text-sm text-slate-500">Total Budget</span>
                     <span className="text-2xl font-bold text-slate-900">₱{(PROJECT_DATA.budget / 1000000).toFixed(2)}M</span>
                </div>
            </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-slate-200 mb-8">
            <nav className="flex space-x-8" aria-label="Tabs">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`
                                group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm gap-2
                                ${isActive
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                                }
                            `}
                        >
                            <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-500'}`} />
                            {tab.label}
                        </button>
                    )
                })}
            </nav>
        </div>

        {/* Tab Content */}
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            {activeTab === 'overview' && <OverviewTab data={PROJECT_DATA} />}
            {activeTab === 'financials' && <FinancialsTab data={PROJECT_DATA} />}
            {activeTab === 'locations' && <LocationsTab sites={PROJECT_DATA.project_sitios} />}
            {activeTab === 'monitoring' && <MonitoringTab data={PROJECT_DATA} />}
        </div>

      </main>
    </div>
  );
}
```
