/**
 * Report Photo Screen - Native Mobile Design
 * Step 2: Upload or take a photo of the item
 * Dynamic layout, haptics, smooth animations
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  StatusBar,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeOut,
  ZoomIn,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

import { GlassCard, ProgressStepper, EnhancedButton } from '../../components/ui';
import { useTranslation, useHaptics, useDynamicStyles } from '../../hooks';
import { useReportFormStore } from '../../hooks/useStore';
import { ReportStackParamList, ItemType } from '../../types';
import { colors, shadows } from '../../theme';

type NavigationProp = NativeStackNavigationProp<ReportStackParamList, 'ReportPhoto'>;
type RouteProps = RouteProp<ReportStackParamList, 'ReportPhoto'>;

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface UploadCardProps {
  icon: string;
  label: string;
  onPress: () => void;
  delay: number;
}

const UploadCard: React.FC<UploadCardProps> = ({ icon, label, onPress, delay }) => {
  const { typography, spacing, layout, isSmallDevice } = useDynamicStyles();
  const haptics = useHaptics();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15 });
    haptics.light();
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
  };

  return (
    <Animated.View entering={FadeInDown.delay(delay).springify()} style={{ flex: 1 }}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <Animated.View
          style={[
            {
              backgroundColor: colors.neutral[50],
              borderWidth: 2,
              borderColor: colors.neutral[200],
              borderStyle: 'dashed',
              borderRadius: layout.radiusXl,
              paddingVertical: spacing['3xl'],
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: isSmallDevice ? 180 : 220,
            },
            animatedStyle,
          ]}
        >
          <Text style={{ fontSize: layout.iconXl * 1.8, marginBottom: spacing.md }}>{icon}</Text>
          <Text style={[typography.h3, { color: colors.text.primary, textAlign: 'center' }]}>{label}</Text>
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export const ReportPhotoScreen: React.FC = () => {
  const { t, isRTL } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { type } = route.params;
  const { formData, setFormData } = useReportFormStore();
  const { typography, spacing, layout, isSmallDevice, height } = useDynamicStyles();
  const haptics = useHaptics();

  const [imageUri, setImageUri] = useState<string | undefined>(formData.imageUri);
  const [confirmed, setConfirmed] = useState(formData.imageConfirmed);

  const stepLabels = [
    t('step_label_type'),
    t('step_label_photo'),
    t('step_label_details'),
    t('step_label_where'),
    t('step_label_contact'),
    t('step_label_review'),
  ];

  const subtitle = type === 'lost'
    ? t('report_photo_lost_subtitle')
    : t('report_photo_found_subtitle');

  // Dynamic image preview height based on screen
  const imagePreviewHeight = Math.min(SCREEN_HEIGHT * 0.45, 380);

  const requestPermission = useCallback(async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Camera permission is needed to take photos.');
      return false;
    }
    return true;
  }, []);

  const handleTakePhoto = useCallback(async () => {
    haptics.light();
    const hasPermission = await requestPermission();
    if (!hasPermission) return;

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      haptics.success();
      setImageUri(result.assets[0].uri);
    }
  }, [haptics, requestPermission]);

  const handleChooseFromGallery = useCallback(async () => {
    haptics.light();
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
      haptics.success();
      setImageUri(result.assets[0].uri);
    }
  }, [haptics]);

  const handleRemovePhoto = useCallback(() => {
    haptics.warning();
    setImageUri(undefined);
    setConfirmed(false);
  }, [haptics]);

  const toggleConfirmed = useCallback(() => {
    haptics.selection();
    setConfirmed(!confirmed);
  }, [confirmed, haptics]);

  const handleNext = useCallback(() => {
    if (!imageUri) {
      haptics.error();
      Alert.alert(t('required_field'), 'Please add a photo of the item.');
      return;
    }

    if (!confirmed) {
      haptics.error();
      Alert.alert(t('required_field'), 'Please confirm the privacy checkbox.');
      return;
    }

    haptics.success();
    setFormData({ imageUri, imageConfirmed: confirmed });
    navigation.navigate('ReportDetails', { type, imageUri });
  }, [imageUri, confirmed, haptics, setFormData, navigation, type, t]);

  const handleBack = useCallback(() => {
    haptics.light();
    navigation.goBack();
  }, [navigation, haptics]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background.primary }}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background.primary} />

      <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
        {/* Fixed Progress Stepper */}
        <View 
          style={{ 
            backgroundColor: colors.background.primary,
            paddingHorizontal: spacing.screenPadding,
            paddingTop: spacing.md,
            borderBottomWidth: 1,
            borderBottomColor: colors.neutral[200],
          }}
        >
          <ProgressStepper currentStep={2} totalSteps={6} labels={stepLabels} />
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: spacing.screenPadding,
            paddingBottom: spacing.xl,
          }}
          showsVerticalScrollIndicator={false}
        >

          {/* Header */}
          <Animated.View entering={FadeIn.delay(100)}>
            <View style={{ marginBottom: spacing.lg }}>
              <Text style={[typography.h2, { marginBottom: spacing.xs }]}>
                {t('report_photo_title')}
              </Text>
              <Text style={[typography.body, { color: colors.text.secondary }]}>
                {subtitle}
              </Text>
            </View>
          </Animated.View>

          {/* Image Preview or Upload Buttons */}
          {imageUri ? (
            <Animated.View
              entering={ZoomIn.springify()}
              exiting={FadeOut}
              style={{ marginBottom: spacing.lg }}
            >
              <GlassCard variant="elevated">
                <Image
                  source={{ uri: imageUri }}
                  style={{
                    width: '100%',
                    height: imagePreviewHeight,
                    borderRadius: layout.radiusLg,
                  }}
                  resizeMode="cover"
                />
                <TouchableOpacity
                  onPress={handleRemovePhoto}
                  style={{
                    position: 'absolute',
                    top: spacing.sm,
                    right: spacing.sm,
                    backgroundColor: colors.error.main,
                    borderRadius: layout.radiusFull,
                    padding: spacing.sm,
                    ...shadows.md,
                  }}
                >
                  <MaterialCommunityIcons
                    name="close"
                    size={layout.iconMd}
                    color={colors.neutral.white}
                  />
                </TouchableOpacity>
              </GlassCard>
            </Animated.View>
          ) : (
            <View
              style={{
                flexDirection: 'row',
                gap: spacing.lg,
                marginBottom: spacing.xl,
              }}
            >
              <UploadCard
                icon="📷"
                label={t('take_photo')}
                onPress={handleTakePhoto}
                delay={200}
              />
              <UploadCard
                icon="🖼️"
                label={t('choose_from_gallery')}
                onPress={handleChooseFromGallery}
                delay={300}
              />
            </View>
          )}

          {/* Privacy Note */}
          <Animated.View entering={FadeInDown.delay(350).springify()}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: colors.primary[50],
                padding: spacing.md,
                borderRadius: layout.radiusMd,
                marginBottom: spacing.md,
              }}
            >
              <MaterialCommunityIcons
                name="shield-lock-outline"
                size={layout.iconLg}
                color={colors.primary[500]}
              />
              <Text
                style={[
                  typography.bodySmall,
                  { flex: 1, marginLeft: spacing.md, color: colors.text.secondary },
                ]}
              >
                {t('photo_privacy_note')}
              </Text>
            </View>
          </Animated.View>

          {/* Confirmation Checkbox */}
          <Animated.View entering={FadeInDown.delay(400).springify()}>
            <TouchableOpacity
              onPress={toggleConfirmed}
              style={{
                flexDirection: 'row',
                alignItems: 'flex-start',
                marginBottom: spacing.xl,
              }}
              activeOpacity={0.7}
            >
              <View
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: layout.radiusSm,
                  borderWidth: 2,
                  borderColor: confirmed ? colors.primary[500] : colors.neutral[300],
                  backgroundColor: confirmed ? colors.primary[500] : 'transparent',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: spacing.md,
                  marginTop: 2,
                }}
              >
                {confirmed && (
                  <MaterialCommunityIcons
                    name="check"
                    size={16}
                    color={colors.neutral.white}
                  />
                )}
              </View>
              <Text style={[typography.body, { flex: 1 }]}>
                {t('photo_confirm_checkbox')}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>

        {/* Fixed Bottom Buttons */}
        <View
          style={{
            flexDirection: 'row',
            gap: spacing.md,
            paddingHorizontal: spacing.screenPadding,
            paddingVertical: spacing.md,
            backgroundColor: colors.background.primary,
            borderTopWidth: 1,
            borderTopColor: colors.neutral[100],
          }}
        >
          <EnhancedButton
            title={t('back')}
            onPress={handleBack}
            variant="outline"
            style={{ flex: 1 }}
          />
          <EnhancedButton
            title={t('next')}
            onPress={handleNext}
            variant="primary"
            style={{ flex: 2 }}
          />
        </View>
      </SafeAreaView>
    </View>
  );
};

export default ReportPhotoScreen;
