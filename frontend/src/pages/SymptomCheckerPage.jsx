import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { analyzeSymptoms, getSymptomHistory } from '../api/symptomChecker';

// --- Auth Extraction ---
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
  
  // Robust User ID extraction for .NET / JWT setups
  const getUserId = () => {
    // First, try from useAuth hook (dynamic)
    if (auth?.user?.id) return auth.user.id;
    
    // Second, try from carelink.auth in localStorage (most reliable)
    try {
      const storedAuth = JSON.parse(localStorage.getItem('carelink.auth'));
      if (storedAuth?.user?.id) return storedAuth.user.id;
    } catch (e) {}
    
    // Fallback: check legacy user entry
    try {
      const localUser = JSON.parse(localStorage.getItem('user'));
      if (localUser?.id) return localUser.id;
    } catch (e) {}
    
    return localStorage.getItem('user_id') || 'unknown_user';
  };
  
  const userId = getUserId();

  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  
  // History State
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    if (userId !== 'unknown_user') {
      loadHistory();
    } else {
      setLoadingHistory(false);
    }
  }, [userId]);

  async function loadHistory() {
    setLoadingHistory(true);
    const data = await getSymptomHistory(userId);
    setHistory(data);
    setLoadingHistory(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (userId === 'unknown_user') {
      setError("You must be logged in to run an assessment.");
      return;
    }
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
      
      // Optimistically add to history UI
      setHistory(prev => [{
        ...data,
        symptoms_reported: symptomsArray,
        created_at: new Date().toISOString()
      }, ...prev]);

    } catch (err) {
      setError(err.message || 'Failed to analyze symptoms. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // Premium UI styling for react-select
  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      backgroundColor: 'transparent',
      borderColor: state.isFocused ? '#4B9AA8' : '#e2e8f0',
      boxShadow: state.isFocused ? '0 0 0 3px rgba(75, 154, 168, 0.2)' : 'none',
      '&:hover': { borderColor: '#4B9AA8' },
      padding: '6px',
      borderRadius: '1rem',
      transition: 'all 0.2s ease'
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: '#f0fdfa',
      border: '1px solid #ccfbf1',
      borderRadius: '8px',
      padding: '2px'
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: '#0f766e',
      fontWeight: '600',
      fontSize: '0.875rem'
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      color: '#0d9488',
      ':hover': { backgroundColor: '#0d9488', color: 'white', borderRadius: '4px' },
    }),
    menu: (provided) => ({
      ...provided,
      borderRadius: '1rem',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      overflow: 'hidden',
      border: '1px solid #f1f5f9'
    })
  };

  return (
    <div className="min-h-[90vh] bg-slate-50/50 p-4 lg:p-8 font-sans text-slate-800">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
          AI Diagnostic Assistant
        </h1>
        <p className="text-slate-500 mt-2 text-lg max-w-2xl">
          Select your symptoms below to receive an instant, AI-driven preliminary health assessment and specialist recommendation.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Active Assessment */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Input Card */}
          <div className="bg-white/80 backdrop-blur-xl p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200/60 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#4B9AA8] to-teal-300"></div>
            
            <form onSubmit={handleSubmit} className="relative z-10">
              <label className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">
                What are you experiencing today?
              </label>
              
              <Select
                isMulti
                name="symptoms"
                options={SYMPTOM_OPTIONS}
                className="basic-multi-select text-base"
                classNamePrefix="select"
                placeholder="Type to search symptoms (e.g., Headache)..."
                onChange={setSelectedSymptoms}
                value={selectedSymptoms}
                styles={customStyles}
              />

              {error && (
                <div className="mt-4 p-4 bg-red-50/80 backdrop-blur-sm text-red-600 rounded-2xl border border-red-100 flex items-start gap-3">
                  <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                  <span className="font-medium text-sm">{error}</span>
                </div>
              )}

              <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full text-xs font-medium text-slate-500">
                  <span className={`w-2 h-2 rounded-full ${userId !== 'unknown_user' ? 'bg-emerald-500' : 'bg-red-400'}`}></span>
                  ID: {userId}
                </div>
                
                <button
                  type="submit"
                  disabled={loading || userId === 'unknown_user'}
                  className={`w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl text-white font-bold text-sm tracking-wide transition-all duration-300
                    ${loading || userId === 'unknown_user' 
                      ? 'bg-slate-300 cursor-not-allowed' 
                      : 'bg-[#4B9AA8] hover:bg-[#397a86] hover:shadow-lg hover:shadow-[#4B9AA8]/30 hover:-translate-y-1'}`}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path></svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      Generate Analysis
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Results Card (Animated entry) */}
          {result && (
            <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 animate-in slide-in-from-bottom-8 fade-in duration-700">
              
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h3 className="text-sm font-bold text-[#4B9AA8] uppercase tracking-widest mb-1">AI Diagnosis</h3>
                  <h2 className="text-3xl font-extrabold text-slate-900">{result.predicted_condition}</h2>
                </div>
                
                {/* Modern Circular Progress */}
                <div className="relative flex flex-col items-center">
                  <div className="w-16 h-16 relative">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path strokeDasharray="100, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#f1f5f9" strokeWidth="3" />
                      <path strokeDasharray={`${Math.round((result.confidence ?? 0) * 100)}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#4B9AA8" strokeWidth="3" strokeLinecap="round" className="animate-[stroke_1.5s_ease-out_forwards]" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-slate-700">
                      {Math.round((result.confidence ?? 0) * 100)}%
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase mt-1">Confidence</span>
                </div>
              </div>

              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-6 relative">
                <div className="absolute top-6 left-6 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm text-[#4B9AA8]">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <p className="pl-12 text-slate-600 leading-relaxed">
                  {result.ai_feedback}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-slate-900 rounded-2xl text-white">
                <div className="mb-4 sm:mb-0">
                  <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Recommended Specialist</p>
                  <p className="text-xl font-bold">{result.recommended_specialty || 'General Practitioner'}</p>
                </div>
                <button className="px-6 py-3 bg-white text-slate-900 text-sm font-bold rounded-xl hover:bg-teal-50 transition-colors shadow-lg">
                  Find a Doctor
                </button>
              </div>

            </div>
          )}
        </div>

        {/* RIGHT COLUMN: History Sidebar */}
        <div className="lg:col-span-5">
          <div className="bg-white/60 backdrop-blur-xl border border-slate-200/60 rounded-3xl p-6 lg:p-8 h-full min-h-[500px]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900">Patient History</h3>
              <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-xs font-bold">{history.length} Records</span>
            </div>

            {loadingHistory ? (
              <div className="flex flex-col items-center justify-center h-48 space-y-4">
                <div className="w-8 h-8 border-4 border-[#4B9AA8]/30 border-t-[#4B9AA8] rounded-full animate-spin"></div>
                <p className="text-sm text-slate-400">Loading records...</p>
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-12 px-4 border-2 border-dashed border-slate-200 rounded-2xl">
                <svg className="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                <p className="text-slate-500 font-medium">No previous assessments found.</p>
                <p className="text-sm text-slate-400 mt-1">Your past symptom checks will appear here.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {history.map((item, idx) => (
                  <div key={idx} className="group p-5 bg-white border border-slate-100 rounded-2xl hover:border-[#4B9AA8]/30 hover:shadow-md transition-all cursor-pointer">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-slate-800">{item.predicted_condition || item.predicted_disease}</h4>
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-md">
                        {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Just now'}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {(item.symptoms_reported || []).slice(0, 3).map((sym, i) => (
                        <span key={i} className="px-2 py-1 bg-[#4B9AA8]/10 text-[#4B9AA8] text-xs font-medium rounded-md">
                          {sym.replace('_', ' ')}
                        </span>
                      ))}
                      {(item.symptoms_reported?.length > 3) && (
                        <span className="px-2 py-1 bg-slate-100 text-slate-500 text-xs font-medium rounded-md">
                          +{item.symptoms_reported.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}