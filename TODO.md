# 智能软件分析设计工具开发TODO清单 (重构版)

## 📋 项目概述
基于React + TypeScript + Vite构建**可扩展的**智能软件分析设计工具，以**用例图**和**领域模型/知识图谱**为核心业务资产，支持用户自定义文档类型，使用**Mermaid**进行图表生成，最终集成**MCP协议**供Cursor等AI Agent调用。

## 🎯 核心架构设计理念

### 🏗️ 可扩展文档生成引擎
- **插件化架构**: 支持用户自定义文档类型和生成器
- **模板驱动**: 基于JSON Schema定义文档结构
- **动态注册**: 运行时注册新的文档生成器

### 🎯 核心业务资产
1. **用例图 (Use Case Diagrams)** - 公司核心业务资产
2. **领域模型/知识图谱 (Domain Model/Knowledge Graph)** - 业务知识沉淀
3. **业务流程图** - 端到端业务流程

### 📊 Mermaid图表生成系统
- **统一图表引擎**: 所有图表基于Mermaid生成
- **实时预览**: 支持实时编辑和预览
- **多格式导出**: SVG、PNG、PDF等格式

### 🔌 MCP协议集成
- **标准化接口**: 遵循MCP协议规范
- **Agent友好**: 供Cursor等AI Agent调用
- **API网关**: 统一的服务接口

## 🎯 重构后开发阶段规划

### 阶段一：核心架构搭建 (Phase 1)
- [x] ✅ React + TypeScript + Vite 脚手架
- [x] ✅ 基础依赖配置 (React Router, Tailwind, Zustand等)
- [ ] 🔄 添加核心依赖 (Ant Design, Mermaid, Monaco Editor)
- [ ] 🔄 设计可扩展文档生成引擎架构
- [ ] 🔄 创建插件系统基础框架
- [ ] 🔄 配置Mermaid图表渲染引擎

### 阶段二：核心业务资产页面 (Phase 2) - **重点**
- [ ] 📄 用例图设计器 (Use Case Designer) - **核心资产1**
- [ ] 📄 领域模型/知识图谱编辑器 (Domain Model Editor) - **核心资产2**
- [ ] 📄 业务流程设计器 (Business Process Designer)
- [ ] 📄 项目创建页 (ProjectCreate) - 原型图上传和需求输入
- [ ] 📄 文档生成页 (DocumentGenerate) - AI分析和实时预览
- [ ] 📄 文档管理页 (DocumentManage) - 文档列表和编辑

### 阶段三：可扩展文档生成系统 (Phase 3) - **核心**
- [ ] 🔧 文档类型注册系统 (Document Type Registry)
- [ ] 🔧 模板引擎 (Template Engine) - 支持JSON Schema
- [ ] 🔧 插件管理器 (Plugin Manager)
- [ ] 🔧 Mermaid图表生成器集合:
  - [ ] 用例图生成器 (Use Case Diagram)
  - [ ] 时序图生成器 (Sequence Diagram)
  - [ ] 类图生成器 (Class Diagram)
  - [ ] 流程图生成器 (Flowchart)
  - [ ] 数据流图生成器 (Data Flow Diagram)
  - [ ] 知识图谱生成器 (Knowledge Graph)
  - [ ] **自定义图表生成器接口**

### 阶段四：用户定制化系统 (Phase 4) - **扩展性**
- [ ] 🎨 文档模板编辑器 (Template Editor)
- [ ] 🎨 自定义字段配置器 (Custom Field Configurator)
- [ ] 🎨 图表样式定制器 (Chart Style Customizer)
- [ ] 🎨 工作流编辑器 (Workflow Editor)
- [ ] 📤 多格式导出系统 (Multi-format Export)
- [ ] 🔄 版本控制系统 (Version Control)

### 阶段五：MCP协议集成 (Phase 5) - **AI Agent友好**
- [ ] 🔌 MCP服务器实现 (MCP Server Implementation)
- [ ] 🔌 标准化API接口 (Standardized API)
- [ ] 🔌 Agent调用示例 (Agent Integration Examples)
- [ ] 🔌 文档和SDK (Documentation & SDK)
- [ ] 🔌 Cursor插件开发 (Cursor Plugin)

### 阶段六：优化和完善 (Phase 6)
- [ ] 📱 响应式设计优化
- [ ] ⚡ 性能优化 (图表渲染、大数据处理)
- [ ] 🧪 单元测试和集成测试
- [ ] 📚 完整文档和API参考
- [ ] 🚀 部署和CI/CD配置

## 🛠️ 重构后技术架构

### 核心技术栈
- **前端框架**: React 18 + TypeScript + Vite
- **UI组件库**: Ant Design (企业级组件)
- **图表引擎**: Mermaid (统一图表生成)
- **代码编辑器**: Monaco Editor (支持多语言)
- **状态管理**: Zustand (轻量级状态管理)
- **路由**: React Router v6
- **样式**: Tailwind CSS + CSS Modules

### 可扩展文档生成引擎架构
```typescript
// 核心引擎架构
interface DocumentGenerator {
  id: string;
  name: string;
  description: string;
  schema: JSONSchema7; // 文档结构定义
  generate(input: any): Promise<GeneratedDocument>;
  validate(input: any): ValidationResult;
}

interface PluginRegistry {
  register(generator: DocumentGenerator): void;
  unregister(id: string): void;
  getGenerator(id: string): DocumentGenerator | null;
  listGenerators(): DocumentGenerator[];
}
```

### Mermaid图表生成系统
```typescript
// 图表生成器接口
interface ChartGenerator {
  type: 'usecase' | 'sequence' | 'class' | 'flowchart' | 'dataflow' | 'knowledge' | 'custom';
  generateMermaidCode(data: any): string;
  renderChart(code: string): Promise<string>; // 返回SVG
  exportFormats: ('svg' | 'png' | 'pdf')[];
}

// 内置图表生成器
├── UseCaseGenerator.ts     // 用例图生成器
├── SequenceGenerator.ts    // 时序图生成器
├── ClassGenerator.ts       // 类图生成器
├── FlowchartGenerator.ts   // 流程图生成器
├── DataFlowGenerator.ts    // 数据流图生成器
├── KnowledgeGraphGenerator.ts // 知识图谱生成器
└── CustomChartGenerator.ts // 自定义图表生成器
```

### 重构后状态管理架构
```typescript
// stores/ - 基于业务领域重新设计
├── coreAssetStore.ts     // 核心业务资产 (用例图、领域模型)
├── documentEngineStore.ts // 文档生成引擎状态
├── chartStore.ts         // 图表生成和渲染状态
├── pluginStore.ts        // 插件管理状态
├── templateStore.ts      // 模板和配置状态
├── projectStore.ts       // 项目数据管理
├── mcpStore.ts          // MCP协议相关状态
└── uiStore.ts           // UI状态 (主题、布局等)
```

### 重构后页面组件结构
```typescript
// pages/ - 以核心业务资产为中心
├── CoreAssets/
│   ├── UseCaseDesigner/     // 用例图设计器
│   │   ├── index.tsx
│   │   ├── ActorManager.tsx
│   │   ├── UseCaseEditor.tsx
│   │   └── RelationshipEditor.tsx
│   ├── DomainModelEditor/   // 领域模型/知识图谱编辑器
│   │   ├── index.tsx
│   │   ├── EntityEditor.tsx
│   │   ├── RelationshipEditor.tsx
│   │   └── KnowledgeGraphView.tsx
│   └── BusinessProcessDesigner/ // 业务流程设计器
├── DocumentEngine/
│   ├── TemplateEditor/      // 模板编辑器
│   ├── PluginManager/       // 插件管理
│   └── GeneratorConfig/     // 生成器配置
├── ChartStudio/
│   ├── MermaidEditor/       // Mermaid编辑器
│   ├── ChartPreview/        // 图表预览
│   └── StyleCustomizer/     // 样式定制
└── Integration/
    ├── MCPServer/           // MCP服务器管理
    ├── APIGateway/          // API网关
    └── AgentSDK/            // Agent SDK
```

### 核心功能模块重构
```typescript
// lib/ - 模块化和可扩展设计
├── core/
│   ├── DocumentEngine.ts    // 文档生成引擎核心
│   ├── PluginRegistry.ts    // 插件注册表
│   ├── TemplateEngine.ts    // 模板引擎
│   └── ValidationEngine.ts  // 验证引擎
├── charts/
│   ├── MermaidRenderer.ts   // Mermaid渲染器
│   ├── ChartExporter.ts     // 图表导出
│   └── generators/          // 各种图表生成器
├── assets/
│   ├── UseCaseManager.ts    // 用例图管理
│   ├── DomainModelManager.ts // 领域模型管理
│   └── BusinessProcessManager.ts // 业务流程管理
├── mcp/
│   ├── MCPServer.ts         // MCP服务器实现
│   ├── MCPClient.ts         // MCP客户端
│   └── AgentInterface.ts    // Agent接口
├── utils/
│   ├── file-handler.ts      // 文件处理
│   ├── export-utils.ts      // 导出工具
│   ├── validation-utils.ts  // 验证工具
│   └── schema-utils.ts      // Schema工具
└── types/
    ├── core.ts              // 核心类型定义
    ├── charts.ts            // 图表类型
    ├── assets.ts            // 业务资产类型
    └── mcp.ts               // MCP协议类型
```

## 🎨 设计系统 (面向业务资产)

### 色彩方案 - 业务导向
- **核心资产色**: #1890FF (用例图蓝) / #52C41A (领域模型绿)
- **图表色板**: Mermaid默认色彩 + 自定义业务色彩
- **功能色**: #F5222D (错误), #FA8C16 (警告), #13C2C2 (信息)
- **中性色**: #262626 (主文字), #595959 (次文字), #8C8C8C (辅助文字)

### 组件规范 - 可扩展设计
- **图表容器**: 支持全屏、缩放、导出的统一容器
- **编辑器**: Monaco Editor主题，支持多语言语法高亮
- **插件卡片**: 统一的插件展示和配置界面
- **资产面板**: 用例图、领域模型的专用展示组件

## 🔌 MCP协议集成设计

### MCP服务器架构
```typescript
// MCP服务器接口设计
interface MCPServer {
  // 核心业务资产操作
  generateUseCase(requirements: string): Promise<UseCaseModel>;
  generateDomainModel(businessContext: string): Promise<DomainModel>;
  
  // 可扩展文档生成
  generateDocument(type: string, input: any): Promise<GeneratedDocument>;
  listDocumentTypes(): DocumentType[];
  
  // 图表生成
  generateChart(type: ChartType, data: any): Promise<MermaidChart>;
  exportChart(chartId: string, format: ExportFormat): Promise<Buffer>;
  
  // 插件管理
  installPlugin(plugin: PluginPackage): Promise<void>;
  listPlugins(): Plugin[];
}
```

### Agent调用示例
```typescript
// Cursor Agent调用示例
const mcpClient = new MCPClient('http://localhost:3001/mcp');

// 生成用例图
const useCase = await mcpClient.generateUseCase(
  "用户登录系统，包含注册、登录、密码重置功能"
);

// 生成领域模型
const domainModel = await mcpClient.generateDomainModel(
  "电商平台，包含用户、商品、订单、支付等业务领域"
);

// 自定义文档生成
const customDoc = await mcpClient.generateDocument('api-spec', {
  endpoints: [...],
  schemas: [...]
});
```

## 📊 重构后开发进度追踪

### 当前状态 (重新评估)
- ✅ 项目初始化完成
- ✅ 基础依赖配置完成
- 🔄 **需要重构**: 按新架构重新设计
- 🎯 **核心目标**: 可扩展 + 业务资产 + Mermaid + MCP

### 重构后预计时间线
- **阶段一 (架构搭建)**: 3-4天
- **阶段二 (核心业务资产)**: 5-6天 ⭐
- **阶段三 (可扩展引擎)**: 6-7天 ⭐
- **阶段四 (用户定制化)**: 4-5天
- **阶段五 (MCP集成)**: 4-5天 ⭐
- **阶段六 (优化完善)**: 3-4天

**总预计开发时间**: 25-31天 (比原计划增加，但架构更完善)

## 🚀 重构后立即开始

### 优先级排序 (按业务价值)
1. **🎯 核心业务资产设计器** (用例图 + 领域模型)
2. **📊 Mermaid图表引擎集成**
3. **🔧 可扩展文档生成引擎**
4. **🔌 MCP协议服务器**
5. **🎨 用户定制化系统**

### 立即执行步骤
1. 安装核心依赖 (Mermaid, Monaco Editor, JSON Schema)
2. 创建可扩展文档引擎基础架构
3. 实现Mermaid图表渲染系统
4. 开发用例图设计器 (第一个核心资产)
5. 开发领域模型编辑器 (第二个核心资产)
6. 集成MCP协议服务器

## 🎯 成功标准

### 技术标准
- [ ] 支持至少5种内置图表类型 (Mermaid)
- [ ] 支持用户自定义文档类型注册
- [ ] MCP协议完全兼容
- [ ] 插件系统可动态加载

### 业务标准
- [ ] 用例图设计器功能完整
- [ ] 领域模型/知识图谱编辑器可用
- [ ] 支持导出多种格式 (SVG, PNG, PDF, JSON)
- [ ] Cursor Agent可成功调用所有核心功能

---

*最后更新时间: 2024年12月 (重构版)*
*开发者: Solo Coding AI*
*架构理念: 可扩展 + 业务资产驱动 + AI Agent友好*