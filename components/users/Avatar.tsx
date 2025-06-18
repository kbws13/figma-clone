import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip";
import Image from "next/image";

type Props = {
    name: string;
    otherStyle?: string;
}

const Avatar = ({name, otherStyle}: Props) => (
    <>
        <Tooltip>
            <TooltipTrigger>
                <div className={`relative h-9 w-9 rounded-full ${otherStyle}`} data-tooltip={name}>
                    <Image
                        src={`https://liveblocks.io/avatars/avatar-${Math.floor(Math.random() * 30)}.png`}
                        fill
                        className="rounded-full"
                        alt={name}
                    />
                </div>
            </TooltipTrigger>
            <TooltipContent className="border-none bg-primary-grey-200 px-2.5 py-1.5 text-xs">
                {name}
            </TooltipContent>
        </Tooltip>
    </>
);

export default Avatar;