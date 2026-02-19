import { Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import Dashboard from "../pages/Dashboard";
import Signup from "../pages/common/Signup";
import RegistrationPage from "../Registration_pages/RegistrationPage";
import Recommendations from "../pages/Recomendation";
import Performance from "../pages/Performance";
import AutomationLayout from "../components/layout_automation/AppLayout";
import AdminLayout from "../layout_admin/AppLayout";
import Afternoon from "../pages_automation/Afternoon";
import Evening from "../pages_automation/Evening";
import Morning from "../pages_automation/Morning";
import Special from "../pages_automation/Special";
import Weekly from "../pages_automation/Weekly";
import AdminApproval from "../pages_admin/AdminApproval";
import AdminRecommendations from "../pages_admin/AdminRecommendations";
import AdminDashboard from "../pages_admin/AdminDashboard";
<<<<<<< HEAD

// --- NEW IMPORTS FOR MORNING REPORT ---
import MorningReportBuilder from "../morning-report/MorningReportBuilder";
import MorningReport from "../morning-report/MorningReport";
import Logotheme from "../morning-report/Logotheme";
import Generator from "../morning-report/Generator";
=======
import LoginForm from "../common/LoginForm";
import ProtectedRoute from "../components/ProtectedRoute";
// import NotFound from "../pages/NotFound";
>>>>>>> ab9f9c11eb69fe456abee078dc4cc61c11560c0f

const AppRoutes = () => {
  return (
    <Routes>
<<<<<<< HEAD
      {/* 1. Standard Layout Pages */}
      <Route element={<AppLayout />}>
=======


      <Route path="/signup" element={<Signup />} />
      <Route path="/registration" element={<RegistrationPage />} />
      <Route path="/login" element={<LoginForm />} />


      {/* ALL pages that need sidebar go here */}

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
>>>>>>> ab9f9c11eb69fe456abee078dc4cc61c11560c0f
        <Route path="/" element={<Dashboard />} />
        <Route path="/recommendations" element={<Recommendations />} />
        <Route path="/performance" element={<Performance />} />
      </Route>

<<<<<<< HEAD
      {/* 2. Morning Report Workflow (The files you just created) */}
      {/* I am putting these OUTSIDE of AppLayout so they take the full screen */}
      <Route path="/morning-report-builder" element={<MorningReportBuilder />} />
      <Route path="/morning-report-view" element={<MorningReport />} />
      <Route path="/logo-theme" element={<Logotheme />} />
      <Route path="/email-generator" element={<Generator />} />

      {/* 3. Automation layout */}
=======

      {/* Automation layout with its own sidebar/header */}
>>>>>>> ab9f9c11eb69fe456abee078dc4cc61c11560c0f
      <Route path="/automation" element={<AutomationLayout />}>
        <Route index element={<Afternoon />} />
        <Route path="Afternoon" element={<Afternoon />} />
        <Route path="Evening" element={<Evening />} />
        <Route path="Morning" element={<Morning />} />
        <Route path="Special" element={<Special />} />
        <Route path="Weekly" element={<Weekly />} />
      </Route>

<<<<<<< HEAD
      <Route path="/signup" element={<Signup />} />
=======

>>>>>>> ab9f9c11eb69fe456abee078dc4cc61c11560c0f

      {/* 4. Admin layout */}
      <Route path="/admin/*" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="recommendations" element={<AdminRecommendations />} />
        <Route path="approval" element={<AdminApproval />} />
      </Route>
<<<<<<< HEAD
=======




      {/* Pages without sidebar (optional) */}
      {/* <Route path="*" element={<NotFound />} /> */}
>>>>>>> ab9f9c11eb69fe456abee078dc4cc61c11560c0f
    </Routes>
  );
};

export default AppRoutes;