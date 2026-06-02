import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass }     from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';

const API = import.meta.env.VITE_ATLAS_API ?? 'http://localhost:5001';

const LENS_D = 224; // lens diameter in px
const ZOOM   = 3.4; // magnification factor

const C = {
  bg:      '#0c2250',
  bgDeep:  '#08183e',
  bgCard:  'rgba(18,50,118,0.46)',
  border:  'rgba(120,190,255,0.18)',
  borderHi:'rgba(147,197,253,0.4)',
  text:    '#ddeeff',
  textMd:  'rgba(200,225,255,0.52)',
  textDim: 'rgba(170,205,255,0.26)',
  accent:  '#93c5fd',
  green:   '#6ee7b7',
  purple:  '#a78bfa',
};

const GENE_INFO = {
  BDNF: {
    headline: 'Synaptic plasticity & memory consolidation',
    stain:    'ISH — mRNA expression across the developing human cortex',
    body:     'BDNF is the most studied neurotrophin and the primary driver of long-term potentiation — the cellular basis of learning and memory. Dense hippocampal expression (CA1, CA3, dentate gyrus) underlies its role in consolidating experiences into durable memories. The Val66Met polymorphism, carried by ~30% of the population, impairs activity-dependent BDNF secretion and elevates risk for depression, anxiety, and memory disorders. Convergent reduction of BDNF signaling is observed across Alzheimer\'s disease, major depression, and schizophrenia.',
    regions:  'Hippocampus · Prefrontal cortex · Cerebellar cortex · Amygdala',
    clinical: 'Depression · Alzheimer\'s disease · Schizophrenia · PTSD',
    insight:  'Dense hippocampal staining (CA1/CA3/dentate gyrus) reflects BDNF\'s role in long-term potentiation. Cortical layers II/III show high expression — the association areas most dependent on plasticity for higher cognition.',
    color:    '#93c5fd',
  },
  GFAP: {
    headline: 'Astrocyte architecture & neuroinflammation',
    stain:    'ISH — astrocyte mRNA distribution across developing human brain',
    body:     'GFAP is the canonical marker for astrocytes — the brain\'s most abundant and underappreciated cell type. Far from passive scaffolding, astrocytes gate synaptic transmission, recycle glutamate, and maintain the blood–brain barrier. Reactive astrogliosis — a GFAP upregulation — is the universal CNS response to injury. Blood and CSF GFAP is now FDA-cleared as a biomarker for traumatic brain injury, and elevated plasma GFAP predicts Alzheimer\'s progression years before symptom onset.',
    regions:  'White matter tracts · Cerebellar Bergmann glia · Subpial layer · Limbic system',
    clinical: 'TBI biomarker · Alzheimer\'s · Alexander disease · Multiple sclerosis',
    insight:  'Heavy staining in white matter tracts reflects astrocyte ensheathment of myelinated axons. The cerebellar molecular layer shows Bergmann glia — a specialized astrocyte type critical for Purkinje cell guidance during development.',
    color:    '#6ee7b7',
  },
  APOE: {
    headline: 'Alzheimer\'s risk — largest known genetic locus',
    stain:    'ISH — lipid transport gene expression across developing human brain',
    body:     'APOE is the largest genetic risk factor for late-onset Alzheimer\'s disease. The ε4 allele, carried by ~25% of the population, confers up to 12× elevated AD risk and accounts for ~65% of all cases. In healthy brain, APOE is expressed by astrocytes and microglia to transport cholesterol for synaptic membrane maintenance. APOE4 impairs amyloid-β clearance, promotes tau hyperphosphorylation, and disrupts neuronal lipid homeostasis.',
    regions:  'Neocortex layers IV–VI · Hippocampus · Entorhinal cortex · White matter',
    clinical: 'Alzheimer\'s disease · Cardiovascular disease · Neuroinflammation',
    insight:  'APOE is concentrated in cortical layers IV–VI where thalamocortical inputs arrive and where amyloid plaques first accumulate in AD. The entorhinal cortex staining (medial temporal lobe) marks the earliest site of neurofibrillary tangle formation.',
    color:    '#f9a8d4',
  },
};

function getGeneInfo(acronym) { return GENE_INFO[acronym?.toUpperCase()] ?? null; }

const FEATURED = [
  { acronym: 'BDNF', name: 'brain-derived neurotrophic factor',  note: 'Critical for learning & memory' },
  { acronym: 'GFAP', name: 'glial fibrillary acidic protein',    note: "Marks astrocytes — brain's support cells" },
  { acronym: 'APOE', name: 'apolipoprotein E',                   note: "Largest Alzheimer's genetic risk factor" },
];

function toTree(flat) {
  const map = new Map(flat.map(s => [s.id, { ...s, children: [] }]));
  const roots = [];
  for (const node of map.values()) {
    const parent = map.get(node.parent_structure_id);
    if (parent) parent.children.push(node);
    else roots.push(node);
  }
  return roots;
}

function TreeNode({ node, depth, selected, onSelect }) {
  const [open, setOpen] = useState(depth < 2);
  const has = node.children.length > 0;
  const active = selected?.id === node.id;
  return (
    <div>
      <div onClick={() => { onSelect(node); if (has) setOpen(v => !v); }} style={{
        display: 'flex', alignItems: 'center', gap: 4,
        paddingLeft: 8 + depth * 13, paddingTop: 3, paddingBottom: 3, paddingRight: 6,
        cursor: 'pointer', borderRadius: 3, fontSize: '0.67rem',
        background: active ? 'rgba(147,197,253,0.13)' : 'transparent',
        color:      active ? C.accent : C.textMd,
      }}>
        <span style={{ width: 10, flexShrink: 0, color: C.textDim }}>{has ? (open ? '▾' : '▸') : ''}</span>
        <span style={{ width: 7, height: 7, borderRadius: '50%', flexShrink: 0, background: `#${node.color_hex_triplet || '445577'}` }} />
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{node.acronym}</span>
      </div>
      {open && has && node.children.map(c => (
        <TreeNode key={c.id} node={c} depth={depth+1} selected={selected} onSelect={onSelect} />
      ))}
    </div>
  );
}

export default function AllenBrainExplorer() {

  const [species,     setSpecies]     = useState('human');
  const [query,       setQuery]       = useState('');
  const [geneHits,    setGeneHits]    = useState([]);
  const [gene,        setGene]        = useState(null);
  const [experiments, setExperiments] = useState([]);
  const [datasetId,   setDatasetId]   = useState(null);
  const [images,      setImages]      = useState([]);
  const [slideIdx,    setSlideIdx]    = useState(0);
  const [imgOpacity,  setImgOpacity]  = useState(1);
  const [modalOpen,   setModalOpen]   = useState(false);
  const [lensEnabled,  setLensEnabled]  = useState(true);
  const slideImgRef    = useRef(null);
  const modalImgRef    = useRef(null);
  const lensRef        = useRef(null);   // slide-panel lens DOM node
  const modalLensRef   = useRef(null);   // modal lens DOM node
  const lensEnabledRef = useRef(true);   // mirror of lensEnabled, readable in callbacks without stale closure
  const [expression,  setExpression]  = useState([]);
  const [ontFlat,     setOntFlat]     = useState([]);
  const [ontTree,     setOntTree]     = useState([]);
  const [selStruct,   setSelStruct]   = useState(null);
  const [rightTab,    setRightTab]    = useState('data');
  const [busy,        setBusy]        = useState({ genes: false, exp: false, images: false, expr: false, ont: false });
  const [hint,        setHint]        = useState('');

  useEffect(() => { setSlideIdx(0); setImgOpacity(1); }, [images]);

  // Inject keyframe CSS once
  useEffect(() => {
    const s = document.createElement('style');
    s.textContent = `
      @keyframes na-lift { from { opacity:0; transform:scale(0.97) translateY(6px); } to { opacity:1; transform:scale(1) translateY(0); } }
      @keyframes na-fade { from { opacity:0; } to { opacity:1; } }
    `;
    document.head.appendChild(s);
    return () => document.head.removeChild(s);
  }, []);


  // Animated slide change
  const changeSlide = useCallback((newIdx) => {
    setImgOpacity(0);
    setTimeout(() => { setSlideIdx(newIdx); setImgOpacity(1); }, 160);
  }, []);
  const prevSlide = useCallback(() => setSlideIdx(i => { const n = Math.max(0,i-1); changeSlide(n); return i; }), [changeSlide]);
  const nextSlide = useCallback(() => setSlideIdx(i => { const n = Math.min(images.length-1,i+1); changeSlide(n); return i; }), [changeSlide, images.length]);

  // Three.js
  const mountRef    = useRef(null);
  const rendererRef = useRef(null);
  const composerRef = useRef(null);
  const bloomRef    = useRef(null);
  const brainRef    = useRef(null);
  const sceneRef    = useRef(null);
  const cameraRef   = useRef(null);
  const tRef        = useRef(0);
  const speciesRef  = useRef(species);
  useEffect(() => { speciesRef.current = species; }, [species]);

  const makeBrain = useCallback((sp) => {
    const human = sp === 'human';
    const group  = new THREE.Group();
    const mat = new THREE.MeshPhongMaterial({
      color:    human ? 0x5888c8 : 0x4eaaaa,
      emissive: human ? 0x081c50 : 0x0a2030,
      shininess: 80,
      specular:  0x3366aa,
    });

    // Cortex
    const r   = human ? 1.05 : 0.90;
    const geo = new THREE.SphereGeometry(r, 160, 160);
    const pos = geo.attributes.position;

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
      const len = Math.sqrt(x*x+y*y+z*z) || 1;
      const nx = x/len, ny = y/len, nz = z/len;
      const θ = Math.acos(Math.max(-1, Math.min(1, nz)));
      const φ = Math.atan2(ny, nx);

      let d  = 0.068 * Math.sin(7 *θ)       * Math.cos(5 *φ);
      d     += 0.052 * Math.sin(11*θ + 0.5) * Math.sin(8 *φ);
      d     += 0.038 * Math.cos(13*θ)       * Math.sin(6 *φ + 1.2);
      d     += 0.024 * Math.sin(17*θ)       * Math.cos(12*φ + 0.4);
      d     += 0.016 * Math.cos(21*θ + 1)   * Math.sin(15*φ);
      if (human) {
        d   += 0.011 * Math.sin(27*θ) * Math.cos(20*φ + 0.8);
        d   += 0.007 * Math.sin(33*θ) * Math.sin(25*φ + 0.3);
      }

      // Deep longitudinal fissure — narrow, pronounced
      const fissureW = 0.052;
      const topFade  = Math.max(0, ny);
      const fissureT = Math.max(0, 1 - Math.abs(nx) / fissureW);
      d -= 0.22 * fissureT * fissureT * topFade;

      // Strong vertical flattening — this is what makes it look like a brain
      const sx = 1.10, sy = human ? 0.62 : 0.58, sz = human ? 0.94 : 1.22;
      pos.setXYZ(i, (x+nx*d)*sx, (y+ny*d)*sy, (z+nz*d)*sz);
    }
    geo.computeVertexNormals();
    group.add(new THREE.Mesh(geo, mat));

    // Cerebellum
    const cbR   = human ? 0.40 : 0.32;
    const cbGeo = new THREE.SphereGeometry(cbR, 80, 80);
    const cbPos = cbGeo.attributes.position;
    for (let i = 0; i < cbPos.count; i++) {
      const x = cbPos.getX(i), y = cbPos.getY(i), z = cbPos.getZ(i);
      const len = Math.sqrt(x*x+y*y+z*z) || 1;
      const nx = x/len, ny = y/len, nz = z/len;
      const θ = Math.acos(Math.max(-1, Math.min(1, nz)));
      const φ = Math.atan2(ny, nx);
      let d = 0.040*Math.sin(18*θ)*Math.cos(14*φ) + 0.028*Math.sin(24*θ)*Math.sin(20*φ);
      cbPos.setXYZ(i, (x+nx*d)*1.1, (y+ny*d)*0.55, (z+nz*d)*1.05);
    }
    cbGeo.computeVertexNormals();
    const cb = new THREE.Mesh(cbGeo, mat.clone());
    cb.position.set(0, -r*0.62*0.60, -r*(human?0.94:1.22)*0.62);
    group.add(cb);

    if (!human) {
      const obGeo = new THREE.SphereGeometry(0.20, 40, 40);
      const ob = new THREE.Mesh(obGeo, mat.clone());
      ob.position.set(0, -0.04, r*1.22*0.96);
      ob.scale.set(0.70, 0.58, 1.32);
      group.add(ob);
    }
    return group;
  }, []);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;
    let initialized = false, animFrame = null, renderer = null;

    const init = () => {
      if (initialized) return;
      const w = el.clientWidth, h = el.clientHeight;
      if (!w || !h) return;
      initialized = true;

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(C.bgDeep);
      sceneRef.current = scene;

      const camera = new THREE.PerspectiveCamera(52, w/h, 0.1, 100);
      camera.position.z = 3.4;
      cameraRef.current = camera;

      renderer = new THREE.WebGLRenderer({ antialias: true });
      rendererRef.current = renderer;
      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.toneMapping         = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.35;
      el.appendChild(renderer.domElement);

      scene.add(new THREE.AmbientLight(0x2244aa, 0.7));
      const key = new THREE.DirectionalLight(0x8aaddd, 2.3); key.position.set(2,3,3); scene.add(key);
      const rim = new THREE.PointLight(0x3355ff, 1.8, 16); rim.position.set(-3,-1,-2); scene.add(rim);
      const fill = new THREE.PointLight(0x224488, 1.0, 10); fill.position.set(0,-3,2); scene.add(fill);

      const brain = makeBrain('human');
      scene.add(brain);
      brainRef.current = brain;

      const composer = new EffectComposer(renderer);
      composer.addPass(new RenderPass(scene, camera));
      const bloom = new UnrealBloomPass(new THREE.Vector2(w,h), 0.28, 0.42, 0.86);
      composer.addPass(bloom);
      composerRef.current = composer;
      bloomRef.current    = bloom;

      const loop = () => {
        animFrame = requestAnimationFrame(loop);
        tRef.current += 0.003;
        const b = brainRef.current;
        if (b) { b.rotation.y = tRef.current; b.rotation.x = Math.sin(tRef.current*0.4)*0.08; }
        composer.render();
      };
      loop();
    };

    const onResize = () => {
      const nw = el.clientWidth, nh = el.clientHeight;
      if (!nw || !nh) return;
      const cam = cameraRef.current;
      if (cam) { cam.aspect = nw/nh; cam.updateProjectionMatrix(); }
      rendererRef.current?.setSize(nw, nh);
      composerRef.current?.setSize(nw, nh);
    };

    init();
    const ro = new ResizeObserver(init);
    ro.observe(el);
    window.addEventListener('resize', onResize);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(animFrame);
      if (renderer) { renderer.dispose(); if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement); }
    };
  }, [makeBrain]);

  useEffect(() => {
    const scene = sceneRef.current, old = brainRef.current;
    if (!scene || !old) return;
    scene.remove(old);
    old.traverse(c => { if (c.isMesh) { c.geometry.dispose(); c.material.dispose(); } });
    const next = makeBrain(species);
    scene.add(next);
    brainRef.current = next;
  }, [species, makeBrain]);

  const pulse = useCallback(() => {
    const b = bloomRef.current;
    if (!b) return;
    b.strength = 1.2;
    let f = 0;
    const tick = () => { f++; b.strength = Math.max(0.28, 1.2*Math.exp(-f*0.055)); if (b.strength > 0.30) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    if (query.length < 2) { setGeneHits([]); return; }
    const t = setTimeout(async () => {
      setBusy(b => ({ ...b, genes: true }));
      try { const r = await fetch(`${API}/api/genes?q=${encodeURIComponent(query)}`); setGeneHits((await r.json()).genes ?? []); }
      catch { setGeneHits([]); }
      setBusy(b => ({ ...b, genes: false }));
    }, 350);
    return () => clearTimeout(t);
  }, [query]);

  const loadDataset = useCallback(async (id) => {
    const sp = speciesRef.current;
    setDatasetId(id); pulse();
    setBusy(b => ({ ...b, images: true }));
    try { const r = await fetch(`${API}/api/images/${id}?num_rows=20`); setImages((await r.json()).images ?? []); }
    catch { setHint('Could not load section images'); }
    setBusy(b => ({ ...b, images: false }));
    if (sp === 'mouse') {
      setBusy(b => ({ ...b, expr: true }));
      try {
        const r = await fetch(`${API}/api/expression/${id}`);
        const raw = (await r.json()).expression ?? [];
        setExpression(raw.filter(e => e.expression_energy > 0).sort((a,b) => b.expression_energy - a.expression_energy));
        pulse(); setHint('');
      } catch { setHint('Could not load expression data'); }
      setBusy(b => ({ ...b, expr: false }));
    } else { pulse(); setHint(''); }
  }, [pulse]);

  useEffect(() => {
    if (!gene) return;
    const sp = speciesRef.current;
    setImages([]); setExpression([]);
    setHint(`Loading ${gene.acronym} · ${sp}…`);
    setBusy(b => ({ ...b, exp: true }));
    fetch(`${API}/api/experiments?gene=${gene.acronym}&species=${sp}`)
      .then(r => r.json())
      .then(async d => {
        const exps = d.experiments ?? [];
        setExperiments(exps);
        if (exps.length > 0) await loadDataset(exps[0].id);
        else setHint(`No ${sp} data for ${gene.acronym}`);
      })
      .catch(() => setHint('Failed to fetch experiments'))
      .finally(() => setBusy(b => ({ ...b, exp: false })));
  }, [gene, species, loadDataset]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setSelStruct(null);
    setBusy(b => ({ ...b, ont: true }));
    fetch(`${API}/api/ontology/${species}`)
      .then(r => r.json())
      .then(d => { const f = d.ontology ?? []; setOntFlat(f); setOntTree(toTree(f)); })
      .catch(() => {})
      .finally(() => setBusy(b => ({ ...b, ont: false })));
  }, [species]);

  // Modal keyboard controls
  useEffect(() => {
    if (!modalOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape')      { setModalOpen(false); handleModalLensLeave(); }
      if (e.key === 'ArrowRight')  changeSlide(Math.min(images.length - 1, slideIdx + 1));
      if (e.key === 'ArrowLeft')   changeSlide(Math.max(0, slideIdx - 1));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [modalOpen, slideIdx, images.length, changeSlide]);

  // Keep lensEnabledRef in sync so handlers never stale-close over lensEnabled
  useEffect(() => { lensEnabledRef.current = lensEnabled; }, [lensEnabled]);

  // Hide both lenses immediately whenever the toggle is turned off
  useEffect(() => {
    if (!lensEnabled) {
      if (lensRef.current)      lensRef.current.style.visibility      = 'hidden';
      if (modalLensRef.current) modalLensRef.current.style.visibility = 'hidden';
    }
  }, [lensEnabled]);

  // Slide-panel lens — writes directly to DOM, zero React re-render overhead
  const handleLensMove = useCallback((e) => {
    if (!lensEnabledRef.current) return;
    const img  = slideImgRef.current;
    const lens = lensRef.current;
    if (!img || !img.naturalWidth || !lens) return;

    const cRect  = e.currentTarget.getBoundingClientRect();
    const cw = cRect.width, ch = cRect.height;
    const aspect = img.naturalWidth / img.naturalHeight;
    let rw, rh, ox, oy;
    if (cw / ch > aspect) { rh = ch; rw = ch * aspect; ox = (cw - rw) / 2; oy = 0; }
    else                  { rw = cw; rh = cw / aspect; oy = (ch - rh) / 2; ox = 0; }

    const cx = e.clientX - cRect.left;
    const cy = e.clientY - cRect.top;
    if (cx < ox || cx > ox + rw || cy < oy || cy > oy + rh) {
      lens.style.visibility = 'hidden';
      return;
    }

    lens.style.visibility       = 'visible';
    lens.style.transform        = `translate(${cx - LENS_D / 2}px,${cy - LENS_D / 2}px)`;
    lens.style.backgroundSize   = `${rw * ZOOM}px ${rh * ZOOM}px`;
    lens.style.backgroundPosition = `${-(cx - ox) * ZOOM + LENS_D / 2}px ${-(cy - oy) * ZOOM + LENS_D / 2}px`;
  }, []);

  const handleLensLeave = useCallback(() => {
    if (lensRef.current) lensRef.current.style.visibility = 'hidden';
  }, []);

  // Modal lens — same imperative approach, no black-bar offset needed
  const handleModalLensMove = useCallback((e) => {
    if (!lensEnabledRef.current) return;
    const img  = modalImgRef.current;
    const lens = modalLensRef.current;
    if (!img || !lens) return;

    const rect = img.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    const rw = rect.width, rh = rect.height;

    lens.style.visibility         = 'visible';
    lens.style.transform          = `translate(${cx - LENS_D / 2}px,${cy - LENS_D / 2}px)`;
    lens.style.backgroundSize     = `${rw * ZOOM}px ${rh * ZOOM}px`;
    lens.style.backgroundPosition = `${-cx * ZOOM + LENS_D / 2}px ${-cy * ZOOM + LENS_D / 2}px`;
  }, []);

  const handleModalLensLeave = useCallback(() => {
    if (modalLensRef.current) modalLensRef.current.style.visibility = 'hidden';
  }, []);

  const pickGene   = useCallback((g) => { setGene(g); setGeneHits([]); setQuery(''); }, []);
  const pickStruct = useCallback((s) => { setSelStruct(s); pulse(); }, [pulse]);
  const clearGene  = useCallback(() => { setGene(null); setExperiments([]); setImages([]); setExpression([]); setHint(''); }, []);

  const maxE     = expression.length ? expression[0].expression_energy : 1;
  const geneInfo = gene ? getGeneInfo(gene.acronym) : null;
  const curImage = images[slideIdx];


  const panelLabel = { fontSize: '0.57rem', letterSpacing: '0.14em', color: C.textDim, marginBottom: '0.4rem', textTransform: 'uppercase' };
  const glassCard  = { padding: '0.6rem 0.7rem', borderRadius: 7, border: `1px solid ${C.border}`, background: C.bgCard, cursor: 'pointer', transition: 'border-color 0.2s' };

  return (
    <div style={{
      height: '100vh', minWidth: 860, background: C.bg,
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden', fontFamily: "'Old Standard TT', Georgia, serif", color: C.text,
    }}>

      {/* HEADER */}
      <header style={{
        display: 'flex', alignItems: 'center', gap: '1.25rem',
        padding: '0.55rem 1.5rem',
        borderBottom: `1px solid ${C.border}`,
        background: 'rgba(8,22,62,0.97)', backdropFilter: 'blur(14px)',
        flexShrink: 0, zIndex: 10,
      }}>
        <Link to="/" style={{ color: C.textDim, fontSize: '0.72rem', textDecoration: 'none', letterSpacing: '0.05em', flexShrink: 0 }}>← Portfolio</Link>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
          <h1 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 400, color: C.text, letterSpacing: '0.1em' }}>NeuroAtlas</h1>
          <span style={{ fontSize: '0.62rem', color: C.textDim, letterSpacing: '0.08em' }}>Allen Brain Atlas</span>
        </div>
        <div style={{ display: 'flex', borderRadius: 6, overflow: 'hidden', border: `1px solid ${C.border}` }}>
          {['human', 'mouse'].map(s => (
            <button key={s} onClick={() => setSpecies(s)} style={{
              padding: '0.26rem 0.88rem', fontSize: '0.7rem', letterSpacing: '0.05em',
              border: 'none', cursor: 'pointer', transition: 'all 0.22s',
              background: species === s ? 'rgba(100,160,255,0.24)' : 'transparent',
              color:      species === s ? C.accent : C.textMd,
            }}>{s === 'human' ? 'Human' : 'Mouse ↗'}</button>
          ))}
        </div>
        <div style={{ position: 'relative', marginLeft: 'auto', width: 290, flexShrink: 0 }}>
          <input value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Search gene — BDNF, GFAP, APOE…"
            style={{
              width: '100%', boxSizing: 'border-box',
              background: 'rgba(12,34,88,0.7)', border: `1px solid ${C.border}`,
              borderRadius: 6, padding: '0.33rem 0.72rem',
              color: C.text, fontSize: '0.73rem', outline: 'none', letterSpacing: '0.04em',
            }}
          />
          {geneHits.length > 0 && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
              background: '#0a1e50', border: `1px solid ${C.border}`,
              borderRadius: 6, zIndex: 200, maxHeight: 220, overflowY: 'auto',
            }}>
              {geneHits.map(g => (
                <div key={g.id} onClick={() => pickGene(g)}
                  style={{ padding: '0.42rem 0.72rem', cursor: 'pointer', borderBottom: `1px solid ${C.border}` }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(100,160,255,0.1)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ color: C.accent, fontSize: '0.75rem' }}>{g.acronym}</div>
                  <div style={{ color: C.textMd, fontSize: '0.65rem' }}>{g.name?.slice(0,52)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* 3-PANEL MAIN */}
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr 278px', flex: 1, minHeight: 0 }}>

        {/* LEFT */}
        <aside style={{
          padding: '1rem', borderRight: `1px solid ${C.border}`,
          overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.85rem',
          background: 'rgba(10,30,80,0.45)',
        }}>
          {gene ? (
            <>
              <div>
                <div style={panelLabel}>Selected Gene</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: '0.12rem' }}>
                  <span style={{ color: geneInfo?.color ?? C.accent, fontSize: '1.35rem', letterSpacing: '0.06em' }}>{gene.acronym}</span>
                  <span style={{ color: C.textMd, fontSize: '0.65rem' }}>{species === 'human' ? 'Homo sapiens' : 'Mus musculus'}</span>
                </div>
                <div style={{ color: C.textMd, fontSize: '0.68rem', lineHeight: 1.5, fontStyle: 'italic' }}>{gene.name}</div>
              </div>

              {hint && <div style={{ color: '#fbbf24', fontSize: '0.67rem' }}>{hint}</div>}

              {experiments.length > 1 && (
                <div>
                  <div style={panelLabel}>Experiments</div>
                  {experiments.map((e, i) => (
                    <div key={e.id} onClick={() => loadDataset(e.id)} style={{
                      padding: '0.28rem 0.45rem', borderRadius: 4, cursor: 'pointer', marginBottom: 2, fontSize: '0.67rem',
                      background: datasetId === e.id ? 'rgba(100,160,255,0.16)' : 'transparent',
                      color:      datasetId === e.id ? C.accent : C.textMd,
                    }}>Exp {i+1} · {e.id}</div>
                  ))}
                </div>
              )}

              {geneInfo ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', flex: 1 }}>
                  <div style={{ padding: '0.65rem 0.75rem', borderRadius: 7, border: `1px solid ${geneInfo.color}33`, background: `${geneInfo.color}0d` }}>
                    <div style={{ color: geneInfo.color, fontSize: '0.72rem', fontWeight: 600, marginBottom: '0.4rem', lineHeight: 1.3 }}>{geneInfo.headline}</div>
                    <div style={{ color: C.textMd, fontSize: '0.64rem', lineHeight: 1.72 }}>{geneInfo.body}</div>
                  </div>
                  <div style={{ padding: '0.5rem 0.65rem', borderRadius: 6, background: C.bgCard, border: `1px solid ${C.border}` }}>
                    <div style={{ ...panelLabel, marginBottom: '0.22rem' }}>Key Regions</div>
                    <div style={{ color: C.textMd, fontSize: '0.64rem', lineHeight: 1.6 }}>{geneInfo.regions}</div>
                  </div>
                  <div style={{ padding: '0.5rem 0.65rem', borderRadius: 6, background: C.bgCard, border: `1px solid ${C.border}` }}>
                    <div style={{ ...panelLabel, marginBottom: '0.22rem' }}>Clinical Relevance</div>
                    <div style={{ color: C.textMd, fontSize: '0.64rem', lineHeight: 1.6 }}>{geneInfo.clinical}</div>
                  </div>
                  <div style={{ padding: '0.5rem 0.65rem', borderRadius: 6, background: C.bgCard, border: `1px solid ${C.border}` }}>
                    <div style={{ ...panelLabel, marginBottom: '0.22rem' }}>Interpreting This Section</div>
                    <div style={{ color: C.textMd, fontSize: '0.63rem', lineHeight: 1.68 }}>{geneInfo.insight}</div>
                  </div>
                </div>
              ) : (
                <div style={{ flex: 1 }}>
                  {expression.length > 0 && (() => {
                    const e = expression[0]; const st = e.structure ?? {};
                    return (
                      <div style={{ ...glassCard, cursor: 'default', border: `1px solid ${C.purple}22`, background: `${C.purple}0a` }}>
                        <div style={{ color: C.purple, fontSize: '0.7rem', marginBottom: 3 }}>Highest expression</div>
                        <div style={{ color: C.text, fontSize: '0.78rem' }}>{st.acronym ?? '?'}</div>
                        <div style={{ color: C.textMd, fontSize: '0.63rem', marginTop: 2 }}>{st.name?.slice(0,38)}</div>
                        <div style={{ color: C.textDim, fontSize: '0.62rem', marginTop: 3 }}>energy {e.expression_energy?.toFixed(3)}</div>
                      </div>
                    );
                  })()}
                </div>
              )}

              <button onClick={clearGene} style={{
                marginTop: 'auto', background: 'none', border: `1px solid ${C.border}`,
                borderRadius: 5, padding: '0.28rem 0.6rem', color: C.textDim, fontSize: '0.65rem', cursor: 'pointer',
              }}>← clear</button>
            </>
          ) : (
            <>
              <div style={panelLabel}>Featured Genes</div>
              {FEATURED.map(g => (
                <div key={g.acronym} onClick={() => pickGene(g)} style={glassCard}
                  onMouseEnter={e => e.currentTarget.style.borderColor = C.borderHi}
                  onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
                >
                  <div style={{ color: GENE_INFO[g.acronym]?.color ?? C.accent, fontSize: '0.9rem', marginBottom: '0.15rem' }}>{g.acronym}</div>
                  <div style={{ color: C.textMd, fontSize: '0.65rem', lineHeight: 1.5, marginBottom: '0.28rem' }}>{g.note}</div>
                  <div style={{ color: C.textDim, fontSize: '0.6rem', fontStyle: 'italic' }}>{GENE_INFO[g.acronym]?.headline}</div>
                </div>
              ))}
              <div style={{ padding: '0.7rem 0.65rem', borderRadius: 6, background: C.bgCard, border: `1px solid ${C.border}` }}>
                <div style={{ color: C.textMd, fontSize: '0.62rem', lineHeight: 1.72 }}>
                  Real ISH data from the Allen Brain Atlas — published neuroscience showing where genes are transcribed across the {species === 'human' ? 'developing human' : 'mouse'} brain.
                </div>
              </div>
            </>
          )}
        </aside>

        {/* CENTER — brain always fills full space; slide overlay lifts on top */}
        <div style={{ position: 'relative', background: C.bgDeep, overflow: 'hidden' }}>

          {/* Brain canvas — always full size, always rendering */}
          <div ref={mountRef} style={{ position: 'absolute', inset: 0 }}>
            <div style={{
              position: 'absolute', bottom: '0.55rem', left: '50%', transform: 'translateX(-50%)',
              color: 'rgba(160,200,255,0.17)', fontSize: '0.58rem', letterSpacing: '0.08em', whiteSpace: 'nowrap', zIndex: 2,
            }}>
              {species === 'human' ? 'Allen Developing Human Brain Atlas · ISH' : 'Allen Mouse Brain Atlas · ISH Expression'}
            </div>
            <div style={{
              position: 'absolute', top: '0.7rem', right: '0.7rem', zIndex: 2,
              background: 'rgba(6,18,55,0.82)', border: `1px solid ${C.border}`,
              borderRadius: 5, padding: '0.18rem 0.5rem', backdropFilter: 'blur(8px)',
            }}>
              <span style={{ fontSize: '0.62rem', letterSpacing: '0.07em', color: species === 'human' ? C.accent : C.green }}>
                {species === 'human' ? 'Homo sapiens' : 'Mus musculus'}
              </span>
            </div>
            {!gene && selStruct && (
              <div style={{
                position: 'absolute', bottom: '2.2rem', left: '50%', transform: 'translateX(-50%)', zIndex: 2,
                background: 'rgba(6,18,55,0.9)', border: `1px solid ${C.border}`,
                borderRadius: 6, padding: '0.32rem 0.7rem', backdropFilter: 'blur(10px)',
                textAlign: 'center', maxWidth: '72%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                <span style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: `#${selStruct.color_hex_triplet||'445566'}`, marginRight: 6, verticalAlign: 'middle' }} />
                <span style={{ color: C.purple, fontSize: '0.68rem' }}>{selStruct.acronym}</span>
                <span style={{ color: C.textMd, fontSize: '0.65rem', marginLeft: 6 }}>{selStruct.name?.slice(0,35)}</span>
              </div>
            )}
          </div>

          {/* Slide lightbox — lifts over brain when gene selected */}
          {gene && (
            <div style={{
              position: 'absolute', inset: 0, zIndex: 6,
              display: 'flex', flexDirection: 'column',
              background: '#000814',
              animation: 'na-lift 0.28s ease',
            }}>

              {/* Stain label — minimal, top-left */}
              {geneInfo && (
                <div style={{
                  position: 'absolute', top: 12, left: 14, zIndex: 8,
                  background: 'rgba(4,10,35,0.82)', borderRadius: 5, padding: '0.22rem 0.55rem',
                  backdropFilter: 'blur(8px)', border: `1px solid ${geneInfo.color}30`,
                }}>
                  <span style={{ color: geneInfo.color, fontSize: '0.6rem', letterSpacing: '0.06em' }}>
                    {geneInfo.stain}
                  </span>
                </div>
              )}

              {/* Slide counter + lens toggle — top-right */}
              {images.length > 0 && (
                <div style={{
                  position: 'absolute', top: 12, right: 14, zIndex: 8,
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  {/* Lens toggle pill */}
                  <button
                    onClick={() => setLensEnabled(v => !v)}
                    title={lensEnabled ? 'Turn off magnifier' : 'Turn on magnifier'}
                    style={{
                      background: lensEnabled ? 'rgba(147,197,253,0.14)' : 'rgba(4,10,35,0.82)',
                      border: `1px solid ${lensEnabled ? 'rgba(147,197,253,0.45)' : C.border}`,
                      borderRadius: 5, padding: '0.22rem 0.6rem',
                      backdropFilter: 'blur(8px)',
                      fontSize: '0.6rem', letterSpacing: '0.07em',
                      color: lensEnabled ? C.accent : C.textMd,
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
                      transition: 'background 0.2s, border-color 0.2s, color 0.2s',
                    }}
                  >
                    <span style={{ fontSize: '0.75rem', lineHeight: 1 }}>◎</span>
                    LENS
                    <span style={{
                      width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                      background: lensEnabled ? C.accent : C.textDim,
                      transition: 'background 0.2s',
                    }} />
                  </button>
                  {/* Section counter */}
                  <div style={{
                    background: 'rgba(4,10,35,0.82)', borderRadius: 5, padding: '0.22rem 0.55rem',
                    backdropFilter: 'blur(8px)', border: `1px solid ${C.border}`,
                    fontSize: '0.62rem', color: C.textMd,
                  }}>
                    §{curImage?.section_number} &nbsp;·&nbsp; {slideIdx+1} / {images.length}
                  </div>
                </div>
              )}

              {/* Main slide — fills all available space */}
              <div
                style={{ flex: 1, position: 'relative', overflow: 'hidden' }}
                onMouseMove={handleLensMove}
                onMouseLeave={handleLensLeave}
              >
                {busy.images && (
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3 }}>
                    <div style={{ color: C.textMd, fontSize: '0.7rem', letterSpacing: '0.1em' }}>Loading sections…</div>
                  </div>
                )}

                {curImage && (
                  <img
                    key={curImage.id}
                    ref={slideImgRef}
                    src={`https://api.brain-map.org/api/v2/image_download/${curImage.id}?downsample=3`}
                    alt={`Section ${curImage.section_number}`}
                    onClick={() => setModalOpen(true)}
                    style={{
                      width: '100%', height: '100%', objectFit: 'contain', display: 'block',
                      opacity: imgOpacity,
                      transition: 'opacity 0.16s ease',
                      animation: 'na-fade 0.25s ease',
                      cursor: 'zoom-in',
                    }}
                  />
                )}


                {/* Magnifying lens — always in DOM when image present; position/size written imperatively */}
                {curImage && (
                  <div ref={lensRef} style={{
                    position: 'absolute', left: 0, top: 0,
                    width: LENS_D, height: LENS_D,
                    borderRadius: '50%', overflow: 'hidden',
                    pointerEvents: 'none', zIndex: 10,
                    visibility: 'hidden', willChange: 'transform',
                    border: '2px solid rgba(147,197,253,0.6)',
                    boxShadow: '0 0 0 1.5px rgba(0,0,20,0.8), 0 6px 28px rgba(0,0,0,0.7)',
                    backgroundImage: `url(https://api.brain-map.org/api/v2/image_download/${curImage.id}?downsample=2)`,
                    backgroundRepeat: 'no-repeat',
                    filter: 'saturate(2) contrast(1.35)',
                  }} />
                )}

                {/* Prev / Next */}
                {images.length > 1 && <>
                  <button
                    onClick={prevSlide}
                    disabled={slideIdx === 0}
                    style={{
                      position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', zIndex: 4,
                      background: 'rgba(6,16,50,0.78)', border: `1px solid ${C.border}`,
                      borderRadius: 6, color: C.accent, fontSize: '1.6rem', lineHeight: '1',
                      padding: '0.28rem 0.6rem', cursor: slideIdx===0?'default':'pointer',
                      opacity: slideIdx===0 ? 0.2 : 0.88,
                      backdropFilter: 'blur(8px)', transition: 'opacity 0.2s',
                    }}
                  >‹</button>
                  <button
                    onClick={nextSlide}
                    disabled={slideIdx === images.length-1}
                    style={{
                      position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', zIndex: 4,
                      background: 'rgba(6,16,50,0.78)', border: `1px solid ${C.border}`,
                      borderRadius: 6, color: C.accent, fontSize: '1.6rem', lineHeight: '1',
                      padding: '0.28rem 0.6rem', cursor: slideIdx===images.length-1?'default':'pointer',
                      opacity: slideIdx===images.length-1 ? 0.2 : 0.88,
                      backdropFilter: 'blur(8px)', transition: 'opacity 0.2s',
                    }}
                  >›</button>
                </>}
              </div>

              {/* Thumbnail filmstrip */}
              <div style={{
                flexShrink: 0, height: 70,
                display: 'flex', alignItems: 'center', gap: 4,
                padding: '5px 10px', overflowX: 'auto',
                background: 'rgba(2,6,24,0.95)',
                borderTop: `1px solid ${C.border}`,
              }}>
                {images.map((img, i) => (
                  <div key={img.id} onClick={() => changeSlide(i)} style={{
                    flexShrink: 0, width: 56, height: 56, borderRadius: 4, overflow: 'hidden', cursor: 'pointer',
                    outline: i===slideIdx ? `2px solid ${C.accent}` : `1px solid rgba(120,190,255,0.12)`,
                    outlineOffset: i===slideIdx ? 2 : 0,
                    opacity: i===slideIdx ? 1 : 0.55,
                    transition: 'opacity 0.18s, outline 0.18s',
                    animation: 'na-fade 0.3s ease',
                  }}>
                    <img
                      src={`https://api.brain-map.org/api/v2/image_download/${img.id}?downsample=6`}
                      alt=""
                      loading="lazy"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Loading overlay while fetching */}
          {busy.exp && !gene && (
            <div style={{
              position: 'absolute', inset: 0, zIndex: 7,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(6,18,55,0.55)', backdropFilter: 'blur(3px)',
            }}>
              <div style={{ color: C.accent, fontSize: '0.76rem', letterSpacing: '0.1em' }}>Loading expression data…</div>
            </div>
          )}
        </div>

        {/* RIGHT */}
        <aside style={{ borderLeft: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', background: 'rgba(10,28,78,0.45)' }}>
          <div style={{ display: 'flex', borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
            {[['data', species==='mouse'?'EXPRESSION':'SECTIONS'], ['tree','STRUCTURES']].map(([k,label]) => (
              <button key={k} onClick={() => setRightTab(k)} style={{
                flex: 1, padding: '0.48rem 0', fontSize: '0.6rem', letterSpacing: '0.1em',
                border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                background:   rightTab===k ? 'rgba(100,160,255,0.14)' : 'transparent',
                color:        rightTab===k ? C.accent : C.textMd,
                borderBottom: rightTab===k ? `2px solid ${C.accent}` : '2px solid transparent',
              }}>{label}</button>
            ))}
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {rightTab === 'data' ? (
              species !== 'mouse' ? (
                <div style={{ padding: '0.6rem' }}>
                  {!gene && <div style={{ padding: '2.5rem 0.5rem', textAlign: 'center', color: C.textDim, fontSize: '0.68rem', lineHeight: 1.8 }}>Select a gene to view ISH sections</div>}
                  {gene && images.length > 0 && (
                    <>
                      <div style={{ ...panelLabel, marginBottom: '0.5rem' }}>All sections</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.3rem' }}>
                        {images.map((img, i) => (
                          <div key={img.id} onClick={() => changeSlide(i)} style={{
                            aspectRatio: '1', borderRadius: 4, overflow: 'hidden', cursor: 'pointer',
                            outline: i===slideIdx ? `2px solid ${C.accent}` : 'none', background: '#04101e',
                          }}>
                            <img src={`https://api.brain-map.org/api/v2/image_download/${img.id}?downsample=5`}
                              alt="" loading="lazy"
                              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                            />
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div style={{ padding: '0.55rem 0.7rem', display: 'flex', flexDirection: 'column', gap: '0.32rem' }}>
                  {busy.expr && <div style={{ padding: '1.5rem', textAlign: 'center', color: C.textDim, fontSize: '0.7rem' }}>Computing regions…</div>}
                  {expression.slice(0, 25).map((e, i) => {
                    const st = e.structure ?? {};
                    const pct = (e.expression_energy / maxE) * 100;
                    const hue = 240 - pct * 1.8;
                    return (
                      <div key={e.id??i}
                        onClick={() => { const s = ontFlat.find(o => o.id===e.structure_id); if (s) pickStruct(s); }}
                        style={{ cursor: 'pointer' }} title={st.name}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                          <span style={{ color: C.textMd, fontSize: '0.64rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '65%' }}>{st.acronym??'?'}</span>
                          <span style={{ color: C.textDim, fontSize: '0.62rem' }}>{e.expression_energy?.toFixed(3)}</span>
                        </div>
                        <div style={{ height: 3, background: 'rgba(120,180,255,0.1)', borderRadius: 2, overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', borderRadius: 2, transition: 'width 0.5s ease', background: `hsl(${hue},82%,60%)` }} />
                        </div>
                      </div>
                    );
                  })}
                  {!busy.expr && !expression.length && (
                    <div style={{ padding: '2.5rem 0.5rem', textAlign: 'center', color: C.textDim, fontSize: '0.68rem', lineHeight: 1.8 }}>Select a gene to see expression by region</div>
                  )}
                </div>
              )
            ) : (
              <div style={{ padding: '0.4rem 0.2rem' }}>
                {busy.ont && <div style={{ padding: '1rem', textAlign: 'center', color: C.textDim, fontSize: '0.68rem' }}>Loading structures…</div>}
                {!busy.ont && ontFlat.length > 0 && (
                  <div style={{ padding: '0.25rem 0.5rem', fontSize: '0.6rem', color: C.textDim, letterSpacing: '0.08em', borderBottom: `1px solid ${C.border}`, marginBottom: '0.25rem' }}>
                    {ontFlat.length} structures · {species}
                  </div>
                )}
                {ontTree.map(root => (
                  <TreeNode key={root.id} node={root} depth={0} selected={selStruct} onSelect={pickStruct} />
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* ── Fullscreen lightbox modal ── */}
      {modalOpen && curImage && (
        <div
          onClick={() => { setModalOpen(false); handleModalLensLeave(); }}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,4,18,0.97)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'na-lift 0.22s ease',
          }}
        >
          {/* Image wrapper — sized to the image content, mouse tracked for lens */}
          <div
            style={{ position: 'relative', display: 'inline-block', cursor: 'crosshair', lineHeight: 0 }}
            onMouseMove={handleModalLensMove}
            onMouseLeave={handleModalLensLeave}
            onClick={e => e.stopPropagation()}
          >
            <img
              ref={modalImgRef}
              src={`https://api.brain-map.org/api/v2/image_download/${curImage.id}?downsample=2`}
              alt={`Section ${curImage.section_number}`}
              style={{
                maxWidth: '92vw', maxHeight: '90vh',
                objectFit: 'contain', display: 'block',
                animation: 'na-fade 0.2s ease',
              }}
            />

            {/* Magnifying lens — always in DOM; position/size written imperatively */}
            <div ref={modalLensRef} style={{
              position: 'absolute', left: 0, top: 0,
              width: LENS_D, height: LENS_D,
              borderRadius: '50%', overflow: 'hidden',
              pointerEvents: 'none', zIndex: 10,
              visibility: 'hidden', willChange: 'transform',
              border: '2px solid rgba(147,197,253,0.6)',
              boxShadow: '0 0 0 1.5px rgba(0,0,20,0.8), 0 6px 28px rgba(0,0,0,0.7)',
              backgroundImage: `url(https://api.brain-map.org/api/v2/image_download/${curImage.id}?downsample=2)`,
              backgroundRepeat: 'no-repeat',
              filter: 'saturate(2) contrast(1.35)',
            }} />
          </div>

          {/* Top-right controls: lens toggle + close */}
          <div style={{ position: 'absolute', top: 20, right: 24, display: 'flex', alignItems: 'center', gap: 8, zIndex: 10000 }}>
            <button
              onClick={e => { e.stopPropagation(); setLensEnabled(v => !v); }}
              title={lensEnabled ? 'Turn off magnifier' : 'Turn on magnifier'}
              style={{
                background: lensEnabled ? 'rgba(147,197,253,0.14)' : 'rgba(8,20,60,0.85)',
                border: `1px solid ${lensEnabled ? 'rgba(147,197,253,0.45)' : C.border}`,
                borderRadius: 6, padding: '0.2rem 0.65rem',
                backdropFilter: 'blur(8px)',
                fontSize: '0.6rem', letterSpacing: '0.07em',
                color: lensEnabled ? C.accent : C.textMd,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
                transition: 'background 0.2s, border-color 0.2s, color 0.2s',
              }}
            >
              <span style={{ fontSize: '0.8rem', lineHeight: 1 }}>◎</span>
              LENS
              <span style={{
                width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                background: lensEnabled ? C.accent : C.textDim,
                transition: 'background 0.2s',
              }} />
            </button>
            <button onClick={() => { setModalOpen(false); handleModalLensLeave(); }} style={{
              background: 'rgba(8,20,60,0.85)', border: `1px solid ${C.border}`,
              color: C.accent, fontSize: '1.1rem', cursor: 'pointer',
              borderRadius: 6, padding: '0.2rem 0.65rem', backdropFilter: 'blur(8px)',
            }}>×</button>
          </div>

          {/* Prev */}
          {slideIdx > 0 && (
            <button onClick={e => { e.stopPropagation(); changeSlide(slideIdx - 1); }} style={{
              position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)',
              background: 'rgba(8,20,60,0.85)', border: `1px solid ${C.border}`,
              color: C.accent, fontSize: '1.8rem', lineHeight: 1, cursor: 'pointer',
              borderRadius: 6, padding: '0.3rem 0.65rem', backdropFilter: 'blur(8px)',
            }}>‹</button>
          )}

          {/* Next */}
          {slideIdx < images.length - 1 && (
            <button onClick={e => { e.stopPropagation(); changeSlide(slideIdx + 1); }} style={{
              position: 'absolute', right: 20, top: '50%', transform: 'translateY(-50%)',
              background: 'rgba(8,20,60,0.85)', border: `1px solid ${C.border}`,
              color: C.accent, fontSize: '1.8rem', lineHeight: 1, cursor: 'pointer',
              borderRadius: 6, padding: '0.3rem 0.65rem', backdropFilter: 'blur(8px)',
            }}>›</button>
          )}

          {/* Counter + hint */}
          <div style={{
            position: 'absolute', bottom: 22, left: '50%', transform: 'translateX(-50%)',
            color: C.textDim, fontSize: '0.65rem', letterSpacing: '0.08em', whiteSpace: 'nowrap',
          }}>
            §{curImage.section_number} &nbsp;·&nbsp; {slideIdx + 1} / {images.length} &nbsp;·&nbsp; ← → or click outside to close
          </div>
        </div>
      )}
    </div>
  );
}
