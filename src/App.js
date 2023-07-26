import './App.css';

import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Sphere, SpotLight, meshBounds } from '@react-three/drei'
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

  const [endP, setEndP] = useState([0, 0, 0]);

  useEffect(()=>{
    const geometry = new THREE.BufferGeometry();
    const material = new THREE.LineBasicMaterial({
      color: 0xff0000
    });
    ref.current.material = material;
    ref.current.geometry =  geometry;
  
  },[])

  useFrame(() => {


    if (bulletPos[0] < -2 && bulletPos[0] > -2.05 && meshPos[0] === -2) {

      ref.current.geometry.setFromPoints([start, bulletPos].map((point) => new THREE.Vector3(...point)));
    }
    else if (bulletPos[0] > 2 && bulletPos[0] < 2.05 && meshPos[0] === 2) {

      ref.current.geometry.setFromPoints([start, bulletPos].map((point) => new THREE.Vector3(...point)));
    }
  })
  return (
    <line ref={ref}>
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
  const [flag, setflag] = useState(1);
  const [random, setRandom] = useState(Math.random())
  const ref = useRef();
  const inRef = useRef();
  const outRef = useRef();
  useFrame((state, delta) => {
    ref.current.position.x += 2 * delta;
    ref.current.position.y += 0.5 * flag * (random / 5) * delta;
    if (ref.current.position.x > 4) {
      ref.current.position.x = -4;
      ref.current.position.y = 1;
      setRandom(Math.random())
      if (Math.random() < 0.5) setflag(-1)
      else setflag(1)
    }
    
    setBulletPos([ref.current.position.x, ref.current.position.y, ref.current.position.z]);
    if (Math.floor(ref.current.position.x*20)/20 === -2){
      inRef.current.position.set(...ref.current.position);
      inRef.current.position.x -= 0.03;
    }
    else if (Math.floor(ref.current.position.x*20)/20 === 2) {
      outRef.current.position.set(...ref.current.position);
    }
    if(ref.current.position.x <-2){
      outRef.current.visible = false;
      inRef.current.visible = false;
    }
    else if (Math.floor(ref.current.position.x*20)/20 === -2) {
      inRef.current.visible = true;
    }

    else if (Math.floor(ref.current.position.x*20)/20 === 2) {
      outRef.current.visible = true;
    }
  });

  return (
    <mesh>

    <mesh ref={ref} {...meshProps}>
      <sphereGeometry args={[0.05, 16, 16]} />
      <meshBasicMaterial color={0x00ffff} wireframe />
    </mesh>
    <mesh ref={inRef}>
      <sphereGeometry args={[0.05, 16, 16]} />
      <meshBasicMaterial color={0x00ff} wireframe />
    </mesh>
    <mesh ref={outRef}>
    <sphereGeometry args={[0.05, 16, 16]} />
      <meshBasicMaterial color={0x00ff} wireframe />
    </mesh>
    </mesh>
  )
}
function BulletTrack(props) {
  const { start, end, setTrackStart } = props;
  const ref = useRef();

  useEffect(()=>{
    const geometry = new THREE.BufferGeometry();
    const material = new THREE.LineBasicMaterial({
      color: 0xff0000
    });
    ref.current.material = material;
    ref.current.geometry =  geometry;
  
  },[])

  useFrame(() => {
    if (end[0] <-2){
      setTrackStart(end);

    }
    else if(end[0] < 2){
      ref.current.geometry.setFromPoints([start, end].map((point) => new THREE.Vector3(...point)));
    }
  },);

  return (
    <line ref={ref}>
    </line>
  )
}
function Stick(props) {
  const { args } = props;
  const stick_model = useLoader(GLTFLoader, '/models/stick.glb');
  return (
    <mesh scale={[0.5, 1.7, 0.5]} {...args}>

      <primitive object={stick_model.scene.clone(true)} />
    </mesh>
  )
}

function BulletPoint(props){
  const {location} = props;
  const ref = useRef(null);

  useEffect(()=>{
    const geometry = new THREE.SphereGeometry({
      radius : 1
    });
    const material = new THREE.MeshBasicMaterial({
      color:0x0000ff
    });
    ref.current.material = material;
    ref.current.geometry = geometry;
  },[]);

  useFrame(()=>{
    if(location[0]>0)
    console.log(ref.current);
    ref.current.position.set(new THREE.Vector3(0,0,0));
  })

  return(
    <mesh ref={ref}>
    </mesh>
  )
}


const sticks = [{
  position: [2.4, 0, -2.18],
  rotation: [Math.PI / 2, 0, 0],
  scale: [0.5, 1.77, 0.5],
},
{
  position: [2.4, 2.4, -2.18],
  rotation: [Math.PI / 2, 0, 0],
  scale: [0.5, 1.77, 0.5],
},
{
  position: [2.4, 0.05, -2.12],
  rotation: [0, 0, 0],
  scale: [0.5, 0.92, 0.5]
},
{
  position: [2.4, 0.05, 2.2],
  rotation: [0, 0, 0],
  scale: [0.5, 0.92, 0.5]
},
{
  position: [-2.4, 0, -2.18],
  rotation: [Math.PI / 2, 0, 0],
  scale: [0.5, 1.77, 0.5],
},
{
  position: [-2.4, 2.4, -2.18],
  rotation: [Math.PI / 2, 0, 0],
  scale: [0.5, 1.77, 0.5]
},
{
  position: [-2.4, 0.05, -2.12],
  rotation: [0, 0, 0],
  scale: [0.5, 0.92, 0.5]
},
{
  position: [-2.4, 0.05, 2.2],
  rotation: [0, 0, 0],
  scale: [0.5, 0.92, 0.5]
},
{
  position: [2.4, 0, -2.12],
  rotation: [0, 0, Math.PI / 2],
  scale: [0.5, 1.90, 0.5]
},
{
  position: [2.4, 0, 2.2],
  rotation: [0, 0, Math.PI / 2],
  scale: [0.5, 1.90, 0.5]
},
{
  position: [2.4, 2.4, -2.12],
  rotation: [0, 0, Math.PI / 2],
  scale: [0.5, 1.90, 0.5]
},
{
  position: [2.4, 2.4, 2.2],
  rotation: [0, 0, Math.PI / 2],
  scale: [0.5, 1.90, 0.5]
},
]
function App() {

  const initialBulletPos = [-4, 1, 0];
  const [bulletPos, setBulletPos] = useState(initialBulletPos);
  const [trackStart, setTrackStart] = useState([-2, 1, 0]);



  return (
    <div className="App">
      <Canvas frameloop="always" camera={{ position: [0, 0, 8] }}>
        <directionalLight position={[10, 10, 5]} intensity={2} />
        <directionalLight position={[-10, -10, -5]} intensity={1} />
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
          <BulletTrack setTrackStart={setTrackStart} start={trackStart} end={bulletPos} />

        </mesh>
        {sticks.map((stick) => {
          return (
            <Stick
              args={{
                ...stick

              }}
            />
          )
        })}
        <OrbitControls />
      </Canvas>
    </div>
  );
}

export default App;
