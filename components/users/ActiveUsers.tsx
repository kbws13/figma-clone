"use client"

import {useOthers, useSelf} from "@liveblocks/react";
import {useMemo} from "react";
import Avatar from "@/components/users/Avatar";
import {generateRandomName} from "@/lib/utils";

const ActiveUsers = () => {
    const others = useOthers();

    const currentUser = useSelf();

    const memoizedUsers = useMemo(() => {
        const hasMoreUsers = others.length > 2;

        return (
            <div className="flex items-center justify-center gap-1">
                {currentUser && (
                    <Avatar name='You' otherStyle="border-[3px] border-primary-green" />
                )}

                {others.slice(0, 2).map(({connectionId}) => (
                    <Avatar key={connectionId} name={generateRandomName()} otherStyle="-ml-3" />
                ))}

                {hasMoreUsers && (
                    <div className='z-10 -ml-3 flex h-9 w-9 items-center justify-center rounded-full bg-primary-black'>
                        +{others.length - 2}
                    </div>
                )}
            </div>
        )
    }, [others.length]);

    return memoizedUsers;
}

export default ActiveUsers;