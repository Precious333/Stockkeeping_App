// src/components/StockAdjustModal.tsx
import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

interface StockAdjustModalProps {
  visible: boolean;
  itemName: string;
  currentStock: number;
  onClose: () => void;
  onAdjust: (
    type: 'add' | 'remove',
    quantity: number,
    reason: string
  ) => void;
}

export default function StockAdjustModal({
  visible,
  itemName,
  currentStock,
  onClose,
  onAdjust,
}: StockAdjustModalProps) {
  const [type, setType] = useState<'add' | 'remove'>('add');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');

  // RESET FORM WHEN MODAL OPENS
  useEffect(() => {
    if (visible) {
      setType('add');
      setQuantity('');
      setReason('');
    }
  }, [visible]);

  const handleSubmit = () => {
    const qty = Number(quantity);
    if (qty <= 0 || !reason.trim()) return;

    onAdjust(type, qty, reason.trim());
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.select({ ios: 'padding', android: undefined })}
      >
        <View style={styles.center}>
          <View style={styles.card}>

            {/* HEADER */}
            <View style={styles.header}>
              <Text style={styles.title}>Adjust Stock</Text>
              <TouchableOpacity onPress={onClose}>
                <Feather name="x" size={22} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* CONTENT */}
            <ScrollView
              style={{ maxHeight: 420 }}
              showsVerticalScrollIndicator={false}
            >
              <View style={{ paddingHorizontal: 16, paddingTop: 4 }}>

                {/* ITEM */}
                <Text style={styles.label}>Item</Text>
                <Text style={styles.itemName}>{itemName}</Text>
                <Text style={styles.subText}>
                  Current stock: {currentStock}
                </Text>

                {/* ACTION */}
                <Text style={[styles.label, { marginTop: 14 }]}>
                  Action
                </Text>

                <View style={styles.actionRow}>
                  {/* ADD */}
                  <TouchableOpacity
                    style={[
                      styles.actionBtn,
                      type === 'add' && styles.actionBtnAddActive,
                    ]}
                    onPress={() => setType('add')}
                  >
                    <Feather
                      name="plus"
                      size={16}
                      color={type === 'add' ? '#16A34A' : '#374151'}
                    />
                    <Text
                      style={[
                        styles.actionText,
                        type === 'add' && styles.actionTextAddActive,
                      ]}
                    >
                      Add Stock
                    </Text>
                  </TouchableOpacity>

                  {/* REMOVE */}
                  <TouchableOpacity
                    style={[
                      styles.actionBtn,
                      type === 'remove' && styles.actionBtnRemoveActive,
                    ]}
                    onPress={() => setType('remove')}
                  >
                    <Feather
                      name="minus"
                      size={16}
                      color={type === 'remove' ? '#DC2626' : '#374151'}
                    />
                    <Text
                      style={[
                        styles.actionText,
                        type === 'remove' && styles.actionTextRemoveActive,
                      ]}
                    >
                      Remove Stock
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* QUANTITY */}
                <Text style={styles.label}>Quantity</Text>
                <TextInput
                  value={quantity}
                  onChangeText={setQuantity}
                  placeholder="Enter quantity"
                  keyboardType="numeric"
                  style={styles.input}
                />

                {/* REASON */}
                <Text style={styles.label}>Reason</Text>
                <TextInput
                  value={reason}
                  onChangeText={setReason}
                  placeholder="e.g., New shipment, Sale, Damaged"
                  style={styles.input}
                />

              </View>
            </ScrollView>

            {/* CONFIRM BUTTON */}
            <View style={styles.footer}>
              <TouchableOpacity
                style={styles.confirmBtn}
                onPress={handleSubmit}
              >
                <Text style={styles.confirmText}>
                  Confirm Adjustment
                </Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },

  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 6 },
  },

  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },

  label: {
    marginTop: 12,
    color: '#374151',
    fontWeight: '600',
    marginBottom: 4,
  },

  itemName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },

  subText: {
    color: '#6B7280',
    marginTop: 2,
  },

  actionRow: {
    flexDirection: 'row',
    marginTop: 6,
    marginBottom: 12,
  },

  actionBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },

  actionText: {
    marginLeft: 6,
    fontWeight: '600',
    color: '#374151',
  },

  actionBtnAddActive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#16A34A',
  },

  actionTextAddActive: {
    color: '#16A34A',
  },

  actionBtnRemoveActive: {
    backgroundColor: '#FEF2F2',
    borderColor: '#DC2626',
  },

  actionTextRemoveActive: {
    color: '#DC2626',
  },

  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    padding: 12,
    borderRadius: 10,
    marginBottom: 6,
  },

  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderColor: '#E5E7EB',
  },

  confirmBtn: {
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },

  confirmText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
