"use client";

import { useEffect, useState } from "react";
import Form from "../../_components/manage/Form";
import toast from "react-hot-toast"; 
import { useContentStore } from "@/app/stores/useContentStore";
import { ContentStoreState } from "../../types/exam"; 
import Table from "../../_components/shared/Table";

export default function SubjectManagementPortal() {
  const [selectedExamId, setSelectedExamId] = useState<string>("");
  const [subjectName, setSubjectName] = useState("");

  // Direct state slice mapping from centralized zustand engine
  const exams = useContentStore((state: ContentStoreState) => state.exams);
  const subjects = useContentStore((state: ContentStoreState) => state.subjects);
  // console.log(subjects);
  const isLoading = useContentStore((state: ContentStoreState) => state.isLoading);
  
  const fetchExams = useContentStore((state: ContentStoreState) => state.fetchExams);
  const createSubject = useContentStore((state: ContentStoreState) => state.createSubject);
  const fetchSubjects = useContentStore((state: ContentStoreState) => state.fetchSubjectsByExam);

  // 1. Initial Load: Fetch parents (exams) first to satisfy hierarchy structure
  useEffect(() => {
    fetchExams().catch((err) => console.error("Initial exam fetch failed:", err));
  }, [fetchExams]);

  // 2. Reactive Fetch: Fetch matching subjects only when a valid exam scope is active
  useEffect(() => {
    if (!selectedExamId) return;

    const handleGetSubjects = async () => {
      try {
        await fetchSubjects(selectedExamId); 
      } catch (error) {
        console.error("Error fetching nested subjects:", error);
      }
    };

    handleGetSubjects(); 
  }, [selectedExamId, fetchSubjects]);

  const handleCreateSubject = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedExamId) {
      toast.error("Please select a parent Exam stream first!");
      return;
    }
    if (!subjectName.trim()) return;
    
    try {
      const result = await createSubject({
        name: subjectName.trim(),
        // description: subjectDesc.trim(),
        exam_id: selectedExamId, // Dynamic context linking mapping injected here
      });

      if (result.success) {
        toast.success(`Subject "${subjectName}" saved successfully! 🚀`);
        setSubjectName("");
      } else {
        toast.error("Failed to create subject. Check API logs.");
      }
    } catch (error) {
      toast.error("Something went wrong while saving!");
      console.error("Error adding subject:", error);
    }
  };

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Page Context Branding Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-gray-800 tracking-tight">Content Creation Engine</h1>
          <p className="text-xs text-gray-400 mt-0.5">Isolated entity factory workspace block for adding database properties.</p>
        </div>

        {/* Global parent mapping drop context block */}
        <div className="flex flex-col gap-1.5 w-full md:w-64">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">Select Scope Parent (Exam)</label>
          <select 
            value={selectedExamId}
            onChange={(e) => setSelectedExamId(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-slate-400 transition"
          >
            <option value="">-- Choose Target Active Exam --</option>
            {exams?.map((exam: { _id?: string; name?: string; exam_id?: string },index: number) => (
              <option key={index} value={exam?.exam_id}>
                {exam.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Primary Structural Workspace Area split grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <div className="bg-white p-2 rounded-2xl border border-slate-100 shadow-2xs">
          <Form 
            handleSubmit={handleCreateSubject} 
            nameValue={subjectName} 
            setNameValue={setSubjectName} 
            showDescription={false} 
            buttonText={selectedExamId ? "Save Subject Entry" : "Select an Exam First"} 
          />
        </div>

        {/* Dynamic reactive datatable presentation mapping array */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-2xs">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Subjects Node Pipeline Output</h3>
            <p className="text-xs text-slate-400">Live operational records matching active state mapping selection scopes.</p>
          </div>
          {
            selectedExamId ? (
              <Table data={subjects}  loading={isLoading} header={["S No.","Name"]}  />
            ) : (
              <p className="text-xs text-red-500 mb-2">Please select an Exam to view its Subjects.</p>
            )
          }
        </div>
      </div>
    </div>
  );
}
