"use client";

import { useEffect, useState } from "react";
import Form from "../../_components/manage/Form";
import toast from "react-hot-toast"; 
import { useContentStore } from "@/app/stores/useContentStore";
import { ContentStoreState } from "../../types/exam"; 
import Table from "../../_components/shared/Table";

export default function ContentManagementPortal() {
  const [examName, setExamName] = useState("");
  const [examDesc, setExamDesc] = useState(""); 

  // 1. Extract the active data array and states directly from the Zustand global store
  const exams = useContentStore((state: ContentStoreState) => state.exams);
  const isLoading = useContentStore((state: ContentStoreState) => state.isLoading);
  
  // 2. Select actions required for creating and fetching records
  const createExam = useContentStore((state: ContentStoreState) => state.createExam);
  const fetchExams = useContentStore((state: ContentStoreState) => state.fetchExams);

  useEffect(() => {
    const handleGetExams = async () => {
      try {
        await fetchExams(); // Updates internal global store array state reactively
        toast.success("Exams loaded successfully! 🚀");
      } catch (error) {
        toast.error("Failed to load existing exams.");
        console.error("Error fetching exams:", error);
      }
    };

    handleGetExams(); 
  }, [fetchExams]);

  const handleCreateExam = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!examName.trim()) return;
    
    try {
      const result = await createExam({
        name: examName.trim(),
        description: examDesc.trim(),
      });

      if (result.success) {
        toast.success(`Exam "${examName}" saved successfully! 🚀`);
        setExamName("");
        setExamDesc("");
      } else {
        toast.error("Failed to create exam. Please check server constraints.");
      }
    } catch (error) {
      toast.error("Something went wrong while saving!");
      console.error("Error adding exam:", error);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-black text-gray-800 tracking-tight">Content Creation Engine</h1>
        <p className="text-xs text-gray-400 mt-0.5">Isolated entity factory workspace block for adding database properties.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Form 
          handleSubmit={handleCreateExam} 
          nameValue={examName} 
          setNameValue={setExamName} 
          showDescription={true} 
          descValue={examDesc}
          setDescValue={setExamDesc}
          buttonText="Save Exam Entry" 
        />

        {/* 3. FIXED: Passed 'exams' (array) instead of 'fetchExams' (async function) */}
        <Table data={exams} loading={isLoading} header={["Name", "Description"]} />
      </div>
    </div>
  );
}
