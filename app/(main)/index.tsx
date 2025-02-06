import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  FlatList, 
  Button, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  StatusBar 
} from "react-native";
import { useRouter } from "expo-router";
import * as SQLite from "expo-sqlite";
import { LinearGradient } from "expo-linear-gradient"; // Dégradé pour le fond
import { MaterialIcons } from "@expo/vector-icons"; // Icônes modernes

type Meal = {
  id: number;
  name: string;
  calories: number;
  imageUrl?: string;
};

const db = SQLite.openDatabaseSync("meals.db");

export default function MealsList() {
  const router = useRouter();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [mealImages, setMealImages] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    db.execAsync("CREATE TABLE IF NOT EXISTS meals (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, calories INTEGER);");
    fetchMeals();
  }, []);

  const fetchMeals = () => {
    db.getAllAsync<Meal>("SELECT * FROM meals;")
      .then((results) => {
        setMeals(results);
        fetchMealImages(results);
      })
      .catch((err) => console.error("Erreur SQLite :", err));
  };

  const fetchMealImages = async (meals: Meal[]) => {
    const appId = "b0fd2c53"; 
    const appKey = "269a60ce79a71c30db4bfddb94994903"; 

    let newMealImages: { [key: string]: string } = {};

    for (const meal of meals) {
      try {
        const response = await fetch(
          `https://api.edamam.com/api/food-database/v2/parser?app_id=${appId}&app_key=${appKey}&ingr=${encodeURIComponent(meal.name)}`
        );
        const data = await response.json();

        if (data.hints.length > 0) {
          const foodImage = data.hints[0].food.image;
          if (foodImage) {
            newMealImages[meal.name] = foodImage;
          }
        }
      } catch (error) {
        console.error("Erreur récupération image :", error);
      }
    }

    setMealImages(newMealImages);
  };

  const totalCalories = meals.reduce((total, meal) => total + meal.calories, 0);

  return (
    <LinearGradient colors={["#FF8C00", "#FF4500"]} style={styles.gradient}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <Text style={styles.title}>🍽️ Votre Repas</Text>
      </View>

      <FlatList
        data={meals}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.mealItem}
            activeOpacity={0.7}
            onPress={() => router.push(`/(main)/${item.id}`)}
          >
            {mealImages[item.name] ? (
              <Image source={{ uri: mealImages[item.name] }} style={styles.mealImage} />
            ) : (
              <View style={styles.imagePlaceholder} />
            )}
            <View style={{ flex: 1 }}>
              <Text style={styles.mealName}>{item.name}</Text>
              <Text style={styles.mealCalories}>{item.calories} kcal</Text>
            </View>
          </TouchableOpacity>
        )}
      />

      <Text style={styles.totalCalories}>🔥 Total Calories : {totalCalories} kcal</Text>

      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => router.push("/(main)/add")}>
          <MaterialIcons name="add-circle" size={32} color="white" />
          <Text style={styles.navText}>Ajouter</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push("/(main)/profile")}>
          <MaterialIcons name="person" size={32} color="white" />
          <Text style={styles.navText}>Profil</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    paddingTop: 40,
    paddingHorizontal: 16,
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  title: { 
    fontSize: 28, 
    fontWeight: "700", 
    color: "white" 
  },
  mealItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  mealImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  imagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
    backgroundColor: "#ddd",
  },
  mealName: { 
    fontSize: 18, 
    fontWeight: "bold", 
    color: "white" 
  },
  mealCalories: { 
    fontSize: 16, 
    color: "#FFD700" 
  },
  totalCalories: { 
    fontSize: 18, 
    fontWeight: "700", 
    textAlign: "center",
    color: "white",
    marginTop: 20,
  },
  navBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 10,
    backgroundColor: "#FF4500",
    borderRadius: 10,
    marginTop: 20,
  },
  navText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 5,
  },
});
