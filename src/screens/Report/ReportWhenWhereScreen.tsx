/**
 * Report When & Where Screen
 * Step 4: Date, time and location information
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button, Input, Stepper } from '../../components/common';
import { useTranslation } from '../../hooks';
import { useReportFormStore } from '../../hooks/useStore';
import { ReportStackParamList } from '../../types';
import { colors, typography, spacing } from '../../theme';

type NavigationProp = NativeStackNavigationProp<ReportStackParamList, 'ReportWhenWhere'>;
type RouteProps = RouteProp<ReportStackParamList, 'ReportWhenWhere'>;

export const ReportWhenWhereScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { type, imageUri, details } = route.params;
  const { formData, setFormData } = useReportFormStore();
  
  // Format initial date for display
  const formatDateForInput = (isoString: string): string => {
    const date = new Date(isoString);
    return date.toLocaleString('en-AE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  const [dateTime, setDateTime] = useState(
    formData.dateTime ? formatDateForInput(formData.dateTime) : formatDateForInput(new Date().toISOString())
  );
  const [location, setLocation] = useState(formData.location || '');
  const [locationDetail, setLocationDetail] = useState(formData.locationDetail || '');
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const isLost = type === 'lost';
  
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!dateTime.trim()) newErrors.dateTime = t('required_field');
    if (!location.trim()) newErrors.location = t('required_field');
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleNext = () => {
    if (!validate()) return;
    
    // Store date as ISO string (for now using current date, will be enhanced with date picker)
    setFormData({
      dateTime: new Date().toISOString(), // TODO: Parse dateTime input properly when date picker is added
      location,
      locationDetail,
    });
    
    navigation.navigate('ReportContact', {
      type,
      imageUri,
      details: {
        ...details,
        dateTime: new Date().toISOString(),
        location,
        locationDetail,
      },
    });
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Stepper currentStep={4} totalSteps={6} />
        
        <View style={styles.header}>
          <Text style={styles.title}>{t('report_when_where_title')}</Text>
          <Text style={styles.subtitle}>
            {isLost ? t('report_when_where_lost_subtitle') : t('report_when_where_found_subtitle')}
          </Text>
        </View>
        
        {/* Date & Time Input */}
        {/* TODO: Replace with proper date/time picker component */}
        <Input
          label={t('date_time')}
          placeholder={t('select_date_time')}
          value={dateTime}
          onChangeText={setDateTime}
          error={errors.dateTime}
          required
        />
        
        {/* Location / Area */}
        <Input
          label={t('location_area')}
          placeholder={t('location_area_placeholder')}
          value={location}
          onChangeText={setLocation}
          error={errors.location}
          required
        />
        
        {/* Specific Location */}
        <Input
          label={t('location_detail')}
          placeholder={t('location_detail_placeholder')}
          value={locationDetail}
          onChangeText={setLocationDetail}
          multiline
          numberOfLines={2}
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
      </ScrollView>
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
  footer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  backButton: {
    flex: 1,
  },
  nextButton: {
    flex: 2,
  },
});

export default ReportWhenWhereScreen;
