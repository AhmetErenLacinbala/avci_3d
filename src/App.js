
import './App.css';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Sphere, SpotLight } from '@react-three/drei'
import { DoubleSide } from 'three';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three'
import React from 'react';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { AmbientLight } from 'three';


const camprops = [
  {
    pos: [2, 2, 2],
    rotationY: -Math.PI / 2,
    rotationZ: Math.PI / 2,
    alignment: [-1, -1],
  },
  {
    pos: [-2, 2, -2],
    rotationY: Math.PI / 2,
    rotationZ: 0,
    alignment: [-1, 1],
  },
  {
    pos: [-2, 2, 2],
    rotationY: -Math.PI / 2,
    rotationZ: Math.PI / 2,
    alignment: [-1, -1],
  },
  {
    pos: [2, 2, -2],
    rotationY: Math.PI / 2,
    rotationZ: 0,
    alignment: [-1, 1],
  }
]

function Line({ start, end, bulletPos, meshPos }) {
  const ref = useRef();


  useFrame(() => {
    if (bulletPos[0] < 2 && bulletPos[0] > -2) {
      if (meshPos[0] < 0 && bulletPos[0] < 0) {
        ref.current.geometry.setFromPoints([start, end].map((point) => new THREE.Vector3(...point)));
      }
      else if (meshPos[0] > 0 && bulletPos[0] > 0) {
        ref.current.geometry.setFromPoints([start, end].map((point) => new THREE.Vector3(...point)));
      }
    }


    if (meshPos[0] > 0) {
      if (bulletPos[0] > 0) {
        ref.current.visible = true
      }
    }
    else if (meshPos[0] < 0) {
      if (bulletPos[0] < 0) {
        ref.current.visible = true
      }
    }

    else ref.current.visible = false

  })

  return (
    <line ref={ref}>
      <bufferGeometry />
      <lineBasicMaterial color="hotpink" />
    </line>
  )
}

function Cam(props) {
  const { scene } = useLoader(GLTFLoader, '/models/camera.glb');
  const { meshProps, lineEnd, rotationY, rotationZ, alignment, bulletPos } = props;



  return (
    <mesh>

      <mesh rotation={[Math.PI / 4, rotationY, rotationZ]} scale={[0.1, 0.1, 0.1]}  {...meshProps}>

        <primitive object={scene.clone(true)} />
      </mesh>
      <Line bulletPos={bulletPos} start={[meshProps.position[0], meshProps.position[1] + (alignment[0] * Math.cos(Math.PI / 4) * 0.2), meshProps.position[2] + (alignment[1] * Math.sin(Math.PI / 4) * 0.2)]} end={lineEnd} meshPos={meshProps.position} />

    </mesh>
  )
}

function Bullet(props) {
  const { meshProps, setBulletPos } = props;

  const ref = useRef();

  useFrame((state, delta) => {
    ref.current.position.x += 2 * delta;
    if (ref.current.position.x > 4) {
      ref.current.position.x = -4;
    }
    setBulletPos([ref.current.position.x, ref.current.position.y, ref.current.position.z]);
  });


  return (
    <mesh ref={ref} {...meshProps}>
      <sphereGeometry args={[0.05, 16, 16]} />
      <meshBasicMaterial color={0x00ffff} wireframe />
    </mesh>
  )
}

function BulletTrack(props) {
  const { start, end, bulletPos, setTrackStart } = props;
  const ref = useRef();



  useFrame(() => {
    if (bulletPos[0] < 2 && bulletPos[0] > -2)
      ref.current.geometry.setFromPoints([start, end].map((point) => new THREE.Vector3(...point)));
    if (bulletPos[0] > -2) ref.current.visible = true
    else ref.current.visible = false
  })

  return (
    <line ref={ref}>
      <bufferGeometry />
      <lineBasicMaterial color="hotpink" />
    </line>
  )
}

function App() {

  const initialBulletPos = [-4, 1, 0];
  const [bulletPos, setBulletPos] = useState(initialBulletPos);
  const [trackStart, setTrackStart] = useState([-2, 1, 0]);

  useEffect(() => {
    console.log("hello");
    if (bulletPos[0] === -2)
      setTrackStart(bulletPos);
  }, [bulletPos]);

  return (
    <div className="App">
      <Canvas frameloop="always" camera={{ position: [0, 0, 8] }}>
        <ambientLight args={[0xcccccc]} />

        <mesh>

          {camprops.map((cam) => {
            return (
              <Cam
                bulletPos={bulletPos}
                setBulletPos={setBulletPos}
                lineEnd={bulletPos}
                alignment={cam.alignment}
                rotationY={cam.rotationY}
                rotationZ={cam.rotationZ}
                meshProps={{
                  position: cam.pos
                }}
              />
            )
          })}

          <Bullet setBulletPos={setBulletPos} meshProps={{
            position: bulletPos
          }} />
          {bulletPos[0] > -2 ? <BulletTrack start={trackStart} end={bulletPos} bulletPos={bulletPos} /> : ""}

        </mesh>
        <OrbitControls />
      </Canvas>
    </div>
  );
}

export default App;
