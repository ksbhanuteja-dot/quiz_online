import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, ArrowLeft, Save, GripVertical } from 'lucide-react';
import api from '../api/axios';

export default function CreateQuiz() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState('');
  const [importError, setImportError] = useState('');
  const [importResult, setImportResult] = useState(null);
  const [importFile, setImportFile] = useState(null);
  
  const [quizDetails, setQuizDetails] = useState({
    title: '',
    timer: 1800, // in seconds (30 mins)
  });

  const [questions, setQuestions] = useState([{
    id: Date.now(),
    text: '',
    options: ['', '', '', ''],
    correctOptionIndex: 0
  }]);

  const handleQuizDetailChange = (e) => {
    setQuizDetails({ ...quizDetails, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setImportError('');
    const file = e.target.files?.[0];
    setImportFile(file || null);
  };

  const handleImport = async () => {
    if (!importFile) {
      return setImportError('Please select an Excel file first.');
    }

    setImportError('');
    setIsImporting(true);

    const formData = new FormData();
    formData.append('title', quizDetails.title || 'Imported Quiz');
    formData.append('timer', quizDetails.timer);
    formData.append('file', importFile);

    try {
      // Do not explicitly set Content-Type; let the browser set the boundary for multipart/form-data.
      const response = await api.post('/instructor/quizzes/import', formData);
      setImportError('');
      setImportResult(response.data);
    } catch (err) {
      console.error('Failed to import quiz:', err);
      setImportError(err.response?.data?.detail || err.response?.data?.message || 'Failed to import quiz. Please check the file format.');
      setImportResult(null);
    } finally {
      setIsImporting(false);
    }
  };

  const handleAddQuestion = () => {
    setQuestions([...questions, {
      id: Date.now(),
      text: '',
      options: ['', '', '', ''],
      correctOptionIndex: 0
    }]);
  };

  const handleRemoveQuestion = (id) => {
    if (questions.length === 1) return;
    setQuestions(questions.filter(q => q.id !== id));
  };

  const handleQuestionTextChange = (id, text) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, text } : q));
  };

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

  const handleCorrectOptionChange = (qId, optionIndex) => {
    setQuestions(questions.map(q => q.id === qId ? { ...q, correctOptionIndex: optionIndex } : q));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Basic validation
    if (!quizDetails.title.trim()) return setError('Quiz title is required');
    if (questions.some(q => !q.text.trim())) return setError('All questions must have text');
    if (questions.some(q => q.options.some(opt => !opt.trim()))) return setError('All options must have text');

    setIsSubmitting(true);
    
    const payload = {
      title: quizDetails.title,
      timer: quizDetails.timer,
      questions: questions.map((q) => ({
        question_text: q.text,
        options: q.options.map((opt, idx) => ({
          option_text: opt,
          is_correct: idx === q.correctOptionIndex
        }))
      }))
    };

    try {
      await api.post('/instructor/quizzes', payload);
      navigate('/dashboard');
    } catch (err) {
      console.error('Failed to create quiz:', err);
      setError(err.response?.data?.detail || 'Failed to create quiz.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/dashboard')}
          className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Create New Quiz</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Quiz Setup */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Quiz Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">Quiz Title</label>
              <input
                type="text"
                name="title"
                value={quizDetails.title}
                onChange={handleQuizDetailChange}
                placeholder="e.g. Advanced React Hooks"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:ring-2 focus:ring-primary-600 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Timer (in seconds)</label>
              <input
                type="number"
                name="timer"
                value={quizDetails.timer}
                onChange={handleQuizDetailChange}
                placeholder="1800"
                min="60"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:ring-2 focus:ring-primary-600 outline-none"
              />
              <p className="mt-2 text-xs text-slate-500">{Math.floor(quizDetails.timer / 60)} minutes</p>
            </div>
          </div>
        </div>

        {/* Import from Excel */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Import Questions from Excel</h2>
          <p className="text-sm text-slate-600 mb-4">
            Upload an Excel file where each row is a question and includes columns for
            Question, Option1...Option4, and Correct (1-4 or A-D or option text).
          </p>
          <div className="flex flex-col sm:flex-row gap-4 items-start">
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="w-full sm:w-auto rounded-xl border border-slate-300 px-4 py-3 bg-white"
            />
            <button
              type="button"
              onClick={handleImport}
              disabled={isImporting}
              className="flex items-center justify-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-500 transition-colors disabled:opacity-70"
            >
              {isImporting ? 'Importing...' : 'Import from Excel'}
            </button>
          </div>
          {importError && (
            <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-200">
              {importError}
            </div>
          )}

          {importResult && (
            <div className="mt-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
              <p className="text-sm text-emerald-800 font-semibold">{importResult.message}</p>
              {importResult.quiz?.id && (
                <p className="text-sm text-slate-700 mt-2">
                  Quiz created: <span className="font-semibold">{importResult.quiz.title}</span> (ID: {importResult.quiz.id})
                </p>
              )}
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard/quizzes')}
                  className="px-4 py-2 rounded-xl bg-primary-600 text-white hover:bg-primary-500 transition-colors"
                >
                  View all quizzes
                </button>
                {importResult.quiz?.id && (
                  <button
                    type="button"
                    onClick={() => navigate(`/dashboard/edit-quiz/${importResult.quiz.id}`)}
                    className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Edit imported quiz
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Questions Setup */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-900">Questions</h2>
          
          {questions.map((q, qIndex) => (
            <div key={q.id} className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100 relative group">
              {questions.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveQuestion(q.id)}
                  className="absolute top-6 right-6 text-slate-400 hover:text-red-500 p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={20} />
                </button>
              )}
              
              <div className="flex gap-4">
                <div className="mt-1 hidden sm:block">
                  <GripVertical size={20} className="text-slate-300" />
                </div>
                <div className="flex-1 space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Question {qIndex + 1} text
                    </label>
                    <textarea
                      value={q.text}
                      onChange={(e) => handleQuestionTextChange(q.id, e.target.value)}
                      placeholder="Enter question text here..."
                      rows={2}
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:ring-2 focus:ring-primary-600 outline-none resize-y"
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-slate-700">Answers (Select the correct one)</label>
                    {q.options.map((opt, optIndex) => (
                      <div key={optIndex} className={`flex items-center gap-4 p-2 rounded-xl border transition-colors ${q.correctOptionIndex === optIndex ? 'border-primary-500 bg-primary-50/50' : 'border-slate-200 hover:border-slate-300'}`}>
                        <div className="flex items-center justify-center p-2">
                          <input
                            type="radio"
                            name={`correct-${q.id}`}
                            checked={q.correctOptionIndex === optIndex}
                            onChange={() => handleCorrectOptionChange(q.id, optIndex)}
                            className="w-4 h-4 text-primary-600 border-slate-300 focus:ring-primary-600"
                          />
                        </div>
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => handleOptionChange(q.id, optIndex, e.target.value)}
                          placeholder={`Option ${optIndex + 1}`}
                          className="flex-1 bg-transparent px-2 py-1 outline-none text-slate-800 placeholder:text-slate-400"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          <button
            type="button"
            onClick={handleAddQuestion}
            className="w-full py-6 border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center text-slate-500 hover:text-primary-600 hover:border-primary-400 hover:bg-primary-50 transition-colors"
          >
            <Plus size={24} className="mb-2" />
            <span className="font-medium">Add another question</span>
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-200">
            {error}
          </div>
        )}

        {/* Sticky Submit Footer */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10 lg:pl-64 flex justify-end">
          <div className="w-full max-w-4xl mx-auto flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 bg-primary-600 text-white px-8 py-3 rounded-xl font-bold shadow-md hover:bg-primary-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <Save size={20} />
              {isSubmitting ? 'Saving...' : 'Save Quiz'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
