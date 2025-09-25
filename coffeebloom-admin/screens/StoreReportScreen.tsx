// screens/StoreReportScreen.tsx (React Native)
import React, { useState } from "react";
import { View, Text, TextInput, Button, FlatList } from "react-native";
import { submitReport } from "../src/lib/reportService"; 
import { useAuth } from "../src/context/AuthContext";


export default function StoreReportScreen() {
  const { profile } = useAuth(); 
  const [sales, setSales] = useState("");
  const [waste, setWaste] = useState("");
  const [difference, setDifference] = useState("");
  const [category, setCategory] = useState("Coffee");
  const [products, setProducts] = useState<{ name: string; count: number }[]>([]);
  const [pName, setPName] = useState("");
  const [pCount, setPCount] = useState("");

  const addProduct = () => {
    if (pName && pCount) {
      setProducts([...products, { name: pName, count: Number(pCount) }]);
      setPName("");
      setPCount("");
    }
  };

  const handleSubmit = async () => {
    if (!profile) return;

    const report = {
      store: profile.store || "Unknown",
      region: profile.region || "Central",
      category,
      date: new Date().toISOString().split("T")[0],
      sales: Number(sales),
      waste: Number(waste),
      difference: Number(difference),
      topProducts: products,
    };

    await submitReport(report);
    alert("✅ Report submitted!");
    setSales(""); setWaste(""); setDifference(""); setProducts([]);
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 12 }}>
        📥 Daily Report
      </Text>

      {/* input fields ... (省略、前回のコードと同じ) */}

      <Button title="Submit Report" onPress={handleSubmit} />
    </View>
  );
}
