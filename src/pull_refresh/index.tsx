import * as React from 'react';

import './index.less';
import UBLogo from 'components/src/ub-logo';

type touch_event = React.TouchEvent<HTMLDivElement>;

interface Props {
  fetch?: () => Promise<any>;
  fetch_on_init?: boolean;
}

const PullRefresh = (prop: React.PropsWithChildren<Props>) => {
  const { children, fetch, fetch_on_init } = prop;

  const ref = React.useRef<HTMLDivElement>();
  const pull_area_heigh = React.useRef(0);
  const start_y = React.useRef(0);

  const [distance_reached, set_distance_reached] = React.useState(false);
  const [pull_distance, set_pull_distance] = React.useState(0);
  const [fetching, set_fetching] = React.useState(!!fetch_on_init);

  React.useEffect(() => {
    pull_area_heigh.current = ref.current.clientHeight;
    fetch_on_init &&
      fetch().then(() => {
        document.scrollingElement.scrollTop = pull_area_heigh.current;
        set_fetching(false);
      });
    
  }, []);



  // const handle_touch_start = (e: touch_event) => {
  //   set_distance_reached(false);
  //   start_y.current = e.touches[0].clientY;
  // };
  // const handle_touch_move = (e: touch_event) => {
  //   const diff = e.touches[0].clientY - start_y.current;
  //   set_pull_distance(diff);
  //   if (diff >= pull_area_heigh.current) {
  //     set_distance_reached(true);
  //   } else {
  //     set_distance_reached(false);
  //   }
  // };
  // const handle_touch_end = (e: touch_event) => {
  //   set_pull_distance(0);
  //   if (distance_reached) {
  //     set_fetching(true);
  //     fetch().then(() => {
  //       set_fetching(false);
  //     });
  //   }
  // };
  return (
    <div
      className='pull-refresh-wrapper'
      // onTouchStart={handle_touch_start}
      // onTouchMove={handle_touch_move}
      // onTouchEnd={handle_touch_end}
      // onScroll={e => e.stopPropagation()}
      // ref={ref}
    >
      <div
        ref={ref}
        // style={{
        //   marginTop: fetching ? 0 : `calc(-4em + ${pull_distance}px)`,
        //   transition: pull_distance ? '' : 'all .3s linear'
        // }}
      >
        {/* {fetching ? (
          <span>
            <UBLogo size='0.8em'></UBLogo>&nbsp;加载中
          </span>
        ) : distance_reached ? (
          '放开刷新'
        ) : (
          '↓下拉以刷新'
        )} */}
      </div>
      {children}
    </div>
  );
};

export default PullRefresh;
