/**
 * Mafqood Mobile - Dropdown/Select Component
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius, fontSize, fontWeight, spacing, shadows } from '../theme/theme';
import { SelectOption } from '../types/itemTypes';
import { useLanguage } from '../context/LanguageContext';

interface SelectFieldProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder: string;
  label?: string;
  required?: boolean;
  icon?: React.ReactNode;
}

export default function SelectField({
  value,
  onChange,
  options,
  placeholder,
  label,
  required = false,
  icon,
}: SelectFieldProps) {
  const { t } = useLanguage();
  const [showModal, setShowModal] = useState(false);

  const selectedOption = options.find(opt => opt.value === value);

  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue);
    setShowModal(false);
  };

  return (
    <View style={styles.container}>
      {label && (
        <View style={styles.labelContainer}>
          {icon}
          <Text style={styles.label}>
            {label} {required && <Text style={styles.required}>*</Text>}
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={[
          styles.selectButton,
          value ? styles.selectButtonActive : null,
        ]}
        onPress={() => setShowModal(true)}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.selectText,
            !value && styles.placeholderText,
          ]}
        >
          {selectedOption ? t(selectedOption.key) : placeholder}
        </Text>
        <Ionicons
          name="chevron-down"
          size={20}
          color={value ? colors.primary.accent : colors.text.tertiary}
        />
      </TouchableOpacity>

      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowModal(false)}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label || placeholder}</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={24} color={colors.text.tertiary} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.optionItem,
                    value === item.value && styles.optionItemActive,
                  ]}
                  onPress={() => handleSelect(item.value)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      value === item.value && styles.optionTextActive,
                    ]}
                  >
                    {t(item.key)}
                  </Text>
                  {value === item.value && (
                    <Ionicons name="checkmark" size={20} color={colors.primary.accent} />
                  )}
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
              style={styles.optionsList}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
  },
  required: {
    color: colors.status.error,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md + 2,
    borderWidth: 2,
    borderColor: colors.border.light,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.background.secondary,
  },
  selectButtonActive: {
    borderColor: colors.primary.accent,
    backgroundColor: colors.background.primary,
  },
  selectText: {
    fontSize: fontSize.md,
    color: colors.text.primary,
    flex: 1,
  },
  placeholderText: {
    color: colors.text.tertiary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background.primary,
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    maxHeight: '70%',
    ...shadows.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  modalTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
  },
  optionsList: {
    padding: spacing.md,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.xs,
  },
  optionItemActive: {
    backgroundColor: `${colors.primary.accent}15`,
  },
  optionText: {
    fontSize: fontSize.md,
    color: colors.text.primary,
    fontWeight: fontWeight.medium,
  },
  optionTextActive: {
    color: colors.primary.accent,
    fontWeight: fontWeight.bold,
  },
});
