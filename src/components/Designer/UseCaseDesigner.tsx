import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Form, 
  Input, 
  Button, 
  Space, 
  Table, 
  Modal, 
  Select, 
  Tag, 
  Row, 
  Col,
  message,
  Tabs,
  Typography
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  UserOutlined,
  PlayCircleOutlined,
  LinkOutlined,
  EyeOutlined,
  SaveOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { MermaidChart } from '../Chart/MermaidChart';
import { documentEngine } from '../../services/DocumentEngine';
import type { 
  UseCaseModel, 
  Actor, 
  UseCase, 
  Relationship, 
  MermaidChart as MermaidChartType 
} from '../../types/document';

const { TextArea } = Input;
const { Title, Text } = Typography;
const { TabPane } = Tabs;

interface UseCaseDesignerProps {
  initialData?: Partial<UseCaseModel>;
  onSave?: (model: UseCaseModel) => void;
  onPreview?: (model: UseCaseModel) => void;
  readonly?: boolean;
}

const UseCaseDesigner: React.FC<UseCaseDesignerProps> = ({
  initialData,
  onSave,
  onPreview,
  readonly = false
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('requirements');
  
  // 数据状态
  const [requirements, setRequirements] = useState('');
  const [actors, setActors] = useState<Actor[]>([]);
  const [useCases, setUseCases] = useState<UseCase[]>([]);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [mermaidChart, setMermaidChart] = useState<MermaidChartType | null>(null);
  
  // 模态框状态
  const [actorModalVisible, setActorModalVisible] = useState(false);
  const [useCaseModalVisible, setUseCaseModalVisible] = useState(false);
  const [relationshipModalVisible, setRelationshipModalVisible] = useState(false);
  const [editingActor, setEditingActor] = useState<Actor | null>(null);
  const [editingUseCase, setEditingUseCase] = useState<UseCase | null>(null);
  const [editingRelationship, setEditingRelationship] = useState<Relationship | null>(null);

  // 初始化数据
  useEffect(() => {
    if (initialData) {
      setRequirements(initialData.content?.mermaidCode || '');
      setActors(initialData.content?.actors || []);
      setUseCases(initialData.content?.useCases || []);
      setRelationships(initialData.content?.relationships || []);
      
      if (initialData.content?.mermaidCode) {
        setMermaidChart({
          id: initialData.id || 'usecase-preview',
          type: 'flowchart',
          code: initialData.content.mermaidCode,
          title: initialData.title || 'Use Case Diagram'
        });
      }
    }
  }, [initialData]);

  // 从需求生成用例图
  const generateFromRequirements = async () => {
    if (!requirements.trim()) {
      message.warning('Please enter requirements description');
      return;
    }

    setLoading(true);
    try {
      const useCaseModel = await documentEngine.generateDocument('usecase', {
        requirements,
        actors: actors.length > 0 ? actors : undefined,
        useCases: useCases.length > 0 ? useCases : undefined
      }) as UseCaseModel;

      setActors(useCaseModel.content.actors);
      setUseCases(useCaseModel.content.useCases);
      setRelationships(useCaseModel.content.relationships);
      
      setMermaidChart({
        id: useCaseModel.id,
        type: 'flowchart',
        code: useCaseModel.content.mermaidCode,
        title: 'Generated Use Case Diagram'
      });

      setActiveTab('diagram');
      message.success('Use case diagram generated successfully!');
    } catch (error) {
      console.error('Generation error:', error);
      message.error('Failed to generate use case diagram');
    } finally {
      setLoading(false);
    }
  };

  // 手动更新图表
  const updateDiagram = () => {
    if (actors.length === 0 && useCases.length === 0) {
      message.warning('Please add actors and use cases first');
      return;
    }

    const mermaidCode = generateMermaidCode(actors, useCases, relationships);
    setMermaidChart({
      id: `usecase-${Date.now()}`,
      type: 'flowchart',
      code: mermaidCode,
      title: 'Use Case Diagram'
    });
    
    setActiveTab('diagram');
  };

  // 生成Mermaid代码
  const generateMermaidCode = (actors: Actor[], useCases: UseCase[], relationships: Relationship[]): string => {
    let code = 'graph TD\n';
    
    // 添加样式定义
    code += '    classDef actor fill:#e1f5fe,stroke:#01579b,stroke-width:2px\n';
    code += '    classDef usecase fill:#f3e5f5,stroke:#4a148c,stroke-width:2px\n';
    code += '    classDef system fill:#fff3e0,stroke:#e65100,stroke-width:2px\n\n';
    
    // 添加参与者
    for (const actor of actors) {
      const shape = actor.type === 'system' ? '[]' : '["👤"]';
      code += `    ${actor.id}${shape}\n`;
      code += `    ${actor.id} --> ${actor.id}_label["${actor.name}"]\n`;
      
      const cssClass = actor.type === 'system' ? 'system' : 'actor';
      code += `    class ${actor.id} ${cssClass}\n`;
      code += `    class ${actor.id}_label ${cssClass}\n`;
    }
    
    code += '\n';
    
    // 添加用例
    for (const useCase of useCases) {
      code += `    ${useCase.id}(("${useCase.name}"))\n`;
      code += `    class ${useCase.id} usecase\n`;
    }
    
    code += '\n';
    
    // 添加关系
    for (const rel of relationships) {
      const arrow = rel.type === 'include' ? '-.->|include|' : 
                   rel.type === 'extend' ? '-.->|extend|' : '-->';
      code += `    ${rel.source} ${arrow} ${rel.target}\n`;
    }
    
    return code;
  };

  // 保存模型
  const handleSave = async () => {
    if (!mermaidChart) {
      message.warning('Please generate the diagram first');
      return;
    }

    const model: UseCaseModel = {
      id: `usecase-${Date.now()}`,
      type: 'usecase',
      title: 'Use Case Model',
      content: {
        actors,
        useCases,
        relationships,
        mermaidCode: mermaidChart.code
      },
      metadata: {
        version: '1.0',
        author: 'User',
        tags: ['usecase', 'requirements'],
        exportFormats: ['svg', 'png', 'json', 'markdown']
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    onSave?.(model);
    message.success('Use case model saved successfully!');
  };

  // 参与者表格列
  const actorColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Actor) => (
        <Space>
          {record.type === 'system' ? '🖥️' : '👤'}
          <Text strong>{text}</Text>
        </Space>
      )
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        const colors = {
          primary: 'blue',
          secondary: 'green',
          system: 'orange'
        };
        return <Tag color={colors[type as keyof typeof colors]}>{type}</Tag>;
      }
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_: unknown, record: Actor) => (
        <Space>
          <Button 
            type="text" 
            size="small" 
            icon={<EditOutlined />}
            onClick={() => {
              setEditingActor(record);
              setActorModalVisible(true);
            }}
            disabled={readonly}
          />
          <Button 
            type="text" 
            size="small" 
            icon={<DeleteOutlined />}
            danger
            onClick={() => {
              setActors(actors.filter(a => a.id !== record.id));
              setRelationships(relationships.filter(r => r.source !== record.id && r.target !== record.id));
            }}
            disabled={readonly}
          />
        </Space>
      )
    }
  ];

  // 用例表格列
  const useCaseColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <Text strong>{text}</Text>
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: string) => {
        const colors = {
          high: 'red',
          medium: 'orange',
          low: 'green'
        };
        return <Tag color={colors[priority as keyof typeof colors]}>{priority}</Tag>;
      }
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_: unknown, record: UseCase) => (
        <Space>
          <Button 
            type="text" 
            size="small" 
            icon={<EditOutlined />}
            onClick={() => {
              setEditingUseCase(record);
              setUseCaseModalVisible(true);
            }}
            disabled={readonly}
          />
          <Button 
            type="text" 
            size="small" 
            icon={<DeleteOutlined />}
            danger
            onClick={() => {
              setUseCases(useCases.filter(uc => uc.id !== record.id));
              setRelationships(relationships.filter(r => r.source !== record.id && r.target !== record.id));
            }}
            disabled={readonly}
          />
        </Space>
      )
    }
  ];

  return (
    <div className="use-case-designer">
      <Card 
        title={
          <Space>
            <UserOutlined />
            <span>Use Case Designer</span>
          </Space>
        }
        extra={
          <Space>
            {!readonly && (
              <>
                <Button 
                  icon={<ReloadOutlined />}
                  onClick={updateDiagram}
                  disabled={actors.length === 0 && useCases.length === 0}
                >
                  Update Diagram
                </Button>
                <Button 
                  type="primary"
                  icon={<SaveOutlined />}
                  onClick={handleSave}
                  disabled={!mermaidChart}
                >
                  Save Model
                </Button>
              </>
            )}
            {onPreview && (
              <Button 
                icon={<EyeOutlined />}
                onClick={() => mermaidChart && onPreview({
                  id: 'preview',
                  type: 'usecase',
                  title: 'Use Case Model Preview',
                  content: { actors, useCases, relationships, mermaidCode: mermaidChart.code },
                  metadata: { version: '1.0', author: 'User', tags: [], exportFormats: [] },
                  createdAt: new Date(),
                  updatedAt: new Date()
                } as UseCaseModel)}
              >
                Preview
              </Button>
            )}
          </Space>
        }
      >
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          {/* 需求输入 */}
          <TabPane 
            tab={
              <Space>
                <PlayCircleOutlined />
                Requirements
              </Space>
            } 
            key="requirements"
          >
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Title level={4}>Requirements Description</Title>
                <Text type="secondary">
                  Describe your system requirements in natural language. 
                  The AI will analyze and generate actors, use cases, and relationships.
                </Text>
              </Col>
              <Col span={24}>
                <TextArea
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  placeholder="Enter your system requirements here...\n\nExample:\n- Users can register and login to the system\n- Administrators can manage user accounts\n- The system sends email notifications\n- Users can reset their passwords"
                  rows={8}
                  disabled={readonly}
                />
              </Col>
              <Col span={24}>
                <Button 
                  type="primary"
                  size="large"
                  loading={loading}
                  onClick={generateFromRequirements}
                  disabled={readonly || !requirements.trim()}
                  block
                >
                  🤖 Generate Use Case Diagram with AI
                </Button>
              </Col>
            </Row>
          </TabPane>

          {/* 参与者管理 */}
          <TabPane 
            tab={
              <Space>
                <UserOutlined />
                Actors ({actors.length})
              </Space>
            } 
            key="actors"
          >
            <div className="mb-4">
              <Button 
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setEditingActor(null);
                  setActorModalVisible(true);
                }}
                disabled={readonly}
              >
                Add Actor
              </Button>
            </div>
            <Table 
              columns={actorColumns}
              dataSource={actors}
              rowKey="id"
              size="small"
              pagination={false}
            />
          </TabPane>

          {/* 用例管理 */}
          <TabPane 
            tab={
              <Space>
                <PlayCircleOutlined />
                Use Cases ({useCases.length})
              </Space>
            } 
            key="usecases"
          >
            <div className="mb-4">
              <Button 
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setEditingUseCase(null);
                  setUseCaseModalVisible(true);
                }}
                disabled={readonly}
              >
                Add Use Case
              </Button>
            </div>
            <Table 
              columns={useCaseColumns}
              dataSource={useCases}
              rowKey="id"
              size="small"
              pagination={false}
            />
          </TabPane>

          {/* 关系管理 */}
          <TabPane 
            tab={
              <Space>
                <LinkOutlined />
                Relationships ({relationships.length})
              </Space>
            } 
            key="relationships"
          >
            <div className="mb-4">
              <Button 
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setEditingRelationship(null);
                  setRelationshipModalVisible(true);
                }}
                disabled={readonly || actors.length === 0 || useCases.length === 0}
              >
                Add Relationship
              </Button>
            </div>
            <Table 
              dataSource={relationships}
              rowKey="id"
              size="small"
              pagination={false}
              columns={[
                {
                  title: 'Source',
                  dataIndex: 'source',
                  key: 'source',
                  render: (id: string) => {
                    const actor = actors.find(a => a.id === id);
                    const useCase = useCases.find(uc => uc.id === id);
                    return actor?.name || useCase?.name || id;
                  }
                },
                {
                  title: 'Type',
                  dataIndex: 'type',
                  key: 'type',
                  render: (type: string) => <Tag>{type}</Tag>
                },
                {
                  title: 'Target',
                  dataIndex: 'target',
                  key: 'target',
                  render: (id: string) => {
                    const actor = actors.find(a => a.id === id);
                    const useCase = useCases.find(uc => uc.id === id);
                    return actor?.name || useCase?.name || id;
                  }
                },
                {
                  title: 'Actions',
                  key: 'actions',
                  width: 120,
                  render: (_: any, record: Relationship) => (
                    <Space>
                      <Button 
                        type="text" 
                        size="small" 
                        icon={<EditOutlined />}
                        onClick={() => {
                          setEditingRelationship(record);
                          setRelationshipModalVisible(true);
                        }}
                        disabled={readonly}
                      />
                      <Button 
                        type="text" 
                        size="small" 
                        icon={<DeleteOutlined />}
                        danger
                        onClick={() => {
                          setRelationships(relationships.filter(r => r.id !== record.id));
                        }}
                        disabled={readonly}
                      />
                    </Space>
                  )
                }
              ]}
            />
          </TabPane>

          {/* 图表预览 */}
          <TabPane 
            tab={
              <Space>
                <EyeOutlined />
                Diagram
              </Space>
            } 
            key="diagram"
          >
            {mermaidChart ? (
              <MermaidChart 
                chart={mermaidChart}
                editable={!readonly}
                onEdit={(code) => {
                  setMermaidChart({ ...mermaidChart, code });
                }}
                height={600}
              />
            ) : (
              <div className="text-center py-16 text-gray-500">
                <EyeOutlined className="text-4xl mb-4" />
                <div>No diagram generated yet</div>
                <div className="text-sm">Generate from requirements or add actors and use cases manually</div>
              </div>
            )}
          </TabPane>
        </Tabs>
      </Card>

      {/* 参与者编辑模态框 */}
      <Modal
        title={editingActor ? 'Edit Actor' : 'Add Actor'}
        open={actorModalVisible}
        onCancel={() => {
          setActorModalVisible(false);
          setEditingActor(null);
        }}
        onOk={() => {
          form.validateFields().then(values => {
            const actor: Actor = {
              id: editingActor?.id || `actor-${Date.now()}`,
              ...values
            };
            
            if (editingActor) {
              setActors(actors.map(a => a.id === editingActor.id ? actor : a));
            } else {
              setActors([...actors, actor]);
            }
            
            setActorModalVisible(false);
            setEditingActor(null);
            form.resetFields();
          });
        }}
      >
        <Form 
          form={form}
          layout="vertical"
          initialValues={editingActor}
        >
          <Form.Item 
            name="name" 
            label="Name" 
            rules={[{ required: true, message: 'Please enter actor name' }]}
          >
            <Input placeholder="e.g., User, Administrator, System" />
          </Form.Item>
          <Form.Item 
            name="type" 
            label="Type" 
            rules={[{ required: true, message: 'Please select actor type' }]}
          >
            <Select>
              <Select.Option value="primary">Primary Actor</Select.Option>
              <Select.Option value="secondary">Secondary Actor</Select.Option>
              <Select.Option value="system">System Actor</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="description" label="Description">
            <TextArea rows={3} placeholder="Describe the actor's role and responsibilities" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 用例编辑模态框 */}
      <Modal
        title={editingUseCase ? 'Edit Use Case' : 'Add Use Case'}
        open={useCaseModalVisible}
        onCancel={() => {
          setUseCaseModalVisible(false);
          setEditingUseCase(null);
        }}
        onOk={() => {
          form.validateFields().then(values => {
            const useCase: UseCase = {
              id: editingUseCase?.id || `usecase-${Date.now()}`,
              preconditions: [],
              postconditions: [],
              mainFlow: [],
              ...values
            };
            
            if (editingUseCase) {
              setUseCases(useCases.map(uc => uc.id === editingUseCase.id ? useCase : uc));
            } else {
              setUseCases([...useCases, useCase]);
            }
            
            setUseCaseModalVisible(false);
            setEditingUseCase(null);
            form.resetFields();
          });
        }}
        width={600}
      >
        <Form 
          form={form}
          layout="vertical"
          initialValues={editingUseCase}
        >
          <Form.Item 
            name="name" 
            label="Name" 
            rules={[{ required: true, message: 'Please enter use case name' }]}
          >
            <Input placeholder="e.g., Login, Register, Reset Password" />
          </Form.Item>
          <Form.Item 
            name="description" 
            label="Description" 
            rules={[{ required: true, message: 'Please enter use case description' }]}
          >
            <TextArea rows={3} placeholder="Describe what this use case accomplishes" />
          </Form.Item>
          <Form.Item 
            name="priority" 
            label="Priority" 
            rules={[{ required: true, message: 'Please select priority' }]}
          >
            <Select>
              <Select.Option value="high">High</Select.Option>
              <Select.Option value="medium">Medium</Select.Option>
              <Select.Option value="low">Low</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* 关系编辑模态框 */}
      <Modal
        title={editingRelationship ? 'Edit Relationship' : 'Add Relationship'}
        open={relationshipModalVisible}
        onCancel={() => {
          setRelationshipModalVisible(false);
          setEditingRelationship(null);
        }}
        onOk={() => {
          form.validateFields().then(values => {
            const relationship: Relationship = {
              id: editingRelationship?.id || `rel-${Date.now()}`,
              ...values
            };
            
            if (editingRelationship) {
              setRelationships(relationships.map(r => r.id === editingRelationship.id ? relationship : r));
            } else {
              setRelationships([...relationships, relationship]);
            }
            
            setRelationshipModalVisible(false);
            setEditingRelationship(null);
            form.resetFields();
          });
        }}
      >
        <Form 
          form={form}
          layout="vertical"
          initialValues={editingRelationship}
        >
          <Form.Item 
            name="source" 
            label="Source" 
            rules={[{ required: true, message: 'Please select source' }]}
          >
            <Select placeholder="Select source actor or use case">
              <Select.OptGroup label="Actors">
                {actors.map(actor => (
                  <Select.Option key={actor.id} value={actor.id}>
                    {actor.name}
                  </Select.Option>
                ))}
              </Select.OptGroup>
              <Select.OptGroup label="Use Cases">
                {useCases.map(useCase => (
                  <Select.Option key={useCase.id} value={useCase.id}>
                    {useCase.name}
                  </Select.Option>
                ))}
              </Select.OptGroup>
            </Select>
          </Form.Item>
          <Form.Item 
            name="type" 
            label="Relationship Type" 
            rules={[{ required: true, message: 'Please select relationship type' }]}
          >
            <Select>
              <Select.Option value="association">Association</Select.Option>
              <Select.Option value="include">Include</Select.Option>
              <Select.Option value="extend">Extend</Select.Option>
              <Select.Option value="generalization">Generalization</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item 
            name="target" 
            label="Target" 
            rules={[{ required: true, message: 'Please select target' }]}
          >
            <Select placeholder="Select target actor or use case">
              <Select.OptGroup label="Actors">
                {actors.map(actor => (
                  <Select.Option key={actor.id} value={actor.id}>
                    {actor.name}
                  </Select.Option>
                ))}
              </Select.OptGroup>
              <Select.OptGroup label="Use Cases">
                {useCases.map(useCase => (
                  <Select.Option key={useCase.id} value={useCase.id}>
                    {useCase.name}
                  </Select.Option>
                ))}
              </Select.OptGroup>
            </Select>
          </Form.Item>
          <Form.Item name="label" label="Label (Optional)">
            <Input placeholder="Optional relationship label" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UseCaseDesigner;