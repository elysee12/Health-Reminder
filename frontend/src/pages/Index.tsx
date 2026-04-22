import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import Footer from "@/components/Footer";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // If user is already logged in, redirect to their dashboard
    if (user) {
      const dashboards: Record<string, string> = {
        admin: "/admin",
        provider: "/provider",
        patient: "/patient",
      };
      navigate(dashboards[user.role] || "/patient");
    }
  }, [user, navigate]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="text-center space-y-8 max-w-2xl">
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Heart className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold font-heading">mHealth Reminder</h1>
            <p className="text-xl text-muted-foreground">
              Hypertension Management & Medication Reminder System
            </p>
          </div>

          <div className="space-y-6 text-base text-muted-foreground max-w-lg">
            <p>
              A comprehensive healthcare solution designed to help manage hypertension through integrated medication reminders, adherence tracking, and patient monitoring.
            </p>
            <p>
              Empowering healthcare providers across Rwanda with data-driven tools for effective patient care and improved health outcomes.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button 
              onClick={() => navigate("/login")}
              className="px-8 py-6 text-lg font-semibold"
            >
              Sign In
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate("/login")}
              className="px-8 py-6 text-lg font-semibold"
            >
              Request Access
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Index;
