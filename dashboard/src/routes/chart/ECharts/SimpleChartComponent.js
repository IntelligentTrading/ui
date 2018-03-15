import React from "react";
import ReactEcharts from "echarts-for-react";
import "./theme/macarons.js";

const SimpleChartComponent = () => {
  const option = {
    title: {
      text: "Buzz"
    },
    tooltip: {
      trigger: "axis"
    },
    legend: {
      data: ["may", "be", "smiling", "not", "friendly", "chicken"]
    },
    toolbox: {
      feature: {
        saveAsImage: {}
      }
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true
    },
    xAxis: [
      {
        type: "category",
        boundaryGap: false,
        data: ["may", "be", "smiling", "not", "friendly", "chicken"]
      }
    ],
    yAxis: [
      {
        type: "value"
      }
    ],
    series: [
      {
        name: "anger",
        type: "line",
        stack: "birds",
        areaStyle: { normal: {} },
        data: [120, 132, 101, 134, 90, 230, 210]
      },
      {
        name: "happy",
        type: "line",
        stack: "birds",
        areaStyle: { normal: {} },
        data: [220, 182, 191, 234, 290, 330, 310]
      },
      {
        name: "morning",
        type: "line",
        stack: "birds",
        areaStyle: { normal: {} },
        data: [150, 232, 201, 154, 190, 330, 410]
      }
    ]
  };
  let code =
    "<ReactEcharts \n" +
    "    option={this.getOtion()} \n" +
    "    style={{height: '350px', width: '100%'}}  \n" +
    "    className='react_for_echarts' />";
  return (
    <div className="examples">
      <div className="parent">
        <label>
          {" "}
          render a Simple echart With <strong>option and height</strong>:{" "}
        </label>
        <ReactEcharts
          option={option}
          style={{ height: "350px", width: "100%" }}
          className="react_for_echarts"
          theme="macarons"
        />
        <label> code below: </label>
        <pre>
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
};

export default SimpleChartComponent;
