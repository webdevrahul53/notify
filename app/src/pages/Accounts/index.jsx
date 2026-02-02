import "../../styles/InspectionEntryForm.css";
import React, { Suspense } from 'react';
import AddIcon from '@mui/icons-material/Add';
import EditSquareIcon from '@mui/icons-material/EditSquare';
import DeleteIcon from '@mui/icons-material/Delete';

import { DataGrid } from '@mui/x-data-grid';
import { Button, Typography, IconButton, Card, CardContent, Breadcrumbs, Drawer, Chip, TextField } from '@mui/material';
import { Link } from "react-router-dom";
import { AccountTree, Cake, CloudUpload } from "@mui/icons-material";
import { DataGridStyle } from "../../utilities/datagridStyle";
import { useDispatch } from "react-redux";
import { showSnackbar } from "../../redux/slices/snackbar";
import Loader from "../../components/loader";
import axiosInstance from '../../utilities/axiosInstance';
import { ConvertToDate, ConvertToDateTime } from "../../utilities/convertDate";
const BulkLinkDialog = React.lazy(() => import("./bulkLink"));

// import AddEditAccounts from "./add-edit-account";
const AddEditAccounts = React.lazy(() => import("./add-edit-account"));

const TableHeaderFormat = (props) => {
 
  return [
    { 
      field: 'id', headerName: 'ID', width: 50,
      renderCell: (params) => {
        return params.api.getRowIndexRelativeToVisibleRows(params.id) + 1 + (props.currentPage * props.pageSize);
      },  
    },
    { field: 'accountName', headerName: 'Account Name', width: 150 },
    { field: 'accountEmail', headerName: 'Email', width: 200 },
    { field: 'dateOfBirth', headerName: 'Date Of Birth', width: 120, renderCell: (params) => ConvertToDate(params.value)},

    { field: 'phoneNumber', headerName: 'Phone Number', width: 120 },
    
    {
      field: "daysLeftForBirthday", headerName: "Birthday", width: 120,
      renderCell: ({ value }) => {
        if (value === null || value === undefined) return "-";

        let color = "default";
        let label = `${value} days`;

        if (value === 0) {
          color = "success";
          label = "Today 🎉";
        } else if (value <= 7) {
          color = "warning";
        }

        return <Chip size="small" icon={<Cake />} label={label} color={color} sx={{ fontWeight: 600 }} />
      },
    },
    {
      field: "status", headerName: "Status", width: 100,
      renderCell: ({ value }) => {
        const color = value ? "success" : "warning";
        return <Chip size="small" label={value ? "Active" : "Inactive"} color={color} sx={{ borderRadius: "5px" }} />;
      },
    },

    { field: 'createdAt', headerName: 'Created At', width: 180, renderCell: (params) => ConvertToDateTime(params.value)},
    { field: 'updatedAt', headerName: 'Updated At', width: 180, renderCell: params => ConvertToDateTime(params.value)},
  ]
}


export default function Accounts() {
  const dispatch = useDispatch();
  const [open, setOpen] = React.useState(false)
  const [openDialog, setOpenDialog] = React.useState(false)
  const [accountList , setAccountsList] = React.useState([])
  const [rowSelectionModel, setRowSelectionModel] = React.useState({ type: "include", ids: new Set() });
  const [selectedRows, setSelectedRows] = React.useState([])
  const [selectedAccounts, setSelectedAccounts] = React.useState(null)
  const [searchText, setSearchText] = React.useState("")
  const [currentPage, setCurrentPage] = React.useState(0)
  const [pageSize, setPageSize] = React.useState(5)
  const [totalCount, setTotalCount] = React.useState(0);



  React.useEffect(() => {
    getAccountsList();
  }, [searchText, currentPage, pageSize])

  
  React.useEffect(() => {
    if(selectedRows.length === 1){
      const selected = accountList.find(item => item._id === selectedRows[0])
      setSelectedAccounts(selected)
    }
  }, [selectedRows])

  const getAccountsList = async () => {
    try {
      const result = await axiosInstance.get(`/account?page=${currentPage+1}&limit=${pageSize}&search=${searchText}`).then(res => res.data)
      if(result.status == 200) {
        setAccountsList(result.data)
        setTotalCount(result?.pagination?.total)
        // dispatch(showSnackbar({ message: result.message, severity: 'info', duration: 2000}));
      }
    } catch (error) {
      console.error(error)
    }
  }

  const deleteAccounts = async () => {
    try {
      const result = await axiosInstance.put(`/account/delete`, selectedRows).then(res => res.data)
      console.log(result)
      if(result.status == 200) {
        getAccountsList();
        dispatch(showSnackbar({ message: result.message, severity: 'warning', duration: 2000}));
      }else{
        dispatch(showSnackbar({ message: result.message, severity: 'error', duration: 2000}));
      }
    } catch (error) {
      dispatch(showSnackbar({ message: error.message, severity: 'error', duration: 2000}));
    }
  }

  const handleClose = () => {
    setOpen(false);
    setRowSelectionModel({ type: "include", ids: new Set() })
    setSelectedRows([])
    getAccountsList();
  }

  const handleCloseDialog = () => {
    setOpenDialog(false);
    getAccountsList();
  }

  return (
    <section className="inspection-entry-form">
        
        <React.Suspense fallback={<Loader />}>
          <BulkLinkDialog open={openDialog} handleClose={handleCloseDialog} />
        </React.Suspense>
        
        <Drawer anchor={"right"} open={open} onClose={() => handleClose()} PaperProps={{ style: { width: 600 } }}> 
          <Suspense fallback={<Loader />}>
            <AddEditAccounts account={selectedAccounts} onClose={handleClose} /> 
          </Suspense>
        </Drawer>
 
        <Breadcrumbs aria-label="breadcrumb" style={{marginBottom: "1rem"}}>
          <Link underline="hover" color="inherit" href="/"> Masters </Link>
          <Typography sx={{ color: 'text.primary' }}>Accounts</Typography>
        </Breadcrumbs>

        <Typography className="title" color="primary">
            <AccountTree color="primary" style={{ fontSize: "3rem", margin: "-10px 0" }} /> Accounts
        </Typography>

        <div className="button-container">
            <Button variant="outlined" size="large" className="button-css" onClick={() => {
                setSelectedAccounts(null)
                setSelectedRows([])
                setOpen(true)
            }}>
                Add New <AddIcon style={{ margin: "-1px 0 0 2px", fontSize: 17, fontWeight: 600 }} />
            </Button>
            <Button variant="contained" size="large" className="button-css" onClick={() => setOpenDialog(true)}>
                Bulk Upload <CloudUpload style={{ margin: "-2px 0 0 8px", fontSize: 17, fontWeight: 600 }} />
            </Button>
            <IconButton onClick={() => setOpen(true)}> <EditSquareIcon color={selectedRows.length === 1 ? "info" : "disabled"} /> </IconButton>
            <IconButton onClick={() => deleteAccounts()}> <DeleteIcon color={!!selectedRows.length ? "error" : "disabled"} /> </IconButton>
            {/* {!!selectedRows.length && <IconButton onClick={() => deleteMaterials()}> <DeleteIcon color="error" /> </IconButton>} */}

            <TextField variant="filled" label="Search" type="text" value={searchText}  style={{width: "300px", marginLeft: "auto"}}
              onChange={e => setSearchText(e.target.value)} />
        </div>
        
        <Card>
            <CardContent style={{ padding: "0px" }}>
                <DataGrid sx={DataGridStyle} rows={accountList} columns={TableHeaderFormat({currentPage, pageSize})} getRowId={row => row._id}
                  rowSelectionModel={rowSelectionModel} checkboxSelection disableRowSelectionOnClick
                  onRowSelectionModelChange={event => {
                    // console.log(event)
                    setRowSelectionModel(event);
                    const ids = accountList.map((row) => row._id);
                    const selectedIDs = ids.filter((id) => event.type == "include" ? [...event.ids].includes(id) : ![...event.ids].includes(id));
                    // console.log(selectedIDs)
                    setSelectedRows(selectedIDs)
                  }}
                  paginationMode="server" rowCount={totalCount}
                  pageSizeOptions={[5, 10, 15, 30]}
                  initialState={{ pagination: { paginationModel: { page: currentPage, pageSize, }, }, }}
                  onPaginationModelChange={(e) => {
                    setCurrentPage(e.page)
                    setPageSize(e.pageSize)
                  }}
                />
            </CardContent>
        </Card>
    </section>
  );
}
