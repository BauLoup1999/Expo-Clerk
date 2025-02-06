import { router } from "expo-router";
import {
  View,
  ActivityIndicator,
  StyleSheet,
  Pressable,
  Image,
  Text,
  Button,
  FlatList, // Ajouter l'importation de FlatList
} from "react-native";
import {
  useCameraPermissions,
  CameraView,
  CameraType,
  CameraCapturedPicture,
} from "expo-camera";
import { useEffect, useState, useRef } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import * as FileSystem from "expo-file-system";
import { Video } from "expo-av";
import * as SQLite from "expo-sqlite"; // Importation de SQLite

const db = SQLite.openDatabaseSync("meals.db"); // Assurez-vous que la base de données est correctement ouverte

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>("back");
  const camera = useRef<CameraView>(null);
  const [picture, setPicture] = useState<CameraCapturedPicture>();
  const [isRecording, setIsRecording] = useState(false);
  const [video, setVideo] = useState<string>();
  const [scanned, setScanned] = useState(false);
  const [barcodeData, setBarcodeData] = useState<string>("");
  const [searchResults, setSearchResults] = useState([]); // Liste des résultats de recherche

  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [permission]);

  const toggleCameraFacing = () => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  };

  const handleBarCodeScanned = async (scanResult: { type: string, data: string }) => {
    console.log("Code-barres scanné:", scanResult.data);
    setScanned(true);
    setBarcodeData(scanResult.data); // Stocke l'info scannée
  
    const appId = "6810951a"; // Ton App ID
    const appKey = "47913954f8829bd8e2901a6eb2319745"; // Ta clé API
  
    try {
      const response = await fetch(
        `https://api.edamam.com/api/food-database/v2/parser?app_id=${appId}&app_key=${appKey}&upc=${scanResult.data}`
      );
      const data = await response.json();
      console.log("Données de l'aliment:", data);
  
      // Si un aliment est trouvé, insérer directement dans la base de données
      if (data.hints && data.hints.length > 0) {
        const food = data.hints[0].food;
        const mealName = food.label;
        const calories = food.nutrients.ENERC_KCAL || 0;
  
        // Vérifier si le repas existe déjà dans la base de données
        const query = "SELECT * FROM meals WHERE name = ?";
        const result = await db.getAllAsync(query, [mealName]);
  
        // Si le repas existe déjà, ne pas insérer et afficher un message
        if (result.length > 0) {
          console.log("Le repas existe déjà:", mealName);
        } else {
          // Si le repas n'existe pas, on l'ajoute à la base de données
          db.runAsync("INSERT INTO meals (name, calories) VALUES (?, ?)", [mealName, parseInt(calories.toString(), 10)]);
          console.log("Repas ajouté :", mealName, calories);
        }
  
        // Rediriger vers la page des repas après l'ajout ou si le repas existe déjà
        router.push("/(main)");
      }
    } catch (error) {
      console.error("Erreur lors de l'appel à l'API d'Edamam:", error);
    }
  };
  

  const onPress = () => {
    if (isRecording) {
      camera.current?.stopRecording();
    } else {
      takePicture();
    }
  };

  const takePicture = async () => {
    const res = await camera.current?.takePictureAsync();
    setPicture(res);
  };

  const startRecording = async () => {
    setIsRecording(true);
    const res = await camera.current?.recordAsync({ maxDuration: 60 });
    console.log(res);
    setVideo(res?.uri);
    setIsRecording(false);
  };

  const saveFile = async (uri?: string) => {
    if (!uri) return;

    const filename = uri.split("/").pop(); // Récupère le nom du fichier

    // Vérifier que documentDirectory est disponible
    if (FileSystem.documentDirectory && filename) {
      const newUri = FileSystem.documentDirectory + filename;

      await FileSystem.copyAsync({
        from: uri,
        to: newUri,
      });

      setPicture(undefined);
      setVideo(undefined);
      router.back(); // Retour à l'écran précédent après l'enregistrement
    } else {
      console.error("Erreur : Le répertoire n'est pas disponible ou filename est undefined.");
    }
  };

  if (!permission?.granted) {
    return <ActivityIndicator />;
  }

  if (picture || video) {
    return (
      <View style={{ flex: 1 }}>
        {picture && (
          <Image source={{ uri: picture.uri }} style={{ width: "100%", flex: 1 }} />
        )}

        {video && (
          <Video
            source={{ uri: video }}
            style={{ width: "100%", flex: 1 }}
            shouldPlay
            isLooping
          />
        )}

        <View style={{ padding: 10 }}>
          <SafeAreaView edges={["bottom"]}>
            <Button title="Save" onPress={() => saveFile(picture?.uri || video)} />
          </SafeAreaView>
        </View>
        <MaterialIcons
          onPress={() => {
            setPicture(undefined);
            setVideo(undefined);
          }}
          name="close"
          size={35}
          color="white"
          style={{ position: "absolute", top: 50, left: 20 }}
        />
      </View>
    );
  }

  return (
    <View>
      <CameraView
        ref={camera}
        mode="video" // Vous pouvez changer en "photo" si vous souhaitez uniquement capturer des photos
        style={styles.camera}
        facing={facing}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["qr", "ean13", "ean8", "code128", "pdf417", "itf14", "upc_a", "upc_e", "aztec", "codabar", "code39", "datamatrix", "code128"],
        }}
      >
        <View style={styles.footer}>
          <View />
          <Pressable
            style={[styles.recordButton, { backgroundColor: isRecording ? "crimson" : "white" }]}
            onPress={onPress}
            onLongPress={startRecording}
          />
          <MaterialIcons
            name="flip-camera-ios"
            size={24}
            color={"white"}
            onPress={toggleCameraFacing}
          />
        </View>
      </CameraView>

      <MaterialIcons
        name="close"
        color={"white"}
        style={styles.close}
        size={30}
        onPress={() => router.back()}
      />
      {scanned && <Text style={{ color: "white", padding: 20 }}>QR Code Data: {barcodeData}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  camera: {
    width: "100%",
    height: "100%",
  },
  footer: {
    marginTop: "auto",
    padding: 20,
    paddingBottom: 50,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#00000099",
  },
  close: {
    position: "absolute",
    top: 50,
    left: 20,
  },
  recordButton: {
    width: 50,
    height: 50,
    borderRadius: 50,
    backgroundColor: "white",
  },
});
