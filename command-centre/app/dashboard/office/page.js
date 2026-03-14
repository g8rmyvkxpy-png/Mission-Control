'use client';

import { useState, useEffect, useRef } from 'react';

export default function OfficePage() {
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const agentsRef = useRef({});
  const particlesRef = useRef(null);
  const orbitControlsRef = useRef(null);
  
  const [location, setLocation] = useState('office');
  const [training, setTraining] = useState(null);
  const [agentAction, setAgentAction] = useState('');
  const [messages, setMessages] = useState([
    { speaker: 'Leo', text: 'Ready to train?', time: '' },
    { speaker: 'Orbit', text: "Let's hit the gym!", time: '' },
  ]);
  const [reply, setReply] = useState('');
  const [revenue, setRevenue] = useState({ totalRevenue: 0 });
  const [isClient, setIsClient] = useState(false);
  const [viewMode, setViewMode] = useState('3d');
  
  const agentStateRef = useRef({
    a: { position: null, target: null, status: 'idle', startPos: null, pathProgress: 0 },
    b: { position: null, target: null, status: 'idle', startPos: null, pathProgress: 0 }
  });

  useEffect(() => {
    setIsClient(true);
    fetchRevenue();
    
    // Auto-demo: Start training sequence after 30 seconds of idle
    const autoDemoTimer = setTimeout(() => {
      if (location === 'office') {
        console.log('Auto-demo: Starting gym sequence');
        goToGym();
      }
    }, 30000);
    
    return () => clearTimeout(autoDemoTimer);
  }, []);

  useEffect(() => {
    if (!isClient || viewMode !== '3d') return;
    
    let THREE;
    let animationId;
    
    const initThree = async () => {
      THREE = await import('three');
      const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js');
      
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x0a0a0f);
      sceneRef.current = scene;
      
      const camera = new THREE.PerspectiveCamera(50, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
      camera.position.set(0, 8, 12);
      camera.lookAt(0, 0, 0);
      cameraRef.current = camera;
      
      const controls = new OrbitControls(camera, canvas);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.minDistance = 3;
      controls.maxDistance = 25;
      controls.maxPolarAngle = Math.PI / 2;
      orbitControlsRef.current = controls;
      
      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
      renderer.setSize(canvas.clientWidth, canvas.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      rendererRef.current = renderer;
      
      scene.add(new THREE.AmbientLight(0xffffff, 0.4));
      const mainLight = new THREE.PointLight(0xffffff, 1);
      mainLight.position.set(0, 8, 5);
      scene.add(mainLight);
      
      const gymLight = new THREE.PointLight(0xf59e0b, 1);
      gymLight.position.set(8, 4, -3);
      scene.add(gymLight);
      
      // Floor
      const floor = new THREE.Mesh(new THREE.PlaneGeometry(24, 24), new THREE.MeshStandardMaterial({ color: 0x8B7355 }));
      floor.rotation.x = -Math.PI / 2;
      floor.receiveShadow = true;
      scene.add(floor);
      
      scene.add(new THREE.GridHelper(24, 24, 0x3a3a3a, 0x252525));
      
      // Office area
      const officeArea = new THREE.Mesh(new THREE.PlaneGeometry(12, 10), new THREE.MeshStandardMaterial({ color: 0x9a8465, transparent: true, opacity: 0.3 }));
      officeArea.rotation.x = -Math.PI / 2;
      officeArea.position.set(-2, 0.02, -2);
      scene.add(officeArea);
      
      // Walls
      const wallMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a });
      scene.add(new THREE.Mesh(new THREE.PlaneGeometry(24, 5), wallMat));
      (scene.children[scene.children.length - 1]).position.set(0, 2.5, -12);
      
      // Glass
      const glass = new THREE.Mesh(new THREE.BoxGeometry(5, 2.5, 0.05), new THREE.MeshStandardMaterial({ color: 0x88ccff, transparent: true, opacity: 0.15, side: THREE.DoubleSide }));
      glass.position.set(-5, 1.25, -5);
      scene.add(glass);
      
      // Gym floor
      const gymFloor = new THREE.Mesh(new THREE.PlaneGeometry(8, 7), new THREE.MeshStandardMaterial({ color: 0x1a1a1a }));
      gymFloor.rotation.x = -Math.PI / 2;
      gymFloor.position.set(8, 0.02, -4);
      scene.add(gymFloor);
      
      // Gym border
      const gymBorder = new THREE.Mesh(new THREE.BoxGeometry(8.2, 0.1, 7.2), new THREE.MeshStandardMaterial({ color: 0xf59e0b }));
      gymBorder.position.set(8, 0.05, -4);
      scene.add(gymBorder);
      
      // GYM sign
      const gymSign = new THREE.Mesh(new THREE.BoxGeometry(2, 0.5, 0.1), new THREE.MeshStandardMaterial({ color: 0x000000 }));
      gymSign.position.set(8, 3.5, -0.3);
      scene.add(gymSign);
      scene.add(new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.35), new THREE.MeshBasicMaterial({ color: 0xf59e0b })));
      (scene.children[scene.children.length - 1]).position.set(8, 3.5, -0.24);
      
      const benchMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
      const barMat = new THREE.MeshStandardMaterial({ color: 0xaaaaaa, metalness: 0.9 });
      const weightMat = new THREE.MeshStandardMaterial({ color: 0x444444, metalness: 0.9 });
      
      // Bench
      scene.add(new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.2, 0.6), benchMat));
      scene.children[scene.children.length - 1].position.set(6, 0.35, -5);
      
      // Barbell
      const barbell = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.5), barMat);
      barbell.rotation.z = Math.PI / 2;
      barbell.position.set(6, 0.7, -5);
      scene.add(barbell);
      
      // Weights
      [-0.6, -0.4, 0.4, 0.6].forEach(offset => {
        const w = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.08), weightMat);
        w.rotation.z = Math.PI / 2;
        w.position.set(6 + offset, 0.7, -5);
        scene.add(w);
      });
      
      // Dumbbell rack
      scene.add(new THREE.Mesh(new THREE.BoxGeometry(1, 0.8, 0.4), benchMat));
      scene.children[scene.children.length - 1].position.set(10, 0.4, -2);
      
      // Pull-up bar
      const pullBar = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1), barMat);
      pullBar.rotation.x = Math.PI / 2;
      pullBar.position.set(6, 2.8, -1.5);
      scene.add(pullBar);
      
      // Poster
      scene.add(new THREE.Mesh(new THREE.PlaneGeometry(1, 0.6), new THREE.MeshBasicMaterial({ color: 0x111111 })));
      scene.children[scene.children.length - 1].position.set(10, 2.5, -0.29);
      
      // Desks
      const deskMat = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
      [[-4, -3], [0, -3]].forEach(([x, z]) => {
        const desk = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.08, 0.8), deskMat);
        desk.position.set(x, 0.5, z);
        scene.add(desk);
        
        const mon = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.5, 0.05), new THREE.MeshStandardMaterial({ color: 0x111111 }));
        mon.position.set(x, 0.9, z - 0.3);
        scene.add(mon);
        
        scene.add(new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.4), new THREE.MeshBasicMaterial({ color: 0x1a3a5c })));
        scene.children[scene.children.length - 1].position.set(x, 0.9, z - 0.27);
      });
      
      // Plants
      const potMat = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
      const leafMat = new THREE.MeshStandardMaterial({ color: 0x228B22 });
      [[-8, -6], [4, -6], [-8, 4]].forEach(([x, z]) => {
        scene.add(new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.15, 0.35), potMat));
        scene.children[scene.children.length - 1].position.set(x, 0.175, z);
        for (let i = 0; i < 5; i++) {
          const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 8), leafMat);
          leaf.position.set(x + Math.cos(i * Math.PI * 0.4) * 0.12, 0.5 + i * 0.12, z + Math.sin(i * Math.PI * 0.4) * 0.12);
          scene.add(leaf);
        }
      });
      
      // Agents
      const createAgent = (name, color, startPos) => {
        const group = new THREE.Group();
        group.name = name;
        
        // Name label sprite
        const createLabel = (text) => {
          const canvas = document.createElement('canvas');
          canvas.width = 256;
          canvas.height = 64;
          const ctx = canvas.getContext('2d');
          ctx.fillStyle = 'transparent';
          ctx.fillRect(0, 0, 256, 64);
          ctx.font = 'bold 32px Arial';
          ctx.textAlign = 'center';
          ctx.fillStyle = color === 0x00ffff ? '#00ffff' : '#ff00ff';
          ctx.fillText(text, 128, 40);
          const texture = new THREE.CanvasTexture(canvas);
          const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true });
          const sprite = new THREE.Sprite(spriteMat);
          sprite.scale.set(1.5, 0.4, 1);
          return sprite;
        };
        
        const nameLabel = createLabel(name);
        nameLabel.position.y = 2.3;
        group.add(nameLabel);
        group.userData.nameLabel = nameLabel;
        
        // Action label
        const actionLabel = createLabel('');
        actionLabel.position.y = 2.0;
        group.add(actionLabel);
        group.userData.actionLabel = actionLabel;
        
        const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.3, 1, 8, 16), new THREE.MeshStandardMaterial({ color: 0x1a1a1a }));
        body.position.y = 0.8;
        group.add(body);
        
        const core = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 16), new THREE.MeshBasicMaterial({ color }));
        core.position.set(0, 0.9, 0.25);
        group.add(core);
        
        const coreLight = new THREE.PointLight(color, 2, 3);
        coreLight.position.set(0, 0.9, 0.25);
        group.add(coreLight);
        
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 16), new THREE.MeshStandardMaterial({ color: 0x333333 }));
        head.position.y = 1.7;
        group.add(head);
        
        const eyeMat = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        [-0.08, 0.08].forEach(xOff => {
          const eye = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 8), eyeMat);
          eye.position.set(xOff, 1.72, 0.18);
          group.add(eye);
        });
        
        const armMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a });
        const leftArm = new THREE.Mesh(new THREE.CapsuleGeometry(0.06, 0.5, 4, 8), armMat);
        leftArm.position.set(-0.4, 0.9, 0);
        leftArm.rotation.z = 0.3;
        group.add(leftArm);
        
        const rightArm = new THREE.Mesh(new THREE.CapsuleGeometry(0.06, 0.5, 4, 8), armMat);
        rightArm.position.set(0.4, 0.9, 0);
        rightArm.rotation.z = -0.3;
        group.add(rightArm);
        
        const glow = new THREE.Mesh(new THREE.CircleGeometry(0.6, 32), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.3 }));
        glow.rotation.x = -Math.PI / 2;
        glow.position.y = 0.02;
        group.add(glow);
        
        group.position.copy(startPos);
        group.userData = { name, color, baseY: startPos.y, leftArm, rightArm, glow, walkPhase: Math.random() * Math.PI * 2 };
        
        scene.add(group);
        return group;
      };
      
      const startPosA = new THREE.Vector3(-4, 0, -3);
      const startPosB = new THREE.Vector3(0, 0, -3);
      
      agentsRef.current.a = createAgent('Leo', 0x00ffff, startPosA);
      agentsRef.current.b = createAgent('Orbit', 0xff00ff, startPosB);
      
      agentStateRef.current.a.startPos = startPosA.clone();
      agentStateRef.current.b.startPos = startPosB.clone();
      agentStateRef.current.a.position = startPosA.clone();
      agentStateRef.current.b.position = startPosB.clone();
      agentStateRef.current.a.target = startPosA.clone();
      agentStateRef.current.b.target = startPosB.clone();
      
      // Curved paths
      const createPath = (start, end) => new THREE.QuadraticBezierCurve3(start, new THREE.Vector3((start.x + end.x) / 2, 0, Math.max(start.z, end.z) + 2), end);
      agentStateRef.current.a.path = createPath(startPosA, new THREE.Vector3(7, 0, -4));
      agentStateRef.current.b.path = createPath(startPosB, new THREE.Vector3(9, 0, -2));
      agentStateRef.current.a.pathBack = createPath(new THREE.Vector3(7, 0, -4), startPosA);
      agentStateRef.current.b.pathBack = createPath(new THREE.Vector3(9, 0, -2), startPosB);
      
      // Particles
      const pCount = 100;
      const pGeo = new THREE.BufferGeometry();
      const pPos = new Float32Array(pCount * 3);
      const pCol = new Float32Array(pCount * 3);
      const pVels = [];
      for (let i = 0; i < pCount; i++) { pPos[i*3+1] = -10; pVels.push({x:0,y:0,z:0,life:0,active:false}); }
      pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
      pGeo.setAttribute('color', new THREE.BufferAttribute(pCol, 3));
      const pMat = new THREE.PointsMaterial({ size: 0.15, transparent: true, opacity: 0.9, vertexColors: true });
      const pSys = new THREE.Points(pGeo, pMat);
      pSys.visible = false;
      scene.add(pSys);
      particlesRef.current = { mesh: pSys, vels: pVels, pos: pPos, col: pCol, count: pCount };
      
      const clock = new THREE.Clock();
      
      const animate = () => {
        animationId = requestAnimationFrame(animate);
        const time = clock.getElapsedTime();
        controls.update();
        
        Object.entries(agentsRef.current).forEach(([key, agent]) => {
          if (!agent) return;
          const st = agentStateRef.current[key];
          const ud = agent.userData;
          
          if (st.status === 'walking_to_gym') {
            st.pathProgress += 0.008;
            if (st.pathProgress >= 1) { st.pathProgress = 1; st.status = 'training'; setTimeout(() => setTraining({action:'bench',reps:0,maxReps:2}), 100); }
            const pt = st.path.getPoint(st.pathProgress);
            agent.position.copy(pt);
            agent.position.y = Math.sin(time * 12 + ud.walkPhase) * 0.06;
            agent.rotation.z = Math.sin(time * 12 + ud.walkPhase) * 0.05;
            const lp = st.path.getPoint(Math.min(st.pathProgress + 0.1, 1));
            agent.lookAt(lp.x, agent.position.y, lp.z);
            // Show walking label
            if (ud.actionLabel) ud.actionLabel.visible = Math.sin(time * 5) > 0;
          } else if (st.status === 'walking_back') {
            st.pathProgress -= 0.008;
            if (st.pathProgress <= 0) { st.pathProgress = 0; st.status = 'idle'; setLocation('office'); }
            const pt = st.pathBack.getPoint(1 - st.pathProgress);
            agent.position.copy(pt);
            agent.position.y = Math.sin(time * 12 + ud.walkPhase) * 0.06;
            agent.rotation.z = Math.sin(time * 12 + ud.walkPhase) * 0.05;
          } else if (st.status === 'training') {
            const lp = (time * 3) % (Math.PI * 2);
            const lift = Math.sin(lp) * 0.5 + 0.5;
            if (ud.leftArm) { ud.leftArm.rotation.x = -lift * 1.8; ud.leftArm.position.y = 0.9 + lift * 0.2; }
            if (ud.rightArm) { ud.rightArm.rotation.x = -lift * 1.8; ud.rightArm.position.y = 0.9 + lift * 0.2; }
            agent.position.y = Math.sin(time * 2) * 0.02;
          } else if (st.status === 'high_five') {
            const hf = Math.sin(time * 2) * 0.5;
            if (ud.leftArm) { ud.leftArm.rotation.x = -0.5 - hf * 0.5; ud.leftArm.rotation.z = 0.5 + hf * 0.3; }
            if (ud.rightArm) { ud.rightArm.rotation.x = -0.5 - hf * 0.5; ud.rightArm.rotation.z = -0.5 - hf * 0.3; }
          } else {
            agent.position.y = Math.sin(time * 2 + ud.walkPhase) * 0.02;
            agent.rotation.z = Math.sin(time * 0.5 + ud.walkPhase) * 0.02;
            if (ud.leftArm) { ud.leftArm.rotation.x = 0; ud.leftArm.rotation.z = 0.3; ud.leftArm.position.y = 0.9; }
            if (ud.rightArm) { ud.rightArm.rotation.x = 0; ud.rightArm.rotation.z = -0.3; ud.rightArm.position.y = 0.9; }
            if (ud.actionLabel) ud.actionLabel.visible = false;
          }
        });
        
        if (training?.done && particlesRef.current) {
          const { mesh, vels, pos, col, count } = particlesRef.current;
          for (let i = 0; i < count; i++) {
            if (vels[i].active && vels[i].life > 0) {
              pos[i*3] += vels[i].x; pos[i*3+1] += vels[i].y; pos[i*3+2] += vels[i].z;
              vels[i].y -= 0.008; vels[i].life -= 0.015; vels[i].x *= 0.99; vels[i].z *= 0.99;
              const l = vels[i].life; col[i*3]= (1-l)*0.5; col[i*3+1]= l; col[i*3+2]= l;
            } else if (i < 30) {
              pos[i*3] = 7 + (Math.random() - 0.5) * 1.5; pos[i*3+1] = 1 + Math.random() * 0.5; pos[i*3+2] = -4 + (Math.random() - 0.5) * 1.5;
              vels[i] = { x: (Math.random()-0.5)*0.08, y: Math.random()*0.12+0.05, z: (Math.random()-0.5)*0.08, life: 1, active: true };
              col[i*3]=0; col[i*3+1]=1; col[i*3+2]=1;
            }
          }
          mesh.geometry.attributes.position.needsUpdate = true;
          mesh.geometry.attributes.color.needsUpdate = true;
        }
        
        renderer.render(scene, camera);
      };
      animate();
      
      const hR = () => { if (camera && renderer) { camera.aspect = canvas.clientWidth / canvas.clientHeight; camera.updateProjectionMatrix(); renderer.setSize(canvas.clientWidth, canvas.clientHeight); }};
      window.addEventListener('resize', hR);
      return () => { window.removeEventListener('resize', hR); cancelAnimationFrame(animationId); renderer.dispose(); };
    };
    
    initThree();
  }, [isClient, viewMode]);

  async function fetchRevenue() {
    try { const r = await fetch('/api/revenue?type=summary'); const d = await r.json(); setRevenue(d.summary || {totalRevenue:0}); } catch(e) {}
  }

  function goToGym() {
    if (location !== 'office') return;
    setLocation('walking_to_gym');
    setMessages(prev => [...prev, {speaker:'Orbit', text:'*walks to gym* Let\'s train!', time:''}]);
    setTimeout(() => { agentStateRef.current.b.status = 'walking_to_gym'; agentStateRef.current.b.pathProgress = 0; agentStateRef.current.a.status = 'walking_to_gym'; agentStateRef.current.a.pathProgress = 0; }, 100);
  }

  function startTraining() {
    setTraining({action:'bench', reps:0, maxReps:2});
    setMessages(prev => [...prev, {speaker:'Leo', text:'*lifts weights*', time:''}]);
    const iv = setInterval(() => {
      setTraining(t => {
        if (!t) { clearInterval(iv); return t; }
        const n = t.reps + 1;
        if (n >= t.maxReps) {
          clearInterval(iv);
          if (particlesRef.current) particlesRef.current.mesh.visible = true;
          agentStateRef.current.a.status = 'high_five';
          agentStateRef.current.b.status = 'high_five';
          setMessages(p => [...p, {speaker:'Leo', text:'✨ Great workout! ✨', time:''}]);
          setTimeout(() => { agentStateRef.current.a.status = 'walking_back'; agentStateRef.current.a.pathProgress = 1; agentStateRef.current.b.status = 'walking_back'; agentStateRef.current.b.pathProgress = 1; setMessages(p => [...p, {speaker:'Orbit', text:'*walks back*', time:''}]); }, 2000);
          return {...t, reps:n, done:true};
        }
        return {...t, reps:n};
      });
    }, 1200);
  }

  function handleSend() {
    if (!reply.trim()) return;
    setMessages(p => [...p, {speaker:'Deva', text:reply, time:''}]);
    if (reply.toLowerCase().includes('gym') || reply.toLowerCase().includes('train')) setTimeout(() => goToGym(), 200);
    setReply('');
  }

  function toggleView() { setViewMode(v => v === '2d' ? '3d' : '2d'); }

  if (!isClient) return <div style={{width:'100%',height:'calc(100vh - 120px)',background:'#000',display:'flex',alignItems:'center',justifyContent:'center',color:'#666'}}>Loading...</div>;

  return (
    <div style={{width:'100%',height:'calc(100vh - 120px)',position:'relative',background:'#000',overflow:'hidden'}}>
      {viewMode==='3d' && <canvas ref={canvasRef} style={{position:'absolute',inset:0,width:'100%',height:'100%'}} />}
      <div style={{position:'absolute',top:10,left:10,display:'flex',gap:8}}>
        <button onClick={goToGym} disabled={location!=='office'} style={{background:location==='office'?'#f59e0b':'#333',border:'none',padding:'10px 16px',borderRadius:8,color:location==='office'?'#000':'#666',fontWeight:600,cursor:location==='office'?'pointer':'not-allowed'}}>🏋️ Go to Gym</button>
        {location==='gym'&&!training&&<button onClick={startTraining} style={{background:'#10b981',border:'none',padding:'10px 16px',borderRadius:8,color:'#fff',fontWeight:600,cursor:'pointer'}}>Start Training</button>}
        {training?.done&&<button onClick={()=>{setTraining(null);setLocation('walking_to_office');setMessages(p=>[...p,{speaker:'Orbit',text:'*walks back*',time:''}]);}} style={{background:'#3b82f6',border:'none',padding:'10px 16px',borderRadius:8,color:'#fff',fontWeight:600,cursor:'pointer'}}>← Return</button>}
        <button onClick={toggleView} style={{background:'#6366f1',border:'none',padding:'10px 16px',borderRadius:8,color:'#fff',fontWeight:600,cursor:'pointer'}}>{viewMode==='2d'?'🎮 3D':'📄 2D'}</button>
      </div>
      {training&&<div style={{position:'absolute',top:10,right:10,background:'rgba(0,0,0,0.8)',border:'2px solid #f59e0b',borderRadius:8,padding:'12px 20px'}}><div style={{fontSize:24,fontWeight:700,color:'#f59e0b'}}>{training.reps}/{training.maxReps} REPS</div>{training.done&&<div style={{fontSize:20,marginTop:5}}>✨💪✨</div>}</div>}
      <div style={{position:'absolute',top:10,right:training?180:10,background:'rgba(0,0,0,0.8)',border:'1px solid #10b981',borderRadius:8,padding:'10px 16px'}}><div style={{fontSize:20,fontWeight:700,color:'#10b981'}}>${revenue.totalRevenue}</div><div style={{fontSize:10,color:'#666'}}>REVENUE</div></div>
      <div style={{position:'absolute',bottom:10,left:'50%',transform:'translateX(-50%)',width:'80%',maxWidth:500,background:'rgba(10,15,20,0.95)',border:'1px solid #333',borderRadius:12,padding:12}}>
        <div style={{maxHeight:80,overflow:'auto',marginBottom:8}}>{messages.slice(-4).map((m,i)=><div key={i} style={{fontSize:12,marginBottom:3}}><span style={{color:m.speaker==='Deva'?'#3b82f6':'#888'}}>{m.speaker}:</span> {m.text}</div>)}</div>
        <div style={{display:'flex',gap:8}}><input value={reply} onChange={e=>setReply(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleSend()} placeholder="Type..." style={{flex:1,background:'#0a0f14',border:'1px solid #333',borderRadius:6,padding:'8px 12px',color:'#fff',fontSize:12}} /><button onClick={handleSend} style={{background:'#238636',border:'none',borderRadius:6,padding:'8px 16px',color:'#fff',fontWeight:600,cursor:'pointer'}}>→</button></div>
      </div>
      <div style={{position:'absolute',bottom:10,right:10,background:'rgba(0,0,0,0.6)',borderRadius:6,padding:'8px 12px',fontSize:10,color:'#666'}}>{viewMode==='3d'?'🖱️ Drag • Scroll':'2D'}</div>
    </div>
  );
}
