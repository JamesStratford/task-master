import React from 'react';
import { render, screen } from '@testing-library/react';
import { SocketContext } from '../../../components/Kanban/Multiplayer/SocketContext';
import { MultiplayerContext } from '../../../components/Kanban/Multiplayer/MultiplayerContext';
import Multiplayer from '../../../components/Kanban/Multiplayer/Multiplayer';

describe('Multiplayer', () => {
    it('should render cursors', () => {
        const userInfo = {
            discordId: '1154557917207470162',
            avatar: '',
            global_name: 'Test User'
        };

        const userInfoTwo = {
            discordId: '234545',
            avatar: '',
            global_name: 'Test User 3'
        };
        const cursors = [
            { id: '0', pos: { x: 100, y: 100, ...userInfo } },
            { id: '1', pos: { x: 200, y: 200, ...userInfoTwo } }
        ];
        const socket = {
            on: jest.fn(),
            off: jest.fn(),
        };

        render(
            <SocketContext.Provider value={socket}>
                <MultiplayerContext.Provider value={{ cursors, setCursors: jest.fn(), setRemoteDrags: jest.fn() }}>
                    <Multiplayer userInfo={userInfo} parentRef={{ current: document.createElement('div') }} />
                </MultiplayerContext.Provider>
            </SocketContext.Provider>
        );

        cursors.forEach(cursor => {
            const cursorImage = screen.getByAltText(`Cursor-${cursor.id}`);
            expect(cursorImage).toBeInTheDocument();
        });
    });
});