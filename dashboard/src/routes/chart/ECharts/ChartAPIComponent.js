import React from "react";
import ReactEcharts from "echarts-for-react";

class ChartAPIComponent extends React.Component {
  render() {
    const option = {
      title: {
        text: "Text",
        subtext: "subtext"
      },
      tooltip: {
        trigger: "item",
        formatter: "{a} <br/>{b} : {c}%"
      },
      toolbox: {
        feature: {
          dataView: { readOnly: false },
          restore: {},
          saveAsImage: {}
        }
      },
      legend: {
        data: ["first", "second", "third", "fourth", "fifth"]
      },
      series: [
        {
          name: "S",
          type: "funnel",
          left: "10%",
          width: "80%",
          label: {
            normal: {
              formatter: "{b}"
            },
            emphasis: {
              position: "inside",
              formatter: "{b}: {c}%"
            }
          },
          labelLine: {
            normal: {
              show: false
            }
          },
          itemStyle: {
            normal: {
              opacity: 0.7
            }
          },
          data: [
            { value: 60, name: "first" },
            { value: 40, name: "second" },
            { value: 20, name: "third" },
            { value: 80, name: "fourth" },
            { value: 100, name: "fifth" }
          ]
        },
        {
          name: "Funnel",
          type: "funnel",
          left: "10%",
          width: "80%",
          maxSize: "80%",
          label: {
            normal: {
              position: "inside",
              formatter: "{c}%",
              textStyle: {
                color: "#fff"
              }
            },
            emphasis: {
              position: "inside",
              formatter: "{b}: {c}%"
            }
          },
          itemStyle: {
            normal: {
              opacity: 0.5,
              borderColor: "#fff",
              borderWidth: 2
            }
          },
          data: [
            { value: 30, name: "Val1" },
            { value: 10, name: "Val2" },
            { value: 5, name: "Val3" },
            { value: 50, name: "Val4" },
            { value: 80, name: "Val5" }
          ]
        }
      ]
    };

    let code =
      "<ReactEcharts ref={(e) => { this.echarts_react = e; }} \n" +
      "    option={this.getOtion()} /> \n" +
      "\n" +
      "// use echarts API: http://echarts.baidu.com/api.html#echartsInstance" +
      "this.echarts_react.getEchartsInstance().getDataURL();";
    return (
      <div className="examples">
        <div className="parent">
          <label>
            {" "}
            use echarts API With <strong> getEchartsInstance() </strong>: (the
            API will return the echarts instance, then you can use any API of
            echarts.)
          </label>
          <ReactEcharts
            ref={e => {
              this.echarts_react = e;
            }}
            option={option}
          />
          <label>
            {" "}
            code below: (echarts API list see:
            http://echarts.baidu.com/api.html#echartsInstance)
          </label>
          <pre>
            <code>{code}</code>
          </pre>
        </div>
      </div>
    );
  }
}

export default ChartAPIComponent;
