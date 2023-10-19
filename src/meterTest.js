const data = [
  {
    domain: { x: [0, 1], y: [0, 1] },
    value: 0, 
    title: { text: "" },
    
    type: "indicator",
    mode: "gauge+number",
    gauge: { 
      axis: {  
        visible: true,
        range: [0, 50],
        dtick: 10
      },
      bar: { color: "#FFFFFF" },
      bordercolor: "#00000000"
    }
  }
];

const layout = { width: 300,
  height: 200,
  margin: { t: 25, b: 25, l: 25, r: 25 }};
Plotly.newPlot('container', data, layout,{displayModeBar: false});

let v = 0

setInterval(()=>{
  data[0].value = v
  Plotly.update('container', {'value':[v]}, layout)
  if(v>50){
    v=0
  }else{
    v++
  }
  // 値が400以上ならばバーの色を黄色に設定
  if (v >= 40) {
    data[0].gauge.bar.color = "#000000";
  } else {
    data[0].gauge.bar.color = "rgb(255,0,0)";
  }
},160)