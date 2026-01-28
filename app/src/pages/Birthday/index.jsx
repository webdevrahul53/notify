import "../../styles/InspectionEntryForm.css";
import React from 'react';

import { DataGrid } from '@mui/x-data-grid';
import { Typography, Card, CardContent, Breadcrumbs, Chip } from '@mui/material';
import { Link } from "react-router-dom";
import { Cake } from "@mui/icons-material";
import { DataGridStyle } from "../../utilities/datagridStyle";
import { useDispatch } from "react-redux";
import axiosInstance from '../../utilities/axiosInstance';
import { ConvertToDate, ConvertToDateTime } from "../../utilities/convertDate";

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
    // { field: 'location', headerName: 'Location', width: 150 },
    // { field: 'employeeCode', headerName: 'Employee Code', width: 150 },
    // { field: 'anniversaryDate', headerName: 'Anniversary Date', width: 150 },
    // { field: 'status', headerName: 'Status', width: 150 },
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


export default function Accounts() {
  const dispatch = useDispatch();
  const [accountList , setAccountsList] = React.useState([])
  const [currentPage, setCurrentPage] = React.useState(0)
  const [pageSize, setPageSize] = React.useState(1)
  


  React.useEffect(() => {
    getAccountsList();
  }, [])

  const getAccountsList = async () => {
    try {
      const result = await axiosInstance.get(`/account`).then(res => res.data)
      if(result.status == 200) {
        setAccountsList(result.data)
        // dispatch(showSnackbar({ message: result.message, severity: 'info', duration: 2000}));
      }
    } catch (error) {
      console.error(error)
    }
  }


  return (
    <section className="inspection-entry-form">
       
 
        <Breadcrumbs aria-label="breadcrumb" style={{marginBottom: "1rem"}}>
          <Link underline="hover" color="inherit" href="/"> Notify </Link>
          <Typography sx={{ color: 'text.primary' }}>Birthday</Typography>
        </Breadcrumbs>

        <Typography className="title" color="primary">
            <Cake color="primary" style={{ fontSize: "3rem", margin: "-10px 0" }} /> Birthday
        </Typography>
        

        <br /><br />

        <Card>
            <CardContent style={{ padding: "0px" }}>
                <DataGrid sx={DataGridStyle} rows={accountList} columns={TableHeaderFormat({currentPage, pageSize})} getRowId={row => row._id}
                  pageSizeOptions={[6, 10, 20, 50]} checkboxSelection disableRowSelectionOnClick
                  initialState={{ pagination: { paginationModel: { pageSize: 6, }, }, }} 
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
