import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Button,
  Input,
  Select,
  Tree,
  Table,
  Tabs,
  Typography,
  Space,
  Tag,
  Modal,
  Upload,
  message,
  Tooltip,
  Badge,
  Divider,
  Alert,
  Progress
} from 'antd';
import {
  FolderOutlined,
  FileOutlined,
  SearchOutlined,
  CodeOutlined,
  BranchesOutlined,
  ApiOutlined,
  UploadOutlined,
  ExperimentOutlined,
  NodeIndexOutlined,
  LinkOutlined,
  DatabaseOutlined,
  FunctionOutlined,
  ClusterOutlined
} from '@ant-design/icons';
import type { TreeDataNode, UploadProps } from 'antd';
import { MermaidChart } from '../components/Chart/MermaidChart';

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;
const { Option } = Select;
// const { TabPane } = Tabs; // 已弃用，使用items属性替代
const { Dragger } = Upload;

interface CodeFile {
  id: string;
  name: string;
  path: string;
  type: 'file' | 'directory';
  language?: string;
  size?: number;
  lines?: number;
  children?: CodeFile[];
}

interface CodeClass {
  id: string;
  name: string;
  type: 'class' | 'interface' | 'enum' | 'function';
  file: string;
  line: number;
  methods: CodeMethod[];
  properties: CodeProperty[];
  dependencies: string[];
}

interface CodeMethod {
  id: string;
  name: string;
  type: 'method' | 'constructor' | 'getter' | 'setter';
  visibility: 'public' | 'private' | 'protected';
  parameters: CodeParameter[];
  returnType: string;
  line: number;
}

interface CodeProperty {
  id: string;
  name: string;
  type: string;
  visibility: 'public' | 'private' | 'protected';
  line: number;
}

interface CodeParameter {
  name: string;
  type: string;
  optional?: boolean;
}

interface AnalysisResult {
  totalFiles: number;
  totalLines: number;
  totalClasses: number;
  totalMethods: number;
  languages: { [key: string]: number };
  complexity: 'low' | 'medium' | 'high';
  dependencies: string[];
}

const CodeAnalysis: React.FC = () => {
  const [activeTab, setActiveTab] = useState('structure');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<CodeFile | null>(null);
  const [selectedClass, setSelectedClass] = useState<CodeClass | null>(null);
  const [isUploadModalVisible, setIsUploadModalVisible] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [availableProjects, setAvailableProjects] = useState<any[]>([]);
  
  // 初始化项目数据
  useEffect(() => {
    // 从localStorage获取当前选择的项目
    const savedProject = localStorage.getItem('selectedProject');
    if (savedProject) {
      setSelectedProject(JSON.parse(savedProject));
    }

    // 模拟可用项目列表
    const mockProjects = [
      { id: '1', name: '电商平台', description: '基于React的现代化电商平台' },
      { id: '2', name: '移动端APP', description: 'React Native跨平台移动应用' },
      { id: '3', name: '微服务网关', description: 'Spring Cloud Gateway微服务网关' }
    ];
    setAvailableProjects(mockProjects);
  }, []);

  // 模拟数据 - 基于选择的项目
  const [codeStructure, setCodeStructure] = useState<CodeFile[]>([]); 

  // 当项目改变时，重新加载代码结构
  useEffect(() => {
    if (selectedProject) {
      // 根据不同项目加载不同的代码结构
      const projectCodeStructure = getCodeStructureByProject(selectedProject.id);
      setCodeStructure(projectCodeStructure);
    } else {
      setCodeStructure([]);
    }
  }, [selectedProject]);

  const getCodeStructureByProject = (projectId: string): CodeFile[] => {
    // 根据项目ID返回不同的代码结构
    const structures: { [key: string]: CodeFile[] } = {
      '1': [ // 电商平台
        {
          id: 'src',
          name: 'src',
          path: '/src',
          type: 'directory',
          children: [
            {
              id: 'components',
              name: 'components',
              path: '/src/components',
              type: 'directory',
              children: [
                {
                  id: 'UserCard.tsx',
                  name: 'UserCard.tsx',
                  path: '/src/components/UserCard.tsx',
                  type: 'file',
                  language: 'typescript',
                  size: 2048,
                  lines: 85
                },
                {
                  id: 'ProductList.tsx',
                  name: 'ProductList.tsx',
                  path: '/src/components/ProductList.tsx',
                  type: 'file',
                  language: 'typescript',
                  size: 3200,
                  lines: 120
                }
              ]
            },
            {
              id: 'services',
              name: 'services',
              path: '/src/services',
              type: 'directory',
              children: [
                {
                  id: 'UserService.ts',
                  name: 'UserService.ts',
                  path: '/src/services/UserService.ts',
                  type: 'file',
                  language: 'typescript',
                  size: 3072,
                  lines: 120
                },
                {
                  id: 'ProductService.ts',
                  name: 'ProductService.ts',
                  path: '/src/services/ProductService.ts',
                  type: 'file',
                  language: 'typescript',
                  size: 2800,
                  lines: 105
                }
              ]
            }
          ]
        }
      ],
      '2': [ // 移动端APP
        {
          id: 'src',
          name: 'src',
          path: '/src',
          type: 'directory',
          children: [
            {
              id: 'screens',
              name: 'screens',
              path: '/src/screens',
              type: 'directory',
              children: [
                {
                  id: 'HomeScreen.tsx',
                  name: 'HomeScreen.tsx',
                  path: '/src/screens/HomeScreen.tsx',
                  type: 'file',
                  language: 'typescript',
                  size: 2500,
                  lines: 95
                },
                {
                  id: 'ProfileScreen.tsx',
                  name: 'ProfileScreen.tsx',
                  path: '/src/screens/ProfileScreen.tsx',
                  type: 'file',
                  language: 'typescript',
                  size: 1800,
                  lines: 70
                }
              ]
            },
            {
              id: 'navigation',
              name: 'navigation',
              path: '/src/navigation',
              type: 'directory',
              children: [
                {
                  id: 'AppNavigator.tsx',
                  name: 'AppNavigator.tsx',
                  path: '/src/navigation/AppNavigator.tsx',
                  type: 'file',
                  language: 'typescript',
                  size: 1200,
                  lines: 45
                }
              ]
            }
          ]
        }
      ],
      '3': [ // 微服务网关
        {
          id: 'src',
          name: 'src',
          path: '/src',
          type: 'directory',
          children: [
            {
              id: 'main',
              name: 'main',
              path: '/src/main',
              type: 'directory',
              children: [
                {
                  id: 'java',
                  name: 'java',
                  path: '/src/main/java',
                  type: 'directory',
                  children: [
                    {
                      id: 'GatewayApplication.java',
                      name: 'GatewayApplication.java',
                      path: '/src/main/java/GatewayApplication.java',
                      type: 'file',
                      language: 'java',
                      size: 800,
                      lines: 30
                    },
                    {
                      id: 'RouteConfig.java',
                      name: 'RouteConfig.java',
                      path: '/src/main/java/RouteConfig.java',
                      type: 'file',
                      language: 'java',
                      size: 1500,
                      lines: 60
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    };
    return structures[projectId] || [];
  };
  
  const [codeClasses, setCodeClasses] = useState<CodeClass[]>([
    {
      id: 'UserCard',
      name: 'UserCard',
      type: 'class',
      file: '/src/components/UserCard.tsx',
      line: 15,
      methods: [
        {
          id: 'render',
          name: 'render',
          type: 'method',
          visibility: 'public',
          parameters: [],
          returnType: 'JSX.Element',
          line: 25
        },
        {
          id: 'handleClick',
          name: 'handleClick',
          type: 'method',
          visibility: 'private',
          parameters: [{ name: 'event', type: 'MouseEvent' }],
          returnType: 'void',
          line: 45
        }
      ],
      properties: [
        {
          id: 'props',
          name: 'props',
          type: 'UserCardProps',
          visibility: 'public',
          line: 16
        }
      ],
      dependencies: ['React', 'UserCardProps']
    },
    {
      id: 'UserService',
      name: 'UserService',
      type: 'class',
      file: '/src/services/UserService.ts',
      line: 10,
      methods: [
        {
          id: 'getUser',
          name: 'getUser',
          type: 'method',
          visibility: 'public',
          parameters: [{ name: 'id', type: 'string' }],
          returnType: 'Promise<User>',
          line: 15
        },
        {
          id: 'createUser',
          name: 'createUser',
          type: 'method',
          visibility: 'public',
          parameters: [{ name: 'userData', type: 'CreateUserRequest' }],
          returnType: 'Promise<User>',
          line: 25
        }
      ],
      properties: [
        {
          id: 'apiClient',
          name: 'apiClient',
          type: 'ApiClient',
          visibility: 'private',
          line: 11
        }
      ],
      dependencies: ['ApiClient', 'User', 'CreateUserRequest']
    }
  ]);
  
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult>({
    totalFiles: 15,
    totalLines: 2847,
    totalClasses: 8,
    totalMethods: 32,
    languages: {
      'TypeScript': 12,
      'JavaScript': 2,
      'CSS': 1
    },
    complexity: 'medium',
    dependencies: ['React', 'Ant Design', 'Axios', 'Lodash']
  });

  // 文件上传配置
  const uploadProps: UploadProps = {
    name: 'file',
    multiple: true,
    accept: '.zip,.tar,.gz',
    beforeUpload: (file) => {
      const isArchive = file.type === 'application/zip' || 
                       file.type === 'application/x-tar' ||
                       file.type === 'application/gzip';
      if (!isArchive) {
        message.error('只能上传压缩文件（ZIP、TAR、GZ）！');
        return false;
      }
      const isLt50M = file.size / 1024 / 1024 < 50;
      if (!isLt50M) {
        message.error('文件大小不能超过50MB！');
        return false;
      }
      return false; // 阻止自动上传
    },
    onChange: (info) => {
      if (info.fileList.length > 0) {
        handleAnalyzeCode();
        setIsUploadModalVisible(false);
      }
    }
  };

  // 模拟代码分析过程
  const handleAnalyzeCode = async () => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    
    const steps = [
      { progress: 20, message: '正在解压代码文件...' },
      { progress: 40, message: '正在分析文件结构...' },
      { progress: 60, message: '正在解析类和接口...' },
      { progress: 80, message: '正在分析依赖关系...' },
      { progress: 100, message: '分析完成！' }
    ];
    
    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAnalysisProgress(step.progress);
      message.info(step.message);
    }
    
    setIsAnalyzing(false);
    message.success('代码分析完成！');
  };

  // 转换树形数据
  const convertToTreeData = (files: CodeFile[]): TreeDataNode[] => {
    return files.map(file => ({
      key: file.id,
      title: (
        <Space>
          {file.type === 'directory' ? <FolderOutlined /> : <FileOutlined />}
          <span>{file.name}</span>
          {file.language && <Tag>{file.language}</Tag>}
          {file.lines && <Text type="secondary">({file.lines} lines)</Text>}
        </Space>
      ),
      children: file.children ? convertToTreeData(file.children) : undefined,
      isLeaf: file.type === 'file'
    }));
  };

  // 过滤类列表
  const filteredClasses = codeClasses.filter(cls => {
    const matchesSearch = searchTerm === '' || 
                         cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cls.file.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // 类列表表格列配置
  const classColumns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: CodeClass) => (
        <Space>
          {record.type === 'class' && <CodeOutlined />}
          {record.type === 'interface' && <ApiOutlined />}
          {record.type === 'enum' && <DatabaseOutlined />}
          {record.type === 'function' && <FunctionOutlined />}
          <Button type="link" onClick={() => setSelectedClass(record)}>
            {text}
          </Button>
        </Space>
      )
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        const colors = {
          class: 'blue',
          interface: 'green',
          enum: 'orange',
          function: 'purple'
        };
        return <Tag color={colors[type as keyof typeof colors]}>{type}</Tag>;
      }
    },
    {
      title: '文件',
      dataIndex: 'file',
      key: 'file',
      render: (file: string) => <Text code>{file}</Text>
    },
    {
      title: '方法数',
      key: 'methodCount',
      render: (_: any, record: CodeClass) => (
        <Badge count={record.methods.length} showZero />
      )
    },
    {
      title: '属性数',
      key: 'propertyCount',
      render: (_: any, record: CodeClass) => (
        <Badge count={record.properties.length} showZero />
      )
    },
    {
      title: '依赖数',
      key: 'dependencyCount',
      render: (_: any, record: CodeClass) => (
        <Badge count={record.dependencies.length} showZero />
      )
    }
  ];

  // 生成依赖关系图的Mermaid代码
  const generateDependencyGraph = () => {
    let mermaidCode = 'graph TD\n';
    
    codeClasses.forEach(cls => {
      cls.dependencies.forEach(dep => {
        mermaidCode += `    ${cls.name} --> ${dep}\n`;
      });
    });
    
    return mermaidCode;
  };

  // 生成类关系图的Mermaid代码
  const generateClassDiagram = () => {
    let mermaidCode = 'classDiagram\n';
    
    codeClasses.forEach(cls => {
      mermaidCode += `    class ${cls.name} {\n`;
      cls.properties.forEach(prop => {
        const visibility = prop.visibility === 'public' ? '+' : 
                          prop.visibility === 'private' ? '-' : '#';
        mermaidCode += `        ${visibility}${prop.name}: ${prop.type}\n`;
      });
      cls.methods.forEach(method => {
        const visibility = method.visibility === 'public' ? '+' : 
                          method.visibility === 'private' ? '-' : '#';
        const params = method.parameters.map(p => `${p.name}: ${p.type}`).join(', ');
        mermaidCode += `        ${visibility}${method.name}(${params}): ${method.returnType}\n`;
      });
      mermaidCode += `    }\n`;
    });
    
    return mermaidCode;
  };

  const handleProjectChange = (projectId: string) => {
    const project = availableProjects.find(p => p.id === projectId);
    if (project) {
      setSelectedProject(project);
      localStorage.setItem('selectedProject', JSON.stringify(project));
      message.success(`已切换到项目：${project.name}`);
    }
  };

  return (
    <div className="p-6">
      {/* 页面头部 */}
      <div className="mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <Title level={2} className="mb-2">
              <ExperimentOutlined className="mr-2" />
              代码分析
            </Title>
            <Text type="secondary" className="text-lg">
              分析代码结构、类接口关系和依赖图谱
            </Text>
          </div>
          <Space>
            <Button
              type="primary"
              icon={<UploadOutlined />}
              onClick={() => setIsUploadModalVisible(true)}
              disabled={!selectedProject}
            >
              上传代码
            </Button>
            <Button
              icon={<ExperimentOutlined />}
              onClick={handleAnalyzeCode}
              loading={isAnalyzing}
              disabled={!selectedProject}
            >
              重新分析
            </Button>
          </Space>
        </div>

        {/* 项目选择器 */}
        <Card className="mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700">选择项目：</span>
              <Select
                style={{ width: 300 }}
                placeholder="请选择要分析的项目"
                value={selectedProject?.id}
                onChange={handleProjectChange}
                options={availableProjects.map(project => ({
                  label: (
                    <div>
                      <div className="font-medium">{project.name}</div>
                      <div className="text-xs text-gray-500">{project.description}</div>
                    </div>
                  ),
                  value: project.id
                }))}
              />
            </div>
            {selectedProject && (
              <div className="flex items-center space-x-2">
                <Tag color="blue">当前项目</Tag>
                <span className="text-sm text-gray-600">{selectedProject.name}</span>
              </div>
            )}
          </div>
        </Card>

        {!selectedProject && (
          <Alert
            message="请先选择项目"
            description="代码分析功能需要先选择一个项目，请从上方下拉菜单中选择项目。"
            type="warning"
            showIcon
            className="mb-4"
          />
        )}
        
        {/* 分析进度 */}
        {isAnalyzing && (
          <Alert
            message="正在分析代码"
            description={
              <Progress percent={analysisProgress} size="small" className="mt-2" />
            }
            type="info"
            showIcon
            className="mb-4"
          />
        )}
        
        {/* 统计信息 */}
        <Row gutter={16} className="mb-4">
          <Col span={6}>
            <Card size="small">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {analysisResult.totalFiles}
                </div>
                <div className="text-gray-500">文件数</div>
              </div>
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {analysisResult.totalLines.toLocaleString()}
                </div>
                <div className="text-gray-500">代码行数</div>
              </div>
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {analysisResult.totalClasses}
                </div>
                <div className="text-gray-500">类/接口</div>
              </div>
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {analysisResult.totalMethods}
                </div>
                <div className="text-gray-500">方法数</div>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
      
      {/* 主要内容 */}
      <Card>
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          items={[
            {
              key: 'structure',
              label: (
                <Space>
                  <BranchesOutlined />
                  <span>代码结构</span>
                </Space>
              ),
              children: (
                 <div>
                   <Row gutter={[16, 16]}>
                     <Col xs={24} lg={12}>
                       <Card title="文件树" size="small">
                         <Tree
                           treeData={convertToTreeData(codeStructure)}
                           defaultExpandAll
                           onSelect={(selectedKeys, info) => {
                             if (info.node.isLeaf) {
                               // 处理文件选择
                               console.log('Selected file:', selectedKeys[0]);
                             }
                           }}
                         />
                       </Card>
                     </Col>
                     <Col xs={24} lg={12}>
                       <Card title="语言分布" size="small">
                         <div className="space-y-3">
                           {Object.entries(analysisResult.languages).map(([lang, count]) => (
                             <div key={lang} className="flex justify-between items-center">
                               <span>{lang}</span>
                               <div className="flex items-center space-x-2">
                                 <div className="w-32 bg-gray-200 rounded-full h-2">
                                   <div 
                                     className="bg-blue-500 h-2 rounded-full" 
                                     style={{ width: `${(count / analysisResult.totalFiles) * 100}%` }}
                                   />
                                 </div>
                                 <span className="text-sm text-gray-500">{count}</span>
                               </div>
                             </div>
                           ))}
                         </div>
                         
                         <Divider />
                         
                         <div>
                           <Title level={5}>主要依赖</Title>
                           <Space wrap>
                             {analysisResult.dependencies.map(dep => (
                               <Tag key={dep} color="blue">{dep}</Tag>
                             ))}
                           </Space>
                         </div>
                       </Card>
                     </Col>
                   </Row>
                 </div>
               )
             },
             {
               key: 'classes',
               label: (
                 <Space>
                   <CodeOutlined />
                   <span>类与接口</span>
                 </Space>
               ),
               children: (
                 <div>
                   <div className="mb-4">
                     <Row gutter={16} align="middle">
                       <Col span={8}>
                         <Search
                           placeholder="搜索类名或文件名"
                           value={searchTerm}
                           onChange={(e) => setSearchTerm(e.target.value)}
                           allowClear
                         />
                       </Col>
                       <Col span={6}>
                         <Select
                           placeholder="选择语言"
                           value={selectedLanguage}
                           onChange={setSelectedLanguage}
                           style={{ width: '100%' }}
                         >
                           <Option value="all">全部语言</Option>
                           <Option value="typescript">TypeScript</Option>
                           <Option value="javascript">JavaScript</Option>
                           <Option value="java">Java</Option>
                           <Option value="python">Python</Option>
                         </Select>
                       </Col>
                       <Col span={10}>
                         <Text type="secondary">
                           共找到 {filteredClasses.length} 个类/接口
                         </Text>
                       </Col>
                     </Row>
                   </div>
                   
                   <Table
                     dataSource={filteredClasses}
                     columns={classColumns}
                     rowKey="id"
                     pagination={{ pageSize: 10 }}
                     size="small"
                   />
                 </div>
               )
              },
              {
                key: 'dependencies',
                label: (
                  <Space>
                    <NodeIndexOutlined />
                    <span>依赖关系</span>
                  </Space>
                ),
                children: (
                  <div>
                    <Row gutter={[16, 16]}>
                      <Col span={24}>
                        <Card title="依赖关系图" size="small">
                          <MermaidChart
                            chart={{
                              id: 'dependency-graph',
                              type: 'flowchart',
                              code: generateDependencyGraph(),
                              title: '代码依赖关系图'
                            }}
                            height={400}
                          />
                        </Card>
                      </Col>
                    </Row>
                  </div>
                )
               },
               {
                 key: 'class-diagram',
                 label: (
                   <Space>
                     <ClusterOutlined />
                     <span>类图</span>
                   </Space>
                 ),
                 children: (
                   <div>
                     <Row gutter={[16, 16]}>
                       <Col span={24}>
                         <Card title="UML类图" size="small">
                           <MermaidChart
                             chart={{
                               id: 'class-diagram',
                               type: 'class',
                               code: generateClassDiagram(),
                               title: 'UML类图'
                             }}
                             height={500}
                           />
                         </Card>
                       </Col>
                     </Row>
                   </div>
                 )
                }
              ]}
            />
      </Card>
      
      {/* 上传代码模态框 */}
      <Modal
        title="上传代码文件"
        open={isUploadModalVisible}
        onCancel={() => setIsUploadModalVisible(false)}
        footer={null}
        width={600}
      >
        <div className="mb-4">
          <Alert
            message="支持的文件格式"
            description="请上传包含源代码的压缩文件（ZIP、TAR、GZ），文件大小不超过50MB。"
            type="info"
            showIcon
          />
        </div>
        
        <Dragger {...uploadProps}>
          <p className="ant-upload-drag-icon">
            <UploadOutlined className="text-4xl text-blue-500" />
          </p>
          <p className="ant-upload-text text-lg font-medium">
            点击或拖拽文件到此区域上传
          </p>
          <p className="ant-upload-hint">
            支持ZIP、TAR、GZ格式的压缩文件
          </p>
        </Dragger>
      </Modal>
      
      {/* 类详情模态框 */}
      <Modal
        title={selectedClass?.name}
        open={!!selectedClass}
        onCancel={() => setSelectedClass(null)}
        footer={[
          <Button key="close" onClick={() => setSelectedClass(null)}>
            关闭
          </Button>
        ]}
        width={800}
      >
        {selectedClass && (
          <div>
            <div className="mb-4">
              <Space>
                <Tag color="blue">{selectedClass.type}</Tag>
                <Text code>{selectedClass.file}:{selectedClass.line}</Text>
              </Space>
            </div>
            
            <Tabs 
              defaultActiveKey="methods"
              items={[
                {
                  key: 'methods',
                  label: `方法 (${selectedClass.methods.length})`,
                  children: (
                    <div>
                      <Table
                        dataSource={selectedClass.methods}
                        columns={[
                          {
                            title: '名称',
                            dataIndex: 'name',
                            key: 'name',
                            render: (text: string, record: CodeMethod) => (
                              <Space>
                                <FunctionOutlined />
                                <Text code>{text}</Text>
                                <Tag>{record.visibility}</Tag>
                              </Space>
                            )
                          },
                          {
                            title: '参数',
                            dataIndex: 'parameters',
                            key: 'parameters',
                            render: (params: CodeParameter[]) => (
                              <Text code>
                                ({params.map(p => `${p.name}: ${p.type}`).join(', ')})
                              </Text>
                            )
                          },
                          {
                            title: '返回类型',
                            dataIndex: 'returnType',
                            key: 'returnType',
                            render: (type: string) => <Text code>{type}</Text>
                          },
                          {
                            title: '行号',
                            dataIndex: 'line',
                            key: 'line'
                          }
                        ]}
                        rowKey="id"
                        pagination={false}
                        size="small"
                      />
                    </div>
                  )
                 },
                 {
                   key: 'properties',
                   label: `属性 (${selectedClass.properties.length})`,
                   children: (
                     <div>
                       <Table
                         dataSource={selectedClass.properties}
                         columns={[
                           {
                             title: '名称',
                             dataIndex: 'name',
                             key: 'name',
                             render: (text: string, record: CodeProperty) => (
                               <Space>
                                 <DatabaseOutlined />
                                 <Text code>{text}</Text>
                                 <Tag>{record.visibility}</Tag>
                               </Space>
                             )
                           },
                           {
                             title: '类型',
                             dataIndex: 'type',
                             key: 'type',
                             render: (type: string) => <Text code>{type}</Text>
                           },
                           {
                             title: '行号',
                             dataIndex: 'line',
                             key: 'line'
                           }
                         ]}
                         rowKey="id"
                         pagination={false}
                         size="small"
                       />
                     </div>
                   )
                 },
                 {
                   key: 'dependencies',
                   label: `依赖 (${selectedClass.dependencies.length})`,
                   children: (
                     <Space wrap>
                       {selectedClass.dependencies.map(dep => (
                         <Tag key={dep} icon={<LinkOutlined />}>{dep}</Tag>
                       ))}
                     </Space>
                   )
                 }
               ]}
             />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CodeAnalysis;