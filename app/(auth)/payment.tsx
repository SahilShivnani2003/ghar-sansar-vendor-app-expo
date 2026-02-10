import { BASE_URL, categoryAPI } from '@/utils/api';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import RazorpayCheckout from 'react-native-razorpay';

type PaymentMethod = 'cash' | 'upi';

export default function Payment() {
  
  const router = useRouter();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const rawParams = useLocalSearchParams();
  debugger
  const vendor = rawParams.vendor
    ? JSON.parse(rawParams.vendor as string)
    : null;

  const categoryData = rawParams.category
    ? JSON.parse(rawParams.category as string)
    : null;

  const category = categoryData[0];
  // This would come from your backend/config
  const registrationFee = category.price || 1;
  const categoryName = category.name || 'Service Category';

  const handlePayment = async () => {
    if (!selectedMethod) {
      Alert.alert('Select Payment Method', 'Please choose how you want to pay');
      return;
    }

    if (!vendor || !category) {
      Alert.alert('Error', 'Invalid vendor or category data');
      return;
    }

    if (selectedMethod === 'cash') {
      try {
        setLoading(true);
        debugger
        await categoryAPI.purchaseCategory({
          vendorId: vendor._id,
          categoryId: category._id,
          paymentMethod: 'cash',
        });

        Alert.alert(
          'Cash Payment Selected',
          'You can login once admin approves your payment. Our team will contact you soon.',
          [{ text: 'OK', onPress: () => router.replace('/(auth)/login') }]
        );
      } catch (err) {
        Alert.alert('Error', 'Failed to submit cash payment request');
      } finally {
        setLoading(false);
      }
    } else {
      handleUpiPayment();
    }
  };


  const handleUpiPayment = async () => {
    try {
      if (!registrationFee) {
        Alert.alert('Error', 'Category price not found');
        return;
      }

      setLoading(true);

      const response = await axios.post(
        `${BASE_URL}/razorpay/capturePayment`,
        { amount: registrationFee }
      );

      const data = response.data;
      if (!data?.order) throw new Error('Failed to initiate payment');

      const options = {
        key: 'rzp_live_S4TPRyX5ae0LZA',
        amount: data.order.amount,
        currency: data.order.currency,
        name: 'Mera GharSansaar',
        description: 'Purchase Category',
        order_id: data.order.id,

        handler: async (response: any) => {
          try {
            const verifyResponse = await axios.post(
              `${BASE_URL}/razorpay/verifyPayment`,
              {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                vendorId: vendor._id,
                categoryId: category._id,
                paymentMode: 'prepaid',
              }
            );

            if (verifyResponse?.data?.success) {
              setShowSuccessModal(true);

              setTimeout(() => {
                setShowSuccessModal(false);
                router.replace('/(auth)/login');
              }, 2500);
            } else {
              Alert.alert('Payment Failed', 'Payment verification failed');
            }
          } catch (err) {
            Alert.alert('Error', 'Payment verification error');
          }
        },

        theme: { color: '#f59e0b' },
      };

      // ⚠️ Call Razorpay SDK here
      RazorpayCheckout.open(options);

    } catch (error) {
      Alert.alert('Error', 'UPI payment failed');
    } finally {
      setLoading(false);
    }
  };


  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Image
            source={require('../../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <View style={styles.checkmarkContainer}>
            <Ionicons name="checkmark-circle" size={60} color="#10b981" />
          </View>
          <Text style={styles.title}>Registration Successful!</Text>
          <Text style={styles.subtitle}>Complete payment to activate your account</Text>
        </View>

        {/* Registration Details Card */}
        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Business Name:</Text>
            <Text style={styles.detailValue}>{vendor?.businessName || 'N/A'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Selected Category:</Text>
            <Text style={styles.detailValue}>{categoryName}</Text>
          </View>
          <View style={[styles.detailRow, styles.priceRow]}>
            <Text style={styles.priceLabel}>Registration Fee:</Text>
            <Text style={styles.priceValue}>₹{registrationFee}</Text>
          </View>
        </View>

        {/* Payment Method Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Payment Method</Text>

          {/* UPI Option */}
          <TouchableOpacity
            style={[
              styles.paymentOption,
              selectedMethod === 'upi' && styles.paymentOptionSelected
            ]}
            onPress={() => setSelectedMethod('upi')}
            activeOpacity={0.7}
          >
            <View style={styles.paymentOptionContent}>
              <View style={[
                styles.radioButton,
                selectedMethod === 'upi' && styles.radioButtonSelected
              ]}>
                {selectedMethod === 'upi' && (
                  <View style={styles.radioButtonInner} />
                )}
              </View>

              <View style={styles.paymentInfo}>
                <View style={styles.paymentHeader}>
                  <Ionicons name="phone-portrait-outline" size={24} color="#8b5cf6" />
                  <Text style={styles.paymentTitle}>UPI Payment</Text>
                </View>
                <Text style={styles.paymentDescription}>
                  Pay instantly using Google Pay, PhonePe, Paytm, or any UPI app
                </Text>
                <View style={styles.badgeContainer}>
                  <View style={styles.badge}>
                    <Ionicons name="flash" size={12} color="#f59e0b" />
                    <Text style={styles.badgeText}>Instant Activation</Text>
                  </View>
                  <View style={styles.badge}>
                    <Ionicons name="shield-checkmark" size={12} color="#10b981" />
                    <Text style={styles.badgeText}>100% Secure</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* {selectedMethod === 'upi' && (
              <View style={styles.upiDetailsContainer}>
                <View style={styles.divider} />
                <View style={styles.upiDetails}>
                  <Text style={styles.upiLabel}>UPI ID:</Text>
                  <Text style={styles.upiValue}>gharsansaar@paytm</Text>
                  <TouchableOpacity style={styles.copyButton}>
                    <Ionicons name="copy-outline" size={16} color="#f59e0b" />
                    <Text style={styles.copyText}>Copy</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.upiNote}>
                  Or scan QR code with any UPI app
                </Text>
                <View style={styles.qrPlaceholder}>
                  <Ionicons name="qr-code" size={80} color="#9ca3af" />
                  <Text style={styles.qrText}>UPI QR Code</Text>
                </View>
              </View>
            )} */}
          </TouchableOpacity>

          {/* Cash Option */}
          <TouchableOpacity
            style={[
              styles.paymentOption,
              selectedMethod === 'cash' && styles.paymentOptionSelected
            ]}
            onPress={() => setSelectedMethod('cash')}
            activeOpacity={0.7}
          >
            <View style={styles.paymentOptionContent}>
              <View style={[
                styles.radioButton,
                selectedMethod === 'cash' && styles.radioButtonSelected
              ]}>
                {selectedMethod === 'cash' && (
                  <View style={styles.radioButtonInner} />
                )}
              </View>

              <View style={styles.paymentInfo}>
                <View style={styles.paymentHeader}>
                  <Ionicons name="cash-outline" size={24} color="#10b981" />
                  <Text style={styles.paymentTitle}>Cash Payment</Text>
                </View>
                <Text style={styles.paymentDescription}>
                  Pay in person or deposit cash at our office
                </Text>
                <View style={styles.badgeContainer}>
                  <View style={[styles.badge, styles.badgeWarning]}>
                    <Ionicons name="time" size={12} color="#f59e0b" />
                    <Text style={styles.badgeText}>Requires Admin Approval</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* {selectedMethod === 'cash' && (
              <View style={styles.cashDetailsContainer}>
                <View style={styles.divider} />
                <View style={styles.infoBox}>
                  <Ionicons name="information-circle" size={20} color="#3b82f6" />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoTitle}>Payment Process:</Text>
                    <Text style={styles.infoText}>
                      1. Submit your registration{'\n'}
                      2. Our team will contact you{'\n'}
                      3. Complete cash payment{'\n'}
                      4. Admin will approve your account{'\n'}
                      5. Start receiving orders!
                    </Text>
                  </View>
                </View>
                <View style={styles.contactBox}>
                  <Text style={styles.contactTitle}>Contact Us:</Text>
                  <View style={styles.contactItem}>
                    <Ionicons name="call" size={16} color="#f59e0b" />
                    <Text style={styles.contactText}>+91 78798 84363</Text>
                  </View>
                  <View style={styles.contactItem}>
                    <Ionicons name="mail" size={16} color="#f59e0b" />
                    <Text style={styles.contactText}>solutions.niyati@gmail.com</Text>
                  </View>
                </View>
              </View>
            )} */}
          </TouchableOpacity>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            !selectedMethod && styles.submitButtonDisabled
          ]}
          onPress={handlePayment}
          disabled={!selectedMethod || loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.submitButtonText}>
                {selectedMethod === 'upi' ? 'Proceed to Pay' : 'Submit for Approval'}
              </Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </>
          )}
        </TouchableOpacity>

        {/* Help Text */}
        <Text style={styles.helpText}>
          Need help? Contact our support team
        </Text>
      </ScrollView>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark-circle" size={80} color="#10b981" />
            </View>
            <Text style={styles.modalTitle}>Payment Successful!</Text>
            <Text style={styles.modalText}>
              Your account has been activated. You can now login and start receiving orders.
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fef3e2',
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 32,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 20,
  },
  checkmarkContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  detailsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  detailLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  priceRow: {
    borderBottomWidth: 0,
    paddingTop: 16,
    marginTop: 8,
    borderTopWidth: 2,
    borderTopColor: '#f59e0b',
  },
  priceLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
  },
  priceValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f59e0b',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
  },
  paymentOption: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  paymentOptionSelected: {
    borderColor: '#f59e0b',
    shadowColor: '#f59e0b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  paymentOptionContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  radioButtonSelected: {
    borderColor: '#f59e0b',
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#f59e0b',
  },
  paymentInfo: {
    flex: 1,
    marginLeft: 16,
  },
  paymentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  paymentTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginLeft: 10,
  },
  paymentDescription: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
    marginBottom: 12,
  },
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3e2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  badgeWarning: {
    backgroundColor: '#fef3c7',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#92400e',
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 16,
  },
  upiDetailsContainer: {
    marginTop: 8,
  },
  upiDetails: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  upiLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  upiValue: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: '#1f2937',
    marginLeft: 8,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
    borderWidth: 1,
    borderColor: '#f59e0b',
  },
  copyText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#f59e0b',
  },
  upiNote: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 12,
  },
  qrPlaceholder: {
    backgroundColor: '#f9fafb',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 8,
  },
  cashDetailsContainer: {
    marginTop: 8,
  },
  infoBox: {
    backgroundColor: '#eff6ff',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    marginBottom: 16,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e40af',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#1e40af',
    lineHeight: 18,
  },
  contactBox: {
    backgroundColor: '#fef3e2',
    padding: 16,
    borderRadius: 12,
  },
  contactTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  contactText: {
    fontSize: 13,
    color: '#374151',
  },
  submitButton: {
    backgroundColor: '#f59e0b',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#f59e0b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 16,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  helpText: {
    fontSize: 13,
    color: '#6b7280',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    width: '85%',
    maxWidth: 400,
  },
  successIcon: {
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  modalText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});