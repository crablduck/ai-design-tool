import { EventEmitter } from 'events';

// 协作事件类型
export interface CollaborationEvent {
  id: string;
  type: 'user_join' | 'user_leave' | 'document_edit' | 'comment_add' | 'task_update' | 'status_change';
  userId: string;
  userName: string;
  projectId: string;
  timestamp: number;
  data: any;
}

// 在线用户信息
export interface OnlineUser {
  id: string;
  name: string;
  avatar: string;
  status: 'active' | 'idle' | 'away';
  currentPage?: string;
  lastActivity: number;
}

// 实时编辑光标位置
export interface CursorPosition {
  userId: string;
  userName: string;
  documentId: string;
  position: {
    line: number;
    column: number;
  };
  selection?: {
    start: { line: number; column: number };
    end: { line: number; column: number };
  };
}

// 协作状态
export interface CollaborationState {
  onlineUsers: Map<string, OnlineUser>;
  cursors: Map<string, CursorPosition>;
  recentEvents: CollaborationEvent[];
  isConnected: boolean;
}

class CollaborationService extends EventEmitter {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private currentUser: OnlineUser | null = null;
  private currentProjectId: string | null = null;
  private state: CollaborationState = {
    onlineUsers: new Map(),
    cursors: new Map(),
    recentEvents: [],
    isConnected: false
  };

  constructor() {
    super();
    this.setupHeartbeat();
  }

  // 连接到协作服务器
  connect(projectId: string, user: OnlineUser): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.currentProjectId = projectId;
        this.currentUser = user;
        
        // 模拟WebSocket连接（实际项目中应连接到真实的WebSocket服务器）
        this.simulateConnection();
        
        this.state.isConnected = true;
        this.state.onlineUsers.set(user.id, user);
        
        this.emit('connected', { projectId, user });
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  // 断开连接
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    
    this.state.isConnected = false;
    this.state.onlineUsers.clear();
    this.state.cursors.clear();
    
    this.emit('disconnected');
  }

  // 发送协作事件
  sendEvent(event: Omit<CollaborationEvent, 'id' | 'timestamp'>): void {
    const fullEvent: CollaborationEvent = {
      ...event,
      id: this.generateEventId(),
      timestamp: Date.now()
    };
    
    // 模拟发送到服务器
    this.handleIncomingEvent(fullEvent);
    
    // 实际项目中应该发送到WebSocket服务器
    // this.ws?.send(JSON.stringify(fullEvent));
  }

  // 更新用户状态
  updateUserStatus(status: OnlineUser['status']): void {
    if (this.currentUser) {
      this.currentUser.status = status;
      this.currentUser.lastActivity = Date.now();
      
      this.sendEvent({
        type: 'status_change',
        userId: this.currentUser.id,
        userName: this.currentUser.name,
        projectId: this.currentProjectId!,
        data: { status }
      });
    }
  }

  // 更新光标位置
  updateCursor(documentId: string, position: CursorPosition['position'], selection?: CursorPosition['selection']): void {
    if (!this.currentUser) return;
    
    const cursor: CursorPosition = {
      userId: this.currentUser.id,
      userName: this.currentUser.name,
      documentId,
      position,
      selection
    };
    
    this.state.cursors.set(this.currentUser.id, cursor);
    
    this.sendEvent({
      type: 'document_edit',
      userId: this.currentUser.id,
      userName: this.currentUser.name,
      projectId: this.currentProjectId!,
      data: { cursor }
    });
  }

  // 添加评论
  addComment(documentId: string, content: string, position?: any): void {
    if (!this.currentUser) return;
    
    this.sendEvent({
      type: 'comment_add',
      userId: this.currentUser.id,
      userName: this.currentUser.name,
      projectId: this.currentProjectId!,
      data: {
        documentId,
        content,
        position
      }
    });
  }

  // 更新任务状态
  updateTask(taskId: string, updates: any): void {
    if (!this.currentUser) return;
    
    this.sendEvent({
      type: 'task_update',
      userId: this.currentUser.id,
      userName: this.currentUser.name,
      projectId: this.currentProjectId!,
      data: {
        taskId,
        updates
      }
    });
  }

  // 获取在线用户列表
  getOnlineUsers(): OnlineUser[] {
    return Array.from(this.state.onlineUsers.values());
  }

  // 获取光标位置
  getCursors(): CursorPosition[] {
    return Array.from(this.state.cursors.values());
  }

  // 获取最近事件
  getRecentEvents(limit = 10): CollaborationEvent[] {
    return this.state.recentEvents.slice(-limit);
  }

  // 获取连接状态
  isConnected(): boolean {
    return this.state.isConnected;
  }

  // 私有方法：模拟WebSocket连接
  private simulateConnection(): void {
    // 模拟其他用户在线
    setTimeout(() => {
      const mockUsers: OnlineUser[] = [
        {
          id: '2',
          name: '李四',
          avatar: '',
          status: 'active',
          currentPage: '/documents',
          lastActivity: Date.now()
        },
        {
          id: '3',
          name: '王五',
          avatar: '',
          status: 'idle',
          currentPage: '/tasks',
          lastActivity: Date.now() - 300000
        }
      ];
      
      mockUsers.forEach(user => {
        this.state.onlineUsers.set(user.id, user);
        this.handleIncomingEvent({
          id: this.generateEventId(),
          type: 'user_join',
          userId: user.id,
          userName: user.name,
          projectId: this.currentProjectId!,
          timestamp: Date.now(),
          data: { user }
        });
      });
    }, 1000);
    
    // 模拟随机协作事件
    this.simulateRandomEvents();
  }

  // 私有方法：处理传入事件
  private handleIncomingEvent(event: CollaborationEvent): void {
    this.state.recentEvents.push(event);
    
    // 保持最近事件数量限制
    if (this.state.recentEvents.length > 100) {
      this.state.recentEvents = this.state.recentEvents.slice(-50);
    }
    
    // 根据事件类型更新状态
    switch (event.type) {
      case 'user_join':
        this.state.onlineUsers.set(event.userId, event.data.user);
        break;
      case 'user_leave':
        this.state.onlineUsers.delete(event.userId);
        this.state.cursors.delete(event.userId);
        break;
      case 'document_edit':
        if (event.data.cursor) {
          this.state.cursors.set(event.userId, event.data.cursor);
        }
        break;
      case 'status_change':
        const user = this.state.onlineUsers.get(event.userId);
        if (user) {
          user.status = event.data.status;
          user.lastActivity = event.timestamp;
        }
        break;
    }
    
    this.emit('event', event);
  }

  // 私有方法：设置心跳
  private setupHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.currentUser) {
        this.updateUserStatus(this.currentUser.status);
      }
    }, 30000); // 每30秒发送心跳
  }

  // 私有方法：生成事件ID
  private generateEventId(): string {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // 私有方法：模拟随机协作事件
  private simulateRandomEvents(): void {
    const events = [
      () => this.handleIncomingEvent({
        id: this.generateEventId(),
        type: 'comment_add',
        userId: '2',
        userName: '李四',
        projectId: this.currentProjectId!,
        timestamp: Date.now(),
        data: {
          documentId: 'doc_1',
          content: '这个设计看起来不错，建议优化一下性能。',
          position: { line: 10, column: 5 }
        }
      }),
      () => this.handleIncomingEvent({
        id: this.generateEventId(),
        type: 'task_update',
        userId: '3',
        userName: '王五',
        projectId: this.currentProjectId!,
        timestamp: Date.now(),
        data: {
          taskId: 'task_1',
          updates: { status: 'completed' }
        }
      })
    ];
    
    // 随机触发事件
    setInterval(() => {
      if (this.state.isConnected && Math.random() > 0.7) {
        const randomEvent = events[Math.floor(Math.random() * events.length)];
        randomEvent();
      }
    }, 10000); // 每10秒可能触发一个随机事件
  }
}

// 导出单例实例
export const collaborationService = new CollaborationService();
export default collaborationService;