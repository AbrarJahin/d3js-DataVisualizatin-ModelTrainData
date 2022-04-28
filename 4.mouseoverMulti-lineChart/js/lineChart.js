import { getAllLearningRate, drawLineChart } from "./lineChart/drawLineChart.js";

var htmlSelector = "#line_chart";
var csvLocation = "./data/lineData.csv";
var allData;

(function() { //OnLoad event
	d3.csv(csvLocation)
		.row(function(row) {
			return row;
		})
		.get(function(error, data) {
			$('#learning_rates_line').empty();
			$.each(getAllLearningRate(data), function (index,value) {
				console.log(index,value);
				$('#learning_rates_line').append(new Option(value, value));
			});

			allData = data;
			drawLineChart(allData, htmlSelector);
		});
	$("#learning_rates_line,#max_epoch_line").on('change input', function() {
		drawLineChart(allData, htmlSelector);
	});
})();