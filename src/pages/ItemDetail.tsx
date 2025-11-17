// src/pages/ItemDetail.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { InventoryItem, getStockLevel } from '../types/inventory';
import StockAdjustModal from '../components/StockAdjustModal';
import EditItemModal from '../components/EditItemModal';
import { formatPrice } from '../utils/format';

interface ItemDetailProps {
  navigation: any;
  route: any;
  items: InventoryItem[];
  onUpdate: (item: InventoryItem, fromEditScreen?: boolean) => void;
  onDelete: (id: string) => void;
}

export default function ItemDetail({
  navigation,
  route,
  items,
  onUpdate,
  onDelete,
}: ItemDetailProps) {
  const { id } = route.params;
  const item = items.find((i) => i.id === id);

  const [showAdjust, setShowAdjust] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  if (!item) return null;

  // STOCK LEVEL LOGIC
  const stockLevel = getStockLevel(item.quantity, item.minLevel);
  const stockColor =
    stockLevel === 'low'
      ? '#DC2626'
      : stockLevel === 'medium'
      ? '#F59E0B'
      : '#16A34A';

  return (
    <ScrollView style={styles.container}>

      {/* HEADER */}
      <View style={styles.pageHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color="#111827" />
        </TouchableOpacity>

        <Text style={styles.pageTitle}>{item.name}</Text>

        <TouchableOpacity onPress={() => setShowEdit(true)}>
          <Feather name="edit-2" size={22} color="#2563EB" />
        </TouchableOpacity>
      </View>

      {/* DETAILS CARD */}
      <View style={styles.card}>
        <DetailRow label="Category" value={item.category} />
        <DetailRow label="Quantity" value={String(item.quantity)} />
        <DetailRow label="Minimum Level" value={String(item.minLevel)} />

        <DetailRow
          label="Stock Status"
          value={
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: stockColor + '20' },
              ]}
            >
              <Text style={[styles.statusText, { color: stockColor }]}>
                {stockLevel === 'good'
                  ? 'In Stock'
                  : stockLevel === 'medium'
                  ? 'Medium'
                  : 'Low Stock'}
              </Text>
            </View>
          }
        />

        <DetailRow label="Price" value={formatPrice(item.price)} />
        <DetailRow
          label="Total Value"
          value={formatPrice(item.price * item.quantity)}
        />
        <DetailRow label="Location" value={item.location || '—'} />
      </View>

      {/* ADJUST BUTTON */}
      <TouchableOpacity
        style={styles.adjustBtn}
        onPress={() => setShowAdjust(true)}
      >
        <Text style={styles.adjustText}>Adjust Stock</Text>
      </TouchableOpacity>

      {/* DELETE BUTTON */}
      <TouchableOpacity
        style={styles.deleteBtn}
        onPress={() => onDelete(item.id)}
      >
        <Feather name="trash-2" size={18} color="#fff" />
        <Text style={styles.deleteText}>Delete Item</Text>
      </TouchableOpacity>

      {/* HISTORY */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>History</Text>

        {item.history?.length ? (
          item.history.map((h) => (
            <View key={h.id} style={styles.historyRow}>
              <View style={styles.historyIconWrap}>
                <Feather name="edit" size={16} color="#DC2626" />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.historyTitle}>
                  {h.type === 'add' && `Added ${h.quantity} units`}
                  {h.type === 'remove' && `Removed ${h.quantity} units`}
                  {h.type === 'edit' && `Edited ${h.newQuantity} units`}
                </Text>
                <Text style={styles.historyReason}>{h.reason}</Text>
              </View>

              <Text style={styles.historyDate}>
                {new Date(h.date).toLocaleDateString()}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.noHistory}>No history yet</Text>
        )}
      </View>

      {/* MODALS */}
      <StockAdjustModal
        visible={showAdjust}
        itemName={item.name}
        currentStock={item.quantity}
        onClose={() => setShowAdjust(false)}
        onAdjust={(type, qty, reason) => {
          const updated: InventoryItem = {
            ...item,
            quantity: type === 'add'
              ? item.quantity + qty
              : item.quantity - qty,

            history: [
              {
                id: String(Date.now()),
                date: new Date().toISOString(),
                type,
                quantity: qty,
                reason,
                previousQuantity: item.quantity,
                newQuantity:
                  type === 'add'
                    ? item.quantity + qty
                    : item.quantity - qty,
              },
              ...(item.history ?? []),
            ],
          };

          onUpdate(updated);
        }}
      />

      <EditItemModal
        visible={showEdit}
        item={item}
        onClose={() => setShowEdit(false)}
        onSave={(updated) => {
          onUpdate(updated, true); // prevents fake remove history logs
          setShowEdit(false);
        }}
      />
    </ScrollView>
  );
}

/* DETAIL ROW */
function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string | number | React.ReactNode;
}) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>

      {typeof value === 'string' || typeof value === 'number' ? (
        <Text style={styles.detailValue}>{value}</Text>
      ) : (
        value
      )}
    </View>
  );
}

/* STYLES */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 16,
  },

  pageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  detailLabel: {
    color: '#374151',
    fontSize: 15,
  },
  detailValue: {
    color: '#111827',
    fontWeight: '700',
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontWeight: '700',
  },

  adjustBtn: {
    padding: 14,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    marginBottom: 14,
  },
  adjustText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },

  deleteBtn: {
    flexDirection: 'row',
    backgroundColor: '#DC2626',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  deleteText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: '700',
    fontSize: 16,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },

  historyRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    alignItems: 'center',
  },

  historyIconWrap: {
    backgroundColor: '#FEE2E2',
    padding: 10,
    borderRadius: 10,
    marginRight: 10,
  },

  historyTitle: {
    fontWeight: '700',
    color: '#111827',
  },
  historyReason: {
    color: '#6B7280',
    fontSize: 13,
  },
  historyDate: {
    color: '#6B7280',
    fontSize: 12,
  },

  noHistory: {
    textAlign: 'center',
    color: '#6B7280',
    paddingVertical: 20,
  },
});
