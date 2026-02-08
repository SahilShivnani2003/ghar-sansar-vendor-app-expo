import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../store/authStore';
import { categoryAPI } from '../utils/api';
import { Category } from '../types';

export default function Categories() {
  const router = useRouter();
  const vendor = useAuthStore((state) => state.vendor);
  const [categories, setCategories] = useState<Category[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'purchased'>('all');

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    if (!vendor) return;

    try {
      const response = await categoryAPI.getCategories(vendor.id);
      setCategories(response.data);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadCategories();
  };

  const handlePurchase = async (categoryId: string, categoryName: string, price: number) => {
    Alert.alert(
      'Purchase Category',
      `Purchase ${categoryName} for ₹${price}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Purchase',
          onPress: async () => {
            try {
              await categoryAPI.purchaseCategory(categoryId, vendor!.id);
              loadCategories();
              Alert.alert('Success', 'Category purchased successfully');
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.detail || 'Failed to purchase category');
            }
          },
        },
      ]
    );
  };

  const filteredCategories =
    activeTab === 'all'
      ? categories
      : categories.filter((cat) => cat.isPurchased);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.title}>Categories</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'all' && styles.activeTab]}
          onPress={() => setActiveTab('all')}
        >
          <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
            All Categories
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'purchased' && styles.activeTab]}
          onPress={() => setActiveTab('purchased')}
        >
          <Text style={[styles.tabText, activeTab === 'purchased' && styles.activeTabText]}>
            Purchased
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {filteredCategories.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="grid-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyTitle}>No Categories Found</Text>
            <Text style={styles.emptyText}>
              {activeTab === 'purchased'
                ? 'You have not purchased any categories yet'
                : 'No categories available'}
            </Text>
          </View>
        ) : (
          filteredCategories.map((category) => (
            <View key={category.id} style={styles.categoryCard}>
              <View style={styles.categoryIcon}>
                <Ionicons name={category.icon as any} size={32} color="#6366f1" />
              </View>
              <View style={styles.categoryInfo}>
                <Text style={styles.categoryName}>{category.name}</Text>
                <Text style={styles.categoryDescription}>{category.description}</Text>
                {!category.isPurchased && (
                  <View style={styles.priceContainer}>
                    <Text style={styles.price}>₹{category.price.toFixed(2)}</Text>
                  </View>
                )}
              </View>
              {category.isPurchased ? (
                <View style={styles.purchasedBadge}>
                  <Ionicons name="checkmark-circle" size={24} color="#10b981" />
                  <Text style={styles.purchasedText}>Purchased</Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.purchaseButton}
                  onPress={() => handlePurchase(category.id, category.name, category.price)}
                >
                  <Text style={styles.purchaseButtonText}>Purchase</Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        )}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 4,
    margin: 16,
    borderRadius: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: '#6366f1',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  activeTabText: {
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
    marginTop: 64,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 8,
  },
  categoryCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    margin: 16,
    marginBottom: 0,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  categoryIcon: {
    width: 64,
    height: 64,
    backgroundColor: '#ede9fe',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6366f1',
  },
  purchasedBadge: {
    alignItems: 'center',
    gap: 4,
  },
  purchasedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10b981',
  },
  purchaseButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  purchaseButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 24,
  },
});