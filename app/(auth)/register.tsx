import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { authAPI } from '../../utils/api';

type Step = 'basic' | 'contact' | 'business' | 'bank' | 'experience' | 'documents' | 'credentials';

export default function Register() {
  const router = useRouter();
  const setVendor = useAuthStore((state) => state.setVendor);
  const [currentStep, setCurrentStep] = useState<Step>('basic');
  const [formData, setFormData] = useState({
    // Basic Info
    businessName: '',
    serviceType: '',
    serviceDescription: '',
    category: '',
    ownerName: '',
    
    // Contact
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    
    // Business
    gstNumber: '',
    panNumber: '',
    registrationType: '',
    
    // Bank Details
    accountHolderName: '',
    bankName: '',
    accountNumber: '',
    confirmAccountNumber: '',
    ifscCode: '',
    branch: '',
    
    // Experience
    yearsOfExperience: '',
    specialization: '',
    workingDays: [] as string[],
    workingHoursFrom: '',
    workingHoursTo: '',
    serviceRadius: '',
    
    // Documents
    documents: {
      idProof: null as any,
      addressProof: null as any,
      businessRegistration: null as any,
      taxDocument: null as any,
      profilePhoto: null as any,
    },
    
    // Credentials
    password: '',
    confirmPassword: '',
    referralCode: '',
    referralName: '',
  });
  const [loading, setLoading] = useState(false);

  const steps = [
    { id: 'basic', title: 'Basic Info', icon: 'information-circle-outline' },
    { id: 'contact', title: 'Contact', icon: 'call-outline' },
    { id: 'business', title: 'Business', icon: 'briefcase-outline' },
    { id: 'bank', title: 'Bank', icon: 'card-outline' },
    { id: 'experience', title: 'Experience', icon: 'star-outline' },
    { id: 'documents', title: 'Documents', icon: 'document-text-outline' },
    { id: 'credentials', title: 'Credentials', icon: 'lock-closed-outline' },
  ];

  const getCurrentStepIndex = () => steps.findIndex(s => s.id === currentStep);
  const progress = ((getCurrentStepIndex() + 1) / steps.length) * 100;

  const handleNext = () => {
    // Validation for current step
    if (currentStep === 'basic') {
      if (!formData.businessName || !formData.serviceType || !formData.ownerName) {
        Alert.alert('Required Fields', 'Please fill all required fields');
        return;
      }
    }
    
    const currentIndex = getCurrentStepIndex();
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1].id as Step);
    }
  };

  const handlePrevious = () => {
    const currentIndex = getCurrentStepIndex();
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1].id as Step);
    }
  };

  const handleRegister = async () => {
    if (!formData.password || formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const { confirmPassword, ...registerData } = formData;
      const response = await authAPI.register(registerData);
      await setVendor(response.data);
      // Navigate to payment page instead of dashboard
      router.push('/(auth)/payment');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const renderBasicInfo = () => (
    <View style={styles.formSection}>
      <Text style={styles.sectionTitle}>Tell us about your business</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Business Name <Text style={styles.required}>*</Text></Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="business-outline" size={20} color="#f59e0b" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Enter your business name"
            placeholderTextColor="#9ca3af"
            value={formData.businessName}
            onChangeText={(text) => setFormData({ ...formData, businessName: text })}
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Service Type <Text style={styles.required}>*</Text></Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="construct-outline" size={20} color="#f59e0b" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="e.g., Plumbing, Electrical, Carpentry"
            placeholderTextColor="#9ca3af"
            value={formData.serviceType}
            onChangeText={(text) => setFormData({ ...formData, serviceType: text })}
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Service Description</Text>
        <View style={[styles.inputWrapper, styles.textAreaWrapper]}>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe your services..."
            placeholderTextColor="#9ca3af"
            value={formData.serviceDescription}
            onChangeText={(text) => setFormData({ ...formData, serviceDescription: text })}
            multiline
            numberOfLines={4}
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Service Category <Text style={styles.required}>*</Text></Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="grid-outline" size={20} color="#f59e0b" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Select or enter category"
            placeholderTextColor="#9ca3af"
            value={formData.category}
            onChangeText={(text) => setFormData({ ...formData, category: text })}
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Owner Name <Text style={styles.required}>*</Text></Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="person-outline" size={20} color="#f59e0b" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Full name of owner"
            placeholderTextColor="#9ca3af"
            value={formData.ownerName}
            onChangeText={(text) => setFormData({ ...formData, ownerName: text })}
          />
        </View>
      </View>
    </View>
  );

  const renderContact = () => (
    <View style={styles.formSection}>
      <Text style={styles.sectionTitle}>How can customers reach you?</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Email Address <Text style={styles.required}>*</Text></Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="mail-outline" size={20} color="#f59e0b" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="your.email@example.com"
            placeholderTextColor="#9ca3af"
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Phone Number <Text style={styles.required}>*</Text></Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="call-outline" size={20} color="#f59e0b" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="+91 XXXXX XXXXX"
            placeholderTextColor="#9ca3af"
            value={formData.phone}
            onChangeText={(text) => setFormData({ ...formData, phone: text })}
            keyboardType="phone-pad"
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Business Address <Text style={styles.required}>*</Text></Text>
        <View style={[styles.inputWrapper, styles.textAreaWrapper]}>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Complete business address"
            placeholderTextColor="#9ca3af"
            value={formData.address}
            onChangeText={(text) => setFormData({ ...formData, address: text })}
            multiline
            numberOfLines={3}
          />
        </View>
      </View>

      <View style={styles.row}>
        <View style={[styles.inputGroup, styles.flex1]}>
          <Text style={styles.label}>City <Text style={styles.required}>*</Text></Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="City"
              placeholderTextColor="#9ca3af"
              value={formData.city}
              onChangeText={(text) => setFormData({ ...formData, city: text })}
            />
          </View>
        </View>

        <View style={[styles.inputGroup, styles.flex1]}>
          <Text style={styles.label}>State <Text style={styles.required}>*</Text></Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="State"
              placeholderTextColor="#9ca3af"
              value={formData.state}
              onChangeText={(text) => setFormData({ ...formData, state: text })}
            />
          </View>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>PIN Code <Text style={styles.required}>*</Text></Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="location-outline" size={20} color="#f59e0b" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="XXXXXX"
            placeholderTextColor="#9ca3af"
            value={formData.pincode}
            onChangeText={(text) => setFormData({ ...formData, pincode: text })}
            keyboardType="numeric"
            maxLength={6}
          />
        </View>
      </View>
    </View>
  );

  const renderBusiness = () => (
    <View style={styles.formSection}>
      <Text style={styles.sectionTitle}>Business Details</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Business Registration Type</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="business-outline" size={20} color="#f59e0b" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="e.g., Proprietorship, Partnership, LLP, Pvt Ltd"
            placeholderTextColor="#9ca3af"
            value={formData.registrationType}
            onChangeText={(text) => setFormData({ ...formData, registrationType: text })}
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>GST Number (Optional)</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="document-text-outline" size={20} color="#f59e0b" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="22AAAAA0000A1Z5"
            placeholderTextColor="#9ca3af"
            value={formData.gstNumber}
            onChangeText={(text) => setFormData({ ...formData, gstNumber: text.toUpperCase() })}
            autoCapitalize="characters"
            maxLength={15}
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>PAN Number (Optional)</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="card-outline" size={20} color="#f59e0b" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="ABCDE1234F"
            placeholderTextColor="#9ca3af"
            value={formData.panNumber}
            onChangeText={(text) => setFormData({ ...formData, panNumber: text.toUpperCase() })}
            autoCapitalize="characters"
            maxLength={10}
          />
        </View>
      </View>

      <View style={styles.infoBox}>
        <Ionicons name="information-circle" size={20} color="#3b82f6" />
        <Text style={styles.infoText}>
          GST and PAN details are optional but recommended for building trust with customers.
        </Text>
      </View>
    </View>
  );

  const renderBank = () => (
    <View style={styles.formSection}>
      <Text style={styles.sectionTitle}>Bank Account Details</Text>
      <Text style={styles.sectionDescription}>
        For receiving payments from customers
      </Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Account Holder Name <Text style={styles.required}>*</Text></Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="person-outline" size={20} color="#f59e0b" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="As per bank records"
            placeholderTextColor="#9ca3af"
            value={formData.accountHolderName}
            onChangeText={(text) => setFormData({ ...formData, accountHolderName: text })}
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Bank Name <Text style={styles.required}>*</Text></Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="business-outline" size={20} color="#f59e0b" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="e.g., State Bank of India"
            placeholderTextColor="#9ca3af"
            value={formData.bankName}
            onChangeText={(text) => setFormData({ ...formData, bankName: text })}
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Account Number <Text style={styles.required}>*</Text></Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="card-outline" size={20} color="#f59e0b" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Enter account number"
            placeholderTextColor="#9ca3af"
            value={formData.accountNumber}
            onChangeText={(text) => setFormData({ ...formData, accountNumber: text })}
            keyboardType="numeric"
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Confirm Account Number <Text style={styles.required}>*</Text></Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="checkmark-circle-outline" size={20} color="#f59e0b" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Re-enter account number"
            placeholderTextColor="#9ca3af"
            value={formData.confirmAccountNumber}
            onChangeText={(text) => setFormData({ ...formData, confirmAccountNumber: text })}
            keyboardType="numeric"
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>IFSC Code <Text style={styles.required}>*</Text></Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="git-branch-outline" size={20} color="#f59e0b" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="e.g., SBIN0001234"
            placeholderTextColor="#9ca3af"
            value={formData.ifscCode}
            onChangeText={(text) => setFormData({ ...formData, ifscCode: text.toUpperCase() })}
            autoCapitalize="characters"
            maxLength={11}
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Branch Name</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="location-outline" size={20} color="#f59e0b" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Branch location"
            placeholderTextColor="#9ca3af"
            value={formData.branch}
            onChangeText={(text) => setFormData({ ...formData, branch: text })}
          />
        </View>
      </View>

      <View style={styles.secureBox}>
        <Ionicons name="shield-checkmark" size={20} color="#10b981" />
        <Text style={styles.secureText}>
          Your bank details are encrypted and secure. We use bank-grade security to protect your information.
        </Text>
      </View>
    </View>
  );

  const toggleWorkingDay = (day: string) => {
    const currentDays = formData.workingDays;
    if (currentDays.includes(day)) {
      setFormData({
        ...formData,
        workingDays: currentDays.filter(d => d !== day)
      });
    } else {
      setFormData({
        ...formData,
        workingDays: [...currentDays, day]
      });
    }
  };

  const renderExperience = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    return (
      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>Experience & Availability</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Years of Experience <Text style={styles.required}>*</Text></Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="time-outline" size={20} color="#f59e0b" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="How many years of experience?"
              placeholderTextColor="#9ca3af"
              value={formData.yearsOfExperience}
              onChangeText={(text) => setFormData({ ...formData, yearsOfExperience: text })}
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Specialization <Text style={styles.required}>*</Text></Text>
          <View style={[styles.inputWrapper, styles.textAreaWrapper]}>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe your areas of expertise and special skills..."
              placeholderTextColor="#9ca3af"
              value={formData.specialization}
              onChangeText={(text) => setFormData({ ...formData, specialization: text })}
              multiline
              numberOfLines={4}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Working Days <Text style={styles.required}>*</Text></Text>
          <Text style={styles.helperText}>Select the days you are available</Text>
          <View style={styles.daysContainer}>
            {days.map(day => (
              <TouchableOpacity
                key={day}
                style={[
                  styles.dayButton,
                  formData.workingDays.includes(day) && styles.dayButtonSelected
                ]}
                onPress={() => toggleWorkingDay(day)}
              >
                <Text style={[
                  styles.dayButtonText,
                  formData.workingDays.includes(day) && styles.dayButtonTextSelected
                ]}>
                  {day}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, styles.flex1]}>
            <Text style={styles.label}>Working Hours From <Text style={styles.required}>*</Text></Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="time-outline" size={20} color="#f59e0b" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="e.g., 09:00 AM"
                placeholderTextColor="#9ca3af"
                value={formData.workingHoursFrom}
                onChangeText={(text) => setFormData({ ...formData, workingHoursFrom: text })}
              />
            </View>
          </View>

          <View style={[styles.inputGroup, styles.flex1]}>
            <Text style={styles.label}>Working Hours To <Text style={styles.required}>*</Text></Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="time-outline" size={20} color="#f59e0b" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="e.g., 06:00 PM"
                placeholderTextColor="#9ca3af"
                value={formData.workingHoursTo}
                onChangeText={(text) => setFormData({ ...formData, workingHoursTo: text })}
              />
            </View>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Service Radius (km) <Text style={styles.required}>*</Text></Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="locate-outline" size={20} color="#f59e0b" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="How far can you travel for service?"
              placeholderTextColor="#9ca3af"
              value={formData.serviceRadius}
              onChangeText={(text) => setFormData({ ...formData, serviceRadius: text })}
              keyboardType="numeric"
            />
          </View>
        </View>
      </View>
    );
  };

  const pickDocument = async (docType: keyof typeof formData.documents) => {
    // In a real app, you would use expo-document-picker or expo-image-picker
    Alert.alert('Document Upload', 'Document picker would open here. For demo purposes, marking as selected.');
    setFormData({
      ...formData,
      documents: {
        ...formData.documents,
        [docType]: { name: `${docType}_uploaded.pdf`, uri: 'demo_uri' }
      }
    });
  };

  const renderDocuments = () => {
    const documentTypes = [
      { key: 'idProof', label: 'ID Proof', desc: 'Aadhar Card, PAN Card, Driving License' },
      { key: 'addressProof', label: 'Address Proof', desc: 'Electricity Bill, Rent Agreement' },
      { key: 'businessRegistration', label: 'Business Registration', desc: 'Shop Act, GST Certificate, Trade License' },
      { key: 'taxDocument', label: 'Tax Document', desc: 'GST Certificate, Income Tax Returns' },
      { key: 'profilePhoto', label: 'Profile Photo', desc: 'Clear photo of yourself for profile' },
    ];

    return (
      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>Document Upload</Text>
        <Text style={styles.sectionDescription}>
          Please upload the following documents (All documents are required)
        </Text>

        {documentTypes.map(({ key, label, desc }) => {
          const isUploaded = formData.documents[key as keyof typeof formData.documents];
          
          return (
            <View key={key} style={styles.documentItem}>
              <View style={styles.documentHeader}>
                <View style={styles.documentInfo}>
                  <Text style={styles.documentLabel}>
                    {label} <Text style={styles.required}>*</Text>
                  </Text>
                  <Text style={styles.documentDesc}>{desc}</Text>
                </View>
                <View style={[
                  styles.documentStatus,
                  isUploaded && styles.documentStatusUploaded
                ]}>
                  <Ionicons 
                    name={isUploaded ? 'checkmark-circle' : 'cloud-upload-outline'} 
                    size={24} 
                    color={isUploaded ? '#10b981' : '#9ca3af'} 
                  />
                </View>
              </View>
              
              <TouchableOpacity
                style={[
                  styles.uploadButton,
                  isUploaded && styles.uploadButtonUploaded
                ]}
                onPress={() => pickDocument(key as keyof typeof formData.documents)}
              >
                <Ionicons 
                  name={isUploaded ? 'document-attach' : 'add-circle-outline'} 
                  size={20} 
                  color={isUploaded ? '#10b981' : '#f59e0b'} 
                />
                <Text style={[
                  styles.uploadButtonText,
                  isUploaded && styles.uploadButtonTextUploaded
                ]}>
                  {isUploaded ? 'Document Uploaded' : 'Upload Document'}
                </Text>
              </TouchableOpacity>
            </View>
          );
        })}

        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={20} color="#3b82f6" />
          <Text style={styles.infoText}>
            Accepted formats: PDF, JPG, PNG (Max size: 5MB per document)
          </Text>
        </View>
      </View>
    );
  };

  const renderCredentials = () => (
    <View style={styles.formSection}>
      <Text style={styles.sectionTitle}>Secure your account</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Password <Text style={styles.required}>*</Text></Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="lock-closed-outline" size={20} color="#f59e0b" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Create a strong password"
            placeholderTextColor="#9ca3af"
            value={formData.password}
            onChangeText={(text) => setFormData({ ...formData, password: text })}
            secureTextEntry
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Confirm Password <Text style={styles.required}>*</Text></Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="lock-closed-outline" size={20} color="#f59e0b" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Re-enter your password"
            placeholderTextColor="#9ca3af"
            value={formData.confirmPassword}
            onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
            secureTextEntry
          />
        </View>
      </View>

      <View style={styles.dividerWithText}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>Referral (Optional)</Text>
        <View style={styles.dividerLine} />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Referral Code (Optional)</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="gift-outline" size={20} color="#f59e0b" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Enter referral code if you have one"
            placeholderTextColor="#9ca3af"
            value={formData.referralCode}
            onChangeText={(text) => setFormData({ ...formData, referralCode: text.toUpperCase() })}
            autoCapitalize="characters"
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Referral Name (Optional)</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="person-add-outline" size={20} color="#f59e0b" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Name of person who referred you"
            placeholderTextColor="#9ca3af"
            value={formData.referralName}
            onChangeText={(text) => setFormData({ ...formData, referralName: text })}
          />
        </View>
      </View>

      <View style={styles.referralBox}>
        <Ionicons name="gift" size={20} color="#f59e0b" />
        <Text style={styles.referralText}>
          Have a referral? Get special benefits and faster onboarding!
        </Text>
      </View>

      <View style={styles.passwordTips}>
        <Text style={styles.tipsTitle}>Password Requirements:</Text>
        <View style={styles.tipItem}>
          <Ionicons name="checkmark-circle" size={16} color="#10b981" />
          <Text style={styles.tipText}>At least 8 characters</Text>
        </View>
        <View style={styles.tipItem}>
          <Ionicons name="checkmark-circle" size={16} color="#10b981" />
          <Text style={styles.tipText}>Include letters and numbers</Text>
        </View>
        <View style={styles.tipItem}>
          <Ionicons name="checkmark-circle" size={16} color="#10b981" />
          <Text style={styles.tipText}>Use special characters for extra security</Text>
        </View>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Registration Summary</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Business:</Text>
          <Text style={styles.summaryValue}>{formData.businessName || '-'}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Service:</Text>
          <Text style={styles.summaryValue}>{formData.serviceType || '-'}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Email:</Text>
          <Text style={styles.summaryValue}>{formData.email || '-'}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Phone:</Text>
          <Text style={styles.summaryValue}>{formData.phone || '-'}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Experience:</Text>
          <Text style={styles.summaryValue}>{formData.yearsOfExperience ? `${formData.yearsOfExperience} years` : '-'}</Text>
        </View>
      </View>
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'basic':
        return renderBasicInfo();
      case 'contact':
        return renderContact();
      case 'business':
        return renderBusiness();
      case 'bank':
        return renderBank();
      case 'experience':
        return renderExperience();
      case 'documents':
        return renderDocuments();
      case 'credentials':
        return renderCredentials();
      default:
        return null;
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Image
            source={require('../../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Service Provider Registration</Text>
          <Text style={styles.subtitle}>Join Ghar Sansaar and grow your business</Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>
            Step {getCurrentStepIndex() + 1} of {steps.length}
          </Text>
        </View>

        {/* Step Indicator */}
        <View style={styles.stepIndicatorContainer}>
          {steps.map((step, index) => {
            const isActive = step.id === currentStep;
            const isPast = index < getCurrentStepIndex();
            
            return (
              <View key={step.id} style={styles.stepIndicatorItem}>
                <View style={[
                  styles.stepDot,
                  isActive && styles.stepDotActive,
                  isPast && styles.stepDotPast
                ]}>
                  {isPast ? (
                    <Ionicons name="checkmark" size={16} color="#fff" />
                  ) : (
                    <Ionicons 
                      name={step.icon as any} 
                      size={16} 
                      color={isActive ? '#fff' : '#9ca3af'} 
                    />
                  )}
                </View>
                <Text style={[
                  styles.stepText,
                  isActive && styles.stepTextActive
                ]}>
                  {step.title}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Form Content */}
        <View style={styles.formContainer}>
          {renderCurrentStep()}
        </View>

        {/* Navigation Buttons */}
        <View style={styles.buttonContainer}>
          {getCurrentStepIndex() > 0 && (
            <TouchableOpacity
              style={styles.buttonSecondary}
              onPress={handlePrevious}
            >
              <Ionicons name="arrow-back" size={20} color="#f59e0b" />
              <Text style={styles.buttonSecondaryText}>Previous</Text>
            </TouchableOpacity>
          )}

          {currentStep !== 'credentials' ? (
            <TouchableOpacity
              style={[styles.buttonPrimary, getCurrentStepIndex() === 0 && styles.buttonFull]}
              onPress={handleNext}
            >
              <Text style={styles.buttonPrimaryText}>Next</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.buttonPrimary, styles.buttonFull, loading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={loading}
            >
              <Text style={styles.buttonPrimaryText}>
                {loading ? 'Creating Account...' : 'Complete Registration'}
              </Text>
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
            </TouchableOpacity>
          )}
        </View>

        {/* Login Link */}
        <TouchableOpacity 
          style={styles.loginContainer}
          onPress={() => router.push('/(auth)/login')}
        >
          <Text style={styles.loginText}>
            Already have an account? <Text style={styles.loginLink}>Login here</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
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
    marginBottom: 24,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#f59e0b',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  stepIndicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  stepIndicatorItem: {
    alignItems: 'center',
    flex: 1,
  },
  stepDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  stepDotActive: {
    backgroundColor: '#f59e0b',
  },
  stepDotPast: {
    backgroundColor: '#10b981',
  },
  stepText: {
    fontSize: 10,
    color: '#9ca3af',
    textAlign: 'center',
  },
  stepTextActive: {
    color: '#1f2937',
    fontWeight: '600',
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  formSection: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
  },
  inputGroup: {
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  required: {
    color: '#ef4444',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
  },
  textAreaWrapper: {
    height: 'auto',
    alignItems: 'flex-start',
    paddingVertical: 14,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#1f2937',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  flex1: {
    flex: 1,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#eff6ff',
    padding: 12,
    borderRadius: 8,
    gap: 10,
    marginTop: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#1e40af',
    lineHeight: 18,
  },
  passwordTips: {
    backgroundColor: '#f0fdf4',
    padding: 14,
    borderRadius: 8,
    marginTop: 8,
  },
  tipsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#166534',
    marginBottom: 8,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  tipText: {
    fontSize: 12,
    color: '#166534',
  },
  summaryCard: {
    backgroundColor: '#fef3e2',
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#fed7aa',
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  summaryLabel: {
    fontSize: 13,
    color: '#6b7280',
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1f2937',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  buttonPrimary: {
    flex: 1,
    backgroundColor: '#f59e0b',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#f59e0b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonFull: {
    flex: 1,
  },
  buttonPrimaryText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  buttonSecondary: {
    flex: 1,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    borderWidth: 2,
    borderColor: '#f59e0b',
  },
  buttonSecondaryText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f59e0b',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  loginContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  loginText: {
    fontSize: 14,
    color: '#6b7280',
  },
  loginLink: {
    color: '#f59e0b',
    fontWeight: '600',
  },
  sectionDescription: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: -8,
    marginBottom: 12,
  },
  secureBox: {
    flexDirection: 'row',
    backgroundColor: '#f0fdf4',
    padding: 12,
    borderRadius: 8,
    gap: 10,
    marginTop: 8,
  },
  secureText: {
    flex: 1,
    fontSize: 13,
    color: '#166534',
    lineHeight: 18,
  },
  helperText: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
    marginTop: -4,
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dayButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
    minWidth: 50,
    alignItems: 'center',
  },
  dayButtonSelected: {
    borderColor: '#f59e0b',
    backgroundColor: '#fef3e2',
  },
  dayButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  dayButtonTextSelected: {
    color: '#f59e0b',
  },
  documentItem: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  documentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  documentInfo: {
    flex: 1,
  },
  documentLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  documentDesc: {
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 16,
  },
  documentStatus: {
    marginLeft: 12,
  },
  documentStatusUploaded: {
    // No additional styles needed, just for semantic clarity
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#f59e0b',
    borderRadius: 8,
    paddingVertical: 10,
    gap: 8,
  },
  uploadButtonUploaded: {
    borderColor: '#10b981',
    backgroundColor: '#f0fdf4',
  },
  uploadButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f59e0b',
  },
  uploadButtonTextUploaded: {
    color: '#10b981',
  },
  dividerWithText: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  dividerText: {
    paddingHorizontal: 12,
    fontSize: 13,
    fontWeight: '600',
    color: '#9ca3af',
  },
  referralBox: {
    flexDirection: 'row',
    backgroundColor: '#fef3e2',
    padding: 12,
    borderRadius: 8,
    gap: 10,
    marginTop: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#fed7aa',
  },
  referralText: {
    flex: 1,
    fontSize: 13,
    color: '#92400e',
    lineHeight: 18,
  },
});