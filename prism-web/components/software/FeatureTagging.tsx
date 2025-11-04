'use client';

import React, { useState, useEffect } from 'react';
import { Tag, Plus, X, Search, Folder } from 'lucide-react';

interface Feature {
  id: string;
  feature_name: string;
  feature_category_id: string | null;
  category_name: string | null;
  category_description: string | null;
  icon: string | null;
}

interface Category {
  id: string;
  category_name: string;
  description: string | null;
  icon: string | null;
}

interface FeatureTaggingProps {
  softwareId: string;
  softwareName: string;
  onFeaturesUpdated?: () => void;
}

export default function FeatureTagging({
  softwareId,
  softwareName,
  onFeaturesUpdated
}: FeatureTaggingProps) {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  const [newFeatureName, setNewFeatureName] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadFeatures();
  }, [softwareId]);

  const loadFeatures = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/software/${softwareId}/features`);
      const result = await res.json();

      if (result.success) {
        setFeatures(result.data.features || []);
        setCategories(result.data.categories || []);
      }
    } catch (error) {
      console.error('Failed to load features:', error);
    } finally {
      setLoading(false);
    }
  };

  const addFeature = async () => {
    if (!newFeatureName.trim()) return;

    try {
      setAdding(true);
      const res = await fetch(`/api/software/${softwareId}/features`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          features: [{
            feature_name: newFeatureName.trim(),
            feature_category_id: selectedCategoryId || null
          }]
        })
      });

      const result = await res.json();
      if (result.success) {
        setNewFeatureName('');
        setSelectedCategoryId('');
        await loadFeatures();
        onFeaturesUpdated?.();
      }
    } catch (error) {
      console.error('Failed to add feature:', error);
    } finally {
      setAdding(false);
    }
  };

  const removeFeature = async (featureId: string) => {
    try {
      const res = await fetch(
        `/api/software/${softwareId}/features?featureId=${featureId}`,
        { method: 'DELETE' }
      );

      const result = await res.json();
      if (result.success) {
        await loadFeatures();
        onFeaturesUpdated?.();
      }
    } catch (error) {
      console.error('Failed to remove feature:', error);
    }
  };

  const filteredFeatures = features.filter(f =>
    f.feature_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (f.category_name && f.category_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Group features by category
  const featuresByCategory = filteredFeatures.reduce((acc, feature) => {
    const categoryKey = feature.category_name || 'Uncategorized';
    if (!acc[categoryKey]) {
      acc[categoryKey] = [];
    }
    acc[categoryKey].push(feature);
    return acc;
  }, {} as Record<string, Feature[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Tag className="w-5 h-5 text-blue-400" />
            Feature Tags
          </h3>
          <p className="text-sm text-gray-400 mt-1">
            {softwareName} • {features.length} feature{features.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Add Feature Form */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
        <h4 className="text-sm font-medium text-white mb-3">Add New Feature</h4>
        <div className="flex gap-2">
          <input
            type="text"
            value={newFeatureName}
            onChange={(e) => setNewFeatureName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addFeature()}
            placeholder="Feature name (e.g., Dashboard, Reporting, API Access)"
            className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
            disabled={adding}
          />
          <select
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
            disabled={adding}
          >
            <option value="">No Category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.icon} {cat.category_name}
              </option>
            ))}
          </select>
          <button
            onClick={addFeature}
            disabled={!newFeatureName.trim() || adding}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>
      </div>

      {/* Search */}
      {features.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search features..."
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
          />
        </div>
      )}

      {/* Features List */}
      {features.length === 0 ? (
        <div className="text-center py-8">
          <Tag className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">No features tagged yet</p>
          <p className="text-gray-500 text-xs mt-1">
            Add features to improve redundancy analysis accuracy
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(featuresByCategory).map(([categoryName, categoryFeatures]) => (
            <div key={categoryName} className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Folder className="w-4 h-4 text-blue-400" />
                <h4 className="text-sm font-medium text-white">{categoryName}</h4>
                <span className="text-xs text-gray-500">
                  ({categoryFeatures.length})
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {categoryFeatures.map((feature) => (
                  <div
                    key={feature.id}
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/20 border border-blue-500/30 rounded-full text-sm text-blue-300 group hover:bg-blue-500/30 transition-colors"
                  >
                    <span>{feature.feature_name}</span>
                    <button
                      onClick={() => removeFeature(feature.id)}
                      className="opacity-0 group-hover:opacity-100 hover:text-red-400 transition-all"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Help Text */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
        <p className="text-xs text-blue-300">
          💡 <strong>Tip:</strong> Add features that your team actively uses.
          More accurate feature tags lead to better redundancy detection and cost savings recommendations.
        </p>
      </div>
    </div>
  );
}
