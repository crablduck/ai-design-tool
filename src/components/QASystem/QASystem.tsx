import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle, Search, BookOpen, Clock, ThumbsUp, ThumbsDown, Copy, ExternalLink } from 'lucide-react';
import { QASession, KnowledgeEntry } from '../../types/document';

interface QASystemProps {
  knowledgeBase?: KnowledgeEntry[];
  onQuestionSubmit?: (question: string) => Promise<string>;
  onFeedback?: (sessionId: string, feedback: 'helpful' | 'not_helpful') => void;
}

const QASystem: React.FC<QASystemProps> = ({
  knowledgeBase = [],
  onQuestionSubmit,
  onFeedback
}) => {
  const [sessions, setSessions] = useState<QASession[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 模拟知识库数据
  const mockKnowledgeBase: KnowledgeEntry[] = [
    {
      id: '1',
      title: '什么是领域驱动设计（DDD）？',
      content: '领域驱动设计（Domain-Driven Design，DDD）是一种软件开发方法论，强调将业务领域的复杂性作为软件设计的核心。它通过建立丰富的领域模型来解决复杂业务问题，并使用统一语言来确保开发团队和业务专家之间的有效沟通。',
      category: 'domain-modeling',
      tags: ['DDD', '领域驱动设计', '软件架构'],

      source: 'Eric Evans - Domain-Driven Design',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '2',
      title: '聚合根的作用是什么？',
      content: '聚合根（Aggregate Root）是聚合的唯一入口点，负责维护聚合内部的一致性。它确保所有对聚合的修改都通过聚合根进行，从而保证业务规则的执行和数据的完整性。聚合根通常是聚合中最重要的实体。',
      category: 'domain-modeling',
      tags: ['聚合根', 'DDD', '实体'],

      source: 'DDD Reference',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '3',
      title: '如何设计用例图？',
      content: '用例图设计应该从识别系统的参与者（Actor）开始，然后确定每个参与者与系统的交互场景（Use Case）。设计时要注意：1）用例应该代表完整的业务价值；2）避免过于细粒度的用例；3）正确使用包含、扩展和泛化关系；4）保持用例的独立性。',
      category: 'requirements',
      tags: ['用例图', 'UML', '需求分析'],

      source: 'UML 2.0 Specification',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  const categories = [
    { id: 'all', name: '全部' },
    { id: 'domain-modeling', name: '领域建模' },
    { id: 'requirements', name: '需求分析' },
    { id: 'architecture', name: '软件架构' },
    { id: 'design-patterns', name: '设计模式' }
  ];

  // 常见问题
  const commonQuestions = [
    '什么是领域驱动设计？',
    '如何设计聚合根？',
    '用例图的最佳实践是什么？',
    '如何进行领域建模？',
    '什么是值对象？'
  ];

  useEffect(() => {
    scrollToBottom();
  }, [sessions]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmitQuestion = async () => {
    if (!currentQuestion.trim() || isLoading) return;

    const question = currentQuestion.trim();
    setCurrentQuestion('');
    setIsLoading(true);

    try {
      // 模拟AI回答
      const answer = await simulateAIResponse(question);
      
      const newSession: QASession = {
        id: Date.now().toString(),
        question,
        answer,
        confidence: 0.85,
        sources: ['知识库', 'AI推理'],
        timestamp: new Date()
      };

      setSessions(prev => [...prev, newSession]);
    } catch (error) {
      console.error('Failed to get answer:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const simulateAIResponse = async (question: string): Promise<string> => {
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    // 简单的关键词匹配
    const lowerQuestion = question.toLowerCase();
    
    if (lowerQuestion.includes('领域驱动') || lowerQuestion.includes('ddd')) {
      return '领域驱动设计（DDD）是一种以业务领域为核心的软件开发方法论。它强调通过深入理解业务领域，建立丰富的领域模型，并使用统一语言来确保技术团队和业务专家之间的有效沟通。DDD的核心概念包括实体、值对象、聚合、领域服务等。';
    }
    
    if (lowerQuestion.includes('聚合根') || lowerQuestion.includes('aggregate')) {
      return '聚合根是DDD中的重要概念，它是聚合的唯一入口点。聚合根负责：1）维护聚合内部的一致性；2）执行业务规则；3）控制对聚合内部对象的访问。设计聚合根时要注意保持聚合的边界清晰，避免聚合过大或过小。';
    }
    
    if (lowerQuestion.includes('用例图') || lowerQuestion.includes('use case')) {
      return '用例图是UML中用于描述系统功能需求的图表。设计用例图时应该：1）从用户角度出发，识别系统的参与者；2）确定每个参与者的目标和需求；3）将需求抽象为用例；4）建立用例之间的关系（包含、扩展、泛化）；5）保持用例的粒度适中，既不过于细节也不过于抽象。';
    }
    
    return '感谢您的问题。基于当前的知识库，我建议您查看相关的文档和资料，或者尝试重新表述您的问题以获得更准确的答案。如果您有具体的技术问题，请提供更多的上下文信息。';
  };

  const generateRelatedQuestions = (question: string): string[] => {
    const related = [
      '如何在实际项目中应用这个概念？',
      '有哪些常见的实现模式？',
      '需要注意哪些设计原则？'
    ];
    return related.slice(0, 2);
  };

  const handleFeedback = (sessionId: string, feedback: 'helpful' | 'not_helpful') => {
    setSessions(prev => prev.map(session => 
      session.id === sessionId 
        ? { ...session, feedback }
        : session
    ));
    onFeedback?.(sessionId, feedback);
  };

  const handleQuestionClick = (question: string) => {
    setCurrentQuestion(question);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const filteredKnowledge = mockKnowledgeBase.filter(entry => {
    const matchesSearch = entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || entry.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="h-full flex bg-white">
      {/* 左侧：对话区域 */}
      <div className="flex-1 flex flex-col">
        {/* 头部 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <MessageCircle className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">智能问答助手</h2>
          </div>
          <div className="text-sm text-gray-500">
            基于领域知识库的AI助手
          </div>
        </div>

        {/* 对话历史 */}
        <div className="flex-1 overflow-auto p-4 space-y-4">
          {sessions.length === 0 && (
            <div className="text-center py-12">
              <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">开始您的第一个问题</p>
              <p className="text-sm text-gray-400 mt-1">我可以帮助您解答关于软件设计和开发的问题</p>
              
              {/* 常见问题 */}
              <div className="mt-6">
                <p className="text-sm font-medium text-gray-700 mb-3">常见问题：</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {commonQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuestionClick(question)}
                      className="px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {sessions.map((session) => (
            <div key={session.id} className="space-y-4">
              {/* 用户问题 */}
              <div className="flex justify-end">
                <div className="max-w-3xl bg-blue-600 text-white rounded-lg px-4 py-3">
                  <p>{session.question}</p>
                  <div className="flex items-center justify-between mt-2 text-xs text-blue-100">
                    <span>{session.timestamp.toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>

              {/* AI回答 */}
              <div className="flex justify-start">
                <div className="max-w-3xl bg-gray-50 rounded-lg px-4 py-3">
                  <p className="text-gray-900 whitespace-pre-wrap">{session.answer}</p>
                  
                  {/* 置信度和来源 */}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>置信度: {Math.round(session.confidence * 100)}%</span>
                      <span>来源: {session.sources.join(', ')}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => copyToClipboard(session.answer)}
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                        title="复制回答"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleFeedback(session.id, 'helpful')}
                        className={`p-1 transition-colors ${
                          session.feedback === 'helpful' 
                            ? 'text-green-600' 
                            : 'text-gray-400 hover:text-green-600'
                        }`}
                        title="有帮助"
                      >
                        <ThumbsUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleFeedback(session.id, 'not_helpful')}
                        className={`p-1 transition-colors ${
                          session.feedback === 'not_helpful' 
                            ? 'text-red-600' 
                            : 'text-gray-400 hover:text-red-600'
                        }`}
                        title="没有帮助"
                      >
                        <ThumbsDown className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* 相关问题 */}
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs font-medium text-gray-700 mb-2">相关问题：</p>
                    <div className="flex flex-wrap gap-2">
                      {generateRelatedQuestions(session.question).map((relatedQ, index) => (
                        <button
                          key={index}
                          onClick={() => handleQuestionClick(relatedQ)}
                          className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors"
                        >
                          {relatedQ}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* 加载状态 */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-3xl bg-gray-50 rounded-lg px-4 py-3">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-gray-600">正在思考...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* 输入区域 */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex space-x-4">
            <div className="flex-1">
              <textarea
                value={currentQuestion}
                onChange={(e) => setCurrentQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmitQuestion();
                  }
                }}
                placeholder="请输入您的问题... (Shift+Enter 换行，Enter 发送)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
                disabled={isLoading}
              />
            </div>
            <button
              onClick={handleSubmitQuestion}
              disabled={!currentQuestion.trim() || isLoading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>发送</span>
            </button>
          </div>
        </div>
      </div>

      {/* 右侧：知识库 */}
      <div className="w-80 border-l border-gray-200 flex flex-col">
        {/* 知识库头部 */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2 mb-4">
            <BookOpen className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-gray-900">知识库</h3>
          </div>
          
          {/* 搜索 */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索知识库..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
          
          {/* 分类过滤 */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* 知识库条目 */}
        <div className="flex-1 overflow-auto p-4 space-y-3">
          {filteredKnowledge.map((entry) => (
            <div
              key={entry.id}
              className="p-3 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow cursor-pointer"
              onClick={() => handleQuestionClick(entry.title)}
            >
              <h4 className="font-medium text-gray-900 text-sm mb-2">{entry.title}</h4>
              <p className="text-xs text-gray-600 line-clamp-3">{entry.content}</p>
              
              <div className="flex items-center justify-between mt-2">
                <div className="flex flex-wrap gap-1">
                  {entry.tags.slice(0, 2).map(tag => (
                    <span
                      key={tag}
                      className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex items-center text-xs text-gray-400">
                  <Clock className="w-3 h-3 mr-1" />
                  <span>{entry.createdAt.toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
          
          {filteredKnowledge.length === 0 && (
            <div className="text-center py-8">
              <BookOpen className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">没有找到相关知识</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QASystem;