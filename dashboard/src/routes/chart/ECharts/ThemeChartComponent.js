import React from "react";
import ReactEcharts from "echarts-for-react";

import echarts from "echarts";

const ThemeChartComponent = () => {
  const option = {
    title: {
      text: "Theme",
      subtext: "From ExcelHome",
      sublink: "http://e.weibo.com/1341556070/Aj1J2x5a5"
    },
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow"
      }
    },
    legend: {
      data: ["may", "chicken"]
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true
    },
    xAxis: {
      type: "category",
      splitLine: { show: false },
      data: [
        "may",
        "be",
        "smiling",
        "not",
        "friendly",
        "chicken",
        "smiling",
        "not",
        "friendly",
        "chicken",
        "smiling",
        "not",
        "friendly",
        "chicken"
      ]
    },
    yAxis: {
      type: "value"
    },
    series: [
      {
        name: "Ben",
        type: "bar",
        stack: "purple",
        itemStyle: {
          normal: {
            barBorderColor: "rgba(0,0,0,0)",
            color: "rgba(0,0,0,0)"
          },
          emphasis: {
            barBorderColor: "rgba(0,0,0,0)",
            color: "rgba(0,0,0,0)"
          }
        },
        data: [0, 900, 1245, 1530, 1376, 1376, 1511, 1689, 1856, 1495, 1292]
      },
      {
        name: "frolic",
        type: "bar",
        stack: "purp",
        label: {
          normal: {
            show: true,
            position: "top"
          }
        },
        data: [900, 345, 393, "-", "-", 135, 178, 286, "-", "-", "-"]
      },
      {
        name: "pug",
        type: "bar",
        stack: "purp",
        label: {
          normal: {
            show: true,
            position: "bottom"
          }
        },
        data: ["-", "-", "-", 108, 154, "-", "-", "-", 119, 361, 203]
      }
    ]
  };

  echarts.registerTheme("my_theme", {
    backgroundColor: "#f4cccc"
  });

  let code =
    "echarts.registerTheme('my_theme', {\n" +
    "  backgroundColor: '#f4cccc'\n" +
    "});\n\n" +
    "<ReactEcharts \n" +
    "    option={this.getOtion()} \n" +
    "    theme='my_theme' />";
  return (
    <div className="examples">
      <div className="parent">
        <label>
          {" "}
          render a echart With <strong>theme</strong>, should{" "}
          <strong>echarts.registerTheme(themeName, themeObj)</strong> before
          use.
        </label>
        <ReactEcharts option={option} theme="my_theme" />
        <label>
          {" "}
          the theme object format:
          https://github.com/ecomfe/echarts/blob/master/theme/dark.js
        </label>
        <pre>
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
};

export default ThemeChartComponent;
