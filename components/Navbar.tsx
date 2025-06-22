"use client"

import {ActiveElement, NavbarProps} from "@/types/type";
import Image from "next/image";
import {memo} from "react";
import ActiveUsers from "@/components/users/ActiveUsers";
import {navElements} from "@/constants";
import {NewThread} from "@/components/comments/NewThread";
import ShapesMenu from "@/components/SahpesMenu";
import {Button} from "@/components/ui/button";

const Navbar = ({activeElement, imageInputRef, handleImageUpload, handleActiveElement}: NavbarProps) => {

    const isActive = (value: string | Array<ActiveElement>) =>
        (activeElement && activeElement.value === value) ||
        (Array.isArray(value) && value.some((val) => val?.value === activeElement?.value));

    return (
        <nav className="flex select-none items-center justify-between gap-4 bg-primary-black px-5 text-white">
            <Image src="/assets/logo.svg" alt="" width={58} height={20}/>

            <ul className="flex flex-row"></ul>
            {navElements.map((item: ActiveElement | any) => (
                <li key={item.name}>
                    {Array.isArray(item.value) ? (
                        <ShapesMenu
                            item={item}
                            activeElement={activeElement}
                            imageInputRef={imageInputRef}
                            handleActiveElement={handleActiveElement}
                            handleImageUpload={handleImageUpload}/>
                    ) : item?.value === 'comments' ? (
                        <NewThread>
                            <Button className="relative w-5 h-5 object-contain">
                                <Image
                                    src={item.icon}
                                    alt={item.name}
                                    fill
                                    className={isActive(item.value) ? "invert" : ""}
                                />
                            </Button>
                        </NewThread>
                    ) : (
                        <Button className="relative w-5 h-5 object-contain">
                            <Image
                                src={item.icon}
                                alt={item.name}
                                fill
                                className={isActive(item.value) ? "invert" : ""}
                            />
                        </Button>
                    )}
                </li>
            ))}
            <ActiveUsers/>
        </nav>
    )
};

export default memo(Navbar, (prevProps, nextProps) => prevProps.activeElement === nextProps.activeElement);