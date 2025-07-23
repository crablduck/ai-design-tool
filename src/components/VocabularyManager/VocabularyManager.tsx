import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, BookOpen, Tag, Link, Edit, Trash2 } from 'lucide-react';
import { VocabularyTerm, VocabularyCategory, VocabularyRelationship } from '../../types/document';

interface VocabularyManagerProps {
  onTermSelect?: (term: VocabularyTerm) => void;
  onTermCreate?: (term: Partial<VocabularyTerm>) => void;
  onTermUpdate?: (term: VocabularyTerm) => void;
  onTermDelete?: (termId: string) => void;
}

const VocabularyManager: React.FC<VocabularyManagerProps> = ({
  onTermSelect,
  onTermCreate,
  onTermUpdate,
  onTermDelete
}) => {
  const [terms, setTerms] = useState<VocabularyTerm[]>([]);
  const [categories, setCategories] = useState<VocabularyCategory[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTerm, setEditingTerm] = useState<VocabularyTerm | null>(null);

  // 模拟数据
  useEffect(() => {
    const mockCategories: VocabularyCategory[] = [
      {
        id: 'business',
        name: '业务概念',
        description: '核心业务领域概念',
        color: '#3B82F6',
        icon: 'briefcase'
      },
      {
        id: 'technical',
        name: '技术概念',
        description: '技术实现相关概念',
        color: '#10B981',
        icon: 'code'
      },
      {
        id: 'domain',
        name: '领域模型',
        description: '领域驱动设计概念',
        color: '#F59E0B',
        icon: 'layers'
      }
    ];

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
        relatedTerms: ['1'],
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
        relatedTerms: ['1'],
        examples: ['转账服务TransferService', '定价服务PricingService'],
        tags: ['DDD', '服务', '业务逻辑'],
        classNamingReference: {
          suggestedClassName: 'DomainService',
          namingConvention: 'PascalCase',
          codeExamples: ['class TransferService', 'class PricingService']
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    setCategories(mockCategories);
    setTerms(mockTerms);
  }, []);

  const filteredTerms = terms.filter(term => {
    const matchesSearch = term.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         term.definition.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         term.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || term.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCreateTerm = () => {
    setIsCreateModalOpen(true);
  };

  const handleEditTerm = (term: VocabularyTerm) => {
    setEditingTerm(term);
  };

  const handleDeleteTerm = (termId: string) => {
    if (window.confirm('确定要删除这个术语吗？')) {
      setTerms(prev => prev.filter(t => t.id !== termId));
      onTermDelete?.(termId);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* 头部工具栏 */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <BookOpen className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">领域词汇管理</h2>
        </div>
        <button
          onClick={handleCreateTerm}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>新增术语</span>
        </button>
      </div>

      {/* 搜索和过滤 */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索术语、定义或标签..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">所有分类</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 术语列表 */}
      <div className="flex-1 overflow-auto p-4">
        <div className="grid gap-4">
          {filteredTerms.map(term => {
            const category = categories.find(c => c.id === term.category);
            return (
              <div
                key={term.id}
                className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => onTermSelect?.(term)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{term.name}</h3>
                      {category && (
                        <span
                          className="px-2 py-1 text-xs font-medium rounded-full text-white"
                          style={{ backgroundColor: category.color }}
                        >
                          {category.name}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 mb-3">{term.definition}</p>
                    
                    {term.aliases.length > 0 && (
                      <div className="mb-2">
                        <span className="text-sm font-medium text-gray-500">别名：</span>
                        <span className="text-sm text-gray-600">{term.aliases.join(', ')}</span>
                      </div>
                    )}
                    
                    {term.classNamingReference && (
                      <div className="mb-2">
                        <span className="text-sm font-medium text-gray-500">建议类名：</span>
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded ml-1">
                          {term.classNamingReference.suggestedClassName}
                        </code>
                      </div>
                    )}
                    
                    <div className="flex flex-wrap gap-1">
                      {term.tags.map(tag => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full"
                        >
                          <Tag className="w-3 h-3 mr-1" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditTerm(term);
                      }}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTerm(term.id);
                      }}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {filteredTerms.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">没有找到匹配的术语</p>
            <p className="text-sm text-gray-400 mt-1">尝试调整搜索条件或创建新的术语</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VocabularyManager;