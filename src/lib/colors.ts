export function generatePlayerColor(existingColors: string[]): string {
	function toHsl(hex: string): [number, number, number] {
		const n = parseInt(hex.slice(1), 16);
		const r = ((n >> 16) & 255) / 255;
		const g = ((n >> 8) & 255) / 255;
		const b = (n & 255) / 255;
		const max = Math.max(r, g, b), min = Math.min(r, g, b);
		const l = (max + min) / 2;
		const d = max - min;
		const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
		let h = 0;
		if (d !== 0) {
			if (max === r) h = ((g - b) / d + 6) % 6;
			else if (max === g) h = (b - r) / d + 2;
			else h = (r - g) / d + 4;
			h *= 60;
		}
		return [h, s, l];
	}
	function hslToHex(h: number, s: number, l: number): string {
		const c = (1 - Math.abs(2 * l - 1)) * s;
		const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
		const m = l - c / 2;
		let r = 0, g = 0, b = 0;
		if      (h < 60)  { r = c; g = x; b = 0; }
		else if (h < 120) { r = x; g = c; b = 0; }
		else if (h < 180) { r = 0; g = c; b = x; }
		else if (h < 240) { r = 0; g = x; b = c; }
		else if (h < 300) { r = x; g = 0; b = c; }
		else              { r = c; g = 0; b = x; }
		return '#' + [r, g, b].map((v) => Math.round((v + m) * 255).toString(16).padStart(2, '0')).join('');
	}
	// Circular hue distance on the 360° wheel
	function hueDist(a: number, b: number): number {
		const d = Math.abs(a - b) % 360;
		return d > 180 ? 360 - d : d;
	}

	const existingHues = existingColors.map((hex) => toHsl(hex)[0]);
	// S and L ranges derived from the existing hardcoded palette (S: 13–41%, L: 39–54%)
	// Pick the candidate hue with the largest minimum distance from all existing hues
	let bestH = Math.random() * 360, bestDist = 0;
	for (let i = 0; i < 50; i++) {
		const h = Math.random() * 360;
		const minDist = existingHues.length ? Math.min(...existingHues.map((eh) => hueDist(h, eh))) : 360;
		if (minDist > bestDist) { bestDist = minDist; bestH = h; }
		if (minDist >= 25) break;
	}
	const h = bestH;
	const s = (13 + Math.random() * 28) / 100;
	const l = (39 + Math.random() * 15) / 100;
	return hslToHex(h, s, l);
}

// Interpolates between blue (#5A7A9B) and orange (#B8864A) based on where
// `value` falls in the [min, max] range.
export function interpolateColor(value: number, min: number, max: number): string {
	const t = max > min ? (value - min) / (max - min) : 0;
	const r = Math.round(90 + t * 94);
	const g = Math.round(122 + t * 12);
	const b = Math.round(155 - t * 81);
	return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}
