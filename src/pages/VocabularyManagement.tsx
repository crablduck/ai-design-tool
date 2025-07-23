import React, { useState, useEffect } from 'react';
import { BookOpen, Network, MessageCircle, Box, Grid, List } from 'lucide-react';
import VocabularyManager from '../components/VocabularyManager/VocabularyManager';
import VocabularyGraph from '../components/VocabularyManager/VocabularyGraph';
import QASystem from '../components/QASystem/QASystem';
import DomainModel3D from '../components/DomainModel3D/DomainModel3D';
import { VocabularyTerm, VocabularyRelationship, Entity3D, Relationship3D } from '../types/document';

type ViewMode = 'manager' | 'graph' | 'qa' | '3d';

const VocabularyManagement: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewMode>('manager');
  const [terms, setTerms] = useState<VocabularyTerm[]>([]);
  const [relationships, setRelationships] = useState<VocabularyRelationship[]>([]);
  const [selectedTermId, setSelectedTermId] = useState<string>();

  // 模拟数据
  useEffect(() => {
    const mockTerms: VocabularyTerm[] = [
      {
        id: '1',
        name: '聚合根',
        definition: '聚合的根实体，是聚合的唯一入口点，负责维护聚合的一致性',
        category: 'domain',
        aliases: ['Aggregate Root', 'AR'],
        synonyms: ['聚合根实体', '根实体'],
        relatedTerms: ['2', '3'],
        examples: ['用户聚合的User实体', '订单聚合的Order实体'],
        tags: ['DDD', '领域驱动设计', '实体'],
        classNamingReference: {
          suggestedClassName: 'AggregateRoot',
          namingConvention: 'PascalCase',
          codeExamples: ['class UserAggregateRoot', 'class OrderAggregateRoot']
        },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        name: '值对象',
        definition: '没有唯一标识的不可变对象，通过属性值来区分',
        category: 'domain',
        aliases: ['Value Object', 'VO'],
        synonyms: ['值对象', '不可变对象'],
        relatedTerms: ['1', '3'],
        examples: ['金额对象Money', '地址对象Address'],
        tags: ['DDD', '不可变', '值类型'],
        classNamingReference: {
          suggestedClassName: 'ValueObject',
          namingConvention: 'PascalCase',
          codeExamples: ['class Money', 'class Address']
        },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '3',
        name: '领域服务',
        definition: '封装不属于任何实体或值对象的业务逻辑',
        category: 'domain',
        aliases: ['Domain Service'],
        synonyms: ['领域服务', '业务服务'],
        relatedTerms: ['1', '2'],
        examples: ['转账服务TransferService', '定价服务PricingService'],
        tags: ['DDD', '服务', '业务逻辑'],
        classNamingReference: {
          suggestedClassName: 'DomainService',
          namingConvention: 'PascalCase',
          codeExamples: ['class TransferService', 'class PricingService']
        },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '4',
        name: '实体',
        definition: '具有唯一标识的领域对象，其标识在整个生命周期中保持不变',
        category: 'domain',
        aliases: ['Entity'],
        synonyms: ['实体对象', '领域实体'],
        relatedTerms: ['1', '2'],
        examples: ['用户User', '订单Order', '产品Product'],
        tags: ['DDD', '实体', '标识'],
        classNamingReference: {
          suggestedClassName: 'Entity',
          namingConvention: 'PascalCase',
          codeExamples: ['class User', 'class Order']
        },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '5',
        name: '仓储',
        definition: '封装访问领域对象的逻辑，提供类似集合的接口',
        category: 'domain',
        aliases: ['Repository'],
        synonyms: ['仓储模式', '数据仓储'],
        relatedTerms: ['1', '4'],
        examples: ['用户仓储UserRepository', '订单仓储OrderRepository'],
        tags: ['DDD', '仓储', '数据访问'],
        classNamingReference: {
          suggestedClassName: 'Repository',
          namingConvention: 'PascalCase',
          codeExamples: ['class UserRepository', 'class OrderRepository']
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    const mockRelationships: VocabularyRelationship[] = [
      {
        id: 'rel1',
        sourceTermId: '1',
        targetTermId: '4',
        relationshipType: 'parent',
        createdAt: new Date()
      },
      {
        id: 'rel2',
        sourceTermId: '1',
        targetTermId: '2',
        relationshipType: 'related',
        createdAt: new Date()
      },
      {
        id: 'rel3',
        sourceTermId: '3',
        targetTermId: '1',
        relationshipType: 'related',
        createdAt: new Date()
      },
      {
        id: 'rel4',
        sourceTermId: '5',
        targetTermId: '1',
        relationshipType: 'related',
        createdAt: new Date()
      },
      {
        id: 'rel5',
        sourceTermId: '2',
        targetTermId: '4',
        relationshipType: 'related',
        createdAt: new Date()
      }
    ];

    setTerms(mockTerms);
    setRelationships(mockRelationships);
  }, []);

  // 生成3D实体数据
  const generate3DEntities = (): Entity3D[] => {
    return terms.map((term, index) => {
      const angle = (index / terms.length) * Math.PI * 2;
      const radius = 5;
      return {
        id: term.id,
        name: term.name,
        position: {
          x: Math.cos(angle) * radius,
          y: 0,
          z: Math.sin(angle) * radius
        },
        scale: { x: 1, y: 1, z: 1 },
        rotation: { x: 0, y: 0, z: 0 },
        color: getColorByCategory(term.category),
        geometry: getShapeByCategory(term.category).replace('3d-', '') as 'box' | 'sphere' | 'cylinder' | 'pyramid',
        metadata: {
          definition: term.definition,
          category: term.category,
          aliases: term.aliases,
          synonyms: term.synonyms,
          examples: term.examples,
          tags: term.tags
        }
      };
    });
  };

  // 生成3D关系数据
  const generate3DRelationships = (): Relationship3D[] => {
    return relationships.map(rel => ({
      id: rel.id,
      sourceEntityId: rel.sourceTermId,
      targetEntityId: rel.targetTermId,
      relationshipType: rel.relationshipType,
      points: [], // 简化处理，使用直线
      color: getRelationshipColor(rel.relationshipType),
      style: 'solid' as const
    }));
  };

  const getColorByCategory = (category: string): string => {
    const colors = {
      domain: '#3B82F6',
      business: '#10B981',
      technical: '#F59E0B',
      default: '#6B7280'
    };
    return colors[category as keyof typeof colors] || colors.default;
  };

  const getShapeByCategory = (category: string): '3d-box' | '3d-sphere' | '3d-cylinder' | '3d-pyramid' => {
    const shapes = {
      domain: '3d-box' as const,
      business: '3d-sphere' as const,
      technical: '3d-cylinder' as const,
      default: '3d-pyramid' as const
    };
    return shapes[category as keyof typeof shapes] || shapes.default;
  };

  const getRelationshipColor = (type: string): string => {
    const colors = {
      synonym: '#10B981',
      antonym: '#EF4444',
      hypernym: '#3B82F6',
      hyponym: '#8B5CF6',
      related: '#6B7280',
      composition: '#F59E0B',
      dependency: '#EC4899'
    };
    return colors[type as keyof typeof colors] || '#6B7280';
  };

  const handleTermSelect = (term: VocabularyTerm) => {
    setSelectedTermId(term.id);
  };

  const handleTermCreate = (term: Partial<VocabularyTerm>) => {
    const newTerm: VocabularyTerm = {
      id: Date.now().toString(),
      name: term.name || '',
      definition: term.definition || '',
      category: term.category || 'domain',
      aliases: term.aliases || [],
      synonyms: term.synonyms || [],
      relatedTerms: term.relatedTerms || [],
      examples: term.examples || [],
      tags: term.tags || [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setTerms(prev => [...prev, newTerm]);
  };

  const handleTermUpdate = (updatedTerm: VocabularyTerm) => {
    setTerms(prev => prev.map(term => 
      term.id === updatedTerm.id ? updatedTerm : term
    ));
  };

  const handleTermDelete = (termId: string) => {
    setTerms(prev => prev.filter(term => term.id !== termId));
    setRelationships(prev => prev.filter(rel => 
      rel.sourceTermId !== termId && rel.targetTermId !== termId
    ));
  };

  const handleQuestionSubmit = async (question: string): Promise<string> => {
    // 模拟AI回答，基于词汇库
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const lowerQuestion = question.toLowerCase();
    const matchedTerm = terms.find(term => 
      lowerQuestion.includes(term.name.toLowerCase()) ||
      term.aliases.some(alias => lowerQuestion.includes(alias.toLowerCase()))
    );
    
    if (matchedTerm) {
      return `根据领域词汇库，${matchedTerm.name}的定义是：${matchedTerm.definition}\n\n相关示例：${matchedTerm.examples.join('、')}\n\n建议的类命名：${matchedTerm.classNamingReference?.suggestedClassName || '暂无'}`;
    }
    
    return '抱歉，我在当前的领域词汇库中没有找到相关信息。请尝试添加相关术语到词汇库中，或者重新表述您的问题。';
  };

  const viewModes = [
    { id: 'manager', name: '词汇管理', icon: List, description: '管理领域术语' },
    { id: 'graph', name: '关系图谱', icon: Network, description: '可视化术语关系' },
    { id: 'qa', name: '智能问答', icon: MessageCircle, description: '基于词汇库的问答' },
    { id: '3d', name: '3D可视化', icon: Box, description: '3D领域模型' }
  ];

  const renderCurrentView = () => {
    switch (currentView) {
      case 'manager':
        return (
          <VocabularyManager
            onTermSelect={handleTermSelect}
            onTermCreate={handleTermCreate}
            onTermUpdate={handleTermUpdate}
            onTermDelete={handleTermDelete}
          />
        );
      case 'graph':
        return (
          <VocabularyGraph
            terms={terms}
            relationships={relationships}
            selectedTermId={selectedTermId}
            onTermSelect={setSelectedTermId}
          />
        );
      case 'qa':
        return (
          <QASystem
            onQuestionSubmit={handleQuestionSubmit}
          />
        );
      case '3d':
        return (
          <DomainModel3D
            entities={generate3DEntities()}
            relationships={generate3DRelationships()}
            onEntityClick={setSelectedTermId}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* 页面头部 */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <BookOpen className="w-6 h-6 text-blue-600" />
            <div>
              <h1 className="text-xl font-semibold text-gray-900">领域词汇管理系统</h1>
              <p className="text-sm text-gray-600">管理和可视化领域术语，支持AI增强的智能问答</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span>术语总数: {terms.length}</span>
            <span className="text-gray-300">|</span>
            <span>关系总数: {relationships.length}</span>
          </div>
        </div>
      </div>

      {/* 视图切换标签 */}
      <div className="bg-white border-b border-gray-200 px-6">
        <div className="flex space-x-8">
          {viewModes.map(mode => {
            const Icon = mode.icon;
            return (
              <button
                key={mode.id}
                onClick={() => setCurrentView(mode.id as ViewMode)}
                className={`flex items-center space-x-2 py-4 border-b-2 transition-colors ${
                  currentView === mode.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium">{mode.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 当前视图描述 */}
      <div className="bg-blue-50 border-b border-blue-200 px-6 py-2">
        <p className="text-sm text-blue-700">
          {viewModes.find(mode => mode.id === currentView)?.description}
        </p>
      </div>

      {/* 主要内容区域 */}
      <div className="flex-1 overflow-hidden">
        {renderCurrentView()}
      </div>
    </div>
  );
};

export default VocabularyManagement;