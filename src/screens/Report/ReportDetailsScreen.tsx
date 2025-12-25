/**
 * Report Details Screen
 * Step 3: Item details - category, title, description (modern card layout)
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button, Input, Stepper, Card } from '../../components/common';
import { useTranslation } from '../../hooks';
import { useReportFormStore } from '../../hooks/useStore';
import { ReportStackParamList, ItemCategory } from '../../types';
import { colors, typography, spacing, borderRadius } from '../../theme';

type NavigationProp = NativeStackNavigationProp<ReportStackParamList, 'ReportDetails'>;
type RouteProps = RouteProp<ReportStackParamList, 'ReportDetails'>;

interface CategoryOption {
  value: ItemCategory;
  labelKey: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
}

const categories: CategoryOption[] = [
  { value: 'phone', labelKey: 'category_phone', icon: 'cellphone' },
  { value: 'wallet', labelKey: 'category_wallet', icon: 'wallet' },
  { value: 'bag', labelKey: 'category_bag', icon: 'bag-personal-outline' },
  { value: 'id', labelKey: 'category_id', icon: 'card-account-details-outline' },
  { value: 'jewelry', labelKey: 'category_jewelry', icon: 'ring' },
  { value: 'electronics', labelKey: 'category_electronics', icon: 'laptop' },
  { value: 'keys', labelKey: 'category_keys', icon: 'key-variant' },
  { value: 'documents', labelKey: 'category_documents', icon: 'file-document-outline' },
  { value: 'other', labelKey: 'category_other', icon: 'dots-horizontal-circle-outline' },
];

export const ReportDetailsScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { type, imageUri } = route.params;
  const { formData, setFormData } = useReportFormStore();
  
  const [category, setCategory] = useState<ItemCategory | undefined>(formData.category);
  const [title, setTitle] = useState(formData.title);
  const [description, setDescription] = useState(formData.description);
  const [brand, setBrand] = useState(formData.brand || '');
  const [color, setColor] = useState(formData.color || '');
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!category) newErrors.category = t('required_field');
    if (!title.trim()) newErrors.title = t('required_field');
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleNext = () => {
    if (!validate()) return;
    
    setFormData({
      category,
      title,
      description,
      brand,
      color,
    });
    
    navigation.navigate('ReportWhenWhere', {
      type,
      imageUri,
      details: { category, title, description, brand, color },
    });
  };
  
  const selectedCategory = categories.find(c => c.value === category);
  
  const renderCategoryItem = ({ item }: { item: CategoryOption }) => (
    <TouchableOpacity
      style={[
        styles.categoryItem,
        category === item.value && styles.categoryItemSelected,
      ]}
      onPress={() => {
        setCategory(item.value);
        setShowCategoryPicker(false);
      }}
      activeOpacity={0.85}
    >
      <View style={styles.categoryIconBubble}>
        <MaterialCommunityIcons name={item.icon} size={20} color={colors.text.primary} />
      </View>
      <Text style={[
        styles.categoryItemText,
        category === item.value && styles.categoryItemTextSelected,
      ]}>
        {t(item.labelKey)}
      </Text>
      {category === item.value && (
        <MaterialCommunityIcons name="check-circle" size={18} color={colors.accent[600]} />
      )}
    </TouchableOpacity>
  );
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Stepper
          currentStep={3}
          totalSteps={6}
          labels={[
            t('step_label_type'),
            t('step_label_photo'),
            t('step_label_details'),
            t('step_label_where'),
            t('step_label_contact'),
            t('step_label_review'),
          ]}
        />
        
        <Card style={styles.card} variant="outlined">
          <View style={styles.header}>
            <View style={styles.stepBadge}>
              <MaterialCommunityIcons name="file-document-outline" size={18} color={colors.primary[500]} />
              <Text style={styles.stepBadgeText}>{t('step_label_details')}</Text>
            </View>
            <Text style={styles.title}>{t('report_details_title')}</Text>
            <Text style={styles.subtitle}>{t('report_details_subtitle')}</Text>
            <View style={styles.helper}>
              <MaterialCommunityIcons name="lightbulb-on-outline" size={18} color={colors.highlight[500]} />
              <Text style={styles.helperText}>{t('report_details_helper')}</Text>
            </View>
          </View>
          
          {/* Category Selector */}
          <View style={styles.field}>
            <Text style={styles.label}>
              {t('category')}
              <Text style={styles.required}> *</Text>
            </Text>
            <TouchableOpacity
              style={[
                styles.categorySelector,
                errors.category && styles.categorySelectorError,
              ]}
              onPress={() => setShowCategoryPicker(true)}
              activeOpacity={0.85}
            >
              {selectedCategory ? (
                <>
                  <View style={styles.categorySelectedBubble}>
                    <MaterialCommunityIcons name={selectedCategory.icon} size={18} color={colors.primary[600]} />
                  </View>
                  <Text style={styles.categorySelectorText}>{t(selectedCategory.labelKey)}</Text>
                </>
              ) : (
                <Text style={styles.categorySelectorPlaceholder}>{t('select_category')}</Text>
              )}
              <MaterialCommunityIcons name="chevron-down" size={18} color={colors.text.tertiary} />
            </TouchableOpacity>
            {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}
          </View>
          
          {/* Title */}
          <Input
            label={t('item_title')}
            placeholder={t('item_title_placeholder')}
            value={title}
            onChangeText={setTitle}
            error={errors.title}
            required
          />
          
          {/* Description */}
          <Input
            label={t('item_description')}
            placeholder={t('item_description_placeholder')}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />
          
          {/* Brand/Model */}
          <Input
            label={t('brand_model')}
            placeholder={t('brand_model_placeholder')}
            value={brand}
            onChangeText={setBrand}
          />
          
          {/* Colors */}
          <Input
            label={t('colors')}
            placeholder={t('colors_placeholder')}
            value={color}
            onChangeText={setColor}
          />
          
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
        </Card>
      </ScrollView>
      
      {/* Category Picker Modal */}
      <Modal
        visible={showCategoryPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCategoryPicker(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowCategoryPicker(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('select_category')}</Text>
              <TouchableOpacity onPress={() => setShowCategoryPicker(false)}>
                <MaterialCommunityIcons name="close" size={20} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={categories}
              renderItem={renderCategoryItem}
              keyExtractor={(item) => item.value}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  card: {
    gap: spacing.lg,
  },
  header: {
    gap: spacing.sm,
  },
  stepBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.neutral[100],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  stepBadgeText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.medium,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
  },
  helper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.highlight[50],
    padding: spacing.sm,
    borderRadius: borderRadius.lg,
  },
  helperText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  field: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  required: {
    color: colors.error.main,
  },
  categorySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.neutral[200],
    borderRadius: borderRadius['2xl'],
    padding: spacing.md,
    backgroundColor: colors.neutral.white,
    gap: spacing.sm,
  },
  categorySelectorError: {
    borderColor: colors.error.main,
  },
  categorySelectedBubble: {
    width: 34,
    height: 34,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  categorySelectorText: {
    flex: 1,
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
  },
  categorySelectorPlaceholder: {
    flex: 1,
    fontSize: typography.fontSize.md,
    color: colors.neutral[400],
  },
  errorText: {
    fontSize: typography.fontSize.sm,
    color: colors.error.main,
    marginTop: spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  backButton: {
    flex: 1,
  },
  nextButton: {
    flex: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.neutral.white,
    borderTopLeftRadius: borderRadius['2xl'],
    borderTopRightRadius: borderRadius['2xl'],
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  modalTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
    gap: spacing.md,
  },
  categoryItemSelected: {
    backgroundColor: colors.accent[50],
  },
  categoryIconBubble: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    backgroundColor: colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryItemText: {
    flex: 1,
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
  },
  categoryItemTextSelected: {
    color: colors.accent[700],
    fontWeight: typography.fontWeight.medium,
  },
});

export default ReportDetailsScreen;
