import LiveCursors from "@/components/cursor/LiveCursors";
import {useBroadcastEvent, useEventListener, useMyPresence, useOthers} from "@liveblocks/react";
import React, {useCallback, useEffect, useState} from "react";
import CursorChat from "@/components/cursor/CursorChat";
import {CursorMode, CursorState, Reaction, ReactionEvent} from "@/types/type";
import ReactionSelector from "@/components/reaction/ReactionButton";
import useInterval from "@/hooks/useInterval";
import FlyingReaction from "@/components/reaction/FlyingReaction";
import {ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger} from "@/components/ui/context-menu";
import {Comments} from "@/components/comments/Comments";
import {shortcuts} from "@/constants";

type Props = {
    canvasRef: React.MutableRefObject<HTMLCanvasElement | null>;
    undo: () => void;
    redo: () => void;
};

const Live = ({ canvasRef, undo, redo }: Props) => {
    const others = useOthers();
    const [{cursor}, updateMyPresence] = useMyPresence() as any;
    const broadcast = useBroadcastEvent();
    const [reactions, setReactions] = useState<Reaction[]>([]);
    const [cursorState, setCursorState] = useState<CursorState>({mode: CursorMode.Hidden});

    const setReaction = useCallback((reaction: string) => {
        setCursorState({mode: CursorMode.Reaction, reaction, isPressed: false});
    }, []);

    const handlePointerMove = useCallback((event: React.PointerEvent) => {
        event.preventDefault();

        if (cursor == null || cursorState.mode !== CursorMode.ReactionSelector) {
            const x = event.clientX - event.currentTarget.getBoundingClientRect().x;
            const y = event.clientY - event.currentTarget.getBoundingClientRect().y;

            updateMyPresence({cursor: {x, y}});
        }

    }, []);

    const handlePointerLeave = useCallback((event: React.PointerEvent) => {
        setCursorState({mode: CursorMode.Hidden});
        updateMyPresence({cursor: null, message: null});
    }, []);

    const handlePointerDown = useCallback((event: React.PointerEvent) => {
        const x = event.clientX - event.currentTarget.getBoundingClientRect().x;
        const y = event.clientY - event.currentTarget.getBoundingClientRect().y;

        updateMyPresence({cursor: {x, y}});

        setCursorState((state: CursorState) =>
            cursorState.mode === CursorMode.Reaction ? {...state, isPressed: true} : state
        );
    }, [cursorState.mode, setCursorState]);

    const handlePointerUp = useCallback(() => {
        setCursorState((state: CursorState) =>
            cursorState.mode === CursorMode.Reaction ? {...state, isPressed: false} : state
        )
    }, [cursorState.mode, setCursorState])

    useEffect(() => {
        const onKeyUp = (e: KeyboardEvent) => {
            if (e.key === '/') {
                setCursorState({
                    mode: CursorMode.Chat,
                    previousMessage: null,
                    message: ''
                });
            } else if (e.key === 'Escape') {
                updateMyPresence({message: ''})
                setCursorState({mode: CursorMode.Hidden})
            } else if (e.key === 'e') {
                setCursorState({mode: CursorMode.ReactionSelector});
            }
        }

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === '/') {
                e.preventDefault();
            }
        }

        window.addEventListener("keyup", onKeyUp);
        window.addEventListener("keydown", onKeyDown);

        return () => {
            window.removeEventListener("keyup", onKeyUp);
            window.removeEventListener("keydown", onKeyDown);
        };
    }, [updateMyPresence]);

    useInterval(() => {
        setReactions((reactions) => reactions.filter((reaction) => reaction.timestamp > Date.now() - 4000));
    }, 1000);

    useInterval(() => {
        if (cursorState.mode === CursorMode.Reaction && cursorState.isPressed && cursor) {
            // concat all the reactions created on mouse click
            setReactions((reactions) =>
                reactions.concat([
                    {
                        point: { x: cursor.x, y: cursor.y },
                        value: cursorState.reaction,
                        timestamp: Date.now(),
                    },
                ])
            );

            // Broadcast the reaction to other users
            broadcast({
                x: cursor.x,
                y: cursor.y,
                value: cursorState.reaction,
            });
        }
    }, 100);

    useEventListener((eventData) => {
        const event = eventData.event as ReactionEvent;
        setReactions((reactions) =>
            reactions.concat([
                {
                    point: { x: event.x, y: event.y },
                    value: event.value,
                    timestamp: Date.now(),
                },
            ])
        );
    });

    // trigger respective actions when the user clicks on the right menu
    const handleContextMenuClick = useCallback((key: string) => {
        switch (key) {
            case "Chat":
                setCursorState({
                    mode: CursorMode.Chat,
                    previousMessage: null,
                    message: "",
                });
                break;

            case "Reactions":
                setCursorState({ mode: CursorMode.ReactionSelector });
                break;

            case "Undo":
                undo();
                break;

            case "Redo":
                redo();
                break;

            default:
                break;
        }
    }, []);

    return (
        <ContextMenu>
            <ContextMenuTrigger
                id="canvas"
                className="relative h-full w-full flex flex-1 justify-center items-center"
                style={{ cursor: cursorState.mode === CursorMode.Chat ? "none" : "auto" }}
                onPointerMove={handlePointerMove}
                onPointerLeave={handlePointerLeave}
                onPointerDown={handlePointerDown}
                onPointerUp={handlePointerUp}
            >
                <canvas ref={canvasRef} />

                {reactions.map((reaction) => (
                    <FlyingReaction
                        key={reaction.timestamp.toString()}
                        x={reaction.point.x}
                        y={reaction.point.y}
                        timestamp={reaction.timestamp}
                        value={reaction.value}
                    />
                ))}

                {cursor && (
                    <CursorChat
                        cursor={cursor}
                        cursorState={cursorState}
                        setCursorState={setCursorState}
                        updateMyPresence={updateMyPresence}
                    />
                )}

                {cursorState.mode == CursorMode.ReactionSelector && (
                    <ReactionSelector setReaction={(reaction) => {
                        setReaction(reaction);
                    }}/>
                )}

                <LiveCursors others={others}/>

                <Comments />
            </ContextMenuTrigger>

            <ContextMenuContent className="right-menu-content">
                {shortcuts.map((item) => (
                    <ContextMenuItem
                        key={item.key}
                        className="right-menu-item"
                        onClick={() => handleContextMenuClick(item.name)}
                    >
                        <p>{item.name}</p>
                        <p className="text-xs text-primary-grey-300">{item.shortcut}</p>
                    </ContextMenuItem>
                ))}
            </ContextMenuContent>
        </ContextMenu>
    )
}

export default Live;