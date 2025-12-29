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
    <SafeAreaView className="flex-1 bg-background-primary" edges={['bottom']}>
      <View className="flex-1 px-4 md:px-6 py-3">
        <Stepper currentStep={2} totalSteps={6} />
        
        <View className="mb-4">
          <Text className="text-lg md:text-xl font-bold text-text-primary mb-1">{t('report_photo_title')}</Text>
          <Text className="text-sm md:text-base text-text-secondary">{subtitle}</Text>
        </View>
        
        {/* Image Preview or Upload Buttons */}
        {imageUri ? (
          <View className="flex-1 items-center justify-center mb-4">
            <Image source={{ uri: imageUri }} className="w-full h-64 md:h-80 rounded-xl" resizeMode="cover" />
            <TouchableOpacity
              className="mt-3 px-4 py-2 bg-error/10 rounded-lg"
              onPress={handleRemovePhoto}
            >
              <Text className="text-sm font-medium text-error">{t('remove_photo')}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="flex-1 flex-row gap-3 mb-4">
            <Card style={{flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: spacing['2xl']}} onPress={handleTakePhoto}>
              <Text className="text-4xl mb-2">📷</Text>
              <Text className="text-sm md:text-base font-medium text-text-primary">{t('take_photo')}</Text>
            </Card>
            
            <Card style={{flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: spacing['2xl']}} onPress={handleChooseFromGallery}>
              <Text className="text-4xl mb-2">🖼️</Text>
              <Text className="text-sm md:text-base font-medium text-text-primary">{t('choose_from_gallery')}</Text>
            </Card>
          </View>
        )}
        
        {/* Privacy Note */}
        <View className="flex-row items-center bg-primary-50 p-3 rounded-lg mb-3">
          <Text className="text-2xl mr-2">🔒</Text>
          <Text className="flex-1 text-xs md:text-sm text-text-secondary">{t('photo_privacy_note')}</Text>
        </View>
        
        {/* Confirmation Checkbox */}
        <TouchableOpacity
          className="flex-row items-center mb-4"
          onPress={() => setConfirmed(!confirmed)}
        >
          <View className={`w-6 h-6 rounded border-2 items-center justify-center mr-3 ${confirmed ? 'bg-primary-500 border-primary-500' : 'border-neutral-300'}`}>
            {confirmed && <Text className="text-white text-sm font-bold">✓</Text>}
          </View>
          <Text className="flex-1 text-sm text-text-secondary">{t('photo_confirm_checkbox')}</Text>
        </TouchableOpacity>
        
        {/* Navigation Buttons */}
        <View className="flex-row gap-3">
          <Button
            title={t('back')}
            onPress={() => navigation.goBack()}
            variant="outline"
            style={{flex: 1}}
          />
          <Button
            title={t('next')}
            onPress={handleNext}
            style={{flex: 1}}
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
