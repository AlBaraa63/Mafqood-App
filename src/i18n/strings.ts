/**
 * Mafqood App - Internationalization
 * English and Arabic translations (cleaned and aligned)
 */

export type SupportedLanguage = 'en' | 'ar';

const en = {
  // App
  app_name: 'Mafqood',
  app_tagline: "Dubai's AI-powered platform to reunite lost items with their owners.",

  // Common
  continue: 'Continue',
  cancel: 'Cancel',
  save: 'Save',
  submit: 'Submit',
  back: 'Back',
  next: 'Next',
  done: 'Done',
  skip: 'Skip',
  retry: 'Try Again',
  loading: 'Loading...',
  error_generic: 'Something went wrong. Please try again.',
  required_field: 'This field is required',

  // Language
  language: 'Language',
  english: 'English',
  arabic: 'Arabic',

  // Onboarding
  onboarding_title_1: 'Lost something in Dubai?',
  onboarding_desc_1: 'Report your lost item and let our AI search through found items across the city.',
  onboarding_title_2: 'Found something?',
  onboarding_desc_2: 'Be a good samaritan. Report found items and help reunite them with their owners.',
  onboarding_title_3: 'AI-Powered Matching',
  onboarding_desc_3: 'Our smart system automatically matches lost and found items using image recognition. Privacy-first approach.',
  get_started: 'Get Started',
  continue_as_guest: 'Continue as Guest',

  // Auth
  login: 'Login',
  register: 'Create Account',
  logout: 'Log Out',
  email: 'Email',
  password: 'Password',
  confirm_password: 'Confirm Password',
  full_name: 'Full Name',
  phone_number: 'Phone Number',
  forgot_password: 'Forgot Password?',
  reset_password: 'Reset Password',
  dont_have_account: "Don't have an account?",
  already_have_account: 'Already have an account?',
  create_account: 'Create Account',
  sign_in: 'Sign In',
  i_am_venue: 'I am a venue / organization',

  // Validation
  invalid_email: 'Please enter a valid email address',
  password_too_short: 'Password must be at least 8 characters',
  passwords_dont_match: 'Passwords do not match',
  invalid_phone: 'Please enter a valid UAE phone number',

  // Forgot Password
  forgot_password_title: 'Reset Your Password',
  forgot_password_desc: "Enter your email address and we'll send you instructions to reset your password.",
  reset_email_sent: 'If this email is registered, you will receive a reset link shortly.',
  send_reset_link: 'Send Reset Link',
  back_to_login: 'Back to Login',

  // Navigation
  nav_home: 'Home',
  nav_report: 'Report',
  nav_matches: 'Matches',
  nav_notifications: 'Notifications',
  nav_profile: 'Profile',

  // Notifications
  notifications: 'Notifications',
  no_notifications: 'No notifications yet',
  no_unread_notifications: 'All caught up!',
  notifications_empty_desc: 'When you receive notifications, they will appear here.',
  mark_all_read: 'Mark all as read',
  all: 'All',
  unread: 'Unread',

  // Home
  home_hero_title: 'Lost something in Dubai?',
  home_hero_subtitle: 'Submit a lost or found report and let AI search across the city.',
  home_ai_badge: 'AI image matching',
  home_reports_shortcut: 'See your history and statuses',
  home_empty_recent: 'Start by reporting your first lost or found item.',
  home_pillars_title: 'Why Mafqood',
  report_lost_item: 'Report Lost Item',
  report_found_item: 'Report Found Item',
  view_matches: 'View Matches',
  my_reports: 'My Reports',

  // Home - Value Props
  value_citywide: 'City-wide coverage',
  value_citywide_desc: 'One platform for all of Dubai',
  value_ai: 'AI image matching',
  value_ai_desc: 'Smart visual search technology',
  value_privacy: 'Privacy-first',
  value_privacy_desc: 'Your data stays protected',
  value_fast: 'Fast results',
  value_fast_desc: 'Real-time match notifications',
  value_free: 'Completely free',
  value_free_desc: 'No fees, no hidden costs',
  value_trusted: 'Trusted platform',
  value_trusted_desc: 'Verified and secure',

  // Home - Recent Items
  recent_items: 'Your Recent Items',
  status_open: 'Open',
  status_matched: 'Matched',
  status_closed: 'Closed',
  no_recent_items: 'No items reported yet',

  // Report Flow
  report_type_title: 'What would you like to report?',
  report_intro_subtitle: 'AI will search the opposite side (found vs lost) across Dubai.',
  report_type_lost: 'I lost an item',
  report_type_lost_desc: "Report something you've lost in Dubai",
  report_type_lost_hint: 'Faster matches when you add a photo',
  report_type_found: 'I found an item',
  report_type_found_desc: 'Help someone find their belongings',
  report_type_found_hint: 'Blur ID cards and faces; we help protect privacy',
  step_label_type: 'Type',
  step_label_photo: 'Photo',
  step_label_details: 'Details',
  step_label_where: 'When & Where',
  step_label_contact: 'Contact',
  step_label_review: 'Review',
  step_progress: 'Step {current} of {total}',

  // Report - Photo
  report_photo_title: 'Add a Photo',
  report_photo_lost_subtitle: 'Upload a photo of the item you lost',
  report_photo_found_subtitle: 'Upload a photo of the item you found',
  take_photo: 'Take Photo',
  choose_from_gallery: 'Choose from Gallery',
  photo_privacy_note: 'Please avoid including faces or ID numbers. We will blur sensitive details where possible.',
  photo_confirm_checkbox: 'I confirm this photo does not show faces or personal IDs, or I allow the system to blur them.',
  remove_photo: 'Remove Photo',

  // Report - Details
  report_details_title: 'Item Details',
  report_details_subtitle: 'Tell us about the item',
  category: 'Category',
  category_phone: 'Phone',
  category_wallet: 'Wallet',
  category_bag: 'Bag',
  category_id: 'ID / Documents',
  category_jewelry: 'Jewelry',
  category_electronics: 'Electronics',
  category_keys: 'Keys',
  category_documents: 'Documents',
  category_other: 'Other',
  select_category: 'Select a category',
  item_title: 'Title',
  item_title_placeholder: 'e.g., Black iPhone 14 with red case',
  item_description: 'Description',
  item_description_placeholder: 'Describe the item in more detail...',
  brand_model: 'Brand / Model (optional)',
  brand_model_placeholder: 'e.g., Apple, Samsung, Louis Vuitton',
  colors: 'Color(s) (optional)',
  colors_placeholder: 'e.g., Black, Red, Silver',
  report_details_helper: 'Include brand/model and distinct colors; avoid personal IDs.',

  // Report - When & Where
  report_when_where_title: 'When & Where',
  report_when_where_lost_subtitle: 'When and where did you lose it?',
  report_when_where_found_subtitle: 'When and where did you find it?',
  date_time: 'Date & Time',
  select_date_time: 'Select date and time',
  location_area: 'Location / Area',
  location_area_placeholder: 'e.g., Dubai Mall, Dubai Marina, JBR',
  location_detail: 'Specific Location (optional)',
  location_detail_placeholder: 'e.g., Near the fountain, Ground floor, Parking lot B2',

  // Report - Contact
  report_contact_title: 'Contact Preferences',
  report_contact_subtitle: 'How would you like to be contacted?',
  preferred_contact: 'Preferred Contact Method',
  contact_phone: 'Phone',
  contact_email: 'Email',
  contact_in_app: 'In-App Only',
  your_phone: 'Your Phone Number',
  your_email: 'Your Email',
  privacy_assurance: 'Your contact details will not be exposed publicly. All communication is mediated through our platform.',
  terms_checkbox: 'I agree to the terms and confirm this report is accurate.',

  // Report - Review
  report_review_title: 'Review Your Report',
  report_review_subtitle: 'Please verify all information before submitting',
  edit: 'Edit',
  type_label: 'Type',
  lost_item: 'Lost Item',
  found_item: 'Found Item',

  // Report - Success
  success_lost_title: 'Report Submitted!',
  success_lost_message: "Your lost item has been registered. We'll notify you when we find a match.",
  success_found_title: 'Thank You!',
  success_found_message: 'Thank you for reporting a found item. Your report may help reunite someone with their belongings.',
  success_matches_found: '{count} potential match(es) found!',
  view_potential_matches: 'View Potential Matches',
  go_home: 'Go to Home',

  // Matches
  matches_title: 'Your Matches',
  matches_subtitle: 'AI-suggested matches for your items',
  matches_dashboard_subtitle: 'Review AI discoveries and confirm what is yours.',
  tab_lost_items: 'Lost Items',
  tab_found_items: 'Found Items',
  no_matches_yet: 'No matches yet',
  no_matches_desc: "We'll notify you when we find something similar.",
  confidence_high: 'High Match',
  confidence_medium: 'Medium Match',
  confidence_low: 'Possible Match',
  similarity: 'Similarity',
  matches_more_count: '+{count} more potential matches',
  match_explanation: 'Matched based on image similarity and location.',

  // Match Detail
  match_detail_title: 'Match Details',
  your_item: 'Your Item',
  matched_item: 'Matched Item',
  this_is_my_item: 'I think this is my item',
  contact_owner: 'Contact Owner',
  contact_finder: 'Contact Finder',
  contact_sent: 'Contact request sent! The other party will be notified.',

  // Profile
  profile_title: 'Profile',
  edit_profile: 'Edit Profile',
  language_settings: 'Language',
  about_app: 'About Mafqood',
  logout_confirm: 'Are you sure you want to log out?',

  // My Reports
  my_reports_title: 'My Reports',
  my_reports_empty: "You haven't reported any items yet.",
  filter_all: 'All',
  filter_lost: 'Lost',
  filter_found: 'Found',

  // About
  about_title: 'About Mafqood',
  about_version: 'Version',
  about_description: "Mafqood is Dubai's AI-powered lost and found platform. We help reunite lost items with their owners using smart image matching and city-wide coverage.",
  about_privacy: 'Privacy Policy',
  about_terms: 'Terms of Service',
  about_contact: 'Contact Us',

  // Edit Profile
  edit_profile_title: 'Edit Profile',
  profile_updated: 'Profile updated successfully',

  // Error states
  error_network: 'Please check your internet connection and try again.',
  error_unauthorized: 'Please log in to continue.',
  error_not_found: 'The requested item was not found.',

  // Guest mode
  guest_mode_limited: 'Sign in to access all features',
  guest_cannot_report: 'Please create an account to report items',
  guest_cannot_match: 'Please create an account to view matches',
} satisfies Record<string, string>;

const ar: typeof en = {
  // App
  app_name: 'مفقود',
  app_tagline: 'منصة دبي الذكية لإعادة المفقودات إلى أصحابها.',

  // Common
  continue: 'متابعة',
  cancel: 'إلغاء',
  save: 'حفظ',
  submit: 'إرسال',
  back: 'رجوع',
  next: 'التالي',
  done: 'تم',
  skip: 'تخطي',
  retry: 'إعادة المحاولة',
  loading: 'جاري التحميل...',
  error_generic: 'حدث خطأ ما. يرجى المحاولة مرة أخرى.',
  required_field: 'هذه الخانة مطلوبة',

  // Language
  language: 'اللغة',
  english: 'الإنجليزية',
  arabic: 'العربية',

  // Onboarding
  onboarding_title_1: 'أضعت شيئاً في دبي؟',
  onboarding_desc_1: 'أبلغ عنه ودع الذكاء الاصطناعي يبحث في البلاغات الموجودة في المدينة.',
  onboarding_title_2: 'وجدت شيئاً؟',
  onboarding_desc_2: 'كن سبباً في إسعاد شخص. أبلغ عن الموجودات وساعد في إعادتها لأصحابها.',
  onboarding_title_3: 'مطابقة مدعومة بالذكاء الاصطناعي',
  onboarding_desc_3: 'نطابق الصور والمواقع لحماية خصوصيتك وتسريع العثور على المفقودات.',
  get_started: 'ابدأ الآن',
  continue_as_guest: 'المتابعة كضيف',

  // Auth
  login: 'تسجيل الدخول',
  register: 'إنشاء حساب',
  logout: 'تسجيل الخروج',
  email: 'البريد الإلكتروني',
  password: 'كلمة المرور',
  confirm_password: 'تأكيد كلمة المرور',
  full_name: 'الاسم الكامل',
  phone_number: 'رقم الهاتف',
  forgot_password: 'هل نسيت كلمة المرور؟',
  reset_password: 'إعادة تعيين كلمة المرور',
  dont_have_account: 'ليس لديك حساب؟',
  already_have_account: 'لديك حساب بالفعل؟',
  create_account: 'إنشاء حساب',
  sign_in: 'تسجيل الدخول',
  i_am_venue: 'أنا جهة أو مؤسسة',

  // Validation
  invalid_email: 'يرجى إدخال بريد إلكتروني صالح',
  password_too_short: 'كلمة المرور يجب ألا تقل عن 8 أحرف',
  passwords_dont_match: 'كلمتا المرور غير متطابقتين',
  invalid_phone: 'يرجى إدخال رقم هاتف إماراتي صالح',

  // Forgot Password
  forgot_password_title: 'إعادة تعيين كلمة المرور',
  forgot_password_desc: 'أدخل بريدك الإلكتروني وسنرسل لك خطوات إعادة التعيين.',
  reset_email_sent: 'إذا كان البريد مسجلاً ستصل رسالة لإعادة التعيين قريباً.',
  send_reset_link: 'إرسال رابط إعادة التعيين',
  back_to_login: 'العودة لتسجيل الدخول',

  // Navigation
  nav_home: 'الرئيسية',
  nav_report: 'إبلاغ',
  nav_matches: 'التطابقات',
  nav_notifications: 'الإشعارات',
  nav_profile: 'الملف الشخصي',

  // Notifications
  notifications: 'الإشعارات',
  no_notifications: 'لا توجد إشعارات حتى الآن',
  no_unread_notifications: 'لقد قرأت كل شيء!',
  notifications_empty_desc: 'عندما تتلقى إشعارات، ستظهر هنا.',
  mark_all_read: 'وضع علامة مقروء على الكل',
  all: 'الكل',
  unread: 'غير مقروء',

  // Home
  home_hero_title: 'أضعت شيئاً في دبي؟',
  home_hero_subtitle: 'قدّم بلاغ مفقود أو معثور عليه ودع الذكاء الاصطناعي يبحث عبر المدينة.',
  home_ai_badge: 'مطابقة صور بالذكاء الاصطناعي',
  home_reports_shortcut: 'سجل بلاغاتك وحالاتها',
  home_empty_recent: 'ابدأ بتسجيل أول بلاغ مفقود أو معثور عليه.',
  home_pillars_title: 'لماذا مفقود؟',
  report_lost_item: 'تقديم بلاغ مفقود',
  report_found_item: 'تقديم بلاغ معثور عليه',
  view_matches: 'عرض التطابقات',
  my_reports: 'بلاغاتي',

  // Home - Value Props
  value_citywide: 'تغطية على مستوى دبي',
  value_citywide_desc: 'منصة واحدة لكل المواقع',
  value_ai: 'مطابقة صور بالذكاء الاصطناعي',
  value_ai_desc: 'بحث بصري ذكي عن التشابه',
  value_privacy: 'الخصوصية أولاً',
  value_privacy_desc: 'بياناتك محمية وآمنة',
  value_fast: 'نتائج سريعة',
  value_fast_desc: 'تنبيهات فورية عند وجود تطابق',
  value_free: 'خدمة مجانية',
  value_free_desc: 'بدون رسوم أو تكاليف خفية',
  value_trusted: 'موثوق بها',
  value_trusted_desc: 'منصة آمنة ومتاحة للجميع',

  // Home - Recent Items
  recent_items: 'أحدث بلاغاتك',
  status_open: 'مفتوح',
  status_matched: 'متطابق',
  status_closed: 'مغلق',
  no_recent_items: 'لا توجد بلاغات بعد',

  // Report Flow
  report_type_title: 'ما نوع البلاغ الذي تريد تقديمه؟',
  report_intro_subtitle: 'سيبحث الذكاء الاصطناعي في البلاغات المقابلة (مفقود/معثور) في دبي.',
  report_type_lost: 'أبلغ عن مفقود',
  report_type_lost_desc: 'سجل شيئاً فقدته في دبي',
  report_type_lost_hint: 'إضافة صورة تساعد على التطابق السريع',
  report_type_found: 'أبلغ عن معثور عليه',
  report_type_found_desc: 'ساعد مالك الشيء في العثور عليه',
  report_type_found_hint: 'يرجى طمس الوجوه أو الأرقام الحساسة',
  step_label_type: 'النوع',
  step_label_photo: 'الصورة',
  step_label_details: 'التفاصيل',
  step_label_where: 'الزمان والمكان',
  step_label_contact: 'التواصل',
  step_label_review: 'مراجعة',
  step_progress: 'الخطوة {current} من {total}',

  // Report - Photo
  report_photo_title: 'أضف صورة',
  report_photo_lost_subtitle: 'حمّل صورة للشيء المفقود',
  report_photo_found_subtitle: 'حمّل صورة للشيء المعثور عليه',
  take_photo: 'التقاط صورة',
  choose_from_gallery: 'اختيار من المعرض',
  photo_privacy_note: 'تجنب إظهار الوجوه أو أرقام الهوية. سنطمس التفاصيل الحساسة متى أمكن.',
  photo_confirm_checkbox: 'أؤكد أن الصورة لا تحتوي على وجوه أو أرقام هوية أو أوافق على طمسها.',
  remove_photo: 'حذف الصورة',

  // Report - Details
  report_details_title: 'تفاصيل العنصر',
  report_details_subtitle: 'أخبرنا عن العنصر',
  category: 'الفئة',
  category_phone: 'هاتف',
  category_wallet: 'محفظة',
  category_bag: 'حقيبة',
  category_id: 'هوية / مستندات',
  category_jewelry: 'مجوهرات',
  category_electronics: 'إلكترونيات',
  category_keys: 'مفاتيح',
  category_documents: 'مستندات',
  category_other: 'أخرى',
  select_category: 'اختر فئة',
  item_title: 'عنوان العنصر',
  item_title_placeholder: 'مثال: آيفون 14 أسود بغطاء أحمر',
  item_description: 'الوصف',
  item_description_placeholder: 'صف العنصر بمزيد من التفاصيل...',
  brand_model: 'العلامة / الموديل (اختياري)',
  brand_model_placeholder: 'مثال: Apple, Samsung, Louis Vuitton',
  colors: 'الألوان (اختياري)',
  colors_placeholder: 'مثال: أسود، أحمر، فضي',
  report_details_helper: 'اذكر العلامة والألوان المميزة وتجنب البيانات الشخصية.',

  // Report - When & Where
  report_when_where_title: 'الزمان والمكان',
  report_when_where_lost_subtitle: 'متى وأين فقدت العنصر؟',
  report_when_where_found_subtitle: 'متى وأين عثرت على العنصر؟',
  date_time: 'التاريخ والوقت',
  select_date_time: 'اختر التاريخ والوقت',
  location_area: 'الموقع / المنطقة',
  location_area_placeholder: 'مثال: دبي مول، مرسى دبي، جميرا',
  location_detail: 'تفاصيل الموقع (اختياري)',
  location_detail_placeholder: 'مثال: قرب النافورة، الطابق الأرضي، مواقف B2',

  // Report - Contact
  report_contact_title: 'خيارات التواصل',
  report_contact_subtitle: 'كيف تفضل أن يتم التواصل معك؟',
  preferred_contact: 'طريقة التواصل المفضلة',
  contact_phone: 'هاتف',
  contact_email: 'بريد إلكتروني',
  contact_in_app: 'داخل التطبيق فقط',
  your_phone: 'رقم هاتفك',
  your_email: 'بريدك الإلكتروني',
  privacy_assurance: 'لن نعرض بياناتك علناً. يتم التواصل بشكل آمن عبر المنصة.',
  terms_checkbox: 'أوافق على الشروط وأؤكد صحة البيانات.',

  // Report - Review
  report_review_title: 'مراجعة البلاغ',
  report_review_subtitle: 'راجع المعلومات قبل الإرسال',
  edit: 'تعديل',
  type_label: 'النوع',
  lost_item: 'بلاغ مفقود',
  found_item: 'بلاغ معثور',

  // Report - Success
  success_lost_title: 'تم تسجيل البلاغ',
  success_lost_message: 'سننبهك فور إيجاد تطابق محتمل.',
  success_found_title: 'شكراً لتعاونك',
  success_found_message: 'تم تسجيل البلاغ وقد يساعد شخصاً في استعادة ممتلكاته.',
  success_matches_found: '{count} تطابق محتمل!',
  view_potential_matches: 'عرض التطابقات المحتملة',
  go_home: 'العودة للرئيسية',

  // Matches
  matches_title: 'التطابقات',
  matches_subtitle: 'اقتراحات الذكاء الاصطناعي لبلاغاتك',
  matches_dashboard_subtitle: 'راجع النتائج وأكد ما يخصك.',
  tab_lost_items: 'بلاغات المفقود',
  tab_found_items: 'بلاغات المعثور عليه',
  no_matches_yet: 'لا توجد تطابقات بعد',
  no_matches_desc: 'سنخبرك عند العثور على شيء مشابه.',
  confidence_high: 'تطابق عالٍ',
  confidence_medium: 'تطابق متوسط',
  confidence_low: 'تطابق محتمل',
  similarity: 'درجة التشابه',
  matches_more_count: '+{count} تطابق إضافي',
  match_explanation: 'تم التطابق بناءً على الصورة والموقع.',

  // Match Detail
  match_detail_title: 'تفاصيل التطابق',
  your_item: 'بلاغك',
  matched_item: 'العنصر المتطابق',
  this_is_my_item: 'أعتقد أن هذا عنصري',
  contact_owner: 'التواصل مع المالك',
  contact_finder: 'التواصل مع المُعثر',
  contact_sent: 'تم إرسال طلب التواصل، وسيتم إشعار الطرف الآخر.',

  // Profile
  profile_title: 'الملف الشخصي',
  edit_profile: 'تعديل الملف',
  language_settings: 'اللغة',
  about_app: 'حول مفقود',
  logout_confirm: 'هل أنت متأكد من تسجيل الخروج؟',

  // My Reports
  my_reports_title: 'بلاغاتي',
  my_reports_empty: 'لم تقدم أي بلاغ حتى الآن.',
  filter_all: 'الكل',
  filter_lost: 'مفقود',
  filter_found: 'معثور عليه',

  // About
  about_title: 'حول مفقود',
  about_version: 'الإصدار',
  about_description: 'مفقود هو منصة مفقودات في دبي مدعومة بالذكاء الاصطناعي. نساعد في إعادة المفقودات باستخدام مطابقة الصور وتغطية المدينة.',
  about_privacy: 'سياسة الخصوصية',
  about_terms: 'شروط الاستخدام',
  about_contact: 'اتصل بنا',

  // Edit Profile
  edit_profile_title: 'تعديل الملف الشخصي',
  profile_updated: 'تم تحديث الملف بنجاح',

  // Error states
  error_network: 'تحقق من اتصالك بالإنترنت ثم أعد المحاولة.',
  error_unauthorized: 'يرجى تسجيل الدخول للمتابعة.',
  error_not_found: 'العنصر المطلوب غير موجود.',

  // Guest mode
  guest_mode_limited: 'سجّل الدخول للوصول إلى كل المزايا.',
  guest_cannot_report: 'أنشئ حساباً لتقديم البلاغات.',
  guest_cannot_match: 'أنشئ حساباً لعرض التطابقات.',
} satisfies typeof en;

export const strings: Record<SupportedLanguage, typeof en> = { en, ar };

export type TranslationKey = keyof typeof en;

/**
 * Get a translated string
 */
export function t(
  lang: SupportedLanguage,
  key: TranslationKey | string,
  params?: Record<string, string | number>
): string {
  const safeKey = key as TranslationKey;
  let text = strings[lang]?.[safeKey] ?? strings.en[safeKey] ?? key;

  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      text = text.replace(`{${k}}`, String(v));
    });
  }

  return text;
}

export default strings;
