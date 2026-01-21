import "../styles/Layout.css";
// import Logo from "/logo4.png";
import React, { Suspense } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import IconButton from '@mui/material/IconButton';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { Link, Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import Collapse from '@mui/material/Collapse';
import { AccountBox, Logout, Person, PlaylistAdd, Settings } from '@mui/icons-material';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { Avatar } from '@mui/material';
import DropdownMenu from './Dropdown';
import { ADMIN_MENU, SIDE_MENU } from "../utilities/menu";
import Loader from "./loader";
import { HiOutlineViewGrid } from "react-icons/hi";
import { Drawer, DrawerHeader } from "./Drawer";
import { logout } from "../redux/slices/auth";
import { showSnackbar } from "../redux/slices/snackbar";


const Header = React.lazy(() => import('./Header'));


export default function MiniDrawer() {
  const location = useLocation();
  const dispatch = useDispatch()
  const theme = useTheme();
  const [open, setOpen] = React.useState(true);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const userSymbol = user?.fullName?.split(" ")?.map(item => item[0])?.join("");
  const navigate = useNavigate()

  const [openMenu, setOpenMenu] = React.useState({});

  const toggleSubMenu = (menu) => {
    setOpenMenu((prev) => ({
      [menu]: !prev[menu] || false  // open clicked menu, close others
    }));
  };

  const handleLogout = async () => {
    dispatch(logout());
    dispatch(showSnackbar({ message: "Logged Out Successfully", severity: 'info', }));
    navigate('/login');
  }

  const handleAction = (text) => () => {
    if(text === 'Logout') {
      handleLogout()
    }
  };  
  
  const sessionMenuData = [
    { title: 'Profile', icon: <Avatar />, onClick: handleAction('Profile') }, // Another simple item
    // { title: 'Settings', icon: <Settings />, onClick: handleAction('Settings') }, // Another simple item
    { title: 'Logout', icon: <Logout />, onClick: handleAction('Logout') }, // Another simple item
  ];


  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
    setOpenMenu({});
  };
  

  return (
    <Box sx={{ display: 'flex' }}>
      {/* <CssBaseline /> */}
      {isAuthenticated && <>
        <div style={{ position: "fixed", left: 0, top: 0, width: "100%", zIndex: 100 }} >
            <Suspense fallback={<Loader />}> <Header /> </Suspense>
        </div>
        <Drawer className="sidebar-container" variant="permanent" open={open}>
          <DrawerHeader style={{padding: "0 15px"}} >
            {/* {open && <img className="logo" src={Logo} width={90} alt="" />} */}
            {open ? <IconButton onClick={handleDrawerClose}>
              {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
            </IconButton> : <IconButton onClick={handleDrawerOpen} style={{backgroundColor: 'darkslategrey', color: 'white', fontSize: '18px'}}>
              <HiOutlineViewGrid />
            </IconButton>}

          </DrawerHeader>
          {/* <Divider /> */}
          <List>
            {SIDE_MENU.map((item, index) => open ? (
              <React.Fragment key={index}>
                <Link to={item.children ? "#" : item.path}>
                  <ListItemButton selected={location.pathname === item.path} 
                  onClick={() => item.children ? toggleSubMenu(item.title) : null}>
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.title} />
                    {item.children ? (openMenu[item.title] ? <ExpandLess /> : <ExpandMore />) : null}
                  </ListItemButton>
                </Link>

                {item.children && (
                  <Collapse in={openMenu[item.title]} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                      {item.children.map((subItem) => (
                        <Link to={subItem.path}>
                          <ListItemButton key={subItem.title} sx={{ pl: 4 }} >
                            {/* <ListItemIcon>{subItem.icon}</ListItemIcon> */}
                            <ListItemText primary={subItem.title} />
                          </ListItemButton>
                        </Link>
                      ))}
                    </List>
                  </Collapse>
                )}
              </React.Fragment>
            ) : (
              <DropdownMenu key={index} type={"sidebar"} title={item.title} path={item.path} icon={item.icon} menuItems={item.children || []} />
            ))} 
          </List>
          <List className="sidebar-bottom" style={{marginTop: "auto", marginBottom: "1rem"}}>
            <Link to={"/activity"}>
              <ListItemButton sx={{pl: 2.8}}>
                <ListItemIcon style={{marginRight: "-6px", color: "black"}}> <PlaylistAdd /> </ListItemIcon>
                <ListItemText primary={"Activity"} />
              </ListItemButton>
            </Link>
            <Link to={"/accounts"}>
              <ListItemButton sx={{pl: 2.8}}>
                <ListItemIcon style={{marginRight: "-6px", color: "black"}}> <AccountBox /> </ListItemIcon>
                <ListItemText primary={"Accounts"} />
              </ListItemButton>
            </Link>
            <Link to={"/users"}>
              <ListItemButton sx={{pl: 2.8}}>
                <ListItemIcon style={{marginRight: "-6px", color: "black"}}> <Person /> </ListItemIcon>
                <ListItemText primary={"Users"} />
              </ListItemButton>
            </Link>
            {/* <DropdownMenu type={"sidebar"} title="Configuration" icon={<AdminPanelSettingsIcon className="icn" />} menuItems={ADMIN_MENU} /> */}
            <DropdownMenu type={"sidebar"} title="Me" icon={<Avatar sx={{ width: 50, height: 50 }}> <small style={{fontSize: "0.7rem"}}>{userSymbol}</small> </Avatar>} menuItems={sessionMenuData} />
          </List>

        </Drawer>
      </>}
      <div style={isAuthenticated ? { marginTop: "3rem", flexGrow: 1, overflowX: "auto" } : {}} >
        <Outlet /> 
      </div>
    </Box>
  );
}

