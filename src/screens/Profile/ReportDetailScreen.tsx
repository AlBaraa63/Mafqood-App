/**
 * Report Detail Screen
 * Shows a single report with metadata
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { Button, StatusChip, TypeChip, Divider, Loading } from '../../components/common';
import { useTranslation, useFormatDate } from '../../hooks';
import { ProfileStackParamList, Item } from '../../types';
import api from '../../api';
import { colors, typography, spacing, borderRadius } from '../../theme';

type RouteProps = RouteProp<ProfileStackParamList, 'ReportDetail'>;
type NavigationProp = NativeStackNavigationProp<ProfileStackParamList, 'ReportDetail'>;

export const ReportDetailScreen: React.FC = () => {
  const { params } = useRoute<RouteProps>();
  const navigation = useNavigation<NavigationProp>();
  const { t } = useTranslation();
  const { formatDateTime } = useFormatDate();

  const { data, isLoading } = useQuery({
    queryKey: ['reportDetail', params.itemId],
    queryFn: () => api.getItemById(params.itemId),
  });

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <Loading text={t('loading')} />
      </SafeAreaView>
    );
  }

  const item: Item | undefined = data?.success ? data.data : undefined;

  if (!item) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.empty}>
          <Text style={styles.emptyText}>{t('error_not_found')}</Text>
          <Button title={t('back')} onPress={() => navigation.goBack()} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Image source={{ uri: item.imageUrl }} style={styles.image} />

        <View style={styles.header}>
          <TypeChip type={item.type} label={item.type === 'lost' ? t('lost_item') : t('found_item')} />
          <StatusChip status={item.status} label={t(`status_${item.status}`)} size="small" />
        </View>

        <Text style={styles.title}>{item.title}</Text>
        {item.description ? <Text style={styles.description}>{item.description}</Text> : null}

        <Divider spacing={spacing.md} />

        <Text style={styles.sectionTitle}>{t('report_when_where_title')}</Text>
        <Text style={styles.meta}>{item.location}</Text>
        {item.locationDetail ? <Text style={styles.meta}>{item.locationDetail}</Text> : null}
        <Text style={styles.meta}>{formatDateTime(item.dateTime)}</Text>

        <Divider spacing={spacing.md} />

        <Text style={styles.sectionTitle}>{t('report_details_title')}</Text>
        {item.category && (
          <Text style={styles.meta}>
            {t('category')}: {t(`category_${item.category}`)}
          </Text>
        )}
        {item.brand ? <Text style={styles.meta}>{item.brand}</Text> : null}
        {item.color ? <Text style={styles.meta}>{item.color}</Text> : null}

        <Divider spacing={spacing.md} />

        <Text style={styles.sectionTitle}>{t('report_contact_title')}</Text>
        <Text style={styles.meta}>{t('preferred_contact')}: {t(item.contactMethod === 'in_app' ? 'contact_in_app' : item.contactMethod === 'phone' ? 'contact_phone' : 'contact_email')}</Text>
        {item.contactPhone ? <Text style={styles.meta}>{item.contactPhone}</Text> : null}
        {item.contactEmail ? <Text style={styles.meta}>{item.contactEmail}</Text> : null}

        <Button title={t('back')} onPress={() => navigation.goBack()} style={styles.backButton} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing['3xl'],
  },
  image: {
    width: '100%',
    height: 220,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.neutral[200],
    marginBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  description: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
    lineHeight: 22,
    textAlign: 'left',
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  meta: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
    textAlign: 'left',
  },
  backButton: {
    marginTop: spacing['2xl'],
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  emptyText: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
});

export default ReportDetailScreen;
