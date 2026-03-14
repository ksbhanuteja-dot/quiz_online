import { useState, useEffect } from 'react';
import { Search, Trophy } from 'lucide-react';
import api from '../api/axios';

export default function Leaderboard() {
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await api.get('/instructor/analytics/leaderboard');
        setStudents(response.data);
      } catch (err) {
        console.warn("Using mock leaderboard:", err);
        setStudents([
          { id: 1, name: 'Alice Freeman', score: 980, attempts: 12, rank: 1 },
          { id: 2, name: 'Bob Johnson', score: 850, attempts: 11, rank: 2 },
          { id: 3, name: 'Charlie Davis', score: 820, attempts: 10, rank: 3 },
          { id: 4, name: 'Diana Prince', score: 790, attempts: 12, rank: 4 },
          { id: 5, name: 'Evan Wright', score: 710, attempts: 9, rank: 5 },
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const filteredStudents = students.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Leaderboard</h1>
          <p className="mt-2 text-slate-600">Top performing students across all quizzes.</p>
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
            className="block w-full pl-10 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-600 focus:border-transparent outline-none shadow-sm text-sm"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Rank</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Student Name</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Score</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Quizzes Attempted</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-slate-500">
                    Loading rankings...
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-slate-500">
                    No students found matching "{searchTerm}"
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {student.rank === 1 ? (
                          <div className="bg-yellow-100 p-1.5 rounded-full"><Trophy size={18} className="text-yellow-600" /></div>
                        ) : student.rank === 2 ? (
                          <div className="bg-slate-100 p-1.5 rounded-full"><Trophy size={18} className="text-slate-500" /></div>
                        ) : student.rank === 3 ? (
                          <div className="bg-amber-100 p-1.5 rounded-full"><Trophy size={18} className="text-amber-600" /></div>
                        ) : (
                          <span className="text-sm font-medium text-slate-500 pl-3">#{student.rank}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary-100 text-primary-700 font-bold flex items-center justify-center text-xs">
                          {student.name.charAt(0)}
                        </div>
                        <span className="text-sm font-medium text-slate-900">{student.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-slate-900">{student.score}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
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
