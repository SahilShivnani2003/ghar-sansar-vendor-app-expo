import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuthStore } from '../store/authStore';
import { categoryAPI, propertyAPI } from '../utils/api';
import PurchaseCategoryModal from './purchase-category-modal';

const SERVICE_TYPES = [
  'Home Service',
  'Online Service',
  'On-Site Service',
];

export default function AddService({ serviceId }: { serviceId?: string }) {
  const router = useRouter();
  const vendor = useAuthStore((state) => state.vendor);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [purchasedCategories, setPurchasedCategories] = useState<any[]>([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showServiceTypeModal, setShowServiceTypeModal] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    categoryId: '',
    duration: '',
    location: '',
    serviceType: '',
    terms: '',
    images: [] as string[],
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    if (!vendor) return;

    try {
      const [allCategoriesRes, purchasedRes] = await Promise.all([
        categoryAPI.getAllCategories(),
        categoryAPI.getPurchasedCategories(vendor._id),
      ]);

      setCategories(allCategoriesRes.data.categories || []);
      setPurchasedCategories(purchasedRes.data.categories || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled) {
      const base64Images = result.assets
        .filter((asset) => asset.base64)
        .map((asset) => `data:image/jpeg;base64,${asset.base64}`);

      setFormData({ ...formData, images: [...formData.images, ...base64Images] });
    }
  };

  const handleSubmit = async () => {
    if (!vendor) return;

    if (!formData.name || !formData.description || !formData.price || !formData.categoryId) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const submitData = {
        ...formData,
        price: parseFloat(formData.price),
        vendorId: vendor.id,
      };

      if (serviceId) {
        await propertyAPI.updateProperty(serviceId, submitData);
        Alert.alert('Success', 'Service updated successfully');
      } else {
        await propertyAPI.createProperty(submitData);
        Alert.alert('Success', 'Service created successfully');
      }

      router.back();
    } catch (error) {
      Alert.alert('Error', serviceId ? 'Failed to update service' : 'Failed to create service');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectCategory = (cat: any) => {
    setFormData({
      ...formData,
      category: cat.name,
      categoryId: cat.id || cat._id
    });
    setShowCategoryModal(false);
  };

  const selectServiceType = (type: string) => {
    setFormData({ ...formData, serviceType: type });
    setShowServiceTypeModal(false);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.title}>{serviceId ? 'Edit Service' : 'Add New Service'}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.label}>Service Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Premium Car Wash"
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe your service in detail"
            value={formData.description}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Price (₹) *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 500"
            value={formData.price}
            onChangeText={(text) => setFormData({ ...formData, price: text })}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Location</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Mumbai, India"
            value={formData.location}
            onChangeText={(text) => setFormData({ ...formData, location: text })}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Service Type</Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setShowServiceTypeModal(true)}
          >
            <Text style={formData.serviceType ? styles.dropdownTextSelected : styles.dropdownText}>
              {formData.serviceType || 'Select Service Type'}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#6b7280" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.categoryHeader}>
            <Text style={styles.label}>Category *</Text>
            <TouchableOpacity
              style={styles.purchaseCategoryButton}
              onPress={() => setShowPurchaseModal(true)}
            >
              <Ionicons name="cart" size={16} color="#6366f1" />
              <Text style={styles.purchaseCategoryText}>Purchase</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => {
              if (purchasedCategories.length === 0) {
                Alert.alert(
                  'No Categories',
                  'You haven\'t purchased any categories yet. Please purchase a category first.',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Purchase Now', onPress: () => router.push('/categories') }
                  ]
                );
              } else {
                setShowCategoryModal(true);
              }
            }}
          >
            <Text style={formData.category ? styles.dropdownTextSelected : styles.dropdownText}>
              {formData.category || 'Select Category'}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#6b7280" />
          </TouchableOpacity>

          {purchasedCategories.length === 0 && (
            <Text style={styles.helperText}>
              You need to purchase a category before adding services
            </Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Images ({formData.images.length})</Text>
          <TouchableOpacity style={styles.imageButton} onPress={handlePickImage}>
            <Ionicons name="images" size={24} color="#6366f1" />
            <Text style={styles.imageButtonText}>Add Images</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading
              ? (serviceId ? 'Updating Service...' : 'Creating Service...')
              : (serviceId ? 'Update Service' : 'Create Service')
            }
          </Text>
        </TouchableOpacity>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Category Modal */}
      <Modal
        visible={showCategoryModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Category</Text>
              <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                <Ionicons name="close" size={24} color="#1f2937" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              {purchasedCategories.map((cat) => (
                <TouchableOpacity
                  key={cat.id || cat._id}
                  style={[
                    styles.modalItem,
                    formData.categoryId === (cat.id || cat._id) && styles.modalItemSelected
                  ]}
                  onPress={() => selectCategory(cat)}
                >
                  <View style={styles.modalItemContent}>
                    <Ionicons
                      name={cat.icon || 'pricetag'}
                      size={24}
                      color="#6366f1"
                    />
                    <Text style={styles.modalItemText}>{cat.name}</Text>
                  </View>
                  {formData.categoryId === (cat.id || cat._id) && (
                    <Ionicons name="checkmark-circle" size={24} color="#6366f1" />
                  )}
                </TouchableOpacity>
              ))}

              {purchasedCategories.length === 0 && (
                <View style={styles.emptyModal}>
                  <Ionicons name="cart-outline" size={48} color="#d1d5db" />
                  <Text style={styles.emptyModalText}>No purchased categories</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Service Type Modal */}
      <Modal
        visible={showServiceTypeModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowServiceTypeModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Service Type</Text>
              <TouchableOpacity onPress={() => setShowServiceTypeModal(false)}>
                <Ionicons name="close" size={24} color="#1f2937" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              {SERVICE_TYPES.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.modalItem,
                    formData.serviceType === type && styles.modalItemSelected
                  ]}
                  onPress={() => selectServiceType(type)}
                >
                  <Text style={styles.modalItemText}>{type}</Text>
                  {formData.serviceType === type && (
                    <Ionicons name="checkmark-circle" size={24} color="#6366f1" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Purchase modal  */}
      <PurchaseCategoryModal
        visible={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
        onSuccess={loadCategories}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingTop: 48,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    width: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  purchaseCategoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#6366f1',
    backgroundColor: '#f5f3ff',
  },
  purchaseCategoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6366f1',
  },
  input: {
    fontSize: 16,
    color: '#1f2937',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: 16,
    color: '#1f2937',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
  },
  dropdownText: {
    fontSize: 16,
    color: '#9ca3af',
  },
  dropdownTextSelected: {
    fontSize: 16,
    color: '#1f2937',
  },
  helperText: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 4,
  },
  imageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderWidth: 2,
    borderColor: '#6366f1',
    borderStyle: 'dashed',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  imageButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6366f1',
  },
  submitButton: {
    backgroundColor: '#6366f1',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 24,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  modalScroll: {
    padding: 16,
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f9fafb',
    marginBottom: 8,
  },
  modalItemSelected: {
    backgroundColor: '#ede9fe',
    borderWidth: 2,
    borderColor: '#6366f1',
  },
  modalItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalItemText: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
  },
  emptyModal: {
    alignItems: 'center',
    padding: 32,
  },
  emptyModalText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 12,
  },
});