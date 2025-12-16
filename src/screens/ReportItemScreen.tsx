/**
 * Mafqood Mobile - Report Item Screen
 * Multi-step wizard for reporting lost/found items
 * Step 1: Photo | Step 2: Location & Time | Step 3: Details & Submit
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useQueryClient } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, borderRadius, typography, spacing, shadows, layout } from '../theme/theme';
import { useLanguage } from '../context/LanguageContext';
import { ItemFormData, whereOptions, whenOptions, MatchResult, Match } from '../types/itemTypes';
import { submitLostItem, submitFoundItem, buildImageUrl } from '../api/client';
import { MATCH_THRESHOLD, HIGH_MATCH_THRESHOLD } from '../api/config';
import { Card, SegmentedControl } from '../components/ui';
import ImagePickerField from '../components/ImagePickerField';
import SelectField from '../components/SelectField';
import TextInput from '../components/TextInput';
import MatchCard from '../components/MatchCard';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type ReportType = 'lost' | 'found';
type StepIndex = 0 | 1 | 2;

type RouteParams = {
  Report: { type?: ReportType };
};

const STEPS = [
  { key: 'photo', icon: 'camera' as const },
  { key: 'location', icon: 'location' as const },
  { key: 'details', icon: 'checkmark-circle' as const },
];

export default function ReportItemScreen() {
  const { t, language } = useLanguage();
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RouteParams, 'Report'>>();
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();
  const isRTL = language === 'ar';
  
  // Get initial type from navigation params
  const initialType = route.params?.type || 'lost';
  const [reportType, setReportType] = useState<ReportType>(initialType);
  const [currentStep, setCurrentStep] = useState<StepIndex>(0);

  // Animation values
  const slideAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const stepOpacity = useRef(new Animated.Value(1)).current;

  // Update type when navigation params change
  useEffect(() => {
    if (route.params?.type) {
      setReportType(route.params.type);
    }
  }, [route.params?.type]);

  // Animate progress bar
  useEffect(() => {
    Animated.spring(progressAnim, {
      toValue: currentStep / (STEPS.length - 1),
      useNativeDriver: false,
      tension: 50,
      friction: 10,
    }).start();
  }, [currentStep]);

  const [formData, setFormData] = useState<ItemFormData>({
    image: null,
    where: '',
    specificPlace: '',
    when: '',
    description: '',
  });

  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isLost = reportType === 'lost';
  const accentColor = isLost ? colors.primary.dark : colors.primary.accent;
  const gradientColors = isLost 
    ? [colors.primary.dark, '#0D3847'] 
    : [colors.primary.accent, '#1E9A8C'];

  // Step configuration
  const stepConfig = {
    0: {
      title: isLost ? t('lost_form_item_photo') : t('found_form_item_photo'),
      subtitle: t('report_step1_subtitle') || 'التقط صورة واضحة للعنصر',
    },
    1: {
      title: t('detail_location'),
      subtitle: t('report_step2_subtitle') || 'حدد مكان ووقت العثور/الفقدان',
    },
    2: {
      title: t('report_step3_title') || 'تفاصيل إضافية',
      subtitle: t('report_step3_subtitle') || 'أضف أي معلومات تساعد في التعرف',
    },
  };

  // Navigate between steps with animation
  const goToStep = (step: StepIndex) => {
    const direction = step > currentStep ? 1 : -1;
    
    // Fade out
    Animated.timing(stepOpacity, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setCurrentStep(step);
      // Fade in
      Animated.timing(stepOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  };

  const canProceedFromStep = (step: StepIndex): boolean => {
    switch (step) {
      case 0:
        return !!formData.image;
      case 1:
        return !!formData.where && !!formData.when;
      case 2:
        return true; // Optional step
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < 2 && canProceedFromStep(currentStep)) {
      setError(null);
      goToStep((currentStep + 1) as StepIndex);
    } else if (currentStep === 2) {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      goToStep((currentStep - 1) as StepIndex);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        file: formData.image!,
        title: formData.description || `${isLost ? 'Lost' : 'Found'} item at ${formData.where}`,
        description: formData.description || undefined,
        locationType: formData.where,
        locationDetail: formData.specificPlace || undefined,
        timeFrame: formData.when,
      };

      const submitFn = isLost ? submitLostItem : submitFoundItem;
      const response = await submitFn(payload);
      setMatches(response.matches);
      setShowSuccessModal(true);

      // Invalidate history cache
      queryClient.invalidateQueries({ queryKey: ['history'] });

      // Reset form
      setFormData({
        image: null,
        where: '',
        specificPlace: '',
        when: '',
        description: '',
      });
      setCurrentStep(0);
    } catch (err) {
      console.error(`Error submitting ${reportType} item:`, err);
      setError(err instanceof Error ? err.message : t('error_generic'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredMatches = matches.filter(m => m.similarity >= MATCH_THRESHOLD);

  const convertToMatch = (matchResult: MatchResult): Match => ({
    id: matchResult.item.id.toString(),
    item: {
      id: matchResult.item.id.toString(),
      type: isLost ? 'found' : 'lost',
      imageUrl: buildImageUrl(matchResult.item.image_url),
      where: matchResult.item.location_type || 'Unknown',
      specificPlace: matchResult.item.location_detail || undefined,
      when: matchResult.item.time_frame || 'Unknown',
      description: matchResult.item.description || matchResult.item.title || t('no_description'),
      timestamp: new Date(matchResult.item.created_at),
    },
    similarity: Math.round(matchResult.similarity * 100),
    status: matchResult.similarity >= HIGH_MATCH_THRESHOLD ? 'high' : 'possible',
  });

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <View style={styles.stepContent}>
            <ImagePickerField
              value={formData.image}
              onChange={(image) => setFormData(prev => ({ ...prev, image }))}
              label=""
              required
              large
            />
            {!formData.image && (
              <Text style={styles.stepHint}>
                {t('report_photo_hint') || 'التقط صورة واضحة تظهر تفاصيل العنصر'}
              </Text>
            )}
          </View>
        );
      
      case 1:
        return (
          <View style={styles.stepContent}>
            <SelectField
              value={formData.where}
              onChange={(where) => setFormData(prev => ({ ...prev, where }))}
              options={whereOptions}
              placeholder={isLost ? t('lost_form_location_type_placeholder') : t('found_form_location_type_placeholder')}
              label={isLost ? t('lost_form_where_question') : t('found_form_where_question')}
              required
              icon={<Ionicons name="location" size={18} color={accentColor} />}
            />
            
            <View style={styles.fieldSpacer} />
            
            <SelectField
              value={formData.when}
              onChange={(when) => setFormData(prev => ({ ...prev, when }))}
              options={whenOptions}
              placeholder={isLost ? t('lost_form_time_frame_placeholder') : t('found_form_time_frame_placeholder')}
              label={isLost ? t('lost_form_when_question') : t('found_form_when_question')}
              required
              icon={<Ionicons name="time" size={18} color={accentColor} />}
            />
          </View>
        );
      
      case 2:
        return (
          <View style={styles.stepContent}>
            <TextInput
              value={formData.specificPlace}
              onChangeText={(specificPlace) => setFormData(prev => ({ ...prev, specificPlace }))}
              placeholder={isLost ? t('lost_form_specific_place_placeholder') : t('found_form_specific_place_placeholder')}
              label={isLost ? t('lost_form_specific_place') : t('found_form_specific_place')}
              icon={<Ionicons name="pin-outline" size={18} color={colors.text.tertiary} />}
            />
            
            <View style={styles.fieldSpacer} />
            
            <TextInput
              value={formData.description}
              onChangeText={(description) => setFormData(prev => ({ ...prev, description }))}
              placeholder={isLost ? t('lost_form_notes_placeholder') : t('found_form_notes_placeholder')}
              label={isLost ? t('lost_form_notes_label') : t('found_form_notes_label')}
              multiline
              numberOfLines={4}
              icon={<Ionicons name="document-text-outline" size={18} color={colors.text.tertiary} />}
            />
            
            <Text style={styles.optionalHint}>
              {t('report_optional_hint') || 'هذه الحقول اختيارية لكنها تساعد في المطابقة'}
            </Text>
          </View>
        );
    }
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Gradient Header */}
      <LinearGradient colors={gradientColors as [string, string]} style={styles.header}>
        {/* Type Toggle at top */}
        <View style={styles.typeToggle}>
          <SegmentedControl
            segments={[
              { 
                key: 'lost', 
                label: t('matches_lost_badge'),
                icon: <Ionicons name="search" size={16} color={reportType === 'lost' ? colors.text.white : colors.text.secondary} />
              },
              { 
                key: 'found', 
                label: t('matches_found_badge'),
                icon: <Ionicons name="hand-left" size={16} color={reportType === 'found' ? colors.text.white : colors.text.secondary} />
              },
            ]}
            selectedKey={reportType}
            onSelect={(key: string) => {
              setReportType(key as ReportType);
              // Reset to step 0 when changing type
              if (currentStep !== 0) {
                goToStep(0);
              }
            }}
            accentColor={accentColor}
          />
        </View>

        {/* Step Indicator */}
        <View style={styles.stepIndicatorContainer}>
          <View style={styles.stepsRow}>
            {STEPS.map((step, index) => (
              <React.Fragment key={step.key}>
                <TouchableOpacity
                  style={[
                    styles.stepDot,
                    index <= currentStep && styles.stepDotActive,
                    index === currentStep && styles.stepDotCurrent,
                  ]}
                  onPress={() => {
                    // Allow going back to completed steps
                    if (index < currentStep) {
                      goToStep(index as StepIndex);
                    }
                  }}
                  disabled={index > currentStep}
                >
                  <Ionicons 
                    name={step.icon} 
                    size={18} 
                    color={index === currentStep ? accentColor : (index < currentStep ? colors.text.white : 'rgba(255,255,255,0.4)')} 
                  />
                </TouchableOpacity>
                {index < STEPS.length - 1 && (
                  <View style={[
                    styles.stepLine,
                    index < currentStep && styles.stepLineActive,
                  ]} />
                )}
              </React.Fragment>
            ))}
          </View>
          
          {/* Step Title */}
          <Text style={styles.stepTitle}>{stepConfig[currentStep].title}</Text>
          <Text style={styles.stepSubtitle}>{stepConfig[currentStep].subtitle}</Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBg}>
            <Animated.View 
              style={[
                styles.progressBarFill,
                { width: progressWidth }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            {currentStep + 1} / {STEPS.length}
          </Text>
        </View>
      </LinearGradient>

      {/* Form Content */}
      <KeyboardAvoidingView 
        style={styles.formContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={100}
      >
        <Animated.View style={[styles.formContent, { opacity: stepOpacity }]}>
          <Card variant="default" padding="lg" style={styles.formCard}>
            {renderStepContent()}
            
            {/* Error Message */}
            {error && (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={16} color={colors.status.error} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
          </Card>
        </Animated.View>

        {/* Bottom Navigation */}
        <View style={[styles.bottomNav, { paddingBottom: insets.bottom + spacing.md }]}>
          {/* Back Button */}
          {currentStep > 0 ? (
            <TouchableOpacity 
              style={styles.backButton}
              onPress={handleBack}
            >
              <Ionicons 
                name={isRTL ? "arrow-forward" : "arrow-back"} 
                size={20} 
                color={colors.text.secondary} 
              />
              <Text style={styles.backButtonText}>{t('back') || 'رجوع'}</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.backButtonPlaceholder} />
          )}

          {/* Next/Submit Button */}
          <TouchableOpacity
            style={[
              styles.nextButton,
              { backgroundColor: accentColor },
              (!canProceedFromStep(currentStep) && currentStep < 2) && styles.nextButtonDisabled,
              isSubmitting && styles.nextButtonDisabled,
            ]}
            onPress={handleNext}
            disabled={(!canProceedFromStep(currentStep) && currentStep < 2) || isSubmitting}
          >
            {isSubmitting ? (
              <Text style={styles.nextButtonText}>
                {isLost ? t('lost_form_submitting') : t('found_form_submitting')}
              </Text>
            ) : (
              <>
                <Text style={styles.nextButtonText}>
                  {currentStep === 2 
                    ? (isLost ? t('lost_form_submit') : t('found_form_submit'))
                    : (t('next') || 'التالي')
                  }
                </Text>
                {currentStep === 2 ? (
                  <Ionicons name="sparkles" size={18} color={colors.text.white} />
                ) : (
                  <Ionicons 
                    name={isRTL ? "arrow-back" : "arrow-forward"} 
                    size={18} 
                    color={colors.text.white} 
                  />
                )}
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Success Modal */}
      <SuccessModal
        visible={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        onViewMatches={() => {
          setShowSuccessModal(false);
          navigation.navigate('Matches' as never);
        }}
        isLost={isLost}
        matches={filteredMatches}
        convertToMatch={convertToMatch}
        accentColor={accentColor}
        t={t}
      />
    </View>
  );
}

// Success Modal Component
function SuccessModal({
  visible,
  onClose,
  onViewMatches,
  isLost,
  matches,
  convertToMatch,
  accentColor,
  t,
}: {
  visible: boolean;
  onClose: () => void;
  onViewMatches: () => void;
  isLost: boolean;
  matches: MatchResult[];
  convertToMatch: (m: MatchResult) => Match;
  accentColor: string;
  t: (key: string) => string;
}) {
  const modalTitle = isLost ? t('modal_lost_title') : t('modal_found_title');
  const modalSubtitle = isLost ? t('modal_lost_subtitle') : t('modal_found_subtitle');
  const modalScanned = isLost ? t('modal_lost_scanned') : t('modal_found_scanned');

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Modal Header */}
          <LinearGradient 
            colors={[accentColor, accentColor + 'DD']} 
            style={styles.modalHeader}
          >
            <TouchableOpacity style={styles.modalClose} onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.text.white} />
            </TouchableOpacity>
            <View style={styles.modalHeaderContent}>
              <View style={styles.modalIconContainer}>
                <Ionicons name="checkmark-circle" size={40} color={accentColor} />
              </View>
              <Text style={styles.modalTitle}>{modalTitle}</Text>
              <Text style={styles.modalSubtitle}>{modalSubtitle}</Text>
            </View>
          </LinearGradient>

          {/* Modal Body */}
          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            <Text style={styles.modalText}>{modalScanned}</Text>

            {/* Next Steps */}
            <View style={[styles.nextStepsContainer, { backgroundColor: `${accentColor}12` }]}>
              <Text style={styles.nextStepsTitle}>{t('modal_lost_what_next')}</Text>
              
              {[
                { num: '1', title: t('modal_lost_step1_title'), desc: t('modal_lost_step1_desc') },
                { num: '2', title: t('modal_lost_step2_title'), desc: t('modal_lost_step2_desc') },
                { num: '3', title: t('modal_lost_step3_title'), desc: t('modal_lost_step3_desc') },
              ].map((step, index) => (
                <View key={index} style={styles.nextStep}>
                  <View style={[styles.nextStepNumber, { backgroundColor: accentColor }]}>
                    <Text style={styles.nextStepNumberText}>{step.num}</Text>
                  </View>
                  <View style={styles.nextStepContent}>
                    <Text style={styles.nextStepTitle}>{step.title}</Text>
                    <Text style={styles.nextStepDesc}>{step.desc}</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Matches Found */}
            {matches.length > 0 && (
              <>
                <View style={[styles.matchesFoundBanner, { borderColor: accentColor }]}>
                  <Ionicons name="sparkles" size={20} color={accentColor} />
                  <Text style={[styles.matchesFoundText, { color: accentColor }]}>
                    {t('modal_matches_found_message').replace('{count}', matches.length.toString())}
                  </Text>
                </View>
                <View style={styles.matchesPreview}>
                  {matches.slice(0, 2).map((matchResult) => (
                    <MatchCard
                      key={matchResult.item.id}
                      match={convertToMatch(matchResult)}
                      compact
                    />
                  ))}
                </View>
              </>
            )}
          </ScrollView>

          {/* Modal Footer */}
          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.modalSecondaryButton} onPress={onClose}>
              <Text style={styles.modalSecondaryButtonText}>{t('modal_close')}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.modalPrimaryButton, { backgroundColor: accentColor }]} 
              onPress={onViewMatches}
            >
              <Text style={styles.modalPrimaryButtonText}>{t('modal_view_matches')}</Text>
              <Ionicons name="arrow-forward" size={16} color={colors.text.white} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },

  // Header
  header: {
    paddingHorizontal: layout.screenPadding,
    paddingBottom: spacing.lg,
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
  },
  typeToggle: {
    paddingTop: spacing.sm,
    marginBottom: spacing.md,
  },

  // Step Indicator
  stepIndicatorContainer: {
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  stepDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  stepDotActive: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderColor: 'rgba(255,255,255,0.5)',
  },
  stepDotCurrent: {
    backgroundColor: colors.text.white,
    borderColor: colors.text.white,
    transform: [{ scale: 1.15 }],
    ...shadows.md,
  },
  stepLine: {
    width: 40,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: spacing.xs,
    borderRadius: 2,
  },
  stepLineActive: {
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  stepTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text.white,
    textAlign: 'center',
  },
  stepSubtitle: {
    fontSize: typography.sizes.sm,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginTop: spacing.xs,
  },

  // Progress Bar
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  progressBarBg: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.text.white,
    borderRadius: 2,
  },
  progressText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: 'rgba(255,255,255,0.8)',
    minWidth: 30,
    textAlign: 'center',
  },

  // Form
  formContainer: {
    flex: 1,
  },
  formContent: {
    flex: 1,
    padding: layout.screenPadding,
    paddingTop: spacing.lg,
  },
  formCard: {
    flex: 1,
  },
  stepContent: {
    flex: 1,
    justifyContent: 'center',
  },
  fieldSpacer: {
    height: spacing.md,
  },
  stepHint: {
    fontSize: typography.sizes.sm,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  optionalHint: {
    fontSize: typography.sizes.xs,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginTop: spacing.lg,
    fontStyle: 'italic',
  },

  // Error
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.status.errorBg,
    padding: spacing.md,
    borderRadius: borderRadius.sm,
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  errorText: {
    flex: 1,
    color: colors.status.error,
    fontSize: typography.sizes.sm,
  },

  // Bottom Navigation
  bottomNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.md,
    backgroundColor: colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    gap: spacing.xs,
  },
  backButtonText: {
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
    fontWeight: typography.weights.medium,
  },
  backButtonPlaceholder: {
    width: 80,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.full,
    gap: spacing.sm,
    minWidth: 140,
  },
  nextButtonDisabled: {
    opacity: 0.5,
  },
  nextButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.text.white,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    padding: layout.screenPadding,
  },
  modalContent: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.xl,
    maxHeight: '85%',
    overflow: 'hidden',
  },
  modalHeader: {
    padding: spacing.xl,
    paddingTop: spacing.lg,
  },
  modalClose: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    zIndex: 1,
    padding: spacing.xs,
  },
  modalHeaderContent: {
    alignItems: 'center',
    paddingTop: spacing.sm,
  },
  modalIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    ...shadows.md,
  },
  modalTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text.white,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: typography.sizes.sm,
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
  },
  modalBody: {
    padding: spacing.lg,
  },
  modalText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  nextStepsContainer: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
  },
  nextStepsTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  nextStep: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  nextStepNumber: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextStepNumberText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.text.white,
  },
  nextStepContent: {
    flex: 1,
  },
  nextStepTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: 2,
  },
  nextStepDesc: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    lineHeight: 18,
  },
  matchesFoundBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary.accentLight,
    borderWidth: 2,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  matchesFoundText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    textAlign: 'center',
  },
  matchesPreview: {
    gap: spacing.sm,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  modalSecondaryButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.background.tertiary,
    alignItems: 'center',
  },
  modalSecondaryButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.secondary,
  },
  modalPrimaryButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  modalPrimaryButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.white,
  },
});
