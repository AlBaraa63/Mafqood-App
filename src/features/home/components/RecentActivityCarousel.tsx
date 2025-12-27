/**
 * Recent Activity Carousel Component
 * Horizontal scroll of recent lost/found items
 */

import React from 'react';
import {
  View,
  StyleSheet,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Card } from '../common/Card';
import { Item } from '../../../types';
import { colors, spacing, typography, borderRadius } from '../../../theme';

interface RecentActivityCarouselProps {
  items: Item[];
  onItemPress: (item: Item) => void;
}

const ITEM_WIDTH = Dimensions.get('window').width * 0.7;

export const RecentActivityCarousel: React.FC<RecentActivityCarouselProps> = ({
  items,
  onItemPress,
}) => {
  if (items.length === 0) {
    return null;
  }

  const renderItem = ({ item }: { item: Item }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => onItemPress(item)}
      activeOpacity={0.8}
    >
      <Card variant="elevated" style={styles.card}>
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.overlay}>
          <View style={[styles.badge, { backgroundColor: item.type === 'lost' ? colors.status.open : colors.status.matched }]}>
            <Text style={styles.badgeText}>
              {item.type === 'lost' ? 'Lost' : 'Found'}
            </Text>
          </View>
        </View>
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.location} numberOfLines={1}>
            <MaterialCommunityIcons name="map-marker" size={12} color={colors.text.tertiary} />
            {' '}{item.location}
          </Text>
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Recent Activity</Text>
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        scrollEventThrottle={16}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.md,
    marginLeft: spacing.lg,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  itemContainer: {
    width: ITEM_WIDTH,
  },
  card: {
    overflow: 'hidden',
    padding: 0,
  },
  image: {
    width: '100%',
    height: 180,
    backgroundColor: colors.neutral[200],
  },
  overlay: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
  },
  badge: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
  },
  badgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral.white,
  },
  content: {
    padding: spacing.md,
  },
  title: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  location: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
});

export default RecentActivityCarousel;
