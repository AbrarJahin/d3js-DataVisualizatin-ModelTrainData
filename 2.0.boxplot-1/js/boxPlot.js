/////////////////////////////////d3js v3

var csvLocation = "./data/classifier_train_2022-04-27_09-18-01.csv";	// Only 1 run - Best
// var csvLocation = "./data/classifier_train_2022-04-22_06-16-49.csv";	//Old 500 epoch data
// var csvLocation = "./data/classifier_train_2022-04-23_13-25-38.csv";	// 14 MB
// var csvLocation = "./data/train_summary_2022-04-23_13-25-38.csv";	//Summery - Old 500 epoch data

const VisualizationFlags = {
		ShowAll: "Show All",
		SkipError: "Dont Show Error",
		OnlyError: "Show Only Error"
	};
var violinChart;
var allData;
var lastOptiionSelected = "#box_plot";
var interval = null;

var violinChartSelector = "#distro_chart";
var chartWidth = 960;
var chartHeight = 360;

function getTitle(currentTitle) {
	return currentTitle;
}

function getFilteredData(data) {
	// return data;
	var epoch = -1;
	if($('#mergeAllEpoch').is(':checked')) {
		var epochFilterNeeded = false;
	}
	else {
		epoch = $('#chart_epoc_select').val();
		var epochFilterNeeded = true;
	}
	var learningRate = $('#chart_learning_rates').val();
	var showingFlags = $('#showing_options').find(":selected").text();
	var output = [];
	for(var key in data) {
		var rowEpoch = data[key].epoch;
		var rowLearningRate = data[key].learningRate;
		var propertiesNotToKeep = ['epoch', 'learningRate'];
		if(showingFlags==VisualizationFlags.OnlyError) {
			propertiesNotToKeep.push('trainAccuracy');
			propertiesNotToKeep.push('testAccuracy');
		}
		else if(showingFlags==VisualizationFlags.SkipError) {
			propertiesNotToKeep.push('loss');
		}
		if( (rowEpoch == epoch || !epochFilterNeeded) && rowLearningRate == learningRate) {
			Object.keys(data[key]).forEach((propName, index)=>{
				var value = data[key][propName];
				if(!propertiesNotToKeep.includes(propName)) {
					output.push({
						'prop':getTitle(propName),
						'value':value
					});
				}
			});
		}
	}
	return output;
}

function getMinMaxEpochNo(data) {
	var minVal = Number.MAX_VALUE;
	var maxVal = Number.MIN_VALUE;
	for(var key in data) {
		minVal = Math.min(minVal, data[key].epoch);
		maxVal = Math.max(maxVal, data[key].epoch);
	}
	return {
		'min': minVal,
		'max': maxVal
	}
}

function getAllLearningRates(data) {
	var learningRates = [];
	for(var key in data) {
		var epoch = data[key].epoch;
		var learningRate = data[key].learningRate;
		Object.keys(data[key]).forEach((propName, index)=>{
			//console.log(index, propName, data[key]);
			var value = data[key][propName];
		});
		learningRates.push(learningRate);
	}
	var uniqueList = learningRates.filter((v, i, a) => a.indexOf(v) === i);
	uniqueList.sort((a,b) => {
		return a === b ? 0 : a < b ? -1 : 1
	});
	return uniqueList;
}

function drawViolinPlot(passedData) {
	$('#chart_epoc_select_data').text($('#chart_epoc_select').val());
	var data = getFilteredData(passedData);
	data.forEach(function (d) {
		d.value = +d.value;
	});
	$(violinChartSelector).empty();
	violinChart = null;
	violinChart = makeDistroChart({
		data:data,
		xName:'prop',
		yName:'value',
		axisLabels: {
			xAxis: "Properties",
			yAxis: 'Values'
		},
		selector:violinChartSelector,
		chartSize:{
			height:chartHeight,
			width:chartWidth
		},
		constrainExtremes:true
	});
	violinChart.renderBoxPlot();
	violinChart.renderDataPlots();
	violinChart.renderNotchBoxes({
		showNotchBox:false
	});
	violinChart.renderViolinPlot({
		showViolinPlot:false
	});
	$(lastOptiionSelected).trigger("click");

	$(".chart-area").height($(".chart-area").height()+30);
}

function playAnimation(){
	stopAnimation();
	interval = setInterval(function() {
		var epochVal = $('#chart_epoc_select').val();
		$('#chart_epoc_select').val(parseInt(epochVal)+1);
		drawViolinPlot(allData);
		if(epochVal>500) {
			stopAnimation();
		}
	},100);
	return false;
}

function stopAnimation() {
	try {
		clearInterval(interval);
		interval = null; 
	}
	catch(err) {
		console.warn(err);
	}
	finally {
		return true;
	}
}

(function() {
	//OnClick events on Buttons
	$("#box_plot").on( "click", function() {
		lastOptiionSelected = "#box_plot";
		violinChart.violinPlots.hide();
		violinChart.boxPlots.show({
			reset:true
		});
		violinChart.notchBoxes.hide();
		violinChart.dataPlots.change({
			showPlot:false,
			showBeanLines:false
		});
	});

	$("#notched_box_plot").on( "click", function() {
		lastOptiionSelected = "#notched_box_plot";
		violinChart.violinPlots.hide();
		violinChart.notchBoxes.show({
			reset:true
		});
		violinChart.boxPlots.show({
			reset:true,
			showBox:false,
			showOutliers:true,
			boxWidth:20,
			scatterOutliers:true
		});
		violinChart.dataPlots.change({
			showPlot:false,
			showBeanLines:false
		});
	});

	$("#violin_plot_unbound").on( "click", function() {
		lastOptiionSelected = "#violin_plot_unbound";
		violinChart.violinPlots.show({
			reset:true,
			clamp:0
		});
		violinChart.boxPlots.show({
			reset:true,
			showWhiskers:false,
			showOutliers:false,
			boxWidth:10,
			lineWidth:15,
			colors:['#555']
		});
		violinChart.notchBoxes.hide();
		violinChart.dataPlots.change({
			showPlot:false,
			showBeanLines:false
		});
	});

	$("#violin_plot_clamp_to_data").on( "click", function() {
		lastOptiionSelected = "#violin_plot_clamp_to_data";
		violinChart.violinPlots.show({reset:true,clamp:1});
		violinChart.boxPlots.show({
			reset:true,
			showWhiskers:false,
			showOutliers:false,
			boxWidth:10,
			lineWidth:15,
			colors:['#555']
		});
		violinChart.notchBoxes.hide();
		violinChart.dataPlots.change({
			showPlot:false,
			showBeanLines:false
		});
	});

	$("#bean_plot").on("click", function() {
		lastOptiionSelected = "#bean_plot";
		violinChart.violinPlots.show({
			reset:true,
			width:75,
			clamp:0,
			resolution:30,
			bandwidth:50
		});
		violinChart.dataPlots.show({
			showBeanLines:true,
			beanWidth:15,
			showPlot:false,
			colors:['#555']
		});
		violinChart.boxPlots.hide();
		violinChart.notchBoxes.hide();
	});
	
	$("#beeswarm_plot").on("click", function() {
		lastOptiionSelected = "#beeswarm_plot";
		violinChart.violinPlots.hide();
		violinChart.dataPlots.show({
			showPlot:true,
			plotType:'beeswarm',
			showBeanLines:false,
			colors:null
		});
		violinChart.notchBoxes.hide();
		violinChart.boxPlots.hide();
	});

	$("#scatter_plot").on("click", function() {
		lastOptiionSelected = "#scatter_plot";
		violinChart.violinPlots.hide();
		violinChart.dataPlots.show({
			showPlot:true,
			plotType:40,
			showBeanLines:false,
			colors:null
		});
		violinChart.notchBoxes.hide();
		violinChart.boxPlots.hide();
	});

	$("#trend_lines").on("click", function() {
		lastOptiionSelected = "#trend_lines";
		if(violinChart.dataPlots.options.showLines)
		{
			violinChart.dataPlots.change({
				showLines:false
			});
		}
		else
		{
			violinChart.dataPlots.change({
				showLines:['median','quartile1','quartile3']
			});
		}
	});

	// Create Options of Selects
	var showingOptions = $('#showing_options');
	showingOptions.find('option').remove();
	$.each(VisualizationFlags, function(key, value) {
		$('<option>').val(key).text(value).appendTo(showingOptions);
	});

	// Read the data and compute summary statistics for each specie
	d3.csv(csvLocation)
		.row(function(row) {
			return row;
		})
		.get(function(error, data) {
			allData = data;
			var learningRates = getAllLearningRates(data);
			// Propagate all learning rates to the dropdown
			var learningRateSelect = $('#chart_learning_rates');
			learningRateSelect.find('option').remove();
			$.each(learningRates, function(key, value) {
				$('<option>').val(value).text(value).appendTo(learningRateSelect);
			});
			// Propagate the min and max range
			var epochNumber = getMinMaxEpochNo(data);
			$('#chart_epoc_select').prop('min',epochNumber.min).prop('max',epochNumber.max);
			// Filter data from here based on iteration and 
			drawViolinPlot(allData);
		});

	$('#chart_epoc_select,#chart_learning_rates,#showing_options').on('change input', function() {
		drawViolinPlot(allData);
	});

	$("#mergeAllEpoch").change(function() {
		drawViolinPlot(allData);
		if($('#mergeAllEpoch').is(':checked')){
			$("#chart_epoc_select").prop('disabled', true);
		}
		else {
			$("#chart_epoc_select").prop('disabled', false);
		}
	});

	$("#play_animation").click(function() {
		if(interval==null) {
			playAnimation();
			$('#play_animation').removeClass('btn-warning').addClass('btn-danger');
		}
		else {
			stopAnimation();
			$('#play_animation').removeClass('btn-danger').addClass('btn-warning');
		}
	});
})();