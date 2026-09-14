/**
 * Enterprise-Grade Route Configuration
 *
 * Centralized route configuration with:
 * - Route metadata for SEO
 * - Authentication requirements
 * - Role-based access control
 * - Route transitions
 * - Preloading strategies
 * - Analytics tracking
 * - Error boundaries
 * - Loading states
 */

import { lazy } from 'react';

/**
 * Lazy load page components
 */
const HomePage = lazy(() => import('../pages/HomePage'));
const AboutPage = lazy(() => import('../pages/AboutPage'));
const MarketplacePage = lazy(() => import('../pages/MarketplacePage'));
const ProductDetailPage = lazy(() => import('../pages/ProductDetailPage'));
const CartPage = lazy(() => import('../pages/CartPage'));
const CheckoutPage = lazy(() => import('../pages/CheckoutPage'));
const OrderDetailPage = lazy(() => import('../pages/OrderDetailPage'));
const LoginPage = lazy(() => import('../pages/LoginPage'));
const RegisterPage = lazy(() => import('../pages/RegisterPage'));
const FarmerPortalPage = lazy(() => import('../pages/FarmerPortalPage'));
const FarmerHomePage = lazy(() => import('../pages/FarmerHomePage'));
const FarmerSellPage = lazy(() => import('../pages/FarmerSellPage'));
const FarmerFieldPage = lazy(() => import('../pages/FarmerFieldPage'));
const HarvestPlanPage = lazy(() => import('../pages/HarvestPlanPage'));
const HarvestScorePage = lazy(() => import('../pages/HarvestScorePage'));
const WhatGrowPage = lazy(() => import('../pages/WhatGrowPage'));
const SeedVaultPage = lazy(() => import('../pages/SeedVaultPage'));
const FarmAdvisorPage = lazy(() => import('../pages/FarmAdvisorPage'));
const PriceCheckPage = lazy(() => import('../pages/PriceCheckPage'));
const PriceBuildPage = lazy(() => import('../pages/PriceBuildPage'));
const DynamicPricingPage = lazy(() => import('../pages/DynamicPricingPage'));
const SellTimingPage = lazy(() => import('../pages/SellTimingPage'));
const ComparePage = lazy(() => import('../pages/ComparePage'));
const DiscoverPage = lazy(() => import('../pages/DiscoverPage'));
const PreOrderPage = lazy(() => import('../pages/PreOrderPage'));
const LogisticsPage = lazy(() => import('../pages/LogisticsPage'));
const InsurancePage = lazy(() => import('../pages/InsurancePage'));
const DashboardPage = lazy(() => import('../pages/Generated/Page0'));
const WalletPage = lazy(() => import('../pages/WalletPage'));
const EscrowPage = lazy(() => import('../pages/EscrowPage'));
const FarmerRevenueLedgerPage = lazy(() => import('../pages/FarmerRevenueLedgerPage'));
const BankPassportPage = lazy(() => import('../pages/BankPassportPage'));
const DisruptionPage = lazy(() => import('../pages/DisruptionPage'));
// Financial and Reporting Pages
const AuditReportPage = lazy(() => import('../pages/AuditReportPage'));
const BulkPurchasePage = lazy(() => import('../pages/BulkPurchasePage'));
const ContractListingPage = lazy(() => import('../pages/ContractListingPage'));
const CreditScorePage = lazy(() => import('../pages/CreditScorePage'));
const EMICalculatorPage = lazy(() => import('../pages/EMICalculatorPage'));
const FarmerReportPage = lazy(() => import('../pages/FarmerReportPage'));
const FinancialReportPage = lazy(() => import('../pages/FinancialReportPage'));
const GroupBuyingPage = lazy(() => import('../pages/GroupBuyingPage'));
const InventoryReportPage = lazy(() => import('../pages/InventoryReportPage'));
const OperationsReportPage = lazy(() => import('../pages/OperationsReportPage'));
const ReportsDashboardPage = lazy(() => import('../pages/ReportsDashboardPage'));
const SalesReportPage = lazy(() => import('../pages/SalesReportPage'));
// Additional Advanced Features Pages
const AdvancedSearchPage = lazy(() => import('../pages/AdvancedSearchPage'));
const WeatherAnalyticsPage = lazy(() => import('../pages/WeatherAnalyticsPage'));
const MarketIntelligencePage = lazy(() => import('../pages/MarketIntelligencePage'));
const SupplyChainAnalyticsPage = lazy(() => import('../pages/SupplyChainAnalyticsPage'));
const RiskManagementPage = lazy(() => import('../pages/RiskManagementPage'));
const SustainabilityDashboardPage = lazy(() => import('../pages/SustainabilityDashboardPage'));
const ComplianceDashboardPage = lazy(() => import('../pages/ComplianceDashboardPage'));
const QualityControlPage = lazy(() => import('../pages/QualityControlPage'));
const ExportDocumentationPage = lazy(() => import('../pages/ExportDocumentationPage'));
const TraceabilityPage = lazy(() => import('../pages/TraceabilityPage'));
const KnowledgeBasePage = lazy(() => import('../pages/KnowledgeBasePage'));
const TrainingAcademyPage = lazy(() => import('../pages/TrainingAcademyPage'));
const CommunityForumPage = lazy(() => import('../pages/CommunityForumPage'));
const SupportCenterPage = lazy(() => import('../pages/SupportCenterPage'));

// Tier 1 Advanced Services Pages (M025-M030)
const AdvancedAnalyticsDashboard = lazy(() => import('../pages/AdvancedAnalyticsDashboard'));
const PredictiveIntelligencePage = lazy(() => import('../pages/PredictiveIntelligencePage'));
const IoTMonitoringDashboard = lazy(() => import('../pages/IoTMonitoringDashboard'));
const BlockchainVerificationPage = lazy(() => import('../pages/BlockchainVerificationPage'));
const DigitalTwinPage = lazy(() => import('../pages/DigitalTwinPage'));
const EnterpriseIntegrationPage = lazy(() => import('../pages/EnterpriseIntegrationPage'));

// Additional Dashboard Pages
const FinancialServicesDashboard = lazy(() => import('../pages/FinancialServicesDashboard'));
const OperationalDashboard = lazy(() => import('../pages/OperationalDashboard'));

// Financial Services Pages
const LoanManagementPage = lazy(() => import('../pages/LoanManagementPage'));
const InsuranceManagementPage = lazy(() => import('../pages/InsuranceManagementPage'));
const PaymentProcessingPage = lazy(() => import('../pages/PaymentProcessingPage'));
const FarmerEntranceHubPage = lazy(() => import('../pages/FarmerEntranceHubPage'));
const FarmerSellDoorPage = lazy(() => import('../pages/FarmerSellDoorPage'));
const FarmerHouseholdDoorPage = lazy(() => import('../pages/FarmerHouseholdDoorPage'));
const FarmerFieldDoorPage = lazy(() => import('../pages/FarmerFieldDoorPage'));
const FarmerSharedDoorPage = lazy(() => import('../pages/FarmerSharedDoorPage'));
const ForwardPricingPage = lazy(() => import('../pages/ForwardPricingPage'));
const ClimateWeatherPage = lazy(() => import('../pages/ClimateWeatherPage'));
const LedgerPage = lazy(() => import('../pages/LedgerPage'));
const CompliancePage = lazy(() => import('../pages/CompliancePage'));
const RfqPage = lazy(() => import('../pages/RfqPage'));
const CorridorEconomicsPage = lazy(() => import('../pages/CorridorEconomicsPage'));
const LandUseCarbonPage = lazy(() => import('../pages/LandUseCarbonPage'));
const AssetAccountingPage = lazy(() => import('../pages/AssetAccountingPage'));
const CostControlPage = lazy(() => import('../pages/CostControlPage'));
const ProjectSystemsPage = lazy(() => import('../pages/ProjectSystemsPage'));
const YieldManagementPage = lazy(() => import('../pages/YieldManagementPage'));
const CompetitivePositionPage = lazy(() => import('../pages/CompetitivePositionPage'));
const ExperienceLayerPage = lazy(() => import('../pages/ExperienceLayerPage'));
const FormManagementPage = lazy(() => import('../pages/FormManagementPage'));
const AnalyticsPage = lazy(() => import('../pages/AnalyticsPage'));
const ModuleHubPage = lazy(() => import('../pages/ModuleHubPage'));
const CorporateBuyerPage = lazy(() => import('../pages/CorporateBuyerPage'));
const LogisticsProviderPage = lazy(() => import('../pages/LogisticsProviderPage'));
const AdminDashboardPage = lazy(() => import('../pages/AdminDashboardPage'));
const FPODashboardPage = lazy(() => import('../pages/FPODashboardPage'));
const AuthorizationPage = lazy(() => import('../pages/AuthorizationPage'));
const ClimateAdvisoryPage = lazy(() => import('../pages/ClimateAdvisoryPage'));
const DairyManagementPage = lazy(() => import('../pages/DairyManagementPage'));
const FarmCostingPage = lazy(() => import('../pages/FarmCostingPage'));
const FarmerKycPage = lazy(() => import('../pages/FarmerKycPage'));
const FertilizerInventoryPage = lazy(() => import('../pages/FertilizerInventoryPage'));
const IrrigationManagementPage = lazy(() => import('../pages/IrrigationManagementPage'));
const LabourManagementPage = lazy(() => import('../pages/LabourManagementPage'));
const LandRegistryPage = lazy(() => import('../pages/LandRegistryPage'));
const OrchardManagementPage = lazy(() => import('../pages/OrchardManagementPage'));
const PondManagementPage = lazy(() => import('../pages/PondManagementPage'));
const ShgManagementPage = lazy(() => import('../pages/ShgManagementPage'));
const TractorManagementPage = lazy(() => import('../pages/TractorManagementPage'));
const VillageRegistryPage = lazy(() => import('../pages/VillageRegistryPage'));
const SowingManagementPage = lazy(() => import('../pages/SowingManagementPage'));
const BankerDashboardPage = lazy(() => import('../pages/BankerDashboardPage'));
const CADashboardPage = lazy(() => import('../pages/CADashboardPage'));
const GovernmentDashboardPage = lazy(() => import('../pages/GovernmentDashboardPage'));
const ResearchDashboardPage = lazy(() => import('../pages/ResearchDashboardPage'));
const ClimateMonitoringPage = lazy(() => import('../pages/ClimateMonitoringPage'));
const OperationsManagementPage = lazy(() => import('../pages/OperationsManagementPage'));
const MachineryManagementPage = lazy(() => import('../pages/MachineryManagementPage'));
const HorticultureManagementPage = lazy(() => import('../pages/HorticultureManagementPage'));
const FisheriesManagementPage = lazy(() => import('../pages/FisheriesManagementPage'));
const IdentityManagementPage = lazy(() => import('../pages/IdentityManagementPage'));
const PlatformFoundationPage = lazy(() => import('../pages/PlatformFoundationPage'));
const MFASetupPage = lazy(() => import('../pages/MFASetupPage'));
const GDPRConsentPage = lazy(() => import('../pages/GDPRConsentPage'));
const LibraryBrowserPage = lazy(() => import('../pages/LibraryBrowserPage'));
const AIChatPage = lazy(() => import('../pages/AIChatPage'));
const AICollaborationPage = lazy(() => import('../pages/AICollaborationPage'));
const FPORegistrationPage = lazy(() => import('../pages/FPORegistrationPage'));
const CattleRegistryPage = lazy(() => import('../pages/CattleRegistryPage'));
const ImplementManagementPage = lazy(() => import('../pages/ImplementManagementPage'));
const EquipmentInventoryPage = lazy(() => import('../pages/EquipmentInventoryPage'));
const EquipmentRentalPage = lazy(() => import('../pages/EquipmentRentalPage'));
const BreakdownMaintenancePage = lazy(() => import('../pages/BreakdownMaintenancePage'));
const FuelManagementPage = lazy(() => import('../pages/FuelManagementPage'));
const SparePartsManagementPage = lazy(() => import('../pages/SparePartsManagementPage'));
const AssetLifecycleManagementPage = lazy(() => import('../pages/AssetLifecycleManagementPage'));
const EnvironmentManagementPage = lazy(() => import('../pages/EnvironmentManagementPage'));
const EnterpriseControlPage = lazy(() => import('../pages/EnterpriseControlPage'));
const AIBackbonePage = lazy(() => import('../pages/AIBackbonePage'));
const DietRecipesPage = lazy(() => import('../pages/DietRecipesPage'));
const WearablesPage = lazy(() => import('../pages/WearablesPage'));
const FitbitCallbackPage = lazy(() => import('../pages/FitbitCallbackPage'));
const DefenseFitnessPrepPage = lazy(() => import('../pages/DefenseFitnessPrepPage'));
const SellerProductFormPage = lazy(() => import('../pages/SellerProductFormPage'));
const VarietyDirectoryPage = lazy(() => import('../pages/VarietyDirectoryPage'));
const CropValueReviewPage = lazy(() => import('../pages/CropValueReviewPage'));
const PoultryManagementPage = lazy(() => import('../pages/PoultryManagementPage'));
const GoatFarmingPage = lazy(() => import('../pages/GoatFarmingPage'));
const SheepFarmingPage = lazy(() => import('../pages/SheepFarmingPage'));
const PigFarmingPage = lazy(() => import('../pages/PigFarmingPage'));
const AnimalHealthPage = lazy(() => import('../pages/AnimalHealthPage'));
const UnifiedLedgerPage = lazy(() => import('../pages/UnifiedLedgerPage'));
const REOSDashboardPage = lazy(() => import('../pages/REOSDashboardPage'));
const AIDashboard = lazy(() => import('../pages/AIDashboard'));
const ERPDashboard = lazy(() => import('../pages/ERPDashboard'));
const B2BMarketplace = lazy(() => import('../pages/B2BMarketplace'));
const MarketingCenter = lazy(() => import('../pages/MarketingCenter'));
const NutrientValueMarketplace = lazy(() => import('../pages/NutrientValueMarketplace'));
const AIProductStudioPage = lazy(() => import('../pages/AIProductStudioPage'));
const PublicDataExtractorPage = lazy(() => import('../pages/PublicDataExtractorPage'));

// Additional management pages
const FarmerProfilePage = lazy(() => import('../pages/FarmerProfilePage'));
const FarmerFamilyPage = lazy(() => import('../pages/FarmerFamilyPage'));
const FarmerVerificationPage = lazy(() => import('../pages/FarmerVerificationPage'));
const FarmerSkillPage = lazy(() => import('../pages/FarmerSkillPage'));
const FarmerHealthWelfarePage = lazy(() => import('../pages/FarmerHealthWelfarePage'));
const CropCalendarPage = lazy(() => import('../pages/CropCalendarPage'));
const CropRegistrationPage = lazy(() => import('../pages/CropRegistrationPage'));
const CropVarietyPage = lazy(() => import('../pages/CropVarietyPage'));
const SeedPlanningPage = lazy(() => import('../pages/SeedPlanningPage'));
const NurseryManagementPage = lazy(() => import('../pages/NurseryManagementPage'));
const CropMonitoringPage = lazy(() => import('../pages/CropMonitoringPage'));
const LandManagementPage = lazy(() => import('../pages/LandManagementPage'));
const InputSupplyManagementPage = lazy(() => import('../pages/InputSupplyManagementPage'));
const LivestockManagementPage = lazy(() => import('../pages/LivestockManagementPage'));
const CommunityManagementPage = lazy(() => import('../pages/CommunityManagementPage'));
const SoilManagementPage = lazy(() => import('../pages/SoilManagementPage'));
const WaterManagementPage = lazy(() => import('../pages/WaterManagementPage'));
const SubsidyManagementPage = lazy(() => import('../pages/SubsidyManagementPage'));
const BulkOrderPage = lazy(() => import('../pages/BulkOrderPage'));
const EcommerceMarketplacePage = lazy(() => import('../pages/EcommerceMarketplacePage'));
const EcommerceIntegrationPage = lazy(() => import('../pages/EcommerceIntegrationPage'));
const CompleteERPIntegrationPage = lazy(() => import('../pages/CompleteERPIntegrationPage'));
const EngineeringProjectPage = lazy(() => import('../pages/EngineeringProjectPage'));
const RealtimeMonitoringPage = lazy(() => import('../pages/RealtimeMonitoringPage'));
const ColdStoragePage = lazy(() => import('../pages/ColdStoragePage'));
const CooperativeSharePage = lazy(() => import('../pages/CooperativeSharePage'));
const AgriculturalIntelligencePage = lazy(() => import('../pages/AgriculturalIntelligencePage'));
const KnowledgeReferencePage = lazy(() => import('../pages/KnowledgeReferencePage'));
const DecisionSupportPage = lazy(() => import('../pages/DecisionSupportPage'));
const CompleteAIIntegrationPage = lazy(() => import('../pages/CompleteAIIntegrationPage'));
const ComprehensiveERPPage = lazy(() => import('../pages/ComprehensiveERPPage'));
const WaterRecordsPage = lazy(() => import('../pages/WaterRecordsPage'));
const SAPModuleArchitecturePage = lazy(() => import('../pages/SAPModuleArchitecturePage'));
const ResearchAndDevelopmentPage = lazy(() => import('../pages/ResearchAndDevelopmentPage'));
const InformationSharingPage = lazy(() => import('../pages/InformationSharingPage'));
const AIAgentPage = lazy(() => import('../pages/AIAgentPage'));
const AIBrainPage = lazy(() => import('../pages/AIBrainPage'));
const AISelfHealingPage = lazy(() => import('../pages/AISelfHealingPage'));
const AIOperationIntelligencePage = lazy(() => import('../pages/AIOperationIntelligencePage'));
const NervousSystemPage = lazy(() => import('../pages/NervousSystemPage'));
const LogisticsEnhancementPage = lazy(() => import('../pages/LogisticsEnhancementPage'));
const EnterpriseAIPage = lazy(() => import('../pages/EnterpriseAIPage'));
const PlatformManagementPage = lazy(() => import('../pages/PlatformManagementPage'));
const PlatformCoreDashboard = lazy(() => import('../components/PlatformCoreDashboard'));
const AICollaborationDashboard = lazy(() => import('../components/AI/AICollaborationDashboard'));
const AutoGenerationDashboard = lazy(() => import('../components/Admin/AutoGenerationDashboard'));
const GDPRConsent = lazy(() => import('../components/GDPR/GDPRConsent'));
const MFASetup = lazy(() => import('../components/MFA/MFASetup'));
const LibraryBrowser = lazy(() => import('../components/Library/LibraryBrowser'));
const TraceabilityViewer = lazy(() => import('../components/BlockchainTraceability/TraceabilityViewer'));
const HealthDashboard = lazy(() => import('../components/ConsumerHealth/HealthDashboard'));
const ChatInterface = lazy(() => import('../components/ConversationalAI/ChatInterface'));

// Strategic Services Pages
const PreSeasonPurchasePage = lazy(() => import('../pages/PreSeasonPurchasePage'));
const ContractFarmingPage = lazy(() => import('../pages/ContractFarmingPage'));
const HouseholdProcurementPage = lazy(() => import('../pages/HouseholdProcurementPage'));
const GovernmentSubsidyPage = lazy(() => import('../pages/GovernmentSubsidyPage'));
const RolePermissionPage = lazy(() => import('../pages/RolePermissionPage'));
const SharedInfraPage = lazy(() => import('../pages/SharedInfraPage'));
const SystemAdministrationPage = lazy(() => import('../pages/SystemAdministrationPage'));
const LogisticsMatchingPage = lazy(() => import('../pages/LogisticsMatchingPage'));
const MarketSignalsPage = lazy(() => import('../pages/MarketSignalsPage'));
const CopilotHubPage = lazy(() => import('../pages/CopilotHubPage'));
// Premium & AI Features (NEW)
const PremiumMarketplacePage = lazy(() => import('../pages/PremiumMarketplacePage'));
const AIImageGenerator = lazy(() => import('../components/AIImageGenerator'));
// Wellness Features (NEW)
const NutritionCalculatorPage = lazy(() => import('../pages/NutritionCalculatorPage'));
const NaturalTherapistPage = lazy(() => import('../pages/NaturalTherapistPage'));

// Payment and Wallet Pages
const PaymentGatewayPage = lazy(() => import('../pages/PaymentGatewayPage'));
const DigitalWalletPage = lazy(() => import('../pages/WalletPage'));
const TransactionHistoryPage = lazy(() => import('../pages/TransactionHistoryPage'));

/**
 * Public routes - no authentication required
 */
const DiscoveredERPDashboardPage = lazy(() => import('../pages/ERPDashboardPage'));
const DiscoveredColdStorageDashboardPage = lazy(() => import('../pages/ColdStorageDashboardPage'));
const DiscoveredClimateMonitoringDashboardPage = lazy(() => import('../pages/ClimateMonitoringDashboardPage'));
const DiscoveredEnterpriseMemoryDashboardPage = lazy(() => import('../pages/EnterpriseMemoryDashboardPage'));
const DiscoveredNutrientCalculatorPage = lazy(() => import('../pages/NutrientCalculatorPage'));
const DiscoveredDecisionEngineDashboardPage = lazy(() => import('../pages/DecisionEngineDashboardPage'));
const DiscoveredMedicalCodingDashboardPage = lazy(() => import('../pages/MedicalCodingDashboardPage'));
const DiscoveredDigitalTwinDashboardPage = lazy(() => import('../pages/DigitalTwinDashboardPage'));
const DiscoveredAdvancedMedicalCodingPage = lazy(() => import('../pages/AdvancedMedicalCodingPage'));
const DiscoveredOrganizationTenantManagementPage = lazy(() => import('../pages/OrganizationTenantManagementPage'));
const DiscoveredMachineryVillageOpsMachineryManagement = lazy(() => import('../pages/MachineryVillageOps/MachineryManagement'));
const DiscoveredWaterIrrigationWaterManagement = lazy(() => import('../pages/WaterIrrigation/WaterManagement'));
const DiscoveredSoilNutrientLandSoilManagement = lazy(() => import('../pages/SoilNutrientLand/SoilManagement'));
const DiscoveredVendorProcurementVendorManagement = lazy(() => import('../pages/VendorProcurement/VendorManagement'));
const DiscoveredAnalyticsAdvancedAnalyticsDashboard = lazy(() => import('../pages/analytics/AdvancedAnalyticsDashboard'));
const DiscoveredGovernmentGovernmentSchemeDashboard = lazy(() => import('../pages/government/GovernmentSchemeDashboard'));
const DiscoveredAdminComplianceDashboard = lazy(() => import('../pages/admin/ComplianceDashboard'));
const DiscoveredSettingsAPIManagement = lazy(() => import('../pages/settings/APIManagement'));
const DiscoveredSettingsWebhooks = lazy(() => import('../pages/settings/Webhooks'));
const DiscoveredPlatformModuleWorkspace = lazy(() => import('../pages/platform/ModuleWorkspace'));
const DiscoveredSettingsAdvancedSettings = lazy(() => import('../pages/settings/AdvancedSettings'));
const DiscoveredSettingsAuditTrail = lazy(() => import('../pages/settings/AuditTrail'));
const DiscoveredSettingsIntegrations = lazy(() => import('../pages/settings/Integrations'));
const DiscoveredReportsExpenseReport = lazy(() => import('../pages/reports/ExpenseReport'));
const DiscoveredReportsCropPerformance = lazy(() => import('../pages/reports/CropPerformance'));
const DiscoveredReportsProfitReport = lazy(() => import('../pages/reports/ProfitReport'));
const DiscoveredAdminAPIManagement = lazy(() => import('../pages/admin/APIManagement'));
const DiscoveredAdminAuditLogs = lazy(() => import('../pages/admin/AuditLogs'));
const DiscoveredAdminBackupRecovery = lazy(() => import('../pages/admin/BackupRecovery'));
const DiscoveredAdminCacheManagement = lazy(() => import('../pages/admin/CacheManagement'));
const DiscoveredAdminDatabaseManagement = lazy(() => import('../pages/admin/DatabaseManagement'));
const DiscoveredAdminErrorHandling = lazy(() => import('../pages/admin/ErrorHandling'));
const DiscoveredAdminIntegrationSettings = lazy(() => import('../pages/admin/IntegrationSettings'));
const DiscoveredAdminLogViewer = lazy(() => import('../pages/admin/LogViewer'));
const DiscoveredAdminNotificationPreferences = lazy(() => import('../pages/admin/NotificationPreferences'));
const DiscoveredAdminPerformanceTuning = lazy(() => import('../pages/admin/PerformanceTuning'));
const DiscoveredAdminResourceMonitoring = lazy(() => import('../pages/admin/ResourceMonitoring'));
const DiscoveredAdminRolePermissions = lazy(() => import('../pages/admin/RolePermissions'));
const DiscoveredAdminSecuritySettings = lazy(() => import('../pages/admin/SecuritySettings'));
const DiscoveredAdminSystemConfiguration = lazy(() => import('../pages/admin/SystemConfiguration'));
const DiscoveredAdminUserManagement = lazy(() => import('../pages/admin/UserManagement'));
const DiscoveredAnalyticsAnomalyDetection = lazy(() => import('../pages/analytics/AnomalyDetection'));
const DiscoveredAnalyticsCropYieldPrediction = lazy(() => import('../pages/analytics/CropYieldPrediction'));
const DiscoveredAnalyticsCustomReportBuilder = lazy(() => import('../pages/analytics/CustomReportBuilder'));
const DiscoveredAnalyticsDataQualityReport = lazy(() => import('../pages/analytics/DataQualityReport'));
const DiscoveredAnalyticsErrorRateAnalysis = lazy(() => import('../pages/analytics/ErrorRateAnalysis'));
const DiscoveredAnalyticsFarmerBehaviorAnalytics = lazy(() => import('../pages/analytics/FarmerBehaviorAnalytics'));
const DiscoveredAnalyticsForecastingDashboard = lazy(() => import('../pages/analytics/ForecastingDashboard'));
const DiscoveredAnalyticsHistoricalDataView = lazy(() => import('../pages/analytics/HistoricalDataView'));
const DiscoveredAnalyticsIntelligenceReports = lazy(() => import('../pages/analytics/IntelligenceReports'));
const DiscoveredAnalyticsMarketTrendAnalysis = lazy(() => import('../pages/analytics/MarketTrendAnalysis'));
const DiscoveredAnalyticsOpportunitiesIdentifier = lazy(() => import('../pages/analytics/OpportunitiesIdentifier'));
const DiscoveredAnalyticsPerformanceMetrics = lazy(() => import('../pages/analytics/PerformanceMetrics'));
const DiscoveredAnalyticsPriceVolatilityChart = lazy(() => import('../pages/analytics/PriceVolatilityChart'));
const DiscoveredAnalyticsRegionalComparison = lazy(() => import('../pages/analytics/RegionalComparison'));
const DiscoveredAnalyticsResponseTimeMetrics = lazy(() => import('../pages/analytics/ResponseTimeMetrics'));
const DiscoveredAnalyticsRiskAssessment = lazy(() => import('../pages/analytics/RiskAssessment'));
const DiscoveredAnalyticsSubsidyDistributionMap = lazy(() => import('../pages/analytics/SubsidyDistributionMap'));
const DiscoveredAnalyticsSystemHealthMonitor = lazy(() => import('../pages/analytics/SystemHealthMonitor'));
const DiscoveredAnalyticsUserEngagementStats = lazy(() => import('../pages/analytics/UserEngagementStats'));
const DiscoveredAnalyticsWeatherImpactAssessment = lazy(() => import('../pages/analytics/WeatherImpactAssessment'));
const DiscoveredGovernmentAnnouncementBoard = lazy(() => import('../pages/government/AnnouncementBoard'));
const DiscoveredGovernmentApplicationStatusTracker = lazy(() => import('../pages/government/ApplicationStatusTracker'));
const DiscoveredGovernmentApprovalWorkflow = lazy(() => import('../pages/government/ApprovalWorkflow'));
const DiscoveredGovernmentAuditLogPage = lazy(() => import('../pages/government/AuditLogPage'));
const DiscoveredGovernmentBeneficiaryManagement = lazy(() => import('../pages/government/BeneficiaryManagement'));
const DiscoveredGovernmentBiometricAuthentication = lazy(() => import('../pages/government/BiometricAuthentication'));
const DiscoveredGovernmentCancellationManagement = lazy(() => import('../pages/government/CancellationManagement'));
const DiscoveredGovernmentComplianceValidator = lazy(() => import('../pages/government/ComplianceValidator'));
const DiscoveredGovernmentDeadlineTracker = lazy(() => import('../pages/government/DeadlineTracker'));
const DiscoveredGovernmentDisputeResolutionPage = lazy(() => import('../pages/government/DisputeResolutionPage'));
const DiscoveredGovernmentDocumentUploadPage = lazy(() => import('../pages/government/DocumentUploadPage'));
const DiscoveredGovernmentGovernmentNotificationCenter = lazy(() => import('../pages/government/GovernmentNotificationCenter'));
const DiscoveredGovernmentMobileVerification = lazy(() => import('../pages/government/MobileVerification'));
const DiscoveredGovernmentPaymentGateway = lazy(() => import('../pages/government/PaymentGateway'));
const DiscoveredGovernmentSchemeBeneficiaryList = lazy(() => import('../pages/government/SchemeBeneficiaryList'));
const DiscoveredGovernmentSchemeEligibilityChecker = lazy(() => import('../pages/government/SchemeEligibilityChecker'));
const DiscoveredGovernmentSchemeReportGenerator = lazy(() => import('../pages/government/SchemeReportGenerator'));
const DiscoveredGovernmentSchemeUpdateNotifier = lazy(() => import('../pages/government/SchemeUpdate Notifier'));
const DiscoveredGovernmentSchemeVerificationPage = lazy(() => import('../pages/government/SchemeVerificationPage'));
const DiscoveredGovernmentSubsidyApplicationPage = lazy(() => import('../pages/government/SubsidyApplicationPage'));
const DiscoveredMobileMobileChat = lazy(() => import('../pages/mobile/MobileChat'));
const DiscoveredMobileMobileHelp = lazy(() => import('../pages/mobile/MobileHelp'));
const DiscoveredMobileMobileHomepage = lazy(() => import('../pages/mobile/MobileHomepage'));
const DiscoveredMobileMobileMarketplace = lazy(() => import('../pages/mobile/MobileMarketplace'));
const DiscoveredMobileMobileNotifications = lazy(() => import('../pages/mobile/MobileNotifications'));
const DiscoveredMobileMobileOffers = lazy(() => import('../pages/mobile/MobileOffers'));
const DiscoveredMobileMobilePayments = lazy(() => import('../pages/mobile/MobilePayments'));
const DiscoveredMobileMobileProfile = lazy(() => import('../pages/mobile/MobileProfile'));
const DiscoveredMobileMobileSettings = lazy(() => import('../pages/mobile/MobileSettings'));
const DiscoveredMobileMobileWallet = lazy(() => import('../pages/mobile/MobileWallet'));

const SweepAccessibilityPage = lazy(() => import('../pages/AccessibilityPage'));
const SweepAccountPage = lazy(() => import('../pages/AccountPage'));
const SweepActivityPage = lazy(() => import('../pages/ActivityPage'));
const SweepAdvancedPage = lazy(() => import('../pages/AdvancedPage'));
const SweepAIDashboardPage = lazy(() => import('../pages/AIDashboardPage'));
const SweepArchivePage = lazy(() => import('../pages/ArchivePage'));
const SweepBackupPage = lazy(() => import('../pages/BackupPage'));
const SweepBillingPage = lazy(() => import('../pages/BillingPage'));
const SweepBrowsePage = lazy(() => import('../pages/BrowsePage'));
const SweepCategoriesPage = lazy(() => import('../pages/CategoriesPage'));
const SweepClaimsPage = lazy(() => import('../pages/ClaimsPage'));
const SweepCollaboratePage = lazy(() => import('../pages/CollaboratePage'));
const SweepCollectionsPage = lazy(() => import('../pages/CollectionsPage'));
const SweepContactPage = lazy(() => import('../pages/ContactPage'));
const SweepCookiePage = lazy(() => import('../pages/CookiePage'));
const SweepCropsPage = lazy(() => import('../pages/CropsPage'));
const SweepDevicesPage = lazy(() => import('../pages/DevicesPage'));
const SweepDocumentationPage = lazy(() => import('../pages/DocumentationPage'));
const SweepEmptyPage = lazy(() => import('../pages/EmptyPage'));
const SweepEquipmentPage = lazy(() => import('../pages/EquipmentPage'));
const SweepExplorePage = lazy(() => import('../pages/ExplorePage'));
const SweepExportPage = lazy(() => import('../pages/ExportPage'));
const SweepFAQPage = lazy(() => import('../pages/FAQPage'));
const SweepFarmsPage = lazy(() => import('../pages/FarmsPage'));
const SweepFavoritesPage = lazy(() => import('../pages/FavoritesPage'));
const SweepFeedbackPage = lazy(() => import('../pages/FeedbackPage'));
const SweepFieldsPage = lazy(() => import('../pages/FieldsPage'));
const SweepFinancePage = lazy(() => import('../pages/FinancePage'));
const SweepHelpPage = lazy(() => import('../pages/HelpPage'));
const SweepHistoryPage = lazy(() => import('../pages/HistoryPage'));
const SweepImportPage = lazy(() => import('../pages/ImportPage'));
const SweepInboxPage = lazy(() => import('../pages/InboxPage'));
const SweepInsuranceCoveragesPage = lazy(() => import('../pages/InsuranceCoveragesPage'));
const SweepInvoicesPage = lazy(() => import('../pages/InvoicesPage'));
const SweepLabelsPage = lazy(() => import('../pages/LabelsPage'));
const SweepLanguagePage = lazy(() => import('../pages/LanguagePage'));
const SweepLoadingPage = lazy(() => import('../pages/LoadingPage'));
const SweepLogsPage = lazy(() => import('../pages/LogsPage'));
const SweepMembersPage = lazy(() => import('../pages/MembersPage'));
const SweepMessagesPage = lazy(() => import('../pages/MessagesPage'));
const SweepMobilePage = lazy(() => import('../pages/MobilePage'));
const SweepNotFoundPage = lazy(() => import('../pages/NotFoundPage'));
const SweepNotificationsPage = lazy(() => import('../pages/NotificationsPage'));
const SweepOnboardingPage = lazy(() => import('../pages/OnboardingPage'));
const SweepPaymentsPage = lazy(() => import('../pages/PaymentsPage'));
const SweepPermissionsPage = lazy(() => import('../pages/PermissionsPage'));
const SweepPopularPage = lazy(() => import('../pages/PopularPage'));
const SweepPreferencesPage = lazy(() => import('../pages/PreferencesPage'));
const SweepPrivacyPage = lazy(() => import('../pages/PrivacyPage'));
const SweepReceiptsPage = lazy(() => import('../pages/ReceiptsPage'));
const SweepRecentPage = lazy(() => import('../pages/RecentPage'));
const SweepReportingPage = lazy(() => import('../pages/ReportingPage'));
const SweepRestorePage = lazy(() => import('../pages/RestorePage'));
const SweepResultsPage = lazy(() => import('../pages/ResultsPage'));
const SweepRolesPage = lazy(() => import('../pages/RolesPage'));
const SweepSearchPage = lazy(() => import('../pages/SearchPage'));
const SweepSecurityPage = lazy(() => import('../pages/SecurityPage'));
const SweepServerErrorPage = lazy(() => import('../pages/ServerErrorPage'));
const SweepSessionsPage = lazy(() => import('../pages/SessionsPage'));
const SweepSettingsPage = lazy(() => import('../pages/SettingsPage'));
const SweepSharePage = lazy(() => import('../pages/SharePage'));
const SweepSubscriptionPage = lazy(() => import('../pages/SubscriptionPage'));
const SweepSyncPage = lazy(() => import('../pages/SyncPage'));
const SweepTagsPage = lazy(() => import('../pages/TagsPage'));
const SweepTeamPage = lazy(() => import('../pages/TeamPage'));
const SweepTermsPage = lazy(() => import('../pages/TermsPage'));
const SweepThemePage = lazy(() => import('../pages/ThemePage'));
const SweepTrashPage = lazy(() => import('../pages/TrashPage'));
const SweepTrendingPage = lazy(() => import('../pages/TrendingPage'));
const SweepTutorialPage = lazy(() => import('../pages/TutorialPage'));
const SweepUnauthorizedPage = lazy(() => import('../pages/UnauthorizedPage'));
const SweepWelcomePage = lazy(() => import('../pages/WelcomePage'));
const SweepProductsPage = lazy(() => import('../pages/Generated/Page1'));
const SweepOrdersPage = lazy(() => import('../pages/Generated/Page2'));
const SweepProfilePage = lazy(() => import('../pages/Generated/Page3'));

export const publicRoutes = [
  {
    path: '/',
    component: HomePage,
    title: 'Home - AFRERA Agriculture Platform',
    description: 'Welcome to AFRERA - Your comprehensive agriculture and rural economy platform',
    keywords: 'agriculture, farming, rural economy, marketplace',
    transition: 'fade',
  },
  {
    path: '/about',
    component: AboutPage,
    title: 'About AFRERA - Who The Platform Is For',
    description: 'AFRERA connects farmers, buyers, government, financial institutions and service providers on one platform',
    keywords: 'about, stakeholders, mission, agriculture platform',
    transition: 'fade',
  },
  {
    path: '/marketplace',
    component: MarketplacePage,
    title: 'Marketplace - Buy & Sell Agricultural Products',
    description: 'Browse and purchase fresh produce, seeds, and agricultural products directly from farmers',
    keywords: 'marketplace, buy, sell, agricultural products, farming',
    transition: 'slide',
    preload: true,
  },
  {
    path: '/premium-marketplace',
    component: PremiumMarketplacePage,
    title: 'Premium Marketplace - Certified Agricultural Products',
    description: 'Premium marketplace with certified, high-quality agricultural products for bulk buyers',
    keywords: 'premium, marketplace, certified, bulk, agriculture',
    transition: 'slide',
    preload: true,
  },
  {
    path: '/ai-image-generator',
    component: AIImageGenerator,
    title: 'AI Image Generator - Create Product Photos',
    description: 'Generate professional product images using AI for your agricultural products',
    keywords: 'ai, image, generator, product, photography',
    transition: 'fade',
  },
  {
    path: '/nutrition-calculator',
    component: NutritionCalculatorPage,
    title: 'Nutrition Calculator - Personalized Nutrition Plan',
    description: 'Calculate your daily nutrition requirements and get personalized recommendations',
    keywords: 'nutrition, calculator, diet, health, calories',
    transition: 'slide',
  },
  {
    path: '/natural-therapist',
    component: NaturalTherapistPage,
    title: 'Natural Therapists - Wellness & Ayurveda Consultations',
    description: 'Connect with certified natural healers for personalized wellness consultations',
    keywords: 'therapist, wellness, ayurveda, natural, health',
    transition: 'slide',
  },
  {
    path: '/public-data-extractor',
    component: PublicDataExtractorPage,
    title: 'Public Data Extractor - Governed Data Ingestion',
    description: 'Register, filter, and audit approved public data sources',
    keywords: 'public data, extraction, provenance, audit, database',
    transition: 'slide',
  },
  {
    path: '/payment-gateway',
    component: PaymentGatewayPage,
    title: 'Payment Gateway - Secure Transactions',
    description: 'Process secure payments through multiple payment gateways',
    keywords: 'payment, gateway, transactions, secure',
    transition: 'slide',
  },
  {
    path: '/wallet',
    component: DigitalWalletPage,
    title: 'Digital Wallet - Manage Your Funds',
    description: 'Manage your digital wallet, check balance, and view transactions',
    keywords: 'wallet, digital, balance, funds',
    transition: 'slide',
  },
  {
    path: '/transactions',
    component: TransactionHistoryPage,
    title: 'Transaction History - Track Your Payments',
    description: 'View your complete transaction history and payment status',
    keywords: 'transactions, history, payments, tracking',
    transition: 'slide',
  },
  {
    path: '/products/:id',
    component: ProductDetailPage,
    title: 'Product Details',
    description: 'View detailed information about agricultural products',
    keywords: 'product, details, agriculture',
    transition: 'fade',
    preload: true,
  },
  {
    path: '/login',
    component: LoginPage,
    title: 'Login - AFRERA',
    description: 'Sign in to your AFRERA account',
    keywords: 'login, sign in, authentication',
    transition: 'fade',
    noIndex: true,
  },
  {
    path: '/register',
    component: RegisterPage,
    title: 'Register - AFRERA',
    description: 'Create your AFRERA account',
    keywords: 'register, sign up, create account',
    transition: 'fade',
    noIndex: true,
  },
  {
    path: '/farmer-entrance',
    component: FarmerEntranceHubPage,
    title: 'Farmer Portal - AFRERA',
    description: 'Access farmer services and resources',
    keywords: 'farmer, portal, services',
    transition: 'slide',
  },
  {
    path: '/farmer-entrance/sell',
    component: FarmerSellDoorPage,
    title: 'Sell Your Produce - AFRERA',
    description: 'Sell your agricultural products on our marketplace',
    keywords: 'sell, produce, marketplace',
    transition: 'fade',
  },
  {
    path: '/farmer-entrance/household',
    component: FarmerHouseholdDoorPage,
    title: 'Household Services - AFRERA',
    description: 'Household services for farmers',
    keywords: 'household, services, farmer',
    transition: 'fade',
  },
  {
    path: '/farmer-entrance/field',
    component: FarmerFieldDoorPage,
    title: 'Field Management - AFRERA',
    description: 'Manage your fields and crops',
    keywords: 'field, management, crops',
    transition: 'fade',
  },
  {
    path: '/farmer-entrance/shared',
    component: FarmerSharedDoorPage,
    title: 'Shared Resources - AFRERA',
    description: 'Access shared farming resources',
    keywords: 'shared, resources, farming',
    transition: 'fade',
  },
  {
    path: '/pricing/forward',
    component: ForwardPricingPage,
    title: 'Forward Pricing - AFRERA',
    description: 'View forward pricing for agricultural commodities',
    keywords: 'forward, pricing, commodities',
    transition: 'fade',
  },
  {
    path: '/climate',
    component: ClimateWeatherPage,
    title: 'Climate & Weather - AFRERA',
    description: 'Weather forecasts and climate information for farmers',
    keywords: 'climate, weather, forecast, farming',
    transition: 'fade',
  },
  {
    path: '/corridor-economics',
    component: CorridorEconomicsPage,
    title: 'Corridor Economics - AFRERA',
    description: 'Economic analysis of agricultural corridors',
    keywords: 'corridor, economics, agriculture',
    transition: 'fade',
  },
  {
    path: '/land-use',
    component: LandUseCarbonPage,
    title: 'Land Use & Carbon - AFRERA',
    description: 'Land use and carbon credit information',
    keywords: 'land use, carbon, credits, agriculture',
    transition: 'fade',
  },
  {
    path: '/library',
    component: LibraryBrowserPage,
    title: 'Library - AFRERA',
    description: 'Browse the module and knowledge library',
    keywords: 'library, knowledge, modules, catalogue',
    transition: 'fade',
  },
  {
    path: '/library-knowledge',
    component: LibraryBrowserPage,
    title: 'Library Knowledge - AFRERA',
    description: 'Search indexed files, modules, and connectivity evidence',
    keywords: 'library, knowledge, modules, catalogue, connectivity',
    transition: 'fade',
  },
];

/**
 * Protected routes - authentication required
 */
export const protectedRoutes = [
  {
    path: '/ai-copilots',
    component: CopilotHubPage,
    title: 'AI Copilots - AFRERA',
    description: 'Domain-specific AI assistants for finance, logistics, warehouse, insurance, nutrition, and marketplace',
    keywords: 'ai, copilot, assistant, finance, logistics, warehouse, insurance, nutrition, marketplace',
    transition: 'fade',
  },
  {
    path: '/ai/copilot',
    component: CopilotHubPage,
    title: 'AI Copilot - AFRERA',
    description: 'AI-powered agricultural assistance with intelligent advisory and decision support',
    keywords: 'ai, copilot, advisory, decision support, agricultural assistance',
    transition: 'fade',
  },
  {
    path: '/cart',
    component: CartPage,
    title: 'Shopping Cart - AFRERA',
    description: 'View and manage your shopping cart',
    keywords: 'cart, shopping, checkout',
    transition: 'slide',
    preload: true,
  },
  {
    path: '/checkout',
    component: CheckoutPage,
    title: 'Checkout - AFRERA',
    description: 'Complete your purchase',
    keywords: 'checkout, payment, order',
    transition: 'fade',
    noIndex: true,
  },
  {
    path: '/orders/:id',
    component: OrderDetailPage,
    title: 'Order Details - AFRERA',
    description: 'View your order confirmation and status',
    keywords: 'order, confirmation, status',
    transition: 'fade',
    noIndex: true,
  },
  {
    path: '/dashboard',
    component: DashboardPage,
    title: 'Dashboard - AFRERA',
    description: 'Your personalized dashboard',
    keywords: 'dashboard, overview, account',
    transition: 'fade',
  },
  {
    path: '/my-wallet',
    component: WalletPage,
    title: 'Wallet - AFRERA',
    description: 'Manage your digital wallet and payments',
    keywords: 'wallet, payments, digital',
    transition: 'fade',
  },
  {
    path: '/escrow',
    component: EscrowPage,
    title: 'Escrow Management - AFRERA',
    description: 'Manage escrow transactions between buyers and farmers',
    keywords: 'escrow, secure payments, fund holding',
    transition: 'fade',
  },
  {
    path: '/farmer-revenue-ledger',
    component: FarmerRevenueLedgerPage,
    title: 'Farmer Revenue Ledger - AFRERA',
    description: 'View farmer revenue data and Farmer Value Engine calculations',
    keywords: 'revenue, ledger, farmer value, FVI',
    transition: 'fade',
  },
  {
    path: '/disruption',
    component: DisruptionPage,
    title: 'Civil Disruption Management - AFRERA',
    description: 'Report and manage civil disruptions affecting agricultural logistics',
    keywords: 'disruption, blockade, bandh, logistics, crisis',
    transition: 'fade',
  },
  {
    path: '/reports/dashboard',
    component: ReportsDashboardPage,
    title: 'Reports Dashboard - AFRERA',
    description: 'Central hub for all reports and analytics',
    keywords: 'reports, dashboard, analytics',
    transition: 'fade',
  },
  {
    path: '/reports/financial',
    component: FinancialReportPage,
    title: 'Financial Report - AFRERA',
    description: 'Financial performance and revenue reports',
    keywords: 'financial, report, revenue',
    transition: 'fade',
  },
  {
    path: '/reports/sales',
    component: SalesReportPage,
    title: 'Sales Report - AFRERA',
    description: 'Sales performance and transaction reports',
    keywords: 'sales, report, transactions',
    transition: 'fade',
  },
  {
    path: '/reports/inventory',
    component: InventoryReportPage,
    title: 'Inventory Report - AFRERA',
    description: 'Inventory levels and stock reports',
    keywords: 'inventory, report, stock',
    transition: 'fade',
  },
  {
    path: '/reports/operations',
    component: OperationsReportPage,
    title: 'Operations Report - AFRERA',
    description: 'Operational efficiency and process reports',
    keywords: 'operations, report, efficiency',
    transition: 'fade',
  },
  {
    path: '/reports/audit',
    component: AuditReportPage,
    title: 'Audit Report - AFRERA',
    description: 'Audit trail and compliance reports',
    keywords: 'audit, report, compliance',
    transition: 'fade',
  },
  {
    path: '/reports/farmer',
    component: FarmerReportPage,
    title: 'Farmer Report - AFRERA',
    description: 'Farmer performance and engagement reports',
    keywords: 'farmer, report, engagement',
    transition: 'fade',
  },
  {
    path: '/financial/credit-score',
    component: CreditScorePage,
    title: 'Credit Score - AFRERA',
    description: 'Credit score assessment and monitoring',
    keywords: 'credit, score, assessment',
    transition: 'fade',
  },
  {
    path: '/financial/emi-calculator',
    component: EMICalculatorPage,
    title: 'EMI Calculator - AFRERA',
    description: 'EMI calculator for loans and financing',
    keywords: 'emi, calculator, loan',
    transition: 'fade',
  },
  {
    path: '/marketplace/bulk-purchase',
    component: BulkPurchasePage,
    title: 'Bulk Purchase - AFRERA',
    description: 'Bulk purchase orders and wholesale buying',
    keywords: 'bulk, purchase, wholesale',
    transition: 'fade',
  },
  {
    path: '/marketplace/group-buying',
    component: GroupBuyingPage,
    title: 'Group Buying - AFRERA',
    description: 'Group buying initiatives and collective purchasing',
    keywords: 'group, buying, collective',
    transition: 'fade',
  },
  {
    path: '/marketplace/contracts',
    component: ContractListingPage,
    title: 'Contracts - AFRERA',
    description: 'Contract listings and management',
    keywords: 'contracts, listings, management',
    transition: 'fade',
  },
  {
    path: '/analytics/advanced-search',
    component: AdvancedSearchPage,
    title: 'Advanced Search - AFRERA',
    description: 'Comprehensive search across products, farmers, and market data',
    keywords: 'search, advanced, analytics',
    transition: 'fade',
  },
  {
    path: '/analytics/weather',
    component: WeatherAnalyticsPage,
    title: 'Weather Analytics - AFRERA',
    description: 'Weather monitoring and agricultural planning',
    keywords: 'weather, analytics, monitoring',
    transition: 'fade',
  },
  {
    path: '/analytics/market-intelligence',
    component: MarketIntelligencePage,
    title: 'Market Intelligence - AFRERA',
    description: 'Market trends, price analysis, and demand forecasting',
    keywords: 'market, intelligence, trends',
    transition: 'fade',
  },
  {
    path: '/analytics/supply-chain',
    component: SupplyChainAnalyticsPage,
    title: 'Supply Chain Analytics - AFRERA',
    description: 'End-to-end supply chain visibility and analytics',
    keywords: 'supply, chain, analytics',
    transition: 'fade',
  },
  {
    path: '/risk/management',
    component: RiskManagementPage,
    title: 'Risk Management - AFRERA',
    description: 'Risk assessment, mitigation, and monitoring',
    keywords: 'risk, management, assessment',
    transition: 'fade',
  },
  {
    path: '/sustainability/dashboard',
    component: SustainabilityDashboardPage,
    title: 'Sustainability Dashboard - AFRERA',
    description: 'Environmental impact and sustainability metrics',
    keywords: 'sustainability, environment, metrics',
    transition: 'fade',
  },
  {
    path: '/compliance/dashboard',
    component: ComplianceDashboardPage,
    title: 'Compliance Dashboard - AFRERA',
    description: 'Regulatory compliance and certification tracking',
    keywords: 'compliance, regulatory, certification',
    transition: 'fade',
  },
  {
    path: '/quality/control',
    component: QualityControlPage,
    title: 'Quality Control - AFRERA',
    description: 'Quality assurance and product quality management',
    keywords: 'quality, control, assurance',
    transition: 'fade',
  },
  {
    path: '/export/documentation',
    component: ExportDocumentationPage,
    title: 'Export Documentation - AFRERA',
    description: 'Export documentation and international trade compliance',
    keywords: 'export, documentation, trade',
    transition: 'fade',
  },
  {
    path: '/traceability/product',
    component: TraceabilityPage,
    title: 'Product Traceability - AFRERA',
    description: 'Product traceability and origin verification',
    keywords: 'traceability, origin, verification',
    transition: 'fade',
  },
  {
    path: '/knowledge/base',
    component: KnowledgeBasePage,
    title: 'Knowledge Base - AFRERA',
    description: 'Agricultural knowledge repository and best practices',
    keywords: 'knowledge, base, practices',
    transition: 'fade',
  },
  {
    path: '/training/academy',
    component: TrainingAcademyPage,
    title: 'Training Academy - AFRERA',
    description: 'Farmer training and educational resources',
    keywords: 'training, academy, education',
    transition: 'fade',
  },
  {
    path: '/community/forum',
    component: CommunityForumPage,
    title: 'Community Forum - AFRERA',
    description: 'Farmer community and discussion platform',
    keywords: 'community, forum, discussion',
    transition: 'fade',
  },
  {
    path: '/support/center',
    component: SupportCenterPage,
    title: 'Support Center - AFRERA',
    description: 'Help desk and customer support',
    keywords: 'support, help, assistance',
    transition: 'fade',
  },
  {
    path: '/bank-passport',
    component: BankPassportPage,
    title: 'Bank Passport - AFRERA',
    description: 'Your digital banking passport',
    keywords: 'bank, passport, digital identity',
    transition: 'fade',
  },
  {
    path: '/forms',
    component: FormManagementPage,
    title: 'Form Management - AFRERA',
    description: 'Manage your forms and applications',
    keywords: 'forms, management, applications',
    transition: 'fade',
  },
  {
    path: '/analytics',
    component: AnalyticsPage,
    title: 'Analytics - AFRERA',
    description: 'View your analytics and insights',
    keywords: 'analytics, insights, data',
    transition: 'fade',
  },
  {
    path: '/reports',
    component: ReportsDashboardPage,
    title: 'Reports Dashboard - AFRERA',
    description: 'Generate and manage comprehensive reports',
    keywords: 'reports, dashboard, analytics',
    transition: 'fade',
  },
  {
    path: '/marketplace/contract-listing',
    component: ContractListingPage,
    title: 'Contract Listings - AFRERA',
    description: 'Browse farming contracts',
    keywords: 'contract, farming, agreement',
    transition: 'fade',
  },
  {
    path: '/modules',
    component: ModuleHubPage,
    title: 'Module Hub - AFRERA',
    description: 'Access all available modules',
    keywords: 'modules, hub, features',
    transition: 'fade',
    role: 'admin',
  },
];

/**
 * Farmer-only routes
 */
export const farmerRoutes = [
  {
    path: '/farmer-portal',
    component: FarmerPortalPage,
    title: 'Farmer Portal - AFRERA',
    description: 'Your dedicated farmer portal',
    keywords: 'farmer, portal, dashboard',
    transition: 'slide',
  },
  {
    path: '/farmerhome',
    component: FarmerHomePage,
    title: 'Farmer Home - AFRERA',
    description: 'Your farmer home dashboard',
    keywords: 'farmer, home, dashboard',
    transition: 'fade',
  },
  {
    path: '/farmer-sell',
    component: FarmerSellPage,
    title: 'Sell Produce - AFRERA',
    description: 'Sell your agricultural produce',
    keywords: 'sell, produce, farmer',
    transition: 'fade',
  },
  {
    path: '/farmer-field',
    component: FarmerFieldPage,
    title: 'Field Management - AFRERA',
    description: 'Manage your agricultural fields',
    keywords: 'field, management, farmer',
    transition: 'fade',
  },
  {
    path: '/pre-season-purchase',
    component: PreSeasonPurchasePage,
    title: 'Pre-Season Purchase - AFRERA',
    description: 'Manage pre-season purchase agreements for guaranteed income',
    keywords: 'pre-season, purchase, agreements, advance',
    transition: 'fade',
  },
  {
    path: '/contract-farming',
    component: ContractFarmingPage,
    title: 'Contract Farming - AFRERA',
    description: 'Manage long-term farming contracts with technical assistance',
    keywords: 'contract, farming, technical, assistance',
    transition: 'fade',
  },
  {
    path: '/household-procurement',
    component: HouseholdProcurementPage,
    title: 'Household Procurement - AFRERA',
    description: 'Plan household food procurement with budget optimization',
    keywords: 'household, procurement, budget, delivery',
    transition: 'fade',
  },
  {
    path: '/government-subsidy',
    component: GovernmentSubsidyPage,
    title: 'Government Subsidy - AFRERA',
    description: 'Apply for and track government agricultural subsidy programs',
    keywords: 'subsidy, government, programs, applications',
    transition: 'fade',
  },
  {
    path: '/harvest-plan',
    component: HarvestPlanPage,
    title: 'Harvest Planning - AFRERA',
    description: 'Plan your harvest schedule',
    keywords: 'harvest, planning, schedule',
    transition: 'fade',
  },
  {
    path: '/harvest-score',
    component: HarvestScorePage,
    title: 'Harvest Score - AFRERA',
    description: 'View your harvest performance score',
    keywords: 'harvest, score, performance',
    transition: 'fade',
  },
  {
    path: '/what-grow',
    component: WhatGrowPage,
    title: 'What to Grow - AFRERA',
    description: 'Get recommendations on what to grow',
    keywords: 'grow, recommendations, crops',
    transition: 'fade',
  },
  {
    path: '/seed-vault',
    component: SeedVaultPage,
    title: 'Seed Vault - AFRERA',
    description: 'Access seed varieties and information',
    keywords: 'seeds, vault, varieties',
    transition: 'fade',
  },
  {
    path: '/farm-advisor',
    component: FarmAdvisorPage,
    title: 'Farm Advisor - AFRERA',
    description: 'Get expert farming advice',
    keywords: 'advisor, farming, expert',
    transition: 'fade',
  },
  {
    path: '/price-check',
    component: PriceCheckPage,
    title: 'Price Check - AFRERA',
    description: 'Check current market prices',
    keywords: 'price, check, market',
    transition: 'fade',
  },
  {
    path: '/price-build',
    component: PriceBuildPage,
    title: 'Price Builder - AFRERA',
    description: 'Build your pricing strategy',
    keywords: 'price, builder, strategy',
    transition: 'fade',
  },
  {
    path: '/dynamic-pricing',
    component: DynamicPricingPage,
    title: 'Dynamic Pricing - AFRERA',
    description: 'Dynamic pricing tools',
    keywords: 'dynamic, pricing, tools',
    transition: 'fade',
  },
  {
    path: '/sell-timing',
    component: SellTimingPage,
    title: 'Sell Timing - AFRERA',
    description: 'Optimize your sell timing',
    keywords: 'sell, timing, optimize',
    transition: 'fade',
  },
  {
    path: '/compare',
    component: ComparePage,
    title: 'Compare - AFRERA',
    description: 'Compare products and prices',
    keywords: 'compare, products, prices',
    transition: 'fade',
  },
  {
    path: '/discover',
    component: DiscoverPage,
    title: 'Discover - AFRERA',
    description: 'Discover new opportunities',
    keywords: 'discover, opportunities, farming',
    transition: 'fade',
  },
  {
    path: '/pre-order',
    component: PreOrderPage,
    title: 'Pre-Order - AFRERA',
    description: 'Pre-order agricultural products',
    keywords: 'pre-order, products, farming',
    transition: 'fade',
  },
  {
    path: '/logistics',
    component: LogisticsPage,
    title: 'Logistics - AFRERA',
    description: 'Manage your logistics and shipping',
    keywords: 'logistics, shipping, transport',
    transition: 'fade',
  },
  {
    path: '/insurance',
    component: InsurancePage,
    title: 'Insurance - AFRERA',
    description: 'Agricultural insurance options',
    keywords: 'insurance, agricultural, protection',
    transition: 'fade',
  },
  {
    path: '/ledger',
    component: LedgerPage,
    title: 'Ledger - AFRERA',
    description: 'Your financial ledger',
    keywords: 'ledger, financial, accounting',
    transition: 'fade',
  },
  {
    path: '/compliance',
    component: CompliancePage,
    title: 'Compliance - AFRERA',
    description: 'Compliance and regulatory information',
    keywords: 'compliance, regulatory, farming',
    transition: 'fade',
  },
  {
    path: '/procurement',
    component: RfqPage,
    title: 'Procurement - AFRERA',
    description: 'Procurement and RFQ management',
    keywords: 'procurement, RFQ, purchasing',
    transition: 'fade',
  },
  {
    path: '/asset-accounting',
    component: AssetAccountingPage,
    title: 'Asset Accounting - AFRERA',
    description: 'Manage your agricultural assets',
    keywords: 'asset, accounting, management',
    transition: 'fade',
  },
  {
    path: '/cost-control',
    component: CostControlPage,
    title: 'Cost Control - AFRERA',
    description: 'Control your farming costs',
    keywords: 'cost, control, budget',
    transition: 'fade',
  },
  {
    path: '/project-systems',
    component: ProjectSystemsPage,
    title: 'Project Systems - AFRERA',
    description: 'Manage your farming projects',
    keywords: 'project, systems, management',
    transition: 'fade',
  },
  {
    path: '/yield-management',
    component: YieldManagementPage,
    title: 'Yield Management - AFRERA',
    description: 'Optimize your crop yields',
    keywords: 'yield, management, optimization',
    transition: 'fade',
  },
  {
    path: '/competitive-position',
    component: CompetitivePositionPage,
    title: 'Competitive Position - AFRERA',
    description: 'Analyze your competitive position',
    keywords: 'competitive, position, analysis',
    transition: 'fade',
  },
  {
    path: '/experience',
    component: ExperienceLayerPage,
    title: 'Experience Layer - AFRERA',
    description: 'Your farming experience layer',
    keywords: 'experience, layer, farming',
    transition: 'fade',
  },
];

/**
 * Admin-only routes
 */
export const adminRoutes = [
  {
    path: '/users',
    component: AuthorizationPage,
    title: 'User Management - AFRERA',
    description: 'Manage platform users',
    keywords: 'users, management, admin',
    transition: 'fade',
    role: 'admin',
  },
  {
    path: '/admin/settings',
    component: AdminDashboardPage,
    title: 'Admin Settings - AFRERA',
    description: 'Platform administration settings',
    keywords: 'admin, settings, configuration',
    transition: 'fade',
    role: 'admin',
  },
  {
    path: '/fpo-dashboard',
    component: FPODashboardPage,
    title: 'FPO Dashboard - AFRERA',
    description: 'Farmer Producer Organization dashboard',
    keywords: 'FPO, dashboard, organization',
    transition: 'fade',
    role: 'admin',
  },
  {
    path: '/admin/crop-value-review',
    component: CropValueReviewPage,
    title: 'Crop Value Review - AFRERA',
    description: 'Review AI-suggested crop value-compound reference data before publication',
    keywords: 'admin, crop, nutrient, review, ai',
    transition: 'fade',
    role: 'admin',
  },
];

/**
 * Dashboard routes for different roles
 */
export const dashboardRoutes = [
  {
    path: '/banker-dashboard',
    component: BankerDashboardPage,
    title: 'Banker Dashboard - AFRERA',
    description: 'Banking dashboard for financial partners',
    keywords: 'banker, dashboard, financial',
    transition: 'fade',
    role: 'banker',
  },
  {
    path: '/ca-dashboard',
    component: CADashboardPage,
    title: 'CA Dashboard - AFRERA',
    description: 'Chartered Accountant dashboard',
    keywords: 'CA, dashboard, accounting',
    transition: 'fade',
    role: 'ca',
  },
  {
    path: '/government-dashboard',
    component: GovernmentDashboardPage,
    title: 'Government Dashboard - AFRERA',
    description: 'Government oversight dashboard',
    keywords: 'government, dashboard, oversight',
    transition: 'fade',
    role: 'government',
  },
  {
    path: '/research-dashboard',
    component: ResearchDashboardPage,
    title: 'Research Dashboard - AFRERA',
    description: 'Agricultural research dashboard',
    keywords: 'research, dashboard, agriculture',
    transition: 'fade',
    role: 'researcher',
  },
  {
    path: '/corporate-buyer',
    component: CorporateBuyerPage,
    title: 'Corporate Buyer - AFRERA',
    description: 'Corporate procurement dashboard',
    keywords: 'corporate, buyer, procurement',
    transition: 'fade',
    role: 'corporate',
  },
  // Tier 1 Advanced Services Dashboards
  {
    path: '/advanced-analytics',
    component: AdvancedAnalyticsDashboard,
    title: 'Advanced Analytics - AFRERA',
    description: 'Production-level analytics and business intelligence',
    keywords: 'analytics, business intelligence, data',
    transition: 'fade',
    role: 'admin',
  },
  {
    path: '/predictive-intelligence',
    component: PredictiveIntelligencePage,
    title: 'Predictive Intelligence - AFRERA',
    description: 'AI-powered predictions and forecasting',
    keywords: 'AI, predictions, forecasting, intelligence',
    transition: 'fade',
    role: 'admin',
  },
  {
    path: '/iot-monitoring',
    component: IoTMonitoringDashboard,
    title: 'IoT Monitoring - AFRERA',
    description: 'IoT device monitoring and management',
    keywords: 'IoT, sensors, monitoring, devices',
    transition: 'fade',
    role: 'farmer',
  },
  {
    path: '/blockchain-verification',
    component: BlockchainVerificationPage,
    title: 'Blockchain Verification - AFRERA',
    description: 'Blockchain-based product verification and traceability',
    keywords: 'blockchain, verification, traceability, supply chain',
    transition: 'fade',
    role: 'admin',
  },
  {
    path: '/digital-twin',
    component: DigitalTwinPage,
    title: 'Digital Twin - AFRERA',
    description: 'Digital twin management and simulation',
    keywords: 'digital twin, simulation, modeling',
    transition: 'fade',
    role: 'farmer',
  },
  {
    path: '/enterprise-integration',
    component: EnterpriseIntegrationPage,
    title: 'Enterprise Integration - AFRERA',
    description: 'Enterprise system integration management',
    keywords: 'enterprise, integration, ERP, API',
    transition: 'fade',
    role: 'admin',
  },
  // Additional Production Dashboards
  {
    path: '/financial-services',
    component: FinancialServicesDashboard,
    title: 'Financial Services - AFRERA',
    description: 'Financial services overview and management',
    keywords: 'financial, services, loans, insurance',
    transition: 'fade',
    role: 'admin',
  },
  {
    path: '/operational-dashboard',
    component: OperationalDashboard,
    title: 'Operations Dashboard - AFRERA',
    description: 'Operational monitoring and management',
    keywords: 'operations, monitoring, management',
    transition: 'fade',
    role: 'admin',
  },
  // Financial Services Pages
  {
    path: '/loan-management',
    component: LoanManagementPage,
    title: 'Loan Management - AFRERA',
    description: 'Loan application and management',
    keywords: 'loan, credit, finance',
    transition: 'fade',
    role: 'farmer',
  },
  {
    path: '/insurance-management',
    component: InsuranceManagementPage,
    title: 'Insurance Management - AFRERA',
    description: 'Insurance policy management',
    keywords: 'insurance, policy, coverage',
    transition: 'fade',
    role: 'farmer',
  },
  {
    path: '/payment-processing',
    component: PaymentProcessingPage,
    title: 'Payment Processing - AFRERA',
    description: 'Payment processing and transaction management',
    keywords: 'payment, transaction, finance',
    transition: 'fade',
    role: 'farmer',
  },
  {
    path: '/logistics-provider',
    component: LogisticsProviderPage,
    title: 'Logistics Provider - AFRERA',
    description: 'Logistics provider portal',
    keywords: 'logistics, provider, transport',
    transition: 'fade',
    role: 'logistics',
  },
];

/**
 * Management routes
 */
export const managementRoutes = [
  {
    path: '/farmer-profile',
    component: FarmerProfilePage,
    title: 'Farmer Profile - AFRERA',
    description: 'Manage your farmer profile',
    keywords: 'farmer, profile, management',
    transition: 'fade',
  },
  {
    path: '/farmer-family',
    component: FarmerFamilyPage,
    title: 'Family Information - AFRERA',
    description: 'Family information and details',
    keywords: 'family, information, farmer',
    transition: 'fade',
  },
  {
    path: '/farmer-verification',
    component: FarmerVerificationPage,
    title: 'Farmer Verification - AFRERA',
    description: 'Farmer verification status',
    keywords: 'verification, farmer, status',
    transition: 'fade',
  },
  {
    path: '/farmer-skills',
    component: FarmerSkillPage,
    title: 'Farmer Skills - AFRERA',
    description: 'Skills and certifications',
    keywords: 'skills, certifications, farmer',
    transition: 'fade',
  },
  {
    path: '/farmer-welfare',
    component: FarmerHealthWelfarePage,
    title: 'Health & Welfare - AFRERA',
    description: 'Health and welfare programs',
    keywords: 'health, welfare, farmer',
    transition: 'fade',
  },
  {
    path: '/crop-calendar',
    component: CropCalendarPage,
    title: 'Crop Calendar - AFRERA',
    description: 'Your crop planting calendar',
    keywords: 'crop, calendar, planting',
    transition: 'fade',
  },
  {
    path: '/crop-registration',
    component: CropRegistrationPage,
    title: 'Crop Registration - AFRERA',
    description: 'Register your crops',
    keywords: 'crop, registration, farming',
    transition: 'fade',
  },
  {
    path: '/crop-variety',
    component: CropVarietyPage,
    title: 'Crop Varieties - AFRERA',
    description: 'Crop variety information',
    keywords: 'crop, variety, information',
    transition: 'fade',
  },
  {
    path: '/seed-planning',
    component: SeedPlanningPage,
    title: 'Seed Planning - AFRERA',
    description: 'Plan your seed requirements',
    keywords: 'seed, planning, requirements',
    transition: 'fade',
  },
  {
    path: '/nursery-management',
    component: NurseryManagementPage,
    title: 'Nursery Management - AFRERA',
    description: 'Manage your nursery',
    keywords: 'nursery, management, farming',
    transition: 'fade',
  },
  {
    path: '/crop-monitoring',
    component: CropMonitoringPage,
    title: 'Crop Monitoring - AFRERA',
    description: 'Monitor your crops',
    keywords: 'crop, monitoring, farming',
    transition: 'fade',
  },
  {
    path: '/land-management',
    component: LandManagementPage,
    title: 'Land Management - AFRERA',
    description: 'Manage your land holdings',
    keywords: 'land, management, farming',
    transition: 'fade',
  },
  {
    path: '/input-supply',
    component: InputSupplyManagementPage,
    title: 'Input Supply - AFRERA',
    description: 'Manage agricultural inputs',
    keywords: 'input, supply, farming',
    transition: 'fade',
  },
  {
    path: '/livestock-management',
    component: LivestockManagementPage,
    title: 'Livestock Management - AFRERA',
    description: 'Manage your livestock',
    keywords: 'livestock, management, farming',
    transition: 'fade',
  },
  {
    path: '/community-management',
    component: CommunityManagementPage,
    title: 'Community Management - AFRERA',
    description: 'Community management tools',
    keywords: 'community, management, farming',
    transition: 'fade',
  },
  {
    path: '/soil-management',
    component: SoilManagementPage,
    title: 'Soil Management - AFRERA',
    description: 'Soil health and management',
    keywords: 'soil, management, health',
    transition: 'fade',
  },
  {
    path: '/water-management',
    component: WaterManagementPage,
    title: 'Water Management - AFRERA',
    description: 'Water resource management',
    keywords: 'water, management, irrigation',
    transition: 'fade',
  },
  {
    path: '/subsidy-management',
    component: SubsidyManagementPage,
    title: 'Subsidy Management - AFRERA',
    description: 'Government subsidy management',
    keywords: 'subsidy, government, management',
    transition: 'fade',
  },
  {
    path: '/farm-costing',
    component: FarmCostingPage,
    title: 'Farm Costing - AFRERA',
    description: 'Farm costing and budgeting',
    keywords: 'farm, costing, budget',
    transition: 'fade',
  },
  {
    path: '/farmer-kyc',
    component: FarmerKycPage,
    title: 'Farmer KYC - AFRERA',
    description: 'Know Your Customer verification',
    keywords: 'KYC, verification, farmer',
    transition: 'fade',
  },
  {
    path: '/fertilizer-inventory',
    component: FertilizerInventoryPage,
    title: 'Fertilizer Inventory - AFRERA',
    description: 'Fertilizer inventory management',
    keywords: 'fertilizer, inventory, management',
    transition: 'fade',
  },
  {
    path: '/irrigation-management',
    component: IrrigationManagementPage,
    title: 'Irrigation Management - AFRERA',
    description: 'Irrigation system management',
    keywords: 'irrigation, management, water',
    transition: 'fade',
  },
  {
    path: '/labour-management',
    component: LabourManagementPage,
    title: 'Labour Management - AFRERA',
    description: 'Farm labour management',
    keywords: 'labour, management, workforce',
    transition: 'fade',
  },
  {
    path: '/land-registry',
    component: LandRegistryPage,
    title: 'Land Registry - AFRERA',
    description: 'Land registration and records',
    keywords: 'land, registry, records',
    transition: 'fade',
  },
  {
    path: '/orchard-management',
    component: OrchardManagementPage,
    title: 'Orchard Management - AFRERA',
    description: 'Orchard and fruit management',
    keywords: 'orchard, management, fruit',
    transition: 'fade',
  },
  {
    path: '/pond-management',
    component: PondManagementPage,
    title: 'Pond Management - AFRERA',
    description: 'Pond and water body management',
    keywords: 'pond, management, water',
    transition: 'fade',
  },
  {
    path: '/shg-management',
    component: ShgManagementPage,
    title: 'SHG Management - AFRERA',
    description: 'Self Help Group management',
    keywords: 'SHG, management, group',
    transition: 'fade',
  },
  {
    path: '/tractor-management',
    component: TractorManagementPage,
    title: 'Tractor Management - AFRERA',
    description: 'Tractor and equipment management',
    keywords: 'tractor, management, equipment',
    transition: 'fade',
  },
  {
    path: '/village-registry',
    component: VillageRegistryPage,
    title: 'Village Registry - AFRERA',
    description: 'Village registration and records',
    keywords: 'village, registry, records',
    transition: 'fade',
  },
  {
    path: '/sowing-management',
    component: SowingManagementPage,
    title: 'Sowing Management - AFRERA',
    description: 'Sowing and planting management',
    keywords: 'sowing, planting, management',
    transition: 'fade',
  },
  {
    path: '/climate-advisory',
    component: ClimateAdvisoryPage,
    title: 'Climate Advisory - AFRERA',
    description: 'Climate advisory and recommendations',
    keywords: 'climate, advisory, recommendations',
    transition: 'fade',
  },
  {
    path: '/dairy-management',
    component: DairyManagementPage,
    title: 'Dairy Management - AFRERA',
    description: 'Dairy farming management',
    keywords: 'dairy, management, farming',
    transition: 'fade',
  },
  {
    path: '/climate-monitoring',
    component: ClimateMonitoringPage,
    title: 'Climate Monitoring - AFRERA',
    description: 'Monitor climate conditions',
    keywords: 'climate, monitoring, weather',
    transition: 'fade',
  },
  {
    path: '/operations-management',
    component: OperationsManagementPage,
    title: 'Operations Management - AFRERA',
    description: 'Farm operations management',
    keywords: 'operations, management, farming',
    transition: 'fade',
  },
  {
    path: '/machinery-management',
    component: MachineryManagementPage,
    title: 'Machinery Management - AFRERA',
    description: 'Farm machinery management',
    keywords: 'machinery, management, equipment',
    transition: 'fade',
  },
  {
    path: '/horticulture-management',
    component: HorticultureManagementPage,
    title: 'Horticulture - AFRERA',
    description: 'Horticulture management',
    keywords: 'horticulture, management, farming',
    transition: 'fade',
  },
  {
    path: '/fisheries-management',
    component: FisheriesManagementPage,
    title: 'Fisheries - AFRERA',
    description: 'Fisheries management',
    keywords: 'fisheries, management, aquaculture',
    transition: 'fade',
  },
  {
    path: '/identity-management',
    component: IdentityManagementPage,
    title: 'Identity Management - AFRERA',
    description: 'Digital identity management',
    keywords: 'identity, management, digital',
    transition: 'fade',
    role: 'admin',
  },
  {
    path: '/platform-foundation',
    component: PlatformFoundationPage,
    title: 'Platform Foundation - AFRERA',
    description: 'Platform foundation services',
    keywords: 'platform, foundation, services',
    transition: 'fade',
    role: 'admin',
  },
  {
    path: '/enterprise-control',
    component: EnterpriseControlPage,
    title: 'Enterprise Control - AFRERA',
    description: 'Enterprise control systems',
    keywords: 'enterprise, control, systems',
    transition: 'fade',
    role: 'admin',
  },
  {
    path: '/account/mfa',
    component: MFASetupPage,
    title: 'Multi-Factor Authentication - AFRERA',
    description: 'Set up multi-factor authentication for your account',
    keywords: 'mfa, security, two-factor, authentication',
    transition: 'fade',
  },
  {
    path: '/account/privacy',
    component: GDPRConsentPage,
    title: 'Privacy & Consent - AFRERA',
    description: 'Manage data privacy and consent preferences',
    keywords: 'gdpr, privacy, consent, data',
    transition: 'fade',
  },
  {
    path: '/ai/chat',
    component: AIChatPage,
    title: 'AI Assistant - AFRERA',
    description: 'Chat with the AI coordinator',
    keywords: 'ai, chat, assistant, claude',
    transition: 'fade',
  },
  {
    path: '/ai/collaboration',
    component: AICollaborationPage,
    title: 'AI Collaboration - AFRERA',
    description: 'AI-Devin collaboration activity dashboard',
    keywords: 'ai, collaboration, devin, activity',
    transition: 'fade',
  },
  {
    path: '/platform/core',
    component: PlatformCoreDashboard,
    title: 'Platform Core Dashboard - AFRERA',
    description: 'Platform core management and monitoring dashboard',
    keywords: 'platform, core, dashboard, management',
    transition: 'fade',
    role: 'admin',
  },
  {
    path: '/ai/collaboration-dashboard',
    component: AICollaborationDashboard,
    title: 'AI Collaboration Dashboard - AFRERA',
    description: 'Monitor and manage Devin-Claude AI collaboration',
    keywords: 'ai, collaboration, dashboard, devin, claude',
    transition: 'fade',
    role: 'admin',
  },
  {
    path: '/admin/auto-generation',
    component: AutoGenerationDashboard,
    title: 'Auto Generation Dashboard - AFRERA',
    description: 'Monitor and manage automatic image generation',
    keywords: 'auto, generation, dashboard, admin',
    transition: 'fade',
    role: 'admin',
  },
  {
    path: '/account/mfa-setup',
    component: MFASetup,
    title: 'MFA Setup - AFRERA',
    description: 'Set up multi-factor authentication',
    keywords: 'mfa, setup, security, authentication',
    transition: 'fade',
  },
  {
    path: '/account/gdpr-consent',
    component: GDPRConsent,
    title: 'GDPR Consent - AFRERA',
    description: 'Manage GDPR privacy consent',
    keywords: 'gdpr, consent, privacy, compliance',
    transition: 'fade',
  },
  {
    path: '/library/browser',
    component: LibraryBrowser,
    title: 'Library Browser - AFRERA',
    description: 'Browse and search the project library',
    keywords: 'library, browser, search, knowledge',
    transition: 'fade',
  },
  {
    path: '/blockchain/traceability',
    component: TraceabilityViewer,
    title: 'Blockchain Traceability - AFRERA',
    description: 'View blockchain traceability information',
    keywords: 'blockchain, traceability, supply chain',
    transition: 'fade',
  },
  {
    path: '/health/dashboard',
    component: HealthDashboard,
    title: 'Health Dashboard - AFRERA',
    description: 'Health and wellness dashboard',
    keywords: 'health, wellness, dashboard',
    transition: 'fade',
  },
  {
    path: '/ai/chat-interface',
    component: ChatInterface,
    title: 'AI Chat Interface - AFRERA',
    description: 'Conversational AI chat interface',
    keywords: 'ai, chat, conversational, interface',
    transition: 'fade',
  },
  {
    path: '/fpo-registration',
    component: FPORegistrationPage,
    title: 'FPO Registration - AFRERA',
    description: 'FPO Registration',
    keywords: 'fpo, registration, producer organization',
    transition: 'fade',
    role: 'admin',
  },
  {
    path: '/cattle-registry',
    component: CattleRegistryPage,
    title: 'Cattle Registry - AFRERA',
    description: 'Cattle Registry',
    keywords: 'cattle, livestock, registry',
    transition: 'fade',
  },
  {
    path: '/implement-management',
    component: ImplementManagementPage,
    title: 'Implement Management - AFRERA',
    description: 'Implement Management',
    keywords: 'implement, agriculture, equipment',
    transition: 'fade',
  },
  {
    path: '/equipment-inventory',
    component: EquipmentInventoryPage,
    title: 'Equipment Inventory - AFRERA',
    description: 'Equipment Inventory',
    keywords: 'equipment, inventory, machinery',
    transition: 'fade',
  },
  {
    path: '/equipment-rental',
    component: EquipmentRentalPage,
    title: 'Equipment Rental - AFRERA',
    description: 'Equipment Rental',
    keywords: 'equipment, rental, machinery',
    transition: 'fade',
  },
  {
    path: '/breakdown-maintenance',
    component: BreakdownMaintenancePage,
    title: 'Breakdown Maintenance - AFRERA',
    description: 'Breakdown Maintenance',
    keywords: 'breakdown, maintenance, repair',
    transition: 'fade',
  },
  {
    path: '/fuel-management',
    component: FuelManagementPage,
    title: 'Fuel Management - AFRERA',
    description: 'Fuel Management',
    keywords: 'fuel, consumption, machinery',
    transition: 'fade',
  },
  {
    path: '/spare-parts-management',
    component: SparePartsManagementPage,
    title: 'Spare Parts Management - AFRERA',
    description: 'Spare Parts Management',
    keywords: 'spare parts, inventory, machinery',
    transition: 'fade',
  },
  {
    path: '/asset-lifecycle-management',
    component: AssetLifecycleManagementPage,
    title: 'Asset Lifecycle Management - AFRERA',
    description: 'Asset Lifecycle Management',
    keywords: 'asset, lifecycle, depreciation',
    transition: 'fade',
  },
  {
    path: '/environment-management',
    component: EnvironmentManagementPage,
    title: 'Environment Management - AFRERA',
    description: 'Environment Management',
    keywords: 'environment, configuration, deployment',
    transition: 'fade',
  },
  {
    path: '/ai-backbone',
    component: AIBackbonePage,
    title: 'AI Backbone - AFRERA',
    description: 'Unified multi-provider AI integration: Claude, ChatGPT, Gemini, Azure OpenAI, Hugging Face',
    keywords: 'ai, backbone, claude, chatgpt, gemini, azure, huggingface',
    transition: 'fade',
  },
  {
    path: '/ai-product-studio',
    component: AIProductStudioPage,
    title: 'AI Product Studio - AFRERA',
    description: 'Image generation, cartoon storytelling, nutrient diagnosis, and natural therapist guidance for product marketing and wellness',
    keywords: 'ai, product image, cartoon generator, nutrient diagnosis, wellness, therapist',
    transition: 'fade',
  },
  {
    path: '/diet-recipes',
    component: DietRecipesPage,
    title: 'Diet & Recipes - AFRERA',
    description: 'AI-generated recipes grounded in real dietary profiles and real AFRERA products',
    keywords: 'diet, recipes, nutrition, ai',
    transition: 'fade',
  },
  {
    path: '/wearables',
    component: WearablesPage,
    title: 'Wearables - AFRERA',
    description: 'Fitbit, Apple Health, Samsung Health connection status and activity',
    keywords: 'wearable, fitbit, apple health, samsung health, fitness',
    transition: 'fade',
  },
  {
    path: '/wearables/fitbit-callback',
    component: FitbitCallbackPage,
    title: 'Connecting Fitbit - AFRERA',
    description: 'Fitbit OAuth callback',
    keywords: 'fitbit, oauth, callback',
    transition: 'fade',
  },
  {
    path: '/defense-fitness-prep',
    component: DefenseFitnessPrepPage,
    title: 'Defense & Police Fitness Prep - AFRERA',
    description: 'Self-prep comparison against real, cited published physical standards',
    keywords: 'defense, police, bsf, fitness, recruitment, prep',
    transition: 'fade',
  },
  {
    path: '/sell/new-product',
    component: SellerProductFormPage,
    title: 'Add Product - AFRERA',
    description: 'Create a new marketplace product listing',
    keywords: 'sell, product, add, create, listing',
    transition: 'fade',
  },
  {
    path: '/variety-directory',
    component: VarietyDirectoryPage,
    title: 'Variety Directory - AFRERA',
    description: '142 real, citation-backed NE India crop, livestock, and fisheries varieties',
    keywords: 'variety, directory, north east, GI, biodiversity',
    transition: 'fade',
  },
  {
    path: '/poultry-management',
    component: PoultryManagementPage,
    title: 'Poultry - AFRERA',
    description: 'Poultry farming management',
    keywords: 'poultry, management, farming',
    transition: 'fade',
  },
  {
    path: '/goat-farming',
    component: GoatFarmingPage,
    title: 'Goat Farming - AFRERA',
    description: 'Goat farming management',
    keywords: 'goat, farming, livestock',
    transition: 'fade',
  },
  {
    path: '/sheep-farming',
    component: SheepFarmingPage,
    title: 'Sheep Farming - AFRERA',
    description: 'Sheep farming management',
    keywords: 'sheep, farming, livestock',
    transition: 'fade',
  },
  {
    path: '/pig-farming',
    component: PigFarmingPage,
    title: 'Pig Farming - AFRERA',
    description: 'Pig farming management',
    keywords: 'pig, farming, livestock',
    transition: 'fade',
  },
  {
    path: '/animal-health',
    component: AnimalHealthPage,
    title: 'Animal Health - AFRERA',
    description: 'Animal health management',
    keywords: 'animal, health, veterinary',
    transition: 'fade',
  },
  {
    path: '/unified-ledger',
    component: UnifiedLedgerPage,
    title: 'Unified Ledger - AFRERA',
    description: 'Unified financial ledger',
    keywords: 'ledger, unified, financial',
    transition: 'fade',
  },
  {
    path: '/reos-dashboard',
    component: REOSDashboardPage,
    title: 'REOS Dashboard - AFRERA',
    description: 'Rural Economic Operating System',
    keywords: 'REOS, dashboard, rural economy',
    transition: 'fade',
  },
  {
    path: '/ai-dashboard',
    component: AIDashboard,
    title: 'AI Dashboard - AFRERA',
    description: 'AI-powered insights and tools',
    keywords: 'AI, dashboard, insights',
    transition: 'fade',
  },
  {
    path: '/erp-dashboard',
    component: ERPDashboard,
    title: 'ERP Dashboard - AFRERA',
    description: 'Enterprise Resource Planning',
    keywords: 'ERP, dashboard, enterprise',
    transition: 'fade',
  },
  {
    path: '/b2b-marketplace',
    component: B2BMarketplace,
    title: 'B2B Marketplace - AFRERA',
    description: 'Business-to-business marketplace',
    keywords: 'B2B, marketplace, business',
    transition: 'fade',
  },
  {
    path: '/marketing-center',
    component: MarketingCenter,
    title: 'Marketing Center - AFRERA',
    description: 'Marketing tools and resources',
    keywords: 'marketing, center, tools',
    transition: 'fade',
  },
  {
    path: '/nutrient-marketplace',
    component: NutrientValueMarketplace,
    title: 'Nutrient Value Marketplace - AFRERA',
    description: 'Nutrient value trading',
    keywords: 'nutrient, value, marketplace',
    transition: 'fade',
  },
  {
    path: '/platform-management',
    component: PlatformManagementPage,
    title: 'Platform Management - AFRERA',
    description: 'Platform administration with AI-powered insights',
    keywords: 'platform, management, administration',
    transition: 'fade',
    role: 'admin',
  },
  {
    path: '/role-permissions',
    component: RolePermissionPage,
    title: 'Roles & Permissions - AFRERA',
    description: 'Role and permission management',
    keywords: 'roles, permissions, access control',
    transition: 'fade',
    role: 'admin',
  },
  {
    path: '/shared-infra',
    component: SharedInfraPage,
    title: 'Shared Infrastructure - AFRERA',
    description: 'Shared assets, cold storage and community equipment',
    keywords: 'shared, infrastructure, cold storage, equipment',
    transition: 'fade',
    role: 'admin',
  },
  {
    path: '/system-administration',
    component: SystemAdministrationPage,
    title: 'System Administration - AFRERA',
    description: 'System settings, audit logs and analytics',
    keywords: 'system, administration, settings, audit',
    transition: 'fade',
    role: 'admin',
  },
  {
    path: '/bulk-orders',
    component: BulkOrderPage,
    title: 'Bulk Orders - AFRERA',
    description: 'Request wholesale quantities and manage supplier quotations',
    keywords: 'bulk, wholesale, orders, quotations',
    transition: 'fade',
  },
  {
    path: '/ecommerce-marketplace',
    component: EcommerceMarketplacePage,
    title: 'Marketplace - AFRERA',
    description: 'Browse listings, manage products, seller analytics and market intelligence',
    keywords: 'marketplace, listings, seller, GI, price trends',
    transition: 'fade',
  },
  {
    path: '/ecommerce-integration',
    component: EcommerceIntegrationPage,
    title: 'Nutrition & Recipe Integration - AFRERA',
    description: 'Nutrition scoring, recipe matching, cart health analysis and dietitian recommendations',
    keywords: 'nutrition, recipes, health, dietitian, cart',
    transition: 'fade',
  },
  {
    path: '/complete-erp-integration',
    component: CompleteERPIntegrationPage,
    title: 'Complete ERP Integration - AFRERA',
    description: 'Sync farmer, crop, livestock and inbuilt-module data with the ERP system',
    keywords: 'erp, integration, sync, farmer, crop, livestock',
    transition: 'fade',
  },
  {
    path: '/engineering-projects',
    component: EngineeringProjectPage,
    title: 'Engineering Projects - AFRERA',
    description: 'Create and manage engineering projects, track phases, and generate cost estimates',
    keywords: 'engineering, projects, phases, cost estimate',
    transition: 'fade',
  },
  {
    path: '/realtime-monitoring',
    component: RealtimeMonitoringPage,
    title: 'Realtime Monitoring - AFRERA',
    description: 'Start, stop and inspect real-time resource monitors',
    keywords: 'monitoring, alerts, resources, realtime',
    transition: 'fade',
  },
  {
    path: '/cold-storage',
    component: ColdStoragePage,
    title: 'Cold Storage - AFRERA',
    description: 'Manage cold storage facilities, capacity-checked bookings, and utilization tracking',
    keywords: 'cold storage, facilities, bookings, utilization',
    transition: 'fade',
  },
  {
    path: '/cooperative-shares',
    component: CooperativeSharePage,
    title: 'Cooperative Shares - AFRERA',
    description: 'Manage FPO member share capital and patronage dividend distributions',
    keywords: 'cooperative, fpo, shares, patronage, dividend',
    transition: 'fade',
  },
  {
    path: '/agri-intelligence',
    component: AgriculturalIntelligencePage,
    title: 'Agricultural Intelligence - AFRERA',
    description: 'Crop yield, soil, weather, pest and irrigation AI predictions',
    keywords: 'agriculture, ai, crop yield, soil, weather, pest, irrigation',
    transition: 'fade',
  },
  {
    path: '/knowledge-reference',
    component: KnowledgeReferencePage,
    title: 'Knowledge Reference - AFRERA',
    description: 'Wikipedia knowledge lookups and FOLU transition benchmark data',
    keywords: 'wikipedia, folu, benchmark, reference',
    transition: 'fade',
  },
  {
    path: '/decision-support',
    component: DecisionSupportPage,
    title: 'Decision Support - AFRERA',
    description: 'Core business logic functions for pricing, logistics, finance and governance',
    keywords: 'decision support, pricing, logistics, finance, governance',
    transition: 'fade',
  },
  {
    path: '/complete-ai-integration',
    component: CompleteAIIntegrationPage,
    title: 'Complete AI Integration - AFRERA',
    description: 'AI-driven predictions and optimization across farmer, crop, livestock and inbuilt modules',
    keywords: 'ai, prediction, optimization, disease detection, yield',
    transition: 'fade',
  },
  {
    path: '/comprehensive-erp',
    component: ComprehensiveERPPage,
    title: 'Comprehensive ERP - AFRERA',
    description: 'Oracle/SAP-standard enterprise resource planning across 12 modules',
    keywords: 'erp, financial, sap, oracle, ledger, hr, payroll, inventory',
    transition: 'fade',
  },
  {
    path: '/water-records',
    component: WaterRecordsPage,
    title: 'Water Records - AFRERA',
    description: 'Registry of water budgets, quality readings, rainwater structures, watersheds and analytics records',
    keywords: 'water, budget, quality, rainwater, watershed, analytics',
    transition: 'fade',
  },
  {
    path: '/sap-module-architecture',
    component: SAPModuleArchitecturePage,
    title: 'SAP Module Architecture - AFRERA',
    description: 'SAP-style independent module architecture: registration, dependencies, lifecycle, configuration, MTA descriptors',
    keywords: 'sap, module, architecture, dependency, lifecycle, mta, clean core',
    transition: 'fade',
    role: 'admin',
  },
  {
    path: '/research-and-development',
    component: ResearchAndDevelopmentPage,
    title: 'Research and Development - AFRERA',
    description: 'R&D project management, collaborations, innovations, patents, funding, publications and AI research assistance',
    keywords: 'research, development, innovation, patent, funding, publication, r&d',
    transition: 'fade',
  },
  {
    path: '/information-sharing',
    component: InformationSharingPage,
    title: 'Information Sharing - AFRERA',
    description: 'Document management, folders, permissions, sharing links, live collaboration sessions and AI recommendations',
    keywords: 'document, folder, permission, sharing, collaboration, information sharing',
    transition: 'fade',
  },
  {
    path: '/logistics-matching',
    component: LogisticsMatchingPage,
    title: 'Logistics Matching - AFRERA',
    description: 'Freight pooling, return-load backhaul board and second-use equipment exchange',
    keywords: 'freight, pooling, return load, backhaul, equipment exchange, logistics',
    transition: 'fade',
  },
  {
    path: '/market-signals',
    component: MarketSignalsPage,
    title: 'Market Signals - AFRERA',
    description: 'Glut early-warning, seller trust ranking and civil disruption risk',
    keywords: 'glut, oversupply, seller ranking, trust score, civil disruption, blockade',
    transition: 'fade',
  },
  {
    path: '/nervous-system',
    component: NervousSystemPage,
    title: 'Nervous System - AFRERA',
    description: 'Enterprise route control: brain, heart, neural pathways, reflex arcs, sensors and motor functions',
    keywords: 'nervous system, brain, heart, reflex, sensors, route control',
    transition: 'fade',
  },
  {
    path: '/logistics-enhancement',
    component: LogisticsEnhancementPage,
    title: 'Logistics Enhancement - AFRERA',
    description: 'Fleet management, real-time shipment and driver tracking, temperature monitoring and warehouse integration',
    keywords: 'logistics, fleet, tracking, temperature, warehouse, drivers',
    transition: 'fade',
  },
  {
    path: '/enterprise-ai',
    component: EnterpriseAIPage,
    title: 'Enterprise AI - AFRERA',
    description: 'Credit scoring, government scheme eligibility, AI model-slot registry and conversational query',
    keywords: 'enterprise ai, credit score, scheme eligibility, model registry',
    transition: 'fade',
  },
  {
    path: '/ai-agent',
    component: AIAgentPage,
    title: 'AI Agent - AFRERA',
    description: 'Agentic task execution, multi-agent coordination and tool registry',
    keywords: 'ai, agent, agentic, coordination, tools',
    transition: 'fade',
  },
  {
    path: '/ai-brain',
    component: AIBrainPage,
    title: 'AI Brain - AFRERA',
    description: 'Cognitive processing: perception, attention, reasoning, learning, decision and planning',
    keywords: 'ai, brain, cognitive, reasoning, knowledge graph, memory',
    transition: 'fade',
  },
  {
    path: '/ai-self-healing',
    component: AISelfHealingPage,
    title: 'AI Self-Healing - AFRERA',
    description: 'Autonomous error detection, root cause analysis and recovery',
    keywords: 'ai, self-healing, recovery, error detection, root cause',
    transition: 'fade',
  },
  {
    path: '/ai-operation-intelligence',
    component: AIOperationIntelligencePage,
    title: 'AI Operation Intelligence - AFRERA',
    description: 'Real-time performance monitoring, optimization and anomaly detection',
    keywords: 'ai, operations, performance, optimization, anomaly detection',
    transition: 'fade',
  },
];

/**
 * Get route by path
 */
export function getRouteByPath(path) {
  const allRoutes = [
    ...publicRoutes,
    ...protectedRoutes,
    ...farmerRoutes,
    ...adminRoutes,
    ...dashboardRoutes,
    ...managementRoutes,
  ];

  return allRoutes.find(route => route.path === path);
}

/**
 * Get all routes
 */
export const discoveredRoutes = [
  {
    path: '/erp-operations-dashboard',
    component: DiscoveredERPDashboardPage,
    title: 'ERPDashboard - AFRERA',
    role: 'admin',
    transition: 'fade',
  },
  {
    path: '/cold-storage-dashboard',
    component: DiscoveredColdStorageDashboardPage,
    title: 'ColdStorageDashboard - AFRERA',
    role: 'admin',
    transition: 'fade',
  },
  {
    path: '/climate-monitoring-dashboard',
    component: DiscoveredClimateMonitoringDashboardPage,
    title: 'ClimateMonitoringDashboard - AFRERA',
    role: 'admin',
    transition: 'fade',
  },
  {
    path: '/enterprise-memory-dashboard',
    component: DiscoveredEnterpriseMemoryDashboardPage,
    title: 'EnterpriseMemoryDashboard - AFRERA',
    role: 'admin',
    transition: 'fade',
  },
  {
    path: '/nutrient-calculator',
    component: DiscoveredNutrientCalculatorPage,
    title: 'NutrientCalculator - AFRERA',
    role: 'admin',
    transition: 'fade',
  },
  {
    path: '/decision-engine-dashboard',
    component: DiscoveredDecisionEngineDashboardPage,
    title: 'DecisionEngineDashboard - AFRERA',
    role: 'admin',
    transition: 'fade',
  },
  {
    path: '/medical-coding-dashboard',
    component: DiscoveredMedicalCodingDashboardPage,
    title: 'MedicalCodingDashboard - AFRERA',
    role: 'admin',
    transition: 'fade',
  },
  {
    path: '/digital-twin-dashboard',
    component: DiscoveredDigitalTwinDashboardPage,
    title: 'DigitalTwinDashboard - AFRERA',
    role: 'admin',
    transition: 'fade',
  },
  {
    path: '/advanced-medical-coding',
    component: DiscoveredAdvancedMedicalCodingPage,
    title: 'AdvancedMedicalCoding - AFRERA',
    role: 'admin',
    transition: 'fade',
  },
  {
    path: '/organization-tenant-management',
    component: DiscoveredOrganizationTenantManagementPage,
    title: 'OrganizationTenantManagement - AFRERA',
    role: 'admin',
    transition: 'fade',
  },
  {
    path: '/machinery-village-ops/machinery-management',
    component: DiscoveredMachineryVillageOpsMachineryManagement,
    title: 'MachineryManagement - AFRERA',
    role: 'admin',
    transition: 'fade',
  },
  {
    path: '/water-irrigation/water-management',
    component: DiscoveredWaterIrrigationWaterManagement,
    title: 'WaterManagement - AFRERA',
    role: 'admin',
    transition: 'fade',
  },
  {
    path: '/soil-nutrient-land/soil-management',
    component: DiscoveredSoilNutrientLandSoilManagement,
    title: 'SoilManagement - AFRERA',
    role: 'admin',
    transition: 'fade',
  },
  {
    path: '/vendor-procurement/vendor-management',
    component: DiscoveredVendorProcurementVendorManagement,
    title: 'VendorManagement - AFRERA',
    role: 'admin',
    transition: 'fade',
  },
  {
    path: '/analytics/advanced-analytics-dashboard',
    component: DiscoveredAnalyticsAdvancedAnalyticsDashboard,
    title: 'AdvancedAnalyticsDashboard - AFRERA',
    role: 'admin',
    transition: 'fade',
  },
  {
    path: '/government/government-scheme-dashboard',
    component: DiscoveredGovernmentGovernmentSchemeDashboard,
    title: 'GovernmentSchemeDashboard - AFRERA',
    role: 'admin',
    transition: 'fade',
  },
  {
    path: '/admin/compliance-dashboard',
    component: DiscoveredAdminComplianceDashboard,
    title: 'ComplianceDashboard - AFRERA',
    role: 'admin',
    transition: 'fade',
  },
  {
    path: '/settings/api-management',
    component: DiscoveredSettingsAPIManagement,
    title: 'APIManagement - AFRERA',
    role: 'admin',
    transition: 'fade',
  },
  {
    path: '/settings/webhooks',
    component: DiscoveredSettingsWebhooks,
    title: 'Webhooks - AFRERA',
    role: 'admin',
    transition: 'fade',
  },
  {
    path: '/platform/module-workspace',
    component: DiscoveredPlatformModuleWorkspace,
    title: 'ModuleWorkspace - AFRERA',
    role: 'admin',
    transition: 'fade',
  },
  {
    path: '/settings/advanced-settings',
    component: DiscoveredSettingsAdvancedSettings,
    title: 'AdvancedSettings - AFRERA',
    role: 'admin',
    transition: 'fade',
  },
  {
    path: '/settings/audit-trail',
    component: DiscoveredSettingsAuditTrail,
    title: 'AuditTrail - AFRERA',
    role: 'admin',
    transition: 'fade',
  },
  {
    path: '/settings/integrations',
    component: DiscoveredSettingsIntegrations,
    title: 'Integrations - AFRERA',
    role: 'admin',
    transition: 'fade',
  },
  {
    path: '/reports/expense-report',
    component: DiscoveredReportsExpenseReport,
    title: 'ExpenseReport - AFRERA',
    role: 'admin',
    transition: 'fade',
  },
  {
    path: '/reports/crop-performance',
    component: DiscoveredReportsCropPerformance,
    title: 'CropPerformance - AFRERA',
    role: 'admin',
    transition: 'fade',
  },
  {
    path: '/reports/profit-report',
    component: DiscoveredReportsProfitReport,
    title: 'ProfitReport - AFRERA',
    role: 'admin',
    transition: 'fade',
  },
  {
    path: '/admin/api-management',
    component: DiscoveredAdminAPIManagement,
    title: 'APIManagement - AFRERA',
    role: 'admin',
    transition: 'fade',
  },
  {
    path: '/admin/audit-logs',
    component: DiscoveredAdminAuditLogs,
    title: 'AuditLogs - AFRERA',
    role: 'admin',
    transition: 'fade',
  },
  {
    path: '/admin/backup-recovery',
    component: DiscoveredAdminBackupRecovery,
    title: 'BackupRecovery - AFRERA',
    role: 'admin',
    transition: 'fade',
  },
  {
    path: '/admin/cache-management',
    component: DiscoveredAdminCacheManagement,
    title: 'CacheManagement - AFRERA',
    role: 'admin',
    transition: 'fade',
  },
  {
    path: '/admin/database-management',
    component: DiscoveredAdminDatabaseManagement,
    title: 'DatabaseManagement - AFRERA',
    role: 'admin',
    transition: 'fade',
  },
  {
    path: '/admin/error-handling',
    component: DiscoveredAdminErrorHandling,
    title: 'ErrorHandling - AFRERA',
    role: 'admin',
    transition: 'fade',
  },
  {
    path: '/admin/integration-settings',
    component: DiscoveredAdminIntegrationSettings,
    title: 'IntegrationSettings - AFRERA',
    role: 'admin',
    transition: 'fade',
  },
  {
    path: '/admin/log-viewer',
    component: DiscoveredAdminLogViewer,
    title: 'LogViewer - AFRERA',
    role: 'admin',
    transition: 'fade',
  },
  {
    path: '/admin/notification-preferences',
    component: DiscoveredAdminNotificationPreferences,
    title: 'NotificationPreferences - AFRERA',
    role: 'admin',
    transition: 'fade',
  },
  {
    path: '/admin/performance-tuning',
    component: DiscoveredAdminPerformanceTuning,
    title: 'PerformanceTuning - AFRERA',
    role: 'admin',
    transition: 'fade',
  },
  {
    path: '/admin/resource-monitoring',
    component: DiscoveredAdminResourceMonitoring,
    title: 'ResourceMonitoring - AFRERA',
    role: 'admin',
    transition: 'fade',
  },
  {
    path: '/admin/role-permissions',
    component: DiscoveredAdminRolePermissions,
    title: 'RolePermissions - AFRERA',
    role: 'admin',
    transition: 'fade',
  },
  {
    path: '/admin/security-settings',
    component: DiscoveredAdminSecuritySettings,
    title: 'SecuritySettings - AFRERA',
    role: 'admin',
    transition: 'fade',
  },
  {
    path: '/admin/system-configuration',
    component: DiscoveredAdminSystemConfiguration,
    title: 'SystemConfiguration - AFRERA',
    role: 'admin',
    transition: 'fade',
  },
  {
    path: '/admin/user-management',
    component: DiscoveredAdminUserManagement,
    title: 'UserManagement - AFRERA',
    role: 'admin',
    transition: 'fade',
  },
  {
    path: '/analytics/anomaly-detection',
    component: DiscoveredAnalyticsAnomalyDetection,
    title: 'AnomalyDetection - AFRERA',
    role: 'admin',
    transition: 'fade',
  },
  {
    path: '/analytics/crop-yield-prediction',
    component: DiscoveredAnalyticsCropYieldPrediction,
    title: 'CropYieldPrediction - AFRERA',
    role: 'admin',
    transition: 'fade',
  },
  {
    path: '/analytics/custom-report-builder',
    component: DiscoveredAnalyticsCustomReportBuilder,
    title: 'CustomReportBuilder - AFRERA',
    role: 'admin',
    transition: 'fade',
  },
  {
    path: '/analytics/data-quality-report',
    component: DiscoveredAnalyticsDataQualityReport,
    title: 'DataQualityReport - AFRERA',
    role: 'admin',
    transition: 'fade',
  },
  {
    path: '/analytics/error-rate-analysis',
    component: DiscoveredAnalyticsErrorRateAnalysis,
    title: 'ErrorRateAnalysis - AFRERA',
    role: 'admin',
    transition: 'fade',
  },
  {
    path: '/analytics/farmer-behavior-analytics',
    component: DiscoveredAnalyticsFarmerBehaviorAnalytics,
    title: 'FarmerBehaviorAnalytics - AFRERA',
    role: 'admin',
    transition: 'fade',
  },
  {
    path: '/analytics/forecasting-dashboard',
    component: DiscoveredAnalyticsForecastingDashboard,
    title: 'ForecastingDashboard - AFRERA',
    role: 'admin',
    transition: 'fade',
  },
  {
    path: '/analytics/historical-data-view',
    component: DiscoveredAnalyticsHistoricalDataView,
    title: 'HistoricalDataView - AFRERA',
    role: 'admin',
    transition: 'fade',
  },
  {
    path: '/analytics/intelligence-reports',
    component: DiscoveredAnalyticsIntelligenceReports,
    title: 'IntelligenceReports - AFRERA',
    role: 'admin',
    transition: 'fade',
  },
  {
    path: '/analytics/market-trend-analysis',
    component: DiscoveredAnalyticsMarketTrendAnalysis,
    title: 'MarketTrendAnalysis - AFRERA',
    role: 'admin',
    transition: 'fade',
  },
  {
    path: '/analytics/opportunities-identifier',
    component: DiscoveredAnalyticsOpportunitiesIdentifier,
    title: 'OpportunitiesIdentifier - AFRERA',
    role: 'admin',
    transition: 'fade',
  },
  {
    path: '/analytics/performance-metrics',
    component: DiscoveredAnalyticsPerformanceMetrics,
    title: 'PerformanceMetrics - AFRERA',
    role: 'admin',
    transition: 'fade',
  },
  {
    path: '/analytics/price-volatility-chart',
    component: DiscoveredAnalyticsPriceVolatilityChart,
    title: 'PriceVolatilityChart - AFRERA',
    role: 'admin',
    transition: 'fade',
  },
  {
    path: '/analytics/regional-comparison',
    component: DiscoveredAnalyticsRegionalComparison,
    title: 'RegionalComparison - AFRERA',
    role: 'admin',
    transition: 'fade',
  },
  {
    path: '/analytics/response-time-metrics',
    component: DiscoveredAnalyticsResponseTimeMetrics,
    title: 'ResponseTimeMetrics - AFRERA',
    role: 'admin',
    transition: 'fade',
  },
  {
    path: '/analytics/risk-assessment',
    component: DiscoveredAnalyticsRiskAssessment,
    title: 'RiskAssessment - AFRERA',
    role: 'admin',
    transition: 'fade',
  },
  {
    path: '/analytics/subsidy-distribution-map',
    component: DiscoveredAnalyticsSubsidyDistributionMap,
    title: 'SubsidyDistributionMap - AFRERA',
    role: 'admin',
    transition: 'fade',
  },
  {
    path: '/analytics/system-health-monitor',
    component: DiscoveredAnalyticsSystemHealthMonitor,
    title: 'SystemHealthMonitor - AFRERA',
    role: 'admin',
    transition: 'fade',
  },
  {
    path: '/analytics/user-engagement-stats',
    component: DiscoveredAnalyticsUserEngagementStats,
    title: 'UserEngagementStats - AFRERA',
    role: 'admin',
    transition: 'fade',
  },
  {
    path: '/analytics/weather-impact-assessment',
    component: DiscoveredAnalyticsWeatherImpactAssessment,
    title: 'WeatherImpactAssessment - AFRERA',
    role: 'admin',
    transition: 'fade',
  },
  {
    path: '/government/announcement-board',
    component: DiscoveredGovernmentAnnouncementBoard,
    title: 'AnnouncementBoard - AFRERA',
    role: 'admin',
    transition: 'fade',
  },
  {
    path: '/government/application-status-tracker',
    component: DiscoveredGovernmentApplicationStatusTracker,
    title: 'ApplicationStatusTracker - AFRERA',
    role: 'admin',
    transition: 'fade',
  },
  {
    path: '/government/approval-workflow',
    component: DiscoveredGovernmentApprovalWorkflow,
    title: 'ApprovalWorkflow - AFRERA',
    role: 'admin',
    transition: 'fade',
  },
  {
    path: '/government/audit-log',
    component: DiscoveredGovernmentAuditLogPage,
    title: 'AuditLog - AFRERA',
    role: 'admin',
    transition: 'fade',
  },
  {
    path: '/government/beneficiary-management',
    component: DiscoveredGovernmentBeneficiaryManagement,
    title: 'BeneficiaryManagement - AFRERA',
    role: 'admin',
    transition: 'fade',
  },
  {
    path: '/government/biometric-authentication',
    component: DiscoveredGovernmentBiometricAuthentication,
    title: 'BiometricAuthentication - AFRERA',
    role: 'admin',
    transition: 'fade',
  },
  {
    path: '/government/cancellation-management',
    component: DiscoveredGovernmentCancellationManagement,
    title: 'CancellationManagement - AFRERA',
    role: 'admin',
    transition: 'fade',
  },
  {
    path: '/government/compliance-validator',
    component: DiscoveredGovernmentComplianceValidator,
    title: 'ComplianceValidator - AFRERA',
    role: 'admin',
    transition: 'fade',
  },
  {
    path: '/government/deadline-tracker',
    component: DiscoveredGovernmentDeadlineTracker,
    title: 'DeadlineTracker - AFRERA',
    role: 'admin',
    transition: 'fade',
  },
  {
    path: '/government/dispute-resolution',
    component: DiscoveredGovernmentDisputeResolutionPage,
    title: 'DisputeResolution - AFRERA',
    role: 'admin',
    transition: 'fade',
  },
  {
    path: '/government/document-upload',
    component: DiscoveredGovernmentDocumentUploadPage,
    title: 'DocumentUpload - AFRERA',
    role: 'admin',
    transition: 'fade',
  },
  {
    path: '/government/government-notification-center',
    component: DiscoveredGovernmentGovernmentNotificationCenter,
    title: 'GovernmentNotificationCenter - AFRERA',
    role: 'admin',
    transition: 'fade',
  },
  {
    path: '/government/mobile-verification',
    component: DiscoveredGovernmentMobileVerification,
    title: 'MobileVerification - AFRERA',
    role: 'admin',
    transition: 'fade',
  },
  {
    path: '/government/payment-gateway',
    component: DiscoveredGovernmentPaymentGateway,
    title: 'PaymentGateway - AFRERA',
    role: 'admin',
    transition: 'fade',
  },
  {
    path: '/government/scheme-beneficiary-list',
    component: DiscoveredGovernmentSchemeBeneficiaryList,
    title: 'SchemeBeneficiaryList - AFRERA',
    role: 'admin',
    transition: 'fade',
  },
  {
    path: '/government/scheme-eligibility-checker',
    component: DiscoveredGovernmentSchemeEligibilityChecker,
    title: 'SchemeEligibilityChecker - AFRERA',
    role: 'admin',
    transition: 'fade',
  },
  {
    path: '/government/scheme-report-generator',
    component: DiscoveredGovernmentSchemeReportGenerator,
    title: 'SchemeReportGenerator - AFRERA',
    role: 'admin',
    transition: 'fade',
  },
  {
    path: '/government/scheme-update-notifier',
    component: DiscoveredGovernmentSchemeUpdateNotifier,
    title: 'Scheme Update Notifier - AFRERA',
    role: 'admin',
    transition: 'fade',
  },
  {
    path: '/government/scheme-verification',
    component: DiscoveredGovernmentSchemeVerificationPage,
    title: 'SchemeVerification - AFRERA',
    role: 'admin',
    transition: 'fade',
  },
  {
    path: '/government/subsidy-application',
    component: DiscoveredGovernmentSubsidyApplicationPage,
    title: 'SubsidyApplication - AFRERA',
    role: 'admin',
    transition: 'fade',
  },
  {
    path: '/mobile/mobile-chat',
    component: DiscoveredMobileMobileChat,
    title: 'MobileChat - AFRERA',
    role: undefined,
    transition: 'fade',
  },
  {
    path: '/mobile/mobile-help',
    component: DiscoveredMobileMobileHelp,
    title: 'MobileHelp - AFRERA',
    role: undefined,
    transition: 'fade',
  },
  {
    path: '/mobile/mobile-homepage',
    component: DiscoveredMobileMobileHomepage,
    title: 'MobileHomepage - AFRERA',
    role: undefined,
    transition: 'fade',
  },
  {
    path: '/mobile/mobile-marketplace',
    component: DiscoveredMobileMobileMarketplace,
    title: 'MobileMarketplace - AFRERA',
    role: undefined,
    transition: 'fade',
  },
  {
    path: '/mobile/mobile-notifications',
    component: DiscoveredMobileMobileNotifications,
    title: 'MobileNotifications - AFRERA',
    role: undefined,
    transition: 'fade',
  },
  {
    path: '/mobile/mobile-offers',
    component: DiscoveredMobileMobileOffers,
    title: 'MobileOffers - AFRERA',
    role: undefined,
    transition: 'fade',
  },
  {
    path: '/mobile/mobile-payments',
    component: DiscoveredMobileMobilePayments,
    title: 'MobilePayments - AFRERA',
    role: undefined,
    transition: 'fade',
  },
  {
    path: '/mobile/mobile-profile',
    component: DiscoveredMobileMobileProfile,
    title: 'MobileProfile - AFRERA',
    role: undefined,
    transition: 'fade',
  },
  {
    path: '/mobile/mobile-settings',
    component: DiscoveredMobileMobileSettings,
    title: 'MobileSettings - AFRERA',
    role: undefined,
    transition: 'fade',
  },
  {
    path: '/mobile/mobile-wallet',
    component: DiscoveredMobileMobileWallet,
    title: 'MobileWallet - AFRERA',
    role: undefined,
    transition: 'fade',
  },
];

export const sweepRoutes = [
  {
    path: '/accessibility',
    component: SweepAccessibilityPage,
    title: 'Accessibility - AFRERA',
    isPublic: true,
    transition: 'fade',
  },
  {
    path: '/account',
    component: SweepAccountPage,
    title: 'Account - AFRERA',
    isPublic: false,
    transition: 'fade',
  },
  {
    path: '/activity',
    component: SweepActivityPage,
    title: 'Activity - AFRERA',
    isPublic: false,
    transition: 'fade',
  },
  {
    path: '/advanced',
    component: SweepAdvancedPage,
    title: 'Advanced - AFRERA',
    isPublic: false,
    transition: 'fade',
  },
  {
    path: '/aidashboard',
    component: SweepAIDashboardPage,
    title: 'AIDashboard - AFRERA',
    isPublic: false,
    transition: 'fade',
  },
  {
    path: '/archive',
    component: SweepArchivePage,
    title: 'Archive - AFRERA',
    isPublic: false,
    transition: 'fade',
  },
  {
    path: '/backup',
    component: SweepBackupPage,
    title: 'Backup - AFRERA',
    isPublic: false,
    transition: 'fade',
  },
  {
    path: '/billing',
    component: SweepBillingPage,
    title: 'Billing - AFRERA',
    isPublic: false,
    transition: 'fade',
  },
  {
    path: '/browse',
    component: SweepBrowsePage,
    title: 'Browse - AFRERA',
    isPublic: false,
    transition: 'fade',
  },
  {
    path: '/categories',
    component: SweepCategoriesPage,
    title: 'Categories - AFRERA',
    isPublic: false,
    transition: 'fade',
  },
  {
    path: '/claims',
    component: SweepClaimsPage,
    title: 'Claims - AFRERA',
    isPublic: false,
    transition: 'fade',
  },
  {
    path: '/collaborate',
    component: SweepCollaboratePage,
    title: 'Collaborate - AFRERA',
    isPublic: false,
    transition: 'fade',
  },
  {
    path: '/collections',
    component: SweepCollectionsPage,
    title: 'Collections - AFRERA',
    isPublic: false,
    transition: 'fade',
  },
  {
    path: '/contact',
    component: SweepContactPage,
    title: 'Contact - AFRERA',
    isPublic: true,
    transition: 'fade',
  },
  {
    path: '/cookie',
    component: SweepCookiePage,
    title: 'Cookie - AFRERA',
    isPublic: true,
    transition: 'fade',
  },
  {
    path: '/crops',
    component: SweepCropsPage,
    title: 'Crops - AFRERA',
    isPublic: false,
    transition: 'fade',
  },
  {
    path: '/devices',
    component: SweepDevicesPage,
    title: 'Devices - AFRERA',
    isPublic: false,
    transition: 'fade',
  },
  {
    path: '/documentation',
    component: SweepDocumentationPage,
    title: 'Documentation - AFRERA',
    isPublic: true,
    transition: 'fade',
  },
  {
    path: '/empty',
    component: SweepEmptyPage,
    title: 'Empty - AFRERA',
    isPublic: true,
    transition: 'fade',
  },
  {
    path: '/equipment',
    component: SweepEquipmentPage,
    title: 'Equipment - AFRERA',
    isPublic: false,
    transition: 'fade',
  },
  {
    path: '/explore',
    component: SweepExplorePage,
    title: 'Explore - AFRERA',
    isPublic: false,
    transition: 'fade',
  },
  {
    path: '/export',
    component: SweepExportPage,
    title: 'Export - AFRERA',
    isPublic: false,
    transition: 'fade',
  },
  {
    path: '/faq',
    component: SweepFAQPage,
    title: 'FAQ - AFRERA',
    isPublic: true,
    transition: 'fade',
  },
  {
    path: '/farms',
    component: SweepFarmsPage,
    title: 'Farms - AFRERA',
    isPublic: false,
    transition: 'fade',
  },
  {
    path: '/favorites',
    component: SweepFavoritesPage,
    title: 'Favorites - AFRERA',
    isPublic: false,
    transition: 'fade',
  },
  {
    path: '/feedback',
    component: SweepFeedbackPage,
    title: 'Feedback - AFRERA',
    isPublic: false,
    transition: 'fade',
  },
  {
    path: '/fields',
    component: SweepFieldsPage,
    title: 'Fields - AFRERA',
    isPublic: false,
    transition: 'fade',
  },
  {
    path: '/finance',
    component: SweepFinancePage,
    title: 'Finance - AFRERA',
    isPublic: false,
    transition: 'fade',
  },
  {
    path: '/help',
    component: SweepHelpPage,
    title: 'Help - AFRERA',
    isPublic: true,
    transition: 'fade',
  },
  {
    path: '/history',
    component: SweepHistoryPage,
    title: 'History - AFRERA',
    isPublic: false,
    transition: 'fade',
  },
  {
    path: '/import',
    component: SweepImportPage,
    title: 'Import - AFRERA',
    isPublic: false,
    transition: 'fade',
  },
  {
    path: '/inbox',
    component: SweepInboxPage,
    title: 'Inbox - AFRERA',
    isPublic: false,
    transition: 'fade',
  },
  {
    path: '/insurance-coverages',
    component: SweepInsuranceCoveragesPage,
    title: 'InsuranceCoverages - AFRERA',
    isPublic: false,
    transition: 'fade',
  },
  {
    path: '/invoices',
    component: SweepInvoicesPage,
    title: 'Invoices - AFRERA',
    isPublic: false,
    transition: 'fade',
  },
  {
    path: '/labels',
    component: SweepLabelsPage,
    title: 'Labels - AFRERA',
    isPublic: false,
    transition: 'fade',
  },
  {
    path: '/language',
    component: SweepLanguagePage,
    title: 'Language - AFRERA',
    isPublic: false,
    transition: 'fade',
  },
  {
    path: '/loading',
    component: SweepLoadingPage,
    title: 'Loading - AFRERA',
    isPublic: true,
    transition: 'fade',
  },
  {
    path: '/logs',
    component: SweepLogsPage,
    title: 'Logs - AFRERA',
    isPublic: false,
    transition: 'fade',
  },
  {
    path: '/members',
    component: SweepMembersPage,
    title: 'Members - AFRERA',
    isPublic: false,
    transition: 'fade',
  },
  {
    path: '/messages',
    component: SweepMessagesPage,
    title: 'Messages - AFRERA',
    isPublic: false,
    transition: 'fade',
  },
  {
    path: '/mobile',
    component: SweepMobilePage,
    title: 'Mobile - AFRERA',
    isPublic: false,
    transition: 'fade',
  },
  {
    path: '/not-found',
    component: SweepNotFoundPage,
    title: 'NotFound - AFRERA',
    isPublic: true,
    transition: 'fade',
  },
  {
    path: '/notifications',
    component: SweepNotificationsPage,
    title: 'Notifications - AFRERA',
    isPublic: false,
    transition: 'fade',
  },
  {
    path: '/onboarding',
    component: SweepOnboardingPage,
    title: 'Onboarding - AFRERA',
    isPublic: false,
    transition: 'fade',
  },
  {
    path: '/payments',
    component: SweepPaymentsPage,
    title: 'Payments - AFRERA',
    isPublic: false,
    transition: 'fade',
  },
  {
    path: '/permissions',
    component: SweepPermissionsPage,
    title: 'Permissions - AFRERA',
    isPublic: false,
    transition: 'fade',
  },
  {
    path: '/popular',
    component: SweepPopularPage,
    title: 'Popular - AFRERA',
    isPublic: false,
    transition: 'fade',
  },
  {
    path: '/preferences',
    component: SweepPreferencesPage,
    title: 'Preferences - AFRERA',
    isPublic: false,
    transition: 'fade',
  },
  {
    path: '/privacy',
    component: SweepPrivacyPage,
    title: 'Privacy - AFRERA',
    isPublic: true,
    transition: 'fade',
  },
  {
    path: '/receipts',
    component: SweepReceiptsPage,
    title: 'Receipts - AFRERA',
    isPublic: false,
    transition: 'fade',
  },
  {
    path: '/recent',
    component: SweepRecentPage,
    title: 'Recent - AFRERA',
    isPublic: false,
    transition: 'fade',
  },
  {
    path: '/reporting',
    component: SweepReportingPage,
    title: 'Reporting - AFRERA',
    isPublic: false,
    transition: 'fade',
  },
  {
    path: '/restore',
    component: SweepRestorePage,
    title: 'Restore - AFRERA',
    isPublic: false,
    transition: 'fade',
  },
  {
    path: '/results',
    component: SweepResultsPage,
    title: 'Results - AFRERA',
    isPublic: false,
    transition: 'fade',
  },
  {
    path: '/roles',
    component: SweepRolesPage,
    title: 'Roles - AFRERA',
    isPublic: false,
    transition: 'fade',
  },
  {
    path: '/search',
    component: SweepSearchPage,
    title: 'Search - AFRERA',
    isPublic: false,
    transition: 'fade',
  },
  {
    path: '/security',
    component: SweepSecurityPage,
    title: 'Security - AFRERA',
    isPublic: false,
    transition: 'fade',
  },
  {
    path: '/server-error',
    component: SweepServerErrorPage,
    title: 'ServerError - AFRERA',
    isPublic: true,
    transition: 'fade',
  },
  {
    path: '/sessions',
    component: SweepSessionsPage,
    title: 'Sessions - AFRERA',
    isPublic: false,
    transition: 'fade',
  },
  {
    path: '/settings',
    component: SweepSettingsPage,
    title: 'Settings - AFRERA',
    isPublic: false,
    transition: 'fade',
  },
  {
    path: '/share',
    component: SweepSharePage,
    title: 'Share - AFRERA',
    isPublic: false,
    transition: 'fade',
  },
  {
    path: '/subscription',
    component: SweepSubscriptionPage,
    title: 'Subscription - AFRERA',
    isPublic: false,
    transition: 'fade',
  },
  {
    path: '/sync',
    component: SweepSyncPage,
    title: 'Sync - AFRERA',
    isPublic: false,
    transition: 'fade',
  },
  {
    path: '/tags',
    component: SweepTagsPage,
    title: 'Tags - AFRERA',
    isPublic: false,
    transition: 'fade',
  },
  {
    path: '/team',
    component: SweepTeamPage,
    title: 'Team - AFRERA',
    isPublic: false,
    transition: 'fade',
  },
  {
    path: '/terms',
    component: SweepTermsPage,
    title: 'Terms - AFRERA',
    isPublic: true,
    transition: 'fade',
  },
  {
    path: '/theme',
    component: SweepThemePage,
    title: 'Theme - AFRERA',
    isPublic: false,
    transition: 'fade',
  },
  {
    path: '/trash',
    component: SweepTrashPage,
    title: 'Trash - AFRERA',
    isPublic: false,
    transition: 'fade',
  },
  {
    path: '/trending',
    component: SweepTrendingPage,
    title: 'Trending - AFRERA',
    isPublic: false,
    transition: 'fade',
  },
  {
    path: '/tutorial',
    component: SweepTutorialPage,
    title: 'Tutorial - AFRERA',
    isPublic: false,
    transition: 'fade',
  },
  {
    path: '/unauthorized',
    component: SweepUnauthorizedPage,
    title: 'Unauthorized - AFRERA',
    isPublic: true,
    transition: 'fade',
  },
  {
    path: '/welcome',
    component: SweepWelcomePage,
    title: 'Welcome - AFRERA',
    isPublic: true,
    transition: 'fade',
  },
  {
    path: '/products',
    component: SweepProductsPage,
    title: 'Products - Browse the AFRERA Marketplace',
    isPublic: false,
    transition: 'fade',
  },
  {
    path: '/orders',
    component: SweepOrdersPage,
    title: 'My Orders - Track Your Purchases',
    isPublic: false,
    transition: 'fade',
  },
  {
    path: '/profile',
    component: SweepProfilePage,
    title: 'My Profile - Account Settings',
    isPublic: false,
    transition: 'fade',
  },
];

export function getAllRoutes() {
  return [
    ...publicRoutes,
    ...protectedRoutes,
    ...farmerRoutes,
    ...adminRoutes,
    ...dashboardRoutes,
    ...managementRoutes,
  ];
}

/**
 * Get routes by role
 */
export function getRoutesByRole(role) {
  const routes = [...publicRoutes, ...protectedRoutes];

  if (role === 'farmer') {
    routes.push(...farmerRoutes);
  }

  if (role === 'admin') {
    routes.push(...adminRoutes);
  }

  if (role === 'banker') {
    routes.push(...dashboardRoutes.filter(r => r.role === 'banker'));
  }

  if (role === 'ca') {
    routes.push(...dashboardRoutes.filter(r => r.role === 'ca'));
  }

  if (role === 'government') {
    routes.push(...dashboardRoutes.filter(r => r.role === 'government'));
  }

  if (role === 'researcher') {
    routes.push(...dashboardRoutes.filter(r => r.role === 'researcher'));
  }

  if (role === 'corporate') {
    routes.push(...dashboardRoutes.filter(r => r.role === 'corporate'));
  }

  if (role === 'logistics') {
    routes.push(...dashboardRoutes.filter(r => r.role === 'logistics'));
  }

  return routes;
}
