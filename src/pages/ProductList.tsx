// src/pages/ProductList.tsx
import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { useCart } from "../context/CartContext";
import { InventoryItem, CATEGORIES, getStockLevel } from "../types/inventory";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { formatPrice } from "../utils/format";

interface Props {
  navigation: any;
  items: InventoryItem[];
}

const ALL_CATEGORY = "All";

export default function ProductList({ navigation, items }: Props) {
  const { addToCart, cart } = useCart();
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [qty, setQty] = useState("1");
  
  // Search & Filter State
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState(ALL_CATEGORY);

  // Filter Logic
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        activeCategory === ALL_CATEGORY || item.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [items, search, activeCategory]);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const openModal = (item: InventoryItem) => {
    setSelectedItem(item);
    setQty("1");
  };

  const handleAdd = () => {
    if (selectedItem) {
      addToCart(selectedItem, Number(qty));
      setSelectedItem(null);
    }
  };

  // Render a single product card
  const renderItem = ({ item }: { item: InventoryItem }) => {
    const stockLevel = getStockLevel(item.quantity, item.minLevel);
    const isOutOfStock = item.quantity <= 0;

    return (
      <TouchableOpacity 
        style={[styles.card, isOutOfStock && styles.cardDisabled]} 
        onPress={() => !isOutOfStock && openModal(item)}
        activeOpacity={0.7}
        disabled={isOutOfStock}
      >
        {/* ICON / IMAGE PLACEHOLDER */}
        <View style={[styles.iconBox, isOutOfStock && { backgroundColor: '#F3F4F6' }]}>
          <MaterialCommunityIcons 
            name={isOutOfStock ? "package-variant-closed" : "pill"} 
            size={24} 
            color={isOutOfStock ? "#9CA3AF" : "#2563EB"} 
          />
        </View>

        {/* DETAILS */}
        <View style={styles.cardContent}>
          <View style={styles.topRow}>
            <Text style={[styles.name, isOutOfStock && { color: '#9CA3AF' }]}>
              {item.name}
            </Text>
            {stockLevel === 'low' && !isOutOfStock && (
              <View style={styles.lowStockBadge}>
                <Text style={styles.lowStockText}>Low</Text>
              </View>
            )}
          </View>
          
          <Text style={styles.category}>{item.category}</Text>
          
          <View style={styles.priceRow}>
            <Text style={[styles.price, isOutOfStock && { color: '#9CA3AF' }]}>
              {formatPrice(item.price)}
            </Text>
            <Text style={styles.stockCount}>
              {isOutOfStock ? "Out of Stock" : `${item.quantity} left`}
            </Text>
          </View>
        </View>

        {/* ADD BUTTON */}
        {!isOutOfStock && (
          <TouchableOpacity style={styles.addBtn} onPress={() => openModal(item)}>
            <Feather name="plus" size={20} color="#fff" />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Feather name="arrow-left" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Select Product</Text>
          
          <TouchableOpacity 
            style={styles.cartBtn} 
            onPress={() => navigation.navigate("Cart")}
          >
            <Feather name="shopping-cart" size={22} color="#111827" />
            {cartCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* SEARCH BAR */}
        <View style={styles.searchContainer}>
          <Feather name="search" size={18} color="#6B7280" style={styles.searchIcon} />
          <TextInput
            placeholder="Search products..."
            placeholderTextColor="#9CA3AF"
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* CATEGORY TABS */}
        <View style={{ height: 50 }}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.catScroll}
          >
            <TouchableOpacity
              style={[
                styles.catChip,
                activeCategory === ALL_CATEGORY && styles.catChipActive
              ]}
              onPress={() => setActiveCategory(ALL_CATEGORY)}
            >
              <Text
                style={[
                  styles.catText,
                  activeCategory === ALL_CATEGORY && styles.catTextActive
                ]}
              >
                All
              </Text>
            </TouchableOpacity>

            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.catChip,
                  activeCategory === cat && styles.catChipActive
                ]}
                onPress={() => setActiveCategory(cat)}
              >
                <Text
                  style={[
                    styles.catText,
                    activeCategory === cat && styles.catTextActive
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      {/* PRODUCT LIST */}
      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Feather name="search" size={40} color="#D1D5DB" />
            <Text style={styles.emptyText}>No products found</Text>
          </View>
        }
      />

      {/* QTY MODAL */}
      <Modal visible={!!selectedItem} transparent animationType="fade">
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <TouchableOpacity 
            style={styles.modalBackdrop} 
            activeOpacity={1} 
            onPress={() => setSelectedItem(null)}
          />
          
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Add to Cart</Text>
                <Text style={styles.modalSubtitle}>{selectedItem?.name}</Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedItem(null)}>
                <Feather name="x" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.label}>Quantity</Text>
              <View style={styles.qtyInputRow}>
                <TouchableOpacity 
                  style={styles.qtyAdjust} 
                  onPress={() => setQty(String(Math.max(1, Number(qty) - 1)))}
                >
                  <Feather name="minus" size={20} color="#374151" />
                </TouchableOpacity>
                
                <TextInput
                  style={styles.qtyInput}
                  keyboardType="numeric"
                  value={qty}
                  onChangeText={setQty}
                  textAlign="center"
                />

                <TouchableOpacity 
                  style={styles.qtyAdjust}
                  onPress={() => setQty(String(Number(qty) + 1))}
                >
                  <Feather name="plus" size={20} color="#374151" />
                </TouchableOpacity>
              </View>

              <View style={styles.totalPreview}>
                <Text style={styles.totalLabel}>Total Amount:</Text>
                <Text style={styles.totalValue}>
                  {formatPrice((selectedItem?.price || 0) * (Number(qty) || 0))}
                </Text>
              </View>
            </View>

            <TouchableOpacity style={styles.confirmBtn} onPress={handleAdd}>
              <Text style={styles.confirmText}>Add to Cart</Text>
              <Feather name="arrow-right" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  
  /* HEADER */
  header: {
    backgroundColor: "#fff",
    paddingTop: 40,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    zIndex: 10,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#111827" },
  cartBtn: { position: "relative", padding: 4 },
  badge: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: "#DC2626",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#fff",
  },
  badgeText: { color: "#fff", fontSize: 10, fontWeight: "700" },

  /* SEARCH */
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    marginHorizontal: 16,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 12,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 15, color: "#111827", height: "100%" },

  /* CATEGORY CHIPS */
  catScroll: { paddingHorizontal: 16, paddingBottom: 4 },
  catChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "transparent",
    height: 32,
    justifyContent: 'center',
  },
  catChipActive: {
    backgroundColor: "#EFF6FF",
    borderColor: "#BFDBFE",
  },
  catText: { fontSize: 13, color: "#4B5563", fontWeight: "500" },
  catTextActive: { color: "#2563EB", fontWeight: "600" },

  /* LIST */
  listContent: { padding: 16, paddingBottom: 40 },
  
  /* CARD */
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    alignItems: "center",
    // Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: "transparent",
  },
  cardDisabled: { opacity: 0.6, backgroundColor: "#F9FAFB", borderColor: "#E5E7EB" },
  
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  cardContent: { flex: 1 },
  topRow: { flexDirection: "row", alignItems: "center", marginBottom: 2 },
  name: { fontSize: 16, fontWeight: "600", color: "#1F2937", marginRight: 8 },
  lowStockBadge: { backgroundColor: "#FEF2F2", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  lowStockText: { color: "#DC2626", fontSize: 10, fontWeight: "700" },
  
  category: { fontSize: 12, color: "#6B7280", marginBottom: 6 },
  
  priceRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginRight: 10 },
  price: { fontSize: 15, fontWeight: "700", color: "#16A34A" },
  stockCount: { fontSize: 12, color: "#9CA3AF" },

  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },

  emptyState: { alignItems: "center", marginTop: 60 },
  emptyText: { marginTop: 10, color: "#9CA3AF", fontSize: 16 },

  /* MODAL */
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  modalTitle: { fontSize: 20, fontWeight: "700", color: "#111827" },
  modalSubtitle: { fontSize: 14, color: "#6B7280", marginTop: 2 },
  
  modalBody: { marginBottom: 24 },
  label: { fontSize: 14, fontWeight: "600", color: "#374151", marginBottom: 12 },
  
  qtyInputRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  qtyAdjust: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  qtyInput: {
    flex: 1,
    height: 44,
    marginHorizontal: 12,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  
  totalPreview: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  totalLabel: { fontSize: 14, color: "#6B7280" },
  totalValue: { fontSize: 18, fontWeight: "700", color: "#2563EB" },

  confirmBtn: {
    backgroundColor: "#2563EB",
    paddingVertical: 16,
    borderRadius: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  confirmText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
  },
});