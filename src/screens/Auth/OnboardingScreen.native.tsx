/**
 * Onboarding Screen - Native Mobile Design
 * Modern intro with animated slides and haptics
 */

import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  Dimensions,
  FlatList,
  TouchableOpacity,
  StatusBar,
  ViewToken,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  interpolate,
  useAnimatedScrollHandler,
  FadeIn,
  FadeInDown,
  FadeInUp,
  ZoomIn,
  SharedValue,
} from 'react-native-reanimated';

import { AuthStackParamList } from '../../types';
import { EnhancedButton } from '../../components/ui';
import { useDynamicStyles, useTranslation, useHaptics } from '../../hooks';
import { useOnboardingStore, useAuthStore, useLanguageStore } from '../../hooks/useStore';
import { colors } from '../../theme';

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
  color: string;
}

const slides: OnboardingSlide[] = [
  {
    id: '1',
    icon: '🔍',
    titleKey: 'onboarding_title_1',
    descKey: 'onboarding_desc_1',
    color: colors.primary[500],
  },
  {
    id: '2',
    icon: '📦',
    titleKey: 'onboarding_title_2',
    descKey: 'onboarding_desc_2',
    color: colors.accent[500],
  },
  {
    id: '3',
    icon: '🤖',
    titleKey: 'onboarding_title_3',
    descKey: 'onboarding_desc_3',
    color: colors.highlight[500],
  },
];

// Animated Slide Component
const Slide: React.FC<{
  item: OnboardingSlide;
  index: number;
  scrollX: SharedValue<number>;
}> = ({ item, index, scrollX }) => {
  const { typography, spacing, layout } = useDynamicStyles();
  const { t } = useTranslation();

  const animatedStyle = useAnimatedStyle(() => {
    const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
    const scale = interpolate(scrollX.value, inputRange, [0.8, 1, 0.8], 'clamp');
    const opacity = interpolate(scrollX.value, inputRange, [0.5, 1, 0.5], 'clamp');

    return {
      transform: [{ scale }],
      opacity,
    };
  });

  return (
    <View
      style={{
        width,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: spacing['2xl'],
      }}
    >
      <Animated.View style={animatedStyle}>
        {/* Icon Container */}
        <View
          style={{
            width: layout.avatarLg * 2.5,
            height: layout.avatarLg * 2.5,
            borderRadius: layout.avatarLg * 1.25,
            backgroundColor: `${item.color}15`,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: spacing['2xl'],
            alignSelf: 'center',
          }}
        >
          <Text style={{ fontSize: layout.iconXl * 1.5 }}>{item.icon}</Text>
        </View>

        {/* Title */}
        <Text
          style={[
            typography.h1,
            {
              textAlign: 'center',
              marginBottom: spacing.md,
              color: colors.text.primary,
            },
          ]}
        >
          {t(item.titleKey)}
        </Text>

        {/* Description */}
        <Text
          style={[
            typography.body,
            {
              textAlign: 'center',
              color: colors.text.secondary,
              lineHeight: 24,
            },
          ]}
        >
          {t(item.descKey)}
        </Text>
      </Animated.View>
    </View>
  );
};

// Pagination Dot Component
const PaginationDot: React.FC<{
  index: number;
  scrollX: SharedValue<number>;
}> = ({ index, scrollX }) => {
  const { spacing, layout } = useDynamicStyles();

  const animatedStyle = useAnimatedStyle(() => {
    const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
    const dotWidth = interpolate(scrollX.value, inputRange, [8, 24, 8], 'clamp');
    const opacity = interpolate(scrollX.value, inputRange, [0.3, 1, 0.3], 'clamp');

    return {
      width: dotWidth,
      opacity,
      backgroundColor: colors.primary[500],
    };
  });

  return (
    <Animated.View
      style={[
        {
          height: 8,
          borderRadius: 4,
          marginHorizontal: spacing.xs / 2,
        },
        animatedStyle,
      ]}
    />
  );
};

export const OnboardingScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguageStore();
  const { setHasSeenOnboarding } = useOnboardingStore();
  const { loginAsGuest } = useAuthStore();
  const { typography, spacing, layout } = useDynamicStyles();
  const haptics = useHaptics();

  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  const handleGetStarted = useCallback(async () => {
    haptics.success();
    await setHasSeenOnboarding(true);
    navigation.navigate('Login');
  }, [haptics, setHasSeenOnboarding, navigation]);

  const handleContinueAsGuest = useCallback(async () => {
    haptics.medium();
    await setHasSeenOnboarding(true);
    loginAsGuest();
  }, [haptics, setHasSeenOnboarding, loginAsGuest]);

  const handleLanguageToggle = useCallback(() => {
    haptics.selection();
    setLanguage(language === 'en' ? 'ar' : 'en');
  }, [haptics, language, setLanguage]);

  const handleNext = useCallback(() => {
    haptics.light();
    if (currentIndex < slides.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex); // Update state immediately
      flatListRef.current?.scrollToOffset({ offset: nextIndex * width, animated: true });
    }
  }, [haptics, currentIndex]);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setCurrentIndex(viewableItems[0].index);
      }
    }
  ).current;

  const isLastSlide = currentIndex === slides.length - 1;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.primary }} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background.primary} />

      {/* Header with Language Toggle */}
      <Animated.View
        entering={FadeIn.delay(200)}
        style={{
          flexDirection: 'row',
          justifyContent: 'flex-end',
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.sm,
        }}
      >
        <TouchableOpacity
          onPress={handleLanguageToggle}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.xs,
            backgroundColor: colors.neutral[100],
            paddingVertical: spacing.sm,
            paddingHorizontal: spacing.md,
            borderRadius: layout.radiusFull,
          }}
        >
          <MaterialCommunityIcons name="earth" size={layout.iconSm} color={colors.text.secondary} />
          <Text style={[typography.labelSmall, { color: colors.text.primary }]}>
            {language === 'en' ? 'عربي' : 'English'}
          </Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Slides */}
      <Animated.FlatList
        ref={flatListRef}
        data={slides}
        renderItem={({ item, index }) => (
          <Slide item={item} index={index} scrollX={scrollX} />
        )}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
        keyExtractor={(item) => item.id}
        style={{ flex: 1 }}
      />

      {/* Pagination */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          paddingVertical: spacing.lg,
        }}
      >
        {slides.map((_, index) => (
          <PaginationDot key={index} index={index} scrollX={scrollX} />
        ))}
      </View>

      {/* Buttons */}
      <Animated.View
        entering={FadeInUp.delay(300).springify()}
        style={{
          paddingHorizontal: spacing.xl,
          paddingBottom: spacing.lg,
          gap: spacing.md,
        }}
      >
        {!isLastSlide ? (
          <EnhancedButton
            title={t('next')}
            onPress={handleNext}
            variant="primary"
            size="large"
            icon="→"
          />
        ) : (
          <>
            <EnhancedButton
              title={t('get_started')}
              onPress={handleGetStarted}
              variant="primary"
              size="large"
              icon="🚀"
            />
            <EnhancedButton
              title={t('continue_as_guest')}
              onPress={handleContinueAsGuest}
              variant="ghost"
              size="large"
              icon="👤"
            />
          </>
        )}
      </Animated.View>

      {/* App Name */}
      <Animated.View entering={FadeIn.delay(400)}>
        <Text
          style={[
            typography.h3,
            {
              textAlign: 'center',
              color: colors.primary[500],
              paddingBottom: spacing.lg,
            },
          ]}
        >
          {t('app_name')}
        </Text>
      </Animated.View>
    </SafeAreaView>
  );
};

export default OnboardingScreen;
