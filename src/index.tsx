import React from 'react';
import ReactDOM from 'react-dom/server';

let hydroId = 1;

export enum RenderMode {
  Passthrough = 'passthrough',
  Static = 'static',
}

const { Consumer, Provider } = React.createContext({
  mode: RenderMode.Passthrough,
});
const FrondableDecendant = React.createContext(false);

export interface RenderRootProps {
  mode: RenderMode;
}

export const FrondRender: React.SFC<RenderRootProps> = ({ children, mode }) => (
  <Provider value={{ mode }}>{children}</Provider>
);

export interface FrondableOptions {
  name?: string;
  className?: string;
  container?(props: any): any;
  disableSSR?: boolean;
  providers?: any[];
}

export interface FrondProps {
  component: any;
  props: any;
  options: FrondableOptions;
}

const DefaultContainer = ({ children = null, ...props }) => (
  <div {...props}>{children}</div>
);

function getRenderedComponent(Component: any, props: any) {
  return ReactDOM.renderToString(
    <FrondableDecendant.Provider value={true}>
      <Component {...props} />
    </FrondableDecendant.Provider>,
  );
}

class Frond extends React.Component<FrondProps> {
  state = {
    hydroKey: hydroId++,
  };
  render() {
    return (
      <FrondableDecendant.Consumer>
        {(decendant) => (
          <Consumer>
            {({ mode }) => {
              const componentProps = this.props.props;
              const Component = this.props.component;
              const {
                container,
                className,
                name,
                disableSSR,
              } = this.props.options;
              const Container = container || DefaultContainer;

              if (mode === RenderMode.Passthrough || decendant) {
                return Container({
                  children: <Component {...componentProps} />,
                  className: `FrondRoot ${className || ''}`,
                  'data-component':
                    name !== null ? name : this.props.component.name,
                });
              }

              const componentMarkup = disableSSR
                ? ''
                : getRenderedComponent(Component, componentProps);

              let hydroKey: number | undefined = this.state.hydroKey;
              let hydroIdSpread: any = {};

              if (Object.keys(componentProps).length === 0) {
                hydroKey = undefined;
              } else {
                hydroIdSpread = { 'data-id': hydroKey };
              }

              let dataAc = `window.FRONDSTATE_${hydroKey} = ${JSON.stringify(
                componentProps,
              )};`;

              if (hydroKey === undefined) {
                dataAc = '';
              } else {
                dataAc = `<script type="text/javascript" id="hydroscript-${hydroKey}">${dataAc}${
                  this.context.client
                    ? `window.apolloPartials.push(${JSON.stringify(
                        this.context.client.extract(),
                      )})`
                    : ''
                }</script>`;
              }

              return Container({
                className: `FrondRoot ${className || ''}`,
                'data-component':
                  name !== null ? name : this.props.component.name,
                dangerouslySetInnerHTML: {
                  __html: `${componentMarkup}${dataAc}`,
                },
                ...hydroIdSpread,
              });
            }}
          </Consumer>
        )}
      </FrondableDecendant.Consumer>
    );
  }
}

export interface FrondableComponentProps {
  disableHydration?: boolean;
}

export function Frondable(options?: FrondableOptions) {
  return (Component: any) => {
    return ((props: any) => (
      <Frond options={options || {}} props={props} component={Component} />
    )) as any;
  };
}
