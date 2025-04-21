import {ScrollArea} from "radix-ui";
import { ReactElement } from "react";
import * as React from "react";
interface IScrollAreaComponentProps{
    children: ReactElement;
    className?: string;
}

export default function ScrollAreaComponent(props: IScrollAreaComponentProps){
    return(
        <ScrollArea.Root className={`h-full w-full ${props.className}`}>
		<ScrollArea.Viewport className="w-full h-full p-4">
            {props.children }
		</ScrollArea.Viewport>
        <ScrollArea.Scrollbar
			className="flex touch-none select-none bg-blackA3 p-0.5 transition-colors duration-[160ms] ease-out hover:bg-blackA5 data-[orientation=horizontal]:h-2.5 data-[orientation=vertical]:w-2.5 data-[orientation=horizontal]:flex-col"
			orientation="vertical"
		>
			<ScrollArea.Thumb className="flex-1 rounded-[10px] bg-mauve10" />
		</ScrollArea.Scrollbar>
		<ScrollArea.Corner className="bg-blackA5" />
	</ScrollArea.Root>
    )
}