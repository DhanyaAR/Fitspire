const exercises = require("../data/exercises.json");

const testMode = false; //can be set to true for testing the pose detection logic of the 5 exercises mentioned belosw

const testExerciseNames = [
  "Cobra Pose (Bhujangasana)",
  "Warrior II (Virabhadrasana II)",
  "Push-ups",
  "Squats",
  "Plank"
];

function shuffleArray(array) {
  let arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const levelFallback = {
  Beginner: ["Beginner", "Intermediate"],
  Intermediate: ["Intermediate", "Beginner", "Advanced"],
  Advanced: ["Advanced", "Intermediate", "Beginner"],
};

const equipmentFallback = {
  "Full Gym": ["Full Gym", "Basic Dumbbells", "Bodyweight"],
  "Basic Dumbbells": ["Basic Dumbbells", "Bodyweight"],
  Bodyweight: ["Bodyweight"],
};

function filterExercises(goal, muscleGroup, levels, equipmentList) {
  return exercises.filter(
    (ex) =>
      ex.goal === goal &&
      (muscleGroup ? ex.muscle_group === muscleGroup : true) &&
      levels.includes(ex.level) &&
      equipmentList.includes(ex.equipment)
  );
}

function fillWithFallback(dayExercises, totalTime, maxDuration, level, equipment, originalGoal, previousDayExerciseIds) {
  let fallback = exercises.filter((ex) => {
    const excludeYoga = (originalGoal === "Muscle Gain" || originalGoal === "General Fitness") && ex.muscle_group === "Yoga";
    return (
      !excludeYoga &&
      levelFallback[level].includes(ex.level) &&
      equipmentFallback[equipment].includes(ex.equipment) &&
      !dayExercises.includes(ex.id) &&
      !previousDayExerciseIds.has(ex.id)
    );
  });

  fallback = shuffleArray(fallback);
  for (const ex of fallback) {
    if (totalTime + ex.duration > maxDuration) continue;
    if (!dayExercises.includes(ex.id)) {
      dayExercises.push(ex.id);
      totalTime += ex.duration;
    }
  }

  return { dayExercises, totalTime };
}

function generatePlan(goal, userLevel, userEquipment, maxDuration) {
  const levelChain = levelFallback[userLevel] || [userLevel];
  const equipmentChain = equipmentFallback[userEquipment] || [userEquipment];
  const plan = [];

  let previousDayExerciseIds = new Set();

  for (let day = 1; day <= 7; day++) {
    let dayExercises = [];
    let totalTime = 0;
    let muscleGroup = null;

    if (testMode && day === 1) {
      const testExercises = exercises.filter(ex => testExerciseNames.includes(ex.name));
      dayExercises = testExercises.map(ex => ex.id);
      totalTime = testExercises.reduce((sum, ex) => sum + ex.duration, 0);

      previousDayExerciseIds = new Set(dayExercises);
      plan.push({
        day,
        exercises: dayExercises,
        totalDuration: totalTime,
      });
      continue; // skip regular Day 1 logic only when testMode is set to true to test the pose detection logic defined for the 5 exercises
    }

    if (goal === "Muscle Gain") {
      const muscleGroups = ["Chest", "Back", "Legs", "Shoulders", "Biceps", "Triceps", "Core"];
      muscleGroup = muscleGroups[(day - 1) % muscleGroups.length];
    } else if (goal === "Weight Loss") {
      muscleGroup = null;
    } else if (goal === "Flexibility") {
      muscleGroup = "Yoga";
    }

    if (goal === "Flexibility") {
      let available = exercises.filter(
        (ex) => ex.muscle_group === "Yoga" && levelChain.includes(ex.level)
      );
      available = shuffleArray(available);

      for (const ex of available) {
        if (!previousDayExerciseIds.has(ex.id) && totalTime + ex.duration <= maxDuration) {
          dayExercises.push(ex.id);
          totalTime += ex.duration;
        }
      }

      if (totalTime < maxDuration - 5 && available.length > 0) {
        available = shuffleArray(available.filter((ex) => !dayExercises.includes(ex.id)));
        for (const ex of available) {
          if (totalTime + ex.duration <= maxDuration) {
            dayExercises.push(ex.id);
            totalTime += ex.duration;
          }
        }
      }
    }

    else if (goal === "General Fitness") {
      let available = exercises.filter(
        (ex) =>
          levelChain.includes(ex.level) &&
          equipmentChain.includes(ex.equipment) &&
          !previousDayExerciseIds.has(ex.id)
      );

      available = shuffleArray(available);
      const yoga = [];
      const nonYoga = [];

      for (const ex of available) {
        (ex.muscle_group === "Yoga" ? yoga : nonYoga).push(ex);
      }

      for (const ex of nonYoga) {
        if (totalTime + ex.duration > maxDuration) continue;
        if (!dayExercises.includes(ex.id)) {
          dayExercises.push(ex.id);
          totalTime += ex.duration;
        }
      }

      for (const ex of yoga) {
        if (totalTime + ex.duration > maxDuration) continue;
        if (!dayExercises.includes(ex.id)) {
          dayExercises.push(ex.id);
          totalTime += ex.duration;
        }
      }

      if (totalTime < maxDuration - 5) {
        const fallbackResult = fillWithFallback(
          dayExercises,
          totalTime,
          maxDuration,
          userLevel,
          userEquipment,
          goal,
          previousDayExerciseIds
        );
        dayExercises = fallbackResult.dayExercises;
        totalTime = fallbackResult.totalTime;
      }
    }

    else {
      for (const level of levelChain) {
        for (const equip of equipmentChain) {
          let available;

          if (goal === "Weight Loss") {
            available = exercises.filter(
              (ex) =>
                ex.goal === "Weight Loss" &&
                ex.level === level &&
                ex.equipment === equip &&
                !previousDayExerciseIds.has(ex.id)
            );
          }

          else {
            available = filterExercises(goal, muscleGroup, [level], [equip]).filter(
              (ex) => !previousDayExerciseIds.has(ex.id)
            );
          }

          available = shuffleArray(available);

          for (const ex of available) {
            if (totalTime + ex.duration > maxDuration) continue;
            if (!dayExercises.includes(ex.id)) {
              dayExercises.push(ex.id);
              totalTime += ex.duration;
            }
          }

          if (totalTime >= maxDuration) break;
        }
        if (totalTime >= maxDuration) break;
      }

      const isMuscleGainEdgeCase =
        goal === "Muscle Gain" && userLevel === "Advanced" && userEquipment === "Bodyweight";

      if (totalTime < maxDuration - 5 && (goal === "Weight Loss" || isMuscleGainEdgeCase)) {
        const fallbackResult = fillWithFallback(
          dayExercises,
          totalTime,
          maxDuration,
          userLevel,
          userEquipment,
          goal,
          previousDayExerciseIds
        );
        dayExercises = fallbackResult.dayExercises;
        totalTime = fallbackResult.totalTime;
      }

      if (goal === "Weight Loss") {
        const yogaExercises = [];
        const otherExercises = [];

        for (const id of dayExercises) {
          const ex = exercises.find((e) => e.id === id);
          if (ex && ex.muscle_group === "Yoga") yogaExercises.push(id);
          else otherExercises.push(id);
        }
        const yoga=shuffleArray(yogaExercises)
        const nonyoga=shuffleArray(otherExercises)
        dayExercises = nonyoga.concat(yoga);
      }
      else{
        dayExercises=shuffleArray(dayExercises)
      }
    }

    previousDayExerciseIds = new Set(dayExercises);
    plan.push({
      day,
      exercises: dayExercises,
      totalDuration: totalTime,
    });
  }

  return plan;
}

module.exports = generatePlan;
