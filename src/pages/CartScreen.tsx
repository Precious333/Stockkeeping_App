// src/pages/CartScreen.tsx
import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  Switch, // <--- Added Switch
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useCart } from "../context/CartContext";
import { generateReceiptPdf } from "../utils/receiptPdf";

interface CartProps {
  navigation: any;
  onCheckout: (items: any[]) => Promise<void>;
}

export default function CartScreen({ navigation, onCheckout }: CartProps) {
  const { cart, removeFromCart, addToCart, decreaseCartQuantity, clearCart } = useCart();

  const [customerName, setCustomerName] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [applyDiscount, setApplyDiscount] = useState(false); // <--- Discount State

  // Calculations
  const subTotal = useMemo(
    () => cart.reduce((sum, i) => sum + i.quantity * i.price, 0),
    [cart]
  );

  const discount = applyDiscount ? subTotal * 0.10 : 0; // <--- 10% Logic
  const tax = 0;
  const shipping = 0;
  const grandTotal = subTotal - discount + tax + shipping;

  const increaseQty = (id: string) => {
    const item = cart.find((c) => c.id === id);
    if (item) addToCart(item, 1);
  };

  const decreaseQty = (id: string) => {
    decreaseCartQuantity(id);
  };

  const generateReceipt = async () => {
    if (!customerName.trim()) {
      Alert.alert("Missing Info", "Please enter customer name");
      return;
    }

    if (cart.length === 0) {
      Alert.alert("Empty Cart", "Add items before generating a receipt.");
      return;
    }

    setIsProcessing(true);

    try {
      if (onCheckout) {
        await onCheckout(cart);
      }

      await generateReceiptPdf({
        receiptNumber: Date.now().toString(),
        receiptDate: new Date().toLocaleDateString(),
        customerName,
        customerAddress,
        customerPhone,
        items: cart.map((c) => ({
          description: c.name,
          quantity: c.quantity,
          price: c.price,
        })),
        tax,
        shipping,
        discount, // <--- Pass discount to receipt
        notes: "Thank you for your purchase!",
      });

      clearCart();
      setApplyDiscount(false); // Reset discount
      Alert.alert("Success", "Inventory updated and Receipt generated!");
      navigation.goBack(); 

    } catch (error: any) {
      console.error("Checkout Failed", error);
      Alert.alert("Transaction Failed", "Check internet connection.");
    } finally {
      setIsProcessing(false);
    }
  };

  const renderItem = ({ item }: any) => (
    <View style={styles.cartRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.price}>₦{item.price.toLocaleString()}</Text>
      </View>
      <View style={styles.qtyControl}>
        <TouchableOpacity onPress={() => decreaseQty(item.id)} style={styles.qtyBtn}>
          <Feather name="minus" size={16} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.qtyText}>{item.quantity}</Text>
        <TouchableOpacity onPress={() => increaseQty(item.id)} style={styles.qtyBtn}>
          <Feather name="plus" size={16} color="#374151" />
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={() => removeFromCart(item.id)} style={{ padding: 4 }}>
        <Feather name="x-circle" size={22} color="#DC2626" />
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cart</Text>
        <TouchableOpacity onPress={clearCart}>
           <Text style={{color: '#DC2626', fontSize: 13}}>Clear</Text>
        </TouchableOpacity>
      </View>

      {cart.length === 0 ? (
        <View style={{ padding: 40, alignItems: "center" }}>
          <Feather name="shopping-cart" size={40} color="#D1D5DB" />
          <Text style={{ color: "#6B7280", marginTop: 10 }}>Your cart is empty.</Text>
        </View>
      ) : (
        <FlatList
          data={cart}
          renderItem={renderItem}
          keyExtractor={(i) => i.id}
          scrollEnabled={false}
        />
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Customer Details</Text>
        <TextInput placeholder="Customer Name" style={styles.input} value={customerName} onChangeText={setCustomerName} />
        <TextInput placeholder="Address (Optional)" style={styles.input} value={customerAddress} onChangeText={setCustomerAddress} />
        <TextInput placeholder="Phone Number (Optional)" style={styles.input} value={customerPhone} onChangeText={setCustomerPhone} keyboardType="phone-pad" />
      </View>

      <View style={styles.totalsBox}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Subtotal</Text>
          <Text style={styles.totalValue}>₦{subTotal.toLocaleString()}</Text>
        </View>

        {/* DISCOUNT TOGGLE */}
        <View style={[styles.totalRow, { alignItems: 'center', marginVertical: 8 }]}>
          <Text style={styles.totalLabel}>Apply 10% Discount</Text>
          <Switch
            value={applyDiscount}
            onValueChange={setApplyDiscount}
            trackColor={{ false: "#D1D5DB", true: "#BFDBFE" }}
            thumbColor={applyDiscount ? "#2563EB" : "#f4f3f4"}
          />
        </View>

        {applyDiscount && (
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, { color: '#DC2626' }]}>Discount (10%)</Text>
            <Text style={[styles.totalValue, { color: '#DC2626' }]}>-₦{discount.toLocaleString()}</Text>
          </View>
        )}

        <View style={[styles.totalRow, styles.grandTotalRow]}>
          <Text style={styles.grandTotalLabel}>Total</Text>
          <Text style={styles.grandTotalValue}>₦{grandTotal.toLocaleString()}</Text>
        </View>
      </View>

      <TouchableOpacity 
        style={[styles.receiptBtn, (cart.length === 0 || isProcessing) && { opacity: 0.6 }]} 
        onPress={generateReceipt}
        disabled={cart.length === 0 || isProcessing}
      >
        {isProcessing ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Feather name="check-circle" size={20} color="#fff" />
            <Text style={styles.receiptBtnText}>Confirm Sale & Receipt</Text>
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#F9FAFB" },
  headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 20, justifyContent: "space-between" },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#111827" },
  cartRow: { flexDirection: "row", padding: 12, backgroundColor: "#fff", borderRadius: 12, borderWidth: 1, borderColor: "#E5E7EB", marginBottom: 10, alignItems: "center" },
  itemName: { fontSize: 16, fontWeight: "600", color: "#111827" },
  price: { fontSize: 14, color: "#6B7280", marginTop: 4 },
  qtyControl: { flexDirection: "row", alignItems: "center", marginRight: 16 },
  qtyBtn: { width: 32, height: 32, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 8 },
  qtyText: { marginHorizontal: 12, fontSize: 16, fontWeight: "600" },
  section: { marginTop: 20, backgroundColor: "#fff", padding: 16, borderRadius: 12, borderWidth: 1, borderColor: "#E5E7EB" },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 12, color: "#374151" },
  input: { backgroundColor: "#F9FAFB", borderRadius: 10, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: "#D1D5DB" },
  totalsBox: { marginTop: 20, backgroundColor: "#fff", padding: 16, borderRadius: 12, borderWidth: 1, borderColor: "#E5E7EB" },
  totalRow: { flexDirection: "row", justifyContent: "space-between", marginVertical: 4 },
  totalLabel: { color: "#6B7280", fontSize: 14 },
  totalValue: { fontWeight: "600", color: "#111827", fontSize: 14 },
  grandTotalRow: { marginTop: 12, borderTopWidth: 1, borderColor: "#E5E7EB", paddingTop: 12 },
  grandTotalLabel: { fontSize: 18, fontWeight: "700", color: "#111827" },
  grandTotalValue: { fontSize: 18, fontWeight: "700", color: "#2563EB" },
  receiptBtn: { marginTop: 30, backgroundColor: "#2563EB", padding: 16, borderRadius: 12, flexDirection: "row", justifyContent: "center", alignItems: "center", marginBottom: 40, shadowColor: "#2563EB", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  receiptBtnText: { color: "#fff", marginLeft: 8, fontSize: 16, fontWeight: "600" },
});