import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AppSidebar } from "@/components/AppSidebar";
import { ThemeProvider } from "@/components/ThemeProvider";
import Index from "@/pages/Index";
import ReynoldsPage from "@/pages/ReynoldsPage";
import BernoulliPage from "@/pages/BernoulliPage";
import DarcyWeisbachPage from "@/pages/DarcyWeisbachPage";
import ContinuidadePage from "@/pages/ContinuidadePage";
import ManometriaPage from "@/pages/ManometriaPage";
import EmpuxoPage from "@/pages/EmpuxoPage";
import NPSHPage from "@/pages/NPSHPage";
import NotFound from "@/pages/NotFound";

const App = () => (
  <ThemeProvider defaultTheme="light" storageKey="atelier-theme">
    <BrowserRouter>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/reynolds" element={<ReynoldsPage />} />
          <Route path="/bernoulli" element={<BernoulliPage />} />
          <Route path="/darcy-weisbach" element={<DarcyWeisbachPage />} />
          <Route path="/continuidade" element={<ContinuidadePage />} />
          <Route path="/manometria" element={<ManometriaPage />} />
          <Route path="/empuxo" element={<EmpuxoPage />} />
          <Route path="/npsh" element={<NPSHPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </BrowserRouter>
  </ThemeProvider>
);

export default App;
