import { BrowserRouter, Routes, Route } from "react-router-dom";
import Signup from "../common/Signup";

function SignupRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </BrowserRouter>
  );
}

export default SignupRoutes;
