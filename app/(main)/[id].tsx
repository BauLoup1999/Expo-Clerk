import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Button } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as SQLite from "expo-sqlite";
import { PieChart } from "react-native-chart-kit";

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
  const [mealName, setMealName] = useState<string | null>(null);
  const [mealDetails, setMealDetails] = useState<Meal | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    setLoading(true);
    try {
      const results = db.getAllSync("SELECT name FROM meals WHERE id = ?", [id]) as Meal[];

      if (results.length > 0) {
        setMealName(results[0].name);
        fetchMealNutrition(results[0].name);
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error("Erreur SQLite :", err);
      setLoading(false);
    }
  }, [id]);

  const fetchMealNutrition = async (mealName: string) => {
    const appId = "6810951a";
    const appKey = "47913954f8829bd8e2901a6eb2319745";

    try {
      const response = await fetch(
        `https://api.edamam.com/api/food-database/v2/parser?app_id=${appId}&app_key=${appKey}&ingr=${mealName}`
      );
      const data = await response.json();

      if (data.hints && data.hints[0] && data.hints[0].food.nutrients) {
        const nutrients = data.hints[0].food.nutrients;

        setMealDetails({
          name: mealName,
          calories: nutrients.ENERC_KCAL,
          protein: nutrients.PROCNT,
          fat: nutrients.FAT,
          carbohydrates: nutrients.CHOCDF,
        });
      } else {
        setMealDetails(null);
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
    <View style={styles.container}>
      <Text style={styles.title}>Détail du repas</Text>
      {mealName ? (
        <>
          <Text style={styles.mealName}>{mealName}</Text>
        </>
      ) : (
        <Text>Chargement...</Text>
      )}

      {mealDetails ? (
        <View style={styles.detailsContainer}>
          <Text style={styles.mealInfo}>Calories: {mealDetails.calories} kcal</Text>
          <Text style={styles.mealInfo}>Protéines: {mealDetails.protein} g</Text>
          <Text style={styles.mealInfo}>Graisses: {mealDetails.fat} g</Text>
          <Text style={styles.mealInfo}>Glucides: {mealDetails.carbohydrates} g</Text>

          <PieChart
            data={[
              {
                name: "Protéines",
                population: mealDetails.protein || 0,
                color: "green",
                legendFontColor: "#000",
                legendFontSize: 12,
              },
              {
                name: "Graisses",
                population: mealDetails.fat || 0,
                color: "red",
                legendFontColor: "#000",
                legendFontSize: 12,
              },
              {
                name: "Glucides",
                population: mealDetails.carbohydrates || 0,
                color: "orange",
                legendFontColor: "#000",
                legendFontSize: 12,
              },
            ]}
            width={300}
            height={200}
            chartConfig={{
              backgroundColor: "#e26a00",
              backgroundGradientFrom: "#fb8c00",
              backgroundGradientTo: "#ffa726",
              decimalPlaces: 2,
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              style: {
                borderRadius: 16,
              },
            }}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
          />
        </View>
      ) : (
        <Text>Chargement des informations nutritionnelles...</Text>
      )}

      <Button title="Supprimer ce repas" onPress={deleteMeal} color="red" />
      <Button title="Retour à la liste" onPress={() => router.push("/(main)")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 16 },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 16 },
  mealName: { fontSize: 22, fontWeight: "500", marginBottom: 10 },
  detailsContainer: { marginTop: 20 },
  mealInfo: { fontSize: 18, marginBottom: 8 },
});
