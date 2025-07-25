import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Button,
  Input,
  Select,
  Table,
  Tabs,
  Typography,
  Space,
  Tag,
  Modal,
  Form,
  message,
  Tooltip,
  Badge,
  Divider,
  Alert,
  Drawer,
  Switch,
  InputNumber,
  Checkbox
} from 'antd';
import {
  DatabaseOutlined,
  TableOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  LinkOutlined,
  SearchOutlined,
  ExportOutlined,
  ImportOutlined,
  NodeIndexOutlined,
  BranchesOutlined,
  SettingOutlined,
  EyeOutlined,
  CopyOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { MermaidChart } from '../components/Chart/MermaidChart';

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;
const { Option } = Select;
// const { TabPane } = Tabs; // 已弃用，使用items属性替代
const { TextArea } = Input;

interface EntityField {
  id: string;
  name: string;
  type: string;
  length?: number;
  nullable: boolean;
  primaryKey: boolean;
  unique: boolean;
  defaultValue?: string;
  comment?: string;
}

interface Entity {
  id: string;
  name: string;
  tableName: string;
  comment?: string;
  fields: EntityField[];
  position?: { x: number; y: number };
  color?: string;
}

interface Relationship {
  id: string;
  name: string;
  sourceEntity: string;
  targetEntity: string;
  sourceField: string;
  targetField: string;
  type: 'one-to-one' | 'one-to-many' | 'many-to-many';
  onDelete: 'CASCADE' | 'SET NULL' | 'RESTRICT';
  onUpdate: 'CASCADE' | 'SET NULL' | 'RESTRICT';
}

interface ERDiagram {
  id: string;
  name: string;
  description?: string;
  entities: Entity[];
  relationships: Relationship[];
  createdAt: Date;
  updatedAt: Date;
}

const EntityModel: React.FC = () => {
  const [activeTab, setActiveTab] = useState('entities');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
  const [selectedRelationship, setSelectedRelationship] = useState<Relationship | null>(null);
  const [isEntityModalVisible, setIsEntityModalVisible] = useState(false);
  const [isRelationshipModalVisible, setIsRelationshipModalVisible] = useState(false);
  const [isERDiagramVisible, setIsERDiagramVisible] = useState(false);
  const [entityForm] = Form.useForm();
  const [relationshipForm] = Form.useForm();
  
  // 模拟数据
  const [currentDiagram, setCurrentDiagram] = useState<ERDiagram>({
    id: 'diagram-1',
    name: '用户管理系统ER图',
    description: '用户管理系统的实体关系图',
    entities: [
      {
        id: 'user',
        name: 'User',
        tableName: 'users',
        comment: '用户表',
        position: { x: 100, y: 100 },
        color: '#1890ff',
        fields: [
          {
            id: 'id',
            name: 'id',
            type: 'BIGINT',
            nullable: false,
            primaryKey: true,
            unique: true,
            comment: '用户ID'
          },
          {
            id: 'username',
            name: 'username',
            type: 'VARCHAR',
            length: 50,
            nullable: false,
            primaryKey: false,
            unique: true,
            comment: '用户名'
          },
          {
            id: 'email',
            name: 'email',
            type: 'VARCHAR',
            length: 100,
            nullable: false,
            primaryKey: false,
            unique: true,
            comment: '邮箱地址'
          },
          {
            id: 'password',
            name: 'password',
            type: 'VARCHAR',
            length: 255,
            nullable: false,
            primaryKey: false,
            unique: false,
            comment: '密码哈希'
          },
          {
            id: 'created_at',
            name: 'created_at',
            type: 'TIMESTAMP',
            nullable: false,
            primaryKey: false,
            unique: false,
            defaultValue: 'CURRENT_TIMESTAMP',
            comment: '创建时间'
          }
        ]
      },
      {
        id: 'role',
        name: 'Role',
        tableName: 'roles',
        comment: '角色表',
        position: { x: 400, y: 100 },
        color: '#52c41a',
        fields: [
          {
            id: 'id',
            name: 'id',
            type: 'BIGINT',
            nullable: false,
            primaryKey: true,
            unique: true,
            comment: '角色ID'
          },
          {
            id: 'name',
            name: 'name',
            type: 'VARCHAR',
            length: 50,
            nullable: false,
            primaryKey: false,
            unique: true,
            comment: '角色名称'
          },
          {
            id: 'description',
            name: 'description',
            type: 'TEXT',
            nullable: true,
            primaryKey: false,
            unique: false,
            comment: '角色描述'
          }
        ]
      },
      {
        id: 'user_role',
        name: 'UserRole',
        tableName: 'user_roles',
        comment: '用户角色关联表',
        position: { x: 250, y: 300 },
        color: '#fa8c16',
        fields: [
          {
            id: 'user_id',
            name: 'user_id',
            type: 'BIGINT',
            nullable: false,
            primaryKey: true,
            unique: false,
            comment: '用户ID'
          },
          {
            id: 'role_id',
            name: 'role_id',
            type: 'BIGINT',
            nullable: false,
            primaryKey: true,
            unique: false,
            comment: '角色ID'
          },
          {
            id: 'assigned_at',
            name: 'assigned_at',
            type: 'TIMESTAMP',
            nullable: false,
            primaryKey: false,
            unique: false,
            defaultValue: 'CURRENT_TIMESTAMP',
            comment: '分配时间'
          }
        ]
      }
    ],
    relationships: [
      {
        id: 'user-user_role',
        name: 'UserToUserRole',
        sourceEntity: 'user',
        targetEntity: 'user_role',
        sourceField: 'id',
        targetField: 'user_id',
        type: 'one-to-many',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      {
        id: 'role-user_role',
        name: 'RoleToUserRole',
        sourceEntity: 'role',
        targetEntity: 'user_role',
        sourceField: 'id',
        targetField: 'role_id',
        type: 'one-to-many',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      }
    ],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20')
  });

  // 过滤实体列表
  const filteredEntities = currentDiagram.entities.filter(entity => {
    const matchesSearch = searchTerm === '' || 
                         entity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entity.tableName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (entity.comment && entity.comment.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  // 实体表格列配置
  const entityColumns: ColumnsType<Entity> = [
    {
      title: '实体名',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Entity) => (
        <Space>
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: record.color || '#1890ff' }}
          />
          <Button type="link" onClick={() => handleEditEntity(record)}>
            {text}
          </Button>
        </Space>
      )
    },
    {
      title: '表名',
      dataIndex: 'tableName',
      key: 'tableName',
      render: (text: string) => <Text code>{text}</Text>
    },
    {
      title: '字段数',
      key: 'fieldCount',
      render: (_: any, record: Entity) => (
        <Badge count={record.fields.length} showZero />
      )
    },
    {
      title: '主键',
      key: 'primaryKeys',
      render: (_: any, record: Entity) => {
        const primaryKeys = record.fields.filter(f => f.primaryKey);
        return (
          <Space wrap>
            {primaryKeys.map(pk => (
              <Tag key={pk.id} color="gold">{pk.name}</Tag>
            ))}
          </Space>
        );
      }
    },
    {
      title: '备注',
      dataIndex: 'comment',
      key: 'comment',
      ellipsis: true
    },
    {
      title: '操作',
      key: 'actions',
      render: (_: any, record: Entity) => (
        <Space>
          <Tooltip title="编辑">
            <Button size="small" icon={<EditOutlined />} onClick={() => handleEditEntity(record)} />
          </Tooltip>
          <Tooltip title="复制">
            <Button size="small" icon={<CopyOutlined />} onClick={() => handleCopyEntity(record)} />
          </Tooltip>
          <Tooltip title="删除">
            <Button size="small" danger icon={<DeleteOutlined />} onClick={() => handleDeleteEntity(record)} />
          </Tooltip>
        </Space>
      )
    }
  ];

  // 字段表格列配置
  const fieldColumns: ColumnsType<EntityField> = [
    {
      title: '字段名',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: EntityField) => (
        <Space>
          {record.primaryKey && <Tag color="gold">PK</Tag>}
                          {record.unique && <Tag color="blue">UK</Tag>}
          <Text code>{text}</Text>
        </Space>
      )
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string, record: EntityField) => (
        <Text code>
          {type}{record.length ? `(${record.length})` : ''}
        </Text>
      )
    },
    {
      title: '可空',
      dataIndex: 'nullable',
      key: 'nullable',
      render: (nullable: boolean) => (
        <Tag color={nullable ? 'default' : 'red'}>
          {nullable ? 'YES' : 'NO'}
        </Tag>
      )
    },
    {
      title: '默认值',
      dataIndex: 'defaultValue',
      key: 'defaultValue',
      render: (value: string) => value ? <Text code>{value}</Text> : '-'
    },
    {
      title: '备注',
      dataIndex: 'comment',
      key: 'comment',
      ellipsis: true
    }
  ];

  // 关系表格列配置
  const relationshipColumns: ColumnsType<Relationship> = [
    {
      title: '关系名',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: '源实体',
      dataIndex: 'sourceEntity',
      key: 'sourceEntity',
      render: (entityId: string) => {
        const entity = currentDiagram.entities.find(e => e.id === entityId);
        return entity ? <Tag color="blue">{entity.name}</Tag> : entityId;
      }
    },
    {
      title: '目标实体',
      dataIndex: 'targetEntity',
      key: 'targetEntity',
      render: (entityId: string) => {
        const entity = currentDiagram.entities.find(e => e.id === entityId);
        return entity ? <Tag color="green">{entity.name}</Tag> : entityId;
      }
    },
    {
      title: '关系类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        const colors = {
          'one-to-one': 'purple',
          'one-to-many': 'orange',
          'many-to-many': 'red'
        };
        return <Tag color={colors[type as keyof typeof colors]}>{type}</Tag>;
      }
    },
    {
      title: '操作',
      key: 'actions',
      render: (_: any, record: Relationship) => (
        <Space>
          <Tooltip title="编辑">
            <Button size="small" icon={<EditOutlined />} onClick={() => handleEditRelationship(record)} />
          </Tooltip>
          <Tooltip title="删除">
            <Button size="small" danger icon={<DeleteOutlined />} onClick={() => handleDeleteRelationship(record)} />
          </Tooltip>
        </Space>
      )
    }
  ];

  // 处理新建实体
  const handleCreateEntity = () => {
    setSelectedEntity(null);
    entityForm.resetFields();
    setIsEntityModalVisible(true);
  };

  // 处理编辑实体
  const handleEditEntity = (entity: Entity) => {
    setSelectedEntity(entity);
    entityForm.setFieldsValue(entity);
    setIsEntityModalVisible(true);
  };

  // 处理复制实体
  const handleCopyEntity = (entity: Entity) => {
    const newEntity: Entity = {
      ...entity,
      id: `${entity.id}-copy-${Date.now()}`,
      name: `${entity.name}Copy`,
      tableName: `${entity.tableName}_copy`,
      position: { x: (entity.position?.x || 0) + 50, y: (entity.position?.y || 0) + 50 }
    };
    
    setCurrentDiagram(prev => ({
      ...prev,
      entities: [...prev.entities, newEntity],
      updatedAt: new Date()
    }));
    
    message.success('实体复制成功');
  };

  // 处理删除实体
  const handleDeleteEntity = (entity: Entity) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除实体 "${entity.name}" 吗？相关的关系也会被删除。`,
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: () => {
        setCurrentDiagram(prev => ({
          ...prev,
          entities: prev.entities.filter(e => e.id !== entity.id),
          relationships: prev.relationships.filter(r => 
            r.sourceEntity !== entity.id && r.targetEntity !== entity.id
          ),
          updatedAt: new Date()
        }));
        message.success('实体删除成功');
      }
    });
  };

  // 处理新建关系
  const handleCreateRelationship = () => {
    setSelectedRelationship(null);
    relationshipForm.resetFields();
    setIsRelationshipModalVisible(true);
  };

  // 处理编辑关系
  const handleEditRelationship = (relationship: Relationship) => {
    setSelectedRelationship(relationship);
    relationshipForm.setFieldsValue(relationship);
    setIsRelationshipModalVisible(true);
  };

  // 处理删除关系
  const handleDeleteRelationship = (relationship: Relationship) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除关系 "${relationship.name}" 吗？`,
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: () => {
        setCurrentDiagram(prev => ({
          ...prev,
          relationships: prev.relationships.filter(r => r.id !== relationship.id),
          updatedAt: new Date()
        }));
        message.success('关系删除成功');
      }
    });
  };

  // 保存实体
  const handleSaveEntity = async () => {
    try {
      const values = await entityForm.validateFields();
      
      if (selectedEntity) {
        // 更新实体
        setCurrentDiagram(prev => ({
          ...prev,
          entities: prev.entities.map(e => 
            e.id === selectedEntity.id ? { ...e, ...values } : e
          ),
          updatedAt: new Date()
        }));
        message.success('实体更新成功');
      } else {
        // 新建实体
        const newEntity: Entity = {
          id: `entity-${Date.now()}`,
          ...values,
          fields: [],
          position: { x: 100, y: 100 },
          color: '#1890ff'
        };
        
        setCurrentDiagram(prev => ({
          ...prev,
          entities: [...prev.entities, newEntity],
          updatedAt: new Date()
        }));
        message.success('实体创建成功');
      }
      
      setIsEntityModalVisible(false);
    } catch (error) {
      console.error('保存实体失败:', error);
    }
  };

  // 保存关系
  const handleSaveRelationship = async () => {
    try {
      const values = await relationshipForm.validateFields();
      
      if (selectedRelationship) {
        // 更新关系
        setCurrentDiagram(prev => ({
          ...prev,
          relationships: prev.relationships.map(r => 
            r.id === selectedRelationship.id ? { ...r, ...values } : r
          ),
          updatedAt: new Date()
        }));
        message.success('关系更新成功');
      } else {
        // 新建关系
        const newRelationship: Relationship = {
          id: `relationship-${Date.now()}`,
          ...values
        };
        
        setCurrentDiagram(prev => ({
          ...prev,
          relationships: [...prev.relationships, newRelationship],
          updatedAt: new Date()
        }));
        message.success('关系创建成功');
      }
      
      setIsRelationshipModalVisible(false);
    } catch (error) {
      console.error('保存关系失败:', error);
    }
  };

  // 生成ER图的Mermaid代码
  const generateERDiagram = () => {
    let mermaidCode = 'erDiagram\n';
    
    // 添加实体定义
    currentDiagram.entities.forEach(entity => {
      mermaidCode += `    ${entity.name} {\n`;
      entity.fields.forEach(field => {
        const type = field.length ? `${field.type}(${field.length})` : field.type;
        const constraints = [];
        if (field.primaryKey) constraints.push('PK');
        if (field.unique && !field.primaryKey) constraints.push('UK');
        if (!field.nullable) constraints.push('NOT NULL');
        
        const constraintStr = constraints.length > 0 ? ` "${constraints.join(', ')}"` : '';
        mermaidCode += `        ${type} ${field.name}${constraintStr}\n`;
      });
      mermaidCode += `    }\n`;
    });
    
    // 添加关系定义
    currentDiagram.relationships.forEach(rel => {
      const sourceEntity = currentDiagram.entities.find(e => e.id === rel.sourceEntity);
      const targetEntity = currentDiagram.entities.find(e => e.id === rel.targetEntity);
      
      if (sourceEntity && targetEntity) {
        let relationshipSymbol = '';
        switch (rel.type) {
          case 'one-to-one':
            relationshipSymbol = '||--||';
            break;
          case 'one-to-many':
            relationshipSymbol = '||--o{';
            break;
          case 'many-to-many':
            relationshipSymbol = '}o--o{';
            break;
        }
        
        mermaidCode += `    ${sourceEntity.name} ${relationshipSymbol} ${targetEntity.name} : "${rel.name}"\n`;
      }
    });
    
    return mermaidCode;
  };

  // 导出SQL脚本
  const handleExportSQL = () => {
    let sqlScript = '-- 数据库表结构\n\n';
    
    // 生成CREATE TABLE语句
    currentDiagram.entities.forEach(entity => {
      sqlScript += `-- ${entity.comment || entity.name}\n`;
      sqlScript += `CREATE TABLE ${entity.tableName} (\n`;
      
      const fieldDefinitions = entity.fields.map(field => {
        let definition = `    ${field.name} ${field.type}`;
        if (field.length) definition += `(${field.length})`;
        if (!field.nullable) definition += ' NOT NULL';
        if (field.unique && !field.primaryKey) definition += ' UNIQUE';
        if (field.defaultValue) definition += ` DEFAULT ${field.defaultValue}`;
        if (field.comment) definition += ` COMMENT '${field.comment}'`;
        return definition;
      });
      
      sqlScript += fieldDefinitions.join(',\n');
      
      // 添加主键约束
      const primaryKeys = entity.fields.filter(f => f.primaryKey);
      if (primaryKeys.length > 0) {
        const pkFields = primaryKeys.map(pk => pk.name).join(', ');
        sqlScript += `,\n    PRIMARY KEY (${pkFields})`;
      }
      
      sqlScript += `\n)${entity.comment ? ` COMMENT='${entity.comment}'` : ''};\n\n`;
    });
    
    // 生成外键约束
    currentDiagram.relationships.forEach(rel => {
      const sourceEntity = currentDiagram.entities.find(e => e.id === rel.sourceEntity);
      const targetEntity = currentDiagram.entities.find(e => e.id === rel.targetEntity);
      
      if (sourceEntity && targetEntity) {
        sqlScript += `-- 外键约束: ${rel.name}\n`;
        sqlScript += `ALTER TABLE ${targetEntity.tableName} ADD CONSTRAINT fk_${rel.name} `;
        sqlScript += `FOREIGN KEY (${rel.targetField}) REFERENCES ${sourceEntity.tableName}(${rel.sourceField})`;
        sqlScript += ` ON DELETE ${rel.onDelete} ON UPDATE ${rel.onUpdate};\n\n`;
      }
    });
    
    // 下载文件
    const blob = new Blob([sqlScript], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentDiagram.name.replace(/\s+/g, '_')}.sql`;
    link.click();
    URL.revokeObjectURL(url);
    
    message.success('SQL脚本导出成功');
  };

  return (
    <div className="p-6">
      {/* 页面头部 */}
      <div className="mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <Title level={2} className="mb-2">
              <DatabaseOutlined className="mr-2" />
              实体模型设计
            </Title>
            <Text type="secondary" className="text-lg">
              设计和管理数据库实体关系图（ER图）
            </Text>
          </div>
          <Space>
            <Button icon={<ImportOutlined />}>
              导入模型
            </Button>
            <Button icon={<ExportOutlined />} onClick={handleExportSQL}>
              导出SQL
            </Button>
            <Button
              type="primary"
              icon={<EyeOutlined />}
              onClick={() => setIsERDiagramVisible(true)}
            >
              查看ER图
            </Button>
          </Space>
        </div>
        
        {/* 图表信息 */}
        <Card size="small" className="mb-4">
          <Row gutter={16}>
            <Col span={6}>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {currentDiagram.entities.length}
                </div>
                <div className="text-gray-500">实体数量</div>
              </div>
            </Col>
            <Col span={6}>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {currentDiagram.relationships.length}
                </div>
                <div className="text-gray-500">关系数量</div>
              </div>
            </Col>
            <Col span={6}>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {currentDiagram.entities.reduce((sum, entity) => sum + entity.fields.length, 0)}
                </div>
                <div className="text-gray-500">字段总数</div>
              </div>
            </Col>
            <Col span={6}>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {currentDiagram.entities.reduce((sum, entity) => 
                    sum + entity.fields.filter(f => f.primaryKey).length, 0
                  )}
                </div>
                <div className="text-gray-500">主键数量</div>
              </div>
            </Col>
          </Row>
        </Card>
      </div>
      
      {/* 主要内容 */}
      <Card>
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          items={[
            {
              key: 'entities',
              label: (
                <Space>
                  <TableOutlined />
                  <span>实体管理</span>
                  <Badge count={currentDiagram.entities.length} showZero />
                </Space>
              ),
              children: (
                <div>
                  <div className="mb-4">
                    <Row gutter={16} align="middle">
                      <Col span={8}>
                        <Search
                          placeholder="搜索实体名、表名或备注"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          allowClear
                        />
                      </Col>
                      <Col span={8}>
                        <Button
                          type="primary"
                          icon={<PlusOutlined />}
                          onClick={handleCreateEntity}
                        >
                          新建实体
                        </Button>
                      </Col>
                      <Col span={8}>
                        <Text type="secondary">
                          共 {filteredEntities.length} 个实体
                        </Text>
                      </Col>
                    </Row>
                  </div>
                  
                  <Table
                    dataSource={filteredEntities}
                    columns={entityColumns}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                    expandable={{
                      expandedRowRender: (record: Entity) => (
                        <div className="p-4">
                          <Title level={5}>字段列表</Title>
                          <Table
                            dataSource={record.fields}
                            columns={fieldColumns}
                            rowKey="id"
                            pagination={false}
                            size="small"
                          />
                        </div>
                      ),
                      rowExpandable: (record: Entity) => record.fields.length > 0
                    }}
                  />
                </div>
              )
             },
             {
               key: 'relationships',
               label: (
                 <Space>
                   <LinkOutlined />
                   <span>关系管理</span>
                   <Badge count={currentDiagram.relationships.length} showZero />
                 </Space>
               ),
               children: (
                 <div>
                   <div className="mb-4">
                     <Row gutter={16} align="middle">
                       <Col span={8}>
                         <Button
                           type="primary"
                           icon={<PlusOutlined />}
                           onClick={handleCreateRelationship}
                         >
                           新建关系
                         </Button>
                       </Col>
                       <Col span={8}>
                         <Text type="secondary">
                           共 {currentDiagram.relationships.length} 个关系
                         </Text>
                       </Col>
                     </Row>
                   </div>
                   
                   <Table
                     dataSource={currentDiagram.relationships}
                     columns={relationshipColumns}
                     rowKey="id"
                     pagination={{ pageSize: 10 }}
                   />
                 </div>
               )
             }
           ]}
         />
      </Card>
      
      {/* 实体编辑模态框 */}
      <Modal
        title={`${selectedEntity ? '编辑' : '新建'}实体`}
        open={isEntityModalVisible}
        onCancel={() => setIsEntityModalVisible(false)}
        onOk={handleSaveEntity}
        width={600}
      >
        <Form form={entityForm} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="实体名"
                rules={[{ required: true, message: '请输入实体名' }]}
              >
                <Input placeholder="如：User" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="tableName"
                label="表名"
                rules={[{ required: true, message: '请输入表名' }]}
              >
                <Input placeholder="如：users" />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            name="comment"
            label="备注"
          >
            <TextArea rows={3} placeholder="实体描述" />
          </Form.Item>
          
          <Form.Item
            name="color"
            label="颜色"
          >
            <Select placeholder="选择颜色">
              <Option value="#1890ff">蓝色</Option>
              <Option value="#52c41a">绿色</Option>
              <Option value="#fa8c16">橙色</Option>
              <Option value="#eb2f96">粉色</Option>
              <Option value="#722ed1">紫色</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
      
      {/* 关系编辑模态框 */}
      <Modal
        title={`${selectedRelationship ? '编辑' : '新建'}关系`}
        open={isRelationshipModalVisible}
        onCancel={() => setIsRelationshipModalVisible(false)}
        onOk={handleSaveRelationship}
        width={600}
      >
        <Form form={relationshipForm} layout="vertical">
          <Form.Item
            name="name"
            label="关系名"
            rules={[{ required: true, message: '请输入关系名' }]}
          >
            <Input placeholder="如：UserToRole" />
          </Form.Item>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="sourceEntity"
                label="源实体"
                rules={[{ required: true, message: '请选择源实体' }]}
              >
                <Select placeholder="选择源实体">
                  {currentDiagram.entities.map(entity => (
                    <Option key={entity.id} value={entity.id}>{entity.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="targetEntity"
                label="目标实体"
                rules={[{ required: true, message: '请选择目标实体' }]}
              >
                <Select placeholder="选择目标实体">
                  {currentDiagram.entities.map(entity => (
                    <Option key={entity.id} value={entity.id}>{entity.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="sourceField"
                label="源字段"
                rules={[{ required: true, message: '请输入源字段' }]}
              >
                <Input placeholder="如：id" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="targetField"
                label="目标字段"
                rules={[{ required: true, message: '请输入目标字段' }]}
              >
                <Input placeholder="如：user_id" />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            name="type"
            label="关系类型"
            rules={[{ required: true, message: '请选择关系类型' }]}
          >
            <Select placeholder="选择关系类型">
              <Option value="one-to-one">一对一</Option>
              <Option value="one-to-many">一对多</Option>
              <Option value="many-to-many">多对多</Option>
            </Select>
          </Form.Item>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="onDelete"
                label="删除时"
                rules={[{ required: true, message: '请选择删除策略' }]}
              >
                <Select placeholder="选择删除策略">
                  <Option value="CASCADE">CASCADE</Option>
                  <Option value="SET NULL">SET NULL</Option>
                  <Option value="RESTRICT">RESTRICT</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="onUpdate"
                label="更新时"
                rules={[{ required: true, message: '请选择更新策略' }]}
              >
                <Select placeholder="选择更新策略">
                  <Option value="CASCADE">CASCADE</Option>
                  <Option value="SET NULL">SET NULL</Option>
                  <Option value="RESTRICT">RESTRICT</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
      
      {/* ER图查看模态框 */}
      <Modal
        title={currentDiagram.name}
        open={isERDiagramVisible}
        onCancel={() => setIsERDiagramVisible(false)}
        width={1200}
        footer={[
          <Button key="close" onClick={() => setIsERDiagramVisible(false)}>
            关闭
          </Button>
        ]}
      >
        <MermaidChart
          chart={{
            id: 'er-diagram',
            type: 'entity-relationship',
            code: generateERDiagram(),
            title: currentDiagram.name
          }}
          height={600}
        />
      </Modal>
    </div>
  );
};

export default EntityModel;