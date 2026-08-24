import { Routes, Route } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import { useEffect, lazy, Suspense } from 'react'
import ErrorBoundary from './components/ErrorBoundary'
import Layout from './components/Layout'
import { errorMonitoring } from './utils/errorMonitoring'
const HomePage = lazy(() => import('./pages/HomePage'))
const MarketplacePage = lazy(() => import('./pages/MarketplacePage'))
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'))
const CartPage = lazy(() => import('./pages/CartPage'))
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const RegisterPage = lazy(() => import('./pages/RegisterPage'))
const FarmerPortalPage = lazy(() => import('./pages/FarmerPortalPage'))
const FarmerHomePage = lazy(() => import('./pages/FarmerHomePage'))
const FarmerSellPage = lazy(() => import('./pages/FarmerSellPage'))
const FarmerFieldPage = lazy(() => import('./pages/FarmerFieldPage'))
const HarvestPlanPage = lazy(() => import('./pages/HarvestPlanPage'))
const HarvestScorePage = lazy(() => import('./pages/HarvestScorePage'))
const WhatGrowPage = lazy(() => import('./pages/WhatGrowPage'))
const SeedVaultPage = lazy(() => import('./pages/SeedVaultPage'))
const FarmAdvisorPage = lazy(() => import('./pages/FarmAdvisorPage'))
const PriceCheckPage = lazy(() => import('./pages/PriceCheckPage'))
const PriceBuildPage = lazy(() => import('./pages/PriceBuildPage'))
const DynamicPricingPage = lazy(() => import('./pages/DynamicPricingPage'))
const SellTimingPage = lazy(() => import('./pages/SellTimingPage'))
const ComparePage = lazy(() => import('./pages/ComparePage'))
const DiscoverPage = lazy(() => import('./pages/DiscoverPage'))
const PreOrderPage = lazy(() => import('./pages/PreOrderPage'))
const LogisticsPage = lazy(() => import('./pages/LogisticsPage'))
const InsurancePage = lazy(() => import('./pages/InsurancePage'))
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
// Real, transactional wallet backend (services/farmerService.js) existed
// with complete routes but no frontend page anywhere in the app.
const WalletPage = lazy(() => import('./pages/WalletPage'))
const BankPassportPage = lazy(() => import('./pages/BankPassportPage'))
// Four public "farmer doors" + central hub, recovered 2026-08-07. Built in an
// earlier session but never mounted (same class of bug as the "14 built
// pages" and FPODashboardPage below). Fixes the V43 login-wall problem: every
// /farmer* route is <ProtectedRoute requiredRole="farmer">, which redirects
// an unauthenticated first-time visitor to /login with zero context. These
// five pages are a public discovery layer in front of that wall — explain
// the section, link to real public tools, and offer "sign in to this
// section" rather than forcing login before a visitor can evaluate anything.
// See docs/V43_UX_IMPROVEMENTS_EXTRACTION.md.
const FarmerEntranceHubPage = lazy(() => import('./pages/FarmerEntranceHubPage'))
const FarmerSellDoorPage = lazy(() => import('./pages/FarmerSellDoorPage'))
const FarmerHouseholdDoorPage = lazy(() => import('./pages/FarmerHouseholdDoorPage'))
const FarmerFieldDoorPage = lazy(() => import('./pages/FarmerFieldDoorPage'))
const FarmerSharedDoorPage = lazy(() => import('./pages/FarmerSharedDoorPage'))
// Modules recovered 2026-08-05 (migrations 051-058). Each had a working
// backend service and nothing rendering it — the state the master index
// reports as NO_UI.
const ForwardPricingPage = lazy(() => import('./pages/ForwardPricingPage'))
const ClimateWeatherPage = lazy(() => import('./pages/ClimateWeatherPage'))
const LedgerPage = lazy(() => import('./pages/LedgerPage'))
const CompliancePage = lazy(() => import('./pages/CompliancePage'))
const RfqPage = lazy(() => import('./pages/RfqPage'))
const CorridorEconomicsPage = lazy(() => import('./pages/CorridorEconomicsPage'))
const LandUseCarbonPage = lazy(() => import('./pages/LandUseCarbonPage'))
// ERP domains AF-AA/AF-CO/AF-PS — real, ledger-integrated services (996 /
// 9996 migrations) that had a working backend and no frontend caller.
const AssetAccountingPage = lazy(() => import('./pages/AssetAccountingPage'))
const CostControlPage = lazy(() => import('./pages/CostControlPage'))
const ProjectSystemsPage = lazy(() => import('./pages/ProjectSystemsPage'))
const YieldManagementPage = lazy(() => import('./pages/YieldManagementPage'))
const CompetitivePositionPage = lazy(() => import('./pages/CompetitivePositionPage'))
const ExperienceLayerPage = lazy(() => import('./pages/ExperienceLayerPage'))
const FormManagementPage = lazy(() => import('./pages/FormManagementPage'))
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'))
const ModuleHubPage = lazy(() => import('./pages/ModuleHubPage'))
const CorporateBuyerPage = lazy(() => import('./pages/CorporateBuyerPage'))
const LogisticsProviderPage = lazy(() => import('./pages/LogisticsProviderPage'))
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage'))
// FPODashboardPage was fully built (Overview/Members/Collective Orders/
// Inventory/Finance/Profit Distribution tabs) but had no route — the same
// class of bug as the other "recovered" modules above. Mounting it so the
// M053/M054/M056/M058/M060 module stubs have a real page to point to.
const FPODashboardPage = lazy(() => import('./pages/FPODashboardPage'))
// 14 more page components were fully built (real forms, react-query hooks,
// wired to services/api.js clients that already existed) but were never
// mounted — the same class of bug as FPODashboardPage above. Mounting them
// so the M013/M024/M031/M041/M046/M075/M083/M093/M098/M101/M112/M121/M132/
// M141 module stubs have a real page to point to.
const AuthorizationPage = lazy(() => import('./pages/AuthorizationPage'))
const ClimateAdvisoryPage = lazy(() => import('./pages/ClimateAdvisoryPage'))
const DairyManagementPage = lazy(() => import('./pages/DairyManagementPage'))
const FarmCostingPage = lazy(() => import('./pages/FarmCostingPage'))
const FarmerKycPage = lazy(() => import('./pages/FarmerKycPage'))
const FertilizerInventoryPage = lazy(() => import('./pages/FertilizerInventoryPage'))
const IrrigationManagementPage = lazy(() => import('./pages/IrrigationManagementPage'))
const LabourManagementPage = lazy(() => import('./pages/LabourManagementPage'))
const LandRegistryPage = lazy(() => import('./pages/LandRegistryPage'))
const OrchardManagementPage = lazy(() => import('./pages/OrchardManagementPage'))
const PondManagementPage = lazy(() => import('./pages/PondManagementPage'))
const ShgManagementPage = lazy(() => import('./pages/ShgManagementPage'))
const SharedInfraPage = lazy(() => import('./pages/SharedInfraPage'))
const TractorManagementPage = lazy(() => import('./pages/TractorManagementPage'))
const VillageRegistryPage = lazy(() => import('./pages/VillageRegistryPage'))
// Same class of bug, found separately: SowingManagementPage (M067) was also
// fully built (sowingAPI already existed in services/api.js) but never mounted.
const SowingManagementPage = lazy(() => import('./pages/SowingManagementPage'))
// Second batch, 2026-08-07: 20 confirmed STUB-ONLY module frontends built as
// real pages (Farmer: M022/M023/M025/M026/M029, Crop: M062-M066/M068, Land:
// M033/M035-M039 consolidated into one tabbed page, FPO: M051/M052/M055/
// M057/M059 added as tabs on the existing FPODashboardPage). M032 is not a
// new page — it points at the existing LandRegistryPage.jsx.
const FarmerProfilePage = lazy(() => import('./pages/FarmerProfilePage'))
const FarmerFamilyPage = lazy(() => import('./pages/FarmerFamilyPage'))
const FarmerVerificationPage = lazy(() => import('./pages/FarmerVerificationPage'))
const FarmerSkillPage = lazy(() => import('./pages/FarmerSkillPage'))
const FarmerHealthWelfarePage = lazy(() => import('./pages/FarmerHealthWelfarePage'))
const CropCalendarPage = lazy(() => import('./pages/CropCalendarPage'))
const CropRegistrationPage = lazy(() => import('./pages/CropRegistrationPage'))
const CropVarietyPage = lazy(() => import('./pages/CropVarietyPage'))
const SeedPlanningPage = lazy(() => import('./pages/SeedPlanningPage'))
const NurseryManagementPage = lazy(() => import('./pages/NurseryManagementPage'))
const CropMonitoringPage = lazy(() => import('./pages/CropMonitoringPage'))
const LandManagementPage = lazy(() => import('./pages/LandManagementPage'))
// Third batch (2026-08-08): consolidated tabbed pages for previously
// STUB-ONLY modules, matching the LandManagementPage.jsx pattern.
const InputSupplyManagementPage = lazy(() => import('./pages/InputSupplyManagementPage'))
const LivestockManagementPage = lazy(() => import('./pages/LivestockManagementPage'))
const CommunityManagementPage = lazy(() => import('./pages/CommunityManagementPage'))
const SoilManagementPage = lazy(() => import('./pages/SoilManagementPage'))
const WaterManagementPage = lazy(() => import('./pages/WaterManagementPage'))
// SubsidyManagementPage was fully built (real subsidyAPI calls) but never
// imported into App.jsx — found by V43_ROUTE_PARITY_ANALYSIS.md, the same
// "built but never wired" bug this session keeps finding and fixing.
const SubsidyManagementPage = lazy(() => import('./pages/SubsidyManagementPage'))
// Six more fully-built pages found unrouted during the API-completeness sweep
// (2026-08-08): each already imports a real api.js client (bankerAPI, caAPI,
// governmentAPI, researchAPI, plus the fertilizer/pesticide/biofertilizer/... and
// livestock/dairy/... families) but had no <Route>, same bug class as
// SubsidyManagementPage above.
const BankerDashboardPage = lazy(() => import('./pages/BankerDashboardPage'))
const CADashboardPage = lazy(() => import('./pages/CADashboardPage'))
const GovernmentDashboardPage = lazy(() => import('./pages/GovernmentDashboardPage'))
const ResearchDashboardPage = lazy(() => import('./pages/ResearchDashboardPage'))
// Fourth batch (2026-08-08): Climate, Operations, Machinery, Horticulture,
// Fisheries, Identity and Platform Foundation consolidated tabbed pages,
// same LandManagementPage.jsx pattern as the third batch above.
const ClimateMonitoringPage = lazy(() => import('./pages/ClimateMonitoringPage'))
const OperationsManagementPage = lazy(() => import('./pages/OperationsManagementPage'))
const MachineryManagementPage = lazy(() => import('./pages/MachineryManagementPage'))
const HorticultureManagementPage = lazy(() => import('./pages/HorticultureManagementPage'))
const FisheriesManagementPage = lazy(() => import('./pages/FisheriesManagementPage'))
const IdentityManagementPage = lazy(() => import('./pages/IdentityManagementPage'))
const PlatformFoundationPage = lazy(() => import('./pages/PlatformFoundationPage'))
const EnterpriseControlPage = lazy(() => import('./pages/EnterpriseControlPage'))
// M123-M127 Livestock Management — Poultry, Goat, Sheep, Pig, Animal Health
const PoultryManagementPage = lazy(() => import('./pages/PoultryManagementPage'))
const GoatFarmingPage = lazy(() => import('./pages/GoatFarmingPage'))
const SheepFarmingPage = lazy(() => import('./pages/SheepFarmingPage'))
const PigFarmingPage = lazy(() => import('./pages/PigFarmingPage'))
const AnimalHealthPage = lazy(() => import('./pages/AnimalHealthPage'))
// Unified Ledger with Economy Segmentation — One Ledger + 9 Economies
const UnifiedLedgerPage = lazy(() => import('./pages/UnifiedLedgerPage'))
// REOS Dashboard — Rural Economic Operating System
const REOSDashboardPage = lazy(() => import('./pages/REOSDashboardPage'))
// New Enterprise Modules - AI, ERP, B2B, Marketing, Nutrient-Value
const AIDashboard = lazy(() => import('./pages/AIDashboard'))
const ERPDashboard = lazy(() => import('./pages/ERPDashboard'))
const B2BMarketplace = lazy(() => import('./pages/B2BMarketplace'))
const MarketingCenter = lazy(() => import('./pages/MarketingCenter'))
const NutrientValueMarketplace = lazy(() => import('./pages/NutrientValueMarketplace'))
const M011Page = lazy(() => import('./modules/M011/M011Page'))
const M006Page = lazy(() => import('./modules/M006/M006Page'))
// Auto-generated module imports
const M001Page = lazy(() => import('./modules/M001/M001Page'))
const M002Page = lazy(() => import('./modules/M002/M002Page'))
const M003Page = lazy(() => import('./modules/M003/M003Page'))
const M004Page = lazy(() => import('./modules/M004/M004Page'))
const M005Page = lazy(() => import('./modules/M005/M005Page'))
const M007Page = lazy(() => import('./modules/M007/M007Page'))
const M008Page = lazy(() => import('./modules/M008/M008Page'))
const M009Page = lazy(() => import('./modules/M009/M009Page'))
const M010Page = lazy(() => import('./modules/M010/M010Page'))
const M012Page = lazy(() => import('./modules/M012/M012Page'))
const M013Page = lazy(() => import('./modules/M013/M013Page'))
const M014Page = lazy(() => import('./modules/M014/M014Page'))
const M015Page = lazy(() => import('./modules/M015/M015Page'))
const M016Page = lazy(() => import('./modules/M016/M016Page'))
const M017Page = lazy(() => import('./modules/M017/M017Page'))
const M018Page = lazy(() => import('./modules/M018/M018Page'))
const M019Page = lazy(() => import('./modules/M019/M019Page'))
const M020Page = lazy(() => import('./modules/M020/M020Page'))
const M021Page = lazy(() => import('./modules/M021/M021Page'))
const M022Page = lazy(() => import('./modules/M022/M022Page'))
const M023Page = lazy(() => import('./modules/M023/M023Page'))
const M024Page = lazy(() => import('./modules/M024/M024Page'))
const M025Page = lazy(() => import('./modules/M025/M025Page'))
const M026Page = lazy(() => import('./modules/M026/M026Page'))
const M027Page = lazy(() => import('./modules/M027/M027Page'))
const M028Page = lazy(() => import('./modules/M028/M028Page'))
const M029Page = lazy(() => import('./modules/M029/M029Page'))
const M030Page = lazy(() => import('./modules/M030/M030Page'))
const M031Page = lazy(() => import('./modules/M031/M031Page'))
const M032Page = lazy(() => import('./modules/M032/M032Page'))
const M033Page = lazy(() => import('./modules/M033/M033Page'))
const M034Page = lazy(() => import('./modules/M034/M034Page'))
const M035Page = lazy(() => import('./modules/M035/M035Page'))
const M036Page = lazy(() => import('./modules/M036/M036Page'))
const M037Page = lazy(() => import('./modules/M037/M037Page'))
const M038Page = lazy(() => import('./modules/M038/M038Page'))
const M039Page = lazy(() => import('./modules/M039/M039Page'))
const M040Page = lazy(() => import('./modules/M040/M040Page'))
const M041Page = lazy(() => import('./modules/M041/M041Page'))
const M042Page = lazy(() => import('./modules/M042/M042Page'))
const M043Page = lazy(() => import('./modules/M043/M043Page'))
const M044Page = lazy(() => import('./modules/M044/M044Page'))
const M045Page = lazy(() => import('./modules/M045/M045Page'))
const M046Page = lazy(() => import('./modules/M046/M046Page'))
const M047Page = lazy(() => import('./modules/M047/M047Page'))
const M048Page = lazy(() => import('./modules/M048/M048Page'))
const M049Page = lazy(() => import('./modules/M049/M049Page'))
const M050Page = lazy(() => import('./modules/M050/M050Page'))
const M051Page = lazy(() => import('./modules/M051/M051Page'))
const M052Page = lazy(() => import('./modules/M052/M052Page'))
const M053Page = lazy(() => import('./modules/M053/M053Page'))
const M054Page = lazy(() => import('./modules/M054/M054Page'))
const M055Page = lazy(() => import('./modules/M055/M055Page'))
const M056Page = lazy(() => import('./modules/M056/M056Page'))
const M057Page = lazy(() => import('./modules/M057/M057Page'))
const M058Page = lazy(() => import('./modules/M058/M058Page'))
const M059Page = lazy(() => import('./modules/M059/M059Page'))
const M060Page = lazy(() => import('./modules/M060/M060Page'))
const M061Page = lazy(() => import('./modules/M061/M061Page'))
const M062Page = lazy(() => import('./modules/M062/M062Page'))
const M063Page = lazy(() => import('./modules/M063/M063Page'))
const M064Page = lazy(() => import('./modules/M064/M064Page'))
const M065Page = lazy(() => import('./modules/M065/M065Page'))
const M066Page = lazy(() => import('./modules/M066/M066Page'))
const M067Page = lazy(() => import('./modules/M067/M067Page'))
const M068Page = lazy(() => import('./modules/M068/M068Page'))
const M069Page = lazy(() => import('./modules/M069/M069Page'))
const M070Page = lazy(() => import('./modules/M070/M070Page'))
const M071Page = lazy(() => import('./modules/M071/M071Page'))
const M072Page = lazy(() => import('./modules/M072/M072Page'))
const M073Page = lazy(() => import('./modules/M073/M073Page'))
const M074Page = lazy(() => import('./modules/M074/M074Page'))
const M075Page = lazy(() => import('./modules/M075/M075Page'))
const M076Page = lazy(() => import('./modules/M076/M076Page'))
const M077Page = lazy(() => import('./modules/M077/M077Page'))
const M078Page = lazy(() => import('./modules/M078/M078Page'))
const M079Page = lazy(() => import('./modules/M079/M079Page'))
const M080Page = lazy(() => import('./modules/M080/M080Page'))
const M081Page = lazy(() => import('./modules/M081/M081Page'))
const M082Page = lazy(() => import('./modules/M082/M082Page'))
const M083Page = lazy(() => import('./modules/M083/M083Page'))
const M084Page = lazy(() => import('./modules/M084/M084Page'))
const M085Page = lazy(() => import('./modules/M085/M085Page'))
const M086Page = lazy(() => import('./modules/M086/M086Page'))
const M087Page = lazy(() => import('./modules/M087/M087Page'))
const M088Page = lazy(() => import('./modules/M088/M088Page'))
const M089Page = lazy(() => import('./modules/M089/M089Page'))
const M090Page = lazy(() => import('./modules/M090/M090Page'))
const M091Page = lazy(() => import('./modules/M091/M091Page'))
const M092Page = lazy(() => import('./modules/M092/M092Page'))
const M093Page = lazy(() => import('./modules/M093/M093Page'))
const M094Page = lazy(() => import('./modules/M094/M094Page'))
const M095Page = lazy(() => import('./modules/M095/M095Page'))
const M096Page = lazy(() => import('./modules/M096/M096Page'))
const M097Page = lazy(() => import('./modules/M097/M097Page'))
const M098Page = lazy(() => import('./modules/M098/M098Page'))
const M099Page = lazy(() => import('./modules/M099/M099Page'))
const M100Page = lazy(() => import('./modules/M100/M100Page'))
const M101Page = lazy(() => import('./modules/M101/M101Page'))
const M102Page = lazy(() => import('./modules/M102/M102Page'))
const M103Page = lazy(() => import('./modules/M103/M103Page'))
const M104Page = lazy(() => import('./modules/M104/M104Page'))
const M105Page = lazy(() => import('./modules/M105/M105Page'))
const M106Page = lazy(() => import('./modules/M106/M106Page'))
const M107Page = lazy(() => import('./modules/M107/M107Page'))
const M108Page = lazy(() => import('./modules/M108/M108Page'))
const M109Page = lazy(() => import('./modules/M109/M109Page'))
const M110Page = lazy(() => import('./modules/M110/M110Page'))
const M111Page = lazy(() => import('./modules/M111/M111Page'))
const M112Page = lazy(() => import('./modules/M112/M112Page'))
const M113Page = lazy(() => import('./modules/M113/M113Page'))
const M114Page = lazy(() => import('./modules/M114/M114Page'))
const M115Page = lazy(() => import('./modules/M115/M115Page'))
const M116Page = lazy(() => import('./modules/M116/M116Page'))
const M117Page = lazy(() => import('./modules/M117/M117Page'))
const M118Page = lazy(() => import('./modules/M118/M118Page'))
const M119Page = lazy(() => import('./modules/M119/M119Page'))
const M120Page = lazy(() => import('./modules/M120/M120Page'))
const M121Page = lazy(() => import('./modules/M121/M121Page'))
const M122Page = lazy(() => import('./modules/M122/M122Page'))
const M123Page = lazy(() => import('./modules/M123/M123Page'))
const M124Page = lazy(() => import('./modules/M124/M124Page'))
const M125Page = lazy(() => import('./modules/M125/M125Page'))
const M126Page = lazy(() => import('./modules/M126/M126Page'))
const M127Page = lazy(() => import('./modules/M127/M127Page'))
const M128Page = lazy(() => import('./modules/M128/M128Page'))
const M129Page = lazy(() => import('./modules/M129/M129Page'))
const M130Page = lazy(() => import('./modules/M130/M130Page'))
const M131Page = lazy(() => import('./modules/M131/M131Page'))
const M132Page = lazy(() => import('./modules/M132/M132Page'))
const M133Page = lazy(() => import('./modules/M133/M133Page'))
const M134Page = lazy(() => import('./modules/M134/M134Page'))
const M135Page = lazy(() => import('./modules/M135/M135Page'))
const M136Page = lazy(() => import('./modules/M136/M136Page'))
const M137Page = lazy(() => import('./modules/M137/M137Page'))
const M138Page = lazy(() => import('./modules/M138/M138Page'))
const M139Page = lazy(() => import('./modules/M139/M139Page'))
const M140Page = lazy(() => import('./modules/M140/M140Page'))
const M141Page = lazy(() => import('./modules/M141/M141Page'))
const M142Page = lazy(() => import('./modules/M142/M142Page'))
const M143Page = lazy(() => import('./modules/M143/M143Page'))
const M144Page = lazy(() => import('./modules/M144/M144Page'))
const M145Page = lazy(() => import('./modules/M145/M145Page'))
const M146Page = lazy(() => import('./modules/M146/M146Page'))
const M147Page = lazy(() => import('./modules/M147/M147Page'))
const M148Page = lazy(() => import('./modules/M148/M148Page'))
const M149Page = lazy(() => import('./modules/M149/M149Page'))
const M150Page = lazy(() => import('./modules/M150/M150Page'))
// End auto-generated module imports
const EconomicDashboard = lazy(() => import('./pages/economic').then((m) => ({ default: m.EconomicDashboard })))
import ProtectedRoute from './components/ProtectedRoute'
import { MultilingualProvider } from './components/Multilingual/MultilingualProvider'
// Accessibility modes {simple, kiosk, voice, sms} recovered from v42.
// Outermost provider: a shared kiosk must not persist session state, so
// this has to be established before anything below it stores anything.
import { AccessibilityProvider } from './components/Accessibility/AccessibilityProvider'
// NOTE: ErrorBoundary is already imported as a default export at the top of
// this file (line 4). This was a duplicate named import of the same
// identifier — ErrorBoundary.jsx has no named export, so this binding was
// dead weight at best; two `import ErrorBoundary` declarations for the same
// local name in one module is invalid (duplicate identifier).

function App() {
  const { user, checkAuth } = useAuthStore()

  useEffect(() => {
    checkAuth()
    
    // Register service worker for PWA functionality
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered:', registration)
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error)
        })
    }
  }, [checkAuth])

  useEffect(() => {
    if (user) {
      errorMonitoring.trackActiveUser(user.id, user.sessionId)
    }
  }, [user])

  return (
    <ErrorBoundary>
      <AccessibilityProvider>
        <MultilingualProvider>
          <Layout>
            <Suspense fallback={(
              <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">Loading...</p>
                </div>
              </div>
            )}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/marketplace" element={<MarketplacePage />} />
              <Route path="/products/:id" element={<ProductDetailPage />} />
              <Route path="/forms" element={<FormManagementPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/modules" element={<ModuleHubPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

        {/* Four public farmer doors + hub — see import comment above. */}
        <Route path="/farmer-entrance" element={<FarmerEntranceHubPage />} />
        <Route path="/farmer-entrance/sell" element={<FarmerSellDoorPage />} />
        <Route path="/farmer-entrance/household" element={<FarmerHouseholdDoorPage />} />
        <Route path="/farmer-entrance/field" element={<FarmerFieldDoorPage />} />
        <Route path="/farmer-entrance/shared" element={<FarmerSharedDoorPage />} />


        {/* Recovered modules (051-058).
            Public: forward pricing, climate and corridor economics. A farmer
            must be able to see an indicative price band and a flood warning
            without an account — putting a dispatch-blocking alert behind a
            login is not a security posture.
            Protected: ledger, tax compliance and procurement, which are
            internal records. */}
        <Route path="/pricing/forward" element={<ForwardPricingPage />} />
        <Route path="/climate" element={<ClimateWeatherPage />} />
        <Route path="/corridor-economics" element={<CorridorEconomicsPage />} />
        <Route path="/land-use" element={<LandUseCarbonPage />} />
        <Route path="/experience" element={<ExperienceLayerPage />} />
        <Route
          path="/yield-management"
          element={(
            <ProtectedRoute>
              <YieldManagementPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/competitive-position"
          element={(
            <ProtectedRoute>
              <CompetitivePositionPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/ledger"
          element={(
            <ProtectedRoute>
              <LedgerPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/compliance"
          element={(
            <ProtectedRoute>
              <CompliancePage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/procurement"
          element={(
            <ProtectedRoute>
              <RfqPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/asset-accounting"
          element={(
            <ProtectedRoute>
              <AssetAccountingPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/cost-control"
          element={(
            <ProtectedRoute>
              <CostControlPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/project-systems"
          element={(
            <ProtectedRoute>
              <ProjectSystemsPage />
            </ProtectedRoute>
          )}
        />

        {/* Protected Routes */}
        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <CartPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/wallet"
          element={
            <ProtectedRoute>
              <WalletPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bank-passport"
          element={
            <ProtectedRoute>
              <BankPassportPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute requiredRole="admin">
              <M011Page />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute requiredRole="admin">
              <M006Page />
            </ProtectedRoute>
          }
        />
        <Route
          path="/farmer-portal"
          element={
            <ProtectedRoute requiredRole="farmer">
              <FarmerPortalPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/farmerhome"
          element={
            <ProtectedRoute requiredRole="farmer">
              <FarmerHomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/farmersell"
          element={
            <ProtectedRoute requiredRole="farmer">
              <FarmerSellPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/farmerfield"
          element={
            <ProtectedRoute requiredRole="farmer">
              <FarmerFieldPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/harvestplan"
          element={
            <ProtectedRoute requiredRole="farmer">
              <HarvestPlanPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/harvestscore"
          element={
            <ProtectedRoute requiredRole="farmer">
              <HarvestScorePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/whatgrow"
          element={
            <ProtectedRoute requiredRole="farmer">
              <WhatGrowPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/seedvault"
          element={
            <ProtectedRoute requiredRole="farmer">
              <SeedVaultPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/farmadvisor"
          element={
            <ProtectedRoute requiredRole="farmer">
              <FarmAdvisorPage />
            </ProtectedRoute>
          }
        />
        <Route path="/pricecheck" element={<PriceCheckPage />} />
        <Route path="/pricebuild" element={<PriceBuildPage />} />
        <Route path="/dynamicpricing" element={<DynamicPricingPage />} />
        <Route path="/selltiming" element={<SellTimingPage />} />
        <Route path="/compare" element={<ComparePage />} />
        <Route path="/discover" element={<DiscoverPage />} />
        <Route
          path="/preorder"
          element={
            <ProtectedRoute>
              <PreOrderPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/logistics"
          element={
            <ProtectedRoute requiredRole="logistics">
              <LogisticsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/insurance"
          element={
            <ProtectedRoute>
              <InsurancePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/corporate-buyer"
          element={
            <ProtectedRoute requiredRole="corporate">
              <CorporateBuyerPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/logistics-provider"
          element={
            <ProtectedRoute requiredRole="logistics">
              <LogisticsProviderPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/economic"
          element={
            <ProtectedRoute requiredRole="admin">
              <EconomicDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/fpo-dashboard"
          element={
            <ProtectedRoute requiredRole="fpo">
              <FPODashboardPage />
            </ProtectedRoute>
          }
        />

        {/* 14 built pages recovered 2026-08-07 — real components with no
            route (verified against api.js: every API client they import
            already existed). Authorization is admin role/permission
            management, so it's admin-gated like /users and /admin/settings;
            the rest are operational records pages (dairy, irrigation,
            fertilizer stock, KYC, land/village registry, etc.) gated the
            same way as the other recovered-module business records above
            (ledger, compliance, procurement) — logged-in, no specific role. */}
        <Route
          path="/authorization"
          element={(
            <ProtectedRoute requiredRole="admin">
              <AuthorizationPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/climate-advisory"
          element={(
            <ProtectedRoute>
              <ClimateAdvisoryPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/dairy-management"
          element={(
            <ProtectedRoute>
              <DairyManagementPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/poultry-management"
          element={(
            <ProtectedRoute>
              <PoultryManagementPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/goat-farming"
          element={(
            <ProtectedRoute>
              <GoatFarmingPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/sheep-farming"
          element={(
            <ProtectedRoute>
              <SheepFarmingPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/pig-farming"
          element={(
            <ProtectedRoute>
              <PigFarmingPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/animal-health"
          element={(
            <ProtectedRoute>
              <AnimalHealthPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/unified-ledger"
          element={(
            <ProtectedRoute>
              <UnifiedLedgerPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/reos-dashboard"
          element={(
            <ProtectedRoute>
              <REOSDashboardPage />
            </ProtectedRoute>
          )}
        />
        {/* New Enterprise Modules - AI, ERP, B2B, Marketing, Nutrient-Value */}
        <Route
          path="/ai-dashboard"
          element={(
            <ProtectedRoute requiredRole="admin">
              <AIDashboard />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/erp-dashboard"
          element={(
            <ProtectedRoute requiredRole="admin">
              <ERPDashboard />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/b2b-marketplace"
          element={(
            <ProtectedRoute>
              <B2BMarketplace />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/marketing-center"
          element={(
            <ProtectedRoute requiredRole="admin">
              <MarketingCenter />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/nutrient-value-marketplace"
          element={(
            <ProtectedRoute>
              <NutrientValueMarketplace />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/farm-costing"
          element={(
            <ProtectedRoute>
              <FarmCostingPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/farmer-kyc"
          element={(
            <ProtectedRoute>
              <FarmerKycPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/fertilizer-inventory"
          element={(
            <ProtectedRoute>
              <FertilizerInventoryPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/irrigation-management"
          element={(
            <ProtectedRoute>
              <IrrigationManagementPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/labour-management"
          element={(
            <ProtectedRoute>
              <LabourManagementPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/land-registry"
          element={(
            <ProtectedRoute>
              <LandRegistryPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/orchard-management"
          element={(
            <ProtectedRoute>
              <OrchardManagementPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/pond-management"
          element={(
            <ProtectedRoute>
              <PondManagementPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/shg-management"
          element={(
            <ProtectedRoute>
              <ShgManagementPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/tractor-management"
          element={(
            <ProtectedRoute>
              <TractorManagementPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/shared-infra"
          element={(
            <ProtectedRoute>
              <SharedInfraPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/village-registry"
          element={(
            <ProtectedRoute>
              <VillageRegistryPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/sowing-management"
          element={(
            <ProtectedRoute>
              <SowingManagementPage />
            </ProtectedRoute>
          )}
        />

        {/* Second batch, 2026-08-07: Farmer, Crop and Land modules — same
            logged-in/no-specific-role gating as the operational records
            pages above. FPO tabs (M051/M052/M055/M057/M059) live inside
            /fpo-dashboard, already routed. */}
        <Route
          path="/farmer-profile"
          element={(
            <ProtectedRoute>
              <FarmerProfilePage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/farmer-family"
          element={(
            <ProtectedRoute>
              <FarmerFamilyPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/farmer-verification"
          element={(
            <ProtectedRoute>
              <FarmerVerificationPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/farmer-skills"
          element={(
            <ProtectedRoute>
              <FarmerSkillPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/farmer-welfare"
          element={(
            <ProtectedRoute>
              <FarmerHealthWelfarePage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/crop-calendar"
          element={(
            <ProtectedRoute>
              <CropCalendarPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/crop-registration"
          element={(
            <ProtectedRoute>
              <CropRegistrationPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/crop-varieties"
          element={(
            <ProtectedRoute>
              <CropVarietyPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/seed-planning"
          element={(
            <ProtectedRoute>
              <SeedPlanningPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/nursery-management"
          element={(
            <ProtectedRoute>
              <NurseryManagementPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/crop-monitoring"
          element={(
            <ProtectedRoute>
              <CropMonitoringPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/land-management"
          element={(
            <ProtectedRoute>
              <LandManagementPage />
            </ProtectedRoute>
          )}
        />
        {/* Third batch (2026-08-08): consolidated tabbed pages for
            previously STUB-ONLY modules — Input Supply (M113-M120),
            Livestock (M122-M130), Community (M042-M050), Soil (M071,
            M073-M074), Water (M076-M080). */}
        <Route
          path="/input-supply-management"
          element={(
            <ProtectedRoute>
              <InputSupplyManagementPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/livestock-management"
          element={(
            <ProtectedRoute>
              <LivestockManagementPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/community-management"
          element={(
            <ProtectedRoute>
              <CommunityManagementPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/soil-management"
          element={(
            <ProtectedRoute>
              <SoilManagementPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/water-management"
          element={(
            <ProtectedRoute>
              <WaterManagementPage />
            </ProtectedRoute>
          )}
        />
        {/* /subsidy, /subsidypassthrough, /schememonitor were three separate
            v43 routes that all landed on the same subsidy-management screen —
            kept as three paths to the same page rather than collapsing them,
            since existing links/bookmarks to any of the three should work. */}
        <Route
          path="/subsidy"
          element={(
            <ProtectedRoute>
              <SubsidyManagementPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/subsidypassthrough"
          element={(
            <ProtectedRoute>
              <SubsidyManagementPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/schememonitor"
          element={(
            <ProtectedRoute>
              <SubsidyManagementPage />
            </ProtectedRoute>
          )}
        />

        {/* Four more built-but-unrouted dashboard pages found in the
            2026-08-08 API-completeness sweep. Research Institution is a real
            registration role (RegisterPage.jsx), so ResearchDashboardPage is
            role-gated like corporate/logistics/fpo above. Banker/CA/
            Government have no corresponding registration role, so they're
            gated the same conservative way as ledger/compliance (logged-in,
            no specific role) rather than inventing a role the auth layer
            doesn't know about. */}
        <Route
          path="/banker-dashboard"
          element={(
            <ProtectedRoute>
              <BankerDashboardPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/ca-dashboard"
          element={(
            <ProtectedRoute>
              <CADashboardPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/government-dashboard"
          element={(
            <ProtectedRoute>
              <GovernmentDashboardPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/research-dashboard"
          element={(
            <ProtectedRoute requiredRole="research">
              <ResearchDashboardPage />
            </ProtectedRoute>
          )}
        />

        {/* Fourth batch (2026-08-08): Climate, Operations, Machinery,
            Horticulture, Fisheries, Identity and Platform Foundation
            consolidated pages. Identity and Platform Foundation are
            admin-gated like /users and /admin/settings; the rest are
            operational records pages, gated like Dairy/Fertilizer above. */}
        <Route
          path="/climate-monitoring"
          element={(
            <ProtectedRoute>
              <ClimateMonitoringPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/operations-management"
          element={(
            <ProtectedRoute>
              <OperationsManagementPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/machinery-management"
          element={(
            <ProtectedRoute>
              <MachineryManagementPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/horticulture-management"
          element={(
            <ProtectedRoute>
              <HorticultureManagementPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/fisheries-management"
          element={(
            <ProtectedRoute>
              <FisheriesManagementPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/identity-management"
          element={(
            <ProtectedRoute requiredRole="admin">
              <IdentityManagementPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/platform-foundation"
          element={(
            <ProtectedRoute requiredRole="admin">
              <PlatformFoundationPage />
            </ProtectedRoute>
          )}
        />
        {/* Not admin-gated: the backend (enterpriseControlService.js) only
            requires admin on the Legal and Risk-assessment routes; Workflow,
            CRM, Clients and Emergency are authenticated-only by design ("the
            person who sees the problem first is rarely the person with the
            highest privilege"). The two admin-only actions surface the
            backend's own 403 rather than the whole page being locked out. */}
        <Route
          path="/enterprise-control"
          element={(
            <ProtectedRoute>
              <EnterpriseControlPage />
            </ProtectedRoute>
          )}
        />

        {/* Auto-generated module routes (admin-protected) */}
        <Route path="/modules/m001" element={ ( <ProtectedRoute requiredRole="admin"> <M001Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m002" element={ ( <ProtectedRoute requiredRole="admin"> <M002Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m003" element={ ( <ProtectedRoute requiredRole="admin"> <M003Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m004" element={ ( <ProtectedRoute requiredRole="admin"> <M004Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m005" element={ ( <ProtectedRoute requiredRole="admin"> <M005Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m006" element={ ( <ProtectedRoute requiredRole="admin"> <M006Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m007" element={ ( <ProtectedRoute requiredRole="admin"> <M007Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m008" element={ ( <ProtectedRoute requiredRole="admin"> <M008Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m009" element={ ( <ProtectedRoute requiredRole="admin"> <M009Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m010" element={ ( <ProtectedRoute requiredRole="admin"> <M010Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m011" element={ ( <ProtectedRoute requiredRole="admin"> <M011Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m012" element={ ( <ProtectedRoute requiredRole="admin"> <M012Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m013" element={ ( <ProtectedRoute requiredRole="admin"> <M013Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m014" element={ ( <ProtectedRoute requiredRole="admin"> <M014Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m015" element={ ( <ProtectedRoute requiredRole="admin"> <M015Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m016" element={ ( <ProtectedRoute requiredRole="admin"> <M016Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m017" element={ ( <ProtectedRoute requiredRole="admin"> <M017Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m018" element={ ( <ProtectedRoute requiredRole="admin"> <M018Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m019" element={ ( <ProtectedRoute requiredRole="admin"> <M019Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m020" element={ ( <ProtectedRoute requiredRole="admin"> <M020Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m021" element={ ( <ProtectedRoute requiredRole="admin"> <M021Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m022" element={ ( <ProtectedRoute requiredRole="admin"> <M022Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m023" element={ ( <ProtectedRoute requiredRole="admin"> <M023Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m024" element={ ( <ProtectedRoute requiredRole="admin"> <M024Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m025" element={ ( <ProtectedRoute requiredRole="admin"> <M025Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m026" element={ ( <ProtectedRoute requiredRole="admin"> <M026Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m027" element={ ( <ProtectedRoute requiredRole="admin"> <M027Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m028" element={ ( <ProtectedRoute requiredRole="admin"> <M028Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m029" element={ ( <ProtectedRoute requiredRole="admin"> <M029Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m030" element={ ( <ProtectedRoute requiredRole="admin"> <M030Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m031" element={ ( <ProtectedRoute requiredRole="admin"> <M031Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m032" element={ ( <ProtectedRoute requiredRole="admin"> <M032Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m033" element={ ( <ProtectedRoute requiredRole="admin"> <M033Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m034" element={ ( <ProtectedRoute requiredRole="admin"> <M034Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m035" element={ ( <ProtectedRoute requiredRole="admin"> <M035Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m036" element={ ( <ProtectedRoute requiredRole="admin"> <M036Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m037" element={ ( <ProtectedRoute requiredRole="admin"> <M037Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m038" element={ ( <ProtectedRoute requiredRole="admin"> <M038Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m039" element={ ( <ProtectedRoute requiredRole="admin"> <M039Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m040" element={ ( <ProtectedRoute requiredRole="admin"> <M040Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m041" element={ ( <ProtectedRoute requiredRole="admin"> <M041Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m042" element={ ( <ProtectedRoute requiredRole="admin"> <M042Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m043" element={ ( <ProtectedRoute requiredRole="admin"> <M043Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m044" element={ ( <ProtectedRoute requiredRole="admin"> <M044Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m045" element={ ( <ProtectedRoute requiredRole="admin"> <M045Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m046" element={ ( <ProtectedRoute requiredRole="admin"> <M046Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m047" element={ ( <ProtectedRoute requiredRole="admin"> <M047Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m048" element={ ( <ProtectedRoute requiredRole="admin"> <M048Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m049" element={ ( <ProtectedRoute requiredRole="admin"> <M049Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m050" element={ ( <ProtectedRoute requiredRole="admin"> <M050Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m051" element={ ( <ProtectedRoute requiredRole="admin"> <M051Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m052" element={ ( <ProtectedRoute requiredRole="admin"> <M052Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m053" element={ ( <ProtectedRoute requiredRole="admin"> <M053Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m054" element={ ( <ProtectedRoute requiredRole="admin"> <M054Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m055" element={ ( <ProtectedRoute requiredRole="admin"> <M055Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m056" element={ ( <ProtectedRoute requiredRole="admin"> <M056Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m057" element={ ( <ProtectedRoute requiredRole="admin"> <M057Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m058" element={ ( <ProtectedRoute requiredRole="admin"> <M058Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m059" element={ ( <ProtectedRoute requiredRole="admin"> <M059Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m060" element={ ( <ProtectedRoute requiredRole="admin"> <M060Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m061" element={ ( <ProtectedRoute requiredRole="admin"> <M061Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m062" element={ ( <ProtectedRoute requiredRole="admin"> <M062Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m063" element={ ( <ProtectedRoute requiredRole="admin"> <M063Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m064" element={ ( <ProtectedRoute requiredRole="admin"> <M064Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m065" element={ ( <ProtectedRoute requiredRole="admin"> <M065Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m066" element={ ( <ProtectedRoute requiredRole="admin"> <M066Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m067" element={ ( <ProtectedRoute requiredRole="admin"> <M067Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m068" element={ ( <ProtectedRoute requiredRole="admin"> <M068Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m069" element={ ( <ProtectedRoute requiredRole="admin"> <M069Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m070" element={ ( <ProtectedRoute requiredRole="admin"> <M070Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m071" element={ ( <ProtectedRoute requiredRole="admin"> <M071Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m072" element={ ( <ProtectedRoute requiredRole="admin"> <M072Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m073" element={ ( <ProtectedRoute requiredRole="admin"> <M073Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m074" element={ ( <ProtectedRoute requiredRole="admin"> <M074Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m075" element={ ( <ProtectedRoute requiredRole="admin"> <M075Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m076" element={ ( <ProtectedRoute requiredRole="admin"> <M076Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m077" element={ ( <ProtectedRoute requiredRole="admin"> <M077Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m078" element={ ( <ProtectedRoute requiredRole="admin"> <M078Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m079" element={ ( <ProtectedRoute requiredRole="admin"> <M079Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m080" element={ ( <ProtectedRoute requiredRole="admin"> <M080Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m081" element={ ( <ProtectedRoute requiredRole="admin"> <M081Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m082" element={ ( <ProtectedRoute requiredRole="admin"> <M082Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m083" element={ ( <ProtectedRoute requiredRole="admin"> <M083Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m084" element={ ( <ProtectedRoute requiredRole="admin"> <M084Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m085" element={ ( <ProtectedRoute requiredRole="admin"> <M085Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m086" element={ ( <ProtectedRoute requiredRole="admin"> <M086Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m087" element={ ( <ProtectedRoute requiredRole="admin"> <M087Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m088" element={ ( <ProtectedRoute requiredRole="admin"> <M088Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m089" element={ ( <ProtectedRoute requiredRole="admin"> <M089Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m090" element={ ( <ProtectedRoute requiredRole="admin"> <M090Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m091" element={ ( <ProtectedRoute requiredRole="admin"> <M091Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m092" element={ ( <ProtectedRoute requiredRole="admin"> <M092Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m093" element={ ( <ProtectedRoute requiredRole="admin"> <M093Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m094" element={ ( <ProtectedRoute requiredRole="admin"> <M094Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m095" element={ ( <ProtectedRoute requiredRole="admin"> <M095Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m096" element={ ( <ProtectedRoute requiredRole="admin"> <M096Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m097" element={ ( <ProtectedRoute requiredRole="admin"> <M097Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m098" element={ ( <ProtectedRoute requiredRole="admin"> <M098Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m099" element={ ( <ProtectedRoute requiredRole="admin"> <M099Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m100" element={ ( <ProtectedRoute requiredRole="admin"> <M100Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m101" element={ ( <ProtectedRoute requiredRole="admin"> <M101Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m102" element={ ( <ProtectedRoute requiredRole="admin"> <M102Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m103" element={ ( <ProtectedRoute requiredRole="admin"> <M103Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m104" element={ ( <ProtectedRoute requiredRole="admin"> <M104Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m105" element={ ( <ProtectedRoute requiredRole="admin"> <M105Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m106" element={ ( <ProtectedRoute requiredRole="admin"> <M106Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m107" element={ ( <ProtectedRoute requiredRole="admin"> <M107Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m108" element={ ( <ProtectedRoute requiredRole="admin"> <M108Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m109" element={ ( <ProtectedRoute requiredRole="admin"> <M109Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m110" element={ ( <ProtectedRoute requiredRole="admin"> <M110Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m111" element={ ( <ProtectedRoute requiredRole="admin"> <M111Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m112" element={ ( <ProtectedRoute requiredRole="admin"> <M112Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m113" element={ ( <ProtectedRoute requiredRole="admin"> <M113Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m114" element={ ( <ProtectedRoute requiredRole="admin"> <M114Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m115" element={ ( <ProtectedRoute requiredRole="admin"> <M115Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m116" element={ ( <ProtectedRoute requiredRole="admin"> <M116Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m117" element={ ( <ProtectedRoute requiredRole="admin"> <M117Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m118" element={ ( <ProtectedRoute requiredRole="admin"> <M118Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m119" element={ ( <ProtectedRoute requiredRole="admin"> <M119Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m120" element={ ( <ProtectedRoute requiredRole="admin"> <M120Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m121" element={ ( <ProtectedRoute requiredRole="admin"> <M121Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m122" element={ ( <ProtectedRoute requiredRole="admin"> <M122Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m123" element={ ( <ProtectedRoute requiredRole="admin"> <M123Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m124" element={ ( <ProtectedRoute requiredRole="admin"> <M124Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m125" element={ ( <ProtectedRoute requiredRole="admin"> <M125Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m126" element={ ( <ProtectedRoute requiredRole="admin"> <M126Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m127" element={ ( <ProtectedRoute requiredRole="admin"> <M127Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m128" element={ ( <ProtectedRoute requiredRole="admin"> <M128Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m129" element={ ( <ProtectedRoute requiredRole="admin"> <M129Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m130" element={ ( <ProtectedRoute requiredRole="admin"> <M130Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m131" element={ ( <ProtectedRoute requiredRole="admin"> <M131Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m132" element={ ( <ProtectedRoute requiredRole="admin"> <M132Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m133" element={ ( <ProtectedRoute requiredRole="admin"> <M133Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m134" element={ ( <ProtectedRoute requiredRole="admin"> <M134Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m135" element={ ( <ProtectedRoute requiredRole="admin"> <M135Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m136" element={ ( <ProtectedRoute requiredRole="admin"> <M136Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m137" element={ ( <ProtectedRoute requiredRole="admin"> <M137Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m138" element={ ( <ProtectedRoute requiredRole="admin"> <M138Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m139" element={ ( <ProtectedRoute requiredRole="admin"> <M139Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m140" element={ ( <ProtectedRoute requiredRole="admin"> <M140Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m141" element={ ( <ProtectedRoute requiredRole="admin"> <M141Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m142" element={ ( <ProtectedRoute requiredRole="admin"> <M142Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m143" element={ ( <ProtectedRoute requiredRole="admin"> <M143Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m144" element={ ( <ProtectedRoute requiredRole="admin"> <M144Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m145" element={ ( <ProtectedRoute requiredRole="admin"> <M145Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m146" element={ ( <ProtectedRoute requiredRole="admin"> <M146Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m147" element={ ( <ProtectedRoute requiredRole="admin"> <M147Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m148" element={ ( <ProtectedRoute requiredRole="admin"> <M148Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m149" element={ ( <ProtectedRoute requiredRole="admin"> <M149Page /> </ProtectedRoute> ) } />
        <Route path="/modules/m150" element={ ( <ProtectedRoute requiredRole="admin"> <M150Page /> </ProtectedRoute> ) } />
        {/* End auto-generated module routes */}
        {/* 404 */}
        <Route path="*" element={<div className="p-8 text-center">Page not found</div>} />
      </Routes>
            </Suspense>
    </Layout>
    </MultilingualProvider>
    </AccessibilityProvider>
    </ErrorBoundary>
  )
}

export default App
