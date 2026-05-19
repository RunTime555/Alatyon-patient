"use client";

import { useState, useRef, useEffect } from "react";
// ✅ Header ተወግዷል (በ Layout ውስጥ ስላለ)
import { DashboardCard } from "@/components/dashboard-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  User, Phone, MapPin, Camera, Save, X, Loader2, 
  Fingerprint, Droplet, ShieldAlert 
} from "lucide-react";

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);
  
  const [profile, setProfile] = useState({
    name: "", 
    email: "", 
    phone: "", 
    address: "",
    mrn: "", 
    image: null, 
    bloodGroup: "", // መጀመሪያ ባዶ እንዲሆን
    emergencyContact: "", 
    emergencyPhone: "",
    occupation: "", 
    dob: ""
  });

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/profile");
        if (res.ok) {
          const data = await res.json();
          setProfile(prev => ({ ...prev, ...data }));
        }
      } catch (err) {
        console.error("Profile load error:", err);
      } finally { setLoading(false); }
    }
    fetchProfile();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      if (res.ok) {
        setIsEditing(false);
        window.location.reload(); // ✅ ለውጦች በየቦታው እንዲታዩ
      } else {
        alert("Failed to update profile");
      }
    } catch (err) {
      alert("Error saving profile");
    } finally { setSaving(false); }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { 
        alert("Image too large. Please use an image under 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setProfile({ ...profile, image: reader.result });
      reader.readAsDataURL(file);
    }
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-[#004a7c]" size={40} />
    </div>
  );

  return (
    <div className="w-full min-h-screen bg-slate-50/50 pb-10">
      <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
        
        {/* Profile Header Card */}
        <DashboardCard className="relative overflow-hidden p-0 border-none shadow-lg bg-white rounded-2xl">
          <div className="h-32 md:h-48 bg-gradient-to-r from-[#004a7c] to-blue-600 w-full" />
          <div className="px-8 pb-8 flex flex-col md:flex-row items-center md:items-end gap-6 -mt-16 md:-mt-20 relative z-10">
            <div className="relative group">
              <div className="h-32 w-32 md:h-40 md:w-40 rounded-2xl border-4 border-white bg-white flex items-center justify-center overflow-hidden shadow-2xl">
                {profile.image ? (
                  <img src={profile.image} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full bg-blue-50 flex items-center justify-center text-[#004a7c]">
                    <User size={60} />
                  </div>
                )}
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 bg-[#004a7c] p-2 rounded-xl text-white border-2 border-white hover:scale-110 transition-transform"
              >
                <Camera size={20} />
              </button>
              <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">{profile.name}</h1>
              <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-2">
                <span className="flex items-center gap-1 bg-blue-50 text-[#004a7c] px-3 py-1 rounded-full text-xs font-bold border border-blue-100">
                  <Fingerprint size={14} /> MRN: {profile.mrn}
                </span>
                <span className="flex items-center gap-1 bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-bold border border-red-100">
                  <Droplet size={14} /> Blood: {profile.bloodGroup || "Not Set"}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button onClick={handleSave} disabled={saving} className="bg-[#004a7c] hover:bg-[#003a63]">
                    {saving ? <Loader2 className="animate-spin mr-2" size={16} /> : <Save size={16} className="mr-2" />} Save
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}> <X size={16} /> </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)} className="bg-[#004a7c] hover:bg-[#003a63] font-bold">Edit Profile</Button>
              )}
            </div>
          </div>
        </DashboardCard>

        {/* Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <DashboardCard className="bg-white p-6 rounded-2xl shadow-sm border-none">
              <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2 border-b pb-2"><User size={20} className="text-[#004a7c]" /> Identity & Health</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-400 uppercase">Full Name</Label>
                  {isEditing ? <Input value={profile.name} onChange={(e) => setProfile({...profile, name: e.target.value})} /> : <p className="font-semibold">{profile.name}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-400 uppercase text-red-500">Blood Group</Label>
                  {isEditing ? (
                    <select 
                      className="w-full border border-slate-200 rounded-md p-2 text-sm focus:ring-2 focus:ring-[#004a7c] outline-none bg-white" 
                      value={profile.bloodGroup} 
                      onChange={(e) => setProfile({...profile, bloodGroup: e.target.value})}
                    >
                      <option value="">Select Type</option>
                      {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  ) : (
                    <p className="font-bold text-red-600">{profile.bloodGroup || "Not Specified"}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-400 uppercase">Occupation</Label>
                  {isEditing ? <Input value={profile.occupation} onChange={(e) => setProfile({...profile, occupation: e.target.value})} /> : <p className="font-semibold">{profile.occupation || "Not Specified"}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-400 uppercase">Date of Birth</Label>
                  {isEditing ? <Input type="date" value={profile.dob} onChange={(e) => setProfile({...profile, dob: e.target.value})} /> : <p className="font-semibold">{profile.dob || "Not Set"}</p>}
                </div>
              </div>
            </DashboardCard>

            <DashboardCard className="bg-white p-6 rounded-2xl shadow-sm border-none">
              <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2 border-b pb-2"><MapPin size={20} className="text-[#004a7c]" /> Contact Info</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2"><Label className="text-xs font-bold text-slate-400 uppercase">Email</Label><p className="bg-slate-50 p-2 rounded text-slate-500">{profile.email}</p></div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-400 uppercase">Phone</Label>
                  {isEditing ? <Input value={profile.phone} onChange={(e) => setProfile({...profile, phone: e.target.value})} /> : <p className="font-semibold">{profile.phone}</p>}
                </div>
                <div className="col-span-full space-y-2">
                  <Label className="text-xs font-bold text-slate-400 uppercase">Address</Label>
                  {isEditing ? <Input value={profile.address} onChange={(e) => setProfile({...profile, address: e.target.value})} /> : <p className="font-semibold">{profile.address || "Not Set"}</p>}
                </div>
              </div>
            </DashboardCard>
          </div>

          <div className="space-y-6">
            <DashboardCard className="bg-red-50 p-6 rounded-2xl border-l-4 border-l-red-500 border-none shadow-sm">
              <h3 className="font-bold text-red-800 mb-4 flex items-center gap-2"><ShieldAlert size={18} /> Emergency Contact</h3>
              <div className="space-y-4 text-sm">
                <div>
                  <Label className="text-[10px] font-bold text-red-400 uppercase">Contact Name</Label>
                  {isEditing ? <Input className="bg-white" value={profile.emergencyContact} onChange={(e) => setProfile({...profile, emergencyContact: e.target.value})} /> : <p className="font-bold text-slate-700">{profile.emergencyContact || "Not Set"}</p>}
                </div>
                <div>
                  <Label className="text-[10px] font-bold text-red-400 uppercase">Emergency Phone</Label>
                  {isEditing ? <Input className="bg-white" value={profile.emergencyPhone} onChange={(e) => setProfile({...profile, emergencyPhone: e.target.value})} /> : <p className="font-bold text-slate-700">{profile.emergencyPhone || "Not Set"}</p>}
                </div>
              </div>
            </DashboardCard>

            <div className="bg-[#004a7c] text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
               <Fingerprint size={100} className="absolute -right-4 -bottom-4 opacity-10 rotate-12" />
               <h4 className="font-bold text-blue-200 uppercase text-[10px] tracking-widest mb-2">Notice</h4>
               <p className="text-xs leading-relaxed relative z-10">
                 Keep your profile updated. Accurate blood type and contact info are critical for your care at Alatyon Hospital.
               </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}