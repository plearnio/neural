//test mockup data, 40 days
var data = {
    close: hmproPrice,
    macd: [],
    signal: [] //signal line is 9 days EMA of MACD
};

//Calculate SMA
function calSMA(day, price){
    var stack = [], len, array = [];
    var value, i, j;
    for (j=0;j<price.length;j++) {
        cprice = price[j];
        stack.push(cprice);
        if (j < day-1){ //push null until time passed long enough
            array.push(null);
        }
        else{
            value = 0;
            for (i=0;i<day;i++){
                value += stack[i];
            }
            array.push(value/day);
            stack.shift(); //keep data in stack only equal to no. of days
        }
    }
    return array;
}

//Calculate EMA
function calEMA(day, price) {
    var multiplier = 2/(day+1);
    var initial = price.slice(0,day);
    var sma = calSMA(day, initial);
    var lastEMA = sma[day-1], array = [], i, ema;
    for (i=0;i<day-1;i++){
        array.push(null);
    }
    array.push(lastEMA); //first EMA is SMA
    for (i=day;i<price.length;i++){
        ema = ((price[i] - lastEMA) * multiplier) + lastEMA;
        array.push(ema);
        lastEMA = ema;
    }
    return array;
}

//Calculate MACD
function calMACD(short, long, price) {
    //MACD = EMA12 - EMA26 by default
    var emaShort = calEMA(short, price);
    var emaLong = calEMA(long, price);
    var len = price.length, i;
    var macd = [];
    for (i=0;i<len;i++){
        if (i<long-1){
            macd.push(null);
        }
        else{
            macd.push(emaShort[i] - emaLong[i]);
        }
    }
    return macd;

}

//Calculate Signal line
function calSignal(long, macd){
     var part2 = calEMA(9,macd.slice(25));
     var part1 = [], i;
     for (i=0;i<long-1;i++){
         part1.push(null);
     }
     return part1.concat(part2);
}

//Check crossing
function checkCrossing(line1, line2) {
    var len = line1.length, i;
    var result = [0]; //default start without crossing
    for (i=1;i<len;i++){
        if ((line1[i-1]<line2[i-1]) && (line1[i]>line2[i])){
            //line1 has crossed line2 in upward direction
            result.push(1);
        }
        else if ((line1[i-1]>line2[i-1]) && (line1[i]<line2[i])){
            //line1 has crossed line2 in downward direction
            result.push(-1);
        }
        else{
            //no crossing
            result.push(0);
        }
    }
    return result;
}

//data.sma3 = calSMA(3, data.close);
//data.ema3 = calEMA(3, data.close);
data.macd = calMACD(12,26,data.close);
data.signal = calSignal(26,data.macd);
console.log(data.macd);
console.log(data.signal);
//console.log(checkCrossing(data.macd , data.signal));
//var crossing = checkCrossing(data.sma3, data.ema3);

//calculate the signal line\

zingchart.render({
    id: 'tiChart_1',
    data: {
        type: 'mixed',
        "backgroundColor": "#fff",
		"plotarea": {
		        "margin": "50 20 100 20"
		      },
        legend: {},
        "scale-y":{
            "offset-start":"50%",
            guide:{
              "line-style":"dashdot"
            },
            item:{
              "font-size":10
            }
        },
        "scale-y-2":{
            placement:"default",
            blended:true,
            "offset-end":"50%",
            markers:[{
                type: "line",
                range: [0]
 	        }],
            guide:{
                "line-style":"dashdot"
            },
            item:{
                "font-size":10
            }
        },
        "scale-y-3": {
                "label": {

                },
                
                "multiplier": true,
                "decimals": 0
              },
            "scale-x":{
                "labels": hmproDate,
                "max-items": 8,
                "zooming": true,
                "zoom-snap": true,
                "lineColor": "#151515",
                "fontColor": "#333333",
                "tick": {
                  "lineColor": "#cccccc",
                  "line-width": "1px"
                },
                "guide": {
                  "line-width": "1px",
                  "line-color": "#ccc",
                  "line-style": "solid"
                },
                "item": {
                  "fontColor": "#333333"
                }
              },
        "crosshair-x": {
                "plot-label": {
                  "text": "%t: %v",
                  "decimals": 2,
                  "border-radius": "5px"
                }
              },
        series: [{
            type: 'line',
            scales: "scale-x,scale-y",
            values: data.close,
            text: "Close Price"
        }, {
            type: 'line',
            scales: "scale-x,scale-y-2",
            values: data.macd,
            text: "MACD",
        }, {
            type: 'line',
            scales: "scale-x,scale-y-2",
            values: data.signal,
            text: "Signal Line"
        }]
    },
    height:"100%"
});
