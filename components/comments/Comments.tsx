"use client";

import { ClientSideSuspense } from "@liveblocks/react";
import {CommentsOverlay} from "@/components/comments/CommentOverlay";


export const Comments = () => (
    <ClientSideSuspense fallback={null}>
        {() => <CommentsOverlay />}
    </ClientSideSuspense>
);
