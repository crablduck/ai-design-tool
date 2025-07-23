import React, { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Box, Sphere, Cylinder, Cone, Html } from '@react-three/drei';
import * as THREE from 'three';
import { Entity3D, Relationship3D, ViewSettings3D, Vector3D } from '../../types/document';
import { RotateCcw, ZoomIn, ZoomOut, Move3D, Eye, Settings, Maximize2, Minimize2 } from 'lucide-react';

interface DomainModel3DProps {
  entities: Entity3D[];
  relationships: Relationship3D[];
  viewSettings?: ViewSettings3D;
  onEntityClick?: (entityId: string) => void;
  onEntityDoubleClick?: (entityId: string) => void;
  onRelationshipClick?: (relationshipId: string) => void;
}

// 3D实体组件
const Entity3DComponent: React.FC<{
  entity: Entity3D;
  isSelected?: boolean;
  onClick?: () => void;
  onDoubleClick?: () => void;
}> = ({ entity, isSelected, onClick, onDoubleClick }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current && entity.animations) {
      // 简单的旋转动画
      meshRef.current.rotation.y += 0.01;
    }
  });

  const renderShape = () => {
    const props = {
      ref: meshRef,
      position: [entity.position.x, entity.position.y, entity.position.z] as [number, number, number],
      scale: [entity.scale.x, entity.scale.y, entity.scale.z] as [number, number, number],
      rotation: [entity.rotation.x, entity.rotation.y, entity.rotation.z] as [number, number, number],
      onClick,
      onDoubleClick,
      onPointerOver: () => setHovered(true),
      onPointerOut: () => setHovered(false)
    };

    const material = (
      <meshStandardMaterial
        color={hovered ? '#ffffff' : entity.color}
        emissive={isSelected ? '#444444' : '#000000'}
        transparent
        opacity={0.8}
      />
    );

    switch (entity.shape) {
      case '3d-sphere':
        return (
          <Sphere {...props} args={[1, 32, 32]}>
            {material}
          </Sphere>
        );
      case '3d-cylinder':
        return (
          <Cylinder {...props} args={[1, 1, 2, 32]}>
            {material}
          </Cylinder>
        );
      case '3d-pyramid':
        return (
          <Cone {...props} args={[1, 2, 8]}>
            {material}
          </Cone>
        );
      default: // 3d-box
        return (
          <Box {...props} args={[2, 1, 1]}>
            {material}
          </Box>
        );
    }
  };

  return (
    <group>
      {renderShape()}
      <Text
        position={[entity.position.x, entity.position.y + 1.5, entity.position.z]}
        fontSize={0.3}
        color="#333333"
        anchorX="center"
        anchorY="middle"
        maxWidth={3}
        textAlign="center"
      >
        {entity.name}
      </Text>
      {hovered && (
        <Html
          position={[entity.position.x, entity.position.y + 2, entity.position.z]}
          center
        >
          <div className="bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs max-w-xs">
            <div className="font-semibold">{entity.name}</div>
            <div className="mt-1">
              <div className="text-gray-300">类型: {entity.type}</div>
              <div className="text-gray-300">颜色: {entity.color}</div>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
};

// 3D关系组件
const Relationship3DComponent: React.FC<{
  relationship: Relationship3D;
  entities: Entity3D[];
  onClick?: () => void;
}> = ({ relationship, entities, onClick }) => {
  const sourceEntity = entities.find(e => e.id === relationship.source);
  const targetEntity = entities.find(e => e.id === relationship.target);

  if (!sourceEntity || !targetEntity) return null;

  const start = new THREE.Vector3(sourceEntity.position.x, sourceEntity.position.y, sourceEntity.position.z);
  const end = new THREE.Vector3(targetEntity.position.x, targetEntity.position.y, targetEntity.position.z);
  const direction = end.clone().sub(start);
  const length = direction.length();
  const midPoint = start.clone().add(direction.clone().multiplyScalar(0.5));

  // 创建曲线路径
  const curve = new THREE.QuadraticBezierCurve3(
    start,
    midPoint.clone().add(new THREE.Vector3(0, length * 0.2, 0)),
    end
  );

  const points = curve.getPoints(50);
  const geometry = new THREE.BufferGeometry().setFromPoints(points);

  return (
    <group onClick={onClick}>
      <primitive object={new THREE.Line(geometry, new THREE.LineBasicMaterial({
        color: relationship.color || '#666666',
        transparent: true,
        opacity: 0.7
      }))} />
      <Text
        position={[midPoint.x, midPoint.y + 0.5, midPoint.z]}
        fontSize={0.2}
        color={relationship.color || '#666666'}
        anchorX="center"
        anchorY="middle"
      >
        {relationship.type}
      </Text>
    </group>
  );
};

// 场景组件
const Scene: React.FC<{
  entities: Entity3D[];
  relationships: Relationship3D[];
  viewSettings: ViewSettings3D;
  selectedEntityId?: string;
  onEntityClick?: (entityId: string) => void;
  onEntityDoubleClick?: (entityId: string) => void;
  onRelationshipClick?: (relationshipId: string) => void;
}> = ({
  entities,
  relationships,
  viewSettings,
  selectedEntityId,
  onEntityClick,
  onEntityDoubleClick,
  onRelationshipClick
}) => {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(
      viewSettings.camera.position.x,
      viewSettings.camera.position.y,
      viewSettings.camera.position.z
    );
    camera.lookAt(
      viewSettings.camera.target.x,
      viewSettings.camera.target.y,
      viewSettings.camera.target.z
    );
  }, [camera, viewSettings]);

  return (
    <>
      {/* 环境光 */}
      <ambientLight intensity={viewSettings.lighting.ambient} />
      
      {/* 方向光 */}
      <directionalLight
        position={[
          viewSettings.lighting.directional.position.x,
          viewSettings.lighting.directional.position.y,
          viewSettings.lighting.directional.position.z
        ]}
        intensity={viewSettings.lighting.directional.intensity}
        castShadow
      />

      {/* 实体 */}
      {entities.map(entity => (
        <Entity3DComponent
          key={entity.id}
          entity={entity}
          isSelected={selectedEntityId === entity.id}
          onClick={() => onEntityClick?.(entity.id)}
          onDoubleClick={() => onEntityDoubleClick?.(entity.id)}
        />
      ))}

      {/* 关系 */}
      {relationships.map(relationship => (
        <Relationship3DComponent
          key={relationship.id}
          relationship={relationship}
          entities={entities}
          onClick={() => onRelationshipClick?.(relationship.id)}
        />
      ))}

      {/* 控制器 */}
      <OrbitControls
        enableRotate={viewSettings.controls.enableRotation}
        enableZoom={viewSettings.controls.enableZoom}
        enablePan={viewSettings.controls.enablePan}
        autoRotate={viewSettings.controls.autoRotate}
        autoRotateSpeed={0.5}
      />
    </>
  );
};

const DomainModel3D: React.FC<DomainModel3DProps> = ({
  entities,
  relationships,
  viewSettings,
  onEntityClick,
  onEntityDoubleClick,
  onRelationshipClick
}) => {
  const [selectedEntityId, setSelectedEntityId] = useState<string>();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [currentViewSettings, setCurrentViewSettings] = useState<ViewSettings3D>(
    viewSettings || {
      camera: {
        position: { x: 10, y: 10, z: 10 },
        target: { x: 0, y: 0, z: 0 },
        fov: 75
      },
      lighting: {
        ambient: 0.4,
        directional: {
          intensity: 0.8,
          position: { x: 10, y: 10, z: 5 }
        }
      },
      background: {
        type: 'color',
        value: '#f0f0f0'
      },
      controls: {
        enableRotation: true,
        enableZoom: true,
        enablePan: true,
        autoRotate: false
      }
    }
  );

  const handleEntityClick = (entityId: string) => {
    setSelectedEntityId(entityId);
    onEntityClick?.(entityId);
  };

  const handleEntityDoubleClick = (entityId: string) => {
    onEntityDoubleClick?.(entityId);
  };

  const handleRelationshipClick = (relationshipId: string) => {
    onRelationshipClick?.(relationshipId);
  };

  const resetView = () => {
    setCurrentViewSettings(prev => ({
      ...prev,
      camera: {
        ...prev.camera,
        position: { x: 10, y: 10, z: 10 },
        target: { x: 0, y: 0, z: 0 }
      }
    }));
  };

  const toggleAutoRotate = () => {
    setCurrentViewSettings(prev => ({
      ...prev,
      controls: {
        ...prev.controls,
        autoRotate: !prev.controls.autoRotate
      }
    }));
  };

  const updateLighting = (type: 'ambient' | 'directional', value: number) => {
    setCurrentViewSettings(prev => ({
      ...prev,
      lighting: {
        ...prev.lighting,
        [type]: type === 'ambient' ? value : {
          ...prev.lighting.directional,
          intensity: value
        }
      }
    }));
  };

  return (
    <div className={`relative bg-gray-100 ${isFullscreen ? 'fixed inset-0 z-50' : 'h-96 rounded-lg overflow-hidden'}`}>
      {/* 工具栏 */}
      <div className="absolute top-4 right-4 z-10 flex items-center space-x-2">
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 bg-white bg-opacity-90 border border-gray-300 rounded-lg shadow-sm hover:bg-opacity-100 transition-all"
          title="设置"
        >
          <Settings className="w-4 h-4 text-gray-600" />
        </button>
        <button
          onClick={toggleAutoRotate}
          className={`p-2 bg-white bg-opacity-90 border border-gray-300 rounded-lg shadow-sm hover:bg-opacity-100 transition-all ${
            currentViewSettings.controls.autoRotate ? 'bg-blue-50 border-blue-300' : ''
          }`}
          title="自动旋转"
        >
          <RotateCcw className="w-4 h-4 text-gray-600" />
        </button>
        <button
          onClick={resetView}
          className="p-2 bg-white bg-opacity-90 border border-gray-300 rounded-lg shadow-sm hover:bg-opacity-100 transition-all"
          title="重置视图"
        >
          <Eye className="w-4 h-4 text-gray-600" />
        </button>
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="p-2 bg-white bg-opacity-90 border border-gray-300 rounded-lg shadow-sm hover:bg-opacity-100 transition-all"
          title={isFullscreen ? '退出全屏' : '全屏显示'}
        >
          {isFullscreen ? (
            <Minimize2 className="w-4 h-4 text-gray-600" />
          ) : (
            <Maximize2 className="w-4 h-4 text-gray-600" />
          )}
        </button>
      </div>

      {/* 设置面板 */}
      {showSettings && (
        <div className="absolute top-16 right-4 z-10 bg-white border border-gray-300 rounded-lg shadow-lg p-4 w-64">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">3D视图设置</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                环境光强度
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={currentViewSettings.lighting.ambient}
                onChange={(e) => updateLighting('ambient', parseFloat(e.target.value))}
                className="w-full"
              />
              <span className="text-xs text-gray-500">{currentViewSettings.lighting.ambient}</span>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                方向光强度
              </label>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={currentViewSettings.lighting.directional.intensity}
                onChange={(e) => updateLighting('directional', parseFloat(e.target.value))}
                className="w-full"
              />
              <span className="text-xs text-gray-500">{currentViewSettings.lighting.directional.intensity}</span>
            </div>
            
            <div className="space-y-2">
              <label className="flex items-center text-xs">
                <input
                  type="checkbox"
                  checked={currentViewSettings.controls.enableRotation}
                  onChange={(e) => setCurrentViewSettings(prev => ({
                    ...prev,
                    controls: { ...prev.controls, enableRotation: e.target.checked }
                  }))}
                  className="mr-2"
                />
                启用旋转
              </label>
              <label className="flex items-center text-xs">
                <input
                  type="checkbox"
                  checked={currentViewSettings.controls.enableZoom}
                  onChange={(e) => setCurrentViewSettings(prev => ({
                    ...prev,
                    controls: { ...prev.controls, enableZoom: e.target.checked }
                  }))}
                  className="mr-2"
                />
                启用缩放
              </label>
              <label className="flex items-center text-xs">
                <input
                  type="checkbox"
                  checked={currentViewSettings.controls.enablePan}
                  onChange={(e) => setCurrentViewSettings(prev => ({
                    ...prev,
                    controls: { ...prev.controls, enablePan: e.target.checked }
                  }))}
                  className="mr-2"
                />
                启用平移
              </label>
            </div>
          </div>
        </div>
      )}

      {/* 信息面板 */}
      {selectedEntityId && (
        <div className="absolute bottom-4 left-4 z-10 bg-white bg-opacity-90 border border-gray-300 rounded-lg shadow-sm p-3 max-w-xs">
          {(() => {
            const entity = entities.find(e => e.id === selectedEntityId);
            if (!entity) return null;
            return (
              <div>
                <h4 className="font-semibold text-gray-900 text-sm mb-2">{entity.name}</h4>
                <div className="text-xs text-gray-600 space-y-1">
                  <div>类型: {entity.type}</div>
                  <div>位置: ({entity.position.x.toFixed(1)}, {entity.position.y.toFixed(1)}, {entity.position.z.toFixed(1)})</div>
                  <div>颜色: {entity.color}</div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* 3D Canvas */}
      <Canvas
        camera={{
          position: [currentViewSettings.camera.position.x, currentViewSettings.camera.position.y, currentViewSettings.camera.position.z],
          fov: currentViewSettings.camera.fov
        }}
        style={{ background: currentViewSettings.background.value as string }}
      >
        <Suspense fallback={null}>
          <Scene
            entities={entities}
            relationships={relationships}
            viewSettings={currentViewSettings}
            selectedEntityId={selectedEntityId}
            onEntityClick={handleEntityClick}
            onEntityDoubleClick={handleEntityDoubleClick}
            onRelationshipClick={handleRelationshipClick}
          />
        </Suspense>
      </Canvas>

      {/* 空状态 */}
      {entities.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Move3D className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">暂无3D模型数据</p>
            <p className="text-sm text-gray-400 mt-1">添加实体后将显示3D可视化</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DomainModel3D;