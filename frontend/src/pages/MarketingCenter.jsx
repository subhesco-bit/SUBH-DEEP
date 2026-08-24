import { TrendingUp } from 'lucide-react'
import { ecommerceMarketingAPI } from '../services/api'
import ManagementPageShell from './_shared/ManagementPageShell'
import CrudSection from './_shared/CrudSection'

/** Marketing Center — real backend at backend/src/routes/ecommerceMarketingRoutes.js
 *  (mounted /ecommerce-marketing): campaigns, sponsored products, promotions,
 *  retargeting and analytics. */
function MarketingCenter() {
  return (
    <ManagementPageShell
      icon={TrendingUp}
      title="Marketing Center"
      description="Campaigns, sponsored products and promotions — real backend at /ecommerce-marketing"
      accent="rose"
      tabs={[{ id: 'sponsored', label: 'Sponsored Products' }, { id: 'campaigns', label: 'Campaigns' }]}
    >
      {(tab) => (tab === 'sponsored' ? (
        <CrudSection
          queryKey="marketing-sponsored-products"
          listFn={() => ecommerceMarketingAPI.getSponsoredProducts({})}
          createFn={(data) => ecommerceMarketingAPI.createSponsoredProduct(data)}
          entityLabel="Sponsored product"
          accent="rose"
          fields={[
            { name: 'productId', label: 'Product ID', required: true },
            { name: 'bidAmount', label: 'Bid amount', type: 'number' },
            { name: 'dailyBudget', label: 'Daily budget', type: 'number' },
          ]}
          columns={[{ key: 'productId', label: 'Product' }, { key: 'bidAmount', label: 'Bid' }, { key: 'dailyBudget', label: 'Daily budget' }]}
        />
      ) : (
        <CrudSection
          queryKey="marketing-campaigns"
          listFn={() => ecommerceMarketingAPI.getMarketingAnalytics({})}
          createFn={(data) => ecommerceMarketingAPI.createCampaign(data)}
          entityLabel="Campaign"
          accent="rose"
          fields={[
            { name: 'name', label: 'Campaign name', required: true },
            { name: 'budget', label: 'Budget', type: 'number' },
            { name: 'start_date', label: 'Start date', type: 'date' },
            { name: 'end_date', label: 'End date', type: 'date' },
          ]}
          columns={[{ key: 'name', label: 'Campaign' }, { key: 'budget', label: 'Budget' }, { key: 'start_date', label: 'Start' }]}
          emptyMessage="No campaign analytics returned yet — create a campaign above."
        />
      ))}
    </ManagementPageShell>
  )
}

export default MarketingCenter
