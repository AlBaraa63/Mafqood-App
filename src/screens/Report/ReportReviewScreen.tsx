/**
 * Report Review Screen
 * Step 6: Review all information and submit
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp, CommonActions } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button, Stepper, Loading } from '../../components/common';
import { useTranslation, useFormatDate } from '../../hooks';
import { useReportFormStore } from '../../hooks/useStore';
import { ReportStackParamList, ItemFormData, ContactMethod, ItemCategory } from '../../types';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
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

export const ReportReviewScreen: React.FC = () => {
  const { t } = useTranslation();
  const { formatDateTime } = useFormatDate();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { formData } = route.params;
  const { resetForm } = useReportFormStore();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const isLost = formData.type === 'lost';
  
  const handleEdit = (step: number) => {
    // Navigate back to the specific step
    const stepScreens = [
      'ReportTypeSelect',
      'ReportPhoto',
      'ReportDetails',
      'ReportWhenWhere',
      'ReportContact',
    ];
    
    // Pop back to the desired screen
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
  };
  
  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      const apiCall = isLost ? api.createLostItem : api.createFoundItem;
      const response = await apiCall(formData);
      
      if (response.success && response.data) {
        resetForm();
        navigation.navigate('ReportSuccess', {
          type: formData.type,
          item: response.data.item,
          matchCount: response.data.matches.length,
        });
      } else {
        Alert.alert(
          t('error_generic'),
          response.error || t('error_generic'),
          [{ text: t('retry'), onPress: () => setIsSubmitting(false) }]
        );
        setIsSubmitting(false);
      }
    } catch (error) {
      Alert.alert(
        t('error_generic'),
        t('error_generic'),
        [{ text: t('retry'), onPress: () => setIsSubmitting(false) }]
      );
      setIsSubmitting(false);
    }
  };
  
  const renderSection = (
    title: string,
    content: React.ReactNode,
    step: number
  ) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <TouchableOpacity onPress={() => handleEdit(step)}>
          <Text style={styles.editButton}>{t('edit')}</Text>
        </TouchableOpacity>
      </View>
      {content}
    </View>
  );
  
  const renderField = (label: string, value: string | undefined, highlight?: boolean) => {
    if (!value) return null;
    return (
      <View style={styles.field}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <Text style={[styles.fieldValue, highlight && styles.fieldValueHighlight]}>
          {value}
        </Text>
      </View>
    );
  };
  
  if (isSubmitting) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Loading size="large" text={t('loading')} />
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Stepper currentStep={6} totalSteps={6} />
        
        <View style={styles.header}>
          <Text style={styles.title}>{t('report_review_title')}</Text>
          <Text style={styles.subtitle}>{t('report_review_subtitle')}</Text>
        </View>
        
        {/* Type Section */}
        {renderSection(
          t('type_label'),
          <View style={styles.typeContainer}>
            <Text style={styles.typeEmoji}>{isLost ? '🔍' : '📦'}</Text>
            <Text style={styles.typeText}>
              {isLost ? t('lost_item') : t('found_item')}
            </Text>
          </View>,
          1
        )}
        
        {/* Photo Section */}
        {renderSection(
          t('report_photo_title'),
          formData.imageUri ? (
            <Image source={{ uri: formData.imageUri }} style={styles.previewImage} />
          ) : (
            <Text style={styles.noPhotoText}>No photo added</Text>
          ),
          2
        )}
        
        {/* Details Section */}
        {renderSection(
          t('report_details_title'),
          <View>
            {renderField(t('category'), formData.category ? t(categoryLabels[formData.category]) : undefined)}
            {renderField(t('item_title'), formData.title, true)}
            {renderField(t('item_description'), formData.description)}
            {renderField(t('brand_model'), formData.brand)}
            {renderField(t('colors'), formData.color)}
          </View>,
          3
        )}
        
        {/* When & Where Section */}
        {renderSection(
          t('report_when_where_title'),
          <View>
            {renderField(t('date_time'), formatDateTime(formData.dateTime))}
            {renderField(t('location_area'), formData.location, true)}
            {renderField(t('location_detail'), formData.locationDetail)}
          </View>,
          4
        )}
        
        {/* Contact Section */}
        {renderSection(
          t('report_contact_title'),
          <View>
            {renderField(t('preferred_contact'), t(contactMethodLabels[formData.contactMethod]))}
            {formData.contactPhone && renderField(t('your_phone'), formData.contactPhone)}
            {formData.contactEmail && renderField(t('your_email'), formData.contactEmail)}
          </View>,
          5
        )}
        
        {/* Submit Button */}
        <View style={styles.footer}>
          <Button
            title={t('back')}
            onPress={() => navigation.goBack()}
            variant="outline"
            style={styles.backButton}
          />
          <Button
            title={t('submit')}
            onPress={handleSubmit}
            style={styles.submitButton}
            loading={isSubmitting}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
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
  section: {
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  sectionTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  editButton: {
    fontSize: typography.fontSize.sm,
    color: colors.primary[500],
    fontWeight: typography.fontWeight.medium,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeEmoji: {
    fontSize: 24,
    marginRight: spacing.sm,
  },
  typeText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: borderRadius.md,
    backgroundColor: colors.neutral[200],
  },
  noPhotoText: {
    fontSize: typography.fontSize.md,
    color: colors.text.tertiary,
    fontStyle: 'italic',
  },
  field: {
    marginBottom: spacing.sm,
  },
  fieldLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    marginBottom: spacing.xs,
  },
  fieldValue: {
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
  },
  fieldValueHighlight: {
    fontWeight: typography.fontWeight.medium,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  backButton: {
    flex: 1,
  },
  submitButton: {
    flex: 2,
  },
});

export default ReportReviewScreen;
