import { useState, useEffect } from 'react';
import { Search, Trophy } from 'lucide-react';
import api from '../api/axios';

export default function StudentLeaderboard() {
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await api.get('/student/leaderboard');
        setStudents(response.data);
      } catch (err) {
        console.warn("Using mock student leaderboard:", err);
        setStudents([
          { id: 1, name: 'Alice Freeman', score: 980, attempts: 12, rank: 1, isCurrentUser: false },
          { id: 2, name: 'Bob Johnson', score: 850, attempts: 11, rank: 2, isCurrentUser: false },
          { id: 3, name: 'Charlie Davis', score: 820, attempts: 10, rank: 3, isCurrentUser: true }, // Highlighted as user
          { id: 4, name: 'Diana Prince', score: 790, attempts: 12, rank: 4, isCurrentUser: false },
          { id: 5, name: 'Evan Wright', score: 710, attempts: 9, rank: 5, isCurrentUser: false },
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const filteredStudents = students.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Global Leaderboard</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">See how you rank against other students.</p>
        </div>
        
        <div className="relative w-full sm:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-600 outline-none shadow-sm text-sm text-slate-900 dark:text-white transition-colors"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-950 transition-colors">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Rank</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Student Name</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Points</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden sm:table-cell">Quizzes Taken</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800 transition-colors">
              {isLoading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center">
                    <div className="animate-pulse space-y-4">
                      <div className="h-6 bg-slate-100 dark:bg-slate-800 rounded w-full mx-auto"></div>
                      <div className="h-6 bg-slate-100 dark:bg-slate-800 rounded w-full mx-auto"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                    No students found matching "{searchTerm}"
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id} className={`transition-colors ${student.isCurrentUser ? 'bg-primary-50 dark:bg-primary-900/10 hover:bg-primary-100 dark:hover:bg-primary-900/20' : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/30'}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {student.rank === 1 ? (
                          <div className="bg-yellow-100 dark:bg-yellow-900/30 p-1.5 rounded-full"><Trophy size={18} className="text-yellow-600 dark:text-yellow-500" /></div>
                        ) : student.rank === 2 ? (
                          <div className="bg-slate-100 dark:bg-slate-800 p-1.5 rounded-full"><Trophy size={18} className="text-slate-500 dark:text-slate-400" /></div>
                        ) : student.rank === 3 ? (
                          <div className="bg-amber-100 dark:bg-amber-900/30 p-1.5 rounded-full"><Trophy size={18} className="text-amber-600 dark:text-amber-500" /></div>
                        ) : (
                          <span className={`text-sm font-medium pl-3 ${student.isCurrentUser ? 'text-primary-700 dark:text-primary-400' : 'text-slate-500 dark:text-slate-400'}`}>#{student.rank}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className={`h-8 w-8 rounded-full font-bold flex items-center justify-center text-xs ${student.isCurrentUser ? 'bg-primary-600 text-white' : 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'}`}>
                          {student.name.charAt(0)}
                        </div>
                        <span className={`text-sm font-medium ${student.isCurrentUser ? 'text-primary-700 dark:text-primary-400' : 'text-slate-900 dark:text-white'}`}>
                          {student.name} {student.isCurrentUser && '(You)'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-bold ${student.isCurrentUser ? 'text-primary-700 dark:text-primary-400' : 'text-slate-900 dark:text-white'}`}>{student.score}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400 hidden sm:table-cell">
                      {student.attempts}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
