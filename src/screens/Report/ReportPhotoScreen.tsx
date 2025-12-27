/**
 * Report Photo Screen - Cyber-Luxe Edition
 * Step 2: Upload or take a photo of the item
 * Enhanced with glassmorphism and dynamic animations
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  LinearGradient,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button, Card, Stepper } from '../../components/common';
import { useTranslation } from '../../hooks';
import { useReportFormStore } from '../../hooks/useStore';
import { ReportStackParamList, ItemType } from '../../types';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';

type NavigationProp = NativeStackNavigationProp<ReportStackParamList, 'ReportPhoto'>;
type RouteProps = RouteProp<ReportStackParamList, 'ReportPhoto'>;

export const ReportPhotoScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { type } = route.params;
  const { formData, setFormData } = useReportFormStore();
  
  const [imageUri, setImageUri] = useState<string | undefined>(formData.imageUri);
  const [confirmed, setConfirmed] = useState(formData.imageConfirmed);
  const [uploadAnim] = useState(new Animated.Value(0));
  
  const requestPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Camera permission is needed to take photos.');
      return false;
    }
    return true;
  };
  
  const handleTakePhoto = async () => {
    const hasPermission = await requestPermission();
    if (!hasPermission) return;
    
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
      // Trigger animation
      Animated.timing(uploadAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: false,
      }).start();
    }
  };
  
  const handleChooseFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Gallery permission is needed to select photos.');
      return;
    }
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
      // Trigger animation
      Animated.timing(uploadAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: false,
      }).start();
    }
  };
  
  const handleRemovePhoto = () => {
    setImageUri(undefined);
    setConfirmed(false);
    Animated.timing(uploadAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };
  
  const handleNext = () => {
    if (!imageUri) {
      Alert.alert(t('required_field'), 'Please add a photo of the item.');
      return;
    }
    
    if (!confirmed) {
      Alert.alert(t('required_field'), 'Please confirm the privacy checkbox.');
      return;
    }
    
    setFormData({ imageUri, imageConfirmed: confirmed });
    navigation.navigate('ReportDetails', { type, imageUri });
  };
  
  const subtitle = type === 'lost' 
    ? t('report_photo_lost_subtitle')
    : t('report_photo_found_subtitle');
  
  const previewScale = uploadAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1],
  });

  const previewOpacity = uploadAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <LinearGradient
        colors={[colors.primary[500], colors.primary[600]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.background}
      >
        <View style={styles.content}>
          <Stepper currentStep={2} totalSteps={6} />
          
          <View style={styles.header}>
            <Text style={styles.title}>{t('report_photo_title')}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>
          
          {/* Image Preview or Upload Buttons */}
          {imageUri ? (
            <Animated.View 
              style={[
                styles.previewContainer,
                {
                  transform: [{ scale: previewScale }],
                  opacity: previewOpacity,
                },
              ]}
            >
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.previewWrapper, shadows.lg]}
              >
                <Image source={{ uri: imageUri }} style={styles.preview} />
                <View style={styles.previewOverlay}>
                  <MaterialCommunityIcons
                    name="check-circle"
                    size={48}
                    color={colors.accent[500]}
                  />
                  <Text style={styles.previewText}>Image Ready</Text>
                </View>
              </LinearGradient>
              
              <TouchableOpacity 
                style={styles.removeButton} 
                onPress={handleRemovePhoto}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons
                  name="close-circle"
                  size={24}
                  color={colors.highlight[500]}
                />
                <Text style={styles.removeButtonText}>{t('remove_photo')}</Text>
              </TouchableOpacity>
            </Animated.View>
          ) : (
            <View style={styles.uploadButtons}>
              <LinearGradient
                colors={['rgba(40, 179, 163, 0.15)', 'rgba(40, 179, 163, 0.05)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.uploadCard, styles.uploadCardCamera]}
              >
                <TouchableOpacity 
                  style={styles.uploadCardContent}
                  onPress={handleTakePhoto}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons
                    name="camera"
                    size={40}
                    color={colors.accent[500]}
                  />
                  <Text style={styles.uploadText}>{t('take_photo')}</Text>
                </TouchableOpacity>
              </LinearGradient>
              
              <LinearGradient
                colors={['rgba(209, 139, 30, 0.15)', 'rgba(209, 139, 30, 0.05)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.uploadCard, styles.uploadCardGallery]}
              >
                <TouchableOpacity 
                  style={styles.uploadCardContent}
                  onPress={handleChooseFromGallery}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons
                    name="image-multiple"
                    size={40}
                    color={colors.highlight[500]}
                  />
                  <Text style={styles.uploadText}>{t('choose_from_gallery')}</Text>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          )}
          
          {/* Privacy Note - Glassmorphic */}
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.privacyNote, { borderColor: `${colors.accent[500]}40` }]}
          >
            <MaterialCommunityIcons
              name="shield-check"
              size={20}
              color={colors.accent[500]}
            />
            <Text style={styles.privacyText}>{t('photo_privacy_note')}</Text>
          </LinearGradient>
          
          {/* Confirmation Checkbox - Enhanced */}
          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => setConfirmed(!confirmed)}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={confirmed ? [colors.accent[500], colors.accent[600]] : ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[
                styles.checkbox,
                { borderColor: confirmed ? colors.accent[500] : 'rgba(255, 255, 255, 0.3)' },
              ]}
            >
              {confirmed && (
                <MaterialCommunityIcons
                  name="check"
                  size={16}
                  color={colors.neutral.white}
                />
              )}
            </LinearGradient>
            <Text style={styles.checkboxLabel}>{t('photo_confirm_checkbox')}</Text>
          </TouchableOpacity>
          
          {/* Navigation Buttons */}
          <View style={styles.footer}>
            <Button
              title={t('back')}
              onPress={() => navigation.goBack()}
              variant="outline"
              style={styles.backButton}
            />
            <Button
              title={t('next')}
              onPress={handleNext}
              style={styles.nextButton}
            />
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral.white,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    color: colors.neutral[100],
    textAlign: 'left',
  },
  uploadButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  uploadCard: {
    flex: 1,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  uploadCardCamera: {
    borderColor: `${colors.accent[500]}40`,
  },
  uploadCardGallery: {
    borderColor: `${colors.highlight[500]}40`,
  },
  uploadCardContent: {
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
    gap: spacing.md,
  },
  uploadText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral.white,
  },
  previewContainer: {
    marginBottom: spacing.xl,
    alignItems: 'center',
    gap: spacing.md,
  },
  previewWrapper: {
    width: '100%',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    overflow: 'hidden',
  },
  preview: {
    width: '100%',
    height: 250,
    backgroundColor: colors.neutral[200],
  },
  previewOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    gap: spacing.md,
  },
  previewText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral.white,
  },
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  removeButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.highlight[500],
  },
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    gap: spacing.md,
  },
  privacyText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.neutral[100],
    lineHeight: 20,
    textAlign: 'left',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxLabel: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.neutral.white,
    lineHeight: 20,
    marginTop: 2,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: 'auto',
  },
  backButton: {
    flex: 1,
  },
  nextButton: {
    flex: 2,
  },
});

export default ReportPhotoScreen;
