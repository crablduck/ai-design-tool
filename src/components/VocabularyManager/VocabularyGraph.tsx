import React, { useEffect, useRef, useState } from 'react';
import { VocabularyTerm, VocabularyRelationship } from '../../types/document';
import { Network, DataSet, Node, Edge } from 'vis-network/standalone';
import { Maximize2, Minimize2, RotateCcw, Settings } from 'lucide-react';

interface VocabularyGraphProps {
  terms: VocabularyTerm[];
  relationships: VocabularyRelationship[];
  selectedTermId?: string;
  onTermSelect?: (termId: string) => void;
  onRelationshipCreate?: (sourceId: string, targetId: string, type: string) => void;
}

const VocabularyGraph: React.FC<VocabularyGraphProps> = ({
  terms,
  relationships,
  selectedTermId,
  onTermSelect,
  onRelationshipCreate
}) => {
  const networkRef = useRef<HTMLDivElement>(null);
  const networkInstance = useRef<Network | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [layoutOptions, setLayoutOptions] = useState({
    physics: true,
    hierarchical: false,
    clustering: false
  });

  // 关系类型颜色映射
  const relationshipColors = {
    synonym: '#10B981',
    antonym: '#EF4444',
    hypernym: '#3B82F6',
    hyponym: '#8B5CF6',
    related: '#6B7280',
    composition: '#F59E0B',
    dependency: '#EC4899'
  };

  // 分类颜色映射
  const categoryColors = {
    business: '#3B82F6',
    technical: '#10B981',
    domain: '#F59E0B',
    default: '#6B7280'
  };

  useEffect(() => {
    if (!networkRef.current) return;

    // 准备节点数据
    const nodes = new DataSet<Node>(terms.map(term => ({
      id: term.id,
      label: term.name,
      title: `${term.name}\n${term.definition}`,
      color: {
        background: categoryColors[term.category as keyof typeof categoryColors] || categoryColors.default,
        border: selectedTermId === term.id ? '#000000' : '#ffffff',
        highlight: {
          background: categoryColors[term.category as keyof typeof categoryColors] || categoryColors.default,
          border: '#000000'
        }
      },
      borderWidth: selectedTermId === term.id ? 3 : 1,
      font: {
        color: '#ffffff',
        size: 14,
        face: 'Arial'
      },
      shape: 'box',
      margin: 10,
      widthConstraint: {
        minimum: 100,
        maximum: 200
      }
    })));

    // 准备边数据
    const edges = new DataSet<Edge>(relationships.map(rel => ({
      id: rel.id,
      from: rel.sourceTermId,
      to: rel.targetTermId,
      label: rel.relationshipType,
      color: {
        color: relationshipColors[rel.relationshipType as keyof typeof relationshipColors] || '#6B7280',
        highlight: '#000000'
      },
      width: 2,
      arrows: 'to',
      font: {
        size: 12,
        color: '#374151',
        strokeWidth: 2,
        strokeColor: '#ffffff'
      },
      smooth: {
        type: 'curvedCW',
        roundness: 0.2
      }
    })));

    // 网络配置
    const options = {
      nodes: {
        shape: 'box',
        margin: {
          top: 10,
          right: 10,
          bottom: 10,
          left: 10
        },
        widthConstraint: {
          minimum: 100,
          maximum: 200
        },
        heightConstraint: {
          minimum: 50
        }
      },
      edges: {
        smooth: {
          enabled: true,
          type: 'curvedCW',
          roundness: 0.2
        },
        font: {
          size: 12,
          strokeWidth: 2,
          strokeColor: '#ffffff'
        }
      },
      physics: {
        enabled: layoutOptions.physics,
        stabilization: { iterations: 100 },
        barnesHut: {
          gravitationalConstant: -2000,
          centralGravity: 0.3,
          springLength: 95,
          springConstant: 0.04,
          damping: 0.09
        }
      },
      layout: layoutOptions.hierarchical ? {
        hierarchical: {
          direction: 'UD',
          sortMethod: 'directed',
          shakeTowards: 'roots'
        }
      } : undefined,
      interaction: {
        hover: true,
        selectConnectedEdges: false,
        tooltipDelay: 200
      }
    };

    // 创建网络
    networkInstance.current = new Network(networkRef.current, { nodes, edges }, options);

    // 事件监听
    networkInstance.current.on('click', (params) => {
      if (params.nodes.length > 0) {
        const nodeId = params.nodes[0] as string;
        onTermSelect?.(nodeId);
      }
    });

    networkInstance.current.on('doubleClick', (params) => {
      if (params.nodes.length > 0) {
        networkInstance.current?.focus(params.nodes[0], {
          scale: 1.5,
          animation: {
            duration: 1000,
            easingFunction: 'easeInOutQuad'
          }
        });
      }
    });

    return () => {
      if (networkInstance.current) {
        networkInstance.current.destroy();
        networkInstance.current = null;
      }
    };
  }, [terms, relationships, selectedTermId, layoutOptions]);

  const handleReset = () => {
    if (networkInstance.current) {
      networkInstance.current.fit({
        animation: {
          duration: 1000,
          easingFunction: 'easeInOutQuad'
        }
      });
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const updateLayout = (option: string, value: boolean) => {
    setLayoutOptions(prev => ({
      ...prev,
      [option]: value
    }));
  };

  return (
    <div className={`relative bg-white border border-gray-200 rounded-lg ${isFullscreen ? 'fixed inset-0 z-50' : 'h-96'}`}>
      {/* 工具栏 */}
      <div className="absolute top-4 right-4 z-10 flex items-center space-x-2">
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
          title="设置"
        >
          <Settings className="w-4 h-4 text-gray-600" />
        </button>
        <button
          onClick={handleReset}
          className="p-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
          title="重置视图"
        >
          <RotateCcw className="w-4 h-4 text-gray-600" />
        </button>
        <button
          onClick={toggleFullscreen}
          className="p-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
          title={isFullscreen ? '退出全屏' : '全屏显示'}
        >
          {isFullscreen ? (
            <Minimize2 className="w-4 h-4 text-gray-600" />
          ) : (
            <Maximize2 className="w-4 h-4 text-gray-600" />
          )}
        </button>
      </div>

      {/* 设置面板 */}
      {showSettings && (
        <div className="absolute top-16 right-4 z-10 bg-white border border-gray-300 rounded-lg shadow-lg p-4 w-64">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">布局设置</h3>
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={layoutOptions.physics}
                onChange={(e) => updateLayout('physics', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">启用物理引擎</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={layoutOptions.hierarchical}
                onChange={(e) => updateLayout('hierarchical', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">层次布局</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={layoutOptions.clustering}
                onChange={(e) => updateLayout('clustering', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">节点聚类</span>
            </label>
          </div>
        </div>
      )}

      {/* 图例 */}
      <div className="absolute bottom-4 left-4 z-10 bg-white border border-gray-300 rounded-lg shadow-sm p-3">
        <h4 className="text-xs font-semibold text-gray-900 mb-2">关系类型</h4>
        <div className="space-y-1">
          {Object.entries(relationshipColors).map(([type, color]) => (
            <div key={type} className="flex items-center space-x-2">
              <div
                className="w-3 h-0.5 rounded"
                style={{ backgroundColor: color }}
              />
              <span className="text-xs text-gray-600">{type}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 网络图容器 */}
      <div
        ref={networkRef}
        className="w-full h-full rounded-lg"
        style={{ minHeight: isFullscreen ? '100vh' : '384px' }}
      />

      {/* 空状态 */}
      {terms.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Settings className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">暂无词汇数据</p>
            <p className="text-sm text-gray-400 mt-1">添加术语后将显示关系图谱</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VocabularyGraph;