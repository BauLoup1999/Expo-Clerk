import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as SQLite from "expo-sqlite";
import { PieChart } from "react-native-chart-kit";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";

const db = SQLite.openDatabaseSync("meals.db");

type Meal = {
  name: string;
  calories: number;
  protein?: number;
  fat?: number;
  carbohydrates?: number;
};

export default function MealDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [mealDetails, setMealDetails] = useState<Meal | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    fetchMealDetails();
  }, [id]);

  const fetchMealDetails = async () => {
    try {
      const results = db.getAllSync("SELECT name FROM meals WHERE id = ?", [id]) as Meal[];

      if (results.length > 0) {
        const mealName = results[0].name;
        fetchMealNutrition(mealName);
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error("Erreur SQLite :", err);
      setLoading(false);
    }
  };

  const fetchMealNutrition = async (mealName: string) => {
    const appId = "b0fd2c53";
    const appKey = "269a60ce79a71c30db4bfddb94994903";

    try {
      const response = await fetch(
        `https://api.edamam.com/api/food-database/v2/parser?app_id=${appId}&app_key=${appKey}&ingr=${mealName}`
      );
      const data = await response.json();

      if (data.hints && data.hints[0] && data.hints[0].food.nutrients) {
        const nutrients = data.hints[0].food.nutrients;

        setMealDetails({
          name: mealName,
          calories: nutrients.ENERC_KCAL || 0,
          protein: nutrients.PROCNT || 0,
          fat: nutrients.FAT || 0,
          carbohydrates: nutrients.CHOCDF || 0,
        });
      }
      setLoading(false);
    } catch (error) {
      console.error("Erreur lors de la récupération des informations nutritionnelles :", error);
      setLoading(false);
    }
  };

  const deleteMeal = () => {
    try {
      db.runAsync("DELETE FROM meals WHERE id = ?", [id]);
      router.push("/(main)");
    } catch (err) {
      console.error("Erreur de suppression :", err);
    }
  };

  return (
    <LinearGradient colors={["#FF8C00", "#FF4500"]} style={styles.gradient}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.push("/(main)")}>
          <MaterialIcons name="arrow-back" size={28} color="white" />
        </TouchableOpacity>

        <Text style={styles.title}>🍽️ Détail du Repas</Text>

        {loading ? (
          <ActivityIndicator size="large" color="white" />
        ) : mealDetails ? (
          <>
            <Text style={styles.mealName}>{mealDetails.name}</Text>

            <View style={styles.card}>
              <Text style={styles.mealInfo}>🔥 Calories: {mealDetails.calories} kcal</Text>
              <Text style={styles.mealInfo}>💪 Protéines: {mealDetails.protein} g</Text>
              <Text style={styles.mealInfo}>🥑 Graisses: {mealDetails.fat} g</Text>
              <Text style={styles.mealInfo}>🍞 Glucides: {mealDetails.carbohydrates} g</Text>
            </View>

            <PieChart
              data={[
                {
                  name: "Protéines",
                  population: mealDetails.protein || 1,
                  color: "#4CAF50",
                  legendFontColor: "white",
                  legendFontSize: 14,
                },
                {
                  name: "Graisses",
                  population: mealDetails.fat || 1,
                  color: "#F44336",
                  legendFontColor: "white",
                  legendFontSize: 14,
                },
                {
                  name: "Glucides",
                  population: mealDetails.carbohydrates || 1,
                  color: "#FF9800",
                  legendFontColor: "white",
                  legendFontSize: 14,
                },
              ]}
              width={300}
              height={200}
              chartConfig={{
                backgroundColor: "#FF4500",
                backgroundGradientFrom: "#FF8C00",
                backgroundGradientTo: "#FF4500",
                color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
              }}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
            />

            <TouchableOpacity style={styles.deleteButton} onPress={deleteMeal}>
              <Text style={styles.deleteButtonText}>🗑️ Supprimer ce repas</Text>
            </TouchableOpacity>
          </>
        ) : (
          <Text style={styles.errorText}>Aucune information trouvée.</Text>
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    paddingTop: 40,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  container: {
    flex: 1,
    alignItems: "center",
    width: "100%",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "white",
    marginBottom: 20,
  },
  mealName: {
    fontSize: 22,
    fontWeight: "600",
    color: "white",
    marginBottom: 10,
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: 15,
    borderRadius: 10,
    width: "90%",
    alignItems: "center",
    marginBottom: 20,
  },
  mealInfo: {
    fontSize: 18,
    color: "white",
    marginBottom: 5,
  },
  deleteButton: {
    backgroundColor: "#D32F2F",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 20,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
  errorText: {
    fontSize: 18,
    color: "white",
    marginTop: 20,
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
  },
});

