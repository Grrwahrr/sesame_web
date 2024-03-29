import {FC} from 'react';
import Link from "next/link";

export const ContentContainer: FC = props => {

    return (
        <div className="flex-1 drawer h-52">
            <input id="my-drawer" type="checkbox" className="grow drawer-toggle"/>
            <div className="flex flex-col items-center  drawer-content">
                {props.children}
            </div>

            {/* SideBar / Drawer */}
            <div className="drawer-side">
                <label htmlFor="my-drawer" className="drawer-overlay"></label>
                <ul className="p-4 overflow-y-auto menu w-80 bg-base-100">
                    <li>
                        <Link href="/">
                            <a>Home</a>
                        </Link>
                    </li>
                    <li>
                        <Link href="/docs">
                            <a>Documentation</a>
                        </Link>
                    </li>
                    <li>
                        <Link href="/admin">
                            <a>Manage Event</a>
                        </Link>
                    </li>
                </ul>
            </div>
        </div>
    );
};
