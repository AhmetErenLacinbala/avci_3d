import './App.css';

import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, PerformanceMonitor, Sphere, SpotLight, meshBounds, useHelper } from '@react-three/drei'
import { DoubleSide } from 'three';
import { Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three'
import React from 'react';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { AmbientLight } from 'three';
import { Bloom, EffectComposer, SSAO } from '@react-three/postprocessing'
import { BlurPass, Resizer, KernelSize, Resolution } from 'postprocessing'
import { Perf } from 'r3f-perf';

const camprops = [
  {
    pos: [2, 2.1, 1.9],
    rotationY: -Math.PI / 2,
    rotationZ: Math.PI / 2,
    alignment: [-1, -1],
  },
  {
    pos: [-2, 2.1, -1.9],
    rotationY: Math.PI / 2,
    rotationZ: 0,
    alignment: [-1, 1],
  },
  {
    pos: [-2, 2.1, 1.9],
    rotationY: -Math.PI / 2,
    rotationZ: Math.PI / 2,
    alignment: [-1, -1],
  },
  {
    pos: [2, 2.1, -1.9],
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


    if (bulletPos[0] < -2 && bulletPos[0] > -2.1 && meshPos[0] === -2) {

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
  //https://raw.githubusercontent.com/AhmetErenLacinbala/avci_3d/master/public/models/camera.glb
  // /models/camera.glb
  const { scene } = useLoader(GLTFLoader, 'https://raw.githubusercontent.com/AhmetErenLacinbala/avci_3d/master/public/models/camera.glb');
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
  //
  // /models/rpg.glb
  const rpg = useLoader(GLTFLoader, '/models/rpg.glb');
  const { meshProps, setBulletPos } = props;
  const [flag, setflag] = useState(1);
  const [random, setRandom] = useState(Math.random())
  const bulletRef = useRef();
  const inRef = useRef();
  const outRef = useRef();
  const particalRef = useRef();
  useEffect(() => {
    let particleGeometry = new THREE.BufferGeometry();
    let particlePositions = new Float32Array(1000 * 3);
  
    // Set all positions to zero
    for (let i = 0; i < 1000; i++) {
      particlePositions[i * 3 + 0] = 0;
      particlePositions[i * 3 + 1] = 0;
      particlePositions[i * 3 + 2] = 0;
    }
  
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
  
    let particleMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.05,
    });
  
    particalRef.current.geometry = particleGeometry;
    particalRef.current.material = particleMaterial;
    console.log(particalRef.current)
  }, []);
  
  useFrame((state, delta) => {
    bulletRef.current.position.x += 3 * delta;
    bulletRef.current.position.y += 0.75 * flag * (random/5) * delta;

    let positions = particalRef.current.geometry.attributes.position.array;

    //console.log(positions);
    for (let i = 0; i < 1000; i++) {

      // Assign a random speed to the particle
      var speed = Math.random() * 0.5;

      // Move the particle in the -z direction at the random speed
      positions[i * 3 + 1] -= speed;

      //expanding on x and y axis
      positions[i * 3 + 0] += (Math.random() - 0.5) * 0.08;
      positions[i * 3 + 2] += (Math.random() - 0.5) * 0.08;

      // Check if the particle has reached the reset point
      if (positions[i * 3 + 1] < -2) {
          // Reset the particle back to its starting position
          positions[i * 3 + 0] = 0;
          positions[i * 3 + 1] = 0;
          positions[i * 3 + 2] = 0;
      }
  }

  particalRef.current.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  // Update the particle positions in the buffer geometry
  //particalRef.current.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    if (bulletRef.current.position.x > 4) {
      bulletRef.current.position.x = -4;
      bulletRef.current.position.y = 1;
      setRandom(Math.random())
      if (Math.random() < 0.5) setflag(-1)
      else setflag(1)
    }
    
    setBulletPos([bulletRef.current.position.x, bulletRef.current.position.y, bulletRef.current.position.z]);
    if (Math.floor(bulletRef.current.position.x*20)/20 === -2){
      inRef.current.position.set(...bulletRef.current.position);
      inRef.current.position.x -= 0.03;
    }
    else if (Math.floor(bulletRef.current.position.x*20)/20 === 2) {
      outRef.current.position.set(...bulletRef.current.position);
    }
    if(bulletRef.current.position.x <-2){
      outRef.current.visible = false;
      inRef.current.visible = false;
    }
    else if (Math.floor(bulletRef.current.position.x*20)/20 === -2) {
      inRef.current.visible = true;
    }

    else if (Math.floor(bulletRef.current.position.x*20)/20 === 2) {
      outRef.current.visible = true;
    }
  });
/* 
      <sphereGeometry args={[0.05, 16, 16]} />
      <meshStandardMaterial metalness={0.9} color={'gray'} />

      ref.current.rotation.z = (Math.atan((flag*(0.75*(random))/(3)))/Math.PI - Math.PI/2);
*/
  return (
    <mesh>

    <mesh scale={0.33}  ref={bulletRef} {...meshProps}>
      <mesh rotation={[0,0, Math.atan((flag*(0.75*(random/5))/(3)))/Math.PI - Math.PI/2]}>
      <primitive object={rpg.scene}/>
      <mesh ref={particalRef}>

      </mesh>
      </mesh>
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
  //https://raw.githubusercontent.com/AhmetErenLacinbala/avci_3d/master/public/models/stick.glb
  ///models/stick.glb
  const { args } = props;
  const stick_model = useLoader(GLTFLoader, 'https://raw.githubusercontent.com/AhmetErenLacinbala/avci_3d/master/public/models/stick.glb');
  return (
    <mesh scale={[0.5, 1.7, 0.5]} {...args}>

      <primitive object={stick_model.scene.clone(true)} />
    </mesh>
  )
}

function LightStick(props) {
  //https://raw.githubusercontent.com/AhmetErenLacinbala/avci_3d/master/public/models/light.glb
  //models/light.glb
  const { args } = props;
  const stick_model = useLoader(GLTFLoader, 'https://raw.githubusercontent.com/AhmetErenLacinbala/avci_3d/master/public/models/light.glb');
  return (
    <mesh rotation={[-Math.PI/2, Math.PI ,0]} {...args}>

      <primitive object={stick_model.scene.clone(true)} />
      <mesh >
      <rectAreaLight args={[0xffffff, 1, 2,0.01]} position={[0,2,-0.02]} power={50} rotation={[0,0,Math.PI/2]}/>
      </mesh>
    </mesh>
  )
}


function Plane(props) {
  //https://raw.githubusercontent.com/AhmetErenLacinbala/avci_3d/master/public/models/plane.glb
  ///models/plane.glb
  const { args } = props;
  const stick_model = useLoader(GLTFLoader, 'https://raw.githubusercontent.com/AhmetErenLacinbala/avci_3d/master/public/models/plane.glb');
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

const stickLights = [{
   position:[2.0,0.05,2]
},
{
  position:[2.01,0.08,2.01],
  rotation: [0,0,0],
  scale: [1, 0.45,1]
},
{
  position:[2.0,0.08,-1.9],
  rotation: [0,Math.PI,0],
  scale: [1, 0.45,1]
},
{
position:[-2.0,0.05,1.95]
},
{
  position:[-1.99,0.08,1.96],
  rotation: [0,0,0],
  scale: [1, 0.45,1]
},
{
  position:[-2.0,0.08,-1.95],
  rotation: [0,Math.PI,0],
  scale: [1, 0.45,1]
},

]
function App() {

  const initialBulletPos = [-4, 1, 0];
  const [bulletPos, setBulletPos] = useState(initialBulletPos);
  const [trackStart, setTrackStart] = useState([-2, 1, 0]);



  return (
    <div className="App">
      <Canvas frameloop="demand" camera={{ position: [0, 0, 8] }}>
      <Perf/>
      <Plane/>
    <ambientLight args={["0x404040", "4"]}/>
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
          {stickLights.map((stickLight =>{
            return (
              <group position={[0,-0.02,0]}>
              <LightStick args={stickLight}/>
              </group>
            )
          }))}

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
        <Suspense fallback={null}>
          <EffectComposer >
            <Bloom
    intensity={1.0} // The bloom intensity.
    blurPass={undefined} // A blur pass.
    kernelSize={KernelSize.LARGE} // blur kernel size
    luminanceThreshold={0.9} // luminance threshold. Raise this value to mask out darker elements in the scene.
    luminanceSmoothing={0.025} // smoothness of the luminance threshold. Range is [0, 1]
    mipmapBlur={false} // Enables or disables mipmap blur.
    resolutionX={Resolution.AUTO_SIZE} // The horizontal resolution.
    resolutionY={Resolution.AUTO_SIZE} // The vertical resolution.
             />

          </EffectComposer>
        </Suspense>
        <OrbitControls />
      </Canvas>
    </div>
  );
}

export default App;
