import { 
  MCPPlugin, 
  PluginCategory, 
  PluginPermission, 
  PluginStatus,
  MCPCommand,
  MCPParameter
} from '../../types/plugins';
import { EventEmitter } from 'events';

/**
 * 领域建模MCP插件
 * 提供领域驱动设计(DDD)相关的建模和分析功能
 */
export class DomainModelingPlugin extends EventEmitter implements MCPPlugin {
  readonly id = 'domain-modeling';
  readonly name = '领域建模插件';
  readonly version = '1.0.0';
  readonly description = '基于领域驱动设计(DDD)的智能建模工具，支持实体识别、聚合设计、领域服务分析等功能';
  readonly author = 'AI Design Tool Team';
  readonly category = PluginCategory.MODELING;
  readonly tags = ['DDD', '领域建模', '实体设计', '聚合根', '领域服务'];
  readonly permissions = [
    PluginPermission.READ_PROJECT,
    PluginPermission.WRITE_FILES,
    PluginPermission.GENERATE_DIAGRAMS,
    PluginPermission.ANALYZE_CODE
  ];
  readonly dependencies: string[] = [];
  readonly license = 'MIT';
  
  private _status: PluginStatus = PluginStatus.INACTIVE;
  private _config: Record<string, any> = {};
  private domainKnowledge: Map<string, any> = new Map();
  private modelingHistory: Array<any> = [];
  private entityTemplates: Map<string, any> = new Map();

  constructor() {
    super();
    this.initializeTemplates();
  }

  get status(): PluginStatus {
    return this._status;
  }

  get config(): Record<string, any> {
    return { ...this._config };
  }

  get commands(): MCPCommand[] {
    return [
      {
        name: 'analyze-domain',
        description: '分析业务领域并识别核心概念',
        parameters: [
          {
            name: 'businessDescription',
            type: 'string',
            description: '业务描述或需求文档',
            required: true
          },
          {
            name: 'analysisDepth',
            type: 'string',
            description: '分析深度：basic | detailed | comprehensive',
            required: false,
            defaultValue: 'detailed'
          }
        ]
      },
      {
        name: 'identify-entities',
        description: '识别领域实体和值对象',
        parameters: [
          {
            name: 'domainContext',
            type: 'string',
            description: '领域上下文描述',
            required: true
          },
          {
            name: 'includeValueObjects',
            type: 'boolean',
            description: '是否包含值对象识别',
            required: false,
            defaultValue: true
          }
        ]
      },
      {
        name: 'design-aggregates',
        description: '设计聚合和聚合根',
        parameters: [
          {
            name: 'entities',
            type: 'array',
            description: '实体列表',
            required: true
          },
          {
            name: 'businessRules',
            type: 'array',
            description: '业务规则列表',
            required: false,
            defaultValue: []
          }
        ]
      },
      {
        name: 'generate-domain-model',
        description: '生成领域模型代码',
        parameters: [
          {
            name: 'modelDefinition',
            type: 'object',
            description: '模型定义',
            required: true
          },
          {
            name: 'language',
            type: 'string',
            description: '目标编程语言：typescript | java | csharp',
            required: false,
            defaultValue: 'typescript'
          },
          {
            name: 'framework',
            type: 'string',
            description: '目标框架：none | nestjs | spring | dotnet',
            required: false,
            defaultValue: 'none'
          }
        ]
      },
      {
        name: 'create-domain-diagram',
        description: '创建领域模型图',
        parameters: [
          {
            name: 'domainModel',
            type: 'object',
            description: '领域模型数据',
            required: true
          },
          {
            name: 'diagramType',
            type: 'string',
            description: '图表类型：class | entity-relationship | aggregate',
            required: false,
            defaultValue: 'class'
          },
          {
            name: 'format',
            type: 'string',
            description: '输出格式：mermaid | plantuml',
            required: false,
            defaultValue: 'mermaid'
          }
        ]
      },
      {
        name: 'suggest-domain-services',
        description: '建议领域服务设计',
        parameters: [
          {
            name: 'aggregates',
            type: 'array',
            description: '聚合列表',
            required: true
          },
          {
            name: 'businessProcesses',
            type: 'array',
            description: '业务流程列表',
            required: false,
            defaultValue: []
          }
        ]
      },
      {
        name: 'validate-domain-model',
        description: '验证领域模型的一致性和完整性',
        parameters: [
          {
            name: 'domainModel',
            type: 'object',
            description: '待验证的领域模型',
            required: true
          }
        ]
      }
    ];
  }

  async activate(): Promise<void> {
    try {
      this._status = PluginStatus.ACTIVATING;
      this.emit('statusChanged', this._status);
      
      await this.loadConfiguration();
      await this.initializeDomainKnowledge();
      
      this._status = PluginStatus.ACTIVE;
      this.emit('statusChanged', this._status);
      this.emit('activated');
    } catch (error) {
      this._status = PluginStatus.ERROR;
      this.emit('statusChanged', this._status);
      this.emit('error', error);
      throw error;
    }
  }

  async deactivate(): Promise<void> {
    try {
      this._status = PluginStatus.DEACTIVATING;
      this.emit('statusChanged', this._status);
      
      // 清理资源
      this.domainKnowledge.clear();
      this.modelingHistory = [];
      
      this._status = PluginStatus.INACTIVE;
      this.emit('statusChanged', this._status);
      this.emit('deactivated');
    } catch (error) {
      this._status = PluginStatus.ERROR;
      this.emit('statusChanged', this._status);
      this.emit('error', error);
      throw error;
    }
  }

  async install(): Promise<void> {
    this._status = PluginStatus.INSTALLING;
    this.emit('statusChanged', this._status);
    try {
      this._status = PluginStatus.INSTALLED;
      this.emit('statusChanged', this._status);
      this.emit('installed');
    } catch (error) {
      this._status = PluginStatus.ERROR;
      this.emit('statusChanged', this._status);
      this.emit('error', error);
      throw error;
    }
  }

  async uninstall(): Promise<void> {
    try {
      this._status = PluginStatus.REGISTERED;
      this.emit('statusChanged', this._status);
      this.emit('uninstalled');
    } catch (error) {
      this._status = PluginStatus.ERROR;
      this.emit('statusChanged', this._status);
      this.emit('error', error);
      throw error;
    }
  }

  async executeCommand(commandName: string, parameters: Record<string, any>): Promise<any> {
    if (this._status !== PluginStatus.ACTIVE) {
      throw new Error('插件未激活');
    }

    try {
      switch (commandName) {
        case 'analyze-domain':
          return await this.analyzeDomain(parameters.businessDescription, parameters.analysisDepth);
        case 'identify-entities':
          return await this.identifyEntities(parameters.domainContext, parameters.includeValueObjects);
        case 'design-aggregates':
          return await this.designAggregates(parameters.entities, parameters.businessRules);
        case 'generate-domain-model':
          return await this.generateDomainModel(parameters.modelDefinition, parameters.language, parameters.framework);
        case 'create-domain-diagram':
          return await this.createDomainDiagram(parameters.domainModel, parameters.diagramType, parameters.format);
        case 'suggest-domain-services':
          return await this.suggestDomainServices(parameters.aggregates, parameters.businessProcesses);
        case 'validate-domain-model':
          return await this.validateDomainModel(parameters.domainModel);
        default:
          throw new Error(`未知命令: ${commandName}`);
      }
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  async execute(commandName: string, parameters: Record<string, any>): Promise<any> {
    return this.executeCommand(commandName, parameters);
  }

  getCommands(): MCPCommand[] {
    return this.commands;
  }

  getSchema(): any {
    return {
      id: this.id,
      name: this.name,
      version: this.version,
      description: this.description,
      commands: this.commands,
      permissions: this.permissions
    };
  }

  updateConfig(newConfig: Record<string, any>): void {
    this._config = { ...this._config, ...newConfig };
    this.emit('configUpdated', this._config);
  }

  // 核心功能实现
  async analyzeDomain(businessDescription: string, analysisDepth: string = 'detailed'): Promise<any> {
    const analysis = {
      concepts: this.extractDomainConcepts(businessDescription),
      businessRules: this.extractBusinessRules(businessDescription),
      domainEvents: this.identifyDomainEvents(businessDescription),
      boundedContexts: [],
      ubiquitousLanguage: new Map(),
      recommendations: []
    };

    // 去重和优化概念
    analysis.concepts = this.deduplicateConcepts(analysis.concepts);

    if (analysisDepth === 'detailed' || analysisDepth === 'comprehensive') {
      analysis.boundedContexts = this.identifyBoundedContexts(analysis.concepts);
      analysis.ubiquitousLanguage = this.buildUbiquitousLanguage(analysis.concepts);
    }

    if (analysisDepth === 'comprehensive') {
      // 深度分析
      analysis.recommendations = this.generateAnalysisRecommendations(analysis);
    }

    this.emit('domainAnalyzed', analysis);
    return analysis;
  }

  async identifyEntities(domainContext: string, includeValueObjects: boolean = true): Promise<any> {
    const result = {
      entities: [],
      valueObjects: [],
      recommendations: []
    };

    const entityCandidates = this.extractEntityCandidates(domainContext);
    
    for (const candidate of entityCandidates) {
      const entity = {
        name: candidate.name,
        description: candidate.description,
        attributes: this.identifyEntityAttributes(candidate),
        behaviors: this.identifyEntityBehaviors(candidate),
        businessRules: this.identifyEntityBusinessRules(candidate),
        isAggregateRoot: this.isAggregateRootCandidate(candidate)
      };
      result.entities.push(entity);
    }

    if (includeValueObjects) {
      const valueObjectCandidates = this.extractValueObjectCandidates(domainContext);
      
      for (const candidate of valueObjectCandidates) {
        const valueObject = {
          name: candidate.name,
          description: candidate.description,
          attributes: this.identifyValueObjectAttributes(candidate),
          validationRules: this.identifyValidationRules(candidate)
        };
        result.valueObjects.push(valueObject);
      }
    }

    result.recommendations = this.generateEntityRecommendations(result.entities, result.valueObjects);

    this.emit('entitiesIdentified', result);
    return result;
  }

  async designAggregates(entities: any[], businessRules: any[] = []): Promise<any> {
    const aggregates = [];
    const ungroupedEntities = [...entities];

    // 基于聚合根设计聚合
    for (const entity of entities) {
      if (entity.isAggregateRoot) {
        const aggregate = {
          name: `${entity.name}Aggregate`,
          aggregateRoot: entity,
          entities: [entity],
          valueObjects: [],
          domainEvents: this.identifyAggregateEvents(entity),
          invariants: this.identifyAggregateInvariants(entity, businessRules)
        };

        // 查找相关实体
        const relatedEntities = this.findRelatedEntities(entity, entities);
        for (const related of relatedEntities) {
          if (!related.isAggregateRoot) {
            aggregate.entities.push(related);
            const index = ungroupedEntities.indexOf(related);
            if (index > -1) {
              ungroupedEntities.splice(index, 1);
            }
          }
        }

        aggregates.push(aggregate);
      }
    }

    // 处理未分组的实体
    for (const entity of ungroupedEntities) {
      const aggregate = {
        name: `${entity.name}Aggregate`,
        aggregateRoot: entity,
        entities: [entity],
        valueObjects: [],
        domainEvents: this.identifyAggregateEvents(entity),
        invariants: this.identifyAggregateInvariants(entity, businessRules)
      };
      aggregates.push(aggregate);
    }

    this.emit('aggregatesDesigned', aggregates);
    return aggregates;
  }

  async generateDomainModel(modelDefinition: any, language: string = 'typescript', framework: string = 'none'): Promise<any> {
    const generatedCode = {
      entities: [],
      valueObjects: [],
      aggregates: [],
      domainServices: [],
      repositories: []
    };

    // 生成实体代码
    for (const entity of modelDefinition.entities || []) {
      const code = this.generateEntityCode(entity, language, framework);
      generatedCode.entities.push({
        name: entity.name,
        fileName: `${entity.name}.${this.getFileExtension(language)}`,
        code
      });
    }

    this.emit('domainModelGenerated', generatedCode);
    return generatedCode;
  }

  async createDomainDiagram(domainModel: any, diagramType: string = 'class', format: string = 'mermaid'): Promise<string> {
    switch (diagramType) {
      case 'class':
        return format === 'mermaid' 
          ? this.generateMermaidClassDiagram(domainModel)
          : this.generatePlantUMLClassDiagram(domainModel);
      case 'entity-relationship':
        return format === 'mermaid'
          ? this.generateMermaidERDiagram(domainModel)
          : this.generatePlantUMLERDiagram(domainModel);
      default:
        throw new Error(`不支持的图表类型: ${diagramType}`);
    }
  }

  async suggestDomainServices(aggregates: any[], businessProcesses: any[] = []): Promise<any[]> {
    const domainServices = [];

    // 基于聚合间交互识别领域服务
    for (let i = 0; i < aggregates.length; i++) {
      for (let j = i + 1; j < aggregates.length; j++) {
        const interactions = this.identifyAggregateInteractions(aggregates[i], aggregates[j]);
        
        for (const interaction of interactions) {
          domainServices.push({
            name: `${interaction.name}Service`,
            description: interaction.description,
            involvedAggregates: [aggregates[i].name, aggregates[j].name],
            operations: interaction.operations,
            type: 'coordination'
          });
        }
      }
    }

    this.emit('domainServicesSuggested', domainServices);
    return domainServices;
  }

  async validateDomainModel(domainModel: any): Promise<any> {
    const validation = {
      isValid: true,
      errors: [],
      warnings: [],
      suggestions: []
    };

    // 验证实体
    for (const entity of domainModel.entities || []) {
      this.validateEntity(entity, validation);
    }

    return validation;
  }

  // 辅助方法
  private initializeTemplates(): void {
    // TypeScript 实体模板
    this.entityTemplates.set('typescript', {
      classTemplate: `export class {name} {
  private _id: string;
  {attributes}
  
  constructor({constructorParams}) {
    {constructorBody}
  }
  
  {methods}
}`,
      attributeTemplate: 'private _{name}: {type};',
      methodTemplate: '{visibility} {name}({params}): {returnType} {\n    {body}\n  }'
    });

    // Java 实体模板
    this.entityTemplates.set('java', {
      classTemplate: `@Entity
@Table(name = "{tableName}")
public class {name} {
    {attributes}
    
    public {name}({constructorParams}) {
        {constructorBody}
    }
    
    {methods}
}`,
      attributeTemplate: '@Column\nprivate {type} {name};',
      methodTemplate: 'public {returnType} {name}({params}) {\n    {body}\n}'
    });

    // C# 实体模板
    this.entityTemplates.set('csharp', {
      classTemplate: `public class {name} : Entity
{
    {attributes}
    
    public {name}({constructorParams})
    {
        {constructorBody}
    }
    
    {methods}
}`,
      attributeTemplate: 'public {type} {name} { get; private set; }',
      methodTemplate: 'public {returnType} {name}({params})\n{\n    {body}\n}'
    });

    // 业务场景示例模板
    this.entityTemplates.set('examples', {
      ecommerce: {
        entities: [
          {
            name: 'Product',
            description: '商品实体',
            attributes: [
              { name: 'name', type: 'string', description: '商品名称' },
              { name: 'price', type: 'Money', description: '商品价格' },
              { name: 'category', type: 'Category', description: '商品分类' },
              { name: 'inventory', type: 'number', description: '库存数量' }
            ],
            behaviors: [
              { name: 'updatePrice', description: '更新价格' },
              { name: 'adjustInventory', description: '调整库存' },
              { name: 'changeCategory', description: '变更分类' }
            ]
          },
          {
            name: 'Order',
            description: '订单聚合根',
            attributes: [
              { name: 'orderNumber', type: 'string', description: '订单号' },
              { name: 'customerId', type: 'string', description: '客户ID' },
              { name: 'orderItems', type: 'OrderItem[]', description: '订单项' },
              { name: 'totalAmount', type: 'Money', description: '订单总额' },
              { name: 'status', type: 'OrderStatus', description: '订单状态' }
            ],
            behaviors: [
              { name: 'addItem', description: '添加订单项' },
              { name: 'removeItem', description: '移除订单项' },
              { name: 'confirm', description: '确认订单' },
              { name: 'cancel', description: '取消订单' },
              { name: 'ship', description: '发货' }
            ]
          },
          {
            name: 'Customer',
            description: '客户实体',
            attributes: [
              { name: 'email', type: 'Email', description: '邮箱地址' },
              { name: 'name', type: 'string', description: '客户姓名' },
              { name: 'address', type: 'Address', description: '收货地址' },
              { name: 'memberLevel', type: 'MemberLevel', description: '会员等级' }
            ],
            behaviors: [
              { name: 'updateProfile', description: '更新个人信息' },
              { name: 'addAddress', description: '添加收货地址' },
              { name: 'upgradeMembership', description: '升级会员' }
            ]
          }
        ],
        valueObjects: [
          {
            name: 'Money',
            description: '金额值对象',
            attributes: [
              { name: 'amount', type: 'number', description: '金额' },
              { name: 'currency', type: 'string', description: '货币类型' }
            ]
          },
          {
            name: 'Address',
            description: '地址值对象',
            attributes: [
              { name: 'street', type: 'string', description: '街道' },
              { name: 'city', type: 'string', description: '城市' },
              { name: 'zipCode', type: 'string', description: '邮编' },
              { name: 'country', type: 'string', description: '国家' }
            ]
          },
          {
            name: 'Email',
            description: '邮箱值对象',
            attributes: [
              { name: 'value', type: 'string', description: '邮箱地址' }
            ],
            validationRules: [
              { rule: 'format', description: '必须符合邮箱格式' },
              { rule: 'unique', description: '邮箱地址必须唯一' }
            ]
          }
        ],
        domainServices: [
          {
            name: 'PricingService',
            description: '定价服务',
            operations: [
              { name: 'calculateDiscount', description: '计算折扣' },
              { name: 'applyPromotion', description: '应用促销' }
            ]
          },
          {
            name: 'InventoryService',
            description: '库存服务',
            operations: [
              { name: 'reserveStock', description: '预留库存' },
              { name: 'releaseStock', description: '释放库存' }
            ]
          }
        ]
      },
      banking: {
        entities: [
          {
            name: 'Account',
            description: '银行账户聚合根',
            attributes: [
              { name: 'accountNumber', type: 'string', description: '账户号码' },
              { name: 'balance', type: 'Money', description: '账户余额' },
              { name: 'accountType', type: 'AccountType', description: '账户类型' },
              { name: 'ownerId', type: 'string', description: '账户所有者ID' }
            ],
            behaviors: [
              { name: 'deposit', description: '存款' },
              { name: 'withdraw', description: '取款' },
              { name: 'transfer', description: '转账' },
              { name: 'freeze', description: '冻结账户' }
            ]
          },
          {
            name: 'Transaction',
            description: '交易实体',
            attributes: [
              { name: 'transactionId', type: 'string', description: '交易ID' },
              { name: 'amount', type: 'Money', description: '交易金额' },
              { name: 'type', type: 'TransactionType', description: '交易类型' },
              { name: 'timestamp', type: 'Date', description: '交易时间' },
              { name: 'description', type: 'string', description: '交易描述' }
            ]
          }
        ],
        valueObjects: [
          {
            name: 'AccountNumber',
            description: '账户号码值对象',
            attributes: [
              { name: 'value', type: 'string', description: '账户号码' }
            ],
            validationRules: [
              { rule: 'format', description: '必须符合银行账户号码格式' },
              { rule: 'checksum', description: '必须通过校验位验证' }
            ]
          }
        ]
      },
      healthcare: {
        entities: [
          {
            name: 'Patient',
            description: '患者实体',
            attributes: [
              { name: 'patientId', type: 'string', description: '患者ID' },
              { name: 'name', type: 'string', description: '患者姓名' },
              { name: 'dateOfBirth', type: 'Date', description: '出生日期' },
              { name: 'medicalHistory', type: 'MedicalRecord[]', description: '病历记录' }
            ],
            behaviors: [
              { name: 'addMedicalRecord', description: '添加病历' },
              { name: 'updateContactInfo', description: '更新联系信息' }
            ]
          },
          {
            name: 'Appointment',
            description: '预约聚合根',
            attributes: [
              { name: 'appointmentId', type: 'string', description: '预约ID' },
              { name: 'patientId', type: 'string', description: '患者ID' },
              { name: 'doctorId', type: 'string', description: '医生ID' },
              { name: 'scheduledTime', type: 'Date', description: '预约时间' },
              { name: 'status', type: 'AppointmentStatus', description: '预约状态' }
            ],
            behaviors: [
              { name: 'schedule', description: '安排预约' },
              { name: 'reschedule', description: '重新安排' },
              { name: 'cancel', description: '取消预约' },
              { name: 'complete', description: '完成预约' }
            ]
          }
        ]
      }
    });
  }

  private async loadConfiguration(): Promise<void> {
    this._config = {
      defaultLanguage: 'typescript',
      defaultFramework: 'none',
      generateRepositories: true,
      generateDomainEvents: true,
      strictValidation: true
    };
  }

  private async initializeDomainKnowledge(): Promise<void> {
    // 通用DDD模式
    this.domainKnowledge.set('commonPatterns', [
      'Entity', 'ValueObject', 'AggregateRoot', 'DomainService', 'Repository',
      'Factory', 'Specification', 'DomainEvent', 'ApplicationService'
    ]);

    // 实体识别关键词
    this.domainKnowledge.set('entityKeywords', [
      '用户', '客户', '订单', '商品', '产品', '账户', '交易', '支付',
      '库存', '分类', '评价', '地址', '发票', '优惠券', '积分',
      '患者', '医生', '预约', '病历', '药品', '处方', '科室',
      '学生', '教师', '课程', '班级', '成绩', '考试', '作业',
      '员工', '部门', '项目', '任务', '会议', '文档', '合同'
    ]);

    // 值对象识别关键词
    this.domainKnowledge.set('valueObjectKeywords', [
      '金额', '价格', '数量', '重量', '尺寸', '颜色', '规格',
      '邮箱', '电话', '地址', '邮编', '身份证', '银行卡',
      '时间', '日期', '期间', '范围', '坐标', '位置',
      '评分', '等级', '状态', '类型', '编码', '标识'
    ]);

    // 聚合根识别规则
    this.domainKnowledge.set('aggregateRootRules', [
      {
        pattern: '订单',
        reason: '订单是业务流程的核心，具有独立的生命周期',
        relatedEntities: ['订单项', '收货地址', '支付信息']
      },
      {
        pattern: '用户|客户',
        reason: '用户是系统的核心概念，具有独立身份',
        relatedEntities: ['个人信息', '联系方式', '偏好设置']
      },
      {
        pattern: '账户',
        reason: '账户具有独立的业务规则和状态管理',
        relatedEntities: ['余额', '交易记录', '安全设置']
      },
      {
        pattern: '项目',
        reason: '项目是工作管理的核心单元',
        relatedEntities: ['任务', '成员', '里程碑', '资源']
      }
    ]);

    // 业务规则模式
    this.domainKnowledge.set('businessRulePatterns', [
      {
        pattern: /不能|禁止|不允许/,
        type: 'invariant',
        priority: 'high',
        description: '不变性约束'
      },
      {
        pattern: /必须|需要|要求/,
        type: 'validation',
        priority: 'high',
        description: '验证规则'
      },
      {
        pattern: /当.*时|如果.*则/,
        type: 'business_logic',
        priority: 'medium',
        description: '业务逻辑规则'
      },
      {
        pattern: /应该|建议|推荐/,
        type: 'guideline',
        priority: 'low',
        description: '指导原则'
      }
    ]);

    // 领域事件模式
    this.domainKnowledge.set('domainEventPatterns', [
      {
        pattern: /创建|新建|注册/,
        eventSuffix: 'Created',
        description: '实体创建事件'
      },
      {
        pattern: /更新|修改|变更/,
        eventSuffix: 'Updated',
        description: '实体更新事件'
      },
      {
        pattern: /删除|移除|取消/,
        eventSuffix: 'Deleted',
        description: '实体删除事件'
      },
      {
        pattern: /完成|结束|关闭/,
        eventSuffix: 'Completed',
        description: '流程完成事件'
      },
      {
        pattern: /开始|启动|激活/,
        eventSuffix: 'Started',
        description: '流程开始事件'
      }
    ]);

    // 常见的领域服务场景
    this.domainKnowledge.set('domainServiceScenarios', [
      {
        name: '定价服务',
        description: '处理复杂的定价逻辑，涉及多个聚合',
        triggers: ['价格计算', '折扣应用', '促销规则'],
        involvedAggregates: ['商品', '订单', '客户', '促销活动']
      },
      {
        name: '库存服务',
        description: '管理库存分配和预留',
        triggers: ['库存预留', '库存释放', '库存调拨'],
        involvedAggregates: ['商品', '订单', '仓库']
      },
      {
        name: '支付服务',
        description: '处理支付流程和状态同步',
        triggers: ['支付处理', '退款处理', '支付状态同步'],
        involvedAggregates: ['订单', '支付', '账户']
      },
      {
        name: '通知服务',
        description: '处理跨聚合的通知逻辑',
        triggers: ['状态变更通知', '定时提醒', '异常告警'],
        involvedAggregates: ['用户', '订单', '系统设置']
      }
    ]);

    // 架构模式建议
    this.domainKnowledge.set('architecturePatterns', [
      {
        name: 'CQRS',
        description: '命令查询职责分离',
        applicableWhen: ['读写操作差异很大', '需要不同的数据模型', '性能要求高'],
        benefits: ['读写分离', '性能优化', '模型简化']
      },
      {
        name: 'Event Sourcing',
        description: '事件溯源',
        applicableWhen: ['需要完整的操作历史', '审计要求严格', '状态重建需求'],
        benefits: ['完整历史', '审计跟踪', '状态重建']
      },
      {
        name: 'Saga Pattern',
        description: '分布式事务管理',
        applicableWhen: ['跨聚合事务', '分布式系统', '长时间运行的业务流程'],
        benefits: ['事务一致性', '错误恢复', '流程编排']
      }
    ]);

    // 代码生成模板扩展
    this.domainKnowledge.set('codeTemplates', {
      domainEvent: {
        typescript: `export class {eventName} implements DomainEvent {
  readonly occurredOn: Date;
  readonly aggregateId: string;
  readonly eventVersion: number;
  
  constructor(
    aggregateId: string,
    public readonly {eventData}
  ) {
    this.aggregateId = aggregateId;
    this.occurredOn = new Date();
    this.eventVersion = 1;
  }
}`,
        java: `public class {eventName} implements DomainEvent {
    private final String aggregateId;
    private final LocalDateTime occurredOn;
    private final int eventVersion;
    {eventFields}
    
    public {eventName}(String aggregateId, {constructorParams}) {
        this.aggregateId = aggregateId;
        this.occurredOn = LocalDateTime.now();
        this.eventVersion = 1;
        {fieldAssignments}
    }
    
    // getters...
}`
      },
      repository: {
        typescript: `export interface {entityName}Repository {
  findById(id: string): Promise<{entityName} | null>;
  save(entity: {entityName}): Promise<void>;
  delete(id: string): Promise<void>;
  findBy(criteria: {entityName}Criteria): Promise<{entityName}[]>;
}`,
        java: `public interface {entityName}Repository {
    Optional<{entityName}> findById({entityName}Id id);
    void save({entityName} entity);
    void delete({entityName}Id id);
    List<{entityName}> findBy({entityName}Criteria criteria);
}`
      },
      domainService: {
        typescript: `export class {serviceName} {
  constructor(
    {dependencies}
  ) {}
  
  {operations}
}`,
        java: `@Service
public class {serviceName} {
    {dependencies}
    
    public {serviceName}({constructorParams}) {
        {fieldAssignments}
    }
    
    {operations}
}`
      }
    });
  }

  private extractDomainConcepts(description: string): any[] {
    const concepts = [];
    const lines = description.split('\n');
    const entityKeywords = this.domainKnowledge.get('entityKeywords') || [];
    const valueObjectKeywords = this.domainKnowledge.get('valueObjectKeywords') || [];
    
    for (const line of lines) {
      const nouns = this.extractNouns(line);
      for (const noun of nouns) {
        if (this.isDomainConcept(noun)) {
          const isEntity = entityKeywords.some(keyword => noun.includes(keyword) || keyword.includes(noun));
          const isValueObject = valueObjectKeywords.some(keyword => noun.includes(keyword) || keyword.includes(noun));
          
          concepts.push({
            name: noun,
            description: line.trim(),
            type: isEntity ? 'entity' : isValueObject ? 'valueObject' : 'concept',
            confidence: this.calculateConceptConfidence(noun, line),
            suggestedType: this.suggestConceptType(noun, line),
            relatedKeywords: this.findRelatedKeywords(noun)
          });
        }
      }
    }
    
    return concepts;
  }

  // 新增辅助方法
  private suggestConceptType(noun: string, context: string): string {
    const entityKeywords = this.domainKnowledge.get('entityKeywords') || [];
    const valueObjectKeywords = this.domainKnowledge.get('valueObjectKeywords') || [];
    
    if (entityKeywords.some(keyword => noun.includes(keyword) || keyword.includes(noun))) {
      return 'entity';
    }
    if (valueObjectKeywords.some(keyword => noun.includes(keyword) || keyword.includes(noun))) {
      return 'valueObject';
    }
    if (context.includes('服务') || context.includes('管理') || context.includes('处理')) {
      return 'domainService';
    }
    return 'unknown';
  }

  private findRelatedKeywords(noun: string): string[] {
    const allKeywords = [
      ...(this.domainKnowledge.get('entityKeywords') || []),
      ...(this.domainKnowledge.get('valueObjectKeywords') || [])
    ];
    
    return allKeywords.filter(keyword => 
      keyword !== noun && 
      (keyword.includes(noun) || noun.includes(keyword))
    );
  }

  // 获取业务场景示例
  getBusinessScenarioExamples(domain?: string): any {
    const examples = this.entityTemplates.get('examples');
    if (domain && examples && examples[domain]) {
      return examples[domain];
    }
    return examples;
  }

  // 获取代码模板
  getCodeTemplate(templateType: string, language: string): string | null {
    const templates = this.domainKnowledge.get('codeTemplates');
    if (templates && templates[templateType] && templates[templateType][language]) {
      return templates[templateType][language];
    }
    return null;
  }

  // 建议架构模式
  suggestArchitecturePatterns(requirements: string[]): any[] {
    const patterns = this.domainKnowledge.get('architecturePatterns') || [];
    const suggestions = [];
    
    for (const pattern of patterns) {
      const matchScore = this.calculatePatternMatch(pattern, requirements);
      if (matchScore > 0.5) {
        suggestions.push({
          ...pattern,
          matchScore,
          reasoning: this.generatePatternReasoning(pattern, requirements)
        });
      }
    }
    
    return suggestions.sort((a, b) => b.matchScore - a.matchScore);
  }

  private calculatePatternMatch(pattern: any, requirements: string[]): number {
    let score = 0;
    const applicableWhen = pattern.applicableWhen || [];
    
    for (const condition of applicableWhen) {
      for (const requirement of requirements) {
        if (requirement.toLowerCase().includes(condition.toLowerCase())) {
          score += 1;
        }
      }
    }
    
    return Math.min(score / applicableWhen.length, 1);
  }

  private generatePatternReasoning(pattern: any, requirements: string[]): string {
    const matchedConditions = [];
    const applicableWhen = pattern.applicableWhen || [];
    
    for (const condition of applicableWhen) {
      for (const requirement of requirements) {
        if (requirement.toLowerCase().includes(condition.toLowerCase())) {
          matchedConditions.push(condition);
          break;
        }
      }
    }
    
    return `基于以下需求特征建议使用${pattern.name}：${matchedConditions.join('、')}`;
  }

  private extractBusinessRules(description: string): any[] {
    const rules = [];
    const lines = description.split('\n');
    const rulePatterns = this.domainKnowledge.get('businessRulePatterns') || [];
    
    for (const line of lines) {
      if (this.isBusinessRule(line)) {
        const matchedPattern = this.findMatchingRulePattern(line, rulePatterns);
        
        rules.push({
          description: line.trim(),
          type: matchedPattern ? matchedPattern.type : this.classifyBusinessRule(line),
          priority: matchedPattern ? matchedPattern.priority : this.calculateRulePriority(line),
          category: matchedPattern ? matchedPattern.description : '通用规则',
          enforcementLevel: this.determineEnforcementLevel(line),
          affectedEntities: this.identifyAffectedEntities(line),
          examples: this.generateRuleExamples(line)
        });
      }
    }
    
    return rules;
  }

  private findMatchingRulePattern(line: string, patterns: any[]): any | null {
    for (const pattern of patterns) {
      if (pattern.pattern.test && pattern.pattern.test(line)) {
        return pattern;
      }
    }
    return null;
  }

  private determineEnforcementLevel(line: string): 'strict' | 'warning' | 'suggestion' {
    if (line.includes('必须') || line.includes('禁止')) return 'strict';
    if (line.includes('应该') || line.includes('不建议')) return 'warning';
    return 'suggestion';
  }

  private identifyAffectedEntities(line: string): string[] {
    const entityKeywords = this.domainKnowledge.get('entityKeywords') || [];
    const affectedEntities = [];
    
    for (const keyword of entityKeywords) {
      if (line.includes(keyword)) {
        affectedEntities.push(keyword);
      }
    }
    
    return affectedEntities;
  }

  private generateRuleExamples(line: string): string[] {
    // 基于规则内容生成示例
    const examples = [];
    
    if (line.includes('密码')) {
      examples.push('密码长度至少8位', '密码必须包含字母和数字');
    }
    if (line.includes('金额') || line.includes('价格')) {
      examples.push('金额不能为负数', '价格必须大于0');
    }
    if (line.includes('邮箱')) {
      examples.push('邮箱格式必须正确', '邮箱地址必须唯一');
    }
    
    return examples;
  }

  private identifyDomainEvents(description: string): any[] {
    const events = [];
    const lines = description.split('\n');
    const eventPatterns = this.domainKnowledge.get('domainEventPatterns') || [];
    
    for (const line of lines) {
      if (this.isDomainEvent(line)) {
        const matchedPattern = this.findMatchingEventPattern(line, eventPatterns);
        
        events.push({
          name: this.extractEventName(line),
          description: line.trim(),
          triggers: this.identifyEventTriggers(line),
          category: matchedPattern ? matchedPattern.description : '通用事件',
          eventSuffix: matchedPattern ? matchedPattern.eventSuffix : 'Event',
          aggregateRoot: this.identifyEventAggregateRoot(line),
          subscribers: this.suggestEventSubscribers(line),
          examples: this.generateEventExamples(line),
          codeTemplate: this.getEventCodeTemplate(line)
        });
      }
    }
    
    return events;
  }

  private findMatchingEventPattern(line: string, patterns: any[]): any | null {
    for (const pattern of patterns) {
      if (pattern.pattern && pattern.pattern.test(line)) {
        return pattern;
      }
    }
    return null;
  }

  private identifyEventAggregateRoot(line: string): string {
    const entityKeywords = this.domainKnowledge.get('entityKeywords') || [];
    
    for (const keyword of entityKeywords) {
      if (line.includes(keyword)) {
        return keyword;
      }
    }
    
    return '未知聚合根';
  }

  private suggestEventSubscribers(line: string): string[] {
    const subscribers = [];
    
    if (line.includes('订单')) {
      subscribers.push('库存服务', '支付服务', '通知服务');
    }
    if (line.includes('用户')) {
      subscribers.push('邮件服务', '统计服务', '推荐服务');
    }
    if (line.includes('支付')) {
      subscribers.push('订单服务', '财务服务', '风控服务');
    }
    
    return subscribers;
  }

  private generateEventExamples(line: string): string[] {
    const examples = [];
    
    if (line.includes('创建') || line.includes('新增')) {
      examples.push('用户注册完成', '订单创建成功', '产品上架');
    }
    if (line.includes('更新') || line.includes('修改')) {
      examples.push('用户信息更新', '订单状态变更', '价格调整');
    }
    if (line.includes('删除') || line.includes('取消')) {
      examples.push('订单取消', '用户注销', '产品下架');
    }
    
    return examples;
  }

  private getEventCodeTemplate(line: string): string {
    const eventName = this.extractEventName(line);
    const templates = this.domainKnowledge.get('codeTemplates');
    
    if (templates && templates.domainEvent) {
      return templates.domainEvent.typescript
        .replace(/\{eventName\}/g, eventName)
        .replace(/\{eventData\}/g, 'eventData');
    }
    
    return `// ${eventName} 事件模板\nexport class ${eventName} {\n  constructor(public aggregateId: string, public eventData: any) {}\n}`;
  }

  private generateEntityCode(entity: any, language: string, framework: string): string {
    const template = this.entityTemplates.get(language);
    if (!template) {
      throw new Error(`不支持的语言: ${language}`);
    }

    return `export class ${entity.name} {
  private _id: string;
  
  constructor(id: string) {
    this._id = id;
  }
  
  get id(): string {
    return this._id;
  }
}`;
  }

  private generateMermaidClassDiagram(domainModel: any): string {
    let diagram = 'classDiagram\n';
    
    for (const entity of domainModel.entities || []) {
      diagram += `    class ${entity.name} {\n`;
      
      for (const attr of entity.attributes || []) {
        diagram += `        ${attr.type} ${attr.name}\n`;
      }
      
      for (const behavior of entity.behaviors || []) {
        diagram += `        ${behavior.name}()\n`;
      }
      
      diagram += '    }\n';
    }
    
    return diagram;
  }

  private generatePlantUMLClassDiagram(domainModel: any): string {
    let diagram = '@startuml\n';
    
    for (const entity of domainModel.entities || []) {
      diagram += `class ${entity.name} {\n`;
      
      for (const attr of entity.attributes || []) {
        diagram += `  ${attr.type} ${attr.name}\n`;
      }
      
      for (const behavior of entity.behaviors || []) {
        diagram += `  ${behavior.name}()\n`;
      }
      
      diagram += '}\n';
    }
    
    diagram += '@enduml';
    return diagram;
  }

  private getFileExtension(language: string): string {
    const extensions = {
      typescript: 'ts',
      javascript: 'js',
      java: 'java',
      csharp: 'cs',
      python: 'py'
    };
    return extensions[language] || 'txt';
  }

  private extractNouns(text: string): string[] {
    // 简单的名词提取
    const words = text.split(/\s+/);
    return words.filter(word => word.length > 2 && /^[A-Za-z\u4e00-\u9fa5]+$/.test(word));
  }

  private isDomainConcept(word: string): boolean {
    return word.length > 2 && !['的', '是', '在', '有', '和', '或'].includes(word);
  }

  private calculateConceptConfidence(noun: string, context: string): number {
    let confidence = 0.5;
    if (context.includes('实体') || context.includes('对象')) confidence += 0.2;
    if (context.includes('管理') || context.includes('处理')) confidence += 0.1;
    return Math.min(confidence, 1.0);
  }

  private deduplicateConcepts(concepts: any[]): any[] {
    const seen = new Set();
    return concepts.filter(concept => {
      if (seen.has(concept.name)) return false;
      seen.add(concept.name);
      return true;
    });
  }

  private isBusinessRule(line: string): boolean {
    const ruleIndicators = ['必须', '不能', '应该', '禁止', '要求', '规定'];
    return ruleIndicators.some(indicator => line.includes(indicator));
  }

  private classifyBusinessRule(line: string): string {
    if (line.includes('必须') || line.includes('要求')) return 'mandatory';
    if (line.includes('不能') || line.includes('禁止')) return 'forbidden';
    if (line.includes('应该') || line.includes('建议')) return 'recommended';
    return 'general';
  }

  private calculateRulePriority(line: string): 'high' | 'medium' | 'low' {
    if (line.includes('核心') || line.includes('关键')) return 'high';
    if (line.includes('重要') || line.includes('必须')) return 'medium';
    return 'low';
  }

  private isDomainEvent(line: string): boolean {
    const eventIndicators = ['当', '完成', '发生', '触发', '通知'];
    return eventIndicators.some(indicator => line.includes(indicator));
  }

  private extractEventName(line: string): string {
    const match = line.match(/当(.+?)时|(.+?)完成|(.+?)发生/);
    return match ? (match[1] || match[2] || match[3]).trim() + 'Event' : 'UnknownEvent';
  }

  private identifyEventTriggers(line: string): string[] {
    return [line.trim()];
  }

  private extractEntityCandidates(context: string): any[] {
    const candidates = [];
    const concepts = this.extractDomainConcepts(context);
    
    for (const concept of concepts) {
      if (this.isEntityCandidate(concept)) {
        candidates.push({
          name: concept.name,
          description: concept.description,
          confidence: concept.confidence
        });
      }
    }
    
    return candidates;
  }

  private isEntityCandidate(concept: any): boolean {
    return concept.confidence > 0.6 && concept.name.length > 2;
  }

  private identifyEntityAttributes(candidate: any): any[] {
    return [
      { name: 'id', type: 'string', required: true },
      { name: 'createdAt', type: 'Date', required: true },
      { name: 'updatedAt', type: 'Date', required: true }
    ];
  }

  private identifyEntityBehaviors(candidate: any): any[] {
    return [
      { name: 'create', parameters: [], returnType: 'void' },
      { name: 'update', parameters: [], returnType: 'void' },
      { name: 'delete', parameters: [], returnType: 'void' }
    ];
  }

  private identifyEntityBusinessRules(candidate: any): any[] {
    return [];
  }

  private isAggregateRootCandidate(candidate: any): boolean {
    return candidate.confidence > 0.8;
  }

  private extractValueObjectCandidates(context: string): any[] {
    return [];
  }

  private identifyValueObjectAttributes(candidate: any): any[] {
    return [];
  }

  private identifyValidationRules(candidate: any): any[] {
    return [];
  }

  private generateEntityRecommendations(entities: any[], valueObjects: any[]): any[] {
    return [
      {
        type: 'suggestion',
        message: '建议为每个实体添加唯一标识符',
        priority: 'high'
      }
    ];
  }

  private identifyAggregateEvents(entity: any): any[] {
    return [];
  }

  private identifyAggregateInvariants(entity: any, businessRules: any[]): any[] {
    return [];
  }

  private findRelatedEntities(entity: any, allEntities: any[]): any[] {
    return [];
  }

  private identifyAggregateInteractions(aggregate1: any, aggregate2: any): any[] {
    return [];
  }

  private validateEntity(entity: any, validation: any): void {
    if (!entity.name) {
      validation.errors.push('实体缺少名称');
      validation.isValid = false;
    }
  }

  private generateMermaidERDiagram(domainModel: any): string {
    return 'erDiagram\n    // ER图实现';
  }

  private generatePlantUMLERDiagram(domainModel: any): string {
    return '@startuml\n// ER图实现\n@enduml';
  }

  private identifyBoundedContexts(concepts: any[]): any[] {
    return [];
  }

  private buildUbiquitousLanguage(concepts: any[]): Map<string, string> {
    return new Map();
  }

  private generateAnalysisRecommendations(analysis: any): any[] {
    return [];
  }
}

export default DomainModelingPlugin;