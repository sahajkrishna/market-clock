import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loadPreferences } from "@/lib/preferences";
import LandingPage from "./LandingPage";

const Index = () => {
  const navigate = useNavigate();
  const prefs = loadPreferences();

  useEffect(() => {
    // If onboarding is already done, go straight to dashboard
    if (prefs.onboardingComplete) {
      navigate("/dashboard", { replace: true });
    }
  }, [prefs.onboardingComplete, navigate]);

  if (prefs.onboardingComplete) return null;

  return <LandingPage />;
};

export default Index;
