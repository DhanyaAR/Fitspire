import { useEffect, useState } from "react";
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import { format, subDays } from "date-fns";
import { useUser } from "../context/UserContext";
import "../styles/heatmap.css";
import Header from "../components/Header";

export default function Dashboard() {
  const { username } = useUser();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const today = new Date();
  const startDate = subDays(today, 89);
  console.log("Dashboard render, username:", username);
  console.log(today)
  console.log(startDate)

  useEffect(() => {
    if (!username) return;
  
    console.log("Fetching stats for", username);
  
    fetch("http://localhost:5000/api/user/stats", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ username }) 
    })
      .then(async (res) => {
        const text = await res.text(); 
        console.log("🔍 Raw fetch response:", text);
  
        if (!res.ok) throw new Error("Failed to fetch user stats");
  
        try {
          const data = JSON.parse(text); 
          console.log("✅ Parsed user stats:", data);
          setStats(data);
        } catch (err) {
          console.error("❌ JSON parse error:", err);
          throw err;
        }
      })
      .catch((err) => {
        console.error("❌ Error fetching user stats:", err);
        setError("Could not load user stats");
      });
  }, [username]);
  
  if (!username) {
    return <div className="text-white p-8">Please log in to view dashboard.</div>;
  }

  if (error) {
    return <div className="text-red-500 p-8">{error}</div>;
  }

  if (!stats) return <div className="text-white p-8">Loading...</div>;

  const badges = [
    {
      emoji: '🎉',
      label: 'First Workout',
      unlocked: stats.totalWorkoutDays >= 1,
    },
    {
      emoji: '💪',
      label: '7 Day Streak',
      unlocked: stats.streak >= 7,
    },
    {
      emoji: '🥳',
      label: '25 Day Streak',
      unlocked: stats.streak >= 25,
    },
    {
      emoji: '📆',
      label: '50 Total Workouts',
      unlocked: stats.totalWorkoutDays >= 50,
    },
    {
      emoji: '🎯',
      label: '100 Total Workouts',
      unlocked: stats.totalWorkoutDays >= 100,
    },
    {
      emoji: '⏱️',
      label: '10-Hour Milestone',
      unlocked: stats.totalWorkoutTime >= 600,
    },
    {
      emoji: '🔥',
      label: '500 kcal Badge',
      unlocked: stats.totalCaloriesBurnt >= 500,
    },
    {
      emoji: '🥇',
      label: '1 Month Complete',
      unlocked: stats.streak >= 30,
    },
  ];
  
  
  const heatmapData = Array.from({ length: 90 }, (_, i) => {
    const date = subDays(today, i);
    const dateStr = format(date, "yyyy-MM-dd");
    const match = stats.workoutHistory?.find(entry => entry.date === dateStr);
    return {
      date: dateStr,
      count: match?.didWorkout? 1 : 0,
    };
  }).reverse();
  console.log("HeatmapData Length:", heatmapData.length);
  console.log("HeatmapData Sample:", heatmapData.slice(0, 10));


  return (
    <>
    <div className="min-h-screen bg-gray-900 text-white p-8 pt-6 space-y-8">
      <Header showLogo={true} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold mb-6">📈 Your Progress</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gray-700 rounded-2xl p-4 shadow-md  transition hover:scale-105 hover:shadow-2xl hover:bg-gray-600">
              <p className="text-gray-400 text-sm">⏳ Streak</p>
              <p className="text-teal-400 text-xl font-bold">{stats.streak} days</p>
            </div>
            <div className="bg-gray-700 rounded-2xl p-4 shadow-md  transition hover:scale-105 hover:shadow-2xl hover:bg-gray-600">
              <p className="text-gray-400 text-sm">📅 Total Workout Days</p>
              <p className="text-teal-400 text-xl font-bold">{stats.totalWorkoutDays} days</p>
            </div>
            <div className="bg-gray-700 rounded-2xl p-4 shadow-md  transition hover:scale-105 hover:shadow-2xl hover:bg-gray-600">
              <p className="text-gray-400 text-sm">🕒 Total Workout Time</p>
              <p className="text-teal-400 text-xl font-bold">{stats.totalWorkoutTime || 0} mins</p>
            </div>
            <div className="bg-gray-700 rounded-2xl p-4 shadow-md  transition hover:scale-105 hover:shadow-2xl hover:bg-gray-600">
              <p className="text-gray-400 text-sm">📊 Days Since Registration</p>
              <p className="text-teal-400 text-xl font-bold">
                {stats.totalDaysSinceRegistration} days
              </p>
            </div>
            <div className="bg-gray-700 rounded-2xl p-4 shadow-md  transition hover:scale-105 hover:shadow-2xl hover:bg-gray-600">
              <p className="text-gray-400 text-sm">🔥 Total Calories Burned:</p>
              <p className="text-teal-400 text-xl font-bold">{stats.totalCaloriesBurnt || 0} kcal</p>
            </div>

            <div className="bg-gray-700 rounded-2xl p-4 shadow-md  transition hover:scale-105 hover:shadow-2xl hover:bg-gray-600">
              <p className="text-gray-400 text-sm">🎯 Workout Consistency</p>
              <p className="text-teal-400 text-xl font-bold">{stats.workoutPercentage}%</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold mb-4 text-white">🏅 Badges</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {badges.map((badge, index) => (
              <div
                key={index}
                className={`p-4 rounded-xl flex flex-col items-center justify-center aspect-[3/4] border-2 transition-all duration-300 ${
                  badge.unlocked
                    ? "bg-yellow-400 text-black border-yellow-500 shadow-lg"
                    : "bg-gray-700 text-gray-400 border-gray-600 grayscale opacity-60"
                }`}
              >
                <div className="text-4xl mb-2">{badge.emoji}</div>
                <div className="text-sm font-semibold text-center">{badge.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-gray-800 p-6 rounded-xl shadow-lg overflow-x-auto">
        <h2 className="text-2xl font-bold mb-4">📆 Workout Activity (Last 3 Months)</h2>
        <div className="flex min-w-[1200px]">
          <div className="flex flex-col justify-between ml-7 mr-0 mt-20" style={{ height: 50 * 7 + 4 * 6 }}>
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="text-gray-400 text-4px font-semibold text-right" style={{height: 5, lineHeight: '20px'}}>
                {day}
              </div>
            ))}
          </div>

          <CalendarHeatmap
            startDate={startDate}
            endDate={today}
            values={heatmapData}
            showWeekdayLabels={false} 
            classForValue={(value) => {
              console.log(value.count);
              if (!value || value.count === 0) return "color-empty";
              return `color-github-3`;
            }}
            gutterSize={3}
            blockSize={2}
          />
        </div>
      </div>
    </div>
    </>
  )
}
