'use client';
import { useState, useRef } from 'react';

const inds = [
  { key: 's', icon: '💰', label: 'Ventes ($)', unit: '$' },
  { key: 'f', icon: '⚡', label: 'FCFP (%)', unit: '%' },
  { key: 'c', icon: '📦', label: 'COA (%)', unit: '%' },
  { key: 'r', icon: '🚀', label: 'RAP (%)', unit: '%' },
];

function calcStatus(key, o, r) {
  const ov = parseFloat(o), rv = parseFloat(r);
  if (isNaN(ov) || isNaN(rv)) return null;
  return key === 's' ? rv >= ov : rv <= ov;
}

const emptyEquip = () => ({ prob: '', action: '' });

export default function Page() {
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({
    leader: '', manager: '', shift: 'Souper', date: today, email: '',
    s_o: '', s_r: '', f_o: '', f_r: '', c_o: '', c_r: '', r_o: '', r_r: '',
    well: '', prob: '', act: '', endorse: '',
  });
  const [equips, setEquips] = useState([emptyEquip()]);
  const [photos, setPhotos] = useState([]);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);
  const fileRef = useRef();

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setEquip = (i, k, v) => setEquips(eq => eq.map((e, j) => j === i ? { ...e, [k]: v } : e));
  const addEquip = () => setEquips(eq => [...eq, emptyEquip()]);
  const removeEquip = (i) => setEquips(eq => eq.filter((_, j) => j !== i));

  const statuses = inds.map(({ key }) => calcStatus(key, form[key + '_o'], form[key + '_r']));
  const achieved = statuses.filter(s => s === true).length;
  const total = statuses.filter(s => s !== null).length;

  async function handleSubmit() {
    if (!form.leader) { setResult({ ok: false, msg: '⚠️ Veuillez entrer le nom du leader.' }); return; }
    if (!form.email) { setResult({ ok: false, msg: '⚠️ Veuillez entrer le courriel du destinataire.' }); return; }
    setSending(true); setResult(null);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      fd.append('equips', JSON.stringify(equips));
      photos.forEach(p => fd.append('photos', p));
      const res = await fetch('/api/send', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.success) setResult({ ok: true, msg: '✅ Rapport envoyé avec succès!' });
      else setResult({ ok: false, msg: '❌ Erreur: ' + data.error });
    } catch (e) {
      setResult({ ok: false, msg: '❌ Erreur réseau. Vérifiez votre connexion.' });
    }
    setSending(false);
  }

  const inp = 'w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2.5 text-white text-[15px] outline-none focus:border-orange-500';
  const lbl = 'block text-orange-500 text-[11px] font-bold font-mono tracking-wider mb-1';

  return (
    <div className="min-h-screen bg-[#0d0d0d] pb-20">

      {/* HEADER */}
      <div style={{ background: 'linear-gradient(135deg,#b91c1c,#ea580c)' }} className="px-5 py-6 text-center">
        <div className="text-4xl mb-1">🍔</div>
        <h1 className="text-white text-xl font-black tracking-wide">McDONALD'S ALMA</h1>
        <p className="text-white/70 text-sm mt-1">Rapport de Quart</p>
      </div>

      {/* QUART INFO */}
      <div className="mx-4 mt-4 bg-[#141414] border border-[#222] rounded-xl p-4">
        <div className="text-orange-500 font-black text-xs font-mono tracking-widest mb-3">📋 INFORMATIONS DU QUART</div>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div><label className={lbl}>LEADER DE QUART</label><input className={inp} value={form.leader} onChange={e => set('leader', e.target.value)} placeholder="ex: JP" /></div>
          <div><label className={lbl}>GÉRANT PRODUCTION</label><input className={inp} value={form.manager} onChange={e => set('manager', e.target.value)} placeholder="ex: Louvel" /></div>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div><label className={lbl}>QUART</label>
            <select className={inp} value={form.shift} onChange={e => set('shift', e.target.value)}>
              {['Dejeuner', 'Diner', 'Souper', 'Nuit'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div><label className={lbl}>DATE</label><input type="date" className={inp} value={form.date} onChange={e => set('date', e.target.value)} /></div>
        </div>
        <div><label className={lbl}>COURRIEL DU DESTINATAIRE</label><input type="email" className={inp} value={form.email} onChange={e => set('email', e.target.value)} placeholder="gerant@mcdonalds.com" /></div>
      </div>

      {/* PERFORMANCE */}
      <div className="mx-4 mt-4 bg-[#141414] border border-[#222] rounded-xl p-4">
        <div className="text-orange-500 font-black text-xs font-mono tracking-widest mb-3">📊 PERFORMANCE</div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#1f1f1f]">
              <th className="text-left text-orange-500 font-mono text-xs tracking-wider p-2">Indicateur</th>
              <th className="text-center text-orange-500 font-mono text-xs tracking-wider p-2">Objectif</th>
              <th className="text-center text-orange-500 font-mono text-xs tracking-wider p-2">Réel</th>
              <th className="text-center text-orange-500 font-mono text-xs tracking-wider p-2">Statut</th>
            </tr>
          </thead>
          <tbody>
            {inds.map(({ key, icon, label }, i) => {
              const st = calcStatus(key, form[key + '_o'], form[key + '_r']);
              return (
                <tr key={key} className={i % 2 === 0 ? 'bg-[#111]' : 'bg-[#141414]'}>
                  <td className="p-2 font-semibold text-sm">{icon} {label}</td>
                  <td className="p-1 text-center"><input type="number" className="w-16 bg-[#1a1a1a] border border-[#333] rounded px-1 py-1 text-white text-sm text-center outline-none focus:border-orange-500" value={form[key + '_o']} onChange={e => set(key + '_o', e.target.value)} /></td>
                  <td className="p-1 text-center"><input type="number" className="w-16 bg-[#1a1a1a] border border-[#333] rounded px-1 py-1 text-white text-sm text-center outline-none focus:border-orange-500" value={form[key + '_r']} onChange={e => set(key + '_r', e.target.value)} /></td>
                  <td className="p-2 text-center">
                    {st === null ? <span className="text-gray-600 text-xs">—</span>
                      : st ? <span className="bg-green-700 text-white text-xs px-2 py-0.5 rounded-full font-bold">✅ OK</span>
                        : <span className="bg-red-700 text-white text-xs px-2 py-0.5 rounded-full font-bold">❌ FAIL</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {total > 0 && (
          <div className="mt-3 bg-[#1f1a0a] border border-orange-900 rounded-lg px-3 py-2 text-sm">
            🏆 <span className="font-bold text-orange-400">{achieved}/{total} objectifs atteints</span>
            <span className="text-gray-400 text-xs ml-2">
              {achieved === total ? '🌟 Excellent!' : achieved >= total / 2 ? '💪 Bon quart!' : '🔥 Continuez!'}
            </span>
          </div>
        )}
        <p className="text-xs text-gray-600 mt-2 font-mono">💡 Ventes: plus élevé = mieux | FCFP, COA, RAP: plus bas = mieux</p>
      </div>

      {/* ANALYSE */}
      <div className="mx-4 mt-4 bg-[#141414] border border-[#222] rounded-xl p-4">
        <div className="text-orange-500 font-black text-xs font-mono tracking-widest mb-3">🧠 ANALYSE DU QUART</div>
        {[
          { id: 'well', label: '✅ CE QUI A BIEN FONCTIONNÉ', ph: 'Points positifs du quart...' },
          { id: 'prob', label: '⚠️ PROBLÈMES / OPPORTUNITÉS', ph: 'Problèmes rencontrés...' },
          { id: 'act', label: '🎯 ACTIONS FUTURES', ph: "Améliorations pour le prochain quart..." },
          { id: 'endorse', label: '🏅 POINTS À SOULIGNER', ph: "Membres de l'équipe à féliciter..." },
        ].map(({ id, label, ph }) => (
          <div key={id} className="mb-3">
            <label className={lbl}>{label}</label>
            <textarea className={inp} rows={3} placeholder={ph} value={form[id]} onChange={e => set(id, e.target.value)} style={{ resize: 'vertical' }} />
          </div>
        ))}
      </div>

      {/* EQUIPEMENT — up to 3 items */}
      <div className="mx-4 mt-4 bg-[#141414] border border-[#222] rounded-xl p-4">
        <div className="text-orange-500 font-black text-xs font-mono tracking-widest mb-3">🔧 ÉQUIPEMENT</div>
        {equips.map((eq, i) => (
          <div key={i} className="mb-4 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-orange-400 text-xs font-bold font-mono">ÉQUIPEMENT {i + 1}</span>
              {equips.length > 1 && (
                <button onClick={() => removeEquip(i)} className="text-red-500 text-xs font-bold px-2 py-0.5 border border-red-800 rounded-lg">✕ Retirer</button>
              )}
            </div>
            <div className="mb-2">
              <label className={lbl}>⚠️ PROBLÈME</label>
              <textarea className={inp} rows={2} placeholder="ex: Friteuse #2 — température instable&#10;Aucun problème ce quart" value={eq.prob} onChange={e => setEquip(i, 'prob', e.target.value)} style={{ resize: 'vertical' }} />
            </div>
            <div>
              <label className={lbl}>🛠️ ACTION PRISE</label>
              <textarea className={inp} rows={2} placeholder="ex: Technicien contacté, ticket #1234..." value={eq.action} onChange={e => setEquip(i, 'action', e.target.value)} style={{ resize: 'vertical' }} />
            </div>
          </div>
        ))}
        {equips.length < 3 && (
          <button onClick={addEquip} className="w-full border-2 border-dashed border-[#333] rounded-xl py-3 text-gray-500 text-sm font-semibold hover:border-orange-500 hover:text-orange-400 transition-all">
            ➕ Ajouter un équipement
          </button>
        )}
      </div>

      {/* PHOTOS */}
      <div className="mx-4 mt-4 bg-[#141414] border border-[#222] rounded-xl p-4">
        <div className="text-orange-500 font-black text-xs font-mono tracking-widest mb-3">📸 PHOTOS / PIÈCES JOINTES</div>
        <input ref={fileRef} type="file" multiple accept="image/*" className="hidden" onChange={e => setPhotos(Array.from(e.target.files))} />
        <button onClick={() => fileRef.current.click()} className="w-full bg-[#1a1a1a] border-2 border-dashed border-[#333] rounded-xl py-4 text-gray-400 text-sm font-semibold hover:border-orange-500 hover:text-orange-400 transition-all">
          📎 Appuyez pour ajouter des photos
        </button>
        {photos.length > 0 && (
          <div className="mt-3 space-y-1">
            {photos.map((p, i) => (
              <div key={i} className="flex items-center justify-between bg-[#1f1f1f] rounded-lg px-3 py-2">
                <span className="text-sm text-gray-300">📷 {p.name}</span>
                <button onClick={() => setPhotos(photos.filter((_, j) => j !== i))} className="text-red-500 text-xs font-bold">✕</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SEND BUTTON */}
      <div className="mx-4 mt-5">
        <button
          onClick={handleSubmit}
          disabled={sending}
          style={{ background: sending ? '#555' : 'linear-gradient(135deg,#b91c1c,#ea580c)' }}
          className="w-full text-white rounded-xl py-5 font-black text-lg tracking-wide disabled:opacity-60 transition-all shadow-lg"
        >
          {sending ? '⏳ ENVOI EN COURS...' : '🚀 ENVOYER LE RAPPORT'}
        </button>
        {result && (
          <div className={`mt-3 rounded-xl px-4 py-3 text-sm font-semibold ${result.ok ? 'bg-green-900/40 border border-green-700 text-green-300' : 'bg-red-900/40 border border-red-700 text-red-300'}`}>
            {result.msg}
          </div>
        )}
      </div>

    </div>
  );
}
