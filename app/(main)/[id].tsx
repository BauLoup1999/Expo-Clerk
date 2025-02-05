import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Button } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as SQLite from "expo-sqlite";

// Utilisation de openDatabaseSync pour SQLite
const db = SQLite.openDatabaseSync("meals.db");

// Type pour les repas
type Meal = {
  name: string;
  calories: number;
  protein?: number;
  fat?: number;
  carbohydrates?: number;
};

export default function MealDetails() {
  const { id } = useLocalSearchParams<{ id: string }>(); // Récupérer l'ID du repas
  const [mealName, setMealName] = useState<string | null>(null); // État pour le nom du repas
  const [mealDetails, setMealDetails] = useState<Meal | null>(null); // Détails du repas
  const router = useRouter(); // Pour naviguer dans l'application

  useEffect(() => {
    try {
      // Utilisation de getAllSync pour récupérer le repas par ID
      const results = db.getAllSync("SELECT name FROM meals WHERE id = ?", [id]) as Meal[];

      if (results.length > 0) {
        setMealName(results[0].name); // Mettre à jour le nom du repas
        fetchMealNutrition(results[0].name); // Récupérer les informations nutritionnelles
      }
    } catch (err) {
      console.error("Erreur SQLite :", err); // Gestion des erreurs SQLite
    }
  }, [id]);

  // Fonction pour récupérer les informations nutritionnelles de l'API Edamam
  const fetchMealNutrition = async (mealName: string) => {
    const appId = "6810951a"; // Ton App ID
    const appKey = "47913954f8829bd8e2901a6eb2319745"; // Ta clé API

    console.log(`Recherche d'aliment: ${mealName}`); // Log du nom du repas pour débogage

    try {
      const response = await fetch(
        `https://api.edamam.com/api/food-database/v2/parser?app_id=${appId}&app_key=${appKey}&ingr=${mealName}`
      );
      const data = await response.json();

      console.log("Réponse de l'API Edamam:", data); // Afficher la réponse complète de l'API

      if (data.hints && data.hints[0] && data.hints[0].food.nutrients) {
        const nutrients = data.hints[0].food.nutrients;

        // Mettre à jour les informations nutritionnelles
        setMealDetails({
          name: mealName,
          calories: nutrients.ENERC_KCAL,
          protein: nutrients.PROCNT,
          fat: nutrients.FAT,
          carbohydrates: nutrients.CHOCDF,
        });
      } else {
        console.log("Aucune donnée nutritionnelle trouvée");
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des informations nutritionnelles :", error);
    }
  };

  // Fonction pour supprimer le repas
  const deleteMeal = () => {
    try {
      // Suppression du repas de la base de données
      db.runAsync("DELETE FROM meals WHERE id = ?", [id]);
      console.log("Repas supprimé avec succès");

      // Rediriger vers la liste après suppression
      router.push("/(main)");
    } catch (err) {
      console.error("Erreur de suppression :", err); // Gestion des erreurs de suppression
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Détail du repas</Text>
      {/* Afficher le nom du repas */}
      {mealName ? (
        <>
          <Text style={styles.mealName}>{mealName}</Text>
        </>
      ) : (
        <Text>Chargement...</Text>
      )}

      {/* Afficher les informations nutritionnelles */}
      {mealDetails ? (
        <View style={styles.detailsContainer}>
          <Text style={styles.mealInfo}>Calories: {mealDetails.calories} kcal</Text>
          <Text style={styles.mealInfo}>Protéines: {mealDetails.protein} g</Text>
          <Text style={styles.mealInfo}>Graisses: {mealDetails.fat} g</Text>
          <Text style={styles.mealInfo}>Glucides: {mealDetails.carbohydrates} g</Text>
        </View>
      ) : (
        <Text>Chargement des informations nutritionnelles...</Text>
      )}

      {/* Bouton pour supprimer le repas */}
      <Button title="Supprimer ce repas" onPress={deleteMeal} color="red" />

      {/* Bouton pour revenir à la liste des repas */}
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
