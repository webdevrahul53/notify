import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { Cake, CorporateFare, LocationOn, Storage, Today } from '@mui/icons-material';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import BadgeIcon from '@mui/icons-material/Badge';
import MemoryIcon from '@mui/icons-material/Memory';
import LabelImportantIcon from '@mui/icons-material/LabelImportant';
import HubIcon from '@mui/icons-material/Hub';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import FactoryIcon from '@mui/icons-material/Factory';
import BallotIcon from '@mui/icons-material/Ballot';
import DomainIcon from '@mui/icons-material/Domain';


export const SIDE_MENU = [
    { title: 'Birthday', icon: <Cake className='icn' />, path: '/birthday' },
    { title: 'Events', icon: <Today className='icn' />, path: '/events' },
    // {
    //   title: 'Process Mapping', icon: <Settings className='icn' />,
    //   children: [
    //     { title: 'PO GRN Mapping', icon: <AccountTreeIcon className='icn' />, path: '/account/type' }, // Another simple item
    //   ]
    // },
];


export const ADMIN_MENU = [
    {
      title: 'Activity',
      icon: <AdminPanelSettingsIcon className='icn' />,
      // className: 'menu-group',
      path: '/activity',
      children: []
    },
    {
      title: 'Admin Modules',
      icon: <AdminPanelSettingsIcon className='icn' />,
      className: 'menu-group',
      children: [
        { title: 'Function Master', icon: <AccountTreeIcon className='icn' />, path: '/account/type' },
        { title: 'Dynamic Approval', icon: <BadgeIcon className='icn' />, path: '/' },
        { title: 'Privelege Management', icon: <BadgeIcon className='icn' />, path: '/' },
        { title: 'State Master', icon: <LocationOn className='icn' />, path: '/admin/state' },
        { title: 'Company Master', icon: <CorporateFare className='icn' />, path: '/admin/company' },
        { title: 'Storage Location Master', icon: <Storage className='icn' />, path: '/admin/storage-location' },
      ],
    },
    {
      title: 'Account Setup',
      icon: <ManageAccountsIcon className='icn' />,
      className: 'menu-group',
      children: [
        { title: 'Type Master', icon: <AccountTreeIcon />, path: '/account/type' },
        { title: 'Category Master', icon: <BadgeIcon />, path: '/account/category' },
        // { title: 'Division Master', icon: <BadgeIcon />, path: '/account/division' },
        // { title: 'Organization Master', icon: <BadgeIcon />, path: '/' },
        // { title: 'Department Master', icon: <BadgeIcon />, path: '/' },
        // { title: 'Designation Master', icon: <BadgeIcon />, path: '/' },
      ],
    },
    {
      title: 'Process Setup',
      icon: <MemoryIcon className='icn' />,
      className: 'menu-group',
      children: [
        { title: 'Process Master', icon: <LabelImportantIcon className='icn' />, path: '/process' },
        { title: 'Phase Master', icon: <DomainIcon className='icn' />, path: '/process/phase' },
        { title: 'Load Route', icon: <AccountTreeIcon className='icn' />, path: '/process/load-route' },
        // { title: 'Doctype Master', icon: <DomainIcon className='icn' />, path: '/' },
        // { title: 'Filetype Master', icon: <DomainIcon className='icn' />, path: '/' },
      ],
    },
    {
      title: 'Item Setup',
      icon: <HubIcon className='icn' />,
      className: 'menu-group',
      children: [
        { title: 'Material Master', icon: <AcUnitIcon className='icn' />, path: '/item/material' },
        { title: 'Plant Master', icon: <FactoryIcon className='icn' />, path: '/item/plant' },
        { title: 'QC-Parameter Master', icon: <BallotIcon className='icn' />, path: '/' },
      ],
    },
    // { title: 'Help', icon: <HelpCenterIcon className='icn' />, path: '/' }, // Another simple item
  ];