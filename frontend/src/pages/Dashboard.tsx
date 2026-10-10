import React, { useState, useEffect } from 'react';
import { District, Taluka, Village, LandParcel, DashboardStats } from '../types';
import { api } from '../services/api';
import { TopFilterBar } from '../components/dashboard/TopFilterBar';
import { CadastralMap } from '../components/maps/CadastralMap';
import { ParcelDetailsPanel } from '../components/dashboard/ParcelDetailsPanel';
import { KpiCards } from '../components/dashboard/KpiCards';
import { AnalyticsRow } from '../components/dashboard/AnalyticsRow';
import { EditParcelModal } from '../components/modals/EditParcelModal';
import { SurveyReportModal } from '../components/modals/SurveyReportModal';
import { UploadDocumentModal } from '../components/modals/UploadDocumentModal';
import { CompareBoundaryModal } from '../components/modals/CompareBoundaryModal';

export const Dashboard: React.FC = () => {
  // Cascading Location States
  const [districts, setDistricts] = useState<District[]>([]);
  const [selectedDistrictId, setSelectedDistrictId] = useState<number | null>(null);

  const [talukas, setTalukas] = useState<Taluka[]>([]);
  const [selectedTalukaId, setSelectedTalukaId] = useState<number | null>(null);

  const [villages, setVillages] = useState<Village[]>([]);
  const [selectedVillageId, setSelectedVillageId] = useState<number | null>(null);

  // Search & Map States
  const [searchQuery, setSearchQuery] = useState('');
  const [mapType, setMapType] = useState<'map' | 'satellite' | 'hybrid' | 'terrain'>('satellite');

  // Parcels and Selection
  const [parcels, setParcels] = useState<LandParcel[]>([]);
  const [selectedParcel, setSelectedParcel] = useState<LandParcel | null>(null);

  // Stats
  const [stats, setStats] = useState<DashboardStats | null>(null);

  // Modals
  const [showEditModal, setShowEditModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showCompareModal, setShowCompareModal] = useState(false);

  // 1. Load Initial Districts
  useEffect(() => {
    api.getDistricts().then((data) => {
      setDistricts(data);
      if (data.length > 0) {
        setSelectedDistrictId(data[0].id);
      }
    }).catch(console.error);

    api.getDashboardStats().then(setStats).catch(console.error);
  }, []);

  // 2. Load Talukas when District Changes
  useEffect(() => {
    if (!selectedDistrictId) return;
    api.getTalukas(selectedDistrictId).then((data) => {
      setTalukas(data);
      if (data.length > 0) {
        // Default to Yeola (Taluka from reference image)
        const yeola = data.find((t) => t.name.toLowerCase() === 'yeola') || data[0];
        setSelectedTalukaId(yeola.id);
      }
    }).catch(console.error);
  }, [selectedDistrictId]);

  // 3. Load Villages when Taluka Changes
  useEffect(() => {
    if (!selectedTalukaId) return;
    api.getVillages(selectedTalukaId).then((data) => {
      setVillages(data);
      if (data.length > 0) {
        // Default to Pimpalgaon (Village from reference image)
        const pimp = data.find((v) => v.name.toLowerCase() === 'pimpalgaon') || data[0];
        setSelectedVillageId(pimp.id);
      }
    }).catch(console.error);
  }, [selectedTalukaId]);

  // 4. Load Parcels when Village Changes
  useEffect(() => {
    if (!selectedVillageId) return;
    api.getParcels(selectedVillageId).then((data) => {
      setParcels(data);
      // Select 50/1 by default matching screenshot
      const defaultParcel = data.find((p) => p.survey_number === '50/1') || data[0] || null;
      if (defaultParcel) {
        api.getParcelDetail(defaultParcel.id).then(setSelectedParcel).catch(() => setSelectedParcel(defaultParcel));
      }
    }).catch(console.error);

    api.getDashboardStats(selectedVillageId).then(setStats).catch(console.error);
  }, [selectedVillageId]);

  // Handle Search
  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      const results = await api.searchParcels(searchQuery, selectedVillageId || undefined);
      if (results.length > 0) {
        const fullDetail = await api.getParcelDetail(results[0].id);
        setSelectedParcel(fullDetail);
      } else {
        alert(`No land parcels found matching: "${searchQuery}"`);
      }
    } catch (err: any) {
      alert(`Search error: ${err.message}`);
    }
  };

  const handleSelectParcel = async (p: LandParcel) => {
    try {
      const fullDetail = await api.getParcelDetail(p.id);
      setSelectedParcel(fullDetail);
    } catch (_) {
      setSelectedParcel(p);
    }
  };

  // Download Map GeoJSON file
  const handleDownloadMap = () => {
    if (!selectedParcel) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(
      JSON.stringify({
        type: "Feature",
        properties: {
          survey_number: selectedParcel.survey_number,
          gat_number: selectedParcel.gat_number,
          owner: selectedParcel.owner_name,
          area_ha: selectedParcel.area_hectares
        },
        geometry: selectedParcel.boundary_geojson ? JSON.parse(selectedParcel.boundary_geojson) : null
      }, null, 2)
    );
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `Cadastral_Map_Gat_${selectedParcel.gat_number.replace('/', '_')}.geojson`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Generate Certificate (download PDF)
  const handleGenerateCertificate = () => {
    if (!selectedParcel) return;
    window.open(api.getParcelPdfUrl(selectedParcel.id), '_blank');
  };

  return (
    <div className="p-4 space-y-4 max-w-[1600px] mx-auto">
      {/* 1. TOP CONTROL & CASCADING FILTER BAR */}
      <TopFilterBar
        districts={districts}
        selectedDistrictId={selectedDistrictId}
        onSelectDistrict={setSelectedDistrictId}
        talukas={talukas}
        selectedTalukaId={selectedTalukaId}
        onSelectTaluka={setSelectedTalukaId}
        villages={villages}
        selectedVillageId={selectedVillageId}
        onSelectVillage={setSelectedVillageId}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchSubmit={handleSearchSubmit}
        mapType={mapType}
        onMapTypeChange={setMapType}
      />

      {/* 2. MAIN CADASRAL MAP & PARCEL DETAILS ROW */}
      <div className="flex flex-col lg:flex-row gap-3.5 h-[500px]">
        {/* Cadastral Interactive GIS Map */}
        <div className="flex-1 h-full min-h-[350px]">
          <CadastralMap
            parcels={parcels}
            selectedParcel={selectedParcel}
            onSelectParcel={handleSelectParcel}
            mapType={mapType}
          />
        </div>

        {/* Right-Side Parcel Details Panel */}
        <div className="h-full flex-shrink-0">
          <ParcelDetailsPanel
            parcel={selectedParcel}
            onClose={() => setSelectedParcel(null)}
            onEdit={() => setShowEditModal(true)}
            onViewReport={() => setShowReportModal(true)}
            onUploadDocs={() => setShowUploadModal(true)}
            onDownloadMap={handleDownloadMap}
            onGenerateCertificate={handleGenerateCertificate}
            onCompareBoundary={() => setShowCompareModal(true)}
          />
        </div>
      </div>

      {/* 3. KPI METRIC SUMMARY CARDS */}
      <KpiCards kpis={stats?.kpis || null} />

      {/* 4. BOTTOM ANALYTICS & RECENT RECORDS ROW */}
      <AnalyticsRow
        landTypes={stats?.land_types || []}
        areaByTaluka={stats?.area_by_taluka || []}
        recentSurveys={stats?.recent_surveys || []}
        onSelectSurveyNo={async (sNo) => {
          const matched = parcels.find((p) => p.survey_number === sNo || p.gat_number === sNo);
          if (matched) {
            const detail = await api.getParcelDetail(matched.id);
            setSelectedParcel(detail);
          }
        }}
      />

      {/* MODALS */}
      <EditParcelModal
        parcel={selectedParcel}
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onUpdated={(updated) => {
          setSelectedParcel(updated);
          setParcels((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
          api.getDashboardStats(selectedVillageId || undefined).then(setStats);
        }}
      />

      <SurveyReportModal
        parcel={selectedParcel}
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
      />

      <UploadDocumentModal
        parcel={selectedParcel}
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
      />

      <CompareBoundaryModal
        parcel={selectedParcel}
        isOpen={showCompareModal}
        onClose={() => setShowCompareModal(false)}
      />
    </div>
  );
};
