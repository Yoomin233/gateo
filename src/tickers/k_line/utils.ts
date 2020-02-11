import { KLineData } from 'types';

import { intervals } from './index';
import { get_minmax } from 'utils';

import F2 from '@antv/f2';

export const cal_latest_k_line = (
  latest_data: KLineData[],
  latest_price: number,
  interval: intervals
) => {
  const now = Date.now();
  let [last_record] = latest_data.slice(-1);
  /* new record should be added */
  if (now - last_record[0] > interval * 1000) {
    latest_data.shift();
    latest_data[latest_data.length] = [
      last_record[0] + interval * 1000,
      0,
      latest_price,
      latest_price,
      latest_price,
      latest_price
    ];
  } /* add to new existing record */ else {
    latest_data[latest_data.length - 1] = [
      last_record[0],
      0,
      latest_price,
      latest_price > last_record[3] ? latest_price : last_record[3],
      latest_price < last_record[4] ? latest_price : last_record[4],
      last_record[5]
    ];
  }
  // console.log(latest_data);
  return latest_data;
};

export const process_data = (data: KLineData[], interval: intervals) => {
  type chart_data = {
    range: [number, number, number, number];
    trend: 0 | 1;
    time: string;
  };
  const source: chart_data[] = [];

  /**
   * process data
   */
  data.forEach(obj => {
    source.push({
      range: [obj[5], obj[2], obj[3], obj[4]],
      trend: obj[5] <= obj[2] ? 0 : 1,
      time: get_time(obj[0])
    });
  });
  const max = get_minmax<chart_data>(source, k => k.range[2]);
  const min = get_minmax<chart_data>(source, k => k.range[3], true);
  return { source, min, max };
};

const get_time = (time: number) => {
  const date = new Date(time);
  return `${date.getMonth()}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}`;
};

/**
 * warn: 动态最高最低未实现
 * @param data
 * @param interval
 * @param id
 */
export const get_chart = (
  data: KLineData[],
  interval: intervals,
  id: string
) => {
  const { source, min, max } = process_data(data, interval);

  const chart = new F2.Chart({
    id,
    pixelRatio: window.devicePixelRatio,
    appendPadding: 0, // 不留空隙
    padding: [8, 'auto', 'auto', 'auto'],
    animate: false
  });

  chart.guide().tag({
    position: [max.time, max.range[2]],
    content: max.range[2],
    offsetY: 5,
    direct: 'bc',
    fontSize: 10,
  });

  chart.guide().tag({
    position: [min.time, min.range[3]],
    content: min.range[3],
    offsetY: -5,
    direct: 'tc',
    fontSize: 10,
  });

  // draw_guide(chart, max[3], '#F4333C');

  // draw_guide(chart, min[4], '#1CA93D', 'bottom');

  chart.source(source, {
    range: {
      tickCount: 5,
      formatter: function formatter(val) {
        return val.toFixed(2);
      }
    },
    time: {
      tickCount: 4
    }
  });
  chart.tooltip({
    showCrosshairs: true,
    showXTip: true,
    showYTip: true,
    crosshairsType: 'xy',
    custom: true,
    yTip: function yTip(val) {
      return {
        text: val.toFixed(2),
        fill: '#5d5b6a',
        fontSize: 10
      };
    },
    xTip: {
      fill: '#5d5b6a',
      fontSize: 10
    },
    xTipBackground: {
      fill: '#EDF2FE'
    },
    yTipBackground: {
      fill: '#EDF2FE'
    },
    crosshairsStyle: {
      stroke: '#0F8DE8'
    }
  });
  chart.axis('range', {
    grid: {
      stroke: '#ddd',
      lineWidth: 1,
      lineDash: null
    },
    label: {
      fill: '#5d5b6a'
    }
  });
  chart.axis('time', {
    label: function label(text, index, total) {
      const textCfg: any = {
        fill: '#5d5b6a'
      };
      if (index === 0) {
        textCfg.textAlign = 'left';
      }
      if (index === total - 1) {
        textCfg.textAlign = 'right';
      }
      return textCfg;
    },

    grid: {
      lineWidth: 1,
      stroke: '#ddd'
    }
  });

  chart
    .schema()
    .position('time*range')
    .color('trend', function(trend) {
      return ['#F4333C', '#1CA93D'][trend];
    })
    .shape('candle');
  chart.render();
  return chart;
};

export const draw_guide = (
  chart,
  price: number,
  color: string,
  align = 'top'
) => {
  const line = chart.guide().line({
    start: ['min', price],
    end: ['max', price],
    style: {
      lineDash: [8],
      stroke: color
    }
  });
  const text = chart.guide().text({
    position: ['min', price],
    content: `${price}`,
    style: {
      fill: color,
      textAlign: 'start',
      textBaseline: align,
      fontSize: 10
      // fontWeight: 'bold'
    },
    offsetX: 4,
    offsetY: align === 'top' ? 2 : -2
  });
  // chart.render();
  return { line, text };
};
