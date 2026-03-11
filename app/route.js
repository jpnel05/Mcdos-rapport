import { Resend } from 'resend';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const formData = await req.formData();

    const leader   = formData.get('leader')   || '---';
    const manager  = formData.get('manager')  || '---';
    const shift    = formData.get('shift')    || '---';
    const date     = formData.get('date')     || '---';
    const email    = formData.get('email')    || '';
    const s_o = formData.get('s_o') || '---'; const s_r = formData.get('s_r') || '---';
    const f_o = formData.get('f_o') || '---'; const f_r = formData.get('f_r') || '---';
    const c_o = formData.get('c_o') || '---'; const c_r = formData.get('c_r') || '---';
    const r_o = formData.get('r_o') || '---'; const r_r = formData.get('r_r') || '---';
    const well    = formData.get('well')    || '---';
    const prob    = formData.get('prob')    || '---';
    const act     = formData.get('act')     || '---';
    const endorse = formData.get('endorse') || '---';
    const equipsRaw = formData.get('equips') || '[]';
    const equips = JSON.parse(equipsRaw);

    function status(key, o, r) {
      const ov = parseFloat(o), rv = parseFloat(r);
      if (isNaN(ov) || isNaN(rv)) return null;
      return key === 's' ? rv >= ov : rv <= ov;
    }

    const results = { s: status('s',s_o,s_r), f: status('f',f_o,f_r), c: status('c',c_o,c_r), r: status('r',r_o,r_r) };
    const achieved = Object.values(results).filter(v => v === true).length;
    const total    = Object.values(results).filter(v => v !== null).length;

    let scoreNote = total === 0 ? 'Aucun objectif saisi.'
      : achieved === total ? '🌟 Excellent quart! Tous les objectifs atteints!'
      : achieved >= total / 2 ? '💪 Bon quart! Quelques points à améliorer.'
      : '🔥 Continuez vos efforts!';

    function badge(val) {
      if (val === null) return `<span style="color:#888">---</span>`;
      if (val) return `<span style="background:#16a34a;color:#fff;padding:3px 12px;border-radius:20px;font-weight:700;font-size:12px">✅ ATTEINT</span>`;
      return `<span style="background:#dc2626;color:#fff;padding:3px 12px;border-radius:20px;font-weight:700;font-size:12px">❌ NON ATTEINT</span>`;
    }

    function fmt(val, unit) {
      if (!val || val === '---') return '---';
      if (unit === '$') return '$' + parseFloat(val).toLocaleString('fr-CA');
      return val + '%';
    }

    function fmtDate(d) {
      try { return new Date(d).toLocaleDateString('fr-CA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }); }
      catch (e) { return d; }
    }

    const now = new Date();
    const timeStr = now.toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' });
    const dateStr = fmtDate(date);

    // Build equipment rows
    const equipRows = equips.filter(e => e.prob || e.action).map((e, i) => `
      <tr style="background:${i % 2 === 0 ? '#fff7ed' : '#fff'}; border-bottom:1px solid #e5e7eb">
        <td style="padding:13px 16px; vertical-align:top">
          <div style="font-weight:700;font-size:13px;color:#c2410c">⚠️ Problème ${equips.filter(e=>e.prob||e.action).length > 1 ? i+1 : ''}</div>
          <div style="font-size:13px;color:#374151;margin-top:4px">${e.prob || '---'}</div>
        </td>
        <td style="padding:13px 16px; vertical-align:top">
          <div style="font-weight:700;font-size:13px;color:#374151">🛠️ Action Prise</div>
          <div style="font-size:13px;color:#374151;margin-top:4px">${e.action || '---'}</div>
        </td>
      </tr>`).join('');

    const equipSection = equipRows || `
      <tr style="background:#f9fafb">
        <td colspan="2" style="padding:13px 16px;font-size:13px;color:#6b7280;text-align:center">✅ Aucun problème signalé ce quart</td>
      </tr>`;

    // Handle photo attachments
    const attachments = [];
    const files = formData.getAll('photos');
    for (const file of files) {
      if (file && file.size > 0) {
        const buffer = await file.arrayBuffer();
        attachments.push({ filename: file.name, content: Buffer.from(buffer) });
      }
    }

    const html = `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:'Segoe UI',Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:20px 0">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.10)">

  <!-- HEADER -->
  <tr><td style="background:linear-gradient(135deg,#b91c1c,#ea580c);padding:32px 32px 24px;text-align:center">
    <div style="font-size:36px;margin-bottom:8px">🍔</div>
    <h1 style="color:#fff;font-size:24px;font-weight:900;margin:0;letter-spacing:1px">McDONALD'S ALMA</h1>
    <p style="color:rgba(255,255,255,0.85);font-size:15px;margin:6px 0 0;font-weight:600">RAPPORT DE QUART — ${shift.toUpperCase()}</p>
  </td></tr>

  <!-- QUART INFO -->
  <tr><td style="padding:24px 32px 0">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#fafafa;border-radius:10px;border:1px solid #e5e7eb;overflow:hidden">
      <tr style="border-bottom:1px solid #e5e7eb">
        <td style="padding:12px 16px;color:#6b7280;font-size:13px;width:45%">📅 Date du Quart</td>
        <td style="padding:12px 16px;color:#111;font-size:13px;font-weight:600">${dateStr}</td>
      </tr>
      <tr style="border-bottom:1px solid #e5e7eb">
        <td style="padding:12px 16px;color:#6b7280;font-size:13px">⏰ Quart</td>
        <td style="padding:12px 16px;color:#111;font-size:13px;font-weight:600">${shift}</td>
      </tr>
      <tr style="border-bottom:1px solid #e5e7eb">
        <td style="padding:12px 16px;color:#6b7280;font-size:13px">👤 Leader de Quart</td>
        <td style="padding:12px 16px;color:#111;font-size:13px;font-weight:600">${leader}</td>
      </tr>
      <tr>
        <td style="padding:12px 16px;color:#6b7280;font-size:13px">🏭 Gérant Production</td>
        <td style="padding:12px 16px;color:#111;font-size:13px;font-weight:600">${manager}</td>
      </tr>
    </table>
  </td></tr>

  <!-- PERFORMANCE TITLE -->
  <tr><td style="padding:24px 32px 12px">
    <h2 style="margin:0;font-size:16px;font-weight:800;color:#b91c1c;letter-spacing:1px;text-transform:uppercase;border-left:4px solid #b91c1c;padding-left:10px">📊 Performance du Quart</h2>
  </td></tr>

  <!-- PERFORMANCE TABLE -->
  <tr><td style="padding:0 32px">
    <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:10px;overflow:hidden;border:1px solid #e5e7eb">
      <tr style="background:#111">
        <th style="padding:11px 14px;text-align:left;color:#f97316;font-size:12px;font-weight:700;letter-spacing:1px">INDICATEUR</th>
        <th style="padding:11px 14px;text-align:center;color:#f97316;font-size:12px;font-weight:700;letter-spacing:1px">OBJECTIF</th>
        <th style="padding:11px 14px;text-align:center;color:#f97316;font-size:12px;font-weight:700;letter-spacing:1px">RÉEL</th>
        <th style="padding:11px 14px;text-align:center;color:#f97316;font-size:12px;font-weight:700;letter-spacing:1px">STATUT</th>
      </tr>
      <tr style="background:#fff;border-bottom:1px solid #f3f4f6">
        <td style="padding:13px 14px;font-size:14px;font-weight:600;color:#111">💰 Ventes ($)</td>
        <td style="padding:13px 14px;text-align:center;font-size:14px;color:#374151">${fmt(s_o,'$')}</td>
        <td style="padding:13px 14px;text-align:center;font-size:14px;font-weight:700;color:#111">${fmt(s_r,'$')}</td>
        <td style="padding:13px 14px;text-align:center">${badge(results.s)}</td>
      </tr>
      <tr style="background:#fafafa;border-bottom:1px solid #f3f4f6">
        <td style="padding:13px 14px;font-size:14px;font-weight:600;color:#111">⚡ FCFP (%)</td>
        <td style="padding:13px 14px;text-align:center;font-size:14px;color:#374151">${fmt(f_o,'%')}</td>
        <td style="padding:13px 14px;text-align:center;font-size:14px;font-weight:700;color:#111">${fmt(f_r,'%')}</td>
        <td style="padding:13px 14px;text-align:center">${badge(results.f)}</td>
      </tr>
      <tr style="background:#fff;border-bottom:1px solid #f3f4f6">
        <td style="padding:13px 14px;font-size:14px;font-weight:600;color:#111">📦 COA (%)</td>
        <td style="padding:13px 14px;text-align:center;font-size:14px;color:#374151">${fmt(c_o,'%')}</td>
        <td style="padding:13px 14px;text-align:center;font-size:14px;font-weight:700;color:#111">${fmt(c_r,'%')}</td>
        <td style="padding:13px 14px;text-align:center">${badge(results.c)}</td>
      </tr>
      <tr style="background:#fafafa">
        <td style="padding:13px 14px;font-size:14px;font-weight:600;color:#111">🚀 RAP (%)</td>
        <td style="padding:13px 14px;text-align:center;font-size:14px;color:#374151">${fmt(r_o,'%')}</td>
        <td style="padding:13px 14px;text-align:center;font-size:14px;font-weight:700;color:#111">${fmt(r_r,'%')}</td>
        <td style="padding:13px 14px;text-align:center">${badge(results.r)}</td>
      </tr>
    </table>
  </td></tr>

  <!-- SCORE -->
  <tr><td style="padding:16px 32px">
    <div style="background:#fef9f0;border:1px solid #fed7aa;border-radius:10px;padding:14px 18px">
      <div style="font-weight:800;font-size:15px;color:#111">🏆 SCORE FINAL : ${achieved} / ${total} objectifs atteints</div>
      <div style="font-size:13px;color:#6b7280;margin-top:4px">${scoreNote}</div>
    </div>
  </td></tr>

  <!-- ANALYSE TITLE -->
  <tr><td style="padding:8px 32px 12px">
    <h2 style="margin:0;font-size:16px;font-weight:800;color:#b91c1c;letter-spacing:1px;text-transform:uppercase;border-left:4px solid #b91c1c;padding-left:10px">🧠 Analyse du Quart</h2>
  </td></tr>

  <!-- ANALYSE TABLE -->
  <tr><td style="padding:0 32px">
    <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:10px;overflow:hidden;border:1px solid #e5e7eb">
      <tr style="background:#f0fdf4;border-bottom:1px solid #e5e7eb">
        <td style="padding:14px 16px;width:40%;vertical-align:top;font-weight:700;font-size:13px;color:#15803d">✅ Ce qui a bien fonctionné</td>
        <td style="padding:14px 16px;font-size:13px;color:#374151;vertical-align:top">${well}</td>
      </tr>
      <tr style="background:#fff9f0;border-bottom:1px solid #e5e7eb">
        <td style="padding:14px 16px;vertical-align:top;font-weight:700;font-size:13px;color:#d97706">⚠️ Problèmes / Opportunités</td>
        <td style="padding:14px 16px;font-size:13px;color:#374151;vertical-align:top">${prob}</td>
      </tr>
      <tr style="background:#eff6ff;border-bottom:1px solid #e5e7eb">
        <td style="padding:14px 16px;vertical-align:top;font-weight:700;font-size:13px;color:#1d4ed8">🎯 Actions Futures</td>
        <td style="padding:14px 16px;font-size:13px;color:#374151;vertical-align:top">${act}</td>
      </tr>
      <tr style="background:#fdf4ff">
        <td style="padding:14px 16px;vertical-align:top;font-weight:700;font-size:13px;color:#7e22ce">🏅 Points à Souligner</td>
        <td style="padding:14px 16px;font-size:13px;color:#374151;vertical-align:top">${endorse}</td>
      </tr>
    </table>
  </td></tr>

  <!-- EQUIPEMENT TITLE -->
  <tr><td style="padding:24px 32px 12px">
    <h2 style="margin:0;font-size:16px;font-weight:800;color:#b91c1c;letter-spacing:1px;text-transform:uppercase;border-left:4px solid #b91c1c;padding-left:10px">🔧 Équipement</h2>
  </td></tr>

  <!-- EQUIPEMENT TABLE -->
  <tr><td style="padding:0 32px 24px">
    <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:10px;overflow:hidden;border:1px solid #e5e7eb">
      ${equipSection}
    </table>
  </td></tr>

  <!-- FOOTER -->
  <tr><td style="background:linear-gradient(135deg,#b91c1c,#ea580c);padding:20px 32px;text-align:center">
    <p style="color:#fff;font-size:13px;margin:0;font-weight:600">📍 McDonald's Alma &nbsp;|&nbsp; 🕒 ${dateStr} — ${timeStr}</p>
    <p style="color:rgba(255,255,255,0.8);font-size:12px;margin:6px 0 0">⭐ Ensemble, nous faisons la différence!</p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;

    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: 'Rapport de Quart <onboarding@resend.dev>',
      to: [email],
      subject: `Rapport de Quart – McDonald's Alma | ${shift} | ${date}`,
      html,
      attachments,
    });

    return Response.json({ success: true });
  } catch (err) {
    console.error(err);
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}
