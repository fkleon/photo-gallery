import React, {FC, useContext, useState } from "react";
import { styled } from '@mui/material/styles';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Menu from "@mui/material/Menu";
import MoreIcon from '@mui/icons-material/MoreVert';
import MenuItem from "@mui/material/MenuItem";
import Tooltip from "@mui/material/Tooltip";

const StyledButton = styled(IconButton)(({ theme }) => ({
    textTransform: "none",
    borderRadius: 9999,
    //borderRadius: theme.shape.borderRadius,
    fontSize: theme.typography.fontSize,
    fontFamily: theme.typography.fontFamily,
}));

interface ContextProps {
    isCollapsed: boolean;
}

// Create the selection context
const ToolbarContext = React.createContext<ContextProps>({
    isCollapsed: false,
});

interface ToolbarItemProps {
    icon: JSX.Element;
    title: React.ReactNode;
    tooltip: React.ReactNode;
    subMenu?: boolean;
    showTitle?: boolean;
    "aria-label"?: string;
    onClick: (event: React.MouseEvent<Element, MouseEvent>) => void;
}

const ToolbarItem: FC<ToolbarItemProps> = ({ icon, title, tooltip, subMenu, showTitle, "aria-label": ariaLabel, onClick }) => {
    const ctx = useContext(ToolbarContext);
    return ctx.isCollapsed ? (
        <Tooltip title={tooltip} enterDelay={300} placement="left" arrow>
            <MenuItem onClick={onClick} aria-label={ariaLabel}>
                <ListItemIcon>{icon}</ListItemIcon>
                <ListItemText>{title}</ListItemText>
                {subMenu && <ArrowRightIcon />}
            </MenuItem>
        </Tooltip>
    ):(
        <Tooltip title={tooltip} enterDelay={300}>
            <StyledButton onClick={onClick} aria-label={ariaLabel} color="inherit">
                {icon}
                {showTitle && <span style={{marginLeft: 4}}>{title}</span>}
                {subMenu && <ArrowDropDownIcon sx={{mr: -0.8}} />}
            </StyledButton>
        </Tooltip>
    );
}

interface ToolbarMenuProps {
    children?: React.ReactNode;
}

const ToolbarMenu: FC<ToolbarMenuProps> = ({ children }) => {
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

    const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleMobileMenuClose = () => {
        setAnchorEl(null);
    };

    return (<>
        {/* Collapsed menu for mobile */}
        <ToolbarContext.Provider value={{ isCollapsed: true }}>
            <Menu
                keepMounted
                anchorEl={anchorEl}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                open={Boolean(anchorEl)}
                onClose={handleMobileMenuClose}
            >
                {children}
            </Menu>
            <Box sx={{ display: { xs: 'flex', lg: 'none' } }}>
                <IconButton aria-label="show more"
                    aria-haspopup="true"
                    onClick={handleMobileMenuOpen}
                    color="inherit">
                    
                    <MoreIcon />
                </IconButton>
            </Box>
        </ToolbarContext.Provider>

        {/* Expanded toolbar for desktop */}
        <ToolbarContext.Provider value={{ isCollapsed: false }}>
            <Box sx={{ display: { xs: 'none', lg: 'flex' } }}>
                {children}
            </Box>
        </ToolbarContext.Provider>
    </>);
}

export {
    ToolbarMenu,
    ToolbarItem,
};
