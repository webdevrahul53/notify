import "../../styles/InspectionEntryForm.css";
import React, { Suspense } from 'react';
import AddIcon from '@mui/icons-material/Add';
import EditSquareIcon from '@mui/icons-material/EditSquare';

import { DataGrid } from '@mui/x-data-grid';
import { Button, Typography, IconButton, Card, CardContent, Breadcrumbs, Drawer, LinearProgress, Menu, MenuItem, Chip } from '@mui/material';
import { Link, useNavigate } from "react-router-dom";
import { CorporateFare, Today } from "@mui/icons-material";
import { DataGridStyle } from "../../utilities/datagridStyle";
import axiosInstance from "../../utilities/axiosInstance";
import { ConvertToDate, ConvertToDateTime } from "../../utilities/convertDate";

const TableHeaderFormat = (props) => {
 
  return [
    { 
      field: 'id', headerName: 'ID', width: 40,
      renderCell: (params) => {
        return params.api.getRowIndexRelativeToVisibleRows(params.id) + 1 + (props.currentPage * props.pageSize);
      },  
    },
    { field: 'scheduleDate', headerName: 'Schedule Date', width: 120, renderCell: (params) => ConvertToDate(params.value) },
    // { field: 'accountName', headerName: 'Account', width: 120 },
    { field: 'activityName', headerName: 'Activity', width: 120 },
    { field: 'subject', headerName: 'Subject', width: 180 },
    { field: 'title', headerName: 'Title', width: 100 },
    { field: 'contentImage', headerName: 'Content', width: 80, renderCell: (params) => {
      
      return <img src={`${axiosInstance.defaults.baseURL}/event/image/${params.value}`} width={40} height={40} style={{borderRadius: "5px", margin: "5px"}} />
    } },
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


export default function Events() {
  // const dispatch = useDispatch();
  const navigate = useNavigate();

  const [eventsList , setEventsList] = React.useState([])
  const [currentPage, setCurrentPage] = React.useState(0)
  const [pageSize, setPageSize] = React.useState(1)
  const [loading, setLoading] = React.useState(false)
  const [rowSelectionModel, setRowSelectionModel] = React.useState({ type: "include", ids: new Set() });
  const [selectedRows, setSelectedRows] = React.useState([])
  const [selectedEvent, setSelectedEvent] = React.useState(null)
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };


  React.useEffect(() => {
    getEventsList();

    return () => {
      setRowSelectionModel({ type: "include", ids: new Set() })
      setSelectedRows([])
    }
  }, [])

  React.useEffect(() => {
    if(selectedRows.length === 1){
      const selected = eventsList.find(item => item._id === selectedRows[0])
      console.log(selected)
      setSelectedEvent(selected)
    }else {
      setSelectedEvent(null)
    }
  }, [selectedRows])


  const getEventsList = async () => {
    try {
      setLoading(true);
      const result = await axiosInstance.get(`/event`).then(res => res.data)
      setEventsList(result.data)
      setLoading(false);
      if(result.statuscode == 200) {
        // dispatch(showSnackbar({ message: result.message, severity: 'info', duration: 2000}));
      }
    } catch (error) {
      setLoading(false);
      console.error(error)
    }
  }


  return (
    <section className="inspection-entry-form">

        <Breadcrumbs aria-label="breadcrumb" style={{marginBottom: "1rem"}}>
          <Link to="/"> Notify </Link>
          <Typography sx={{ color: 'text.primary' }}>Events</Typography>
        </Breadcrumbs>

        <Typography className="title" color="primary">
            <Today color="primary" style={{ fontSize: "3rem", margin: "-10px 0" }} /> Events
        </Typography>
        

        <div className="button-container">
            <Button variant="outlined" size="large" className="button-css" component={Link} to={"form"}>
                Add New <AddIcon style={{ margin: "-1px 0 0 2px", fontSize: 17, fontWeight: 600 }} />
            </Button>
            <IconButton disabled={selectedRows.length !== 1} onClick={() => navigate(`form?_id=${selectedEvent?._id}`)}> 
              <EditSquareIcon color={selectedRows.length == 1 ? "info" : "disabled"} /> 
            </IconButton>
            {/* <IconButton> <DeleteIcon color="error" /> </IconButton> */}
        </div>
        
        <Card>
            <CardContent style={{ padding: "0px" }}>
                {loading && (<LinearProgress />)}
                <DataGrid sx={DataGridStyle} rows={eventsList} columns={TableHeaderFormat({currentPage, pageSize})} getRowId={row => row._id}
                  pageSizeOptions={[5, 10, 15]} checkboxSelection disableRowSelectionOnClick
                  initialState={{ pagination: { paginationModel: { pageSize: 15, }, }, }} 
                  rowSelectionModel={rowSelectionModel}
                  onRowSelectionModelChange={event => {
                    // console.log(event)
                    setRowSelectionModel(event);
                    const ids = eventsList.map((row) => row._id);
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
