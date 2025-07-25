# 设计文档

## 概述

用例图预览功能将为核心业务资产页面提供一个专门的预览界面，让用户能够全面查看、交互和导出用例图。该功能将通过一个模态框组件实现，提供多标签页界面来展示用例图的不同方面，包括概览、参与者、用例、关系和图表可视化。

## 架构

### 组件架构

```
UseCasePreviewModal (新组件)
├── PreviewHeader (子组件)
├── PreviewTabs (子组件)
│   ├── OverviewTab
│   ├── ActorsTab  
│   ├── UseCasesTab
│   ├── RelationshipsTab
│   └── DiagramTab
├── PreviewFooter (子组件)
└── ExportManager (工具类)
```

### 数据流架构

```
CoreAssets Page
    ↓ (用例图数据)
UseCasePreviewModal
    ↓ (处理和格式化)
各个Tab组件
    ↓ (用户交互)
ExportManager
    ↓ (导出操作)
文件下载
```

### 状态管理

使用React本地状态管理预览相关的状态：
- `activeTab`: 当前激活的标签页
- `loading`: 加载状态
- `exportLoading`: 导出加载状态
- `error`: 错误状态
- `zoomLevel`: 图表缩放级别

## 组件和接口

### 1. UseCasePreviewModal 主组件

```typescript
interface UseCasePreviewModalProps {
  visible: boolean;
  useCaseModel: UseCaseModel | null;
  onClose: () => void;
  onEdit?: (model: UseCaseModel) => void;
  readonly?: boolean;
}

interface UseCasePreviewState {
  activeTab: 'overview' | 'actors' | 'usecases' | 'relationships' | 'diagram';
  loading: boolean;
  exportLoading: boolean;
  error: string | null;
  zoomLevel: number;
}
```

### 2. PreviewHeader 组件

```typescript
interface PreviewHeaderProps {
  useCaseModel: UseCaseModel;
  onEdit?: () => void;
  onClose: () => void;
  readonly?: boolean;
}
```

显示用例图的基本信息：
- 标题和描述
- 作者和版本信息
- 创建和更新时间
- 标签
- 编辑和关闭按钮

### 3. PreviewTabs 组件

```typescript
interface PreviewTabsProps {
  useCaseModel: UseCaseModel;
  activeTab: string;
  onTabChange: (tab: string) => void;
  zoomLevel: number;
  onZoomChange: (level: number) => void;
}
```

#### 3.1 OverviewTab 概览标签页

显示用例图的整体信息：
- 统计信息（参与者数量、用例数量、关系数量）
- 优先级分布图表
- 参与者类型分布
- 最近修改历史

#### 3.2 ActorsTab 参与者标签页

```typescript
interface ActorsTabProps {
  actors: Actor[];
  relationships: Relationship[];
}
```

显示参与者详细信息：
- 参与者表格（名称、类型、描述）
- 类型过滤器
- 搜索功能
- 每个参与者关联的用例列表

#### 3.3 UseCasesTab 用例标签页

```typescript
interface UseCasesTabProps {
  useCases: UseCase[];
  relationships: Relationship[];
}
```

显示用例详细信息：
- 用例表格（名称、优先级、描述）
- 优先级过滤器
- 搜索功能
- 用例详情展开（前置条件、后置条件、主流程）

#### 3.4 RelationshipsTab 关系标签页

```typescript
interface RelationshipsTabProps {
  relationships: Relationship[];
  actors: Actor[];
  useCases: UseCase[];
}
```

显示关系详细信息：
- 关系表格（源、目标、类型、标签）
- 关系类型过滤器
- 关系图形化展示

#### 3.5 DiagramTab 图表标签页

```typescript
interface DiagramTabProps {
  mermaidCode: string;
  title: string;
  zoomLevel: number;
  onZoomChange: (level: number) => void;
}
```

显示Mermaid图表：
- 使用现有的MermaidChart组件
- 缩放控制
- 全屏模式
- 图表交互功能

### 4. PreviewFooter 组件

```typescript
interface PreviewFooterProps {
  useCaseModel: UseCaseModel;
  onExport: (format: ExportFormat) => void;
  exportLoading: boolean;
}
```

提供操作按钮：
- 导出按钮组
- 统计信息显示
- 关闭按钮

### 5. ExportManager 工具类

```typescript
class UseCaseExportManager {
  static async exportToPNG(useCaseModel: UseCaseModel): Promise<Blob>;
  static async exportToSVG(useCaseModel: UseCaseModel): Promise<Blob>;
  static async exportToPDF(useCaseModel: UseCaseModel): Promise<Blob>;
  static async exportToMarkdown(useCaseModel: UseCaseModel): Promise<string>;
  static async exportToJSON(useCaseModel: UseCaseModel): Promise<string>;
  
  private static generateMarkdownContent(useCaseModel: UseCaseModel): string;
  private static generatePDFContent(useCaseModel: UseCaseModel): Promise<Blob>;
}
```

## 数据模型

### 预览数据结构

```typescript
interface PreviewData {
  overview: {
    totalActors: number;
    totalUseCases: number;
    totalRelationships: number;
    priorityDistribution: Record<string, number>;
    actorTypeDistribution: Record<string, number>;
  };
  
  actorsWithUseCases: Array<{
    actor: Actor;
    relatedUseCases: UseCase[];
  }>;
  
  useCasesWithDetails: Array<{
    useCase: UseCase;
    relatedActors: Actor[];
    relationships: Relationship[];
  }>;
  
  relationshipMatrix: Array<{
    source: Actor | UseCase;
    target: Actor | UseCase;
    relationship: Relationship;
  }>;
}
```

## 错误处理

### 错误类型定义

```typescript
enum PreviewErrorType {
  LOAD_FAILED = 'LOAD_FAILED',
  RENDER_FAILED = 'RENDER_FAILED',
  EXPORT_FAILED = 'EXPORT_FAILED',
  INVALID_DATA = 'INVALID_DATA'
}

interface PreviewError {
  type: PreviewErrorType;
  message: string;
  details?: any;
  recoverable: boolean;
}
```

### 错误处理策略

1. **数据加载错误**: 显示错误提示，提供重试按钮
2. **图表渲染错误**: 降级到文本描述，显示原始Mermaid代码
3. **导出错误**: 显示具体错误信息，建议替代方案
4. **网络错误**: 提供离线模式提示

## 测试策略

### 单元测试

1. **组件渲染测试**
   - 各个Tab组件正确渲染
   - 数据正确显示
   - 交互功能正常

2. **数据处理测试**
   - 预览数据正确计算
   - 过滤和搜索功能
   - 数据格式化

3. **导出功能测试**
   - 各种格式导出正常
   - 错误情况处理
   - 文件内容正确性

### 集成测试

1. **模态框交互测试**
   - 打开/关闭功能
   - 标签页切换
   - 编辑模式切换

2. **与父组件集成测试**
   - 数据传递正确
   - 回调函数执行
   - 状态同步

### 性能测试

1. **大数据量测试**
   - 100+参与者和用例的渲染性能
   - 图表渲染性能
   - 内存使用情况

2. **导出性能测试**
   - 各种格式导出时间
   - 大图表导出性能
   - 并发导出处理

## 性能优化

### 渲染优化

1. **虚拟化列表**: 对于大量数据使用虚拟滚动
2. **懒加载**: 标签页内容按需加载
3. **缓存**: 计算结果缓存，避免重复计算
4. **防抖**: 搜索和过滤操作防抖处理

### 内存优化

1. **组件卸载清理**: 清理事件监听器和定时器
2. **图表实例管理**: 正确销毁Mermaid实例
3. **大文件处理**: 分块处理大型导出文件

## 可访问性

### 键盘导航

1. **Tab键导航**: 支持键盘在各个元素间导航
2. **快捷键**: 提供常用操作快捷键
3. **焦点管理**: 模态框打开时正确设置焦点

### 屏幕阅读器支持

1. **ARIA标签**: 为所有交互元素添加适当的ARIA标签
2. **语义化HTML**: 使用语义化的HTML结构
3. **状态通知**: 重要状态变化的屏幕阅读器通知

### 视觉辅助

1. **高对比度**: 支持高对比度模式
2. **字体缩放**: 支持系统字体缩放
3. **颜色辅助**: 不仅依赖颜色传达信息

## 国际化

### 多语言支持

1. **文本国际化**: 所有用户界面文本支持多语言
2. **日期格式**: 根据地区显示日期格式
3. **数字格式**: 本地化数字和货币格式

### RTL支持

1. **布局适配**: 支持从右到左的语言布局
2. **图标方向**: 方向性图标的镜像处理
3. **文本对齐**: 文本对齐方式的适配

## 安全考虑

### 数据安全

1. **输入验证**: 对所有用户输入进行验证
2. **XSS防护**: 防止跨站脚本攻击
3. **数据脱敏**: 敏感信息的适当处理

### 导出安全

1. **文件类型验证**: 验证导出文件类型
2. **内容过滤**: 过滤潜在的恶意内容
3. **大小限制**: 限制导出文件大小

## 部署和监控

### 部署策略

1. **渐进式部署**: 逐步向用户推出新功能
2. **功能开关**: 支持功能的动态开启/关闭
3. **回滚机制**: 快速回滚到上一版本的能力

### 监控指标

1. **性能指标**: 组件加载时间、渲染时间
2. **使用指标**: 功能使用频率、用户行为
3. **错误指标**: 错误率、错误类型分布
4. **导出指标**: 导出成功率、格式偏好