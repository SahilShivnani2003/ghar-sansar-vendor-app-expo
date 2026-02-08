import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuthStore } from '../store/authStore';
import { categoryAPI } from '../utils/api';

interface Category {
  id: string;
  _id?: string;
  name: string;
  price: number;
  type: string;
  description?: string;
}

interface PurchaseCategoryModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PurchaseCategoryModal({
  visible,
  onClose,
  onSuccess,
}: PurchaseCategoryModalProps) {
  const vendor = useAuthStore((state) => state.vendor);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<any | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'qr'>('cash');
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (visible) {
      loadCategories();
      setSelectedCategory(null);
      setPaymentMethod('cash');
    }
  }, [visible]);

  const loadCategories = async () => {
    try {
      const response = await categoryAPI.getAllCategories();
      // Filter out already purchased categories
      setCategories(response.data.categories || []);
    } catch (error) {
      console.error('Error loading categories:', error);
      Alert.alert('Error', 'Failed to load categories');
    }
  };

  const handlePurchase = async () => {
    if (!selectedCategory || !vendor) return;

    setLoading(true);
    try {
      const purchaseData = {
        categoryId: selectedCategory.id || selectedCategory._id,
        vendorId: vendor.id,
        paymentMethod,
        amount: selectedCategory.price,
      };

      await categoryAPI.purchaseCategory(purchaseData);
      
      Alert.alert('Success', 'Category purchased successfully!', [
        {
          text: 'OK',
          onPress: () => {
            onSuccess();
            onClose();
          },
        },
      ]);
    } catch (error) {
      console.error('Error purchasing category:', error);
      Alert.alert('Error', 'Failed to purchase category. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Purchase Category</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#1f2937" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Category Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Select Category to Purchase</Text>
              
              <TouchableOpacity
                style={styles.dropdown}
                onPress={() => setShowDropdown(!showDropdown)}
              >
                <Text style={selectedCategory ? styles.dropdownTextSelected : styles.dropdownText}>
                  {selectedCategory
                    ? `${selectedCategory.name} - ₹${selectedCategory.price} (${selectedCategory.type})`
                    : 'Choose a category'}
                </Text>
                <Ionicons
                  name={showDropdown ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color="#6b7280"
                />
              </TouchableOpacity>

              {/* Dropdown Menu */}
              {showDropdown && (
                <View style={styles.dropdownMenu}>
                  <ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
                    {categories.map((category) => (
                      <TouchableOpacity
                        key={category._id}
                        style={[
                          styles.dropdownItem,
                          selectedCategory?._id === category._id && styles.dropdownItemSelected,
                        ]}
                        onPress={() => {
                          setSelectedCategory(category);
                          setShowDropdown(false);
                        }}
                      >
                        <Text style={styles.dropdownItemText}>
                          {category.name} - ₹{category.price} ({category.autoFilled})
                        </Text>
                      </TouchableOpacity>
                    ))}
                    {categories.length === 0 && (
                      <View style={styles.emptyDropdown}>
                        <Text style={styles.emptyDropdownText}>No categories available</Text>
                      </View>
                    )}
                  </ScrollView>
                </View>
              )}
            </View>

            {/* Category Details */}
            {selectedCategory && (
              <View style={styles.detailsCard}>
                <Text style={styles.detailsTitle}>Category Details</Text>
                <View style={styles.detailsContent}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Name:</Text>
                    <Text style={styles.detailValue}>{selectedCategory.name}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Price:</Text>
                    <Text style={styles.detailValue}>₹{selectedCategory.price}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Type:</Text>
                    <Text style={styles.detailValue}>{selectedCategory.autoFilled}</Text>
                  </View>
                  {selectedCategory.description && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Description:</Text>
                      <Text style={styles.detailValue}>{selectedCategory.description}</Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* Payment Method */}
            {selectedCategory && (
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Payment Method</Text>
                <View style={styles.paymentMethods}>
                  <TouchableOpacity
                    style={[
                      styles.paymentButton,
                      paymentMethod === 'cash' && styles.paymentButtonActive,
                    ]}
                    onPress={() => setPaymentMethod('cash')}
                  >
                    <Ionicons
                      name="cash"
                      size={20}
                      color={paymentMethod === 'cash' ? '#10b981' : '#6b7280'}
                    />
                    <Text
                      style={[
                        styles.paymentButtonText,
                        paymentMethod === 'cash' && styles.paymentButtonTextActive,
                      ]}
                    >
                      Cash
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.paymentButton,
                      paymentMethod === 'qr' && styles.paymentButtonActive,
                    ]}
                    onPress={() => setPaymentMethod('qr')}
                  >
                    <Ionicons
                      name="qr-code"
                      size={20}
                      color={paymentMethod === 'qr' ? '#10b981' : '#6b7280'}
                    />
                    <Text
                      style={[
                        styles.paymentButtonText,
                        paymentMethod === 'qr' && styles.paymentButtonTextActive,
                      ]}
                    >
                      QR
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Footer Actions */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.purchaseButton,
                (!selectedCategory || loading) && styles.purchaseButtonDisabled,
              ]}
              onPress={handlePurchase}
              disabled={!selectedCategory || loading}
            >
              <Text style={styles.purchaseButtonText}>
                {loading
                  ? 'Processing...'
                  : selectedCategory
                  ? `Purchase for ₹${selectedCategory.price}`
                  : 'Select Category'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '100%',
    maxWidth: 500,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderWidth: 2,
    borderColor: '#c026d3',
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  dropdownText: {
    fontSize: 15,
    color: '#9ca3af',
    flex: 1,
  },
  dropdownTextSelected: {
    fontSize: 15,
    color: '#1f2937',
    flex: 1,
    fontWeight: '500',
  },
  dropdownMenu: {
    marginTop: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dropdownScroll: {
    maxHeight: 200,
  },
  dropdownItem: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  dropdownItemSelected: {
    backgroundColor: '#faf5ff',
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#1f2937',
  },
  emptyDropdown: {
    padding: 20,
    alignItems: 'center',
  },
  emptyDropdownText: {
    fontSize: 14,
    color: '#9ca3af',
  },
  detailsCard: {
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  detailsContent: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    gap: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563eb',
    minWidth: 80,
  },
  detailValue: {
    fontSize: 14,
    color: '#1f2937',
    flex: 1,
  },
  paymentMethods: {
    flexDirection: 'row',
    gap: 12,
  },
  paymentButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 14,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  paymentButtonActive: {
    borderColor: '#10b981',
    backgroundColor: '#f0fdf4',
  },
  paymentButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6b7280',
  },
  paymentButtonTextActive: {
    color: '#10b981',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  cancelButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6b7280',
  },
  purchaseButton: {
    flex: 2,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#10b981',
    alignItems: 'center',
  },
  purchaseButtonDisabled: {
    opacity: 0.5,
  },
  purchaseButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
});