import "../../styles/InspectionEntryForm.css";
import React, { Suspense } from 'react';
import AddIcon from '@mui/icons-material/Add';
import EditSquareIcon from '@mui/icons-material/EditSquare';

import { DataGrid } from '@mui/x-data-grid';
import { Button, Typography, IconButton, Card, CardContent, Breadcrumbs, Drawer, LinearProgress, Menu, MenuItem, Chip } from '@mui/material';
import { Link, useNavigate } from "react-router-dom";
import { Cake, CorporateFare, Star, StarBorder } from "@mui/icons-material";
import { DataGridStyle } from "../../utilities/datagridStyle";
import axiosInstance from "../../utilities/axiosInstance";
import { ConvertToDate, ConvertToDateTime } from "../../utilities/convertDate";
import { showSnackbar } from "../../redux/slices/snackbar";
import { useDispatch } from "react-redux";

const TableHeaderFormat = (props) => {
 
  return [
    { 
      field: 'id', headerName: 'ID', width: 40,
      renderCell: (params) => {
        return params.api.getRowIndexRelativeToVisibleRows(params.id) + 1 + (props.currentPage * props.pageSize);
      },  
    },
    { field: 'subject', headerName: 'Subject', width: 180 },
    { field: 'title', headerName: 'Title', width: 200 },
    { field: 'contentImage', headerName: 'Content', width: 80, renderCell: (params) => {
      
      return <img src={`${axiosInstance.defaults.baseURL}/birthday/image/${params.value}`} width={40} height={40} style={{borderRadius: "5px", margin: "5px"}} />
    } },
    {
      field: "isLatest",
      headerName: "Latest",
      width: 130,
      renderCell: ({ value, row }) => (
        <Chip
          size="small"
          icon={value ? <Star /> : <StarBorder />}
          label={value ? "LATEST" : "OLD"}
          sx={{
            fontWeight: 600,
            color: value ? "#fff" : "#9e9e9e",
            background: value
              ? "linear-gradient(135deg, #43cea2, #185a9d)"
              : "#f5f5f5",
            borderRadius: "8px",
            cursor: "pointer"
          }}
          onClick={async () => {
            if(value) return;
            props.setLatest(row._id)
          }}
        />
      ),
    },
    {
      field: "status", headerName: "Status", width: 100,
      renderCell: ({ value }) => {
        const color = value ? "success" : "warning";
        return <Chip size="small" label={value ? "Active" : "Inactive"} color={color} sx={{borderRadius: "5px"}} />;
      },
    },
    
    { field: 'createdAt', headerName: 'Created At', width: 180, renderCell: (params) => ConvertToDateTime(params.value)},
    { field: 'updatedAt', headerName: 'Updated At', width: 180, renderCell: params => ConvertToDateTime(params.value)},
  ]
}


export default function Birthday() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [birthdaysList , setBirthdaysList] = React.useState([])
  const [currentPage, setCurrentPage] = React.useState(0)
  const [pageSize, setPageSize] = React.useState(1)
  const [loading, setLoading] = React.useState(false)
  const [rowSelectionModel, setRowSelectionModel] = React.useState({ type: "include", ids: new Set() });
  const [selectedRows, setSelectedRows] = React.useState([])
  const [selectedBirthday, setSelectedBirthday] = React.useState(null)


  React.useEffect(() => {
    getBirthdaysList();

    return () => {
      setRowSelectionModel({ type: "include", ids: new Set() })
      setSelectedRows([])
    }
  }, [])

  React.useEffect(() => {
    if(selectedRows.length === 1){
      const selected = birthdaysList.find(item => item._id === selectedRows[0])
      console.log(selected)
      setSelectedBirthday(selected)
    }else {
      setSelectedBirthday(null)
    }
  }, [selectedRows])


  const getBirthdaysList = async () => {
    try {
      setLoading(true);
      const result = await axiosInstance.get(`/birthday`).then(res => res.data)
      setBirthdaysList(result.data)
      setLoading(false);
      if(result.statuscode == 200) {
        // dispatch(showSnackbar({ message: result.message, severity: 'info', duration: 2000}));
      }
    } catch (error) {
      setLoading(false);
      console.error(error)
    }
  }

  const setLatest = async (id) => {
    try {
      const result = await axiosInstance.patch(`/birthday/${id}/set-latest`).then(res => res.data)
      console.log(result)
      if(result.status === 200) {
        dispatch(showSnackbar({ message: result.message, severity: 'info', duration: 2000}));
        getBirthdaysList();
      }
    }catch (error){ }
  }


  return (
    <section className="inspection-entry-form">

        <Breadcrumbs aria-label="breadcrumb" style={{marginBottom: "1rem"}}>
          <Link to="/"> Notify </Link>
          <Typography sx={{ color: 'text.primary' }}>Birthdays</Typography>
        </Breadcrumbs>

        <Typography className="title" color="primary">
            <Cake color="primary" style={{ fontSize: "3rem", margin: "-10px 0" }} /> Birthdays
        </Typography>
        

        <div className="button-container">
            <Button variant="outlined" size="large" className="button-css" component={Link} to={"form"}>
                Add New <AddIcon style={{ margin: "-1px 0 0 2px", fontSize: 17, fontWeight: 600 }} />
            </Button>
            <IconButton disabled={selectedRows.length !== 1} onClick={() => navigate(`form?_id=${selectedBirthday?._id}`)}> 
              <EditSquareIcon color={selectedRows.length == 1 ? "info" : "disabled"} /> 
            </IconButton>
            {/* <IconButton> <DeleteIcon color="error" /> </IconButton> */}
        </div>
        
        <Card>
            <CardContent style={{ padding: "0px" }}>
                {loading && (<LinearProgress />)}
                <DataGrid sx={DataGridStyle} rows={birthdaysList} columns={TableHeaderFormat({currentPage, pageSize, setLatest})} getRowId={row => row._id}
                  pageSizeOptions={[5, 10, 15]} checkboxSelection disableRowSelectionOnClick
                  initialState={{ pagination: { paginationModel: { pageSize: 15, }, }, }} 
                  rowSelectionModel={rowSelectionModel}
                  onRowSelectionModelChange={event => {
                    // console.log(event)
                    setRowSelectionModel(event);
                    const ids = birthdaysList.map((row) => row._id);
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
