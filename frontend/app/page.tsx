"use client";
import { useEffect, useRef } from "react";
import { useQuizStore } from "./stores/apiStore";
import BotBubble from "./components/UI/BotBubble";
import UserBubble from "./components/UI/UserBubble";
import OptionsGrid from "./components/UI/OptionsGrid";

export default function WhatsAppQuizFlow() {
  // Destructure all required global tracking configurations from the Zustand hook
  const {
    currentStep,
    guestId,
    exams,
    subjects,
    chapters,
    quizzes,
    selectedExam,
    selectedSubject,
    selectedChapter,
    quizErrorMessage,
    selectQuiz,
    startActualQuiz,
    currentQuestionIndex,
    questions,
    submitAnswer,
    quizResult,
    isLoading,
    goBack,
    initGuestSession,
    selectExam,
    selectSubject,
    selectChapter,
  } = useQuizStore();

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Safely extract the active question node object reference from current index boundary pointer
  const currentQuestion = questions[currentQuestionIndex];

  // Triggers smooth scrolling mechanics down to screen footer whenever view step arrays update
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentStep, selectedExam, selectedSubject, selectedChapter, currentQuestionIndex, isLoading]);

  

  return (
    <div className="flex flex-col h-screen bg-[#e5ddd5] overflow-hidden">
      
      {/* 🟢 WhatsApp Application Sticky Header Title Workspace */}
      <div className="bg-[#075e54] text-white px-4 py-3 flex items-center shadow-md shrink-0">
        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-emerald-800 mr-3">
          SB
        </div>
        <div>
          <h2 className="font-semibold text-sm">SkillBytes Bot 🤖</h2>
          <p className="text-xs text-emerald-200">
            {guestId ? `ID: ${guestId}` : "Welcome Guest"}
          </p>
        </div>
      </div>

      {/* 💬 Main Virtual Messaging Chat Stream Feed Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        
        {/* Step Rolling Control: Dynamic Back Button Setup */}
        {currentStep !== 'welcome' && currentStep !== 'quiz' && currentStep !== 'result' && (
          <div className="w-full max-w-md flex justify-start mb-2">
            <button
              onClick={goBack}
              className="text-xs font-semibold text-gray-500 hover:text-emerald-700 transition-colors py-1 px-3 bg-white border border-gray-300 rounded-lg shadow-sm"
            >
              ← Back
            </button>
          </div>
        )}

        {/* Dynamic Section 1: Welcome Screen Prompt Anchor */}
        <div className="flex flex-col items-center justify-center my-4 text-center">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 max-w-sm w-full">
            <h1 className="text-xl font-bold text-gray-800 mb-1">
              Welcome to SkillBytes
            </h1>
            <p className="text-gray-500 text-xs mb-4">
              Ready to test your academic skills?
            </p>
            {currentStep === "welcome" && (
              <button
                onClick={initGuestSession}
                disabled={isLoading}
                className="w-full bg-[#128c7e] text-white font-semibold py-2.5 px-4 rounded-xl text-sm transition-all shadow-md hover:bg-[#0b665c] disabled:bg-gray-300"
              >
                {isLoading ? "Creating Session..." : "Ready, Steady, Go! 🚀"}
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Section 2: Exam Directories Component Render Grid */}
        {currentStep !== "welcome" && (
          <>
            <BotBubble text="Please select the Exam you are preparing for:" />
            {selectedExam ? (
              <UserBubble text={`Selected Exam: ${selectedExam}`} />
            ) : (
              <OptionsGrid
                options={exams}
                onSelect={(id, name) => selectExam(id, name)}
                onBack={goBack}
              />
            )}
          </>
        )}

        {/* Dynamic Section 3: Subject Configuration Choice Component Grid */}
        {selectedExam && currentStep !== "exam" && (
          <>
            <BotBubble text={`Awesome! Now choose a Subject under ${selectedExam}:`} />
            {selectedSubject ? (
              <UserBubble text={`Selected Subject: ${selectedSubject}`} />
            ) : (
              <OptionsGrid
                options={subjects}
                onSelect={(id, name) => selectSubject(id, name)}
                onBack={goBack}
              />
            )}
          </>
        )}

        {/* Dynamic Section 4: Chapter Lookup Selector Engine Workflow */}
        {selectedSubject && currentStep !== "exam" && currentStep !== "subject" && (
          <>
            <BotBubble text="Great choice. Finally, pick a Chapter to investigate:" />
            {selectedChapter ? (
              <UserBubble text={`Selected Chapter: ${selectedChapter}`} />
            ) : (
              <OptionsGrid
                options={chapters}
                onSelect={(id, name) => selectChapter(id, name)}
              />
            )}
          </>
        )}

        {/* 📋 Dynamic Section 5: Multiple Quizzes Chooser Hub List */}
        {currentStep === 'quiz_list' && (
          <>
            <BotBubble text="Multiple Practice tests found for this node. Please pick one below:" />
            <OptionsGrid
              options={quizzes}
              onSelect={(id, name) => selectQuiz(id, name)}
              onBack={goBack}
            />
          </>
        )}

        {/* 🎯 Dynamic Section 6: Quiz Overview Landing Confirmation Modal Block */}
        {currentStep === 'quiz_overview' && (
          <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm text-center max-w-sm mx-auto w-full my-4">
            <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-3 text-xl">
              📝
            </div>
            <h2 className="text-base font-bold text-gray-800 mb-1">Ready to start the Quiz?</h2>
            <p className="text-xs text-gray-400 mb-5 leading-relaxed">
              You have selected <span className="font-semibold text-gray-600">{selectedChapter}</span>. 
              Click below to initialize your live test tracking state.
            </p>

            <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 text-left mb-6 text-xs text-gray-500 space-y-2">
              <div>⏱️ <span className="font-semibold">Duration:</span> 30 Minutes</div>
              <div>📊 <span className="font-semibold">Format:</span> Multiple Choice Questions</div>
            </div>

            {quizErrorMessage && (
              <div className="text-xs text-red-600 bg-red-50 border border-red-100 p-3 rounded-xl mb-4">
                {quizErrorMessage}
              </div>
            )}

            <button
              onClick={startActualQuiz}
              disabled={isLoading}
              className="w-full bg-[#128c7e] hover:bg-[#0b665c] disabled:bg-gray-300 text-white font-bold text-xs py-3.5 rounded-xl shadow-md transition-all tracking-wide uppercase focus:outline-none"
            >
              {isLoading ? "Starting Session..." : "Start Test Now 🚀"}
            </button>
          </div>
        )}

        {/* ✋ No questions were returned from the quiz start payload */}
        {currentStep === 'no_questions' && (
          <div className="bg-white border border-red-200 p-6 rounded-2xl shadow-sm text-center max-w-sm mx-auto w-full my-4">
            <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-3 text-xl">
              ⚠️
            </div>
            <h2 className="text-base font-bold text-gray-800 mb-2">No Questions Found</h2>
            <p className="text-xs text-gray-500 mb-5 leading-relaxed">
              {quizErrorMessage || 'The selected quiz has no questions available at this moment.'}
            </p>
            <button
              onClick={goBack}
              className="w-full bg-[#128c7e] hover:bg-[#0b665c] text-white font-bold text-xs py-3.5 rounded-xl shadow-md transition-all tracking-wide uppercase focus:outline-none"
            >
              Choose Another Chapter
            </button>
          </div>
        )}

        {/* Dynamic Section 7: Live Question & Answers Flow Controller Card */}
        {currentStep === 'quiz' && !currentQuestion && (
          <div className="bg-white border border-red-200 p-5 rounded-2xl shadow-sm max-w-md mx-auto w-full my-2 text-center">
            <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-3 text-xl">
              ⚠️
            </div>
            <p className="text-xs text-gray-500 mb-4">
              We could not load the current question. Please return and restart the quiz.
            </p>
            <button
              onClick={goBack}
              className="w-full bg-[#128c7e] hover:bg-[#0b665c] text-white font-bold text-xs py-3 rounded-xl shadow-md transition-all tracking-wide uppercase"
            >
              Back to Chapters
            </button>
          </div>
        )}
        {currentStep === 'quiz' && currentQuestion && (
          <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm max-w-md mx-auto w-full my-2">
            <div className="flex justify-between items-center text-xs font-bold text-gray-400 mb-4 tracking-wide uppercase">
              <span>{selectedChapter}</span>
              <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
            </div>

            <h3 className="text-base font-semibold text-gray-800 mb-5 leading-relaxed">
              {currentQuestion.text}
            </h3>

            <div className="grid grid-cols-1 gap-2.5 mb-5">
              {Array.isArray(currentQuestion.options) && currentQuestion.options.map((opt: unknown, idx: number) => {
                const optionText = typeof opt === 'string' ? opt : (opt as { text: string }).text;
                return (
                  <button
                    key={idx}
                    onClick={() => submitAnswer(optionText, false)}
                    className="w-full bg-gray-50 hover:bg-emerald-50 hover:border-emerald-300 border border-gray-200 transition-all text-left text-sm py-3 px-4 rounded-xl font-medium text-gray-700 focus:outline-none"
                  >
                    {optionText}
                  </button>
                );
              })}
            </div>

            <div className="flex justify-end border-t border-gray-100 pt-3">
              <button
                onClick={() => submitAnswer(null, true)}
                className="text-xs font-bold text-gray-400 hover:text-red-500 transition-colors uppercase tracking-wider px-3 py-1.5"
              >
                Skip Question →
              </button>
            </div>
          </div>
        )}

        {/* Dynamic Section 8: Evaluation Results Dashboard Screen */}
        {currentStep === 'result' && (
          <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm text-center max-w-sm mx-auto w-full my-4">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-bold">
              ✓
            </div>
            <h2 className="text-lg font-bold text-gray-800 mb-1">Attempt Completed!</h2>
            
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-left grid grid-cols-2 gap-4 my-4">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 block">Total Score</span>
                <span className="text-lg font-extrabold text-gray-700">
                  {quizResult && typeof quizResult === 'object' && 'score' in quizResult ? String(quizResult.score) : '0'}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 block">Status</span>
                <span className="text-sm font-bold text-emerald-600 mt-1 block">Submitted</span>
              </div>
            </div>

            <button
              onClick={goBack}
              className="w-full bg-gray-800 hover:bg-gray-900 text-white font-bold text-xs py-3 rounded-xl shadow-md transition-all uppercase"
            >
              Back to Chapters
            </button>
          </div>
        )}

        {/* Active Application Typing Loader Feed */}
        {isLoading && (
          <div className="text-xs text-gray-400 italic animate-pulse pl-4 py-2">
            Typing...
          </div>
        )}

        {/* Auto Scroll Anchor Node */}
        <div ref={chatEndRef} />
      </div>
    </div>
  );
}