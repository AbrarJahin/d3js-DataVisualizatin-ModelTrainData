import { drawWordCloudAnimation } from './wordCloud/wordCloud.js';

var csvLocation = "./data/csTerms.csv";


(function() { //OnLoad event
	d3.csv(csvLocation)
		.row(function(row) {
			return row.phrase;
		})
		.get(function(error, words) {
			var sentence = [words.join(" ")];
			drawWordCloudAnimation('#word-cloud', sentence, 600, 500);
		});

})();