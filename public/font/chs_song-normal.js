import { jsPDF } from "jspdf"
var font = 'AAdfjsklfsl';
var callAddFont = function () {
	this.addFileToVFS('chs_song-normal.ttf', font);
	this.addFont('chs_song-normal.ttf', 'chs_song(# 自定义字体名称)', 'normal');
};
jsPDF.API.events.push(['addFonts', callAddFont])
