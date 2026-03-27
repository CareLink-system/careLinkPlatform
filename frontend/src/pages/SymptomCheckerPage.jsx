import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { analyzeSymptoms } from '../api/symptomChecker';

// --- Auth Hook Fallback ---
let useAuth;
try {
  useAuth = require('../hooks/useAuth').default;
} catch (e) {
  useAuth = null;
}

const SYMPTOM_OPTIONS = [
  { value: 'itching', label: 'Itching' },
  { value: 'skin_rash', label: 'Skin Rash' },
  { value: 'continuous_sneezing', label: 'Continuous Sneezing' },
  { value: 'shivering', label: 'Shivering' },
  { value: 'chills', label: 'Chills' },
  { value: 'joint_pain', label: 'Joint Pain' },
  { value: 'stomach_pain', label: 'Stomach Pain' },
  { value: 'acidity', label: 'Acidity' },
  { value: 'vomiting', label: 'Vomiting' },
  { value: 'fatigue', label: 'Fatigue' },
  { value: 'weight_loss', label: 'Weight Loss' },
  { value: 'lethargy', label: 'Lethargy' },
  { value: 'cough', label: 'Cough' },
  { value: 'high_fever', label: 'High Fever' },
  { value: 'headache', label: 'Headache' },
  { value: 'yellowish_skin', label: 'Yellowish Skin' },
  { value: 'dark_urine', label: 'Dark Urine' },
  { value: 'nausea', label: 'Nausea' },
  { value: 'loss_of_appetite', label: 'Loss of Appetite' },
  { value: 'chest_pain', label: 'Chest Pain' }
];

export default function SymptomCheckerPage() {
  const auth = useAuth ? useAuth() : null;
  const userId = auth?.user?.id || localStorage.getItem('user_id') || 'anonymous';

  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [animateResult, setAnimateResult] = useState(false);

  useEffect(() => {
    if (result) {
      setTimeout(() => setAnimateResult(true), 100);
    } else {
      setAnimateResult(false);
    }
  }, [result]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (selectedSymptoms.length === 0) {
      setError("Please select at least one symptom.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const symptomsArray = selectedSymptoms.map(s => s.value);

    try {
      const data = await analyzeSymptoms({ user_id: userId, symptoms: symptomsArray });
      setResult(data);
    } catch (err) {
      setError(err.message || 'Failed to analyze symptoms. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // Premium react-select styling
  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      minHeight: '56px',
      backgroundColor: 'transparent',
      borderColor: state.isFocused ? '#4B9AA8' : '#e2e8f0',
      boxShadow: state.isFocused ? '0 0 0 3px rgba(75, 154, 168, 0.15)' : 'none',
      '&:hover': { borderColor: state.isFocused ? '#4B9AA8' : '#cbd5e1' },
      borderRadius: '1rem',
      padding: '4px 8px',
      transition: 'all 0.2s ease',
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: '#f0f6f7',
      borderRadius: '8px',
      padding: '2px 4px',
      margin: '4px',
      border: '1px solid #d4e7ea',
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: '#0d4f5a',
      fontWeight: '600',
      fontSize: '0.875rem',
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      color: '#4B9AA8',
      borderRadius: '6px',
      ':hover': {
        backgroundColor: '#4B9AA8',
        color: 'white',
      },
    }),
    placeholder: (provided) => ({
      ...provided,
      color: '#94a3b8',
      fontSize: '0.95rem',
    }),
  };

  const confidencePercentage = result ? Math.round((result.confidence ?? 0) * 100) : 0;
  const circleCircumference = 2 * Math.PI * 28; // radius is 28
  const strokeDashoffset = circleCircumference - (confidencePercentage / 100) * circleCircumference;

  return (
    <div className="min-h-full py-8 px-4 sm:px-6 lg:px-8 bg-slate-50/50">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="group relative overflow-hidden bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/60 transition-all hover:shadow-md">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-gradient-to-br from-[#4B9AA8]/20 to-transparent rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity duration-700"></div>
          
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-6">
            <div className="flex-shrink-0 bg-gradient-to-br from-[#4B9AA8]/10 to-[#4B9AA8]/5 p-4 rounded-2xl border border-[#4B9AA8]/20 shadow-inner">
              <svg className="w-8 h-8 text-[#4B9AA8]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">AI Diagnostic Assistant</h1>
              <p className="text-slate-500 mt-2 text-sm sm:text-base leading-relaxed max-w-2xl">Enter your symptoms below. Our advanced model will cross-reference clinical datasets to provide a preliminary assessment.</p>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">
            <div className="space-y-3">
              <label className="block text-sm font-bold text-slate-800 uppercase tracking-wide">
                What are you experiencing? <span className="text-rose-500 ml-1">*</span>
              </label>
              <Select
                isMulti
                name="symptoms"
                options={SYMPTOM_OPTIONS}
                className="basic-multi-select"
                classNamePrefix="select"
                placeholder="Search and select symptoms (e.g. fever, headache)..."
                onChange={setSelectedSymptoms}
                value={selectedSymptoms}
                styles={customStyles}
              />
            </div>

            {error && (
              <div className="animate-in fade-in slide-in-from-top-2 p-4 rounded-2xl bg-rose-50 border border-rose-100 flex items-center gap-3 text-rose-700">
                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                <span className="text-sm font-semibold">{error}</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-slate-100">
              <div className="flex items-center gap-3 text-sm text-slate-500 bg-slate-50 px-4 py-2 rounded-full border border-slate-100 w-full sm:w-auto justify-center">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="font-medium">Patient ID: <span className="font-mono text-slate-700 ml-1">{userId}</span></span>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className={`w-full sm:w-auto relative group overflow-hidden px-8 py-3.5 rounded-2xl text-white font-bold tracking-wide transition-all duration-300 ${loading ? 'bg-slate-300 cursor-not-allowed' : 'bg-[#4B9AA8] shadow-[0_8px_20px_-6px_rgba(75,154,168,0.4)] hover:shadow-[0_12px_24px_-6px_rgba(75,154,168,0.5)] hover:-translate-y-0.5'}`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-3">
                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" /></svg>
                    Processing...
                  </span>
                ) : (
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    Generate Analysis
                    <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                  </span>
                )}
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></div>
              </button>
            </div>
          </form>
        </div>

        {/* Results Area */}
        {result && (
          <div className={`transition-all duration-700 ease-out transform ${animateResult ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            <div className="bg-gradient-to-b from-white to-slate-50/80 rounded-3xl shadow-xl border border-slate-200/80 overflow-hidden">
              
              {/* Results Header */}
              <div className="px-6 sm:px-8 py-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/50 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Assessment Complete</h2>
                </div>
                <span className="inline-flex items-center justify-center px-3.5 py-1.5 bg-amber-50 text-amber-700 text-xs font-bold uppercase tracking-widest rounded-full border border-amber-200/60 shadow-sm w-fit">
                  Preliminary Suggestion
                </span>
              </div>

              <div className="p-6 sm:p-8 space-y-8">
                {/* Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center transition-all hover:shadow-md">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Suspected Condition</span>
                    <span className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">{result.predicted_condition}</span>
                  </div>

                  <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center transition-all hover:shadow-md group">
                    <div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">AI Confidence Score</span>
                      <span className="text-4xl font-black text-[#4B9AA8]">{confidencePercentage}%</span>
                    </div>
                    <div className="relative w-20 h-20">
                       {/* Background Track */}
                       <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                          <circle cx="40" cy="40" r="28" stroke="#f1f5f9" strokeWidth="6" fill="none" />
                       </svg>
                       {/* Animated Progress */}
                       <svg className="absolute inset-0 w-full h-full transform -rotate-90 drop-shadow-md transition-all duration-1000 ease-out">
                          <circle 
                            cx="40" cy="40" r="28" 
                            stroke="#4B9AA8" strokeWidth="6" fill="none" 
                            strokeLinecap="round"
                            style={{
                              strokeDasharray: circleCircumference,
                              strokeDashoffset: animateResult ? strokeDashoffset : circleCircumference,
                              transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}
                          />
                       </svg>
                    </div>
                  </div>
                </div>

                {/* AI Guidance Box */}
                <div className="relative p-6 sm:p-8 bg-gradient-to-br from-[#4B9AA8]/5 to-[#4B9AA8]/10 rounded-2xl border border-[#4B9AA8]/20 shadow-inner">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <svg className="w-24 h-24 text-[#4B9AA8]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                  </div>
                  <div className="relative z-10 flex flex-col sm:flex-row gap-5 items-start">
                    <div className="flex-shrink-0 p-3 bg-white rounded-xl shadow-sm border border-[#4B9AA8]/10">
                      <svg className="w-6 h-6 text-[#4B9AA8]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#4B9AA8] uppercase tracking-widest mb-3">Medical Guidance</h3>
                      <p className="text-slate-700 leading-relaxed text-base sm:text-lg">{result.ai_feedback}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className="bg-slate-900 px-6 sm:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="text-center sm:text-left">
                  <span className="text-sm font-medium text-slate-400 block mb-1">Recommended Specialist</span>
                  <span className="text-xl sm:text-2xl font-bold text-white">{result.recommended_specialty || 'General Practitioner'}</span>
                </div>
                <button className="w-full sm:w-auto px-8 py-3.5 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-100 hover:scale-105 transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)] focus:ring-4 focus:ring-slate-700">
                  Book Appointment
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}