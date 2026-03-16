import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlayCircle, Clock, FileText, Search } from 'lucide-react';
import api from '../api/axios';

export default function AvailableQuizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const response = await api.get('/student/available-quizzes');
        setQuizzes(response.data);
      } catch (err) {
        console.warn('Using mock available quizzes:', err);
        setQuizzes([
          { id: 101, title: 'React Performance Optimization', timer: 1200, questions_count: 10, instructor_name: 'Alice Freeman' },
          { id: 102, title: 'Node.js Security Best Practices', timer: 2400, questions_count: 20, instructor_name: 'Bob Johnson' },
          { id: 103, title: 'Advanced CSS Layouts', timer: 1800, questions_count: 15, instructor_name: 'Charlie Davis' },
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuizzes();
  }, []);

  const filteredQuizzes = quizzes.filter(q =>
    q.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Available Quizzes</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">Select a quiz below to begin your attempt.</p>
        </div>

        <div className="relative w-full sm:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search quizzes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-600 outline-none shadow-sm text-sm text-slate-900 dark:text-white transition-colors"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 bg-white dark:bg-slate-900 rounded-2xl animate-pulse shadow-sm border border-slate-100 dark:border-slate-800"></div>
          ))}
        </div>
      ) : filteredQuizzes.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
          <FileText size={48} className="mx-auto text-slate-400 mb-4" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-white">No quizzes available</h3>
          <p className="mt-1 text-slate-500 dark:text-slate-400">You're all caught up! Check back later for new assignments.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuizzes.map((quiz) => (
            <div key={quiz.id} className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md transition-shadow group flex flex-col">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors mb-2">
                  {quiz.title}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Instructor: {quiz.instructor_name}</p>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <Clock size={16} className="text-primary-500" />
                    <span className="text-sm font-medium">{Math.floor(quiz.timer / 60)} mins</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <FileText size={16} className="text-indigo-500" />
                    <span className="text-sm font-medium">{quiz.questions_count} Questions</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => navigate(`/student-dashboard/take-quiz/${quiz.id}`)}
                  className="w-full flex items-center justify-center gap-2 bg-slate-900 dark:bg-primary-600 text-white px-4 py-2.5 rounded-xl font-medium shadow-sm hover:bg-slate-800 dark:hover:bg-primary-500 transition-colors"
                >
                  <PlayCircle size={20} />
                  Start Quiz
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
