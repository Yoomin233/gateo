import * as React from 'react';

interface Props {
  should_render: boolean;
  children: any;
}

const should_render = (show: boolean) => {
  const showed = React.useRef(false);
  if (show) {
    showed.current = true;
  }
  return showed.current;
};

const RenderOnlyWhenNeeded = (prop: Props) => {
  const { should_render: show_render } = prop;
  const rendered = should_render(show_render);
  return rendered ? prop.children : null;
};

export default RenderOnlyWhenNeeded;
