import React from 'react';
import ReactDOM from 'react-dom/server';
import { Frondable, FrondRender, RenderMode } from '.';

interface ExampleProps { initialCount: number }

@Frondable()
class LocationSayer extends React.Component<{ place: string }, {}> {
  render() {
    return (
      <h3>You live, {this.props.place}!</h3>
    );
  }
}

@Frondable()
class NameSayer extends React.Component<{ name: string }, {}> {
  render() {
    return (
      <div>
        <h3>Hello, {this.props.name}!</h3>
        <LocationSayer place="Home" />
      </div>
    );
  }
}

@Frondable({ name: 'ExampleComponent' })
class ExampleComponent extends React.Component<ExampleProps, { count: number }> {
  state = { count: 0 }

  static getDerivedStateFromProps(props: ExampleProps) {
    return {
      count: props.initialCount,
    };
  }

  render() {
    return (
      <section>
        <h3>Counter: {this.state.count}</h3>
        <NameSayer name="James" />
      </section>
    );
  }
}

const exampleContent = (
  <div>
    <h1>Welcome to my amazing site!</h1>
    <ExampleComponent initialCount={4} />
    <NameSayer name="Chris" />
  </div>
);

console.log('Passthrough');
console.log('=====');
console.log(ReactDOM.renderToStaticMarkup(<FrondRender mode={RenderMode.Passthrough}>{exampleContent}</FrondRender>))

console.log('\n\nStatic');
console.log('=====');
console.log(ReactDOM.renderToStaticMarkup(<FrondRender mode={RenderMode.Static}>{exampleContent}</FrondRender>))

