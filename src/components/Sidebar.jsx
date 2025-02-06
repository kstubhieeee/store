import React from "react";
import {
    Card,
    Typography,
    List,
    ListItem,
    ListItemPrefix,
    Accordion,
    AccordionHeader,
    AccordionBody,
} from "@material-tailwind/react";
import {
    ShoppingBagIcon,
} from "@heroicons/react/24/solid";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";

export function Sidebar({ isOpen }) {
    const [open, setOpen] = React.useState(0);

    const handleOpen = (value) => {
        setOpen(open === value ? 0 : value);
    };

    return (
        <div className={`transition-all duration-300 ${isOpen ? 'w-72' : 'w-0'}`}>
            <Card className={`
                min-h-[calc(100vh-4rem)] 
                bg-gray-800 
                shadow-xl 
                shadow-blue-gray-900/5 
                rounded-none
                transition-all
                duration-300
                ${isOpen ? 'p-4 opacity-100' : 'p-0 opacity-0'}
            `}>
               
                <List className="px-0">
                    <Accordion
                        open={open === 2}
                        icon={
                            <ChevronDownIcon
                                strokeWidth={2.5}
                                className={`mx-auto h-4 w-4 transition-transform text-gray-400
                                    ${open === 2 ? "rotate-180" : ""}`}
                            />
                        }
                    >
                        <ListItem className="p-0" selected={open === 2}>
                            <AccordionHeader
                                onClick={() => handleOpen(2)}
                                className="border-b-0 p-3 hover:bg-gray-700 transition-colors"
                            >
                                <ListItemPrefix>
                                    <ShoppingBagIcon className="h-5 w-5 text-blue-400" />
                                </ListItemPrefix>
                                <Typography className="mr-auto font-medium text-gray-200">
                                    Products
                                </Typography>
                            </AccordionHeader>
                        </ListItem>
                        <AccordionBody className="py-1">
                            <List className="p-0">
                                <ListItem
                                    className="hover:bg-gray-700 transition-colors text-gray-300"
                                >
                                    <Link
                                        to="/add"
                                        className="w-full h-full block"
                                    >
                                        Add Products
                                    </Link>
                                </ListItem>
                                <ListItem
                                    className="hover:bg-gray-700 transition-colors text-gray-300"
                                >
                                    <Link
                                        to="/listing"
                                        className="w-full h-full block"
                                    >
                                        Listing of Products
                                    </Link>
                                </ListItem>
                            </List>
                        </AccordionBody>
                    </Accordion>
                </List>
            </Card>
        </div>
    );
}