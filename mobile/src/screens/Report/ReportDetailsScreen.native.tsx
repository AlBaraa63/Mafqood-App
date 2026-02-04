/**
 * Report Details Screen - Native Mobile Design
 * Step 3: Item details - category, title, description
 * Bottom sheet category picker, dynamic inputs, haptics
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  FadeIn,
  FadeInDown,
  SlideInDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

import { GlassCard, ProgressStepper, EnhancedButton, EnhancedInput } from '../../components/ui';
import { useTranslation, useHaptics, useDynamicStyles } from '../../hooks';
import { useReportFormStore } from '../../hooks/useStore';
import { ReportStackParamList, ItemCategory } from '../../types';
import { colors, shadows } from '../../theme';

type NavigationProp = NativeStackNavigationProp<ReportStackParamList, 'ReportDetails'>;
type RouteProps = RouteProp<ReportStackParamList, 'ReportDetails'>;

interface CategoryOption {
  value: ItemCategory;
  labelKey: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  color: string;
}

const categories: CategoryOption[] = [
  { value: 'phone', labelKey: 'category_phone', icon: 'cellphone', color: colors.primary[500] },
  { value: 'wallet', labelKey: 'category_wallet', icon: 'wallet', color: colors.accent[500] },
  { value: 'bag', labelKey: 'category_bag', icon: 'bag-personal-outline', color: colors.highlight[500] },
  { value: 'id', labelKey: 'category_id', icon: 'card-account-details-outline', color: colors.error.main },
  { value: 'jewelry', labelKey: 'category_jewelry', icon: 'ring', color: colors.warning.main },
  { value: 'electronics', labelKey: 'category_electronics', icon: 'laptop', color: colors.info.main },
  { value: 'keys', labelKey: 'category_keys', icon: 'key-variant', color: colors.success.main },
  { value: 'documents', labelKey: 'category_documents', icon: 'file-document-outline', color: colors.primary[600] },
  { value: 'other', labelKey: 'category_other', icon: 'dots-horizontal-circle-outline', color: colors.neutral[500] },
];

export const ReportDetailsScreen: React.FC = () => {
  const { t, isRTL } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { type, imageUri } = route.params;
  const { formData, setFormData } = useReportFormStore();
  const { typography, spacing, layout, isSmallDevice } = useDynamicStyles();
  const haptics = useHaptics();

  const [category, setCategory] = useState<ItemCategory | undefined>(formData.category);
  const [title, setTitle] = useState(formData.title);
  const [description, setDescription] = useState(formData.description);
  const [brand, setBrand] = useState(formData.brand || '');
  const [color, setColor] = useState(formData.color || '');
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const stepLabels = [
    t('step_label_type'),
    t('step_label_photo'),
    t('step_label_details'),
    t('step_label_where'),
    t('step_label_contact'),
    t('step_label_review'),
  ];

  const selectedCategory = categories.find(c => c.value === category);

  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};
    if (!category) newErrors.category = t('required_field');
    if (!title.trim()) newErrors.title = t('required_field');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [category, title, t]);

  const handleNext = useCallback(() => {
    if (!validate()) {
      haptics.error();
      return;
    }

    haptics.success();
    setFormData({ category, title, description, brand, color });
    navigation.navigate('ReportWhenWhere', {
      type,
      imageUri,
      details: { category, title, description, brand, color },
    });
  }, [validate, haptics, setFormData, category, title, description, brand, color, navigation, type, imageUri]);

  const handleBack = useCallback(() => {
    haptics.light();
    navigation.goBack();
  }, [navigation, haptics]);

  const handleSelectCategory = useCallback((cat: CategoryOption) => {
    haptics.selection();
    setCategory(cat.value);
    setShowCategoryPicker(false);
  }, [haptics]);

  const renderCategoryItem = useCallback(({ item, index }: { item: CategoryOption; index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 50).springify()}>
      <TouchableOpacity
        onPress={() => handleSelectCategory(item)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          padding: spacing.md,
          marginHorizontal: spacing.md,
          marginVertical: spacing.xs,
          borderRadius: layout.radiusLg,
          backgroundColor: category === item.value ? colors.primary[50] : 'transparent',
        }}
        activeOpacity={0.7}
      >
        <View
          style={{
            width: layout.avatarMd,
            height: layout.avatarMd,
            borderRadius: layout.avatarMd / 2,
            backgroundColor: item.color + '20',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: spacing.md,
          }}
        >
          <MaterialCommunityIcons name={item.icon} size={layout.iconMd} color={item.color} />
        </View>
        <Text style={[typography.body, { flex: 1, color: colors.text.primary }]}>
          {t(item.labelKey)}
        </Text>
        {category === item.value && (
          <MaterialCommunityIcons name="check-circle" size={layout.iconMd} color={colors.primary[500]} />
        )}
      </TouchableOpacity>
    </Animated.View>
  ), [category, handleSelectCategory, spacing, layout, typography, t]);

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
          <ProgressStepper currentStep={3} totalSteps={6} labels={stepLabels} />
        </View>

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{
              paddingHorizontal: spacing.screenPadding,
              paddingBottom: spacing.xl,
            }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
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
                    name="file-document-outline"
                    size={layout.iconMd}
                    color={colors.primary[500]}
                  />
                  <Text style={[typography.labelSmall, { marginLeft: spacing.xs, color: colors.primary[500] }]}>
                    {t('step_label_details')}
                  </Text>
                </View>
                <Text style={[typography.h2, { marginBottom: spacing.xs }]}>
                  {t('report_details_title')}
                </Text>
                <Text style={[typography.body, { color: colors.text.secondary }]}>
                  {t('report_details_subtitle')}
                </Text>
              </View>
            </Animated.View>

            {/* Helper Tip */}
            <Animated.View entering={FadeInDown.delay(150).springify()}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: colors.highlight[50],
                  padding: spacing.md,
                  borderRadius: layout.radiusMd,
                  marginBottom: spacing.lg,
                }}
              >
                <MaterialCommunityIcons
                  name="lightbulb-on-outline"
                  size={layout.iconMd}
                  color={colors.highlight[500]}
                />
                <Text
                  style={[
                    typography.bodySmall,
                    { flex: 1, marginLeft: spacing.md, color: colors.text.secondary },
                  ]}
                >
                  {t('report_details_helper')}
                </Text>
              </View>
            </Animated.View>

            {/* Category Selector */}
            <Animated.View entering={FadeInDown.delay(200).springify()}>
              <View style={{ marginBottom: spacing.md }}>
                <Text style={[typography.label, { marginBottom: spacing.sm }]}>
                  {t('category')}
                  <Text style={{ color: colors.error.main }}> *</Text>
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    haptics.light();
                    setShowCategoryPicker(true);
                  }}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    borderWidth: 1.5,
                    borderColor: errors.category ? colors.error.main : colors.neutral[200],
                    borderRadius: layout.radiusLg,
                    padding: spacing.md,
                    backgroundColor: colors.neutral.white,
                  }}
                  activeOpacity={0.7}
                >
                  {selectedCategory ? (
                    <>
                      <View
                        style={{
                          width: layout.avatarSm,
                          height: layout.avatarSm,
                          borderRadius: layout.avatarSm / 2,
                          backgroundColor: selectedCategory.color + '20',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: spacing.md,
                        }}
                      >
                        <MaterialCommunityIcons
                          name={selectedCategory.icon}
                          size={layout.iconSm}
                          color={selectedCategory.color}
                        />
                      </View>
                      <Text style={[typography.body, { flex: 1 }]}>
                        {t(selectedCategory.labelKey)}
                      </Text>
                    </>
                  ) : (
                    <Text style={[typography.body, { flex: 1, color: colors.neutral[400] }]}>
                      {t('select_category')}
                    </Text>
                  )}
                  <MaterialCommunityIcons
                    name="chevron-down"
                    size={layout.iconMd}
                    color={colors.text.tertiary}
                  />
                </TouchableOpacity>
                {errors.category && (
                  <Text style={[typography.caption, { color: colors.error.main, marginTop: spacing.xs }]}>
                    {errors.category}
                  </Text>
                )}
              </View>
            </Animated.View>

            {/* Title Input */}
            <Animated.View entering={FadeInDown.delay(250).springify()}>
              <EnhancedInput
                label={t('item_title')}
                placeholder={t('item_title_placeholder')}
                value={title}
                onChangeText={setTitle}
                error={errors.title}
              />
            </Animated.View>

            {/* Description Input */}
            <Animated.View entering={FadeInDown.delay(300).springify()}>
              <EnhancedInput
                label={t('item_description')}
                placeholder={t('item_description_placeholder')}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
              />
            </Animated.View>

            {/* Brand/Model Input */}
            <Animated.View entering={FadeInDown.delay(350).springify()}>
              <EnhancedInput
                label={t('brand_model')}
                placeholder={t('brand_model_placeholder')}
                value={brand}
                onChangeText={setBrand}
              />
            </Animated.View>

            {/* Colors Input */}
            <Animated.View entering={FadeInDown.delay(400).springify()}>
              <EnhancedInput
                label={t('colors')}
                placeholder={t('colors_placeholder')}
                value={color}
                onChangeText={setColor}
              />
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
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* Category Picker Bottom Sheet Modal */}
      <Modal
        visible={showCategoryPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCategoryPicker(false)}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'flex-end',
          }}
          activeOpacity={1}
          onPress={() => setShowCategoryPicker(false)}
        >
          <Animated.View
            entering={SlideInDown.springify()}
            style={{
              backgroundColor: colors.neutral.white,
              borderTopLeftRadius: layout.radiusXl,
              borderTopRightRadius: layout.radiusXl,
              maxHeight: '70%',
              ...shadows.lg,
            }}
          >
            {/* Handle Bar */}
            <View style={{ alignItems: 'center', paddingTop: spacing.sm }}>
              <View
                style={{
                  width: 40,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: colors.neutral[300],
                }}
              />
            </View>

            {/* Header */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: spacing.lg,
                borderBottomWidth: 1,
                borderBottomColor: colors.neutral[100],
              }}
            >
              <Text style={typography.h3}>{t('select_category')}</Text>
              <TouchableOpacity onPress={() => setShowCategoryPicker(false)}>
                <MaterialCommunityIcons
                  name="close"
                  size={layout.iconLg}
                  color={colors.text.secondary}
                />
              </TouchableOpacity>
            </View>

            {/* Category List */}
            <FlatList
              data={categories}
              renderItem={renderCategoryItem}
              keyExtractor={(item) => item.value}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingVertical: spacing.sm }}
            />
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default ReportDetailsScreen;
