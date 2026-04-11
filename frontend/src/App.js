import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import html2pdf from 'html2pdf.js';
import './App.css';

/* ═══════════════════════ CONSTANTS ══════════════════════ */

const FIELDS = [
  { key: 'glucose',       label: 'Glucose',           icon: '🩸', min: 0,   max: 400,  step: 1,     unit: 'mg/dL',  info: 'Plasma glucose concentration (2-hr test)' },
  { key: 'bloodPressure', label: 'Blood Pressure',    icon: '💓', min: 0,   max: 200,  step: 1,     unit: 'mmHg',   info: 'Diastolic blood pressure' },
  { key: 'skinThickness', label: 'Skin Thickness',    icon: '📏', min: 0,   max: 100,  step: 1,     unit: 'mm',     info: 'Triceps skin fold thickness' },
  { key: 'insulin',       label: 'Insulin',           icon: '💉', min: 0,   max: 1000, step: 1,     unit: 'μU/mL',  info: '2-hour serum insulin level' },
  { key: 'bmi',           label: 'BMI',               icon: '⚖️', min: 10,  max: 80,   step: 0.1,   unit: 'kg/m²',  info: 'Body mass index' },
  { key: 'dpf',           label: 'Diabetes Pedigree', icon: '🧬', min: 0,   max: 3,    step: 0.001, unit: 'score',  info: 'Hereditary risk score' },
  { key: 'age',           label: 'Age',               icon: '🎂', min: 1,   max: 120,  step: 1,     unit: 'years',  info: 'Your age in years' },
];

const DEFAULT_VALUES = {
  glucose: 120, bloodPressure: 70, skinThickness: 20,
  insulin: 80,  bmi: 25.0,         dpf: 0.50,         age: 30,
};

const PARTICLES = [
  { left: 8,  delay: 0,   dur: 8  }, { left: 18, delay: 2,   dur: 11 },
  { left: 28, delay: 4,   dur: 9  }, { left: 42, delay: 1,   dur: 12 },
  { left: 55, delay: 3,   dur: 8  }, { left: 68, delay: 5,   dur: 10 },
  { left: 78, delay: 0.5, dur: 13 }, { left: 88, delay: 2.5, dur: 9  },
];

/* ═══════════════════════ HOOKS ══════════════════════════ */

function useCountUp(target, duration = 2000, trigger = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!trigger) return;
    let startTime = null;
    const tick = (ts) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration, trigger]);
  return count;
}

function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); observer.disconnect(); } },
      { threshold }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);
  return [ref, inView];
}

/* ═══════════════════════ NAVBAR ═════════════════════════ */

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  return (
    <nav className={`navbar${scrolled ? ' nav-scrolled' : ''}`}>
      <div className="nav-inner">
        <button className="nav-logo" onClick={() => scrollTo('hero')}>
          <span className="logo-emblem">🩺</span>
          <span>Diabetes<span className="logo-accent">AI</span></span>
        </button>

        <ul className={`nav-links${menuOpen ? ' nav-open' : ''}`}>
          {[['about', 'About Diabetes'], ['stats', 'Global Stats'], ['how-it-works', 'Process']].map(([id, label]) => (
            <li key={id}><button onClick={() => scrollTo(id)}>{label}</button></li>
          ))}
        </ul>

        <button className="nav-cta" onClick={() => scrollTo('checker')}>Check Risk</button>

        <button
          id="hamburger-btn"
          className={`hamburger${menuOpen ? ' hb-open' : ''}`}
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Toggle menu"
        ><span /><span /><span /></button>
      </div>
    </nav>
  );
}

/* ═══════════════════════ HERO ═══════════════════════════ */

function Hero() {
  const [mounted, setMounted] = useState(false);
  const [heroRef, heroInView] = useInView(0.05);

  useEffect(() => {
    setTimeout(() => setMounted(true), 300);
  }, []);

  const accuracy = useCountUp(80,  2200, heroInView);
  const samples  = useCountUp(724, 1800, heroInView);

  const go = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <section id="hero" className="hero" ref={heroRef}>
      <div className="hero-bg" aria-hidden="true">
        {PARTICLES.map((p, i) => (
          <span key={i} className="particle" style={{ left: `${p.left}%`, animationDelay: `${p.delay}s`, animationDuration: `${p.dur}s` }} />
        ))}
        <div className="blob blob-a" />
        <div className="blob blob-b" />
        <div className="blob blob-c" />
      </div>

      <div className="hero-container">
        <div className={`hero-left${mounted ? ' hero-anim-left' : ''}`}>
          <div className="hero-badge">
            <span className="pulse-dot" /> AI Clinical Assessment
          </div>
          <h1 className="hero-title">Know Your<br /><span className="gradient-text">Diabetes Risk</span><br />In Seconds</h1>
          <p className="hero-subtitle">
            Our Random Forest AI — precision tuned with strict IQR thresholds — analyzes 7 vital clinical parameters to assess your diabetes probability instantly.
          </p>
          <div className="hero-actions">
            <button className="btn-hero-primary" onClick={() => go('checker')}>🔍 Check My Risk</button>
            <button className="btn-hero-ghost" onClick={() => go('about')}>Learn More ↓</button>
          </div>
        </div>

        <div className={`hero-right${mounted ? ' hero-anim-right' : ''}`}>
          <div className="stats-orbit">
            <div className="orbit-ring ring-1" />
            <div className="orbit-ring ring-2" />
            <div className="orbit-ball">
              <span className="orbit-ball-icon">🤖</span>
              <span className="orbit-ball-lbl">AI</span>
            </div>
            <div className="sf sf-top">
              <span className="sf-icon">🎯</span>
              <span className="sf-val">{accuracy}%</span>
              <span className="sf-lbl">Accuracy</span>
            </div>
            <div className="sf sf-right">
              <span className="sf-icon">👥</span>
              <span className="sf-val">{samples}</span>
              <span className="sf-lbl">Clean Samples</span>
            </div>
            <div className="sf sf-bottom">
              <span className="sf-icon">🔬</span>
              <span className="sf-val">7</span>
              <span className="sf-lbl">Parameters</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════ ABOUT DIABETES ═════════════════ */

function AboutDiabetes() {
  const [ref, inView] = useInView(0.1);
  return (
    <section id="about" className="section alt-section" ref={ref}>
      <div className="section-container">
        <header className={`section-header${inView ? ' anim-up' : ''}`}>
          <div className="section-tag">Education</div>
          <h2 className="section-title">Understanding Diabetes</h2>
          <p className="section-subtitle">A chronic metabolic condition characterized by elevated blood glucose.</p>
        </header>

        <div className={`about-grid${inView ? ' anim-up-delay' : ''}`}>
          <div className="about-card">
            <span className="ac-icon">🔵</span>
            <h3>Type 1</h3>
            <p>An autoimmune condition where the pancreas produces little to no insulin. Usually diagnosed in childhood, requiring lifelong insulin therapy.</p>
          </div>
          <div className="about-card highlight-card">
            <span className="ac-icon">🔶</span>
            <h3>Type 2</h3>
            <p>The most common form, occurring when the body becomes resistant to insulin. Highly correlated with BMI, diet, and age. <b>Highly preventable.</b></p>
          </div>
          <div className="about-card">
            <span className="ac-icon">🤰</span>
            <h3>Gestational</h3>
            <p>Occurs during pregnancy when hormones cause insulin resistance. Usually resolves after birth but increases future Type 2 risk.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════ GLOBAL STATS ═══════════════════ */

function GlobalStats() {
  const [ref, inView] = useInView(0.1);
  
  const v1 = useCountUp(537, 2000, inView);
  const v2 = useCountUp(10, 1500, inView);
  const v3 = useCountUp(783, 2200, inView);
  const v4 = useCountUp(6.7, 1800, inView);
  
  return (
    <section id="stats" className="section" ref={ref}>
      <div className="section-container stats-flex">
        <div className={`stats-text${inView ? ' anim-left' : ''}`}>
          <div className="section-tag">Global Impact</div>
          <h2 className="section-title">The Silent Epidemic</h2>
          <p className="section-subtitle">
            According to the World Health Organization (WHO) and the International Diabetes Federation (IDF), diabetes is one of the fastest-growing health emergencies of the 21st century. Predictive AI screening is paramount because over 50% of people with Type 2 diabetes remain completely undiagnosed until severe complications arise.
          </p>
        </div>
        
        <div className={`stats-cards${inView ? ' anim-right' : ''}`}>
          <div className="stat-box">
            <div className="sb-val">{v1}M</div>
            <div className="sb-lbl">Adults globally living with diabetes</div>
          </div>
          <div className="stat-box">
            <div className="sb-val">1 in {v2}</div>
            <div className="sb-lbl">Global adults affected by the disease</div>
          </div>
          <div className="stat-box">
            <div className="sb-val">{v3}M</div>
            <div className="sb-lbl">Projected global case count by 2045</div>
          </div>
          <div className="stat-box">
            <div className="sb-val">{v4}M</div>
            <div className="sb-lbl">Annual fatalities attributed to diabetes</div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════ HOW IT WORKS ══════════════════ */

function HowItWorks() {
  const [ref, inView] = useInView(0.15);

  const steps = [
    { num: '01', icon: '📝', title: 'Enter Your Data', desc: 'Input your 7 clinical parameters using securely validated interactive sliders.' },
    { num: '02', icon: '⚙️', title: 'AI Processes', desc: 'Our tuned Random Forest model analyzes mapping patterns simultaneously.' },
    { num: '03', icon: '📊', title: 'Get Your Result', desc: 'Receive your probability score and a dynamic PDF-ready health recommendation.' },
  ];

  return (
    <section id="how-it-works" className="section hiw-section" ref={ref}>
      <div className="section-container">
        <header className={`section-header${inView ? ' anim-up' : ''}`}>
          <div className="section-tag">Process</div>
          <h2 className="section-title">How It Works</h2>
          <p className="section-subtitle">Three simple steps to your personalized risk assessment</p>
        </header>

        <div className="steps-grid">
          {steps.map((s, i) => (
            <div key={s.num} className={`step-card${inView ? ' anim-up' : ''}`} style={{ animationDelay: inView ? `${i * 0.15}s` : '0s' }}>
              <div className="step-num">{s.num}</div>
              <div className="step-icon-wrap">{s.icon}</div>
              <h3 className="step-title">{s.title}</h3>
              <p className="step-desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════ PROGRESS RING ═════════════════ */

function CircProgress({ pct, tier }) {
  const R = 56, C = 2 * Math.PI * R;
  const [offset, setOffset] = useState(C);
  
  useEffect(() => {
    const t = setTimeout(() => setOffset(C - (pct / 100) * C), 120);
    return () => clearTimeout(t);
  }, [pct, C]);

  return (
    <svg viewBox="0 0 140 140" width="148" height="148">
      <circle cx="70" cy="70" r={R} fill="none" strokeWidth="10" stroke="rgba(255,255,255,0.07)" />
      <circle cx="70" cy="70" r={R} fill="none" strokeWidth="10" strokeDasharray={C} strokeDashoffset={offset} strokeLinecap="round" transform="rotate(-90 70 70)" className={`circ-fg circ-${tier}`} style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4,0,0.2,1)' }} />
      <text x="70" y="64" textAnchor="middle" fill="#fff" fontSize="20" fontWeight="bold" fontFamily="Outfit">{pct}%</text>
      <text x="70" y="83" textAnchor="middle" fill="#94a3b8" fontSize="10">Probability</text>
    </svg>
  );
}

/* ═══════════════════════ CLINICAL TERMS TABLE ═══════════ */

function ClinicalTermsTable() {
  const [ref, inView] = useInView(0.15);

  const metrics = [
    { name: 'Glucose', unit: 'mg/dL', desc: 'Plasma glucose concentration over 2 hours in an oral glucose tolerance test. Measures how quickly your body clears glucose from the blood.', normal: 'Under 140 mg/dL' },
    { name: 'Blood Pressure', unit: 'mmHg', desc: 'Diastolic blood pressure (the bottom number). Measures the pressure in arteries when the heart rests between beats.', normal: 'Under 80 mmHg' },
    { name: 'Skin Thickness', unit: 'mm', desc: 'Triceps skinfold thickness. A clinical method used to estimate the percentage of total body fat.', normal: '10 - 30 mm' },
    { name: 'Insulin', unit: 'μU/mL', desc: '2-Hour serum insulin level. High levels indicate insulin resistance, meaning the body needs more insulin to clear glucose.', normal: '16 - 166 mIU/L' },
    { name: 'BMI', unit: 'kg/m²', desc: 'Body Mass Index. Calculated by dividing weight in kilograms by the square of height in meters.', normal: '18.5 - 24.9' },
    { name: 'Diabetes Pedigree', unit: 'Score', desc: 'A synthesized score based on family history. Represents the genetic likelihood of developing diabetes depending on relatives.', normal: 'Below 0.50' },
  ];

  return (
    <section id="clinical-terms" className="section terms-section" ref={ref}>
      <div className="section-container">
        <header className={`section-header${inView ? ' anim-up' : ''}`}>
          <div className="section-tag">Clinical Reference</div>
          <h2 className="section-title">Parameter Guide</h2>
          <p className="section-subtitle">Clinically approved definitions for the biological markers evaluated by our AI.</p>
        </header>

        <div className={`table-container${inView ? ' anim-up-delay' : ''}`}>
          <table className="clinical-table">
            <thead>
              <tr>
                <th>Parameter</th>
                <th>Unit</th>
                <th>Medical Definition</th>
                <th>Standard Reference Range</th>
              </tr>
            </thead>
            <tbody>
              {metrics.map(m => (
                <tr key={m.name}>
                  <td className="term-name">{m.name}</td>
                  <td className="term-unit">{m.unit}</td>
                  <td className="term-desc">{m.desc}</td>
                  <td className="term-normal">{m.normal}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════ CHECKER ════════════════════════ */

function Checker() {
  const [sectionRef, inView] = useInView(0.08);
  const [formData, setFormData] = useState(DEFAULT_VALUES);
  const [result, setResult]     = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const resultRef = useRef(null);

  const validateField = (key, value) => {
    const field = FIELDS.find(f => f.key === key);
    if (!field) return null;
    const v = parseFloat(value);
    if (isNaN(v)) return 'Required';
    if (v < field.min) return `Must be ≥ ${field.min}`;
    if (v > field.max) return `Must be ≤ ${field.max}`;
    return null;
  };

  const handleChange = useCallback((key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    const err = validateField(key, value);
    setFieldErrors(prev => ({ ...prev, [key]: err }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Final pre-flight validation check
    let hasError = false;
    let newErrs = {};
    Object.keys(formData).forEach(k => {
      const err = validateField(k, formData[k]);
      if (err) { newErrs[k] = err; hasError = true; }
    });
    if (hasError) { setFieldErrors(newErrs); setError('Please fix the validation errors in the form.'); return; }

    setLoading(true); setError(null); setResult(null);
    try {
      const payload = {};
      Object.keys(formData).forEach(k => payload[k] = parseFloat(formData[k]));
      const res = await axios.post('http://localhost:8000/predict', payload);
      setResult(res.data);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 200);
    } catch (err) {
      setError(err.response?.data?.detail?.[0]?.msg || 'Could not connect to the backend API.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => { setFormData(DEFAULT_VALUES); setResult(null); setError(null); setFieldErrors({}); };

  const downloadPDF = () => {
    if (!resultRef.current) return;
    const opt = {
      margin:       0.5,
      filename:     'Diabetes_AI_Risk_Report.pdf',
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, logging: false },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(resultRef.current).save();
  };

  const getSliderPct = (f) => {
    const val = parseFloat(formData[f.key]) || f.min;
    return Math.min(100, Math.max(0, ((val - f.min) / (f.max - f.min)) * 100)).toFixed(2);
  };

  const getRiskTier = (pred) => {
    if (!pred) return 'low';
    if (pred === 'Very Low Risk') return 'very-low';
    if (pred === 'Low Risk') return 'low';
    if (pred === 'Moderate Risk') return 'moderate';
    if (pred === 'High Risk') return 'high';
    if (pred === 'Very High Risk') return 'very-high';
    return 'low';
  };

  const riskTier = getRiskTier(result?.prediction);
  const probNum  = result ? parseFloat(result.probability) : 0;

  return (
    <section id="checker" className="section alt-section" ref={sectionRef}>
      <div className="section-container">
        <header className={`section-header${inView ? ' anim-up' : ''}`}>
          <div className="section-tag">Assessment</div>
          <h2 className="section-title">Check Your Risk</h2>
          <p className="section-subtitle">Enter your clinical readings below. The system rigorously validates data against biological thresholds.</p>
        </header>

        <div className={`checker-card${inView ? ' anim-up-delay' : ''}`}>
          <form onSubmit={handleSubmit} noValidate>
            <div className="fields-grid">
              {FIELDS.map((f) => {
                const pct = getSliderPct(f);
                const isErr = !!fieldErrors[f.key];
                return (
                  <div className="field-block" key={f.key}>
                    <div className="field-header">
                      <label className="field-label">
                        <span className="field-icon">{f.icon}</span> {f.label}
                      </label>
                      <span className="field-unit">{f.unit}</span>
                    </div>

                    <div className="input-wrap">
                      <input
                        type="number"
                        className={`field-num ${isErr ? 'input-err' : ''}`}
                        min={f.min} max={f.max} step={f.step}
                        value={formData[f.key] === '' ? '' : formData[f.key]}
                        onChange={e => handleChange(f.key, e.target.value)}
                        required
                      />
                      {isErr && <span className="err-msg">{fieldErrors[f.key]}</span>}
                    </div>

                    <input
                      type="range"
                      className="field-slider"
                      min={f.min} max={f.max} step={f.step}
                      value={parseFloat(formData[f.key]) || f.min}
                      onChange={e => handleChange(f.key, e.target.value)}
                      style={{ '--pct': `${pct}%` }}
                    />
                    <p className="field-info">{f.info}</p>
                  </div>
                );
              })}
            </div>

            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={handleReset}>↺ Reset</button>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? <><span className="spinner"/> Analyzing</> : '🔍 Analyze Risk'}
              </button>
            </div>
          </form>
        </div>

        {error && (
          <div className="error-card anim-up">
            <span className="error-icon">⚠️</span> <p>{error}</p>
          </div>
        )}

        {result && (
          <div className="result-wrapper anim-up">
            <div id="pdf-container" ref={resultRef} className={`result-card result-${riskTier}`}>
              <div className="result-header-print">
                <h3>🩺 DiabetesAI Clinical Report</h3>
                <p>Generated strictly for informational & screening purposes.</p>
              </div>

              <div className="result-body">
                <div className="result-info">
                  <div className={`risk-badge badge-${riskTier}`}>
                    {result.prediction}
                  </div>
                  
                  <p className="result-analysis">{result.analysis}</p>

                  <div className="precautions-box">
                    <h3 className="precautions-title">📋 Recommended Action Plan</h3>
                    <ul className="precautions-list">
                      {result.precautions.map((p, i) => (
                        <li key={i} className="precaution-item"><span className="prec-dot"/>{p}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="result-visual">
                  <CircProgress pct={probNum} tier={riskTier} />
                </div>
              </div>
              
              <div className="result-disclaimer">
                <strong>⚕️ Medical Disclaimer:</strong> This AI tool provides screening data, not a medical diagnosis. Always consult a licensed healthcare professional regarding clinical decisions.
              </div>
            </div>

            <button className="btn-download" onClick={downloadPDF}>
              📄 Download PDF Report
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

/* ═══════════════════════ ROOT APP ═══════════════════════ */

export default function App() {
  return (
    <div className="app">
      <Navbar />
      <Hero />
      <AboutDiabetes />
      <GlobalStats />
      <HowItWorks />
      <ClinicalTermsTable />
      <Checker />
      <footer className="footer-bottom">
        <p>© 2026 DiabetesAI · Not a substitute for medical advice</p>
      </footer>
    </div>
  );
}
