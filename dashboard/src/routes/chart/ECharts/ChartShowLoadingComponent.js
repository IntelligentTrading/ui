import React from "react";
import ReactEcharts from "echarts-for-react";

class ChartShowLoadingComponent extends React.Component {
  constructor() {
    super();
    this._t = null;
    this.onChartReady = this.onChartReady.bind(this);
  }
  componentWillUnmount() {
    clearTimeout(this._t);
  }

  onChartReady(chart) {
    this._t = setTimeout(() => {
      chart.hideLoading();
    }, 3000);
  }

  render() {
    const getOtion = () => {
      const option = {
        title: {
          text: "Show Loading Component"
        },
        tooltip: {},
        legend: {
          data: ["Allocated Budget", "Actual Spending"]
        },
        radar: {
          indicator: [
            { name: "sales", max: 6500 },
            { name: "administration", max: 16000 },
            { name: "Information Techology", max: 30000 },
            { name: "Customer Support", max: 38000 },
            { name: "Development", max: 52000 },
            { name: "Marketing", max: 25000 }
          ]
        },
        series: [
          {
            name: "预算 vs （Budget vs spending",
            type: "radar",
            data: [
              {
                value: [4300, 10000, 28000, 35000, 50000, 19000],
                name: "Allocated Budget"
              },
              {
                value: [5000, 14000, 28000, 31000, 42000, 21000],
                name: "Actual Spending"
              }
            ]
          }
        ]
      };
      return option;
    };
    const getLoadingOption = () => {
      const option = {
        text: "Opt...",
        color: "#4413c2",
        textColor: "#270240",
        maskColor: "rgba(194, 88, 86, 0.3)",
        zlevel: 0
      };
      return option;
    };

    let code =
      "onChartReady: function(chart) {\n" +
      "  'chart.hideLoading();\n" +
      "}\n\n" +
      "<ReactEcharts \n" +
      "    option={this.getOtion()} \n" +
      "    onChartReady={this.onChartReady} \n" +
      "    loadingOption={this.getLoadingOption()} \n" +
      "    showLoading={true} />";

    return (
      <div className="examples">
        <div className="parent">
          <label>
            {" "}
            Chart loading With <strong> showLoading </strong>: (when chart
            ready, hide the loading mask.)
          </label>
          <ReactEcharts
            option={getOtion()}
            onChartReady={this.onChartReady}
            loadingOption={getLoadingOption()}
            showLoading
          />
          <label> code below: </label>
          <pre>
            <code>{code}</code>
          </pre>
        </div>
      </div>
    );
  }
}

export default ChartShowLoadingComponent;
