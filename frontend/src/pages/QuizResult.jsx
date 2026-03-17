import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Target, CheckCircle, Trophy, ArrowRight } from 'lucide-react';

export default function QuizResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state?.result;

  if (!result) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Result Not Found</h2>
        <button onClick={() => navigate('/student-dashboard')} className="mt-4 text-primary-600 hover:underline">
          Return to Dashboard
        </button>
      </div>
    );
  }

  const isPassed = (result.percentageScore || 0) >= 70;

  return (
    <div className="max-w-3xl mx-auto py-12">
      <div className="bg-white dark:bg-slate-950 rounded-3xl p-8 sm:p-12 shadow-sm border border-slate-200 dark:border-slate-800 text-center transition-colors">
        
        <div className={`mx-auto w-24 h-24 rounded-full flex items-center justify-center mb-8 ${isPassed ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400' : 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400'}`}>
          {isPassed ? <Trophy size={48} /> : <Target size={48} />}
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
          {isPassed ? 'Congratulations!' : 'Keep Practicing!'}
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 mb-10">
          You completed <span className="font-semibold text-slate-900 dark:text-white">{result.quizTitle}</span>
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-lg mx-auto mb-12">
          <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Final Score</p>
            <p className={`text-4xl font-bold ${isPassed ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
              {result.percentageScore}%
            </p>
          </div>
          
          <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Correct Answers</p>
            <p className="text-4xl font-bold text-slate-900 dark:text-white">
              {result.correctCount} <span className="text-xl text-slate-400">/ {result.totalQuestions}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            to="/student-dashboard"
            className="w-full sm:w-auto px-8 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-semibold rounded-xl transition-colors"
          >
            Back to Dashboard
          </Link>
          <Link 
            to="/student-dashboard/quizzes"
            className="w-full sm:w-auto px-8 py-3 bg-primary-600 hover:bg-primary-500 text-white font-semibold rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
          >
            Explore Quizzes
            <ArrowRight size={20} />
          </Link>
        </div>

      </div>
    </div>
  );
}
