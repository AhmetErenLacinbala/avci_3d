
import './App.css';
import { Canvas } from '@react-three/fiber';

function App() {
  return (
    <div className="App">
      <Canvas camera={{ position: [0, 0, 2] }}>
        <mesh>
          <boxGeometry />
          <meshBasicMaterial color={0x00ff00} wireframe />
        </mesh>
      </Canvas>
    </div>
  );
}

export default App;
