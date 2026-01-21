import "../../styles/InspectionEntryForm.css";
import React, { Suspense } from 'react';
import AddIcon from '@mui/icons-material/Add';
import EditSquareIcon from '@mui/icons-material/EditSquare';
import DeleteIcon from '@mui/icons-material/Delete';

import { DataGrid } from '@mui/x-data-grid';
import { Button, Typography, IconButton, Card, CardContent, Breadcrumbs, Drawer, LinearProgress, Menu, MenuItem } from '@mui/material';
import { Link, useNavigate } from "react-router-dom";
import { Assignment, CorporateFare } from "@mui/icons-material";
import { DataGridStyle } from "../../utilities/datagridStyle";
// import { useDispatch } from "react-redux";
import Loader from "../../components/loader";
import moment from "moment";
import axiosInstance from "../../utilities/axiosInstance";

const TableHeaderFormat = (props) => {
 
  return [
    { 
      field: 'id', headerName: 'ID', width: 40,
      renderCell: (params) => {
        return params.api.getRowIndexRelativeToVisibleRows(params.id) + 1 + (props.currentPage * props.pageSize);
      },  
    },
    { field: 'servicePo', headerName: 'Service PO', width: 120 },
    { field: 'qcMaterialCode', headerName: 'Material', width: 120 },
    { field: 'materialPo', headerName: 'Material PO', width: 120 },
    { field: 'qcProcessName', headerName: 'Process', width: 80 },
    { field: 'qcPhaseName', headerName: 'Phase', width: 100 },
    { field: 'qcRouteCode', headerName: 'Route', width: 80 },
    { field: 'sample', headerName: 'Sample', width: 100 },
    // { field: 'qcMpoVendor', headerName: 'Vendor', width: 120 },
    // { field: 'qcMpoPlant', headerName: 'Plant', width: 200 },
    // { field: 'location', headerName: 'Location', width: 200 },
    { field: 'status', headerName: 'Status', width: 80 },
    { field: 'createdAtITC', headerName: 'Created At', width: 180, renderCell: (params) => moment(params.value, 'DD-MM-YYYY hh:mm').format('DD-MM-YYYY hh:mm A')},
    { field: 'updatedAtITC', headerName: 'Updated At', width: 180, renderCell: params => moment(params.value, 'DD-MM-YYYY hh:mm').format('DD-MM-YYYY hh:mm A') },
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
  const [selectedQC, setSelectedQC] = React.useState(null)
  const [versionList, setVersionList] = React.useState([])
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
      setSelectedQC(selected)
      const versionList = Array.from({ length: selected?.version + 1}, (_, i) => i);
      setVersionList(versionList)
    }else {
      setSelectedQC(null)
      setVersionList([])
    }
  }, [selectedRows])


  const getEventsList = async () => {
    try {
      setLoading(true);
      const result = await axiosInstance.get(`/qc/fetch`).then(res => res.data)
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


  const handleEdit = (version = null) => {
    let url = `/inspection-entry-form?_id=${selectedQC?._id}&servicePo=${selectedQC?.servicePo}&qcMaterial=${selectedQC?.qcMaterial}&materialPo=${selectedQC?.materialPo}&qcProcess=${selectedQC?.qcProcess}&qcPhase=${selectedQC?.qcPhase}&qcRoute=${selectedQC?.qcRoute}&sample=${selectedQC?.sample}&version=${version != null ? version : selectedQC?.version}&currentVersion=${selectedQC?.version}`
    navigate(url)
  }

  return (
    <section className="inspection-entry-form">

        <Breadcrumbs aria-label="breadcrumb" style={{marginBottom: "1rem"}}>
          <Link to="/"> Notify </Link>
          <Typography sx={{ color: 'text.primary' }}>Events</Typography>
        </Breadcrumbs>

        <Typography className="title" color="primary">
            <CorporateFare color="primary" style={{ fontSize: "3rem", margin: "-10px 0" }} /> Events
        </Typography>
        

        <div className="button-container">
            <Button variant="outlined" size="large" className="button-css" component={Link} to={"form"}>
                Add New <AddIcon style={{ margin: "-1px 0 0 2px", fontSize: 17, fontWeight: 600 }} />
            </Button>
            <IconButton disabled={selectedRows.length !== 1} onClick={() => handleEdit()}> 
              <EditSquareIcon color={selectedRows.length == 1 ? "info" : "disabled"} /> 
            </IconButton>
            <IconButton disabled={selectedRows.length !== 1} onClick={handleClick}> 
              <Assignment color={selectedRows.length == 1 ? "info" : "disabled"} /> 
            </IconButton>
            <Menu id="basic-menu" anchorEl={anchorEl} open={open} onClose={handleClose} >
              {versionList?.map(e => <MenuItem onClick={() => handleEdit(e)}>Version {+e + 1} </MenuItem>)}
            </Menu>
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
