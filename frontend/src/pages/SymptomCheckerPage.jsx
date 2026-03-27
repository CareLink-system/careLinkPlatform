import React, { useState } from 'react';
import Select from 'react-select';
import { analyzeSymptoms } from '../api/symptomChecker';
import { useAuth } from '../features/auth/context/AuthContext';

// --- REPLACE THESE WITH YOUR ACTUAL DATASET FEATURES ---
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
  const { user, isAuthenticated } = useAuth();
  const userId = user?.id ?? null;
  const canSubmit = Boolean(isAuthenticated && userId);

  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!canSubmit) {
      setError('You must be logged in to submit symptom analysis.');
      return;
    }

    if (selectedSymptoms.length === 0) {
      setError("Please select at least one symptom.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    // Extract just the string values to send to the backend
    const symptomsArray = selectedSymptoms.map(s => s.value);

    try {
      // Send as 'symptoms' array instead of 'description' string
      const data = await analyzeSymptoms({ user_id: userId, symptoms: symptomsArray });
      setResult(data);
    } catch (err) {
      setError(err.message || 'Failed to analyze symptoms. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // Modern styling for the react-select component to match CareLink
  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      borderColor: state.isFocused ? '#4B9AA8' : '#e5e7eb',
      boxShadow: state.isFocused ? '0 0 0 1px #4B9AA8' : 'none',
      '&:hover': { borderColor: '#4B9AA8' },
      padding: '4px',
      borderRadius: '0.5rem'
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: '#e6f0f2',
      borderRadius: '4px'
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: '#06454f',
      fontWeight: '500'
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      color: '#4B9AA8',
      ':hover': {
        backgroundColor: '#4B9AA8',
        color: 'white',
      },
    }),
  };

  return (
    <div className="max-w-4xl mx-auto p-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-6">
        <div className="flex items-center gap-4">
          <div className="bg-[#4B9AA8]/10 p-3 rounded-xl border border-[#4B9AA8]/20">
            <svg className="w-8 h-8 text-[#4B9AA8]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">AI Symptom Checker</h1>
            <p className="text-slate-500 mt-1">Select your symptoms for an AI-powered preliminary assessment.</p>
          </div>
        </div>
      </div>

      {/* Form Area */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              What are you experiencing? <span className="text-red-500">*</span>
            </label>
            <Select
              isMulti
              name="symptoms"
              options={SYMPTOM_OPTIONS}
              className="basic-multi-select"
              classNamePrefix="select"
              placeholder="Search and select symptoms..."
              onChange={setSelectedSymptoms}
              value={selectedSymptoms}
              styles={customStyles}
            />
            <p className="text-xs text-slate-400 mt-2">You can search by typing. Select all that apply.</p>
          </div>

          {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm font-medium">{error}</div>}

          {!canSubmit && (
            <div className="p-4 bg-amber-50 text-amber-700 rounded-xl border border-amber-200 text-sm font-medium">
              You are not authenticated. Please log in to run symptom analysis.
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <div className="text-sm text-slate-500 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              Patient ID: <span className="font-mono text-slate-700">{userId ?? 'Not available'}</span>
            </div>
            
            <button
              type="submit"
              disabled={loading || !canSubmit}
              className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-white font-semibold transition-all ${(loading || !canSubmit) ? 'bg-[#4B9AA8]/70 cursor-not-allowed' : 'bg-[#4B9AA8] hover:bg-[#3d7f8b] shadow-md shadow-[#4B9AA8]/20 hover:shadow-lg hover:shadow-[#4B9AA8]/30 hover:-translate-y-0.5'}`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" /></svg>
                  Analyzing Data...
                </>
              ) : (
                'Run Assessment'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Results Area */}
      {result && (
        <div className="mt-8 bg-gradient-to-br from-white to-[#f8fbfc] p-8 rounded-3xl shadow-lg border border-[#e6f0f2] animate-in slide-in-from-bottom-4 duration-500">
          
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-800">Assessment Complete</h2>
            <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full border border-amber-200">Preliminary Suggestion Only</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="p-5 bg-white rounded-2xl shadow-sm border border-slate-100">
              <div className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-1">Suspected Condition</div>
              <div className="text-2xl font-bold text-slate-800">{result.predicted_condition}</div>
            </div>

            <div className="p-5 bg-white rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center">
              <div>
                <div className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-1">AI Confidence</div>
                <div className="text-2xl font-bold text-[#4B9AA8]">{Math.round((result.confidence ?? 0) * 100)}%</div>
              </div>
              <div className="w-16 h-16 rounded-full border-4 border-[#4B9AA8]/20 flex items-center justify-center relative">
                 <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                    <circle cx="30" cy="30" r="28" stroke="currentColor" strokeWidth="4" fill="none" className="text-[#4B9AA8]" strokeDasharray={`${Math.round((result.confidence ?? 0) * 100) * 1.75} 200`} strokeLinecap="round" />
                 </svg>
              </div>
            </div>
          </div>

          <div className="p-6 bg-[#4B9AA8]/5 rounded-2xl border border-[#4B9AA8]/20 mb-6">
            <div className="flex items-start gap-4">
              <div className="mt-1 p-2 bg-white rounded-lg shadow-sm">
                <svg className="w-6 h-6 text-[#4B9AA8]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div>
                <div className="text-sm font-medium text-[#4B9AA8] uppercase tracking-wider mb-2">Medical Guidance</div>
                <p className="text-slate-700 leading-relaxed text-lg">{result.ai_feedback}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-5 bg-slate-800 rounded-2xl text-white">
            <div>
              <div className="text-sm text-slate-400 mb-1">Recommended Specialist</div>
              <div className="text-xl font-bold">{result.recommended_specialty || 'General Practitioner'}</div>
            </div>
            <button className="px-5 py-2.5 bg-white text-slate-800 font-bold rounded-xl hover:bg-slate-100 transition-colors shadow-sm">
              Find Doctors
            </button>
          </div>

        </div>
      )}
    </div>
  );
}