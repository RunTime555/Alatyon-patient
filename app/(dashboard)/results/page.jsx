"use client";
import { useState } from "react";
import { Plus, Trash2, Save, Beaker, ChevronDown, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// ቀድሞ የተዘጋጁ ምርጫዎች
const COMMON_TESTS = [
  { label: "Hematology (HGB)", category: "Hematology", unit: "g/dL" },
  { label: "Blood Glucose", category: "Chemistry", unit: "mg/dL" },
  { label: "Creatinine", category: "Kidney Function", unit: "mg/dL" },
  { label: "Urine Analysis", category: "Urinalysis", unit: "N/A" },
];

export default function SmartLabEntry() {
  const [entries, setEntries] = useState([
    { id: Date.now(), testName: "", category: "", testValue: "", unit: "", isManual: false }
  ]);

  const addRow = () => {
    setEntries([...entries, { id: Date.now(), testName: "", category: "", testValue: "", unit: "", isManual: false }]);
  };

  const removeRow = (id) => {
    if (entries.length > 1) setEntries(entries.filter(row => row.id !== id));
  };

  const handleChange = (id, field, value) => {
    const updated = entries.map(row => {
      if (row.id === id) {
        if (field === "testName") {
          if (value === "CUSTOM") {
            return { ...row, testName: "", isManual: true, category: "", unit: "" };
          }
          const template = COMMON_TESTS.find(t => t.label === value);
          return { 
            ...row, 
            testName: value, 
            isManual: false, 
            category: template?.category || "", 
            unit: template?.unit || "" 
          };
        }
        return { ...row, [field]: value };
      }
      return row;
    });
    setEntries(updated);
  };

  return (
    <div className="max-w-6xl mx-auto p-8 bg-white rounded-[40px] shadow-2xl border border-slate-100">
      <div className="flex justify-between items-center mb-10">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 bg-[#004a7c] rounded-2xl flex items-center justify-center shadow-lg shadow-blue-900/20 text-white">
            <Beaker size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Smart Result Entry</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Alatyon Digital Lab</p>
          </div>
        </div>
        <Button onClick={addRow} className="rounded-2xl bg-blue-50 text-[#004a7c] hover:bg-blue-100 font-black px-6 border-none shadow-none">
          <Plus size={20} className="mr-2" /> Add Record
        </Button>
      </div>

      <div className="space-y-6">
        {entries.map((row) => (
          <div key={row.id} className="grid grid-cols-1 lg:grid-cols-12 gap-4 p-6 bg-slate-50/50 border border-slate-100 rounded-[30px] items-end transition-all hover:bg-white hover:shadow-md">
            
            {/* Test Selection */}
            <div className="lg:col-span-3">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-2 block tracking-widest">Test Name</label>
              {!row.isManual ? (
                <div className="relative">
                  <select 
                    className="w-full h-12 bg-white border-none rounded-2xl px-4 text-sm font-bold shadow-sm appearance-none focus:ring-2 focus:ring-blue-500"
                    value={row.testName}
                    onChange={(e) => handleChange(row.id, "testName", e.target.value)}
                  >
                    <option value="">Select a test...</option>
                    {COMMON_TESTS.map(t => <option key={t.label} value={t.label}>{t.label}</option>)}
                    <option value="CUSTOM" className="text-blue-600 font-bold">+ Other (Manual Entry)</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-4 text-slate-300" size={16} />
                </div>
              ) : (
                <div className="relative">
                  <Input 
                    placeholder="Enter test name..." 
                    className="h-12 rounded-2xl border-2 border-blue-100 bg-white font-bold"
                    value={row.testName}
                    onChange={(e) => handleChange(row.id, "testName", e.target.value)}
                  />
                  <button 
                    onClick={() => handleChange(row.id, "testName", "")} 
                    className="absolute right-3 top-3 text-[10px] font-bold text-blue-500 hover:underline"
                  >
                    Back to List
                  </button>
                </div>
              )}
            </div>

            {/* Category */}
            <div className="lg:col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-2 block tracking-widest">Category</label>
              <Input 
                placeholder="Category"
                className="h-12 rounded-2xl border-none bg-white shadow-sm font-medium"
                value={row.category}
                disabled={!row.isManual}
                onChange={(e) => handleChange(row.id, "category", e.target.value)}
              />
            </div>

            {/* Value */}
            <div className="lg:col-span-3">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-2 block tracking-widest">Result Value</label>
              <div className="relative">
                <Input 
                  placeholder="0.00"
                  className="h-12 rounded-2xl border-none bg-white shadow-sm font-black text-blue-900 text-lg pl-4"
                  value={row.testValue}
                  onChange={(e) => handleChange(row.id, "testValue", e.target.value)}
                />
                <span className="absolute right-4 top-3 text-xs font-bold text-slate-300 uppercase">{row.unit || "unit"}</span>
              </div>
            </div>

            {/* Manual Unit Entry (Only if manual) */}
            <div className="lg:col-span-2">
               <label className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-2 block tracking-widest">Unit</label>
               <Input 
                placeholder="e.g. mg/L"
                className="h-12 rounded-2xl border-none bg-white shadow-sm font-medium"
                value={row.unit}
                disabled={!row.isManual}
                onChange={(e) => handleChange(row.id, "unit", e.target.value)}
              />
            </div>

            {/* Remove Action */}
            <div className="lg:col-span-2 flex justify-end pb-1">
              <Button 
                variant="ghost" 
                className="h-12 w-12 rounded-2xl text-red-200 hover:text-red-500 hover:bg-red-50"
                onClick={() => removeRow(row.id)}
              >
                <Trash2 size={20} />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 flex items-center justify-between bg-slate-50 p-6 rounded-[30px]">
        <div className="flex items-center gap-2 text-slate-400">
           <Edit3 size={16} />
           <p className="text-sm font-bold uppercase tracking-tighter">Ready to sync {entries.length} records</p>
        </div>
        <Button className="bg-[#004a7c] hover:bg-blue-900 h-14 px-12 rounded-2xl font-black shadow-xl shadow-blue-900/30">
          <Save className="mr-2" size={20} /> Save All Results
        </Button>
      </div>
    </div>
  );
}