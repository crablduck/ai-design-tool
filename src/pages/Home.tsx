import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Space,
  Statistic,
  Progress,
  List,
  Avatar,
  Tag,
  Timeline,
  Divider,
  Alert,
  Tooltip,
  Badge,
  Spin,
} from 'antd';
import {
  PlusOutlined,
  FileTextOutlined,
  TeamOutlined,
  CodeOutlined,
  BarChartOutlined,
  RocketOutlined,
  BulbOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  TrophyOutlined,
  FireOutlined,
  ThunderboltOutlined,
  SyncOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  EyeOutlined,
  SettingOutlined,
  UserOutlined,
  BookOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { learningPathManager } from '../knowledge/LearningPathManager';

const { Title, Paragraph, Text } = Typography;

interface ProjectStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalDocuments: number;
  teamMembers: number;
  codeAnalysis: number;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  color: string;
}

interface RecentActivity {
  id: string;
  type: 'project' | 'document' | 'analysis' | 'collaboration';
  title: string;
  description: string;
  timestamp: string;
  user: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  progress: number;
  total: number;
  unlocked: boolean;
}

export default function Home() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<ProjectStats>({
    totalProjects: 12,
    activeProjects: 8,
    completedProjects: 4,
    totalDocuments: 156,
    teamMembers: 24,
    codeAnalysis: 89,
  });
  const [statsHistory, setStatsHistory] = useState<{
    totalProjects: { value: number; trend: 'up' | 'down' | 'stable' };
    activeProjects: { value: number; trend: 'up' | 'down' | 'stable' };
    completedProjects: { value: number; trend: 'up' | 'down' | 'stable' };
    totalDocuments: { value: number; trend: 'up' | 'down' | 'stable' };
  }>({
    totalProjects: { value: 12, trend: 'up' },
    activeProjects: { value: 8, trend: 'stable' },
    completedProjects: { value: 4, trend: 'up' },
    totalDocuments: { value: 156, trend: 'up' },
  });

  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([
    {
      id: '1',
      type: 'project',
      title: '电商平台项目',
      description: '创建了新的用例图设计',
      timestamp: '2小时前',
      user: '张三',
    },
    {
      id: '2',
      type: 'document',
      title: 'API接口文档',
      description: '生成了完整的接口规范文档',
      timestamp: '4小时前',
      user: '李四',
    },
    {
      id: '3',
      type: 'analysis',
      title: '代码质量分析',
      description: '完成了前端代码的质量评估',
      timestamp: '6小时前',
      user: '王五',
    },
    {
      id: '4',
      type: 'collaboration',
      title: '团队协作',
      description: '邀请了3名新成员加入项目',
      timestamp: '1天前',
      user: '赵六',
    },
  ]);

  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: '1',
      title: '文档大师',
      description: '生成100份技术文档',
      icon: <FileTextOutlined />,
      progress: 78,
      total: 100,
      unlocked: false,
    },
    {
      id: '2',
      title: '团队领袖',
      description: '管理10个活跃项目',
      icon: <TeamOutlined />,
      progress: 8,
      total: 10,
      unlocked: false,
    },
    {
      id: '3',
      title: '代码专家',
      description: '完成50次代码分析',
      icon: <CodeOutlined />,
      progress: 50,
      total: 50,
      unlocked: true,
    },
  ]);

  const quickActions: QuickAction[] = [
    {
      id: '1',
      title: '创建新项目',
      description: '开始一个全新的软件项目',
      icon: <PlusOutlined />,
      path: '/project/create',
      color: '#1890ff',
    },
    {
      id: '2',
      title: '生成文档',
      description: '基于项目自动生成技术文档',
      icon: <FileTextOutlined />,
      path: '/document/generate',
      color: '#52c41a',
    },
    {
      id: '3',
      title: '代码分析',
      description: '分析代码结构和质量',
      icon: <CodeOutlined />,
      path: '/code/analysis',
      color: '#fa8c16',
    },
    {
      id: '4',
      title: '核心资产',
      description: '管理用例图、领域模型等',
      icon: <BulbOutlined />,
      path: '/core/assets',
      color: '#eb2f96',
    },
    {
      id: '5',
      title: '知识库',
      description: '浏览技术知识和最佳实践',
      icon: <BarChartOutlined />,
      path: '/knowledge/base',
      color: '#722ed1',
    },
    {
      id: '6',
      title: '团队协作',
      description: '与团队成员协同工作',
      icon: <TeamOutlined />,
      path: '/project/collaboration',
      color: '#13c2c2',
    },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'project':
        return <RocketOutlined style={{ color: '#1890ff' }} />;
      case 'document':
        return <FileTextOutlined style={{ color: '#52c41a' }} />;
      case 'analysis':
        return <BarChartOutlined style={{ color: '#fa8c16' }} />;
      case 'collaboration':
        return <TeamOutlined style={{ color: '#eb2f96' }} />;
      default:
        return <ClockCircleOutlined />;
    }
  };

  const handleQuickAction = (path: string) => {
    navigate(path);
  };

  const refreshData = async () => {
    setRefreshing(true);
    try {
      // 模拟数据刷新
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 更新统计数据（模拟实时数据）
      const newStats = {
        totalProjects: stats.totalProjects + Math.floor(Math.random() * 3),
        activeProjects: Math.max(1, stats.activeProjects + Math.floor(Math.random() * 3) - 1),
        completedProjects: stats.completedProjects + Math.floor(Math.random() * 2),
        totalDocuments: stats.totalDocuments + Math.floor(Math.random() * 10),
        teamMembers: stats.teamMembers + Math.floor(Math.random() * 2),
        codeAnalysis: Math.min(100, stats.codeAnalysis + Math.floor(Math.random() * 5)),
      };
      
      setStats(newStats);
      
      // 更新趋势数据
      setStatsHistory(prev => ({
        totalProjects: { 
          value: newStats.totalProjects, 
          trend: newStats.totalProjects > prev.totalProjects.value ? 'up' : 
                 newStats.totalProjects < prev.totalProjects.value ? 'down' : 'stable'
        },
        activeProjects: { 
          value: newStats.activeProjects, 
          trend: newStats.activeProjects > prev.activeProjects.value ? 'up' : 
                 newStats.activeProjects < prev.activeProjects.value ? 'down' : 'stable'
        },
        completedProjects: { 
          value: newStats.completedProjects, 
          trend: newStats.completedProjects > prev.completedProjects.value ? 'up' : 
                 newStats.completedProjects < prev.completedProjects.value ? 'down' : 'stable'
        },
        totalDocuments: { 
          value: newStats.totalDocuments, 
          trend: newStats.totalDocuments > prev.totalDocuments.value ? 'up' : 
                 newStats.totalDocuments < prev.totalDocuments.value ? 'down' : 'stable'
        },
      }));
      
      // 刷新最近活动
      const newActivity = {
        id: Date.now().toString(),
        type: 'project' as const,
        title: '新项目创建',
        description: '系统自动创建了新的项目模板',
        timestamp: '刚刚',
        user: '系统',
      };
      
      setRecentActivities(prev => [newActivity, ...prev.slice(0, 3)]);
      
    } catch (error) {
      console.error('刷新数据失败:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const loadInitialData = async () => {
    setLoading(true);
    try {
      // 集成学习路径管理器数据
      const pathStats = learningPathManager.getPathStats();
      const popularTags = learningPathManager.getPopularTags(5);
      
      // 模拟加载延迟
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // 更新成就数据，集成真实学习路径数据
      setAchievements(prev => prev.map(achievement => {
        if (achievement.id === '2') {
          return {
            ...achievement,
            progress: pathStats.totalPaths || achievement.progress,
            total: 15, // 更新目标
          };
        }
        return achievement;
      }));
      
    } catch (error) {
      console.error('加载初始数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* 欢迎横幅 */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <Title level={2} className="mb-2">
              <FireOutlined className="mr-2" style={{ color: '#fa541c' }} />
              欢迎回来！
            </Title>
            <Paragraph className="text-gray-600 text-lg">
              智能软件分析设计工具助您高效开发，让创意变为现实
            </Paragraph>
          </div>
          <div className="flex items-center space-x-3">
            <Tooltip title="刷新数据">
              <Button 
                icon={refreshing ? <SyncOutlined spin /> : <SyncOutlined />} 
                onClick={refreshData}
                loading={refreshing}
                type="text"
                className="flex items-center"
              >
                刷新
              </Button>
            </Tooltip>
            <Tooltip title="系统设置">
              <Button icon={<SettingOutlined />} type="text" />
            </Tooltip>
          </div>
        </div>
        
        {/* 实时状态指示器 */}
        <div className="mt-4 flex items-center space-x-4">
          <Badge status="processing" text="系统运行正常" />
          <Badge status="success" text="数据同步完成" />
          <span className="text-xs text-gray-500">最后更新: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* 统计概览 */}
      <Spin spinning={loading} tip="加载数据中...">
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={12} md={8} lg={4}>
            <Card hoverable className="transition-all duration-200 hover:shadow-lg">
              <Statistic
                title={
                  <div className="flex items-center justify-between">
                    <span>总项目数</span>
                    {statsHistory.totalProjects.trend === 'up' && <ArrowUpOutlined className="text-green-500" />}
                    {statsHistory.totalProjects.trend === 'down' && <ArrowDownOutlined className="text-red-500" />}
                  </div>
                }
                value={stats.totalProjects}
                prefix={<RocketOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
              <div className="mt-2 text-xs text-gray-500">
                较上次 {statsHistory.totalProjects.trend === 'up' ? '+' : statsHistory.totalProjects.trend === 'down' ? '-' : ''}1
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={4}>
            <Card hoverable className="transition-all duration-200 hover:shadow-lg">
              <Statistic
                title={
                  <div className="flex items-center justify-between">
                    <span>活跃项目</span>
                    {statsHistory.activeProjects.trend === 'up' && <ArrowUpOutlined className="text-green-500" />}
                    {statsHistory.activeProjects.trend === 'down' && <ArrowDownOutlined className="text-red-500" />}
                  </div>
                }
                value={stats.activeProjects}
                prefix={<ThunderboltOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
              <div className="mt-2 text-xs text-gray-500">
                活跃度 {Math.round((stats.activeProjects / stats.totalProjects) * 100)}%
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={4}>
            <Card hoverable className="transition-all duration-200 hover:shadow-lg">
              <Statistic
                title={
                  <div className="flex items-center justify-between">
                    <span>已完成项目</span>
                    {statsHistory.completedProjects.trend === 'up' && <ArrowUpOutlined className="text-green-500" />}
                    {statsHistory.completedProjects.trend === 'down' && <ArrowDownOutlined className="text-red-500" />}
                  </div>
                }
                value={stats.completedProjects}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#fa8c16' }}
              />
              <div className="mt-2 text-xs text-gray-500">
                完成率 {Math.round((stats.completedProjects / stats.totalProjects) * 100)}%
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={4}>
            <Card hoverable className="transition-all duration-200 hover:shadow-lg">
              <Statistic
                title={
                  <div className="flex items-center justify-between">
                    <span>文档总数</span>
                    {statsHistory.totalDocuments.trend === 'up' && <ArrowUpOutlined className="text-green-500" />}
                    {statsHistory.totalDocuments.trend === 'down' && <ArrowDownOutlined className="text-red-500" />}
                  </div>
                }
                value={stats.totalDocuments}
                prefix={<FileTextOutlined />}
                valueStyle={{ color: '#eb2f96' }}
              />
              <div className="mt-2 text-xs text-gray-500">
                平均 {Math.round(stats.totalDocuments / stats.totalProjects)} 文档/项目
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={4}>
            <Card hoverable className="transition-all duration-200 hover:shadow-lg">
              <Statistic
                title="团队成员"
                value={stats.teamMembers}
                prefix={<TeamOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
              <div className="mt-2 text-xs text-gray-500">
                在线 {Math.round(stats.teamMembers * 0.7)} 人
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={4}>
            <Card hoverable className="transition-all duration-200 hover:shadow-lg">
              <Statistic
                title="代码分析"
                value={stats.codeAnalysis}
                suffix="%"
                prefix={<CodeOutlined />}
                valueStyle={{ color: '#13c2c2' }}
              />
              <div className="mt-2">
                <Progress 
                  percent={stats.codeAnalysis} 
                  size="small" 
                  showInfo={false}
                  strokeColor={{
                    '0%': '#108ee9',
                    '100%': '#87d068',
                  }}
                />
              </div>
            </Card>
          </Col>
        </Row>
      </Spin>

      <Row gutter={[24, 24]}>
        {/* 快速操作 */}
        <Col xs={24} lg={16}>
          <Card 
            title={
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <BulbOutlined className="mr-2" />
                  <span>快速操作</span>
                </div>
                <Tooltip title="查看所有功能">
                  <Button type="text" size="small" icon={<EyeOutlined />}>
                    查看全部
                  </Button>
                </Tooltip>
              </div>
            } 
            className="mb-6"
          >
            <Row gutter={[16, 16]}>
              {quickActions.map((action) => (
                <Col xs={24} sm={12} md={8} key={action.id}>
                  <Card
                    hoverable
                    className="text-center cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 border-0 bg-gradient-to-br from-white to-gray-50"
                    onClick={() => handleQuickAction(action.path)}
                    bodyStyle={{ padding: '24px 20px' }}
                  >
                    <div className="relative">
                      <div
                        className="text-4xl mb-4 transition-transform duration-300 hover:scale-110"
                        style={{ color: action.color }}
                      >
                        {action.icon}
                      </div>
                      <div className="absolute -top-1 -right-1">
                        <Badge count={action.id === '1' ? 'NEW' : action.id === '2' ? 'HOT' : 0} 
                               style={{ backgroundColor: action.color }} />
                      </div>
                    </div>
                    <Title level={5} className="mb-3 text-gray-800">
                      {action.title}
                    </Title>
                    <Text type="secondary" className="text-sm leading-relaxed">
                      {action.description}
                    </Text>
                    <div className="mt-4">
                      <Button 
                        type="primary" 
                        size="small" 
                        style={{ backgroundColor: action.color, borderColor: action.color }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      >
                        立即使用
                      </Button>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
            
            {/* 使用统计 */}
            <div className="mt-6 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>今日使用次数</span>
                <div className="flex items-center space-x-4">
                  <span>创建项目: 3次</span>
                  <span>生成文档: 8次</span>
                  <span>代码分析: 5次</span>
                </div>
              </div>
            </div>
          </Card>

          {/* 最近活动 */}
          <Card 
            title={
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <ClockCircleOutlined className="mr-2" />
                  <span>最近活动</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge count={recentActivities.length} showZero style={{ backgroundColor: '#52c41a' }} />
                  <Tooltip title="查看全部活动">
                    <Button type="text" size="small" icon={<EyeOutlined />} />
                  </Tooltip>
                </div>
              </div>
            }
          >
            <List
              itemLayout="horizontal"
              dataSource={recentActivities}
              renderItem={(item, index) => (
                <List.Item className={`transition-all duration-200 hover:bg-gray-50 rounded-lg px-2 ${index === 0 ? 'bg-blue-50' : ''}`}>
                  <List.Item.Meta
                    avatar={
                      <Avatar 
                        icon={getActivityIcon(item.type)} 
                        className="transition-transform duration-200 hover:scale-110"
                      />
                    }
                    title={
                      <div className="flex items-center justify-between">
                        <Space>
                          <Text strong className="text-gray-800">{item.title}</Text>
                          <Tag 
                            color={
                              item.type === 'project' ? 'blue' :
                              item.type === 'document' ? 'green' :
                              item.type === 'analysis' ? 'orange' : 'purple'
                            }
                            className="text-xs"
                          >
                            {item.type === 'project' ? '项目' :
                             item.type === 'document' ? '文档' :
                             item.type === 'analysis' ? '分析' : '协作'}
                          </Tag>
                          {index === 0 && <Badge status="processing" text="最新" />}
                        </Space>
                        <Text type="secondary" className="text-xs">
                          {item.timestamp}
                        </Text>
                      </div>
                    }
                    description={
                      <div className="mt-1">
                        <div className="text-gray-600 mb-1">{item.description}</div>
                        <div className="flex items-center justify-between">
                          <Text type="secondary" className="text-xs flex items-center">
                             <UserOutlined className="mr-1" style={{ fontSize: '12px' }} />
                             {item.user}
                           </Text>
                          <Button type="link" size="small" className="text-xs p-0 h-auto">
                            查看详情
                          </Button>
                        </div>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
            
            {/* 活动统计 */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-lg font-semibold text-blue-600">12</div>
                  <div className="text-xs text-gray-500">今日项目</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-green-600">28</div>
                  <div className="text-xs text-gray-500">今日文档</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-orange-600">15</div>
                  <div className="text-xs text-gray-500">今日分析</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-purple-600">6</div>
                  <div className="text-xs text-gray-500">今日协作</div>
                </div>
              </div>
            </div>
          </Card>
        </Col>

        {/* 侧边栏 */}
        <Col xs={24} lg={8}>
          {/* 项目进度 */}
          <Card 
            title={
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <BarChartOutlined className="mr-2" />
                  <span>项目进度</span>
                </div>
                <Tooltip title="查看所有项目">
                  <Button type="text" size="small" icon={<EyeOutlined />} />
                </Tooltip>
              </div>
            } 
            className="mb-6"
          >
            <div className="space-y-4">
              <div className="p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <Text strong className="text-gray-800">电商平台项目</Text>
                    <div className="text-xs text-gray-500 mt-1">预计完成: 2024-12-25</div>
                  </div>
                  <div className="text-right">
                    <Text strong className="text-blue-600">75%</Text>
                    <div className="text-xs text-gray-500">7/10 任务</div>
                  </div>
                </div>
                <Progress 
                  percent={75} 
                  status="active" 
                  strokeColor={{
                    '0%': '#108ee9',
                    '100%': '#87d068',
                  }}
                  trailColor="#f0f0f0"
                />
                <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                  <span>团队: 5人</span>
                  <span>剩余: 3天</span>
                </div>
              </div>
              
              <div className="p-3 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <Text strong className="text-gray-800">移动应用开发</Text>
                    <div className="text-xs text-gray-500 mt-1">预计完成: 2024-12-30</div>
                  </div>
                  <div className="text-right">
                    <Text strong className="text-orange-600">45%</Text>
                    <div className="text-xs text-gray-500">4/9 任务</div>
                  </div>
                </div>
                <Progress 
                  percent={45} 
                  strokeColor="#fa8c16"
                  trailColor="#f0f0f0"
                />
                <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                  <span>团队: 3人</span>
                  <span>剩余: 8天</span>
                </div>
              </div>
              
              <div className="p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <Text strong className="text-gray-800">API服务重构</Text>
                    <div className="text-xs text-gray-500 mt-1">预计完成: 2024-12-22</div>
                  </div>
                  <div className="text-right">
                    <Text strong className="text-green-600">90%</Text>
                    <div className="text-xs text-gray-500">9/10 任务</div>
                  </div>
                </div>
                <Progress 
                  percent={90} 
                  status="success" 
                  strokeColor="#52c41a"
                  trailColor="#f0f0f0"
                />
                <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                  <span>团队: 2人</span>
                  <span>剩余: 1天</span>
                </div>
              </div>
            </div>
            
            {/* 项目统计 */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <div className="text-sm font-semibold text-blue-600">70%</div>
                  <div className="text-xs text-gray-500">平均进度</div>
                </div>
                <div>
                  <div className="text-sm font-semibold text-green-600">1</div>
                  <div className="text-xs text-gray-500">即将完成</div>
                </div>
                <div>
                  <div className="text-sm font-semibold text-orange-600">2</div>
                  <div className="text-xs text-gray-500">进行中</div>
                </div>
              </div>
            </div>
          </Card>

          {/* 成就系统 */}
          <Card 
            title={
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <TrophyOutlined className="mr-2" />
                  <span>成就徽章</span>
                </div>
                <Badge count={achievements.filter(a => a.unlocked).length} style={{ backgroundColor: '#faad14' }} />
              </div>
            } 
            className="mb-6"
          >
            <div className="space-y-4">
              {achievements.map((achievement) => (
                <div 
                  key={achievement.id} 
                  className={`p-3 rounded-lg transition-all duration-200 ${
                    achievement.unlocked 
                      ? 'bg-gradient-to-r from-green-50 to-green-100 border border-green-200' 
                      : 'bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div 
                        className={`text-2xl transition-all duration-200 ${
                          achievement.unlocked ? 'text-green-500 scale-110' : 'text-gray-400'
                        }`}
                      >
                        {achievement.icon}
                      </div>
                      <div>
                        <Text 
                          strong={achievement.unlocked}
                          className={achievement.unlocked ? 'text-green-800' : 'text-gray-600'}
                        >
                          {achievement.title}
                        </Text>
                        {achievement.unlocked && (
                          <div className="text-xs text-green-600 mt-1">🎉 已解锁</div>
                        )}
                      </div>
                    </div>
                    {achievement.unlocked && (
                      <CheckCircleOutlined className="text-green-500 text-lg" />
                    )}
                  </div>
                  
                  <Text type="secondary" className="text-sm block mb-3">
                    {achievement.description}
                  </Text>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">进度</span>
                      <span className={achievement.unlocked ? 'text-green-600 font-medium' : 'text-gray-600'}>
                        {achievement.progress}/{achievement.total}
                      </span>
                    </div>
                    <Progress
                      percent={Math.round((achievement.progress / achievement.total) * 100)}
                      size="small"
                      status={achievement.unlocked ? 'success' : 'active'}
                      showInfo={false}
                      strokeColor={achievement.unlocked ? '#52c41a' : '#1890ff'}
                      trailColor={achievement.unlocked ? '#f6ffed' : '#f0f0f0'}
                    />
                  </div>
                  
                  {!achievement.unlocked && (
                    <div className="mt-2 text-xs text-gray-500">
                      还需 {achievement.total - achievement.progress} 个完成解锁
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {/* 成就统计 */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-lg font-semibold text-green-600">
                    {achievements.filter(a => a.unlocked).length}
                  </div>
                  <div className="text-xs text-gray-500">已解锁</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-blue-600">
                    {achievements.length - achievements.filter(a => a.unlocked).length}
                  </div>
                  <div className="text-xs text-gray-500">待解锁</div>
                </div>
              </div>
            </div>
          </Card>

          {/* 学习路径 */}
          <Card 
            title={
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <BookOutlined className="mr-2" />
                  <span>学习路径</span>
                </div>
                <Tooltip title="管理学习路径">
                  <Button type="text" size="small" icon={<SettingOutlined />} />
                </Tooltip>
              </div>
            } 
            className="mb-6"
          >
            <div className="space-y-4">
              {/* 当前学习路径 */}
              <div className="p-4 border-2 border-blue-200 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <Text strong className="text-blue-800">React 进阶开发</Text>
                      <Badge status="processing" text="进行中" />
                    </div>
                    <Text type="secondary" className="text-sm">掌握React高级特性和最佳实践</Text>
                  </div>
                  <Button type="primary" size="small">继续学习</Button>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">学习进度</span>
                    <span className="text-blue-600 font-medium">6/10 章节</span>
                  </div>
                  <Progress 
                    percent={60} 
                    strokeColor={{
                      '0%': '#1890ff',
                      '100%': '#52c41a',
                    }}
                    trailColor="#e6f7ff"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>预计完成时间: 3天</span>
                    <span>今日学习: 45分钟</span>
                  </div>
                </div>
              </div>
              
              {/* 已完成路径 */}
              <div className="p-4 border border-green-200 rounded-lg bg-gradient-to-r from-green-50 to-green-100">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <Text strong className="text-green-800">TypeScript 基础</Text>
                      <Badge status="success" text="已完成" />
                    </div>
                    <Text type="secondary" className="text-sm">TypeScript语法和类型系统</Text>
                  </div>
                  <Button type="default" size="small" ghost>复习</Button>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">完成进度</span>
                    <span className="text-green-600 font-medium">8/8 章节</span>
                  </div>
                  <Progress percent={100} strokeColor="#52c41a" trailColor="#f6ffed" />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>完成时间: 2024-12-15</span>
                    <span>总学习时长: 12小时</span>
                  </div>
                </div>
              </div>
              
              {/* 计划中路径 */}
              <div className="p-4 border border-gray-200 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <Text strong className="text-gray-700">Node.js 后端开发</Text>
                      <Badge status="default" text="计划中" />
                    </div>
                    <Text type="secondary" className="text-sm">服务端开发和API设计</Text>
                  </div>
                  <Button type="dashed" size="small">开始学习</Button>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">课程内容</span>
                    <span className="text-gray-600">0/12 章节</span>
                  </div>
                  <Progress percent={0} strokeColor="#d9d9d9" trailColor="#f5f5f5" />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>预计开始: 2024-12-25</span>
                    <span>预计时长: 20小时</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* 学习统计 */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <div className="text-sm font-semibold text-blue-600">53%</div>
                  <div className="text-xs text-gray-500">总体进度</div>
                </div>
                <div>
                  <div className="text-sm font-semibold text-green-600">1</div>
                  <div className="text-xs text-gray-500">已完成</div>
                </div>
                <div>
                  <div className="text-sm font-semibold text-orange-600">2</div>
                  <div className="text-xs text-gray-500">学习中</div>
                </div>
              </div>
            </div>
          </Card>

          {/* 系统通知 */}
          <Card 
            title={
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <ExclamationCircleOutlined className="mr-2" />
                  <span>系统通知</span>
                </div>
                <Badge count={3} size="small" style={{ backgroundColor: '#ff4d4f' }} />
              </div>
            }
          >
            <div className="space-y-3">
              {/* 系统更新通知 */}
              <div className="p-4 border-l-4 border-blue-500 bg-gradient-to-r from-blue-50 to-blue-100 rounded-r-lg transition-all duration-200 hover:shadow-md">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <Text strong className="text-blue-700">系统更新</Text>
                  </div>
                  <Text type="secondary" className="text-xs">2小时前</Text>
                </div>
                <div className="text-sm text-gray-700 mb-2">
                  新增AI代码分析功能
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    <Button type="primary" size="small">查看详情</Button>
                    <Button type="text" size="small">稍后提醒</Button>
                  </div>
                  <Text type="secondary" className="text-xs">重要</Text>
                </div>
              </div>
              
              {/* 功能发布通知 */}
              <div className="p-4 border-l-4 border-green-500 bg-gradient-to-r from-green-50 to-green-100 rounded-r-lg transition-all duration-200 hover:shadow-md">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <Text strong className="text-green-700">功能发布</Text>
                  </div>
                  <Text type="secondary" className="text-xs">1天前</Text>
                </div>
                <div className="text-sm text-gray-700 mb-2">
                  3D可视化模块上线
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    <Button type="default" size="small">查看详情</Button>
                    <Button type="text" size="small">标记已读</Button>
                  </div>
                  <Text type="secondary" className="text-xs">已发布</Text>
                </div>
              </div>
              
              {/* 维护通知 */}
              <div className="p-4 border-l-4 border-orange-500 bg-gradient-to-r from-orange-50 to-orange-100 rounded-r-lg transition-all duration-200 hover:shadow-md">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                    <Text strong className="text-orange-700">维护通知</Text>
                  </div>
                  <Text type="secondary" className="text-xs">2天前</Text>
                </div>
                <div className="text-sm text-gray-700 mb-2">
                  系统将于周末进行维护
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    <Button type="default" size="small">了解详情</Button>
                    <Button type="text" size="small">设置提醒</Button>
                  </div>
                  <Text type="secondary" className="text-xs">待处理</Text>
                </div>
              </div>
            </div>
            
            {/* 通知操作 */}
            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
              <Text type="secondary" className="text-sm">共 3 条未读通知</Text>
              <div className="space-x-2">
                <Button type="text" size="small">全部标记已读</Button>
                <Button type="text" size="small">查看全部</Button>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}