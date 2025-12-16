/**
 * Mafqood Mobile - Image Picker Component
 * Allows camera capture or gallery selection
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
  Pressable,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius, fontSize, fontWeight, spacing, shadows } from '../theme/theme';
import { useLanguage } from '../context/LanguageContext';

interface ImagePickerFieldProps {
  value: {
    uri: string;
    name: string;
    type: string;
  } | null;
  onChange: (image: { uri: string; name: string; type: string } | null) => void;
  label?: string;
  required?: boolean;
  large?: boolean;
}

export default function ImagePickerField({
  value,
  onChange,
  label,
  required = false,
  large = false,
}: ImagePickerFieldProps) {
  const { t } = useLanguage();
  const [showModal, setShowModal] = useState(false);

  const requestPermissions = async (type: 'camera' | 'gallery') => {
    if (type === 'camera') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Camera permission is required to take photos.',
          [{ text: 'OK' }]
        );
        return false;
      }
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Gallery permission is required to select photos.',
          [{ text: 'OK' }]
        );
        return false;
      }
    }
    return true;
  };

  const pickImage = async (useCamera: boolean) => {
    setShowModal(false);
    
    const hasPermission = await requestPermissions(useCamera ? 'camera' : 'gallery');
    if (!hasPermission) return;

    const options: ImagePicker.ImagePickerOptions = {
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    };

    try {
      const result = useCamera
        ? await ImagePicker.launchCameraAsync(options)
        : await ImagePicker.launchImageLibraryAsync(options);

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const fileName = asset.uri.split('/').pop() || `photo_${Date.now()}.jpg`;
        const fileType = asset.mimeType || 'image/jpeg';

        onChange({
          uri: asset.uri,
          name: fileName,
          type: fileType,
        });
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const removeImage = () => {
    onChange(null);
  };

  return (
    <View style={styles.container}>
      {label && (
        <View style={styles.labelContainer}>
          <Ionicons name="camera" size={16} color={colors.primary.accent} />
          <Text style={styles.label}>
            {label} {required && <Text style={styles.required}>*</Text>}
          </Text>
        </View>
      )}

      {value ? (
        <View style={styles.previewContainer}>
          <Image source={{ uri: value.uri }} style={[styles.preview, large && styles.previewLarge]} resizeMode="cover" />
          <View style={styles.checkBadge}>
            <Ionicons name="checkmark-circle" size={24} color={colors.status.success} />
          </View>
          <TouchableOpacity style={styles.removeButton} onPress={removeImage}>
            <Text style={styles.removeText}>{t('lost_remove_image')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.uploadArea, large && styles.uploadAreaLarge]}
          onPress={() => setShowModal(true)}
          activeOpacity={0.7}
        >
          <View style={[styles.uploadIconContainer, large && styles.uploadIconContainerLarge]}>
            <Ionicons name="cloud-upload" size={large ? 48 : 32} color={colors.primary.accent} />
          </View>
          <Text style={[styles.uploadText, large && styles.uploadTextLarge]}>{t('lost_upload_click')}</Text>
          <Text style={styles.uploadFormats}>{t('lost_upload_formats')}</Text>
        </TouchableOpacity>
      )}

      {/* Image Source Modal */}
      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowModal(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('lost_form_item_photo')}</Text>

            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => pickImage(true)}
            >
              <View style={[styles.modalIconContainer, { backgroundColor: colors.primary.dark }]}>
                <Ionicons name="camera" size={24} color={colors.text.white} />
              </View>
              <Text style={styles.modalOptionText}>{t('lost_upload_camera')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => pickImage(false)}
            >
              <View style={[styles.modalIconContainer, { backgroundColor: colors.primary.accent }]}>
                <Ionicons name="images" size={24} color={colors.text.white} />
              </View>
              <Text style={styles.modalOptionText}>{t('lost_upload_gallery')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowModal(false)}
            >
              <Text style={styles.cancelText}>{t('cancel')}</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
  },
  required: {
    color: colors.status.error,
  },
  uploadArea: {
    borderWidth: 2,
    borderColor: colors.border.default,
    borderRadius: borderRadius.xl,
    padding: spacing.xxl,
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
  },
  uploadAreaLarge: {
    paddingVertical: spacing.xxl * 2,
    borderStyle: 'dashed',
  },
  uploadIconContainer: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.lg,
    backgroundColor: `${colors.primary.accent}20`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  uploadIconContainerLarge: {
    width: 88,
    height: 88,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.xl,
  },
  uploadText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  uploadTextLarge: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
  },
  uploadFormats: {
    fontSize: fontSize.sm,
    color: colors.text.tertiary,
  },
  previewContainer: {
    alignItems: 'center',
  },
  preview: {
    width: '100%',
    height: 200,
    borderRadius: borderRadius.xl,
    ...shadows.lg,
  },
  previewLarge: {
    height: 280,
  },
  checkBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.full,
  },
  removeButton: {
    marginTop: spacing.md,
    padding: spacing.sm,
  },
  removeText: {
    fontSize: fontSize.sm,
    color: colors.status.error,
    fontWeight: fontWeight.medium,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background.primary,
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    padding: spacing.xxl,
    ...shadows.xl,
  },
  modalTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.xxl,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.background.secondary,
    marginBottom: spacing.md,
  },
  modalIconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.lg,
  },
  modalOptionText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
  },
  cancelButton: {
    padding: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  cancelText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text.tertiary,
  },
});
