/**
 * My Reports Screen - Native Mobile Design
 * Modern reports list with animated cards and dynamic styling
 */

import React, { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  Pressable,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeInDown,
  FadeIn,
  Layout,
} from 'react-native-reanimated';

import { GlassCard, StatusChip } from '../../components/ui';
import { TypeChip } from '../../components/common';
import { EmptyState, Loading } from '../../components/common';
import { useDynamicStyles, useTranslation, useFormatDate, useHaptics } from '../../hooks';
import { useAuthStore } from '../../hooks/useStore';
import { ProfileStackParamList, Item } from '../../types';
import api from '../../api';
import { colors } from '../../theme';

type NavigationProp = NativeStackNavigationProp<ProfileStackParamList, 'MyReports'>;

// Report Card Component
interface ReportCardProps {
  item: Item;
  index: number;
  onPress: () => void;
}

const ReportCard: React.FC<ReportCardProps> = ({ item, index, onPress }) => {
  const { typography, spacing, layout } = useDynamicStyles();
  const { t } = useTranslation();
  const { formatRelative } = useFormatDate();
  const haptics = useHaptics();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15 });
    haptics.light();
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 80).springify()}
      layout={Layout.springify()}
    >
      <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut} onPress={onPress}>
        <Animated.View style={animatedStyle}>
          <GlassCard variant="elevated" style={{ marginBottom: spacing.md }}>
            {/* Header Row */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: spacing.sm,
              }}
            >
              <TypeChip
                type={item.type}
                label={item.type === 'lost' ? t('lost_item') : t('found_item')}
              />
              <StatusChip
                status={item.status}
                label={t(`status_${item.status}`)}
              />
            </View>

            {/* Title */}
            <Text
              style={[typography.h4, { marginBottom: spacing.sm }]}
              numberOfLines={2}
            >
              {item.title}
            </Text>

            {/* Meta Info */}
            <View style={{ gap: spacing.xs }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                <MaterialCommunityIcons
                  name="map-marker-outline"
                  size={layout.iconSm}
                  color={colors.text.tertiary}
                />
                <Text
                  style={[typography.bodySmall, { color: colors.text.secondary, flex: 1 }]}
                  numberOfLines={1}
                >
                  {item.location}
                </Text>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                <MaterialCommunityIcons
                  name="clock-outline"
                  size={layout.iconSm}
                  color={colors.text.tertiary}
                />
                <Text style={[typography.bodySmall, { color: colors.text.secondary }]}>
                  {formatRelative(item.createdAt)}
                </Text>
              </View>
            </View>

            {/* Chevron */}
            <View
              style={{
                position: 'absolute',
                right: spacing.lg,
                top: '50%',
                marginTop: -layout.iconMd / 2,
              }}
            >
              <MaterialCommunityIcons
                name="chevron-right"
                size={layout.iconMd}
                color={colors.text.tertiary}
              />
            </View>
          </GlassCard>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
};

// Stats Header Component
const StatsHeader: React.FC<{ lostCount: number; foundCount: number }> = ({
  lostCount,
  foundCount,
}) => {
  const { typography, spacing, layout } = useDynamicStyles();
  const { t } = useTranslation();

  const StatItem = ({
    icon,
    count,
    label,
    bgColor,
    iconColor,
  }: {
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
    count: number;
    label: string;
    bgColor: string;
    iconColor: string;
  }) => (
    <View
      style={{
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        backgroundColor: bgColor,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        borderRadius: layout.radiusLg,
      }}
    >
      <View
        style={{
          width: layout.avatarSm,
          height: layout.avatarSm,
          borderRadius: layout.avatarSm / 2,
          backgroundColor: iconColor,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <MaterialCommunityIcons name={icon} size={layout.iconSm} color="white" />
      </View>
      <View>
        <Text style={[typography.h3, { color: iconColor }]}>{count}</Text>
        <Text style={[typography.caption, { color: colors.text.secondary }]}>{label}</Text>
      </View>
    </View>
  );

  return (
    <Animated.View
      entering={FadeIn.delay(100)}
      style={{ flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg }}
    >
      <StatItem
        icon="magnify"
        count={lostCount}
        label={t('lost_reports')}
        bgColor={colors.error.light}
        iconColor={colors.error.main}
      />
      <StatItem
        icon="check-circle"
        count={foundCount}
        label={t('found_reports')}
        bgColor={colors.success.light}
        iconColor={colors.success.main}
      />
    </Animated.View>
  );
};

export const MyReportsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { t } = useTranslation();
  const { typography, spacing } = useDynamicStyles();
  const { isGuest } = useAuthStore();
  const haptics = useHaptics();

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['myItems'],
    queryFn: api.getMyItems,
    enabled: !isGuest,
  });

  const reports: Item[] =
    data?.success && data.data
      ? [
          ...data.data.lostItems.map((g) => g.item),
          ...data.data.foundItems.map((g) => g.item),
        ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      : [];

  const lostCount = data?.success && data.data ? data.data.lostItems.length : 0;
  const foundCount = data?.success && data.data ? data.data.foundItems.length : 0;

  const handleRefresh = useCallback(() => {
    haptics.light();
    refetch();
  }, [haptics, refetch]);

  const handleReportPress = useCallback(
    (itemId: string) => {
      haptics.light();
      navigation.navigate('ReportDetail', { itemId });
    },
    [haptics, navigation]
  );

  const renderItem = useCallback(
    ({ item, index }: { item: Item; index: number }) => (
      <ReportCard item={item} index={index} onPress={() => handleReportPress(item.id)} />
    ),
    [handleReportPress]
  );

  if (isGuest) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: colors.background.secondary }}
        edges={['top']}
      >
        <StatusBar barStyle="dark-content" backgroundColor={colors.background.secondary} />
        <EmptyState
          icon="🔒"
          title={t('guest_cannot_report')}
          description={t('guest_mode_limited')}
        />
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: colors.background.secondary }}
        edges={['top']}
      >
        <StatusBar barStyle="dark-content" backgroundColor={colors.background.secondary} />
        <Loading text={t('loading')} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.secondary }} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background.secondary} />

      <FlatList
        data={reports}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{
          paddingHorizontal: spacing.screenPadding,
          paddingTop: spacing.md,
          paddingBottom: spacing['4xl'],
        }}
        ListHeaderComponent={
          <View>
            <Animated.View entering={FadeInDown.springify()}>
              <Text style={[typography.h2, { marginBottom: spacing.xs }]}>
                {t('my_reports_title')}
              </Text>
              <Text
                style={[
                  typography.body,
                  { color: colors.text.secondary, marginBottom: spacing.lg },
                ]}
              >
                {reports.length} {t('total_reports')}
              </Text>
            </Animated.View>

            {reports.length > 0 && <StatsHeader lostCount={lostCount} foundCount={foundCount} />}
          </View>
        }
        ListEmptyComponent={
          <Animated.View entering={FadeIn.delay(200)}>
            <EmptyState
              icon="📋"
              title={t('my_reports_empty')}
              description={t('app_tagline')}
            />
          </Animated.View>
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={handleRefresh}
            colors={[colors.primary[500]]}
            tintColor={colors.primary[500]}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

export default MyReportsScreen;
