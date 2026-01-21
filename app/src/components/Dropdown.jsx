import React, { useState, useRef, use } from 'react';
import {
  Menu,
  MenuItem,
  IconButton,
  Tooltip,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
} from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import { useSelector } from 'react-redux';

const DropdownMenu = ({ path, type, title, icon, menuItems }) => {
  const user = useSelector((state) => state.auth.user);
  // console.log(user)
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);
  const [submenuData, setSubmenuData] = useState({ children: [], anchor: null });
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const parentHoverRef = useRef(false);
  const submenuHoverRef = useRef(false);
  const timeoutRef = useRef(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSubmenuData({ children: [], anchor: null });
    setHoveredIndex(null);
  };

  const scheduleClose = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      if (!parentHoverRef.current && !submenuHoverRef.current) {
        handleClose();
      }
    }, 200); // Delay long enough to cross the gap
  };

  const handleParentEnter = (e, item, idx) => {
    parentHoverRef.current = true;
    const rect = e.currentTarget.getBoundingClientRect();
    setSubmenuData({
      children: item.children || [],
      anchor: {
        top: rect.top,
        left: rect.right,
      },
    });
    setHoveredIndex(idx);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  const handleParentLeave = () => {
    parentHoverRef.current = false;
    scheduleClose();
  };

  const handleSubmenuEnter = () => {
    submenuHoverRef.current = true;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  const handleSubmenuLeave = () => {
    submenuHoverRef.current = false;
    scheduleClose();
  };

  return (
    <div>
      {type === "sidebar" ? (<Link to={path || "#"}>
          <ListItemButton
            onClick={handleClick}
            selected={path ? location.pathname === path : Boolean(anchorEl) || Boolean(submenuData.children?.length)}
          >
            <ListItemIcon>{icon}</ListItemIcon>
            <ListItemText primary={title} />
          </ListItemButton>
        </Link>
      ) : (
        <IconButton
          size="small"
          id={`button-${title}`}
          onClick={handleClick}
          sx={{
            padding: 0,
            margin: "-3px 0 0 0",
            backgroundColor: 'transparent',
            '&:hover': { backgroundColor: 'transparent' },
          }}
        >
          {icon}
        </IconButton>
      )}
      {/* <Tooltip title={title} arrow>
      </Tooltip> */}

      {menuItems.length ? <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        MenuListProps={{ 'aria-labelledby': `button-${title}` }}
        sx={{ padding: 1 }}
        transformOrigin={
          type === "sidebar"
            ? { horizontal: 'left', vertical: 'bottom' }
            : { horizontal: 'right', vertical: 'top' }
        }
        anchorOrigin={
          type === "sidebar"
            ? { horizontal: 'right', vertical: 'bottom' }
            : { horizontal: 'right', vertical: 'bottom' }
        }
        disablePortal
      >
        {title === "Me" && (
          <MenuItem disabled>
            <div style={{ marginLeft: "10px" }}>
              <div>{user?.fullName}</div>
              <strong>{user?.email}</strong>
            </div>
          </MenuItem>
        )}

        {menuItems.map((item, idx) =>
          item.children && item.children?.length > 0 ? (
            <MenuItem
              key={idx}
              onMouseEnter={(e) => handleParentEnter(e, item, idx)}
              onMouseLeave={handleParentLeave}
              selected={hoveredIndex === idx}
              style={{
                minWidth: "240px",
                display: "flex",
                justifyContent: "space-between",
                gap: "15px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                {item.icon} {item.title}
              </div>
              <ArrowRightIcon fontSize="small" />
            </MenuItem>
          ) : (
            <Link key={idx} to={item.path || "#"} style={{ textDecoration: 'none' }}>
              <MenuItem
                style={{ minWidth: "240px", gap: "15px" }}
                onClick={() => {
                  item.onClick?.();
                  handleClose();
                }}
              >
                {item.icon} {item.title || item.title}
              </MenuItem>
            </Link>
          )
        )}
      </Menu> : <></>}

      {submenuData.children?.length > 0 && (
        <Paper
          elevation={4}
          onMouseEnter={handleSubmenuEnter}
          onMouseLeave={handleSubmenuLeave}
          style={{
            position: 'fixed',
            // top: (submenuData.anchor.top - (submenuData.children?.length * 36)) + (menuItems.length - (hoveredIndex)) * 36, // 36px = approx height of one MenuItem
            top: (submenuData.anchor.top - (submenuData.children?.length * 36)) + 36, // 36px = approx height of one MenuItem
            left: submenuData.anchor.left,
            zIndex: 1302,
            minWidth: 220,
          }}
        >
          {submenuData.children.map((subItem, subIdx) => (
            <Link key={subIdx} to={subItem.path || '#'} style={{ textDecoration: 'none' }}>
              <MenuItem
                onClick={() => {
                  subItem.onClick?.();
                  handleClose();
                }}
                style={{ display: 'flex', alignItems: 'center', gap: 10 }}
              >
                {subItem.icon} {subItem.title}
              </MenuItem>
            </Link>
          ))}
        </Paper>
      )}
    </div>
  );
};

export default DropdownMenu;
