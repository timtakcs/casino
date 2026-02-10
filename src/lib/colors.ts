// Interpolates between blue (#5A7A9B) and orange (#B8864A) based on where
// `value` falls in the [min, max] range.
export function interpolateColor(value: number, min: number, max: number): string {
	const t = max > min ? (value - min) / (max - min) : 0;
	const r = Math.round(90 + t * 94);
	const g = Math.round(122 + t * 12);
	const b = Math.round(155 - t * 81);
	return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}
