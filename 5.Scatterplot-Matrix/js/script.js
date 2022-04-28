import { drawScatterplotMatrix as ScatterplotMatrix } from './scatterplotMatrix/drawScatterplotMatrix.js';

function drawScatterPlotMatrix() {
	var fileLocation = $("#file_list option:selected").val();
	d3.csv(fileLocation, function(error, data) {
		if (error) throw error;
		ScatterplotMatrix(data, "#scatterplot_matrix", 780, 'label');
	});
}

(function() {
	$("#file_list").change(function(){
		drawScatterPlotMatrix();
	});
	drawScatterPlotMatrix();
})();