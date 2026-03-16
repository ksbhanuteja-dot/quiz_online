import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import InstructorLayout from './components/layout/InstructorLayout';
import InstructorDashboard from './pages/InstructorDashboard';
import ProtectedRoute from './components/layout/ProtectedRoute';
import QuizList from './pages/QuizList';
import CreateQuiz from './pages/CreateQuiz';
import EditQuiz from './pages/EditQuiz';
import Analytics from './pages/Analytics';
import Leaderboard from './pages/Leaderboard';

// Student Imports
import StudentLayout from './components/layout/StudentLayout';
import StudentDashboard from './pages/StudentDashboard';
import AvailableQuizzes from './pages/AvailableQuizzes';
import TakeQuiz from './pages/TakeQuiz';
import QuizResult from './pages/QuizResult';
import StudentLeaderboard from './pages/StudentLeaderboard';
import VerifyEmail from './pages/VerifyEmail';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      
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
        path="/student-dashboard" 
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentLayout />
          </ProtectedRoute>
        } 
      >
        <Route index element={<StudentDashboard />} />
        <Route path="quizzes" element={<AvailableQuizzes />} />
        <Route path="take-quiz/:id" element={<TakeQuiz />} />
        <Route path="results/:attemptId" element={<QuizResult />} />
        <Route path="leaderboard" element={<StudentLeaderboard />} />
      </Route>
    </Routes>
  );
}

export default App;
