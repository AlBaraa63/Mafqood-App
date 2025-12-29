/**
 * Report Type Select Screen
 * Step 1: Choose between lost or found item (on-brand layout)
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Card, Stepper } from '../../components/common';
import { useTranslation } from '../../hooks';
import { useReportFormStore } from '../../hooks/useStore';
import { ReportStackParamList } from '../../types';
import { colors, typography, spacing, borderRadius } from '../../theme';

type NavigationProp = NativeStackNavigationProp<ReportStackParamList, 'ReportTypeSelect'>;

export const ReportTypeSelectScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const { setType, resetForm } = useReportFormStore();
  
  React.useEffect(() => {
    // Reset form when entering this screen
    resetForm();
  }, []);
  
  const handleSelectType = (type: 'lost' | 'found') => {
    setType(type);
    navigation.navigate('ReportPhoto', { type });
  };
  
  return (
    <SafeAreaView className="flex-1 bg-background-primary" edges={['bottom']}>
      <View className="flex-1 px-4 md:px-6 py-4 md:py-6">
        <Stepper
          currentStep={1}
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
        
        <View className="mb-4 md:mb-6">
          <Text className="text-2xl md:text-3xl lg:text-4xl font-bold text-text-primary text-center mb-2">{t('report_type_title')}</Text>
          <Text className="text-sm md:text-base text-text-secondary text-center mb-6 md:mb-8">{t('report_intro_subtitle')}</Text>
        </View>
        
        <View className="gap-4 md:gap-6">
          <Card
            style={{alignItems: 'center', paddingVertical: spacing.xl}}
            variant="outlined"
            onPress={() => handleSelectType('lost')}
          >
            <View className="w-16 h-16 md:w-20 md:h-20 rounded-full items-center justify-center mb-3 md:mb-4" style={{backgroundColor: colors.primary[100]}}>
              <MaterialCommunityIcons name="alert-outline" size={28} color={colors.primary[500]} />
            </View>
            <Text className="text-base md:text-lg font-semibold text-text-primary mb-2">{t('report_type_lost')}</Text>
            <Text className="text-xs md:text-sm text-text-secondary text-center mb-2">{t('report_type_lost_desc')}</Text>
            <View className="flex-row items-center gap-2 mt-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full" style={{backgroundColor: colors.neutral[100]}}>
              <MaterialCommunityIcons name="arrow-right-bottom-bold" size={14} color={colors.primary[500]} />
              <Text className="text-xs text-text-secondary">{t('report_type_lost_hint')}</Text>
            </View>
          </Card>
          
          <Card
            style={{alignItems: 'center', paddingVertical: spacing.xl}}
            variant="outlined"
            onPress={() => handleSelectType('found')}
          >
            <View className="w-16 h-16 md:w-20 md:h-20 rounded-full items-center justify-center mb-3 md:mb-4" style={{backgroundColor: colors.accent[100]}}>
              <MaterialCommunityIcons name="hand-heart" size={28} color={colors.accent[600]} />
            </View>
            <Text className="text-base md:text-lg font-semibold text-text-primary mb-2">{t('report_type_found')}</Text>
            <Text className="text-xs md:text-sm text-text-secondary text-center mb-2">{t('report_type_found_desc')}</Text>
            <View className="flex-row items-center gap-2 mt-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full" style={{backgroundColor: colors.neutral[100]}}>
              <MaterialCommunityIcons name="arrow-right-bottom-bold" size={14} color={colors.accent[600]} />
              <Text className="text-xs text-text-secondary">{t('report_type_found_hint')}</Text>
            </View>
          </Card>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ReportTypeSelectScreen;
