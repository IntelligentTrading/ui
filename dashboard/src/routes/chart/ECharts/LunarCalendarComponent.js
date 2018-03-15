import React from "react";
import ReactEcharts from "echarts-for-react";
import echarts from "echarts";

const LunarCalendarComponent = () => {
  const getOtion = () => {
    let dateList = [
      ["2017-1-14", "other"],
      ["2017-1-15", "yellow"],
      ["2017-1-16", "green"],
      ["2017-1-17", "red"],
      ["2017-1-18", "purple"],
      ["2017-1-19", "news"],
      ["2017-1-21", "sterling"],
      ["2017-1-22", "love"],
      ["2017-1-23", "black panther"],
      ["2017-1-24", "pokemon"],
      ["2017-1-25", "warfare"],
      ["2017-1-26", "bahamas"],
      ["2017-1-27", "jamaica"],
      ["2017-1-28", "belle"],
      ["2017-1-29", "church"],
      ["2017-1-30", "bird"],
      ["2017-1-31", "milo"],
      ["2017-2-1", "thing"],
      ["2017-2-2", "yellow"],
      ["2017-2-4", "lebron"],
      ["2017-2-5", "francesco"],
      ["2017-2-6", "time"],
      ["2017-2-7", "working"],
      ["2017-2-8", "papa"],
      ["2017-2-9", "nick"],
      ["2017-2-10", "chicken"],
      ["2017-2-11", "cow"],
      ["2017-2-12", "beef"],
      ["2017-2-13", "other"],
      ["2017-2-14", "yellow"],
      ["2017-2-15", "green"],
      ["2017-2-16", "red"],
      ["2017-2-17", "purple"],
      ["2017-2-19", "queen"],
      ["2017-2-20", "sterling"],
      ["2017-2-21", "love"],
      ["2017-2-22", "black panther"],
      ["2017-2-23", "pokemon"],
      ["2017-2-24", "warfare"],
      ["2017-2-25", "bahamas"],
      ["2017-2-26", "migos"],
      ["2017-2-27", "church"],
      ["2017-2-28", "bird"],
      ["2017-3-1", "milo"],
      ["2017-3-2", "thing"],
      ["2017-3-3", "yellow"],
      ["2017-3-4", "music"],
      ["2017-3-6", "francesco"],
      ["2017-3-7", "time"],
      ["2017-3-8", "working"],
      ["2017-3-9", "papa"],
      ["2017-3-10", "nick"],
      ["2017-3-11", "chicken"],
      ["2017-3-12", "cow"],
      ["2017-3-13", "beef"],
      ["2017-3-14", "other"],
      ["2017-3-15", "yellow"],
      ["2017-3-16", "green"],
      ["2017-3-17", "red"],
      ["2017-3-18", "purple"],
      ["2017-3-19", "news"],
      ["2017-3-21", "sterling"],
      ["2017-3-22", "love"],
      ["2017-3-23", "black panther"],
      ["2017-3-24", "pokemon"],
      ["2017-3-25", "warfare"],
      ["2017-3-26", "bahamas"],
      ["2017-3-27", "jamaica"],
      ["2017-3-29", "church"],
      ["2017-3-30", "bird"],
      ["2017-3-31", "milo"],
      ["2017-4-1", "thing"],
      ["2017-4-2", "yellow"],
      ["2017-4-3", "music"],
      ["2017-5-10", "cow"],
      ["2017-5-11", "beef"],
      ["2017-5-12", "other"],
      ["2017-5-13", "yellow"],
      ["2017-5-14", "green"],
      ["2017-5-15", "red"],
      ["2017-5-16", "purple"],
      ["2017-5-17", "news"],
      ["2017-5-18", "queen"],
      ["2017-5-27", "church"],
      ["2017-5-28", "bird"],
      ["2017-5-29", "milo"],
      ["2017-5-30", "thing"],
      ["2017-5-31", "yellow"],
      ["2017-6-1", "music"],
      ["2017-6-7", "nick"],
      ["2017-6-8", "chicken"],
      ["2017-6-9", "cow"],
      ["2017-6-10", "beef"],
      ["2017-6-11", "other"],
      ["2017-6-12", "yellow"],
      ["2017-6-13", "green"],
      ["2017-6-23", "bahamas"],
      ["2017-6-25", "church"],
      ["2017-6-26", "bird"],
      ["2017-6-27", "milo"],
      ["2017-6-28", "thing"],
      ["2017-6-29", "yellow"],
      ["2017-6-30", "music"],
      ["2017-7-1", "lebron"],
      ["2017-7-2", "francesco"],
      ["2017-7-3", "time"],
      ["2017-7-4", "working"],
      ["2017-7-8", "cow"],
      ["2017-7-9", "beef"],
      ["2017-7-10", "other"],
      ["2017-7-11", "yellow"],
      ["2017-7-12", "green"],
      ["2017-7-13", "red"],
      ["2017-7-14", "purple"],
      ["2017-7-15", "news"],
      ["2017-7-16", "queen"],
      ["2017-7-17", "sterling"],
      ["2017-7-18", "love"],
      ["2017-7-19", "black panther"],
      ["2017-7-20", "pokemon"],
      ["2017-7-21", "warfare"],
      ["2017-7-24", "church"],
      ["2017-7-25", "bird"],
      ["2017-7-26", "milo"],
      ["2017-7-27", "thing"],
      ["2017-7-28", "yellow"],
      ["2017-7-29", "music"],
      ["2017-7-30", "lebron"],
      ["2017-7-31", "francesco"],
      ["2017-8-1", "time"],
      ["2017-8-2", "working"],
      ["2017-8-3", "papa"],
      ["2017-8-4", "nick"],
      ["2017-8-5", "chicken"],
      ["2017-8-6", "cow"],
      ["2017-8-8", "other"],
      ["2017-8-9", "yellow"],
      ["2017-8-10", "green"],
      ["2017-8-11", "red"],
      ["2017-8-12", "purple"],
      ["2017-8-13", "news"],
      ["2017-8-14", "queen"],
      ["2017-8-15", "sterling"],
      ["2017-8-16", "love"],
      ["2017-8-17", "black panther"],
      ["2017-8-18", "pokemon"],
      ["2017-8-19", "warfare"],
      ["2017-8-20", "bahamas"],
      ["2017-8-21", "jamaica"],
      ["2017-8-23", "church"],
      ["2017-8-24", "bird"],
      ["2017-8-25", "milo"],
      ["2017-8-26", "thing"],
      ["2017-8-27", "yellow"],
      ["2017-8-28", "music"],
      ["2017-8-29", "lebron"],
      ["2017-8-30", "francesco"],
      ["2017-8-31", "time"],
      ["2017-9-1", "working"],
      ["2017-9-2", "papa"],
      ["2017-9-3", "nick"],
      ["2017-9-4", "chicken"],
      ["2017-9-5", "cow"],
      ["2017-9-6", "beef"],
      ["2017-9-7", "other"],
      ["2017-9-8", "yellow"],
      ["2017-9-9", "green"],
      ["2017-9-10", "red"],
      ["2017-9-11", "purple"],
      ["2017-9-12", "news"],
      ["2017-9-13", "queen"],
      ["2017-9-14", "sterling"],
      ["2017-9-15", "love"],
      ["2017-9-16", "black panther"],
      ["2017-9-17", "pokemon"],
      ["2017-9-18", "warfare"],
      ["2017-9-19", "bahamas"],
      ["2017-9-21", "church"],
      ["2017-9-22", "bird"],
      ["2017-9-23", "milo"],
      ["2017-9-24", "thing"],
      ["2017-9-25", "yellow"],
      ["2017-9-26", "music"],
      ["2017-9-27", "lebron"],
      ["2017-9-28", "francesco"],
      ["2017-9-29", "time"],
      ["2017-9-30", "working"],
      ["2017-10-1", "papa"],
      ["2017-10-2", "nick"],
      ["2017-10-3", "chicken"],
      ["2017-10-4", "cow"],
      ["2017-10-5", "beef"],
      ["2017-10-6", "other"],
      ["2017-10-7", "yellow"],
      ["2017-10-8", "green"],
      ["2017-10-9", "red"],
      ["2017-10-10", "purple"],
      ["2017-10-11", "news"],
      ["2017-10-12", "queen"],
      ["2017-10-13", "sterling"],
      ["2017-10-14", "love"],
      ["2017-10-15", "black panther"],
      ["2017-10-16", "pokemon"],
      ["2017-10-17", "warfare"],
      ["2017-10-18", "bahamas"],
      ["2017-10-19", "jamaica"],
      ["2017-10-21", "church"],
      ["2017-10-22", "bird"],
      ["2017-10-23", "milo"],
      ["2017-10-24", "thing"],
      ["2017-10-25", "yellow"],
      ["2017-10-26", "music"],
      ["2017-10-27", "lebron"],
      ["2017-10-28", "francesco"],
      ["2017-10-29", "time"],
      ["2017-10-30", "working"],
      ["2017-10-31", "papa"],
      ["2017-11-1", "nick"],
      ["2017-11-2", "chicken"],
      ["2017-11-3", "cow"],
      ["2017-11-4", "beef"],
      ["2017-11-5", "other"],
      ["2017-11-6", "yellow"],
      ["2017-11-7", "green"],
      ["2017-11-8", "red"],
      ["2017-11-9", "purple"],
      ["2017-11-10", "news"],
      ["2017-11-11", "queen"],
      ["2017-11-12", "sterling"],
      ["2017-11-13", "love"],
      ["2017-11-14", "black panther"],
      ["2017-11-15", "pokemon"],
      ["2017-11-16", "warfare"],
      ["2017-11-17", "bahamas"],
      ["2017-11-19", "church"],
      ["2017-11-20", "bird"],
      ["2017-11-21", "milo"],
      ["2017-11-22", "thing"],
      ["2017-11-23", "yellow"],
      ["2017-11-24", "music"],
      ["2017-11-25", "lebron"],
      ["2017-11-26", "francesco"],
      ["2017-11-27", "time"],
      ["2017-11-28", "working"],
      ["2017-11-29", "papa"],
      ["2017-11-30", "nick"],
      ["2017-12-1", "chicken"],
      ["2017-12-2", "cow"],
      ["2017-12-3", "beef"],
      ["2017-12-4", "other"],
      ["2017-12-5", "yellow"],
      ["2017-12-6", "green"],
      ["2017-12-7", "red"],
      ["2017-12-8", "purple"],
      ["2017-12-9", "news"],
      ["2017-12-10", "queen"],
      ["2017-12-11", "sterling"],
      ["2017-12-12", "love"],
      ["2017-12-13", "black panther"],
      ["2017-12-14", "pokemon"],
      ["2017-12-15", "warfare"],
      ["2017-12-16", "bahamas"],
      ["2017-12-17", "jamaica"],
      ["2017-12-18", "working月"],
      ["2017-12-19", "church"],
      ["2017-12-20", "bird"],
      ["2017-12-21", "milo"],
      ["2017-12-22", "thing"],
      ["2017-12-23", "yellow"],
      ["2017-12-24", "music"],
      ["2017-12-25", "lebron"],
      ["2017-12-26", "francesco"],
      ["2017-12-27", "time"],
      ["2017-12-28", "working"],
      ["2017-12-29", "papa"],
      ["2017-12-30", "nick"],
      ["2017-12-31", "chicken"]
    ];

    let heatmapData = [];
    let lunarData = [];
    for (let i = 0; i < dateList.length; i++) {
      heatmapData.push([dateList[i][0], Math.random() * 300]);
      lunarData.push([dateList[i][0], 1, dateList[i][1], dateList[i][2]]);
    }

    const option = {
      tooltip: {
        formatter(params) {
          return `降雨量: ${params.value[1].toFixed(2)}`;
        }
      },

      visualMap: {
        show: false,
        min: 0,
        max: 300,
        calculable: true,
        seriesIndex: [2],
        orient: "horizontal",
        left: "center",
        bottom: 20,
        inRange: {
          color: ["#e0ffff", "#006edd"],
          opacity: 0.3
        },
        controller: {
          inRange: {
            opacity: 0.5
          }
        }
      },

      calendar: [
        {
          left: "center",
          top: "middle",
          cellSize: [70, 70],
          yearLabel: { show: false },
          orient: "vertical",
          dayLabel: {
            firstDay: 1,
            nameMap: "cn"
          },
          monthLabel: {
            show: false
          },
          range: "2017-03"
        }
      ],

      series: [
        {
          type: "scatter",
          coordinateSystem: "calendar",
          symbolSize: 1,
          label: {
            normal: {
              show: true,
              formatter(params) {
                let d = echarts.number.parseDate(params.value[0]);
                return `${d.getDate()}\n\n${params.value[2]}\n\n`;
              },
              textStyle: {
                color: "#000"
              }
            }
          },
          data: lunarData
        },
        {
          type: "scatter",
          coordinateSystem: "calendar",
          symbolSize: 1,
          label: {
            normal: {
              show: true,
              formatter(params) {
                return `\n\n\n${params.value[3] || ""}`;
              },
              textStyle: {
                fontSize: 14,
                fontWeight: 700,
                color: "#a00"
              }
            }
          },
          data: lunarData
        },
        {
          name: "降雨量",
          type: "heatmap",
          coordinateSystem: "calendar",
          data: heatmapData
        }
      ]
    };
    return option;
  };

  return (
    <div className="examples">
      <div className="parent">
        <label> render a lunar calendar chart. </label>
        <ReactEcharts
          option={getOtion()}
          style={{ height: "500px", width: "100%" }}
          className="react_for_echarts"
        />
      </div>
    </div>
  );
};

export default LunarCalendarComponent;
