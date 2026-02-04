/**
 * Report Detail Screen - Native Mobile Design
 * Modern report detail view with image gallery and metadata cards
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StatusBar,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  SlideInRight,
} from 'react-native-reanimated';

import { GlassCard, EnhancedButton, StatusChip } from '../../components/ui';
import { TypeChip } from '../../components/common';
import { Loading } from '../../components/common';
import { useDynamicStyles, useTranslation, useFormatDate, useHaptics } from '../../hooks';
import { ProfileStackParamList, Item } from '../../types';
import api from '../../api';
import { colors } from '../../theme';

type RouteProps = RouteProp<ProfileStackParamList, 'ReportDetail'>;
type NavigationProp = NativeStackNavigationProp<ProfileStackParamList, 'ReportDetail'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Detail Row Component
interface DetailRowProps {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  value: string;
  delay: number;
}

const DetailRow: React.FC<DetailRowProps> = ({ icon, label, value, delay }) => {
  const { typography, spacing, layout } = useDynamicStyles();

  return (
    <Animated.View
      entering={SlideInRight.delay(delay).springify()}
      style={{
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: spacing.md,
        paddingVertical: spacing.sm,
      }}
    >
      <View
        style={{
          width: layout.avatarSm,
          height: layout.avatarSm,
          borderRadius: layout.avatarSm / 2,
          backgroundColor: colors.primary[50],
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <MaterialCommunityIcons name={icon} size={layout.iconSm} color={colors.primary[600]} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[typography.caption, { color: colors.text.tertiary, marginBottom: spacing.xs / 2 }]}>
          {label}
        </Text>
        <Text style={[typography.body, { color: colors.text.primary }]}>{value}</Text>
      </View>
    </Animated.View>
  );
};

// Section Card Component
interface SectionCardProps {
  title: string;
  children: React.ReactNode;
  delay: number;
}

const SectionCard: React.FC<SectionCardProps> = ({ title, children, delay }) => {
  const { typography, spacing } = useDynamicStyles();

  return (
    <Animated.View entering={FadeInDown.delay(delay).springify()}>
      <GlassCard variant="outlined" style={{ marginBottom: spacing.md }}>
        <Text style={[typography.label, { color: colors.text.tertiary, marginBottom: spacing.md }]}>
          {title}
        </Text>
        {children}
      </GlassCard>
    </Animated.View>
  );
};

export const ReportDetailScreen: React.FC = () => {
  const { params } = useRoute<RouteProps>();
  const navigation = useNavigation<NavigationProp>();
  const { t } = useTranslation();
  const { formatDateTime } = useFormatDate();
  const { typography, spacing, layout } = useDynamicStyles();
  const haptics = useHaptics();

  const { data, isLoading } = useQuery({
    queryKey: ['reportDetail', params.itemId],
    queryFn: () => api.getItemById(params.itemId),
  });

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

  const item: Item | undefined = data?.success ? data.data : undefined;

  if (!item) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: colors.background.secondary }}
        edges={['top']}
      >
        <StatusBar barStyle="dark-content" backgroundColor={colors.background.secondary} />
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            padding: spacing.xl,
          }}
        >
          <Animated.View entering={FadeIn}>
            <MaterialCommunityIcons
              name="file-question-outline"
              size={layout.iconXl * 1.5}
              color={colors.text.tertiary}
            />
          </Animated.View>
          <Animated.View entering={FadeInUp.delay(100)}>
            <Text style={[typography.h3, { textAlign: 'center', marginTop: spacing.lg }]}>
              {t('error_not_found')}
            </Text>
          </Animated.View>
          <Animated.View entering={FadeInUp.delay(200)} style={{ marginTop: spacing.lg }}>
            <EnhancedButton
              title={t('back')}
              onPress={() => {
                haptics.light();
                navigation.goBack();
              }}
              variant="primary"
            />
          </Animated.View>
        </View>
      </SafeAreaView>
    );
  }

  const contactMethodText = () => {
    switch (item.contactMethod) {
      case 'in_app':
        return t('contact_in_app');
      case 'phone':
        return t('contact_phone');
      case 'email':
        return t('contact_email');
      default:
        return item.contactMethod;
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.secondary }} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <ScrollView
        contentContainerStyle={{ paddingBottom: spacing['4xl'] }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Image */}
        <Animated.View entering={FadeIn}>
          <Image
            source={{ uri: item.imageUrl }}
            style={{
              width: SCREEN_WIDTH,
              height: SCREEN_WIDTH * 0.7,
              backgroundColor: colors.neutral[200],
            }}
            resizeMode="cover"
          />
          {/* Gradient Overlay */}
          <View
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 80,
              backgroundColor: 'rgba(0,0,0,0.3)',
            }}
          />
        </Animated.View>

        {/* Content */}
        <View style={{ paddingHorizontal: spacing.screenPadding, marginTop: -spacing['2xl'] }}>
          {/* Header Card */}
          <Animated.View entering={FadeInUp.springify()}>
            <GlassCard variant="elevated" style={{ marginBottom: spacing.md }}>
              {/* Type & Status */}
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
              <Text style={[typography.h2, { marginBottom: spacing.sm }]}>{item.title}</Text>

              {/* Description */}
              {item.description && (
                <Text style={[typography.body, { color: colors.text.secondary, lineHeight: 22 }]}>
                  {item.description}
                </Text>
              )}
            </GlassCard>
          </Animated.View>

          {/* When & Where Section */}
          <SectionCard title={t('report_when_where_title')} delay={100}>
            <DetailRow
              icon="map-marker"
              label={t('location')}
              value={item.location}
              delay={150}
            />
            {item.locationDetail && (
              <DetailRow
                icon="map-marker-plus"
                label={t('location_detail')}
                value={item.locationDetail}
                delay={200}
              />
            )}
            <DetailRow
              icon="calendar-clock"
              label={t('date_time')}
              value={formatDateTime(item.dateTime)}
              delay={250}
            />
          </SectionCard>

          {/* Details Section */}
          <SectionCard title={t('report_details_title')} delay={200}>
            {item.category && (
              <DetailRow
                icon="shape"
                label={t('category')}
                value={t(`category_${item.category}`)}
                delay={250}
              />
            )}
            {item.brand && (
              <DetailRow
                icon="tag"
                label={t('brand')}
                value={item.brand}
                delay={300}
              />
            )}
            {item.color && (
              <DetailRow
                icon="palette"
                label={t('color')}
                value={item.color}
                delay={350}
              />
            )}
          </SectionCard>

          {/* Contact Section */}
          <SectionCard title={t('report_contact_title')} delay={300}>
            <DetailRow
              icon="message-text"
              label={t('preferred_contact')}
              value={contactMethodText()}
              delay={350}
            />
            {item.contactPhone && (
              <DetailRow
                icon="phone"
                label={t('phone_number')}
                value={item.contactPhone}
                delay={400}
              />
            )}
            {item.contactEmail && (
              <DetailRow
                icon="email"
                label={t('email')}
                value={item.contactEmail}
                delay={450}
              />
            )}
          </SectionCard>

          {/* Back Button */}
          <Animated.View entering={FadeInUp.delay(400).springify()}>
            <EnhancedButton
              title={t('back')}
              onPress={() => {
                haptics.light();
                navigation.goBack();
              }}
              variant="outline"
              size="large"
              icon="←"
            />
          </Animated.View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ReportDetailScreen;
