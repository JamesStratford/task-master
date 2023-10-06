import React from 'react';
import { render, screen } from '@testing-library/react';
import { SocketProvider, SocketContext } from '../../../components/Kanban/Multiplayer/SocketContext';

describe('SocketContext', () => {
  it('should render SocketProvider with socket context', () => {
    render(
      <SocketProvider>
        <SocketContext.Consumer>
          {socket => <div>{socket ? 'Socket is connected' : 'Socket is not connected'}</div>}
        </SocketContext.Consumer>
      </SocketProvider>
    );

    expect(screen.getByText('Socket is connected')).toBeInTheDocument();
  });
});