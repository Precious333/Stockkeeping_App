import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useCart } from "../context/CartContext";
import * as Print from "expo-print";

export default function Receipt({ navigation }: any) {
  const { cart, clearCart } = useCart();
  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);

  const generatePDF = async () => {
    const html = `
      <h2>Receipt</h2>
      <p>Date: ${new Date().toLocaleString()}</p>
      <hr />
      ${cart
        .map(
          (i) => `
          <p>${i.name} — ${i.quantity} × ₦${i.price.toLocaleString()}</p>
        `
        )
        .join("")}
      <hr />
      <h3>Total: ₦${total.toLocaleString()}</h3>
    `;
    await Print.printAsync({ html });
    Alert.alert("Receipt Generated");
    clearCart();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Receipt Summary</Text>

      {cart.map((i) => (
        <Text key={i.id} style={styles.line}>
          {i.name} — {i.quantity} × ₦{i.price.toLocaleString()}
        </Text>
      ))}

      <Text style={styles.total}>Total: ₦{total.toLocaleString()}</Text>

      <TouchableOpacity style={styles.btn} onPress={generatePDF}>
        <Text style={styles.btnText}>Generate Receipt</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 20, fontWeight: "700", marginBottom: 20 },
  line: { marginBottom: 10, fontSize: 16 },
  total: { fontSize: 22, fontWeight: "800", marginVertical: 20 },
  btn: {
    backgroundColor: "#2563EB",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontWeight: "700" },
});
