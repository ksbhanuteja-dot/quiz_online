import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import StudentDashboard from './pages/StudentDashboard';
import InstructorDashboard from './pages/InstructorDashboard';
import InstructorLayout from './components/layout/InstructorLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import QuizList from './pages/QuizList';
import CreateQuiz from './pages/CreateQuiz';
import EditQuiz from './pages/EditQuiz';
import Analytics from './pages/Analytics';
import Leaderboard from './pages/Leaderboard';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      
      {/* Instructor Routes */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute allowedRoles={['instructor']}>
            <InstructorLayout />
          </ProtectedRoute>
        } 
      >
        <Route index element={<InstructorDashboard />} />
        <Route path="quizzes" element={<QuizList />} />
        <Route path="create-quiz" element={<CreateQuiz />} />
        <Route path="edit-quiz/:id" element={<EditQuiz />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="leaderboard" element={<Leaderboard />} />
      </Route>

      {/* Student Routes */}
      <Route 
        path="/student-dashboard/*" 
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentDashboard />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}

export default App;
