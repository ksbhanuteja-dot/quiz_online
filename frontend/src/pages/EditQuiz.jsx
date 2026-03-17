import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Trash2, ArrowLeft, Save, GripVertical } from 'lucide-react';
import api from '../api/axios';

export default function EditQuiz() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [quizDetails, setQuizDetails] = useState({ title: '', timer: 1800 });
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const data = await api.get(`/instructor/quizzes/${id}`);
        setQuizDetails({ title: data.title, timer: data.timer });
        setQuestions(data.questions.map(q => {
          const correctIdx = q.options.findIndex(o => o.is_correct);
          return {
            ...q,
            text: q.question_text,
            correctOptionIndex: correctIdx === -1 ? 0 : correctIdx,
            options: q.options.map(o => typeof o === 'string' ? o : o.option_text)
          };
        }));
      } catch (err) {
        setError("Failed to load quiz data. Please try again.");
        console.error("API Fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuiz();
  }, [id]);

  const handleQuizDetailChange = (e) => setQuizDetails({ ...quizDetails, [e.target.name]: e.target.value });
  const handleAddQuestion = () => setQuestions([...questions, { id: Date.now(), text: '', options: ['', '', '', ''], correctOptionIndex: 0 }]);
  const handleRemoveQuestion = (qId) => { if(questions.length > 1) setQuestions(questions.filter(q => q.id !== qId)); };
  const handleQuestionTextChange = (qId, text) => setQuestions(questions.map(q => q.id === qId ? { ...q, text } : q));
  const handleOptionChange = (qId, optionIndex, text) => {
    setQuestions(questions.map(q => {
      if (q.id === qId) {
        const newOptions = [...q.options];
        newOptions[optionIndex] = text;
        return { ...q, options: newOptions };
      }
      return q;
    }));
  };
  const handleCorrectOptionChange = (qId, optionIndex) => setQuestions(questions.map(q => q.id === qId ? { ...q, correctOptionIndex: optionIndex } : q));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!quizDetails.title.trim() || questions.some(q => !q.text.trim()) || questions.some(q => q.options.some(opt => !opt.trim()))) {
      return setError('All fields must be filled');
    }

    setIsSubmitting(true);
    const payload = {
      title: quizDetails.title,
      timer: parseInt(quizDetails.timer),
      questions: questions.map(q => ({
        question_text: q.text,
        options: q.options.map((opt, idx) => ({
          option_text: opt,
          is_correct: idx === q.correctOptionIndex
        }))
      }))
    };

    try {
      await api.put(`/instructor/quizzes/${id}`, payload);
      navigate('/dashboard/quizzes');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update quiz.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="p-8 text-center text-slate-500">Loading quiz data...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/dashboard/quizzes')} className="p-2 hover:bg-slate-200 rounded-lg transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Edit Quiz</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Quiz Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">Quiz Title</label>
              <input type="text" name="title" value={quizDetails.title} onChange={handleQuizDetailChange} className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:ring-2 focus:ring-primary-600 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Timer (in seconds)</label>
              <input type="number" name="timer" value={quizDetails.timer} onChange={handleQuizDetailChange} className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:ring-2 focus:ring-primary-600 outline-none" />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-900">Questions</h2>
          {questions.map((q, qIndex) => (
            <div key={q.id} className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100 relative group">
              {questions.length > 1 && (
                <button type="button" onClick={() => handleRemoveQuestion(q.id)} className="absolute top-6 right-6 text-slate-400 hover:text-red-500 p-1.5 hover:bg-red-50 rounded-lg">
                  <Trash2 size={20} />
                </button>
              )}
              <div className="flex gap-4">
                <div className="mt-1 hidden sm:block"><GripVertical size={20} className="text-slate-300" /></div>
                <div className="flex-1 space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Question {qIndex + 1} text</label>
                    <textarea value={q.text} onChange={(e) => handleQuestionTextChange(q.id, e.target.value)} rows={2} className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:ring-2 focus:ring-primary-600 outline-none resize-y" />
                  </div>
                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-slate-700">Answers</label>
                    {q.options.map((opt, optIndex) => (
                      <div key={optIndex} className={`flex items-center gap-4 p-2 rounded-xl border ${q.correctOptionIndex === optIndex ? 'border-primary-500 bg-primary-50/50' : 'border-slate-200 hover:border-slate-300'}`}>
                        <div className="p-2">
                          <input type="radio" name={`correct-${q.id}`} checked={q.correctOptionIndex === optIndex} onChange={() => handleCorrectOptionChange(q.id, optIndex)} className="w-4 h-4 text-primary-600" />
                        </div>
                        <input type="text" value={opt} onChange={(e) => handleOptionChange(q.id, optIndex, e.target.value)} className="flex-1 bg-transparent px-2 py-1 outline-none text-slate-800" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
          <button type="button" onClick={handleAddQuestion} className="w-full py-6 border-2 border-dashed border-slate-300 rounded-2xl text-slate-500 hover:text-primary-600 hover:border-primary-400 hover:bg-primary-50 font-medium">Add another question</button>
        </div>

        {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-200">{error}</div>}

        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10 flex justify-end">
          <div className="w-full max-w-4xl mx-auto flex justify-end">
            <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 bg-primary-600 text-white px-8 py-3 rounded-xl font-bold shadow-md hover:bg-primary-500 disabled:opacity-70"><Save size={20} />{isSubmitting ? 'Saving...' : 'Update Quiz'}</button>
          </div>
        </div>
      </form>
    </div>
  );
}
