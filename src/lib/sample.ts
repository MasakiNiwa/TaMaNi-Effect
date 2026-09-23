import { createCanvas, get2d } from '../core/canvas';

/**
 * 「サンプルで試す」やエフェクト一覧のサムネイルに使う、手続き的に描いたイラスト。
 * 外部画像に依存しないので、ライセンスや読み込み失敗を気にしなくてよい。
 */
export function createSampleImage(size = 1000): HTMLCanvasElement {
  const w = size;
  const h = size;
  const c = createCanvas(w, h);
  const ctx = get2d(c);
  const u = size / 100;

  // 空
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, '#8ec5ff');
  sky.addColorStop(0.6, '#ffc3e1');
  sky.addColorStop(1, '#ffe9a8');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  // 丘
  ctx.fillStyle = '#7fd6a4';
  ctx.beginPath();
  ctx.moveTo(0, 78 * u);
  ctx.quadraticCurveTo(30 * u, 62 * u, 60 * u, 76 * u);
  ctx.quadraticCurveTo(82 * u, 86 * u, 100 * u, 72 * u);
  ctx.lineTo(100 * u, 100 * u);
  ctx.lineTo(0, 100 * u);
  ctx.fill();

  // キャラクター（まるい顔）
  const cx = 50 * u, cy = 50 * u, r = 26 * u;
  ctx.fillStyle = '#fff4e6';
  ctx.strokeStyle = '#4a3b6b';
  ctx.lineWidth = 1.6 * u;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 耳
  ctx.fillStyle = '#ffb36b';
  for (const s of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(cx + s * 12 * u, cy - 22 * u);
    ctx.lineTo(cx + s * 24 * u, cy - 36 * u);
    ctx.lineTo(cx + s * 25 * u, cy - 14 * u);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // 目
  ctx.fillStyle = '#4a3b6b';
  for (const s of [-1, 1]) {
    ctx.beginPath();
    ctx.ellipse(cx + s * 9 * u, cy - 2 * u, 2.6 * u, 3.6 * u, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#fff';
  for (const s of [-1, 1]) {
    ctx.beginPath();
    ctx.arc(cx + s * 9 * u + 0.9 * u, cy - 3.2 * u, 1 * u, 0, Math.PI * 2);
    ctx.fill();
  }
  // ほっぺ
  ctx.fillStyle = 'rgba(255,120,150,0.55)';
  for (const s of [-1, 1]) {
    ctx.beginPath();
    ctx.ellipse(cx + s * 15 * u, cy + 6 * u, 4 * u, 2.4 * u, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  // 口
  ctx.beginPath();
  ctx.arc(cx, cy + 5 * u, 3 * u, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();

  // 星
  ctx.fillStyle = '#fff7a8';
  for (const [x, y, s] of [[16, 18, 4], [82, 22, 5], [76, 48, 3], [22, 44, 2.5]]) {
    star(ctx, x * u, y * u, s * u);
  }
  return c;
}

function star(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
    const rr = i % 2 === 0 ? r : r * 0.45;
    ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
  }
  ctx.closePath();
  ctx.fill();
}
