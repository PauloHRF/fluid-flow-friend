import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AppSidebar } from "@/components/AppSidebar";
import ReynoldsPage from "@/pages/ReynoldsPage";
import BernoulliPage from "@/pages/BernoulliPage";
import DarcyWeisbachPage from "@/pages/DarcyWeisbachPage";
import NotFound from "@/pages/NotFound";

const App = () => (
  <BrowserRouter>
    <div className="flex min-h-screen w-full">
      <AppSidebar />
      <Routes>
        <Route path="/" element={<ReynoldsPage />} />
        <Route path="/bernoulli" element={<BernoulliPage />} />
        <Route path="/darcy-weisbach" element={<DarcyWeisbachPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  </BrowserRouter>
);

export default App;
