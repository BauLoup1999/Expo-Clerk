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
};

export default function MealDetails() {
  const { id } = useLocalSearchParams<{ id: string }>(); // Récupérer l'ID du repas
  const [mealName, setMealName] = useState<string | null>(null); // État pour le nom du repas
  const router = useRouter(); // Pour naviguer dans l'application

  useEffect(() => {
    try {
      // Utilisation de getAllSync pour récupérer les repas
      const results = db.getAllSync("SELECT name FROM meals WHERE id = ?", [id]) as Meal[];

      // Vérification des résultats
      if (results.length > 0) {
        setMealName(results[0].name); // Mettre à jour le nom du repas
      }
    } catch (err) {
      console.error("Erreur SQLite :", err); // Gestion des erreurs SQLite
    }
  }, [id]);

  const deleteMeal = () => {
    try {
      // Suppression du repas de la base de données avec `runAsync`
      db.runAsync("DELETE FROM meals WHERE id = ?", [id]);
  
      // Rediriger vers la liste après suppression
      router.push("/(main)");
    } catch (err) {
      console.error("Erreur de suppression :", err); // Gestion des erreurs de suppression
    }
  };
  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Détail du repas</Text>
      {/* Afficher le nom du repas si disponible */}
      {mealName ? (
        <>
          <Text style={styles.mealName}>{mealName}</Text>
        </>
      ) : (
        <Text>Chargement...</Text>
      )}
      <Button title="Retour à la liste" onPress={() => router.push("/(main)")} />
      <Button title="Supprimer le repas" onPress={deleteMeal} color="red" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 16 },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 16 },
  mealName: { fontSize: 22, fontWeight: "500", marginBottom: 10 },
});
