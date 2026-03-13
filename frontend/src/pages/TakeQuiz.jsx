import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, ChevronRight, ChevronLeft, Loader } from 'lucide-react';
import api from '../api/axios';

export default function TakeQuiz() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const timerRef = useRef(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await api.get(`/student/quizzes/${id}`);
        setQuiz(response.data);
        setTimeLeft(response.data.timer);
      } catch (err) {
        console.warn('Mocking quiz data:', err);
        const mockQuiz = {
          id: id,
          title: 'React Performance Optimization',
          timer: 600, // 10 mins
          questions: [
            { id: 1, text: 'Which hook should you use to memoize a computationally expensive pure function?', options: ['useState', 'useEffect', 'useMemo', 'useCallback'] },
            { id: 2, text: 'What does React.memo do?', options: ['Memoizes a function', 'Prevents re-rendering of a component if props did not change', 'Memoizes state', 'None of the above'] },
            { id: 3, text: 'Why might using index as a key in a mapped list be bad for performance?', options: ['It throws an error', 'It can cause React to unnecessarily re-render or mix up UI state on reorder', 'It uses more memory', 'Keys must be strings'] }
          ]
        };
        setQuiz(mockQuiz);
        setTimeLeft(mockQuiz.timer);
      }
    };
    fetchQuiz();
  }, [id]);

  const handleSubmit = useCallback(async (forced = false) => {
    if (!forced && !window.confirm('Are you sure you want to submit your quiz?')) return;
    
    setIsSubmitting(true);
    clearInterval(timerRef.current);

    const payload = {
      quizId: id,
      answers: answers
    };

    try {
      const response = await api.post(`/student/quizzes/${id}/submit`, payload);
      navigate(`/student-dashboard/results/${response.data.attemptId}`, { state: { result: response.data } });
    } catch (err) {
      console.warn('Mocking submission:', err);
      // Mock result processing
      let score = 0;
      const total = quiz.questions.length;
      // Mock logic: randomly assume correct or look for specific answers if we want
      score = Object.keys(answers).length > 0 ? Object.keys(answers).length : 0; 
      
      const mockResult = {
        score: Math.round((score / total) * 100),
        correctCount: score,
        totalQuestions: total,
        quizTitle: quiz.title
      };
      
      setTimeout(() => navigate(`/student-dashboard/results/${Date.now()}`, { state: { result: mockResult } }), 1000);
    }
  }, [id, answers, navigate, quiz]);

  // Timer logic
  useEffect(() => {
    if (quiz && timeLeft > 0 && !isSubmitting) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleSubmit(true); // Forced auto-submit
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [quiz, timeLeft, isSubmitting, handleSubmit]);

  if (!quiz) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader size={48} className="animate-spin text-primary-600" />
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = (index) => {
    setAnswers({
      ...answers,
      [currentQuestion.id]: index
    });
  };

  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;
  const isAnsweredAll = Object.keys(answers).length === quiz.questions.length;

  return (
    <div className="max-w-4xl mx-auto pb-24">
      <div className="sticky top-0 z-10 bg-slate-50 dark:bg-slate-900 pt-4 pb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-950 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white line-clamp-1">{quiz.title}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Question {currentQuestionIndex + 1} of {quiz.questions.length}</p>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${timeLeft < 60 ? 'bg-red-50 dark:bg-red-900/30 border-red-200 text-red-600 dark:text-red-400 animate-pulse' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'}`}>
            <Clock size={20} />
            <span className="font-bold font-mono text-lg">{formatTime(timeLeft)}</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full mt-6 overflow-hidden">
          <div 
            className="bg-primary-600 h-full transition-all duration-300"
            style={{ width: `${(Object.keys(answers).length / quiz.questions.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="mt-8 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-sm transition-colors">
        <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-white leading-relaxed mb-8">
          {currentQuestionIndex + 1}. {currentQuestion.text}
        </h2>

        <div className="space-y-4">
          {currentQuestion.options.map((option, index) => {
            const isSelected = answers[currentQuestion.id] === index;
            return (
              <button
                key={index}
                onClick={() => handleSelectOption(index)}
                className={`w-full flex items-center gap-4 p-4 text-left rounded-2xl border-2 transition-all ${
                  isSelected 
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-sm' 
                  : 'border-slate-200 dark:border-slate-800 hover:border-primary-300 dark:hover:border-primary-700 hover:bg-slate-50 dark:hover:bg-slate-900/50'
                }`}
              >
                <div className={`flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full border ${isSelected ? 'border-primary-500 bg-primary-500 text-white' : 'border-slate-400 dark:border-slate-600'}`}>
                  {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                </div>
                <span className={`flex-1 text-base sm:text-lg ${isSelected ? 'text-primary-900 dark:text-primary-100 font-medium' : 'text-slate-700 dark:text-slate-300'}`}>
                  {option}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20 lg:pl-64 flex justify-between items-center transition-colors">
        <div className="w-full max-w-4xl mx-auto flex justify-between items-center px-2">
          <button
            onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
            disabled={currentQuestionIndex === 0}
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-100 dark:hover:bg-slate-900 disabled:opacity-50 transition-colors"
          >
            <ChevronLeft size={20} />
            Previous
          </button>

          {!isLastQuestion ? (
            <button
              onClick={() => setCurrentQuestionIndex(prev => Math.min(quiz.questions.length - 1, prev + 1))}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 dark:bg-slate-800 text-white font-medium hover:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
            >
              Next
              <ChevronRight size={20} />
            </button>
          ) : (
            <button
              onClick={() => handleSubmit(false)}
              disabled={isSubmitting}
              className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold shadow-md transition-all ${
                isAnsweredAll 
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white' 
                : 'bg-primary-600 hover:bg-primary-500 text-white'
              } disabled:opacity-70 disabled:cursor-not-allowed`}
            >
              {isSubmitting ? (
                <><Loader size={20} className="animate-spin" /> Submitting...</>
              ) : (
                <><CheckCircle size={20} /> Submit Quiz</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
