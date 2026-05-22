"use client";

import { useState, useEffect, useRef } from "react";
import {
  User, Phone, MapPin, Camera, Save, X, Loader2,
  Fingerprint, Droplet, ShieldAlert, CheckCircle2
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [saved, setSaved]         = useState(false);
  const fileInputRef = useRef(null);

  const [profile, setProfile] = useState({
    name: "", email: "", phone: "", address: "",
    mrn: "", image: null, bloodGroup: "",
    emergencyContact: "", emergencyPhone: "",
    occupation: "", dob: ""
  });

  // Keep a copy to cancel edits
  const [original, setOriginal] = useState(null);

  useEffect(() => {
    fetch("/api/profile")
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) { setProfile(p => ({ ...p, ...d })); setOriginal({ ...d }); } })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method:  "PUT",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(profile),
      });
      if (res.ok) {
        setOriginal({ ...profile });
        setIsEditing(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        alert("Failed to update profile.");
      }
    } catch {
      alert("Error saving profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (original) setProfile(p => ({ ...p, ...original }));
    setIsEditing(false);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { alert("Image must be under 2MB."); return; }
    const reader = new FileReader();
    reader.onloadend = () => setProfile(p => ({ ...p, image: reader.result }));
    reader.readAsDataURL(file);
  };

  const Field = ({ label, field, type = "text", readOnly = false }) => (
    <div className="space-y-1.5">
      <Label className="text-[10px] font-black text-slate-400 uppercase tracking-wide">{label}</Label>
      {isEditing && !readOnly ? (
        <Input
          type={type}
          value={profile[field] ?? ""}
          onChange={e => setProfile(p => ({ ...p, [field]: e.target.value }))}
          className="h-11 rounded-xl bg-[#f0f6ff] border-blue-100 font-semibold text-slate-700 focus-visible:ring-blue-300"
        />
      ) : (
        <p className={`text-sm font-semibold ${readOnly ? "text-slate-400" : "text-slate-700"}`}>
          {profile[field] || "Not specified"}
        </p>
      )}
    </div>
  );

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="animate-spin text-blue-600" size={36} />
    </div>
  );

  const initials = profile.name
    ? profile.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "PT";

  return (
    <div className="space-y-5 pb-10">

      {/* Saved toast */}
      {saved && (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold px-4 py-3 rounded-2xl">
          <CheckCircle2 size={15} /> Profile updated successfully.
        </div>
      )}

      {/* ── Hero card ── */}
      <div className="bg-white rounded-2xl border border-blue-50 shadow-sm overflow-hidden">
        <div className="h-28 sm:h-36 bg-gradient-to-r from-[#003a66] to-blue-500" />
        <div className="px-5 sm:px-8 pb-6 flex flex-col sm:flex-row sm:items-end gap-5 -mt-14 sm:-mt-16 relative z-10">

          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl border-4 border-white bg-white overflow-hidden shadow-xl">
              {profile.image ? (
                <img src={profile.image} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-blue-50 flex items-center justify-center text-[#003a66]">
                  <User size={52} />
                </div>
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-2 -right-2 w-9 h-9 bg-[#003a66] hover:bg-blue-600 rounded-xl flex items-center justify-center text-white border-2 border-white shadow-md transition-all"
            >
              <Camera size={15} />
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
          </div>

          {/* Name + badges */}
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-black text-slate-800 truncate">{profile.name || "Patient"}</h1>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="flex items-center gap-1 bg-blue-50 text-[#003a66] px-3 py-1 rounded-full text-xs font-bold border border-blue-100">
                <Fingerprint size={12} /> MRN: {profile.mrn || "—"}
              </span>
              <span className="flex items-center gap-1 bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-bold border border-red-100">
                <Droplet size={12} /> Blood: {profile.bloodGroup || "Not Set"}
              </span>
            </div>
          </div>

          {/* Edit / Save actions */}
          <div className="flex gap-2 shrink-0">
            {isEditing ? (
              <>
                <Button onClick={handleSave} disabled={saving}
                  className="bg-[#003a66] hover:bg-blue-600 text-white font-bold rounded-xl h-10 px-4 text-xs gap-2">
                  {saving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
                  {saving ? "Saving…" : "Save"}
                </Button>
                <Button onClick={handleCancel} variant="outline"
                  className="rounded-xl h-10 px-3 border-blue-100 text-slate-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200">
                  <X size={15} />
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)}
                className="bg-[#003a66] hover:bg-blue-600 text-white font-bold rounded-xl h-10 px-5 text-xs">
                Edit Profile
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* ── Info grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Left — identity + contact */}
        <div className="lg:col-span-2 space-y-5">

          {/* Identity */}
          <div className="bg-white rounded-2xl border border-blue-50 p-5 sm:p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5 pb-3 border-b border-blue-50">
              <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center">
                <User size={14} className="text-blue-600" />
              </div>
              <p className="text-xs font-black uppercase text-slate-500 tracking-widest">Identity & Health</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="Full Name"   field="name" />
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-wide">Blood Group</Label>
                {isEditing ? (
                  <select
                    className="w-full h-11 rounded-xl bg-[#f0f6ff] border border-blue-100 px-3 text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-blue-300"
                    value={profile.bloodGroup}
                    onChange={e => setProfile(p => ({ ...p, bloodGroup: e.target.value }))}
                  >
                    <option value="">Select type</option>
                    {BLOOD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                ) : (
                  <p className="text-sm font-bold text-red-600">{profile.bloodGroup || "Not Specified"}</p>
                )}
              </div>
              <Field label="Occupation"    field="occupation" />
              <Field label="Date of Birth" field="dob" type="date" />
            </div>
          </div>

          {/* Contact */}
          <div className="bg-white rounded-2xl border border-blue-50 p-5 sm:p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5 pb-3 border-b border-blue-50">
              <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center">
                <MapPin size={14} className="text-blue-600" />
              </div>
              <p className="text-xs font-black uppercase text-slate-500 tracking-widest">Contact Info</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="Email"  field="email" type="email" readOnly />
              <Field label="Phone"  field="phone" type="tel" />
              <div className="sm:col-span-2">
                <Field label="Address" field="address" />
              </div>
            </div>
          </div>
        </div>

        {/* Right — emergency + notice */}
        <div className="space-y-5">
          <div className="bg-red-50 border border-red-100 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <ShieldAlert size={16} className="text-red-500" />
              <p className="text-xs font-black uppercase text-red-600 tracking-widest">Emergency Contact</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black text-red-400 uppercase tracking-wide">Contact Name</Label>
                {isEditing ? (
                  <Input value={profile.emergencyContact ?? ""}
                    onChange={e => setProfile(p => ({ ...p, emergencyContact: e.target.value }))}
                    className="h-11 rounded-xl bg-white border-red-100 font-semibold focus-visible:ring-red-300" />
                ) : (
                  <p className="text-sm font-bold text-slate-700">{profile.emergencyContact || "Not Set"}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black text-red-400 uppercase tracking-wide">Emergency Phone</Label>
                {isEditing ? (
                  <Input value={profile.emergencyPhone ?? ""}
                    onChange={e => setProfile(p => ({ ...p, emergencyPhone: e.target.value }))}
                    className="h-11 rounded-xl bg-white border-red-100 font-semibold focus-visible:ring-red-300" />
                ) : (
                  <p className="text-sm font-bold text-slate-700">{profile.emergencyPhone || "Not Set"}</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-[#003a66] text-white rounded-2xl p-5 shadow-lg overflow-hidden relative">
            <Fingerprint size={90} className="absolute -right-3 -bottom-3 opacity-10 rotate-12" />
            <p className="text-[10px] font-black uppercase text-blue-200 tracking-widest mb-2">Notice</p>
            <p className="text-xs text-blue-100 leading-relaxed relative z-10">
              Keep your profile updated. Accurate blood type and emergency contact info are critical for your care at Alatyon Hospital.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}