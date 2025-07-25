import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Line, Box, Sphere, Cylinder, Cone } from '@react-three/drei';
import { Button, Card, Slider, Switch, Space, Typography, Drawer } from 'antd';
import { 
  FullscreenOutlined, 
  SettingOutlined, 
  ReloadOutlined, 
  PlayCircleOutlined,
  PauseCircleOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { Entity3D, Relationship3D, Vector3D } from '../types/document';
import * as THREE from 'three';

// 错误边界组件
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('3D渲染错误:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
          <div className="text-center text-gray-500">
            <InfoCircleOutlined className="text-4xl mb-4" />
            <p>3D渲染出现错误</p>
            <p className="text-sm">请刷新页面重试</p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const { Title, Text: AntText } = Typography;

interface DomainModel3DProps {
  entities: Entity3D[];
  relationships: Relationship3D[];
  onEntityClick?: (entityId: string) => void;
}

// 3D实体组件
const Entity3DComponent: React.FC<{
  entity: Entity3D;
  onClick?: () => void;
  isSelected?: boolean;
}> = ({ entity, onClick, isSelected }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
    }
  });

  const handleClick = () => {
    onClick?.();
  };

  const renderGeometry = () => {
    const meshProps = {
      ref: meshRef,
      position: [entity.position.x, entity.position.y, entity.position.z] as [number, number, number],
      scale: [entity.scale.x, entity.scale.y, entity.scale.z] as [number, number, number],
      rotation: [entity.rotation.x, entity.rotation.y, entity.rotation.z] as [number, number, number],
      onClick: handleClick,
      onPointerOver: () => setHovered(true),
      onPointerOut: () => setHovered(false)
    };

    const materialColor = isSelected ? '#ff6b6b' : hovered ? '#4ecdc4' : entity.color;

    switch (entity.geometry) {
      case 'sphere':
        return (
          <mesh {...meshProps}>
            <sphereGeometry args={[1, 32, 32]} />
            <meshStandardMaterial 
              color={materialColor}
              transparent
              opacity={0.8}
            />
          </mesh>
        );
      case 'cylinder':
        return (
          <mesh {...meshProps}>
            <cylinderGeometry args={[1, 1, 2, 32]} />
            <meshStandardMaterial 
              color={materialColor}
              transparent
              opacity={0.8}
            />
          </mesh>
        );
      case 'pyramid':
        return (
          <mesh {...meshProps}>
            <coneGeometry args={[1, 2, 4]} />
            <meshStandardMaterial 
              color={materialColor}
              transparent
              opacity={0.8}
            />
          </mesh>
        );
      default:
        return (
          <mesh {...meshProps}>
            <boxGeometry args={[2, 2, 2]} />
            <meshStandardMaterial 
              color={materialColor}
              transparent
              opacity={0.8}
            />
          </mesh>
        );
    }
  };

  return (
    <group>
      {renderGeometry()}
      <Text
        position={[entity.position.x, entity.position.y + 2, entity.position.z]}
        fontSize={0.5}
        color="#333"
        anchorX="center"
        anchorY="middle"
      >
        {entity.name}
      </Text>
    </group>
  );
};

// 3D关系组件
const Relationship3DComponent: React.FC<{
  relationship: Relationship3D;
  entities: Entity3D[];
}> = ({ relationship, entities }) => {
  const sourceEntity = entities.find(e => e.id === relationship.sourceEntityId);
  const targetEntity = entities.find(e => e.id === relationship.targetEntityId);

  if (!sourceEntity || !targetEntity) {
    return null;
  }

  const points = [
    new THREE.Vector3(sourceEntity.position.x, sourceEntity.position.y, sourceEntity.position.z),
    new THREE.Vector3(targetEntity.position.x, targetEntity.position.y, targetEntity.position.z)
  ];

  return (
    <Line
      points={points}
      color={relationship.color}
      lineWidth={2}
      dashed={relationship.style === 'dashed'}
    />
  );
};

// 场景组件
const Scene: React.FC<{
  entities: Entity3D[];
  relationships: Relationship3D[];
  selectedEntityId?: string;
  onEntityClick?: (entityId: string) => void;
  autoRotate: boolean;
}> = ({ entities, relationships, selectedEntityId, onEntityClick, autoRotate }) => {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(10, 10, 10);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  return (
    <>
      {/* 灯光 */}
      <ambientLight intensity={0.6} />
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight 
        position={[-10, -10, -5]} 
        intensity={0.5}
        distance={100}
        decay={2}
      />

      {/* 实体 */}
      {entities.map(entity => (
        <Entity3DComponent
          key={entity.id}
          entity={entity}
          isSelected={entity.id === selectedEntityId}
          onClick={() => onEntityClick?.(entity.id)}
        />
      ))}

      {/* 关系 */}
      {relationships.map(relationship => (
        <Relationship3DComponent
          key={relationship.id}
          relationship={relationship}
          entities={entities}
        />
      ))}

      {/* 控制器 */}
      <OrbitControls
        enablePan
        enableZoom
        enableRotate
        autoRotate={autoRotate}
        autoRotateSpeed={2}
        maxPolarAngle={Math.PI}
        minDistance={5}
        maxDistance={50}
      />
    </>
  );
};

// 主组件
const DomainModel3D: React.FC<DomainModel3DProps> = ({
  entities,
  relationships,
  onEntityClick
}) => {
  const [selectedEntityId, setSelectedEntityId] = useState<string>();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [lightIntensity, setLightIntensity] = useState(1);
  const [cameraDistance, setCameraDistance] = useState(10);

  const selectedEntity = entities.find(e => e.id === selectedEntityId);

  const handleEntityClick = (entityId: string) => {
    setSelectedEntityId(entityId);
    setShowInfo(true);
    onEntityClick?.(entityId);
  };

  const handleResetView = () => {
    setSelectedEntityId(undefined);
    setShowInfo(false);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const containerStyle = {
    width: '100%',
    height: isFullscreen ? '100vh' : '600px',
    position: isFullscreen ? 'fixed' as const : 'relative' as const,
    top: isFullscreen ? 0 : 'auto',
    left: isFullscreen ? 0 : 'auto',
    zIndex: isFullscreen ? 9999 : 'auto',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  };

  if (entities.length === 0) {
    return (
      <Card className="h-96 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <InfoCircleOutlined className="text-4xl mb-4" />
          <p>暂无3D数据可显示</p>
          <p className="text-sm">请先添加领域术语以生成3D可视化</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="relative">
      <div style={containerStyle}>
        <ErrorBoundary>
          <Canvas
            camera={{ position: [10, 10, 10], fov: 75 }}
            gl={{ antialias: true, alpha: true }}
            onCreated={({ gl }) => {
              gl.setClearColor('#000000', 0);
            }}
          >
            <Suspense fallback={null}>
              <Scene
                entities={entities}
                relationships={relationships}
                selectedEntityId={selectedEntityId}
                onEntityClick={handleEntityClick}
                autoRotate={autoRotate}
              />
            </Suspense>
          </Canvas>
        </ErrorBoundary>

        {/* 工具栏 */}
        <div className="absolute top-4 right-4 flex flex-col space-y-2">
          <Button
            type="primary"
            icon={<SettingOutlined />}
            onClick={() => setShowSettings(true)}
            className="bg-white/20 border-white/30 text-white hover:bg-white/30"
          />
          <Button
            type="primary"
            icon={autoRotate ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
            onClick={() => setAutoRotate(!autoRotate)}
            className="bg-white/20 border-white/30 text-white hover:bg-white/30"
          />
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            onClick={handleResetView}
            className="bg-white/20 border-white/30 text-white hover:bg-white/30"
          />
          <Button
            type="primary"
            icon={<FullscreenOutlined />}
            onClick={toggleFullscreen}
            className="bg-white/20 border-white/30 text-white hover:bg-white/30"
          />
        </div>

        {/* 统计信息 */}
        <div className="absolute bottom-4 left-4 bg-white/20 backdrop-blur-sm rounded-lg p-3 text-white">
          <div className="text-sm">
            <div>实体数量: {entities.length}</div>
            <div>关系数量: {relationships.length}</div>
            {selectedEntity && (
              <div className="mt-2 pt-2 border-t border-white/30">
                <div className="font-medium">选中: {selectedEntity.name}</div>
                <div className="text-xs opacity-80">{selectedEntity.metadata?.category}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 设置面板 */}
      <Drawer
        title="3D视图设置"
        placement="right"
        onClose={() => setShowSettings(false)}
        open={showSettings}
        width={320}
      >
        <Space direction="vertical" className="w-full">
          <div>
            <AntText strong>自动旋转</AntText>
            <Switch
              checked={autoRotate}
              onChange={setAutoRotate}
              className="ml-2"
            />
          </div>
          
          <div>
            <AntText strong>光照强度</AntText>
            <Slider
              min={0.1}
              max={2}
              step={0.1}
              value={lightIntensity}
              onChange={setLightIntensity}
              className="mt-2"
            />
          </div>
          
          <div>
            <AntText strong>相机距离</AntText>
            <Slider
              min={5}
              max={20}
              step={1}
              value={cameraDistance}
              onChange={setCameraDistance}
              className="mt-2"
            />
          </div>
        </Space>
      </Drawer>

      {/* 信息面板 */}
      <Drawer
        title="实体信息"
        placement="left"
        onClose={() => setShowInfo(false)}
        open={showInfo && !!selectedEntity}
        width={320}
      >
        {selectedEntity && (
          <Space direction="vertical" className="w-full">
            <Card size="small">
              <Title level={5}>{selectedEntity.name}</Title>
              <AntText type="secondary">{selectedEntity.metadata?.definition}</AntText>
            </Card>
            
            <Card size="small" title="基本信息">
              <div className="space-y-2">
                <div><strong>类别:</strong> {selectedEntity.metadata?.category}</div>
                <div><strong>几何形状:</strong> {selectedEntity.geometry}</div>
                <div><strong>颜色:</strong> 
                  <span 
                    className="inline-block w-4 h-4 rounded ml-2" 
                    style={{ backgroundColor: selectedEntity.color }}
                  />
                </div>
              </div>
            </Card>
            
            {selectedEntity.metadata?.examples && (
              <Card size="small" title="示例">
                <ul className="list-disc list-inside text-sm">
                  {selectedEntity.metadata.examples.map((example: string, index: number) => (
                    <li key={index}>{example}</li>
                  ))}
                </ul>
              </Card>
            )}
            
            {selectedEntity.metadata?.tags && (
              <Card size="small" title="标签">
                <Space wrap>
                  {selectedEntity.metadata.tags.map((tag: string, index: number) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                      {tag}
                    </span>
                  ))}
                </Space>
              </Card>
            )}
          </Space>
        )}
      </Drawer>
    </div>
  );
};

export default DomainModel3D;