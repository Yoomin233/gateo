import * as React from 'react';
import { TickerDetailedInfo } from './tickers_manager';
import { KLineData } from 'types';
import { query_kline, http_query_k_line } from 'api';

import F2 from '@antv/f2';
import UBLogo from 'components/src/ub-logo';

const get_chart = (data: KLineData[], interval: number, id: string) => {
  const source = [];
  data.forEach(function(obj) {
    source.push({
      range: [Number(obj[5]), Number(obj[2]), Number(obj[3]), Number(obj[4])],
      trend: Number(obj[5]) <= Number(obj[2]) ? 0 : 1,
      time:
        interval < 3600
          ? new Date(Number(obj[0])).toLocaleTimeString()
          : new Date(Number(obj[0])).toLocaleString()
    });
  });
  const chart = new F2.Chart({
    id,
    pixelRatio: window.devicePixelRatio,
    appendPadding: 0, // 不留空隙
    padding: [8, 'auto', 'auto', 'auto']
  });

  chart.source(source, {
    range: {
      tickCount: 5,
      formatter: function formatter(val) {
        return val.toFixed(2);
      }
    },
    time: {
      tickCount: 3
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
      const textCfg = {
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

  chart.guide().rect({
    start: ['0%', '0%'],
    end: ['100%', '100%'],
    style: {
      stroke: '#ddd',
      lineWidth: 1,
      fill: '#fff',
      opacity: 1,
      fillOpacity: 0
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
};

interface Props {
  ticker: TickerDetailedInfo;
  expand: boolean;
}

type intervals = 60 | 600 | 3600 | 28800 | 86400;

let idx = 0;

const KLine = (prop: Props) => {
  const { ticker, expand } = prop;
  const [interval, set_interval] = React.useState<intervals>(60);
  const [loading, set_loading] = React.useState(false);

  const [datas, set_datas] = React.useState<
    {
      [key in intervals]?: KLineData[];
    }
  >({});

  const id_num = React.useRef(idx++);

  const get_k_line = () => {
    if (datas[interval])
      return get_chart(
        datas[interval],
        interval,
        `f2-container-${id_num.current}`
      );
    set_loading(true);
    http_query_k_line(`${ticker.ticker}_USDT`, interval, interval / 60).then(
      r => {
        if (r.result === 'true') {
          set_loading(false);
          // console.log(r.data);
          set_datas(datas => ({
            [interval]: r.data,
            ...datas
          }));
          requestAnimationFrame(() => {
            get_chart(r.data, interval, `f2-container-${id_num.current}`);
          });
        }
      }
    );
  };

  React.useEffect(() => {
    expand && get_k_line();
  }, [expand, interval]);
  const set_interval_func = (seconds: intervals) => () => set_interval(seconds);
  return (
    <div
      className='f-line-container'
      style={{
        display: expand ? 'block' : 'none'
      }}
    >
      <p className='flexSpread'>
        <span
          className={interval === 60 ? 'selected' : ''}
          onClick={set_interval_func(60)}
        >
          1m
        </span>
        <span
          className={interval === 60 * 10 ? 'selected' : ''}
          onClick={set_interval_func(600)}
        >
          10m
        </span>
        <span
          className={interval === 60 * 60 ? 'selected' : ''}
          onClick={set_interval_func(3600)}
        >
          1h
        </span>
        <span
          className={interval === 60 * 60 * 8 ? 'selected' : ''}
          onClick={set_interval_func(28800)}
        >
          8h
        </span>
        <span
          className={interval === 60 * 60 * 24 ? 'selected' : ''}
          onClick={set_interval_func(86400)}
        >
          1d
        </span>
      </p>
      {loading ? (
        <div>
          <UBLogo size='30'></UBLogo>
        </div>
      ) : (
        <canvas id={`f2-container-${id_num.current}`}></canvas>
      )}
    </div>
  );
};

export default KLine;
