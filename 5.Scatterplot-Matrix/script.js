import { drawScatterplotMatrix as ScatterplotMatrix } from './drawScatterplotMatrix.js';

d3.csv("flowers.csv", function(error, data) {
	if (error) throw error;

	ScatterplotMatrix(data);
});