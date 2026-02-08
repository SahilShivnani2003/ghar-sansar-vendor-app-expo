// src/screens/SplashScreen.tsx
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import {
    ActivityIndicator,
    Image,
    StyleSheet,
    Text,
    View,
} from 'react-native';

const SplashScreen = () => {
    const router = useRouter();
    const { isAuthenticated, loadVendor } = useAuthStore();

    useEffect(() => {
        const init = async () => {
            await loadVendor();

            // Small delay to prevent flash
            setTimeout(() => {
                if (isAuthenticated) {
                    router.replace('/(tabs)/dashboard');
                } else {
                    router.replace('/(auth)/login');
                }
            }, 500);
        };

        init();
    }, [isAuthenticated]);

    return (
        <View style={styles.container}>
            <View style={styles.logoContainer}>
                {/* Replace with your actual logo */}
                <Image
                    source={require('../assets/images/logo.png')} // Update path to your logo
                    style={styles.logo}
                    resizeMode="contain"
                />
                <Text style={styles.appName}>GharSansaar</Text>
                <Text style={styles.tagline}>Your Home Service Partner</Text>
            </View>

            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2563EB" />
                <Text style={styles.loadingText}>Loading...</Text>
            </View>

            <Text style={styles.versionText}>Version 1.0.0</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 50,
    },
    logoContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logo: {
        width: 150,
        height: 150,
        marginBottom: 20,
    },
    appName: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#2563EB',
        marginBottom: 8,
    },
    tagline: {
        fontSize: 16,
        color: '#6B7280',
    },
    loadingContainer: {
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 14,
        color: '#6B7280',
    },
    versionText: {
        fontSize: 12,
        color: '#9CA3AF',
    },
});

export default SplashScreen;