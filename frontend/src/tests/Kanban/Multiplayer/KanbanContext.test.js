import React from 'react';
import { render, screen } from '@testing-library/react';
import { KanbanProvider, KanbanContext } from '../../../components/Kanban/Multiplayer/KanbanContext';

describe('KanbanContext', () => {
  it('should render KanbanProvider with kanban context', () => {
    render(
      <KanbanProvider>
        <KanbanContext.Consumer>
          {kanban => <div>{kanban ? 'Kanban is enabled' : 'Kanban is disabled'}</div>}
        </KanbanContext.Consumer>
      </KanbanProvider>
    );

    expect(screen.getByText('Kanban is enabled')).toBeInTheDocument();
  });
});