import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import Footer from "@/components/Footer";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex-1 flex items-center justify-center bg-muted">
        <div className="text-center">
          <h1 className="mb-4 text-6xl font-bold font-heading">404</h1>
          <p className="mb-6 text-2xl text-muted-foreground">Oops! Page not found</p>
          <p className="mb-8 text-base text-muted-foreground">The page you're looking for doesn't exist or has been moved.</p>
          <a href="/" className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">
            Return to Home
          </a>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default NotFound;
