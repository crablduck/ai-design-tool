// 技术知识库系统类型定义

export interface TechHandbook {
  id: string;
  title: string;
  content: string;
  category: HandbookCategory;
  tags: string[];
  author: string;
  version: string;
  status: HandbookStatus;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  metadata: HandbookMetadata;
}

export enum HandbookCategory {
  FRONTEND = 'frontend',
  BACKEND = 'backend',
  DATABASE = 'database',
  DEVOPS = 'devops',
  ARCHITECTURE = 'architecture',
  SECURITY = 'security',
  TESTING = 'testing',
  TOOLS = 'tools',
  BEST_PRACTICES = 'best-practices',
  TUTORIALS = 'tutorials'
}

export enum HandbookStatus {
  DRAFT = 'draft',
  REVIEW = 'review',
  PUBLISHED = 'published',
  ARCHIVED = 'archived'
}

export interface HandbookMetadata {
  readingTime: number; // 分钟
  difficulty: DifficultyLevel;
  prerequisites: string[];
  relatedTopics: string[];
  lastReviewed?: Date;
  reviewers?: string[];
}

export enum DifficultyLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert'
}

export interface TechStack {
  id: string;
  name: string;
  category: TechCategory;
  description: string;
  version?: string;
  popularity: number; // 0-100
  learningCurve: DifficultyLevel;
  officialSite?: string;
  documentation?: string;
  repository?: string;
  license?: string;
  maintainers?: string[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export enum TechCategory {
  PROGRAMMING_LANGUAGE = 'programming-language',
  FRAMEWORK = 'framework',
  LIBRARY = 'library',
  DATABASE = 'database',
  TOOL = 'tool',
  PLATFORM = 'platform',
  SERVICE = 'service',
  PROTOCOL = 'protocol',
  STANDARD = 'standard'
}

export interface KnowledgeGraph {
  nodes: KnowledgeNode[];
  edges: KnowledgeEdge[];
  metadata: GraphMetadata;
}

export interface KnowledgeNode {
  id: string;
  type: NodeType;
  label: string;
  description?: string;
  properties: Record<string, any>;
  position?: Position;
}

export enum NodeType {
  TECH_STACK = 'tech-stack',
  CONCEPT = 'concept',
  SKILL = 'skill',
  PROJECT = 'project',
  RESOURCE = 'resource',
  PERSON = 'person',
  ORGANIZATION = 'organization'
}

export interface KnowledgeEdge {
  id: string;
  source: string;
  target: string;
  type: EdgeType;
  weight?: number;
  properties?: Record<string, any>;
}

export enum EdgeType {
  DEPENDS_ON = 'depends-on',
  RELATED_TO = 'related-to',
  PART_OF = 'part-of',
  IMPLEMENTS = 'implements',
  EXTENDS = 'extends',
  USES = 'uses',
  CREATED_BY = 'created-by',
  MAINTAINED_BY = 'maintained-by',
  PREREQUISITE = 'prerequisite',
  ALTERNATIVE_TO = 'alternative-to'
}

export interface Position {
  x: number;
  y: number;
}

export interface GraphMetadata {
  version: string;
  createdAt: Date;
  updatedAt: Date;
  nodeCount: number;
  edgeCount: number;
  categories: string[];
}

export interface LearningPath {
  id: string;
  title: string;
  description: string;
  targetAudience: string;
  estimatedDuration: number; // 小时
  difficulty: DifficultyLevel;
  nodes: LearningNode[];
  prerequisites: string[];
  outcomes: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
}

export interface LearningNode {
  id: string;
  skillId: string;
  title: string;
  description: string;
  type: LearningNodeType;
  estimatedTime: number; // 小时
  difficulty: DifficultyLevel;
  resources: LearningResource[];
  assessments?: Assessment[];
  prerequisites: string[];
  order: number;
}

export enum LearningNodeType {
  CONCEPT = 'concept',
  TUTORIAL = 'tutorial',
  PRACTICE = 'practice',
  PROJECT = 'project',
  ASSESSMENT = 'assessment',
  REVIEW = 'review'
}

export interface LearningResource {
  id: string;
  title: string;
  type: ResourceType;
  url?: string;
  content?: string;
  author?: string;
  duration?: number; // 分钟
  difficulty: DifficultyLevel;
  rating?: number;
  tags: string[];
  free: boolean;
}

export enum ResourceType {
  ARTICLE = 'article',
  VIDEO = 'video',
  COURSE = 'course',
  BOOK = 'book',
  DOCUMENTATION = 'documentation',
  TUTORIAL = 'tutorial',
  EXERCISE = 'exercise',
  PROJECT = 'project',
  TOOL = 'tool',
  REFERENCE = 'reference'
}

export interface Assessment {
  id: string;
  title: string;
  type: AssessmentType;
  questions: Question[];
  passingScore: number;
  timeLimit?: number; // 分钟
}

export enum AssessmentType {
  QUIZ = 'quiz',
  CODING_CHALLENGE = 'coding-challenge',
  PROJECT_REVIEW = 'project-review',
  PEER_REVIEW = 'peer-review'
}

export interface Question {
  id: string;
  type: QuestionType;
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
  points: number;
}

export enum QuestionType {
  MULTIPLE_CHOICE = 'multiple-choice',
  MULTIPLE_SELECT = 'multiple-select',
  TRUE_FALSE = 'true-false',
  SHORT_ANSWER = 'short-answer',
  CODE = 'code'
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  skills: Skill[];
  interests: string[];
  goals: string[];
  preferences: LearningPreferences;
  progress: LearningProgress[];
  achievements: Achievement[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  level: SkillLevel;
  experience: number; // 月数
  verified: boolean;
  certifications?: Certification[];
  projects?: string[];
}

export enum SkillLevel {
  NONE = 'none',
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert'
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  issuedAt: Date;
  expiresAt?: Date;
  credentialId?: string;
  verificationUrl?: string;
}

export interface LearningPreferences {
  learningStyle: LearningStyle[];
  preferredFormats: ResourceType[];
  timeAvailability: number; // 小时/周
  difficultyPreference: DifficultyLevel;
  languages: string[];
  topics: string[];
}

export enum LearningStyle {
  VISUAL = 'visual',
  AUDITORY = 'auditory',
  KINESTHETIC = 'kinesthetic',
  READING = 'reading'
}

export interface LearningProgress {
  pathId: string;
  nodeId: string;
  status: ProgressStatus;
  startedAt: Date;
  completedAt?: Date;
  timeSpent: number; // 分钟
  score?: number;
  notes?: string;
}

export enum ProgressStatus {
  NOT_STARTED = 'not-started',
  IN_PROGRESS = 'in-progress',
  COMPLETED = 'completed',
  SKIPPED = 'skipped'
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  type: AchievementType;
  icon: string;
  earnedAt: Date;
  criteria: string;
}

export enum AchievementType {
  SKILL_MASTERY = 'skill-mastery',
  PATH_COMPLETION = 'path-completion',
  STREAK = 'streak',
  CONTRIBUTION = 'contribution',
  MILESTONE = 'milestone'
}

export interface SearchFilters {
  categories?: HandbookCategory[];
  tags?: string[];
  difficulty?: DifficultyLevel[];
  type?: ResourceType[];
  author?: string;
  dateRange?: DateRange;
  minRating?: number;
  free?: boolean;
}

export interface DateRange {
  start: Date;
  end: Date;
}

export interface SearchResult {
  id: string;
  title: string;
  type: 'handbook' | 'resource' | 'path' | 'tech-stack';
  description: string;
  relevanceScore: number;
  highlights: string[];
  metadata: Record<string, any>;
}

export interface SkillGap {
  from: string;
  to: string;
  difficulty: DifficultyLevel;
  estimatedTime: number;
  resources: LearningResource[];
}

export interface Recommendation {
  id: string;
  type: RecommendationType;
  title: string;
  description: string;
  targetId: string;
  score: number;
  reasons: string[];
  metadata: Record<string, any>;
}

export enum RecommendationType {
  LEARNING_PATH = 'learning-path',
  RESOURCE = 'resource',
  SKILL = 'skill',
  PROJECT = 'project',
  MENTOR = 'mentor'
}

export interface Version {
  id: string;
  version: string;
  changes: string[];
  author: string;
  createdAt: Date;
  message: string;
  breaking: boolean;
}

export interface DependencyType {
  REQUIRES: 'requires';
  RECOMMENDS: 'recommends';
  CONFLICTS: 'conflicts';
  REPLACES: 'replaces';
}

// 知识库管理接口
export interface KnowledgeBaseManager {
  // 手册管理
  createHandbook(handbook: Omit<TechHandbook, 'id' | 'createdAt' | 'updatedAt'>): Promise<string>;
  updateHandbook(id: string, updates: Partial<TechHandbook>): Promise<void>;
  deleteHandbook(id: string): Promise<void>;
  getHandbook(id: string): Promise<TechHandbook | null>;
  searchHandbooks(query: string, filters?: SearchFilters): Promise<SearchResult[]>;
  
  // 技术栈管理
  createTechStack(techStack: Omit<TechStack, 'id' | 'createdAt' | 'updatedAt'>): Promise<string>;
  updateTechStack(id: string, updates: Partial<TechStack>): Promise<void>;
  getTechStack(id: string): Promise<TechStack | null>;
  searchTechStacks(query: string, filters?: any): Promise<TechStack[]>;
  
  // 学习路径管理
  createLearningPath(path: Omit<LearningPath, 'id' | 'createdAt' | 'updatedAt'>): Promise<string>;
  updateLearningPath(id: string, updates: Partial<LearningPath>): Promise<void>;
  getLearningPath(id: string): Promise<LearningPath | null>;
  generateLearningPath(userProfile: UserProfile, targetSkills: string[]): Promise<LearningPath>;
  
  // 推荐系统
  getRecommendations(userId: string, type?: RecommendationType): Promise<Recommendation[]>;
  
  // 知识图谱
  getKnowledgeGraph(): Promise<KnowledgeGraph>;
  updateKnowledgeGraph(updates: Partial<KnowledgeGraph>): Promise<void>;
}

// 搜索引擎接口
export interface SearchEngine {
  index(id: string, document: any): Promise<void>;
  update(id: string, document: any): Promise<void>;
  delete(id: string): Promise<void>;
  search(query: string, filters?: SearchFilters): Promise<SearchResult[]>;
  suggest(query: string): Promise<string[]>;
}

// 推荐引擎接口
export interface RecommendEngine {
  getResources(skillId: string, options?: any): Promise<LearningResource[]>;
  getRelatedSkills(skillId: string): Promise<string[]>;
  getPersonalizedRecommendations(userProfile: UserProfile): Promise<Recommendation[]>;
}