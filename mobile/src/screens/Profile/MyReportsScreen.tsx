/**
 * My Reports Screen
 * Modern list of user reports with chips
 */

import React from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Card, StatusChip, TypeChip, EmptyState, Loading, SectionHeader } from '../../components/common';
import { useTranslation, useFormatDate } from '../../hooks';
import { useAuthStore } from '../../hooks/useStore';
import { ProfileStackParamList, Item } from '../../types';
import api from '../../api';
import { colors, typography, spacing, borderRadius } from '../../theme';

type NavigationProp = NativeStackNavigationProp<ProfileStackParamList, 'MyReports'>;

export const MyReportsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { t } = useTranslation();
  const { formatRelative } = useFormatDate();
  const { isGuest } = useAuthStore();

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

  const renderReport = ({ item }: { item: Item }) => (
    <TouchableOpacity onPress={() => navigation.navigate('ReportDetail', { itemId: item.id })} activeOpacity={0.8}>
      <Card style={styles.card} variant="outlined">
        <View style={styles.cardHeader}>
          <TypeChip type={item.type} label={item.type === 'lost' ? t('lost_item') : t('found_item')} />
          <StatusChip status={item.status} label={t(`status_${item.status}`)} size="small" />
        </View>
        <Text style={styles.title}>{item.title}</Text>
        <View style={styles.metaRow}>
          <MaterialCommunityIcons name="map-marker-outline" size={14} color={colors.text.tertiary} />
          <Text style={styles.meta}>{item.location}</Text>
        </View>
        <View style={styles.metaRow}>
          <MaterialCommunityIcons name="clock-outline" size={14} color={colors.text.tertiary} />
          <Text style={styles.meta}>{formatRelative(item.createdAt)}</Text>
        </View>
      </Card>
    </TouchableOpacity>
  );

  if (isGuest) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <EmptyState
          icon="dYT,"
          title={t('guest_cannot_report')}
          description={t('guest_mode_limited')}
        />
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <Loading text={t('loading')} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <SectionHeader title={t('my_reports_title')} />
      </View>
      <FlatList
        data={reports}
        keyExtractor={(item) => item.id}
        renderItem={renderReport}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            colors={[colors.accent[500]]}
            tintColor={colors.accent[500]}
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon="dYZ_"
            title={t('my_reports_empty')}
            description={t('app_tagline')}
          />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  header: {
    padding: spacing.lg,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['3xl'],
    gap: spacing.md,
  },
  card: {
    borderRadius: borderRadius['2xl'],
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  meta: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    textAlign: 'left',
  },
});

export default MyReportsScreen;
