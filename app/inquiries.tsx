import { contactAPI } from '@/utils/api';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuthStore } from '../store/authStore';
import { Inquiry } from '../types';

export default function Inquiries() {
  const router = useRouter();
  const vendor = useAuthStore((state) => state.vendor);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'new' | 'replied'>('all');

  useEffect(() => {
    loadInquiries();
  }, []);

  const loadInquiries = async () => {
    if (!vendor) return;

    try {
      const response = await contactAPI.getAllContacts(vendor._id);
      setInquiries(response.data.contacts);
    } catch (error) {
      console.error('Error loading inquiries:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadInquiries();
  };

  const handleUpdateStatus = async (inquiryId: string, status: string) => {
    try {
      // await inquiryAPI.updateInquiry(inquiryId, { status }, vendor!.id);
      loadInquiries();
      Alert.alert('Success', 'Inquiry status updated');
    } catch (error) {
      Alert.alert('Error', 'Failed to update inquiry');
    }
  };

  const filteredInquiries =
    filter === 'all' ? inquiries : inquiries.filter((i) => i.status === filter);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.title}>Inquiries</Text>
        <Text style={styles.count}>{inquiries.length}</Text>
      </View>

      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}          
          contentContainerStyle={styles.filterContent}
        >
          {['all', 'new', 'replied'].map((status) => (
            <TouchableOpacity
              key={status}
              style={[styles.filterChip, filter === status && styles.filterChipActive]}
              onPress={() => setFilter(status as any)}
            >
              <Text
                style={[styles.filterChipText, filter === status && styles.filterChipTextActive]}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>


      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {filteredInquiries.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="chatbubbles-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyTitle}>No Inquiries Found</Text>
            <Text style={styles.emptyText}>
              {filter === 'all'
                ? "You haven't received any inquiries yet"
                : `No ${filter} inquiries`}
            </Text>
          </View>
        ) : (
          filteredInquiries.map((inquiry) => (
            <View key={inquiry.id} style={styles.inquiryCard}>
              <View style={styles.inquiryHeader}>
                <View style={styles.inquiryInfo}>
                  <Text style={styles.customerName}>{inquiry.customerName}</Text>
                  <Text style={styles.serviceName}>{inquiry.serviceName}</Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    inquiry.status === 'new' && styles.statusNew,
                    inquiry.status === 'replied' && styles.statusReplied,
                  ]}
                >
                  <Text style={styles.statusText}>{inquiry.status}</Text>
                </View>
              </View>

              <Text style={styles.message}>{inquiry.message}</Text>

              <View style={styles.contactInfo}>
                <View style={styles.contactRow}>
                  <Ionicons name="mail" size={14} color="#6b7280" />
                  <Text style={styles.contactText}>{inquiry.customerEmail}</Text>
                </View>
                <View style={styles.contactRow}>
                  <Ionicons name="call" size={14} color="#6b7280" />
                  <Text style={styles.contactText}>{inquiry.customerPhone}</Text>
                </View>
              </View>

              {inquiry.status === 'new' && (
                <TouchableOpacity
                  style={styles.replyButton}
                  onPress={() => handleUpdateStatus(inquiry.id, 'replied')}
                >
                  <Ionicons name="send" size={18} color="#fff" />
                  <Text style={styles.replyButtonText}>Mark as Replied</Text>
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
  count: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6366f1',
    backgroundColor: '#ede9fe',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  filterContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingVertical: 12,
  },
  filterContent: {
    paddingHorizontal: 24,
    gap: 8,
    alignItems: 'center',
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    gap: 6,
    height: 36,
  },
  filterChipActive: {
    backgroundColor: '#6366f1',
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  filterChipTextActive: {
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
  inquiryCard: {
    backgroundColor: '#fff',
    margin: 16,
    marginBottom: 0,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  inquiryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  inquiryInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  serviceName: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusNew: {
    backgroundColor: '#dbeafe',
  },
  statusReplied: {
    backgroundColor: '#d1fae5',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1f2937',
    textTransform: 'capitalize',
  },
  message: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 12,
    lineHeight: 20,
  },
  contactInfo: {
    gap: 8,
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  contactText: {
    fontSize: 12,
    color: '#6b7280',
  },
  replyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#6366f1',
    padding: 12,
    borderRadius: 8,
  },
  replyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 24,
  },
});