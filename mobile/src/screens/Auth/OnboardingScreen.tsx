/**
 * Onboarding Screen
 * First-time user introduction to the app
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types';
import { Button } from '../../components/common';
import { useTranslation } from '../../hooks';
import { useOnboardingStore, useAuthStore, useLanguageStore } from '../../hooks/useStore';
import { colors, typography, spacing } from '../../theme';

const { width } = Dimensions.get('window');

type OnboardingScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Onboarding'>;

interface Props {
  navigation: OnboardingScreenNavigationProp;
}

interface OnboardingSlide {
  id: string;
  icon: string;
  titleKey: string;
  descKey: string;
}

const slides: OnboardingSlide[] = [
  {
    id: '1',
    icon: '🔍',
    titleKey: 'onboarding_title_1',
    descKey: 'onboarding_desc_1',
  },
  {
    id: '2',
    icon: '📦',
    titleKey: 'onboarding_title_2',
    descKey: 'onboarding_desc_2',
  },
  {
    id: '3',
    icon: '🤖',
    titleKey: 'onboarding_title_3',
    descKey: 'onboarding_desc_3',
  },
];

export const OnboardingScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguageStore();
  const { setHasSeenOnboarding } = useOnboardingStore();
  const { loginAsGuest } = useAuthStore();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  
  const handleGetStarted = async () => {
    await setHasSeenOnboarding(true);
    navigation.navigate('Login');
  };
  
  const handleContinueAsGuest = async () => {
    await setHasSeenOnboarding(true);
    loginAsGuest();
    // Navigation will be handled by the root navigator
  };
  
  const handleLanguageToggle = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };
  
  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      // Use scrollToOffset for web compatibility (scrollToIndex doesn't work reliably on web)
      flatListRef.current?.scrollToOffset({ offset: nextIndex * width, animated: true });
    }
  };
  
  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0) {
        setCurrentIndex(viewableItems[0].index || 0);
      }
    }
  ).current;
  
  const renderSlide = ({ item }: { item: OnboardingSlide }) => (
    <View style={styles.slide}>
      <Text style={styles.icon}>{item.icon}</Text>
      <Text style={styles.title}>{t(item.titleKey)}</Text>
      <Text style={styles.description}>{t(item.descKey)}</Text>
    </View>
  );
  
  const renderPagination = () => (
    <View style={styles.pagination}>
      {slides.map((_, index) => (
        <View
          key={index}
          style={[
            styles.paginationDot,
            index === currentIndex && styles.paginationDotActive,
          ]}
        />
      ))}
    </View>
  );
  
  return (
    <SafeAreaView style={styles.container}>
      {/* Language Toggle */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.languageButton} onPress={handleLanguageToggle}>
          <Text style={styles.languageText}>
            {language === 'en' ? 'عربي' : 'English'}
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
        keyExtractor={(item) => item.id}
      />
      
      {/* Pagination */}
      {renderPagination()}
      
      {/* Buttons */}
      <View style={styles.footer}>
        {currentIndex < slides.length - 1 ? (
          <Button title={t('next')} onPress={handleNext} fullWidth />
        ) : (
          <>
            <Button
              title={t('get_started')}
              onPress={handleGetStarted}
              fullWidth
            />
            <Button
              title={t('continue_as_guest')}
              onPress={handleContinueAsGuest}
              variant="ghost"
              fullWidth
              style={styles.guestButton}
            />
          </>
        )}
      </View>
      
      {/* App Name */}
      <Text style={styles.appName}>{t('app_name')}</Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: spacing.lg,
  },
  languageButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    backgroundColor: colors.neutral[100],
  },
  languageText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
  },
  slide: {
    width: width,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing['2xl'],
  },
  icon: {
    fontSize: 80,
    marginBottom: spacing['2xl'],
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  description: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.neutral[300],
    marginHorizontal: spacing.xs,
  },
  paginationDotActive: {
    backgroundColor: colors.primary[500],
    width: 24,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  guestButton: {
    marginTop: spacing.sm,
  },
  appName: {
    textAlign: 'center',
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary[500],
    paddingBottom: spacing.lg,
  },
});

export default OnboardingScreen;
