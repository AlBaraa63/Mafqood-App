/**
 * Report Review Screen - Native Mobile Design
 * Step 6: Review all information and submit
 * Dynamic review cards, haptics, loading states
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp, CommonActions } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInDown, ZoomIn } from 'react-native-reanimated';

import { GlassCard, ProgressStepper, EnhancedButton } from '../../components/ui';
import { useTranslation, useFormatDate, useHaptics, useDynamicStyles } from '../../hooks';
import { useReportFormStore, useAuthStore } from '../../hooks/useStore';
import { ReportStackParamList, ItemFormData, ContactMethod, ItemCategory } from '../../types';
import { colors, shadows } from '../../theme';
import api from '../../api';

type NavigationProp = NativeStackNavigationProp<ReportStackParamList, 'ReportReview'>;
type RouteProps = RouteProp<ReportStackParamList, 'ReportReview'>;

const categoryLabels: Record<ItemCategory, string> = {
  phone: 'category_phone',
  wallet: 'category_wallet',
  bag: 'category_bag',
  id: 'category_id',
  jewelry: 'category_jewelry',
  electronics: 'category_electronics',
  keys: 'category_keys',
  documents: 'category_documents',
  other: 'category_other',
};

const contactMethodLabels: Record<ContactMethod, string> = {
  phone: 'contact_phone',
  email: 'contact_email',
  in_app: 'contact_in_app',
};

interface ReviewSectionProps {
  title: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  children: React.ReactNode;
  onEdit: () => void;
  delay: number;
}

const ReviewSection: React.FC<ReviewSectionProps> = ({
  title,
  icon,
  children,
  onEdit,
  delay,
}) => {
  const { t } = useTranslation();
  const { typography, spacing, layout } = useDynamicStyles();
  const haptics = useHaptics();

  const handleEdit = () => {
    haptics.light();
    onEdit();
  };

  return (
    <Animated.View entering={FadeInDown.delay(delay).springify()}>
      <GlassCard variant="elevated" style={{ marginBottom: spacing.md }}>
        <View style={{ padding: spacing.cardPadding }}>
          {/* Section Header */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: spacing.md,
              paddingBottom: spacing.sm,
              borderBottomWidth: 1,
              borderBottomColor: colors.neutral[100],
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MaterialCommunityIcons
                name={icon}
                size={layout.iconMd}
                color={colors.primary[500]}
              />
              <Text style={[typography.label, { marginLeft: spacing.sm }]}>{title}</Text>
            </View>
            <TouchableOpacity onPress={handleEdit}>
              <Text style={[typography.labelSmall, { color: colors.primary[500] }]}>
                {t('edit')}
              </Text>
            </TouchableOpacity>
          </View>
          {/* Section Content */}
          {children}
        </View>
      </GlassCard>
    </Animated.View>
  );
};

interface ReviewFieldProps {
  label: string;
  value: string | undefined;
  highlight?: boolean;
}

const ReviewField: React.FC<ReviewFieldProps> = ({ label, value, highlight }) => {
  const { typography, spacing } = useDynamicStyles();
  
  if (!value) return null;
  
  return (
    <View style={{ marginBottom: spacing.sm }}>
      <Text style={[typography.caption, { color: colors.text.tertiary }]}>{label}</Text>
      <Text
        style={[
          typography.body,
          highlight && { fontWeight: '600', color: colors.text.primary },
        ]}
      >
        {value}
      </Text>
    </View>
  );
};

export const ReportReviewScreen: React.FC = () => {
  const { t } = useTranslation();
  const { formatDateTime } = useFormatDate();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { formData } = route.params;
  const { resetForm } = useReportFormStore();
  const { token } = useAuthStore();
  const { typography, spacing, layout, isSmallDevice } = useDynamicStyles();
  const haptics = useHaptics();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const isLost = formData.type === 'lost';

  const stepLabels = [
    t('step_label_type'),
    t('step_label_photo'),
    t('step_label_details'),
    t('step_label_where'),
    t('step_label_contact'),
    t('step_label_review'),
  ];

  const handleEdit = useCallback((step: number) => {
    haptics.light();
    const stepScreens = [
      'ReportTypeSelect',
      'ReportPhoto',
      'ReportDetails',
      'ReportWhenWhere',
      'ReportContact',
    ];

    navigation.dispatch(
      CommonActions.navigate({
        name: stepScreens[step - 1] as any,
        params: step === 1 ? undefined : {
          type: formData.type,
          imageUri: formData.imageUri,
          details: formData,
        },
      })
    );
  }, [haptics, navigation, formData]);

  const handleSubmit = useCallback(async () => {
    haptics.medium();
    setIsSubmitting(true);

    try {
      const apiCall = isLost ? api.createLostItem : api.createFoundItem;
      const response = await apiCall(formData, token);

      if (response.success && response.data) {
        haptics.success();
        resetForm();
        navigation.navigate('ReportSuccess', {
          type: formData.type,
          item: response.data.item,
          matchCount: response.data.matches.length,
        });
      } else {
        haptics.error();
        Alert.alert(
          t('error_generic'),
          response.error || t('error_generic'),
          [{ text: t('retry'), onPress: () => setIsSubmitting(false) }]
        );
        setIsSubmitting(false);
      }
    } catch (error) {
      haptics.error();
      Alert.alert(
        t('error_generic'),
        t('error_generic'),
        [{ text: t('retry'), onPress: () => setIsSubmitting(false) }]
      );
      setIsSubmitting(false);
    }
  }, [haptics, isLost, formData, resetForm, navigation, t]);

  const handleBack = useCallback(() => {
    haptics.light();
    navigation.goBack();
  }, [navigation, haptics]);

  // Loading State
  if (isSubmitting) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background.primary }}>
        <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Animated.View entering={ZoomIn.springify()}>
            <View
              style={{
                backgroundColor: colors.neutral.white,
                borderRadius: layout.radiusXl,
                padding: spacing['2xl'],
                alignItems: 'center',
                ...shadows.lg,
              }}
            >
              <ActivityIndicator size="large" color={colors.primary[500]} />
              <Text style={[typography.body, { marginTop: spacing.lg, color: colors.text.secondary }]}>
                {t('loading')}
              </Text>
            </View>
          </Animated.View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background.secondary }}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background.secondary} />

      <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
        {/* Fixed Progress Stepper */}
        <View 
          style={{ 
            backgroundColor: colors.background.secondary,
            paddingHorizontal: spacing.screenPadding,
            paddingTop: spacing.md,
            borderBottomWidth: 1,
            borderBottomColor: colors.neutral[200],
          }}
        >
          <ProgressStepper currentStep={6} totalSteps={6} labels={stepLabels} />
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
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: spacing.sm,
                }}
              >
                <MaterialCommunityIcons
                  name="checkbox-marked-circle-outline"
                  size={layout.iconMd}
                  color={colors.success.main}
                />
                <Text style={[typography.labelSmall, { marginLeft: spacing.xs, color: colors.success.main }]}>
                  {t('step_label_review')}
                </Text>
              </View>
              <Text style={[typography.h2, { marginBottom: spacing.xs }]}>
                {t('report_review_title')}
              </Text>
              <Text style={[typography.body, { color: colors.text.secondary }]}>
                {t('report_review_subtitle')}
              </Text>
            </View>
          </Animated.View>

          {/* Type Section */}
          <ReviewSection
            title={t('type_label')}
            icon="tag-outline"
            onEdit={() => handleEdit(1)}
            delay={150}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View
                style={{
                  width: layout.avatarMd,
                  height: layout.avatarMd,
                  borderRadius: layout.avatarMd / 2,
                  backgroundColor: isLost ? colors.error.light : colors.success.light,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: spacing.md,
                }}
              >
                <MaterialCommunityIcons
                  name={isLost ? 'alert-circle-outline' : 'hand-heart'}
                  size={layout.iconLg}
                  color={isLost ? colors.error.main : colors.success.main}
                />
              </View>
              <Text style={typography.h4}>
                {isLost ? t('lost_item') : t('found_item')}
              </Text>
            </View>
          </ReviewSection>

          {/* Photo Section */}
          <ReviewSection
            title={t('report_photo_title')}
            icon="camera-outline"
            onEdit={() => handleEdit(2)}
            delay={200}
          >
            {formData.imageUri ? (
              <Image
                source={{ uri: formData.imageUri }}
                style={{
                  width: '100%',
                  height: isSmallDevice ? 200 : 260,
                  borderRadius: layout.radiusMd,
                }}
                resizeMode="cover"
              />
            ) : (
              <Text style={[typography.body, { color: colors.text.tertiary, fontStyle: 'italic' }]}>
                No photo added
              </Text>
            )}
          </ReviewSection>

          {/* Details Section */}
          <ReviewSection
            title={t('report_details_title')}
            icon="file-document-outline"
            onEdit={() => handleEdit(3)}
            delay={250}
          >
            <ReviewField
              label={t('category')}
              value={formData.category ? t(categoryLabels[formData.category]) : undefined}
            />
            <ReviewField label={t('item_title')} value={formData.title} highlight />
            <ReviewField label={t('item_description')} value={formData.description} />
            <ReviewField label={t('brand_model')} value={formData.brand} />
            <ReviewField label={t('colors')} value={formData.color} />
          </ReviewSection>

          {/* When & Where Section */}
          <ReviewSection
            title={t('report_when_where_title')}
            icon="map-marker-outline"
            onEdit={() => handleEdit(4)}
            delay={300}
          >
            <ReviewField label={t('date_time')} value={formatDateTime(formData.dateTime)} />
            <ReviewField label={t('location_area')} value={formData.location} highlight />
            <ReviewField label={t('location_detail')} value={formData.locationDetail} />
          </ReviewSection>

          {/* Contact Section */}
          <ReviewSection
            title={t('report_contact_title')}
            icon="account-circle-outline"
            onEdit={() => handleEdit(5)}
            delay={350}
          >
            <ReviewField
              label={t('preferred_contact')}
              value={t(contactMethodLabels[formData.contactMethod])}
            />
            {formData.contactPhone && (
              <ReviewField label={t('your_phone')} value={formData.contactPhone} />
            )}
            {formData.contactEmail && (
              <ReviewField label={t('your_email')} value={formData.contactEmail} />
            )}
          </ReviewSection>
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
            title={t('submit')}
            onPress={handleSubmit}
            variant="primary"
            style={{ flex: 2 }}
            loading={isSubmitting}
          />
        </View>
      </SafeAreaView>
    </View>
  );
};

export default ReportReviewScreen;
