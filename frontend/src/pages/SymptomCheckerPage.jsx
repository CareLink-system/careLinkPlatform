import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { useNavigate } from 'react-router-dom';
import {
  analyzeSymptoms,
  getSymptomHistory,
  getSymptoms,
  getAnalysisById,
  updateAnalysisById,
  deleteAnalysisById,
  clearSymptomHistory,
  submitAnalysisFeedback,
  getSymptomStats
} from '../api/symptomChecker';
import { normalizeGuidanceText } from '../lib/utils';

export default function SymptomCheckerPage() {
  // Robust User ID extraction for .NET / JWT setups
  const getUserId = () => {
    // Try from carelink.auth in localStorage (most reliable)
    try {
      const storedAuth = JSON.parse(localStorage.getItem('carelink.auth'));
      if (storedAuth?.user?.id) return storedAuth.user.id;
    } catch {
      // JSON parse or access error - continue to next fallback
    }

    // Fallback: check legacy user entry
    try {
      const localUser = JSON.parse(localStorage.getItem('user'));
      if (localUser?.id) return localUser.id;
    } catch {
      // JSON parse or access error - continue to next fallback
    }

    return localStorage.getItem('user_id') || 'unknown_user';
  };
  
  const userId = getUserId();
  const navigate = useNavigate();
  const userRole = (() => {
    try {
      const storedAuth = JSON.parse(localStorage.getItem('carelink.auth'));
      return storedAuth?.user?.role || '';
    } catch {
      return '';
    }
  })();
  const isAdmin = String(userRole).toLowerCase() === 'admin';

  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [symptomOptions, setSymptomOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  const [stats, setStats] = useState(null);
  const [feedbackSavingId, setFeedbackSavingId] = useState(null);
  const [editAnalysis, setEditAnalysis] = useState(null);
  const [editSymptoms, setEditSymptoms] = useState([]);
  const [editDescription, setEditDescription] = useState('');
  const [editSaving, setEditSaving] = useState(false);
  
  // History State
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const loadSymptoms = async () => {
    try {
      const symptoms = await getSymptoms();
      const options = symptoms.map((sym) => ({
        value: sym,
        label: sym.replaceAll('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())
      }));
      setSymptomOptions(options);
    } catch (err) {
      console.warn('Unable to load dynamic symptoms, falling back to default list.', err);
      const fallback = [
        'itching', 'skin_rash', 'continuous_sneezing', 'shivering', 'chills',
        'joint_pain', 'stomach_pain', 'acidity', 'vomiting', 'fatigue',
        'weight_loss', 'lethargy', 'cough', 'high_fever', 'headache',
        'yellowish_skin', 'dark_urine', 'nausea', 'loss_of_appetite', 'chest_pain'
      ];
      setSymptomOptions(
        fallback.map((sym) => ({
          value: sym,
          label: sym.replaceAll('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())
        }))
      );
    }
  };

  const loadHistory = async () => {
    setLoadingHistory(true);
    const data = await getSymptomHistory(userId);
    setHistory(data);
    setLoadingHistory(false);
  };

  const loadStats = async () => {
    if (!isAdmin) return;
    try {
      const data = await getSymptomStats();
      setStats(data);
    } catch (err) {
      console.warn('Failed to load stats:', err);
      setStats(null);
    }
  };

  const persistDiagnosisContext = (analysis, symptomsArray = []) => {
    try {
      const context = {
        analysis_id: analysis?.analysis_id || analysis?._id || null,
        predicted_condition: analysis?.predicted_condition || analysis?.predicted_disease || null,
        confidence: analysis?.confidence ?? null,
        recommended_specialty: analysis?.recommended_specialty || null,
        ai_feedback: normalizeGuidanceText(analysis?.ai_feedback || null, null),
        symptoms_reported: symptomsArray.length > 0 ? symptomsArray : analysis?.symptoms_reported || [],
        created_at: new Date().toISOString()
      };
      localStorage.setItem('carelink.lastDiagnosis', JSON.stringify(context));
    } catch {
      // ignore localStorage failures
    }
  };

  const openChatbot = (analysis, symptomsArray = []) => {
    if (analysis) {
      persistDiagnosisContext(analysis, symptomsArray.length > 0 ? symptomsArray : analysis?.symptoms_reported || []);
    }
    navigate('/chatbot');
  };

  const symptomValueToOption = (value) => {
    const existing = symptomOptions.find((option) => option.value === value);
    return existing || {
      value,
      label: value.replaceAll('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    };
  };

  const openEditModal = (analysis) => {
    const symptoms = (analysis?.symptoms_reported || analysis?.symptoms || []).map(symptomValueToOption);
    setEditAnalysis(analysis);
    setEditSymptoms(symptoms);
    setEditDescription(analysis?.description || '');
  };

  const closeEditModal = () => {
    setEditAnalysis(null);
    setEditSymptoms([]);
    setEditDescription('');
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editAnalysis?._id) return;

    const symptomsArray = editSymptoms.map((item) => item.value);
    if (symptomsArray.length === 0 && !editDescription.trim()) {
      setError('Please select at least one symptom or enter a description.');
      return;
    }

    setEditSaving(true);
    setError(null);

    try {
      const updated = await updateAnalysisById(editAnalysis._id, {
        user_id: editAnalysis.user_id || userId,
        symptoms: symptomsArray,
        description: editDescription.trim() || null
      });

      const merged = {
        ...editAnalysis,
        ...updated,
        _id: editAnalysis._id,
        symptoms_reported: symptomsArray,
        description: editDescription.trim() || editAnalysis.description || '',
      };

      setHistory((prev) => prev.map((item) => (item._id === editAnalysis._id ? merged : item)));
      setSelectedAnalysis((prev) => (prev?._id === editAnalysis._id ? merged : prev));
      setResult((prev) => (prev?.analysis_id === editAnalysis._id ? { ...prev, ...updated } : prev));
      closeEditModal();
    } catch (err) {
      setError(err.message || 'Failed to update analysis.');
    } finally {
      setEditSaving(false);
    }
  };

  useEffect(() => {
    loadSymptoms();
    loadStats();
    if (userId !== 'unknown_user') {
      loadHistory();
    } else {
      setLoadingHistory(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

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
      persistDiagnosisContext(data, symptomsArray);
      
      // Optimistically add to history UI
      setHistory(prev => [{
        _id: data.analysis_id,
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

  async function handleViewAnalysis(analysisId) {
    try {
      const detail = await getAnalysisById(analysisId);
      setSelectedAnalysis(detail);
    } catch (err) {
      setError(err.message || 'Failed to fetch analysis details.');
    }
  }

  async function handleEditClick(analysis) {
    if (analysis?.analysis_id && !analysis?._id) {
      try {
        const detail = await getAnalysisById(analysis.analysis_id);
        openEditModal(detail);
        return;
      } catch {
        // fall through and edit with available summary data
      }
    }

    openEditModal(analysis);
  }

  async function handleDeleteAnalysis(analysisId) {
    try {
      await deleteAnalysisById(analysisId);
      setHistory((prev) => prev.filter((row) => row._id !== analysisId));
      if (selectedAnalysis?._id === analysisId) {
        setSelectedAnalysis(null);
      }
    } catch (err) {
      setError(err.message || 'Failed to delete analysis.');
    }
  }

  async function handleClearHistory() {
    try {
      await clearSymptomHistory(userId);
      setHistory([]);
      setSelectedAnalysis(null);
    } catch (err) {
      setError(err.message || 'Failed to clear history.');
    }
  }

  async function handleFeedback(analysisId, wasAccurate) {
    setFeedbackSavingId(analysisId);
    try {
      await submitAnalysisFeedback(analysisId, wasAccurate);
      setHistory((prev) => prev.map((item) => (
        item._id === analysisId ? { ...item, feedback: { was_accurate: wasAccurate } } : item
      )));
      if (selectedAnalysis?._id === analysisId) {
        setSelectedAnalysis({ ...selectedAnalysis, feedback: { was_accurate: wasAccurate } });
      }
    } catch (err) {
      setError(err.message || 'Failed to submit feedback.');
    } finally {
      setFeedbackSavingId(null);
    }
  }

  const getGuidanceText = (analysis) => {
    const condition = analysis?.predicted_condition || analysis?.predicted_disease || 'your condition';
    const specialty = analysis?.recommended_specialty || 'General Physician';
    return normalizeGuidanceText(
      analysis?.ai_feedback || analysis?.aiFeedback,
      `Based on your symptoms, ${condition} is a possible condition. Please consult a ${specialty} for a proper diagnosis.`
    );
  };

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
      border: '1px solid #f1f5f9',
      zIndex: 9999
    })
    ,
    menuPortal: (base) => ({ ...base, zIndex: 9999 })
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
                options={symptomOptions}
                className="basic-multi-select text-base"
                classNamePrefix="select"
                placeholder="Type to search symptoms (e.g., Headache)..."
                onChange={setSelectedSymptoms}
                value={selectedSymptoms}
                styles={customStyles}
                menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                menuPosition="fixed"
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

              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-6">
                <h4 className="text-xs font-bold text-[#4B9AA8] uppercase tracking-wider mb-2">Medical Guidance</h4>
                <div className="mt-3 p-3 bg-slate-50 rounded-md border border-slate-100">
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">{getGuidanceText(result)}</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-slate-900 rounded-2xl text-white">
                <div className="mb-4 sm:mb-0">
                  <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Recommended Specialist</p>
                  <p className="text-xl font-bold">{result.recommended_specialty || 'General Practitioner'}</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button className="px-6 py-3 bg-white text-slate-900 text-sm font-bold rounded-xl hover:bg-teal-50 transition-colors shadow-lg">
                    Find a Doctor
                  </button>
                  <button
                    type="button"
                    onClick={() => openChatbot(result, selectedSymptoms.map((item) => item.value))}
                    className="px-6 py-3 bg-[#4B9AA8] text-white text-sm font-bold rounded-xl hover:bg-[#397a86] transition-colors shadow-lg"
                  >
                    Chat with CareLink
                  </button>
                </div>
              </div>

            </div>
          )}
        </div>

        {/* RIGHT COLUMN: History Sidebar */}
        <div className="lg:col-span-5">
          <div className="bg-white/60 backdrop-blur-xl border border-slate-200/60 rounded-3xl p-6 lg:p-8 h-full min-h-[500px]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900">Patient History</h3>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-xs font-bold">{history.length} Records</span>
                {history.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearHistory}
                    className="px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-600 hover:bg-red-100"
                  >
                    Clear All
                  </button>
                )}
              </div>
            </div>

            {isAdmin && stats && (
              <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Global Stats (Admin)</p>
                <p className="text-sm text-slate-700">Total Analyses: <span className="font-bold">{stats.total_analyses}</span></p>
                <p className="text-sm text-slate-700">Average Confidence: <span className="font-bold">{Math.round((stats.average_ai_confidence || 0) * 100)}%</span></p>
              </div>
            )}

            {editAnalysis && (
              <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-900/40 px-4 py-6">
                <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
                  <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-[#4B9AA8]">Edit Analysis</p>
                      <h3 className="text-lg font-bold text-slate-900">Update symptoms and regenerate result</h3>
                    </div>
                    <button
                      type="button"
                      onClick={closeEditModal}
                      className="rounded-full bg-slate-100 px-3 py-2 text-slate-600 hover:bg-slate-200"
                    >
                      Close
                    </button>
                  </div>

                  <form onSubmit={handleSaveEdit} className="space-y-5 px-6 py-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Symptoms</label>
                      <Select
                        isMulti
                        name="editSymptoms"
                        options={symptomOptions}
                        className="basic-multi-select text-base"
                        classNamePrefix="select"
                        placeholder="Update symptoms..."
                        onChange={setEditSymptoms}
                        value={editSymptoms}
                        styles={customStyles}
                        menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                        menuPosition="fixed"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                      <textarea
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        rows={4}
                        placeholder="Optional. Add or refine the symptom description..."
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-[#4B9AA8] focus:ring-4 focus:ring-[#4B9AA8]/10"
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                      <p className="text-xs text-slate-500">This will rerun the prediction and refresh the medical guidance.</p>
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={closeEditModal}
                          className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={editSaving}
                          className={`rounded-xl px-4 py-2 text-sm font-semibold text-white ${editSaving ? 'bg-slate-300 cursor-not-allowed' : 'bg-[#4B9AA8] hover:bg-[#397a86]'}`}
                        >
                          {editSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            )}

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
                {history.map((item, idx) => {
                  const guidancePreview = getGuidanceText(item);
                  return (
                    <div key={item._id || idx} className="group p-5 bg-white border border-slate-100 rounded-2xl hover:border-[#4B9AA8]/30 hover:shadow-md transition-all">
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

                      {(item.ai_feedback || item.aiFeedback) && (
                        <p className="mt-3 text-sm text-slate-500 line-clamp-2">
                          {guidancePreview.slice(0, 140)}{guidancePreview.length > 140 ? '...' : ''}
                        </p>
                      )}

                      <div className="mt-4 flex flex-wrap gap-2">
                        {!!item._id && (
                          <button
                            type="button"
                            onClick={() => handleViewAnalysis(item._id)}
                            className="px-3 py-1 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200"
                          >
                            View
                          </button>
                        )}
                        {!!item._id && (
                          <button
                            type="button"
                            onClick={() => openChatbot(item, item.symptoms_reported || [])}
                            className="px-3 py-1 text-xs font-semibold rounded-lg bg-[#4B9AA8]/10 text-[#4B9AA8] hover:bg-[#4B9AA8]/20"
                          >
                            Chat
                          </button>
                        )}
                        {!!item._id && (
                          <button
                            type="button"
                            onClick={() => handleEditClick(item)}
                            className="px-3 py-1 text-xs font-semibold rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100"
                          >
                            Edit
                          </button>
                        )}
                        {!!item._id && (
                          <button
                            type="button"
                            onClick={() => handleDeleteAnalysis(item._id)}
                            className="px-3 py-1 text-xs font-semibold rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
                          >
                            Delete
                          </button>
                        )}
                        {!!item._id && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleFeedback(item._id, true)}
                              disabled={feedbackSavingId === item._id}
                              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${item.feedback?.was_accurate === true ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'} ${feedbackSavingId === item._id ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                              Accurate
                            </button>
                            <button
                              type="button"
                              onClick={() => handleFeedback(item._id, false)}
                              disabled={feedbackSavingId === item._id}
                              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${item.feedback?.was_accurate === false ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-700 hover:bg-amber-100'} ${feedbackSavingId === item._id ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                              Not Accurate
                            </button>
                          </>
                        )}
                        {item.feedback && (
                          <span className="px-2 py-1 text-xs rounded-md bg-slate-100 text-slate-600">
                            Saved: {item.feedback.was_accurate ? 'Accurate' : 'Not Accurate'}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {selectedAnalysis && (
              <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Selected Analysis</p>
                <p className="text-sm text-slate-700"><span className="font-semibold">Condition:</span> {selectedAnalysis.predicted_condition}</p>
                <p className="text-sm text-slate-700"><span className="font-semibold">Confidence:</span> {Math.round((selectedAnalysis.confidence || 0) * 100)}%</p>
                <p className="text-sm text-slate-700"><span className="font-semibold">Specialty:</span> {selectedAnalysis.recommended_specialty}</p>
                <p className="text-sm text-slate-700 mt-1"><span className="font-semibold">Guidance:</span> {getGuidanceText(selectedAnalysis)}</p>
                {!!selectedAnalysis?._id && (
                  <div className="mt-4 flex flex-wrap justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => openChatbot(selectedAnalysis, selectedAnalysis.symptoms_reported || [])}
                      className="rounded-xl bg-[#4B9AA8] px-4 py-2 text-sm font-semibold text-white hover:bg-[#397a86]"
                    >
                      Chat About This Result
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEditClick(selectedAnalysis)}
                      className="rounded-xl bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-700 hover:bg-sky-100"
                    >
                      Edit Analysis
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}