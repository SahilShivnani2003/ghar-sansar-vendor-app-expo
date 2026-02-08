import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { vendorAPI } from '../../utils/api';

export default function Profile() {
  const router = useRouter();
  const { vendor, logout } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    if (!vendor) return;

    setLoading(true);
    try {
      const response = await vendorAPI.getVendor(vendor._id);
      setProfileData(response.data.vendor);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestUpdate = () => {
    Alert.alert(
      'Request Profile Update',
      'Do you want to request permission to update your profile?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Request',
          onPress: async () => {
            try {
              await vendorAPI.requestProfileUpdate({ vendorId: vendor?.id });
              Alert.alert('Success', 'Update request sent successfully. Admin will review your request.');
            } catch (error) {
              Alert.alert('Error', 'Failed to send update request');
            }
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  const profile = profileData || vendor;

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Partner Profile</Text>
          <Text style={styles.subtitle}>Manage your profile information</Text>
        </View>
        <TouchableOpacity
          style={styles.requestButton}
          onPress={handleRequestUpdate}
        >
          <Text style={styles.requestButtonText}>Make Request for Update Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatarSection}>
          {profile?.profileImage ? (
            <Image source={{ uri: profile.profileImage }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {profile?.name?.charAt(0)?.toUpperCase() || 'V'}
              </Text>
            </View>
          )}

          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{profile?.name || profile?.businessName}</Text>
            <Text style={styles.profileRole}>{profile?.businessName}</Text>
            {profile?.isApproved && (
              <View style={styles.approvedBadge}>
                <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                <Text style={styles.approvedText}>approved</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.profileMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={16} color="#6b7280" />
            <Text style={styles.metaLabel}>Member since</Text>
            <Text style={styles.metaValue}>
              {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'N/A'}
            </Text>
          </View>

          <View style={styles.metaItem}>
            <Ionicons name="briefcase-outline" size={16} color="#6b7280" />
            <Text style={styles.metaLabel}>Role</Text>
            <Text style={styles.metaValue}>Vendor</Text>
          </View>

          <View style={styles.metaItem}>
            <Ionicons name="calendar" size={16} color="#6b7280" />
            <Text style={styles.metaLabel}>Established</Text>
            <Text style={styles.metaValue}>{profile?.yearOfEstablishment || '2006'}</Text>
          </View>
        </View>
      </View>

      {/* Basic Information */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="person-outline" size={20} color="#1f2937" />
          <Text style={styles.sectionTitle}>Basic Information</Text>
        </View>

        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Service Provider / Business Name</Text>
            <Text style={styles.infoValue}>{profile?.businessName || 'AC Repair Service'}</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Type of Service</Text>
            <Text style={styles.infoValue}>{profile?.serviceType || 'Electrical'}</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Owner / Authorized Person</Text>
            <Text style={styles.infoValue}>{profile?.name || 'Sahil'}</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Year of Establishment</Text>
            <Text style={styles.infoValue}>{profile?.yearOfEstablishment || '2006'}</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Category</Text>
            <Text style={styles.infoValue}>{profile?.category || 'A.C. Repairing'}</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Sub Category</Text>
            <Text style={styles.infoValue}>{profile?.subCategory || 'Repairing'}</Text>
          </View>

          <View style={styles.infoItemFull}>
            <Text style={styles.infoLabel}>Service Description</Text>
            <Text style={styles.infoValue}>
              {profile?.businessDescription || 'All Type of Ac repair service'}
            </Text>
          </View>
        </View>
      </View>

      {/* Contact Information */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="call-outline" size={20} color="#1f2937" />
          <Text style={styles.sectionTitle}>Contact Information</Text>
        </View>

        <View style={styles.infoGrid}>
          <View style={styles.infoItemFull}>
            <Text style={styles.infoLabel}>Registered Office / Home Address</Text>
            <View style={styles.infoValueRow}>
              <Ionicons name="location-outline" size={16} color="#6b7280" />
              <Text style={styles.infoValue}>{profile?.address || 'Mp nagar zone 2, Bhopal'}</Text>
            </View>
          </View>

          <View style={styles.infoItemFull}>
            <Text style={styles.infoLabel}>Service Location / Area Covered</Text>
            <View style={styles.infoValueRow}>
              <Ionicons name="location-outline" size={16} color="#6b7280" />
              <Text style={styles.infoValue}>{profile?.serviceArea || 'Bhopal'}</Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Primary Contact Number</Text>
            <View style={styles.infoValueRow}>
              <Ionicons name="call" size={16} color="#6b7280" />
              <Text style={styles.infoValue}>{profile?.phone || '9770181286'}</Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Alternate Contact Number</Text>
            <View style={styles.infoValueRow}>
              <Ionicons name="call" size={16} color="#6b7280" />
              <Text style={styles.infoValue}>{profile?.alternatePhone || '9770181286'}</Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>WhatsApp Number</Text>
            <View style={styles.infoValueRow}>
              <Ionicons name="logo-whatsapp" size={16} color="#6b7280" />
              <Text style={styles.infoValue}>{profile?.whatsappNumber || '-'}</Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Email Address</Text>
            <View style={styles.infoValueRow}>
              <Ionicons name="mail" size={16} color="#6b7280" />
              <Text style={styles.infoValue}>{profile?.email || 'sahilshivani68@gmail.com'}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Business & Legal Information */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="business-outline" size={20} color="#1f2937" />
          <Text style={styles.sectionTitle}>Business & Legal Information</Text>
        </View>

        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Business Type</Text>
            <View style={styles.infoValueRow}>
              <Ionicons name="briefcase-outline" size={16} color="#6b7280" />
              <Text style={styles.infoValue}>{profile?.businessType || 'Other'}</Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>GST Number</Text>
            <View style={styles.infoValueRow}>
              <Ionicons name="receipt-outline" size={16} color="#6b7280" />
              <Text style={styles.infoValue}>{profile?.gstNumber || '-'}</Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Aadhaar Number</Text>
            <View style={styles.infoValueRow}>
              <Ionicons name="card-outline" size={16} color="#6b7280" />
              <Text style={styles.infoValue}>{profile?.aadhaarNumber || '-'}</Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>PAN Number</Text>
            <View style={styles.infoValueRow}>
              <Ionicons name="card-outline" size={16} color="#6b7280" />
              <Text style={styles.infoValue}>{profile?.panNumber || '-'}</Text>
            </View>
          </View>

          <View style={styles.infoItemFull}>
            <Text style={styles.infoLabel}>Trade License / Shop Act Registration No.</Text>
            <View style={styles.infoValueRow}>
              <Ionicons name="document-text-outline" size={16} color="#6b7280" />
              <Text style={styles.infoValue}>{profile?.tradeLicense || '-'}</Text>
            </View>
          </View>

          <View style={styles.infoItemFull}>
            <Text style={styles.infoLabel}>Admin Commission (%)</Text>
            <View style={styles.infoValueRow}>
              <Ionicons name="trending-up-outline" size={16} color="#6b7280" />
              <Text style={styles.infoValue}>{profile?.adminCommission ? `${profile.adminCommission}%` : 'Not set'}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Bank Details */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="card-outline" size={20} color="#1f2937" />
          <Text style={styles.sectionTitle}>Bank Details</Text>
        </View>

        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Bank Name</Text>
            <View style={styles.infoValueRow}>
              <Ionicons name="business" size={16} color="#6b7280" />
              <Text style={styles.infoValue}>{profile?.bankName || '-'}</Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Account Holder Name</Text>
            <View style={styles.infoValueRow}>
              <Ionicons name="person-outline" size={16} color="#6b7280" />
              <Text style={styles.infoValue}>{profile?.accountHolderName || '-'}</Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Account Number</Text>
            <View style={styles.infoValueRow}>
              <Ionicons name="card-outline" size={16} color="#6b7280" />
              <Text style={styles.infoValue}>{profile?.accountNumber || '-'}</Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>IFSC Code</Text>
            <View style={styles.infoValueRow}>
              <Ionicons name="code-outline" size={16} color="#6b7280" />
              <Text style={styles.infoValue}>{profile?.ifscCode || '-'}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Experience & Staff Information */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="people-outline" size={20} color="#1f2937" />
          <Text style={styles.sectionTitle}>Experience & Staff Information</Text>
        </View>

        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Years of Experience</Text>
            <View style={styles.infoValueRow}>
              <Ionicons name="time-outline" size={16} color="#6b7280" />
              <Text style={styles.infoValue}>{profile?.yearsOfExperience || '0'} years</Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Number of Staff</Text>
            <View style={styles.infoValueRow}>
              <Ionicons name="people-outline" size={16} color="#6b7280" />
              <Text style={styles.infoValue}>{profile?.numberOfStaff || '0'}</Text>
            </View>
          </View>

          <View style={styles.infoItemFull}>
            <Text style={styles.infoLabel}>Services Offered</Text>
            <View style={styles.infoValueRow}>
              <Ionicons name="list-outline" size={16} color="#6b7280" />
              <Text style={styles.infoValue}>{profile?.servicesOffered || '-'}</Text>
            </View>
          </View>

          <View style={styles.infoItemFull}>
            <Text style={styles.infoLabel}>Working Days & Timings</Text>
            <View style={styles.infoValueRow}>
              <Ionicons name="calendar-outline" size={16} color="#6b7280" />
              <Text style={styles.infoValue}>{profile?.workingDays || '-'}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Documents */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="document-attach-outline" size={20} color="#1f2937" />
          <Text style={styles.sectionTitle}>Documents</Text>
        </View>

        <View style={styles.documentGrid}>
          <View style={styles.documentItem}>
            <Text style={styles.documentLabel}>Profile Photo</Text>
            <Text style={styles.documentValue}>-</Text>
          </View>

          <View style={styles.documentItem}>
            <Text style={styles.documentLabel}>Document 1</Text>
            <Text style={styles.documentValue}>-</Text>
          </View>

          <View style={styles.documentItem}>
            <Text style={styles.documentLabel}>Document 2</Text>
            <Text style={styles.documentValue}>-</Text>
          </View>

          <View style={styles.documentItem}>
            <Text style={styles.documentLabel}>Document 3</Text>
            <Text style={styles.documentValue}>-</Text>
          </View>

          <View style={styles.documentItem}>
            <Text style={styles.documentLabel}>Document 4</Text>
            <Text style={styles.documentValue}>-</Text>
          </View>

          <View style={styles.documentItem}>
            <Text style={styles.documentLabel}>Document 5</Text>
            <Text style={styles.documentValue}>-</Text>
          </View>
        </View>
      </View>

      {/**Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/tasks')}
        >
          <View style={styles.menuItemLeft}>
            <Ionicons name="checkbox" size={24} color="#6366f1" />
            <Text style={styles.menuItemText}>Tasks</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/categories')}
        >
          <View style={styles.menuItemLeft}>
            <Ionicons name="grid" size={24} color="#10b981" />
            <Text style={styles.menuItemText}>Purchase Categories</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/inquiries')}
        >
          <View style={styles.menuItemLeft}>
            <Ionicons name="chatbubbles" size={24} color="#f59e0b" />
            <Text style={styles.menuItemText}>View Inquiries</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/logs')}
        >
          <View style={styles.menuItemLeft}>
            <Ionicons name="document-text" size={24} color="#8b5cf6" />
            <Text style={styles.menuItemText}>Activity Logs</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>
      </View>

      {/* Logout Section */}
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={20} color="#ef4444" />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  subtitle: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  requestButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  requestButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  profileCard: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 24,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  avatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#6b7280',
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
  },
  profileRole: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  approvedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  approvedText: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '500',
  },
  profileMeta: {
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaLabel: {
    fontSize: 13,
    color: '#6b7280',
  },
  metaValue: {
    fontSize: 13,
    color: '#1f2937',
    fontWeight: '500',
  },
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  infoGrid: {
    gap: 16,
  },
  infoItem: {
    flex: 1,
  },
  infoItemFull: {
    width: '100%',
  },
  infoLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 6,
  },
  infoValue: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '500',
  },
  infoValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  documentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  documentItem: {
    flex: 1,
    minWidth: '45%',
  },
  documentLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  documentValue: {
    fontSize: 14,
    color: '#1f2937',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fee2e2',
    padding: 16,
    borderRadius: 12,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444',
  },
  bottomPadding: {
    height: 24,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuItemText: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
  }
});