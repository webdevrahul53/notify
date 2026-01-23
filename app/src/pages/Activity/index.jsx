import "../../styles/InspectionEntryForm.css";
import React, { Suspense } from 'react';
import AddIcon from '@mui/icons-material/Add';
import EditSquareIcon from '@mui/icons-material/EditSquare';
import DeleteIcon from '@mui/icons-material/Delete';

import { DataGrid } from '@mui/x-data-grid';
import { Button, Typography, IconButton, Card, CardContent, Breadcrumbs, Drawer, Chip } from '@mui/material';
import { Link } from "react-router-dom";
import { AccountTree, PlaylistAdd } from "@mui/icons-material";
import { DataGridStyle } from "../../utilities/datagridStyle";
import { useDispatch } from "react-redux";
import { showSnackbar } from "../../redux/slices/snackbar";
import Loader from "../../components/loader";
import axiosInstance from '../../utilities/axiosInstance';
import { ConvertToDateTime } from "../../utilities/convertDate";

// import AddEditActivity from "./add-edit-activity";
const AddEditActivity = React.lazy(() => import("./add-edit-activity"));

const TableHeaderFormat = (props) => {
 
  return [
    { 
      field: 'id', headerName: 'ID', width: 80,
      renderCell: (params) => {
        return params.api.getRowIndexRelativeToVisibleRows(params.id) + 1 + (props.currentPage * props.pageSize);
      },  
    },
    { field: 'activityName', headerName: 'Activity Name', width: 150 },
    {
      field: "status", headerName: "Status", width: 100,
      renderCell: ({ value }) => {
        const color = value ? "success" : "warning";
        return <Chip size="small" label={value ? "Active" : "Inactive"} color={color} />;
      },
    },
    { field: 'createdAt', headerName: 'Created At', width: 180, renderCell: (params) => ConvertToDateTime(params.value)},
    { field: 'updatedAt', headerName: 'Updated At', width: 180, renderCell: params => ConvertToDateTime(params.value)},
  ]
}


export default function Activity() {
  const dispatch = useDispatch();
  const [open, setOpen] = React.useState(false)
  const [activityList , setActivityList] = React.useState([])
  const [currentPage, setCurrentPage] = React.useState(0)
  const [pageSize, setPageSize] = React.useState(1)
  const [rowSelectionModel, setRowSelectionModel] = React.useState({ type: "include", ids: new Set() });
  const [selectedRows, setSelectedRows] = React.useState([])
  const [selectedActivity, setSelectedActivity] = React.useState(null)
  


  React.useEffect(() => {
    getActivityList();
  }, [])

  
  React.useEffect(() => {
    if(selectedRows.length === 1){
      const selected = activityList.find(item => item._id === selectedRows[0])
      setSelectedActivity(selected)
    }
  }, [selectedRows])

  const getActivityList = async () => {
    try {
      const result = await axiosInstance.get(`/activity`).then(res => res.data)
      if(result.status == 200) {
        setActivityList(result.data)
        // dispatch(showSnackbar({ message: result.message, severity: 'info', duration: 2000}));
      }
    } catch (error) {
      console.error(error)
    }
  }

  const deleteActivity = async () => {
    try {
      const result = await axiosInstance.put(`/activity/delete`, selectedRows).then(res => res.data)
      console.log(result)
      if(result.status == 200) {
        getActivityList();
        dispatch(showSnackbar({ message: result.message, severity: 'warning', duration: 2000}));
      }else{
        dispatch(showSnackbar({ message: result.message, severity: 'error', duration: 2000}));
      }
    } catch (error) {
      console.log(error)
      dispatch(showSnackbar({ message: error.message, severity: 'error', duration: 2000}));
    }
  }

  const handleClose = () => {
    setOpen(false);
    setRowSelectionModel({ type: "include", ids: new Set() })
    setSelectedRows([])
    getActivityList();
  }

  return (
    <section className="inspection-entry-form">
        
        <Drawer anchor={"right"} open={open} onClose={() => handleClose()} PaperProps={{ style: { width: 600 } }}> 
          <Suspense fallback={<Loader />}>
            <AddEditActivity activity={selectedActivity} onClose={handleClose} /> 
          </Suspense>
        </Drawer>
 
        <Breadcrumbs aria-label="breadcrumb" style={{marginBottom: "1rem"}}>
          <Link underline="hover" color="inherit" href="/"> Masters </Link>
          <Typography sx={{ color: 'text.primary' }}>Activity</Typography>
        </Breadcrumbs>

        <Typography className="title" color="primary">
            <PlaylistAdd color="primary" style={{ fontSize: "3rem", margin: "-10px 0" }} /> Activity
        </Typography>

        <div className="button-container">
            <Button variant="outlined" size="large" className="button-css" onClick={() => {
                setSelectedActivity(null)
                setSelectedRows([])
                setOpen(true)
            }}>
                Add New <AddIcon style={{ margin: "-1px 0 0 2px", fontSize: 17, fontWeight: 600 }} />
            </Button>
            <IconButton onClick={() => setOpen(true)}> <EditSquareIcon color={selectedRows.length === 1 ? "info" : "disabled"} /> </IconButton>
            <IconButton onClick={() => deleteActivity()}> <DeleteIcon color={!!selectedRows.length ? "error" : "disabled"} /> </IconButton>
            {/* {!!selectedRows.length && <IconButton onClick={() => deleteMaterials()}> <DeleteIcon color="error" /> </IconButton>} */}

        </div>
        
        <Card>
            <CardContent style={{ padding: "0px" }}>
                <DataGrid sx={DataGridStyle} rows={activityList} columns={TableHeaderFormat({currentPage, pageSize})} getRowId={row => row._id}
                  pageSizeOptions={[5]} checkboxSelection disableRowSelectionOnClick
                  initialState={{ pagination: { paginationModel: { pageSize: 5, }, }, }} 
                  rowSelectionModel={rowSelectionModel}
                  onRowSelectionModelChange={event => {
                    // console.log(event)
                    setRowSelectionModel(event);
                    const ids = activityList.map((row) => row._id);
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
