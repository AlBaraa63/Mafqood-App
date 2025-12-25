/**
 * Report Photo Screen
 * Step 2: Upload or take a photo of the item
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { Button, Card, Stepper } from '../../components/common';
import { useTranslation } from '../../hooks';
import { useReportFormStore } from '../../hooks/useStore';
import { ReportStackParamList, ItemType } from '../../types';
import { colors, typography, spacing, borderRadius } from '../../theme';

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
    }
  };
  
  const handleRemovePhoto = () => {
    setImageUri(undefined);
    setConfirmed(false);
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
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.content}>
        <Stepper currentStep={2} totalSteps={6} />
        
        <View style={styles.header}>
          <Text style={styles.title}>{t('report_photo_title')}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
        
        {/* Image Preview or Upload Buttons */}
        {imageUri ? (
          <View style={styles.previewContainer}>
            <Image source={{ uri: imageUri }} style={styles.preview} />
            <TouchableOpacity style={styles.removeButton} onPress={handleRemovePhoto}>
              <Text style={styles.removeButtonText}>{t('remove_photo')}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.uploadButtons}>
            <Card style={styles.uploadCard} onPress={handleTakePhoto}>
              <Text style={styles.uploadIcon}>📷</Text>
              <Text style={styles.uploadText}>{t('take_photo')}</Text>
            </Card>
            
            <Card style={styles.uploadCard} onPress={handleChooseFromGallery}>
              <Text style={styles.uploadIcon}>🖼️</Text>
              <Text style={styles.uploadText}>{t('choose_from_gallery')}</Text>
            </Card>
          </View>
        )}
        
        {/* Privacy Note */}
        <View style={styles.privacyNote}>
          <Text style={styles.privacyIcon}>🔒</Text>
          <Text style={styles.privacyText}>{t('photo_privacy_note')}</Text>
        </View>
        
        {/* Confirmation Checkbox */}
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => setConfirmed(!confirmed)}
        >
          <View style={[styles.checkbox, confirmed && styles.checkboxChecked]}>
            {confirmed && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.checkboxLabel}>{t('photo_confirm_checkbox')}</Text>
        </TouchableOpacity>
        
        {/* TODO: Connect to backend endpoint for image upload and optional blurring */}
        
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
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
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
    textAlign: 'left',
  },
  uploadButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  uploadCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
    backgroundColor: colors.neutral[50],
    borderWidth: 2,
    borderColor: colors.neutral[200],
    borderStyle: 'dashed',
  },
  uploadIcon: {
    fontSize: 40,
    marginBottom: spacing.sm,
  },
  uploadText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
  },
  previewContainer: {
    marginBottom: spacing.xl,
    alignItems: 'center',
  },
  preview: {
    width: '100%',
    height: 250,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.neutral[200],
  },
  removeButton: {
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  removeButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.error.main,
  },
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.info.light,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
  },
  privacyIcon: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  privacyText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.info.dark,
    lineHeight: 20,
    textAlign: 'left',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.xl,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: colors.neutral[300],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  checkmark: {
    color: colors.neutral.white,
    fontWeight: typography.fontWeight.bold,
    fontSize: 14,
  },
  checkboxLabel: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    lineHeight: 20,
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
