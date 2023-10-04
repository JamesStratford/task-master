import React from 'react';
import { render, screen } from '@testing-library/react';
import { MultiplayerProvider, MultiplayerContext } from '../../../components/Kanban/Multiplayer/MultiplayerContext';

describe('MultiplayerContext', () => {
  it('should render MultiplayerProvider with multiplayer context', () => {
    render(
      <MultiplayerProvider>
        <MultiplayerContext.Consumer>
          {multiplayer => <div>{multiplayer ? 'Multiplayer is enabled' : 'Multiplayer is disabled'}</div>}
        </MultiplayerContext.Consumer>
      </MultiplayerProvider>
    );

    expect(screen.getByText('Multiplayer is enabled')).toBeInTheDocument();
  });
});