import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import html2pdf from 'html2pdf.js';
import './App.css';

/* ═══════════════════════ SVG ICONS (Clean Medical Line Icons) ══════ */

const Icons = {
  Plus:     () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Pulse:    () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  Glucose:  () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M2 12h20"/></svg>,
  Pressure: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>,
  Skin:     () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>,
  Syringe:  () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 2-3 3M2 22l1.5-1.5M11 11l4-4M5 17l4-4M8.5 13.5l3 3M14 8.5l3 3"/></svg>,
  Chart:    () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>,
  Dna:      () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 15c6.667-6 13.333 0 20-6"/><path d="M9 22c1.798-1.998 2.518-3.995 2.807-5.993"/><path d="M15 2c-1.798 1.998-2.518 3.995-2.807 5.993"/><path d="m17 6-2.5-2.5"/><path d="m14 8-1-1"/><path d="m7 18 2.5 2.5"/><path d="m10 16 1 1"/><path d="M2 9c6.667 6 13.333 0 20 6"/></svg>,
  Clock:    () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  Upload:   () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
  Cpu:      () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>,
  FileText: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
  Alert:    () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  Shield:   () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  Users:    () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  Arrow:    () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
};

/* ═══════════════════════ CONSTANTS ═════════════════════════ */

const DEFAULT_VALUES = {
  glucose: 120, bloodPressure: 70, skinThickness: 20,
  insulin: 80,  bmi: 25.0, dpf: 0.50, age: 30,
};

const FIELDS = [
  { key: 'glucose',       label: 'Glucose',           Icon: Icons.Glucose,  min: 0,  max: 400,  step: 1,     unit: 'mg/dL', info: 'Plasma glucose concentration (2-hr oral glucose tolerance test)' },
  { key: 'bloodPressure', label: 'Blood Pressure',    Icon: Icons.Pressure, min: 0,  max: 200,  step: 1,     unit: 'mmHg',  info: 'Diastolic blood pressure measurement' },
  { key: 'skinThickness', label: 'Skin Thickness',    Icon: Icons.Skin,     min: 0,  max: 100,  step: 1,     unit: 'mm',    info: 'Triceps skinfold thickness measurement' },
  { key: 'insulin',       label: 'Insulin',           Icon: Icons.Syringe,  min: 0,  max: 1000, step: 1,     unit: 'μU/mL', info: '2-hour serum insulin level' },
  { key: 'bmi',           label: 'BMI',               Icon: Icons.Chart,    min: 10, max: 80,   step: 0.1,   unit: 'kg/m²', info: 'Body mass index (weight in kg / height in m²)' },
  { key: 'dpf',           label: 'Diabetes Pedigree', Icon: Icons.Dna,      min: 0,  max: 3,    step: 0.001, unit: 'score', info: 'Family history diabetes risk score' },
  { key: 'age',           label: 'Age',               Icon: Icons.Clock,    min: 1,  max: 120,  step: 1,     unit: 'years', info: 'Your current age' },
];

/* ═══════════════════════ HOOKS ═════════════════════════════ */

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

/* ═══════════════════════ DISCLAIMER MODAL ══════════════════ */

function DisclaimerModal() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!localStorage.getItem('diabetesDisclaimerAccepted')) setOpen(true);
  }, []);
  const accept = () => {
    localStorage.setItem('diabetesDisclaimerAccepted', 'true');
    setOpen(false);
  };
  if (!open) return null;
  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h2>
          <Icons.Alert /> Important Notice
        </h2>
        <p>This tool provides <strong>probabilistic screening data</strong> and is not a medical diagnosis. It should not replace consultation with a healthcare professional.</p>
        <p>
          For best accuracy, use recent lab readings for insulin and glucose.
          If unavailable, enable <strong>Lifestyle Mode</strong> to use clinical medians instead.
        </p>
        <button className="btn-primary" onClick={accept}>I Understand</button>
      </div>
    </div>
  );
}

/* ═══════════════════════ NAVBAR ════════════════════════════ */

function Navbar({ theme, toggleTheme }) {
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
          <span className="logo-icon"><Icons.Plus /></span>
          <span>DiabCheck</span>
        </button>

        <ul className={`nav-links${menuOpen ? ' nav-open' : ''}`}>
          {[['about', 'About'], ['stats', 'Statistics'], ['how-it-works', 'How It Works']].map(([id, label]) => (
            <li key={id}><button onClick={() => scrollTo(id)}>{label}</button></li>
          ))}
        </ul>

        <div className="nav-actions">
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? '☀' : '☽'}
          </button>
          <button className="nav-cta" onClick={() => scrollTo('checker')}>Check Risk</button>
          <button
            id="hamburger-btn"
            className={`hamburger${menuOpen ? ' hb-open' : ''}`}
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Toggle menu"
          ><span /><span /><span /></button>
        </div>
      </div>
    </nav>
  );
}

/* ═══════════════════════ HERO ══════════════════════════════ */

function Hero() {
  const go = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <section id="hero" className="hero">
      <div className="hero-container">
        <div className="hero-left">
          <span className="hero-eyebrow">Free Health Screening Tool</span>
          <h1 className="hero-title">
            Know Your<br />
            <span className="highlight">Diabetes Risk</span>
          </h1>
          <p className="hero-subtitle">
            Answer 7 simple health questions and get an instant risk assessment
            backed by a clinically trained machine learning model. Private, free, and no sign-up required.
          </p>
          <div className="hero-actions">
            <button className="btn-hero-primary" onClick={() => go('checker')}>
              Start Assessment <Icons.Arrow />
            </button>
            <button className="btn-hero-secondary" onClick={() => go('about')}>
              Learn about diabetes ↓
            </button>
          </div>
        </div>

        <div className="hero-right">
          <div className="trust-card">
            <div className="trust-card-title">Why trust this tool?</div>

            <div className="trust-item">
              <div className="trust-icon"><Icons.Shield /></div>
              <div>
                <div className="trust-label">Private & Secure</div>
                <div className="trust-desc">Your data never leaves your browser. No account needed.</div>
              </div>
            </div>

            <div className="trust-item">
              <div className="trust-icon"><Icons.Cpu /></div>
              <div>
                <div className="trust-label">80% Model Accuracy</div>
                <div className="trust-desc">Trained on 724 clinically validated patient samples.</div>
              </div>
            </div>

            <div className="trust-item">
              <div className="trust-icon"><Icons.Users /></div>
              <div>
                <div className="trust-label">Evidence-Based</div>
                <div className="trust-desc">Built on the Pima Indian Diabetes dataset — a widely studied clinical resource.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════ ABOUT DIABETES ════════════════════ */

function AboutDiabetes() {
  return (
    <section id="about" className="section alt-section">
      <div className="section-container">
        <header className="section-header">
          <h2 className="section-title">Understanding Diabetes</h2>
          <p className="section-subtitle">
            Diabetes is a chronic condition where the body cannot properly process blood sugar (glucose). 
            Early detection and lifestyle changes can significantly reduce complications.
          </p>
        </header>
        <div className="about-grid">
          <div className="about-card">
            <h3>Type 1 Diabetes</h3>
            <p>An autoimmune condition where the pancreas produces little or no insulin. Usually diagnosed in childhood and requires lifelong insulin therapy and careful blood sugar monitoring.</p>
          </div>
          <div className="about-card highlight-card">
            <h3>Type 2 Diabetes</h3>
            <p>The most common form, caused by insulin resistance. Strongly linked to lifestyle factors — diet, weight, and physical activity. <strong>Highly manageable with early detection.</strong></p>
          </div>
          <div className="about-card">
            <h3>Gestational Diabetes</h3>
            <p>Develops during pregnancy due to hormonal changes affecting insulin. Usually resolves after delivery, but significantly increases the mother's lifetime risk of Type 2 diabetes.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════ GLOBAL STATS ══════════════════════ */

function GlobalStats() {
  const [ref, inView] = useInView(0.1);
  const v1 = useCountUp(537, 2000, inView);
  const v2 = useCountUp(10,  1800, inView);
  const v3 = useCountUp(783, 2200, inView);
  const v4 = useCountUp(6,   1600, inView);

  return (
    <section id="stats" className="section" ref={ref}>
      <div className="section-container">
        <div className="stats-layout">
          <div className="stats-text">
            <header className="section-header">
              <h2 className="section-title">The Global Impact</h2>
              <p className="section-subtitle">
                Diabetes is among the fastest-growing health emergencies worldwide.
                According to the WHO and the International Diabetes Federation, 
                over half of all Type 2 cases go undiagnosed until serious complications develop.
                Early screening saves lives.
              </p>
            </header>
          </div>
          <div className="stats-numbers">
            <div className="stat-item">
              <div className="stat-value">{v1}M</div>
              <div className="stat-label">Adults living with diabetes globally</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">1 in {v2}</div>
              <div className="stat-label">Adults worldwide are affected</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{v3}M</div>
              <div className="stat-label">Projected cases by 2045</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{v4}.7M</div>
              <div className="stat-label">Annual deaths attributed to diabetes</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════ HOW IT WORKS ══════════════════════ */

function HowItWorks() {
  const steps = [
    { num: '1', Icon: Icons.Upload,   title: 'Enter your health data',       desc: 'Fill in 7 health parameters — things like blood glucose, BMI, and age. Use sliders or type values directly.' },
    { num: '2', Icon: Icons.Cpu,      title: 'Model analyses your data',     desc: 'A Random Forest classifier evaluates your inputs against 724 validated clinical samples using quality-filtered data.' },
    { num: '3', Icon: Icons.FileText, title: 'Get your risk report',         desc: 'Receive a 5-tier risk score with personalised recommendations. Download or print as a PDF for your doctor.' },
  ];

  return (
    <section id="how-it-works" className="section alt-section">
      <div className="section-container">
        <header className="section-header centered">
          <h2 className="section-title">How It Works</h2>
          <p className="section-subtitle">Three simple steps to understand your diabetes risk.</p>
        </header>
        <div className="steps-grid">
          {steps.map((s) => (
            <div key={s.num} className="step-card">
              <div className="step-number">{s.num}</div>
              <h3 className="step-title">{s.title}</h3>
              <p className="step-desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════ PROGRESS RING ═════════════════════ */

function CircProgress({ pct, tier }) {
  const R = 56, C = 2 * Math.PI * R;
  const [offset, setOffset] = useState(C);
  useEffect(() => {
    const t = setTimeout(() => setOffset(C - (pct / 100) * C), 120);
    return () => clearTimeout(t);
  }, [pct, C]);

  return (
    <svg viewBox="0 0 140 140" width="130" height="130">
      <circle cx="70" cy="70" r={R} fill="none" strokeWidth="10" stroke="var(--bg-subtle)" />
      <circle cx="70" cy="70" r={R} fill="none" strokeWidth="10"
        strokeDasharray={C} strokeDashoffset={offset}
        strokeLinecap="round" transform="rotate(-90 70 70)"
        className={`circ-fg circ-${tier}`}
        style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)' }}
      />
      <text x="70" y="66" textAnchor="middle" fill="var(--text)" fontSize="22" fontWeight="700" fontFamily="Source Sans 3, sans-serif">{pct}%</text>
      <text x="70" y="84" textAnchor="middle" fill="var(--muted)" fontSize="10" fontFamily="Inter, sans-serif">Risk Score</text>
    </svg>
  );
}

/* ═══════════════════════ CLINICAL TERMS TABLE ═══════════════ */

function ClinicalTermsTable() {
  const metrics = [
    { name: 'Glucose',          unit: 'mg/dL',  desc: 'Plasma glucose concentration measured over 2 hours in an oral glucose tolerance test.',                    normal: 'Under 140 mg/dL'  },
    { name: 'Blood Pressure',   unit: 'mmHg',   desc: 'Diastolic blood pressure — the pressure in arteries when the heart rests between beats.',               normal: 'Under 80 mmHg'    },
    { name: 'Skin Thickness',   unit: 'mm',     desc: 'Triceps skinfold thickness, used as a clinical estimate of total body fat percentage.',                   normal: '10 – 30 mm'       },
    { name: 'Insulin',          unit: 'μU/mL',  desc: '2-hour serum insulin. Elevated levels may indicate insulin resistance.',                                  normal: '16 – 166 mIU/L'  },
    { name: 'BMI',              unit: 'kg/m²',  desc: 'Body Mass Index — weight (kg) divided by height squared (m²).',                                           normal: '18.5 – 24.9'      },
    { name: 'Diabetes Pedigree',unit: 'Score',  desc: 'A score representing the genetic likelihood of diabetes based on family history.',                        normal: 'Below 0.50'       },
  ];

  return (
    <section id="clinical-terms" className="section">
      <div className="section-container">
        <header className="section-header">
          <h2 className="section-title">Parameter Reference Guide</h2>
          <p className="section-subtitle">
            Definitions for each health metric used in the assessment. 
            The model is trained on the Pima Indian Diabetes dataset, which consists 
            primarily of female subjects. Results for male users are statistically extrapolated.
          </p>
        </header>
        <div className="table-wrap">
          <table className="clinical-table">
            <thead>
              <tr>
                <th>Parameter</th>
                <th>Unit</th>
                <th>Description</th>
                <th>Normal Range</th>
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

/* ═══════════════════════ CHECKER ════════════════════════════ */

function Checker() {
  const [formData, setFormData] = useState(() => {
    try {
      const saved = localStorage.getItem('diabetesFormData');
      return saved ? JSON.parse(saved) : DEFAULT_VALUES;
    } catch { return DEFAULT_VALUES; }
  });
  const [lifestyleMode, setLifestyleMode] = useState(false);
  const [result,      setResult]      = useState(null);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const resultRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('diabetesFormData', JSON.stringify(formData));
  }, [formData]);

  const validateField = (key, value) => {
    const field = FIELDS.find(f => f.key === key);
    if (!field) return null;
    const v = parseFloat(value);
    if (isNaN(v))          return 'Required';
    if (v < field.min)     return `Min ${field.min}`;
    if (v > field.max)     return `Max ${field.max}`;
    return null;
  };

  const handleChange = useCallback((key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    setFieldErrors(prev => ({ ...prev, [key]: validateField(key, value) }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    let hasError = false;
    const newErrs = {};
    Object.keys(formData).forEach(k => {
      if (lifestyleMode && ['glucose', 'skinThickness', 'insulin'].includes(k)) return;
      const err = validateField(k, formData[k]);
      if (err) { newErrs[k] = err; hasError = true; }
    });
    if (hasError) { setFieldErrors(newErrs); setError('Please fix the highlighted fields above.'); return; }

    setLoading(true); setError(null); setResult(null);
    try {
      const payload = {};
      Object.keys(formData).forEach(k => { payload[k] = parseFloat(formData[k]); });
      if (lifestyleMode) {
        payload.glucose       = DEFAULT_VALUES.glucose;
        payload.skinThickness = DEFAULT_VALUES.skinThickness;
        payload.insulin       = DEFAULT_VALUES.insulin;
      }
      const res = await axios.post('http://localhost:8000/predict', payload);
      setResult(res.data);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 200);
    } catch (err) {
      setError(err.response?.data?.detail?.[0]?.msg || 'Could not connect to the server. Please make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => { setFormData(DEFAULT_VALUES); setResult(null); setError(null); setFieldErrors({}); };

  const downloadPDF = () => {
    if (!resultRef.current) return;
    html2pdf().set({
      margin: 0.5,
      filename: 'DiabCheck_Risk_Report.pdf',
      image:     { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF:     { unit: 'in', format: 'letter', orientation: 'portrait' },
    }).from(resultRef.current).save();
  };

  const getSliderPct = (f) => {
    const val = parseFloat(formData[f.key]) || f.min;
    return Math.min(100, Math.max(0, ((val - f.min) / (f.max - f.min)) * 100)).toFixed(2);
  };

  const getRiskTier = (pred) => {
    if (!pred) return 'low';
    const map = { 'Very Low Risk': 'very-low', 'Low Risk': 'low', 'Moderate Risk': 'moderate', 'High Risk': 'high', 'Very High Risk': 'very-high' };
    return map[pred] || 'low';
  };

  const riskTier = getRiskTier(result?.prediction);
  const probNum  = result ? parseFloat(result.probability) : 0;

  return (
    <section id="checker" className="section alt-section">
      <div className="section-container">
        <header className="section-header centered">
          <h2 className="section-title">Check Your Risk</h2>
          <p className="section-subtitle">
            Enter your health readings below. All values are validated against clinical reference ranges.
          </p>
          <label className="mode-toggle" title="Enable if you don't have recent lab results">
            <div className="switch">
              <input type="checkbox" checked={lifestyleMode} onChange={e => setLifestyleMode(e.target.checked)} />
              <div className="slider round" />
            </div>
            <span className="mode-lbl">Lifestyle Mode — I don't have lab results</span>
          </label>
        </header>

        <div className="checker-card">
          <form onSubmit={handleSubmit} noValidate>
            <div className="fields-grid">
              {FIELDS.map((f) => {
                if (lifestyleMode && ['glucose', 'skinThickness', 'insulin'].includes(f.key)) return null;
                const pct   = getSliderPct(f);
                const isErr = !!fieldErrors[f.key];
                return (
                  <div className="field-block" key={f.key}>
                    <div className="field-header">
                      <label className="field-label">
                        <span className="field-icon"><f.Icon /></span>
                        {f.label}
                      </label>
                      <span className="field-unit">{f.unit}</span>
                    </div>
                    <div className="input-wrap">
                      <input
                        type="number"
                        className={`field-num${isErr ? ' input-err' : ''}`}
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
              <button type="button" className="btn-secondary" onClick={handleReset}>Reset</button>
              <button type="submit"  className="btn-primary"  disabled={loading}>
                {loading
                  ? <><span className="spinner" /> Analysing…</>
                  : <>Analyse Risk</>}
              </button>
            </div>
          </form>
        </div>

        {error && (
          <div className="error-card anim-up">
            <span className="error-icon"><Icons.Alert /></span>
            <p>{error}</p>
          </div>
        )}

        {result && (
          <div className="result-wrapper anim-up">
            <div id="pdf-container" ref={resultRef} className={`result-card result-${riskTier}`}>
              <div className="result-header-print">
                <h3>DiabCheck Clinical Report</h3>
                <p>Generated for informational and screening purposes only.</p>
              </div>

              <div className="result-body">
                <div className="result-info">
                  <div className={`risk-badge badge-${riskTier}`}>{result.prediction}</div>
                  <p className="result-analysis">{result.analysis}</p>
                  <div className="precautions-box">
                    <h3 className="precautions-title">Recommendations</h3>
                    <ul className="precautions-list">
                      {result.precautions.map((p, i) => (
                        <li key={i} className="precaution-item"><span className="prec-dot" />{p}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="result-visual">
                  <CircProgress pct={probNum} tier={riskTier} />
                </div>
              </div>

              <div className="result-disclaimer">
                <strong>Disclaimer:</strong> This tool provides screening probability data only. It is not a
                substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider.
              </div>
            </div>

            <button className="btn-download" onClick={downloadPDF}>
              <Icons.FileText /> Download PDF Report
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

/* ═══════════════════════ ROOT APP ═══════════════════════════ */

export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('diabetesTheme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('diabetesTheme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  return (
    <div className="app">
      <DisclaimerModal />
      <Navbar theme={theme} toggleTheme={toggleTheme} />
      <Hero />
      <AboutDiabetes />
      <GlobalStats />
      <HowItWorks />
      <ClinicalTermsTable />
      <Checker />
      <footer className="site-footer">
        <div className="footer-inner">
          <div>
            <div className="footer-brand">DiabCheck</div>
            <p className="footer-desc">
              A free diabetes risk assessment tool built with clinical data 
              and machine learning. Designed to help individuals understand 
              their health better.
            </p>
          </div>
          <p className="footer-disclaimer">
            This website is for informational purposes only and does not provide 
            medical advice. Always consult with a qualified healthcare professional 
            before making health decisions.
          </p>
          <p className="footer-copy">© 2026 DiabCheck · For educational and informational use only</p>
        </div>
      </footer>
    </div>
  );
}
