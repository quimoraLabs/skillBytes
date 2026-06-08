"use client";

import { useEffect, useState } from "react";
import Form from "../../_components/manage/Form";
import toast from "react-hot-toast";
import { useContentStore } from "@/app/stores/useContentStore";
import { ContentStoreState } from "../../types/exam";
import Table from "../../_components/shared/Table";

export default function ChapterManagementPortal() {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [subjectName, setSubjectName] = useState("");

  const subjects = useContentStore(
    (state: ContentStoreState) => state.subjects,
  );

  const chapters = useContentStore(
    (state: ContentStoreState) => state.chapters,
  );

  // console.log(subjects);
  const isLoading = useContentStore(
    (state: ContentStoreState) => state.isLoading,
  );

  const fetchChaptersBySubject = useContentStore(
  (state: ContentStoreState) => state.fetchChaptersBySubject,
);

  const createChapter = useContentStore(
    (state: ContentStoreState) => state.createChapter,
  );
  const fetchSubjects = useContentStore(
    (state: ContentStoreState) => state.getAllSubjects,
  );

  // 1. Initial Load: Fetch parents (exams) first to satisfy hierarchy structure
  useEffect(() => {
    fetchSubjects().catch((err) =>
      console.error("Initial subject fetch failed:", err),
    );

  }, [fetchSubjects]);

  // 2. Reactive Fetch: Fetch matching subjects only when a valid exam scope is active
  useEffect(() => {
    if (!selectedSubjectId) return;

    const handleGetSubjects = async () => {
      try {
        await fetchChaptersBySubject(selectedSubjectId);
      } catch (error) {
        console.error("Error fetching nested subjects:", error);
      }
    };

    handleGetSubjects();
  }, [selectedSubjectId, fetchChaptersBySubject]);

  const handleCreateSubject = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedSubjectId) {
      toast.error("Please select a parent Subject stream first!");
      return;
    }
    if (!subjectName.trim()) return;

    try {
      const result = await createChapter({
        name: subjectName.trim(),
        // description: subjectDesc.trim(),
        subject_id: selectedSubjectId, // Dynamic context linking mapping injected here
      });

      if (result.success) {
        toast.success(`Chapter "${subjectName}" saved successfully! 🚀`);
        setSubjectName("");
      } else {
        toast.error("Failed to create chapter. Check API logs.");
      }
    } catch (error) {
      toast.error("Something went wrong while saving!");
      console.error("Error adding chapter:", error);
    }
  };
  console.log(subjects);

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Page Context Branding Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-gray-800 tracking-tight">
            Content Creation Engine
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Isolated entity factory workspace block for adding database
            properties.
          </p>
        </div>

        {/* Global parent mapping drop context block */}
        <div className="flex flex-col gap-1.5 w-full md:w-64">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">
            Select Scope Parent (Subject)
          </label>
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-slate-400 transition"
          >
            <option value="">-- Choose Target Active Subject --</option>
            {subjects?.map(
              (
                subject: { id?: string; name?: string; exam_id?: string },
                index: number,
              ) => (
                <option key={index} value={subject?.id}>
                  {subject.name}
                </option>
              ),
            )}
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
            buttonText={
              selectedSubjectId
                ? "Save Chapter Entry"
                : "Select a Subject First"
            }
          />
        </div>

        {/* Dynamic reactive datatable presentation mapping array */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-2xs">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Chapters Node Pipeline Output
            </h3>
            <p className="text-xs text-slate-400">
              Live operational records matching active state mapping selection
              scopes.
            </p>
          </div>
          <Table
            data={chapters}
            loading={isLoading}
            header={["S No.", "Name"]}
          />
        </div>
      </div>
    </div>
  );
}
