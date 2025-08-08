import { useLocation } from "react-router-dom";
import { Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import exercises from "../data/exercises.json"; 
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useState } from "react";
import Header from "../components/Header";
import { useEffect } from "react";


export default function DisplayPlanPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isGenerating, setIsGenerating] = useState(false);

  const storedPlan = sessionStorage.getItem("fitspirePlan");
  const storedStreak = sessionStorage.getItem("fitspireStreak");
  const storedUsername = sessionStorage.getItem("fitspireUsername");

  const plan = location.state?.plan || JSON.parse(storedPlan || "[]");
  const streak = location.state?.streak || Number(storedStreak || 0);
  const username = location.state?.username || storedUsername || "";

  console.log("Plan received in DisplayPlanPage:", plan);

  const handleStartWorkout = (day) => {
    const exercises = day.exercises; 
    const time=day.totalDuration;
    navigate("/start-workout", {
      state: { exercises, username, time },
    });
  };

  const currentDay = (streak % 7) + 1;

  if (!plan.length) {
    return (
      <div className="p-6 bg-gray-900 min-h-screen text-white flex items-center justify-center">
        <h2 className="text-xl text-gray-400">
          No plan found. Please generate your workout plan first.
        </h2>
      </div>
    );
  }

  useEffect(() => {
    if (plan.length) {
      sessionStorage.setItem("fitspirePlan", JSON.stringify(plan));
      sessionStorage.setItem("fitspireStreak", streak);
      sessionStorage.setItem("fitspireUsername", username);
    }
  }, [plan, streak, username]);

  const handleDownloadPlan = async () => {
    setIsGenerating(true);
  
    const input = document.getElementById("printable-plan");
  
    const canvas = await html2canvas(input, {
      scale: 2, 
      useCORS: true,
    });
  
    const imgData = canvas.toDataURL("image/png");
  
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
  
    const imgProps = pdf.getImageProperties(imgData);
    const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;
  
    let heightLeft = imgHeight;
    let position = 0;
  
    pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight);
    heightLeft -= pdfHeight;
  
    while (heightLeft > 0) {
      position -= pdfHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight);
      heightLeft -= pdfHeight;
    }
  
    pdf.save("7-day-workout-plan.pdf");
    setIsGenerating(false);
  };
  

  return (
    <div className="pt-6 pb-6 bg-gray-900 min-h-screen text-white">
      <Header showLogo={true} /> 
      <h1 className="text-4xl font-bold mb-7 text-center text-blue-400">
        Your 7-Day Plan
      </h1>
      <p className="text-sm text-gray-400 text-center -mt-6 mb-6 italic">
      Your fitness adventure for the week is all set – let’s do this!
      </p>

      <div className="flex flex-col items-center space-y-8">
        {plan.map((day) => (
          <div
            key={day.day}
            className="bg-gray-800 w-full max-w-5xl rounded-lg shadow-lg p-6"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Day {day.day}</h2>
              {day.day === currentDay ? (
                <button onClick={() => handleStartWorkout(day)}   className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition">
                  Start Workout
                </button>
              ) : (
                <div className="flex items-center text-gray-400">
                  <Lock className="w-5 h-5 mr-1" /> Locked
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {day.exercises.map((id) => {
                const ex = exercises.find((e) => e.id === Number(id));
                if (!ex) {
                  console.warn("Exercise not found for ID:", id);
                  return null;
                }
                
                return (
                  <div
                    key={ex.id}
                    className="bg-gray-700 rounded-lg shadow-md overflow-hidden hover:shadow-xl cursor-pointer transition"
                    onClick={() => window.open(ex.video_link, "_blank", "noopener,noreferrer")}
                  >
                    <img
                      src={ex.image}
                      alt={ex.name}
                      className="w-full h-40 object-cover"
                    />
                    <div className="p-4">
                      <h3 className="text-lg font-bold">{ex.name}</h3>
                      <p className="text-sm text-gray-300 mt-2">{ex.description}</p>
                      <p className="mt-3 text-sm">
                        Total Duration: {ex.duration} mins | Sets: {ex.sets}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    
      <div className="mt-10 flex justify-center">
        <button
          onClick={handleDownloadPlan}
          disabled={isGenerating}
          className={`px-6 py-3 rounded transition ${
            isGenerating
              ? "bg-gray-500 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600 text-white"
          }`}
        >
          {isGenerating ? "Generating PDF..." : "Download 7-Day Plan"}
        </button>
      </div>

        <div
          id="printable-plan"
          style={{ position: "absolute", left: "-9999px", top: "0", width: "800px", background: "white", color: "black", padding: "20px" }}
        >
          <h1 style={{ textAlign: "center", fontSize: "24px", marginBottom: "20px" }}>
            Your 7-Day Plan
          </h1>
          {plan.map((day) => (
            <div key={day.day} style={{ marginBottom: "20px" }}>
              <h2 style={{ fontSize: "20px", marginBottom: "10px" }}>Day {day.day}</h2>
              {day.exercises.map((id) => {
                const ex = exercises.find((e) => e.id === Number(id));
                if (!ex) return null;

                return (
                  <div key={ex.id} style={{ marginBottom: "10px" }}>
                    <h3 style={{ fontWeight: "bold" }}>{ex.name}</h3>
                    <p><strong>Description:</strong> {ex.description}</p>
                    <p><strong>Duration:</strong> {ex.duration} mins</p>
                    <p><strong>Sets:</strong> {ex.sets}</p>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
    </div>
  );
}
