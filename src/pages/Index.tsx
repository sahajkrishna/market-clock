import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loadPreferences } from "@/lib/preferences";

const Index = () => {
  const navigate = useNavigate();
  const prefs = loadPreferences();

  useEffect(() => {
    if (prefs.onboardingComplete) {
      navigate("/dashboard");
    } else {
      navigate("/onboarding");
    }
  }, []);

  return null;
};

export default Index;
