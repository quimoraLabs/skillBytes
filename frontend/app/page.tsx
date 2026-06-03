'use client';
import { useEffect, useRef } from 'react';
import { useQuizStore } from './stores/apiStore';
import BotBubble from './components/UI/BotBubble';
import UserBubble from './components/UI/UserBubble';
import OptionsGrid from './components/UI/OptionsGrid';


export default function WhatsAppQuizFlow() {
  // Destructure everything from Zustand store
  const {
    currentStep, guestId, exams, subjects, chapters,
    selectedExam, selectedSubject, selectedChapter, isLoading,goBack,
    initGuestSession, selectExam, selectSubject, selectChapter
  } = useQuizStore();

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentStep, selectedExam, selectedSubject, selectedChapter, isLoading]);

  return (
    <div className="flex flex-col h-screen bg-[#e5ddd5] overflow-hidden">

      {/* Header */}
      <div className="bg-[#075e54] text-white px-4 py-3 flex items-center shadow-md shrink-0">
        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-emerald-800 mr-3">SB</div>
        <div>
          <h2 className="font-semibold text-sm">SkillBytes Bot 🤖</h2>
          <p className="text-xs text-emerald-200">{guestId ? `ID: ${guestId}` : 'Welcome Guest'}</p>
        </div>
      </div>

      {/* Main Chat Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {currentStep !== 'welcome' && (
        <div className="w-full max-w-md flex justify-start mb-4">
          <button
            onClick={goBack}
            className="flex items-center text-xs font-semibold text-gray-500 hover:text-emerald-600 transition-colors py-1 px-2.5 bg-gray-200/50 hover:bg-emerald-50 border border-gray-300 rounded-lg shadow-sm"
          >
            ← Back
          </button>
        </div>
      )}
        
        {/* Welcome Section */}
        <div className="flex flex-col items-center justify-center my-6 text-center">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 max-w-sm w-full">
            <h1 className="text-xl font-bold text-gray-800 mb-1">Welcome to SkillBytes</h1>
            <p className="text-gray-500 text-xs mb-4">Ready to test your academic skills?</p>
            {currentStep === 'welcome' && (
              <button 
                onClick={initGuestSession} 
                disabled={isLoading}
                className="w-full bg-[#128c7e] text-white font-semibold py-2.5 px-4 rounded-xl text-sm transition-all shadow-md"
              >
                {isLoading ? 'Creating Session...' : 'Ready, Steady, Go! 🚀'}
              </button>
            )}
          </div>
        </div>

        {/* Exam Section */}
        {currentStep !== 'welcome' && (
          <>
            <BotBubble text="Please select the Exam you are preparing for:" />
            {selectedExam ? (
              <UserBubble text={`Selected Exam: ${selectedExam}`} />
            ) : (
              <OptionsGrid options={exams}  onSelect={(id, name) => selectExam(id as string, name)} />
            )}
          </>
        )}

        {/* Subject Section */}
        {selectedExam && (
          <>
            <BotBubble text={`Awesome! Now choose a Subject under ${selectedExam}:`} />
            {selectedSubject ? (
              <UserBubble text={`Selected Subject: ${selectedSubject}`} />
            ) : (
              <OptionsGrid options={subjects} onSelect={(id, name) => selectSubject(id as string, name)} />
            )}
          </>
        )}

        {/* Chapter Section */}
        {selectedSubject && (
          <>
            <BotBubble text="Great choice. Finally, pick a Chapter to begin the quiz:" />
            {selectedChapter ? (
              <UserBubble text={`Selected Chapter: ${selectedChapter}`} />
            ) : (
              <OptionsGrid options={chapters} onSelect={(id, name) => selectChapter(id as string, name)} />
            )}
          </>
        )}

        {/* Loading Spinner Indicator */}
        {isLoading && <div className="text-xs text-gray-400 italic animate-pulse">Typing...</div>}

        <div ref={chatEndRef} />
      </div>
    </div>
  );
}