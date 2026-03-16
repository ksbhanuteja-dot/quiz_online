import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, Plus, Edit2, Trash2, Clock, Users } from 'lucide-react';
import api from '../api/axios';

export default function QuizList() {
  const [quizzes, setQuizzes] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const response = await api.get('/instructor/quizzes/');
      setQuizzes(response.data || []);
      setError(null); // Clear any previous errors on success
    } catch (err) {
      console.error("Failed to fetch quizzes:", err);
      setError(err.response?.data?.detail || "Failed to fetch quizzes. Please try again later.");
      setQuizzes([]); // Clear quizzes on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this quiz?')) return;
    
    try {
      await api.delete(`/instructor/quizzes/${id}`);
      setQuizzes(quizzes.filter(q => q.id !== id));
    } catch (err) {
      console.error("Failed to delete", err);
      // Mock delete
      setQuizzes(quizzes.filter(q => q.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-200 mb-6">
          {error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">My Quizzes</h1>
          <p className="mt-2 text-slate-600">Manage your created quizzes and view quick stats.</p>
        </div>
        <Link 
          to="/dashboard/create-quiz"
          className="inline-flex items-center justify-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-xl font-medium shadow-sm hover:bg-primary-500 transition-colors"
        >
          <Plus size={20} />
          Create Quiz
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-2xl p-6 h-48 animate-pulse shadow-sm border border-slate-100"></div>
          ))}
        </div>
      ) : quizzes.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
          <FileText size={48} className="mx-auto text-slate-400 mb-4" />
          <h3 className="text-lg font-medium text-slate-900">No quizzes yet</h3>
          <p className="mt-1 text-slate-500 mb-6">Create your first quiz to start assessing your students.</p>
          <Link 
            to="/dashboard/create-quiz"
            className="inline-flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-slate-800 transition-colors"
          >
            <Plus size={20} />
            Create First Quiz
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {quizzes.map((quiz) => (
            <div key={quiz.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow group flex flex-col">
              <div className="flex-1">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-slate-900 leading-tight group-hover:text-primary-600 transition-colors">{quiz.title}</h3>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => navigate(`/dashboard/edit-quiz/${quiz.id}`)}
                      className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors tooltip"
                      title="Edit Quiz"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(quiz.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors tooltip"
                      title="Delete Quiz"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Clock size={16} className="text-slate-400" />
                    <span className="text-sm font-medium">{Math.floor(quiz.timer / 60)} mins</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <FileText size={16} className="text-slate-400" />
                    <span className="text-sm font-medium">{quiz.questionsCount ?? 0} Qs</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 col-span-2">
                    <Users size={16} className="text-slate-400" />
                    <span className="text-sm font-medium">{quiz.attempts ?? 0} student attempts</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-slate-100 text-xs text-slate-500 font-medium tracking-wide uppercase text-center">
                Created: {quiz.created_at ? new Date(quiz.created_at).toLocaleDateString() : 'N/A'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
