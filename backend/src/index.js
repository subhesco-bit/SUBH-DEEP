// Load environment variables FIRST, before any other requires
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env.local') });
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const index = require('./routes/index.js');
const devinRoutes = require('./routes/devinRoutes');
const yieldManagement = require('./routes/yieldManagement.js');
const wikipediaRoutes = require('./routes/wikipediaRoutes.js');
const weatherRoutes = require('./routes/weatherRoutes.js');
const weatherAdvisory = require('./routes/weatherAdvisory.js');
const wearableIntegrationRoutes = require('./routes/wearableIntegrationRoutes.js');
const waterManagementRoutes = require('./routes/waterManagementRoutes.js');
const warehouseManagement = require('./routes/warehouseManagement.js');
const walletRoutes = require('./routes/walletRoutes.js');
const vr = require('./routes/vr.js');
const visionRoutes = require('./routes/visionRoutes.js');
const videoAnalytics = require('./routes/videoAnalytics.js');
const vendorRoutes = require('./routes/vendorRoutes.js');
const userRoutes = require('./routes/userRoutes.js');
const unifiedAIRoutes = require('./routes/unifiedAIRoutes.js');
const unifiedAIGateway = require('./routes/unifiedAIGateway.js');
const transactionRoutes = require('./routes/transactionRoutes.js');
const trackDartRoutes = require('./routes/trackDartRoutes.js');
const tenantManagementRoutes = require('./routes/tenantManagementRoutes.js');
const systemAdministrationRoutes = require('./routes/systemAdministrationRoutes.js');
const supplyChainTracking = require('./routes/supplyChainTracking.js');
const supplyChainAnalytics = require('./routes/supplyChainAnalytics.js');
const supplyChainDecisionRoutes = require('./routes/supplyChainDecisionRoutes.js');
const subscriptions = require('./routes/subscriptions.js');
const soilManagementRoutes = require('./routes/soilManagementRoutes.js');
const soilHealth = require('./routes/soilHealth.js');
const sheepRoutes = require('./routes/sheepRoutes.js');
const sellerVerifications = require('./routes/sellerVerifications.js');
const sellerRankingRoutes = require('./routes/sellerRankingRoutes.js');
const seedVaultRoutes = require('./routes/seedVaultRoutes.js');
const sapModuleArchitectureRoutes = require('./routes/sapModuleArchitectureRoutes.js');
const roleManagementRoutes = require('./routes/roleManagementRoutes.js');
const riskPricingRoutes = require('./routes/riskPricingRoutes.js');
const riskAssessment = require('./routes/riskAssessment.js');
const rfqRoutes = require('./routes/rfqRoutes.js');
const revenueRoutes = require('./routes/revenueRoutes.js');
const returnLoadBoardRoutes = require('./routes/returnLoadBoardRoutes.js');
const researchAndDevelopmentRoutes = require('./routes/researchAndDevelopmentRoutes.js');
const regionalVarietyRoutes = require('./routes/regionalVarietyRoutes.js');
const neVarietiesRoutes = require('./routes/neVarietiesRoutes.js');
const recoveredFinanceRoutes = require('./routes/recoveredFinanceRoutes.js');
const realtimeMonitoringRoutes = require('./routes/realtimeMonitoringRoutes.js');
const qualityAssurance = require('./routes/qualityAssurance.js');
const projectSystemsRoutes = require('./routes/projectSystemsRoutes.js');
const productRoutes = require('./routes/productRoutes.js');
const productReviewRoutes = require('./routes/productReviewRoutes.js');
const productMediaAIRoutes = require('./routes/productMediaAIRoutes.js');
const publicDataRoutes = require('./routes/publicDataRoutes.js');
const productCertifications = require('./routes/productCertifications.js');
const libraryAIWorkspaceRoutes = require('./routes/libraryAIWorkspaceRoutes.js');
const priceForecasting = require('./routes/priceForecasting.js');
const preventiveMaintenanceRoutes = require('./routes/preventiveMaintenanceRoutes.js');
const predictiveIntelligenceRoutes = require('./routes/predictiveIntelligenceRoutes.js');
const predictiveAnalytics = require('./routes/predictiveAnalytics.js');
const poultryRoutes = require('./routes/poultryRoutes.js');
const platformTelemetryRoutes = require('./routes/platformTelemetryRoutes.js');
const platformCoreRoutes = require('./routes/platformCoreRoutes.js');
const M041VillageERPRoutes = require('./modules/M041/routes.js');
const finalBatchModuleM002Routes = require('./modules/M002/routes.js');
const finalBatchModuleM003Routes = require('./modules/M003/routes.js');
const finalBatchModuleM004Routes = require('./modules/M004/routes.js');
const finalBatchModuleM005Routes = require('./modules/M005/routes.js');
const finalBatchModuleM006Routes = require('./modules/M006/routes.js');
const finalBatchModuleM007Routes = require('./modules/M007/routes.js');
const finalBatchModuleM008Routes = require('./modules/M008/routes.js');
const finalBatchModuleM009Routes = require('./modules/M009/routes.js');
const finalBatchModuleM010Routes = require('./modules/M010/routes.js');
const finalBatchModuleM011Routes = require('./modules/M011/routes.js');
const finalBatchModuleM012Routes = require('./modules/M012/routes.js');
const finalBatchModuleM013Routes = require('./modules/M013/routes.js');
const finalBatchModuleM014Routes = require('./modules/M014/routes.js');
const finalBatchModuleM015Routes = require('./modules/M015/routes.js');
const finalBatchModuleM017Routes = require('./modules/M017/routes.js');
const finalBatchModuleM018Routes = require('./modules/M018/routes.js');
const finalBatchModuleM019Routes = require('./modules/M019/routes.js');
const finalBatchModuleM020Routes = require('./modules/M020/routes.js');
const finalBatchModuleM021Routes = require('./modules/M021/routes.js');
const finalBatchModuleM022Routes = require('./modules/M022/routes.js');
const finalBatchModuleM023Routes = require('./modules/M023/routes.js');
const finalBatchModuleM024Routes = require('./modules/M024/routes.js');
const finalBatchModuleM025Routes = require('./modules/M025/routes.js');
const finalBatchModuleM026Routes = require('./modules/M026/routes.js');
const finalBatchModuleM027Routes = require('./modules/M027/routes.js');
const finalBatchModuleM028Routes = require('./modules/M028/routes.js');
const finalBatchModuleM029Routes = require('./modules/M029/routes.js');
const finalBatchModuleM030Routes = require('./modules/M030/routes.js');
const finalBatchModuleM101Routes = require('./modules/M101/routes.js');
const finalBatchModuleM102Routes = require('./modules/M102/routes.js');
const finalBatchModuleM151Routes = require('./modules/M151/routes.js');
const finalBatchModuleM201Routes = require('./modules/M201/routes.js');
const finalBatchModuleM301Routes = require('./modules/M301/routes.js');
const finalBatchModuleM63Routes = require('./modules/M63/routes.js');
const finalBatchModuleM64Routes = require('./modules/M64/routes.js');
const finalBatchModuleM65Routes = require('./modules/M65/routes.js');
const legacyModuleM001Routes = require('./modules/M001/routes.js');
const legacyModuleM016Routes = require('./modules/M016/routes.js');
const legacyModuleM031Routes = require('./modules/M031/routes.js');
const legacyModuleM032Routes = require('./modules/M032/routes.js');
const legacyModuleM033Routes = require('./modules/M033/routes.js');
const legacyModuleM034Routes = require('./modules/M034/routes.js');
const legacyModuleM035Routes = require('./modules/M035/routes.js');
const legacyModuleM036Routes = require('./modules/M036/routes.js');
const legacyModuleM037Routes = require('./modules/M037/routes.js');
const legacyModuleM038Routes = require('./modules/M038/routes.js');
const legacyModuleM039Routes = require('./modules/M039/routes.js');
const legacyModuleM040Routes = require('./modules/M040/routes.js');
const legacyModuleM042Routes = require('./modules/M042/routes.js');
const legacyModuleM043Routes = require('./modules/M043/routes.js');
const legacyModuleM044Routes = require('./modules/M044/routes.js');
const legacyModuleM045Routes = require('./modules/M045/routes.js');
const legacyModuleM046Routes = require('./modules/M046/routes.js');
const legacyModuleM047Routes = require('./modules/M047/routes.js');
const legacyModuleM048Routes = require('./modules/M048/routes.js');
const legacyModuleM049Routes = require('./modules/M049/routes.js');
const legacyModuleM050Routes = require('./modules/M050/routes.js');
const legacyModuleM051Routes = require('./modules/M051/routes.js');
const legacyModuleM052Routes = require('./modules/M052/routes.js');
const legacyModuleM053Routes = require('./modules/M053/routes.js');
const legacyModuleM054Routes = require('./modules/M054/routes.js');
const legacyModuleM055Routes = require('./modules/M055/routes.js');
const legacyModuleM056Routes = require('./modules/M056/routes.js');
const legacyModuleM057Routes = require('./modules/M057/routes.js');
const legacyModuleM058Routes = require('./modules/M058/routes.js');
const legacyModuleM059Routes = require('./modules/M059/routes.js');
const legacyModuleM060Routes = require('./modules/M060/routes.js');
const legacyModuleM061Routes = require('./modules/M061/routes.js');
const legacyModuleM062Routes = require('./modules/M062/routes.js');
const legacyModuleM063Routes = require('./modules/M063/routes.js');
const legacyModuleM064Routes = require('./modules/M064/routes.js');
const legacyModuleM065Routes = require('./modules/M065/routes.js');
const legacyModuleM066Routes = require('./modules/M066/routes.js');
const legacyModuleM067Routes = require('./modules/M067/routes.js');
const legacyModuleM068Routes = require('./modules/M068/routes.js');
const legacyModuleM069Routes = require('./modules/M069/routes.js');
const legacyModuleM070Routes = require('./modules/M070/routes.js');
const legacyModuleM071Routes = require('./modules/M071/routes.js');
const legacyModuleM072Routes = require('./modules/M072/routes.js');
const legacyModuleM073Routes = require('./modules/M073/routes.js');
const legacyModuleM074Routes = require('./modules/M074/routes.js');
const legacyModuleM075Routes = require('./modules/M075/routes.js');
const legacyModuleM076Routes = require('./modules/M076/routes.js');
const legacyModuleM077Routes = require('./modules/M077/routes.js');
const legacyModuleM078Routes = require('./modules/M078/routes.js');
const legacyModuleM079Routes = require('./modules/M079/routes.js');
const legacyModuleM080Routes = require('./modules/M080/routes.js');
const legacyModuleM081Routes = require('./modules/M081/routes.js');
const legacyModuleM082Routes = require('./modules/M082/routes.js');
const legacyModuleM083Routes = require('./modules/M083/routes.js');
const legacyModuleM084Routes = require('./modules/M084/routes.js');
const legacyModuleM085Routes = require('./modules/M085/routes.js');
const legacyModuleM086Routes = require('./modules/M086/routes.js');
const legacyModuleM087Routes = require('./modules/M087/routes.js');
const legacyModuleM088Routes = require('./modules/M088/routes.js');
const legacyModuleM089Routes = require('./modules/M089/routes.js');
const legacyModuleM090Routes = require('./modules/M090/routes.js');
const legacyModuleM091Routes = require('./modules/M091/routes.js');
const legacyModuleM092Routes = require('./modules/M092/routes.js');
const legacyModuleM093Routes = require('./modules/M093/routes.js');
const legacyModuleM094Routes = require('./modules/M094/routes.js');
const legacyModuleM095Routes = require('./modules/M095/routes.js');
const legacyModuleM096Routes = require('./modules/M096/routes.js');
const legacyModuleM097Routes = require('./modules/M097/routes.js');
const legacyModuleM098Routes = require('./modules/M098/routes.js');
const legacyModuleM099Routes = require('./modules/M099/routes.js');
const legacyModuleM100Routes = require('./modules/M100/routes.js');
const legacyModuleM103Routes = require('./modules/M103/routes.js');
const legacyModuleM104Routes = require('./modules/M104/routes.js');
const legacyModuleM105Routes = require('./modules/M105/routes.js');
const legacyModuleM106Routes = require('./modules/M106/routes.js');
const legacyModuleM107Routes = require('./modules/M107/routes.js');
const legacyModuleM108Routes = require('./modules/M108/routes.js');
const legacyModuleM109Routes = require('./modules/M109/routes.js');
const legacyModuleM110Routes = require('./modules/M110/routes.js');
const legacyModuleM111Routes = require('./modules/M111/routes.js');
const legacyModuleM112Routes = require('./modules/M112/routes.js');
const legacyModuleM113Routes = require('./modules/M113/routes.js');
const legacyModuleM114Routes = require('./modules/M114/routes.js');
const legacyModuleM115Routes = require('./modules/M115/routes.js');
const legacyModuleM116Routes = require('./modules/M116/routes.js');
const legacyModuleM117Routes = require('./modules/M117/routes.js');
const legacyModuleM118Routes = require('./modules/M118/routes.js');
const legacyModuleM119Routes = require('./modules/M119/routes.js');
const legacyModuleM120Routes = require('./modules/M120/routes.js');
const legacyModuleM121Routes = require('./modules/M121/routes.js');
const legacyModuleM122Routes = require('./modules/M122/routes.js');
const legacyModuleM123Routes = require('./modules/M123/routes.js');
const legacyModuleM124Routes = require('./modules/M124/routes.js');
const legacyModuleM125Routes = require('./modules/M125/routes.js');
const legacyModuleM126Routes = require('./modules/M126/routes.js');
const legacyModuleM127Routes = require('./modules/M127/routes.js');
const legacyModuleM128Routes = require('./modules/M128/routes.js');
const legacyModuleM129Routes = require('./modules/M129/routes.js');
const legacyModuleM130Routes = require('./modules/M130/routes.js');
const legacyModuleM131Routes = require('./modules/M131/routes.js');
const legacyModuleM132Routes = require('./modules/M132/routes.js');
const legacyModuleM133Routes = require('./modules/M133/routes.js');
const legacyModuleM134Routes = require('./modules/M134/routes.js');
const legacyModuleM135Routes = require('./modules/M135/routes.js');
const legacyModuleM136Routes = require('./modules/M136/routes.js');
const legacyModuleM137Routes = require('./modules/M137/routes.js');
const legacyModuleM138Routes = require('./modules/M138/routes.js');
const legacyModuleM139Routes = require('./modules/M139/routes.js');
const legacyModuleM140Routes = require('./modules/M140/routes.js');
const legacyModuleM141Routes = require('./modules/M141/routes.js');
const legacyModuleM142Routes = require('./modules/M142/routes.js');
const legacyModuleM143Routes = require('./modules/M143/routes.js');
const legacyModuleM144Routes = require('./modules/M144/routes.js');
const legacyModuleM145Routes = require('./modules/M145/routes.js');
const legacyModuleM146Routes = require('./modules/M146/routes.js');
const legacyModuleM147Routes = require('./modules/M147/routes.js');
const legacyModuleM148Routes = require('./modules/M148/routes.js');
const legacyModuleM149Routes = require('./modules/M149/routes.js');
const legacyModuleM150Routes = require('./modules/M150/routes.js');
const legacyModuleM152Routes = require('./modules/M152/routes.js');
const legacyModuleM153Routes = require('./modules/M153/routes.js');
const legacyModuleM154Routes = require('./modules/M154/routes.js');
const legacyModuleM155Routes = require('./modules/M155/routes.js');
const legacyModuleM156Routes = require('./modules/M156/routes.js');
const legacyModuleM157Routes = require('./modules/M157/routes.js');
const legacyModuleM158Routes = require('./modules/M158/routes.js');
const legacyModuleM159Routes = require('./modules/M159/routes.js');
const legacyModuleM160Routes = require('./modules/M160/routes.js');
const legacyModuleM161Routes = require('./modules/M161/routes.js');
const legacyModuleM162Routes = require('./modules/M162/routes.js');
const legacyModuleM163Routes = require('./modules/M163/routes.js');
const legacyModuleM164Routes = require('./modules/M164/routes.js');
const legacyModuleM165Routes = require('./modules/M165/routes.js');
const legacyModuleM166Routes = require('./modules/M166/routes.js');
const legacyModuleM167Routes = require('./modules/M167/routes.js');
const legacyModuleM168Routes = require('./modules/M168/routes.js');
const legacyModuleM169Routes = require('./modules/M169/routes.js');
const legacyModuleM170Routes = require('./modules/M170/routes.js');
const legacyModuleM171Routes = require('./modules/M171/routes.js');
const legacyModuleM172Routes = require('./modules/M172/routes.js');
const legacyModuleM173Routes = require('./modules/M173/routes.js');
const legacyModuleM174Routes = require('./modules/M174/routes.js');
const legacyModuleM175Routes = require('./modules/M175/routes.js');
const legacyModuleM176Routes = require('./modules/M176/routes.js');
const legacyModuleM177Routes = require('./modules/M177/routes.js');
const legacyModuleM178Routes = require('./modules/M178/routes.js');
const legacyModuleM179Routes = require('./modules/M179/routes.js');
const legacyModuleM180Routes = require('./modules/M180/routes.js');
const legacyModuleM181Routes = require('./modules/M181/routes.js');
const legacyModuleM182Routes = require('./modules/M182/routes.js');
const legacyModuleM183Routes = require('./modules/M183/routes.js');
const legacyModuleM184Routes = require('./modules/M184/routes.js');
const legacyModuleM185Routes = require('./modules/M185/routes.js');
const legacyModuleM186Routes = require('./modules/M186/routes.js');
const legacyModuleM187Routes = require('./modules/M187/routes.js');
const legacyModuleM188Routes = require('./modules/M188/routes.js');
const legacyModuleM189Routes = require('./modules/M189/routes.js');
const legacyModuleM190Routes = require('./modules/M190/routes.js');
const legacyModuleM191Routes = require('./modules/M191/routes.js');
const legacyModuleM192Routes = require('./modules/M192/routes.js');
const legacyModuleM193Routes = require('./modules/M193/routes.js');
const legacyModuleM194Routes = require('./modules/M194/routes.js');
const legacyModuleM195Routes = require('./modules/M195/routes.js');
const legacyModuleM196Routes = require('./modules/M196/routes.js');
const legacyModuleM197Routes = require('./modules/M197/routes.js');
const legacyModuleM198Routes = require('./modules/M198/routes.js');
const legacyModuleM199Routes = require('./modules/M199/routes.js');
const legacyModuleM200Routes = require('./modules/M200/routes.js');
const legacyModuleM202Routes = require('./modules/M202/routes.js');
const legacyModuleM203Routes = require('./modules/M203/routes.js');
const legacyModuleM204Routes = require('./modules/M204/routes.js');
const legacyModuleM205Routes = require('./modules/M205/routes.js');
const legacyModuleM206Routes = require('./modules/M206/routes.js');
const legacyModuleM207Routes = require('./modules/M207/routes.js');
const legacyModuleM208Routes = require('./modules/M208/routes.js');
const legacyModuleM209Routes = require('./modules/M209/routes.js');
const legacyModuleM210Routes = require('./modules/M210/routes.js');
const legacyModuleM211Routes = require('./modules/M211/routes.js');
const legacyModuleM212Routes = require('./modules/M212/routes.js');
const legacyModuleM213Routes = require('./modules/M213/routes.js');
const legacyModuleM214Routes = require('./modules/M214/routes.js');
const legacyModuleM215Routes = require('./modules/M215/routes.js');
const legacyModuleM216Routes = require('./modules/M216/routes.js');
const legacyModuleM217Routes = require('./modules/M217/routes.js');
const legacyModuleM218Routes = require('./modules/M218/routes.js');
const legacyModuleM219Routes = require('./modules/M219/routes.js');
const legacyModuleM220Routes = require('./modules/M220/routes.js');
const legacyModuleM221Routes = require('./modules/M221/routes.js');
const legacyModuleM222Routes = require('./modules/M222/routes.js');
const legacyModuleM223Routes = require('./modules/M223/routes.js');
const legacyModuleM224Routes = require('./modules/M224/routes.js');
const legacyModuleM225Routes = require('./modules/M225/routes.js');
const legacyModuleM226Routes = require('./modules/M226/routes.js');
const legacyModuleM227Routes = require('./modules/M227/routes.js');
const legacyModuleM228Routes = require('./modules/M228/routes.js');
const legacyModuleM229Routes = require('./modules/M229/routes.js');
const legacyModuleM230Routes = require('./modules/M230/routes.js');
const legacyModuleM231Routes = require('./modules/M231/routes.js');
const legacyModuleM232Routes = require('./modules/M232/routes.js');
const legacyModuleM233Routes = require('./modules/M233/routes.js');
const legacyModuleM234Routes = require('./modules/M234/routes.js');
const legacyModuleM235Routes = require('./modules/M235/routes.js');
const legacyModuleM236Routes = require('./modules/M236/routes.js');
const legacyModuleM237Routes = require('./modules/M237/routes.js');
const legacyModuleM238Routes = require('./modules/M238/routes.js');
const legacyModuleM239Routes = require('./modules/M239/routes.js');
const legacyModuleM240Routes = require('./modules/M240/routes.js');
const legacyModuleM241Routes = require('./modules/M241/routes.js');
const legacyModuleM242Routes = require('./modules/M242/routes.js');
const legacyModuleM243Routes = require('./modules/M243/routes.js');
const legacyModuleM244Routes = require('./modules/M244/routes.js');
const legacyModuleM245Routes = require('./modules/M245/routes.js');
const legacyModuleM246Routes = require('./modules/M246/routes.js');
const legacyModuleM247Routes = require('./modules/M247/routes.js');
const legacyModuleM248Routes = require('./modules/M248/routes.js');
const legacyModuleM249Routes = require('./modules/M249/routes.js');
const legacyModuleM250Routes = require('./modules/M250/routes.js');
const legacyModuleM251Routes = require('./modules/M251/routes.js');
const legacyModuleM252Routes = require('./modules/M252/routes.js');
const legacyModuleM253Routes = require('./modules/M253/routes.js');
const legacyModuleM254Routes = require('./modules/M254/routes.js');
const legacyModuleM255Routes = require('./modules/M255/routes.js');
const legacyModuleM256Routes = require('./modules/M256/routes.js');
const legacyModuleM257Routes = require('./modules/M257/routes.js');
const legacyModuleM258Routes = require('./modules/M258/routes.js');
const legacyModuleM259Routes = require('./modules/M259/routes.js');
const legacyModuleM260Routes = require('./modules/M260/routes.js');
const legacyModuleM261Routes = require('./modules/M261/routes.js');
const legacyModuleM262Routes = require('./modules/M262/routes.js');
const legacyModuleM263Routes = require('./modules/M263/routes.js');
const legacyModuleM264Routes = require('./modules/M264/routes.js');
const legacyModuleM265Routes = require('./modules/M265/routes.js');
const legacyModuleM266Routes = require('./modules/M266/routes.js');
const legacyModuleM267Routes = require('./modules/M267/routes.js');
const legacyModuleM268Routes = require('./modules/M268/routes.js');
const legacyModuleM269Routes = require('./modules/M269/routes.js');
const legacyModuleM270Routes = require('./modules/M270/routes.js');
const legacyModuleM271Routes = require('./modules/M271/routes.js');
const legacyModuleM272Routes = require('./modules/M272/routes.js');
const legacyModuleM273Routes = require('./modules/M273/routes.js');
const legacyModuleM274Routes = require('./modules/M274/routes.js');
const legacyModuleM275Routes = require('./modules/M275/routes.js');
const legacyModuleM276Routes = require('./modules/M276/routes.js');
const legacyModuleM277Routes = require('./modules/M277/routes.js');
const legacyModuleM278Routes = require('./modules/M278/routes.js');
const legacyModuleM279Routes = require('./modules/M279/routes.js');
const legacyModuleM280Routes = require('./modules/M280/routes.js');
const legacyModuleM281Routes = require('./modules/M281/routes.js');
const legacyModuleM282Routes = require('./modules/M282/routes.js');
const legacyModuleM283Routes = require('./modules/M283/routes.js');
const legacyModuleM284Routes = require('./modules/M284/routes.js');
const legacyModuleM285Routes = require('./modules/M285/routes.js');
const legacyModuleM286Routes = require('./modules/M286/routes.js');
const legacyModuleM287Routes = require('./modules/M287/routes.js');
const legacyModuleM288Routes = require('./modules/M288/routes.js');
const legacyModuleM289Routes = require('./modules/M289/routes.js');
const legacyModuleM290Routes = require('./modules/M290/routes.js');
const legacyModuleM291Routes = require('./modules/M291/routes.js');
const legacyModuleM292Routes = require('./modules/M292/routes.js');
const legacyModuleM293Routes = require('./modules/M293/routes.js');
const legacyModuleM294Routes = require('./modules/M294/routes.js');
const legacyModuleM295Routes = require('./modules/M295/routes.js');
const legacyModuleM296Routes = require('./modules/M296/routes.js');
const legacyModuleM297Routes = require('./modules/M297/routes.js');
const legacyModuleM298Routes = require('./modules/M298/routes.js');
const legacyModuleM299Routes = require('./modules/M299/routes.js');
const legacyModuleM300Routes = require('./modules/M300/routes.js');
const legacyModuleM302Routes = require('./modules/M302/routes.js');
const legacyModuleM303Routes = require('./modules/M303/routes.js');
const legacyModuleM304Routes = require('./modules/M304/routes.js');
const legacyModuleM305Routes = require('./modules/M305/routes.js');
const legacyModuleM306Routes = require('./modules/M306/routes.js');
const legacyModuleM307Routes = require('./modules/M307/routes.js');
const legacyModuleM308Routes = require('./modules/M308/routes.js');
const legacyModuleM309Routes = require('./modules/M309/routes.js');
const legacyModuleM310Routes = require('./modules/M310/routes.js');
const legacyModuleM311Routes = require('./modules/M311/routes.js');
const legacyModuleM312Routes = require('./modules/M312/routes.js');
const legacyModuleM313Routes = require('./modules/M313/routes.js');
const legacyModuleM314Routes = require('./modules/M314/routes.js');
const legacyModuleM315Routes = require('./modules/M315/routes.js');
const legacyModuleM316Routes = require('./modules/M316/routes.js');
const legacyModuleM317Routes = require('./modules/M317/routes.js');
const legacyModuleM318Routes = require('./modules/M318/routes.js');
const legacyModuleM319Routes = require('./modules/M319/routes.js');
const legacyModuleM320Routes = require('./modules/M320/routes.js');
const legacyModuleM321Routes = require('./modules/M321/routes.js');
const legacyModuleM322Routes = require('./modules/M322/routes.js');
const legacyModuleM323Routes = require('./modules/M323/routes.js');
const legacyModuleM324Routes = require('./modules/M324/routes.js');
const legacyModuleM325Routes = require('./modules/M325/routes.js');
const legacyModuleM326Routes = require('./modules/M326/routes.js');
const legacyModuleM327Routes = require('./modules/M327/routes.js');
const legacyModuleM328Routes = require('./modules/M328/routes.js');
const legacyModuleM329Routes = require('./modules/M329/routes.js');
const legacyModuleM330Routes = require('./modules/M330/routes.js');
const legacyModuleM331Routes = require('./modules/M331/routes.js');
const legacyModuleM332Routes = require('./modules/M332/routes.js');
const legacyModuleM333Routes = require('./modules/M333/routes.js');
const legacyModuleM334Routes = require('./modules/M334/routes.js');
const legacyModuleM335Routes = require('./modules/M335/routes.js');
const legacyModuleM336Routes = require('./modules/M336/routes.js');
const legacyModuleM337Routes = require('./modules/M337/routes.js');
const legacyModuleM338Routes = require('./modules/M338/routes.js');
const legacyModuleM339Routes = require('./modules/M339/routes.js');
const legacyModuleM340Routes = require('./modules/M340/routes.js');
const legacyModuleM341Routes = require('./modules/M341/routes.js');
const legacyModuleM342Routes = require('./modules/M342/routes.js');
const legacyModuleM343Routes = require('./modules/M343/routes.js');
const legacyModuleM344Routes = require('./modules/M344/routes.js');
const platformConfigurationRoutes = require('./routes/platformConfigurationRoutes.js');
const pigRoutes = require('./routes/pigRoutes.js');
const phase9 = require('./routes/phase9.js');
const phase8 = require('./routes/phase8.js');
const phase12 = require('./routes/phase12.js');
const phase11 = require('./routes/phase11.js');
const phase10 = require('./routes/phase10.js');
const paymentRoutes = require('./routes/paymentRoutes.js');
const paymentGatewayRoutes = require('./routes/paymentGatewayRoutes.js');
const ORPHANED_SERVICES_MOUNT = require('./routes/ORPHANED_SERVICES_MOUNT.js');
const organizationManagementRoutes = require('./routes/organizationManagementRoutes.js');
const orderRoutes = require('./routes/orderRoutes.js');
const operationsRouteSupport = require('./routes/operationsRouteSupport.js');
const operationsManagementRoutes = require('./routes/operationsManagementRoutes.js');
const nutritionIntelligenceRoutes = require('./routes/nutritionIntelligenceRoutes.js');
const nutrientValueSalesRoutes = require('./routes/nutrientValueSalesRoutes.js');
const nlp = require('./routes/nlp.js');
const nervousSystemRoutes = require('./routes/nervousSystemRoutes.js');
const mlOptimization = require('./routes/mlOptimization.js');
const marketplaceEnhancements = require('./routes/marketplaceEnhancements.js');
const marketDataRoutes = require('./routes/marketDataRoutes.js');
const marketAnalytics = require('./routes/marketAnalytics.js');
const m400AiBackboneRoutes = require('./routes/m400AiBackboneRoutes.js');
const logisticsEnhancements = require('./routes/logisticsEnhancements.js');
const logisticsEnhancementRoutes = require('./routes/logisticsEnhancementRoutes.js');
const loanManagement = require('./routes/loanManagement.js');
const livestockRouteSupport = require('./routes/livestockRouteSupport.js');
const livestockManagementRoutes = require('./routes/livestockManagementRoutes.js');
const livestock = require('./routes/livestock.js');
const libraryRoutes = require('./routes/libraryRoutes.js');
const landRecordsRoutes = require('./routes/landRecordsRoutes.js');
const landManagementRoutes = require('./routes/landManagementRoutes.js');
const knowledgeRoutes = require('./routes/knowledgeRoutes.js');
const irrigationManagementRoutes = require('./routes/irrigationManagementRoutes.js');
const iotSensors = require('./routes/iotSensors.js');
const iotIntegrationRoutes = require('./routes/iotIntegrationRoutes.js');
const insuranceEnhancements = require('./routes/insuranceEnhancements.js');
const inputSupplyManagementRoutes = require('./routes/inputSupplyManagementRoutes.js');
const informationSharingRoutes = require('./routes/informationSharingRoutes.js');
const identityManagementRoutes = require('./routes/identityManagementRoutes.js');
const hrRoutes = require('./routes/hrRoutes.js');
const horticultureManagementRoutes = require('./routes/horticultureManagementRoutes.js');
const horticulture = require('./routes/horticulture.js');
const gstRoutes = require('./routes/finance/gstRoutes.js');
const greenhouse = require('./routes/greenhouse.js');
const governanceModule = require('./routes/governanceModule.js');
const goatRoutes = require('./routes/goatRoutes.js');
const glutWarningRoutes = require('./routes/glutWarningRoutes.js');
const geofencingRoutes = require('./routes/geofencingRoutes.js');
const freightPoolingRoutes = require('./routes/freightPoolingRoutes.js');
const freightPooling = require('./routes/freightPooling.js');
const foodRoutes = require('./routes/foodRoutes.js');
const foluRoutes = require('./routes/foluRoutes.js');
const foluBenchmarkRoutes = require('./routes/foluBenchmarkRoutes.js');
const fisheriesManagementRoutes = require('./routes/fisheriesManagementRoutes.js');
const financialAnalytics = require('./routes/financialAnalytics.js');
const fertilizerRoutes = require('./routes/fertilizerRoutes.js');
const farmerValueRoutes = require('./routes/farmerValueRoutes.js');
const farmerTrainingRoutes = require('./routes/farmerTrainingRoutes.js');
const farmerRoutes = require('./routes/farmerRoutes.js');
const farmerPortalEnhancements = require('./routes/farmerPortalEnhancements.js');
const farmerHealthRoutes = require('./routes/agriculture/farmerHealthRoutes.js');
const farmerFamilyRoutes = require('./routes/farmerFamilyRoutes.js');
const farmCosting = require('./routes/farmCosting.js');
const farmAnalytics = require('./routes/farmAnalytics.js');
const experienceRoutes = require('./routes/experienceRoutes.js');
const escrowRoutes = require('./routes/escrowRoutes.js');
const equipmentExchangeRoutes = require('./routes/commerce/equipmentExchangeRoutes.js');
const enterpriseRouteSupport = require('./routes/enterpriseRouteSupport.js');
const enterpriseIntegrationRoutes = require('./routes/enterpriseIntegrationRoutes.js');
const enterpriseAIRoutes = require('./routes/ai/enterpriseAIRoutes.js');
const engineeringProjectRoutes = require('./routes/engineeringProjectRoutes.js');
const energyRoutes = require('./routes/energyRoutes.js');
const ecommerceRoutes = require('./routes/ecommerceRoutes.js');
const ecommerceMarketingRoutes = require('./routes/ecommerceMarketingRoutes.js');
const ecommerceIntegrationRoutes = require('./routes/ecommerceIntegrationRoutes.js');
const ecommerceERPRoutes = require('./routes/ecommerceERPRoutes.js');
const ecommerceBusinessSalesRoutes = require('./routes/ecommerceBusinessSalesRoutes.js');
const ecommerceAIRoutes = require('./routes/ecommerceAIRoutes.js');
const dprGenerationRoutes = require('./routes/dprGenerationRoutes.js');
const digitalTwinRoutes = require('./routes/digitalTwinRoutes.js');
const dietTherapyRoutes = require('./routes/dietTherapyRoutes.js');
const demandRoutes = require('./routes/demandRoutes.js');
const defenseFitnessPrepRoutes = require('./routes/defenseFitnessPrepRoutes.js');
const decisionSupportRoutes = require('./routes/decisionSupportRoutes.js');
const dataVisualization = require('./routes/dataVisualization.js');
const dashboardRoutes = require('./routes/dashboardRoutes.js');
const dairyRoutes = require('./routes/dairyRoutes.js');
const cropValueResearchRoutes = require('./routes/cropValueResearchRoutes.js');
const cropRecommendations = require('./routes/cropRecommendations.js');
const cropPlanningRoutes = require('./routes/cropPlanningRoutes.js');
const cropManagementRoutes = require('./routes/cropManagementRoutes.js');
const cropDomainRoutes = require('./routes/cropDomainRoutes.js');
const seedVaultRoutesMerged = require('./routes/seedVaultRoutes.js');
const financialAIRoutes = require('./routes/claude/financialAIRoutes.js');
const livestockDomainRoutes = require('./routes/livestockDomainRoutes.js');
const soilDomainRoutes = require('./routes/soilDomainRoutes.js');
const dairyDomainRoutes = require('./routes/dairyDomainRoutes.js');
const fertilizerDomainRoutes = require('./routes/fertilizerDomainRoutes.js');
const { router: erpServiceRouter } = require('./services/legacy/erpService.js');
const { router: enterpriseControlServiceRouter } = require('./services/legacy/enterpriseControlService.js');
const organizationDomainRoutes = require('./routes/organizationDomainRoutes.js');
const fisheriesDomainRoutes = require('./routes/fisheriesDomainRoutes.js');
const comprehensiveERPDomainRoutes = require('./routes/comprehensiveERPDomainRoutes.js');
const researchAndDevelopmentDomainRoutes = require('./routes/researchAndDevelopmentDomainRoutes.js');
const sapModuleArchitectureDomainRoutes = require('./routes/sapModuleArchitectureDomainRoutes.js');
const animalHealthDomainRoutes = require('./routes/animalHealthDomainRoutes.js');
const completeAIIntegrationDomainRoutes = require('./routes/completeAIIntegrationDomainRoutes.js');
const completeERPIntegrationDomainRoutes = require('./routes/completeERPIntegrationDomainRoutes.js');
const aiOperationIntelligenceDomainRoutes = require('./routes/aiOperationIntelligenceDomainRoutes.js');
const aiSelfHealingDomainRoutes = require('./routes/aiSelfHealingDomainRoutes.js');
const coldStorageDomainRoutes = require('./routes/coldStorageDomainRoutes.js');
const costControlDomainRoutes = require('./routes/costControlDomainRoutes.js');
const sheepDomainRoutes = require('./routes/sheepDomainRoutes.js');
const aiAgentDomainRoutes = require('./routes/aiAgentDomainRoutes.js');
const aiBrainDomainRoutes = require('./routes/aiBrainDomainRoutes.js');
const ecommerceAIDomainRoutes = require('./routes/ecommerceAIDomainRoutes.js');
const agriculturalIntelligenceDomainRoutes = require('./routes/agriculturalIntelligenceDomainRoutes.js');
const ecommerceIntegrationDomainRoutes = require('./routes/ecommerceIntegrationDomainRoutes.js');
const poultryDomainRoutes = require('./routes/poultryDomainRoutes.js');
const assetAccountingDomainRoutes = require('./routes/assetAccountingDomainRoutes.js');
const decisionSupportDomainRoutes = require('./routes/decisionSupportDomainRoutes.js');
const ecommerceMarketplaceDomainRoutes = require('./routes/ecommerceMarketplaceDomainRoutes.js');
const ordersDomainRoutes = require('./routes/ordersDomainRoutes.js');
const weatherDomainRoutes = require('./routes/weatherDomainRoutes.js');
const cooperativeShareDomainRoutes = require('./routes/cooperativeShareDomainRoutes.js');
const walletDomainRoutes = require('./routes/walletDomainRoutes.js');
const equipmentExchangeDomainRoutes = require('./routes/equipmentExchangeDomainRoutes.js');
const multilingualDomainRoutes = require('./routes/multilingualDomainRoutes.js');
const ecommerceBusinessSalesDomainRoutes = require('./routes/ecommerceBusinessSalesDomainRoutes.js');
const bulkOrderDomainRoutes = require('./routes/bulkOrderDomainRoutes.js');
const civilDisruptionDomainRoutes = require('./routes/civilDisruptionDomainRoutes.js');
const engineeringProjectDomainRoutes = require('./routes/engineeringProjectDomainRoutes.js');
const ecommerceERPDomainRoutes = require('./routes/ecommerceERPDomainRoutes.js');
const experienceLayerDomainRoutes = require('./routes/experienceLayerDomainRoutes.js');
const insuranceDomainRoutes = require('./routes/insuranceDomainRoutes.js');
const authorizationDomainRoutes = require('./routes/authorizationDomainRoutes.js');
const climateMonitoringDomainRoutes = require('./routes/climateMonitoringDomainRoutes.js');
const communityManagementDomainRoutes = require('./routes/communityManagementDomainRoutes.js');
const rfqDomainRoutes = require('./routes/rfqDomainRoutes.js');
const farmerHealthDomainRoutes = require('./routes/farmerHealthDomainRoutes.js');
const farmerKycDomainRoutes = require('./routes/farmerKycDomainRoutes.js');
const farmerVerificationDomainRoutes = require('./routes/farmerVerificationDomainRoutes.js');
const horticultureManagementDomainRoutes = require('./routes/horticultureManagementDomainRoutes.js');
const landRecordsDomainRoutes = require('./routes/landRecordsDomainRoutes.js');
const returnLoadBoardDomainRoutes = require('./routes/returnLoadBoardDomainRoutes.js');
const realtimeMonitoringDomainRoutes = require('./routes/realtimeMonitoringDomainRoutes.js');
const conversationalAIDomainRoutes = require('./routes/conversationalAIDomainRoutes.js');
const voiceAIDomainRoutes = require('./routes/voiceAIDomainRoutes.js');
const aiBackboneDomainRoutes = require('./routes/aiBackboneDomainRoutes.js');
const companyDomainRoutes = require('./routes/companyDomainRoutes.js');
const financeDomainRoutes = require('./routes/financeDomainRoutes.js');
const complianceDomainRoutes = require('./routes/complianceDomainRoutes.js');
const defenseFitnessPrepDomainRoutes = require('./routes/defenseFitnessPrepDomainRoutes.js');
const enterpriseIntegrationDomainRoutes = require('./routes/enterpriseIntegrationDomainRoutes.js');
const escrowDomainRoutes = require('./routes/escrowDomainRoutes.js');
const financialAIDomainRoutes = require('./routes/financialAIDomainRoutes.js');
const systemAdministrationDomainRoutes = require('./routes/systemAdministrationDomainRoutes.js');
const logisticsAIDomainRoutes = require('./routes/logisticsAIDomainRoutes.js');
const blockchainVerificationDomainRoutes = require('./routes/blockchainVerificationDomainRoutes.js');
const knowledgeGraphDomainRoutes = require('./routes/knowledgeGraphDomainRoutes.js');
const cropValueResearchDomainRoutes = require('./routes/cropValueResearchDomainRoutes.js');
const tenantManagementDomainRoutes = require('./routes/tenantManagementDomainRoutes.js');
const platformCoreDomainRoutes = require('./routes/platformCoreDomainRoutes.js');
const mfaDomainRoutes = require('./routes/mfaDomainRoutes.js');
const organicTraceabilityDomainRoutes = require('./routes/organicTraceabilityDomainRoutes.js');
const ecommerceMarketingDomainRoutes = require('./routes/ecommerceMarketingDomainRoutes.js');
const sellerRankingDomainRoutes = require('./routes/sellerRankingDomainRoutes.js');
const farmerValueDomainRoutes = require('./routes/farmerValueDomainRoutes.js');
const transactionDomainRoutes = require('./routes/transactionDomainRoutes.js');
const notificationDomainRoutes = require('./routes/notificationDomainRoutes.js');
const privacyDomainRoutes = require('./routes/privacyDomainRoutes.js');
const pestForecastingDomainRoutes = require('./routes/pestForecastingDomainRoutes.js');
const adminAuditDomainRoutes = require('./routes/adminAuditDomainRoutes.js');
const apicultureRoutes = require('./routes/apicultureRoutes.js');
const contractFarmingRoutes = require('./routes/contractFarmingRoutes.js');
const forestryRoutes = require('./routes/forestryRoutes.js');
const vermicompostRoutes = require('./routes/vermicompostRoutes.js');
const sericultureRoutes = require('./routes/sericultureRoutes.js');
const fisheriesRoutes = require('./routes/fisheriesRoutes.js');
const householdProcurementRoutes = require('./routes/householdProcurementRoutes.js');
const moduleRegistryRoutes = require('./routes/moduleRegistryRoutes.js');
const preSeasonPurchaseRoutes = require('./routes/preSeasonPurchaseRoutes.js');
const gdprRoutes = require('./routes/gdprRoutes.js');
const governmentSubsidyRoutes = require('./routes/governmentSubsidyRoutes.js');
const mushroomRoutes = require('./routes/mushroomRoutes.js');
const databaseManagementRoutes = require('./routes/databaseManagementRoutes.js');
// (duplicate require removed — already declared at line 55; the second const
// declaration was a hard parse error that prevented the server from booting)
const governanceModuleMerged = require('./routes/governanceModule.js');
const costRoutesMerged = require('./routes/costRoutes.js');
const costRoutes = require('./routes/costRoutes.js');
const costControlRoutes = require('./routes/costControlRoutes.js');
const cooperativeShareRoutes = require('./routes/cooperativeShareRoutes.js');
const comprehensiveERPRoutes = require('./routes/comprehensiveERPRoutes.js');
const complianceTracking = require('./routes/complianceTracking.js');
const complianceRoutes = require('./routes/complianceRoutes.js');
const completeERPIntegrationRoutes = require('./routes/completeERPIntegrationRoutes.js');
const completeAIIntegrationRoutes = require('./routes/completeAIIntegrationRoutes.js');
const companyRoutes = require('./routes/companyRoutes.js');
const communityManagementRoutes = require('./routes/communityManagementRoutes.js');
const coldStorageRoutes = require('./routes/coldStorageRoutes.js');
const coldChainMonitoring = require('./routes/coldChainMonitoring.js');
const climateRouteSupport = require('./routes/climateRouteSupport.js');
const climateMonitoringRoutes = require('./routes/climateMonitoringRoutes.js');
const climateAdvisoryRoutes = require('./routes/climateAdvisoryRoutes.js');
const climateAdvisory = require('./routes/climateAdvisory.js');
const civilDisruptionRoutes = require('./routes/civilDisruptionRoutes.js');
const certificationManagement = require('./routes/certificationManagement.js');
const buyerTrust = require('./routes/buyerTrust.js');
const bulkOrders = require('./routes/bulkOrders.js');
const bulkOrderRoutes = require('./routes/bulkOrderRoutes.js');
const blockchainVerificationRoutes = require('./routes/blockchainVerificationRoutes.js');
const blockchainTrace = require('./routes/blockchainTrace.js');
const biometric = require('./routes/biometric.js');
const automation = require('./routes/automation.js');
const authRoutes = require('./routes/authRoutes.js');
const auditTrail = require('./routes/auditTrail.js');
const auditRoutes = require('./routes/auditRoutes.js');
const assetAccountingRoutes = require('./routes/assetAccountingRoutes.js');
const ar = require('./routes/ar.js');
const apiCompatibilityRoutes = require('./routes/apiCompatibilityRoutes.js');
const animalHealthRoutes = require('./routes/animalHealthRoutes.js');
const analyticsReportRoutes = require('./routes/analyticsReportRoutes.js');
const aiSelfHealingRoutes = require('./routes/aiSelfHealingRoutes.js');
const aiOperationIntelligenceRoutes = require('./routes/aiOperationIntelligenceRoutes.js');
const aiGatewayRoutes = require('./routes/aiGatewayRoutes.js');
const aiCollaborationRoutes = require('./routes/aiCollaborationRoutes.js');
const aiBrainRoutes = require('./routes/aiBrainRoutes.js');
const aiBackboneRoutes = require('./routes/aiBackboneRoutes.js');
const aiApprovalRoutes = require('./routes/aiApprovalRoutes.js');
const aiAgentRoutes = require('./routes/aiAgentRoutes.js');
const agriculturalIntelligenceRoutes = require('./routes/agriculturalIntelligenceRoutes.js');
const advancedSearchRoutes = require('./routes/advancedSearchRoutes.js');
const advancedFeatures = require('./routes/advancedFeatures.js');
const advancedAnalyticsRoutes = require('./routes/advancedAnalyticsRoutes.js');
const apiWarningRoutes = require('./routes/apiWarningRoutes.js');
const aiModelsRoutes = require('./routes/aiModelsRoutes.js');
const aiTrainingEvaluationRoutes = require('./routes/aiTrainingEvaluationRoutes.js');
const infrastructureMonitoringRoutes = require('./routes/infrastructureMonitoringRoutes.js');
const gdprComplianceRoutes = require('./routes/gdprComplianceRoutes.js');
const productImageAutoGenerationRoutes = require('./routes/productImageAutoGenerationRoutes');
const aiImageGenerationEnhancedRoutes = require('./routes/aiImageGenerationEnhancedRoutes');
const ecommerceImageIntegrationRoutes = require('./routes/ecommerceImageIntegrationRoutes');
const farmerImagePortalRoutes = require('./routes/farmerImagePortalRoutes');
const integrationStatusRoutes = require('./routes/integrationStatusRoutes');
const endpointMismatchFixer = require('./routes/ENDPOINT_MISMATCH_FIXER');
const stripeWebhookRoutes = require('./routes/stripeWebhookRoutes');

/**
 * EBDESIGN Platform Backend - Main Entry Point
 * Auto-Discovery Architecture: Supports 200K+ services & routes
 *
 * Replaces manual imports with dynamic service/route discovery
 * Enables lazy loading, scales to enterprise requirements
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

// Core auto-discovery modules
const DynamicServiceLoader = require('./core/dynamicServiceLoader');
const DynamicRouteLoader = require('./core/dynamicRouteLoader');
const ServiceLocator = require('./core/serviceLocator');
const ConfigRegistry = require('./core/configRegistry');

// Core infrastructure
const { logger } = require('./utils/logger');
const { authMiddleware, requireRole } = require('./middleware/auth');
const { errorHandler } = require('./middleware/errorHandler');
const { securityHeaders, rateLimit } = require('./middleware/securityMiddleware');
const { requestId } = require('./middleware/requestId');
const { responseFormatter } = require('./middleware/responseFormatter');
const { routeMonitoring } = require('./middleware/routeMonitoring');
const { 
  standardizeResponse, 
  standardizeErrorResponse, 
  addStandardHeaders, 
  trackResponseTime,
  correlationId,
  contentNegotiation
} = require('./middleware/apiResponseStandardizer');
const mfaMiddleware = require('./middleware/dual-use/mfaMiddleware');
const { autoGenerateOnPageViewMiddleware, triggerAutoGenAfterCreateMiddleware } = require('./middleware/productImageAutoGenerationHooks');
const loggingService = require('./services/loggingService');
const productImageAutoGenerationService = require('./services/productImageAutoGenerationService');
const libraryKnowledgeService = require('./services/libraryKnowledgeService');
const websocketService = require('./services/websocketService');
const aiCopilotFramework = require('./services/legacy/aiCopilotService.js');
const { initializeAI } = require('./core/ai');
const disruptionRoutingAgent = require('./core/disruptionRoutingAgent');

// ============================================================================
// INITIALIZATION
// ============================================================================

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.FRONTEND_URL || '*' },
});

// Store on app for access in route handlers
app.io = io;

// ============================================================================
// MIDDLEWARE SETUP
// ============================================================================

// Security middleware
app.use(helmet());
app.use(cors({
  origin: (process.env.CORS_ORIGIN || process.env.FRONTEND_URL || 'http://localhost:3000')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean),
  credentials: true,
}));

// Parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(compression());

// Logging middleware
app.use(morgan('combined'));
app.use(correlationId());
app.use(contentNegotiation());
app.use(addStandardHeaders());
app.use(trackResponseTime());
app.use(requestId);
app.use(responseFormatter);
app.use(routeMonitoring);

// Security enhancements
app.use(securityHeaders);
// rateLimit is a factory: (maxRequests, windowMs) => middleware. Both params
// have defaults, so its .length is 0 and Express mistakes the factory itself
// for middleware — it gets the inner handler as a return value, never a next()
// call, and every request hangs. Registering it uncalled also meant no rate
// limiting was ever applied.
app.use(rateLimit());

// Auto Image Generation Middleware
if (process.env.AUTO_IMAGE_GENERATION === 'true') {
  app.use(autoGenerateOnPageViewMiddleware);
  app.use(triggerAutoGenAfterCreateMiddleware);
  logger.info('🎨 Auto-generation middleware enabled');
}

// ============================================================================
// STARTUP SEQUENCE
// ============================================================================

async function startup() {
  try {
    const startTime = Date.now();

    logger.info('🚀 EBDESIGN Platform Starting...');

    // Step 1: Initialize database connection (required for ConfigRegistry)
    logger.info('📦 Connecting to database...');
    let db = null;
    try {
      const { initialize, getPostgreSQL } = require('./database/connection');
      await initialize();
      db = getPostgreSQL();
      if (!db) throw new Error('PostgreSQL is not connected');
      logger.info('✅ Database connected');
    } catch (error) {
      logger.warn('⚠️  Database connection deferred (will retry on first use)');
    }

    // Step 2: Initialize service loader
    logger.info('🔍 Initializing service auto-discovery...');
    const serviceLoader = new DynamicServiceLoader(db);
    const servicesDir = path.join(__dirname, 'services');

    const discoveryStats = await serviceLoader.discoverServicesFromDirectory(servicesDir);
    logger.info('✅ Service discovery complete', discoveryStats);

    // Step 3: Create service locator
    const serviceLocator = new ServiceLocator(serviceLoader);
    app.locals.serviceLocator = serviceLocator;

    // Step 4: Initialize configuration registry
    logger.info('⚙️  Initializing configuration registry...');
    const configRegistry = new ConfigRegistry(db);
    try {
      await configRegistry.initialize();
      await configRegistry.loadAllConfigs();
      await configRegistry.loadAllFeatureFlags();
      configRegistry.startAutoSync();
      app.locals.configRegistry = configRegistry;
      logger.info('✅ Configuration registry initialized');
    } catch (error) {
      logger.warn('⚠️  Config registry initialization deferred (in-memory only)');
      app.locals.configRegistry = configRegistry;
    }

    // Index the project library before AI requests are accepted. The service
    // remains usable in memory when PostgreSQL is unavailable and reports sync
    // failures without blocking backend startup.
    try {
      await libraryKnowledgeService.initialize({ syncDatabase: Boolean(db) });
      app.locals.libraryKnowledgeService = libraryKnowledgeService;
      logger.info('✅ Library knowledge service initialized', libraryKnowledgeService.getStatistics());
    } catch (error) {
      logger.warn('⚠️  Library knowledge initialization deferred', { error: error.message });
      app.locals.libraryKnowledgeService = libraryKnowledgeService;
    }

    // Step 5: Load critical services (fast boot)
    logger.info('⚡ Loading critical services...');
    const criticalServices = [
      'authService',
      'userService',
      'errorHandlerService',
      'monitoringService',
      'cacheService',
    ];

    try {
      await serviceLocator.preload(criticalServices);
      logger.info('✅ Critical services loaded');
    } catch (error) {
      logger.warn('⚠️  Some critical services failed to load (continuing with partial startup)');
    }

    const cacheService = require('./services/cacheService');
    const jobService = require('./services/jobService');
    const infrastructure = { cache: 'disabled', jobs: 'disabled' };
    try {
      await cacheService.init();
      infrastructure.cache = 'connected';
    } catch (error) {
      logger.warn('⚠️  Redis cache unavailable; continuing in degraded mode');
    }
    try {
      await jobService.init();
      infrastructure.jobs = 'connected';
    } catch (error) {
      logger.warn('⚠️  Background jobs unavailable; continuing in degraded mode');
    }
    app.locals.infrastructure = infrastructure;

    // Step 6: Initialize route loader
    logger.info('🛣️  Initializing route auto-discovery...');
    const routeLoader = new DynamicRouteLoader(app);
    const routesDir = path.join(__dirname, 'routes');

    const routeStats = await routeLoader.discoverAndMountRoutes(
      routesDir,
      '/api/v1',
    );
    await routeLoader.discoverServiceEmbeddedRoutes(servicesDir, '/api/v1');
    const serviceRouteStats = await serviceLoader.mountServiceRoutes(app);
    logger.info('✅ Routes mounted', { ...routeStats, serviceSetupRoutes: serviceRouteStats.mounted });

    // Step 7: Make loaders available to middleware/handlers
    app.locals.serviceLoader = serviceLoader;
    app.locals.routeLoader = routeLoader;
    app.locals.db = db;
    app.locals.mfaMiddleware = mfaMiddleware;
    app.locals.loggingService = loggingService;

    try {
      websocketService.attach(io);
      app.locals.websocketService = websocketService;
      logger.info('✅ WebSocket service attached');
    } catch (error) {
      logger.warn('⚠️  WebSocket service attach skipped', { error: error.message });
    }

    try {
      await initializeAI();
      logger.info('✅ AI intelligence fabric initialized');
    } catch (error) {
      logger.warn('⚠️  AI fabric initialization deferred', { error: error.message });
    }

    try {
      if (typeof disruptionRoutingAgent.initialize === 'function') {
        disruptionRoutingAgent.initialize();
      }
      app.locals.disruptionRoutingAgent = disruptionRoutingAgent;
      logger.info('✅ Disruption routing agent initialized');
    } catch (error) {
      logger.warn('⚠️  Disruption routing agent deferred', { error: error.message });
    }

    // Step 8: Health check endpoint
    app.get('/health', async (req, res) => {
      try {
        res.json({
          status: db && infrastructure.cache === 'connected' && infrastructure.jobs === 'connected' ?
            'operational' :
            'degraded',
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        logger.error('Health check failed', error);
        res.status(503).json({ status: 'unhealthy', error: error.message });
      }
    });

    // Step 9: Status/stats endpoint
    app.get('/api/v1/system/stats', authMiddleware, requireRole('admin', 'superadmin'), async (req, res) => {
      try {
        res.json({
          services: serviceLoader.getStats(),
          routes: routeLoader.getStats(),
          config: configRegistry.getStats(),
          locator: serviceLocator.getStats(),
          memory: process.memoryUsage(),
          uptime: process.uptime(),
        });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Step 10: Service discovery API (for debugging)
    app.get('/api/v1/system/services', authMiddleware, requireRole('admin', 'superadmin'), async (req, res) => {
      try {
        const { limit = 50, offset = 0, category, subfolder } = req.query;
        const result = serviceLoader.listServices({
          limit: parseInt(limit),
          offset: parseInt(offset),
          category,
          subfolder,
        });
        res.json(result);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Step 11: Route discovery API (for debugging)
    app.get('/api/v1/system/routes', authMiddleware, requireRole('admin', 'superadmin'), async (req, res) => {
      try {
        const result = routeLoader.getMountedRoutes();
        res.json({
          total: result.length,
          routes: result.slice(0, 100),
        });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // WebSocket handlers are registered by websocketService.attach(io)

    // Mount health check routes
    logger.info('🏥 Mounting health check routes...');
    const healthRoutes = require('./routes/healthRoutes');
    app.use('/api/v1/backend-modules/M041', M041VillageERPRoutes);
    app.use('/api/v1/backend-modules/M002', finalBatchModuleM002Routes);
    app.use('/api/v1/backend-modules/M003', finalBatchModuleM003Routes);
    app.use('/api/v1/backend-modules/M004', finalBatchModuleM004Routes);
    app.use('/api/v1/backend-modules/M005', finalBatchModuleM005Routes);
    app.use('/api/v1/backend-modules/M006', finalBatchModuleM006Routes);
    app.use('/api/v1/backend-modules/M007', finalBatchModuleM007Routes);
    app.use('/api/v1/backend-modules/M008', finalBatchModuleM008Routes);
    app.use('/api/v1/backend-modules/M009', finalBatchModuleM009Routes);
    app.use('/api/v1/backend-modules/M010', finalBatchModuleM010Routes);
    app.use('/api/v1/backend-modules/M011', finalBatchModuleM011Routes);
    app.use('/api/v1/backend-modules/M012', finalBatchModuleM012Routes);
    app.use('/api/v1/backend-modules/M013', finalBatchModuleM013Routes);
    app.use('/api/v1/backend-modules/M014', finalBatchModuleM014Routes);
    app.use('/api/v1/backend-modules/M015', finalBatchModuleM015Routes);
    app.use('/api/v1/backend-modules/M017', finalBatchModuleM017Routes);
    app.use('/api/v1/backend-modules/M018', finalBatchModuleM018Routes);
    app.use('/api/v1/backend-modules/M019', finalBatchModuleM019Routes);
    app.use('/api/v1/backend-modules/M020', finalBatchModuleM020Routes);
    app.use('/api/v1/backend-modules/M021', finalBatchModuleM021Routes);
    app.use('/api/v1/backend-modules/M022', finalBatchModuleM022Routes);
    app.use('/api/v1/backend-modules/M023', finalBatchModuleM023Routes);
    app.use('/api/v1/backend-modules/M024', finalBatchModuleM024Routes);
    app.use('/api/v1/backend-modules/M025', finalBatchModuleM025Routes);
    app.use('/api/v1/backend-modules/M026', finalBatchModuleM026Routes);
    app.use('/api/v1/backend-modules/M027', finalBatchModuleM027Routes);
    app.use('/api/v1/backend-modules/M028', finalBatchModuleM028Routes);
    app.use('/api/v1/backend-modules/M029', finalBatchModuleM029Routes);
    app.use('/api/v1/backend-modules/M030', finalBatchModuleM030Routes);
    app.use('/api/v1/backend-modules/M101', finalBatchModuleM101Routes);
    app.use('/api/v1/backend-modules/M102', finalBatchModuleM102Routes);
    app.use('/api/v1/backend-modules/M151', finalBatchModuleM151Routes);
    app.use('/api/v1/backend-modules/M201', finalBatchModuleM201Routes);
    app.use('/api/v1/backend-modules/M301', finalBatchModuleM301Routes);
    app.use('/api/v1/backend-modules/M63', finalBatchModuleM63Routes);
    app.use('/api/v1/backend-modules/M64', finalBatchModuleM64Routes);
    app.use('/api/v1/backend-modules/M65', finalBatchModuleM65Routes);
    app.use('/api/v1/backend-modules/M001', legacyModuleM001Routes);
    app.use('/api/v1/backend-modules/M016', legacyModuleM016Routes);
    app.use('/api/v1/backend-modules/M031', legacyModuleM031Routes);
    app.use('/api/v1/backend-modules/M032', legacyModuleM032Routes);
    app.use('/api/v1/backend-modules/M033', legacyModuleM033Routes);
    app.use('/api/v1/backend-modules/M034', legacyModuleM034Routes);
    app.use('/api/v1/backend-modules/M035', legacyModuleM035Routes);
    app.use('/api/v1/backend-modules/M036', legacyModuleM036Routes);
    app.use('/api/v1/backend-modules/M037', legacyModuleM037Routes);
    app.use('/api/v1/backend-modules/M038', legacyModuleM038Routes);
    app.use('/api/v1/backend-modules/M039', legacyModuleM039Routes);
    app.use('/api/v1/backend-modules/M040', legacyModuleM040Routes);
    app.use('/api/v1/backend-modules/M042', legacyModuleM042Routes);
    app.use('/api/v1/backend-modules/M043', legacyModuleM043Routes);
    app.use('/api/v1/backend-modules/M044', legacyModuleM044Routes);
    app.use('/api/v1/backend-modules/M045', legacyModuleM045Routes);
    app.use('/api/v1/backend-modules/M046', legacyModuleM046Routes);
    app.use('/api/v1/backend-modules/M047', legacyModuleM047Routes);
    app.use('/api/v1/backend-modules/M048', legacyModuleM048Routes);
    app.use('/api/v1/backend-modules/M049', legacyModuleM049Routes);
    app.use('/api/v1/backend-modules/M050', legacyModuleM050Routes);
    app.use('/api/v1/backend-modules/M051', legacyModuleM051Routes);
    app.use('/api/v1/backend-modules/M052', legacyModuleM052Routes);
    app.use('/api/v1/backend-modules/M053', legacyModuleM053Routes);
    app.use('/api/v1/backend-modules/M054', legacyModuleM054Routes);
    app.use('/api/v1/backend-modules/M055', legacyModuleM055Routes);
    app.use('/api/v1/backend-modules/M056', legacyModuleM056Routes);
    app.use('/api/v1/backend-modules/M057', legacyModuleM057Routes);
    app.use('/api/v1/backend-modules/M058', legacyModuleM058Routes);
    app.use('/api/v1/backend-modules/M059', legacyModuleM059Routes);
    app.use('/api/v1/backend-modules/M060', legacyModuleM060Routes);
    app.use('/api/v1/backend-modules/M061', legacyModuleM061Routes);
    app.use('/api/v1/backend-modules/M062', legacyModuleM062Routes);
    app.use('/api/v1/backend-modules/M063', legacyModuleM063Routes);
    app.use('/api/v1/backend-modules/M064', legacyModuleM064Routes);
    app.use('/api/v1/backend-modules/M065', legacyModuleM065Routes);
    app.use('/api/v1/backend-modules/M066', legacyModuleM066Routes);
    app.use('/api/v1/backend-modules/M067', legacyModuleM067Routes);
    app.use('/api/v1/backend-modules/M068', legacyModuleM068Routes);
    app.use('/api/v1/backend-modules/M069', legacyModuleM069Routes);
    app.use('/api/v1/backend-modules/M070', legacyModuleM070Routes);
    app.use('/api/v1/backend-modules/M071', legacyModuleM071Routes);
    app.use('/api/v1/backend-modules/M072', legacyModuleM072Routes);
    app.use('/api/v1/backend-modules/M073', legacyModuleM073Routes);
    app.use('/api/v1/backend-modules/M074', legacyModuleM074Routes);
    app.use('/api/v1/backend-modules/M075', legacyModuleM075Routes);
    app.use('/api/v1/backend-modules/M076', legacyModuleM076Routes);
    app.use('/api/v1/backend-modules/M077', legacyModuleM077Routes);
    app.use('/api/v1/backend-modules/M078', legacyModuleM078Routes);
    app.use('/api/v1/backend-modules/M079', legacyModuleM079Routes);
    app.use('/api/v1/backend-modules/M080', legacyModuleM080Routes);
    app.use('/api/v1/backend-modules/M081', legacyModuleM081Routes);
    app.use('/api/v1/backend-modules/M082', legacyModuleM082Routes);
    app.use('/api/v1/backend-modules/M083', legacyModuleM083Routes);
    app.use('/api/v1/backend-modules/M084', legacyModuleM084Routes);
    app.use('/api/v1/backend-modules/M085', legacyModuleM085Routes);
    app.use('/api/v1/backend-modules/M086', legacyModuleM086Routes);
    app.use('/api/v1/backend-modules/M087', legacyModuleM087Routes);
    app.use('/api/v1/backend-modules/M088', legacyModuleM088Routes);
    app.use('/api/v1/backend-modules/M089', legacyModuleM089Routes);
    app.use('/api/v1/backend-modules/M090', legacyModuleM090Routes);
    app.use('/api/v1/backend-modules/M091', legacyModuleM091Routes);
    app.use('/api/v1/backend-modules/M092', legacyModuleM092Routes);
    app.use('/api/v1/backend-modules/M093', legacyModuleM093Routes);
    app.use('/api/v1/backend-modules/M094', legacyModuleM094Routes);
    app.use('/api/v1/backend-modules/M095', legacyModuleM095Routes);
    app.use('/api/v1/backend-modules/M096', legacyModuleM096Routes);
    app.use('/api/v1/backend-modules/M097', legacyModuleM097Routes);
    app.use('/api/v1/backend-modules/M098', legacyModuleM098Routes);
    app.use('/api/v1/backend-modules/M099', legacyModuleM099Routes);
    app.use('/api/v1/backend-modules/M100', legacyModuleM100Routes);
    app.use('/api/v1/backend-modules/M103', legacyModuleM103Routes);
    app.use('/api/v1/backend-modules/M104', legacyModuleM104Routes);
    app.use('/api/v1/backend-modules/M105', legacyModuleM105Routes);
    app.use('/api/v1/backend-modules/M106', legacyModuleM106Routes);
    app.use('/api/v1/backend-modules/M107', legacyModuleM107Routes);
    app.use('/api/v1/backend-modules/M108', legacyModuleM108Routes);
    app.use('/api/v1/backend-modules/M109', legacyModuleM109Routes);
    app.use('/api/v1/backend-modules/M110', legacyModuleM110Routes);
    app.use('/api/v1/backend-modules/M111', legacyModuleM111Routes);
    app.use('/api/v1/backend-modules/M112', legacyModuleM112Routes);
    app.use('/api/v1/backend-modules/M113', legacyModuleM113Routes);
    app.use('/api/v1/backend-modules/M114', legacyModuleM114Routes);
    app.use('/api/v1/backend-modules/M115', legacyModuleM115Routes);
    app.use('/api/v1/backend-modules/M116', legacyModuleM116Routes);
    app.use('/api/v1/backend-modules/M117', legacyModuleM117Routes);
    app.use('/api/v1/backend-modules/M118', legacyModuleM118Routes);
    app.use('/api/v1/backend-modules/M119', legacyModuleM119Routes);
    app.use('/api/v1/backend-modules/M120', legacyModuleM120Routes);
    app.use('/api/v1/backend-modules/M121', legacyModuleM121Routes);
    app.use('/api/v1/backend-modules/M122', legacyModuleM122Routes);
    app.use('/api/v1/backend-modules/M123', legacyModuleM123Routes);
    app.use('/api/v1/backend-modules/M124', legacyModuleM124Routes);
    app.use('/api/v1/backend-modules/M125', legacyModuleM125Routes);
    app.use('/api/v1/backend-modules/M126', legacyModuleM126Routes);
    app.use('/api/v1/backend-modules/M127', legacyModuleM127Routes);
    app.use('/api/v1/backend-modules/M128', legacyModuleM128Routes);
    app.use('/api/v1/backend-modules/M129', legacyModuleM129Routes);
    app.use('/api/v1/backend-modules/M130', legacyModuleM130Routes);
    app.use('/api/v1/backend-modules/M131', legacyModuleM131Routes);
    app.use('/api/v1/backend-modules/M132', legacyModuleM132Routes);
    app.use('/api/v1/backend-modules/M133', legacyModuleM133Routes);
    app.use('/api/v1/backend-modules/M134', legacyModuleM134Routes);
    app.use('/api/v1/backend-modules/M135', legacyModuleM135Routes);
    app.use('/api/v1/backend-modules/M136', legacyModuleM136Routes);
    app.use('/api/v1/backend-modules/M137', legacyModuleM137Routes);
    app.use('/api/v1/backend-modules/M138', legacyModuleM138Routes);
    app.use('/api/v1/backend-modules/M139', legacyModuleM139Routes);
    app.use('/api/v1/backend-modules/M140', legacyModuleM140Routes);
    app.use('/api/v1/backend-modules/M141', legacyModuleM141Routes);
    app.use('/api/v1/backend-modules/M142', legacyModuleM142Routes);
    app.use('/api/v1/backend-modules/M143', legacyModuleM143Routes);
    app.use('/api/v1/backend-modules/M144', legacyModuleM144Routes);
    app.use('/api/v1/backend-modules/M145', legacyModuleM145Routes);
    app.use('/api/v1/backend-modules/M146', legacyModuleM146Routes);
    app.use('/api/v1/backend-modules/M147', legacyModuleM147Routes);
    app.use('/api/v1/backend-modules/M148', legacyModuleM148Routes);
    app.use('/api/v1/backend-modules/M149', legacyModuleM149Routes);
    app.use('/api/v1/backend-modules/M150', legacyModuleM150Routes);
    app.use('/api/v1/backend-modules/M152', legacyModuleM152Routes);
    app.use('/api/v1/backend-modules/M153', legacyModuleM153Routes);
    app.use('/api/v1/backend-modules/M154', legacyModuleM154Routes);
    app.use('/api/v1/backend-modules/M155', legacyModuleM155Routes);
    app.use('/api/v1/backend-modules/M156', legacyModuleM156Routes);
    app.use('/api/v1/backend-modules/M157', legacyModuleM157Routes);
    app.use('/api/v1/backend-modules/M158', legacyModuleM158Routes);
    app.use('/api/v1/backend-modules/M159', legacyModuleM159Routes);
    app.use('/api/v1/backend-modules/M160', legacyModuleM160Routes);
    app.use('/api/v1/backend-modules/M161', legacyModuleM161Routes);
    app.use('/api/v1/backend-modules/M162', legacyModuleM162Routes);
    app.use('/api/v1/backend-modules/M163', legacyModuleM163Routes);
    app.use('/api/v1/backend-modules/M164', legacyModuleM164Routes);
    app.use('/api/v1/backend-modules/M165', legacyModuleM165Routes);
    app.use('/api/v1/backend-modules/M166', legacyModuleM166Routes);
    app.use('/api/v1/backend-modules/M167', legacyModuleM167Routes);
    app.use('/api/v1/backend-modules/M168', legacyModuleM168Routes);
    app.use('/api/v1/backend-modules/M169', legacyModuleM169Routes);
    app.use('/api/v1/backend-modules/M170', legacyModuleM170Routes);
    app.use('/api/v1/backend-modules/M171', legacyModuleM171Routes);
    app.use('/api/v1/backend-modules/M172', legacyModuleM172Routes);
    app.use('/api/v1/backend-modules/M173', legacyModuleM173Routes);
    app.use('/api/v1/backend-modules/M174', legacyModuleM174Routes);
    app.use('/api/v1/backend-modules/M175', legacyModuleM175Routes);
    app.use('/api/v1/backend-modules/M176', legacyModuleM176Routes);
    app.use('/api/v1/backend-modules/M177', legacyModuleM177Routes);
    app.use('/api/v1/backend-modules/M178', legacyModuleM178Routes);
    app.use('/api/v1/backend-modules/M179', legacyModuleM179Routes);
    app.use('/api/v1/backend-modules/M180', legacyModuleM180Routes);
    app.use('/api/v1/backend-modules/M181', legacyModuleM181Routes);
    app.use('/api/v1/backend-modules/M182', legacyModuleM182Routes);
    app.use('/api/v1/backend-modules/M183', legacyModuleM183Routes);
    app.use('/api/v1/backend-modules/M184', legacyModuleM184Routes);
    app.use('/api/v1/backend-modules/M185', legacyModuleM185Routes);
    app.use('/api/v1/backend-modules/M186', legacyModuleM186Routes);
    app.use('/api/v1/backend-modules/M187', legacyModuleM187Routes);
    app.use('/api/v1/backend-modules/M188', legacyModuleM188Routes);
    app.use('/api/v1/backend-modules/M189', legacyModuleM189Routes);
    app.use('/api/v1/backend-modules/M190', legacyModuleM190Routes);
    app.use('/api/v1/backend-modules/M191', legacyModuleM191Routes);
    app.use('/api/v1/backend-modules/M192', legacyModuleM192Routes);
    app.use('/api/v1/backend-modules/M193', legacyModuleM193Routes);
    app.use('/api/v1/backend-modules/M194', legacyModuleM194Routes);
    app.use('/api/v1/backend-modules/M195', legacyModuleM195Routes);
    app.use('/api/v1/backend-modules/M196', legacyModuleM196Routes);
    app.use('/api/v1/backend-modules/M197', legacyModuleM197Routes);
    app.use('/api/v1/backend-modules/M198', legacyModuleM198Routes);
    app.use('/api/v1/backend-modules/M199', legacyModuleM199Routes);
    app.use('/api/v1/backend-modules/M200', legacyModuleM200Routes);
    app.use('/api/v1/backend-modules/M202', legacyModuleM202Routes);
    app.use('/api/v1/backend-modules/M203', legacyModuleM203Routes);
    app.use('/api/v1/backend-modules/M204', legacyModuleM204Routes);
    app.use('/api/v1/backend-modules/M205', legacyModuleM205Routes);
    app.use('/api/v1/backend-modules/M206', legacyModuleM206Routes);
    app.use('/api/v1/backend-modules/M207', legacyModuleM207Routes);
    app.use('/api/v1/backend-modules/M208', legacyModuleM208Routes);
    app.use('/api/v1/backend-modules/M209', legacyModuleM209Routes);
    app.use('/api/v1/backend-modules/M210', legacyModuleM210Routes);
    app.use('/api/v1/backend-modules/M211', legacyModuleM211Routes);
    app.use('/api/v1/backend-modules/M212', legacyModuleM212Routes);
    app.use('/api/v1/backend-modules/M213', legacyModuleM213Routes);
    app.use('/api/v1/backend-modules/M214', legacyModuleM214Routes);
    app.use('/api/v1/backend-modules/M215', legacyModuleM215Routes);
    app.use('/api/v1/backend-modules/M216', legacyModuleM216Routes);
    app.use('/api/v1/backend-modules/M217', legacyModuleM217Routes);
    app.use('/api/v1/backend-modules/M218', legacyModuleM218Routes);
    app.use('/api/v1/backend-modules/M219', legacyModuleM219Routes);
    app.use('/api/v1/backend-modules/M220', legacyModuleM220Routes);
    app.use('/api/v1/backend-modules/M221', legacyModuleM221Routes);
    app.use('/api/v1/backend-modules/M222', legacyModuleM222Routes);
    app.use('/api/v1/backend-modules/M223', legacyModuleM223Routes);
    app.use('/api/v1/backend-modules/M224', legacyModuleM224Routes);
    app.use('/api/v1/backend-modules/M225', legacyModuleM225Routes);
    app.use('/api/v1/backend-modules/M226', legacyModuleM226Routes);
    app.use('/api/v1/backend-modules/M227', legacyModuleM227Routes);
    app.use('/api/v1/backend-modules/M228', legacyModuleM228Routes);
    app.use('/api/v1/backend-modules/M229', legacyModuleM229Routes);
    app.use('/api/v1/backend-modules/M230', legacyModuleM230Routes);
    app.use('/api/v1/backend-modules/M231', legacyModuleM231Routes);
    app.use('/api/v1/backend-modules/M232', legacyModuleM232Routes);
    app.use('/api/v1/backend-modules/M233', legacyModuleM233Routes);
    app.use('/api/v1/backend-modules/M234', legacyModuleM234Routes);
    app.use('/api/v1/backend-modules/M235', legacyModuleM235Routes);
    app.use('/api/v1/backend-modules/M236', legacyModuleM236Routes);
    app.use('/api/v1/backend-modules/M237', legacyModuleM237Routes);
    app.use('/api/v1/backend-modules/M238', legacyModuleM238Routes);
    app.use('/api/v1/backend-modules/M239', legacyModuleM239Routes);
    app.use('/api/v1/backend-modules/M240', legacyModuleM240Routes);
    app.use('/api/v1/backend-modules/M241', legacyModuleM241Routes);
    app.use('/api/v1/backend-modules/M242', legacyModuleM242Routes);
    app.use('/api/v1/backend-modules/M243', legacyModuleM243Routes);
    app.use('/api/v1/backend-modules/M244', legacyModuleM244Routes);
    app.use('/api/v1/backend-modules/M245', legacyModuleM245Routes);
    app.use('/api/v1/backend-modules/M246', legacyModuleM246Routes);
    app.use('/api/v1/backend-modules/M247', legacyModuleM247Routes);
    app.use('/api/v1/backend-modules/M248', legacyModuleM248Routes);
    app.use('/api/v1/backend-modules/M249', legacyModuleM249Routes);
    app.use('/api/v1/backend-modules/M250', legacyModuleM250Routes);
    app.use('/api/v1/backend-modules/M251', legacyModuleM251Routes);
    app.use('/api/v1/backend-modules/M252', legacyModuleM252Routes);
    app.use('/api/v1/backend-modules/M253', legacyModuleM253Routes);
    app.use('/api/v1/backend-modules/M254', legacyModuleM254Routes);
    app.use('/api/v1/backend-modules/M255', legacyModuleM255Routes);
    app.use('/api/v1/backend-modules/M256', legacyModuleM256Routes);
    app.use('/api/v1/backend-modules/M257', legacyModuleM257Routes);
    app.use('/api/v1/backend-modules/M258', legacyModuleM258Routes);
    app.use('/api/v1/backend-modules/M259', legacyModuleM259Routes);
    app.use('/api/v1/backend-modules/M260', legacyModuleM260Routes);
    app.use('/api/v1/backend-modules/M261', legacyModuleM261Routes);
    app.use('/api/v1/backend-modules/M262', legacyModuleM262Routes);
    app.use('/api/v1/backend-modules/M263', legacyModuleM263Routes);
    app.use('/api/v1/backend-modules/M264', legacyModuleM264Routes);
    app.use('/api/v1/backend-modules/M265', legacyModuleM265Routes);
    app.use('/api/v1/backend-modules/M266', legacyModuleM266Routes);
    app.use('/api/v1/backend-modules/M267', legacyModuleM267Routes);
    app.use('/api/v1/backend-modules/M268', legacyModuleM268Routes);
    app.use('/api/v1/backend-modules/M269', legacyModuleM269Routes);
    app.use('/api/v1/backend-modules/M270', legacyModuleM270Routes);
    app.use('/api/v1/backend-modules/M271', legacyModuleM271Routes);
    app.use('/api/v1/backend-modules/M272', legacyModuleM272Routes);
    app.use('/api/v1/backend-modules/M273', legacyModuleM273Routes);
    app.use('/api/v1/backend-modules/M274', legacyModuleM274Routes);
    app.use('/api/v1/backend-modules/M275', legacyModuleM275Routes);
    app.use('/api/v1/backend-modules/M276', legacyModuleM276Routes);
    app.use('/api/v1/backend-modules/M277', legacyModuleM277Routes);
    app.use('/api/v1/backend-modules/M278', legacyModuleM278Routes);
    app.use('/api/v1/backend-modules/M279', legacyModuleM279Routes);
    app.use('/api/v1/backend-modules/M280', legacyModuleM280Routes);
    app.use('/api/v1/backend-modules/M281', legacyModuleM281Routes);
    app.use('/api/v1/backend-modules/M282', legacyModuleM282Routes);
    app.use('/api/v1/backend-modules/M283', legacyModuleM283Routes);
    app.use('/api/v1/backend-modules/M284', legacyModuleM284Routes);
    app.use('/api/v1/backend-modules/M285', legacyModuleM285Routes);
    app.use('/api/v1/backend-modules/M286', legacyModuleM286Routes);
    app.use('/api/v1/backend-modules/M287', legacyModuleM287Routes);
    app.use('/api/v1/backend-modules/M288', legacyModuleM288Routes);
    app.use('/api/v1/backend-modules/M289', legacyModuleM289Routes);
    app.use('/api/v1/backend-modules/M290', legacyModuleM290Routes);
    app.use('/api/v1/backend-modules/M291', legacyModuleM291Routes);
    app.use('/api/v1/backend-modules/M292', legacyModuleM292Routes);
    app.use('/api/v1/backend-modules/M293', legacyModuleM293Routes);
    app.use('/api/v1/backend-modules/M294', legacyModuleM294Routes);
    app.use('/api/v1/backend-modules/M295', legacyModuleM295Routes);
    app.use('/api/v1/backend-modules/M296', legacyModuleM296Routes);
    app.use('/api/v1/backend-modules/M297', legacyModuleM297Routes);
    app.use('/api/v1/backend-modules/M298', legacyModuleM298Routes);
    app.use('/api/v1/backend-modules/M299', legacyModuleM299Routes);
    app.use('/api/v1/backend-modules/M300', legacyModuleM300Routes);
    app.use('/api/v1/backend-modules/M302', legacyModuleM302Routes);
    app.use('/api/v1/backend-modules/M303', legacyModuleM303Routes);
    app.use('/api/v1/backend-modules/M304', legacyModuleM304Routes);
    app.use('/api/v1/backend-modules/M305', legacyModuleM305Routes);
    app.use('/api/v1/backend-modules/M306', legacyModuleM306Routes);
    app.use('/api/v1/backend-modules/M307', legacyModuleM307Routes);
    app.use('/api/v1/backend-modules/M308', legacyModuleM308Routes);
    app.use('/api/v1/backend-modules/M309', legacyModuleM309Routes);
    app.use('/api/v1/backend-modules/M310', legacyModuleM310Routes);
    app.use('/api/v1/backend-modules/M311', legacyModuleM311Routes);
    app.use('/api/v1/backend-modules/M312', legacyModuleM312Routes);
    app.use('/api/v1/backend-modules/M313', legacyModuleM313Routes);
    app.use('/api/v1/backend-modules/M314', legacyModuleM314Routes);
    app.use('/api/v1/backend-modules/M315', legacyModuleM315Routes);
    app.use('/api/v1/backend-modules/M316', legacyModuleM316Routes);
    app.use('/api/v1/backend-modules/M317', legacyModuleM317Routes);
    app.use('/api/v1/backend-modules/M318', legacyModuleM318Routes);
    app.use('/api/v1/backend-modules/M319', legacyModuleM319Routes);
    app.use('/api/v1/backend-modules/M320', legacyModuleM320Routes);
    app.use('/api/v1/backend-modules/M321', legacyModuleM321Routes);
    app.use('/api/v1/backend-modules/M322', legacyModuleM322Routes);
    app.use('/api/v1/backend-modules/M323', legacyModuleM323Routes);
    app.use('/api/v1/backend-modules/M324', legacyModuleM324Routes);
    app.use('/api/v1/backend-modules/M325', legacyModuleM325Routes);
    app.use('/api/v1/backend-modules/M326', legacyModuleM326Routes);
    app.use('/api/v1/backend-modules/M327', legacyModuleM327Routes);
    app.use('/api/v1/backend-modules/M328', legacyModuleM328Routes);
    app.use('/api/v1/backend-modules/M329', legacyModuleM329Routes);
    app.use('/api/v1/backend-modules/M330', legacyModuleM330Routes);
    app.use('/api/v1/backend-modules/M331', legacyModuleM331Routes);
    app.use('/api/v1/backend-modules/M332', legacyModuleM332Routes);
    app.use('/api/v1/backend-modules/M333', legacyModuleM333Routes);
    app.use('/api/v1/backend-modules/M334', legacyModuleM334Routes);
    app.use('/api/v1/backend-modules/M335', legacyModuleM335Routes);
    app.use('/api/v1/backend-modules/M336', legacyModuleM336Routes);
    app.use('/api/v1/backend-modules/M337', legacyModuleM337Routes);
    app.use('/api/v1/backend-modules/M338', legacyModuleM338Routes);
    app.use('/api/v1/backend-modules/M339', legacyModuleM339Routes);
    app.use('/api/v1/backend-modules/M340', legacyModuleM340Routes);
    app.use('/api/v1/backend-modules/M341', legacyModuleM341Routes);
    app.use('/api/v1/backend-modules/M342', legacyModuleM342Routes);
    app.use('/api/v1/backend-modules/M343', legacyModuleM343Routes);
    app.use('/api/v1/backend-modules/M344', legacyModuleM344Routes);
    app.use('/api/yieldmanagement', yieldManagement);
    app.use('/api/wikipedia', wikipediaRoutes);
    app.use('/api/weather', weatherRoutes);
    app.use('/api/weatheradvisory', weatherAdvisory);
    app.use('/api/wearableintegration', wearableIntegrationRoutes);
    app.use('/api/watermanagement', waterManagementRoutes);
    app.use('/api/warehousemanagement', warehouseManagement);
    app.use('/api/wallet', walletRoutes);
    app.use('/api/vr', vr);
    app.use('/api/vision', visionRoutes);
    app.use('/api/videoanalytics', videoAnalytics);
    app.use('/api/vendor', vendorRoutes);
    app.use('/api/user', userRoutes);
    app.use('/api/unifiedai', unifiedAIRoutes);
    app.use('/api/ai', unifiedAIRoutes);
    app.use('/api/v1/ai', unifiedAIRoutes);
    app.use('/api/ai/copilot', aiCopilotFramework.router);
    app.use('/api/v1/ai/copilot', aiCopilotFramework.router);
    app.use('/api/ai/models', aiModelsRoutes);
    app.use('/api/ai/training', aiTrainingEvaluationRoutes);
    app.use('/api/v1/ai/models', aiModelsRoutes);
    app.use('/api/v1/ai/training', aiTrainingEvaluationRoutes);
    app.use('/api/monitoring', infrastructureMonitoringRoutes);
    app.use('/api/v1/monitoring', infrastructureMonitoringRoutes);
    app.use('/api/gdpr', gdprComplianceRoutes);
    app.use('/api/v1/gdpr', gdprComplianceRoutes);
    app.use('/api/unifiedaigateway', unifiedAIGateway);
    app.use('/api/transaction', transactionRoutes);
    app.use('/api/trackdart', trackDartRoutes);
    app.use('/api/tenantmanagement', tenantManagementRoutes);
    app.use('/api/systemadministration', systemAdministrationRoutes);
    app.use('/api/supplychaintracking', supplyChainTracking);
    app.use('/api/supplychainanalytics', supplyChainAnalytics);
    app.use('/api/supply-chain', supplyChainDecisionRoutes);
    app.use('/api/v1/supply-chain', supplyChainDecisionRoutes);
    app.use('/api/subscriptions', subscriptions);
    app.use('/api/soilmanagement', soilManagementRoutes);
    app.use('/api/soilhealth', soilHealth);
    app.use('/api/sheep', sheepRoutes);
    app.use('/api/sellerverifications', sellerVerifications);
    app.use('/api/sellerranking', sellerRankingRoutes);
    app.use('/api/seedvault', seedVaultRoutes);
    app.use('/api/sapmodulearchitecture', sapModuleArchitectureRoutes);
    app.use('/api/rolemanagement', roleManagementRoutes);
    app.use('/api/riskpricing', riskPricingRoutes);
    app.use('/api/riskassessment', riskAssessment);
    app.use('/api/rfq', rfqRoutes);
    app.use('/api/revenue', revenueRoutes);
    app.use('/api/returnloadboard', returnLoadBoardRoutes);
    app.use('/api/researchanddevelopment', researchAndDevelopmentRoutes);
    app.use('/api/regionalvariety', regionalVarietyRoutes);
    app.use('/api/v1/varieties', neVarietiesRoutes);
    app.use('/api/recoveredfinance', recoveredFinanceRoutes);
    app.use('/api/realtimemonitoring', realtimeMonitoringRoutes);
    app.use('/api/qualityassurance', qualityAssurance);
    app.use('/api/projectsystems', projectSystemsRoutes);
    app.use('/api/product', productRoutes);
    app.use('/api/productreview', productReviewRoutes);
    app.use('/api/productmediaai', productMediaAIRoutes);
    app.use('/api/ai/product-media-ai', productMediaAIRoutes);
    app.use('/api/v1/ai/product-media-ai', productMediaAIRoutes);
    app.use('/api/publicdata', publicDataRoutes);
    app.use('/api/productcertifications', productCertifications);
    app.use('/api/priceforecasting', priceForecasting);
    app.use('/api/preventivemaintenance', preventiveMaintenanceRoutes);
    app.use('/api/predictiveintelligence', predictiveIntelligenceRoutes);
    app.use('/api/predictiveanalytics', predictiveAnalytics);
    app.use('/api/poultry', poultryRoutes);
    app.use('/api/platformtelemetry', platformTelemetryRoutes);
    app.use('/api/platformcore', platformCoreRoutes);
    app.use('/api/platformconfiguration', platformConfigurationRoutes);
    app.use('/api/pig', pigRoutes);
    app.use('/api/phase9', phase9);
    app.use('/api/phase8', phase8);
    app.use('/api/phase12', phase12);
    app.use('/api/phase11', phase11);
    app.use('/api/phase10', phase10);
    app.use('/api/payment', paymentRoutes);
    app.use('/api/paymentgateway', paymentGatewayRoutes);
    app.use('/api/orphaned_services_mount', ORPHANED_SERVICES_MOUNT);

    // Additional orphaned services: these each have a real setupRoutes(app)
    // that does its own absolute app.use(...) internally, so they must be
    // called with the actual `app`, not a sub-router (a sub-router would
    // double-prefix their absolute paths under whatever it's mounted at).
    // Found never-called via tools/codex-api-client-mismatch-scan.js.
    const moreOrphanedServices = [
      ['householdEconomyService', require('./services/legacy/householdEconomyService')],
      ['renewableEnergyService', require('./services/legacy/renewableEnergyService')],
      ['ruralEnterpriseService', require('./services/legacy/ruralEnterpriseService')],
      ['villageProfileService', require('./services/legacy/villageProfileService')],
      ['aiAdvisoryService', require('./services/legacy/aiAdvisoryService')],
      ['aiAgenticCompanionService', require('./services/legacy/aiAgenticCompanionService')],
      ['decisionSupportService', require('./services/legacy/decisionSupportService')],
      ['buyingClubService', require('./services/legacy/buyingClubService')],
      ['machineryAccessService', require('./services/legacy/machineryAccessService')],
      ['marketAccessService', require('./services/legacy/marketAccessService')],
      ['marketIntelligenceService', require('./services/legacy/marketIntelligenceService')],
      ['procurementSubscriptionService', require('./services/legacy/procurementSubscriptionService')],
      ['ruralFinanceService', require('./services/legacy/ruralFinanceService')],
      ['custodyEventRoutes', require('./services/legacy/custodyEventRoutes')],
      ['mobilityRidesService', require('./services/legacy/mobilityRidesService')],
      ['analyticsMonitoringService', require('./services/legacy/analyticsMonitoringService')],
    ];
    for (const [name, svc] of moreOrphanedServices) {
      try {
        if (svc && typeof svc.setupRoutes === 'function') {
          svc.setupRoutes(app);
          logger.info(`Orphaned service mounted: ${name}`);
        }
      } catch (error) {
        logger.error(`Failed to mount orphaned service ${name}:`, error.message);
      }
    }
    app.use('/api/organizationmanagement', organizationManagementRoutes);
    app.use('/api/order', orderRoutes);
    // Unlike its climate/enterprise/livestock siblings, this module exports the
    // router directly rather than as { router, ... }.
    app.use('/api/operationsroutesupport', operationsRouteSupport);
    app.use('/api/operationsmanagement', operationsManagementRoutes);
    app.use('/api/nutritionintelligence', nutritionIntelligenceRoutes);
    app.use('/api/nutrition-intelligence', nutritionIntelligenceRoutes);
    app.use('/api/v1/nutrition-intelligence', nutritionIntelligenceRoutes);
    app.use('/api/nutrientvaluesales', nutrientValueSalesRoutes);
    app.use('/api/nlp', nlp);
    app.use('/api/nervoussystem', nervousSystemRoutes);
    app.use('/api/mloptimization', mlOptimization);
    app.use('/api/marketplaceenhancements', marketplaceEnhancements);
    app.use('/api/marketdata', marketDataRoutes);
    app.use('/api/marketanalytics', marketAnalytics);
    app.use('/api/m400aibackbone', m400AiBackboneRoutes);
    app.use('/api/logisticsenhancements', logisticsEnhancements);
    app.use('/api/logisticsenhancement', logisticsEnhancementRoutes);
    app.use('/api/loanmanagement', loanManagement);
    app.use('/api/livestockroutesupport', livestockRouteSupport.router);
    app.use('/api/livestockmanagement', livestockManagementRoutes);
    app.use('/api/livestock', livestock);
    app.use('/api/library', libraryRoutes);
    app.use('/api/library-knowledge', libraryRoutes);
    app.use('/api/v1/library', libraryRoutes);
    app.use('/api/library-ai-workspace', libraryAIWorkspaceRoutes);
    app.use('/api/ai/library-workspace', libraryAIWorkspaceRoutes);
    app.use('/api/v1/ai/library-workspace', libraryAIWorkspaceRoutes);
    app.use('/api/landrecords', landRecordsRoutes);
    app.use('/api/landmanagement', landManagementRoutes);
    app.use('/api/knowledge', knowledgeRoutes);
    app.use('/api/irrigationmanagement', irrigationManagementRoutes);
    app.use('/api/iotsensors', iotSensors);
    app.use('/api/iotintegration', iotIntegrationRoutes);
    app.use('/api/insuranceenhancements', insuranceEnhancements);
    app.use('/api/inputsupplymanagement', inputSupplyManagementRoutes);
    app.use('/api/informationsharing', informationSharingRoutes);
    app.use('/api/identitymanagement', identityManagementRoutes);
    app.use('/api/hr', hrRoutes);
    app.use('/api/horticulturemanagement', horticultureManagementRoutes);
    app.use('/api/horticulture', horticulture);
    app.use('/api/gst', gstRoutes);
    app.use('/api/greenhouse', greenhouse);
    app.use('/api/governancemodule', governanceModule);
    app.use('/api/goat', goatRoutes);
    app.use('/api/glutwarning', glutWarningRoutes);
    app.use('/api/geofencing', geofencingRoutes);
    app.use('/api/freightpooling', freightPoolingRoutes);
    app.use('/api/freightpooling', freightPooling);
    app.use('/api/food', foodRoutes);
    app.use('/api/folu', foluRoutes);
    app.use('/api/folubenchmark', foluBenchmarkRoutes);
    app.use('/api/fisheriesmanagement', fisheriesManagementRoutes);
    app.use('/api/financialanalytics', financialAnalytics);
    app.use('/api/fertilizer', fertilizerRoutes);
    app.use('/api/farmervalue', farmerValueRoutes);
    app.use('/api/farmertraining', farmerTrainingRoutes);
    app.use('/api/farmer', farmerRoutes);
    app.use('/api/farmerportalenhancements', farmerPortalEnhancements);
    app.use('/api/farmerhealth', farmerHealthRoutes);
    app.use('/api/farmerfamily', farmerFamilyRoutes);
    app.use('/api/farmcosting', farmCosting);
    app.use('/api/farm-costing', farmCosting);
    app.use('/api/v1/farm-costing', farmCosting);
    app.use('/api/farmanalytics', farmAnalytics);
    app.use('/api/experience', experienceRoutes);
    app.use('/api/escrow', escrowRoutes);
    app.use('/api/equipmentexchange', equipmentExchangeRoutes);
    app.use('/api/enterpriseroutesupport', enterpriseRouteSupport.router);
    app.use('/api/enterpriseintegration', enterpriseIntegrationRoutes);
    app.use('/api/enterpriseai', enterpriseAIRoutes);
    app.use('/api/engineeringproject', engineeringProjectRoutes);
    app.use('/api/energy', energyRoutes);
    app.use('/api/ecommerce', ecommerceRoutes);
    app.use('/api/ecommercemarketing', ecommerceMarketingRoutes);
    app.use('/api/ecommerceintegration', ecommerceIntegrationRoutes);
    app.use('/api/ecommerceerp', ecommerceERPRoutes);
    app.use('/api/ecommercebusinesssales', ecommerceBusinessSalesRoutes);
    app.use('/api/ecommerceai', ecommerceAIRoutes);
    app.use('/api/dprgeneration', dprGenerationRoutes);
    app.use('/api/digitaltwin', digitalTwinRoutes);
    app.use('/api/diettherapy', dietTherapyRoutes);
    app.use('/api/demand', demandRoutes);
    app.use('/api/defensefitnessprep', defenseFitnessPrepRoutes);
    app.use('/api/decisionsupport', decisionSupportRoutes);
    app.use('/api/datavisualization', dataVisualization);
    app.use('/api/dashboard', dashboardRoutes);
    app.use('/api/dairy', dairyRoutes);
    app.use('/api/cropvalueresearch', cropValueResearchRoutes);
    app.use('/api/croprecommendations', cropRecommendations);
    app.use('/api/cropplanning', cropPlanningRoutes);
    app.use('/api/cropmanagement', cropManagementRoutes);
    app.use('/api/v1', cropDomainRoutes);
    app.use('/api/v1/seed-vault', seedVaultRoutesMerged);
    app.use('/api/v1/financial-ai', financialAIRoutes);
    app.use('/api/v1', livestockDomainRoutes);
    app.use('/api/v1', soilDomainRoutes);
    app.use('/api/v1', dairyDomainRoutes);
    app.use('/api/v1', fertilizerDomainRoutes);
    app.use('/api/v1/erp', erpServiceRouter);
    app.use('/api/v1/enterprise-control', enterpriseControlServiceRouter);
    app.use('/api/v1', organizationDomainRoutes);
    app.use('/api/v1', fisheriesDomainRoutes);
    app.use('/api/v1', comprehensiveERPDomainRoutes);
    app.use('/api/v1', researchAndDevelopmentDomainRoutes);
    app.use('/api/v1', sapModuleArchitectureDomainRoutes);
    app.use('/api/v1', animalHealthDomainRoutes);
    app.use('/api/v1', completeAIIntegrationDomainRoutes);
    app.use('/api/v1', completeERPIntegrationDomainRoutes);
    app.use('/api/v1', aiOperationIntelligenceDomainRoutes);
    app.use('/api/v1', aiSelfHealingDomainRoutes);
    app.use('/api/v1', coldStorageDomainRoutes);
    app.use('/api/v1', costControlDomainRoutes);
    app.use('/api/v1', sheepDomainRoutes);
    app.use('/api/v1', aiAgentDomainRoutes);
    app.use('/api/v1', aiBrainDomainRoutes);
    app.use('/api/v1', ecommerceAIDomainRoutes);
    app.use('/api/v1', agriculturalIntelligenceDomainRoutes);
    app.use('/api/v1', ecommerceIntegrationDomainRoutes);
    app.use('/api/v1', poultryDomainRoutes);
    app.use('/api/v1', assetAccountingDomainRoutes);
    app.use('/api/v1', decisionSupportDomainRoutes);
    app.use('/api/v1', ecommerceMarketplaceDomainRoutes);
    app.use('/api/v1', ordersDomainRoutes);
    app.use('/api/v1', weatherDomainRoutes);
    app.use('/api/v1', cooperativeShareDomainRoutes);
    app.use('/api/v1', walletDomainRoutes);
    app.use('/api/v1', equipmentExchangeDomainRoutes);
    app.use('/api/v1', multilingualDomainRoutes);
    app.use('/api/v1', ecommerceBusinessSalesDomainRoutes);
    app.use('/api/v1', bulkOrderDomainRoutes);
    app.use('/api/v1', civilDisruptionDomainRoutes);
    app.use('/api/v1', engineeringProjectDomainRoutes);
    app.use('/api/v1', ecommerceERPDomainRoutes);
    app.use('/api/v1', experienceLayerDomainRoutes);
    app.use('/api/v1', insuranceDomainRoutes);
    app.use('/api/v1', authorizationDomainRoutes);
    app.use('/api/v1', climateMonitoringDomainRoutes);
    app.use('/api/v1', communityManagementDomainRoutes);
    app.use('/api/v1', rfqDomainRoutes);
    app.use('/api/v1', farmerHealthDomainRoutes);
    app.use('/api/v1', farmerKycDomainRoutes);
    app.use('/api/v1', farmerVerificationDomainRoutes);
    app.use('/api/v1', horticultureManagementDomainRoutes);
    app.use('/api/v1', landRecordsDomainRoutes);
    app.use('/api/v1', returnLoadBoardDomainRoutes);
    app.use('/api/v1', realtimeMonitoringDomainRoutes);
    app.use('/api/v1', conversationalAIDomainRoutes);
    app.use('/api/v1', voiceAIDomainRoutes);
    app.use('/api/v1', aiBackboneDomainRoutes);
    app.use('/api/v1', companyDomainRoutes);
    app.use('/api/v1', financeDomainRoutes);
    app.use('/api/v1', complianceDomainRoutes);
    app.use('/api/v1', defenseFitnessPrepDomainRoutes);
    app.use('/api/v1', enterpriseIntegrationDomainRoutes);
    app.use('/api/v1', escrowDomainRoutes);
    app.use('/api/v1', financialAIDomainRoutes);
    app.use('/api/v1', systemAdministrationDomainRoutes);
    app.use('/api/v1', logisticsAIDomainRoutes);
    app.use('/api/v1', blockchainVerificationDomainRoutes);
    app.use('/api/v1', knowledgeGraphDomainRoutes);
    app.use('/api/v1', cropValueResearchDomainRoutes);
    app.use('/api/v1', tenantManagementDomainRoutes);
    app.use('/api/v1', platformCoreDomainRoutes);
    app.use('/api/v1', mfaDomainRoutes);
    app.use('/api/v1', organicTraceabilityDomainRoutes);
    app.use('/api/v1', ecommerceMarketingDomainRoutes);
    app.use('/api/v1', sellerRankingDomainRoutes);
    app.use('/api/v1', farmerValueDomainRoutes);
    app.use('/api/v1', transactionDomainRoutes);
    app.use('/api/v1', notificationDomainRoutes);
    app.use('/api/v1', privacyDomainRoutes);
    app.use('/api/v1', pestForecastingDomainRoutes);
    app.use('/api/v1', adminAuditDomainRoutes);
    app.use('/api/v1/apiculture', apicultureRoutes);
    app.use('/api/v1/strategic/contract-farming', contractFarmingRoutes);
    app.use('/api/v1/forestry', forestryRoutes);
    app.use('/api/v1/vermicompost', vermicompostRoutes);
    app.use('/api/v1/sericulture', sericultureRoutes);
    app.use('/api/v1/fisheries', fisheriesRoutes);
    app.use('/api/v1/strategic/household', householdProcurementRoutes);
    app.use('/api/v1/module-registry', moduleRegistryRoutes);
    app.use('/api/v1/strategic/pre-season', preSeasonPurchaseRoutes);
    app.use('/api/v1/privacy', gdprRoutes);
    app.use('/api/v1/strategic/government', governmentSubsidyRoutes);
    app.use('/api/v1/mushroom', mushroomRoutes);
    app.use('/api/database-management', databaseManagementRoutes);
    app.use('/api/v1/library-ai', libraryAIWorkspaceRoutes);
    app.use('/api/v1/governance', governanceModuleMerged);
    app.use('/api/v1/cost-management', costRoutesMerged);
    app.use('/api/cost', costRoutes);
    app.use('/api/costcontrol', costControlRoutes);
    app.use('/api/cooperativeshare', cooperativeShareRoutes);
    app.use('/api/comprehensiveerp', comprehensiveERPRoutes);
    app.use('/api/compliancetracking', complianceTracking);
    app.use('/api/compliance', complianceRoutes);
    app.use('/api/completeerpintegration', completeERPIntegrationRoutes);
    app.use('/api/completeaiintegration', completeAIIntegrationRoutes);
    app.use('/api/company', companyRoutes);
    app.use('/api/communitymanagement', communityManagementRoutes);
    app.use('/api/coldstorage', coldStorageRoutes);
    app.use('/api/coldchainmonitoring', coldChainMonitoring);
    app.use('/api/climateroutesupport', climateRouteSupport.router);
    app.use('/api/climatemonitoring', climateMonitoringRoutes);
    app.use('/api/climateadvisory', climateAdvisoryRoutes);
    app.use('/api/climateadvisory', climateAdvisory);
    app.use('/api/civildisruption', civilDisruptionRoutes);
    app.use('/api/certificationmanagement', certificationManagement);
    app.use('/api/buyertrust', buyerTrust);
    app.use('/api/bulkorders', bulkOrders);
    app.use('/api/bulkorder', bulkOrderRoutes);
    app.use('/api/blockchainverification', blockchainVerificationRoutes);
    app.use('/api/blockchaintrace', blockchainTrace);
    app.use('/api/biometric', biometric);
    app.use('/api/automation', automation);
    app.use('/api/auth', authRoutes);
    app.use('/api/audittrail', auditTrail);
    app.use('/api/audit', auditRoutes);
    app.use('/api/assetaccounting', assetAccountingRoutes);
    app.use('/api/ar', ar);
    app.use('/api/apicompatibility', apiCompatibilityRoutes);
    app.use('/api/animalhealth', animalHealthRoutes);
    app.use('/api/analyticsreport', analyticsReportRoutes);
    app.use('/api/aiselfhealing', aiSelfHealingRoutes);
    app.use('/api/aioperationintelligence', aiOperationIntelligenceRoutes);
    app.use('/api/aigateway', aiGatewayRoutes);
    app.use('/api/aicollaboration', aiCollaborationRoutes);
    app.use('/api/devin', devinRoutes);
    app.use('/api/aibrain', aiBrainRoutes);
    app.use('/api/aibackbone', aiBackboneRoutes);
    app.use('/api/aiapproval', aiApprovalRoutes);
    app.use('/api/aiagent', aiAgentRoutes);
    app.use('/api/agriculturalintelligence', agriculturalIntelligenceRoutes);
    app.use('/api/advancedsearch', advancedSearchRoutes);
    app.use('/api/advancedfeatures', advancedFeatures);
    app.use('/api/advancedanalytics', advancedAnalyticsRoutes);
    app.use('/api/v1/warnings', apiWarningRoutes);

    // Routes index is a module exporter, not a router - don't mount it
    // app.use('/api/index', index);

    app.use('/health', healthRoutes);
    logger.info('✅ Health check routes mounted at /health');

    // Auto Image Generation Routes
    app.use('/api/auto-generation', productImageAutoGenerationRoutes);
    app.use('/api/ai/images', aiImageGenerationEnhancedRoutes);
    app.use('/api/commerce/images', ecommerceImageIntegrationRoutes);
    app.use('/api/farmer/images', farmerImagePortalRoutes);
    logger.info('🎨 Auto image generation routes mounted');

    // Integration Status Dashboard - Project Visibility
    app.use('/api/status', integrationStatusRoutes);
    logger.info('📊 Integration status routes mounted at /api/status');

    // BLOCKER FIXES
    // Blocker 3: Endpoint Mismatch Fixer
    app.use('/api/debug', endpointMismatchFixer);
    logger.info('🔧 Endpoint mismatch fixer mounted at /api/debug');

    // Blocker 4: Stripe Webhook Handler
    app.use('/api', stripeWebhookRoutes);
    logger.info('💳 Stripe webhook handler mounted at /api/stripe-webhook');

    // Standardized error handling must follow every route registration.
    // Call the factory: registering it uncalled gives Express an arity-0
    // function, which it treats as ordinary middleware. It then returns the
    // inner handler instead of calling next(), and every request that reaches
    // this layer hangs with no error logged.
    app.use(standardizeErrorResponse());
    app.use(errorHandler);

    // ========================================================================
    // START SERVER
    // ========================================================================

    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
      const elapsed = Date.now() - startTime;

      logger.info(`
        ╔══════════════════════════════════════════╗
        ║     EBDESIGN Platform Running 🌱        ║
        ║                                          ║
        ║  Server:     http://localhost:${PORT}      ║
        ║  Services:   ${serviceLoader.discoveredCount} discovered, ${serviceLoader.loadedCount} loaded    ║
        ║  Routes:     ${routeLoader.mountedCount} mounted              ║
        ║  Startup:    ${elapsed}ms                 ║
        ║                                          ║
        ║  🔗 Health:  /health                     ║
        ║  📊 Stats:   /api/v1/system/stats        ║
        ║  🔍 Services: /api/v1/system/services    ║
        ║  🛣️  Routes:  /api/v1/system/routes      ║
        ╚══════════════════════════════════════════╝
      `);

      // Emit startup event
      if (global.eventBus) {
        global.eventBus.emit('platform:started', {
          services: serviceLoader.discoveredCount,
          routes: routeLoader.mountedCount,
          startup: elapsed,
        });
      }
    });

    // ========================================================================
    // GRACEFUL SHUTDOWN
    // ========================================================================

    process.on('SIGTERM', async () => {
      logger.info('SIGTERM received, shutting down gracefully...');

      server.close(async () => {
        logger.info('HTTP server closed');

        if (db) {
          try {
            await db.end();
            logger.info('Database connection closed');
          } catch (error) {
            logger.error('Error closing database', error);
          }
        }

        process.exit(0);
      });

      // Force shutdown after 30 seconds
      setTimeout(() => {
        logger.error('Forced shutdown after 30 second timeout');
        process.exit(1);
      }, 30000);
    });

    return { app, server, serviceLocator, configRegistry };
  } catch (error) {
    logger.error('Failed to start platform', error);
    process.exit(1);
  }
}

// ============================================================================
// START PLATFORM
// ============================================================================

if (require.main === module) {
  startup().catch(error => {
    logger.error('Fatal startup error', error);
    process.exit(1);
  });
}

module.exports = { app, startup };
