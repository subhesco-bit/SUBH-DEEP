/**
 * REOS Dashboard Page
 *
 * Comprehensive dashboard for all REOS (Rural Economic Operating System) services
 * Covers: Village Profiles, Procurement Subscriptions, Buying Clubs, Rural Enterprises,
 * Renewable Energy, Household Economy, Shared Infrastructure, Machinery Access,
 * Rural Finance, AI Advisories, Market Access, Market Intelligence, Mobility Rides
 */

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import {
  villageProfileAPI,
  procurementSubscriptionAPI,
  buyingClubAPI,
  ruralEnterpriseAPI,
  renewableEnergyAPI,
  householdEconomyAPI,
  sharedInfrastructureAPI,
  machineryAccessAPI,
  ruralFinanceAPI,
  aiAdvisoryAPI,
  marketAccessAPI,
  marketIntelligenceAPI,
  mobilityRidesAPI,
} from '../services/api';
import {
  Building2,
  ShoppingCart,
  Users,
  Factory,
  Zap,
  Home,
  Wrench,
  Tractor,
  DollarSign,
  Brain,
  Store,
  TrendingUp,
  Car,
  BarChart3,
  Plus,
  Search,
  Filter,
  Download,
} from 'lucide-react';

function REOSDashboardPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('village-profiles');
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);

  const tabs = [
    { id: 'village-profiles', label: 'Village Profiles', icon: Building2 },
    { id: 'procurement-subscriptions', label: 'Procurement Subscriptions', icon: ShoppingCart },
    { id: 'buying-clubs', label: 'Buying Clubs', icon: Users },
    { id: 'rural-enterprises', label: 'Rural Enterprises', icon: Factory },
    { id: 'renewable-energy', label: 'Renewable Energy', icon: Zap },
    { id: 'household-economy', label: 'Household Economy', icon: Home },
    { id: 'shared-infrastructure', label: 'Shared Infrastructure', icon: Wrench },
    { id: 'machinery-access', label: 'Machinery Access', icon: Tractor },
    { id: 'rural-finance', label: 'Rural Finance', icon: DollarSign },
    { id: 'ai-advisories', label: 'AI Advisories', icon: Brain },
    { id: 'market-access', label: 'Market Access', icon: Store },
    { id: 'market-intelligence', label: 'Market Intelligence', icon: TrendingUp },
    { id: 'mobility-rides', label: 'Mobility Rides', icon: Car },
  ];

  // Village Profiles
  const { data: villageProfiles, isLoading: villagesLoading, isError: villagesError, refetch: retryVillages } = useQuery({
    queryKey: ['village-profiles', searchTerm],
    enabled: activeTab === 'village-profiles',
    queryFn: async () => {
      const response = await villageProfileAPI.searchVillages({ search: searchTerm, limit: 100 });
      if (!Array.isArray(response.data?.data)) throw new Error('Invalid village response');
      return response.data.data;
    },
  });

  // Procurement Subscriptions
  const { data: subscriptions, isLoading: subscriptionsLoading } = useQuery({
    queryKey: ['procurement-subscriptions'],
    enabled: activeTab === 'procurement-subscriptions',
    queryFn: async () => (await procurementSubscriptionAPI.getStatistics({})).data?.data ?? {},
  });

  // Buying Clubs
  const { data: buyingClubs, isLoading: clubsLoading } = useQuery({
    queryKey: ['buying-clubs'],
    enabled: activeTab === 'buying-clubs',
    queryFn: async () => (await buyingClubAPI.getStatistics({})).data?.data ?? {},
  });

  // Rural Enterprises
  const { data: enterprises, isLoading: enterprisesLoading } = useQuery({
    queryKey: ['rural-enterprises'],
    enabled: activeTab === 'rural-enterprises',
    queryFn: async () => (await ruralEnterpriseAPI.getStatistics({})).data?.data ?? {},
  });

  // Renewable Energy
  const { data: energySystems, isLoading: energyLoading } = useQuery({
    queryKey: ['renewable-energy'],
    enabled: activeTab === 'renewable-energy',
    queryFn: async () => (await renewableEnergyAPI.getStatistics({})).data?.data ?? {},
  });

  // AI Advisories
  const { data: advisories, isLoading: advisoriesLoading } = useQuery({
    queryKey: ['ai-advisories'],
    enabled: activeTab === 'ai-advisories',
    queryFn: async () => (await aiAdvisoryAPI.getStatistics({})).data?.data ?? {},
  });

  const renderTabContent = () => {
    switch (activeTab) {
      case 'village-profiles': {
        if (villagesLoading) return <p role="status">Loading village profiles…</p>;
        if (villagesError) return (
          <div role="alert" className="rounded-lg border border-red-200 bg-white p-6">
            <p>Village profiles could not be loaded.</p>
            <button type="button" onClick={() => retryVillages()} className="mt-3 text-blue-700 underline">Try again</button>
          </div>
        );
        const reportedRates = (villageProfiles || []).map(village => village.literacy_rate)
          .filter(rate => rate !== null && rate !== undefined && rate !== '' && Number.isFinite(Number(rate)))
          .map(Number);
        const averageLiteracy = reportedRates.length
          ? `${Math.round(reportedRates.reduce((sum, rate) => sum + rate, 0) / reportedRates.length)}%`
          : 'Not reported';
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-sm font-medium text-gray-500">Villages Returned</h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">{villageProfiles?.length || 0}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-sm font-medium text-gray-500">Districts Covered</h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {new Set(villageProfiles?.map(v => v.district).filter(Boolean)).size || 0}
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-sm font-medium text-gray-500">Avg Literacy Rate</h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {averageLiteracy}
                </p>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-4 border-b">
                <h3 className="font-semibold">Village Profiles</h3>
                <p className="mt-1 text-sm text-gray-500">Up to 100 matching villages. Refine your search to narrow the results.</p>
              </div>
              <div className="p-4">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 font-medium">Village Name</th>
                        <th className="text-left p-3 font-medium">District</th>
                        <th className="text-left p-3 font-medium">Block</th>
                        <th className="text-left p-3 font-medium">Population</th>
                        <th className="text-left p-3 font-medium">Avg Income</th>
                      </tr>
                    </thead>
                    <tbody>
                      {villageProfiles?.map(v => (
                        <tr key={v.id} className="border-b hover:bg-gray-50">
                          <td className="p-3">{v.name}</td>
                          <td className="p-3">{v.district}</td>
                          <td className="p-3">{v.block}</td>
                          <td className="p-3">{v.population}</td>
                          <td className="p-3">{v.avg_income == null ? 'Not reported' : `₹${Number(v.avg_income).toLocaleString('en-IN')}`}</td>
                        </tr>
                      ))}
                      {villageProfiles?.length === 0 && (
                        <tr><td colSpan={5} className="p-6 text-center text-gray-500">No villages match your search.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        );

      }

      case 'procurement-subscriptions':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-sm font-medium text-gray-500">Total Subscriptions</h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">{subscriptions?.totalSubscriptions || 0}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-sm font-medium text-gray-500">Active</h3>
                <p className="text-3xl font-bold text-green-600 mt-2">{subscriptions?.activeSubscriptions || 0}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-sm font-medium text-gray-500">Paused</h3>
                <p className="text-3xl font-bold text-yellow-600 mt-2">{subscriptions?.pausedSubscriptions || 0}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-sm font-medium text-gray-500">Avg Quantity/Cycle</h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">{subscriptions?.avgQuantityPerCycle || 0}</p>
              </div>
            </div>
          </div>
        );

      case 'buying-clubs':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-sm font-medium text-gray-500">Total Clubs</h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">{buyingClubs?.totalClubs || 0}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-sm font-medium text-gray-500">Active</h3>
                <p className="text-3xl font-bold text-green-600 mt-2">{buyingClubs?.activeClubs || 0}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-sm font-medium text-gray-500">Total Members</h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">{buyingClubs?.totalMembers || 0}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-sm font-medium text-gray-500">Avg Members/Club</h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">{Math.round(buyingClubs?.avgMembersPerClub || 0)}</p>
              </div>
            </div>
          </div>
        );

      case 'rural-enterprises':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-sm font-medium text-gray-500">Total Enterprises</h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">{enterprises?.totalEnterprises || 0}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-sm font-medium text-gray-500">Active</h3>
                <p className="text-3xl font-bold text-green-600 mt-2">{enterprises?.activeEnterprises || 0}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-sm font-medium text-gray-500">Total Employees</h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">{enterprises?.totalEmployees || 0}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-sm font-medium text-gray-500">Annual Turnover</h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">₹{(enterprises?.totalAnnualTurnover || 0).toLocaleString()}</p>
              </div>
            </div>
          </div>
        );

      case 'renewable-energy':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-sm font-medium text-gray-500">Total Systems</h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">{energySystems?.totalSystems || 0}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-sm font-medium text-gray-500">Operational</h3>
                <p className="text-3xl font-bold text-green-600 mt-2">{energySystems?.operationalSystems || 0}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-sm font-medium text-gray-500">Total Capacity</h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">{energySystems?.totalCapacityKW || 0} kW</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-sm font-medium text-gray-500">Annual Generation</h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">{energySystems?.totalAnnualGenerationKWh || 0} kWh</p>
              </div>
            </div>
          </div>
        );

      case 'ai-advisories':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-sm font-medium text-gray-500">Total Advisories</h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">{advisories?.totalAdvisories || 0}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-sm font-medium text-gray-500">Pending</h3>
                <p className="text-3xl font-bold text-yellow-600 mt-2">{advisories?.pendingAdvisories || 0}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-sm font-medium text-gray-500">Actioned</h3>
                <p className="text-3xl font-bold text-green-600 mt-2">{advisories?.actionedAdvisories || 0}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-sm font-medium text-gray-500">Avg Confidence</h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">{Math.round(advisories?.avgConfidenceScore || 0)}%</p>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="bg-white p-12 rounded-lg shadow-sm border text-center">
            <BarChart3 className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Service Overview</h3>
            <p className="text-gray-500">Select a tab to view detailed information for this service.</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">REOS Dashboard</h1>
          <p className="mt-2 text-gray-600">Rural Economic Operating System - Comprehensive Management</p>
        </div>

        <div className="mb-6 flex flex-wrap gap-2 border-b">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                activeTab === tab.id ?
                  'border-blue-600 text-blue-600 font-medium' :
                  'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'village-profiles' ? (
          <div className="mb-6 max-w-lg">
            <label htmlFor="village-search" className="mb-2 block text-sm font-medium text-gray-700">Search villages</label>
            <input id="village-search" type="search" value={searchTerm}
              onChange={event => setSearchTerm(event.target.value)}
              placeholder="Village, district, state, block, or code"
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2" />
          </div>
        ) : (
        <div className="mb-6 flex justify-between items-center">
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50">
              <Search className="w-4 h-4" />
              Search
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50">
              <Filter className="w-4 h-4" />
              Filter
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Add New
          </button>
        </div>

        )}

        {renderTabContent()}
      </div>
    </div>
  );
}

export default REOSDashboardPage;
