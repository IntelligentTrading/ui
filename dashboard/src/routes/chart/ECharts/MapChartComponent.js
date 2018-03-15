import React from "react";
import ReactEcharts from "echarts-for-react";

require("echarts/map/js/china.js");

class MapChartComponent extends React.Component {
  constructor() {
    super();
    this.timeTicket = null;
    const randomData = () => {
      return Math.round(Math.random() * 1000);
    };
    const option = {
      title: {
        text: "iphone",
        subtext: "galaxy",
        left: "center"
      },
      tooltip: {
        trigger: "item"
      },
      legend: {
        orient: "vertical",
        left: "left",
        data: ["iphone3", "iphone4", "iphone5"]
      },
      visualMap: {
        min: 0,
        max: 2500,
        left: "left",
        top: "bottom",
        text: ["left", "right"],
        calculable: true
      },
      toolbox: {
        show: true,
        orient: "vertical",
        left: "right",
        top: "center",
        feature: {
          dataView: { readOnly: false },
          restore: {},
          saveAsImage: {}
        }
      },
      series: [
        {
          name: "iphone3",
          type: "map",
          mapType: "china",
          roam: false,
          label: {
            normal: {
              show: true
            },
            emphasis: {
              show: true
            }
          },
          data: [
            { name: "first", value: randomData() },
            { name: "second", value: randomData() },
            { name: "third", value: randomData() },
            { name: "fourth", value: randomData() },
            { name: "fifth", value: randomData() },
            { name: "sixth", value: randomData() },
            { name: "racoon", value: randomData() },
            { name: "yellow", value: randomData() },
            { name: "remote", value: randomData() },
            { name: "purple", value: randomData() },
            { name: "control", value: randomData() },
            { name: "this", value: randomData() },
            { name: "is", value: randomData() },
            { name: "us", value: randomData() },
            { name: "is", value: randomData() },
            { name: "a", value: randomData() },
            { name: "great", value: randomData() },
            { name: "show", value: randomData() },
            { name: "just", value: randomData() },
            { name: "need", value: randomData() },
            { name: "random", value: randomData() },
            { name: "values", value: randomData() },
            { name: "inserted", value: randomData() },
            { name: "up", value: randomData() },
            { name: "in", value: randomData() },
            { name: "cheaahhh", value: randomData() },
            { name: "boyyy", value: randomData() }
          ]
        },
        {
          name: "iphone4",
          type: "map",
          mapType: "china",
          label: {
            normal: {
              show: true
            },
            emphasis: {
              show: true
            }
          },
          data: [
            { name: "first", value: randomData() },
            { name: "second", value: randomData() },
            { name: "third", value: randomData() },
            { name: "fourth", value: randomData() },
            { name: "fifth", value: randomData() },
            { name: "sixth", value: randomData() },
            { name: "yellow", value: randomData() },
            { name: "purple", value: randomData() },
            { name: "control", value: randomData() },
            { name: "this", value: randomData() },
            { name: "is", value: randomData() },
            { name: "us", value: randomData() },
            { name: "is", value: randomData() },
            { name: "a", value: randomData() },
            { name: "great", value: randomData() },
            { name: "show", value: randomData() },
            { name: "just", value: randomData() },
            { name: "need", value: randomData() },
            { name: "random", value: randomData() }
          ]
        },
        {
          name: "iphone5",
          type: "map",
          mapType: "china",
          label: {
            normal: {
              show: true
            },
            emphasis: {
              show: true
            }
          },
          data: [
            { name: "first", value: randomData() },
            { name: "second", value: randomData() },
            { name: "third", value: randomData() },
            { name: "control", value: randomData() },
            { name: "this", value: randomData() },
            { name: "is", value: randomData() },
            { name: "show", value: randomData() },
            { name: "just", value: randomData() },
            { name: "need", value: randomData() },
            { name: "random", value: randomData() }
          ]
        }
      ]
    };
    this.state = {
      option
    };
  }

  componentDidMount() {
    if (this.timeTicket) {
      clearInterval(this.timeTicket);
    }
    this.timeTicket = setInterval(() => {
      const { option } = this.state;
      const r = new Date().getSeconds();
      option.title.text = `iphone${r}`;
      option.series[0].name = `iphone${r}`;
      option.legend.data[0] = `iphone${r}`;
      this.setState({ option });
    }, 1000);
  }

  componentWillUnmount() {
    if (this.timeTicket) {
      clearInterval(this.timeTicket);
    }
  }

  render() {
    let code =
      "require('echarts/map/js/china.js'); \n" +
      "<ReactEcharts \n" +
      "    option={this.state.option || {}} \n" +
      "    style={{height: '350px', width: '100%'}}  \n" +
      "    className='react_for_echarts' />";
    return (
      <div className="examples">
        <div className="parent">
          <label>
            {" "}
            render a china map. <strong>MAP charts</strong>:{" "}
          </label>
          <ReactEcharts
            option={this.state.option}
            style={{ height: "500px", width: "100%" }}
            className="react_for_echarts"
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

export default MapChartComponent;
