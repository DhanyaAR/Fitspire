import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

export default function Header({ showLogo }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    const confirmed = window.confirm("Are you sure you want to logout?");
    if (confirmed) {
      sessionStorage.clear();
      alert("You’ve been logged out. See you soon! 👋"); 
      navigate("/");
    };
  }
  return (
    <header
      className={`top-0 left-0 right-0 flex items-center justify-between px-6 transition-all duration-700 ${
        showLogo ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="flex items-center gap-2">
        <img
          src="/dumbbell.png"
          alt="Fitspire Logo"
          className="w-10 h-10 drop-shadow-glow"
        />
        <h1 className="text-xl font-bold text-blue-300">Fitspire</h1>
      </div>

      <nav className="flex gap-6 text-blue-300 font-medium text-lg">
        <Link
          to="/display-plan"
          className="hover:text-blue-500 transition-colors duration-200"
        >
          Plan
        </Link>
        <Link
          to="/dashboard"
          className="hover:text-blue-500 transition-colors duration-200"
        >
          Dashboard
        </Link>
          <button
          onClick={handleLogout}
          className="hover:text-red-400 transition-colors duration-200">
          Logout
        </button>
      </nav>
    </header>
  );
}
