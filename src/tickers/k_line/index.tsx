import * as React from 'react';
import { TickerDetailedInfo } from '../tickers_manager';
import { KLineData } from 'types';
import { query_kline, http_query_k_line } from 'api';

import UBLogo from 'components/src/ub-logo';
// import { get_minmax } from 'utils';
import { AppContext } from 'App';

import {
  get_chart,
  draw_guide,
  cal_latest_k_line,
  process_data
} from './utils';

interface Props {
  ticker: TickerDetailedInfo;
  expand: boolean;
}

export type intervals = 60 | 600 | 3600 | 28800 | 86400;

let idx = 0;

const KLine = (prop: Props) => {
  const { ticker, expand } = prop;

  const { balance } = React.useContext(AppContext);

  const [interval, set_interval] = React.useState<intervals>(600);
  const [loading, set_loading] = React.useState(false);

  const chart_instance = React.useRef(null);
  const latest_price_guide_instance = React.useRef(null);
  const k_line_datas = React.useRef<KLineData[]>([]);

  // const [datas, set_datas] = React.useState<
  //   {
  //     [key in intervals]?: KLineData[];
  //   }
  // >({});

  const id_num = React.useRef(idx++);

  const get_k_line = async () => {
    set_loading(true);
    http_query_k_line(`${ticker.ticker}_USDT`, interval, interval / 60).then(
      r => {
        set_loading(false);
        k_line_datas.current = r;
        draw_chart(r);
      }
    );
  };

  const draw_chart = (data: KLineData[]) => {
    chart_instance.current = get_chart(
      data,
      interval,
      `f2-container-${id_num.current}`
    );
    const price = balance[ticker.ticker].price;
    latest_price_guide_instance.current = draw_guide(
      chart_instance.current,
      price,
      '#4398FF'
    );
    chart_instance.current.render();
    // }
  };

  React.useEffect(() => {
    if (expand) {
      // if (loading) set_loading(false);
      get_k_line();
      // clearInterval(timer.current);
      // timer.current = setInterval(get_k_line, interval * 1000);
    }
    // return () => clearInterval(timer.current);
  }, [expand, interval]);

  /**
   * 绘制最新价线条
   */
  React.useEffect(() => {
    if (!chart_instance.current) return;
    /**
     * repaint current price line
     */
    const price = balance[ticker.ticker].price;
    if (latest_price_guide_instance.current) {
      const { line, text } = latest_price_guide_instance.current;
      line.start = ['min', price];
      line.end = ['max', price];
      line.repaint();
      text.position = ['min', price];
      text.content = price;
      text.repaint();
    }
    const new_data = cal_latest_k_line(k_line_datas.current, price, interval);
    chart_instance.current.changeData(process_data(new_data, interval).source);
  }, [balance[ticker.ticker].price]);

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
