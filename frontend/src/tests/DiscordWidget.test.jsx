import React from 'react';
import { render, cleanup, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { DiscordWidget, DiscordWidgetCrate } from '../components/DiscordWidget';

// Mocking the WidgetBot component
jest.mock('@widgetbot/react-embed', () => {
  return function DummyWidgetBot(props) {
    return <div data-testid="widgetbot">{JSON.stringify(props)}</div>;
  };
});

// Mocking window.Crate
global.Crate = jest.fn();

describe('DiscordWidget', () => {
  afterEach(cleanup);

  it('renders correctly', () => {
    const { getByTestId } = render(<DiscordWidget visible={true} server="serverID" channel="channelID" />);
    expect(screen.getByTestId('widgetbot')).toHaveTextContent('"server":"serverID","channel":"channelID"');
  });

  it('hides when visible is false', () => {
    const { queryByTestId } = render(<DiscordWidget visible={false} server="serverID" channel="channelID" />);
    expect(screen.queryByTestId('widgetbot').parentNode).toHaveStyle('display: none');
  });
});

describe('DiscordWidgetCrate', () => {
  afterEach(cleanup);

  it('loads the crate script', () => {
    render(<DiscordWidgetCrate server="serverID" channel="channelID" />);
    const script = document.querySelector(`script[src='https://cdn.jsdelivr.net/npm/@widgetbot/crate@3']`);
    expect(script).toBeInTheDocument();
  });

  it('cleans up on unmount', () => {
    const { unmount } = render(<DiscordWidgetCrate server="serverID" channel="channelID" />);
    unmount();
    const script = document.querySelector(`script[src='https://cdn.jsdelivr.net/npm/@widgetbot/crate@3']`);
    expect(script).not.toBeInTheDocument();
  });
});
