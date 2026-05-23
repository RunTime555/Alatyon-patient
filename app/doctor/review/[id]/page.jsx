"use client";
import { use, useState, useEffect } from "react";
import {
  Brain, CheckCircle, Loader2, ArrowLeft, User2,
  FlaskConical, FileText, AlertCircle, XCircle,
  Stethoscope, TrendingUp, Calendar, Hash,
  ClipboardList, Sparkles, ChevronDown
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";

// ── Status badge ───────────────────────────────────────────
const STATUS = {
  PENDING_DOCTOR: { bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200",   label: "Pending Review" },
  COMPLETED:      { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", label: "Approved" },
  Verified:       { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", label: "Approved" },
  REJECTED:       { bg: "bg-red-50",     text: "text-red-700",     border: "border-red-200",     label: "Rejected" },
};
const getStatus = (s) => STATUS[s] ?? { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", label: s ?? "Unknown" };

export default function ReviewPage({ params }) {
  const { id }   = use(params);
  const router   = useRouter();

  const [data, setData]               = useState(null);
  const [aiText, setAiText]           = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving]       = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [doctorNote, setDoctorNote]   = useState("");
  const [showReject, setShowReject]   = useState(false);
  const [rejectNote, setRejectNote]   = useState("");
  const [done, setDone]               = useState(false);
  const [error, setError]             = useState("");
  const [showAllTests, setShowAllTests] = useState(false);

  useEffect(() => {
    fetch(`/api/lab/result/${id}`)
      .then(r => r.json())
      .then(d => {
        setData(d);
        // Pre-fill doctor note if already reviewed
        if (d?.doctorComment) setDoctorNote(d.doctorComment);
      })
      .catch(() => setError("Failed to load result."));
  }, [id]);

  const runAI = async () => {
    setIsAnalyzing(true);
    setError("");
    try {
      const res  = await fetch(`/api/doctor/analyze/${id}`);
      const json = await res.json();
      if (json.analysis) setAiText(json.analysis);
      else setError("AI analysis failed. Please try again.");
    } catch {
      setError("Network error while running AI analysis.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const approve = async () => {
    setIsSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/doctor/approve/${id}`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ finalComment: aiText, doctorNote }),
      });
      if (res.ok) {
        setDone(true);
        setTimeout(() => router.push("/doctor"), 1800);
      } else {
        const d = await res.json();
        setError(d.error || "Failed to approve result.");
      }
    } catch {
      setError("Network error while approving.");
    } finally {
      setIsSaving(false);
    }
  };

  const reject = async () => {
    if (!rejectNote.trim()) { setError("Please provide a reason for rejection."); return; }
    setIsRejecting(true);
    setError("");
    try {
      const res = await fetch("/api/doctor/action", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ resultId: id, action: "REJECT", doctorNote: rejectNote }),
      });
      if (res.ok) router.push("/doctor");
      else {
        const d = await res.json();
        setError(d.error || "Failed to reject result.");
      }
    } catch {
      setError("Network error while rejecting.");
    } finally {
      setIsRejecting(false);
    }
  };

  if (!data && !error) return (
    <div className="min-h-screen bg-[#f0f6ff] flex items-center justify-center">
      <Loader2 className="animate-spin text-blue-500" size={32} />
    </div>
  );

  if (error && !data) return (
    <div className="min-h-screen bg-[#f0f6ff] flex items-center justify-center flex-col gap-3">
      <AlertCircle size={32} className="text-red-400" />
      <p className="text-slate-600 font-bold">{error}</p>
      <button onClick={() => router.back()} className="text-blue-500 text-sm font-bold hover:underline">← Go back</button>
    </div>
  );

  const st = getStatus(data?.status);
  const isAlreadyReviewed = ["COMPLETED","Verified","REJECTED"].includes(data?.status);

  // All tests for this patient (if included in response)
  const allTests = data?.patient?.labResults ?? [];
  const visibleTests = showAllTests ? allTests : allTests.slice(0, 5);

  return (
    <div className="min-h-screen bg-[#f0f6ff] font-sans pb-10">
      <div className="max-w-6xl mx-auto px-4 py-6 sm:px-6">

        {/* ── Top bar ── */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-800 text-xs font-bold uppercase tracking-wide transition-colors">
            <ArrowLeft size={14} /> Back
          </button>
          <span className={`inline-flex items-center text-[10px] font-black px-3 py-1.5 rounded-full border ${st.bg} ${st.text} ${st.border}`}>
            {st.label}
          </span>
        </div>

        {/* ── Success banner ── */}
        {done && (
          <div className="mb-5 flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-700 px-5 py-3 rounded-2xl font-bold text-sm animate-in fade-in">
            <CheckCircle size={18} /> Result approved and sent to patient. Redirecting…
          </div>
        )}
        {error && (
          <div className="mb-5 flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-5 py-3 rounded-2xl font-bold text-sm">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* ══ LEFT COLUMN ══════════════════════════════════ */}
          <div className="space-y-4">

            {/* Patient info */}
            <div className="bg-white rounded-2xl border border-blue-50 p-5 shadow-sm">
              <p className="text-[10px] font-black uppercase text-blue-400 tracking-widest mb-4">Patient Details</p>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 bg-gradient-to-br from-blue-400 to-[#003a66] rounded-xl flex items-center justify-center text-white font-black text-sm shrink-0">
                  {data?.patient?.name?.split(" ").map(n => n[0]).join("").slice(0,2).toUpperCase() ?? "PT"}
                </div>
                <div>
                  <p className="font-black text-slate-800 text-sm">{data?.patient?.name ?? "—"}</p>
                  <p className="text-blue-600 text-xs font-bold font-mono">MRN: {data?.patient?.mrn ?? "—"}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { icon: Hash,      label: "Test",   value: data?.testName ?? "—" },
                  { icon: TrendingUp,label: "Value",  value: `${data?.testValue ?? "—"} ${data?.unit ?? ""}` },
                  { icon: Calendar,  label: "Date",   value: data?.createdAt ? new Date(data.createdAt).toLocaleDateString() : "—" },
                  { icon: ClipboardList, label: "Status", value: st.label },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="bg-[#f0f6ff] rounded-xl p-2.5">
                    <div className="flex items-center gap-1 mb-1">
                      <Icon size={10} className="text-blue-400" />
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-wide">{label}</p>
                    </div>
                    <p className="text-xs font-black text-slate-700 truncate">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Result table — this result's values */}
            <div className="bg-white rounded-2xl border border-blue-50 shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-blue-50 flex items-center gap-2">
                <FlaskConical size={14} className="text-blue-600" />
                <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Lab Result</p>
              </div>
              <table className="w-full text-xs">
                <thead className="bg-[#f7faff]">
                  <tr>
                    {["Test Name","Value","Unit","Status"].map(h => (
                      <th key={h} className="px-4 py-2.5 text-left text-[9px] font-black text-slate-400 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-blue-50">
                    <td className="px-4 py-3 font-bold text-slate-700">{data?.testName ?? "—"}</td>
                    <td className="px-4 py-3 font-black text-[#003a66] text-sm">{data?.testValue ?? "—"}</td>
                    <td className="px-4 py-3 text-slate-400 font-medium">{data?.unit ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${st.bg} ${st.text}`}>{st.label}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Patient's other tests (if available) */}
            {allTests.length > 1 && (
              <div className="bg-white rounded-2xl border border-blue-50 shadow-sm overflow-hidden">
                <div className="px-5 py-3 border-b border-blue-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ClipboardList size={14} className="text-blue-600" />
                    <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Patient History</p>
                  </div>
                  <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{allTests.length} tests</span>
                </div>
                <table className="w-full text-xs">
                  <thead className="bg-[#f7faff]">
                    <tr>
                      {["Test","Value","Date","Status"].map(h => (
                        <th key={h} className="px-3 py-2 text-left text-[9px] font-black text-slate-400 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-blue-50">
                    {visibleTests.map((t, i) => {
                      const ts = getStatus(t.status);
                      return (
                        <tr key={i} className={t.id === id ? "bg-blue-50" : "hover:bg-[#f7faff]"}>
                          <td className="px-3 py-2.5 font-bold text-slate-700 truncate max-w-[80px]">{t.testName}</td>
                          <td className="px-3 py-2.5 font-black text-[#003a66]">{t.testValue ?? "—"}</td>
                          <td className="px-3 py-2.5 text-slate-400">{new Date(t.createdAt).toLocaleDateString()}</td>
                          <td className="px-3 py-2.5">
                            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${ts.bg} ${ts.text}`}>{ts.label}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {allTests.length > 5 && (
                  <button onClick={() => setShowAllTests(v => !v)}
                    className="w-full py-2.5 text-[10px] font-bold text-blue-500 hover:text-blue-700 flex items-center justify-center gap-1 border-t border-blue-50 transition-colors">
                    {showAllTests ? "Show less" : `Show ${allTests.length - 5} more`}
                    <ChevronDown size={12} className={`transition-transform ${showAllTests ? "rotate-180" : ""}`} />
                  </button>
                )}
              </div>
            )}

            {/* Doctor's note */}
            <div className="bg-white rounded-2xl border border-blue-50 p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Stethoscope size={14} className="text-[#003a66]" />
                <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Doctor's Note</p>
              </div>
              <Textarea
                placeholder="Write your clinical observation, diagnosis, or advice for this patient…"
                value={doctorNote}
                onChange={e => setDoctorNote(e.target.value)}
                disabled={isAlreadyReviewed}
                className="min-h-[110px] rounded-xl bg-[#f0f6ff] border-blue-100 text-sm font-medium resize-none focus-visible:ring-blue-300 disabled:opacity-60"
              />
            </div>

            {/* Reject — only show if not already reviewed */}
            {!isAlreadyReviewed && (
              <>
                <button onClick={() => setShowReject(v => !v)}
                  className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-red-200 rounded-2xl text-xs font-bold text-red-400 hover:bg-red-50 hover:border-red-400 hover:text-red-600 transition-all">
                  <XCircle size={14} /> {showReject ? "Cancel Rejection" : "Reject This Result"}
                </button>
                {showReject && (
                  <div className="bg-red-50 border border-red-200 rounded-2xl p-4 space-y-3">
                    <p className="text-xs font-black text-red-600 uppercase tracking-wide">Reason for rejection</p>
                    <Textarea
                      placeholder="Explain why — the lab tech will see this message…"
                      value={rejectNote}
                      onChange={e => setRejectNote(e.target.value)}
                      className="min-h-[80px] rounded-xl bg-white border-red-200 text-sm resize-none focus-visible:ring-red-300"
                    />
                    <button onClick={reject} disabled={isRejecting}
                      className="w-full py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white rounded-xl text-xs font-black uppercase flex items-center justify-center gap-2 transition-all">
                      {isRejecting ? <Loader2 className="animate-spin" size={13} /> : <><XCircle size={13} /> Confirm Rejection</>}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* ══ RIGHT COLUMN (AI panel) ═══════════════════════ */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl border border-blue-50 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
                    <Brain size={17} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="font-black text-slate-800 text-sm">AI Diagnostic Summary</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Powered by Gemini AI · Review before approving</p>
                  </div>
                </div>
                {!isAlreadyReviewed && (
                  <button onClick={runAI} disabled={isAnalyzing}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase px-4 py-2.5 rounded-xl transition-all disabled:opacity-60 shadow-md shadow-blue-900/20">
                    {isAnalyzing
                      ? <><Loader2 className="animate-spin" size={13} /> Analyzing…</>
                      : <><Sparkles size={13} /> Generate Analysis</>}
                  </button>
                )}
              </div>

              {/* Empty state */}
              {!aiText && !isAnalyzing && (
                <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-blue-100 rounded-2xl">
                  <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
                    <FileText size={24} className="text-blue-300" />
                  </div>
                  <p className="text-slate-500 font-bold text-sm">No AI analysis yet</p>
                  <p className="text-slate-400 text-xs mt-1 max-w-xs">
                    Click "Generate Analysis" to get an AI-powered diagnostic summary for this lab result.
                  </p>
                </div>
              )}

              {/* Analyzing */}
              {isAnalyzing && (
                <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-blue-100 rounded-2xl">
                  <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
                    <Loader2 className="animate-spin text-blue-500" size={28} />
                  </div>
                  <p className="text-slate-500 font-bold text-sm">Analyzing lab result…</p>
                  <p className="text-slate-400 text-xs mt-1">Gemini AI is reviewing the data</p>
                </div>
              )}

              {/* AI result */}
              {aiText && !isAnalyzing && (
                <div className="space-y-4 animate-in fade-in duration-500">
                  {/* Editable AI text */}
                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <Sparkles size={12} className="text-purple-500" />
                      <p className="text-[10px] font-black uppercase text-purple-600 tracking-widest">AI Generated — You may edit before approving</p>
                    </div>
                    <Textarea
                      value={aiText}
                      onChange={e => setAiText(e.target.value)}
                      disabled={isAlreadyReviewed}
                      className="min-h-[300px] rounded-xl bg-[#f0f6ff] border-blue-100 text-sm font-medium leading-relaxed resize-none focus-visible:ring-blue-300 disabled:opacity-70"
                    />
                  </div>

                  {/* Disclaimer */}
                  <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-xl p-3">
                    <AlertCircle size={14} className="text-amber-500 mt-0.5 shrink-0" />
                    <p className="text-xs text-amber-700 font-medium">
                      AI analysis is a clinical decision-support tool only. Always apply your own medical judgment before approving. The patient will see this analysis.
                    </p>
                  </div>

                  {/* Approve button */}
                  {!isAlreadyReviewed && (
                    <button onClick={approve} disabled={isSaving || done}
                      className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-900/10">
                      {isSaving
                        ? <Loader2 className="animate-spin" size={18} />
                        : <><CheckCircle size={18} /> Approve & Send to Patient</>}
                    </button>
                  )}
                </div>
              )}

              {/* Already reviewed — show stored interpretation */}
              {isAlreadyReviewed && data?.interpretation && !aiText && (
                <div className="space-y-4">
                  <div className="bg-[#f0f6ff] rounded-xl p-4">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Stored Analysis</p>
                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{data.interpretation}</p>
                  </div>
                  <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-bold ${st.bg} ${st.text} ${st.border}`}>
                    <CheckCircle size={16} />
                    This result has already been {st.label.toLowerCase()} and sent to the patient.
                  </div>
                </div>
              )}
            </div>

            {/* Approve without AI — show only when AI hasn't been generated yet */}
            {!isAlreadyReviewed && !aiText && !isAnalyzing && (
              <div className="bg-white rounded-2xl border border-blue-50 p-5 shadow-sm">
                <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Approve Without AI</p>
                <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                  You can approve this result using only your doctor's note above, without generating an AI analysis.
                </p>
                <button onClick={approve} disabled={isSaving || done || !doctorNote.trim()}
                  className="w-full py-3 bg-[#003a66] hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 transition-all">
                  {isSaving
                    ? <Loader2 className="animate-spin" size={14} />
                    : <><CheckCircle size={14} /> Approve with Note Only</>}
                </button>
                {!doctorNote.trim() && (
                  <p className="text-[10px] text-slate-400 text-center mt-2">Add a doctor's note first to enable this</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}