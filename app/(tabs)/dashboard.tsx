import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { DashboardStats } from '../../types';
import { categoryAPI, contactAPI, dashboardAPI } from '../../utils/api';

const { width } = Dimensions.get('window');

export default function Dashboard() {
  const router = useRouter();
  const vendor = useAuthStore((state) => state.vendor);
  const [stats, setStats] = useState<DashboardStats>({
    totalServices: 0,
    newInquiries: 0
  });
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'purchased' | 'available'>('purchased');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [purchasedCategories, setPurchasedCategories] = useState<any[]>([]);

  useEffect(() => {

    debugger
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {

    if (!vendor) return;

    try {
      debugger
      const [statsRes, inquiriesRes, categoriesRes, pcategory] = await Promise.all([
        dashboardAPI.getVendorStats(vendor._id),
        contactAPI.getAllContacts(vendor._id),
        categoryAPI.getAllCategories(),
        categoryAPI.getPurchasedCategories(vendor._id),
      ]);
      debugger
      setStats(statsRes.data.data);
      setInquiries(inquiriesRes.data.contacts.slice(0, 5));
      setCategories(categoriesRes.data.categories);
      setPurchasedCategories(pcategory.data.categories)
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, <Text style={styles.name}>{vendor?.name}!</Text></Text>
          <Text style={styles.subtitle}>Welcome to your centralized management area.</Text>
        </View>
      </View>

      {/* Performance Snapshot */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="flash" size={20} color="#6366f1" />
          <Text style={styles.sectionTitle}>PERFORMANCE SNAPSHOT</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: '#6366f1' }]}>
            <Text style={styles.statLabel}>TOTAL SERVICES</Text>
            <Text style={styles.statValue}>{stats.totalServices}</Text>
            <Ionicons name="briefcase" size={32} color="rgba(255,255,255,0.3)" style={styles.statIcon} />
          </View>

          <View style={[styles.statCard, { backgroundColor: '#10b981' }]}>
            <Text style={styles.statLabel}>NEW INQUIRIES</Text>
            <Text style={styles.statValue}>{inquiries.length || 0}</Text>
            <Ionicons name="chatbubble" size={32} color="rgba(255,255,255,0.3)" style={styles.statIcon} />
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.statCard2, { backgroundColor: '#e0e7ff' }]}>
            <Text style={styles.statLabel2}>Total Bookings</Text>
            <Text style={styles.statValue2}>0</Text>
          </View>

          <View style={[styles.statCard2, { backgroundColor: '#d1fae5' }]}>
            <Text style={styles.statLabel2}>Total Earnings</Text>
            <Text style={styles.statValue2}>₹0</Text>
          </View>
        </View>
      </View>

      {/* Categories */}
      <View style={styles.section}>
        <View style={styles.categoryHeader}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <TouchableOpacity
            style={styles.purchaseButton}
            onPress={() => router.push('/categories')}
          >
            <Text style={styles.purchaseButtonText}>Go to Purchase</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'purchased' && styles.activeTab]}
            onPress={() => setActiveTab('purchased')}
          >
            <Text style={[styles.tabText, activeTab === 'purchased' && styles.activeTabText]}>
              Purchased
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'available' && styles.activeTab]}
            onPress={() => setActiveTab('available')}
          >
            <Text style={[styles.tabText, activeTab === 'available' && styles.activeTabText]}>
              Available
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'purchased' ? (
          <>
            {purchasedCategories.length === 0 ? (
              <Text style={styles.emptyText}>You have not purchased any categories yet.</Text>
            ) : (
              <View style={styles.categoriesList}>
                {purchasedCategories.map((category) => (
                  <View key={category._id} style={styles.categoryCard}>
                    <View style={styles.categoryIcon}>
                      <Image source={{uri:category.image}} resizeMode='contain'/>
                    </View>
                    <Text style={styles.categoryName}>{category.name}</Text>
                    <Text style={styles.categoryPrice}>₹{category.price}</Text>
                  </View>
                ))}
              </View>
            )}
          </>

        ) : (
          <View style={styles.categoriesList}>
            {categories.map((category) => (
              <View key={category._id} style={styles.categoryCard}>
                <View style={styles.categoryIcon}>
                  <Image source={{uri:category.image}} resizeMode='contain'/>
                </View>
                <Text style={styles.categoryName}>{category.name}</Text>
                <Text style={styles.categoryPrice}>₹{category.price}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Quick Tools */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>QUICK TOOLS</Text>
        <View style={styles.toolsGrid}>
          <TouchableOpacity
            style={styles.toolCard}
            onPress={() => router.push('/profile')}
          >
            <View style={[styles.toolIcon, { backgroundColor: '#ede9fe' }]}>
              <Ionicons name="person" size={24} color="#6366f1" />
            </View>
            <Text style={styles.toolTitle}>Update Profile</Text>
            <Text style={styles.toolDescription}>Manage and update your vendor profile details.</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.toolCard}
            onPress={() => router.push('/add-service')}
          >
            <View style={[styles.toolIcon, { backgroundColor: '#d1fae5' }]}>
              <Ionicons name="add-circle" size={24} color="#10b981" />
            </View>
            <Text style={styles.toolTitle}>Add New Service</Text>
            <Text style={styles.toolDescription}>Expand your offerings by adding a new service.</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.toolCard}
            onPress={() => router.push('/services')}
          >
            <View style={[styles.toolIcon, { backgroundColor: '#fef3c7' }]}>
              <Ionicons name="construct" size={24} color="#f59e0b" />
            </View>
            <Text style={styles.toolTitle}>Manage Services</Text>
            <Text style={styles.toolDescription}>Review, edit, or delete your existing services.</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.toolCard}
            onPress={() => router.push('/inquiries')}
          >
            <View style={[styles.toolIcon, { backgroundColor: '#fed7aa' }]}>
              <Ionicons name="chatbubbles" size={24} color="#ea580c" />
            </View>
            <Text style={styles.toolTitle}>View Inquiries</Text>
            <Text style={styles.toolDescription}>Respond to customer messages and service requests.</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Customer Inquiries */}
      <View style={styles.section}>
        <View style={styles.inquiryHeader}>
          <View>
            <Text style={styles.sectionTitle}>Customer Inquiries</Text>
            <Text style={styles.inquirySubtitle}>
              Manage and respond to customer inquiries and support requests
            </Text>
          </View>
          <View style={styles.inquiryActions}>
            <TouchableOpacity style={styles.downloadButton}>
              <Text style={styles.downloadButtonText}>Download PDF</Text>
            </TouchableOpacity>
            <Text style={styles.inquiryCount}>{inquiries.length} inquiries</Text>
            <TouchableOpacity onPress={onRefresh}>
              <Text style={styles.refreshText}>Refresh</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inquiryCard}>
          <View style={styles.inquiryCardHeader}>
            <Ionicons name="chatbubble-outline" size={20} color="#6b7280" />
            <Text style={styles.inquiryCardTitle}>All Inquiries</Text>
          </View>

          {inquiries.length === 0 ? (
            <View style={styles.emptyInquiry}>
              <Ionicons name="chatbubble-outline" size={48} color="#d1d5db" />
              <Text style={styles.emptyInquiryTitle}>No Inquiries Found</Text>
              <Text style={styles.emptyInquiryText}>You haven't received any inquiries yet</Text>
            </View>
          ) : (
            inquiries.map((inquiry) => (
              <View key={inquiry.id} style={styles.inquiryItem}>
                <View style={styles.inquiryInfo}>
                  <Text style={styles.inquiryName}>{inquiry.customerName}</Text>
                  <Text style={styles.inquiryService}>{inquiry.serviceName}</Text>
                  <Text style={styles.inquiryMessage} numberOfLines={2}>
                    {inquiry.message}
                  </Text>
                </View>
                <View
                  style={[
                    styles.inquiryStatus,
                    inquiry.status === 'new' && styles.statusNew,
                    inquiry.status === 'replied' && styles.statusReplied,
                  ]}
                >
                  <Text style={styles.inquiryStatusText}>{inquiry.status}</Text>
                </View>
              </View>
            ))
          )}
        </View>
      </View>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#fff',
    padding: 24,
    paddingTop: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  greeting: {
    fontSize: 28,
    fontWeight: '400',
    color: '#1f2937',
  },
  name: {
    fontWeight: 'bold',
    color: '#6366f1',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  section: {
    padding: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    letterSpacing: 0.5,
    marginLeft: 8,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
    position: 'relative',
    overflow: 'hidden',
    minHeight: 120,
  },
  statLabel: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  statValue: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
  },
  statIcon: {
    position: 'absolute',
    right: 16,
    top: 16,
  },
  statCard2: {
    flex: 1,
    padding: 20,
    borderRadius: 12,
    minHeight: 100,
  },
  statLabel2: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4b5563',
    marginBottom: 8,
  },
  statValue2: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: '#f3f4f6',
  },
  tabText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#1f2937',
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    color: '#6b7280',
    fontSize: 14,
    padding: 24,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  categoriesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    width: (width - 72) / 2,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  categoryIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#ede9fe',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  categoryPrice: {
    fontSize: 12,
    color: '#6b7280',
  },
  toolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginTop: 16,
  },
  toolCard: {
    width: (width - 72) / 2,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  toolIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  toolTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  toolDescription: {
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 16,
  },
  inquiryHeader: {
    marginBottom: 16,
  },
  inquirySubtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  inquiryActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 12,
  },
  downloadButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  downloadButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  inquiryCount: {
    fontSize: 12,
    color: '#6b7280',
  },
  refreshText: {
    fontSize: 12,
    color: '#6366f1',
    fontWeight: '600',
  },
  inquiryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  inquiryCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  inquiryCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 8,
  },
  emptyInquiry: {
    alignItems: 'center',
    padding: 32,
  },
  emptyInquiryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 16,
  },
  emptyInquiryText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  inquiryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  inquiryInfo: {
    flex: 1,
  },
  inquiryName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  inquiryService: {
    fontSize: 12,
    color: '#6366f1',
    marginBottom: 4,
  },
  inquiryMessage: {
    fontSize: 12,
    color: '#6b7280',
  },
  inquiryStatus: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusNew: {
    backgroundColor: '#dbeafe',
  },
  statusReplied: {
    backgroundColor: '#d1fae5',
  },
  inquiryStatusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1f2937',
    textTransform: 'capitalize',
  },
  bottomPadding: {
    height: 24,
  },
});