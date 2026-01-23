import "../../styles/InspectionEntryForm.css";
import React, { Suspense } from 'react';
import AddIcon from '@mui/icons-material/Add';
import EditSquareIcon from '@mui/icons-material/EditSquare';
import DeleteIcon from '@mui/icons-material/Delete';

import { DataGrid } from '@mui/x-data-grid';
import { Button, Typography, IconButton, Card, CardContent, Breadcrumbs, Drawer } from '@mui/material';
import { Link } from "react-router-dom";
import { AccountTree } from "@mui/icons-material";
import { DataGridStyle } from "../../utilities/datagridStyle";
import { useDispatch } from "react-redux";
import { showSnackbar } from "../../redux/slices/snackbar";
import Loader from "../../components/loader";
import axiosInstance from '../../utilities/axiosInstance';
import { ConvertToDateTime } from "../../utilities/convertDate";

// import AddEditUsers from "./add-edit-user";
const AddEditUsers = React.lazy(() => import("./add-edit-users"));

const TableHeaderFormat = (props) => {
 
  return [
    { 
      field: 'id', headerName: 'ID', width: 80,
      renderCell: (params) => {
        return params.api.getRowIndexRelativeToVisibleRows(params.id) + 1 + (props.currentPage * props.pageSize);
      },  
    },
    { field: 'fullName', headerName: 'Full Name', width: 150 },
    { field: 'email', headerName: 'Email', width: 240 },
    { field: 'status', headerName: 'Status', width: 150 },

    { field: 'createdAt', headerName: 'Created At', width: 180, renderCell: (params) => ConvertToDateTime(params.value)},
    { field: 'updatedAt', headerName: 'Updated At', width: 180, renderCell: params => ConvertToDateTime(params.value)},
  ]
}


export default function Users() {
  const dispatch = useDispatch();
  const [open, setOpen] = React.useState(false)
  const [userList , setUsersList] = React.useState([])
  const [currentPage, setCurrentPage] = React.useState(0)
  const [pageSize, setPageSize] = React.useState(1)
  const [rowSelectionModel, setRowSelectionModel] = React.useState({ type: "include", ids: new Set() });
  const [selectedRows, setSelectedRows] = React.useState([])
  const [selectedUsers, setSelectedUsers] = React.useState(null)
  


  React.useEffect(() => {
    getUsersList();
  }, [])

  
  React.useEffect(() => {
    if(selectedRows.length === 1){
      const selected = userList.find(item => item._id === selectedRows[0])
      setSelectedUsers(selected)
    }
  }, [selectedRows])

  const getUsersList = async () => {
    try {
      const result = await axiosInstance.get(`/users`).then(res => res.data)
      console.log(result)
      if(result.status == 200) {
        setUsersList(result.data)
        // dispatch(showSnackbar({ message: result.message, severity: 'info', duration: 2000}));
      }
    } catch (error) {
      console.error(error)
    }
  }

  const deleteUsers = async () => {
    try {
      const result = await axiosInstance.put(`/prcss/removeall`, selectedRows).then(res => res.data)
      console.log(result)
      if(result.statuscode == 201) {
        getUsersList();
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
    getUsersList();
  }

  return (
    <section className="inspection-entry-form">
        
        <Drawer anchor={"right"} open={open} onClose={() => handleClose()} PaperProps={{ style: { width: 600 } }}> 
          <Suspense fallback={<Loader />}>
            <AddEditUsers user={selectedUsers} onClose={handleClose} /> 
          </Suspense>
        </Drawer>
 
        <Breadcrumbs aria-label="breadcrumb" style={{marginBottom: "1rem"}}>
          <Link underline="hover" color="inherit" href="/"> Masters </Link>
          <Typography sx={{ color: 'text.primary' }}>Users</Typography>
        </Breadcrumbs>

        <Typography className="title" color="primary">
            <AccountTree color="primary" style={{ fontSize: "3rem", margin: "-10px 0" }} /> Users
        </Typography>

        <div className="button-container">
            <Button variant="outlined" size="large" className="button-css" onClick={() => {
                setSelectedUsers(null)
                setSelectedRows([])
                setOpen(true)
            }}>
                Add New <AddIcon style={{ margin: "-1px 0 0 2px", fontSize: 17, fontWeight: 600 }} />
            </Button>
            <IconButton onClick={() => setOpen(true)}> <EditSquareIcon color={selectedRows.length === 1 ? "info" : "disabled"} /> </IconButton>
            <IconButton onClick={() => deleteUsers()}> <DeleteIcon color={!!selectedRows.length ? "error" : "disabled"} /> </IconButton>
            {/* {!!selectedRows.length && <IconButton onClick={() => deleteMaterials()}> <DeleteIcon color="error" /> </IconButton>} */}

        </div>
        
        <Card>
            <CardContent style={{ padding: "0px" }}>
                <DataGrid sx={DataGridStyle} rows={userList} columns={TableHeaderFormat({currentPage, pageSize})} getRowId={row => row._id}
                  pageSizeOptions={[5]} checkboxSelection disableRowSelectionOnClick
                  initialState={{ pagination: { paginationModel: { pageSize: 5, }, }, }} 
                  rowSelectionModel={rowSelectionModel}
                  onRowSelectionModelChange={event => {
                    // console.log(event)
                    setRowSelectionModel(event);
                    const ids = userList.map((row) => row._id);
                    const selectedIDs = ids.filter((id) => event.type == "include" ? [...event.ids].includes(id) : ![...event.ids].includes(id));
                    // console.log(selectedIDs)
                    setSelectedRows(selectedIDs)
                  }}
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
