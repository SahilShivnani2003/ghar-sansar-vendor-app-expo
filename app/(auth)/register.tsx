import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
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
import { categoryAPI, vendorAPI } from '../../utils/api';

type Step = 'basic' | 'contact' | 'business' | 'bank' | 'experience' | 'documents' | 'credentials';

export default function Register() {
  const router = useRouter();
  const [vendor, setVendor] = useState({});
  const [currentStep, setCurrentStep] = useState<Step>('basic');
  const [categories, setCategories] = useState<any[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [formData, setFormData] = useState({
    // Basic Info
    name: '',
    company: '',
    description: '',
    typeOfService: '',
    category: '',        // stores _id for submission
    categoryName: '',    // stores display name for UI
    subCategory: '',
    status: 'pending',
    yearOfEstablishment: '',

    // Contact
    email: '',
    phone: '',
    alternatePhone: '',
    whatsappNumber: '',
    address: '',
    serviceLocation: '',

    // Business
    businessType: '',
    adhar: '',
    pan: '',
    gstNumber: '',
    tradeLicense: '',

    // Bank — bankName lives at top level per API; bankDetail has IFSC + branch
    bankName: '',
    accountHolderName: '',
    accountNumber: '',
    confirmAccountNumber: '',
    bankDetail: {
      accountNumber: '',
      IFSC: '',
      accountHolderName: '',
      branch: '',
    },

    // Experience & Availability
    // experience submitted as { totalYears: number, fields: [] }
    totalYears: '',       // top-level copy per API body
    numberOfStaff: 0,
    servicesOffered: '',
    workingDays: [] as string[],
    workingTimings: '',

    // Documents (optional)
    documents: {
      addressProof: null as any,
      profilePhoto: null as any,
    },

    // Credentials
    password: '',
    confirmPassword: '',
    referralCode: '',
    referralName: '',
  });
  const [loading, setLoading] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [hasWhatsapp, setHasWhatsapp] = useState<boolean | null>(null);

  const steps = [
    { id: 'basic', title: 'Basic Info', icon: 'information-circle-outline' },
    { id: 'contact', title: 'Contact', icon: 'call-outline' },
    { id: 'business', title: 'Business', icon: 'briefcase-outline' },
    { id: 'bank', title: 'Bank', icon: 'card-outline' },
    { id: 'experience', title: 'Experience', icon: 'star-outline' },
    { id: 'documents', title: 'Documents', icon: 'document-text-outline' },
    { id: 'credentials', title: 'Credentials', icon: 'lock-closed-outline' },
  ];

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await categoryAPI.getAllCategories();
      setCategories(response.data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      Alert.alert('Error', 'Failed to load categories. Please try again.');
    } finally {
      setLoadingCategories(false);
    }
  };

  const getCurrentStepIndex = () => steps.findIndex(s => s.id === currentStep);
  const progress = ((getCurrentStepIndex() + 1) / steps.length) * 100;

  const handleCategorySelect = (cat: any) => {
    setFormData({
      ...formData,
      category: cat._id,         // _id sent to API
      categoryName: cat.name,    // name shown in UI
      subCategory: cat.autoFilled || ''
    });
    setShowCategoryDropdown(false);
  };

  const getSubCategories = (): string[] => {
    const selectedCategory = categories.find(cat => cat._id === formData.category);
    return selectedCategory?.autoFilled || [];
  };

  const handleNext = () => {
    if (currentStep === 'basic') {
      if (!formData.company || !formData.typeOfService || !formData.name) {
        Alert.alert('Required Fields', 'Please fill all required fields');
        return;
      }
    }
    if (currentStep === 'contact') {
      if ( !formData.phone || !formData.address) {
        Alert.alert('Required Fields', 'Please fill all required fields');
        return;
      }
      if (hasWhatsapp === null) {
        Alert.alert('Required Fields', 'Please indicate if you have WhatsApp');
        return;
      }
    }
    if (currentStep === 'business') {
      if (!formData.businessType) {
        Alert.alert('Required Fields', 'Please fill all required fields');
        return;
      }
    }
    if (currentStep === 'bank') {
      if (formData.accountNumber !== formData.confirmAccountNumber) {
        Alert.alert('Error', 'Account numbers do not match');
        return;
      }
    }
    if (currentStep === 'experience') {
      if (!formData.workingDays.length) {
        Alert.alert('Required Fields', 'Please select at least one working day');
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
      // Build workingDays string: "Mon, Tue, Wed | 9 AM - 7 PM"
      const workingDaysStr = formData.workingDays.length
        ? `${formData.workingDays.join(', ')} | ${formData.workingTimings}`
        : '';

      const totalYearsNum = parseInt(formData.totalYears) || 0;

      const registerData = {
        company: formData.company,
        typeOfService: formData.typeOfService,
        description: formData.description,
        yearOfEstablishment: formData.yearOfEstablishment,
        name: formData.name,
        address: formData.address,
        serviceLocation: formData.serviceLocation,
        phone: formData.phone,
        alternatePhone: formData.alternatePhone,
        whatsappNumber: formData.whatsappNumber,
        email: formData.email,
        businessType: formData.businessType,
        gstNumber: formData.gstNumber,
        pan: formData.pan,
        adhar: formData.adhar,
        tradeLicense: formData.tradeLicense,
        // Bank: top-level fields + bankDetail object
        bankName: formData.bankName,
        accountHolderName: formData.accountHolderName,
        accountNumber: formData.accountNumber,
        ifscCode:formData.bankDetail.IFSC,
        bankDetail: {
          accountNumber: formData.bankDetail.accountNumber,
          IFSC: formData.bankDetail.IFSC,
          accountHolderName: formData.bankDetail.accountHolderName,
          branch: formData.bankDetail.branch,
        },
        // Experience
        totalYears: String(totalYearsNum),
        numberOfStaff: formData.numberOfStaff,
        servicesOffered: formData.servicesOffered,
        workingDays: workingDaysStr,
        experience: {
          totalYears: totalYearsNum,
          fields: [],
        },
        // Credentials
        password: formData.password,
        confirmPassword:formData.confirmPassword,
        referralCode: formData.referralCode,
        referralName: formData.referralName,
        // Category (send _id)
        category: formData.category,
        subCategory: formData.subCategory,
        status: "pending",
      };

      debugger
      const response = await vendorAPI.register(registerData);
      debugger
      setVendor(response.data.user)

      router.push({
        pathname: '/(auth)/payment',
        params: {
          vendor: JSON.stringify(response.data.user),
          category: JSON.stringify(categories),
        },
      });
    } catch (error: any) {
      console.log('Error from vendor register: ', error);
      Alert.alert('Error', error.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // ─── BASIC INFO ───────────────────────────────────────────────────────────────
  const renderBasicInfo = () => (
    <View style={styles.formSection}>
      <Text style={styles.sectionTitle}>Tell us about your business</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>
          Service Provider / Business Name <Text style={styles.required}>*</Text>
        </Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="business-outline" size={20} color="#f59e0b" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Enter your business name"
            placeholderTextColor="#9ca3af"
            value={formData.company}
            onChangeText={(text) => setFormData({ ...formData, company: text })}
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>
          Type of Service <Text style={styles.required}>*</Text>
        </Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="construct-outline" size={20} color="#f59e0b" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="e.g., Plumbing, Electrical, Carpentry"
            placeholderTextColor="#9ca3af"
            value={formData.typeOfService}
            onChangeText={(text) => setFormData({ ...formData, typeOfService: text })}
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>
          Service Description <Text style={styles.required}>*</Text>
        </Text>
        <View style={[styles.inputWrapper, styles.textAreaWrapper]}>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe your services..."
            placeholderTextColor="#9ca3af"
            value={formData.description}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
            multiline
            numberOfLines={4}
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Category (Service)</Text>
        <TouchableOpacity
          style={styles.dropdownWrapper}
          onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
        >
          <Ionicons name="grid-outline" size={20} color="#f59e0b" style={styles.inputIcon} />
          <Text style={[styles.dropdownText, !formData.category && styles.placeholderText]}>
            {formData.categoryName || 'Select Category'}
          </Text>
          <Ionicons name="chevron-down-outline" size={20} color="#9ca3af" />
        </TouchableOpacity>

        {showCategoryDropdown && (
          <ScrollView style={styles.dropdownList} nestedScrollEnabled={true}>
            {loadingCategories ? (
              <View style={styles.dropdownItem}>
                <Text style={styles.dropdownItemText}>Loading categories...</Text>
              </View>
            ) : categories.length === 0 ? (
              <View style={styles.dropdownItem}>
                <Text style={styles.dropdownItemText}>No categories available</Text>
              </View>
            ) : (
              categories.map((cat) => (
                <TouchableOpacity
                  key={cat._id}
                  style={styles.dropdownItem}
                  onPress={() => handleCategorySelect(cat)}
                >
                  <Text style={styles.dropdownItemText}>{cat.name}</Text>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Category (Auto-filled)</Text>
        <View style={[styles.dropdownWrapper, styles.readOnlyField]}>
          <Ionicons name="list-outline" size={20} color="#f59e0b" style={styles.inputIcon} />
          <Text style={[styles.dropdownText, !formData.subCategory && styles.placeholderText]}>
            {formData.subCategory || 'Auto-filled based on category'}
          </Text>
          <Ionicons name="lock-closed-outline" size={18} color="#9ca3af" />
        </View>
        {formData.category && getSubCategories().length > 0 && (
          <Text style={styles.helperText}>Available: {getSubCategories()}</Text>
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Year of Establishment</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="calendar-outline" size={20} color="#f59e0b" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="YYYY"
            placeholderTextColor="#9ca3af"
            value={formData.yearOfEstablishment}
            onChangeText={(text) => setFormData({ ...formData, yearOfEstablishment: text })}
            keyboardType="numeric"
            maxLength={4}
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>
          Owner / Authorized Person Name <Text style={styles.required}>*</Text>
        </Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="person-outline" size={20} color="#f59e0b" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Full name of owner / authorized person"
            placeholderTextColor="#9ca3af"
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
          />
        </View>
      </View>
    </View>
  );

  // ─── CONTACT ──────────────────────────────────────────────────────────────────
  const renderContact = () => (
    <View style={styles.formSection}>
      <Text style={styles.sectionTitle}>How can customers reach you?</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>
          Registered Office / Home Address <Text style={styles.required}>*</Text>
        </Text>
        <View style={[styles.inputWrapper, styles.textAreaWrapper]}>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Complete registered address"
            placeholderTextColor="#9ca3af"
            value={formData.address}
            onChangeText={(text) => setFormData({ ...formData, address: text })}
            multiline
            numberOfLines={3}
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Service Location / Area Covered</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="location-outline" size={20} color="#f59e0b" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="e.g., Mumbai, Thane, Navi Mumbai"
            placeholderTextColor="#9ca3af"
            value={formData.serviceLocation}
            onChangeText={(text) => setFormData({ ...formData, serviceLocation: text })}
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>
          Primary Contact Number <Text style={styles.required}>*</Text>
        </Text>
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
        <Text style={styles.label}>Alternate Contact Number</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="call-outline" size={20} color="#f59e0b" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="+91 XXXXX XXXXX"
            placeholderTextColor="#9ca3af"
            value={formData.alternatePhone}
            onChangeText={(text) => setFormData({ ...formData, alternatePhone: text })}
            keyboardType="phone-pad"
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>
          Do you have WhatsApp? <Text style={styles.required}>*</Text>
        </Text>
        <View style={styles.whatsappToggleRow}>
          <TouchableOpacity
            style={[styles.toggleOption, hasWhatsapp === true && styles.toggleOptionSelected]}
            onPress={() => {
              setHasWhatsapp(true);
              setFormData({ ...formData, whatsappNumber: formData.phone });
            }}
          >
            <Ionicons
              name="logo-whatsapp"
              size={18}
              color={hasWhatsapp === true ? '#fff' : '#25d366'}
            />
            <Text style={[styles.toggleOptionText, hasWhatsapp === true && styles.toggleOptionTextSelected]}>
              Yes
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toggleOption, hasWhatsapp === false && styles.toggleOptionNo]}
            onPress={() => {
              setHasWhatsapp(false);
              setFormData({ ...formData, whatsappNumber: '' });
            }}
          >
            <Ionicons
              name="close-circle-outline"
              size={18}
              color={hasWhatsapp === false ? '#fff' : '#6b7280'}
            />
            <Text style={[styles.toggleOptionText, hasWhatsapp === false && styles.toggleOptionTextSelected]}>
              No
            </Text>
          </TouchableOpacity>
        </View>

        {hasWhatsapp === true && (
          <View style={[styles.inputWrapper, { marginTop: 10 }]}>
            <Ionicons name="logo-whatsapp" size={20} color="#25d366" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="WhatsApp Number"
              placeholderTextColor="#9ca3af"
              value={formData.whatsappNumber}
              onChangeText={(text) => setFormData({ ...formData, whatsappNumber: text })}
              keyboardType="phone-pad"
            />
          </View>
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>
          Email ID 
        </Text>
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
    </View>
  );

  // ─── BUSINESS ─────────────────────────────────────────────────────────────────
  const renderBusiness = () => {
    const businessTypes = ['Proprietorship', 'Partnership', 'LLP', 'Private Limited', 'Other'];

    return (
      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>Business Details</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Business Type <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.businessTypeContainer}>
            {businessTypes.map((type) => (
              <TouchableOpacity
                key={type}
                style={styles.radioOption}
                onPress={() => setFormData({ ...formData, businessType: type })}
              >
                <View style={styles.radioCircle}>
                  {formData.businessType === type && <View style={styles.radioSelected} />}
                </View>
                <Text style={styles.radioLabel}>{type}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Aadhaar Number</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="card-outline" size={20} color="#f59e0b" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="XXXX XXXX XXXX"
              placeholderTextColor="#9ca3af"
              value={formData.adhar}
              onChangeText={(text) => setFormData({ ...formData, adhar: text })}
              keyboardType="numeric"
              maxLength={14}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            PAN Number 
          </Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="document-text-outline" size={20} color="#f59e0b" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="ABCDE1234F"
              placeholderTextColor="#9ca3af"
              value={formData.pan}
              onChangeText={(text) => setFormData({ ...formData, pan: text.toUpperCase() })}
              autoCapitalize="characters"
              maxLength={10}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>GST Number (if applicable)</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="receipt-outline" size={20} color="#f59e0b" style={styles.inputIcon} />
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
          <Text style={styles.label}>Trade License / Shop Act Registration No.</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="ribbon-outline" size={20} color="#f59e0b" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Enter license / registration number"
              placeholderTextColor="#9ca3af"
              value={formData.tradeLicense}
              onChangeText={(text) => setFormData({ ...formData, tradeLicense: text })}
            />
          </View>
        </View>

        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={20} color="#3b82f6" />
          <Text style={styles.infoText}>
            Aadhaar, GST, and Trade License details help build trust with customers and speed up verification.
          </Text>
        </View>
      </View>
    );
  };

  // ─── BANK ─────────────────────────────────────────────────────────────────────
  // All fields sync to both top-level keys AND bankDetail object to match API body
  const syncBank = (field: string, value: string) => {
    const topLevel: Record<string, string> = {};
    const detailUpdate: Record<string, string> = {};

    if (field === 'bankName') {
      topLevel.bankName = value;
    } else if (field === 'accountHolderName') {
      topLevel.accountHolderName = value;
      detailUpdate.accountHolderName = value;
    } else if (field === 'accountNumber') {
      topLevel.accountNumber = value;
      detailUpdate.accountNumber = value;
    } else if (field === 'confirmAccountNumber') {
      topLevel.confirmAccountNumber = value;
    } else if (field === 'IFSC') {
      detailUpdate.IFSC = value.toUpperCase();
    } else if (field === 'branch') {
      detailUpdate.branch = value;
    }

    setFormData((prev) => ({
      ...prev,
      ...topLevel,
      bankDetail: { ...prev.bankDetail, ...detailUpdate },
    }));
  };

  const renderBank = () => (
    <View style={styles.formSection}>
      <Text style={styles.sectionTitle}>Bank Account Details</Text>
      <Text style={styles.sectionDescription}>For receiving payments from customers</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Bank Name</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="business-outline" size={20} color="#f59e0b" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="e.g., State Bank of India"
            placeholderTextColor="#9ca3af"
            value={formData.bankName}
            onChangeText={(text) => syncBank('bankName', text)}
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Account Holder Name</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="person-outline" size={20} color="#f59e0b" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="As per bank records"
            placeholderTextColor="#9ca3af"
            value={formData.accountHolderName}
            onChangeText={(text) => syncBank('accountHolderName', text)}
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Account Number</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="card-outline" size={20} color="#f59e0b" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Enter account number"
            placeholderTextColor="#9ca3af"
            value={formData.accountNumber}
            onChangeText={(text) => syncBank('accountNumber', text)}
            keyboardType="numeric"
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Confirm Account Number</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="checkmark-circle-outline" size={20} color="#f59e0b" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Re-enter account number"
            placeholderTextColor="#9ca3af"
            value={formData.confirmAccountNumber}
            onChangeText={(text) => syncBank('confirmAccountNumber', text)}
            keyboardType="numeric"
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>IFSC Code</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="git-branch-outline" size={20} color="#f59e0b" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="e.g., SBIN0001234"
            placeholderTextColor="#9ca3af"
            value={formData.bankDetail.IFSC}
            onChangeText={(text) => syncBank('IFSC', text)}
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
            value={formData.bankDetail.branch}
            onChangeText={(text) => syncBank('branch', text)}
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

  // ─── EXPERIENCE ───────────────────────────────────────────────────────────────
  const toggleWorkingDay = (day: string) => {
    const currentDays = formData.workingDays;
    if (currentDays.includes(day)) {
      setFormData({ ...formData, workingDays: currentDays.filter(d => d !== day) });
    } else {
      setFormData({ ...formData, workingDays: [...currentDays, day] });
    }
  };

  const renderExperience = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    return (
      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>Experience & Availability</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Years of Experience</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="time-outline" size={20} color="#f59e0b" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="How many years of experience?"
              placeholderTextColor="#9ca3af"
              value={formData.totalYears}
              onChangeText={(text) => setFormData({ ...formData, totalYears: text })}
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Number of Technicians / Staff</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="people-outline" size={20} color="#f59e0b" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="e.g., 5"
              placeholderTextColor="#9ca3af"
              value={formData.numberOfStaff === 0 ? '' : String(formData.numberOfStaff)}
              onChangeText={(text) => setFormData({ ...formData, numberOfStaff: parseInt(text) || 0 })}
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Services Offered</Text>
          <View style={[styles.inputWrapper, styles.textAreaWrapper]}>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="List the services you offer..."
              placeholderTextColor="#9ca3af"
              value={formData.servicesOffered}
              onChangeText={(text) => setFormData({ ...formData, servicesOffered: text })}
              multiline
              numberOfLines={3}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Working Days <Text style={styles.required}>*</Text>
          </Text>
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

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Working Timings</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="time-outline" size={20} color="#f59e0b" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="e.g., 9 AM - 7 PM"
              placeholderTextColor="#9ca3af"
              value={formData.workingTimings}
              onChangeText={(text) => setFormData({ ...formData, workingTimings: text })}
            />
          </View>
        </View>
      </View>
    );
  };

  // ─── DOCUMENTS ────────────────────────────────────────────────────────────────
  const pickDocument = async (docType: 'addressProof' | 'profilePhoto') => {
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
    const documentTypes: {
      key: 'addressProof' | 'profilePhoto';
      label: string;
      desc: string;
    }[] = [
        { key: 'addressProof', label: 'Address Proof', desc: 'Electricity Bill, Rent Agreement, Passport' },
        { key: 'profilePhoto', label: 'Profile Photo', desc: 'Clear recent photograph of yourself' },
      ];

    const isUploaded = (key: 'addressProof' | 'profilePhoto') => !!formData.documents[key];

    return (
      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>Document Upload</Text>
        <Text style={styles.sectionDescription}>
          All documents are optional. You can upload up to 5 documents (Aadhaar, PAN, GST Certificate, Address Proof, Business Registration, etc.)
        </Text>

        {documentTypes.map(({ key, label, desc }) => {
          const uploaded = isUploaded(key);

          return (
            <View key={key} style={styles.documentItem}>
              <View style={styles.documentHeader}>
                <View style={styles.documentInfo}>
                  <Text style={styles.documentLabel}>{label}</Text>
                  <Text style={styles.documentDesc}>{desc}</Text>
                </View>
                <View style={styles.documentStatus}>
                  <Ionicons
                    name={uploaded ? 'checkmark-circle' : 'cloud-upload-outline'}
                    size={24}
                    color={uploaded ? '#10b981' : '#9ca3af'}
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[styles.uploadButton, uploaded && styles.uploadButtonUploaded]}
                onPress={() => pickDocument(key)}
              >
                <Ionicons
                  name={uploaded ? 'document-attach' : 'add-circle-outline'}
                  size={20}
                  color={uploaded ? '#10b981' : '#f59e0b'}
                />
                <Text style={[styles.uploadButtonText, uploaded && styles.uploadButtonTextUploaded]}>
                  {uploaded ? 'Document Uploaded' : 'Click to upload'}
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

  // ─── CREDENTIALS ──────────────────────────────────────────────────────────────
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
          <Text style={styles.summaryLabel}>Company:</Text>
          <Text style={styles.summaryValue}>{formData.company || '-'}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Owner:</Text>
          <Text style={styles.summaryValue}>{formData.name || '-'}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Service:</Text>
          <Text style={styles.summaryValue}>{formData.typeOfService || '-'}</Text>
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
          <Text style={styles.summaryValue}>{formData.totalYears ? `${formData.totalYears} years` : '-'}</Text>
        </View>
      </View>
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'basic': return renderBasicInfo();
      case 'contact': return renderContact();
      case 'business': return renderBusiness();
      case 'bank': return renderBank();
      case 'experience': return renderExperience();
      case 'documents': return renderDocuments();
      case 'credentials': return renderCredentials();
      default: return null;
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
        <View style={styles.header}>
          <Image
            source={require('../../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Service Provider Registration</Text>
          <Text style={styles.subtitle}>Join Ghar Sansaar and grow your business</Text>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>
            Step {getCurrentStepIndex() + 1} of {steps.length}
          </Text>
        </View>

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
                <Text style={[styles.stepText, isActive && styles.stepTextActive]}>
                  {step.title}
                </Text>
              </View>
            );
          })}
        </View>

        <View style={styles.formContainer}>
          {renderCurrentStep()}
        </View>

        <View style={styles.buttonContainer}>
          {getCurrentStepIndex() > 0 && (
            <TouchableOpacity style={styles.buttonSecondary} onPress={handlePrevious}>
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
  sectionDescription: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: -8,
    marginBottom: 12,
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
  dropdownWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
  },
  readOnlyField: {
    backgroundColor: '#f3f4f6',
    opacity: 0.8,
  },
  dropdownText: {
    flex: 1,
    fontSize: 15,
    color: '#1f2937',
  },
  placeholderText: {
    color: '#9ca3af',
  },
  dropdownList: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    marginTop: 4,
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  dropdownItemText: {
    fontSize: 15,
    color: '#1f2937',
  },
  businessTypeContainer: {
    gap: 12,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#f59e0b',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#f59e0b',
  },
  radioLabel: {
    fontSize: 15,
    color: '#1f2937',
    fontWeight: '500',
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
    marginTop: 4,
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
  whatsappToggleRow: {
    flexDirection: 'row',
    gap: 12,
  },
  toggleOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
  },
  toggleOptionSelected: {
    borderColor: '#25d366',
    backgroundColor: '#25d366',
  },
  toggleOptionNo: {
    borderColor: '#6b7280',
    backgroundColor: '#6b7280',
  },
  toggleOptionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
  toggleOptionTextSelected: {
    color: '#fff',
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