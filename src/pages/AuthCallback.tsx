import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      localStorage.setItem("bb_token", token);
      sessionStorage.setItem("bb_post_oauth", "true");
    }
    navigate("/", { replace: true });
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="h-8 w-8 rounded-full border-2 border-[#7C6BFF] border-t-transparent animate-spin" />
    </div>
  );
};

export default AuthCallback;
